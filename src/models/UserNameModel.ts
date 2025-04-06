import {belongsTo} from '@loopback/repository'
import {IUserName, ModelIdType, IUserNameConstants, IUserConstants, ISuperConstants} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator, SensitivePropertyDecorator} from '../decorators'
import {UserModel} from './UserModel'


@ModelDecorator(IUserNameConstants.SCHEMA_NAME, IUserNameConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's profile"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserNames_UserId: {
                name: `fk_UserName_UserId`,
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
export class UserNameModel extends SuperModel implements IUserName {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            description: `The display name of the user`,
            minLength: IUserNameConstants.DISPLAY_NAME_MIN_LENGTH,
            maxLength: IUserNameConstants.DISPLAY_NAME_MAX_LENGTH
        }
    })
    DisplayName?: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            description: `The title of the user`,
            minLength: IUserNameConstants.TITLE_MIN_LENGTH,
            maxLength: IUserNameConstants.TITLE_MAX_LENGTH
        }
    })
    Title?: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: `The first name of the user`,
            minLength: IUserNameConstants.FIRSTNAME_MIN_LENGTH,
            maxLength: IUserNameConstants.FIRSTNAME_MAX_LENGTH
        }
    })
    FirstName: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            description: `The middle name of the user`,
            minLength: IUserNameConstants.MIDDLENAME_MIN_LENGTH,
            maxLength: IUserNameConstants.MIDDLENAME_MAX_LENGTH
        }
    })
    MiddleName?: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: `The last name of the user`,
            minLength: IUserNameConstants.LASTNAME_MIN_LENGTH,
            maxLength: IUserNameConstants.LASTNAME_MAX_LENGTH
        }
    })
    LastName: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            description: `The nickname of the user`,
            minLength: IUserNameConstants.NICKNAME_MIN_LENGTH,
            maxLength: IUserNameConstants.NICKNAME_MAX_LENGTH
        }
    })
    NickName?: string

    constructor(partialObject: Partial<UserNameModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
