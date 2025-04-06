import {Binding, BindingScope} from '@loopback/core'

export class SuperBindings {
    static readonly PACKAGE_JSON_BINDING = Binding.bind(`configuration.PackageJSON`).inScope(BindingScope.SINGLETON).tag('configuration')
    static readonly OAUTH_STRATEGY_BINDING_KEY = 'passport.authentication.oauth2.strategy'
    static readonly ConfigurationTypeBindingKey = Binding.bind(`configuration.Application`).inScope(BindingScope.APPLICATION).tag('configuration')
    static readonly AuthenticationServiceBindingKey = Binding.bind(`services.AuthenticationService`).inScope(BindingScope.TRANSIENT).tag(`services`)
    static readonly UserServiceBindingKey = Binding.bind(`services.UserService`).inScope(BindingScope.TRANSIENT).tag(`services`)
    static readonly LookupServiceBindingKey = Binding.bind(`services.LookupServiceBindingKey`).inScope(BindingScope.TRANSIENT).tag(`services`)
	static readonly NotificationServiceBindingKey = Binding.bind(`services.NotificationService`).inScope(BindingScope.TRANSIENT).tag(`services`)	
}
