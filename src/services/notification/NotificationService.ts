import { BindingKey, inject, injectable } from '@loopback/core'
import { Where } from '@loopback/repository'
import {
	IUserNotification,
	IUser,
	IGroupNotification,
	IUserLogin,
    IUserEmailAddress,
    IUserPhoneNumber,
    IUserPassword
} from '@david.ezechukwu/core'
import {
	INotificationStrategy,	
	NotificationStrategyType
} from './strategies/INotificationStrategy'
import { NOTIFICATION_STATUS } from './NotificationStatus'
import {
	EmailNotificationStrategy,
	InAppNotificationStrategy,
	SMSNotificationStrategy,
	SuperNotificationStrategy
} from './strategies'
import { SuperService } from '../SuperService'
import { SuperBindings } from '../../SuperBindings'
import { LoggingBindings, WinstonLogger } from '@loopback/logging'



/**
 * This is the Notification Strategy Context.
 * @remarks
 * 
 */
@injectable({ tags: { key: SuperBindings.NotificationServiceBindingKey.key } })
export class NotificationService extends SuperService implements INotificationStrategy {
	static BINDING_KEY = BindingKey.create<NotificationService>(`services.${NotificationService.name}`)
	/**
	 * The list of supported notification strategies
	 */
	protected readonly NotificationStrategies: SuperNotificationStrategy[]

	/**
	 * The Literal string that designates the strategy as 'context'
	 * With context being the strategy context (executor);  implemented as NotificationService; 
	 */
	public NotificationStrategy: NotificationStrategyType = 'context'

	/**
	 * The base class for all Strategy services
	 * @remarks
	 * Uses the Template Method Pattern for the initialization of the actual strategy.
	 * Strategy could be email(SMTP), SMS, WhatsApp, Push Notifications, InApp, Skype, etc
	 * */
	public constructor(
		@inject(InAppNotificationStrategy.BINDING_KEY.key)
		inAppNotificationStrategy: InAppNotificationStrategy,
		@inject(EmailNotificationStrategy.BINDING_KEY.key)
		emailNotificationStrategy: EmailNotificationStrategy,
		@inject(SMSNotificationStrategy.BINDING_KEY.key)
		sMSNotificationStrategy: SMSNotificationStrategy,
		@inject(LoggingBindings.WINSTON_LOGGER)
		protected Logger: WinstonLogger
	) {
		super()
		this.NotificationStrategies = []
		this.NotificationStrategies.push(inAppNotificationStrategy)
		this.NotificationStrategies.push(emailNotificationStrategy)
		this.NotificationStrategies.push(sMSNotificationStrategy)

		for (let a = 0; a < this.NotificationStrategies.length; a++) {
			this.Logger.info(`${NotificationService.name} ${this.NotificationStrategies[a].NotificationStrategy} Notification Strategy configured`)
		}
	}



	/**
	 * Send user notifications
	 * */
	public async NotifyUser(notification: Partial<IUserNotification>): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.NotifyUser(notification)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.NotifyUser.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send group notifications
	 * */
	public async NotifyGroup(notification: IGroupNotification): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.NotifyGroup(notification)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.NotifyGroup.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	* Save the user notification to the configured datasources
	**/
	public async SaveUserNotification(notification: Partial<IUserNotification>): Promise<IUserNotification[]> {
		return new Promise<IUserNotification[]>((resolve, reject) => {
			try {
				let response: IUserNotification[] = []
				const actions: Promise<IUserNotification[]>[] = []
				this.NotificationStrategies.forEach(s => actions.push(s.SaveUserNotification(notification)))
				Promise.all(actions).then(results => {
					results.forEach(r => r.forEach(rs => response.push(rs)))
					return resolve(response)
				}).catch(err => {
					this.Logger.error(`666[$]${NotificationService.name}.${this.SaveGroupNotification.name} failed <becauseOf>${JSON.stringify(err)}</becauseOf>`)
					this.NotifySuppportOfError(err)
					return reject(err)
				})
			} catch (e) {
				const error = `666[$]${NotificationService.name}.${this.SaveUserNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
				this.Logger.error(error)
				this.NotifySuppportOfError(error)
				return reject(e)
			}
		})
	}

	/**
	 * Save the group notification to the configured datasources
	**/
	public async SaveGroupNotification(notification: Partial<IGroupNotification>): Promise<IGroupNotification[]> {
		return new Promise<IGroupNotification[]>((resolve, reject) => {
			try {
				let response: IGroupNotification[] = []
				const actions: Promise<IGroupNotification[]>[] = []
				this.NotificationStrategies.forEach(s => actions.push(s.SaveGroupNotification(notification)))
				Promise.all(actions).then(results => {
					results.forEach(r => r.forEach(rs => response.push(rs)))
					return resolve(response)
				}).catch(err => {
					this.Logger.error(`666[$]${NotificationService.name}.${this.SaveGroupNotification.name} failed <becauseOf>${JSON.stringify(err)}</becauseOf>`)
					this.NotifySuppportOfError(err)
					return reject(`See earlier 666[$]${NotificationService.name}.${this.SaveGroupNotification.name} errors`)
				})
			} catch (e) {
				const error = `666[$]${NotificationService.name}.${this.SaveGroupNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
				this.Logger.error(error)
				this.NotifySuppportOfError(error)
				return reject(error)
			}
		})
	}

	/**
	 * Process saved notifications which have either failed or not been processed
	 * */
	public async ProcessUserNotificationsQueue(limit: number = 50): Promise<IUserNotification[]> {
		return new Promise<IUserNotification[]>((resolve, reject) => {
			try {
				let response: IUserNotification[] = []
				const actions: Promise<IUserNotification[]>[] = []
				this.NotificationStrategies.forEach(s => actions.push(s.ProcessUserNotificationsQueue(limit)))
				Promise.all(actions).then(results => {
					results.forEach(r => r.forEach(rs => response.push(rs)))
					return resolve(response)
				}).catch(err => {
					this.Logger.error(`666[$]${NotificationService.name}.${this.ProcessUserNotificationsQueue.name} failed <becauseOf>${JSON.stringify(err)}</becauseOf>`)
					this.NotifySuppportOfError(err)
					return reject(`See earlier 666[$]${NotificationService.name}.${this.ProcessUserNotificationsQueue.name} errors`)
				})
			} catch (e) {
				const error = `666[$]${NotificationService.name}.${this.ProcessUserNotificationsQueue.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
				this.Logger.error(error)
				this.NotifySuppportOfError(error)
				return reject(error)
			}
		})
	}

	/**
	 * Processed queued SMS for groups
	 */
	public async ProcessGroupNotificationsQueue(filter: Where<IGroupNotification>, limit: number): Promise<IGroupNotification[]> {
		return new Promise<IGroupNotification[]>((resolve, reject) => {
			try {
				let response: IGroupNotification[] = []
				const actions: Promise<IGroupNotification[]>[] = []
				this.NotificationStrategies.forEach(s => actions.push(s.ProcessGroupNotificationsQueue(filter, limit)))
				Promise.all(actions).then(results => {
					results.forEach(r => r.forEach(rs => response.push(rs)))
					return resolve(response)
				}).catch(err => {
					this.Logger.error(`666[$]${NotificationService.name}.${this.ProcessGroupNotificationsQueue.name} failed <becauseOf>${JSON.stringify(err)}</becauseOf>`)
					this.NotifySuppportOfError(err)
					return reject(`See earlier 666[$]${NotificationService.name}.${this.ProcessGroupNotificationsQueue.name} errors`)
				})
			} catch (e) {
				const error = `666[$]${NotificationService.name}.${this.ProcessGroupNotificationsQueue.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
				this.Logger.error(error)
				this.NotifySuppportOfError(error)
				return reject(error)
			}
		})
	}

	/**
	 * Notify support staff of any errors
	 **/
	public async NotifySuppportOfError(error: string, affctedUser?: IUser): Promise<NOTIFICATION_STATUS> {
		try {			
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.NotifySuppportOfError.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)			
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Welcome Notification' after registration
	 * */
	public async WelcomeNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.WelcomeNotification(user, userLogin)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.WelcomeNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Verify Email Address notification' after user adds an email address
	 **/
	public async VerifyEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.VerifyEmailAddressNotification(user, userEmalAddress, userLogin)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.VerifyEmailAddressNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Thank you for Verifying Your Email Address notification' after user adds an email address
	**/
	public async ThankYouForVerifyingYourEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.ThankYouForVerifyingYourEmailAddressNotification(user, userEmalAddress)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.ThankYouForVerifyingYourEmailAddressNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}	

	/**
	 * Send the 'Verify Phone Number notification' after user adds a phone number
	 **/
	public async VerifyPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.VerifyPhoneNumberNotification(user, userPhoneNumber, userLogin)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.VerifyPhoneNumberNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Thank you for Verifying Your Phone Number  notification' after user adds an email address
	**/
	public async ThankYouForVerifyingYourPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.ThankYouForVerifyingYourPhoneNumberNotification(user, userPhoneNumber)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.ThankYouForVerifyingYourPhoneNumberNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Login notification' after user logs in 
	 **/
	public async LoginNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.LoginNotification(user, userLogin)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.LoginNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Login From A New Device Notification' when a user logs in from a new device
	 **/
	public async LoginOnNewDeviceNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.LoginOnNewDeviceNotification(user)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.LoginOnNewDeviceNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Login From A New Location Notification' when a user logs in from a new device
	 **/
	public async LoginOnNewLocationNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.LoginOnNewLocationNotification(user)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.LoginOnNewLocationNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'No Primary Email Address notification' if the user has no primary email address ( this is so on OAUTH) or if primary email address has been deleted
	 **/
	public async NoPrimaryEmailAddressNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.NoPrimaryEmailAddressNotification(user)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.NoPrimaryEmailAddressNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'No Local Logon notification' if the user has no primary email address ( this is so on OAUTH)
	 **/
	public async NoLocalLogonNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.NoLocalLogonNotification(user)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.NoLocalLogonNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Forgot Password notification' when the user wishes to change their password	
	 **/
	public async ForgotPasswordNotification(user: IUser, userLogin: IUserLogin, userPassword: IUserPassword): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.ForgotPasswordNotification(user, userLogin, userPassword)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.ForgotPasswordNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Password Reset notification' when the user reset their password
	 *
	 **/
	public async PasswordResetNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.PasswordResetNotification(user)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.SUCCEEDED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.PasswordResetNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Change Password notification' when the user wishes to change their password
	 **/
	public async ChangePasswordNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.ChangePasswordNotification(user, userLogin)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.FAILED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.ChangePasswordNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}

	/**
	 * Send the 'Password Changed notification' when the user changed their password
	 *
	 **/
	public async PasswordChangedNotification(user: IUser): Promise<NOTIFICATION_STATUS> {
		try {
			const actions: Promise<NOTIFICATION_STATUS>[] = []
			this.NotificationStrategies.forEach(s => actions.push(s.PasswordChangedNotification(user)))
			await Promise.all(actions)
			return NOTIFICATION_STATUS.FAILED
		} catch (e) {
			const error = `666[$]${NotificationService.name}.${this.PasswordChangedNotification.name} failed<becauseOf>${JSON.stringify(e)}</becauseOf>`
			this.Logger.error(error)
			this.NotifySuppportOfError(error)
			return NOTIFICATION_STATUS.FAILED
		}
	}
}
