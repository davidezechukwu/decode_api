import { Request, RestBindings, RequestContext, Response, RestServer, OperationObject, getModelSchemaRef } from '@loopback/rest'
import { inject } from '@loopback/core'
import { LoggingBindings, WinstonLogger } from '@loopback/logging'
import { SuperBindings } from '../SuperBindings'
import { ConfigurationType, Device, Locale } from '../Configuration'
import { AuthenticationService, AuthorizationService, LookupService, UserService } from '../services'
import { ISuperRequestWithLocaleAndDevice, ModelIdType } from '@david.ezechukwu/core'
import { RestUtils } from '../utils'
import { NotificationService } from '../services/notification/NotificationService'
/**
 * The Super Front-end controller
 * @remarks
 * Abstract Base class which contains common methods, which are sometimes used for design patterns such as the Template Method Pattern
 * @category Super
 */
export abstract class SuperController {
	@inject(RestBindings.BASE_PATH) protected RestServerBasePath: string
	@inject(RestBindings.SERVER) protected RestServer: RestServer
	@inject(RestBindings.Http.CONTEXT) protected RequestContext: RequestContext
	@inject(RestBindings.Http.REQUEST) protected Request: Request
	@inject(RestBindings.Http.RESPONSE) protected Response: Response
	@inject(LoggingBindings.WINSTON_LOGGER) protected Logger: WinstonLogger
	@inject(SuperBindings.ConfigurationTypeBindingKey.key) protected Configuration: ConfigurationType
	@inject(SuperBindings.AuthenticationServiceBindingKey.key) protected AuthenticationService: AuthenticationService
	@inject(AuthorizationService.BINDING_KEY.key) protected AuthorizationService: AuthorizationService
	@inject(SuperBindings.UserServiceBindingKey.key) protected UserService: UserService
	@inject(SuperBindings.LookupServiceBindingKey.key) protected LookupService: LookupService
	@inject(SuperBindings.NotificationServiceBindingKey.key) protected NotificationService: NotificationService

	public static readonly HealthURLPath: string = 'healthcheck'
	public static readonly LookupURLPath: string = 'lookup'
	public static readonly SecurityURLPath: string = 'security'
	public static readonly UserURLPath: string = 'user'

	constructor() { }

	public static GetControllerOperationSpecForPost(
		requestModel: any,
		responseModel: any,
		operationObjectDescription: string,
		operationObjectRequestBodyDescription: string,
		operationObject200ResponseDescription: string,
		requestModelName: string,
		responseModelName: string
	): OperationObject {
		let operationObject: OperationObject | undefined = undefined

		const requestSchema = getModelSchemaRef(requestModel, {
			title: requestModelName,
			partial: false,
			includeRelations: false,
			exclude: ['Id', 'IsDeleted', 'CreatedById', 'CreatedOn', 'UpdatedById', 'UpdatedOn', 'ValidTo', 'ValidFrom']
		}).definitions[requestModelName]
		operationObject = {
			description: operationObjectDescription,
			requestBody: {
				required: true,
				description: operationObjectRequestBodyDescription,
				content: {
					// eslint-disable-next-line
					'application/json': {
						schema: requestSchema
					},
					// eslint-disable-next-line
					'application/x-www-form-urlencoded': {
						schema: requestSchema
					},
					// eslint-disable-next-line
					'application/xml': {
						schema: requestSchema
					}
				}
			},
			responses: {
				// eslint-disable-next-line
				'200': {
					description: operationObject200ResponseDescription,
					content: {
						// eslint-disable-next-line
						'application/json': {
							schema: getModelSchemaRef(responseModel, { title: responseModelName, includeRelations: true }).definitions[responseModelName]
						},
						// eslint-disable-next-line
						'application/ xml': {
							schema: getModelSchemaRef(responseModel, { title: responseModelName, includeRelations: true }).definitions[responseModelName]
						}
					}
				}
			}
		}

		return operationObject!
	}

	/**
	 * Determines the locale  to use  first from the path, next from the body and then from accept-language header, 
	 * finally defaulting to default locale
	 * @returns A 2-letter locale string
	 */
	public DetermineLocale({ localeParam, request }: {
		localeParam: string
		request: ISuperRequestWithLocaleAndDevice | undefined
	}
	): Locale {
		if (localeParam) {
			return localeParam as Locale
		}
		if (request && request.Locale) {
			return request.Locale as Locale
		}
		if (this.Request.headers['accept-language']) {
			return RestUtils.GetLocale(this.Request.headers['accept-language'])
		}
		return this.Configuration.localisation.defaultLocale
	}

	/**
	 * Determines the device  to use  first from the path, next from the body and then from user agent string, 
	 * finally defaulting to default device	 
	 * @returns the device enumeration name
	 */
	public DetermineDevice({ request }: {		
		request: ISuperRequestWithLocaleAndDevice | undefined
	}
	): Device {
		if (request && request.Device) {
			return request.Device as Device
		}

		//TODO: determine from user agent string
		//if (this.Request.headers['accept-language']) {
		//	return RestUtils.GetLocale(this.Request.headers['accept-language'])
		//}
		return this.Configuration.localisation.defaultDevice
	}

	public async IsUserActionAllowed(updaterUserId: ModelIdType): Promise<[boolean, string?]> {
		if (this.Request.session.User?.Id === updaterUserId) {
			return [true]
		}
		if (!this.Request.session.User?.Id){
			return [false,'401[$]User is not authenticated']
		}
		return [false,'403[$]There was a mismatch between the authenticated user and the owner of the object being updated or created']
	}
}
