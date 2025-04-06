import {hasMany} from '@loopback/repository'
import {ILookupCategory, ILookupCategoryConstants, ModelIdType, ModelIdTypeName} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {LookupModel} from './LookupModel'


/**
 * The model that represents a lookup category, i.e Countries, Currencies, etc
 * */
@ModelDecorator(ILookupCategoryConstants.SCHEMA_NAME, ILookupCategoryConstants.TABLE_NAME, {jsonSchema: {description: "Represents information about a lookup's category"}})
export class LookupCategoryModel extends SuperModel implements ILookupCategory {
    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: 'Name of the Lookup category'
        }
    })
    Name: string

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: 'Value of the Lookup category'
        }
    })
    Value: string

    @hasMany(() => LookupModel,  {keyTo: 'LookupCategoryId', name: 'Lookups'})
    Lookups?: LookupModel[]

    constructor(partialObject?: Partial<LookupCategoryModel>) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
