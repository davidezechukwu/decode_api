import {Configuration, ConfigurationType} from '../Configuration'
import {SuperWorker} from './SuperWorker'
import {SMSNotificationStrategy} from '../services/notification/strategies/SMSNotificationStrategy'
import {NOTIFICATION_STATUS} from '../services'
const debug = require('debug')('decode:SMSNotificationWorker')

/**
 * The SMS notification worker 
 */
export class SMSNotificationWorker extends SuperWorker {
    public constructor(superWorkerConfig: ConfigurationType, projectRoot: string) {
        super(superWorkerConfig, projectRoot)
        this.SuperWorkerConfig.isNotProduction ? debug(`${this.ConfigureBootOptions.name} - ${JSON.stringify(this.bootOptions)}`) : void null
    }


    public async OnStart(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
				await super.OnStart()
                this.Logger.info(`Starting the SMSNotificationWorker...`)                
                this.Logger.verbose(`Attempting to get the service SMSNotificationStrategy`)
                const smsNotificationStrategy: SMSNotificationStrategy = await this.get(SMSNotificationStrategy.BINDING_KEY.key)
                this.Logger.verbose(`${smsNotificationStrategy ? 'SMSNotificationStrategy is available' : 'SMSNotificationStrategy is not available'}`)
                this.Logger.info(`Searching for ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]}  SMS notifications...`)
                const userNotifications = await smsNotificationStrategy.ProcessUserNotificationsQueue(50)
                this.Logger.info(`Found ${userNotifications.length} ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]}  SMS notifications...`)
                if (!userNotifications || userNotifications?.length == 0) {
                    this.Logger.info(`Completing as there are no ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]}  SMS notifications to process...`)
                    resolve()
                    return
                }
                this.Logger.info(`Attempting to process ${userNotifications.length} ${NOTIFICATION_STATUS[NOTIFICATION_STATUS.PENDING]}  SMS notifications...`)
                const sendPromises: Promise<NOTIFICATION_STATUS>[] = []
                userNotifications.forEach(userNotification => sendPromises.push(smsNotificationStrategy.NotifyUser(userNotification)))
                Promise.all(sendPromises)
                    .then(_ => {
                        this.Logger.info(`Completed the processing a batch of ${userNotifications.length}  SMS notifications...`)
                        resolve()
                    })
                    .catch(e => {
                        this.Logger.error(e)
                        throw e
                    })
            } catch (e) {
                this.Logger.error(`SMSNotificationWorker OnStart failed with this error:-`)
                this.Logger.error(e)
                reject(e)
            }
        })
    }

    public async OnStop() {
        this.Logger.info(`Stopping the SMSNotificationWorker...`)
    }
}

async function Main() {
    try {
        const worker: SMSNotificationWorker = new SMSNotificationWorker(Configuration, __dirname)
        await worker.boot()
        await worker.init()
        await worker.start()
        await worker.stop()
    } catch (e) {
        debug(`SMSNotificationWorker failed with this error:-`)
        debug(e)
    } finally {
        debug(`Existing SMSNotificationWorker...`)
    }
}

Main()
