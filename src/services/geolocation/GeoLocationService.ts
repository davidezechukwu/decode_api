import { BindingKey, BindingScope, inject, injectable } from '@loopback/core'
import { SuperService } from '../SuperService'
import axios from 'axios'
import { IUserLogin } from '@david.ezechukwu/core'
import { UserLoginModel } from '../../models'
import { Configuration } from '../../Configuration'
import { SuperBindings } from '../../SuperBindings'
import { LookupService } from '../lookup/LookupService'
import { LookupCategoryRequest } from '../../dtobjects'

/**
 * The Geolocation service uses various IPLocators to estimate a user's location,
 * using an IP address; and can determine the user's location if the user's device's GeoLocation 
 * functionality is enabled and permission is given to do so on the client. This is
 * done using the Geolocation HTTP Header,if present; natively or with Javascript
 * @remarks
 * TODO://Create Adapter wrapper which returns a unified object with names in PascalCase
 * TODO://Add more IPLocators
 * */
@injectable({ tags: { key: GeoLocationService.BINDING_KEY.key }, scope: BindingScope.TRANSIENT })
export class GeoLocationService extends SuperService {
	static BINDING_KEY = BindingKey.create<GeoLocationService>(`services.${GeoLocationService.name}`)

	public constructor(
		@inject(SuperBindings.LookupServiceBindingKey.key)
		protected LookupService: LookupService
	) {
		super()
	}

	//protected async GetLocationFromLatLong(latitude: number, longitude: number): Promise<string> {
	//	const username = `demo`
	//	const resp = await axios.get(`http://api.geonames.org/countryCode?lat=${latitude}&lng=${longitude}&username=${username}`)
	//	console.log(resp)
	//	return ''
	//}

	//protected async GetLocationFromIP1(ip: string) {
	//	const resp = await axios.get(`http://api.hostip.info/get_json.php?ip=${ip}`)
	//	console.log(resp)
	//	return ''
	//}

	//protected async GetLocationFromIP2(ip: string) {
	//	const resp = await axios.get(`http://www.geoplugin.net/php.gp?ip=${ip}`)
	//	console.log(resp)
	//	return ''
	//}

	protected async TryGetLocationUsingGeoCords(latitude: number, longitude: number):
		Promise<[{
			ip?: string /*"1.1.1.1"*/,
			country_code?: string/*"AU"*/,
			country_name?: string /*"Australia"*/,
			region_code?: string /*"AU-NSW"*/,
			region_name?: string /*"New South Wales"*/,
			city?: string /*"Sydney"*/,
			postal_code?: string /*"2000"*/,
			time_zone?: string /*"Australia/Sydney"*/
		} | null, string]> {
		const apikey = this.Configuration.geolocation.FreeIPLookupAPI.key
		try {
			//const resp = await axios.get(`https://api.freeiplookupapi.com/v1/info?apikey=${apikey}&ip=${ip}`)
			return [null, `418[$}Not implemented`]
		} catch (err) {
			return [{}, err];
		}
	}


	protected async TryGetLocationUsingAbstractAPI(ip: string):
		Promise<[{
			ip_address?: string, /*"166.171.248.255"*/
			city?: string, /*"San Jose"*/
			city_geoname_id?: number, /*5392171*/
			region?: string, /*"California"*/
			region_iso_code?: string, /*"CA"*/
			region_geoname_id?: number, /*5332921*/
			postal_code?: string, /*"95141"*/
			country?: string, /*"United States"*/
			country_code?: string, /*"US"*/
			country_geoname_id?: number, /*6252001*/
			country_is_eu?: boolean, /*false*/
			continent?: string, /*"North America"*/
			continent_code?: string, /*"NA"*/
			continent_geoname_id?: number, /*6255149*/
			longitude?: number, /*-121.7714*/
			latitude?: number, /*37.1835*/
			security?: {
				is_vpn?: boolean /*false*/
			},
			timezone?: {
				name?: string, /*"America/Los_Angeles"*/
				abbreviation?: string, /*"PDT"*/
				gmt_offset?: number, /* -7*/
				current_time?: Date, /*"06:37:41"*/
				is_dst?: boolean /*true*/
			},
			flag?: {
				emoji?: string, /*"????"*/
				unicode?: string, /*"U+1F1FA U+1F1F8"*/
				png?: string, /*"https://static.abstractapi.com/country-flags/US_flag.png"*/
				svg?: string /*"https://static.abstractapi.com/country-flags/US_flag.svg"*/
			},
			currency?: {
				currency_name?: string, /*"USD"*/
				currency_code?: string /*"USD"*/
			},
			connection?: {
				autonomous_system_number?: number, /*20057*/
				autonomous_system_organization?: string, /*"ATT-MOBILITY-LLC-AS20057"*/
				connection_type?: string, /*"Cellular"*/
				isp_name?: string, /*"AT&T Mobility LLC"*/
				organization_name?: string /*"Service Provider Corporation"*/
			}
		} | null, string]> {
		const apikey = this.Configuration.geolocation.AbstractAPI.key
		try {
			const resp = await axios.get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${apikey}&ip_address=${ip}`)
			return [resp.data, ''];
		} catch (err) {
			return [{}, err];
		}
	}

	protected async TryGetLocationUsingIPStack(ip: string): Promise<[{
		ip?: string /*"134.201.250.155"*/,
		hostname?: string /*"134.201.250.155"*/,
		type?: string /*"ipv4"*/,
		continent_code?: string /*"NA"*/,
		continent_name?: string /*"North America"*/,
		country_code?: string /*"US"*/,
		country_name?: string /*"United States"*/,
		region_code?: string /*"CA"*/,
		region_name?: string /*"California"*/,
		city?: string /*"Los Angeles"*/,
		zip?: string /*"90013"*/,
		latitude?: number /* 34.0453*/,
		longitude?: number /*-118.2413*/,
		location?: {
			geoname_id?: number /*5368361*/,
			capital?: string /*"Washington D.C."*/,
			languages?: [
				{
					code?: string /*"en"*/,
					name?: string /*"English"*/,
					native?: string /*"English"*/
				}
			],
			country_flag?: string /*"https?://assets.ipstack.com/images/assets/flags_svg/us.svg"*/,
			country_flag_emoji?: string /*"????"*/,
			country_flag_emoji_unicode?: string /*"U+1F1FA U+1F1F8"*/,
			calling_code?: string /*"1"*/,
			is_eu?: boolean
		},
		time_zone?: {
			id?: string /*"America/Los_Angeles"*/,
			current_time?: string /*"2018-03-29T07?:35?:08-07?:00"*/,
			gmt_offset?: number/*-25200*/,
			code?: string /*"PDT"*/,
			is_daylight_saving?: boolean
		},
		currency?: {
			code?: string /*"USD"*/,
			name?: string /*"US Dollar"*/,
			plural?: string /*"US dollars"*/,
			symbol?: string /*"$"*/,
			symbol_native?: string /*"$"*/
		},
		connection?: {
			asn?: number /*25876*/,
			isp?: string /*"Los Angeles Department of Water & Power"*/
		},
		security?: {
			is_proxy?: boolean,
			proxy_type?: object | undefined,
			is_crawler?: boolean,
			crawler_name?: object | undefined,
			crawler_type?: object | undefined,
			is_tor?: boolean,
			threat_level?: string /*"low"*/,
			threat_types?: object | undefined,
		}
	} | null, string]> {
		try {
			const accessKey = this.Configuration.geolocation.IPStack.key
			const resp = await axios.get(`http://api.ipstack.com/${ip}?access_key=${accessKey}`)
			return [resp.data, '']
		} catch (err) {
			return [null, err];
		}
	}

	protected async TryGetLocationUsingFreeIPLookupAPI(ip: string):
		Promise<[{
			ip?: string /*"1.1.1.1"*/,
			country_code?: string/*"AU"*/,
			country_name?: string /*"Australia"*/,
			region_code?: string /*"AU-NSW"*/,
			region_name?: string /*"New South Wales"*/,
			city?: string /*"Sydney"*/,
			postal_code?: string /*"2000"*/,
			time_zone?: string /*"Australia/Sydney"*/,
			latitude?: number /*-33.86*/,
			longitude?: number /*151.2*/
		} | null, string]> {
		const apikey = this.Configuration.geolocation.FreeIPLookupAPI.key
		try {
			const resp = await axios.get(`https://api.freeiplookupapi.com/v1/info?apikey=${apikey}&ip=${ip}`)
			return [resp.data, '']
		} catch (err) {
			return [null, err];
		}
	}

	/**
	 * Get location from IP using 3 services
	 */
	public async GetLocationFromIP(ip: string): Promise<Partial<IUserLogin>> {
		let resp = new UserLoginModel()
		const [data1, dataError1] = await this.TryGetLocationUsingAbstractAPI(ip)		
		if (!dataError1 && data1) {
			resp.IPAddress = ip
			resp.City = data1.city
			resp.Longitude = data1.longitude
			resp.Latitude = data1.latitude
			resp.Region = data1.region
			resp.Postcode = data1.postal_code
			const countries = await this.LookupService.GetCountries(new LookupCategoryRequest({
				Locale: Configuration.localisation.defaultLocale,
				Device: Configuration.localisation.defaultDevice
			}))
			if (countries && countries.length && data1 && data1.country_code) {
				const country = countries.find(c => c.Value.toLowerCase() === data1!.country_code!.toLowerCase()!)
				resp.LocationId = country ? country.Id : undefined
			}
		} else {
			const [data2, dataError2] = await this.TryGetLocationUsingFreeIPLookupAPI(ip)
			let resp = new UserLoginModel()
			if (!dataError2 && data2) {
				resp.IPAddress = ip
				resp.City = data2.city
				resp.Longitude = data2.longitude
				resp.Latitude = data2.latitude
				resp.Region = data2.region_name
				resp.Postcode = data2.postal_code
				const countries = await this.LookupService.GetCountries(new LookupCategoryRequest({
					Locale: Configuration.localisation.defaultLocale,
					Device: Configuration.localisation.defaultDevice
				}))
				if (countries && countries.length && data2 && data2.country_code) {
					const country = countries.find(c => c.Value.toLowerCase() === data2!.country_code!.toLowerCase()!)
					resp.LocationId = country ? country.Id : undefined
				}
			} else {
				const [data3, dataError3] = await this.TryGetLocationUsingIPStack(ip)
				if (!dataError3 && data3) {
					resp.IPAddress = ip
					resp.City = data3.city
					resp.Longitude = data3.longitude
					resp.Latitude = data3.latitude
					resp.Region = data3.region_name
					resp.Postcode = (data3 as any).zip
					const countries = await this.LookupService.GetCountries(new LookupCategoryRequest({
						Locale: Configuration.localisation.defaultLocale,
						Device: Configuration.localisation.defaultDevice
					}))
					if (countries && countries.length && data3 && data3.country_code) {
						const country = countries.find(c => c.Value.toLowerCase() === data3!.country_code!.toLowerCase()!)
						resp.LocationId = country ? country.Id : undefined
					}
				}
			}
		}
		return resp
	}
}
