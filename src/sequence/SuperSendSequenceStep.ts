import {Send, RestBindings, Request, Response, OperationRetval} from '@loopback/rest'
import {Provider, inject, BindingKey, injectable, BindingScope} from '@loopback/core'
import {Readable} from 'stream'
const xslt = require('xslt-processor')
const convert = require('xml-js')
const escape = require('xml-escape')
const unescape = require('unescape')

@injectable({tags: {key: SuperSendSequenceStep.BINDING_KEY.key}, scope: BindingScope.TRANSIENT})
export class SuperSendSequenceStep {
    public static BINDING_KEY = BindingKey.create<SuperSendSequenceStep>('sequence.SuperSendSequenceStep')
    constructor(@inject(RestBindings.Http.REQUEST) protected Request: Request) {}

    /**
     * Use the mimeType given in the request's Accept header to convert
     * the response object!     
     * handling function.
     */
    public async Send(response: Response, result: OperationRetval) {
        // Bypass response writing if the controller method returns `response` itself
        // or the response headers have been sent
        if (result === response || response.headersSent) {
            return
        }

        const headers = (this.Request.headers as Record<string, string>) || {}
        let responseContentTypeHeader = ''

        const isStream = result instanceof Readable || typeof result?.pipe === 'function'

        if (isStream) {
            responseContentTypeHeader = 'application/octet-stream'
        } else {
            switch (typeof result) {
                case 'object':
                case 'boolean':
                case 'number':
                    if (Buffer.isBuffer(result)) {
                        // Buffer for binary data
                        responseContentTypeHeader = 'application/octet-stream'
                    } else {
                        responseContentTypeHeader = 'application/json'
                    }
                    break
                default:
                    responseContentTypeHeader = 'application/json'
                    break
            }

            if (response.statusCode == 200 || response.statusCode == 201 || response.statusCode == 203 || response.statusCode == 205 || response.statusCode == 206) {
                if (result) {
                    const XSLTStylesheet = result?.XSLTStylesheet
                    delete result?.XSLTStylesheet
                    try {
                        if (this.Request.path.toLowerCase().endsWith('/explorer/openapi.json')) {
                            result = JSON.stringify(result)                            
							const rootElem = 'Response'
                            if (headers.accept.toLowerCase().includes('application/xhtml') || headers.accept.toLowerCase().includes('text/html')) {         
								const resultAsXML = `<${rootElem}> ${this.ConvertJSONToXML(result)}</${rootElem}>`
                                if (XSLTStylesheet) {
                                    const resultAsHTML = unescape(xslt.xsltProcess(xslt.xmlParse(resultAsXML), xslt.xmlParse(XSLTStylesheet)))                                    
									result = unescape(resultAsHTML)
                                    responseContentTypeHeader = 'text/html; charset=utf-8'
                                } else {
                                    result = `<html><body><pre>${resultAsXML}<pre><body></html>`
                                    responseContentTypeHeader = 'text/html'
                                }
                            } else if (headers.accept.toLowerCase().includes('application/xml') || headers.accept.toLowerCase().includes('text/xml')) {
                                result = `<${rootElem}> ${this.ConvertJSONToXML(result)}</${rootElem}>`
                                responseContentTypeHeader = 'application/xml'
                            } else if (headers.accept.toLowerCase().includes('text/plain')) {
                                result = JSON.stringify(result)
                                responseContentTypeHeader = 'text/plain'
                            } else {
                                //application/json, this is already in JSON                                
								responseContentTypeHeader = 'application/json'
                            }
                        } else {
                            const rootElem = 'Response'
                            if (headers.accept.toLowerCase().includes('application/xhtml') || headers.accept.toLowerCase().includes('text/html')) {         
								const resultAsXML = `<${rootElem}> ${this.ConvertJSONToXML(result)}</${rootElem}>`
                                if (XSLTStylesheet) {
                                    const resultAsHTML = unescape(xslt.xsltProcess(xslt.xmlParse(resultAsXML), xslt.xmlParse(XSLTStylesheet)))                                    
									result = unescape(resultAsHTML)
                                    responseContentTypeHeader = 'text/html; charset=utf-8'
                                } else {
                                    result = `<html><body><pre>${resultAsXML}<pre><body></html>`
                                    responseContentTypeHeader = 'text/html'
                                }
                            } else if (headers.accept.toLowerCase().includes('application/xml') || headers.accept.toLowerCase().includes('text/xml')) {
                                result = `<${rootElem}> ${this.ConvertJSONToXML(result)}</${rootElem}>`
                                responseContentTypeHeader = 'application/xml'
                            } else if (headers.accept.toLowerCase().includes('text/plain')) {
                                result = JSON.stringify(result)
                                responseContentTypeHeader = 'text/plain'
                            } else {
                                //application/json
                                result = JSON.stringify(result)
								responseContentTypeHeader = 'application/json'
                            }
                        }
                    } catch (err) {
                        throw err
                    }
                }
            }
        }
		if ( !result){
			response.status(204).send()
		}else{
			this.WriteResultToResponseEx(response, result, responseContentTypeHeader)
		}
    }

    /**
     * Writes the result from Application controller method
     * into the HTTP response     
     */
    protected WriteResultToResponseEx(response: Response, result: OperationRetval, contentType: string): void {
        if (result === undefined) {
            response.statusCode = 204
            response.end()
            return
        }

        if (contentType) {
            response.setHeader('Content-Type', contentType)
        }

        if (contentType && contentType.toLowerCase() == 'application/octet-stream') {
            result.pipe(response)
            return
        }

        response.end(result)
    }

    protected ConvertJSONToXML(result: string): string {
		try{
			const result1 = JSON.stringify(result)
			const result2 = escape(result1, '"')
			const result3 = JSON.parse(result1)
			const result4 = convert.json2xml(result3, {compact: true, ignoreComment: true, spaces: 4})
			return result4
		}
		catch{
			//for non json results
			return result
		}        
    }
}

@injectable({tags: {key: SuperSendSequenceStepProvider.BINDING_KEY.key}})
export class SuperSendSequenceStepProvider implements Provider<Send> {
    public static BINDING_KEY = BindingKey.create<SuperSendSequenceStepProvider>('providers.SuperSendSequenceStep')
    constructor(
        @inject(RestBindings.Http.REQUEST) protected Request: Request,
        @inject('sequence.SuperSendSequenceStep') protected SuperSendSequenceStep: SuperSendSequenceStep
    ) {}

    // eslint-disable-next-line
    value() {
        return (response: Response, result: OperationRetval) => {
            this.SuperSendSequenceStep.Send(response, result)
        }
    }
}
