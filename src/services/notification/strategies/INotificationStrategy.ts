import { Where } from '@loopback/repository'
import { IUser, IUserNotification, IGroupNotification } from '@david.ezechukwu/core'
import { LocalisationUtils } from '../../../utils/LocalisationUtils'
import { Lookups } from '../../../_infrastructure/fixtures/localisation/Lookups'
import { NOTIFICATION_STATUS } from '../NotificationStatus'
const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()

/**Common names for Notification Strategies*/
export declare type NotificationStrategyType = 'email' | 'inapp' | 'push' | 'skype' | 'sms' | 'whatsapp' | 'imessage' | 'context'


/**
 * This is the Notification contract 
 */
export interface INotificationStrategy {
	
	/**
	 * An string that designates the strategy, i.e 'email' | 'inapp' | 'push' | 'skype' | 'sms' | 'whatsapp' | 'imessage' | 'context'
	 * With context being the strategy context (executor);  implemented as NotificationService; 
	 */
	readonly NotificationStrategy: NotificationStrategyType	

	/**
	 * Send the notification via it's configured transport'
	 * */
	NotifyUser(notification: Partial<IUserNotification>): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the notification via it's configured transport'
	 * */
	NotifyGroup(notification: Partial<IGroupNotification>): Promise<NOTIFICATION_STATUS>

	/**
	 * Save the user notification to the configured datasources
	 **/
	SaveUserNotification(notification: Partial<IUserNotification>): Promise<IUserNotification[]>

	/**
	 * Save the group notification to the configured datasources
	 **/
	SaveGroupNotification(notification: Partial<IGroupNotification>): Promise<IGroupNotification[]>

	/**
	 * @remarks
	 * This should/could be done with Microsoft SSIS or similar,
	 * hence some subclasses would not implement this and may throw a exception if called	 
	 **/
	ProcessUserNotificationsQueue(limit: number): Promise<IUserNotification[]>

	/**
	 * Processed queued SMS for groups
	 */
	ProcessGroupNotificationsQueue(filter: Where<IGroupNotification>, limit: number): Promise<IGroupNotification[]>

	/**
	 * Notify support staff of any errors
	 **/
	NotifySuppportOfError(error: string, affctedUser?: IUser): Promise<NOTIFICATION_STATUS>
}
