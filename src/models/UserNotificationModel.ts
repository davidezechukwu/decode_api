import {belongsTo} from '@loopback/repository'
import {IUserConstants, ModelIdType, ILookupConstants, IUserNotification, IUserNotificationConstants, ISuperConstants} from '@david.ezechukwu/core'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {UserModel, SuperModel, LookupModel} from '.'

/**
 * The model that represents a notification
 * */
@ModelDecorator(IUserNotificationConstants.SCHEMA_NAME, IUserNotificationConstants.TABLE_NAME, {
    jsonSchema: {description: 'Represents information about a user notification'},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserNotifications_UserId: {
                name: `fk_UserNotifications_UserId`,
                entity: IUserConstants.TABLE_NAME,
                schema: IUserConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `UserId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_UserNotifications_LanguageId: {
                name: `fk_UserNotifications_LanguageId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `LanguageId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_UserNotifications_NotificationStrategyId: {
                name: `fk_UserNotifications_NotificationStrategyId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `NotificationStrategyId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            },
            // eslint-disable-next-line
            fk_UserNotifications_NotificationStatusId: {
                name: `fk_UserNotifications_NotificationStatusId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `NotificationStatusId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            },
			// eslint-disable-next-line
            fk_Security_UserNotifications_ImportanceId: {
                name: `fk_UserNotifications_ImportanceId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `ImportanceId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            },
            // eslint-disable-next-line
            fk_UserNotifications_ParentId: {
                name: `fk_UserNotifications_ParentId`,
                entity: IUserNotificationConstants.TABLE_NAME,
                schema: IUserNotificationConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `ParentId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            }
        }
    }
})
export class UserNotificationModel extends SuperModel implements IUserNotification {
    constructor(partialObject?: Partial<UserNotificationModel>) {
        super(partialObject)
        Object.assign(this, partialObject)
    }

    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @belongsTo(() => LookupModel)
    LanguageId: ModelIdType

    @belongsTo(() => LookupModel)
    NotificationStrategyId: ModelIdType

    @belongsTo(() => LookupModel)
    NotificationStatusId: ModelIdType

	@belongsTo(() => LookupModel)
    ImportanceId: ModelIdType

    @belongsTo(() => LookupModel)
    ParentId?: ModelIdType

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: IUserNotificationConstants.TO_MIN_LENGTH,
            maximum: IUserNotificationConstants.TO_MAX_LENGTH,
            description: 'Whom this notification is for, for example, an email address, a phone number or skype handle'
        }
    })
    To: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IUserNotificationConstants.FROM_MIN_LENGTH,
            maximum: IUserNotificationConstants.FROM_MAX_LENGTH,
            description: 'The identity of the sender, if applicable, for example, a from email address'
        }
    })
    From?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IUserNotificationConstants.FROM_MIN_LENGTH,
            maximum: IUserNotificationConstants.FROM_MAX_LENGTH,
            description: 'The name of the sender, if appllicable, for example, the name of the entity to use as the email sender'
        }
    })
    FromName?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IUserNotificationConstants.SUBJECT_MIN_LENGTH,
            maximum: IUserNotificationConstants.SUBJECT_MAX_LENGTH,
            description: 'Subject of the Notification, if applicable'
        }
    })
    Subject?: string

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: IUserNotificationConstants.MESSAGE_MIN_LENGTH,
            maximum: IUserNotificationConstants.MESSAGE_MAX_LENGTH,
            description: 'The core message on the Notification'
        }
    })
    Message: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IUserNotificationConstants.PARAMETERS_MIN_LENGTH,
            maximum: IUserNotificationConstants.PARAMETERS_MAX_LENGTH,
            description: 'The parameters for the placeholders on the template'
        }
    })
    Parameters: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IUserNotificationConstants.RESPONSE_CODE_MIN_LENGTH,
            maximum: IUserNotificationConstants.RESPONSE_CODE_MAX_LENGTH,
            description: 'The respond code, if any, got from the provider after this notification is sent'
        }
    })
    ResponseCode?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IUserNotificationConstants.RESPONSE_BODY_MIN_LENGTH,
            maximum: IUserNotificationConstants.RESPONSE_BODY_MAX_LENGTH,
            description: 'The respond body, if any, got from the provider after this notification is sent'
        }
    })
    ResponseBody?: string

    @PropertyDecorator({
        type: 'number',
        required: false,
        jsonSchema: {
            default: 0,
            minimum: IUserNotificationConstants.RETRIES_MIN_VALUE,
            maximum: IUserNotificationConstants.RETRIES_MAX_VALUE,
            description: 'The number of times this notification has been tried'
        }
    })
    Retries: number    
}
