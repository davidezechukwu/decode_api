import { Entity, model } from '@loopback/repository'
import { IUserResponse, IWhoAmIResponse } from '@david.ezechukwu/core'
import { IncomingHttpHeaders } from 'http'
import { PropertyDecorator } from '../../decorators'


/**
 * Returns a complete breakdown of the information held on a user.
 * Including Current and Past Cookies, current and past sessions with Locations and Devices
 * Password is not shown as this is not know, as it is encrypted
 * In accordance with Privacy Policy
 */
@model({ jsonSchema: { description: `${WhoAmIResponse.name}` } })
export class WhoAmIResponse extends Entity implements IWhoAmIResponse {
	@PropertyDecorator({
		type: 'object'
	})
	UserDetails: IUserResponse

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

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `The official name of site`
		}
	})
	HostName?: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Site URL`
		}
	})
	HostUrl?: string

	constructor(partialObject: Partial<WhoAmIResponse>) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
