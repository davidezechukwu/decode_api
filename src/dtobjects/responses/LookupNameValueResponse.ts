import { Entity, model } from '@loopback/repository'
import { ILookupNameValueResponse, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${LookupNameValueResponse.name}` } })
export class LookupNameValueResponse extends Entity implements ILookupNameValueResponse {
	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: `Lookup Name`
		}
	})
	Id: ModelIdType

	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: `Lookup Name`
		}
	})
	LookupCategoryId: ModelIdType

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Lookup Name`
		}
	})
	Name: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Lookup Value`
		}
	})
	Value: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `IsSelected`
		}
	})
	IsSelected?: boolean

	constructor(partialObject: Partial<LookupNameValueResponse> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
