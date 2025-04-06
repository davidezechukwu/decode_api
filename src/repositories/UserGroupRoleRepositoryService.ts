import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {ModelIdType, IUserGroupRoleWithRelations} from '@david.ezechukwu/core'
import {BelongsToAccessor, repository} from '@loopback/repository'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {RoleModel, UserGroupModel, UserGroupRoleModel} from '../models'
import {RoleRepositoryService} from '.'
import {UserGroupRepositoryService} from './UserGroupRepositoryService'

@injectable({tags: {key: UserGroupRoleRepositoryService.BINDING_KEY.key}})
export class UserGroupRoleRepositoryService extends SuperModelRepositoryService<UserGroupRoleModel, IUserGroupRoleWithRelations> {
    public static BINDING_KEY = BindingKey.create<UserGroupRoleRepositoryService>(`repositories.${UserGroupRoleRepositoryService.name}`)

    public readonly UserGroupBelongsToAccessor: BelongsToAccessor<UserGroupModel, ModelIdType>
    public readonly RoleBelongsToAccessor: BelongsToAccessor<RoleModel, ModelIdType>

    public constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource,
        @repository.getter(UserGroupRepositoryService)
        UserGroupRepositoryServiceGetter: Getter<UserGroupRepositoryService>,
        @repository.getter(RoleRepositoryService)
        RoleRepositoryServiceGetter: Getter<RoleRepositoryService>
    ) {
        super(UserGroupRoleModel, dataSource)

        this.UserGroupBelongsToAccessor = this.createBelongsToAccessorFor('UserGroup', UserGroupRepositoryServiceGetter)
        this.RoleBelongsToAccessor = this.createBelongsToAccessorFor('Role', RoleRepositoryServiceGetter)
        this.registerInclusionResolver('UserGroup', this.UserGroupBelongsToAccessor.inclusionResolver)
        this.registerInclusionResolver('Role', this.RoleBelongsToAccessor.inclusionResolver)
    }
}
