import { model } from '@loopback/repository'
import { IRegisterRequest } from '@david.ezechukwu/core'
import { SuperRequestWithLocaleAndDevice } from './SuperRequestWithLocaleAndDevice'
import { PropertyDecorator } from '../../decorators'

@model({ jsonSchema: { description: `${RegisterRequest.name}` } })
export class RegisterRequest extends SuperRequestWithLocaleAndDevice implements IRegisterRequest {
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Username`
		}
	})
	public Username: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Password`
		}
	})
	public Password: string

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `Password confirmation`
		}
	})
	public PasswordConfirmation: string

	@PropertyDecorator({
		type: 'boolean',
		jsonSchema: {
			description: `Has the Terms and conditions being accepted?`
		}
	})
	public IAcceptTermsAndConditions: boolean

	@PropertyDecorator({
		type: 'boolean',
		jsonSchema: {
			description: `Has the Privacy Policy being accepted?`
		}
	})
	public IAcceptPrivacyPolicy: boolean

	@PropertyDecorator({
		type: 'number',
		required: true,
		jsonSchema: {
			description: "The user's password strength, goes from strongest (0 or 1) to above (weaker)"
		}
	})
	PasswordStrength: number

	constructor(partialObject: Partial<RegisterRequest>) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
