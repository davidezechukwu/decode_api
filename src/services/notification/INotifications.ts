import { IUser, IUserEmailAddress, IUserLogin, IUserPassword, IUserPhoneNumber } from '@david.ezechukwu/core'
import { NOTIFICATION_STATUS } from './NotificationStatus'


/**
 * This is the Notification contract 
 */
export interface INotifications {
	/**
	 * Send the 'Welcome Notification' after registration
	 *
	 * */
	WelcomeNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Verify Email Address notification' after user adds an email address
	 *
	 **/
	VerifyEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Thank you for Verifying Your Email Address notification' after user adds an email address
	 *
	**/
	ThankYouForVerifyingYourEmailAddressNotification(user: IUser, userEmalAddress: IUserEmailAddress): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Verify Phone Number notification' after user adds a phone number
	 *
	 **/
	VerifyPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Thank you for Verifying Your Phone Number  notification' after user adds an email address
	 *
	**/
	ThankYouForVerifyingYourPhoneNumberNotification(user: IUser, userPhoneNumber: IUserPhoneNumber): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Login notification' after user logs in 
	 *
	 **/
	LoginNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Login From A New Device Notification' when a user logs in from a new device
	 *
	 **/
	LoginOnNewDeviceNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Login From A New Location Notification' when a user logs in from a new device
	 *
	 **/
	LoginOnNewLocationNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'No Primary Email Address notification' if the user has no primary email address ( this is so on OAUTH) or if primary email address has been deleted
	 *
	 **/
	NoPrimaryEmailAddressNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'No Local Logon notification' if the user has no primary email address ( this is so on OAUTH)
	 *
	 **/
	NoLocalLogonNotification(user: IUser): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Forgot Password notification' when the user wishes to change their password
	 *
	 **/
	ForgotPasswordNotification(user: IUser, userLogin: IUserLogin, userPassword: IUserPassword): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Password Reset notification' when the user reset their password
	 *
	 **/
	PasswordResetNotification(user: IUser): Promise<NOTIFICATION_STATUS>
	
	/**
	 * Send the 'Change Password notification' when the user wishes to change their password
	 *
	 **/
	ChangePasswordNotification(user: IUser, userLogin: IUserLogin): Promise<NOTIFICATION_STATUS>

	/**
	 * Send the 'Password Changed notification' when the user changed their password
	 *
	 **/
	PasswordChangedNotification(user: IUser): Promise<NOTIFICATION_STATUS>
	
}
