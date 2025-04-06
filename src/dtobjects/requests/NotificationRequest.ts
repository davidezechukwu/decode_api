import { model } from '@loopback/repository'
import { INotificationRequest, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { SuperRequest } from './SuperRequest'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${NotificationRequest.name}` } })
export class NotificationRequest extends SuperRequest implements INotificationRequest {
	@PropertyDecorator({
		type: Date,
		required: false,
		jsonSchema: {
			description: `From period`
		}
	})
	FromDate?: Date

	@PropertyDecorator({
		type: Date,
		required: false,
		jsonSchema: {
			description: `To period`
		}
	})
	ToDate?: Date

	@PropertyDecorator({
		type: ModelIdTypeName,
		required: false,
		jsonSchema: {
			description: `From Id`
		}
	})
	FromId?: ModelIdType

	@PropertyDecorator({
		type: ModelIdTypeName,
		required: false,
		jsonSchema: {
			description: `To Id`
		}
	})
	ToId?: ModelIdType
	
	@PropertyDecorator({
		type: ModelIdTypeName,		
		jsonSchema: {
			description: `Notification Strategy Id`
		}
	})
	NotificationStrategyId?: ModelIdType | undefined

	@PropertyDecorator({
		type: 'string',		
		jsonSchema: {
			description: `Notification Strategy Value. This overrides NotificationStrategyId`
		}
	})
	NotificationStrategyValue?: string | undefined


	@PropertyDecorator({
		type: ModelIdTypeName,		
		jsonSchema: {
			description: `Notification Status Id`
		}
	})
	NotificationStatusId?: ModelIdType | undefined
	
	@PropertyDecorator({
		type: ModelIdTypeName,		
		jsonSchema: {
			description: `Importance Id`
		}
	})
	ImportanceId?: ModelIdType | undefined

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Search phrase`,
		}
	})
	SearchPhrase: string

	@PropertyDecorator({
		type: 'number',
		 required: false,
		jsonSchema: {
			description: `Offset`,
		}
	})
	Skip?: number | undefined

	@PropertyDecorator({
		type: 'number',
		 required: false,
		jsonSchema: {
			description: `Limit`,
		}
	})
	Limit?: number | undefined

	constructor(partialObject: Partial<NotificationRequest> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}