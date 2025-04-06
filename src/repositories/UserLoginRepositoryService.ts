import {BindingKey, inject, injectable} from '@loopback/core'
import {IUserLoginWithRelations} from '@david.ezechukwu/core'
import {UserLoginModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'

@injectable({tags: {key: UserLoginRepositoryService.BINDING_KEY.key}})
export class UserLoginRepositoryService extends SuperModelRepositoryService<UserLoginModel, IUserLoginWithRelations> {
    static BINDING_KEY = BindingKey.create<UserLoginRepositoryService>(`repositories.${UserLoginRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserLoginModel, dataSource)
    }
}
