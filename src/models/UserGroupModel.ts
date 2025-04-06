import {belongsTo} from '@loopback/repository'
import {IUserGroup, IUserConstants, ModelIdType, IUserGroupConstants, IGroupConstants, StringUtility, ISuperConstants} from '@david.ezechukwu/core'
import {SuperModel, UserModel, GroupModel} from './'
import {ModelDecorator} from '../decorators'

@ModelDecorator(IUserGroupConstants.SCHEMA_NAME, IUserGroupConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's groups"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserGroups_UserId: {
                name: `fk_UserGroups_UserId`,
                entity: IUserConstants.TABLE_NAME,
                schema: IUserConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `UserId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_UserGroups_GroupId: {
                name: `fk_UserGroups_GroupId`,
                entity: IGroupConstants.TABLE_NAME,
                schema: IGroupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `GroupId`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        }
    }
})
export class UserGroupModel extends SuperModel implements IUserGroup {
    @belongsTo(() => UserModel)
    UserId: ModelIdType

    @belongsTo(() => GroupModel)
    GroupId: ModelIdType

    constructor(partialObject: Partial<UserGroupModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
