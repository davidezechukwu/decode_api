import {logInvocation} from '@loopback/logging'
import {authorize} from '@loopback/authorization'
import {param, post, put, requestBody} from '@loopback/rest'
import {HttpMethodsEnum, IUserName, ModelIdType} from '@david.ezechukwu/core'
import {AuthenticationService} from '../../services/security/AuthenticationService'
import {AuthorizationService} from '../../services/security/AuthorizationService'
import {SchemaUtils} from '../../utils/SchemaUtils'
import {SuperController} from '../SuperController'
import {UserModel} from '../../models/UserModel'
import {UserNameModel} from '../../models/UserNameModel'
import {UserNameRequest} from '../../dtobjects/requests/UserNameRequest'
import { RestUtils } from '../../utils'


/**
 * The Front Controller for user name operations 
 * @category User
 */
export class UserNameController extends SuperController {
    
	@logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserNameModel.name, scopes: [AuthorizationService.HttpPostScope]})
    @post(
        `${SuperController.UserURLPath}/{userid}/name`,
        SchemaUtils.GetOp(UserNameModel, {
            Controller: UserNameController.name,
            ControllerMethod: UserNameController.prototype.CreateUserName.name,
            Method: HttpMethodsEnum.Post,
            Tag: SchemaUtils.UserTag,
            Description: "Create the user's title, first name, middle name, last name and nickname if any",
			IsSecured: true
        })
    )
    public async CreateUserName(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
        @requestBody({
            description: 'Please provide your title, first name, middle name, last name and nickname if any',
            required: true,
            content: {
                // eslint-disable-next-line
                'application/x-www-form-urlencoded': {
                    schema: SchemaUtils.GetRequestSchema<UserNameRequest>(UserNameRequest)
                },
                // eslint-disable-next-line
                'application/json': {
                    schema: SchemaUtils.GetRequestSchema<UserNameRequest>(UserNameRequest)
                }
            }
        })
        userNameRequest: UserNameRequest
    ): Promise<IUserName | null> {
        return new Promise<IUserName | null>(async (resolve, reject) => {
            try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }
                const username = await this.UserService.CreateUserName(userId, userNameRequest)
                return resolve(username)
            } catch (e) {                
                return reject(e);
            }
        })
    }

    @logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserNameModel.name, scopes: [AuthorizationService.HttpPutScope]})
    @put(
        `${SuperController.UserURLPath}/{userid}/name/{id}`,
        SchemaUtils.GetOp(UserNameModel, {
            Controller: UserNameController.name,
            ControllerMethod: UserNameController.prototype.UpdateUserName.name,
            Method: HttpMethodsEnum.Put,
            Tag: SchemaUtils.UserTag,
            Description: "Update the user's title, first name, middle name, last name and nickname if any",
			IsSecured: true
        })
    )
    public async UpdateUserName(
		@RestUtils.IdFromPath('id') id: ModelIdType,
        @RestUtils.IdFromPath('userid') userId: ModelIdType,
        @requestBody({
            description: 'Please provide your title, first name, middle name, last name and nickname if any',
            required: true,
            content: {
                // eslint-disable-next-line
                'application/x-www-form-urlencoded': {
                    schema: SchemaUtils.GetRequestSchema<UserNameRequest>(UserNameRequest)
                },
                // eslint-disable-next-line
                'application/json': {
                    schema: SchemaUtils.GetRequestSchema<UserNameRequest>(UserNameRequest)
                }
            }
        })
        userNameRequest: UserNameRequest
    ): Promise<IUserName | null> {
        return new Promise<IUserName | null>(async (resolve, reject) => {
            try {
                const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
				 if (!isAllowed) {
                    return reject(permissionError)
                }
                const username = await this.UserService.UpdateUserName(id, userId, userNameRequest)
                return resolve(username)
            } catch (e) {                
                return reject(e);
            }
        })
    }
}
