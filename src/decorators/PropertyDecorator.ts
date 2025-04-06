import { property, PropertyDefinition } from '@loopback/repository'
import { GetConfigurationFromEnv } from '../Configuration'
const ConfigurationType = GetConfigurationFromEnv()

/**
 * Decorator for model properties 
 */
export function PropertyDecorator(definition?: Partial<PropertyDefinition>) {
	if (definition?.jsonSchema) {
		const db = ConfigurationType.dataSources?.CoreDataSource.name.toLowerCase()
		switch (db) {
			case 'postgresdb': {
				if (definition.type?.toString().toLowerCase() == 'string') { 
					definition['postgresql'] = {}
					if (definition?.jsonSchema && definition.jsonSchema['maxLength'] && definition.jsonSchema['maxLength'] < 10485760) {
						definition['postgresql'].dataType = `character varying(${definition.jsonSchema['maxLength']})`
						definition['postgresql'].dataLength = definition.jsonSchema['maxLength']
					} else {
						definition['postgresql'].dataType = `text`
						definition['postgresql'].dataLength = definition.jsonSchema['maxLength']
					}
				}
				if  (definition.type?.toString().toLowerCase() == 'number') { 										
					if (definition['dataType'] && definition['dataType'].toLowerCase() == 'float') {						
						definition['postgresql'] = {}
						definition['postgresql'].dataType = `float`					
						definition['postgresql'].precision = 20
						definition['postgresql'].scale = 4
					}
				}				
			}
			break
			case 'sqlserverdb': {
				if  (definition.type?.toString().toLowerCase() == 'string') { 					
					definition['mssql'] = {}
					if (definition?.jsonSchema && definition.jsonSchema['maxLength'] && definition.jsonSchema['maxLength'] < 4001) {
						definition['length'] = definition.jsonSchema['maxLength'] //required also for oracle
						definition['mssql'].dataType = `NVARCHAR`
						definition['mssql'].dataLength = definition.jsonSchema['maxLength']
					} else {
						definition['mssql'].dataType = `NVARCHAR`
						definition['mssql'].dataLength = `MAX`
					}
				}
				if  (definition.type?.toString().toLowerCase() == 'number') { 										
					if (definition['dataType'] && definition['dataType'].toLowerCase() == 'float') {						
						definition['mssql'] = {}
						definition['mssql'].dataType = `FLOAT`					
					}
				}				
			}
			break
			default: {
				throw `418[$]There is no implementation for ${db}`
			}
		}
	}
	return property(definition)
}
