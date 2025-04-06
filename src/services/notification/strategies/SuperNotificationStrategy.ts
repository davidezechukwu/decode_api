import { Where } from '@loopback/repository'
import { inject } from '@loopback/core'
import {
	IUser,
	IUserNotification,
	TypeUtility,
	IGroupNotification,
	IUserLogin,
	IUserEmailAddress,
	IUserPhoneNumber,
	IUserPassword,
	IUserDisplaySettingsWithRelations,
	ILookup,
	IUserNameConstants
} from '@david.ezechukwu/core'
import { Configuration } from '../../../Configuration'
import { SuperBindings } from '../../../SuperBindings'
import { SuperService } from '../../SuperService'
import { LookupService } from '../../lookup/LookupService'
import { UserNotificationRepositoryService } from '../../../repositories/UserNotificationRepositoryService'
import { GroupNotificationRepositoryService } from '../../../repositories/GroupNotificationRepositoryService'
import { LocalisationUtils } from '../../../utils/LocalisationUtils'
import { Lookups } from '../../../_infrastructure/fixtures/localisation/Lookups'
import { GroupNotificationModel } from '../../../models/GroupNotificationModel'
import { UserNotificationModel } from '../../../models/UserNotificationModel'
import { INotificationStrategy, NotificationStrategyType } from './INotificationStrategy'
import { INotifications } from '../INotifications'
import {
	UserDisplaySettingsRepositoryService,
	UserEmailAddressRepositoryService,
	UserPhoneNumberRepositoryService,
	UserNameRepositoryService
} from '../../../repositories'
import { NOTIFICATION_STATUS } from '../NotificationStatus'
const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()


const fs = require('fs')
const path = require('path')
const cachedTemplates: { [index: string]: string } = {}

export abstract class SuperNotificationStrategy extends SuperService implements INotificationStrategy, INotifications {
	@inject(UserNotificationRepositoryService.BINDING_KEY.key)
	protected UserNotificationRepositoryService: UserNotificationRepositoryService
	@inject(GroupNotificationRepositoryService.BINDING_KEY.key)
	protected GroupNotificationRepositoryService: GroupNotificationRepositoryService
	@inject(UserDisplaySettingsRepositoryService.BINDING_KEY.key)
	protected UserDisplaySettingsRepositoryService: UserDisplaySettingsRepositoryService
	@inject(UserEmailAddressRepositoryService.BINDING_KEY.key)
	protected UserEmailAddressRepositoryService: UserEmailAddressRepositoryService
	@inject(UserPhoneNumberRepositoryService.BINDING_KEY.key)
	protected UserPhoneNumberRepositoryService: UserPhoneNumberRepositoryService
	@inject(UserNameRepositoryService.BINDING_KEY.key)
	protected UserNameRepositoryService: UserNameRepositoryService
	@inject(SuperBindings.LookupServiceBindingKey.key)
	public LookupService: LookupService
	public Lookups: Lookups

	/**
	 * The base class for all Notification Strategy services
	 * @remarks
	 * Uses the Template Method Pattern for the initialization of the actual Notification Strategy service.
	 * Property NotificationStrategy should be set to the appropriate strategy on creation,
	 * using the Nitrification Strategy literal type NotificationStrategy, for 
	 * email(SMTP), SMS, WhatsApp, Push Notifications, InApp, Skype, etc
	 * */
	public constructor(
		public NotificationStrategy: NotificationStrategyType,
		options: any
	) {
		super()
		this.Lookups = LocalisationUtils.GetLocalisedLookups()
	}

	/**
	 * Get User's preferred Language for notifications'
	 * */
	public async GetNotificationLocale(user: IUser): Promise<[string, ILookup]> {
		return new Promise<[string, ILookup]>(async (resolve, reject) => {
			try {
				const userDisplaySettings: IUserDisplaySettingsWithRelations | null = await this.UserDisplaySettingsRepositoryService.FindOne({ where: { UserId: user.Id }, include: [{ relation: 'Language' }] })
				const locale = userDisplaySettings?.Language.Value!
				return resolve([locale, userDisplaySettings?.Language!])
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Get User's legal name
	* */
	public async GetNotificationLegalName(user: IUser): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			let fullname = ''
			try {
				const userNameTemp = await this.UserNameRepositoryService.Find({ where: { UserId: user.Id } })
				if (userNameTemp.length == 0) {
					return resolve(fullname)
				}
				if (userNameTemp.length > 1) {
					throw `409[$]User cannot have more than one user name record`
				}
				const userName = userNameTemp[0]
				if (userName?.NickName && userName?.NickName?.length! > IUserNameConstants.NICKNAME_MIN_LENGTH) {
					fullname = userName?.NickName
				} else {
					fullname = `${userName?.FirstName} ${userName?.LastName}`
					fullname = userName?.Title + ' ' + fullname.trim()
					fullname = fullname.trim()
				}
				return resolve(fullname)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Get User's contact email addresses'
	 * @remarks
	 * Get a list of the email addresses through which this user could be contacted on via email 
	 * */
	public async GetNotificationEmailAddresses(user: IUser): Promise<IUserEmailAddress[]> {
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
	 * Get User's contact mobile phone numbers for SMS and Whats messages'
	 * @remarks
	 * Get a list of the phone numbers through which this user could be contacted on via email 
	 * */
	public async GetNotificationPhoneNumber(user: IUser): Promise<IUserPhoneNumber | undefined> {
		return new Promise<IUserPhoneNumber | undefined>(async (resolve, reject) => {
			try {
				const [_, mobile] = await this.LookupService.GetPhoneTypeLookup('mobile')
				const userPhoneNumbers = await this.UserPhoneNumberRepositoryService.Find({ where: { UserId: user.Id } })
				const mobileNumber = userPhoneNumbers?.find((p: IUserPhoneNumber) => p.PhoneTypeId == mobile.Id)
				return resolve(mobileNumber)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Utility for getting the Notification Importance Lookup and Lookup Category
	 * @remarks 
	 * Importance like all other lookups used throughout are stored on Taxonomy.Lookups 
	 * data source table( or object for No-SQL data sources)
	 */
	protected GetLocalisedTemplate(name: string, locale: string = Configuration.localisation.defaultLocale, ext: 'html' | 'txt' = 'html'): string {
		const cacheKey = `${name}/${name}_${this.NotificationStrategy}_${locale}.${ext}`.toLowerCase()
		if (!cachedTemplates[cacheKey]) {
			const templateFile = path.join(Configuration.fixtures.templatePath, `${cacheKey}`)
			cachedTemplates[cacheKey] = fs.readFileSync(templateFile, 'utf8')
		}
		return cachedTemplates[cacheKey]
	}

	/**
	 * Send the notification via it's configured transport'
	 * */
	public abstract NotifyUser(notification: Partial<IUserNotification>): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the notification via it's configured transport'
	 * */
	public abstract NotifyGroup(notification: Partial<IGroupNotification>): Promise<NOTIFICATION_STATUS>

	/**
	 * Save the user notification to the configured datasources
	 **/
	public async SaveUserNotification(notification: Partial<IUserNotification>): Promise<IUserNotification[]> {
		return new Promise<IUserNotification[]>(async (resolve, reject) => {
			try {
				const notificationStrategyCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStrategies'))
				if (!notificationStrategyCategory) {
					return reject(`666[$]Was unable to find a '${TypeUtility.NameOf<Lookups>('NotificationStrategies')}' Lookup Category`)
				}
				const notificationStrategy = await this.LookupService.GetLookupByValue(notificationStrategyCategory, this.NotificationStrategy)
				notification.NotificationStrategyId = notificationStrategy.Id
				const notificationStatusCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStatus'))
				if (!notificationStatusCategory) {
					return reject(`666[$]Was unable to find a '${TypeUtility.NameOf<Lookups>('NotificationStatus')}' Lookup Category`)
				}
				if (!notification.NotificationStatusId) {
					const [_, pendingStatus] = await this.LookupService.GetStatusLookup('pending')
					notification.NotificationStatusId = pendingStatus.Id
				}
				const userNotification = await this.UserNotificationRepositoryService.Save(new UserNotificationModel(notification))
				return resolve([userNotification])
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Save the group notification to the configured datasources
	 **/
	public async SaveGroupNotification(notification: Partial<IGroupNotification>): Promise<IGroupNotification[]> {
		return new Promise<IGroupNotification[]>(async (resolve, reject) => {
			try {
				const notificationStrategyCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStrategies'))
				if (!notificationStrategyCategory) {
					return reject(`666[$]Was unable to find a '${TypeUtility.NameOf<Lookups>('NotificationStrategies')}' Lookup Category`)
				}
				const NotificationStrategy = await this.LookupService.GetLookupByValue(notificationStrategyCategory, this.NotificationStrategy)
				notification.NotificationStrategyId = NotificationStrategy.Id
				const notificationStatusCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStatus'))
				if (!notificationStatusCategory) {
					return reject(`666[$]Was unable to find a '${TypeUtility.NameOf<Lookups>('NotificationStatus')}' Lookup Category`)
				}
				if (!notification.NotificationStatusId) {
					const [_, pendingStatus] = await this.LookupService.GetStatusLookup('pending')
					notification.NotificationStatusId = pendingStatus.Id
				}
				const groupNotification = await this.GroupNotificationRepositoryService.Save(new GroupNotificationModel(notification))
				return resolve([groupNotification])
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * @remarks
	 * This should/could be done with Microsoft SSIS or similar,
	 * hence some subclasses would not implement this and may throw a exception if called	 
	 **/
	public async ProcessUserNotificationsQueue(limit: number): Promise<IUserNotification[]> {
		const notificationStatusCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStatus'))
		const notificationStatusFailed = await this.LookupService.GetLookupByValue(notificationStatusCategory, this.Lookups.NotificationStatus.Failed.Value)
		const notificationStatusPending = await this.LookupService.GetLookupByValue(notificationStatusCategory, this.Lookups.NotificationStatus.Pending.Value)
		const notificationStrategyCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStrategies'))
		const notificationStrategy = await this.LookupService.GetLookupByValue(notificationStrategyCategory, this.NotificationStrategy)
		const filter = {
			where: {
				and: [
					{ NotificationStrategyId: notificationStrategy.Id },
					{ Retries: { lt: this.Configuration.notifications.sms.maxRetry } },
					{ or: [{ NotificationStatusId: notificationStatusFailed.Id }, { NotificationStatusId: notificationStatusPending.Id }] }
				]
			},
			limit: limit
		}
		const userNotifications = await this.UserNotificationRepositoryService.Find(filter)
		return userNotifications
	}

	/**
	 * Processed queued SMS for groups
	 */
	public abstract ProcessGroupNotificationsQueue(filter: Where<IGroupNotification>, limit: number): Promise<IGroupNotification[]>

	/**
	 * Notify support staff of any errors
	 **/
	public abstract NotifySuppportOfError(error: string, affctedUser?: IUser): Promise<NOTIFICATION_STATUS>


	/**
	 * Send the 'Welcome Notification' after registration
	 *
	 * */
	public abstract WelcomeNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Verify Email Address notification' after user adds an email address
	 *
	 **/
	public abstract VerifyEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Thank you for Verifying Your Email Address notification' after user adds an email address
	 *
	**/
	public abstract ThankYouForVerifyingYourEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Verify Phone Number notification' after user adds a phone number
	 *
	 **/
	public abstract VerifyPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Thank you for Verifying Your Phone Number  notification' after user adds an email address
	 *
	**/
	public abstract ThankYouForVerifyingYourPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Login notification' after user logs in 
	 *
	 **/
	public abstract LoginNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Login From A New Device Notification' when a user logs in from a new device
	 *
	 **/
	public abstract LoginOnNewDeviceNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Login From A New Location Notification' when a user logs in from a new device
	 *
	 **/
	public abstract LoginOnNewLocationNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'No Primary Email Address notification' if the user has no primary email address ( this is so on OAUTH) or if primary email address has been deleted
	 *
	 **/
	public abstract NoPrimaryEmailAddressNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'No Local Logon notification' if the user has no primary email address ( this is so on OAUTH)
	 *
	 **/
	public abstract NoLocalLogonNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Forgot Password notification' when the user wishes to change their password
	 *
	 **/
	public abstract ForgotPasswordNotification(user: IUser, userLogin: IUserLogin, userPassword: IUserPassword): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Password Reset notification' when the user reset their password
	 *
	 **/
	public abstract PasswordResetNotification(user: IUser): Promise<NOTIFICATION_STATUS>
	
	/**
	 * Send the 'Change Password notification' when the user wishes to change their password
	 *
	 **/
	public abstract ChangePasswordNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Password Changed notification' when the user changed their password
	 *
	 **/
	public abstract PasswordChangedNotification(user: IUser): Promise<NOTIFICATION_STATUS>
}
