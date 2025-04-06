import { belongsTo } from '@loopback/repository'
import { ISuperConstants, IUserPhoneNumber, ModelIdType, IUserPhoneNumberConstants, IUserConstants, ILookupConstants } from '@david.ezechukwu/core'
import { SuperModel } from './SuperModel'
import { ModelDecorator, PropertyDecorator, SensitivePropertyDecorator } from '../decorators'
import { UserModel } from './UserModel'
import { LookupModel } from './LookupModel'

@ModelDecorator(IUserPhoneNumberConstants.SCHEMA_NAME, IUserPhoneNumberConstants.TABLE_NAME, {
	jsonSchema: { description: "Represents information about a user's phone number" },
	settings: {
		foreignKeys: {
			// eslint-disable-next-line
			fk_UserPhoneNumbers_UserId: {
				name: `fk_UserPhoneNumbers_UserId`,
				entity: IUserConstants.TABLE_NAME,
				schema: IUserConstants.SCHEMA_NAME,
				entityKey: ISuperConstants.ID_NAME,
				foreignKey: `UserId`,
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE'
			}
		},
		// eslint-disable-next-line
		fk_UserPhoneNumbers_PhoneTypeId: {
			name: `fk_UserPhoneNumbers_PhoneTypeId`,
			entity: ILookupConstants.TABLE_NAME,
			schema: ILookupConstants.SCHEMA_NAME,
			entityKey: ISuperConstants.ID_NAME,
			foreignKey: `PhoneTypeId`,
			onDelete: 'NO ACTION',
			onUpdate: 'NO ACTION'
		},
		// eslint-disable-next-line
		fk_UserPhoneNumbers_LocationId: {
			name: `fk_UserPhoneNumbers_LocationId`,
			entity: ILookupConstants.TABLE_NAME,
			schema: ILookupConstants.SCHEMA_NAME,
			entityKey: ISuperConstants.ID_NAME,
			foreignKey: `LocationId`,
			onDelete: 'NO ACTION',
			onUpdate: 'NO ACTION'
		}
	}
})
export class UserPhoneNumberModel extends SuperModel implements IUserPhoneNumber {
	@belongsTo(() => UserModel)
	UserId: ModelIdType

	@belongsTo(() => LookupModel)
	PhoneTypeId: ModelIdType

	@belongsTo(() => LookupModel)
	LocationId: ModelIdType

	@SensitivePropertyDecorator
	@PropertyDecorator({
		type: 'string',
		required: true,
		jsonSchema: {
			description: 'Phone number',
			minLength: IUserPhoneNumberConstants.PHONE_NUMBER_MIN_LENGTH,
			maxLength: IUserPhoneNumberConstants.PHONE_NUMBER_MAX_LENGTH
		}
	})
	PhoneNumber: string

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

	constructor(partialObject: Partial<UserPhoneNumberModel> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
