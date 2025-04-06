import {BindingKey, BindingScope, extensionFor, inject, injectable, Provider} from '@loopback/core'
import {asAuthStrategy} from '@loopback/authentication'
//import {Profile as PassportProfile, Strategy as PassportStrategy, StrategyOptions as PassportStrategyOptions} from '@superfaceai/passport-twitter-oauth2'
import {Profile as PassportProfile, Strategy as PassportStrategy, IStrategyOptionWithRequest as PassportStrategyOptions}  from 'passport-twitter'
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
import {IUser} from '@david.ezechukwu/core'
const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const twitterAuthenticationProviderName = lookups.AuthenticationProviders.Twitter.Value

/**
 * The twitter OAUTH service provider
 * */
@injectable.provider({scope: BindingScope.SINGLETON, tags: {key: TwitterAuthenticationPassportStrategyProvider.BINDING_KEY}})
export class TwitterAuthenticationPassportStrategyProvider implements Provider<PassportStrategy> {
    static BINDING_KEY = BindingKey.create<TwitterAuthenticationPassportStrategyProvider>(`authentication.strategies.${TwitterAuthenticationPassportStrategyProvider.name}`)
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
        this.ThePassportStrategy = new PassportStrategy(this.Configuration.authentication?.twitterOptions as unknown as PassportStrategyOptions, TwitterAuthenticationStrategy.prototype.VerifyUser(this.ExternalUserIdentityService))
    }

    // eslint-disable-next-line
    value() {
        return this.ThePassportStrategy
    }
}

/**
 * The facebook OAUTH service
 * */
@injectable(asAuthStrategy, extensionFor(SuperBindings.OAUTH_STRATEGY_BINDING_KEY))
export class TwitterAuthenticationStrategy extends SuperAuthenticationStrategy {
    static BINDING_KEY = BindingKey.create<TwitterAuthenticationStrategy>(`authentication.strategies.${TwitterAuthenticationStrategy.name}`)
    /**
     * create an oauth2 strategy for twitter
     */
    constructor(
        @inject(TwitterAuthenticationPassportStrategyProvider.BINDING_KEY)
        public passportStrategy: PassportStrategy
    ) {
        super(
            twitterAuthenticationProviderName,
            new StrategyAdapter(passportStrategy, twitterAuthenticationProviderName, (user: Partial<UserModel>): UserModel => {
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
        Profile is of this type
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

        For twitter, this is what is returned:
        {
            '
        }
     */
    public VerifyUser(externalUserIdentityService: ExternalUserIdentityService) {
        return function (
            request: ExpressRequest,
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
