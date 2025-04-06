import {BindingKey, inject, injectable} from '@loopback/core'
import {IUserWithRelations} from '@david.ezechukwu/core'
import {UserModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'

@injectable({tags: {key: UserRepositoryService.BINDING_KEY.key}})
export class UserRepositoryService extends SuperModelRepositoryService<UserModel, IUserWithRelations> {
    static BINDING_KEY = BindingKey.create<UserRepositoryService>(`repositories.${UserRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserModel, dataSource)
    }
}
