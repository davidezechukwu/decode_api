import {BindingKey, inject, injectable} from '@loopback/core'
import {UserNameModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {IUserNameWithRelations} from '@david.ezechukwu/core'
import {CoreDataSource} from '../datasources'

@injectable({tags: {key: UserNameRepositoryService.BINDING_KEY.key}})
export class UserNameRepositoryService extends SuperModelRepositoryService<UserNameModel, IUserNameWithRelations> {
    static BINDING_KEY = BindingKey.create<UserNameRepositoryService>(`repositories.${UserNameRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserNameModel, dataSource)
    }
}
