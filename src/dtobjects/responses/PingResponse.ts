import { Entity, model } from '@loopback/repository'
import { IncomingHttpHeaders } from 'http'
import { IPingResponse } from '@david.ezechukwu/core'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${PingResponse.name}` } })
export class PingResponse extends Entity implements IPingResponse {
	@PropertyDecorator({
		type: 'object',
		jsonSchema: {
			description: `HTTP Request Headers`
		}
	})
	RequestHeaders: IncomingHttpHeaders

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `In line XLST, if any, to use in converting to HTML`
		}
	})
	XSLTStylesheet?: string

	@PropertyDecorator({
        type: 'object',
        jsonSchema: {
            description: `Localized copy`
        }
    })
    Phrases: object

	constructor(partialObject: Partial<PingResponse>) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
