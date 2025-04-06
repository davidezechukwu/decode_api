import {BindingKey, BindingScope, extensionFor, inject, injectable, Provider} from '@loopback/core'
import {asAuthStrategy} from '@loopback/authentication'
import {ExtractJwt, Strategy as PassportStrategy, StrategyOptionsWithRequest as PassportStrategyOptions} from 'passport-jwt'
import {SuperBindings} from '../../../SuperBindings'
import {SuperAuthenticationStrategy} from './SuperAuthenticationStrategy'
import {ConfigurationType} from '../../../Configuration'
import {UserModel} from '../../../models'
import {StrategyAdapter} from '@loopback/authentication-passport'
import {Request as ExpressRequest} from 'express'
import {UserService} from '../../user'
import {AuthenticationService, ExternalUserIdentityService, SessionAuthenticationStrategy} from '..'
import {Lookups} from '../../../_infrastructure/fixtures/localisation/Lookups'
import {LocalisationUtils} from '../../../utils'
import {securityId} from '@loopback/security'
const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const jwtAuthenticationProviderName = lookups.AuthenticationProviders.JWT.Value

/**
 * The JWT OAUTH service provider
 * */
@injectable.provider({scope: BindingScope.SINGLETON, tags: {key: JWTAuthenticationStrategyProvider.BINDING_KEY}})
export class JWTAuthenticationStrategyProvider implements Provider<PassportStrategy> {
    static BINDING_KEY = BindingKey.create<JWTAuthenticationStrategyProvider>(`authentication.strategies.${JWTAuthenticationStrategyProvider.name}`)
    ThePassportStrategy: PassportStrategy

    constructor(
        @inject(SuperBindings.ConfigurationTypeBindingKey.key)
        protected readonly Configuration: ConfigurationType,
        @inject(SuperBindings.UserServiceBindingKey.key)
        protected UserService: UserService,
        @inject(ExternalUserIdentityService.BINDING_KEY.key)
        protected ExternalUserIdentityService: ExternalUserIdentityService,
        @inject(SuperBindings.AuthenticationServiceBindingKey.key)
        protected AuthenticationService: AuthenticationService
    ) {
        const jwtOptions = this.Configuration.authentication?.jwtOptions as PassportStrategyOptions
        jwtOptions.jwtFromRequest = ExtractJwt.fromExtractors([
            ExtractJwt.fromAuthHeaderAsBearerToken(),
            ExtractJwt.fromUrlQueryParameter('auth_token'),
            ExtractJwt.fromHeader('auth_token'),
            ExtractJwt.fromBodyField('auth_token'),
            ExtractJwt.fromAuthHeaderWithScheme('bearer')
        ])
        this.ThePassportStrategy = new PassportStrategy(jwtOptions, JWTAuthenticationStrategy.prototype.Verify)
    }

    // eslint-disable-next-line
    value() {
        return this.ThePassportStrategy
    }
}

/**
 * The JWT service
 * */
@injectable(asAuthStrategy, extensionFor(SuperBindings.OAUTH_STRATEGY_BINDING_KEY))
export class JWTAuthenticationStrategy extends SuperAuthenticationStrategy {
    static BINDING_KEY = BindingKey.create<JWTAuthenticationStrategy>(`authentication.strategies.${JWTAuthenticationStrategy.name}`)
    /**
     * create an oauth2 strategy for google
     */
    constructor(
        @inject(JWTAuthenticationStrategyProvider.BINDING_KEY)
        public passportStrategy: PassportStrategy
    ) {
        super(
            jwtAuthenticationProviderName,
            new StrategyAdapter(passportStrategy, jwtAuthenticationProviderName, (user: Partial<UserModel>): UserModel => {
                // eslint-disable-next-line
                const _user: UserModel = new UserModel(user)
                _user[securityId] = '' + user.Id
                return _user
            })
        )
    }

    /**
		 * Veriffy
		 * @remarks
		test jwt is:
		eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRldjEuZGVjb2RlQG91dGxvb2suY29tIiwicm9sZXMiOlsid2VidXNlciIsImRldmVsb3BlciJdLCJpYXQiOjE2ODQ5NDQ4MzUsImV4cCI6MTY4NzEwNDgzNSwidXNlcklkIjoxLCJlbWFpbCI6ImRldjEuZGVjb2RlQG91dGxvb2suY29tIn0.tJszI79NEBDi3PHMxhYg7PVH55_39UwCip8kxw4OHgU
		is the jwt above base64 encoded?:
		no
		algorithm is: 
		{
				"typ": "JWT",
				"alg": "HS256"
		}
		test secret is:
		NTNv7j0TuYARvmNMmWXo6fKvM4o6nv/aUi9ryX38ZH+L1bkrnD1ObOQ8JAUmHCBq7Iy7otZcyAagBLHVKvvYaIpmMuxmARQ97jUVG16Jkpkp1wXOPsrF9zwew6TpczyHkHgX5EuLg2MeBuiT/qJACs1J0apruOOJCg/gOtkjB4c=
		Payload is:
		{
			"username": "dev1.decode@outlook.com",
			"roles": ["webuser","developer"], 
			"iat": 1684944835,
			"exp": 1687104835,
			"userId": 1,
			"email": "dev1.decode@outlook.com"
		}

		iat is calculalted as getDate()/1000
		exp is calculalted as getDate()/1000 + (60 * 60 * 60 * 10hrs) 
		 * */
    public Verify(req: ExpressRequest, payload: any, done: (error: any, user?: Express.User | false, info?: any) => void) {
        done(null, new UserModel({Id: 1}), {})
    }
}
