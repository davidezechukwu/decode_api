import {BindingKey, inject, injectable} from '@loopback/core'
import {ModelIdType, IUserEmailAddressWithRelations} from '@david.ezechukwu/core'
import {UserEmailAddressModel} from '../models'
import {SuperModelRepositoryService} from './SuperModelRepositoryService'
import {CoreDataSource} from '../datasources'
import {Count, DataObject, Options, Where} from '@loopback/repository'

@injectable({tags: {key: UserEmailAddressRepositoryService.BINDING_KEY.key}})
export class UserEmailAddressRepositoryService extends SuperModelRepositoryService<UserEmailAddressModel, IUserEmailAddressWithRelations> {
    static BINDING_KEY = BindingKey.create<UserEmailAddressRepositoryService>(`repositories.${UserEmailAddressRepositoryService.name}`)
    constructor(
        @inject(CoreDataSource.BINDING_KEY.key)
        dataSource: CoreDataSource
    ) {
        super(UserEmailAddressModel, dataSource)
    }

    public async Create(model: DataObject<UserEmailAddressModel>, options?: Options): Promise<UserEmailAddressModel> {
		const alreadyExists = await this.FindOne({where:{ UserId: model.UserId, EmailAddressTypeId: model.EmailAddressTypeId}})
		if (alreadyExists){
			throw (`409[$]An existing email address with the same email address type already exists for this user`)
		}
        model.EmailAddress = model?.EmailAddress?.toLowerCase() ?? model.EmailAddress
        return super.Create(model, options)
    }

    public async CreateAll(models: DataObject<UserEmailAddressModel>[], options?: Options): Promise<UserEmailAddressModel[]> {
        models?.forEach(model => {
            model.EmailAddress = model?.EmailAddress?.toLowerCase() ?? model.EmailAddress
        })
        return super.CreateAll(models, options)
    }

    public async Save(model: UserEmailAddressModel, options?: Options): Promise<UserEmailAddressModel> {
        model.EmailAddress = model?.EmailAddress?.toLowerCase() ?? model.EmailAddress
        return super.Save(model, options)
    }

    public async Update(model: UserEmailAddressModel, options?: Options): Promise<void> {
        model.EmailAddress = model?.EmailAddress?.toLowerCase() ?? model.EmailAddress
        return super.Update(model, options)
    }

    public async UpdateAll(model: DataObject<UserEmailAddressModel>, where?: Where<UserEmailAddressModel>, options?: Options): Promise<Count> {
        model.EmailAddress = model?.EmailAddress?.toLowerCase() ?? model.EmailAddress
        return super.UpdateAll(model, options)
    }

    public async UpdateById(id: ModelIdType, model: DataObject<UserEmailAddressModel>, options?: Options): Promise<void> {
        model.EmailAddress = model?.EmailAddress?.toLowerCase() ?? model.EmailAddress
        return super.UpdateById(id, model, options)
    }

    public async ReplaceById(id: ModelIdType, model: DataObject<UserEmailAddressModel>, options?: Options): Promise<void> {
        model.EmailAddress = model?.EmailAddress?.toLowerCase() ?? model.EmailAddress
        return super.ReplaceById(id, model, options)
    }
}
