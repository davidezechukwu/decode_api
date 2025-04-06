import path from 'path'
import * as _ from 'lodash'
import {Configuration} from '../Configuration'
import {Lookups} from '../_infrastructure/fixtures/localisation/Lookups'

const cachedLookups: {[index: string]: Lookups} = {}

/**
 * Localisation utilities
 * */
export class LocalisationUtils {
    /**
     * Get a localized lookup (copy) based on a locale and device. The copy (wording) conciseness/verbosity depends on the device
     * */
    public static GetLocalisedLookups(locale: string = Configuration.localisation.defaultLocale, device: string = Configuration.localisation.defaultDevice): Lookups {
		try{
			locale = locale.toLowerCase()
			device = device.toLowerCase()
			const cacheKey = `${locale}_${device}`
			if (!cachedLookups[cacheKey]) {
				const resourceFile = path.join(Configuration.fixtures.localisationPath, `Lookups_${cacheKey}`)
				cachedLookups[cacheKey] = require(resourceFile).lookups
			}
			return cachedLookups[cacheKey]
		}
		catch (e){
			if ( process.env.NODE_ENV === 'development'){
				const soughtFile = path.join(Configuration.fixtures.localisationPath, `Lookups_${locale}_${device}.json`)
				throw(`418[$]Localization failed for the Locale(${locale}) and Device(${device}), ensure that the localisation file(${soughtFile}) exists`)
			}else{
				if ( device && device.toLowerCase() == 'tablet'){
					throw(`418[$]The requested Locale is not currently available. Set the Device to 'mobile' and then 'micro', for more info`)
				}else if ( device && device.toLowerCase() == 'mobile'){
					throw(`418[$]The requested Locale is not currently available.`)
				}else if ( device && device.toLowerCase() == 'micro'){
					throw(`418[$]Teapot requested!!!`)
				}else{
					throw(`418[$]Localization failed for the Locale(${locale}) and Device(${device}). Set the Device to 'tablet', 'mobile' and then 'micro', for more info`)
				}
			}
		}
    }
}
