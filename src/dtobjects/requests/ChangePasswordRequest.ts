import { model } from '@loopback/repository'
import { IChangePasswordRequest } from '@david.ezechukwu/core'
import { SuperRequestWithLocaleAndDevice } from '.'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${ChangePasswordRequest.name}` } })
export class ChangePasswordRequest extends SuperRequestWithLocaleAndDevice implements IChangePasswordRequest {	
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Password`
		}
	})
	Password: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Password confirmation`
		}
	})
	PasswordConfirmation: string	

	@PropertyDecorator({
		type: 'number',
		required: true,
		jsonSchema: {
			description: "The user's password strength, goes from strongest (0 or 1) to above (weaker)"
		}
	})
	PasswordStrength: number

	constructor(partialObject: Partial<ChangePasswordRequest>) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
