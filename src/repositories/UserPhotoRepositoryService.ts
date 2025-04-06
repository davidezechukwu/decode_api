import {BindingKey, inject, injectable} from '@loopback/core'
import {IUserPhotoWithRelations} from '@david.ezechukwu/core'
import {UserPhotoModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'

@injectable({tags: {key: UserPhotoRepositoryService.BINDING_KEY.key}})
export class UserPhotoRepositoryService extends SuperModelRepositoryService<UserPhotoModel, IUserPhotoWithRelations> {
    static BINDING_KEY = BindingKey.create<UserPhotoRepositoryService>(`repositories.${UserPhotoRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserPhotoModel, dataSource)
    }
}
