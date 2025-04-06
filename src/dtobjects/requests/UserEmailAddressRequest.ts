import { model } from '@loopback/repository'
import { IUserEmailAddressRequest, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { SuperRequest } from './SuperRequest'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${UserEmailAddressRequest.name}` } })
export class UserEmailAddressRequest extends SuperRequest implements IUserEmailAddressRequest {
	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: `Email Address Type Lookup Id`
		}
	})
	EmailAddressTypeId: ModelIdType

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Email address`,
		}
	})
	EmailAddress: string

	@PropertyDecorator({
		type: 'number',
		required: false,
		jsonSchema: {
			description: `Rank in List`,			
		}
	})
	Rank?: number | undefined

	constructor(partialObject: Partial<UserEmailAddressRequest> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
