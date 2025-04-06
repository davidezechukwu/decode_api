/**
 * See https://pm2.keymetrics.io/docs/usage/application-declaration/
 */
module.exports = {
	apps: [
		{
			name: 'decode-api',
			script: './dist/index.js',
			force: true,
			autorestart: true,
			watch: false,
			env: {
				NODE_ENV: "production"
			},

			// eslint-disable-next-line @typescript-eslint/naming-convention
			env_development: {
				NODE_ENV: "development",
				SSL_PRIVATE_KEY: "src/_infrastructure/fixtures/certificates/decodeonline.app.key",
				SSL_CERTIFICATE: "src/_infrastructure/fixtures/certificates/decodeonline.app.chained.crt",
				SSL_CA_CERTIFICATE: "src/_infrastructure/fixtures/certificates/decodeonline.app.chained.crt"				
			},

			// eslint-disable-next-line @typescript-eslint/naming-convention
			env_test: {
				NODE_ENV: "test",
				PORT: 8888,
				SSL_PRIVATE_KEY: "/opt/decode/api/certificates/decodeonline.app.key",
				SSL_CERTIFICATE: "/opt/decode/api/certificates/decodeonline.app.chained.crt",
				SSL_CA_CERTIFICATE: "/opt/decode/api/certificates/decodeonline.app.chained.crt"				
			},

			// eslint-disable-next-line @typescript-eslint/naming-convention
			env_test: {
				NODE_ENV: "staging",
				PORT: 8888,
				SSL_PRIVATE_KEY: "/opt/decode/api/certificates/decodeonline.app.key",
				SSL_CERTIFICATE: "/opt/decode/api/certificates/decodeonline.app.chained.crt",
				SSL_CA_CERTIFICATE: "/opt/decode/api/certificates/decodeonline.app.chained.crt",				
			},

			// eslint-disable-next-line @typescript-eslint/naming-convention
			env_production: {
				NODE_ENV: "production",
				PORT: 8888,
				SSL_PRIVATE_KEY: "src/_infrastructure/fixtures/certificates/decodeonline.app.key",
				SSL_CERTIFICATE: "src/_infrastructure/fixtures/certificates/decodeonline.app.chained.crt",
				SSL_CA_CERTIFICATE: "src/_infrastructure/fixtures/certificates/decodeonline.app.chained.crt"
			}
		},
	],
}