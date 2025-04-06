import {BindingKey, Getter, inject, injectable} from '@loopback/core'
import {ILookupWithRelations, ModelIdType} from '@david.ezechukwu/core'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {LookupModel} from '../models'

@injectable({tags: {key: LookupRepositoryService.BINDING_KEY.key}})
export class LookupRepositoryService extends SuperModelRepositoryService<LookupModel, ILookupWithRelations> {
    public static BINDING_KEY = BindingKey.create<LookupRepositoryService>(`repositories.${LookupRepositoryService.name}`)
	public constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource,	
    ) {
        super(LookupModel, dataSource)		

    }
}
