/**The status of the (mostly) async notification calls */
export enum NOTIFICATION_STATUS {
	PENDING = -1,
	FAILED = 0,		
	ACKNOWLEDGED = 1,
	INVALID = 2,
	SUCCEEDED = 3,
}
