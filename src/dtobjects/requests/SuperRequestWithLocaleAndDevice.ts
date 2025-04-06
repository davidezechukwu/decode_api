import { Model } from '@loopback/repository'
import { ISuperRequestWithLocaleAndDevice } from '@david.ezechukwu/core'
import { PropertyDecorator } from '../../decorators'

/**
 * The super (base) class for a ll request. This class contains the properties which are common to all requests
 */
export abstract class SuperRequestWithLocaleAndDevice extends Model implements ISuperRequestWithLocaleAndDevice {
	/**
	 * The two-character locale of the language the response should be in.
	 * Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.
	 */
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `The two-character locale of the language the response should be in. Currently only 'en', 'fr', 'pa'  and 'ur' are supported. 'ur' is a RTL language.`
		}
	})
	Locale?: string

	/**
	 * The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'
	 * Currently only 'web' is supported.
	 */
	@PropertyDecorator({
		type: 'string',
		jsonSchema: {
			description: `The device the response is meant for. The applicable devices are 'web(normal screen)', 'tablet', 'mobile', and 'micro'. Currently only 'web' is supported.`
		}
	})
	Device?: string
}
