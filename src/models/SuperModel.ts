import {ModelIdType, ModelIdTypeName, ISuper} from '@david.ezechukwu/core'
import {model, Entity} from '@loopback/repository'
import { PropertyDecorator } from '../decorators'

@model()
export abstract class SuperModel extends Entity implements ISuper {
	/**
	 * Id is auto-generated.
	 * As Numeric and non-numeric IDs have their respective pros-and-cons; and specific applications, an 
	 * 'Open and Closed Principle' approach has been adopted in the system Type used for Ids.
	 * Id is designed to be either numeric or non-numeric' with no code changes required.
	 * It is numeric in this instance
	 */
    @PropertyDecorator({
        type: ModelIdTypeName,
        id: true,
        generated: true,
        required: false,
        jsonSchema: {
            description: 'Id is auto-generated, and designed to be either numeric or non-numeric'
        }
    })
    Id?: ModelIdType

    @PropertyDecorator({
        type: 'boolean',
        generated: false,
        required: false,
        jsonSchema: {
            description: 'Soft Delete Feature, if and when supported, to be used together partitiioning for optimal performance. Avoid using if not needed as extra check for IsDeleted would be slower'
        }
    })
    IsDeleted?: boolean

    @PropertyDecorator({
        type: ModelIdTypeName,
        required: false,
        jsonSchema: {
            description: `The primary key of the user that created this`
        }
    })
    CreatedById?: ModelIdType

    @PropertyDecorator({
        type: 'date',
        required: false,
        defaultFn: 'now',
        jsonSchema: {
            description: `Created on this date and time`
        }
    })
    CreatedOn?: Date

    @PropertyDecorator({
        type: ModelIdTypeName,
        required: false,
        jsonSchema: {
            description: `The primary key of the user that user that last updated this`
        }
    })
    UpdatedById?: ModelIdType

    @PropertyDecorator({
        type: 'date',
        required: false,
        defaultFn: 'now',
        jsonSchema: {
            description: `Updated on this date and time`
        }
    })
    UpdatedOn?: Date

    @PropertyDecorator({
        type: 'date',
        required: false,
        jsonSchema: {
            description: `Valid from this date and time`
        }
    })
    ValidFrom?: Date

    @PropertyDecorator({
        type: 'date',
        required: false,
        jsonSchema: {
            description: `Valid to this date and time`
        }
    })
    ValidTo?: Date

    constructor(superModel?: Partial<SuperModel>) {
        super(superModel)
    }
}
