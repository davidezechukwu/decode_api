import {BindingKey, inject, injectable} from '@loopback/core'
import {IRoleWithRelations} from '@david.ezechukwu/core'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {RoleModel} from '../models'

@injectable({tags: {key: RoleRepositoryService.BINDING_KEY.key}})
export class RoleRepositoryService extends SuperModelRepositoryService<RoleModel, IRoleWithRelations> {
    public static BINDING_KEY = BindingKey.create<RoleRepositoryService>(`repositories.${RoleRepositoryService.name}`)

    public constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(RoleModel, dataSource)
    }
}
