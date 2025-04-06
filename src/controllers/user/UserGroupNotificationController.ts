import { logInvocation } from '@loopback/logging'
import { authorize } from '@loopback/authorization'
import { get, param } from '@loopback/rest'
import { HttpMethodsEnum, ModelIdType } from '@david.ezechukwu/core'
import { AuthenticationService } from '../../services/security/AuthenticationService'
import { AuthorizationService } from '../../services/security/AuthorizationService'
import { SchemaUtils } from '../../utils/SchemaUtils'
import { SuperController } from '../SuperController'
import { RestUtils } from '../../utils/RestUtils'
import { GroupNotificationModel } from '../../models/GroupNotificationModel'
import { NotificationRequest } from '../../dtobjects/requests/NotificationRequest'

/**
 * The Front Controller for user group notifications
 * @remarks 
 * This is the controller for querying user notifications ( sms, email, inapp, etc) meant for a group the user belongs to
 * @category User
 */
export class UserGroupNotificationController extends SuperController {
	@logInvocation()
	@AuthenticationService.RequireSessionAuthentication()
	@authorize({ resource: GroupNotificationModel.name, scopes: [AuthorizationService.HttpGetScope] })
	@get(
		`${SuperController.UserURLPath}/{userid}/groupnotifications/{groupid}`,
		SchemaUtils.GetOp(GroupNotificationModel, {
			Controller: UserGroupNotificationController.name,
			ControllerMethod: UserGroupNotificationController.prototype.GetUserGroupNotifications.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.UserTag,
			Description: "Get the user's group notifications. Note: 'notificationstrategyvalue' overrides notificationstrategyid",
			IsSecured: true
		})
	)
	public async GetUserGroupNotifications(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('groupid') groupId: ModelIdType,
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
	): Promise<GroupNotificationModel[] | null> {
		return new Promise<GroupNotificationModel[] | null>(async (resolve, reject) => {
			try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
				if (!isAllowed) {
					return reject(permissionError)
				}
				const notifications = await this.UserService.GetUserGroupNotifications(userId, groupId,  new NotificationRequest({
					FromDate: fromDate,
					ToDate: toDate,
					FromId: fromId,
					ToId: toId,
					NotificationStatusId: notificationStatusId,
					NotificationStrategyValue: notificationStrategyValue,
					NotificationStrategyId: notificationStrategyId,
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
	@authorize({ resource: GroupNotificationModel.name, scopes: [AuthorizationService.HttpGetScope] })
	@get(
		`${SuperController.UserURLPath}/{userid}/groupnotifications`,
		SchemaUtils.GetOp(GroupNotificationModel, {
			Controller: UserGroupNotificationController.name,
			ControllerMethod: UserGroupNotificationController.prototype.GetUserGroupsNotifications.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.UserTag,
			Description: "Get the user's user group notifications",
			IsSecured: true
		})
	)
	public async GetUserGroupsNotifications(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,		
		@param.query.date('fromdate') fromDate?: Date,
		@param.query.date('todate') toDate?: Date,
		@RestUtils.IdFromQuery('fromid') fromId?: ModelIdType,		
		@RestUtils.IdFromQuery('toid') toId?: ModelIdType,		
		@RestUtils.IdFromQuery('notificationstrategyid') notificationStrategyId?: ModelIdType,
		@RestUtils.IdFromQuery('notificationstatusid') notificationStatusId?: ModelIdType,
		@RestUtils.IdFromQuery('importanceid') importanceId?: ModelIdType,
		@param.query.string('searchphrase') searchPhrase?: string,
		@param.query.number('skip') skip?: number,
		@param.query.number('limit') limit?: number,
	): Promise<GroupNotificationModel[] | null> {
		return new Promise<GroupNotificationModel[] | null>(async (resolve, reject) => {
			try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
				if (!isAllowed) {
					return reject(permissionError)
				}
				const notifications = await this.UserService.GetUserGroupsNotifications(userId, new NotificationRequest({
					FromDate: fromDate,
					ToDate: toDate,
					FromId: fromId,
					ToId: toId,
					NotificationStatusId: notificationStatusId,
					NotificationStrategyId: notificationStrategyId,
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
}
