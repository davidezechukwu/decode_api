/* eslint-disable @typescript-eslint/naming-convention */
let envPath = ''
if (process.platform === 'win32') {
    envPath = __dirname
} else {
    if (__dirname) {
        envPath = __dirname
    } else if (process.env.HOME) {
        envPath = __dirname
    } else {
        envPath = `/opt/decode/api/www/dist/.env`
    }
}
require('dotenv').config({path: `${envPath}/.env`})

const debug = require('debug')('decode:Configuration')
debug(process.platform)
debug(__dirname)
debug(process.env.HOME)
debug(envPath)


const path = require('path')
//import { TelemetryClient } from 'applicationinsights';
import {ApplicationConfig} from '@loopback/core'
import {StrategyOptionsWithRequest as FaceBookStrategyOptions} from 'passport-facebook'
import {IStrategyOptionsWithRequest as LocalPassportStrategyOptions} from 'passport-local'
import {StrategyOptions as GoogleStrategyOptions} from 'passport-google-oauth20'
import {IStrategyOption as TwitterStrategyOptions} from 'passport-twitter'
import {StrategyOption as LinkedInStrategyOptions} from 'passport-linkedin-oauth2'
import {LocalAuthenticationStrategyOptionsType, ModelIdType} from '@david.ezechukwu/core'
import {StrategyOptionsWithRequest as PassportJWTStrategyOptions} from 'passport-jwt'
const ExtractJwt = require('passport-jwt').ExtractJwt;
import {localAuthenticationStrategyOptions} from '@david.ezechukwu/core'

//StrategyOptionsWithRequest | StrategyOptionsWithoutRequest
//DO NOT USE IN A LINUX ENV WITHOUT PROVIDING A HANDLER

// #region ShutDownSignals
export type ShutDownSignals =
    | 'SIGINT' /*Interrupt from keyboard*/
    | 'SIGILL' /*Illegal Instruction*/
    | 'SIGKILL' /*Kill process*/
    | 'SIGSTOP' /*Stop process*/
    | 'SIGCONT' /*Continue process paused by SIGSTOP*/
    | 'SIGTERM' /*Terminate process*/
// #endregion ShutDownSignals

// #region DigestAlgorithm
export type DigestAlgorithm =
    | 'sha1'
    | 'sha224'
    | 'sha256'
    | 'sha384'
    | 'sha512'
    | 'md5'
    | 'rmd160'
    | 'sha224WithRSAEncryption'
    | 'RSA-SHA224'
    | 'sha256WithRSAEncryption'
    | 'RSA-SHA256'
    | 'sha384WithRSAEncryption'
    | 'RSA-SHA384'
    | 'sha512WithRSAEncryption'
    | 'RSA-SHA512'
    | 'RSA-SHA1'
    | 'ecdsa-with-SHA1'
    | 'sha256'
    | 'sha224'
    | 'sha384'
    | 'sha512'
    | 'DSA-SHA'
    | 'DSA-SHA1'
    | 'DSA'
    | 'DSA-WITH-SHA224'
    | 'DSA-SHA224'
    | 'DSA-WITH-SHA256'
    | 'DSA-SHA256'
    | 'DSA-WITH-SHA384'
    | 'DSA-SHA384'
    | 'DSA-WITH-SHA512'
    | 'DSA-SHA512'
    | 'DSA-RIPEMD160'
    | 'ripemd160WithRSA'
    | 'RSA-RIPEMD160'
    | 'md5WithRSAEncryption'
    | 'RSA-MD5'
// #endregion DigestAlgorithm

export const provider: unique symbol = Symbol()
export const providerSecret: unique symbol = Symbol()

export type EnvironmentName = 'development' | 'test' | 'staging' | 'production'
export type GroupNames = 'internal' | 'external' | 'administrators' | 'support' | 'developers' | 'testers' | 'executive' | 'all'[]
export type RoleNames = 'administrator' | 'member' | 'guest'[]

export interface IDataSourceConfiguration {
    name: string
    connector: string
    SupportsTransaction: boolean
    [key: string]: string | boolean | number
}

export type LocalStrategyOptions = LocalPassportStrategyOptions &
    LocalAuthenticationStrategyOptionsType & {
        usernameField: string
        passwordField: string
        pbkdf2Iterations: number
        pbkdf2Keylen: number
        pbkdf2Digest: DigestAlgorithm
		resetAttemptLimit: number,
		resetDaysLimit: number
    }

export type JWTStrategyOptions = (PassportJWTStrategyOptions & {[provider]: 'JWT', secretOrKey: string, nonce: string, maxAge: number} | {secretOrKey: string, nonce: string, maxAge: number})

export type StrategyOptionsType = {
    clientID?: string
    clientSecret?: string
    callbackURL: string
    successRedirect: string
    failureRedirect: string
    failureFlash: boolean
    passReqToCallback: boolean
    scope: string[]
    profileFields?: string[]
    includeEmail?: boolean
}
// #region Localisation
/**
 * Locale is the String Literal Type for 2-letter ISO639_1 code for languages
 */
export declare type Locale = 'bn' | 'cy' | 'en' | 'fr' | 'de' | 'es' | 'ha' | 'hi' | 'ig' | 'mr' | 'pa' | 'ps' | 'gd' | 'sd' | 'ta' | 'ur' | 'yo'
/**
 * Locales is the array of the String Literal Type for 2-letter ISO639_1 code for languages
 */
export declare type Locales = Locale[]
/**
 * Device specifies a target device, it could be web, mobile, tablet, television, or iot
 */
export declare type Device = 'web' | 'mobile' | 'tablet' | 'television' | 'iot'
/**
 * Devices specifies an array of Device
 */
export declare type Devices = Device[]
// #endregion Localisation

/**
 * System-wide configurations are typed to this. These are read from .env, config files, etc and stored in the module export Configuration.
 * Using camel-case here as loopback uses camel case, pascal case is used throughout elsewhere
 * @remarks
 * System-wide configurations
 */
export type ConfigurationType = {
    name?: string
	hostURL: string
    rootUser: {
        id: ModelIdType
        emailAddress: string
        password: string
        title?: string
        firstName: string
        lastName: string
        displayName?: string
        phoneNumber: string
    }
    localisation: {
        defaultLocale: Locale
        defaultDevice: Device
        supportedLocales: Locales
        supportedDevices: Devices
    }
    env?: EnvironmentName
    isNotProduction?: boolean
    fixtures: {
        certificatePath: string        
        localisationPath: string
        casbinPath: string
        templatePath: string
    }
    expressJS?: {
        viewPath: string
        viewEngine: string
        mountPath: string
        expressionSession: {
            cookieName: string
            cookieSecret: string
            saveUninitialized: boolean
            resave: boolean
            sessionCookie: {
                domain: string
                secure: boolean
                path: string
                httpOnly: boolean
                maxAge: number
                SameSite: boolean | 'lax' | 'strict' | 'none'
            }
        }
    }
    redis?: {
        host: string
        port: number
        username: string
        password: string
    }
    shutdown?: {
        signals?: ShutDownSignals[]
    }
    gracePeriodForClose?: number
    rest?: {
        staticPaths?: string[]
        protocol?: 'http' | 'https'
        port?: number
        host?: string
        basePath?: string
        sslPrivatekey?: string | Buffer
        sslCertificate?: string | Buffer
        sslCACertificate?: string | Buffer
        listenOnStart?: boolean
        cors?: {
            origin?: string[]
            methods?: string
            preflightContinue?: boolean
            optionsSuccessStatus?: number
            maxAge?: number
            credentials?: boolean
        }
        expressSettings?: {
            'x-powered-by'?: boolean
        }
        requestBodyParser?: {
            json?: {
                limit?: number
            }
        }
        // The `gracePeriodForClose` provides a graceful close for http/https
        // servers with keep-alive clients. The default value is `Infinity`
        // (don't force-close). If you want to immediately destroy all sockets
        // upon stop, set its value to `0`.
        // See https://www.npmjs.com/package/stoppable
        gracePeriodForClose?: number
        openApiSpec?: {
            // useful when used with OpenAPI-to-GraphQL to locate your application
            setServersFromRequest?: boolean
        }
    }
    logging?: {
        //level?: string
        fluentd?: {
            serviceHost?: string
            servicePort?: number
            timeOut?: number
            reconnectInterval?: number
        }
        winston?: {
            levels?: {[key: string]: number}
            colors?: {[key: string]: string}
            level?: string
            format?: object
            defaultMeta?: object
            handleExceptions?: boolean
            transports?: object
        }
        AzureApplicationInsights?: {
            connectionString?: string
			appInsightsInstance?: { client: any } | null | undefined
        }
    }
    loopBackExplorerPath?: string
    dataSources?: {
        CoreDataSource: IDataSourceConfiguration
    }
    authentication?: {
        [index: string]: any
        sessionOptions?: {[provider]: string}
        localOptions?: LocalStrategyOptions & {[provider]: 'local'}
        facebookOptions?: undefined | (FaceBookStrategyOptions & {[provider]: 'facebook'} & StrategyOptionsType)
        googleOptions?: undefined | (GoogleStrategyOptions & {[provider]: 'google'} & StrategyOptionsType)
        twitterOptions?: undefined | (TwitterStrategyOptions & {[provider]: 'twitter'} & StrategyOptionsType)
        linkedInOptions?: undefined | (LinkedInStrategyOptions & {[provider]: 'linkedin'} & StrategyOptionsType)        
		jwtOptions?:  undefined | JWTStrategyOptions
    }
    authorization?: {
        /* this must tally with the CAsbin File and Lookup.CasbinRole values*/
        DefaultRoles?: RoleNames
        /* this must tally with the CAsbin File and Lookup.CasbinGroup values*/
        DefaultGroups?: GroupNames
    }
    notifications: {
		inapp:{
			fromName: string
		}
        email: {
            fromEmailAddress: string
            fromName: string
            maxRetry: number,
			verificationAttemptLimit: number
			verificationDaysLimit: number
            provider: {
                //SendGrid, Outlook, Gmail, etc in prod
                nodeMailerOptions: {
                    username: string
                    password: string
                    host: string
                    port: number
                    secure: boolean
                    tlsCipher?: string
					service?: string
                }
            }
        }
        sms: {            
            fromName: string
            useMultipleToPhoneNumbers: boolean
            maxRetry: number
			verificationAttemptLimit: number
			verificationDaysLimit: number
            provider: {
                ClickSendOptions: {
                    api_key: string
                    api_username: string
                    api_url: string
                }
            }
        }
    }
	geolocation:{
		FreeIPLookupAPI:{
			key: string
		},
		IPStack:{
			key: string
		},
		AbstractAPI:{
			key: string
		}
	}
}

const mountPath = process.env.EXPRESS_API_MOUNT_PATH! ?? ''
const basePath = process.env.LOOPBACK_API_BASE_PATH! ?? ''
let port = 8888
if (process.env.NODE_ENV! == 'development') {
    if (process.env.PROTOCOL! == 'https') {
        port = process.env.PORT ? +process.env.PORT! : 443
    } else {
        port = process.env.PORT ? +process.env.PORT! : 80
    }
}
export const Configuration: ConfigurationType & ApplicationConfig = {	
    name: process.env.HOST_NAME!,
	hostURL: process.env.HOST_URL!,
    rootUser: {
        id: +process.env.ROOT_USER_ID!,
        emailAddress: process.env.ROOT_USER_EMAIL_ADDRESS!,
        password: process.env.ROOT_USER_PASSWORD!,
        title: process.env.ROOT_USER_TITLE!,
        firstName: process.env.ROOT_USER_FIRST_NAME!,
        lastName: process.env.ROOT_USER_LAST_NAME!,
        displayName: process.env.ROOT_USER_DISPLAY_NAME!,
        phoneNumber: process.env.ROOT_USER_PHONE_NUMBER!
    },
    localisation: {
        defaultLocale: process.env.DEFAULT_LOCALE! as Locale,
        defaultDevice: process.env.DEFAULT_DEVICE! as Device,
        supportedLocales: process.env.SUPPORTED_LOCALES!.split(',') as Locales,
        supportedDevices: process.env.SUPPORTED_DEVICES!.split(',') as Devices
    },
    env: process.env.NODE_ENV! as EnvironmentName,
    isNotProduction: (process.env.NODE_ENV! as EnvironmentName) != 'production',
    fixtures: {
        certificatePath: path.resolve(`${process.env.FIXTURES_PATH!}/certificates`),        
        localisationPath: path.resolve(`${process.env.FIXTURES_PATH!}/localisation`),
        casbinPath: path.resolve(`${process.env.FIXTURES_PATH!}/casbin`),
        templatePath: path.resolve(`${process.env.FIXTURES_PATH!}/templates`)
    },
    expressJS: {
        viewPath: path.join(__dirname, '_views'),
        viewEngine: 'pug',
        mountPath: mountPath,
        expressionSession: {
            cookieName: process.env.EXPRESS_SESSION_COOKIE_NAME!,
            cookieSecret: process.env.EXPRESS_SESSION_COOKIE_SECRET!,
            saveUninitialized: process.env.EXPRESS_SESSION_COOKIE_SAVEUNINITIALIZED!.toString().toLowerCase() === 'true',
            resave: process.env.EXPRESS_SESSION_COOKIE_RESAVE!.toString().toLowerCase() === 'true',
            sessionCookie: {
                domain: process.env.EXPRESS_SESSION_COOKIE_DOMAIN!,
                secure: process.env.EXPRESS_SESSION_COOKIE_SECURE!.toString().toLowerCase() === 'true',
                path: process.env.EXPRESS_SESSION_COOKIE_PATH!,
                httpOnly: process.env.EXPRESS_SESSION_COOKIE_HTTPONLY!.toString().toLowerCase() === 'true',
                maxAge: +process.env.EXPRESS_SESSION_COOKIE_MAXAGE!,
                SameSite: process.env.EXPRESS_SESSION_COOKIE_SAMESITE! as boolean | 'lax' | 'strict' | 'none'
            }
        }
    },
    redis: {
        host: process.env.REDIS_HOST!,
        port: +process.env.REDIS_PORT!,
        username: process.env.REDIS_USERNAME!,
        password: process.env.REDIS_PASSWORD!
    },
    shutdown: {
        signals: []
    },
    gracePeriod: 1,
    rest: {
        staticPaths: [path.join(__dirname, '_public')],
        port: port,
        protocol: process.env.PROTOCOL! as 'https' | 'http',
        host: process.env.HOST!,
        basePath: basePath,
        sslPrivatekey: process.env.SSL_PRIVATE_KEY?.toString(),
        sslCertificate: process.env.SSL_CERTIFICATE?.toString(),
        sslCACertificate: process.env.SSL_CA_CERTIFICATE?.toString(),
        listenOnStart: false,
        gracePeriodForClose: 120000, // 2mins
        cors: {
            origin: process.env.LOOPBACK_CORE_CORS_ALLOW_ORIGIN!.split(','),
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204,
            maxAge: 86400,
            credentials: true
        },
        expressSettings: {
            'x-powered-by': false
        },
        requestBodyParser: {
            json: {
                limit: parseInt(process.env.LOOPBACK_CORE_MAX_REQUEST!)
            }
        },
        openApiSpec: {
            setServersFromRequest: true
        }
    },
    logging: {
        //level: process.env.LOGGING_LEVEL!,
        fluentd: {
            serviceHost: process.env.FLUENTD_SERVICE_HOST! ?? 'localhost',
            servicePort: +(process.env.FLUENTD_SERVICE_PORT_TCP ?? 24230),
            timeOut: +(process.env.FLUENTD_SERVICE_TIMEOUT ?? 3),
            reconnectInterval: +(process.env.FLUENTD_SERVICE_RECONNECTINTERVAL ?? 33333)
        },
        winston: {
            levels: JSON.parse(process.env.WINSTON_LOGGING_LEVELS!),
            level: process.env.WINSTON_LOGGING_LEVEL!,
            colors: JSON.parse(process.env.WINSTON_LOGGING_COLORS!),
            defaultMeta: {solution: 'decode', project: 'API'},
            handleExceptions: false
        },
        AzureApplicationInsights: {
            connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!
        }
    },
    loopBackExplorerPath: process.env.LOOPBACK_CORE_EXPLORER_PATH!,
    dataSources: {
        /*
		--Postgres
		CoreDataSource: {
			name: 'postgresdb',
			connector: 'postgresql',
			url: '',
			host: '127.0.0.1',
			port: 5432,
			user: 'postgres',
			password: 'YourPassword',
			database: 'decodedb',
			min: 5,
			max: 200,
			idleTimeoutMillis: 60000,
			ssl: false,
			SupportsTransaction: true
		},
		*/
        CoreDataSource: {
            name: 'sqlserverdb',
            connector: 'mssql',
            host: process.env.CORE_DATABASE_HOST!,
            port: +process.env.CORE_DATABASE_PORT!,
            username: process.env.CORE_DATABASE_USERNAME!,
            password: process.env.CORE_DATABASE_PASSWORD!,
            database: process.env.CORE_DATABASE_DATABASE!,
            SupportsTransaction: +process.env.CORE_DATABASE_SUPPORTS_TRANSACTIONS! == 1
        }
    },
    authentication: {
        sessionOptions: {
            [provider]: 'session'
        },
        localOptions: {
            [provider]: 'local',
            ...localAuthenticationStrategyOptions,
            session: true,
            passReqToCallback: true,
            pbkdf2Iterations: +process.env.API_AUTHENTICATION_LOCAL_PBKDF2ITERATIONS!,
            pbkdf2Keylen: +process.env.API_AUTHENTICATION_LOCAL_PBKDF2KEYLEN!,
            pbkdf2Digest: process.env.API_AUTHENTICATION_LOCAL_PBKDF2DIGEST! as DigestAlgorithm,	
			resetAttemptLimit: +process.env.API_AUTHENTICATION_LOCAL_MAX_VERIFICATION_ATTEMPT_LIMIT!,
			resetDaysLimit: +process.env.API_AUTHENTICATION_LOCAL_MAX_VERIFICATION_DAYS_LIMIT!
        },
        facebookOptions: {
            [provider]: 'facebook',
            clientID: process.env.API_AUTHENTICATION_FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.API_AUTHENTICATION_FACEBOOK_CLIENT_SECRET!,
            callbackURL: process.env.API_AUTHENTICATION_FACEBOOK_CALLBACK_URL!,
            successRedirect: process.env.API_AUTHENTICATION_FACEBOOK_SUCCESS_REDIRECT!,
            failureRedirect: process.env.API_AUTHENTICATION_FACEBOOK_FAILURE_REDIRECT!,
			scope: process.env.API_AUTHENTICATION_FACEBOOK_SCOPE?.split(',')!,            
            profileFields: process.env.API_AUTHENTICATION_FACEBOOK_PROFILE_FIELDS?.split(',')!,            
            failureFlash: true,
            passReqToCallback: true
        },
        googleOptions: {
            [provider]: 'google',
            clientID: process.env.API_AUTHENTICATION_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.API_AUTHENTICATION_GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.API_AUTHENTICATION_GOOGLE_CALLBACK_URL!,
            successRedirect: process.env.API_AUTHENTICATION_GOOGLE_SUCCESS_REDIRECT!,
            failureRedirect: process.env.API_AUTHENTICATION_GOOGLE_FAILURE_REDIRECT!,
            scope: process.env.API_AUTHENTICATION_GOOGLE_SCOPE?.split(',')!,
            state: false,
            failureFlash: true,
            passReqToCallback: false
        },
        twitterOptions: {
            [provider]: 'twitter',
			///clientID: "T1NJY0RpYTY3aXNJZTJ2ejM5Vmc6MTpjaQ",
			//clientSecret: "YQ8tYCJTV31m-i_psCIIUX8nOy1ExQVi8InDXrV2lgM9-LdF6S",
            consumerKey: process.env.API_AUTHENTICATION_TWITTER_CLIENT_ID!,
            consumerSecret: process.env.API_AUTHENTICATION_TWITTER_CLIENT_SECRET!,
            callbackURL: process.env.API_AUTHENTICATION_TWITTER_CALLBACK_URL!,
            successRedirect: process.env.API_AUTHENTICATION_TWITTER_SUCCESS_REDIRECT!,
            failureRedirect: process.env.API_AUTHENTICATION_TWITTER_FAILURE_REDIRECT!,
            scope: process.env.API_AUTHENTICATION_TWITTER_SCOPE?.split(',')!,
            failureFlash: true,
            passReqToCallback: false,
            includeEmail: true,		
            //clientType: process.env.API_AUTHENTICATION_TWITTER_CLIENT_TYPE! as "public" | "confidential" | "private"
        },
        linkedInOptions: {
            [provider]: 'linkedin',
            clientID: process.env.API_AUTHENTICATION_LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.API_AUTHENTICATION_LINKEDIN_CLIENT_SECRET!,
            callbackURL: process.env.API_AUTHENTICATION_LINKEDIN_CALLBACK_URL!,
            successRedirect: process.env.API_AUTHENTICATION_LINKEDIN_SUCCESS_REDIRECT!,
            failureRedirect: process.env.API_AUTHENTICATION_LINKEDIN_FAILURE_REDIRECT!,
            scope: process.env.API_AUTHENTICATION_LINKEDIN_SCOPE?.split(',')!,
            failureFlash: true,
            passReqToCallback: true,
            includeEmail: true
        },
        jwtOptions: {
            [provider]: 'JWT',
            algorithms: ['ES256', 'ES384', 'ES512', 'RS256', 'PS256', 'RS384', 'PS384', 'RS512', 'PS512', 'PS256', 'PS384', 'PS512', 'HS256', 'HS384', 'HS512', 'RS256'],
            secretOrKey: process.env.API_AUTHENTICATION_JWT_SECRET_ID!,
            issuer: process.env.API_AUTHENTICATION_JWT_ISSUER!,
            audience: process.env.API_AUTHENTICATION_JWT_AUDIENCE!,			
			nonce: process.env.API_AUTHENTICATION_JWT_NONCE!,
            maxAge: +process.env.API_AUTHENTICATION_JWT_MAX_AGE!,
            ignoreExpiration: process.env.API_AUTHENTICATION_JWT_IGNORE_EXPIRATION! === 'true',
            passReqToCallback: true,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        }
    },
    authorization: {
        DefaultGroups: JSON.parse(process.env.API_AUTHORIZATION_DEFAULT_CASBIN_GROUPS!) as GroupNames,
        DefaultRoles: JSON.parse(process.env.API_AUTHORIZATION_DEFAULT_CASBIN_ROLES!) as RoleNames
    },
    notifications: {
		inapp: {
			fromName: process.env.NOTIFICATIONS_INAPP_FROM!
		},
        email: {
            fromEmailAddress: process.env.NOTIFICATIONS_EMAIL_FROM_ADDRESS!,
            fromName: process.env.NOTIFICATIONS_EMAIL_FROM_NAME!,            
            maxRetry: +process.env.NOTIFICATIONS_EMAIL_MAX_RETRY!,
			verificationAttemptLimit: +process.env.NOTIFICATIONS_EMAIL_MAX_VERIFICATION_ATTEMPT_LIMIT!,
			verificationDaysLimit: +process.env.NOTIFICATIONS_EMAIL_MAX_VERIFICATION_DAYS_LIMIT!,
            provider: {
                nodeMailerOptions: {
                    username: process.env.NOTIFICATIONS_EMAIL_USERNAME!,
                    password: process.env.NOTIFICATIONS_EMAIL_PASSWORD!,
                    host: process.env.NOTIFICATIONS_EMAIL_SERVER!,
                    port: +process.env.NOTIFICATIONS_EMAIL_PORT!,
                    secure: process.env.NOTIFICATIONS_EMAIL_SECURE == '1',
                    tlsCipher: process.env.NOTIFICATIONS_EMAIL_TLSCIPHER,
					service: process.env.OTIFICATIONS_EMAIL_SERVICE
                }
            }
        },
        sms: {            
            fromName: process.env.NOTIFICATIONS_SMS_FROM_NAME!,
            useMultipleToPhoneNumbers: process.env.NOTIFICATIONS_SMS_USE_MULTIPLE_TO_PHONE_NUMBERS == '1',
            maxRetry: +process.env.NOTIFICATIONS_SMS_MAX_RETRY!,
			verificationAttemptLimit: +process.env.NOTIFICATIONS_SMS_MAX_VERIFICATION_ATTEMPT_LIMIT!,
			verificationDaysLimit: +process.env.NOTIFICATIONS_SMS_MAX_VERIFICATION_DAYS_LIMIT!,
            provider: {
                ClickSendOptions: {
                    api_key: process.env.NOTIFICATIONS_SMS_CLICKSEND_API_KEY!,
                    api_username: process.env.NOTIFICATIONS_SMS_CLICKSEND_API_USERNAME!,
                    api_url: process.env.NOTIFICATIONS_SMS_CLICKSEND_API_URL!
                }
            }
        }
    },
	geolocation:{
		FreeIPLookupAPI:{
			key: process.env.GEOLOCATION_FREEIPLOOKUPAPI_KEY!
		},
		IPStack:{
			key: process.env.GEOLOCATION_IPSTACK_KEY!
		},
		AbstractAPI:{
			key: process.env.GEOLOCATION_ABSTRACTAPI_KEY!
		},
	}
}

if ( Configuration.isNotProduction ){
	if ( Configuration.dataSources?.CoreDataSource.name == 'sqlserverdb' && Configuration.dataSources?.CoreDataSource.connector ==  'mssql' ){
		(Configuration.dataSources.CoreDataSource as any)["options"] = {encrypt: true, trustServerCertificate: true}	
	}
}

export function GetConfigurationFromEnv(): ConfigurationType & ApplicationConfig {
    return Configuration
}
