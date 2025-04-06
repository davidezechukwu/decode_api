import {belongsTo} from '@loopback/repository'
import {IUserDisplaySettings, ModelIdType, IUserDisplaySettingsConstants, ILookupConstants, IUserConstants, ISuperConstants} from '@david.ezechukwu/core'
import {SuperModel} from './SuperModel'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {UserModel} from './UserModel'
import {LookupModel} from './LookupModel'

@ModelDecorator(IUserDisplaySettingsConstants.SCHEMA_NAME, IUserDisplaySettingsConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's first name, middle name, last name or nickname"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserDisplaySettingss_UserId: {
                name: `fk_UserDisplaySettingss_UserId`,
                entity: IUserConstants.TABLE_NAME,
                schema: IUserConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `UserId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_UserDisplaySettingss_LanguageId: {
                name: `fk_UserDisplaySettingss_LanguageId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `LanguageId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            },
            // eslint-disable-next-line
            fk_UserDisplaySettingss_ThemeId: {
                name: `fk_UserDisplaySettingss_ThemeId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `ThemeId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            }
        }
    }
})
export class UserDisplaySettingsModel extends SuperModel implements IUserDisplaySettings {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @belongsTo(() => LookupModel)
    LanguageId: ModelIdType

	@belongsTo(() => LookupModel)
    ThemeId: ModelIdType

    @PropertyDecorator({
        type: 'boolean',
        required: true,
        jsonSchema: {
            description: 'Flag that determines if the user using a low-speed connection'
        }
    })
    IsOnLowSpeedConnection: boolean

    @PropertyDecorator({
        type: 'boolean',
        required: true,
        jsonSchema: {
            description: 'Flag that determines if screen animations disabled for the user'
        }
    })
    DisableAnimations: boolean

    @PropertyDecorator({
        type: 'boolean',
        required: true,
        jsonSchema: {
            description: 'Flag that determines if background videos are shown for the user'
        }
    })
    ShowBackgroundVideo: boolean
    
    constructor(partialObject: Partial<UserDisplaySettingsModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
