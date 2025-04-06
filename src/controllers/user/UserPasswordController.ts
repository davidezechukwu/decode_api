import { inject } from '@loopback/core'
import { post, requestBody } from '@loopback/rest'
import { authorize } from '@loopback/authorization'
import { HttpMethodsEnum, IChangePasswordRequest, ModelIdType } from '@david.ezechukwu/core'
import { RestUtils, SchemaUtils } from '../../utils'
import { SuperController } from '../SuperController'
import { ChangePasswordRequest, UserResponse } from '../../dtobjects'
import DeviceDetector from 'device-detector-js'
import { UserLoginModel, UserPasswordModel } from '../../models'
import { GeoLocationService } from '../../services/geolocation/GeoLocationService'
import { AuthorizationService } from '../../services/security/AuthorizationService'
import { AuthenticationService } from '../../services/security/AuthenticationService'

/**
 * The Front Controller for Forms Authentication Password functionality
 * @category User
 */
export class UserPasswordController extends SuperController {
	constructor(
		@inject(GeoLocationService.BINDING_KEY.key)
		protected GeoLocationService: GeoLocationService,
	) {
		super()
	}

	@AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserPasswordModel.name, scopes: [AuthorizationService.HttpPostScope]})
	@post(
		`${SuperController.UserURLPath}/{userid}/password`,
		SchemaUtils.GetOp(UserResponse, {
			Controller: UserPasswordController.name,
			ControllerMethod: UserPasswordController.prototype.ChangePasswordRequest.name,
			Method: HttpMethodsEnum.Post,
			Tag: SchemaUtils.UserTag,
			Description: "Change a user's password",
			IsSecured: true
		})
	)
	public async ChangePasswordRequest(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,		
		@requestBody({
			description: `Please provide your new password details in order to change your password`,
			required: true,
			content: {
				// eslint-disable-next-line
				'application/x-www-form-urlencoded': {
					schema: SchemaUtils.GetRequestSchema<ChangePasswordRequest>(ChangePasswordRequest)
				},
				// eslint-disable-next-line
				'application/json': {
					schema: SchemaUtils.GetRequestSchema<ChangePasswordRequest>(ChangePasswordRequest)
				}
			}
		})
		ChangePasswordRequest: IChangePasswordRequest
	): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }

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
				let userLogin: UserLoginModel = new UserLoginModel(await this.GeoLocationService.GetLocationFromIP(ip))				
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
				const resp = await this.UserService.ChangeUserPassword(userId, ChangePasswordRequest, userLogin)
				this.NotificationService.PasswordChangedNotification({Id: this.Request.session.User?.Id})			
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}
}
