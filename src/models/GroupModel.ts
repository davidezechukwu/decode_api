import {IGroup, IGroupConstants} from '@david.ezechukwu/core'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {SuperModel} from './SuperModel'

/**
 * The model that represents a group
 * */
@ModelDecorator(IGroupConstants.SCHEMA_NAME, IGroupConstants.TABLE_NAME, {jsonSchema: {description: 'Represents information about a group'}})
export class GroupModel extends SuperModel implements IGroup {
    constructor(partialObject?: Partial<GroupModel>) {
        super(partialObject)
        Object.assign(this, partialObject)
    }

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: IGroupConstants.NAME_MIN_LENGTH,
            maximum: IGroupConstants.NAME_MAX_LENGTH,
            description: 'Name of the group'
        }
    })
    Name: string

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: IGroupConstants.DISPLAY_NAME_MIN_LENGTH,
            maximum: IGroupConstants.DISPLAY_NAME_MAX_LENGTH,
            description: 'Display name of the group'
        }
    })
    DisplayName: string

    @PropertyDecorator({
        type: 'boolean',
        jsonSchema: {
            description: 'False if this is a user-created group'
        }
    })
    IsSystem: boolean
}
