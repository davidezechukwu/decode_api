import {model} from '@loopback/repository'
import {IForgotPasswordRequest} from '@david.ezechukwu/core'
import {SuperRequestWithLocaleAndDevice} from '.'
import { PropertyDecorator, SensitivePropertyDecorator } from '../../decorators'


@model({jsonSchema: {description: `${ForgotPasswordRequest.name}`}})
export class ForgotPasswordRequest extends SuperRequestWithLocaleAndDevice implements IForgotPasswordRequest {
    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        jsonSchema: {
            description: `Username`
        }
    })
    Username: string
}
