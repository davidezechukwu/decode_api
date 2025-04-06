import { Entity, model } from '@loopback/repository'
import { IHealthStatusResponse } from '@david.ezechukwu/core'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${HealthStatusResponse.name}` } })
export class HealthStatusResponse extends Entity implements IHealthStatusResponse {
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `The status of the API`
		}
	})
	public Status: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `The server UTC date`
		}
	})
	public UTCDate: Date

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Swagger Explorer endpoint`
		}
	})
	public SwaggerEndPoint: string

	@PropertyDecorator({
		type: 'object',
		jsonSchema: {
			description: `The API's NPM package.json`
		}
	})
	public PackageJSON: object

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
}
