import {param, post, requestBody} from '@loopback/rest'
import {HttpMethodsEnum, IUserResponse, ILoginRequest} from '@david.ezechukwu/core'
import {UserResponse} from '../../dtobjects/responses/UserResponse'
import {AuthenticationService, GeoLocationService} from '../../services'
import {SchemaUtils} from '../../utils'
import {SuperController} from '../SuperController'
import {LoginRequest} from '../../dtobjects'
import { inject } from '@loopback/core'

/**
 * The Front Controller for Forms Authentication Login
 * @remarks
 * This is used to authenticate using a Username and a Password
 * @category Security
 */
export class LoginController extends SuperController {
    constructor(
		@inject(GeoLocationService.BINDING_KEY.key)
		protected GeoLocationService: GeoLocationService
	) {
        super()
    }
	
    @AuthenticationService.RequireLocalAuthentication()
    @post(
        `${SuperController.SecurityURLPath}/login`,
        SchemaUtils.GetOp(UserResponse, {
            Controller: LoginController.name,
            ControllerMethod: LoginController.prototype.Login.name,
            Method: HttpMethodsEnum.Post,
            Tag: SchemaUtils.SecurityTag,
            Description: 'Log in using a username and password',
			Returns409:true,
			Returns422:true,
			Returns451:true,
        })
    )
    public async Login(
		@param.query.string('locale', {description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.`}) locale: string,
        @param.query.string('device', {description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.`}) device: string,
        @requestBody({
            description: 'Please provide your logon',
            required: true,
            content: {
                // eslint-disable-next-line
                'application/x-www-form-urlencoded': {
                    schema: SchemaUtils.GetRequestSchema<LoginRequest>(LoginRequest)
                },
                // eslint-disable-next-line
                'application/json': {
                    schema: SchemaUtils.GetRequestSchema<LoginRequest>(LoginRequest)
                }
            }
        })
        loginRequest: ILoginRequest
    ): Promise<IUserResponse | null> {
        return new Promise<IUserResponse | null>(async (resolve, reject) => {
            try{				
				loginRequest.Locale = super.DetermineLocale({localeParam: locale, request:loginRequest})
				loginRequest.Device = super.DetermineDevice({request:loginRequest})
				const userResponse = await this.UserService.GetUserResponse({Id: this.Request.session.User?.Id})				
				const userLogin = await this.UserService.CreateUserLogin(this.Request.session.User?.Id!, this.Request)
				this.NotificationService.LoginNotification({Id: this.Request.session.User?.Id}, userLogin)			
				resolve(userResponse)			
            } catch (e) {
                const request = new LoginRequest()
                request.Password = loginRequest.Password
                request.Username = loginRequest.Username
                const args = `loginRequest=${JSON.stringify(SchemaUtils.StripSensitiveProperties<LoginRequest>(request))}}`
                this.Logger.error(`The call to ${LoginController.name}.${LoginController.prototype.Login.name}(${args}) failed with this error: ${e.toString()}`)
                reject(e)
            }
        })
    }
}
