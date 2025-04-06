import {BindingKey, BindingScope, extensionFor, inject, injectable, Provider} from '@loopback/core'
import {asAuthStrategy} from '@loopback/authentication'
import {Profile as PassportProfile, Strategy as PassportStrategy, StrategyOptionsWithRequest as PassportStrategyOptions} from 'passport-facebook'
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
const facebookAuthenticationProviderName = lookups.AuthenticationProviders.Facebook.Value

/**
 * The facebook OAUTH service provider
 * */
@injectable.provider({scope: BindingScope.SINGLETON, tags: {key: FaceBookAuthenticationPassportStrategyProvider.BINDING_KEY}})
export class FaceBookAuthenticationPassportStrategyProvider implements Provider<PassportStrategy> {
    static BINDING_KEY = BindingKey.create<FaceBookAuthenticationPassportStrategyProvider>(`authentication.providers.${FaceBookAuthenticationPassportStrategyProvider.name}`)
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
        this.ThePassportStrategy = new PassportStrategy(this.Configuration.authentication?.facebookOptions as PassportStrategyOptions, FaceBookAuthenticationStrategy.prototype.VerifyUser(this.ExternalUserIdentityService))
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
export class FaceBookAuthenticationStrategy extends SuperAuthenticationStrategy {
    static BINDING_KEY = BindingKey.create<FaceBookAuthenticationStrategy>(`authentication.strategies.${FaceBookAuthenticationStrategy.name}`)
    /**
     * create an oauth2 strategy for facebook
     */
    constructor(
        @inject(FaceBookAuthenticationPassportStrategyProvider.BINDING_KEY)
        public passportStrategy: PassportStrategy
    ) {
        super(
            facebookAuthenticationProviderName,
            new StrategyAdapter(passportStrategy, facebookAuthenticationProviderName, (user: Partial<UserModel>): UserModel => {
                // eslint-disable-next-line
                const _user: UserModel = new UserModel(user)
                _user[securityId] = '' + user.Id
                return _user
            })
        )
    }

    /**
     * VerifyUser
     * remarks
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

		For facebook, this is what is returned:
		{
			id:'100559429590482',
			displayName:'Open Graph Test User',
			name:{
					'familyName':'User',
					'givenName':'Open',
					'middleName':'Graph Test'
			},
			profileUrl:'https://www.facebook.com/app_scoped_user_id/YXNpZADpBWEd2QVFGNGE4bVJOdjlxak9wc3YyWHJNLVhudDZAzajRsMXlaemV2RldPOGMyeXNEWEp3NkNocjB2aHlzUkJrZAGl1ZA2RCNXZAPdFlVZAF9BcnVtME0xSzRQRzRpaEtmMlJUUmFObmF0ZA2FPUDFTY2p5/',
			emails:[{'value':'open_ismrhdc_user@tfbnw.net'}],
			provider:'facebook',
			_raw:'{\'link\':\'https:\\/\\/www.facebook.com\\/app_scoped_user_id\\/YXNpZADpBWEd2QVFGNGE4bVJOdjlxak9wc3YyWHJNLVhudDZAzajRsMXlaemV2RldPOGMyeXNEWEp3NkNocjB2aHlzUkJrZAGl1ZA2RCNXZAPdFlVZAF9BcnVtME0xSzRQRzRpaEtmMlJUUmFObmF0ZA2FPUDFTY2p5\\/\',\'last_name\':\'User\',\'first_name\':\'Open\',\'middle_name\':\'Graph Test\',\'email\':\'open_ismrhdc_user\\u0040tfbnw.net\',\'name\':\'Open Graph Test User\',\'id\':\'100559429590482\'}',
			_json:{'link':'https://www.facebook.com/app_scoped_user_id/YXNpZADpBWEd2QVFGNGE4bVJOdjlxak9wc3YyWHJNLVhudDZAzajRsMXlaemV2RldPOGMyeXNEWEp3NkNocjB2aHlzUkJrZAGl1ZA2RCNXZAPdFlVZAF9BcnVtME0xSzRQRzRpaEtmMlJUUmFObmF0ZA2FPUDFTY2p5/','last_name':'User','first_name':'Open','middle_name':'Graph Test','email':'open_ismrhdc_user@tfbnw.net','name':'Open Graph Test User','id':'100559429590482'}
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
