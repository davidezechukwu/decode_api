/* eslint-disable @typescript-eslint/naming-convention */
import { HttpMethodsEnum, GeneralUtility } from '@david.ezechukwu/core'
import { CountSchema, Entity } from '@loopback/repository'
import { ContentObject, getModelSchemaRef, OperationObject, ResponseModelOrSpec, ResponseObject, SchemaObject } from '@loopback/rest'
import * as _ from 'lodash'
import { SuperModel } from '../models'
import { SuperRequest } from '../dtobjects'
import { Configuration } from '../Configuration'
import { LocalisationUtils } from './LocalisationUtils'
import { Lookups } from '../_infrastructure/fixtures/localisation/Lookups'
const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const httpResponses = lookups.HTTPResponses


const schemaForError = undefined

/**
 *  @module Schema Utility
 *  Utility for working with OpenAPI
 */
export class SchemaUtils {
	public static HealthCheckTag = 'Health Check'
	public static LookupTag = 'Lookups'
	public static SecurityTag = 'Security'
	public static UserTag = 'User'

	private constructor() { }

	/**
	 * Strip properties which have been tagged as @sensitive
	 * */
	public static StripSensitiveProperties<TMODEL>(model: TMODEL) {
		if (!model) return model
		const _model: { [index: string]: any } = GeneralUtility.DeepCopyWithDescriptors([model])
		Object.keys(_model).forEach(key => {
			if (typeof _model[key] === 'object' && _model[key] !== null) {
				if (_model[key] instanceof Array) {
					for (let item of _model[key]) {
						item = SchemaUtils.StripSensitiveProperties(item)
					}
				} else {
					if (!(_model[key] instanceof Date)) {
						_model[key] = SchemaUtils.StripSensitiveProperties(_model[key])
					}
				}
			}
			const metadataKey = `sensitive:${key}`
			const isSensetiveField = Reflect.getMetadata(metadataKey, model, key)
			if (isSensetiveField) {
				Reflect.deleteProperty(_model, key)
			}
		})
		return _model
	}

	/**
	 * @returns Returns a string array of all the None-Auditing Properties of [[SuperModel]]-based TMODEL<br/>
	 * Auditing Properties include the following:-<br/>
	 * ``['IsDeleted', 'CreatedById', 'CreatedOn', 'UpdatedById', 'UpdatedOn', 'ValidTo', 'ValidFrom']``
	 */
	public static GetNoneAuditingProperties<TMODEL extends SuperModel>(excludeId = false): (keyof TMODEL)[] {
		const fields: (keyof TMODEL)[] = ['IsDeleted', 'CreatedById', 'CreatedOn', 'UpdatedById', 'UpdatedOn', 'ValidTo', 'ValidFrom']
		excludeId ? fields.push('Id') : void null
		return fields
	}

	/**
	 * Get the OPENAPI operation spec for the controller method	 
	 * */
	public static GetOp<TMODEL extends Entity>(
		MODEL: Function & {
			prototype: TMODEL
		},

		options: {
			Controller: string
			ControllerMethod: string
			Method: HttpMethodsEnum
			Tag: string
			Description?: string
			AdditionalPath?: string
			IsForArray?: boolean
			IsForCount?: boolean
			IsSecured?: boolean
			IncludeXMLResponseMediaType?: boolean
			IncludeJSONResponseMediaType?: boolean
			IncludePlainTextResponseMediaType?: boolean
			IncludeHTMLResponseMediaType?: boolean
			Returns201?: boolean
			Returns204?: boolean
			Returns400?: boolean
			Returns401?: boolean
			Returns403?: boolean
			Returns404?: boolean
			Returns406?: boolean
			Returns409?: boolean
			Returns415?: boolean
			Returns418?: boolean
			Returns422?: boolean
			Returns451?: boolean
			Returns500?: boolean
			Returns502?: boolean
			Returns503?: boolean
			Returns504?: boolean
		},
		schemaOptions: {
			title?: string
			includeRelations?: boolean
			partial?: boolean
			mergeObject?: any
			exclude?: (keyof TMODEL)[]
		} = { includeRelations: true }
	): OperationObject | undefined {
		options.IncludeXMLResponseMediaType = options.IncludeXMLResponseMediaType === undefined ? true: options.IncludeXMLResponseMediaType
		options.IncludeJSONResponseMediaType = options.IncludeJSONResponseMediaType === undefined ? true: options.IncludeJSONResponseMediaType
		options.Returns400 = options.Returns400 === undefined ? true : options.Returns400
		options.Returns401 = options.Returns401 === undefined ? options.IsSecured : options.Returns401
		options.Returns403 = options.Returns403 === undefined ? options.IsSecured : options.Returns403
		options.Returns404 = options.Returns404 === undefined ? true : options.Returns404
		options.Returns406 = options.Returns406 === undefined ? true : options.Returns406
		options.Returns409 = options.Returns409 === undefined ? true : options.Returns409
		options.Returns415 = options.Returns415 === undefined ? true : options.Returns415
		options.Returns418 = options.Returns418 === undefined ? true : options.Returns418
		options.Returns422 = options.Returns422 === undefined ? true : options.Returns422
		options.Returns500 = options.Returns500 === undefined ? true : options.Returns500

		const hostUrl = ``
		const operationObject: OperationObject = {
			tags: [options.Tag],
			description: options.Description,
			operationId: `${options.Tag}::${options.Controller}::${options.ControllerMethod}(${HttpMethodsEnum[options.Method]} ${MODEL.name}${options.IsForArray ? 's' : ''}${options.IsForCount ? ' Count' : ''})`,
			externalDocs: {
				url: `${hostUrl}${Configuration.expressJS!.mountPath}${Configuration.rest!.basePath}/docs/classes/controllers${options.AdditionalPath ? '_' + options.AdditionalPath : ''}.${options.Controller}.html#${options.ControllerMethod
					}`,
				description: `${options.Controller} Technical Reference`				
			},
			responses: {
				'200': SchemaUtils.GetResponse(MODEL, options),
				'400': { description: httpResponses['400'].Reason } as ResponseObject,
				'404': {
					description: httpResponses['404'].Reason
				} as ResponseObject,
				'406': { description: httpResponses['406'].Reason } as ResponseObject,
				'415': { description: httpResponses['415'].Reason } as ResponseObject,
				'500': { description: httpResponses['500'].Reason } as ResponseObject
			},
			security: []
		}

		if (options.IsSecured) {
			operationObject.security = [
				{
					auth_header: ['Authentication Header']
				},
				{
					auth_cookie: ['Authentication Cookie']
				},
				{
					basic_auth: ['Basic Authentication']
				},
				{
					bearer_auth: ['Bearer Authentication']
				}
				//Digest requires https://github.com/jaredhanson/passport-http
				//{
				//    digest_auth: ['Digest Authentication'],
				//},
			]
		}
		if (options.Returns201) {
			operationObject.responses['201'] = SchemaUtils.GetResponse(MODEL, options)
		}
		if (options.Returns204) {
			operationObject.responses['204'] = { description: httpResponses['204'].Description } as ResponseObject
		}
		if (options.IsSecured && options.Returns401) {
			operationObject.responses['401'] = { description: httpResponses['401'].Reason } as ResponseObject
		}
		if (options.IsSecured && options.Returns403) {
			operationObject.responses['403'] = { description: httpResponses['403'].Reason } as ResponseObject
		}
		if (options.Returns409) {
			operationObject.responses['409'] = { description: httpResponses['409'].Reason } as ResponseObject
		}
		if (options.Returns418) {
			operationObject.responses['418'] = { description: httpResponses['418'].Reason } as ResponseObject
		}
		if (options.Returns422) {
			operationObject.responses['422'] = { description: httpResponses['422'].Reason } as ResponseObject
		}
		if (options.Returns451) {
			operationObject.responses['451'] = { description: httpResponses['451'].Reason } as ResponseObject
		}
		if (options.Returns502) {
			operationObject.responses['502'] = { description: httpResponses['502'].Reason } as ResponseObject
		}
		if (options.Returns503) {
			operationObject.responses['503'] = { description: httpResponses['503'].Reason } as ResponseObject
		}
		if (options.Returns504) {
			operationObject.responses['504'] = { description: httpResponses['504'].Reason } as ResponseObject
		}
		return operationObject
	}

	/**
	 * Get the OPENAPI operation spec for the controller method for methods that do not return a model
	 * */
	public static GetOpWithoutModel(options: {
		Id: string
		Controller: string
		ControllerMethod: string
		Method: HttpMethodsEnum
		Description: string
		AdditionalPath?: string
		Tag: string
		IsForArray?: boolean
		IsForCount?: boolean
		IsSecured?: boolean
		IncludeXMLResponseMediaType?: boolean
		IncludeJSONResponseMediaType?: boolean
		IncludePlainTextResponseMediaType?: boolean
		IncludeHTMLResponseMediaType?: boolean
		Returns201?: boolean
		Returns204?: boolean
		Returns400?: boolean
		Returns401?: boolean
		Returns403?: boolean
		Returns404?: boolean
		Returns406?: boolean
		Returns409?: boolean
		Returns415?: boolean
		Returns418?: boolean
		Returns422?: boolean
		Returns451?: boolean
		Returns500?: boolean
		Returns502?: boolean
		Returns503?: boolean
		Returns504?: boolean
	}): OperationObject | undefined {
		options.IncludeXMLResponseMediaType = options.IncludeXMLResponseMediaType === undefined ? true: options.IncludeXMLResponseMediaType
		options.IncludeJSONResponseMediaType = options.IncludeJSONResponseMediaType === undefined ? true: options.IncludeJSONResponseMediaType
		options.Returns201 = options.Returns201 ?? (true && (options.Method == HttpMethodsEnum.Post || options.Method == HttpMethodsEnum.Patch))
		options.Returns400 = options.Returns400 === undefined ? true : options.Returns400
		options.Returns401 = options.Returns401 === undefined ? options.IsSecured : options.Returns401
		options.Returns403 = options.Returns403 === undefined ? options.IsSecured : options.Returns403
		options.Returns404 = options.Returns404 === undefined ? true : options.Returns404
		options.Returns406 = options.Returns406 === undefined ? true : options.Returns406
		options.Returns409 = options.Returns409 === undefined ? true : options.Returns409
		options.Returns415 = options.Returns415 === undefined ? true : options.Returns415
		options.Returns418 = options.Returns418 === undefined ? true : options.Returns418
		options.Returns422 = options.Returns422 === undefined ? true : options.Returns422
		options.Returns500 = options.Returns500 === undefined ? true : options.Returns500

		const hostUrl = ``

		const operationObject: OperationObject = {
			tags: [options.Tag],
			description: options.Description,
			operationId: `${options.Tag}::${options.Controller}::${options.ControllerMethod}(${HttpMethodsEnum[options.Method]} ${options.Id}${options.IsForArray ? 's' : ''}${options.IsForCount ? ' Count' : ''})`,
			externalDocs: {
				url: `${hostUrl}${Configuration.expressJS!.mountPath}${Configuration.rest!.basePath}/docs/classes/controllers${options.AdditionalPath ? '_' + options.AdditionalPath : ''}.${options.Controller}.html#${options.ControllerMethod
					}`,
				description: `Technical Reference ${options.Controller}`
			},			
			responses: {
				'200': { description: httpResponses['200'].Description, content: { 'application/json': { schema: { type: 'string' } }, 'text/xml': { schema: { type: 'string' } } } } as ResponseObject,
				'400': { description: httpResponses['400'].Reason } as ResponseObject,
				'404': { description: httpResponses['404'].Reason } as ResponseObject,
				'406': { description: httpResponses['406'].Reason } as ResponseObject,
				'415': { description: httpResponses['415'].Reason } as ResponseObject,
				'500': { description: httpResponses['500'].Reason } as ResponseObject
			},
			security: undefined
		}
		if (options.Returns201) {
			operationObject.responses['201'] = { description: httpResponses['201'].Description, content: { 'application/json': { schema: { type: 'string' } }, 'text/xml': { schema: { type: 'string' } } } } as ResponseObject
		}
		if (options.Returns204) {
			operationObject.responses['204'] = { description: httpResponses['204'].Description, content: { 'application/json': { schema: { type: 'string' } }, 'text/xml': { schema: { type: 'string' } } } } as ResponseObject
		}
		if (options.IsSecured && options.Returns401) {
			operationObject.responses['401'] = { description: httpResponses['401'].Reason } as ResponseObject
		}
		if (options.IsSecured && options.Returns403) {
			operationObject.responses['403'] = { description: httpResponses['403'].Reason } as ResponseObject
		}
		if (options.Returns409) {
			operationObject.responses['409'] = { description: httpResponses['409'].Reason } as ResponseObject
		}
		if (options.Returns418) {
			operationObject.responses['418'] = { description: httpResponses['418'].Reason } as ResponseObject
		}
		if (options.Returns422) {
			operationObject.responses['422'] = { description: httpResponses['422'].Reason } as ResponseObject
		}
		if (options.Returns451) {
			operationObject.responses['451'] = { description: httpResponses['451'].Reason } as ResponseObject
		}
		if (options.Returns502) {
			operationObject.responses['502'] = { description: httpResponses['502'].Reason } as ResponseObject
		}
		if (options.Returns503) {
			operationObject.responses['503'] = { description: httpResponses['503'].Reason } as ResponseObject
		}
		if (options.Returns504) {
			operationObject.responses['504'] = { description: httpResponses['504'].Reason } as ResponseObject
		}
		return operationObject
	}


	/**
	 * Get the OPENAPI response spec for the controller method
	 * */
	public static GetResponse<TMODEL extends SuperModel>(
		MODEL: Function & { prototype: TMODEL },
		options: {
			Method: HttpMethodsEnum
			Description?: string
			IsForArray?: boolean
			IsForCount?: boolean
			IsSecured?: boolean
			IncludeXMLResponseMediaType?: boolean
			IncludeJSONResponseMediaType?: boolean
			IncludePlainTextResponseMediaType?: boolean
			IncludeHTMLResponseMediaType?: boolean
		}
	): ResponseModelOrSpec {
		let description = ''
		if (options.Description) {
			description = options.Description
		} else {
			if (options.IsForArray) {
				description = `An array of ${MODEL.name} resources if the request was successful`
			} else if (options.IsForCount) {
				description = `A count of ${MODEL.name} resources if the request was successful`
			} else {
				description = `A ${MODEL.name} resource if the request was successful`
			}
		}

		let content = undefined
		if (options.IsForArray) {
			content = SchemaUtils.GetResponseMediaTypesForArrays(MODEL, options)
		} else {
			content = SchemaUtils.GetResponseMediaTypes(MODEL, options)
		}
		const responseModelOrSpec: ResponseModelOrSpec = {
			description: description,
			content: content
		}
		return responseModelOrSpec
	}

	/**
	 * Get the OPENAPI response media types spec for the controller method
	 * */
	public static GetResponseMediaTypes<TMODEL extends SuperModel>(
		MODEL: Function & { prototype: TMODEL },
		options: {
			IsForCount?: boolean
			IncludeXMLResponseMediaType?: boolean
			IncludeJSONResponseMediaType?: boolean
			IncludePlainTextResponseMediaType?: boolean
			IncludeHTMLResponseMediaType?: boolean
		}
	): ContentObject {
		let contentObject: ContentObject = {}
		if (options.IncludeXMLResponseMediaType){
			contentObject['text/xml'] = { schema: options.IsForCount ? CountSchema : SchemaUtils.GetModelSchema(MODEL) }
		}
		if (options.IncludeJSONResponseMediaType){
			contentObject['application/json'] =  { schema: options.IsForCount ? CountSchema : SchemaUtils.GetModelSchema(MODEL) }		
		}		
		if (options.IncludePlainTextResponseMediaType) {
			contentObject['text/plain'] = { schema: { type: 'string' } }
		}
		if (options.IncludeHTMLResponseMediaType) {
			contentObject['text/html'] = { schema: options.IsForCount ? CountSchema : SchemaUtils.GetModelSchema(MODEL) }
		}
		return contentObject
	}

	/**
	 * Get the OPENAPI response media types spec for the controller method that returns arrays
	 * */
	public static GetResponseMediaTypesForArrays<TMODEL extends SuperModel>(
		MODEL: Function & { prototype: TMODEL },
		options: {
			IncludePlainTextResponseMediaType?: boolean
			IncludeHTMLResponseMediaType?: boolean
		}
	): ContentObject {
		const contentObject: ContentObject = {
			'application/json': {
				schema: {
					type: 'array',
					items: SchemaUtils.GetModelSchema(MODEL)
				}
			},
			'text/xml': {
				schema: {
					type: 'array',
					items: SchemaUtils.GetModelSchema(MODEL)
				}
			}
		}
		if (options.IncludePlainTextResponseMediaType) {			
			contentObject['text/plain'] = {
				schema: {
					type: 'array',
					items: SchemaUtils.GetModelSchema(MODEL)
				}
			}
		}
		if (options.IncludeHTMLResponseMediaType) {
			contentObject['text/html'] = {
				schema: {
					type: 'array',
					items: SchemaUtils.GetModelSchema(MODEL)
				}
			}
		}
		return contentObject
	}

	/**
	 * Get a model schema	 
	 */
	public static GetModelSchema<TMODEL extends SuperModel | Entity>(
		MODEL: Function & { prototype: TMODEL },
		options: {
			title?: string
			includeRelations?: boolean
			partial?: boolean
			mergeObject?: any
			exclude?: (keyof TMODEL)[]
		} = {}
	): SchemaObject {
		const _opt = { title: MODEL.name, includeRelations: true, partial: false, mergeObject: {}, exclude: [] }
		const _options = _.merge(_opt, options)
		let schemaObject = getModelSchemaRef<TMODEL>(MODEL, {
			title: _options.title,
			includeRelations: _options.includeRelations,
			partial: _options.partial,
			exclude: _options.exclude
		})
		schemaObject = _.merge(schemaObject, _options.mergeObject)
		return schemaObject
	}

	/**
	 * Get a controller method's request object schema'
	 * */
	public static GetRequestSchema<TMODEL extends SuperRequest>(
		MODEL: Function & { prototype: TMODEL },
		options: {
			title?: string
			includeRelations?: boolean
			partial?: boolean
			mergeObject?: any
			exclude?: (keyof TMODEL)[]
		} = {}
	): SchemaObject {
		const _opt = { title: MODEL.name, includeRelations: true, partial: false, mergeObject: {}, exclude: [] }
		const _options = _.merge(_opt, options)
		let schemaObject = getModelSchemaRef<TMODEL>(MODEL, {
			title: _options.title,
			includeRelations: _options.includeRelations,
			partial: _options.partial,
			exclude: _options.exclude
		})
		schemaObject = _.merge(schemaObject, _options.mergeObject)
		return schemaObject
	}
}
