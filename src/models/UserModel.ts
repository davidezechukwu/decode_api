import {Principal, securityId} from '@loopback/security'
import {IUser, IUserConstants} from '@david.ezechukwu/core'
import {ModelDecorator} from '../decorators'
import {SuperModel} from './SuperModel'

/**
 * Represents the barest minimum info needed to represent a user
 * */
@ModelDecorator(IUserConstants.SCHEMA_NAME, IUserConstants.TABLE_NAME, {jsonSchema: {description: 'Represents information about a user'}})
export class UserModel extends SuperModel implements IUser, Principal {
    [securityId]: string
    [attribute: string]: any
    constructor(partialObject?: Partial<UserModel>) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
