import { model } from '@loopback/repository'
import { INotificationStatusUpdateRequest, ModelIdType, ModelIdTypeName } from '@david.ezechukwu/core'
import { SuperRequest } from './SuperRequest'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${NotificationStatusUpdateRequest.name}` } })
export class NotificationStatusUpdateRequest extends SuperRequest implements INotificationStatusUpdateRequest {
	@PropertyDecorator({
		type: ModelIdTypeName,		
		jsonSchema: {
			description: `Notification Status Id`
		}
	})
	NotificationStatusId?: ModelIdType | undefined
		

	constructor(partialObject: Partial<NotificationStatusUpdateRequest> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}