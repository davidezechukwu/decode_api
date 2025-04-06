import {BindingKey, inject, injectable} from '@loopback/core'
import {IGroupWithRelations} from '@david.ezechukwu/core'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {GroupModel} from '../models'

@injectable({tags: {key: GroupRepositoryService.BINDING_KEY.key}})
export class GroupRepositoryService extends SuperModelRepositoryService<GroupModel, IGroupWithRelations> {
    public static BINDING_KEY = BindingKey.create<GroupRepositoryService>(`repositories.${GroupRepositoryService.name}`)

    public constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(GroupModel, dataSource)
    }
}
