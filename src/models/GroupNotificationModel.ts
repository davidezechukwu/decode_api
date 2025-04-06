import {belongsTo} from '@loopback/repository'
import {IGroupConstants, IGroupNotification, IGroupNotificationConstants, ILookupConstants, ISuper, ISuperConstants, ModelIdType} from '@david.ezechukwu/core'
import {ModelDecorator, PropertyDecorator} from '../decorators'
import {SuperModel, LookupModel, GroupModel} from '.'

/**
 * The model that represents a group notification
 * */
@ModelDecorator(IGroupNotificationConstants.SCHEMA_NAME, IGroupNotificationConstants.TABLE_NAME, {
    jsonSchema: {description: 'Represents information about a group notification'},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_Security_GroupNotifications_GroupId: {
                name: `fk_Security_GroupNotifications_GroupId`,
                entity: IGroupConstants.TABLE_NAME,
                schema: IGroupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `${IGroupConstants.TABLE_NAME_SINGULAR}${ISuperConstants.ID_NAME}`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_Security_GroupNotifications_LanguageId: {
                name: `fk_Security_GroupNotifications_LanguageId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `LanguageId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_Security_GroupNotifications_NotificationStrategyId: {
                name: `fk_Security_GroupNotifications_NotificationStrategyId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `NotificationStrategyId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            },
            // eslint-disable-next-line
            fk_Security_GroupNotifications_NotificationStatusId: {
                name: `fk_GroupNotifications_NotificationStatusId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `NotificationStatusId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            },
			// eslint-disable-next-line
            fk_Security_GroupNotifications_ImportanceId: {
                name: `fk_GroupNotifications_ImportanceId`,
                entity: ILookupConstants.TABLE_NAME,
                schema: ILookupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `ImportanceId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            },
            // eslint-disable-next-line
            fk_Security_GroupNotifications_ParentId: {
                name: `fk_Security_GroupNotifications_ParentId`,
                entity: IGroupNotificationConstants.TABLE_NAME,
                schema: IGroupNotificationConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `ParentId`,
                onDelete: 'NO ACTION',
                onUpdate: 'NO ACTION'
            }
        }
    }
})
export class GroupNotificationModel extends SuperModel implements IGroupNotification {
    constructor(partialObject?: Partial<GroupNotificationModel>) {
        super(partialObject)
        Object.assign(this, partialObject)
    }

    @belongsTo(() => GroupModel)
    GroupId: ModelIdType

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
            minimum: IGroupNotificationConstants.TO_MIN_LENGTH,
            maximum: IGroupNotificationConstants.TO_MAX_LENGTH,
            description: 'Whom this notification is for, for example, a group email address or WhatsApp group'
        }
    })
    To: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IGroupNotificationConstants.FROM_MIN_LENGTH,
            maximum: IGroupNotificationConstants.FROM_MAX_LENGTH,
            description: 'The identity of the sender, if applicable, for example, a from email address'
        }
    })
    From?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IGroupNotificationConstants.FROM_MIN_LENGTH,
            maximum: IGroupNotificationConstants.FROM_MAX_LENGTH,
            description: 'The name of the sender, if applicable, for example, the name of the entity to use as the email sender'
        }
    })
    FromName?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IGroupNotificationConstants.SUBJECT_MIN_LENGTH,
            maximum: IGroupNotificationConstants.SUBJECT_MAX_LENGTH,
            description: 'Subject of the Notification, if applicable'
        }
    })
    Subject?: string

    @PropertyDecorator({
        type: 'string',
        required: true,
        jsonSchema: {
            minimum: IGroupNotificationConstants.MESSAGE_MIN_LENGTH,
            maximum: IGroupNotificationConstants.MESSAGE_MAX_LENGTH,
            description: 'The core message on the Notification'
        }
    })
    Message: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IGroupNotificationConstants.PARAMETERS_MIN_LENGTH,
            maximum: IGroupNotificationConstants.PARAMETERS_MAX_LENGTH,
            description: 'The parameters for the placeholders on the template'
        }
    })
    Parameters?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IGroupNotificationConstants.RESPONSE_CODE_MIN_LENGTH,
            maximum: IGroupNotificationConstants.RESPONSE_CODE_MAX_LENGTH,
            description: 'The respond code, if any, got from the provider after this notification is sent'
        }
    })
    ResponseCode?: string

    @PropertyDecorator({
        type: 'string',
        required: false,
        jsonSchema: {
            minimum: IGroupNotificationConstants.RESPONSE_BODY_MIN_LENGTH,
            maximum: IGroupNotificationConstants.RESPONSE_BODY_MAX_LENGTH,
            description: 'The respond body, if any, got from the provider after this notification is sent'
        }
    })
    ResponseBody?: string

    @PropertyDecorator({
        type: 'number',
        required: false,
        jsonSchema: {
            default: 0,
            minimum: IGroupNotificationConstants.RETRIES_MIN_VALUE,
            maximum: IGroupNotificationConstants.RETRIES_MAX_VALUE,
            description: 'The number of times this notification has been tried'
        }
    })
    Retries: number
}
