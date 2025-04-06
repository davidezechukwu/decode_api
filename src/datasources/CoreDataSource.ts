import {BindingKey, config, lifeCycleObserver, LifeCycleObserver, injectable, ContextTags} from '@loopback/core'
import {juggler} from '@loopback/repository'

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
@injectable({tags: {[ContextTags.KEY]: CoreDataSource.BINDING_KEY.key}})
export class CoreDataSource extends juggler.DataSource implements LifeCycleObserver {
    static readonly BINDING_KEY = BindingKey.create<CoreDataSource>(`datasources.${CoreDataSource.name}`)

    constructor(
        @config()
        dsConfig: object
    ) {
        super(dsConfig)
    }
}
