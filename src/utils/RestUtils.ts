import {param, ParameterObject} from '@loopback/rest'
import {IsModelIdTypeNumeric} from '@david.ezechukwu/core'
import {GetConfigurationFromEnv, Locale} from '../Configuration'
const apiConfig = GetConfigurationFromEnv()
const parser = require('accept-language-parser')

/**
 * HTTP REST utilities
 * */
export class RestUtils {
    /**
     * get Id from a path, i.e get Id from [ID] in path/[id], used as Id is designed to be either number or a string
     * */
    public static IdFromPath(name: string, spec?: Partial<ParameterObject> | undefined) {
        if (IsModelIdTypeNumeric) {
            return param.path.number(name, spec)
        } else {
            return param.path.string(name, spec)
        }
    }

	/**
     * get Id from a query string, i.e get Id from [ID] in path/[id], used as Id is designed to be either number or a string
     * */
    public static IdFromQuery(name: string, spec?: Partial<ParameterObject> | undefined) {
        if (IsModelIdTypeNumeric) {
            return param.query.number(name, spec)
        } else {
            return param.query.string(name, spec)
        }
    }

    /**
     * Convert a string to the literal type, locale
     * */
    public static GetLocale(locale: string): Locale {
        const locales = parser.parse(locale)
        if (locales.length == 0) {
            return apiConfig.defaultLocale
        }
        return locales[0].code
    }
}
