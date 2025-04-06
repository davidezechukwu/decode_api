import {BindingKey, BindingScope, extensionFor, inject, injectable, Provider} from '@loopback/core'
import {asAuthStrategy} from '@loopback/authentication'
import {Profile as PassportProfile, Strategy as PassportStrategy, StrategyOptionWithRequest as PassportStrategyOptions} from 'passport-linkedin-oauth2'
import {SuperBindings} from '../../../SuperBindings'
import {SuperAuthenticationStrategy} from './SuperAuthenticationStrategy'
import {ConfigurationType} from '../../../Configuration'
import {UserModel} from '../../../models'
import {StrategyAdapter} from '@loopback/authentication-passport'
import {Request as ExpressRequest} from 'express'
import {UserService} from '../../user'
import {AuthenticationService, ExternalUserIdentityService} from '..'
import {Lookups} from '../../../_infrastructure/fixtures/localisation/Lookups'
import {LocalisationUtils} from '../../../utils'
import {securityId} from '@loopback/security'
import {IUser} from '@david.ezechukwu/core'

const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const linkedInAuthenticationProviderName = lookups.AuthenticationProviders.LinkedIn.Value

/**
 * The LinkedIn OAUTH service provider
 * */
@injectable.provider({scope: BindingScope.SINGLETON, tags: {key: LinkedInAuthenticationPassportStrategyProvider.BINDING_KEY}})
export class LinkedInAuthenticationPassportStrategyProvider implements Provider<PassportStrategy> {
    static BINDING_KEY = BindingKey.create<LinkedInAuthenticationPassportStrategyProvider>(`authentication.strategies.${LinkedInAuthenticationPassportStrategyProvider.name}`)
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
        this.ThePassportStrategy = new PassportStrategy(this.Configuration.authentication?.linkedInOptions as PassportStrategyOptions, LinkedInAuthenticationStrategy.prototype.VerifyUser(this.ExternalUserIdentityService))
    }

    // eslint-disable-next-line
    value() {
        return this.ThePassportStrategy
    }
}

/**
 * The LinkedIn OAUTH service
 * */
@injectable(asAuthStrategy, extensionFor(SuperBindings.OAUTH_STRATEGY_BINDING_KEY))
export class LinkedInAuthenticationStrategy extends SuperAuthenticationStrategy {
    static BINDING_KEY = BindingKey.create<LinkedInAuthenticationStrategy>(`authentication.strategies.${LinkedInAuthenticationStrategy.name}`)

    /**
     * create an oauth2 strategy for linkedIn
     */
    constructor(
        @inject(LinkedInAuthenticationPassportStrategyProvider.BINDING_KEY)
        public passportStrategy: PassportStrategy
    ) {
        super(
            linkedInAuthenticationProviderName,
            new StrategyAdapter(passportStrategy, linkedInAuthenticationProviderName, (user: Partial<UserModel>): UserModel => {
                // eslint-disable-next-line
                const _user: UserModel = new UserModel(user)
                _user[securityId] = '' + user.Id
                return _user
            })
        )
    }

    /**
		 * VeryUser
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

		For linkedIn, this is what is returned:
		{
			  
		}
	 */
    public VerifyUser(externalUserIdentityService: ExternalUserIdentityService) {
        return function (req: ExpressRequest, accessToken: string, refreshToken: string, passportProfile: PassportProfile, done: (error: any, user?: any, info?: any) => void) {
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
