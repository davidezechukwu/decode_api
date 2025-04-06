import {inject} from '@loopback/core'
import {AuthenticationStrategy} from '@loopback/authentication'
import {StrategyAdapter} from '@loopback/authentication-passport'
import {UserProfile} from '@loopback/security'
import {RedirectRoute, Request} from '@loopback/rest'
import {UserModel} from '../../../models'
import {LoggingBindings, WinstonLogger} from '@loopback/logging'

/**
 * The base class for all authentication strategy providers
 * */
export abstract class SuperAuthenticationStrategy implements AuthenticationStrategy {
    @inject(LoggingBindings.WINSTON_LOGGER)
    protected Logger: WinstonLogger
    /**
     * Super class for [Loopback4 Authentication strategies](https://loopback.io/doc/en/lb4/Authentication-component-strategy.html)
     */
    constructor(
        public readonly name: string,
        protected StrategyAdapter: StrategyAdapter<UserModel> | null
    ) {}

    /**
     * AuthenticationStrategy.authenticate implementation     
     */
    // eslint-disable-next-line
    async authenticate(request: Request): Promise<UserProfile | RedirectRoute | undefined> {
        if (this.StrategyAdapter) {
            return this.StrategyAdapter.authenticate(request)
        }
        throw new Error('invalid state')
    }
}
