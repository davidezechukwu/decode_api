import {logInvocation} from '@loopback/logging'
import {authorize} from '@loopback/authorization'
import {param, get} from '@loopback/rest'
import {HttpMethodsEnum, IUserLogin, ModelIdType} from '@david.ezechukwu/core'
import {AuthenticationService} from '../../services/security/AuthenticationService'
import {AuthorizationService} from '../../services/security/AuthorizationService'
import {SchemaUtils} from '../../utils/SchemaUtils'
import {SuperController} from '../SuperController'
import {UserLoginModel} from '../../models/UserLoginModel'
import { RestUtils } from '../../utils'


/**
 * The Front Controller for user login (login history) operations 
 * @category User
 */
export class UserLoginController extends SuperController {
    
	@logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserLoginModel.name, scopes: [AuthorizationService.HttpGetScope]})
    @get(
        `${SuperController.UserURLPath}/{userid}/logins`,
        SchemaUtils.GetOp(UserLoginModel, {
            Controller: UserLoginController.name,
            ControllerMethod: UserLoginController.prototype.GetUserLogins.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.UserTag,
            Description: "Get login history",
			IsSecured: true
        })
    )
    public async GetUserLogins(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@param.query.date('fromdate') fromDate?: Date,
		@param.query.date('todate') toDate?: Date,
		@param.query.number('skip') skip?: number,
		@param.query.number('limit') limit?: number,
    ): Promise<IUserLogin[] | null> {
        return new Promise<IUserLogin[] | null>(async (resolve, reject) => {
            try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }
                const userlogins = await this.UserService.GetUserLogins(userId, fromDate, toDate, skip, limit)
                return resolve(userlogins)
            } catch (e) {                
                return reject(e);
            }
        })
    }
	@logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserLoginModel.name, scopes: [AuthorizationService.HttpGetScope]})
    @get(
        `${SuperController.UserURLPath}/{userid}/logins/{id}`,
        SchemaUtils.GetOp(UserLoginModel, {
            Controller: UserLoginController.name,
            ControllerMethod: UserLoginController.prototype.GetUserLogin.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.UserTag,
            Description: "Get a login",
			IsSecured: true
        })
    )
    public async GetUserLogin(
		@RestUtils.IdFromPath('userid') userId: ModelIdType,
		@RestUtils.IdFromPath('id') id: ModelIdType		
    ): Promise<IUserLogin | null> {
        return new Promise<IUserLogin | null>(async (resolve, reject) => {
            try {
				const [isAllowed, permissionError] = await super.IsUserActionAllowed(userId)
                if (!isAllowed) {
                    return reject(permissionError)
                }
                const userlogin = await this.UserService.GetUserLogin(userId, id)
                return resolve(userlogin)
            } catch (e) {                
                return reject(e);
            }
        })
    }
    
}
