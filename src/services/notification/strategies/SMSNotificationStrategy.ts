import { BindingKey, config, injectable } from '@loopback/core'
import { Where } from '@loopback/repository'
import {
	IGroupNotification,
	IUser,
	IUserEmailAddress,
	IUserLogin,
	IUserNotification,
	IUserPassword,
	IUserPhoneNumber,
	StringUtility
} from '@david.ezechukwu/core'
import { SuperNotificationStrategy } from './SuperNotificationStrategy'
import { LocalisationUtils } from '../../../utils/LocalisationUtils'
import { Lookups } from '../../../_infrastructure/fixtures/localisation/Lookups'
import { TypeUtility } from '@david.ezechukwu/core'
import { SchemaUtils } from '../../../utils/SchemaUtils'
import { UserNotificationModel } from '../../../models/UserNotificationModel'
import { NOTIFICATION_STATUS } from '../NotificationStatus'
import { SensitivePropertyDecorator } from '../../../decorators'
import { LookupRequest } from '../../../dtobjects'
import { Filter } from 'casbin'

const debug = require('debug')('decode:EmailNotificationWorker:SMSNotificationStrategy')
const axios = require('axios')

class SendSMSOptions {
	constructor(partialObject: Partial<SendSMSOptions> = {}) {
		Object.assign(this, partialObject)
	}
	// eslint-disable-next-line
	from: string
	// eslint-disable-next-line
	@SensitivePropertyDecorator to: string
	// eslint-disable-next-line
	@SensitivePropertyDecorator body: string
	// eslint-disable-next-line
	@SensitivePropertyDecorator username: string

	@SensitivePropertyDecorator
	// eslint-disable-next-line
	auth: {
		username: string
		password: string
	}
}

/**
 * The SMS Notification Strategy
 * @remarks
 * Class for sending sms notifications.
 * Uses a Null Object Design Pattern for inapplicable notifications
 * */
@injectable({ tags: { key: SMSNotificationStrategy.BINDING_KEY.key } })
export class SMSNotificationStrategy extends SuperNotificationStrategy {
	static BINDING_KEY = BindingKey.create<SMSNotificationStrategy>(`services.${SMSNotificationStrategy.name}`)

	public constructor(
		@config()
		protected readonly SMSConfig?: any
	) {
		super('sms', SMSConfig)
	}


	/**
	 * Send sms
	 * */
	public async NotifyUser(notification: IUserNotification): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			const notificationStatusCategory = await this.LookupService.GetLookupCategoryByValue(TypeUtility.NameOf<Lookups>('NotificationStatus'))
			let message = notification.Message
			if (message.indexOf(`data-decode-link1="#"`)) {
				message = message.replace(`data-decode-link1="#"`, '')
			}
			if (message.indexOf(`data-decode-link2="#"`)) {
				message = message.replace(`data-decode-link2="#"`, '')
			}
			const sendSMSOptions = new SendSMSOptions({
				from: 'decode'/*notification.From*/,
				to: notification.To,
				body: message
			})

			let result = undefined
			let transportError = undefined

			try {
				this.Logger.verbose(`Sending(${JSON.stringify(SchemaUtils.StripSensitiveProperties(sendSMSOptions))})`)
				const data = {
					messages: [{ ...sendSMSOptions }]
				}
				const requestConfig = {
					auth: {
						username: this.Configuration.notifications.sms.provider.ClickSendOptions.api_username,
						password: this.Configuration.notifications.sms.provider.ClickSendOptions.api_key
					}
				}

				result = await axios.post(`${this.SMSConfig.apiUrl}/sms/send`, data, requestConfig)
				this.Logger.info(`SMS send complicated successfully`)
			} catch (e) {
				transportError = e
				if (this.Configuration.env !== 'production') {
					this.Logger.error(e)
				} else {
					this.Logger.error(`Sending(${JSON.stringify(SchemaUtils.StripSensitiveProperties(sendSMSOptions))}) failed`)
				}
			} finally {
				try {
					let notificationStatus = undefined
					const lookups: Lookups = LocalisationUtils.GetLocalisedLookups();
					if (transportError) {
						notificationStatus = await this.LookupService.GetLookupByValue(notificationStatusCategory, lookups.NotificationStatus.Failed.Value)
						notification.Retries = notification.Retries + 1
					} else {
						notificationStatus = await this.LookupService.GetLookupByValue(notificationStatusCategory, lookups.NotificationStatus.Succeeded.Value)
						notification.ResponseCode = result.response_code
						notification.ResponseBody = result.data.response_msg
					}
					notification.NotificationStatusId = notificationStatus.Id!
					await this.UserNotificationRepositoryService.Update(new UserNotificationModel(notification))

					if (transportError) {
						reject(transportError)
					} else {
						resolve(NOTIFICATION_STATUS.SUCCEEDED)
					}
				} catch (e) {
					if (this.Configuration.env !== 'production') {
						this.Logger.error(e)
					} else {
						this.Logger.error(`Sending(${JSON.stringify(SchemaUtils.StripSensitiveProperties(notification))})`)
					}
					reject(e)
				}
			}
		})
	}

	/**
	 * Send Group SMS
	 * */
	public async NotifyGroup(notification: IGroupNotification): Promise<NOTIFICATION_STATUS> {
		throw `Method not implemented`
	}

	/**
	 * Processed queued sms
	 */
	public async ProcessUserNotificationsQueue(limit: number = 50): Promise<IUserNotification[]> {		
		return super.ProcessUserNotificationsQueue(limit)
	}

	/**
	 * Processed queued sms for groups
	 */
	public async ProcessGroupNotificationsQueue(filter: Where<IGroupNotification>, limit: number): Promise<IGroupNotification[]> {
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
	 * Send the 'Welcome Notification' after registration
	 * */
	public async WelcomeNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.SUCCEEDED
	}

	/**
	 * Send the 'Verify Email Address notification' after user adds an email address
	 *
	 **/
	public async VerifyEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.INVALID
	}

	/**
	 * Send the 'Thank you for Verifying Your Email Address notification' after user adds an email address
	 *
	**/
	public async ThankYouForVerifyingYourEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress): Promise<NOTIFICATION_STATUS> {
		return NOTIFICATION_STATUS.INVALID
	}

	/**
	 * Send the 'Verify Phone Number notification' after user adds a phone number
	 *
	 **/
	public async VerifyPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		return new Promise<NOTIFICATION_STATUS>(async (resolve, reject) => {
			try {
				const [_, highImportance] = await this.LookupService.GetImportanceLookup('high')
				const [locale, userLanguage] = await this.GetNotificationLocale(user)
				const [__, mobile] = await this.LookupService.GetPhoneTypeLookup('mobile')
				if ( userPhoneNumber.PhoneTypeId != mobile.Id ){
					//landline can't handle links
					return NOTIFICATION_STATUS.INVALID
				}				
				const FullName = await this.GetNotificationLegalName(user)
				let countryName = ''
				if (userLogin.LocationId) {
					const country = await this.LookupService.GetLookupById(new LookupRequest({ LookupId: userLogin.LocationId }))
					countryName = country?.OfficialName
				}

				const parameters = {
					FullName: FullName ?? ' ',
					UserId: user.Id,
					Id: userPhoneNumber.Id,
					PhoneNumber: userPhoneNumber?.PhoneNumber!,
					Locale: locale,
					Location: `${userLogin.Region ? userLogin.Region + ', ' : ''}${userLogin.City ? userLogin.City + ', ' : ''}${countryName}`,
					Device: `${userLogin.DeviceType} ${userLogin.ClientType} (${userLogin.ClientName}${userLogin.ClientEngineVersion ? ',' + userLogin.ClientEngineVersion : ''})`,
					OS: `${userLogin.OSName}(${userLogin.OSPlatform})`,
					VerificationToken: userPhoneNumber.VerificationToken,
					HostUrl: this.Configuration.hostURL

				}
				//const fromPhoneNumber = this.Configuration.notifications.sms.fromPhoneNumber
				const from = this.Configuration.notifications.sms.fromName
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale)
				const subject = lookups.Notifications.VerifyPhoneNumberNotification.Subject
				const message = StringUtility.StringFormatUsingAnObject(
					super.GetLocalisedTemplate(
						SMSNotificationStrategy.prototype.VerifyPhoneNumberNotification.name,
						locale,
						'txt'
					),
					parameters
				)
				const notification = this.SaveUserNotification({
					To: userPhoneNumber?.PhoneNumber!,
					From: from,
					FromName: from,
					Message: message,
					Parameters: JSON.stringify(parameters),
					Subject: subject,
					UserId: user.Id,
					LanguageId: userLanguage.Id,
					ImportanceId: highImportance.Id,
					CreatedById: user.Id,
					UpdatedById: user.Id,
					Retries: 0
				});
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
		return NOTIFICATION_STATUS.SUCCEEDED
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
