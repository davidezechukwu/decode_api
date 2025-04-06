import {BindingKey, BindingScope, extensionFor, inject, injectable, Provider} from '@loopback/core'
import {asAuthStrategy} from '@loopback/authentication'
import {Profile as PassportProfile, Strategy as PassportStrategy, StrategyOptions as PassportStrategyOptions} from 'passport-google-oauth20'
import {SuperBindings} from '../../../SuperBindings'
import {SuperAuthenticationStrategy} from './SuperAuthenticationStrategy'
import {ConfigurationType} from '../../../Configuration'
import {UserModel} from '../../../models'
import {StrategyAdapter} from '@loopback/authentication-passport'
import {UserService} from '../../user'
import {AuthenticationService, ExternalUserIdentityService, SessionAuthenticationStrategy} from '..'
import {Lookups} from '../../../_infrastructure/fixtures/localisation/Lookups'
import {LocalisationUtils} from '../../../utils'
import {securityId} from '@loopback/security'
import {IUser} from '@david.ezechukwu/core'

const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const googleAuthenticationProviderName = lookups.AuthenticationProviders.Google.Value

/**
 * The google OAUTH service provider
 * */
@injectable.provider({scope: BindingScope.SINGLETON, tags: {key: GoogleAuthenticationPassportStrategyProvider.BINDING_KEY}})
export class GoogleAuthenticationPassportStrategyProvider implements Provider<PassportStrategy> {
    static BINDING_KEY = BindingKey.create<GoogleAuthenticationPassportStrategyProvider>(`authentication.strategies.${GoogleAuthenticationPassportStrategyProvider.name}`)
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
        this.ThePassportStrategy = new PassportStrategy(this.Configuration.authentication?.googleOptions as PassportStrategyOptions, GoogleAuthenticationStrategy.prototype.VerifyUser(this.ExternalUserIdentityService))
    }

    // eslint-disable-next-line
    value() {
        return this.ThePassportStrategy
    }
}

/**
 * The google OAUTH service
 * */
@injectable(asAuthStrategy, extensionFor(SuperBindings.OAUTH_STRATEGY_BINDING_KEY))
export class GoogleAuthenticationStrategy extends SuperAuthenticationStrategy {
    static BINDING_KEY = BindingKey.create<GoogleAuthenticationStrategy>(`authentication.strategies.${GoogleAuthenticationStrategy.name}`)
    /**
     * create an oauth2 strategy for google
     */
    constructor(
        @inject(GoogleAuthenticationPassportStrategyProvider.BINDING_KEY)
        public passportStrategy: PassportStrategy
    ) {
        super(
            googleAuthenticationProviderName,
            new StrategyAdapter(passportStrategy, googleAuthenticationProviderName, (user: Partial<UserModel>): UserModel => {
                // eslint-disable-next-line
                const _user: UserModel = new UserModel(user)
                _user[securityId] = '' + user.Id
                return _user
            })
        )
    }

    /**
	 * VerifyUser
	 * @remarks
			Profile is of this interface type
			interface Profile {
				provider: string
				id: string
				displayName: string
				username?: string | undefined
				name?: {
							familyName: string
							givenName: string
							middleName?: string | undefined
				} | undefined
				emails?: Array<{
							value: string
							type?: string | undefined
				}> | undefined
				photos?: Array<{
							value: string
				}> | undefined
			}

			For google, this is what is returned:
			{
					id:"107975814821478618892",
					displayName:"dev1 decode",
					name:{"familyName":"decode","givenName":"dev1"},
					emails:[{"value":"dev1.decode@outlook.com","verified":true}],
					photos:[{"value":"https://lh3.googleusercontent.com/a/AGNmyxbgUEPPwEmikFVacq0ugma2KcKZ3q0rLW-aXM9k=s96-c"}],
					provider:"google",
					_raw:"{\n  \"sub\": \"107975814821478618892\",\n  \"name\": \"dev1 decode\",\n  \"given_name\": \"dev1\",\n  \"family_name\": \"decode\",\n  \"picture\": \"https://lh3.googleusercontent.com/a/AGNmyxbgUEPPwEmikFVacq0ugma2KcKZ3q0rLW-aXM9k\\u003ds96-c\",\n  \"email\": \"dev1.decode@outlook.com\",\n  \"email_verified\": true,\n  \"locale\": \"en-GB\"\n}","_json":{"sub":"107975814821478618892","name":"dev1 decode","given_name":"dev1","family_name":"decode","picture":"https://lh3.googleusercontent.com/a/AGNmyxbgUEPPwEmikFVacq0ugma2KcKZ3q0rLW-aXM9k=s96-c","email":"dev1.decode@outlook.com","email_verified":true,"locale":"en-GB"}}"
			}
	 */
    public VerifyUser(externalUserIdentityService: ExternalUserIdentityService) {
        return function (
            /*req: ExpressRequest,*/
            accessToken: string,
            refreshToken: string,
            passportProfile: PassportProfile,
            done: (error: any, user?: any, info?: any) => void
        ) {
            externalUserIdentityService
                .FindOrCreateUser(passportProfile)
                .then(async (user: IUser) => {
                    done(null, user)
                })
                .catch(err => {
                    done(err)
                })
        }
    }
}
