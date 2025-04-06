import {BindingKey, inject, injectable} from '@loopback/core'
import {IUserLogonWithRelations} from '@david.ezechukwu/core'
import {UserLogonModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'

@injectable({tags: {key: UserLogonRepositoryService.BINDING_KEY.key}})
export class UserLogonRepositoryService extends SuperModelRepositoryService<UserLogonModel, IUserLogonWithRelations> {
    static BINDING_KEY = BindingKey.create<UserLogonRepositoryService>(`repositories.${UserLogonRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserLogonModel, dataSource)
    }
}
