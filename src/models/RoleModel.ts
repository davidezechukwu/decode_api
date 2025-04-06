import {IRole, IRoleConstants} from '@david.ezechukwu/core'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {SuperModel} from './SuperModel'


/**
 * The model that represents a role
 * */
@ModelDecorator(IRoleConstants.SCHEMA_NAME, IRoleConstants.TABLE_NAME, {jsonSchema: {description: 'Represents information about a role'}})
export class RoleModel extends SuperModel implements IRole {
    constructor(partialObject?: Partial<RoleModel>) {
        super(partialObject)
        Object.assign(this, partialObject)
    }

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: IRoleConstants.NAME_MIN_LENGTH,
            maximum: IRoleConstants.NAME_MAX_LENGTH,
            description: 'Name of the role'
        }
    })
    Name: string

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: IRoleConstants.DISPLAY_NAME_MIN_LENGTH,
            maximum: IRoleConstants.DISPLAY_NAME_MAX_LENGTH,
            description: 'Display name of the role'
        }
    })
    DisplayName: string

    @PropertyDecorator({
        type: 'boolean',
        jsonSchema: {
            description: 'False if this is a user-created role'
        }
    })
    IsSystem: boolean

    @PropertyDecorator({
        type: 'number',
        required: true,
        jsonSchema: {            
            description: 'The rank of the in-built system roles, with level 1 (owner) being the greatest and (guest) always being the least '
        }
    })
    Rank?: number | undefined
}
