import {logInvocation} from '@loopback/logging'
import {get, param } from '@loopback/rest'
import {HttpMethodsEnum, ModelIdType} from '@david.ezechukwu/core'
import {SchemaUtils, RestUtils} from '../../utils'
import {SuperController} from '../SuperController'
import {GroupRepositoryService} from '../../repositories'
import {inject} from '@loopback/core'
import { GroupModel } from '../../models'

/**
 * The Front Controller for managing security groups. 
 * @remarks
 * Casbin is used for authorization. Roles are defined in Casbin Policies. There is a UX component for managing roles under the Admin Menu for those with Admin rights
 * @category Security
 *
 */
export class GroupController extends SuperController {
    constructor(
        @inject(GroupRepositoryService.BINDING_KEY.key)
        protected GroupRepositoryService: GroupRepositoryService
    ) {
        super()
    }

    /**
     * Get by id     
     * @remarks
     * * Get a security group based on an id
     */
    @logInvocation()
    @get(
        `${SuperController.SecurityURLPath}/groups/{id}`,
        SchemaUtils.GetOp(GroupModel, {
            Controller: GroupController.name,
            ControllerMethod: GroupController.prototype.GetGroup.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.SecurityTag
        })
    )
    public async GetGroup(
        @RestUtils.IdFromPath('id')
        groupId: ModelIdType,
        @param.query.string('locale', {description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.`}) locale: string,
        @param.query.string('device', {description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.`}) device: string
    ): Promise<GroupModel | null> {
        return new Promise<GroupModel | null>(async (resolve, reject) => {
            try {
                const groupResponse: GroupModel | null = await this.GroupRepositoryService.FindOne({where: {Id: groupId}})
                return resolve(groupResponse)
            } catch (e) {
                this.Logger.error(`The call to ${GroupController.name}.${GroupController.prototype.GetGroup.name}() failed with this error: ${e.toString()}`)
                reject(e)
            }
        })
    }

    /**
     * Get all
     * @remarks
     * * Get all security groups
     */
    @logInvocation()
    @get(
        `${SuperController.SecurityURLPath}/groups`,
        SchemaUtils.GetOp(GroupModel, {
            Controller: GroupController.name,
            ControllerMethod: GroupController.prototype.GetGroups.name,
            Method: HttpMethodsEnum.Get,
            Tag: SchemaUtils.SecurityTag,
            IsForArray: true
        })
    )
    public async GetGroups(
        @param.query.string('locale', {description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.`}) locale: string,
        @param.query.string('device', {description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.`}) device: string
    ): Promise<GroupModel[] | null> {
        return new Promise<GroupModel[] | null>(async (resolve, reject) => {
            try {
                const resp = await this.GroupRepositoryService.Find()
                return resolve(resp)
            } catch (e) {
                this.Logger.error(`The call to ${GroupController.name}.${GroupController.prototype.GetGroups.name}() failed with this error: ${e.toString()}`)
                reject(e)
            }
        })
    }
}
