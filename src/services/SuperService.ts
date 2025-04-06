import {inject} from '@loopback/core'
import {LoggingBindings, WinstonLogger} from '@loopback/logging'
import {ConfigurationType} from '../Configuration'
import {SuperBindings} from '../SuperBindings'

export class SuperService {
    @inject(LoggingBindings.WINSTON_LOGGER) protected Logger: WinstonLogger
    @inject(SuperBindings.ConfigurationTypeBindingKey.key) protected Configuration: ConfigurationType

    constructor() {}
}
