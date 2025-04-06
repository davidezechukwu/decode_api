import {logInvocation} from '@loopback/logging'
import {authorize} from '@loopback/authorization'
import {param, put, requestBody} from '@loopback/rest'
import {HttpMethodsEnum, IUserCommunicationPreferences, ModelIdType, IUserCommunicationPreferencesRequest} from '@david.ezechukwu/core'
import {AuthenticationService, AuthorizationService} from '../../services'
import {RestUtils, SchemaUtils} from '../../utils'
import {SuperController} from '../SuperController'
import {UserCommunicationPreferencesModel} from '../../models'
import {UserCommunicationPreferencesRequest} from '../../dtobjects/requests/UserCommunicationPreferencesRequest'

/**
 * The Front Controller for user communication preferences operations 
 * @category User
 */
export class UserCommunicationPreferencesController extends SuperController {
    @logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserCommunicationPreferencesModel.name, scopes: [AuthorizationService.HttpPutScope]})
    @put(
        `${SuperController.UserURLPath}/{userid}/communicationpreferences/{id}`,
        SchemaUtils.GetOp(UserCommunicationPreferencesModel, {
            Controller: UserCommunicationPreferencesController.name,
            ControllerMethod: UserCommunicationPreferencesController.prototype.UpdateUserCommunicationPreferences.name,
            Method: HttpMethodsEnum.Put,
            Tag: SchemaUtils.UserTag,
            Description: "Update the user's communication preferences",
			IsSecured: true
        })
    )
    public async UpdateUserCommunicationPreferences(
        @RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType,
        @requestBody({
            description: "Communication preferences",
            required: true,
            content: {
                // eslint-disable-next-line
                'application/x-www-form-urlencoded': {
                    schema: SchemaUtils.GetRequestSchema<UserCommunicationPreferencesRequest>(UserCommunicationPreferencesRequest)
                },
                // eslint-disable-next-line
                'application/json': {
                    schema: SchemaUtils.GetRequestSchema<UserCommunicationPreferencesRequest>(UserCommunicationPreferencesRequest)
                }
            }
        })
        userCommunicationPreferencesRequest: IUserCommunicationPreferencesRequest
    ): Promise<IUserCommunicationPreferences | null> {
        return new Promise<IUserCommunicationPreferences | null>(async (resolve, reject) => {
            try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }
                const updatedUserCommunicationPreferences = await this.UserService.UpdateUserCommunicationPreferences(id, userId, userCommunicationPreferencesRequest)
                return resolve(updatedUserCommunicationPreferences)
            } catch (e) {
                return reject(e)
            }
        })
    }
}
