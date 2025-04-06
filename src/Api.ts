import express from 'express'
import path from 'path'
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer'
import { OpenApiSpec, RestBindings } from '@loopback/rest'
import { SuperApplication } from './SuperApplication'
import { ConfigurationType } from './Configuration'
import { SuperBindings } from './SuperBindings'
import { SchemaUtils } from './utils'
import { RequestValidatorInterceptor, SwaggerBugInterceptor } from './interceptors'
import { JSONParser, MultiPartParser, URLEncodedParser, XMLParser } from './parsers'
import { SuperSendSequenceStep, SuperSendSequenceStepProvider, SuperSequence } from './sequence'
import { ServiceErrorCodesEnum } from '@david.ezechukwu/core'
//import appInsights from 'applicationinsights'		
const debug = require('debug')('decode')

/**
 * The class for API
 */
export class Api extends SuperApplication {	
	/**Both this Rest Application and Workers share the same base class and hence functionality.
	 * An Api would be piggybacked onto an express application however no ExpressJs piggybacking is required for Workers, as in SuperWorker.ts. The expressApplication is created first and passed to this class to this object through as parameter in it's construction. expressApplication is optional as it is also used by the initial database seeding Application,FirstRun in FirstRun.js  */
	protected ExpressApplication? : express.Application

	public constructor(
		apiConfig: ConfigurationType, 
		expressApplication? : express.Application
	) {
		super(apiConfig, __dirname)
		this.ExpressApplication = expressApplication;
		this.ConfigureApplication()
	}

	protected ConfigureServices() {
		super.ConfigureServices()
		super.bind(SuperBindings.PACKAGE_JSON_BINDING.key).to(require('../package.json'))
	}

	/**
	 * Use to specify the locations where static files are served
	 * See [Loopback static files](https://loopback.io/doc/en/lb4/Serving-static-files.html)
	 */
	protected ConfigureStaticHandlers() {
		super.ConfigureStaticHandlers()
		for (const staticPath of this.Configuration.rest?.staticPaths!) {
			this.static('/', staticPath)
			this.Configuration.isNotProduction ? debug(`${this.ConfigureStaticHandlers.name} - ${staticPath}`) : void null
		}
	}

	/**
	 * Configure redirect from '' to '/'
	 */
	protected ConfigureRedirects() {
		super.ConfigureRedirects()
		const config = this.Configuration
		if (config.rest?.basePath! != '') {
			throw `This feature is incompatible with this code, as it causes a faulty behavior`
		}

		this.redirect('', `${config.expressJS?.mountPath!}${config.rest?.basePath!}${config.loopBackExplorerPath}`)
		this.redirect('/', `${config.expressJS?.mountPath!}${config.rest?.basePath!}${config.loopBackExplorerPath}`)
		this.Configuration.isNotProduction ? debug(`${this.ConfigureRedirects.name} - ${this.Configuration.loopBackExplorerPath}`) : void null
	}

	/**
	 * Configure [Interceptors](https://loopback.io/doc/en/lb4/Interceptor.html)
	*/
	protected ConfigureInterceptors() {
		super.ConfigureInterceptors()
		super.interceptor(RequestValidatorInterceptor, { global: true, group: 'validators' })
		super.interceptor(SwaggerBugInterceptor, { global: true, group: 'swagger' })
	}

	/**
	 * Configure [HTTP Parsers](https://loopback.io/doc/en/lb4/Parsing-requests-guide.html) 
	*/
    protected ConfigureParsers() {
		super.ConfigureParsers()
        super.bodyParser(JSONParser)
        super.bodyParser(MultiPartParser)
        super.bodyParser(XMLParser)
		super.bodyParser(URLEncodedParser)
    }

	/**
    * Configure [Sequence](https://loopback.io/doc/en/lb4/Sequence.html)
    */
    protected ConfigureSequence() {
		super.ConfigureSequence()
        this.bind('sequence.SuperSendSequenceStep').toClass(SuperSendSequenceStep)
        this.bind(RestBindings.SequenceActions.SEND).toProvider(SuperSendSequenceStepProvider)
        this.sequence(SuperSequence)
        this.Configuration.isNotProduction ? debug(`${this.ConfigureSequence.name}`) : void null
    }

	/**
	* Configure Swagger
	*/
	protected ConfigureSwagger() {		
		super.ConfigureSwagger()
		const config = this.Configuration
		const url = `${config.rest!.protocol}://${config.rest!.host}:${config.rest!.port}${config.expressJS!.mountPath}${config.rest!.basePath}`
		const apiName = url! + config.loopBackExplorerPath

		this.configure(RestExplorerBindings.COMPONENT).to({
			path: this.Configuration.loopBackExplorerPath,
			indexTitle: 'API Explorer',
			indexTemplatePath: path.resolve(this.projectRoot, 'swagger.html.ejs')
		})
		this.component(RestExplorerComponent)

		const hostUrl = ``
		const spec: OpenApiSpec = {
			openapi: '3.0.0',
			info: {
				title: apiName,
				version: '1.0.1'
			},
			externalDocs: {
				url: `${hostUrl}${this.Configuration.expressJS!.mountPath}${this.Configuration.rest!.basePath}/docs/modules/controllers.html`,				
				description: `Technical Reference`
			},
			paths: {},
			//see https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml  for HTTP scheme
			components: {
				//https://swagger.io/docs/specification/authentication/
				securitySchemes: {
					// eslint-disable-next-line
					auth_header: {
						type: 'apiKey',
						name: 'Authentication Header',
						in: 'header'
					},
					// https://swagger.io/docs/specification/authentication/cookie-authentication/
					// eslint-disable-next-line
					auth_cookie: {
						type: 'apiKey',
						name: this.Configuration.expressJS?.expressionSession.cookieName,
						in: 'cookie'
					},
					// eslint-disable-next-line
					basic_auth: {
						type: 'http',
						scheme: 'Basic'
					},
					// eslint-disable-next-line
					bearer_auth: {
						type: 'http',
						scheme: 'Bearer'
					}
					// Digest requires https://github.com/jaredhanson/passport-http
					//digest_auth: {
					//    type: 'http',
					//    name: 'Digest Authentication',
					//    scheme: 'Digest',
					//    in: 'header'
					//}
				}
			},
			tags: [
				{
					name: SchemaUtils.HealthCheckTag,
					description: `${SchemaUtils.HealthCheckTag} Endpoints`,
					externalDocs: {
						url: `../docs/modules/controllers_healthstatus.html`,
						description: `${SchemaUtils.HealthCheckTag} Wiki`
					}
				},
				{
					name: SchemaUtils.LookupTag,
					description: `${SchemaUtils.LookupTag} Endpoints`,
					externalDocs: {
						url: `../docs/modules/controllers_lookup.html`,
						description: `${SchemaUtils.LookupTag} Wiki`
					}
				},
				{
					name: SchemaUtils.SecurityTag,
					description: `${SchemaUtils.SecurityTag} Endpoints`,
					externalDocs: {
						url: `../docs/modules/controllers_security.html`,
						description: `${SchemaUtils.SecurityTag} Wiki`
					}
				},
				{
					name: SchemaUtils.UserTag,
					description: `${SchemaUtils.UserTag} Endpoints`,
					externalDocs: {
						url: `../docs/modules/controllers_user.html`,
						description: `${SchemaUtils.UserTag} Wiki`
					}
				}
			]
		}
		this.api(spec)
	}

	/**
     * Configure [Error Handling](https://loopback.io/doc/en/lb4/Using-strong-error-handler.html)
     */
    public ConfigureErrorHandling() {

		//configure loopback error handling 
		super.ConfigureErrorHandling()
		

		//configure loopback 404 error handling by catching 404s and forwarding to the registered express error handler middleware
		if ( this.ExpressApplication){
			this.ExpressApplication.use((req: any, res: any, next: any) => {
				const err: any = new Error('Not Found')
				err['status'] = 404
				next(err)
			})

			//handle express errors, in development mode, error handler will print stack trace
			if (this.Configuration.isNotProduction) {
				this.ExpressApplication.use((err: any, req: any, res: any, next: any) => {
					const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
					const fullError = `${req.method} ${fullUrl} failed with this error(${err.message}) and HTTP status code(${err.status})`;				
					this.Logger.error(fullError)
					this.Logger.error(`Request Headers: ${JSON.stringify(req.headers)}`)
					this.Logger.error(`Request Referrer: ${req.get('Referrer')}`)
					res.status(err['status'] || ServiceErrorCodesEnum.InternalServerError)
					res.render('error', {message: fullError, error: err})
				})
			} else {
				//handle errors, in production mode, error handler will exclude stack traces
				this.ExpressApplication.use((err: any, req: any, res: any, next: any) => {
					const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
					const fullError = `${req.method} ${fullUrl} failed with this error(${err.message}) and HTTP status code(${err.status})`;
					this.Logger.error(fullError)
					res.status(err.status || ServiceErrorCodesEnum.InternalServerError)
					res.render('error', {message: err.message,error: {}})
				})
			}        
		}
    }
}
