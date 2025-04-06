import {belongsTo} from '@loopback/repository'
import {ISuperConstants, IUserWebLink, ModelIdType, IUserWebLinkConstants, IUserConstants} from '@david.ezechukwu/core'
import {LookupModel} from './LookupModel'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {SuperModel} from './SuperModel'
import {UserModel} from './UserModel'


@ModelDecorator(IUserWebLinkConstants.SCHEMA_NAME, IUserWebLinkConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's web links for example, social media links"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserWebLinks_UserId: {
                name: `fk_UserWebLinks_UserId`,
                entity: IUserConstants.TABLE_NAME,
                schema: IUserConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `UserId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        }
    }
})
export class UserWebLinkModel extends SuperModel implements IUserWebLink {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @belongsTo(() => LookupModel)
    ProviderLookupId: ModelIdType

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: "The user's email address",
            minLength: IUserWebLinkConstants.URL_MIN_LENGTH,
            maxLength: IUserWebLinkConstants.URL_MAX_LENGTH
        }
    })
    URL: string

    @PropertyDecorator({
        type: 'number',
        required: false,
        jsonSchema: {
            description: 'Precedence with 1 being the most high',
            default: 1
        }
    })
    Rank?: number | undefined

    constructor(partialObject: Partial<UserWebLinkModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
