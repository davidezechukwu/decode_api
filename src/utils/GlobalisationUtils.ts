/**
 * Globalisation utilities
 * */
export class GlobalisationUtils {
	/**
	 * Calculate the difference between two dates in days
	 * */
	public static CalcDatesDiffInDays(date1: Date | string, date2: Date | string): number {
		let date1Temp: Date = new Date()
		let date2Temp: Date = new Date()
		if (typeof(date1) !== 'string') {
			date1Temp = date1
		} else {
			date1Temp = new Date(date1)
		}
		if (typeof (date2) !== 'string') {
			date2Temp = date2 
		} else {
			date2Temp = new Date(date2)
		}
		const diffTime = Math.abs(date2Temp.getTime() - date1Temp.getTime())
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
		return diffDays
	}
}
