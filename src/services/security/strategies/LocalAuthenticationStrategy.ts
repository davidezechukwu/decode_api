import {BindingKey, BindingScope, extensionFor, inject, injectable, Provider} from '@loopback/core'
import {asAuthStrategy} from '@loopback/authentication'
import {Request} from 'express'
import {IVerifyOptions, Strategy as PassportStrategy, IStrategyOptionsWithRequest as PassportStrategyOptions} from 'passport-local'
import {ILoginRequest, IUser} from '@david.ezechukwu/core'
import {SuperBindings} from '../../../SuperBindings'
import {SuperAuthenticationStrategy} from './SuperAuthenticationStrategy'
import {ConfigurationType} from '../../../Configuration'
import {StrategyAdapter} from '@loopback/authentication-passport'
import {UserService} from '../../user'
import {AuthenticationService, SessionAuthenticationStrategy} from '..'
import {Lookups} from '../../../_infrastructure/fixtures/localisation/Lookups'
import {UserModel, UserDisplaySettingsModel} from '../../../models'
import {RegisterRequest} from '../../../dtobjects'
import {LocalisationUtils} from '../../../utils'
import {securityId} from '@loopback/security'

const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const localAuthenticationProviderName = lookups.AuthenticationProviders.Local.Value

/**
 * The local service provider
 * */
@injectable.provider({scope: BindingScope.TRANSIENT, tags: {key: LocalAuthenticationPassportStrategyProvider.BINDING_KEY}})
export class LocalAuthenticationPassportStrategyProvider implements Provider<PassportStrategy> {
    static BINDING_KEY = BindingKey.create<LocalAuthenticationPassportStrategyProvider>(`authentication.strategies.${LocalAuthenticationPassportStrategyProvider.name}`)
    // eslint-disable-next-line
    strategy: PassportStrategy

    constructor(
        @inject(SuperBindings.ConfigurationTypeBindingKey.key)
        protected readonly Configuration: ConfigurationType,
        @inject(SuperBindings.AuthenticationServiceBindingKey.key)
        protected AuthenticationService: AuthenticationService
    ) {
        this.strategy = new PassportStrategy(this.Configuration.authentication?.localOptions as unknown as PassportStrategyOptions, LocalAuthenticationStrategy.prototype.VerifyUser(this.AuthenticationService))
    }

    // eslint-disable-next-line
    value() {
        return this.strategy
    }
}

@injectable(asAuthStrategy, extensionFor(SuperBindings.OAUTH_STRATEGY_BINDING_KEY))
export class LocalAuthenticationStrategy extends SuperAuthenticationStrategy {
    static BINDING_KEY = BindingKey.create<LocalAuthenticationStrategy>(`authentication.strategies.${LocalAuthenticationStrategy.name}`)

    /**
     * create a local authentication strategy
     */
    constructor(
        @inject(LocalAuthenticationPassportStrategyProvider.BINDING_KEY)
        protected passportStrategy: PassportStrategy,
        @inject(SuperBindings.UserServiceBindingKey.key)
        protected UserService: UserService,
        @inject(SuperBindings.AuthenticationServiceBindingKey.key)
        protected AuthenticationService: AuthenticationService
    ) {
        super(
            localAuthenticationProviderName,
            new StrategyAdapter(passportStrategy, localAuthenticationProviderName, user => {
                // eslint-disable-next-line
                const _user: UserModel = new UserModel(user)
                _user[securityId] = '' + user.Id
                return _user
            })
        )
    }

    /**
     * authenticate user with provided username and password     
     */
    public VerifyUser(authenticationService: AuthenticationService) {
        return function (req: Request, emailaddress: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) {
            const loginRequest: ILoginRequest = new RegisterRequest({Username: emailaddress, Password: password})
            authenticationService
                .Login(loginRequest)
                .then(async user => {
                    await authenticationService.SetSessionUsingExpressReq(req, user)
                    done(null, user)
                })
                .catch(err => {
                    done(err, {username: loginRequest.Username}, {message: err})
                })
        }
    }
}
