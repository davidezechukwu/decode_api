import { model } from '@loopback/repository'
import { ILookupLanguageResponse } from '@david.ezechukwu/core'
import { LookupNameValueResponse } from './LookupNameValueResponse'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${LookupLanguageResponse.name}` } })
export class LookupLanguageResponse extends LookupNameValueResponse implements ILookupLanguageResponse {
	@PropertyDecorator({
		type: 'boolean',
		jsonSchema: {
			description: `IsRTL`
		}
	})
	IsRTL?: boolean

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `ISO639_1`
		}
	})
	ISO639_1: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `ISO639_2`
		}
	})
	ISO639_2: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `ISO639_3`
		}
	})
	ISO639_3: string

	constructor(partialObject: Partial<LookupLanguageResponse> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
