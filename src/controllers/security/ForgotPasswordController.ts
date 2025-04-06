import { inject } from '@loopback/core'
import { post, requestBody } from '@loopback/rest'
import { HttpMethodsEnum, IForgotPasswordRequest } from '@david.ezechukwu/core'
import { SchemaUtils } from '../../utils'
import { SuperController } from '../SuperController'
import { ForgotPasswordRequest, UserResponse } from '../../dtobjects'
import DeviceDetector from 'device-detector-js'
import { UserLoginModel } from '../../models'
import { GeoLocationService } from '../../services/geolocation/GeoLocationService'

/**
 * The Front Controller for the Forms Authentication Forgot Password functionality
 * @remarks
 * @category Security
 */
export class ForgotPasswordController extends SuperController {
	constructor(
		@inject(GeoLocationService.BINDING_KEY.key)
		protected GeoLocationService: GeoLocationService
	) {
		super()
	}

	@post(
		`${SuperController.SecurityURLPath}/forgotpassword`,
		SchemaUtils.GetOp(UserResponse, {
			Controller: ForgotPasswordController.name,
			ControllerMethod: ForgotPasswordController.prototype.ForgotPassword.name,
			Method: HttpMethodsEnum.Post,
			Tag: SchemaUtils.SecurityTag,
			Description: 'Reset your logon password'
		})
	)
	public async ForgotPassword(
		@requestBody({
			description: `Please provide your email address in order to change your password and have a 'Reset Password' email sent to it`,
			required: true,
			content: {
				// eslint-disable-next-line
				'application/x-www-form-urlencoded': {
					schema: SchemaUtils.GetRequestSchema<ForgotPasswordRequest>(ForgotPasswordRequest)
				},
				// eslint-disable-next-line
				'application/json': {
					schema: SchemaUtils.GetRequestSchema<ForgotPasswordRequest>(ForgotPasswordRequest)
				}
			}
		})
		forgotPasswordRequest: IForgotPasswordRequest
	): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			let userLogin: UserLoginModel
			try {
				//TODO: re-factor duplicated code
				//capture details of required
				const deviceDetector = new DeviceDetector();
				const useragent = deviceDetector.parse(this.Request.headers['user-agent']!);
				let ip: string =
					(this.Request.headers['x-forwarded-for'] as string) ||
					(this.Request.socket.remoteAddress ?? '') ||
					(this.Request.headers['x-real-ip'] as string)
				if (ip == '127.0.0.1' && this.Configuration.isNotProduction) {
					ip = `90.193.80.32`
				}
				userLogin = new UserLoginModel(await this.GeoLocationService.GetLocationFromIP(ip))				
				userLogin.RawUserAgent = ip;
				userLogin.RawUserAgent = this.Request.headers['user-agent']!
				userLogin.DeviceType = useragent.device?.type
				userLogin.DeviceBrand = useragent.device?.brand
				userLogin.DeviceModel = useragent.device?.model
				userLogin.ClientName = useragent.client?.name
				userLogin.ClientType = useragent.client?.type
				userLogin.ClientEngine = ``
				userLogin.ClientEngineVersion = ``
				userLogin.OSName = useragent.os?.name
				userLogin.OSVersion = useragent.os?.version
				userLogin.OSPlatform = useragent.os?.platform																				
			} catch (e) {				
				return reject(e)
			}

			try{
				const resp = await this.UserService.TriggerUserPasswordChange(forgotPasswordRequest, userLogin)							
			} catch (e) {
				this.Logger.error(`${ForgotPasswordController.name}.${ForgotPasswordController.prototype.ForgotPassword.name} failed with this error (${e})`)
			}
			finally{
				return resolve (true)
			}
		})
	}
}
