import {BindingKey, inject, injectable} from '@loopback/core'
import {IUserPasswordWithRelations} from '@david.ezechukwu/core'
import {UserPasswordModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'

@injectable({tags: {key: UserPasswordRepositoryService.BINDING_KEY.key}})
export class UserPasswordRepositoryService extends SuperModelRepositoryService<UserPasswordModel, IUserPasswordWithRelations> {
    static BINDING_KEY = BindingKey.create<UserPasswordRepositoryService>(`repositories.${UserPasswordRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserPasswordModel, dataSource)
    }
}
