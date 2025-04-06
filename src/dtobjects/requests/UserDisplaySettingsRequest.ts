import { model } from '@loopback/repository'
import { IUserDisplaySettingsRequest, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { SuperRequest } from './SuperRequest'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${UserDisplaySettingsRequest.name}` } })
export class UserDisplaySettingsRequest extends SuperRequest implements IUserDisplaySettingsRequest {
	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: `The preferred language you would like in your display and correspondence such as emails, SMS and WhatsApp messages`
		}
	})
	public LanguageId: ModelIdType

	@PropertyDecorator({
		type: ModelIdTypeName,
		jsonSchema: {
			description: `The preferred color scheme`
		}
	})
	public ThemeId: ModelIdType

	@PropertyDecorator({
		type: 'boolean',
		jsonSchema: {
			description: `Indicate whether you prefer settings ideally suited for low-speed connections`
		}
	})
	IsOnLowSpeedConnection: boolean

	@PropertyDecorator({
		type: 'boolean',
		jsonSchema: {
			description: `Enables or disables animations`
		}
	})
	DisableAnimations: boolean

	@PropertyDecorator({
		type: 'boolean',
		jsonSchema: {
			description: `Enables or disables background videos`
		}
	})
	ShowBackgroundVideo: boolean

	constructor(partialObject: Partial<UserDisplaySettingsRequest> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
