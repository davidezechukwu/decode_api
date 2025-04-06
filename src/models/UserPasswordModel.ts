import {belongsTo} from '@loopback/repository'
import {IUserPassword, ModelIdType, IUserPasswordConstants, IUserConstants, ISuperConstants} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator, SensitivePropertyDecorator} from '../decorators'
import {UserModel} from './UserModel'


@ModelDecorator(IUserPasswordConstants.SCHEMA_NAME, IUserPasswordConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's password"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserPasswords_UserId: {
                name: `fk_UserPasswords_UserId`,
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
export class UserPasswordModel extends SuperModel implements IUserPassword {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: "The user's password hash"
        }
    })
    PasswordHash: string

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: "The user's password Salt"
        }
    })
    PasswordSalt: string

    @PropertyDecorator({
        type: 'number',
        required: true,
        jsonSchema: {
            description: "The user's password strength, goes from strongest (0 or 1) to above (weaker)"
        }
    })
    PasswordStrength: number

	
    @PropertyDecorator({
        type: 'number',
        required: true,
        jsonSchema: {
            description: "Stores the number of failed login attempts"
        }
    })
    FailedAttempts: number

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: 'reset token',
		}
	})
	ResetToken?: string | undefined

	@PropertyDecorator({
		type: 'date',
		required: false,		
		jsonSchema: {
			description: `Created on the date and time a reset request is sent`
		}
	})
	ResetRequestedOn?: Date | undefined

	@PropertyDecorator({
		type: 'number',
		required: false,
		jsonSchema: {
			description: 'No of user reset attempts, needed to block attacks',
			default: 1
		}
	})
	ResetAttempts?: number | undefined

    constructor(partialObject: Partial<UserPasswordModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
