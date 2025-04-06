import {post} from '@loopback/rest'
import {HttpMethodsEnum} from '@david.ezechukwu/core'
import {AuthenticationService} from '../../services'
import {SchemaUtils} from '../../utils'
import {SuperController} from '../SuperController'

/**
 * The Front Controller for Forms Authentication Logout
 * @remarks
 * This is used to log out, per device, across sessions, and all devices and sessions (TODO:)
 * It also provides a history of logins (TODO: either in it's own controller or the login controller)
 * @category Security
 */
export class LogoutController extends SuperController {
    constructor() {
        super()
    }
    
    @AuthenticationService.RequireSessionAuthentication()
    @post(
        `${SuperController.SecurityURLPath}/logout`,
        SchemaUtils.GetOpWithoutModel({
            Id: 'Logout',
            Controller: LogoutController.name,
            ControllerMethod: LogoutController.prototype.Logout.name,
            Method: HttpMethodsEnum.Post,
            Tag: SchemaUtils.SecurityTag,
            Description: 'Log out'
        })
    )
    public async Logout(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {                
                await this.AuthenticationService.SignOut({Id: this.Request.session.User?.Id})
                await this.AuthenticationService.DestroySession(this.Request)
                resolve()
            } catch (e) {
                const args = `provider=local`
                this.Logger.error(`The call to ${LogoutController.name}.${LogoutController.prototype.Logout.name}(${args}) failed with this error: ${e.toString()}`)
                reject(e)
            }
        })
    }
}
