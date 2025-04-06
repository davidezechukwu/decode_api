import {belongsTo} from '@loopback/repository'
import {IUserCommunicationPreferences, ModelIdType, IUserCommunicationPreferencesConstants, IUserConstants, ISuperConstants} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {UserModel} from './UserModel'

@ModelDecorator(IUserCommunicationPreferencesConstants.SCHEMA_NAME, IUserCommunicationPreferencesConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's communication preferences"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserCommunicationPreferencess_UserId: {
                name: `fk_UserCommunicationPreferencess_UserId`,
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
export class UserCommunicationPreferencesModel extends SuperModel implements IUserCommunicationPreferences {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @PropertyDecorator({
        type: 'boolean',
        required: true,
        jsonSchema: {
            description: 'Flag that determines if InApp is preferred'
        }
    })
    UseInApp: boolean

    @PropertyDecorator({
        type: 'boolean',
        required: true,
        jsonSchema: {
            description: 'Flag that determines if Email is preferred'
        }
    })
    UseEmail: boolean

	@PropertyDecorator({
        type: 'boolean',
        required: true,
        jsonSchema: {
            description: 'Flag that determines if SMS is preferred'
        }
    })
    UseSMS: boolean

    @PropertyDecorator({
        type: 'boolean',
        required: true,
        jsonSchema: {
            description: 'Flag that determines if WhatsApp is preferred'
        }
    })
    UseWhatsApp: boolean

	@PropertyDecorator({
		type: 'boolean',
		required: true,
		jsonSchema: {
			description: 'Flag that determines if iMessage is preferred'
		}
	})
	UseIMessage: boolean

    constructor(partialObject: Partial<UserCommunicationPreferencesModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
