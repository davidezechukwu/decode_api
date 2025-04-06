import { BindingKey, inject, injectable } from '@loopback/core'
import { IUserPhoneNumberWithRelations } from '@david.ezechukwu/core'
import { UserPhoneNumberModel } from '../models'
import { SuperModelRepositoryService } from './SuperModelRepositoryService'
import { CoreDataSource } from '../datasources'
import { DataObject, Options } from '@loopback/repository'

@injectable({ tags: { key: UserPhoneNumberRepositoryService.BINDING_KEY.key } })
export class UserPhoneNumberRepositoryService extends SuperModelRepositoryService<UserPhoneNumberModel, IUserPhoneNumberWithRelations> {
	static BINDING_KEY = BindingKey.create<UserPhoneNumberRepositoryService>(`repositories.${UserPhoneNumberRepositoryService.name}`)
	constructor(
		@inject(CoreDataSource.BINDING_KEY.key)
		dataSource: CoreDataSource
	) {
		super(UserPhoneNumberModel, dataSource)
	}

	public async Create(model: DataObject<UserPhoneNumberModel>, options?: Options): Promise<UserPhoneNumberModel> {
		const alreadyExists = await this.FindOne({ where: { UserId: model.UserId, PhoneTypeId: model.PhoneTypeId } })
		if (alreadyExists) {
			throw (`409[$]An existing phone number with the same phone number type already exists for this user`)
		}	
		return super.Create(model, options)
	}
}
