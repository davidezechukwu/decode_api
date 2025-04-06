import { get } from '@loopback/rest'
import * as _ from 'lodash'
import { inject } from '@loopback/core'
import { logInvocation } from '@loopback/logging'
import { HttpMethodsEnum, IHealthStatusResponse, IPingResponse } from '@david.ezechukwu/core'
import { SuperController } from './../SuperController'
import { SuperBindings } from './../../SuperBindings'
import { PingResponse } from '../../dtobjects/responses/PingResponse'
import { HealthStatusResponse } from '../../dtobjects/responses/HealthStatusResponse'
import { WhoAmIResponse } from '../../dtobjects/responses/WhoAmIResponse'
import { AuthenticationService, EmailNotificationStrategy, SMSNotificationStrategy } from '../../services'
import { LocalisationUtils, SchemaUtils } from '../../utils'
import { Lookups } from '../../_infrastructure/fixtures/localisation/Lookups'
import { Locale } from '../../Configuration'

const fs = require('fs')

/**
 * The Front Controller for Health Status
 * @remarks
 * Check, Ping and WhoAmI
 * @category Health Status
 */
export class HealthStatusController extends SuperController {
	static XSLTStylesheetGetHealthstatus = fs.readFileSync(__dirname + `/HealthStatusResponse.xslt`, 'utf8')
	static XSLTStylesheetWhoAmI = fs.readFileSync(__dirname + `/WhoAmIResponse.xslt`, 'utf8')
	static XSLTStylesheetPing = fs.readFileSync(__dirname + `/PingResponse.xslt`, 'utf8')

	constructor(
		@inject(SuperBindings.PACKAGE_JSON_BINDING.key)
		protected PackageJSON: any,
		@inject(EmailNotificationStrategy.BINDING_KEY.key)
		public EmailNotificationStrategy: EmailNotificationStrategy,
		@inject(SMSNotificationStrategy.BINDING_KEY.key)
		public SMSNotificationStrategy: SMSNotificationStrategy
	) {
		super()
	}

	/**
	 * Get a detailed health status
	 */
	@logInvocation()
	@get(
		`${SuperController.HealthURLPath}/healthstatus`,
		SchemaUtils.GetOp(HealthStatusResponse, {
			Controller: HealthStatusController.name,
			ControllerMethod: HealthStatusController.prototype.GetHealthStatus.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.HealthCheckTag,
			IncludeHTMLResponseMediaType: true,
			IncludePlainTextResponseMediaType: true,
			Description: 'Health check status'
		})
	)
	public async GetHealthStatus(): Promise<IHealthStatusResponse> {
		return new Promise<IHealthStatusResponse>(async (resolve, reject) => {
			try {
				const packageJSON = { ...this.PackageJSON }
				packageJSON._dependencies = packageJSON.dependencies
				packageJSON.dependency = []
				Object.entries(packageJSON._dependencies).forEach(([key, value]) => {
					packageJSON.dependency.push({ name: key, version: value })
				})
				packageJSON._knownIssues = packageJSON.knownIssues
				packageJSON.knownIssues = []
				Object.entries(packageJSON._knownIssues).forEach(([key, issue]) => {
					packageJSON.knownIssues.push({ knownIssue: { title: (issue as any)['title'], description: (issue as any)['description'], link: (issue as any)['link'] } })
				})
				delete packageJSON._dependencies
				delete packageJSON.dependencies
				delete packageJSON._knownIssues
				delete packageJSON.peerDependencies
				delete packageJSON.scripts
				delete packageJSON.devDependencies
				delete packageJSON.publishConfig
				delete packageJSON.watch
				delete packageJSON.files
				delete packageJSON.eslintConfig

				const resp = new HealthStatusResponse()
				//TODO: Use logged in user language or get from query, header, path or header
				let locale: Locale = this.Configuration.localisation.defaultLocale
				if (this.Request?.session?.User ){
					let userDetails = await this.UserService.GetUserResponse(this.Request.session.User)					
					if ( userDetails){
						locale = userDetails.UserLanguage.Value! as Locale
					}
				}
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				resp.Phrases = {}
				resp.Status = 'Running'
				resp.UTCDate = new Date(Date.now())
				const config = this.Configuration
				resp.SwaggerEndPoint = `${config.expressJS!.mountPath}${this.RestServerBasePath}${config.loopBackExplorerPath}`
				resp.PackageJSON = packageJSON
				resp.XSLTStylesheet = HealthStatusController.XSLTStylesheetGetHealthstatus
				resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}

	/**
	 * Ping
	 */
	@logInvocation()
	@get(
		`${SuperController.HealthURLPath}/ping`,
		SchemaUtils.GetOp(PingResponse, {
			Controller: HealthStatusController.name,
			ControllerMethod: HealthStatusController.prototype.Ping.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.HealthCheckTag,
			IncludeHTMLResponseMediaType: true,
			IncludePlainTextResponseMediaType: true,
			Description: 'Ping the API'
		})
	)
	public async Ping(): Promise<IPingResponse> {
		return new Promise<IPingResponse>(async (resolve, reject) => {
			try {
				const resp: IPingResponse = new PingResponse({
					XSLTStylesheet: `${__dirname}/PingResponse.xslt`
				})				
				//TODO: Use logged in user language or get from query, header, path or header
				let locale: Locale = this.Configuration.localisation.defaultLocale
				if (this.Request?.session?.User ){
					let userDetails = await this.UserService.GetUserResponse(this.Request.session.User)					
					if ( userDetails){
						locale = userDetails.UserLanguage.Value! as Locale
					}
				}
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				resp.Phrases = {}
				resp.RequestHeaders = Object.assign({}, this.Request.headers)
				resp.XSLTStylesheet = HealthStatusController.XSLTStylesheetPing
				resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}

	/**
	 * URL which returns back info about the currently logged in user
	 * @remarks
	 * Returns a complete breakdown of the information held on a user.
	 * Including Current and Past Cookies, current and past sessions with Locations and Devices
	 * Password is not shown as this is not know, as it is encrypted
	 * In accordance with Privacy Policy. DO NOT LOG WITHOUT STRIPPING OUT SENSITIVE PROPERTIES
	 * TODO://ADD Tests to check if logging is enabled
	  */
	@AuthenticationService.RequireSessionAuthentication()
	@get(
		`${SuperController.HealthURLPath}/whoami`,
		SchemaUtils.GetOp(WhoAmIResponse, {
			Controller: HealthStatusController.name,
			ControllerMethod: HealthStatusController.prototype.WhoAmI.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.HealthCheckTag,
			IncludeHTMLResponseMediaType: true,
			IncludePlainTextResponseMediaType: true,
			Description: 'Shows information about the authenticated user using the current browser session. \
							Returns a complete breakdown of the information held on a user. \
							Including Current and Past Cookies, current and past sessions with Locations and Devices',
			Returns401: true,
			Returns403: true,
			Returns500: true,
		})
	)
	public async WhoAmI(): Promise<WhoAmIResponse> {
		return new Promise<WhoAmIResponse>(async (resolve, reject) => {
			try {
				let resp = new WhoAmIResponse({})
				//TODO: Use logged in user language or get from query, header, path or header
				let locale: Locale = this.Configuration.localisation.defaultLocale
				if (this.Request?.session?.User ){
					let userDetails = await this.UserService.GetUserResponse(this.Request.session.User)					
					resp.UserDetails = await this.UserService.PrepareUserResponseForHumans(userDetails)				
					if ( userDetails){
						locale = userDetails.UserLanguage.Value! as Locale
					}
				}
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				resp.Phrases = lookups.WhoAmICopy
				resp.RequestHeaders = Object.assign({}, this.Request.headers)
				resp.XSLTStylesheet = HealthStatusController.XSLTStylesheetWhoAmI
				resp.HostName = this.Configuration.name
				resp.HostUrl = this.Configuration.hostURL
				resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}
}
