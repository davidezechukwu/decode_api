import {BindingKey, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise} from '@loopback/core'
import {RestBindings} from '@loopback/rest'


/**
 * This class will be bound to the application as an `Interceptor` during `boot`
 */
export class RequestValidatorInterceptor implements Provider<Interceptor> {
    static BINDING_KEY = BindingKey.create<RequestValidatorInterceptor>('interceptor.RequestValidatorInterceptor')
    /*
	constructor() {}
	*/

    /**
     * This method is used by LoopBack context to produce an interceptor function for the binding.
     *
     * @returns An interceptor function
     */
    // eslint-disable-next-line
    value() {
        return this.intercept.bind(this)
    }

    /**
     * The logic to intercept an invocation     
     */
    // eslint-disable-next-line
    async intercept(invocationCtx: InvocationContext, next: () => ValueOrPromise<InvocationResult>) {
        try {            
            const errors: string[] = []           
            const request = await invocationCtx.get(RestBindings.Http.REQUEST, {optional: true})
            if (!request) {                
                return next()
            }
            switch (request!.method.toUpperCase()) {
                case 'PATCH':
                    //let _id: ModelIdType | undefined = undefined
                    //if (IsModelIdTypeNumeric) {
                    //    _id = parseInt((invocationCtx?.source?.value as any)?.pathParams?.id) as unknown as ModelIdType
                    //} else {
                    //    _id = (invocationCtx?.source?.value as any)?.pathParams?.id
                    //}                    
                    break
                case 'PUT':                    
                    //let id: ModelIdType
                    //if (IsModelIdTypeNumeric) {
                    //    id = parseInt((invocationCtx?.source?.value as any)?.pathParams?.id) as unknown as ModelIdType
                    //} else {
                    //    id = (invocationCtx?.source?.value as any)?.pathParams?.id
                    //}         
                    break
                default:
                    break
            }

            if (errors.length > 0) {
                throw new Error(errors.join('\n'))
            }
            const result = await next()
            // Add post-invocation logic here
            return result
        } catch (err) {
            // Add error handling logic here
            throw err
        }
    }
}
