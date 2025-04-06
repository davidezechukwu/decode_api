import {inject, BindingKey, injectable} from '@loopback/core'
import {ModelIdType, IUser, IUserGroupAndRoleResponse, IUserGroupRoleWithRelations, IUserGroupWithRelations} from '@david.ezechukwu/core'
import {SuperService} from '../SuperService'
import {GroupModel, RoleModel} from '../../models'
import {GroupRepositoryService, RoleRepositoryService, UserGroupRoleRepositoryService} from '../../repositories'
import {UserGroupRepositoryService} from '../../repositories/UserGroupRepositoryService'
import {UserGroupAndRoleResponse} from '../../dtobjects'

/**
 * The authorization service
 * */
@injectable({tags: {key: AuthorizationService.BINDING_KEY.key}})
export class AuthorizationService extends SuperService {
    static BINDING_KEY = BindingKey.create<AuthorizationService>(`services.${AuthorizationService.name}`)
    public static HttpDefaultScope = 'Get'
    public static HttpGetScope = 'Get'
    public static HttpGetAllScope = 'GetAll'
    public static HttpPostScope = 'Post'
    public static HttpDeleteScope = 'Delete'
    public static HttpPutScope = 'Put'
    public static HttpPatchScope = 'Patch'
    public static HttpPatchAllScope = 'PatchAll'

    public constructor(
        @inject(GroupRepositoryService.BINDING_KEY.key)
        protected GroupRepositoryService: GroupRepositoryService,
        @inject(RoleRepositoryService.BINDING_KEY.key)
        protected RoleRepositoryService: RoleRepositoryService,
        @inject(UserGroupRepositoryService.BINDING_KEY.key)
        protected UserGroupRepositoryService: UserGroupRepositoryService,
        @inject(UserGroupRoleRepositoryService.BINDING_KEY.key)
        protected UserGroupRoleRepositoryService: UserGroupRoleRepositoryService
    ) {
        super()
    }

    ///**
    // * Gets the collection of the user's groups and their roles within these groups'
    // * */
    //public async GetUserGroupsAndRoles(user: IUser)
    //    : Promise<UserGroupAndRoleResponse[]> {
    //    return new Promise<UserGroupAndRoleResponse[]>(async (resolve, reject) => {
    //        try {
    //            let groupAndRoles: UserGroupAndRoleResponse[] = []
    //            let _userGroupIds: ModelIdType[] = []
    //            let userGroups: IUserGroupWithRelations[] = await this.UserGroupRepositoryService.Find({ where: { UserId: user.Id }, include:[{ relation: 'Group'}] })
    //            userGroups.forEach(userGroup => {
    //                _userGroupIds.push(userGroup.Id!)
    //            })
    //            let userGroupIds: ModelIdType[] = [...new Set(_userGroupIds)]
    //            userGroupIds.sort((a, b) => { if (a > b) return 1 else if (a < b) return -1 else return 0 })

    //            let userGroupRoles: IUserGroupRoleWithRelations[] = await this.UserGroupRoleRepositoryService.Find({ where: { UserGroupId: { inq: userGroupIds } } , include:[{relation: 'Role'}]})
    //            userGroupRoles.forEach ( (userGroupRole) => {
    //                const userGroup = userGroups.find(p => p.Id == userGroupRole.UserGroupId)
    //                let userGroupAndRoleResponse = new UserGroupAndRoleResponse()
    //                userGroupAndRoleResponse.Group = new GroupModel(userGroup?.Group)
    //                userGroupAndRoleResponse.Role = new RoleModel(userGroupRole.Role)
    //                groupAndRoles.push(userGroupAndRoleResponse)
    //            })
    //            resolve(groupAndRoles)
    //        } catch (e) {
    //            reject(e)
    //        }
    //    })
    //}
}
