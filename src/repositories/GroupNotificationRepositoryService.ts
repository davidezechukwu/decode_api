import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {ModelIdType, IGroupNotificationWithRelations} from '@david.ezechukwu/core'
import {BelongsToAccessor} from '@loopback/repository'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {GroupModel, GroupNotificationModel, UserModel} from '../models'
//import { UserRepositoryService, GroupRepositoryService } from '.'

@injectable({tags: {key: GroupNotificationRepositoryService.BINDING_KEY.key}})
export class GroupNotificationRepositoryService extends SuperModelRepositoryService<GroupNotificationModel, IGroupNotificationWithRelations> {
    public static BINDING_KEY = BindingKey.create<GroupNotificationRepositoryService>(`repositories.${GroupNotificationRepositoryService.name}`)

    public readonly UserBelongsToAccessor: BelongsToAccessor<UserModel, ModelIdType>
    public readonly GroupBelongsToAccessor: BelongsToAccessor<GroupModel, ModelIdType>

    public constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
        //@repository.getter(GroupRepositoryService)
        //GroupRepositoryServiceGetter: Getter<GroupRepositoryService>,
    ) {
        super(GroupNotificationModel, dataSource)
        //this.GroupBelongsToAccessor = this.createBelongsToAccessorFor('Group', GroupRepositoryServiceGetter)
        //this.registerInclusionResolver('Group', this.GroupBelongsToAccessor.inclusionResolver)
    }
}
