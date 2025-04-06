import {belongsTo} from '@loopback/repository'
import {IUserLogon, ModelIdType, IUserLogonConstants, IUserConstants, ILookupConstants, ISuperConstants} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator, SensitivePropertyDecorator} from '../decorators'
import {UserModel} from './UserModel'
import {LookupModel} from './LookupModel'


@ModelDecorator(IUserLogonConstants.SCHEMA_NAME, IUserLogonConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's Logon"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserLogons_UserId: {
                name: `fk_UserLogons_UserId`,
                entity: IUserConstants.TABLE_NAME,
                schema: IUserConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `UserId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_UserLogons_ProviderId: {
                name: `fk_UserLogons_ProviderId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `ProviderId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        }
    }
})
export class UserLogonModel extends SuperModel implements IUserLogon {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @belongsTo(() => LookupModel)
    ProviderId: ModelIdType

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: `The Id of the user on the profile provider`
        }
    })
    ProviderUserId: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            description: `The username of the user on the profile provider`
        }
    })
    ProviderUserName?: string

    @PropertyDecorator({
        type: 'number',
        required: false,
        jsonSchema: {
            description: 'Precedence with 1 being the most high',
            default: 1
        }
    })
    Rank?: number | undefined

    constructor(partialObject: Partial<UserLogonModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
