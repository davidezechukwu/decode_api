import { Entity, model } from '@loopback/repository'
import { getJsonSchema } from '@loopback/repository-json-schema'
import { IUserGroupAndRoleResponse } from '@david.ezechukwu/core'
import { GroupModel } from '../../models/GroupModel'
import { RoleModel } from '../../models/RoleModel'
import { PropertyDecorator } from '../../decorators'


@model({ name: `${UserGroupAndRoleResponse.name}`, jsonSchema: { title: `${UserGroupAndRoleResponse.name}`, description: `${UserGroupAndRoleResponse.name}` } })
export class UserGroupAndRoleResponse extends Entity implements IUserGroupAndRoleResponse {
	@PropertyDecorator({
		type: 'object',
		jsonSchema: getJsonSchema(GroupModel)
	})
	public Group: GroupModel

	@PropertyDecorator({
		type: 'object',
		jsonSchema: getJsonSchema(RoleModel)
	})
	public Role: RoleModel

	constructor(partialObject: Partial<UserGroupAndRoleResponse> = {}) {
		super(partialObject)
		Object.assign(this, partialObject)
	}
}
