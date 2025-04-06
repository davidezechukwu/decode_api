
import { BindingKey, config, injectable } from '@loopback/core'
import { 
	IGroupNotification, 
	IUser, 
	IUserNotification, 
	StringUtility,
	IUserLogin,
    IUserEmailAddress,
    IUserPhoneNumber,
    IUserPassword
} from '@david.ezechukwu/core'
import { SuperNotificationStrategy } from './SuperNotificationStrategy'
import { Where } from '@loopback/repository'
import { NOTIFICATION_STATUS } from '../NotificationStatus'
import { Configuration } from '../../../Configuration'
import { Lookups } from '../../../_infrastructure/fixtures/localisation/Lookups'
import { LocalisationUtils } from '../../../utils/LocalisationUtils'
import { LookupRequest } from '../../../dtobjects'


/**
 * The InApp Notification Strategy
 * @remarks
 * Class for sending inApp notifications
 * Uses a Null Object Design Pattern for inapplicable notifications.
 * */
@injectable({ tags: { key: InAppNotificationStrategy.BINDING_KEY.key } })
export class InAppNotificationStrategy extends SuperNotificationStrategy {
	static BINDING_KEY = BindingKey.create<InAppNotificationStrategy>(`services.${InAppNotificationStrategy.name}`)

	public constructor(
		@config()
		protected readonly InAppConfig?: any
	) {
		super('inapp', InAppConfig)
	}

	/**
	 * Send user InApp
	 * */
	public async NotifyUser(notification: IUserNotification): Promise<NOTIFICATION_STATUS> {
		throw `Method not implemented`
	}

	/**
	 * Send Group InApp message
	 * */
	public async NotifyGroup(notification: IGroupNotification): Promise<NOTIFICATION_STATUS> {
		throw `Method not implemented`
	}

	/**
	 * Processed queued inApp
	 */
	public async ProcessUserNotificationsQueue(limit: number = 50): Promise<IUserNotification[]> {
		throw `Method not implemented`
	}

	/**
	 * Processed queued sms for groups
	 */
	public async ProcessGroupNotificationsQueue(filter: Where<IGroupNotification>, limit: number): Promise<IGroupNotification[]> {
		throw `Method not implemented`
	}

	public async NotifySuppportOfError(error: string, affctedUser?: IUser | undefined): Promise<NOTIFICATION_STATUS> {
		throw new Error('Method not implemented.')
	}

	/**
	 * Send the 'Welcome Notification' after registration
	 *
	 * */
	public async WelcomeNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('high')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const userEmailAddresses = await this.GetNotificationEmailAddresses(user)
				if (!userEmailAddresses || userEmailAddresses.length < 1) {
					throw `666[$]The email address of user(${user.Id}) was not found`
				}
				const to = userEmailAddresses[0].EmailAddress
				const fromName = Configuration.notifications.inapp.fromName
				const parameters = {
					FullName: '', 
					EmailAddress: to,
					FromEmailAddress:  this.Configuration.notifications.email.fromEmailAddress
				}
				const subject = lookups.Notifications.WelcomeNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.WelcomeNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: to,
 					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: highImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Send the 'Verify Email Address notification' after user adds an email address
	 *
	 **/
	public async VerifyEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('high')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const parameters = { 
					FullName: await this.GetNotificationLegalName(user) ,
					EmailAddress:  userEmalAddress.EmailAddress,
					FromEmailAddress: this.Configuration.notifications.email.fromEmailAddress
				}
				const subject = lookups.Notifications.VerifyEmailAddressNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.VerifyEmailAddressNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: userEmalAddress.EmailAddress,
					From: fromName,
					FromName: fromName,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: highImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}
	
	/**
	 * Send the 'Thank you for Verifying Your Email Address notification' after user adds an email address
	 *
	**/
	public async ThankYouForVerifyingYourEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, mediumImportance] = await this.LookupService.GetImportanceLookup('medium')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const parameters = { EmailAddress:  userEmalAddress.EmailAddress}
				const subject = lookups.Notifications.ThankYouForVerifyingYourEmailAddressNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.ThankYouForVerifyingYourEmailAddressNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: userEmalAddress.EmailAddress,
					From: fromName,
					FromName: fromName,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: mediumImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Send the 'Verify Phone Number notification' after user adds a phone number
	 *
	 **/
	public async VerifyPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, mobile] = await this.LookupService.GetPhoneTypeLookup('mobile')
				if ( userPhoneNumber.PhoneTypeId !== mobile.Id){
					//landline verification not implemented
					//Can be verified via voice, keypad
					return NOTIFICATION_STATUS.INVALID
				}
				const [__, highImportance] = await this.LookupService.GetImportanceLookup('high')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const parameters = {PhoneNumber: userPhoneNumber.PhoneNumber}
				const subject = lookups.Notifications.VerifyPhoneNumberNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.VerifyPhoneNumberNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: userPhoneNumber.PhoneNumber,
					From: fromName,
					FromName: fromName,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: highImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Send the 'Thank you for Verifying Your Phone Number  notification' after user adds an email address
	 *
	**/
	public async ThankYouForVerifyingYourPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, mediumImportance] = await this.LookupService.GetImportanceLookup('medium')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const parameters = { PhoneNumber:  userPhoneNumber.PhoneNumber}
				const subject = lookups.Notifications.ThankYouForVerifyingYourPhoneNumberNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.ThankYouForVerifyingYourPhoneNumberNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: user.Id?.toString(),
					From: fromName,
					FromName: fromName,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: mediumImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Send the 'Login notification' after user logs in 
	 *
	 **/
	public async LoginNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {				
				const [_, lowImportance] = await this.LookupService.GetImportanceLookup('low')				
				const [__, succeededStatus] = await this.LookupService.GetStatusLookup('succeeded')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)								
				let countryName = ''				
				if ( userLogin.LocationId){
					const country = await this.LookupService.GetLookupById(new LookupRequest({LookupId: userLogin.LocationId}))
					countryName = country?.OfficialName
				}
				const parameters = { 
					WithDevice: `${userLogin.DeviceType} ${userLogin.ClientType} (${userLogin.ClientName}${userLogin.ClientEngineVersion ? ',' + userLogin.ClientEngineVersion : ''})`,
					OS: `${userLogin.OSName}(${userLogin.OSPlatform})`,
					FromLocation: `${userLogin.Region}, ${userLogin.City}, ${countryName}`,
					IP: userLogin.IPAddress,
					LoginDate: userLogin.CreatedOn?.toLocaleString( )
				}
				const from = Configuration.notifications.inapp.fromName
				const fromName = Configuration.notifications.inapp.fromName				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const subject = lookups.Notifications.LoginNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.LoginNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: user.Id?.toString(),
					From: from,
					FromName: fromName,
					NotificationStatusId: succeededStatus.Id,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: lowImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				reject(e)
			}
		})
	}

	/**
	 * Send the 'Login From A New Device Notification' when a user logs in from a new device
	 *
	 **/
	public async LoginOnNewDeviceNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		throw new Error('Method not implemented.')
	}

	/**
	 * Send the 'Login From A New Location Notification' when a user logs in from a new device
	 *
	 **/
	public async LoginOnNewLocationNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		throw new Error('Method not implemented.')
	}

	/**
	 * Send the 'No Primary Email Address notification' if the user has no primary email address ( this is so on OAUTH) or if primary email address has been deleted
	 *
	 **/
	public async NoPrimaryEmailAddressNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		throw new Error('Method not implemented.')
	}

	/**
	 * Send the 'No Local Logon notification' if the user has no primary email address ( this is so on OAUTH)
	 *
	 **/
	public async NoLocalLogonNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		throw new Error('Method not implemented.')
	}

	/**
	 * Send the 'Forgot Password notification' when the user wishes to change their password
	 *
	 **/
	public async ForgotPasswordNotification(user: IUser, userLogin: IUserLogin, userPassword: IUserPassword): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('high')		
				const [__, succeededStatus] = await this.LookupService.GetStatusLookup('succeeded')		
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const userEmailAddresses = await this.GetNotificationEmailAddresses(user)
				if (!userEmailAddresses || userEmailAddresses.length < 1) {
					throw `666[$]The email address of user(${user.Id}) was not found`
				}
				let to = ''
				userEmailAddresses.forEach(p => {
					if ( p.Verified){
						to = to + p.EmailAddress + ','
					}
				})
				to = to.slice(0, -1)
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const parameters = { 
					FullName: await this.GetNotificationLegalName(user) ,
					EmailAddress:  to,
					FromEmailAddress:  this.Configuration.notifications.email.fromEmailAddress
				}
				const subject = lookups.Notifications.ForgotPasswordNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.ForgotPasswordNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: user.Id?.toString(),
					From: fromName,
					FromName: fromName,
					NotificationStatusId: succeededStatus.Id,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: highImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Send the 'Password Reset notification' when the user changed their password
	 *
	 **/
	public async PasswordResetNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, mediumImportance] = await this.LookupService.GetImportanceLookup('medium')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const subject = lookups.Notifications.PasswordResetNotification.Subject
				const message = super.GetLocalisedTemplate(
					InAppNotificationStrategy.prototype.PasswordResetNotification.name,
					locale,
					'txt'
				)
				const notification = await this.SaveUserNotification({
					To: user.Id?.toString(),
					From: fromName,
					FromName: fromName,
					Message: message,
					Parameters: "",
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: mediumImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Send the 'Change Password notification' when the user wishes to change their password
	 *
	 **/
	public async ChangePasswordNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('low')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const userEmailAddresses = await this.GetNotificationEmailAddresses(user)
				if (!userEmailAddresses || userEmailAddresses.length < 1) {
					throw `666[$]The email address of user(${user.Id}) was not found`
				}
				let to = ''
				userEmailAddresses.forEach(p => {
					if ( p.Verified){
						to = to + p.EmailAddress + ','
					}
				})
				to = to.slice(0, -1)
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const parameters = { 
					FullName: await this.GetNotificationLegalName(user) ,
					EmailAddress:  to,
					FromEmailAddress:  this.Configuration.notifications.email.fromEmailAddress
				}
				const subject = lookups.Notifications.ChangePasswordNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						InAppNotificationStrategy.prototype.ChangePasswordNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: user.Id?.toString(),
					From: fromName,
					FromName: fromName,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: highImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}

	/**
	 * Send the 'Password Changed notification' when the user changed their password
	 *
	 **/
	public async PasswordChangedNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, mediumImportance] = await this.LookupService.GetImportanceLookup('medium')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)				
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const fromName = Configuration.notifications.inapp.fromName
				const subject = lookups.Notifications.PasswordChangedNotification.Subject
				const message = super.GetLocalisedTemplate(
					InAppNotificationStrategy.prototype.PasswordChangedNotification.name,
					locale,
					'txt'
				)
				const notification = await this.SaveUserNotification({
					To: user.Id?.toString(),
					From: fromName,
					FromName: fromName,
					Message: message,
					Parameters: "",
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: mediumImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				})				
				return resolve(NOTIFICATION_STATUS.SUCCEEDED)
			} catch (e) {
				this.Logger.error(e)
				return reject(e)
			}
		})
	}
}
