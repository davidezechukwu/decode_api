import { Model } from '@loopback/repository'
import { ISuperRequest } from '@david.ezechukwu/core'

/**
 * The super (base) class for a ll request. This class contains the properties which are common to all requests
 */
export abstract class SuperRequest extends Model implements ISuperRequest {
}
