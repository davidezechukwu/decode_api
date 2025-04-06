import { logInvocation } from '@loopback/logging'
import { inject } from '@loopback/core'
import { authorize } from '@loopback/authorization'
import { post, del, get, patch, requestBody, param } from '@loopback/rest'
import { HttpMethodsEnum, IUserEmailAddress, ModelIdType } from '@david.ezechukwu/core'
import { AuthenticationService } from '../../services/security/AuthenticationService'
import { AuthorizationService } from '../../services/security/AuthorizationService'
import { SchemaUtils } from '../../utils/SchemaUtils'
import { SuperController } from '../SuperController'
import { UserEmailAddressModel } from '../../models/UserEmailAddressModel'
import { UserEmailAddressRequest } from '../../dtobjects/requests/UserEmailAddressRequest'
import { RestUtils } from '../../utils/RestUtils'
import { UserLoginModel, UserModel } from '../../models'
import { GeoLocationService } from '../../services'
import DeviceDetector from 'device-detector-js'
import { LocalisationUtils } from '../../utils'

/**
 * The Front Controller for user email address operations 
 * @category User
 */
export class UserEmailAddressController extends SuperController {
	constructor(
		@inject(GeoLocationService.BINDING_KEY.key)
		protected GeoLocationService: GeoLocationService
	) {
		super()
	}

	@logInvocation()
	@AuthenticationService.RequireSessionAuthentication()
	@authorize({ resource: UserEmailAddressModel.name, scopes: [AuthorizationService.HttpPostScope] })
	@post(
		`${SuperController.UserURLPath}/{userid}/emailaddresses`,
		SchemaUtils.GetOp(UserEmailAddressModel, {
			Controller: UserEmailAddressController.name,
			ControllerMethod: UserEmailAddressController.prototype.CreateUserEmailAddress.name,
			Method: HttpMethodsEnum.Post,
			Tag: SchemaUtils.UserTag,
			Description: "Create a user's  email address if any",
			IsSecured: true
		})
	)
	public async CreateUserEmailAddress(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@requestBody({
			description: 'Please provide your email address, if any',
			required: true,
			content: {
				// eslint-disable-next-line
				'application/x-www-form-urlencoded': {
					schema: SchemaUtils.GetRequestSchema<UserEmailAddressRequest>(UserEmailAddressRequest)
				},
				// eslint-disable-next-line
				'application/json': {
					schema: SchemaUtils.GetRequestSchema<UserEmailAddressRequest>(UserEmailAddressRequest)
				}
			}
		})
		userEmailAddressRequest: UserEmailAddressRequest
	): Promise<IUserEmailAddress | null> {
		return new Promise<IUserEmailAddress | null>(async (resolve, reject) => {
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
				const userEmailAddress = await this.UserService.CreateUserEmailAddress(userId, userEmailAddressRequest)
				this.NotificationService.VerifyEmailAddressNotification(new UserModel({ Id: userId }), userEmailAddress, userLogin)
				return resolve(userEmailAddress)
			} catch (e) {
				return reject(e)
			}
		})
	}

	@logInvocation()	
	@get(
		`${SuperController.UserURLPath}/{userid}/emailaddresses/{id}`,
		SchemaUtils.GetOpWithoutModel({
			Controller: UserEmailAddressController.name,
			ControllerMethod: UserEmailAddressController.prototype.VerifyUserEmailAddress.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.UserTag,
			Description: "Verify a user's email address",
			IsSecured: false,
			IncludeXMLResponseMediaType: false,
			IncludeJSONResponseMediaType: false,
			IncludePlainTextResponseMediaType: true,
			IncludeHTMLResponseMediaType: true,
			Id: 'VerifyUserEmailAddress'
		})
	)
	public async VerifyUserEmailAddress(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType,
		@param.query.string('verificationtoken', { description: `The auto-generated token used to verify the email address it was sent to` }) verificationToken: string,
		@param.query.string('locale', { description: `The user's' locale; set on email link` }) locale: string
	): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {
				await this.UserService.VerifyUserEmailAddress(id, userId, verificationToken)
				const lookups = LocalisationUtils.GetLocalisedLookups( locale)
				return resolve(lookups.Messages.YourEmailAddressHasBeenVerified)				
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Generate a user's email address verification token and trigger the notification
	 * @remarks
	 * TODO:// use a shorter 6 letter code for more the more trustful manual code entry for verification rather than link on SMS message; also to be used for Text-to-Speech Landline verification	 
	 */
	@logInvocation()
	@AuthenticationService.RequireSessionAuthentication()
	@authorize({ resource: UserEmailAddressModel.name, scopes: [AuthorizationService.HttpPatchScope] })
	@patch(
		`${SuperController.UserURLPath}/{userid}/emailaddresses/{id}`,
		SchemaUtils.GetOpWithoutModel({
			Controller: UserEmailAddressController.name,
			ControllerMethod: UserEmailAddressController.prototype.TriggerUserEmailAddressVerification.name,
			Method: HttpMethodsEnum.Patch,
			Tag: SchemaUtils.UserTag,
			Description: "Generate a user's email address verification token and trigger the notification",
			IsSecured: true,
			Id: 'TriggerUserEmailAddressVerification'
		})
	)
	public async TriggerUserEmailAddressVerification(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType
	): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
				if (!isAllowed) {
					return reject(permissionError)
				}

				const resp = await this.UserService.TriggerUserEmailAddressVerification(id, userId)
				return resolve(resp)
			} catch (e) {
				return reject(e)
			}
		})
	}

	@logInvocation()
	@AuthenticationService.RequireSessionAuthentication()
	@authorize({ resource: UserEmailAddressModel.name, scopes: [AuthorizationService.HttpDeleteScope] })
	@del(
		`${SuperController.UserURLPath}/{userid}/emailaddresses/{id}`,
		SchemaUtils.GetOp(UserEmailAddressModel, {
			Controller: UserEmailAddressController.name,
			ControllerMethod: UserEmailAddressController.prototype.DeleteUserEmailAddress.name,
			Method: HttpMethodsEnum.Put,
			Tag: SchemaUtils.UserTag,
			Description: "Delete a user's email address",
			IsSecured: true
		})
	)
	public async DeleteUserEmailAddress(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType,
	): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
				if (!isAllowed) {
					return reject(permissionError)
				}

				await this.UserService.DeleteUserEmailAddress(id)
				return resolve()
			} catch (e) {
				return reject(e)
			}
		})
	}
}
