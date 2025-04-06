import { injectable, inject } from '@loopback/core';
import { Request, RequestBody } from '@loopback/rest';
import { BodyParser, RestBindings, RequestBodyParserOptions, builtinParsers, getParserOptions, BodyParserMiddleware } from '@loopback/rest';
import bodyParser from 'body-parser';
import { is } from 'type-is'

/**
 * A URL Encoded Parser for application/x-www-form-urlencoded
 */
@injectable()
export class URLEncodedParser implements BodyParser {
	// eslint-disable-next-line
	name = builtinParsers.urlencoded;

	// eslint-disable-next-line
	private urlencodedParser: ReturnType<typeof bodyParser.urlencoded>;

	constructor(
		@inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, { optional: true })
		options: RequestBodyParserOptions = {
			limit: '2048MB',
			urlencoded: {
				extended: true,
			},
		},
	) {
		const urlencodedOptions = getParserOptions('urlencoded', options);
		this.urlencodedParser = bodyParser.urlencoded(urlencodedOptions);
	}

	// eslint-disable-next-line
	supports(mediaType: string) {
		return !!is(mediaType, 'application/x-www-form-urlencoded');
	}

	// eslint-disable-next-line
	async parse(request: Request): Promise<RequestBody> {
		return new Promise<any>((resolve, reject) => {
			this.urlencodedParser(request, null as any, (err: any) => {
				if (err) {
					return reject(err);
				}
				resolve({ value: request.body });
			});
		});
	}
}
