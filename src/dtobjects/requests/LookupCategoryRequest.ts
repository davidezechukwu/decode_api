import { model } from '@loopback/repository'
import { ILookupCategoryRequest, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { SuperRequestWithLocaleAndDevice } from './SuperRequestWithLocaleAndDevice'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${LookupCategoryRequest.name}` } })
export class LookupCategoryRequest extends SuperRequestWithLocaleAndDevice implements ILookupCategoryRequest {
	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: `LookupCategory Id`
		}
	})
	public LookupCategoryId?: ModelIdType

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `LookupCategory Value`
		}
	})
	public LookupCategoryValue?: string

	constructor(partialObject?: Partial<LookupCategoryRequest>) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
