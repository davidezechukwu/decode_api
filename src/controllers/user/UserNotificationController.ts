import {logInvocation} from '@loopback/logging'
import {authorize} from '@loopback/authorization'
import {get, param, put, requestBody} from '@loopback/rest'
import {HttpMethodsEnum, ModelIdType} from '@david.ezechukwu/core'
import {AuthenticationService} from '../../services/security/AuthenticationService'
import {AuthorizationService} from '../../services/security/AuthorizationService'
import {SchemaUtils} from '../../utils/SchemaUtils'
import {SuperController} from '../SuperController'
import { RestUtils } from '../../utils/RestUtils'
import { UserNotificationModel } from '../../models/UserNotificationModel'
import { NotificationRequest } from '../../dtobjects/requests/NotificationRequest'
import { NotificationStatusUpdateRequest } from '../../dtobjects'

/**
 * The Front Controller for user notifications
 * @remarks 
 * This is the controller for querying user notifications ( sms, email, inapp, etc) meant for a group the user belongs to 
 * @category User
 */
export class UserNotificationController extends SuperController {    
	@logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserNotificationModel.name, scopes: [AuthorizationService.HttpGetScope]})
    @get(
        `${SuperController.UserURLPath}/{userid}/notifications`,
        SchemaUtils.GetOp(UserNotificationModel, {
            Controller: UserNotificationController.name,
            ControllerMethod: UserNotificationController.prototype.GetUserNotifications.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.UserTag,
            Description: "Get the user's notifications. Note: 'notificationstrategyvalue' overrides notificationstrategyid",
			IsSecured: true
        })
    )
    public async GetUserNotifications(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,		
        @param.query.date('fromdate') fromDate?: Date,
		@param.query.date('todate') toDate?: Date,
		@RestUtils.IdFromQuery('fromid') fromId?: ModelIdType,		
		@RestUtils.IdFromQuery('toid') toId?: ModelIdType,		
		@RestUtils.IdFromQuery('notificationstrategyid') notificationStrategyId?: ModelIdType,		
		@RestUtils.IdFromQuery('notificationstatusid') notificationStatusId?: ModelIdType,
		@RestUtils.IdFromQuery('importanceid') importanceId?: ModelIdType,		
		@param.query.string('notificationstrategyvalue') notificationStrategyValue?: string,
		@param.query.string('searchphrase') searchPhrase?: string,
		@param.query.number('skip') skip?: number,
		@param.query.number('limit') limit?: number,
    ): Promise<UserNotificationModel[] | null> {
        return new Promise<UserNotificationModel[] | null>(async (resolve, reject) => {
            try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }

                const notifications = await this.UserService.GetUserNotifications(userId, new NotificationRequest({
					FromDate: fromDate,
					ToDate: toDate,
					FromId: fromId,
					ToId: toId,
					NotificationStatusId: notificationStatusId,
					NotificationStrategyId: notificationStrategyId,
					NotificationStrategyValue: notificationStrategyValue,
					ImportanceId: importanceId,
					SearchPhrase: searchPhrase,
					Skip: skip,
					Limit: limit
				}))
                return resolve(notifications)
            } catch (e) {
               return reject(e)                                    
            }
        })
    }    


	@logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserNotificationModel.name, scopes: [AuthorizationService.HttpPutScope]})
    @put(
        `${SuperController.UserURLPath}/{userid}/notifications/{id}`,
        SchemaUtils.GetOp(UserNotificationModel, {
            Controller: UserNotificationController.name,
            ControllerMethod: UserNotificationController.prototype.UpdateUserNotification.name,
            Method: HttpMethodsEnum.Put,
            Tag: SchemaUtils.UserTag,
            Description: "Update a user notification's status",
			IsSecured: true
        })
    )
    public async UpdateUserNotification(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,		
		@RestUtils.IdFromPath('id') id: ModelIdType,		 
		@requestBody({
            description: 'Please provide the Notification Status Id',
            required: true,
            content: {
                // eslint-disable-next-line
                'application/x-www-form-urlencoded': {
                    schema: SchemaUtils.GetRequestSchema<NotificationStatusUpdateRequest>(NotificationStatusUpdateRequest)
                },
                // eslint-disable-next-line
                'application/json': {
                    schema: SchemaUtils.GetRequestSchema<NotificationStatusUpdateRequest>(NotificationStatusUpdateRequest)
                }
            }
        })
        notificationStatusUpdateRequest: NotificationStatusUpdateRequest
    ): Promise<UserNotificationModel | null> {
        return new Promise<UserNotificationModel | null>(async (resolve, reject) => {
            try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }

                const notification = await this.UserService.UpdateUserNotification(userId, id, notificationStatusUpdateRequest)
                return resolve(notification)
            } catch (e) {
               return reject(e)                                    
            }
        })
    }
}
