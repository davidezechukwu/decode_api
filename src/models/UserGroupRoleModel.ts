import {belongsTo} from '@loopback/repository'
import {IUserGroupConstants, IRoleConstants, IUserGroupRole, ModelIdType, IUserGroupRoleConstants, StringUtility, ISuperConstants} from '@david.ezechukwu/core'
import {SuperModel, RoleModel, UserGroupModel} from './'
import {ModelDecorator} from '../decorators'

@ModelDecorator(IUserGroupRoleConstants.SCHEMA_NAME, IUserGroupRoleConstants.TABLE_NAME, {
    jsonSchema: {description: "Represents information about a user's group's roles"},
    settings: {
        foreignKeys: {
            // eslint-disable-next-line
            fk_UserGroupRoles_UserGroupId: {
                name: `fk_UserGroupRoles_UserGroupId`,
                entity: IUserGroupConstants.TABLE_NAME,
                schema: IUserGroupConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `${IUserGroupConstants.TABLE_NAME_SINGULAR}${ISuperConstants.ID_NAME}`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            // eslint-disable-next-line
            fk_UserGroupRoles_RoleId: {
                name: `fk_UserGroupRoles_RoleId`,
                entity: IRoleConstants.TABLE_NAME,
                schema: IRoleConstants.SCHEMA_NAME,
                entityKey: ISuperConstants.ID_NAME,
                foreignKey: `${IRoleConstants.TABLE_NAME_SINGULAR}${ISuperConstants.ID_NAME}`,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        }
    }
})
export class UserGroupRoleModel extends SuperModel implements IUserGroupRole {
    @belongsTo(() => UserGroupModel)
    UserGroupId: ModelIdType

    @belongsTo(() => RoleModel)
    RoleId: ModelIdType

    constructor(partialObject: Partial<UserGroupRoleModel> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
