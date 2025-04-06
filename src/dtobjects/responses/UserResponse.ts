import { Entity, model, property } from '@loopback/repository'
import { getJsonSchema } from '@loopback/repository-json-schema'
import { ModelIdTypeName, ModelIdType, IUserResponse, ILookupLanguageResponse } from '@david.ezechukwu/core'
import { UserEmailAddressModel } from '../../models/UserEmailAddressModel'
import { UserLogonModel } from '../../models/UserLogonModel'
import { UserPhoneNumberModel } from '../../models/UserPhoneNumberModel'
import { UserPhotoModel } from '../../models/UserPhotoModel'
import { UserDisplaySettingsModel } from '../../models/UserDisplaySettingsModel'
import { UserCommunicationPreferencesModel } from '../../models/UserCommunicationPreferencesModel'
import { UserWebLinkModel } from '../../models/UserWebLinkModel'
import { UserNameModel } from '../../models/UserNameModel'
import { SchemaUtils } from '../../utils'
import { UserGroupAndRoleResponse } from './UserGroupAndRoleResponse'
import { LookupLanguageResponse } from './LookupLanguageResponse'
import { GroupNotificationModel, UserLoginModel, UserNotificationModel } from '../../models'
import { PropertyDecorator } from '../../decorators'

/**
 * Represents information about an authenticated user
 */
@model({ name: `${UserResponse.name}`, jsonSchema: { title: `${UserResponse.name}`, description: `${UserResponse.name}` } })
export class UserResponse extends Entity implements IUserResponse {
	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: 'User id'
		}
	})
	UserId: ModelIdType

	@PropertyDecorator({
		type: 'boolean',
		required: false,
		jsonSchema: {
			description: `True if user is authenticated`
		}
	})
	public IsAuthenticated: boolean

	@property.array(UserEmailAddressModel, SchemaUtils.GetModelSchema(UserEmailAddressModel))
	public UserEmailAddresses: UserEmailAddressModel[] = []

	@property.array(UserGroupAndRoleResponse, SchemaUtils.GetModelSchema(UserGroupAndRoleResponse))
	public UserGroupAndRoles: UserGroupAndRoleResponse[] = []

	@property.array(UserLogonModel, SchemaUtils.GetModelSchema(UserLogonModel))
	public UserLogons: UserLogonModel[] = []

	@PropertyDecorator({
		type: 'object',
		jsonSchema: getJsonSchema(UserNameModel)
	})
	public UserName: UserNameModel | null

	@property.array(UserPhoneNumberModel, SchemaUtils.GetModelSchema(UserPhoneNumberModel))
	public UserPhoneNumbers: UserPhoneNumberModel[] = []

	@property.array(UserPhotoModel, SchemaUtils.GetModelSchema(UserPhotoModel))
	public UserPhotos: UserPhotoModel[] = []

	@PropertyDecorator({
		type: 'object',
		jsonSchema: getJsonSchema(UserCommunicationPreferencesModel)
	})
	public UserCommunicationPreferences: UserCommunicationPreferencesModel | null

	@PropertyDecorator({
		type: 'object',
		jsonSchema: getJsonSchema(UserDisplaySettingsModel)
	})
	public UserDisplaySettings: UserDisplaySettingsModel | null

	@PropertyDecorator({
		type: 'object',
		jsonSchema: getJsonSchema(LookupLanguageResponse)
	})
	UserLanguage: ILookupLanguageResponse

	@property.array(UserWebLinkModel, SchemaUtils.GetModelSchema(UserWebLinkModel))
	public UserWebLinks: UserWebLinkModel[] = []

	@property.array(UserLoginModel, SchemaUtils.GetModelSchema(UserLoginModel))
	UserLogins: UserLoginModel[] = []

	@property.array(UserNotificationModel, SchemaUtils.GetModelSchema(UserNotificationModel))
	UserNotifications: UserNotificationModel[] = []

	@property.array(GroupNotificationModel, SchemaUtils.GetModelSchema(GroupNotificationModel))
	UserGroupNotifications: GroupNotificationModel[] = []

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Color scheme`
		}
	})
	Theme: string

	constructor(partialObject: Partial<UserResponse> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
