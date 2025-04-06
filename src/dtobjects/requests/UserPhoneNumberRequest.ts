import { model } from '@loopback/repository'
import { IUserPhoneNumberRequest, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { SuperRequest } from './SuperRequest'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${UserPhoneNumberRequest.name}` } })
export class UserPhoneNumberRequest extends SuperRequest implements IUserPhoneNumberRequest {
	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: `Phone Type Lookup Id`
		}
	})
	PhoneTypeId: ModelIdType

	@PropertyDecorator({
		type: ModelIdTypeName,
		required: false,
		jsonSchema: {
			description: `Country Lookup Id`
		}
	})
	LocationId?: ModelIdType

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Phone Number`,
		}
	})
	PhoneNumber: string

	@PropertyDecorator({
		type: 'number',
		required: false,
		jsonSchema: {
			description: `Rank in List`,
		}
	})
	Rank?: number | undefined

	constructor(partialObject: Partial<UserPhoneNumberRequest> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
