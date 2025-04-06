import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {ModelIdType, ILookupCategoryWithRelations} from '@david.ezechukwu/core'
import {LookupCategoryModel, LookupModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import { HasManyRepositoryFactory, repository } from '@loopback/repository'
import { LookupRepositoryService } from './LookupRepositoryService'


@injectable({tags: {key: LookupCategoryRepositoryService.BINDING_KEY.key}})
export class LookupCategoryRepositoryService extends SuperModelRepositoryService<LookupCategoryModel, ILookupCategoryWithRelations> {
    static BINDING_KEY = BindingKey.create<LookupCategoryRepositoryService>(`repositories.${LookupCategoryRepositoryService.name}`)

	public readonly Lookups: HasManyRepositoryFactory<LookupModel, ModelIdType>

    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource,
		@repository.getter('LookupRepositoryService')
		LookupRepositoryGetter: Getter<LookupRepositoryService>
    ) {
        super(LookupCategoryModel, dataSource)
		this.Lookups = this.createHasManyRepositoryFactoryFor('Lookups', LookupRepositoryGetter)
		this.registerInclusionResolver('Lookups', this.Lookups.inclusionResolver)
    }
}
