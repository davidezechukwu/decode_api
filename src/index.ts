require('dotenv').config()
const appInsights = require('applicationinsights')
import { LoggingBindings, WinstonLogger } from '@loopback/logging'
import {StringUtility, GeneralUtility} from '@david.ezechukwu/core'
export {SuperBindings} from './SuperBindings'
import {GetConfigurationFromEnv, ConfigurationType} from './Configuration'
import {ExpressServer} from './ExpressServer'
import {SuperController} from './controllers'

const fs = require('fs')
let theExpressServer: ExpressServer  | null = null

// eslint-disable-next-line
export async function main(): Promise<ExpressServer> {
    return new Promise<ExpressServer>(async (resolve, reject) => {
        try {
            const apiConfig: ConfigurationType = GetConfigurationFromEnv()
			if ( apiConfig.isNotProduction == false){
				appInsights
					.setup(apiConfig.logging?.AzureApplicationInsights?.connectionString)
					.setAutoDependencyCorrelation(true)
					.setAutoCollectRequests(true)
					.setAutoCollectPerformance(true, true)
					.setAutoCollectExceptions(true)
					.setAutoCollectDependencies(true)
					.setAutoCollectConsole(true, true)
					.setSendLiveMetrics(false)
					.setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
					.setInternalLogging(true, true) /* Enable both debug and warning logging*/
					.start()
				apiConfig.logging!.AzureApplicationInsights!.appInsightsInstance = appInsights
			}

            //read and treat as buffers, from here
            apiConfig!.rest!.sslPrivatekey = fs.readFileSync(apiConfig.rest?.sslPrivatekey)
            apiConfig!.rest!.sslCertificate = fs.readFileSync(apiConfig.rest?.sslCertificate)
            apiConfig!.rest!.sslCACertificate = fs.readFileSync(apiConfig.rest?.sslCACertificate)

            theExpressServer = new ExpressServer(apiConfig)
            await theExpressServer.Boot()
            await theExpressServer.Init()
            await theExpressServer.Start()
            resolve(theExpressServer)
        } catch (err) {      
            reject(err)
        }
    })
}

if (require.main === module) {
    main()
        .then(expressServer => {
            const config = expressServer.Configuration
            const url = `${config.rest!.protocol}://${config.rest!.host}:${config.rest!.port}${config.expressJS!.mountPath}${config.rest!.basePath}`
			if (theExpressServer?.Api.Logger){
				theExpressServer?.Api.Logger.info(StringUtility.StringFormat(`{{0}} is running at {{1}}`, 'API', url!))
				theExpressServer?.Api.Logger.info(StringUtility.StringFormat(`Swagger Documentation available at {{0}}`, url! + expressServer.Configuration.loopBackExplorerPath))
				theExpressServer?.Api.Logger.info(StringUtility.StringFormat(`Run {{0}} to get a Health Check`, url! + '/' + SuperController.HealthURLPath + '/healthstatus'))
			}
			else{
				GeneralUtility.Debug(StringUtility.StringFormat(`{{0}} is running at {{1}}`, 'API', url!))
				GeneralUtility.Debug(StringUtility.StringFormat(`Swagger Documentation available at {{0}}`, url! + expressServer.Configuration.loopBackExplorerPath))
				GeneralUtility.Debug(StringUtility.StringFormat(`Run {{0}} to get a Health Check`, url! + '/' + SuperController.HealthURLPath + '/healthstatus'))
			}
        })
        .catch(err => {            
			if (theExpressServer?.Api.Logger){
				theExpressServer?.Api.Logger.debug(err)
			}else{
				GeneralUtility.Debug(err)
			}
            //todo: store errors (with client-device, stack trace, context, etc), in a suitably search-able datasource,
            //and use HTML response if client accepts HTML, with email link(or http link) filled with recipient, subject and body
            //trigger email/sms notifications, if and when applicable etc
			if ( theExpressServer?.Api){
				(async() => {
					//const logger: WinstonLogger = await theExpressServer?.Api.get(LoggingBindings.WINSTON_LOGGER )
					if (theExpressServer?.Api.Logger){
						theExpressServer?.Api.Logger.error(err.message ? `The entry function failed with this error ${err.message}` : `delete later or comment out - The entry function failed with this error ${err}`)
					}
				})()				
			}
            process.exit(666)
        })
}


//bypass TsDoc errors 
//##[error][warning] ConfigurationType, defined in ./src/Configuration.ts, is referenced by controllers.ExternalLoginController.Configuration but not included in the documentation.
//##[error][warning] ExpressServer, defined in ./src/ExpressServer.ts, is referenced by index.main.main but not included in the documentation.
//##[error][warning] Device, defined in ./src/Configuration.ts, is referenced by controllers.ExternalLoginController.DetermineDevice.DetermineDevice but not included in the documentation.
//##[error][warning] Locale, defined in ./src/Configuration.ts, is referenced by controllers.ExternalLoginController.DetermineLocale.DetermineLocale but not included in the documentation.
//##[error][warning] UserNameRequest, defined in ./src/dtobjects/requests/UserNameRequest.ts, is referenced by controllers.UserNameController.CreateUserName.CreateUserName.userNameRequest but not included in the documentation

export * from './_infrastructure/fixtures/localisation/Lookups'
export * from './Configuration'
export * from './ExpressServer'
export * from './dtobjects/requests/UserNameRequest'
export * from './Api'
