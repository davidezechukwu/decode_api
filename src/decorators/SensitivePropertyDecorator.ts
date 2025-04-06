/**
 * Decorator which marks a property as being sensitive, i.e password
 * */
export function SensitivePropertyDecorator(target: any, propertyKey: any) {
	const metadataKey = `sensitive:${propertyKey}`
	const metadataValue = true
	return Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey)
}