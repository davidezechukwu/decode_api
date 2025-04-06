import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {IUserDisplaySettingsWithRelations, ModelIdType} from '@david.ezechukwu/core'
import {LookupModel, UserModel, UserDisplaySettingsModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {UserRepositoryService} from './UserRepositoryService'
import {BelongsToAccessor, repository} from '@loopback/repository'
import {LookupRepositoryService} from './LookupRepositoryService'

@injectable({tags: {key: UserDisplaySettingsRepositoryService.BINDING_KEY.key}})
export class UserDisplaySettingsRepositoryService extends SuperModelRepositoryService<UserDisplaySettingsModel, IUserDisplaySettingsWithRelations> {
    static BINDING_KEY = BindingKey.create<UserDisplaySettingsRepositoryService>(`repositories.${UserDisplaySettingsRepositoryService.name}`)

    public readonly UserBelongsToAccessor: BelongsToAccessor<UserModel, ModelIdType>
    public readonly LanguageBelongsToAccessor: BelongsToAccessor<LookupModel, ModelIdType>

    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource,
        @repository.getter(UserRepositoryService)
        UserRepositoryServiceGetter: Getter<UserRepositoryService>,
        @repository.getter(LookupRepositoryService)
        LookupRepositoryService: Getter<LookupRepositoryService>
    ) {
        super(UserDisplaySettingsModel, dataSource)
        this.UserBelongsToAccessor = this.createBelongsToAccessorFor('User', UserRepositoryServiceGetter)
        this.registerInclusionResolver('User', this.UserBelongsToAccessor.inclusionResolver)
        this.LanguageBelongsToAccessor = this.createBelongsToAccessorFor('Language', LookupRepositoryService)
        this.registerInclusionResolver('Language', this.LanguageBelongsToAccessor.inclusionResolver)
    }
}
