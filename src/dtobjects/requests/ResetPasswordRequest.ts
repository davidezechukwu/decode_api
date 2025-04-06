import { model } from '@loopback/repository'
import { IResetPasswordRequest } from '@david.ezechukwu/core'
import { PropertyDecorator } from '../../decorators'
import { ChangePasswordRequest } from './ChangePasswordRequest'

@model({ jsonSchema: { description: `${ResetPasswordRequest.name}` } })
export class ResetPasswordRequest extends ChangePasswordRequest implements IResetPasswordRequest {	

	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `The Reset Token on the 'Forgot Password' email sent to you`
		}
	})
	ResetToken: string	

	constructor(partialObject: Partial<ResetPasswordRequest>) {
		super(partialObject)
		Object.assign(this, partialObject)
	}

}
