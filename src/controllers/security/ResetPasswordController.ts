import {logInvocation} from '@loopback/logging'
import {param, post, requestBody} from '@loopback/rest'
import {HttpMethodsEnum, IResetPasswordRequest} from '@david.ezechukwu/core'
import {SchemaUtils} from '../../utils'
import {SuperController} from '../SuperController'
import {ResetPasswordRequest, UserResponse} from '../../dtobjects'
import { UserModel } from '../../models'

/**
 * The Front Controller for Forms Authentication Password resetting
 * @category Security
 */
export class ResetPasswordController extends SuperController {
    constructor() {
        super()
    }

	@logInvocation()
	@post(
        `${SuperController.SecurityURLPath}/resetpassword`,
        SchemaUtils.GetOp(UserResponse, {
            Controller: ResetPasswordController.name,
            ControllerMethod: ResetPasswordController.prototype.ResetPasswordRequest.name,
            Method: HttpMethodsEnum.Post,
            Tag: SchemaUtils.SecurityTag,
            Description: "Reset a user's password"
        })
    )
    public async ResetPasswordRequest(
		@param.query.string('locale', { description: `The user's' locale` }) locale: string,
        @requestBody({
            description: 'Please provide details of your new password and the Reset Token associated with it',
            required: true,
            content: {
                // eslint-disable-next-line
                'application/x-www-form-urlencoded': {
                    schema: SchemaUtils.GetRequestSchema<ResetPasswordRequest>(ResetPasswordRequest)
                },
                // eslint-disable-next-line
                'application/json': {
                    schema: SchemaUtils.GetRequestSchema<ResetPasswordRequest>(ResetPasswordRequest)
                }
            }
        })
        resetPasswordRequest: IResetPasswordRequest
    ): Promise<UserResponse> {
        return new Promise<UserResponse>(async (resolve, reject) => {
            try {
				if ( !resetPasswordRequest.Locale ){
					resetPasswordRequest.Locale = locale ?? this.Configuration.localisation.defaultLocale
				}
                const userId = await this.UserService.ResetUserPassword(resetPasswordRequest)
				if ( !userId){
					throw '500[$]The password was updated successfully however an error occurred getting the user record it is associated with'
				}
				const userResponse = await this.UserService.GetUserResponse({Id: userId})
				await this.AuthenticationService.SetSessionUsingExpressReq(this.RequestContext.request, new UserModel({Id: userResponse.UserId}))				
				userResponse!.IsAuthenticated = true				
				this.NotificationService.PasswordResetNotification({Id: userResponse.UserId})			
				return resolve (userResponse)
            } catch (e) {
                return reject(e)
            }
        })
    }
}
