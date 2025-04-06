import {logInvocation} from '@loopback/logging'
import {get, param } from '@loopback/rest'
import {HttpMethodsEnum, ModelIdType} from '@david.ezechukwu/core'
import {SchemaUtils, RestUtils} from '../../utils'
import {SuperController} from '../SuperController'
import {RoleModel} from '../../models'
import {RoleRepositoryService} from '../../repositories'
import {inject} from '@loopback/core'

/**
 * The Front Controller for Authorization Roles
 * @remarks
 * Casbin is used for authorization. Roles are defined in Casbin Policies. There is a UX component for managing roles under the Admin Menu for those with Admin rights
 * @category Security
 */
export class RoleController extends SuperController {
    constructor(
        @inject(RoleRepositoryService.BINDING_KEY.key)
        protected RoleRepositoryService: RoleRepositoryService
    ) {
        super()
    }

    @logInvocation()
    @get(
        `${SuperController.SecurityURLPath}/roles/{id}`,
        SchemaUtils.GetOp(RoleModel, {
            Controller: RoleController.name,
            ControllerMethod: RoleController.prototype.GetRole.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.SecurityTag
        })
    )
    public async GetRole(
        @RestUtils.IdFromPath('id')
        roleId: ModelIdType,
        @param.query.string('locale', {description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.`}) locale: string,
        @param.query.string('device', {description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.`}) device: string
    ): Promise<RoleModel | null> {
        return new Promise<RoleModel | null>(async (resolve, reject) => {
            try {
                const roleResponse: RoleModel | null = await this.RoleRepositoryService.FindOne({where: {Id: roleId}})
                return resolve(roleResponse)
            } catch (e) {
                this.Logger.error(`The call to ${RoleController.name}.${RoleController.prototype.GetRole.name}() failed with this error: ${e.toString()}`)
                reject(e)
            }
        })
    }

    @logInvocation()
    @get(
        `${SuperController.SecurityURLPath}/roles`,
        SchemaUtils.GetOp(RoleModel, {
            Controller: RoleController.name,
            ControllerMethod: RoleController.prototype.GetRoles.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.SecurityTag,
            IsForArray: true
        })
    )
    public async GetRoles(
        @param.query.string('locale', {description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.`}) locale: string,
        @param.query.string('device', {description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.`}) device: string
    ): Promise<RoleModel[] | null> {
        return new Promise<RoleModel[] | null>(async (resolve, reject) => {
            try {
                const resp: RoleModel[] | null = await this.RoleRepositoryService.Find()
                return resolve(resp)
            } catch (e) {
                this.Logger.error(`The call to ${RoleController.name}.${RoleController.prototype.GetRoles.name}() failed with this error: ${e.toString()}`)
                reject(e)
            }
        })
    }
}
