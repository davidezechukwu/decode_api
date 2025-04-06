import {Configuration, ConfigurationType} from '../Configuration'
import {SuperWorker} from './SuperWorker'
import {EmailNotificationStrategy} from '../services/notification/strategies/EmailNotificationStrategy'
import {NOTIFICATION_STATUS} from '../services'
const debug = require('debug')('decode:EmailNotificationWorker')

/**
 * The Email notification worker
 */
export class EmailNotificationWorker extends SuperWorker {
    public constructor(superWorkerConfig: ConfigurationType, projectRoot: string) {
        super(superWorkerConfig, projectRoot)
        this.SuperWorkerConfig.isNotProduction ? debug(`${this.ConfigureBootOptions.name} - ${JSON.stringify(this.bootOptions)}`) : void null
    }

    public async OnStart(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
				await super.OnStart()
                this.Logger.info(`Starting the EmailNotificationWorker...`)
                this.Logger.verbose(JSON.stringify(this.SuperWorkerConfig))
                this.Logger.verbose(`Attempting to get the service EmailNotificationStrategy`)				
                const emailNotificationStrategy: EmailNotificationStrategy = await this.get(EmailNotificationStrategy.BINDING_KEY.key)
                this.Logger.verbose(`${emailNotificationStrategy ? 'emailNotificationStrategy is available' : 'emailNotificationStrategy is not available'}`)
                this.Logger.info(`Searching for ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]} email notifications...`)
                const userNotifications = await emailNotificationStrategy.ProcessUserNotificationsQueue(50)
                this.Logger.info(`Found ${userNotifications.length} ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]} email notifications...`)
                if (!userNotifications || userNotifications?.length == 0) {
                    this.Logger.info(`Completing as there are no ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]} email notifications to process...`)
                    resolve()
                    return
                }
                this.Logger.info(`Attempting to process ${userNotifications.length} ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]} email notifications...`)
                const sendPromises: Promise<NOTIFICATION_STATUS>[] = []
                userNotifications.forEach(userNotification => sendPromises.push(emailNotificationStrategy.NotifyUser(userNotification)))
                Promise.all(sendPromises)
                    .then(_ => {
                        this.Logger.info(`Completed the processing a batch of ${userNotifications.length} email notifications...`)
                        resolve()
                    })
                    .catch(e => {
                        this.Logger.error(e)
                        throw e
                    })
            } catch (e) {
                this.Logger.error(`EmailNotificationWorker OnStart failed with this error:-`)
                this.Logger.error(e)
                reject(e)
            }
        })
    }

    public async OnStop() {
        this.Logger.info(`Stopping the EmailNotificationWorker...`)
    }
}

async function Main() {
    try {
        const worker: EmailNotificationWorker = new EmailNotificationWorker(Configuration, __dirname)
        await worker.boot()
        await worker.init()
        await worker.start()
        await worker.stop()
    } catch (e) {
        debug(`EmailNotificationWorker failed with this error:-`)
        debug(e)
    } finally {
        debug(`Existing EmailNotificationWorker...`)
    }
}

Main()
