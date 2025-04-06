import {logInvocation} from '@loopback/logging'
import {authorize} from '@loopback/authorization'
import {get, param} from '@loopback/rest'
import {HttpMethodsEnum, IUserEmailAddress, IUserPhoneNumber, IUserResponse, ModelIdType} from '@david.ezechukwu/core'
import {AuthenticationService, AuthorizationService} from '../../services'
import {SchemaUtils} from '../../utils'
import {SuperController} from '../SuperController'
import {UserResponse} from '../../dtobjects/responses/UserResponse'
import {UserModel} from '../../models'


/**
 * The Front Controller for user email address operations. 
 * @remarks
 * Only the top 200  most recent notifications and logins are returned. 
 * Verification tokens requiring modification either via email or sms, if present, are replaced with '__hidden_on_api__' 
 * @category User
 */
export class UserController extends SuperController {
    @logInvocation()
    @AuthenticationService.RequireSessionAuthentication()
    @authorize({resource: UserResponse.name, scopes: [AuthorizationService.HttpGetScope]})
    @get(
        `user`,
        SchemaUtils.GetOp(UserResponse, {            
            Controller: UserController.name,
            ControllerMethod: UserController.prototype.GetUserResponse.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.UserTag,
            Description: 'Get the details of the authenticated user using the session on the current browser. Only the top 200  most recent notifications and logins are returned. Verification tokens requiring modification either via email or sms, if present, are replaced with __hidden_on_api__ ',
			IsSecured: true
        })
    )
    public async GetUserResponse(): Promise<IUserResponse | null> {
        return new Promise<IUserResponse | null>(async (resolve, reject) => {
            try {
				const userResponse = await this.UserService.GetUserResponse(new UserModel({Id: this.RequestContext.request.session.User?.Id}))
				//blank out email address and phone number verification tokens
				userResponse?.UserEmailAddresses.forEach((userEmailAddress: IUserEmailAddress) => {
					if ( userEmailAddress.VerificationToken){
						userEmailAddress.VerificationToken = '__hidden_on_api__'
					}
				})
				userResponse?.UserPhoneNumbers.forEach((userPhoneNumber: IUserPhoneNumber) => {
					if ( userPhoneNumber.VerificationToken){
						userPhoneNumber.VerificationToken = '__hidden_on_api__'
					}
				})
                return resolve(userResponse)                
            } catch (e) {                
                return reject(e);
            }
        })
    }
}
