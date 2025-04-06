import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer, AuthorizationRequest} from '@loopback/authorization'
import {Provider, inject, BindingKey} from '@loopback/core'
import * as casbin from 'casbin'
import path from 'path'
import {Configuration} from '../../Configuration'
import {SuperService} from '../SuperService'
import {UserService} from '../user/UserService'
import {SuperBindings} from '../../SuperBindings'

/**
 * Cache of previously loaded enforces
 * */
const Enforcers: {[key: string]: casbin.Enforcer | undefined} = {}

/**
 * The casbin handling service
 * */
export class CasbinService extends SuperService implements Provider<Authorizer> {
    static BINDING_KEY = BindingKey.create<CasbinService>(`services.${CasbinService.name}`)
    public static HttpDefaultScope = 'Get'
    public static HttpGetScope = 'Get'
    public static HttpGetAllScope = 'GetAll'
    public static HttpPostScope = 'Post'
    public static HttpDeleteScope = 'Delete'
    public static HttpPutScope = 'Put'
    public static HttpPatchScope = 'Patch'
    public static HttpPatchAllScope = 'PatchAll'

    public constructor(
        @inject('casbin.enforcer.factory')
        protected EnforcerFactory: (name: string) => Promise<casbin.Enforcer>,
        @inject(SuperBindings.UserServiceBindingKey.key)
        protected UserService: UserService
    ) {
        super()
    }

    /**
     * @returns an authorizer function
     *
     */
    // eslint-disable-next-line
    public value(): Authorizer {
        return this.authorize.bind(this)
    }

    /**
     * The method called by Loopback's sequence' to authorize a request
     * */
    // eslint-disable-next-line
    public async authorize(authorizationContext: AuthorizationContext, metadata: AuthorizationMetadata) {
        let permittedGroup = ''
        let permittedRole = ''
        const userId = authorizationContext.principals[0].Id
        const userGroupAndRoles = await this.UserService.GetUserGroupsAndRoles({Id: userId})
        const serverMethod = authorizationContext.resource.replace('.prototype', '')
        const object =
            metadata.resource ??
            authorizationContext.invocationContext.methodName.replace(metadata.scopes?.[0]!, '') ??
            serverMethod.substring(serverMethod.indexOf(`.${CasbinService.HttpGetScope}`) + `.${CasbinService.HttpGetScope}`.length)
        const action = metadata.scopes?.[0] ?? CasbinService.HttpDefaultScope
        const debugResult = (allowed?: boolean) => {
            if (allowed) {
                return 'AuthorizationDecision.ALLOW'
            } else if (allowed === false) {
                return 'AuthorizationDecision.DENY'
            }
            return 'AuthorizationDecision.ABSTAIN'
        }

        let allow: boolean | undefined = undefined
        for (const userGroupAndRole of userGroupAndRoles) {
            const request: AuthorizationRequest = {subject: userGroupAndRole.Role.Name, object, action, domain: userGroupAndRole.Group.Name}
            this.Logger.debug(`CasbinService: Group(${userGroupAndRole.Group.Name}) Role(${userGroupAndRole.Role.Name}) Object(${object}) Action(${action}) Result(pending...)`)
            const enforcer = await this.EnforcerFactory(userGroupAndRole.Role.Name)
            allow = await enforcer.enforce(request.subject, request.object, request.action, request.domain)
            if (allow) {
                permittedGroup = userGroupAndRole.Group.Name
                permittedRole = userGroupAndRole.Role.Name
                break
            }
            if (allow) {
                break
            }
        }

        if (allow) {
            this.Logger.debug(`CasbinService: Group(${permittedGroup})  Role(${permittedRole}) Object(${object}) Action(${action}) Result(${debugResult(allow)})`)
            return AuthorizationDecision.ALLOW
        } else if (allow === false) {
            this.Logger.debug(`CasbinService: Object(${object}) Action(${action}) Result(${debugResult(allow)})`)
            return AuthorizationDecision.DENY
        }

        this.Logger.debug(`CasbinService: Object(${object}) Action(${action}) Result(${debugResult(allow)})`)
        return AuthorizationDecision.ABSTAIN
    }

    /**
     * Get a Casbin Enforcer based on a role
     * @remarks
     * The role determines the Casbin policy file
     * */
    public static async GetCasbinEnforcerByRole(role: string): Promise<casbin.Enforcer | undefined> {
        const casbinPolicyFile = path.join(Configuration.fixtures.casbinPath, `rbac_policy_${role}.csv`)
        return CasbinService.CreateCasbinEnforcerByRole(casbinPolicyFile)
    }

    /**
     * Load a Casbin Enforcer based on roles and groups
     * */
    protected static async CreateCasbinEnforcerByRole(policyPath: string): Promise<casbin.Enforcer> {
        const conf = path.join(Configuration.fixtures.casbinPath, 'rbac_model.conf')
        const policy = path.resolve(__dirname, policyPath)
        const cacheKey = conf + policy
        if (Enforcers[cacheKey]) {
            return Enforcers[cacheKey]!
        }

        const enforcer = await casbin.newEnforcer(conf, policy)
        Enforcers[cacheKey] = enforcer
        return enforcer
    }
}
