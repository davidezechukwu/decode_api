import { belongsTo } from '@loopback/repository'
import { IUserLogin, ModelIdType, IUserLoginConstants, IUserConstants, ILookupConstants, ISuperConstants } from '@david.ezechukwu/core'
import { SuperModel } from './SuperModel'
import { SchemaUtils } from '../utils'
import { ModelDecorator, PropertyDecorator } from '../decorators'
import { UserModel } from './UserModel'
import { LookupModel } from './LookupModel'


@ModelDecorator(IUserLoginConstants.SCHEMA_NAME, IUserLoginConstants.TABLE_NAME, {
	jsonSchema: { description: "Represents information about a user's Logon" },
	settings: {
		foreignKeys: {
			// eslint-disable-next-line
			fk_UserLogins_UserId: {
				name: `fk_UserLogins_UserId`,
				entity: IUserConstants.TABLE_NAME,
				schema: IUserConstants.SCHEMA_NAME,
				entityKey: ISuperConstants.ID_NAME,
				foreignKey: `UserId`,
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE'
			},
			// eslint-disable-next-line
			fk_UserLogins_LocationId: {
				name: `fk_UserLogins_LocationId`,
				entity: ILookupConstants.TABLE_NAME,
				schema: ILookupConstants.SCHEMA_NAME,
				entityKey: ISuperConstants.ID_NAME,
				foreignKey: `LocationId`,
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE'
			}
		}
	}
})
export class UserLoginModel extends SuperModel implements IUserLogin {
	@belongsTo(() => UserModel)
	UserId: ModelIdType

	@belongsTo(() => LookupModel)
	LocationId?: ModelIdType

	@PropertyDecorator({
		type: 'number',
		required: false,
		dataType: 'FLOAT',
		jsonSchema: {
			description: 'Latitude is estimated from IP Address when geolocation is turned off or is unavailable on the client device',
			default: 0				
		}
	})
	Latitude?: number | undefined

	@PropertyDecorator({
		type: 'number',
		required: false,
		dataType: 'FLOAT',
		jsonSchema: {
			description: 'Longitude is estimated from IP Address when geolocation is turned off or is unavailable on the client device',
			default: 0			
		}
	})
	Longitude?: number | undefined

	@PropertyDecorator({
		type: 'string',
		required: true,
		jsonSchema: {
			description: `The raw user-agent string of the device this login was made on`
		}
	})
	RawUserAgent: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The raw address of the device this login was made on`
		}
	})
	RawClientAddress?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The client type this login was made on`
		}
	})
	ClientType?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The client this login was made on`
		}
	})
    ClientName?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The client version this login was made on`
		}
	})
    ClientVersion?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The client engine this login was made on`
		}
	})
    ClientEngine?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The client engine version this login was made on`
		}
	})
    ClientEngineVersion?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The Operating System which the client this login was made runs on`
		}
	})
	OSName?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The Operating System version which the client this login was made runs on`
		}
	})
	OSVersion?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The Operating System Platform which the client this login was made runs on`
		}
	})
	OSPlatform?: string	

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The hardware device this login was made on`
		}
	})
	DeviceType?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The hardware device brand this login was made on`
		}
	})
	DeviceBrand?: string

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The hardware device model this login was made on`
		}
	})
	DeviceModel?: string	

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The region this login was made on`
		}
	})
	Region?: string		

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The region's code' this login was made on, if any`
		}
	})
	RegionCode?: string		

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The postcode/area code this login was made on`
		}
	})
	Postcode?: string		

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The city this login was made on`
		}
	})
	City?: string		

	@PropertyDecorator({
		type: 'string',
		required: false,
		jsonSchema: {
			description: `The IP address this login was made on`
		}
	})
	IPAddress?: string

	constructor(partialObject: Partial<UserLoginModel> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
