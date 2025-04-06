import {Request, RequestBody, BodyParser} from '@loopback/rest'
import {is} from 'type-is'
//import {SchemaUtils} from '../utils'
//import {Multer} from 'multer'

/**
 * A Multipart Parser
 */
export class MultiPartParser implements BodyParser {
    // eslint-disable-next-line
    name = 'multipart/form-data'

    constructor(options = {}) {}

    // eslint-disable-next-line
    supports(mediaType: string) {
        return !!is(mediaType, ['multipart'])
    }

    // eslint-disable-next-line
    async parse(request: Request): Promise<RequestBody> {
        let obj = undefined
        const contentLength = request.get('content-length')
        if (contentLength != null && +contentLength !== 0) {
            obj = await this.ParseBody(request)
        }

        const requestBody: RequestBody = {
            value: obj /**Parsed value of the request body*/,
            coercionRequired: false /*Is coercion required? Some forms of request such as urlencoded don't have rich types such as number or boolean*/,
            mediaType: 'application/json' /**Resolved media type*/,
            schema: {type: 'object'} /** Corresponding schema for the request body*/
        }
        return requestBody
    }

    /**
     * @remarks Using formadiblle     
     */
    async ParseBody(request: Request): Promise<any> {
        const uploadedFiles = request.files
        const mapper = (f: any) => ({
            FieldName: f.fieldname,
            OriginalFileName: f.originalname,
            Encoding: f.encoding,
            MimeType: f.mimetype,
            Size: f.size,
            DestinationFileName: f.filename,
            DestinationFolder: f.destination,
            DestinationPath: f.path
        })
        let files: object[] = []
        if (Array.isArray(uploadedFiles)) {
            files = uploadedFiles.map(mapper)
        } else {
            for (const filename in uploadedFiles) {
                files.push(...uploadedFiles[filename].map(mapper))
            }
        }
        //log if needed
        return {files, fields: request.body}
    }
}
