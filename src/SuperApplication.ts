import * as Winston from 'winston'
import {SuperBindings} from './SuperBindings'
import {createBindingFromClass} from '@loopback/core'
import {BootMixin} from '@loopback/boot'
import {RepositoryMixin} from '@loopback/repository'
import {RestApplication, RestBindings} from '@loopback/rest'
import {ServiceMixin} from '@loopback/service-proxy'
import {LoggingComponent, LoggingBindings} from '@loopback/logging'
import {ConfigurationType} from './Configuration'
import {AuthenticationComponent} from '@loopback/authentication'
import {AuthorizationBindings, AuthorizationComponent, AuthorizationDecision, AuthorizationOptions, AuthorizationTags} from '@loopback/authorization'
import {
    AuthenticationService,
    ExternalUserIdentityService,
    TwitterAuthenticationStrategy,
    TwitterAuthenticationPassportStrategyProvider,
    FaceBookAuthenticationStrategy,
    FaceBookAuthenticationPassportStrategyProvider,
    LocalAuthenticationStrategy,
    LocalAuthenticationPassportStrategyProvider,
    SessionAuthenticationStrategy,
    LookupService,
    GoogleAuthenticationPassportStrategyProvider,
    GoogleAuthenticationStrategy,
    LinkedInAuthenticationPassportStrategyProvider,
    LinkedInAuthenticationStrategy,
    JWTAuthenticationStrategy,
    JWTAuthenticationStrategyProvider,
    AuthorizationService,
    CasbinService,
    EmailNotificationStrategy,
    SMSNotificationStrategy,
    InAppNotificationStrategy,
    NotificationService,
    GeoLocationService
} from './services'
import {CoreDataSource} from './datasources'
import {UserService} from './services/user'
import { 
	GroupNotificationRepositoryService, 
	GroupRepositoryService, 
	LookupCategoryRepositoryService, 
	LookupRepositoryService, 
	RoleRepositoryService, 
	UserCommunicationPreferencesRepositoryService, 
	UserDisplaySettingsRepositoryService, 
	UserEmailAddressRepositoryService, 
	UserGroupRepositoryService, 
	UserGroupRoleRepositoryService, 
	UserLoginRepositoryService, 
	UserLogonRepositoryService, 
	UserNameRepositoryService, 
	UserNotificationRepositoryService, 
	UserPasswordRepositoryService, 
	UserPhoneNumberRepositoryService, 
	UserPhotoRepositoryService, 
	UserRepositoryService, 
	UserWebLinkRepositoryService 
} from './repositories'
//import * as appInsights from 'applicationinsights'
//const AzureApplicationInsightsLogger = require('@shellicar/winston-azure-application-insights').AzureApplicationInsightsLogger
const debug = require('debug')('decode')

/**
 * The super class for both the Api (\src\Api.ts) and Workers (\api\src\workers\*).
 * Uses the Template Method Pattern to break down and enable the customization of configuration steps
 */
export class SuperApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {	
	public Logger: Winston.Logger;
	public constructor(
        protected Configuration: ConfigurationType,		
        public projectRoot: string
    ) {
        super(Configuration)
        this.on('stateChanged', this.OnStateChanged)
    }

	/** Configure the Loopback application and it's structure and components including swagger, logging and error handling. Error handling must be done last due to the dependencies on Express by APIs that will derive from this super class. Note that Both this Rest Application and Workers share the same base class and hence functionality.
	  Derived classes can customize any of the this.Configure... steps below and use super to invoke the base shared functionality*/
	public ConfigureApplication() {		
        this.ConfigureLogging()
		this.ConfigureBootOptions()        
		this.Logger.info(`Configured Loopback boot options in ${SuperApplication.name}.${this.ConfigureBootOptions.name}()`)		
		this.Logger.info(`Configured logging in ${SuperApplication.name}.${this.ConfigureLogging.name}()`)
		
		this.Logger.info(`About to configure data sources in ${SuperApplication.name}.${this.ConfigureDataSources.name}()...`)
        this.ConfigureDataSources()
		this.Logger.info(`Configured data sources in ${SuperApplication.name}.${this.ConfigureDataSources.name}()`)
		
		this.Logger.info(`About to configure data source repos in ${SuperApplication.name}.${this.ConfigureRepositories.name}()...`)
		this.ConfigureRepositories()
		this.Logger.info(`Configured data source repos in ${SuperApplication.name}.${this.ConfigureRepositories.name}()`)

		this.Logger.info(`About to configure Loopback services in ${SuperApplication.name}.${this.ConfigureServices.name}()...`)
        this.ConfigureServices()
		this.Logger.info(`Configured Loopback services in ${SuperApplication.name}.${this.ConfigureServices.name}()`)

		this.Logger.info(`About to configure Loopback components in ${SuperApplication.name}.${this.ConfigureComponents.name}()...`)
        this.ConfigureComponents()
		this.Logger.info(`Configured Loopback components in ${SuperApplication.name}.${this.ConfigureComponents.name}()`)

		this.Logger.info(`About to configure Loopback static handlers in ${SuperApplication.name}.${this.ConfigureStaticHandlers.name}()...`)
        this.ConfigureStaticHandlers()
		this.Logger.info(`Configured Loopback static handlers in ${SuperApplication.name}.${this.ConfigureStaticHandlers.name}()`)

		this.Logger.info(`About   configure Loopback redirects in ${SuperApplication.name}.${this.ConfigureRedirects.name}()...`)
        this.ConfigureRedirects()
		this.Logger.info(`Configured Loopback redirects in ${SuperApplication.name}.${this.ConfigureRedirects.name}()`)

		this.Logger.info(`About to configure Loopback parsers in ${SuperApplication.name}.${this.ConfigureParsers.name}()...`)
        this.ConfigureParsers()
		this.Logger.info(`Configured Loopback parsers in ${SuperApplication.name}.${this.ConfigureParsers.name}()`)

		this.Logger.info(`About to configure Loopback interceptors in ${SuperApplication.name}.${this.ConfigureInterceptors.name}()...`)
        this.ConfigureInterceptors() 
		this.Logger.info(`Configured Loopback interceptors in ${SuperApplication.name}.${this.ConfigureInterceptors.name}()`)

		this.Logger.info(`About to configure security features in ${SuperApplication.name}.${this.ConfigureSecurity.name}()...`)
        this.ConfigureSecurity()
		this.Logger.info(`Configured security features in ${SuperApplication.name}.${this.ConfigureSecurity.name}()`)

		this.Logger.info(`About to configure Loopback controllers in ${SuperApplication.name}.${this.ConfigureControllers.name}()...`)
        this.ConfigureControllers()
		this.Logger.info(`Configured Loopback controllers in ${SuperApplication.name}.${this.ConfigureControllers.name}()`)

		this.Logger.info(`About to configure Loopback sequence in ${SuperApplication.name}.${this.ConfigureSequence.name}()...`)
        this.ConfigureSequence()
		this.Logger.info(`Configured Loopback sequence in ${SuperApplication.name}.${this.ConfigureSequence.name}()`)

		this.Logger.info(`About to configure Swagger components in ${SuperApplication.name}.${this.ConfigureSwagger.name}()...`)
        this.ConfigureSwagger()
		this.Logger.info(`Configured Swagger components in ${SuperApplication.name}.${this.ConfigureSwagger.name}()`)

		this.Logger.info(`About to configure Swagger notifications in ${SuperApplication.name}.${this.ConfigureNotifications.name}()...`)
        this.ConfigureNotifications()		
		this.Logger.info(`Configured Swagger notifications in ${SuperApplication.name}.${this.ConfigureNotifications.name}()`)
    }

    /**
     * An observer for the [Loopback4 Application Life cycle](https://loopback.io/doc/en/lb4/Life-cycle.html#application-states)
     */
    protected OnStateChanged(stateChanged: any) {
		if (this.Logger){
			this.Configuration.isNotProduction ? this.Logger.info(`API changing state from ${stateChanged.from} to ${stateChanged.to}`) : void null
		}else{
			this.Configuration.isNotProduction ? debug(`API changing state from ${stateChanged.from} to ${stateChanged.to}`) : void null
		}        
    }

    /**
     *  Discover and process the artifacts that make up the application. Artifacts Controllers, Repositories, Models, Services, Parsers, etc
     */
    protected ConfigureBootOptions()   {
        this.bootOptions = {
            controllers: {
                dirs: ['controllers'],
                extensions: ['.js'],
                nested: true
            },
            repositories: {
                dirs: ['repositories'],
                extensions: ['RepositoryService.js'],			
                nested: true,
				glob: 'src/repositories/[^SuperModelRepositoryService]*.js'
            }
        }		

        this.Configuration.isNotProduction ? debug(`${this.ConfigureBootOptions.name} - ${JSON.stringify(this.bootOptions)}`) : void null
    }

    /**
     * Configure [Loopback Logging](https://loopback.io/doc/en/lb4/Logging.html). Logging uses [Winston](https://github.com/winstonjs/winston).
     * In the Development Environment (``NODE_ENV=development in .env``), the Console is used as the default Strategy.
     */
    protected ConfigureLogging() {		

		//Winston transports
		const transports = []
		
		const winstonConsoleFormat = Winston.format.combine(
            Winston.format.json(),
            Winston.format.prettyPrint(),
            Winston.format.label({label: 'decode'}),
            Winston.format.timestamp({format: 'YY-MM-DD HH:MM:SS'}),
            Winston.format.printf(info => {
                const levelWithoutColor = info.level.replace(/[\u001b\u009b][[()#?]*(?:[0-9]{1,4}(?:[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
                const level = info.level.replace(levelWithoutColor, levelWithoutColor.padEnd(14, '=')) + '>'
                const color = this.Configuration.logging?.winston?.colors![levelWithoutColor]
                let colorCode = ''
                switch (color) {
                    case 'red':
                        {
                            colorCode = '\x1b[31m'
                        }
                        break
                    case 'green':
                        {
                            colorCode = '\x1b[32m'
                        }
                        break
                    case 'yellow':
                        {
                            colorCode = '\x1b[33m'
                        }
                        break
                    case 'blue':
                        {
                            colorCode = '\x1b[34m'
                        }
                        break
                    case 'magenta':
                        {
                            colorCode = '\x1b[35m'
                        }
                        break
                    case 'cyan':
                        {
                            colorCode = '\x1b[36m'
                        }
                        break
                    case 'white':
                        {
                            colorCode = '\x1b[37m'
                        }
                        break
                    case 'gray':
                        {
                            colorCode = '\x1b[38m'
                        }
                        break
                    case 'lightred':
                        {
                            colorCode = '\x1b[31m\x1b[1m'
                        }
                        break
                    case 'lightgreen':
                        {
                            colorCode = '\x1b[32m\x1b[1m'
                        }
                        break
                    case 'lightyellow':
                        {
                            colorCode = '\x1b[33m\x1b[1m'
                        }
                        break
                    case 'lightblue':
                        {
                            colorCode = '\x1b[34m\x1b[1m'
                        }
                        break
                    case 'lightmagenta':
                        {
                            colorCode = '\x1b[35m\x1b[1m'
                        }
                        break
                    case 'lightcyan':
                        {
                            colorCode = '\x1b[36m\x1b[1m'
                        }
                        break
                    case 'lightwhite':
                        {
                            colorCode = '\x1b[37m\x1b[1m'
                        }
                        break
                    case 'lightgray':
                        {
                            colorCode = '\x1b[38m\x1b[1m'
                        }
                        break
                    case 'darkred':
                        {
                            colorCode = '\x1b[31m\x1b[2m'
                        }
                        break
                    case 'darkgreen':
                        {
                            colorCode = '\x1b[32m\x1b[2m'
                        }
                        break
                    case 'darkyellow':
                        {
                            colorCode = '\x1b[33m\x1b[2m'
                        }
                        break
                    case 'darkblue':
                        {
                            colorCode = '\x1b[34m\x1b[2m'
                        }
                        break
                    case 'darkmagenta':
                        {
                            colorCode = '\x1b[35m\x1b[2m'
                        }
                        break
                    case 'darkcyan':
                        {
                            colorCode = '\x1b[36m\x1b[2m'
                        }
                        break
                    case 'darkwhite':
                        {
                            colorCode = '\x1b[37m\x1b[2m'
                        }
                        break
                    case 'darkgray':
                        {
                            colorCode = '\x1b[38m\x1b[2m'
                        }
                        break
                    default:
                        {
                            colorCode = '\x1b[33m\x1b[30m'
                        }
                        break
                }
                const output = `${colorCode}${info.label} ${info.timestamp} ${level} ${info.message}\x1b[0m`
                return output
            })
        )		
        if (this.Configuration.isNotProduction) {
            transports.push(new Winston.transports.Console({format: winstonConsoleFormat}))
        }
		
		if (this.Configuration.logging?.fluentd){
			this.configure(LoggingBindings.FLUENT_SENDER).to({	
				host: this.Configuration.logging!.fluentd!.serviceHost,
				port: this.Configuration.logging!.fluentd!.servicePort,
				timeout: this.Configuration.logging!.fluentd!.timeOut,
				reconnectInterval: this.Configuration.logging!.fluentd!.reconnectInterval
			})
		}
		
		/*
		if (this.Configuration.logging?.AzureApplicationInsights) {									
			const regex = /InstrumentationKey=([a-f0-9\-]{36})/i; 			
			const match = this.Configuration.logging!.AzureApplicationInsights?.connectionString?.match(regex);
			if (match && match[1]) {
				const instrumentationKey = match[1]								
				const applicationInsightsClient = new appInsights.TelemetryClient();
				const azureApplicationInsightsLogger = new AzureApplicationInsightsLogger({
					version: 3, 
					client: applicationInsightsClient
				})
				appInsights
					.setup(this.Configuration.logging!.AzureApplicationInsights?.connectionString)
					.setAutoCollectConsole(true, true)
					.setAutoCollectRequests(true)
					.setAutoDependencyCorrelation(false)
					.setAutoCollectPerformance(true, true)
					.setAutoCollectExceptions(true)
					.setAutoCollectDependencies(true)
					.setAutoCollectConsole(true)
					.setUseDiskRetryCaching(true)
					.setSendLiveMetrics(false)
					.setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
					.start()				
				transports.push(azureApplicationInsightsLogger)				
			} else {
				debug("Azure ApplicationInsights InstrumentationKey not found.");
			}
        }     				
		*/

        const winstonOptions = {
            levels: this.Configuration.logging?.winston?.levels,
            level: this.Configuration.logging!.winston!.level,
            defaultMeta: {solution: 'decode', project: 'API'},
            handleExceptions: false,
            transports
        }

        this.configure<Winston.LoggerOptions>(LoggingBindings.WINSTON_LOGGER).to(winstonOptions)

        this.configure(LoggingBindings.COMPONENT).to({
            enableFluent: true,
            enableHttpAccessLog: true
        })
        this.component(LoggingComponent)
        
		// Create Winston logger and Test Logger
		this.Logger = Winston.createLogger({
			levels: this.Configuration.logging?.winston?.levels,
            level: this.Configuration.logging!.winston!.level,
			format: winstonConsoleFormat,
			transports: transports
		});

		// Example usage of Winston logger
		this.Logger.info(`${this.Configuration.name} started successfully at ${new Date().toUTCString()} on ${this.Configuration.rest?.host}:${this.Configuration.rest?.port}`);
		this.Logger.info(`ExpressJS mounted on ${this.Configuration?.expressJS?.mountPath}${this.Configuration?.rest?.basePath}`);
    }

    /**
     * Configure Datasources
     */
    protected ConfigureDataSources() {
        const coreDataSource = this.Configuration.dataSources?.CoreDataSource
        this.configure(CoreDataSource.BINDING_KEY.key).to(coreDataSource)
        this.dataSource(CoreDataSource, CoreDataSource.BINDING_KEY.key)
    }

    /**
     *  Configure [Repositories](https://loopback.io/doc/en/lb4/Repository.html)
     */
    protected ConfigureRepositories() {     
		this.repository(LookupCategoryRepositoryService, LookupCategoryRepositoryService.BINDING_KEY.key )
		this.repository(LookupRepositoryService, LookupRepositoryService.BINDING_KEY.key )
		this.repository(RoleRepositoryService, LookupRepositoryService.BINDING_KEY.key )
		this.repository(GroupRepositoryService, GroupRepositoryService.BINDING_KEY.key )
		this.repository(GroupNotificationRepositoryService, GroupNotificationRepositoryService.BINDING_KEY.key )
		this.repository(UserCommunicationPreferencesRepositoryService, UserCommunicationPreferencesRepositoryService.BINDING_KEY.key )
		this.repository(UserDisplaySettingsRepositoryService, UserDisplaySettingsRepositoryService.BINDING_KEY.key )
		this.repository(UserEmailAddressRepositoryService, UserEmailAddressRepositoryService.BINDING_KEY.key )
		this.repository(UserGroupRepositoryService, UserGroupRepositoryService.BINDING_KEY.key )
		this.repository(UserGroupRoleRepositoryService, UserGroupRoleRepositoryService.BINDING_KEY.key )
		this.repository(UserLoginRepositoryService, UserLoginRepositoryService.BINDING_KEY.key )
		this.repository(UserLogonRepositoryService, UserLogonRepositoryService.BINDING_KEY.key )
		this.repository(UserNameRepositoryService, UserNameRepositoryService.BINDING_KEY.key )
		this.repository(UserNotificationRepositoryService, UserNotificationRepositoryService.BINDING_KEY.key )
		this.repository(UserPasswordRepositoryService, UserPasswordRepositoryService.BINDING_KEY.key )
		this.repository(UserPhoneNumberRepositoryService, UserPhoneNumberRepositoryService.BINDING_KEY.key )
		this.repository(UserPhotoRepositoryService, UserPhotoRepositoryService.BINDING_KEY.key )
		this.repository(UserRepositoryService, UserRepositoryService.BINDING_KEY.key )
		this.repository(UserWebLinkRepositoryService, UserWebLinkRepositoryService.BINDING_KEY.key )
    }

	
    /**
     *  Configure [Bindings](https://loopback.io/doc/en/lb4/Binding.html)
     */
    protected ConfigureServices() {
        this.bind(SuperBindings.ConfigurationTypeBindingKey.key).to(this.Configuration)
        this.service(AuthenticationService, SuperBindings.AuthenticationServiceBindingKey.key)
        this.service(ExternalUserIdentityService, ExternalUserIdentityService.BINDING_KEY.key)
        this.service(LookupService, SuperBindings.LookupServiceBindingKey.key)
        this.service(UserService, SuperBindings.UserServiceBindingKey.key)
        this.service(AuthorizationService, AuthorizationService.BINDING_KEY.key)
        this.service(EmailNotificationStrategy, EmailNotificationStrategy.BINDING_KEY.key)
        this.service(SMSNotificationStrategy, SMSNotificationStrategy.BINDING_KEY.key)
        this.service(InAppNotificationStrategy, InAppNotificationStrategy.BINDING_KEY.key)
        this.service(NotificationService, NotificationService.BINDING_KEY.key)
		this.service(GeoLocationService, GeoLocationService.BINDING_KEY.key)
    }

    /**
     * Configure [Loopback Components](https://loopback.io/doc/en/lb4/Component.html).
     */
    protected ConfigureComponents() {}

    /**
     * Use to specify the locations where static files are served
     * See [Loopback static files](https://loopback.io/doc/en/lb4/Serving-static-files.html)
     */
    protected ConfigureStaticHandlers() {}

    /**
     * Configure redirect from '' to '/'
     */
    protected ConfigureRedirects() {}

    /**
     * Configure [Interceptors](https://loopback.io/doc/en/lb4/Interceptor.html)
     */
    protected ConfigureInterceptors() {}

    /**
	 * Configure [HTTP Parsers](https://loopback.io/doc/en/lb4/Parsing-requests-guide.html) 
	*/
    protected ConfigureParsers() {}

    /**
     * Configure security components, controllers, repositories and services
     * Derived classes can add logic for Forms, JWT, OpenId etc
     */
    protected ConfigureSecurity() {
        //authentication
        this.component(AuthenticationComponent)
        this.add(createBindingFromClass(LocalAuthenticationPassportStrategyProvider, {key: LocalAuthenticationPassportStrategyProvider.BINDING_KEY}))
        this.add(createBindingFromClass(LocalAuthenticationStrategy))
        this.add(createBindingFromClass(SessionAuthenticationStrategy))
        this.bind(LocalAuthenticationPassportStrategyProvider.BINDING_KEY.key).toProvider(LocalAuthenticationPassportStrategyProvider)
        if (this.Configuration.authentication?.jwtOptions?.secretOrKey != '') {
            this.add(createBindingFromClass(JWTAuthenticationStrategyProvider, {key: JWTAuthenticationStrategyProvider.BINDING_KEY}))
            this.add(createBindingFromClass(JWTAuthenticationStrategy))
            this.bind(JWTAuthenticationStrategyProvider.BINDING_KEY.key).toProvider(JWTAuthenticationStrategyProvider)
        }
        if (this.Configuration.authentication?.googleOptions?.clientID != '') {
            this.add(createBindingFromClass(GoogleAuthenticationPassportStrategyProvider, {key: GoogleAuthenticationPassportStrategyProvider.BINDING_KEY}))
            this.add(createBindingFromClass(GoogleAuthenticationStrategy))
            this.bind(GoogleAuthenticationPassportStrategyProvider.BINDING_KEY.key).toProvider(GoogleAuthenticationPassportStrategyProvider)
        }
        if (this.Configuration.authentication?.facebookOptions?.clientID != '') {
            this.add(createBindingFromClass(FaceBookAuthenticationPassportStrategyProvider, {key: FaceBookAuthenticationPassportStrategyProvider.BINDING_KEY}))
            this.add(createBindingFromClass(FaceBookAuthenticationStrategy))
            this.bind(FaceBookAuthenticationPassportStrategyProvider.BINDING_KEY.key).toProvider(FaceBookAuthenticationPassportStrategyProvider)
        }
        if (this.Configuration.authentication?.twitterOptions?.clientID != '') {
            this.add(createBindingFromClass(TwitterAuthenticationPassportStrategyProvider, {key: TwitterAuthenticationPassportStrategyProvider.BINDING_KEY}))
            this.add(createBindingFromClass(TwitterAuthenticationStrategy))
            this.bind(TwitterAuthenticationPassportStrategyProvider.BINDING_KEY.key).toProvider(TwitterAuthenticationPassportStrategyProvider)
        }
        if (this.Configuration.authentication?.linkedInOptions?.clientID != '') {
            this.add(createBindingFromClass(LinkedInAuthenticationPassportStrategyProvider, {key: LinkedInAuthenticationPassportStrategyProvider.BINDING_KEY}))
            this.add(createBindingFromClass(LinkedInAuthenticationStrategy))
            this.bind(LinkedInAuthenticationPassportStrategyProvider.BINDING_KEY.key).toProvider(LinkedInAuthenticationPassportStrategyProvider)
        }

        //authorization
        const options: AuthorizationOptions = {
            precedence: AuthorizationDecision.DENY,
            defaultDecision: AuthorizationDecision.DENY
        }
        this.configure(AuthorizationBindings.COMPONENT).to(options)
        this.component(AuthorizationComponent)
        this.bind('casbin.enforcer.factory').to(CasbinService.GetCasbinEnforcerByRole)
        this.bind(CasbinService.BINDING_KEY.key).toProvider(CasbinService).tag(AuthorizationTags.AUTHORIZER)
    }

    /**Configure the controllers exposed directly by the Application.
     * Please note that components will/may add further controllers  */
    protected ConfigureControllers() {}

    /**
     * Configure [Sequence](https://loopback.io/doc/en/lb4/Sequence.html)
     */
    protected ConfigureSequence() {}

    /**
     * Configure Swagger
     */
    protected ConfigureSwagger() {}

    /**
     * Configure email, SMS, etc notifications
     * */
    protected ConfigureNotifications() {
        const emailConfig: any = {
            host: this.Configuration.notifications.email.provider.nodeMailerOptions.host,
            port: this.Configuration.notifications.email.provider.nodeMailerOptions.port,
            secure:  this.Configuration.notifications.email.provider.nodeMailerOptions.secure
        }

        if (this.Configuration.notifications.email.provider.nodeMailerOptions.username) {
            emailConfig.auth = {}
			emailConfig.service =  this.Configuration.notifications.email.provider.nodeMailerOptions.service
            emailConfig.auth.user = this.Configuration.notifications.email.provider.nodeMailerOptions.username
            emailConfig.auth.pass = this.Configuration.notifications.email.provider.nodeMailerOptions.password
			if (!emailConfig.service && this.Configuration.notifications.email.provider.nodeMailerOptions.tlsCipher){
				emailConfig.tls.ciphers = this.Configuration.notifications.email.provider.nodeMailerOptions.tlsCipher
			}
        }

        if (this.Configuration.notifications.email.provider.nodeMailerOptions.secure) {
            emailConfig.secure = true
            emailConfig.tls = {}
            emailConfig.tls.ciphers = this.Configuration.notifications.email.provider.nodeMailerOptions.tlsCipher
        }
        this.configure(EmailNotificationStrategy.BINDING_KEY.key).to(emailConfig)

        const smsConfig: any = {
            apiKey: this.Configuration.notifications.sms.provider.ClickSendOptions.api_key,
            apiUsername: this.Configuration.notifications.sms.provider.ClickSendOptions.api_username,
            apiUrl: this.Configuration.notifications.sms.provider.ClickSendOptions.api_url
        }
        this.configure(SMSNotificationStrategy.BINDING_KEY.key).to(smsConfig)		
    }

	/**
     * Configure [Error Handling](https://loopback.io/doc/en/lb4/Using-strong-error-handler.html)
     */
    public ConfigureErrorHandling() {		
        const errorSafeFields = ['name', 'errorCode', 'statusCode', 'message']
        if (this.Configuration.isNotProduction) {
            errorSafeFields.push('stack')
            errorSafeFields.push('details')
        }
        this.bind(RestBindings.ERROR_WRITER_OPTIONS).to({
            debug: this.Configuration.isNotProduction,
            safeFields: errorSafeFields,
            defaultType: 'json' /*supports JSON, HTML and XML responses*/
        })
        this.on('uncaughtException', (err: any) => {
            this.Configuration.isNotProduction ? debug(`An uncaught Exception was detected, about to shut down...`) : void null
            this.Configuration.isNotProduction && err ? debug(err) : void null
            //todo: store errors (with client-device, stack trace, context, etc), in a suitably search able datasource,
            //and use html response if client accepts htmll, with email link(or http link) pre - filled with recipient, subject and body
            //trigger email/sms notifications, if and when applicable etc
            process.exit(666)
        })
    }

}
