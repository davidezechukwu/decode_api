import { model, ModelDefinitionSyntax } from '@loopback/repository';
import { IUserConstants, ISuperConstants, StringUtility } from '@david.ezechukwu/core';
import { GetConfigurationFromEnv } from '../Configuration';
import { SQLMigrations } from '../datasources/SQLMigrations';
const ConfigurationType = GetConfigurationFromEnv();

/**
 * Decorator for model definitions 
 */
export function ModelDecorator(schema: string, table: string, definition?: Partial<ModelDefinitionSyntax>) {
	definition = definition ?? {};
	definition.settings = definition.settings ?? {};	
	definition.settings.foreignKeys = definition.settings.foreignKeys ?? {};

	const db = ConfigurationType.dataSources?.CoreDataSource.name.toLowerCase();
	switch (db) {
		case 'postgresdb':
			{
				definition.settings!['postgresql'] = definition.settings!['postgresql'] ?? {};
				definition.settings!['postgresql'].schema = schema;
				definition.settings!['postgresql'].table = table;
			}
			break;
		case 'sqlserverdb': {
			definition.settings!['mssql'] = definition.settings!['mssql'] ?? {};
			definition.settings!['mssql'].schema = schema;
			definition.settings!['mssql'].table = table;
		}
	}

	const createdByFK = `fk_${schema}_${StringUtility.Singular(table)}_CreatedById`;
	definition.settings.foreignKeys[createdByFK] = {
		name: createdByFK,
		entity: IUserConstants.TABLE_NAME,
		schema: IUserConstants.SCHEMA_NAME,
		entityKey: ISuperConstants.ID_NAME,
		foreignKey: `CreatedById`,
		onDelete: 'NO ACTION',
		onUpdate: 'NO ACTION'
	};

	const updatedByFK = `fk_${schema}_${StringUtility.Singular(table)}_UpdatedById`;
	definition.settings.foreignKeys[updatedByFK] = {
		name: updatedByFK,
		entity: IUserConstants.TABLE_NAME,
		schema: IUserConstants.SCHEMA_NAME,
		entityKey: ISuperConstants.ID_NAME,
		foreignKey: `UpdatedById`,
		onDelete: 'NO ACTION',
		onUpdate: 'NO ACTION'
	};

	switch (db) {
		case 'postgresdb': {
			for (const foreignKeyDef in definition.settings.foreignKeys) {
				const foreignKey = definition.settings.foreignKeys[foreignKeyDef];
				foreignKey.entity = foreignKey.entity.toLowerCase();
				foreignKey.schema = foreignKey.schema.toLowerCase();
				foreignKey.entityKey = foreignKey.entityKey.toLowerCase();
				foreignKey.foreignKey = foreignKey.foreignKey.toLowerCase();
			}
			break;
		}
		case 'sqlserverdb': {
			for (const foreignKeyDef in definition.settings.foreignKeys) {
				const foreignKey = definition.settings.foreignKeys[foreignKeyDef];
				const onUpdate = definition.settings.foreignKeys[foreignKeyDef].onUpdate;
				const onDelete = definition.settings.foreignKeys[foreignKeyDef].onDelete;
				const sql = `ALTER TABLE ${schema}.${table} ADD CONSTRAINT ${foreignKey.name} FOREIGN KEY (${foreignKey.foreignKey}) REFERENCES ${foreignKey.schema}.${foreignKey.entity}(${foreignKey.entityKey}) ON UPDATE ${onUpdate} ON DELETE ${onDelete}`;
				SQLMigrations.push(sql);
			}
			break;
		}
		default: {
			throw `418[$]There is no implementation for ${db}`
		}
	}
	return model(definition);
}
