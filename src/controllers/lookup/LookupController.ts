import { logInvocation } from '@loopback/logging'
import { get, param } from '@loopback/rest'
import {
	ModelIdType,
	HttpMethodsEnum,
	ILookupCurrencyResponse,
	ILookupLanguageResponse,
	ModelIdTypeName
} from '@david.ezechukwu/core'
import { SchemaUtils, RestUtils } from '../../utils'
import { SuperController } from '../SuperController'
import { LookupCategoryModel } from '../../models/LookupCategoryModel'
import { LookupCategoryRequest, LookupCurrencyResponse, LookupLanguageResponse, LookupRequest } from '../../dtobjects'
import { LookupModel } from '../../models'
import { ILookupCountryResponse } from '@david.ezechukwu/core'



/**
 * The Front Controller for Lookups Categories and Lookups
 * @remarks
 * Get localized Lookup based on a Lookup Id
 * @category Lookups
 */
export class LookupController extends SuperController {
	@logInvocation()
	@get(
		`${SuperController.LookupURLPath}/lookups/{id}`,
		SchemaUtils.GetOp(LookupModel, {
			Controller: LookupController.name,
			ControllerMethod: LookupController.prototype.GetLookup.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.LookupTag,
			AdditionalPath: SuperController.LookupURLPath,
			Returns204: true,
			Returns418: true,
			Returns422: true,
		})
	)
	public async GetLookup(
		@RestUtils.IdFromPath('id')
		lookupID: ModelIdType,
		@param.query.string('locale', { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string
	): Promise<LookupModel | null> {
		const req = new LookupRequest({ LookupId: lookupID, Locale: locale, Device: device })
		return new Promise<LookupModel | null>(async (resolve, reject) => {
			try {
				const resp = await this.LookupService.GetLookupById(req)
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}

	@logInvocation()
	@get(
		`${SuperController.LookupURLPath}/lookups`,
		SchemaUtils.GetOp(LookupModel, {
			Controller: LookupController.name,
			ControllerMethod: LookupController.prototype.GetLookups.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.LookupTag,
			AdditionalPath: SuperController.LookupURLPath,
			Returns204: true,
			Returns418: true,
			Returns422: true,
		})
	)
	public async GetLookups(
		@param.query.string('locale', { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string
	): Promise<LookupModel[]> {
		const req = new LookupRequest({ Locale: locale, Device: device })
		return new Promise<LookupModel[]>(async (resolve, reject) => {
			try {
				const resp = await this.LookupService.GetLookups(req)
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}


	@logInvocation()
	@get(
		`${SuperController.LookupURLPath}/categories/{lookupCategoryIdOrValue}/lookups`,
		SchemaUtils.GetOp(LookupCategoryModel, {
			Controller: LookupController.name,
			ControllerMethod: LookupController.prototype.GetLookupCategory.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.LookupTag,
			AdditionalPath: SuperController.LookupURLPath,
			Returns204: true,
			Returns418: true,
			Returns422: true,			
		})
	)
	public async GetLookupCategory(		
		@param.path.string('lookupCategoryIdOrValue', { description: `Provide either the Value or Id property of the Lookup Category. Value type is always a case-insensitive predefined English string whilst Id is based on the configurable ModelIdType, which on this configuration is set as type(${ModelIdTypeName}). Vales are available from lookup/categories`})
		lookupCategoryIdOrValue: string,
		@param.query.string('locale',  { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string
	): Promise<LookupCategoryModel | null> {
		return new Promise<LookupCategoryModel | null>(async (resolve, reject) => {
			try {
				let req: LookupCategoryRequest | undefined = undefined
				let lookupCategoryID: number = 0
				try { lookupCategoryID = parseInt(lookupCategoryIdOrValue) } catch { }
				if (lookupCategoryID) {
					req = new LookupCategoryRequest({ LookupCategoryId: lookupCategoryID, Locale: locale, Device: device })
				} else {
					req = new LookupCategoryRequest({ LookupCategoryValue: lookupCategoryIdOrValue, Locale: locale, Device: device })
				}
				const resp = await this.LookupService.GetLookupCategory(req!)
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}

	@logInvocation()
	@get(
		`${SuperController.LookupURLPath}/categories`,
		SchemaUtils.GetOp(LookupCategoryModel, {
			Controller: LookupController.name,
			ControllerMethod: LookupController.prototype.GetLookupCategories.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.LookupTag,
			IsForArray: true,
			AdditionalPath: SuperController.LookupURLPath,
			Returns418: true,
			Returns422: true,
		})
	)
	public async GetLookupCategories(
		@param.query.string('locale', { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string
	): Promise<LookupCategoryModel[] | null> {
		const req = new LookupCategoryRequest({ Locale: locale, Device: device })
		return new Promise<LookupCategoryModel[] | null>(async (resolve, reject) => {
			try {
				const resp = await this.LookupService.GetLookupCategories(req)
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}

	@logInvocation()
	@get(
		`${SuperController.LookupURLPath}/categories/countries`,
		SchemaUtils.GetOp(LookupCurrencyResponse, {
			Controller: LookupController.name,
			ControllerMethod: LookupController.prototype.GetLookupCountries.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.LookupTag,
			IsForArray: true,
			AdditionalPath: SuperController.LookupURLPath,
			Returns418: true,
			Returns422: true,
		})
	)
	public async GetLookupCountries(
		@param.query.string('locale', { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string
	): Promise<ILookupCountryResponse[] | null> {
		const req = new LookupCategoryRequest({ Locale: locale, Device: device })
		return new Promise<ILookupCountryResponse[] | null>(async (resolve, reject) => {
			try {
				const resp = await this.LookupService.GetCountries(req)
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}

	@logInvocation()
	@get(
		`${SuperController.LookupURLPath}/categories/currencies`,
		SchemaUtils.GetOp(LookupCurrencyResponse, {
			Controller: LookupController.name,
			ControllerMethod: LookupController.prototype.GetLookupCurrencies.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.LookupTag,
			IsForArray: true,
			AdditionalPath: SuperController.LookupURLPath,
			Returns418: true,
			Returns422: true,
		})
	)
	public async GetLookupCurrencies(
		@param.query.string('locale', { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string
	): Promise<ILookupCurrencyResponse[] | null> {
		const req = new LookupCategoryRequest({ Locale: locale, Device: device })
		return new Promise<ILookupCurrencyResponse[] | null>(async (resolve, reject) => {
			try {
				const resp = await this.LookupService.GetCurrencies(req)
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}

	@logInvocation()
	@get(
		`${SuperController.LookupURLPath}/categories/languages`,
		SchemaUtils.GetOp(LookupLanguageResponse, {
			Controller: LookupController.name,
			ControllerMethod: LookupController.prototype.GetLookupLanguages.name,
			Method: HttpMethodsEnum.Get,
			Tag: SchemaUtils.LookupTag,
			IsForArray: true,
			AdditionalPath: SuperController.LookupURLPath,
			Returns418: true,
			Returns422: true,
		})
	)
	public async GetLookupLanguages(
		@param.query.string('locale', { description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.` }) locale: string,
		@param.query.string('device', { description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.` }) device: string
	): Promise<ILookupLanguageResponse[] | null> {
		const req = new LookupCategoryRequest({ Locale: locale, Device: device })
		return new Promise<ILookupLanguageResponse[] | null>(async (resolve, reject) => {
			try {
				const resp = await this.LookupService.GetLanguages(req)
				return resolve(resp)
			} catch (e) {
				reject(e)
			}
		})
	}
}
