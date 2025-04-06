import {BindingKey, inject, injectable} from '@loopback/core'
import {IUserWebLinkWithRelations} from '@david.ezechukwu/core'
import {UserWebLinkModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'

@injectable({tags: {key: UserWebLinkRepositoryService.BINDING_KEY.key}})
export class UserWebLinkRepositoryService extends SuperModelRepositoryService<UserWebLinkModel, IUserWebLinkWithRelations> {
    static BINDING_KEY = BindingKey.create<UserWebLinkRepositoryService>(`repositories.${UserWebLinkRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserWebLinkModel, dataSource)
    }
}
