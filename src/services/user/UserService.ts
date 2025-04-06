import { inject, injectable } from '@loopback/core'
import {
	Filter,
	Where
} from '@loopback/repository'
import { Request } from '@loopback/rest'
import DeviceDetector from "device-detector-js"
import {
	ILookup,
	IUser,
	IUserEmailAddress,
	IUserGroupRoleWithRelations,
	ModelIdType,
	IUserGroupWithRelations,
	IUserLogon,
	IUserName,
	IUserPhoto,
	IUserPassword,
	IUserGroup,
	IUserGroupRole,
	IUserDisplaySettingsRequest,
	IUserNameRequest,
	IUserEmailAddressRequest,
	IUserCommunicationPreferencesRequest,
	INotificationRequest,
	IUserLogin,
	INotificationStatusUpdateRequest,
	IForgotPasswordRequest,
	IChangePasswordRequest,
    IResetPasswordRequest,
    StringUtility
} from '@david.ezechukwu/core'
import {
	LookupCategoryRequest,
	UserResponse,
	UserGroupAndRoleResponse,
	LookupRequest
} from '../../dtobjects'
import {
	GroupModel,
	RoleModel,
	UserEmailAddressModel,
	UserGroupModel,
	UserGroupRoleModel,
	UserLogonModel,
	UserModel,
	UserNameModel,
	UserPhotoModel,
	UserPhoneNumberModel,
	UserDisplaySettingsModel,
	UserCommunicationPreferencesModel,
	UserNotificationModel,
	GroupNotificationModel,
	UserLoginModel,
} from '../../models'
import {
	UserNameRepositoryService,
	UserLogonRepositoryService,
	UserGroupRepositoryService,
	GroupRepositoryService,
	LookupCategoryRepositoryService,
	LookupRepositoryService,
	RoleRepositoryService,
	GroupNotificationRepositoryService,
	UserEmailAddressRepositoryService,
	UserGroupRoleRepositoryService,
	UserPhotoRepositoryService,
	UserDisplaySettingsRepositoryService,
	UserRepositoryService,
	UserWebLinkRepositoryService,
	UserPhoneNumberRepositoryService,
	UserPasswordRepositoryService,
	UserCommunicationPreferencesRepositoryService,
	UserNotificationRepositoryService,
	UserLoginRepositoryService,
} from '../../repositories'
import { SuperBindings } from '../../SuperBindings'
import { SuperService } from '../SuperService'
import { IUserPhoneNumber, IUserPhoneNumberRequest, IdentityUtility } from '@david.ezechukwu/core'
import { LookupService } from '../lookup'
import { GroupNames, LocalStrategyOptions, RoleNames } from '../../Configuration'
import { securityId } from '@loopback/security'
import { Lookups } from '../../_infrastructure/fixtures/localisation/Lookups'
import { LocalisationUtils, GlobalisationUtils } from '../../utils'
import { GeoLocationService } from '../geolocation/GeoLocationService'
import { NotificationService } from '../notification/NotificationService'
import { lookup } from 'dns/promises'
const crypto = require('crypto')
const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()


@injectable({ tags: { key: SuperBindings.UserServiceBindingKey.key } })
export class UserService extends SuperService {
	constructor(
		@inject(LookupRepositoryService.BINDING_KEY.key)
		protected LookupRepositoryService: LookupRepositoryService,
		@inject(LookupCategoryRepositoryService.BINDING_KEY.key)
		protected LookupCategoryRepositoryService: LookupCategoryRepositoryService,
		@inject(UserRepositoryService.BINDING_KEY.key)
		protected UserRepositoryService: UserRepositoryService,
		@inject(UserLogonRepositoryService.BINDING_KEY.key)
		protected UserLogonRepositoryService: UserLogonRepositoryService,
		@inject(UserPhotoRepositoryService.BINDING_KEY.key)
		protected UserPhotoRepositoryService: UserPhotoRepositoryService,
		@inject(UserEmailAddressRepositoryService.BINDING_KEY.key)
		protected UserEmailAddressRepositoryService: UserEmailAddressRepositoryService,
		@inject(UserWebLinkRepositoryService.BINDING_KEY.key)
		protected UserWebLinkRepositoryService: UserWebLinkRepositoryService,
		@inject(UserDisplaySettingsRepositoryService.BINDING_KEY.key)
		protected UserDisplaySettingsRepositoryService: UserDisplaySettingsRepositoryService,
		@inject(UserCommunicationPreferencesRepositoryService.BINDING_KEY.key)
		protected UserCommunicationPreferencesRepositoryService: UserCommunicationPreferencesRepositoryService,
		@inject(GroupRepositoryService.BINDING_KEY.key)
		protected GroupRepositoryService: GroupRepositoryService,
		@inject(RoleRepositoryService.BINDING_KEY.key)
		protected RoleRepositoryService: RoleRepositoryService,
		@inject(GroupNotificationRepositoryService.BINDING_KEY)
		protected GroupNotificationRepositoryService: GroupNotificationRepositoryService,
		@inject(UserGroupRepositoryService.BINDING_KEY.key)
		protected UserGroupRepositoryService: UserGroupRepositoryService,
		@inject(UserGroupRoleRepositoryService.BINDING_KEY.key)
		protected UserGroupRoleRepositoryService: UserGroupRoleRepositoryService,
		@inject(UserNameRepositoryService.BINDING_KEY.key)
		protected UserNameRepositoryService: UserNameRepositoryService,
		@inject(UserPhoneNumberRepositoryService.BINDING_KEY.key)
		protected UserPhoneNumberRepositoryService: UserPhoneNumberRepositoryService,
		@inject(UserPasswordRepositoryService.BINDING_KEY)
		protected UserPasswordRepositoryService: UserPasswordRepositoryService,
		@inject(UserNotificationRepositoryService.BINDING_KEY)
		protected UserNotificationRepositoryService: UserNotificationRepositoryService,
		@inject(SuperBindings.LookupServiceBindingKey.key)
		protected LookupService: LookupService,
		@inject(UserLoginRepositoryService.BINDING_KEY.key)
		protected UserLoginRepositoryService: UserLoginRepositoryService,
		@inject(GeoLocationService.BINDING_KEY.key)
		protected GeoLocationService: GeoLocationService,
		@inject(NotificationService.BINDING_KEY.key)
		protected NotificationService: NotificationService
	) {
		super()
	}

	/**
	 * Create a user
	 * @returns The new created user
	 */
	public async CreateUser(user: Partial<IUser>): Promise<IUser> {
		return new Promise<IUser>(async (resolve, reject) => {
			try {
				// eslint-disable-next-line
				const _user = await this.UserRepositoryService.Create(user)
				if (!_user) {
					throw '422[$]Unable to create User'
				}
				return resolve(_user!)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Get a user	 
	 * @returns The found user
	 */
	public async GetUser(user: Partial<IUser>): Promise<IUser> {
		return new Promise<IUser>(async (resolve, reject) => {
			try {
				// eslint-disable-next-line
				const _user = await this.UserRepositoryService.FindOne({ where: { Id: user.Id } })
				if (!_user) {
					throw '404[$]User not found'
				}
				return resolve(_user!)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Add a new registered user To default GroupRoles
	 * */
	public async AddRegisteredUserToDefaultGroupRoles(user: Partial<IUser>): Promise<[IUserGroup[], IUserGroupRole[]]> {
		return new Promise<[IUserGroup[], IUserGroupRole[]]>(async (resolve, reject) => {
			try {
				const groupNamesToAddTo: GroupNames = this.Configuration!.authorization!.DefaultGroups!
				const roleNamesToAddTo: RoleNames = this.Configuration!.authorization!.DefaultRoles!
				const rootUserId = this.Configuration.rootUser.id
				const groupsToAddTo = await this.GroupRepositoryService.Find({ where: { Name: { inq: groupNamesToAddTo as string[] } } })
				const rolesToAddTo = await this.RoleRepositoryService.Find({ where: { Name: { inq: roleNamesToAddTo as string[] } } })

				const userGroups: UserGroupModel[] = []
				groupsToAddTo.forEach(group => {
					userGroups.push(new UserGroupModel({ UserId: user.Id, GroupId: group.Id, CreatedById: rootUserId, UpdatedById: rootUserId }))
				})
				const userGroupCreated = await this.UserGroupRepositoryService.CreateAll(userGroups)

				const userGroupRoles: UserGroupRoleModel[] = []
				userGroupCreated?.forEach(userGroup => {
					rolesToAddTo?.forEach(role => {
						userGroupRoles.push(
							new UserGroupRoleModel({
								RoleId: role.Id,
								UserGroupId: userGroup.Id,
								CreatedById: rootUserId,
								UpdatedById: rootUserId
							})
						)
					})
				})

				const userGroupRolesCreated = await this.UserGroupRoleRepositoryService.createAll(userGroupRoles)
				return resolve([userGroupCreated, userGroupRolesCreated])
			} catch (e) {
				return reject(`666[$]User must belong to default groups and default roles within those groups`);
			}
		})
	}

	/**
	 * Create a user profile
	 * @returns The new created user
	 */
	public async CreateUserRecords(context: {
		languageLookup: ILookup,
		userPassword?: IUserPassword,
		userLogon?: IUserLogon,
		userName?: IUserName,
		userEmailAddresses?: IUserEmailAddress[],
		userPhotos?: IUserPhoto[]
	}): Promise<UserModel> {
		return new Promise<UserModel>(async (resolve, reject) => {
			try {
				let user = await this.UserRepositoryService.create(
					new UserModel({
						CreatedById: this.Configuration.rootUser.id,
						UpdatedById: this.Configuration.rootUser.id
					})
				)
				if (!user) {
					throw `422[$]Unable to create a user record`
				}

				const themeLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.ThemesCategoryName)
				const themeLookup = await this.LookupService.GetLookupByValue(themeLookupCategory, lookups.Themes.Neutral.Value)

				const userDisplaySettings = await this.UserDisplaySettingsRepositoryService.Create({
					UserId: user.Id,
					DisableAnimations: false,
					IsOnLowSpeedConnection: false,
					ShowBackgroundVideo: true,
					LanguageId: context.languageLookup.Id,
					ThemeId: themeLookup.Id,
					CreatedById: user.CreatedById,
					UpdatedById: user.UpdatedById
				})
				if (!userDisplaySettings) {
					throw `422[$]Unable to create a user display settings for user with id ${user.Id}`
				}

				const userCommunicationPreferences = await this.UserCommunicationPreferencesRepositoryService.Create({
					UserId: user.Id,
					UseInApp: true,
					UseEmail: true,
					UseSMS: true,
					UseWhatsApp: false,
					UseIMessage: false,
					CreatedById: user.CreatedById,
					UpdatedById: user.UpdatedById
				})
				if (!userDisplaySettings) {
					throw `422[$]Unable to create a user display settings for user with id ${user.Id}`
				}


				await this.AddRegisteredUserToDefaultGroupRoles(user)

				if (context.userPassword) {
					const userPassword = await this.UserPasswordRepositoryService.Create({
						CreatedById: this.Configuration.rootUser.id,
						UpdatedById: this.Configuration.rootUser.id,
						UserId: user.Id,
						PasswordHash: context.userPassword.PasswordHash,
						PasswordSalt: context.userPassword.PasswordSalt,
						PasswordStrength: context.userPassword.PasswordStrength,
						FailedAttempts: context.userPassword.FailedAttempts
					})
					if (!userPassword) {
						throw `422[$]Unable to create a user password for user with id ${user.Id}`
					}
				}

				if (context.userLogon) {
					const userLogon = await this.UserLogonRepositoryService.create(
						new UserLogonModel({
							UserId: user!.Id,
							ProviderId: context.userLogon.ProviderId,
							ProviderUserId: context.userLogon.ProviderUserId,
							ProviderUserName: context.userLogon.ProviderUserName,
							CreatedById: this.Configuration.rootUser.id,
							UpdatedById: this.Configuration.rootUser.id
						})
					)
					if (!userLogon) {
						throw `422[$]Unable to create a user logon for user with id ${user.Id}`
					}
				}

				if (context.userName) {
					const userName = await this.UserNameRepositoryService.create(
						new UserNameModel({
							UserId: user!.Id,
							DisplayName: context.userName?.DisplayName,
							FirstName: context.userName?.FirstName,
							MiddleName: context.userName?.MiddleName,
							LastName: context.userName?.LastName,
							CreatedById: this.Configuration.rootUser.id,
							UpdatedById: this.Configuration.rootUser.id
						})
					)
					if (!userName) {
						throw `422[$]Unable to create a user name for user with id ${user.Id}`
					}
				}

				if (context.userEmailAddresses && context.userEmailAddresses?.length > 0) {
					const userEmailAddressList: UserEmailAddressModel[] = []
					context.userEmailAddresses?.forEach(email => {
						userEmailAddressList.push(
							new UserEmailAddressModel({
								UserId: user!.Id,
								EmailAddress: email.EmailAddress,
								EmailAddressTypeId: email.EmailAddressTypeId,
								CreatedById: this.Configuration.rootUser.id,
								UpdatedById: this.Configuration.rootUser.id
							})
						)
					})
					await this.UserEmailAddressRepositoryService.createAll(userEmailAddressList)
				}

				if (context.userPhotos && context.userPhotos?.length > 0) {
					const userPhotoList: UserPhotoModel[] = []
					context.userPhotos?.forEach(photo => {
						userPhotoList.push(
							new UserPhotoModel({
								UserId: user!.Id,
								URL: photo.URL,
								PhotoTypeId: photo.PhotoTypeId,
								CreatedById: this.Configuration.rootUser.id,
								UpdatedById: this.Configuration.rootUser.id
							})
						)
					})
					await this.UserPhotoRepositoryService.createAll(userPhotoList)
				}
				user![securityId] = '' + user!.Id
				return resolve(user!)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Get a user's' details.	 	 
	 */
	public async GetUserResponse(user: Partial<IUser>): Promise<UserResponse> {
		return new Promise<UserResponse>(async (resolve, reject) => {
			try {								
				const userResponse = new UserResponse()
				userResponse.UserId = user.Id!
				userResponse.IsAuthenticated = true
				userResponse.UserName = await this.UserNameRepositoryService.FindOne({ where: { UserId: user.Id } })
				userResponse.UserDisplaySettings = await this.UserDisplaySettingsRepositoryService.FindOne({ where: { UserId: user.Id } })
				userResponse.UserCommunicationPreferences = await this.UserCommunicationPreferencesRepositoryService.FindOne({ where: { UserId: user.Id } })
				userResponse.UserLanguage = (await this.LookupService.GetLanguages(new LookupCategoryRequest()))?.find(p => p.Id == userResponse.UserDisplaySettings?.LanguageId)!
				userResponse.UserEmailAddresses = await this.UserEmailAddressRepositoryService.Find({ where: { UserId: user.Id } })
				userResponse.UserPhoneNumbers = await this.UserPhoneNumberRepositoryService.Find({ where: { UserId: user.Id } })
				userResponse.UserPhotos = await this.UserPhotoRepositoryService.Find({ where: { UserId: user.Id } })
				userResponse.UserWebLinks = await this.UserWebLinkRepositoryService.Find({ where: { UserId: user.Id } })
				userResponse.UserLogons = await this.UserLogonRepositoryService.Find({ where: { UserId: user.Id } })
				userResponse.UserLogins = await this.UserLoginRepositoryService.Find({ where: { UserId: user.Id }, order: [`Id DESC`], limit: 200 })
				userResponse.UserGroupAndRoles = await this.GetUserGroupsAndRoles(user)
				//user notification
				//TODO://limit to 2000 most recent
				const localeLookups: Lookups = LocalisationUtils.GetLocalisedLookups(userResponse.UserLanguage.Value, 'web')
				userResponse.UserNotifications = await this.UserNotificationRepositoryService.Find({ where: { UserId: user.Id }, order: [`Id DESC`], limit: 200 })
				//strip out information meant for email, sms or skype exclusively in Welcome, VerifyEmailAddress and VerifyPhoneNumber notifications				
				const notificationStrategyCategory = await this.LookupService.GetLookupCategoryByValue(lookups.NotificationStrategies.Value)
				const emailStrategy = notificationStrategyCategory.Lookups?.find(p => p.Value == lookups.NotificationStrategies.Email.Value)
				const smsStrategy = notificationStrategyCategory.Lookups?.find(p => p.Value == lookups.NotificationStrategies.SMS.Value)
				userResponse.UserNotifications.filter(p1 => p1.NotificationStrategyId == emailStrategy?.Id || p1.NotificationStrategyId == smsStrategy?.Id).forEach(p2 => {
					if (p2.Message.indexOf(`data-decode-href1="#"`)) {						
						let taglen = `data-decode-href1="#"`.length
						let start = p2.Message.indexOf(`data-decode-href1="#"`)
						let end = p2.Message.indexOf(`data-decode-href2="#"`)
						p2.Message = p2.Message.substring(0, start + taglen) + ` href='#' title=${localeLookups.Messages.SensitiveDataStrippedOutForSecurityReasons} ` + p2.Message.substring(end)					
						p2.Message = p2.Message.replace(`data-decode-href1="#"`, '' )
						p2.Message = p2.Message.replace(`data-decode-href2="#"`, '' )
					}
					if (p2.Message.indexOf(`data-decode-link1="#"`)) {						
						let taglen = `data-decode-link1="#"`.length
						let start = p2.Message.indexOf(`data-decode-link1="#"`)
						let end = p2.Message.indexOf(`data-decode-link2="#"`)
						p2.Message = p2.Message.substring(0, start + taglen) + `####` + p2.Message.substring(end)					
						p2.Message = p2.Message.replace(`data-decode-link1="#"`, '' )
						p2.Message = p2.Message.replace(`data-decode-link2="#"`, '' )
					}					
				})

				//user groups notification
				//TODO://limit to 2000 most recent
				let userGroupNotifications: GroupNotificationModel[] = []
				const userGroups = await this.UserGroupRepositoryService.Find({ where: { UserId: user.Id } })
				userGroups.forEach(async userGroup => {
					const userGroupNotifications = await this.GroupNotificationRepositoryService.Find({ where: { GroupId: userGroup.GroupId }, order: [`Id DESC`], limit: 200 })
					userGroupNotifications.forEach(ugn => userGroupNotifications.push(ugn))
				})
				userResponse.UserGroupNotifications = userGroupNotifications

				//theme
				let theme = ''
				if (userResponse.UserDisplaySettings?.ThemeId) {
					const req = new LookupRequest({ LookupId: userResponse.UserDisplaySettings?.ThemeId, Locale: 'en', Device: 'web' })
					const themeLookup = await this.LookupService.GetLookupById(req)
					theme = themeLookup.Value
				} else {
					theme = 'red'
				}
				userResponse.Theme = theme

				return resolve(userResponse)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	public async PrepareUserResponseForHumans(userResponse: UserResponse): Promise<UserResponse> {
		return new Promise<UserResponse>(async (resolve, reject) => {
			try {				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(userResponse.UserLanguage.Value);
				(userResponse.UserDisplaySettings as any)["IsOnLowSpeedConnectionText"] = userResponse.UserDisplaySettings?.IsOnLowSpeedConnection ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No;
				(userResponse.UserDisplaySettings as any)["DisableAnimationsText"] = userResponse.UserDisplaySettings?.DisableAnimations ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No;
				(userResponse.UserDisplaySettings as any)["ShowBackgroundVideoText"] = userResponse.UserDisplaySettings?.ShowBackgroundVideo ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No;

				(userResponse.UserCommunicationPreferences as any)["UseWhatsAppText"] = userResponse.UserCommunicationPreferences?.UseWhatsApp ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No;
				(userResponse.UserCommunicationPreferences as any)["UseInAppText"] = userResponse.UserCommunicationPreferences?.UseInApp ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No;
				(userResponse.UserCommunicationPreferences as any)["UseEmailText"] = userResponse.UserCommunicationPreferences?.UseEmail ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No;
				(userResponse.UserCommunicationPreferences as any)["UseIMessageText"] = userResponse.UserCommunicationPreferences?.UseIMessage ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No;
				(userResponse.UserCommunicationPreferences as any)["UseSMSText"] = userResponse.UserCommunicationPreferences?.UseSMS ? lookups.WhoAmICopy.Yes : lookups.WhoAmICopy.No


				const allLookups = await this.LookupService.GetLookups(new LookupRequest({ Locale: userResponse.UserLanguage.Value }))
				if (!userResponse) return userResponse
				userResponse.UserEmailAddresses.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/ && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				userResponse.UserPhoneNumbers.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				userResponse.UserPhotos.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				userResponse.UserWebLinks.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				userResponse.UserLogons.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				userResponse.UserLogins.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				userResponse.UserNotifications.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				userResponse.UserGroupNotifications.forEach((item: any) => {
					for (const property of Object.keys(item)) {
						if (property.endsWith(`On`)) {
							item[property] = new Date(Date.parse(item[property]))
						}
						if (property.length > 2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`) && property.endsWith(`Id`)) {
							const id = item[property]
							const lookup = allLookups.find(p => p.Id == id);
							const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
							item[newPropertyName] = lookup?.Name
						}
					}
				})
				//userResponse.UserGroupAndRoles.forEach((item : any) => {
				//	for (const property of Object.keys(item)) {
				//		if ( property.endsWith(`On`)){                    
				//			item[property] = new Date(Date.parse(item[property]))
				//		} 
				//		if ( property.length >2 /*`Id`.length*/ && property.toLocaleLowerCase() != 'createdbyid' && property.toLocaleLowerCase() != 'updatedbyid' /*&& property.toLocaleLowerCase() != 'providerid'*/  && !property.toLocaleLowerCase().startsWith(`user`)  && property.endsWith(`Id`)){
				//			const id = item[property]
				//			const lookup = allLookups.find( p => p.Id == id);
				//			const newPropertyName = property.slice(0, property.length - 2/*`Id`.length*/)
				//			item[newPropertyName] = lookup?.Name
				//		}
				//	}
				//}) 
				return resolve(userResponse)
			}
			catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}


	/**
	 * Get User's contact email addresses'
	 * @remarks
	 * Get a list of the email addresses through which this user could be contacted on
	 * */
	public async GetUserEmailAddresses(user: IUser): Promise<IUserEmailAddress[]> {
		return new Promise<IUserEmailAddress[]>(async (resolve, reject) => {
			try {
				const userEmailAddresses = await this.UserEmailAddressRepositoryService.Find({ where: { UserId: user.Id } })
				return resolve(userEmailAddresses)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Get User's contact phone numbers'
	 * @remarks
	 * Get a list of the phone numbers through which this user could be contacted on
	 * */
	public async GetUserPhoneNumbers(user: IUser): Promise<IUserPhoneNumber[]> {
		return new Promise<IUserPhoneNumber[]>(async (resolve, reject) => {
			try {
				const userPhoneNumbers = await this.UserPhoneNumberRepositoryService.Find({ where: { UserId: user.Id } })
				return resolve(userPhoneNumbers)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Gets the collection of the user's groups and their roles within these groups'
	 * */
	public async GetUserGroupsAndRoles(user: IUser): Promise<UserGroupAndRoleResponse[]> {
		return new Promise<UserGroupAndRoleResponse[]>(async (resolve, reject) => {
			try {
				const groupAndRoles: UserGroupAndRoleResponse[] = []
				// eslint-disable-next-line
				const _userGroupIds: ModelIdType[] = []
				const userGroups: IUserGroupWithRelations[] = await this.UserGroupRepositoryService.Find({ where: { UserId: user.Id }, include: [{ relation: 'Group' }] })
				userGroups.forEach(userGroup => {
					_userGroupIds.push(userGroup.Id!)
				})
				const userGroupIds: ModelIdType[] = [...new Set(_userGroupIds)]
				userGroupIds.sort((a, b) => {
					if (a > b) return 1
					else if (a < b) return -1
					else return 0
				})

				const userGroupRoles: IUserGroupRoleWithRelations[] = await this.UserGroupRoleRepositoryService.Find({
					where: { UserGroupId: { inq: userGroupIds } },
					include: [{ relation: 'Role' }]
				})
				userGroupRoles.forEach(userGroupRole => {
					const userGroup = userGroups.find(p => p.Id == userGroupRole.UserGroupId)
					const userGroupAndRoleResponse = new UserGroupAndRoleResponse()
					userGroupAndRoleResponse.Group = new GroupModel(userGroup?.Group)
					userGroupAndRoleResponse.Role = new RoleModel(userGroupRole.Role)
					groupAndRoles.push(userGroupAndRoleResponse)
				})
				return resolve(groupAndRoles)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Create the user title, first name, middle name, last name and nickname, if any	 	 
	 */
	public async CreateUserName(userId: ModelIdType, userNameRequest: IUserNameRequest): Promise<UserNameModel> {
		return new Promise<UserNameModel>(async (resolve, reject) => {
			try {
				let userNametoCreate = new UserNameModel()
				userNametoCreate.UserId = userId
				userNametoCreate.CreatedById = userId
				userNametoCreate.UpdatedById = userId
				userNametoCreate.Title = userNameRequest.Title
				userNametoCreate.DisplayName = userNameRequest.DisplayName
				userNametoCreate.FirstName = userNameRequest.FirstName
				userNametoCreate.MiddleName = userNameRequest.MiddleName
				userNametoCreate.LastName = userNameRequest.LastName
				userNametoCreate.NickName = userNameRequest.NickName
				const userNameCreated = await this.UserNameRepositoryService.Create(userNametoCreate)
				return resolve(userNameCreated!)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Update the user title, first name, middle name, last name and nickname, if any	 
	 */
	public async UpdateUserName(id: ModelIdType, userId: ModelIdType, userNameRequest: IUserNameRequest): Promise<UserNameModel> {
		return new Promise<UserNameModel>(async (resolve, reject) => {
			try {
				let userNameToUpdate = await this.UserNameRepositoryService.findOne({ where: { Id: id, UserId: userId } })
				userNameToUpdate!.UpdatedById = userId
				//userNameToUpdate!.UpdatedOn = new Date(Date.now())
				userNameToUpdate!.Title = userNameRequest.Title
				userNameToUpdate!.DisplayName = userNameRequest.DisplayName
				userNameToUpdate!.FirstName = userNameRequest.FirstName
				userNameToUpdate!.MiddleName = userNameRequest.MiddleName
				userNameToUpdate!.LastName = userNameRequest.LastName
				userNameToUpdate!.NickName = userNameRequest.NickName
				await this.UserNameRepositoryService.UpdateById(id, userNameToUpdate!)
				const userNameUpdated = await this.UserNameRepositoryService.findOne({ where: { Id: id, UserId: userId } })
				return resolve(userNameUpdated!)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Update the user's display settings	 
	 */
	public async UpdateUserDisplaySettings(id: ModelIdType, userId: ModelIdType, userDisplaySettingsRequest: IUserDisplaySettingsRequest): Promise<UserDisplaySettingsModel> {
		return new Promise<UserDisplaySettingsModel>(async (resolve, reject) => {
			try {
				let existingRec = await this.UserDisplaySettingsRepositoryService.findOne({ where: { UserId: userId } })
				let recToUpdate = new UserDisplaySettingsModel(userDisplaySettingsRequest)
				recToUpdate.Id = id
				recToUpdate.UserId = userId
				recToUpdate.UpdatedById = userId
				recToUpdate.UpdatedOn = existingRec?.UpdatedOn
				recToUpdate.CreatedById = existingRec?.CreatedById
				recToUpdate.CreatedOn = existingRec?.CreatedOn
				await this.UserDisplaySettingsRepositoryService.Update(recToUpdate)
				const recUpdated = await this.UserDisplaySettingsRepositoryService.findOne({ where: { UserId: userId } })
				return resolve(recUpdated!)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Create the user's phone	 
	 * @returns the created user phone number if successful, or a rejection if not
	 */
	public async CreateUserPhoneNumber(userId: ModelIdType, userPhoneNumberRequest: IUserPhoneNumberRequest): Promise<UserPhoneNumberModel> {
		return new Promise<UserPhoneNumberModel>(async (resolve, reject) => {
			try {
				let model = new UserPhoneNumberModel({ ...userPhoneNumberRequest })
				model.UserId = userId
				model.CreatedById = userId
				model.UpdatedById = userId
				const createdPhoneNumber = await this.UserPhoneNumberRepositoryService.Create(model)
				await this.TriggerUserPhoneNumberVerification(createdPhoneNumber.Id!, userId)
				const updatedPhoneNumber = await this.UserPhoneNumberRepositoryService.FindById(createdPhoneNumber.Id!)				
				return resolve(updatedPhoneNumber!)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Verify a user's mobile phone number	 	 
	 */
	public async TriggerUserPhoneNumberVerification(id: ModelIdType, userId: ModelIdType): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {
				const verificationAttemptLimit = this.Configuration.notifications.sms.verificationAttemptLimit
				const verificationDaysLimit = this.Configuration.notifications.sms.verificationDaysLimit
				let userPhoneNumber = await this.UserPhoneNumberRepositoryService.FindById(id)
				if (userPhoneNumber.Verified) {
					return reject(`409[$]This mobile phone number is already verified`)
				}
				if (userPhoneNumber.VerificationAttempts && userPhoneNumber.VerificationAttempts > verificationAttemptLimit) {
					return reject(`403[$]Attempts have been made to verify this mobile phone number past a number of times(${verificationAttemptLimit} times) deemed reasonable. This mobile phone number is now blocked. Please contact support`)
				}
				userPhoneNumber.VerificationAttempts = 0

				if (userPhoneNumber.VerificationRequestedOn && GlobalisationUtils.CalcDatesDiffInDays(new Date(), userPhoneNumber.VerificationRequestedOn) > verificationDaysLimit) {
					return reject(`403[$]An Attempt have been made to verify this mobile phone number past a number of days(${verificationAttemptLimit} days) deemed reasonable. Please start mobile phone number verification again`)
				}
				userPhoneNumber.VerificationRequestedOn = new Date()
				userPhoneNumber.VerificationToken = IdentityUtility.NewGUIdString()
				userPhoneNumber.Verified = false
				userPhoneNumber.UpdatedById = userId
				userPhoneNumber.UpdatedOn = new Date()
				await this.UserPhoneNumberRepositoryService.ReplaceById(id, userPhoneNumber)
				return resolve(lookups.NotificationStatus.Succeeded.Name)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Generate a user's phone number verification token and trigger the notification	 
	 */
	public async VerifyUserPhoneNumber(id: ModelIdType, userId: ModelIdType, verificationToken: string): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {
				const userDisplaySettings = await this.UserDisplaySettingsRepositoryService.FindOne({ where: { UserId: userId } })				
				const userLanguage = (await this.LookupService.GetLanguages(new LookupCategoryRequest()))?.find(p => p.Id == userDisplaySettings?.LanguageId)!
				const localeLookups: Lookups = LocalisationUtils.GetLocalisedLookups(userLanguage.Value)

				const verificationAttemptLimit = this.Configuration.notifications.sms.verificationAttemptLimit
				const verificationDaysLimit = this.Configuration.notifications.sms.verificationDaysLimit
				let userPhoneNumber = await this.UserPhoneNumberRepositoryService.FindById(id)
				if (userPhoneNumber.Verified) {					
					return reject(`409[$]${localeLookups.Messages.YourPhoneNumberHasAlreadyBeenVerified}`)
				}
				if (userPhoneNumber.VerificationAttempts && userPhoneNumber.VerificationAttempts > verificationAttemptLimit) {
					return reject(`403[$]${StringUtility.StringFormat( localeLookups.MessagesPhoneVerificationAttemptsLimitReached, verificationAttemptLimit.toString())}`)					
				}
				userPhoneNumber.VerificationAttempts = (userPhoneNumber.VerificationAttempts ?? 0) + 1

				if (userPhoneNumber.VerificationRequestedOn && GlobalisationUtils.CalcDatesDiffInDays(new Date(), userPhoneNumber.VerificationRequestedOn) > verificationDaysLimit) {
					return reject(`403[$]${StringUtility.StringFormat( localeLookups.Messages.PhoneNumberVerificationTimeLimitReached, verificationDaysLimit.toString())}`)
				}
				if (!verificationToken ) {					
					return reject(`418[$]${localeLookups.Messages.EmptyVerificationToken}`)
				}	
				if (verificationToken.trim().length == 0) {					
					return reject(`418[$]${localeLookups.Messages.BlankVerificationToken}`)
				}				
				if (userPhoneNumber.VerificationToken?.toLocaleLowerCase() !== verificationToken.toLocaleLowerCase()) {
					return reject(`418[$]${localeLookups.Messages.InvalidVerificationToken}`)
				}											
				if (userPhoneNumber.VerificationToken !== verificationToken) {
					return reject(`422[$]${localeLookups.Messages.MismatchedVerificationToken}`)
				}
				userPhoneNumber.Verified = true
				userPhoneNumber.UpdatedById = userId
				userPhoneNumber.UpdatedOn = new Date()
				await this.UserPhoneNumberRepositoryService.ReplaceById(id, userPhoneNumber)
				this.NotificationService.ThankYouForVerifyingYourPhoneNumberNotification(new UserModel({ Id: userId }), userPhoneNumber)
				return resolve(lookups.NotificationStatus.Acknowledged.Name)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Delete the user's phone	 
	 */
	public async DeleteUserPhoneNumber(id: ModelIdType): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				await this.UserPhoneNumberRepositoryService.DeleteById(id)
				return resolve()
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Create a user's email address
	 */
	public async CreateUserEmailAddress(userId: ModelIdType, userEmailAddressRequest: IUserEmailAddressRequest): Promise<UserEmailAddressModel> {
		return new Promise<UserEmailAddressModel>(async (resolve, reject) => {
			try {
				let model = new UserEmailAddressModel({ ...userEmailAddressRequest })
				model.UserId = userId
				model.CreatedById = userId
				model.UpdatedById = userId
				const createdEmailAddress = await this.UserEmailAddressRepositoryService.Create(model)
				await this.TriggerUserEmailAddressVerification(createdEmailAddress.Id!, userId)				
				const updatedEmailAddress = await this.UserEmailAddressRepositoryService.FindById(createdEmailAddress.Id!)				
				return resolve(updatedEmailAddress!)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Verify a user's email address
	 */
	public async TriggerUserEmailAddressVerification(id: ModelIdType, userId: ModelIdType): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {
				const verificationAttemptLimit = this.Configuration.notifications.sms.verificationAttemptLimit
				const verificationDaysLimit = this.Configuration.notifications.sms.verificationDaysLimit
				let userEmailAddress = await this.UserEmailAddressRepositoryService.FindById(id)
				if (userEmailAddress.Verified) {
					return reject(`409[$]This email address is already verified`)
				}
				if (userEmailAddress.VerificationAttempts && userEmailAddress.VerificationAttempts > verificationAttemptLimit) {
					return reject(`403[$]Attempts have been made to verify this email past a number of times(${verificationAttemptLimit} times) deemed reasonable. This email address is now blocked. Please contact support`)
				}
				userEmailAddress.VerificationAttempts = 0

				if (userEmailAddress.VerificationRequestedOn && GlobalisationUtils.CalcDatesDiffInDays(new Date(), userEmailAddress.VerificationRequestedOn) > verificationDaysLimit) {
					return reject(`403[$]An Attempt have been made to verify this email address past a number of days(${verificationAttemptLimit} days) deemed reasonable. Please start email address verification again`)
				}
				userEmailAddress.VerificationRequestedOn = new Date()
				userEmailAddress.VerificationToken = IdentityUtility.NewGUIdString()
				userEmailAddress.Verified = false
				userEmailAddress.UpdatedById = userId
				userEmailAddress.UpdatedOn = new Date()
				await this.UserEmailAddressRepositoryService.ReplaceById(id, userEmailAddress)
				return resolve(lookups.NotificationStatus.Succeeded.Name)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Verify a user's email address
	 */
	public async VerifyUserEmailAddress(id: ModelIdType, userId: ModelIdType, verificationToken: string): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {
				const userDisplaySettings = await this.UserDisplaySettingsRepositoryService.FindOne({ where: { UserId: userId } })				
				const userLanguage = (await this.LookupService.GetLanguages(new LookupCategoryRequest()))?.find(p => p.Id == userDisplaySettings?.LanguageId)!
				const localeLookups: Lookups = LocalisationUtils.GetLocalisedLookups(userLanguage.Value)

				const verificationAttemptLimit = this.Configuration.notifications.email.verificationAttemptLimit
				const verificationDaysLimit = this.Configuration.notifications.email.verificationDaysLimit
				let userEmailAddress = await this.UserEmailAddressRepositoryService.FindById(id)
				if (userEmailAddress.Verified) {
					return reject(`409[$]${localeLookups.Messages.YourEmailAddressHasAlreadyBeenVerified}`)
				}
				if (userEmailAddress.VerificationAttempts && userEmailAddress.VerificationAttempts > verificationAttemptLimit) {					
					return reject(`403[$]${StringUtility.StringFormat( localeLookups.Messages.EmailAddressVerificationAttemptsLimitReached, verificationAttemptLimit.toString())}`)					
				}
				userEmailAddress.VerificationAttempts = (userEmailAddress.VerificationAttempts ?? 0) + 1

				if (userEmailAddress.VerificationRequestedOn && GlobalisationUtils.CalcDatesDiffInDays(new Date(), userEmailAddress.VerificationRequestedOn) > verificationDaysLimit) {					
					return reject(`403[$]${StringUtility.StringFormat( localeLookups.Messages.EmailAddressVerificationTimeLimitReached, verificationDaysLimit.toString())}`)
				}
				if (!verificationToken) {					
					return reject(`418[$]${localeLookups.Messages.EmptyVerificationToken}`)
				}
				if (verificationToken.trim().length == 0) {					
					return reject(`418[$]${localeLookups.Messages.BlankVerificationToken}`)
				}
				if (userEmailAddress.VerificationToken?.toLocaleLowerCase() !== verificationToken.toLocaleLowerCase()) {					
					return reject(`418[$]${localeLookups.Messages.InvalidVerificationToken}`)
				}
				if (userEmailAddress.VerificationToken !== verificationToken) {					
					return reject(`422[$]${localeLookups.Messages.MismatchedVerificationToken}`)
				}

				userEmailAddress.Verified = true
				userEmailAddress.UpdatedById = userId
				userEmailAddress.UpdatedOn = new Date()
				await this.UserEmailAddressRepositoryService.ReplaceById(id, userEmailAddress)
				this.NotificationService.ThankYouForVerifyingYourEmailAddressNotification(new UserModel({ Id: userId }), userEmailAddress)
				return resolve(lookups.NotificationStatus.Succeeded.Name)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Delete a user's email address
	 */
	public async DeleteUserEmailAddress(id: ModelIdType): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				await this.UserEmailAddressRepositoryService.DeleteById(id)
				return resolve()
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}


	/**
	 * Update the user's communication preferences
	 */
	public async UpdateUserCommunicationPreferences(id: ModelIdType, userId: ModelIdType, userCommunicationPreferences: IUserCommunicationPreferencesRequest): Promise<UserCommunicationPreferencesModel> {
		return new Promise<UserCommunicationPreferencesModel>(async (resolve, reject) => {
			try {
				const existingRec = await this.UserCommunicationPreferencesRepositoryService.FindOne({ where: { UserId: userId } })
				let recToUpdate = new UserCommunicationPreferencesModel(userCommunicationPreferences)
				recToUpdate.Id = id
				recToUpdate.UserId = userId
				recToUpdate!.UpdatedById = userId
				recToUpdate.UpdatedOn = existingRec?.UpdatedOn
				recToUpdate.CreatedById = existingRec?.CreatedById
				recToUpdate.CreatedOn = existingRec?.CreatedOn
				await this.UserCommunicationPreferencesRepositoryService.Update(recToUpdate!)
				const recUpdated = await this.UserCommunicationPreferencesRepositoryService.FindOne({ where: { UserId: userId } })
				return resolve(recUpdated!)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Get the user notifications	 
	 */
	public async GetUserNotifications(userId: ModelIdType, notificationRequest: INotificationRequest): Promise<UserNotificationModel[] | null> {
		return new Promise<UserNotificationModel[] | null>(async (resolve, reject) => {
			try {
				if (notificationRequest.NotificationStrategyValue) {
					const notificationStrategyCategory = await this.LookupService.GetLookupCategoryByValue(lookups.NotificationStrategies.Value)
					if (!notificationStrategyCategory) {
						return reject(`666[$]Was unable to find a '${lookups.NotificationStrategies.Name}' Lookup Category`)
					}
					const notificationStrategy = await this.LookupService.GetLookupByValue(notificationStrategyCategory, notificationRequest.NotificationStrategyValue)
					notificationRequest.NotificationStrategyId = notificationStrategy.Id
				}
				let and: Where<UserNotificationModel>[] = []
				and.push({ UserId: userId })
				if (notificationRequest.FromDate && !notificationRequest.ToDate) {
					and.push({ CreatedOn: { gte: notificationRequest.FromDate } })
				}
				if (!notificationRequest.FromDate && notificationRequest.ToDate) {
					and.push({ CreatedOn: { lte: notificationRequest.ToDate } })
				}
				if (notificationRequest.FromDate && notificationRequest.ToDate) {
					and.push({ CreatedOn: { between: [notificationRequest.FromDate, notificationRequest.ToDate] } })
				}
				if (notificationRequest.FromId && !notificationRequest.ToId) {
					and.push({ Id: { gte: notificationRequest.FromId } })
				}
				if (!notificationRequest.FromId && notificationRequest.ToId) {
					and.push({ Id: { lte: notificationRequest.ToId } })
				}
				if (notificationRequest.FromId && notificationRequest.ToId) {
					and.push({ UserId: { between: [notificationRequest.FromId, notificationRequest.ToId] } })
				}
				if (notificationRequest.NotificationStrategyId) {
					and.push({ NotificationStrategyId: notificationRequest.NotificationStrategyId })
				}
				if (notificationRequest.NotificationStatusId) {
					and.push({ NotificationStatusId: notificationRequest.NotificationStatusId })
				}
				if (notificationRequest.ImportanceId) {
					and.push({ ImportanceId: notificationRequest.ImportanceId })
				}
				if (notificationRequest.SearchPhrase && notificationRequest.SearchPhrase.trim()) {
					and.push({
						or: [
							{ Message: { like: `%${notificationRequest.SearchPhrase}%` } },
							{ Subject: { like: `%${notificationRequest.SearchPhrase}%` } }
						]
					})
				}
				let filter: Filter<UserNotificationModel> = { where: { and } }
				if (notificationRequest.Skip) {
					filter.skip = notificationRequest.Skip
				}
				if (notificationRequest.Limit) {
					filter.limit = notificationRequest.Limit
				}
				const recs = this.UserNotificationRepositoryService.Find(filter)
				return resolve(recs)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Update a user notification's status	 
	 */
	public async UpdateUserNotification(userId: ModelIdType, id: ModelIdType, notificationStatusUpdateRequest: INotificationStatusUpdateRequest): Promise<UserNotificationModel | null> {
		return new Promise<UserNotificationModel | null>(async (resolve, reject) => {
			try {
				const rec = await this.UserNotificationRepositoryService.FindById(id)
				rec.UpdatedById = userId
				rec.UpdatedOn = new Date()
				rec.NotificationStatusId = notificationStatusUpdateRequest.NotificationStatusId!
				await this.UserNotificationRepositoryService.UpdateById(id, rec)
				const recUpdated = await this.UserNotificationRepositoryService.FindById(id)
				return resolve(recUpdated)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Get the user's group notifications	 
	*/
	public async GetUserGroupNotifications(userId: ModelIdType, groupId: ModelIdType, notificationRequest: INotificationRequest)
		: Promise<GroupNotificationModel[] | null> {
		return new Promise<GroupNotificationModel[] | null>(async (resolve, reject) => {
			try {
				if (notificationRequest.NotificationStrategyValue) {
					const notificationStrategyCategory = await this.LookupService.GetLookupCategoryByValue(lookups.NotificationStrategies.Value)
					if (!notificationStrategyCategory) {
						return reject(`666[$]Was unable to find a '${lookups.NotificationStrategies.Name}' Lookup Category`)
					}
					const notificationStrategy = await this.LookupService.GetLookupByValue(notificationStrategyCategory, notificationRequest.NotificationStrategyValue)
					notificationRequest.NotificationStrategyId = notificationStrategy.Id
				}
				let and: Where<GroupNotificationModel>[] = []
				and.push({ GroupId: groupId })
				if (notificationRequest.FromDate && !notificationRequest.ToDate) {
					and.push({ CreatedOn: { gte: notificationRequest.FromDate } })
				}
				if (!notificationRequest.FromDate && notificationRequest.ToDate) {
					and.push({ CreatedOn: { lte: notificationRequest.ToDate } })
				}
				if (notificationRequest.FromDate && notificationRequest.ToDate) {
					and.push({ CreatedOn: { between: [notificationRequest.FromDate, notificationRequest.ToDate] } })
				}
				if (notificationRequest.FromId && !notificationRequest.ToId) {
					and.push({ Id: { gte: notificationRequest.FromId } })
				}
				if (!notificationRequest.FromId && notificationRequest.ToId) {
					and.push({ Id: { lte: notificationRequest.ToId } })
				}
				if (notificationRequest.FromId && notificationRequest.ToId) {
					and.push({ Id: { between: [notificationRequest.FromId, notificationRequest.ToId] } })
				}
				if (notificationRequest.NotificationStrategyId) {
					and.push({ NotificationStrategyId: notificationRequest.NotificationStrategyId })
				}
				if (notificationRequest.NotificationStatusId) {
					and.push({ NotificationStatusId: notificationRequest.NotificationStatusId })
				}
				if (notificationRequest.ImportanceId) {
					and.push({ ImportanceId: notificationRequest.ImportanceId })
				}
				if (notificationRequest.SearchPhrase && notificationRequest.SearchPhrase.trim()) {
					and.push({
						or: [
							{ Message: { like: `%${notificationRequest.SearchPhrase}%` } },
							{ Subject: { like: `%${notificationRequest.SearchPhrase}%` } }
						]
					})
				}
				let filter: Filter<GroupNotificationModel> = { where: { and } }
				if (notificationRequest.Skip) {
					filter.skip = notificationRequest.Skip
				}
				if (notificationRequest.Limit) {
					filter.limit = notificationRequest.Limit
				}
				const isInGroup = this.UserGroupRepositoryService.FindOne({ where: { UserId: userId, GroupId: groupId } }) != null
				if (!isInGroup) {
					throw `403[$]User is not within the group and hence not allowed to receive notifications meant for this group`
				}
				const recs = this.GroupNotificationRepositoryService.Find(filter)
				return resolve(recs)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}


	/**
	 * Get the user's user groups notifications	 
	*/
	public async GetUserGroupsNotifications(userId: ModelIdType, notificationRequest: INotificationRequest)
		: Promise<GroupNotificationModel[] | null> {
		return new Promise<GroupNotificationModel[] | null>(async (resolve, reject) => {
			try {
				if (notificationRequest.NotificationStrategyValue) {
					const notificationStrategyCategory = await this.LookupService.GetLookupCategoryByValue(lookups.NotificationStrategies.Value)
					if (!notificationStrategyCategory) {
						return reject(`666[$]Was unable to find a '${lookups.NotificationStrategies.Name}' Lookup Category`)
					}
					const notificationStrategy = await this.LookupService.GetLookupByValue(notificationStrategyCategory, notificationRequest.NotificationStrategyValue)
					notificationRequest.NotificationStrategyId = notificationStrategy.Id
				}
				let and: Where<GroupNotificationModel>[] = []
				if (notificationRequest.FromDate && !notificationRequest.ToDate) {
					and.push({ CreatedOn: { gte: notificationRequest.FromDate } })
				}
				if (!notificationRequest.FromDate && notificationRequest.ToDate) {
					and.push({ CreatedOn: { lte: notificationRequest.ToDate } })
				}
				if (notificationRequest.FromDate && notificationRequest.ToDate) {
					and.push({ CreatedOn: { between: [notificationRequest.FromDate, notificationRequest.ToDate] } })
				}
				if (notificationRequest.FromId && !notificationRequest.ToId) {
					and.push({ Id: { gte: notificationRequest.FromId } })
				}
				if (!notificationRequest.FromId && notificationRequest.ToId) {
					and.push({ Id: { lte: notificationRequest.ToId } })
				}
				if (notificationRequest.FromId && notificationRequest.ToId) {
					and.push({ Id: { between: [notificationRequest.FromId, notificationRequest.ToId] } })
				}
				if (notificationRequest.NotificationStrategyId) {
					and.push({ NotificationStrategyId: notificationRequest.NotificationStrategyId })
				}
				if (notificationRequest.NotificationStatusId) {
					and.push({ NotificationStatusId: notificationRequest.NotificationStatusId })
				}
				if (notificationRequest.ImportanceId) {
					and.push({ ImportanceId: notificationRequest.ImportanceId })
				}
				if (notificationRequest.SearchPhrase && notificationRequest.SearchPhrase.trim()) {
					and.push({
						or: [
							{ Message: { like: `%${notificationRequest.SearchPhrase}%` } },
							{ Subject: { like: `%${notificationRequest.SearchPhrase}%` } }
						]
					})
				}
				let filter: Filter<GroupNotificationModel> = { where: { and } }
				if (notificationRequest.Skip) {
					filter.skip = notificationRequest.Skip
				}
				if (notificationRequest.Limit) {
					filter.limit = notificationRequest.Limit
				}
				const recs = this.GroupNotificationRepositoryService.Find(filter)
				return resolve(recs)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}


	/**
	 * Get the user's login history
	*/
	public async GetUserLogins(
		userId: ModelIdType,
		fromDate?: Date,
		toDate?: Date,
		skip?: number,
		limit?: number
	): Promise<IUserLogin[] | null> {
		return new Promise<UserLoginModel[] | null>(async (resolve, reject) => {
			try {
				let filter: Filter<UserLoginModel> = {}
				if (fromDate && !toDate) {
					filter = { where: { and: [{ UserId: userId }, { CreatedOn: { gte: fromDate } }] } }
				} else if (!fromDate && toDate) {
					filter = { where: { and: [{ UserId: userId }, { CreatedOn: { lte: toDate } }] } }
				} else if (fromDate && toDate) {
					filter = { where: { and: [{ UserId: userId }, { CreatedOn: { between: [fromDate, toDate] } }] } }
				}
				else {
					filter = { where: { and: [{ UserId: userId }] } }
				}
				if (skip) {
					filter.skip = skip
				}
				if (limit) {
					filter.limit = limit
				}
				let recs = await this.UserLoginRepositoryService.Find(filter)
				return resolve(recs)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Get the user's login history
	*/
	public async GetUserLogin(userId: ModelIdType, id: ModelIdType): Promise<IUserLogin | null> {
		return new Promise<UserLoginModel | null>(async (resolve, reject) => {
			try {
				let rec = await this.UserLoginRepositoryService.FindOne({ where: { UserId: id, Id: id } })
				return resolve(rec)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	public async CreateUserLogin(userId: ModelIdType, request: Request): Promise<IUserLogin> {
		const deviceDetector = new DeviceDetector();
		const useragent = deviceDetector.parse(request.headers['user-agent']!);
		let ip: string =
			(request.headers['x-forwarded-for'] as string) ||
			(request.socket.remoteAddress ?? '') ||
			(request.headers['x-real-ip'] as string)
		if (ip == '127.0.0.1' && this.Configuration.isNotProduction) {
			ip = `90.193.80.32`
		}
		let resp: UserLoginModel = new UserLoginModel(await this.GeoLocationService.GetLocationFromIP(ip))
		resp.UserId = userId;
		resp.RawUserAgent = ip;
		resp.RawUserAgent = request.headers['user-agent']!
		resp.DeviceType = useragent.device?.type
		resp.DeviceBrand = useragent.device?.brand
		resp.DeviceModel = useragent.device?.model
		resp.ClientName = useragent.client?.name
		resp.ClientType = useragent.client?.type
		resp.ClientEngine = ``
		resp.ClientEngineVersion = ``
		resp.OSName = useragent.os?.name
		resp.OSVersion = useragent.os?.version
		resp.OSPlatform = useragent.os?.platform
		resp.CreatedById = resp.UpdatedById = userId
		resp.UpdatedById = resp.UpdatedById = userId
		return this.UserLoginRepositoryService.Create(resp)
	}

	public async CreatePendingNotifications(userId: ModelIdType, userLogin: IUserLogin): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				//check that all email addresses exists and that they are verify 
				const userEmailAddresses = await this.UserEmailAddressRepositoryService.find({ where: { UserId: userId } })
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('high')
				const [__, primaryType] = await this.LookupService.GetBasicTypesLookup('primary')
				userEmailAddresses.filter(userEmailAddress => !userEmailAddress.Verified).forEach(async userEmailAddress => {
					if (!userEmailAddress.VerificationToken) {
						await this.TriggerUserEmailAddressVerification(userEmailAddress.Id!, userId)						
						const updatedEmailAddress = await this.UserEmailAddressRepositoryService.FindById(userEmailAddress.Id!)
						this.NotificationService.VerifyEmailAddressNotification(new UserModel({ Id: userId }), updatedEmailAddress, userLogin)
					}
				})
				//check that all phone numbers exists and that they are verify 
				const userPhoneNumbers = await this.UserPhoneNumberRepositoryService.find({ where: { UserId: userId } })
				userPhoneNumbers.filter(userPhoneNumber => !userPhoneNumber.Verified).forEach(async userPhoneNumber => {
					if (!userPhoneNumber.VerificationToken) {
						await this.TriggerUserPhoneNumberVerification(userPhoneNumber.Id!, userId)						
						const updatedPhoneNumber = await this.UserPhoneNumberRepositoryService.FindById(userPhoneNumber.Id!)
						this.NotificationService.VerifyPhoneNumberNotification(new UserModel({ Id: userId }), updatedPhoneNumber, userLogin)
					}
				})				
				//update name notification
				//update communication preferences notification
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Trigger the process to change a password
	 */
	public async TriggerUserPasswordChange(forgotPasswordRequest: IForgotPasswordRequest, userLogin: UserLoginModel)
		: Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			try {
				const resetAttemptLimit = this.Configuration.authentication?.localOptions?.resetAttemptLimit!
				const resetDaysLimit = this.Configuration.authentication?.localOptions?.resetDaysLimit!
				const userLogon = await this.FindUserLocalLogon(forgotPasswordRequest.Username)
				if (!userLogon) {
					return reject('404[$]No logon found')
				}
				const user: IUser = await this.GetUser({ Id: userLogon?.UserId })
				if (!user) {
					return reject('404[$]No user found')
				}
				const userPassword = await this.UserPasswordRepositoryService.FindOne({ where: { UserId: user!.Id } })
				if (!userPassword) {
					throw `404[$]No Local Logon Password found for user`
				}
				if (userPassword.ResetAttempts && userPassword.ResetAttempts > resetAttemptLimit) {
					return reject(`403[$]Attempts have been made to reset this password past a number of times(${resetAttemptLimit} times) deemed reasonable. This password is now blocked. Please contact support`)
				}
				userPassword.ResetAttempts = (userPassword.ResetAttempts ?? 0) + 1

				if (userPassword.ResetRequestedOn && GlobalisationUtils.CalcDatesDiffInDays(new Date(), userPassword.ResetRequestedOn) > resetDaysLimit) {
					return reject(`403[$]An Attempt have been made to reset this password past a number of days(${resetAttemptLimit} days) deemed reasonable. Please start password reset again`)
				}
				userPassword.ResetRequestedOn = new Date()
				userPassword.ResetToken = IdentityUtility.NewGUIdString()
				userPassword.UpdatedById = user.Id
				userPassword.UpdatedOn = new Date()
				await this.UserPasswordRepositoryService.ReplaceById(userPassword.Id!, userPassword)
				await this.NotificationService.ForgotPasswordNotification(user, userLogin, userPassword)
				return resolve(true)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Change a user's password
	 */
	public async ChangeUserPassword(userId: ModelIdType, ChangePasswordRequest: IChangePasswordRequest, userLogin: UserLoginModel): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			try {
				const provider = lookups.AuthenticationProviders.Local.Value
				let userPassword = await this.UserPasswordRepositoryService.findOne({ where: { UserId: userId } })
				if (!userPassword) {
					return reject(`409[$]There is no record of a password. You may have signed in using an external provider. Try registering`)
				}
				const options: LocalStrategyOptions = this.Configuration.authentication?.localOptions!
				const passwordSalt = Buffer.from(crypto.randomBytes(options.pbkdf2Keylen)).toString('hex')
				const passwordHashBuffer = await crypto.pbkdf2Sync(ChangePasswordRequest.Password, passwordSalt, options.pbkdf2Iterations, options.pbkdf2Keylen, options.pbkdf2Digest)
				userPassword.PasswordSalt = passwordSalt
				userPassword.PasswordHash = Buffer.from(passwordHashBuffer).toString('hex')
				userPassword.ResetRequestedOn = new Date()
				userPassword.ResetToken = ''
				userPassword.ResetAttempts = 0
				userPassword.UpdatedOn = new Date()
				await this.UserPasswordRepositoryService.ReplaceById(userPassword.Id!, userPassword)
				await this.NotificationService.ChangePasswordNotification(new UserModel({ Id: userPassword.UserId }), userLogin)
				return resolve(true)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}


	
	/**
	 * Reset a user's password
	 */
	public async ResetUserPassword(resetPasswordRequest: IResetPasswordRequest): Promise<ModelIdType | undefined> {
		return new Promise<ModelIdType | undefined>(async (resolve, reject) => {
			try {
				const provider = lookups.AuthenticationProviders.Local.Value
				let userPassword = await this.UserPasswordRepositoryService.findOne({ where: { ResetToken: resetPasswordRequest.ResetToken } })
				if (resetPasswordRequest.Password !== resetPasswordRequest.PasswordConfirmation) {
					return reject(`418[$]There password and password confirmation do not match`)
				}
				if (!userPassword) {
					return reject(`409[$]There is no record of the Reset Token`)
				}
				const options: LocalStrategyOptions = this.Configuration.authentication?.localOptions!
				const passwordSalt = Buffer.from(crypto.randomBytes(options.pbkdf2Keylen)).toString('hex')
				const passwordHashBuffer = await crypto.pbkdf2Sync(resetPasswordRequest.Password, passwordSalt, options.pbkdf2Iterations, options.pbkdf2Keylen, options.pbkdf2Digest)
				userPassword.PasswordSalt = passwordSalt
				userPassword.PasswordHash = Buffer.from(passwordHashBuffer).toString('hex')
				userPassword.ResetRequestedOn = new Date()
				userPassword.ResetToken = ''
				userPassword.FailedAttempts = 0
				userPassword.UpdatedOn = new Date()				
				await this.UserPasswordRepositoryService.ReplaceById(userPassword.Id!, userPassword)				
				return resolve(userPassword.UserId);
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}


	/**
	 * Find a local logon for user
	 * */
	public async FindUserLocalLogon(userName: string): Promise<IUserLogon | null> {
		const provider: string = lookups.AuthenticationProviders.Local.Value
		const providerUserId: string = userName
		const authenticationProviderLookupCategory = await this.LookupService.GetLookupCategoryByValue(LookupService.AuthenticationProviderLookupCategoryName)
		const authenticationProviderLookup = await this.LookupService.GetLookupByValue(authenticationProviderLookupCategory, provider!)

		let userLogon: IUserLogon | null = await this.UserLogonRepositoryService.FindOne({
			where: {
				ProviderUserId: providerUserId,
				ProviderId: authenticationProviderLookup.Id
			}
		})
		if (!userLogon && userName && userName.trim().length) {
			userLogon = await this.UserLogonRepositoryService.FindOne({
				where: {
					ProviderUserName: userName,
					ProviderId: authenticationProviderLookup.Id
				}
			})
		}
		return userLogon
	}

}
