import {logInvocation} from '@loopback/logging'
import {authorize} from '@loopback/authorization'
import {param, put, requestBody} from '@loopback/rest'
import {HttpMethodsEnum, IUserDisplaySettings, ModelIdType, IUserDisplaySettingsRequest} from '@david.ezechukwu/core'
import {AuthenticationService, AuthorizationService} from '../../services'
import {RestUtils, SchemaUtils} from '../../utils'
import {SuperController} from '../SuperController'
import {UserDisplaySettingsModel} from '../../models'
import {UserDisplaySettingsRequest} from '../../dtobjects/requests/UserDisplaySettingsRequest'

/**
 * The Front Controller for user display settings operations 
 * @category User
 */
export class UserDisplaySettingsController extends SuperController {
    @logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserDisplaySettingsModel.name, scopes: [AuthorizationService.HttpPutScope]})
    @put(
        `${SuperController.UserURLPath}/{userid}/displaysettings/{id}`,
        SchemaUtils.GetOp(UserDisplaySettingsModel, {
            Controller: UserDisplaySettingsController.name,
            ControllerMethod: UserDisplaySettingsController.prototype.UpdateUserDisplaySettings.name,
            Method: HttpMethodsEnum.Put,
            Tag: SchemaUtils.UserTag,
            Description: "Update the user's display settings",
			IsSecured: true
        })
    )
    public async UpdateUserDisplaySettings(
        @RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType,
        @requestBody({
            description: "Display settings",
            required: true,
            content: {
                // eslint-disable-next-line
                'application/x-www-form-urlencoded': {
                    schema: SchemaUtils.GetRequestSchema<UserDisplaySettingsRequest>(UserDisplaySettingsRequest)
                },
                // eslint-disable-next-line
                'application/json': {
                    schema: SchemaUtils.GetRequestSchema<UserDisplaySettingsRequest>(UserDisplaySettingsRequest)
                }
            }
        })
        userDisplaySettingsRequest: IUserDisplaySettingsRequest
    ): Promise<IUserDisplaySettings | null> {
        return new Promise<IUserDisplaySettings | null>(async (resolve, reject) => {
            try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }
                const updatedUserDisplaySettings = await this.UserService.UpdateUserDisplaySettings(id, userId, userDisplaySettingsRequest)
                return resolve(updatedUserDisplaySettings)
            } catch (e) {
                return reject(e)
            }
        })
    }
}
