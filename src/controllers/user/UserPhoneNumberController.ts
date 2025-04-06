import { logInvocation } from '@loopback/logging'
import { inject } from '@loopback/core'
import { authorize } from '@loopback/authorization'
import { post, del, requestBody, get, patch, param } from '@loopback/rest'
import { HttpMethodsEnum, IUserPhoneNumber, ModelIdType } from '@david.ezechukwu/core'
import { AuthenticationService } from '../../services/security/AuthenticationService'
import { AuthorizationService } from '../../services/security/AuthorizationService'
import { SchemaUtils } from '../../utils/SchemaUtils'
import { SuperController } from '../SuperController'
import { UserPhoneNumberModel } from '../../models/UserPhoneNumberModel'
import { UserPhoneNumberRequest } from '../../dtobjects/requests/UserPhoneNumberRequest'
import { RestUtils } from '../../utils/RestUtils'
import { UserLoginModel, UserModel } from '../../models'
import { GeoLocationService } from '../../services'
import DeviceDetector from 'device-detector-js'
import { LocalisationUtils } from '../../utils'


/**
 * The Front Controller for user phone number operations 
 * @category User
 */
export class UserPhoneNumberController extends SuperController {
	constructor(
		@inject(GeoLocationService.BINDING_KEY.key)
		protected GeoLocationService: GeoLocationService
	) {
		super()
	}

	@logInvocation()
	@AuthenticationService.RequireSessionAuthentication()
	@authorize({ resource: UserPhoneNumberModel.name, scopes: [AuthorizationService.HttpPostScope] })
	@post(
		`${SuperController.UserURLPath}/{userid}/phonenumbers`,
		SchemaUtils.GetOp(UserPhoneNumberModel, {
			Controller: UserPhoneNumberController.name,
			ControllerMethod: UserPhoneNumberController.prototype.CreateUserPhoneNumber.name,
			Method: HttpMethodsEnum.Post,
			Tag: SchemaUtils.UserTag,
			Description: "Add mobile or/and landline phone numbers",
			IsSecured: true
		})
	)
	public async CreateUserPhoneNumber(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@requestBody({
			description: 'Please provide your mobile or/and landline phones, if any',
			required: true,
			content: {
				// eslint-disable-next-line
				'application/x-www-form-urlencoded': {
					schema: SchemaUtils.GetRequestSchema<UserPhoneNumberRequest>(UserPhoneNumberRequest)
				},
				// eslint-disable-next-line
				'application/json': {
					schema: SchemaUtils.GetRequestSchema<UserPhoneNumberRequest>(UserPhoneNumberRequest)
				}
			}
		})
		userPhoneNumberRequest: UserPhoneNumberRequest
	): Promise<IUserPhoneNumber | null> {
		return new Promise<IUserPhoneNumber | null>(async (resolve, reject) => {
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
				const userPhoneNumber = await this.UserService.CreateUserPhoneNumber(userId, userPhoneNumberRequest)
				this.NotificationService.VerifyPhoneNumberNotification(new UserModel({ Id: userId }), userPhoneNumber, userLogin);
				return resolve(userPhoneNumber)
			} catch (e) {
				return reject(e)
			}
		})
	}

	@logInvocation()
	@get(
		`${SuperController.UserURLPath}/{userid}/phonenumbers/{id}`,
		SchemaUtils.GetOpWithoutModel({
            Controller: UserPhoneNumberController.name,
            ControllerMethod: UserPhoneNumberController.prototype.VerifyUserPhoneNumber.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.UserTag,
            Description: "Verify a user's mobile phone number. Landlines are done via Text to Speech and SMS",
            IsSecured: false,
			IncludeXMLResponseMediaType: false,
			IncludeJSONResponseMediaType: false,
            IncludePlainTextResponseMediaType: true,
            IncludeHTMLResponseMediaType: true,
            Id: 'VerifyUserPhoneNumber'
        })
	)
	public async VerifyUserPhoneNumber(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType,
		@param.query.string('verificationtoken', { description: `The auto-generated token used to verify the mobile phone number it was sent to` }) verificationToken: string,
		@param.query.string('locale', { description: `The user's' locale; set on email link` }) locale: string
	): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {				
				await this.UserService.VerifyUserPhoneNumber(id, userId, verificationToken)
				const lookups = LocalisationUtils.GetLocalisedLookups( locale)
				return resolve(lookups.Messages.YourPhoneNumberHasBeenVerified)		
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Generate a user's mobile phone number verification token and trigger the notification
	 * @remarks
	 * TODO:// use 4 letter code rather than GUID for more the more trustful manual code entry for verification rather than link on SMS message; also to be used for Text-to-Speech Landline verification	 
	 */
	@logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserPhoneNumberModel.name, scopes: [AuthorizationService.HttpPatchScope]})
    @patch(
        `${SuperController.UserURLPath}/{userid}/phonenumbers/{id}`,
        SchemaUtils.GetOpWithoutModel({
            Controller: UserPhoneNumberController.name,
            ControllerMethod: UserPhoneNumberController.prototype.TriggerUserPhoneNumberVerification.name,
            Method: HttpMethodsEnum.Patch,
            Tag: SchemaUtils.UserTag,
            Description: "Generate a user's mobile phone number verification token and trigger the notification",
            IsSecured: true,
            Id: 'TriggerUserPhoneNumberVerification'
        })
    )
    public async TriggerUserPhoneNumberVerification(
        @RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType
    ): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
				 if (!isAllowed) {
                    return reject(permissionError)
                }

               const resp =  await this.UserService.TriggerUserPhoneNumberVerification(id, userId)
                return resolve(resp)
            } catch (e) {
                return reject(e)
            }
        })
    }

	@logInvocation()
	@AuthenticationService.RequireSessionAuthentication()
	@authorize({ resource: UserPhoneNumberModel.name, scopes: [AuthorizationService.HttpDeleteScope] })
	@del(
		`${SuperController.UserURLPath}/{userid}/phonenumbers/{id}`,
		SchemaUtils.GetOp(UserPhoneNumberModel, {
			Controller: UserPhoneNumberController.name,
			ControllerMethod: UserPhoneNumberController.prototype.DeleteUserPhoneNumber.name,
			Method: HttpMethodsEnum.Put,
			Tag: SchemaUtils.UserTag,
			Description: "Delete a user's phone number",
			IsSecured: true
		})
	)
	public async DeleteUserPhoneNumber(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType,
	): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
				if (!isAllowed) {
					return reject(permissionError)
				}

				await this.UserService.DeleteUserPhoneNumber(id)
				return resolve()
			} catch (e) {
				return reject(e)
			}
		})
	}
}
