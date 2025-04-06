import { model } from '@loopback/repository'
import { IUserCommunicationPreferencesRequest } from '@david.ezechukwu/core'
import { SuperRequest } from './SuperRequest'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${UserCommunicationPreferencesRequest.name}` } })
export class UserCommunicationPreferencesRequest extends SuperRequest implements IUserCommunicationPreferencesRequest {
	@PropertyDecorator({
		type: 'boolean',
		required: true,
		jsonSchema: {
			description: 'Flag that determines if InApp is preferred'
		}
	})
	UseInApp: boolean

	@PropertyDecorator({
		type: 'boolean',
		required: true,
		jsonSchema: {
			description: 'Flag that determines if Email is preferred'
		}
	})
	UseEmail: boolean

	@PropertyDecorator({
		type: 'boolean',
		required: true,
		jsonSchema: {
			description: 'Flag that determines if SMS is preferred'
		}
	})
	UseSMS: boolean

	@PropertyDecorator({
		type: 'boolean',
		required: true,
		jsonSchema: {
			description: 'Flag that determines if WhatsApp is preferred'
		}
	})
	UseWhatsApp: boolean

	@PropertyDecorator({
		type: 'boolean',
		required: true,
		jsonSchema: {
			description: 'Flag that determines if iMessage is preferred'
		}
	})
	UseIMessage: boolean

	constructor(partialObject: Partial<UserCommunicationPreferencesRequest> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
