import {belongsTo} from '@loopback/repository'
import {ISuperConstants, IUserEmailAddress, ModelIdType, IUserEmailAddressConstants, IUserConstants, ILookupConstants} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator, SensitivePropertyDecorator} from '../decorators'
import {UserModel} from './UserModel'
import { LookupModel } from './LookupModel'

@ModelDecorator(IUserEmailAddressConstants.SCHEMA_NAME, IUserEmailAddressConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's email address"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserEmailAddresss_UserId: {
                name: `fk_UserEmailAddresss_UserId`,
                entity: IUserConstants.TABLE_NAME,
                schema: IUserConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `UserId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
			// eslint-disable-next-line
			fk_UserEmailAddress_EmailAddressTypeId: {
				name: `fk_UserEmailAddress_EmailAddressTypeId`,
				entity: ILookupConstants.TABLE_NAME,
				schema: ILookupConstants.SCHEMA_NAME,
				entityKey: ISuperConstants.ID_NAME,
				foreignKey: `EmailAddressTypeId`,
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE'
			}
        }
    }
})
export class UserEmailAddressModel extends SuperModel implements IUserEmailAddress {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

	@belongsTo(() => LookupModel)
	EmailAddressTypeId: ModelIdType

    @SensitivePropertyDecorator
    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            description: 'Email address',
            minLength: ISuperConstants.EMAIL_ADDRESS_MIN_LENGTH,
            maxLength: ISuperConstants.EMAIL_ADDRESS_MAX_LENGTH
        }
    })
    EmailAddress: string

    @PropertyDecorator({
        type: 'number',
        required: false,
        jsonSchema: {
            description: 'Rank with 1 being the most high',
            default: 1
        }
    })
    Rank?: number | undefined

	@PropertyDecorator({
		type: 'boolean',
		required: false,
		jsonSchema: {
			description: 'True if user has verified ownership',
			default: false
		}
	})
	Verified?: boolean

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: 'Verification token',
		}
	})
	VerificationToken?: string | undefined

	@PropertyDecorator({
		type: 'date',
		required: false,		
		jsonSchema: {
			description: `Created on the date and time a verification request is sent`
		}
	})
	VerificationRequestedOn?: Date | undefined

	@PropertyDecorator({
		type: 'number',
		required: false,
		jsonSchema: {
			description: 'No of user verification attempts, needed to block attacks',
			default: 1
		}
	})
	VerificationAttempts?: number | undefined

    constructor(partialObject: Partial<UserEmailAddressModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
