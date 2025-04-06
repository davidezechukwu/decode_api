import {model} from '@loopback/repository'
import {ILoginRequest} from '@david.ezechukwu/core'
import {SuperRequestWithLocaleAndDevice} from '.'
import { PropertyDecorator, SensitivePropertyDecorator } from '../../decorators'


@model({jsonSchema: {description: `${LoginRequest.name}`}})
export class LoginRequest extends SuperRequestWithLocaleAndDevice implements ILoginRequest {
    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        jsonSchema: {
            description: `Username`
        }
    })
    Username: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        jsonSchema: {
            description: `Password`
        }
    })
    Password: string
}
