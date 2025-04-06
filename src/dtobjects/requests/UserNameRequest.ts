import { model } from '@loopback/repository'
import { IUserNameRequest, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { SuperRequest } from './SuperRequest'
import { PropertyDecorator } from '../../decorators'

/**
 * User name dto
 */
@model({ jsonSchema: { description: `${UserNameRequest.name}` } })
export class UserNameRequest extends SuperRequest implements IUserNameRequest {
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `User's display name`,
		}
	})
	DisplayName?: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `User's title`
		}
	})
	Title?: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `User's first name`
		}
	})
	FirstName: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `User's middle name`
		}
	})
	MiddleName?: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `User's last name`
		}
	})
	LastName: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `User's nickname`
		}
	})
	NickName?: string

	constructor(partialObject: Partial<UserNameRequest> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
