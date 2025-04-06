import { Request, RequestContext, Send, InvokeMiddlewareOptions, SequenceActions, FindRoute, InvokeMethod, InvokeMiddleware, ParseParams, Reject, SequenceHandler, RestBindings, HttpErrors } from '@loopback/rest'
import { AuthenticateFn, AuthenticationBindings, AUTHENTICATION_STRATEGY_NOT_FOUND, USER_PROFILE_NOT_FOUND } from '@loopback/authentication'
import { config, inject } from '@loopback/core'
import { SuperBindings } from '../SuperBindings'
import { ConfigurationType, Configuration } from '../Configuration'
import { LoggingBindings, WinstonLogger } from '@loopback/logging'


export class SuperSequence implements SequenceHandler {
	constructor(
		@inject(SequenceActions.INVOKE_MIDDLEWARE) protected InvokeInterceptors: InvokeMiddleware,
		@config() protected Options: InvokeMiddlewareOptions,
		@inject(SequenceActions.FIND_ROUTE) protected FindRoute: FindRoute,
		@inject(SequenceActions.PARSE_PARAMS) protected ParseParams: ParseParams,
		@inject(SequenceActions.INVOKE_METHOD) protected Invoke: InvokeMethod,
		@inject(SequenceActions.SEND) protected Send: Send,
		@inject(SequenceActions.REJECT) protected Reject: Reject,
		@inject(AuthenticationBindings.AUTH_ACTION) protected AuthenticateRequest: AuthenticateFn,
		@inject(SuperBindings.ConfigurationTypeBindingKey.key) protected Configuration: ConfigurationType,
		@inject(LoggingBindings.WINSTON_LOGGER) protected Logger: WinstonLogger,
		@inject(RestBindings.Http.REQUEST) protected Request: Request
	) { }

	// eslint-disable-next-line
	async handle(context: RequestContext) {
		const { request, response } = context
		try {
			const finished = await this.InvokeInterceptors(context)
			if (finished) return //true for OPTIONS

			let canDeliver = false
			request.accepts().forEach(mime => {
				if (
					/*ALL*/
					mime.toLocaleLowerCase().indexOf('*/*') >= 0 ||
					/*JSON*/
					mime.toLocaleLowerCase().indexOf('application/json') >= 0 ||
					mime.toLocaleLowerCase().indexOf('text/javascript') >= 0 ||
					mime.toLocaleLowerCase().indexOf('application/json') >= 0 ||
					/*XML*/
					mime.toLocaleLowerCase().indexOf('text/xml') >= 0 ||
					mime.toLocaleLowerCase().indexOf('application/xml') >= 0 ||
					/*TEXT*/
					mime.toLocaleLowerCase().indexOf('text/plain') >= 0 ||
					/*HTML*/
					/*TODO: Check for XSLT stylesheeet or have generic one*/
					mime.toLocaleLowerCase().indexOf('text/html') >= 0 ||
					mime.toLocaleLowerCase().indexOf('application/xhtml') >= 0
					/*
					 These are ignored:-
						application/x-web-app-manifest+json - not impllemented yet on this api
						application/manifest+json - not impllemented yet on this api
						application/geo+jso - not currently used by anyone
						application/hjson ?
						application/ld+json ?
						application/jsonml+json?
					*/
				) {
					canDeliver = true
				}
			})
			if (!canDeliver) {
				response.statusCode = 406 //406 Not Acceptable
				const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
				const fullError = `${request.method} ${fullUrl} failed with this error(Not Acceptable) and HTTP status code(406)`;				
				this.Logger.debug(fullError)				
				response.end()
				return
			}

			const route = this.FindRoute(request)

			// usually authentication is done before proceeding to parse params but in our case we need the path params to know the provider name
			const args = await this.ParseParams(request, route)

			// if provider name is available in the request path params, set it in the query
			if (route.pathParams?.provider) {
				request.query['oauth2-provider-name'] = route.pathParams.provider
			}

			//call authentication action
			await this.AuthenticateRequest(request)

			//const controller = await context.get(CoreBindings.CONTROLLER_CURRENT)
			//const controllerClass = await context.get(CoreBindings.CONTROLLER_CLASS)
			//const methodNam = await context.get(CoreBindings.CONTROLLER_METHOD_NAME)
			//const methodMeta = await context.get(CoreBindings.CONTROLLER_METHOD_META)

			const result = await this.Invoke(route, args)
			await this.Send(response, result)
		} catch (err) {
			if (err?.code === AUTHENTICATION_STRATEGY_NOT_FOUND || err?.code === USER_PROFILE_NOT_FOUND || err?.name == 'UnauthorizedError' || err?.massage == 'Invalid session') {
				response.status(401).send({statusCode: 401, status: 'UnauthorizedError'}).end()				
				return
			}
			const theError = err.message ?? err
			if (theError && typeof theError == "string" && theError.indexOf('[$]') > 0) {
				const components = theError.split('[$]')
				const statusCode = +components[0]
				let whatToFix : undefined | string = undefined
				let status = components[1]							
				if (!Configuration.isNotProduction) {
					status = status.replace(/<stripped-out-on-prod>(.*?)<\/stripped-out-on-prod>/, '')
				}else
				{
					whatToFix = status?.match(/<stripped-out-on-prod>(.*?)<\/stripped-out-on-prod>/)?.groups?.[0]
				}
				const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
				const fullError = `${request.method} ${fullUrl} failed with this error(${whatToFix}) and HTTP status code(${err.status})`;				
				this.Logger.debug(fullError)				
				response.status(statusCode).send({statusCode,status, whatToFix}).end()		
				return
			}			
			if (+(err.statusCode)) {
				response.status(+err.statusCode).send({statusCode: err.statusCode,status: theError}).end()	
			} else {
				response.status(500).send({statusCode: 500, status: "InternalServerError"}).end()	
			}
			const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
			const fullError = `${request.method} ${fullUrl} failed with this error(${theError}) and HTTP status code(${err.status})`;				
			this.Logger.debug(fullError)				
			return
		}
	}
}