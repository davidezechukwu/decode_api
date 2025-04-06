import {BindingKey, BindingScope, inject, injectable} from '@loopback/core'
import {asAuthStrategy} from '@loopback/authentication'
import {HttpErrors, RedirectRoute, Request} from '@loopback/rest'
import {UserProfile} from '@loopback/security'
import {SuperBindings} from '../../../SuperBindings'
import {ConfigurationType} from '../../../Configuration'
import {SuperAuthenticationStrategy} from './SuperAuthenticationStrategy'
import {Lookups} from '../../../_infrastructure/fixtures/localisation/Lookups'
import {LocalisationUtils} from '../../../utils'
import {securityId} from '@loopback/security'

const lookups: Lookups = LocalisationUtils.GetLocalisedLookups()
const sessionAuthenticationProviderName = lookups.AuthenticationProviders.Session.Value

/**
 * The session provider service
 * */
@injectable(asAuthStrategy, {scope: BindingScope.TRANSIENT, tags: {key: SessionAuthenticationStrategy.BINDING_KEY}})
export class SessionAuthenticationStrategy extends SuperAuthenticationStrategy {
    static BINDING_KEY = BindingKey.create<SessionAuthenticationStrategy>(`authentication.strategies.${SessionAuthenticationStrategy.name}`)
    constructor(
        @inject(SuperBindings.ConfigurationTypeBindingKey.key)
        protected readonly Configuration: ConfigurationType
    ) {
        super(sessionAuthenticationProviderName, null)
    }

    /**
     * authenticate a request     
     */
    // eslint-disable-next-line
    async authenticate(req: Request): Promise<UserProfile | RedirectRoute | undefined> {
        if (!req.session) {
            this.Logger.debug(`SessionAuthenticationStrategy.authenticate with Session empty`)
            throw new HttpErrors.Unauthorized(`Session express middleware is missing`)
        }
        this.Logger.debug(`SessionAuthenticationStrategy.authenticate with Session as:- ${JSON.stringify(req.session)}`)
        this.Logger.debug(`SessionAuthenticationStrategy.authenticate with Session.id = ${req.session.id}`)
        if (!req.session.User || req.session.User?.Id! < 1) {
            this.Logger.debug(`SessionAuthenticationStrategy.authenticate with Session User empty`)
            throw new HttpErrors.Unauthorized(`Invalid session`)
        }
        this.Logger.debug(`SessionAuthenticationStrategy.authenticate with Session User as:- (${JSON.stringify(req.session.User)}`)
        if (req.session.LastAccessedTime) {
            req.session.PreviousAccessedTime = req.session.LastAccessedTime
        }
        req.session.LastAccessedTime = new Date(Date.now()).toUTCString()
        req.session.User[securityId] = '' + req.session.User.Id
        this.Logger.debug(`SessionAuthenticationStrategy.authenticate Session as:- (${JSON.stringify(req.session)}`)
        return req.session.User!
    }
}
