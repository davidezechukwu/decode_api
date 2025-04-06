import { BindingKey, config, inject, injectable } from '@loopback/core'
import { Where } from '@loopback/repository'
import { createTransport, Transporter } from 'nodemailer'
import { 
	TypeUtility, 
	IUser, 
	IUserNotification, 
	IGroupNotification, 
	StringUtility,
	IUserLogin,
    IUserEmailAddress,
    IUserPhoneNumber,
    IUserPassword
} from '@david.ezechukwu/core'
import { SuperNotificationStrategy } from './SuperNotificationStrategy'
import { Configuration } from '../../../Configuration'
import { UserNotificationModel } from '../../../models/UserNotificationModel'
import { LocalisationUtils } from '../../../utils/LocalisationUtils'
import { SchemaUtils } from '../../../utils'
import { Lookups } from '../../../_infrastructure/fixtures/localisation/Lookups'
import { NOTIFICATION_STATUS } from '../NotificationStatus'
import { SensitivePropertyDecorator } from '../../../decorators'
import { LookupRequest } from '../../../dtobjects'
const debug = require('debug')('decode:EmailNotificationWorker:EmailNotificationStrategy')

class SendMailOptions {
	constructor(partialObject: Partial<SendMailOptions> = {}) {
		Object.assign(this, partialObject)
	}
	// eslint-disable-next-line
	from: string
	// eslint-disable-next-line
	sender: string
	// eslint-disable-next-line
	@SensitivePropertyDecorator to: string
	// eslint-disable-next-line
	@SensitivePropertyDecorator subject: string
	// eslint-disable-next-line
	@SensitivePropertyDecorator html: string
}

/**
 * The Email Notification Strategy
 * @remarks
 * Class for sending emails notifications.
 * Uses a Null Object Design Pattern for inapplicable notifications
 * */
@injectable({ tags: { key: EmailNotificationStrategy.BINDING_KEY.key } })
export class EmailNotificationStrategy extends SuperNotificationStrategy {
	static BINDING_KEY = BindingKey.create<EmailNotificationStrategy>(`services.${EmailNotificationStrategy.name}`)

	protected Transporter: Transporter

	public constructor(
		@config()
		protected readonly EmailConfig: any,
	) {
		super('email', EmailConfig)
		try {
			this.Transporter = createTransport(EmailConfig)
		} catch (e) {
			debug(`${EmailNotificationStrategy.name} NotificationStrategy failed with this error:-`)
			debug(e)
			throw e
		}
		//https://github.com/loopbackio/loopback4-example-shopping/blob/master/packages/shopping/src/services/email.service.ts
	}

	/**
	 * Send email
	 * */
	public async NotifyUser(notification: IUserNotification): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			const notificationStatusCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStatus'))
			const sendMailOptions = new SendMailOptions({
				from: notification.From,
				to: notification.To,
				subject: notification.Subject,
				html: notification.Message,
				sender: notification.FromName
			})

			let result = undefined
			let transportError = undefined

			//#region verbose tracing
			this.Logger.verbose(`Calling ${EmailNotificationStrategy.name}.${EmailNotificationStrategy.prototype.NotifyUser.name} with:-`)
			this.Logger.verbose(`${JSON.stringify(SchemaUtils.StripSensitiveProperties(sendMailOptions))}`)
			this.Logger.verbose(`Using the Transporter(version: ${this.Transporter.getVersionString()})`)
			this.Logger.verbose(`Using the Transporter(options(${JSON.stringify(this.Transporter.options)})`)
			this.Logger.verbose(`Using the Transporter(configuration(${JSON.stringify(this.EmailConfig)})`)
			//#endregion verbose tracing

			try {
				this.Logger.verbose(`Sending(${JSON.stringify(SchemaUtils.StripSensitiveProperties(sendMailOptions))})`)
				result = await this.Transporter.sendMail(sendMailOptions)
			} catch (e) {
				transportError = e
				let isStrategyWorking
				(async () => {
					isStrategyWorking = await this.Transporter.verify()
				})()
				this.Logger.error(`Failed to Send`)
				this.Logger.error(`${EmailNotificationStrategy.name}.${EmailNotificationStrategy.prototype.NotifyUser.name} Email Transporter has a status of ${isStrategyWorking ? 'Working' : 'Not Working'}`)
				this.Logger.error(e)
			} finally {
				try {
					let notificationStatus = undefined
					const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
					if (transportError) {
						notificationStatus = await this.LookupService.GetLookupByValue(notificationStatusCategory, lookups.NotificationStatus.Failed.Value)
						notification.Retries = notification.Retries + 1
					} else {
						notificationStatus = await this.LookupService.GetLookupByValue(notificationStatusCategory, lookups.NotificationStatus.Succeeded.Value)
						notification.ResponseCode = result.messageId
						notification.ResponseBody = JSON.stringify(result.envelope)
					}
					notification.NotificationStatusId = notificationStatus.Id!
					await this.UserNotificationRepositoryService.Update(new UserNotificationModel(notification))

					if (transportError) {
						return reject(transportError)
					} else {
						return resolve(NOTIFICATION_STATUS.SUCCEEDED)
					}
				} catch (e) {
					this.Logger.error(e)
					return reject(e)
				}
			}
		})
	}

	/**
	 * Send group email
	 * */
	public NotifyGroup(notification: IGroupNotification): Promise<NOTIFICATION_STATUS> {
		throw `Method not implemented`
	}

	/**
	 * Processed queued emails
	 */
	public async ProcessUserNotificationsQueue(limit: number): Promise<IUserNotification[]> {
		return super.ProcessUserNotificationsQueue(limit)
	}

	/**
	 * Processed queued sms for groups
	 */
	public ProcessGroupNotificationsQueue(filter: Where<IGroupNotification>, limit: number): Promise<IGroupNotification[]> {
		throw `Method not implemented`
	}

	/**
	 * Notify support staff of any errors
	 **/
	public async NotifySuppportOfError(error: string, affctedUser?: IUser): Promise<NOTIFICATION_STATUS> {
		this.Logger.error(error)
		return NOTIFICATION_STATUS.SUCCEEDED
	}

	/**
	 * Send Welcome notification after registration
	 * TODO:: Add text only email option, if needed
	 * */
	public async WelcomeNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('high')				
				const [__, primaryType] = await this.LookupService.GetBasicTypesLookup('primary')				
				const [locale, userLanguage] = await this.GetNotificationLocale(user)
				const userEmailAddresses = await this.GetNotificationEmailAddresses(user)
				if (!userEmailAddresses || userEmailAddresses.length < 1) {
					throw `666[$]The email address of user(${user.Id}) was not found`
				}
				let to = ''
				userEmailAddresses.forEach(p => (to = to + p.EmailAddress + ','))
				to = to.slice(0, -1)
				const fullName = await this.GetNotificationLegalName(user)
				let countryName = ''				
				if ( userLogin.LocationId){
					const country = await this.LookupService.GetLookupById(new LookupRequest({LookupId: userLogin.LocationId}))
					countryName = country?.OfficialName
				}
				const primaryEmailAddressType = userEmailAddresses.find( p => p.EmailAddressTypeId == primaryType.Id )
				const parameters = { 
					FullName: fullName,
					ViewInBrowser: `${this.Configuration.hostURL}api/healthcheck/whoami/#yournotifications`,
					Locale: locale,
					Location: `${userLogin.Region ? userLogin.Region+', ' : ''}${userLogin.City ? userLogin.City+', ' : ''}${countryName}`,
					Device: `${userLogin.DeviceType} ${userLogin.ClientType} (${userLogin.ClientName}${userLogin.ClientEngineVersion ? ',' + userLogin.ClientEngineVersion : ''})`,					
					OS: `${userLogin.OSName}(${userLogin.OSPlatform})`,
					UserId: user.Id,
					Id: primaryEmailAddressType?.Id,
					VerificationToken: primaryEmailAddressType?.VerificationToken,
					HostUrl: this.Configuration.hostURL
				}
				const from = Configuration.notifications.email.fromEmailAddress
				const fromName = Configuration.notifications.email.fromName
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const subject = lookups.Notifications.WelcomeNotification.Subject
				const html = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						EmailNotificationStrategy.prototype.WelcomeNotification.name,
						locale
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: to,
					From: from,
					FromName: fromName,
					Message: html,
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
	public async VerifyEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('high')												
				const [locale, userLanguage] = await this.GetNotificationLocale(user)
				const userEmailAddresses = await this.GetNotificationEmailAddresses(user)
				if (!userEmailAddresses || userEmailAddresses.length < 1) {
					throw `666[$]The email address of user(${user.Id}) was not found`
				}
				let to = ''
				userEmailAddresses.forEach(p => (to = to + p.EmailAddress + ','))
				to = to.slice(0, -1)				
				const fullName = await this.GetNotificationLegalName(user)
				let countryName = ''				
				if ( userLogin.LocationId){
					const country = await this.LookupService.GetLookupById(new LookupRequest({LookupId: userLogin.LocationId}))
					countryName = country?.OfficialName
				}
				
				const parameters = { 
					FullName: fullName,
					ViewInBrowser: `${this.Configuration.hostURL}api/healthcheck/whoami/#yournotifications`,
					Locale: locale,
					Location: `${userLogin.Region ? userLogin.Region+', ' : ''}${userLogin.City ? userLogin.City+', ' : ''}${countryName}`,
					Device: `${userLogin.DeviceType} ${userLogin.ClientType} (${userLogin.ClientName}${userLogin.ClientEngineVersion ? ',' + userLogin.ClientEngineVersion : ''})`,					
					OS: `${userLogin.OSName}(${userLogin.OSPlatform})`,
					UserId: user.Id,
					Id: userEmalAddress?.Id,
					VerificationToken: userEmalAddress?.VerificationToken,
					HostUrl: this.Configuration.hostURL
				}
				const from = Configuration.notifications.email.fromEmailAddress
				const fromName = Configuration.notifications.email.fromName
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const subject = lookups.Notifications.VerifyEmailAddressNotification.Subject
				const html = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						EmailNotificationStrategy.prototype.VerifyEmailAddressNotification.name,
						locale
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: to,
					From: from,
					FromName: fromName,
					Message: html,
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
	public async ThankYouForVerifyingYourEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress ): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.SUCCEEDED
	}	

	/**
	 * Send the 'Verify Phone Number notification' after user adds a phone number
	 *
	 **/
	public async VerifyPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.INVALID
	}

	/**
	 * Send the 'Thank you for Verifying Your Phone Number  notification' after user adds an email address
	 *
	**/
	public async ThankYouForVerifyingYourPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.SUCCEEDED
	}

	/**
	 * Send the 'Login notification' after user logs in 
	 *
	 **/
	public async LoginNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.SUCCEEDED
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
				const [locale, userLanguage] = await this.GetNotificationLocale(user)
				const userEmailAddresses = await this.GetNotificationEmailAddresses(user)
				if (!userEmailAddresses || userEmailAddresses.length < 1) {
					throw `666[$]The email address of user(${user.Id}) was not found`
				}
				let to = ''
				userEmailAddresses.forEach(p => {to = to + p.EmailAddress + ','})
				to = to.slice(0, -1)
				const fullName = await this.GetNotificationLegalName(user)
				let countryName = ''				
				if ( userLogin.LocationId){
					const country = await this.LookupService.GetLookupById(new LookupRequest({LookupId: userLogin.LocationId}))
					countryName = country?.OfficialName
				}				
				const parameters = { 
					FullName: fullName,
					ViewInBrowser: `${this.Configuration.hostURL}api/healthcheck/whoami/#yournotifications`,
					Locale: locale,
					Location: `${userLogin.Region ? userLogin.Region+', ' : ''}${userLogin.City ? userLogin.City+', ' : ''}${countryName}`,
					Device: `${userLogin.DeviceType} ${userLogin.ClientType} (${userLogin.ClientName}${userLogin.ClientEngineVersion ? ',' + userLogin.ClientEngineVersion : ''})`,					
					OS: `${userLogin.OSName}(${userLogin.OSPlatform})`,
					UserId: user.Id,
					Id: userPassword?.Id,
					ResetToken: userPassword?.ResetToken,
					HostUrl: this.Configuration.hostURL
				}
				const from = Configuration.notifications.email.fromEmailAddress
				const fromName = Configuration.notifications.email.fromName
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const subject = lookups.Notifications.ForgotPasswordNotification.Subject
				const html = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						EmailNotificationStrategy.prototype.ForgotPasswordNotification.name,
						locale
					),
					parameters
				)
				const notification = await this.SaveUserNotification({
					To: to,
					From: from,
					FromName: fromName,
					Message: html,
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
	 * Send the 'Password Reset notification' when the user reset their password
	 *
	 **/
	public async PasswordResetNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.SUCCEEDED
	}

	/**
	 * Send the 'Change Password notification' when the user wishes to change their password
	 *
	 **/
	public async ChangePasswordNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.SUCCEEDED
	}

	/**
	 * Send the 'Password Changed notification' when the user changed their password
	 *
	 **/
	public async PasswordChangedNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.SUCCEEDED
	}
}
