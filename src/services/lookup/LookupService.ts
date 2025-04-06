import { inject, injectable } from '@loopback/core'
import * as _ from 'lodash'
import { 
	TypeUtility,
	ILookupCountryResponse,
	ILookupCategoryRequest, 
	GeneralUtility, 
	ILookupCategory, 
	ILookup, 
	ILookupCurrencyResponse,
    ModelIdType,
    StringUtility,
    ILookupRequest
} from '@david.ezechukwu/core'
import { SuperService } from '../SuperService'
import { LookupCategoryRepositoryService, LookupRepositoryService } from '../../repositories'
import { LookupCategoryModel } from '../../models/LookupCategoryModel'
import { LookupCurrencyResponse } from '../../dtobjects/responses/LookupCurrencyResponse'
import { LookupLanguageResponse } from '../../dtobjects/responses/LookupLanguageResponse'
import { RestUtils, LocalisationUtils } from '../../utils'
import { SuperBindings } from '../../SuperBindings'
import { Lookups } from '../../_infrastructure/fixtures/localisation/Lookups'
import { LookupModel } from '../../models'
import { LookupRequest } from '../../dtobjects'
import { LookupCountryResponse } from '../../dtobjects/responses/LookupCountryResponse'
import { lookup } from 'dns/promises'

const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()


/** Errors thrown by this service. Use the syntax shown below,a s this is what the Sequence Handler expects
 */
export const LookupServiceErrors = {	
	NoLookupCategoryFound: '422[$]There is no lookup category with the {{0}}({{1}})',	
	LocalizationFailure: '418[$]Localization failed for {{0}}.{{1}}({{2}}, {{3}})',
	NoLookup: '422[$]There were no lookup with the {{0}}({{1}}) {{2}}'
}

/**
 * The service for handling localized lookups.
 * @remarks
 * All key/value pairs are implemented as categorized lookups.
 * Some key/value pairs such as currencies and countries have dedicated models
 * */
@injectable({ tags: { key: SuperBindings.LookupServiceBindingKey.key } })
export class LookupService extends SuperService {
	public static CurrencyLookupCategoryName = TypeUtility.NameOf<Lookups>('Currencies')
	public static LanguageLookupCategoryName = TypeUtility.NameOf<Lookups>('Languages')
	public static CountryLookupCategoryName = TypeUtility.NameOf<Lookups>('Countries')
	public static AuthenticationProviderLookupCategoryName = TypeUtility.NameOf<Lookups>('AuthenticationProviders')
	public static NotificationStrategiesLookupCategoryName = TypeUtility.NameOf<Lookups>('NotificationStrategies')
	public static NotificationStatusLookupCategoryName = TypeUtility.NameOf<Lookups>('NotificationStatus')
	public static PhoneTypesLookupCategoryName = TypeUtility.NameOf<Lookups>('PhoneTypes')
	public static PhotoTypesLookupCategoryName = TypeUtility.NameOf<Lookups>('PhotoTypes')
	public static ThemesCategoryName = TypeUtility.NameOf<Lookups>('Themes')
	public static BasicTypesLookupCategoryName = TypeUtility.NameOf<Lookups>('BasicTypes')
	public static ImportanceLookupCategoryName = TypeUtility.NameOf<Lookups>('Importance')
	
	constructor(
		@inject(LookupCategoryRepositoryService.BINDING_KEY.key)
		protected LookupCategoryRepositoryService: LookupCategoryRepositoryService,
		@inject(LookupRepositoryService.BINDING_KEY.key)
		protected LookupRepositoryService: LookupRepositoryService
	) {
		super()
	}

	/**
	 * Localize a single lookup based on a Lookup instance
	 * @remarks
	 * Lookup instances are based on the locale and device	 
	 * */
	protected LocaliseLookup(categoryName: string, lookupValue: string, lookups: Lookups): [string, string, string] {
		const category = lookups[categoryName]
		const categoryKeys = Object.keys(category)
		_.remove(categoryKeys, n => n == 'Name' || n == 'Value')
		for (let a = 0; a < categoryKeys.length; ++a) {
			if (category[categoryKeys[a]].Value == lookupValue) {
				const name = category[categoryKeys[a]].Name
				const officialName = category[categoryKeys[a]].OfficialName
				const pluralName = category[categoryKeys[a]].PluralName
				return [name, officialName, pluralName]
			}
		}
		throw new Error(StringUtility.StringFormat(LookupServiceErrors.LocalizationFailure, LookupService.name,this.LocaliseLookup.name,categoryName,lookupValue))
	}

	/**
	 * Localize a lookup category based on a Lookup instance
	 * @remarks
	 * Lookup instances are based on the locale and device	 
	 * */
	protected LocaliseLookupCategory(lookupCategory: LookupCategoryModel, locale: string | undefined, device: string | undefined): LookupCategoryModel {
		const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(locale, device)
		const lookupKeys = Object.keys(lookups)
		_.remove(lookupKeys, n => n == 'Name' || n == 'Value')
		for (let a = 0; a < lookupKeys.length; ++a) {
			if (lookups[lookupKeys[a]].Value == lookupCategory.Value) {
				// eslint-disable-next-line
				const _lookupCategoryResponse: LookupCategoryModel = GeneralUtility.DeepCopyWithoutDescriptors(lookupCategory)
				_lookupCategoryResponse.Name = lookups[lookupKeys[a]].Name
				_lookupCategoryResponse.Lookups?.forEach((lookup: ILookup) => {
					const [name, officialName, pluralName] = this.LocaliseLookup(lookupCategory.Name, lookup.Value, lookups)
					lookup.Name = name
					lookup.OfficialName = officialName
					lookup.PluralName = pluralName
				})
				return _lookupCategoryResponse
			}
		}
		throw new Error(StringUtility.StringFormat(LookupServiceErrors.LocalizationFailure, LookupService.name,this.LocaliseLookup.name,this.LocaliseLookupCategory.name, locale??'en', device?? 'web'))
	}

	/**
	 * Get the LanguageLookupCategory and LanguageLookup based on a locale
	 * locale is either determined from the passed in locale param or from accept-language header	 
	 * */
	public async GetLanguageLookupFromLocale(locale: string): Promise<[ILookupCategory, ILookup]> {
		// eslint-disable-next-line
		const _locale = RestUtils.GetLocale(locale)
		const languageLookupCategory = await this.GetLookupCategoryByValue(LookupService.LanguageLookupCategoryName)
		const languageLookup = await this.GetLookupByValue(languageLookupCategory, _locale!)
		return [languageLookupCategory, languageLookup]
	}

	/**
	* Get a list of countries
	* */
	public async GetCountries(lookupCategoryRequest: ILookupCategoryRequest): Promise<ILookupCountryResponse[] | null> {
		return new Promise<ILookupCountryResponse[] | null>(async (resolve, reject) => {
			try {
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(lookupCategoryRequest.Locale, lookupCategoryRequest.Device)
				const lookupCategory: LookupCategoryModel = await this.GetLookupCategoryByValue(lookups.Countries.Value)
				const lookupCountryResponses: ILookupCountryResponse[] = []
				lookupCategory!.Lookups?.forEach((lookup: ILookup) => {
					// eslint-disable-next-line
					const [name, officialName, _] = this.LocaliseLookup(lookupCategory!.Name, lookup.Value, lookups)					
					lookupCountryResponses.push(
						new LookupCountryResponse({
							Id: lookup.Id,
							LookupCategoryId: lookupCategory!.Id,
							Value: lookup.Value,
							Name: name,
							OfficialName: officialName,
							// eslint-disable-next-line
							ISO3166_1_Alpha_2: lookup.OtherValue1,
							// eslint-disable-next-line
							ISO3166_1_Alpha_3: lookup.OtherValue2,
							InternetDomain1: lookup.OtherValue3,
							InternetDomain2: lookup.OtherValue4,
							InternetDomain3: lookup.OtherValue5
						})
					)
				})
				return resolve(lookupCountryResponses)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Get a list of the supported currencies
	 * */
	public async GetCurrencies(lookupCategoryRequest: ILookupCategoryRequest): Promise<ILookupCurrencyResponse[] | null> {
		return new Promise<ILookupCurrencyResponse[] | null>(async (resolve, reject) => {
			try {
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(lookupCategoryRequest.Locale, lookupCategoryRequest.Device)
				const lookupCategory: LookupCategoryModel = await this.GetLookupCategoryByValue(lookups.Currencies.Value)
				const lookupCurrencyResponses: ILookupCurrencyResponse[] = []
				lookupCategory!.Lookups?.forEach((lookup: ILookup) => {
					// eslint-disable-next-line
					const [name, _, pluralName] = this.LocaliseLookup(lookupCategory!.Name, lookup.Value, lookups)
					lookupCurrencyResponses.push(
						new LookupCurrencyResponse({
							Id: lookup.Id,
							LookupCategoryId: lookupCategory!.Id,
							Value: lookup.Value,
							Name: name,
							PluralName: pluralName,
							Symbol: lookup.OtherValue1,
							NativeSymbol: lookup.OtherValue2,
							DecimalDigits: parseInt(lookup.OtherValue3!)
						})
					)
				})
				return resolve(lookupCurrencyResponses)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Get a list of the supported languages
	 * */
	public async GetLanguages(lookupCategoryRequest: ILookupCategoryRequest): Promise<LookupLanguageResponse[] | null> {
		return new Promise<LookupLanguageResponse[] | null>(async (resolve, reject) => {
			try {
				const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(
					lookupCategoryRequest.Locale,
					lookupCategoryRequest.Device
				)
				const lookupCategoryResponse: LookupCategoryModel | null = await this.GetLookupCategoryByValue(lookups.Languages.Value)
				const lookupLanguagesResponses: LookupLanguageResponse[] = []
				lookupCategoryResponse!.Lookups?.forEach((lookup: ILookup) => {
					// eslint-disable-next-line
					const [name, _, pluralName] = this.LocaliseLookup(lookupCategoryResponse!.Name, lookup.Value, lookups)
					lookupLanguagesResponses.push(
						new LookupLanguageResponse({
							Id: lookup.Id,
							LookupCategoryId: lookupCategoryResponse!.Id,
							Value: lookup.Value,
							Name: name,
							ISO639_1: lookup.OtherValue1,
							ISO639_2: lookup.OtherValue2,
							ISO639_3: lookup.OtherValue3,
							IsRTL: lookup.OtherValue4?.trim().toLowerCase() === 'true' || lookup.OtherValue4?.trim() === '1' ? true : false
						})
					)
				})
				return resolve(lookupLanguagesResponses)
			} catch (e) {
				return reject(e)
			}
		})
	}
	
	/**
	 * Get a lookup category by Id rather than Value
	 * */
	public async GetLookupCategoryById(categoryId: ModelIdType): Promise<LookupCategoryModel> {
		const lookupCategory = await this.LookupCategoryRepositoryService.FindById(categoryId)
		if (!lookupCategory) {
			throw new Error(StringUtility.StringFormat(LookupServiceErrors.NoLookupCategoryFound, `Id`, categoryId.toString()))		
		}
		lookupCategory.Lookups = await this.LookupRepositoryService.Find({ where: { LookupCategoryId: lookupCategory.Id } })
		return lookupCategory
	}

	/**
	 * Get a lookup category by Value rather than Id
	 * */
	public async GetLookupCategoryByValue(categoryValue: string): Promise<LookupCategoryModel> {
		const lookupCategory = await this.LookupCategoryRepositoryService.FindOne({ where: {Value: categoryValue.toLowerCase() }})
		if (!lookupCategory) {
			throw new Error(StringUtility.StringFormat(LookupServiceErrors.NoLookupCategoryFound, `Value`, categoryValue))		
		}
		lookupCategory.Lookups = await this.LookupRepositoryService.Find({ where: { LookupCategoryId: lookupCategory.Id } })
		return lookupCategory
	}
	
	/**
	 * Get all the lookups for a given category
	 * */
	public async GetLookupCategory(lookupCategoryRequest: ILookupCategoryRequest): Promise<LookupCategoryModel | null> {
		return new Promise<LookupCategoryModel | null>(async (resolve, reject) => {
			try {
				let lookupCategoryResponse: LookupCategoryModel | null = null
				if (!lookupCategoryRequest.LookupCategoryId && !lookupCategoryRequest.LookupCategoryValue) {
					return resolve(lookupCategoryResponse)
				}
				if ( lookupCategoryRequest.LookupCategoryId){
					lookupCategoryResponse = await this.GetLookupCategoryById(lookupCategoryRequest.LookupCategoryId!)
				}else{
					lookupCategoryResponse = await this.GetLookupCategoryByValue(lookupCategoryRequest.LookupCategoryValue!)
				}				

				return resolve(this.LocaliseLookupCategory(lookupCategoryResponse!, lookupCategoryRequest.Locale, lookupCategoryRequest.Device))
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Get all the lookup categories
	 * */
	public async GetLookupCategories(lookupCategoryRequest: ILookupCategoryRequest): Promise<LookupCategoryModel[] | null> {
		return new Promise<LookupCategoryModel[] | null>(async (resolve, reject) => {
			try {
				const allLookupCategories: LookupCategoryModel[] | null = await this.LookupCategoryRepositoryService.Find({ include: ['Lookups'] })			
				const lookupCategoryResponses: LookupCategoryModel[] = []
				for (let p = 0; p < allLookupCategories.length; p++) {
					const localisedLookupCategory = this.LocaliseLookupCategory(allLookupCategories[p], lookupCategoryRequest.Locale, lookupCategoryRequest.Device)
					lookupCategoryResponses.push(localisedLookupCategory)
				}
				return resolve(lookupCategoryResponses)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Get a lookup by id
	 * */
	public async GetLookupById(lookupRequest: LookupRequest): Promise<LookupModel> {
		const lookup = await this.LookupRepositoryService.FindById(lookupRequest.LookupId)
		if (!lookup) {
			throw new Error(StringUtility.StringFormat(LookupServiceErrors.NoLookup, 'Id', lookupRequest.LookupId.toString(), ''))
		}
		const lookups: Lookups = LocalisationUtils.GetLocalisedLookups(lookupRequest.Locale, lookupRequest.Device)
		const lookupCategory = await this.LookupCategoryRepositoryService.FindById(lookup.LookupCategoryId)
		const [name, officialName, pluralName] = this.LocaliseLookup(lookupCategory.Name, lookup.Value, lookups)
		lookup.Name = name
		lookup.OfficialName = officialName
		lookup.PluralName = pluralName
		return lookup
	}

	/**
	 * Get a lookup by value rather than id
	 * */
	public async GetLookupByValue(lookupCategory: ILookupCategory, lookupValue: string): Promise<ILookup> {
		const lookup = await this.LookupRepositoryService.FindOne({ where: { Value: lookupValue.toLowerCase() , LookupCategoryId: lookupCategory.Id } })
		if (!lookup) {
			throw new Error(StringUtility.StringFormat(LookupServiceErrors.NoLookup, 'Value', lookupValue, `for the lookup category ${lookupCategory.Name}`))			
		}
		return lookup
	}

	/**
	 * Get all the lookups
	 * */
	public async GetLookups(lookupRequest: ILookupRequest): Promise<LookupModel[]> {
		return new Promise<LookupModel[]>(async (resolve, reject) => {
			try {
				const LookupCategories = await this.GetLookupCategories({
					Locale: lookupRequest.Locale,
					Device: lookupRequest.Device
				})
				const ret: LookupModel[] = []
				LookupCategories?.forEach( lc => lc.Lookups?.forEach( l => ret.push(l)))
				return resolve(ret)
			} catch (e) {
				return reject(e)
			}
		})
	}

	/**
	 * Utility for getting the Notification Importance Lookup and Lookup Category	 
	 */
	public async GetImportanceLookup(importanceValue: 'high' | 'medium' | 'low' = 'low'): Promise<[ILookupCategory, ILookup ]> {                
        const importanceCategory = await this.GetLookupCategoryByValue(lookups.Importance.Value)
		if (!importanceCategory) {
			throw `666[$]Was unable to find a '${lookups.Importance.Name}' Lookup Category`
		}
		let imporance 
		switch (importanceValue)
		{
			case 'low': 
			imporance = await this.GetLookupByValue(importanceCategory, lookups.Importance.Low.Value)			
			break
			case 'medium':
			imporance = await this.GetLookupByValue(importanceCategory, lookups.Importance.Medium.Value) 
			break
			case 'high': 
			imporance = await this.GetLookupByValue(importanceCategory, lookups.Importance.High.Value) 
			break
		}
		return [importanceCategory, imporance]
    }

	/**
	 * Utility for getting the Notification Importance Lookup and Lookup Category	 
	 */
	public async GetStatusLookup(importanceValue: 'pending' | 'failed' | 'acknowledged'| 'succeeded' | 'invalid' = 'pending'): Promise<[ILookupCategory, ILookup ]> {                
        const statusCategory = await this.GetLookupCategoryByValue(lookups.NotificationStatus.Value)
		if (!statusCategory) {
			throw `666[$]Was unable to find a '${lookups.NotificationStatus.Name}' Lookup Category`
		}
		let status
		switch (importanceValue)
		{
			case 'pending': 
			status = await this.GetLookupByValue(statusCategory, lookups.NotificationStatus.Pending.Value)			
			break
			case 'failed':
			status = await this.GetLookupByValue(statusCategory, lookups.NotificationStatus.Failed.Value) 
			break
			case 'acknowledged': 
			status = await this.GetLookupByValue(statusCategory, lookups.NotificationStatus.Acknowledged.Value) 
			break
			case 'succeeded': 
			status = await this.GetLookupByValue(statusCategory, lookups.NotificationStatus.Succeeded.Value) 
			break
			case 'invalid': 
			status = await this.GetLookupByValue(statusCategory, lookups.NotificationStatus.Invalid.Value) 
			break
		}
		return [statusCategory, status]
    }


    /**
	 * Utility for getting the Notification Basic Types Lookup and Lookup Category	 
	 */
	public async GetBasicTypesLookup(basicTypesValue: 'primary' | 'secondary' | 'tertiary' = 'primary'): Promise<[ILookupCategory, ILookup ]> {                
        const basicTypes = await this.GetLookupCategoryByValue(lookups.BasicTypes.Value)
		if (!basicTypes) {
			throw `666[$]Was unable to find a '${lookups.BasicTypes.Name}' Lookup Category`
		}
		let basicType 
		switch (basicTypesValue)
		{
			case 'primary': 
			basicType = await this.GetLookupByValue(basicTypes, lookups.BasicTypes.Primary.Value)			
			break
			case 'secondary':
			basicType = await this.GetLookupByValue(basicTypes, lookups.BasicTypes.Secondary.Value)			
			break
			case 'tertiary': 
			basicType = await this.GetLookupByValue(basicTypes, lookups.BasicTypes.Tertiary.Value)			
			break
		}
		return [basicTypes, basicType]
    }
	
	/**
	 * Utility for getting the Notification Phone Types Lookup and Lookup Category	 
	 */
	public async GetPhoneTypeLookup(phoneTypesValue: 'mobile' | 'landline' = 'mobile'): Promise<[ILookupCategory, ILookup ]> {                
        const phoneTypes = await this.GetLookupCategoryByValue(lookups.PhoneTypes.Value)
		if (!phoneTypes) {
			throw `666[$]Was unable to find a '${lookups.PhoneTypes.Name}' Lookup Category`
		}
		let phoneType 
		switch (phoneTypesValue)
		{
			case 'mobile': 
			phoneType = await this.GetLookupByValue(phoneTypes, lookups.PhoneTypes.Mobile.Value)			
			break
			case 'landline':
			phoneType = await this.GetLookupByValue(phoneTypes, lookups.PhoneTypes.Landline.Value)			
			break			
		}
		return [phoneTypes, phoneType]
    }
}
