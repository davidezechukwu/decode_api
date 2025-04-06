import { inject } from '@loopback/core'
import { get, RequestWithSession, Response, RestBindings } from '@loopback/rest'
import { AuthenticationBindings } from '@loopback/authentication'
import { HttpMethodsEnum } from '@david.ezechukwu/core'
import { SuperController } from '../SuperController'
import { AuthenticationService, ExternalUserIdentityService } from '../../services'
import { UserModel } from '../../models'
import { provider } from '../../Configuration'
import { SuperBindings } from '../../SuperBindings'
import { SchemaUtils } from '../../utils'

/**
 * The Front Controller for external Logons
 * @remarks
 * This is used to authenticate using third-party Authentication Providers such as OAUTH2, SAML, OpenId, etc
 * The method ExternalLogin uses the authenticate decorator to plug-in passport strategies independently
 * The method ExternalLoginCallBack uses the passport strategies as express middleware
 * @category Security
 */
export class ExternalLoginController extends SuperController {
	constructor(
		@inject(ExternalUserIdentityService.BINDING_KEY.key)
		protected ExternalUserIdentityService: ExternalUserIdentityService,
		@inject(SuperBindings.AuthenticationServiceBindingKey.key)
		protected AuthenticationService: AuthenticationService
	) {
		super()
	}

	protected RedirectToProviver(redirectUrl: string, status: number) {
		this.Response.statusCode = status || 302
		this.Response.setHeader('Location', redirectUrl)
		this.Response.end()
		return this.Response
	}

	protected async CallBackHandler(oauthProvider: string, methodName: string, user: UserModel, request: RequestWithSession, response: Response) {
		const controllerName = ExternalLoginController.name
		try {
			let successRedirect = ''
			for (const key in this.Configuration.authentication!) {
				if (this.Configuration.authentication![key][provider] == oauthProvider.toLocaleLowerCase()) {
					successRedirect = this.Configuration.authentication![key]['successRedirect']
				}
			}
			if (!successRedirect.trim()) {
				throw new Error(`The call to ${controllerName}.${methodName}()
				failed as the successRedirect property is either missing or wrong in ConfigurationType.authentication`)
			}

			const origin = new URL(successRedirect)?.hostname.toLowerCase()
			if (!origin?.trim()) {
				throw new Error(`The call to ${controllerName}.${methodName}() 
				failed as the successRedirect property is either missing or wrong in ConfigurationType.authentication`)
			}
			const allowedOrigins = this.Configuration.rest!.cors!.origin!
			const isOriginAllowed: boolean = allowedOrigins.find(o => new URL(o).hostname.toLowerCase() == origin)!.length > 0
			if (!isOriginAllowed) {
				throw new Error(`The call to ${controllerName}.${methodName}() 
				failed as the origin(${origin!}) is not among those allowed in th env variable LOOPBACK_CORE_CORS_ALLOW_ORIGIN (${allowedOrigins.join(`,`)})`)
			}
			await this.AuthenticationService.SetSessionUsingLoopbackReq(request, user)
			const AfterAffect = async () => {
				try {
					const userLogin = await this.UserService.CreateUserLogin(this.Request.session.User?.Id!, this.Request)
					this.NotificationService.WelcomeNotification({ Id: this.Request.session.User?.Id }, userLogin)
					this.NotificationService.LoginNotification({ Id: this.Request.session.User?.Id }, userLogin)
				}
				catch (e) {
					this.Logger.error(`The call to ${controllerName}.${this.CallBackHandler.name}(${oauthProvider}) failed with this error: ${e.toString()}`)
				}
			}
			AfterAffect()
			response.redirect(`${successRedirect}`)
			return
		} catch (e) {
			this.Logger.error(`The call to ${controllerName}.${this.CallBackHandler.name}(${oauthProvider}) failed with this error: ${e.toString()}`)
		}
	}

	@AuthenticationService.RequireGoogleAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/google`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'Google',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginGoogle.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Authenticate using OAUTH2 and Google',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	ExternalLoginGoogle(@inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL) redirectUrl: string, @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS) status: number) {
		this.RedirectToProviver(redirectUrl, status)
		return
	}

	@AuthenticationService.RequireGoogleAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/google/callback`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'GoogleOAUTH2Callback',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginCallBackGoogle.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Google OAUTH2 callback',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	async ExternalLoginCallBackGoogle(@inject(AuthenticationBindings.CURRENT_USER) user: UserModel, @inject(RestBindings.Http.REQUEST) request: RequestWithSession, @inject(RestBindings.Http.RESPONSE) response: Response) {
		this.CallBackHandler('google', this.ExternalLoginCallBackGoogle.name, user, request, response)
		return
	}

	@AuthenticationService.RequireFacebookAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/facebook`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'Facebook',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginFacebook.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Authenticate using OAUTH2 and Facebook',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	ExternalLoginFacebook(@inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL) redirectUrl: string, @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS) status: number) {
		this.RedirectToProviver(redirectUrl, status)
		return
	}

	@AuthenticationService.RequireFacebookAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/facebook/callback`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'FacebookOAUTH2Callback',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginCallBackFacebook.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Facebook OAUTH2 callback',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	async ExternalLoginCallBackFacebook(@inject(AuthenticationBindings.CURRENT_USER) user: UserModel, @inject(RestBindings.Http.REQUEST) request: RequestWithSession, @inject(RestBindings.Http.RESPONSE) response: Response) {
		this.CallBackHandler('facebook', this.ExternalLoginCallBackFacebook.name, user, request, response)
		return
	}

	@AuthenticationService.RequireTwitterAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/twitter`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'Twitter',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginTwitter.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Authenticate using OAUTH2 and Twitter',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	ExternalLoginTwitter(@inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL) redirectUrl: string, @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS) status: number) {
		this.RedirectToProviver(redirectUrl, status)
		return
	}

	@AuthenticationService.RequireTwitterAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/twitter/callback`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'TwitterOAUTH2Callback',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginCallBackTwitter.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Twitter OAUTH2 callback',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	async ExternalLoginCallBackTwitter(@inject(AuthenticationBindings.CURRENT_USER) user: UserModel, @inject(RestBindings.Http.REQUEST) request: RequestWithSession, @inject(RestBindings.Http.RESPONSE) response: Response) {
		this.CallBackHandler('twitter', this.ExternalLoginCallBackTwitter.name, user, request, response)
		return
	}

	@AuthenticationService.RequireLinkedInAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/linkedin`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'LinkedIn',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginLinkedIn.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Authenticate using OAUTH2 and LinkedIn',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	ExternalLoginLinkedIn(@inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL) redirectUrl: string, @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS) status: number) {
		this.RedirectToProviver(redirectUrl, status)
		return
	}

	@AuthenticationService.RequireLinkedInAuthentication()
	@get(
		`${SuperController.SecurityURLPath}/externallogin/linkedin/callback`,
		SchemaUtils.GetOpWithoutModel({
			Id: 'LinkedInOAUTH2Callback',
			Controller: ExternalLoginController.name,
			ControllerMethod: ExternalLoginController.prototype.ExternalLoginCallBackLinkedIn.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.SecurityTag,
			Description: 'LinkedIn OAUTH2 callback',
			Returns415:false,
			Returns418:false,
			Returns422:false,
		})
	)
	async ExternalLoginCallBackLinkedIn(@inject(AuthenticationBindings.CURRENT_USER) user: UserModel, @inject(RestBindings.Http.REQUEST) request: RequestWithSession, @inject(RestBindings.Http.RESPONSE) response: Response) {
		this.CallBackHandler('linkedin', this.ExternalLoginCallBackLinkedIn.name, user, request, response)
		return
	}
}