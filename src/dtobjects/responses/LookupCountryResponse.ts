import { model } from '@loopback/repository'
import { ILookupCountryResponse } from '@david.ezechukwu/core'
import { LookupNameValueResponse } from './LookupNameValueResponse'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${LookupCountryResponse.name}` } })
export class LookupCountryResponse extends LookupNameValueResponse implements ILookupCountryResponse {
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Official name`
		}
	})
	OfficialName: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `ISO 3166-1 Alpha-2 2-letter code`
		}
	})
	// eslint-disable-next-line
	ISO3166_1_Alpha_2: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `ISO 3166-1 Alpha-2 2-letter code`
		}
	})
	// eslint-disable-next-line
	ISO3166_1_Alpha_3: string

	@PropertyDecorator({
		type: 'number',
		jsonSchema: {
			description: `Internet domain`
		}
	})
	InternetDomain1: string

	@PropertyDecorator({
		type: 'number',
		jsonSchema: {
			description: `Internet domain`
		}
	})
	InternetDomain2: string

	@PropertyDecorator({
		type: 'number',
		jsonSchema: {
			description: `Internet domain`
		}
	})
	InternetDomain3: string

	constructor(partialObject: Partial<LookupCountryResponse> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
