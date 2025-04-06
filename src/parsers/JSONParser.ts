import {inject} from '@loopback/core'
import {Request, RequestBody, BodyParser, builtinParsers, RestBindings, RequestBodyParserOptions, getParserOptions, sanitizeJsonParse, invokeBodyParserMiddleware, BodyParserMiddleware} from '@loopback/rest'
import {json} from 'body-parser'
import {is} from 'type-is'

/**
 * A JSON Parser
 */
export class JSONParser implements BodyParser {
    // eslint-disable-next-line
    name = builtinParsers.json

    // eslint-disable-next-line
    private jsonParser: BodyParserMiddleware

    constructor(
        @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
        options: RequestBodyParserOptions = {
            limit: '2048576MB',
            json: {
                strict: false
            }
        }
    ) {
        if (options.validation) {
            options.validation.coerceTypes = true
            options.validation.validateSchema = false
        } else {
            options.validation = {coerceTypes: true, validateSchema: false}
        }

        const jsonOptions = getParserOptions('json', options)

        const prohibitedKeys = ['__proto__', 'constructor.prototype', ...(options.validation?.prohibitedKeys ?? [])]

        jsonOptions.reviver = sanitizeJsonParse(jsonOptions.reviver, prohibitedKeys)
        this.jsonParser = json(jsonOptions)
    }
    // eslint-disable-next-line
    supports(mediaType: string) {
        return !!is(mediaType, '*/json', '*/*+json')
    }

    // eslint-disable-next-line
    async parse(request: Request): Promise<RequestBody> {
        let obj = await this.ParseToJSON(request)
        const contentLength = request.get('content-length')
        if (contentLength != null && +contentLength === 0) {
            obj = undefined
        }
        return {value: obj}
    }

    /**
     * @remarks Override this method in a derived class using the Template Method Pattern     
     */
    async ParseToJSON(request: Request): Promise<any> {
        //let body = await invokeBodyParserMiddleware(this.jsonParser, request)
        //return { value: body }
        return new Promise<any>((resolve, reject) => {
            let body = ''
            request.on('data', function (chunk: any) {
                body += chunk
            })
            request.on('end', function () {
                resolve(JSON.parse(body))
            })
            request.on('error', function (error: any) {
                reject(error)
            })
        })
    }
}
