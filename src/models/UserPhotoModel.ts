import { belongsTo } from '@loopback/repository'
import { IUserPhoto, ModelIdType, IUserPhotoConstants, IUserConstants, ISuperConstants, ILookupConstants } from '@david.ezechukwu/core'
import { SuperModel } from './SuperModel'
import { ModelDecorator, PropertyDecorator } from '../decorators'
import { UserModel } from './UserModel'
import { LookupModel } from './LookupModel'

@ModelDecorator(IUserPhotoConstants.SCHEMA_NAME, IUserPhotoConstants.TABLE_NAME, {
	jsonSchema: { description: "Represents information about a user's photos" },
	settings: {
		foreignKeys: {
			// eslint-disable-next-line
			fk_UserPhotos_UserId: {
				name: `fk_UserPhotos_UserId`,
				entity: IUserConstants.TABLE_NAME,
				schema: IUserConstants.SCHEMA_NAME,
				entityKey: ISuperConstants.ID_NAME,
				foreignKey: `UserId`,
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE'
			}
		},
		// eslint-disable-next-line
		fk_UserPhotos_PhotoTypeId: {
			name: `fk_UserPhotos_PhotoTypeId`,
			entity: ILookupConstants.TABLE_NAME,
			schema: ILookupConstants.SCHEMA_NAME,
			entityKey: ISuperConstants.ID_NAME,
			foreignKey: `PhotoTypeId`,
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		}
	}
})
export class UserPhotoModel extends SuperModel implements IUserPhoto {
	@belongsTo(() => UserModel)
	UserId: ModelIdType

	@belongsTo(() => LookupModel)
	PhotoTypeId: ModelIdType

	@PropertyDecorator({
		type: 'string',
		required: true,
		jsonSchema: {
			description: "The url to the user's photo",
			minLength: IUserPhotoConstants.URL_MIN_LENGTH,
			maxLength: IUserPhotoConstants.URL_MAX_LENGTH
		}
	})
	URL: string

	@PropertyDecorator({
		type: 'number',
		required: false,
		jsonSchema: {
			description: 'Rank with 1 being the most high',
			default: 1
		}
	})
	Rank?: number | undefined

	constructor(partialObject: Partial<UserPhotoModel> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
