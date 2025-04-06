import {inject} from '@loopback/core'
import {Request, RequestBody, BodyParser, builtinParsers} from '@loopback/rest'
import {is} from 'type-is'

import {toXML} from 'jstoxml'

/**
 * XML Parser
 */
export class XMLParser implements BodyParser {
    // eslint-disable-next-line
    name = builtinParsers.json

    constructor(
        @inject('request.bodyParsers.xml.options', {optional: true})
        options = {}
    ) {
        //this.XMLParser = json(options)
    }

    // eslint-disable-next-line
    supports(mediaType: string) {
        return !!is(mediaType, '*/xml', '*/*+xml')
    }

    // eslint-disable-next-line
    async parse(request: Request): Promise<RequestBody> {
        let obj = await this.ParseToXML(request)
        const contentLength = request.get('content-length')
        if (contentLength != null && +contentLength === 0) {
            obj = undefined
        }
        return {value: obj}
    }

    /**
     * @remarks Override this method in a derived class using the Template Method Pattern     
     */
    async ParseToXML(request: Request): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let body = ''
            request.on('data', function (chunk) {
                body += chunk
            })
            request.on('end', function () {
                const result = toXML(JSON.parse(body))
                resolve(result)
            })
            request.on('error', function (error) {
                reject(error)
            })
        })
    }
}
