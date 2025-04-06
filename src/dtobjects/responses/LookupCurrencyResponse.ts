import { model } from '@loopback/repository'
import { ILookupCurrencyResponse } from '@david.ezechukwu/core'
import { LookupNameValueResponse } from './LookupNameValueResponse'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${LookupCurrencyResponse.name}` } })
export class LookupCurrencyResponse extends LookupNameValueResponse implements ILookupCurrencyResponse {
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Plural name`
		}
	})
	PluralName: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Symbol`
		}
	})
	Symbol: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Native symbol`
		}
	})
	NativeSymbol: string

	@PropertyDecorator({
		type: 'number',
		jsonSchema: {
			description: `Decimal digits`
		}
	})
	DecimalDigits: number

	constructor(partialObject: Partial<LookupCurrencyResponse> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
