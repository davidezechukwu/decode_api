import {model} from '@loopback/repository'
import {ILookupRequest, ModelIdType, ModelIdTypeName} from '@david.ezechukwu/core'
import {SuperRequestWithLocaleAndDevice} from './SuperRequestWithLocaleAndDevice'
import { PropertyDecorator } from '../../decorators'

@model({jsonSchema: {description: `${LookupRequest.name}`}})
export class LookupRequest extends SuperRequestWithLocaleAndDevice implements ILookupRequest {
    @PropertyDecorator({
        type: ModelIdTypeName,
        jsonSchema: {
            description: `Lookup Id`
        }
    })
    LookupId: ModelIdType

    constructor(partialObject: Partial<LookupRequest> = {}) {
        super(partialObject)
        Object.assign(this, partialObject)
    }
}
