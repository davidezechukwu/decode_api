import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {BelongsToAccessor, repository} from '@loopback/repository'
import {ModelIdType, IUserGroupWithRelations} from '@david.ezechukwu/core'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {GroupModel, UserGroupModel, UserModel} from '../models'
import {GroupRepositoryService, UserRepositoryService} from '.'

@injectable({tags: {key: UserGroupRepositoryService.BINDING_KEY.key}})
export class UserGroupRepositoryService extends SuperModelRepositoryService<UserGroupModel, IUserGroupWithRelations> {
    public static BINDING_KEY = BindingKey.create<UserGroupRepositoryService>(`repositories.${UserGroupRepositoryService.name}`)

    public readonly UserBelongsToAccessor: BelongsToAccessor<UserModel, ModelIdType>
    public readonly GroupBelongsToAccessor: BelongsToAccessor<GroupModel, ModelIdType>

    public constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource,
        @repository.getter(UserRepositoryService)
        UserRepositoryServiceGetter: Getter<UserRepositoryService>,
        @repository.getter(GroupRepositoryService)
        GroupRepositoryServiceGetter: Getter<GroupRepositoryService>
    ) {
        super(UserGroupModel, dataSource)
        this.UserBelongsToAccessor = this.createBelongsToAccessorFor('User', UserRepositoryServiceGetter)
        this.registerInclusionResolver('User', this.UserBelongsToAccessor.inclusionResolver)
        this.GroupBelongsToAccessor = this.createBelongsToAccessorFor('Group', GroupRepositoryServiceGetter)
        this.registerInclusionResolver('Group', this.GroupBelongsToAccessor.inclusionResolver)
    }
}
