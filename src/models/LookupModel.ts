import {
	ISuperConstants, 
	ILookup, ILookupConstants, 
	ModelIdType, 
	ModelIdTypeName, 
	ILookupCategoryConstants
} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator} from '../decorators'

/**
 * The model that represents a lookup
 * */
@ModelDecorator(ILookupConstants.SCHEMA_NAME, ILookupConstants.TABLE_NAME, {
    jsonSchema: {description: 'Represents information about a lookup'},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_Lookup_LookupCategoryId: {
                name: `fk_Lookup_LookupCategoryId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `${ILookupCategoryConstants.TABLE_NAME_SINGULAR}${ISuperConstants.ID_NAME}`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            }
        }
    }
})
export class LookupModel extends SuperModel implements ILookup {
    @PropertyDecorator({
        type: ModelIdTypeName,
        required: true,
        jsonSchema: {
            description: 'Id of the lookup category'
        }
    })	
    LookupCategoryId: ModelIdType

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: ILookupConstants.NAME_MIN_LENGTH,
            maximum: ILookupConstants.NAME_MAX_LENGTH,
            description: 'Name of the Lookup'
        }
    })
    Name: string

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: ILookupConstants.OFFICIAL_NAME_MIN_LENGTH,
            maximum: ILookupConstants.OFFICIAL_NAME_MAX_LENGTH,
            description: 'Offcial name of the Lookup'
        }
    })
    OfficialName: string

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: ILookupConstants.PLURAL_NAME_MIN_LENGTH,
            maximum: ILookupConstants.PLURAL_NAME_MAX_LENGTH,
            description: 'Plural name of the Lookup'
        }
    })
    PluralName: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.VALUE_MIN_LENGTH,
            maximum: ILookupConstants.VALUE_MAX_LENGTH,
            description: 'Value for the Lookup, if any'
        }
    })
    Value: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE1_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE1_MAX_LENGTH,
            description: 'Other Value 1 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue1?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE2_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE2_MAX_LENGTH,
            description: 'Other Value 2 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue2?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE3_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE3_MAX_LENGTH,
            description: 'Other Value 3 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue3?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE4_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE4_MAX_LENGTH,
            description: 'Other Value 4 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue4?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE5_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE5_MAX_LENGTH,
            description: 'Other Value 5 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue5?: string

	@PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE6_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE6_MAX_LENGTH,
            description: 'Other Value 6 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue6?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE7_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE7_MAX_LENGTH,
            description: 'Other Value 7 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue7?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE8_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE8_MAX_LENGTH,
            description: 'Other Value 8 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue8?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE9_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE9_MAX_LENGTH,
            description: 'Other Value 9 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue9?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE10_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE10_MAX_LENGTH,
            description: 'Other Value 10 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue10?: string

	@PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE11_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE11_MAX_LENGTH,
            description: 'Other Value 11 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue11?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE12_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE12_MAX_LENGTH,
            description: 'Other Value 12 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue12?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE13_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE13_MAX_LENGTH,
            description: 'Other Value 13 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue13?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE14_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE14_MAX_LENGTH,
            description: 'Other Value 14 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue14?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: ILookupConstants.OTHER_VALUE15_MIN_LENGTH,
            maximum: ILookupConstants.OTHER_VALUE15_MAX_LENGTH,
            description: 'Other Value 15 for the Lookup the values in this field could be delimited to expand the uses for this field'
        }
    })
    OtherValue15?: string

    @PropertyDecorator({
        type: 'number',
        required: false,
        jsonSchema: {
            minimum: 0,
            description: "The ranking of this item within it's group"
        }
    })
    Rank?: number | undefined
	
    constructor(partialObject?: Partial<LookupModel>) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
