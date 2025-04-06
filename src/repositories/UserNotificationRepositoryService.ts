import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {ModelIdType, IUserNotificationWithRelations} from '@david.ezechukwu/core'
import {BelongsToAccessor, repository} from '@loopback/repository'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {UserNotificationModel, UserModel} from '../models'
import {UserRepositoryService} from '.'

@injectable({tags: {key: UserNotificationRepositoryService.BINDING_KEY.key}})
export class UserNotificationRepositoryService extends SuperModelRepositoryService<UserNotificationModel, IUserNotificationWithRelations> {
    public static BINDING_KEY = BindingKey.create<UserNotificationRepositoryService>(`repositories.${UserNotificationRepositoryService.name}`)

    public readonly UserBelongsToAccessor: BelongsToAccessor<UserModel, ModelIdType>
    //public readonly GroupBelongsToAccessor: BelongsToAccessor<GroupModel, ModelIdType>
    //public readonly RoleBelongsToAccessor: BelongsToAccessor<RoleModel, ModelIdType>

    public constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource,
        @repository.getter(UserRepositoryService)
        UserRepositoryServiceGetter: Getter<UserRepositoryService>
        //@repository.getter(GroupRepositoryService)
        //GroupRepositoryServiceGetter: Getter<GroupRepositoryService>,
        //@repository.getter(RoleRepositoryService)
        //RoleRepositoryServiceGetter: Getter<RoleRepositoryService>
    ) {
        super(UserNotificationModel, dataSource)

        this.UserBelongsToAccessor = this.createBelongsToAccessorFor('User', UserRepositoryServiceGetter)
        this.registerInclusionResolver('User', this.UserBelongsToAccessor.inclusionResolver)
        //this.GroupBelongsToAccessor = this.createBelongsToAccessorFor('Group', GroupRepositoryServiceGetter)
        //this.registerInclusionResolver('Group', this.GroupBelongsToAccessor.inclusionResolver)
        //this.RoleBelongsToAccessor = this.createBelongsToAccessorFor('Role', RoleRepositoryServiceGetter)
        //this.registerInclusionResolver('Role', this.RoleBelongsToAccessor.inclusionResolver)
    }
}
