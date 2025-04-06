import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {IUserCommunicationPreferencesWithRelations, ModelIdType} from '@david.ezechukwu/core'
import {UserModel, UserCommunicationPreferencesModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {UserRepositoryService} from './UserRepositoryService'
import {BelongsToAccessor, repository} from '@loopback/repository'

@injectable({tags: {key: UserCommunicationPreferencesRepositoryService.BINDING_KEY.key}})
export class UserCommunicationPreferencesRepositoryService extends SuperModelRepositoryService<UserCommunicationPreferencesModel, IUserCommunicationPreferencesWithRelations> {
    static BINDING_KEY = BindingKey.create<UserCommunicationPreferencesRepositoryService>(`repositories.${UserCommunicationPreferencesRepositoryService.name}`)

    public readonly UserBelongsToAccessor: BelongsToAccessor<UserModel, ModelIdType>    

    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource,
        @repository.getter(UserRepositoryService)
        UserRepositoryServiceGetter: Getter<UserRepositoryService>        
    ) {
        super(UserCommunicationPreferencesModel, dataSource)
        this.UserBelongsToAccessor = this.createBelongsToAccessorFor('User', UserRepositoryServiceGetter)
        this.registerInclusionResolver('User', this.UserBelongsToAccessor.inclusionResolver)        
    }
}
