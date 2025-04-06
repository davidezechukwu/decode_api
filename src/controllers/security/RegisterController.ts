import { inject } from '@loopback/core'
import { param, post, requestBody } from '@loopback/rest'
import { HttpMethodsEnum, IRegisterRequest, IUserResponse } from '@david.ezechukwu/core'
import { UserResponse } from '../../dtobjects'
import { LocalisationUtils, SchemaUtils } from '../../utils'
import { SuperController } from '../SuperController'
import { RegisterRequest } from '../../dtobjects'
import { GeoLocationService } from '../../services/geolocation'
import { Lookups } from '../../_infrastructure/fixtures/localisation/Lookups'

const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()


/**
 * The Front Controller for Forms Authentication Registration
 * @remarks
 * This is used to sign up using Username and Password etc.
 * The Locale is determine first from the request body, then from the query string and next from the accept-language header, and will default to
 * this.Configuration.localisation.defaultDevice
 * @category Security
 */
export class RegisterController extends SuperController {
	constructor(
		@inject(GeoLocationService.BINDING_KEY.key)
		protected GeoLocationService: GeoLocationService
	) {
		super()
	}

	@post(
		`${SuperController.SecurityURLPath}/register`,
		SchemaUtils.GetOp(UserResponse, {
			Controller: RegisterController.name,
			ControllerMethod: RegisterController.prototype.Register.name,
			Method: HttpMethodsEnum.Post,
			Tag: SchemaUtils.SecurityTag,
			Description:
				'Register using an email address and password logon. The Locale is determine first from the request body, then from the query string and next from the accept-language header, and will default to Configuration.localisation.defaultDevice'
		})
	)
	public async Register(
		@param.query.string('locale', { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string,
		@requestBody({
			description: 'Please provide your username and password logon',
			required: true,
			content: {
				// eslint-disable-next-line
				'application/x-www-form-urlencoded': {
					schema: SchemaUtils.GetRequestSchema<RegisterRequest>(RegisterRequest)
				},
				// eslint-disable-next-line
				'application/json': {
					schema: SchemaUtils.GetRequestSchema<RegisterRequest>(RegisterRequest)
				}
			}
		})
		registerRequest: IRegisterRequest
	): Promise<IUserResponse | null> {
		return new Promise<IUserResponse | null>(async (resolve, reject) => {
			try {
				if (!registerRequest.Locale) {
					if (locale) {
						registerRequest.Locale = locale
					}
					else if (this.Request.headers['accept-language']) {
						registerRequest.Locale = this.Request.headers['accept-language']
					}
					else {
						registerRequest.Locale = this.Configuration.localisation.defaultLocale
					}
				}
				registerRequest.Device ? device : this.Configuration.localisation.defaultDevice
				// eslint-disable-next-line
				const [_, languageLookup] = await this.LookupService.GetLanguageLookupFromLocale(registerRequest.Locale)
				const user = await this.AuthenticationService.Register(registerRequest, languageLookup)
				await this.AuthenticationService.SetSessionUsingExpressReq(this.RequestContext.request, user)
				let userResponse = await this.UserService.GetUserResponse(user!)
				userResponse!.IsAuthenticated = true				
				
				const userLogin = await this.UserService.CreateUserLogin(this.Request.session.User?.Id!, this.Request)
				const typesCategory = await this.LookupService.GetLookupCategoryByValue( lookups.BasicTypes.Value)
				const primaryEmailAddress = typesCategory.Lookups?.find( p => p.Value == lookups.BasicTypes.Primary.Value)
				const userPrimaryEmailAddress = userResponse.UserEmailAddresses.find( p => p.EmailAddressTypeId == primaryEmailAddress?.Id )
				await this.UserService.TriggerUserEmailAddressVerification(userPrimaryEmailAddress?.Id!, this.Request.session.User?.Id! )
				this.NotificationService.WelcomeNotification({ Id: this.Request.session.User?.Id }, userLogin)								
				this.NotificationService.LoginNotification({Id: this.Request.session.User?.Id}, userLogin)			
				resolve(userResponse)
			} catch (e) {
				const args = `registerRequest=${JSON.stringify(registerRequest)}}`
				this.Logger.error(`The call to ${RegisterController.name}.${RegisterController.prototype.Register.name}(${args}) failed with this error: ${e.toString()}`)
				reject(e)
			}
		})
	}
}
