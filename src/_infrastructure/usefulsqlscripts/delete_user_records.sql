BEGIN
	BEGIN TRANSACTION
	BEGIN TRY       
		DECLARE @userId INT = 7

		DELETE FROM Security.UserWebLinks
		WHERE UserId = @userId

		DELETE FROM Security.UserPhotos
		WHERE UserId = @userId

		DELETE FROM Security.UserPhoneNumbers
		WHERE UserId = @userId

		DELETE FROM Security.UserPasswords
		WHERE UserId = @userId

		DELETE FROM Security.UserNames
		WHERE UserId = @userId

		DELETE FROM Security.UserEmailAddresses
		WHERE UserId = @userId

		DELETE FROM Security.UserNotifications
		WHERE UserId = @userId

		DELETE FROM Security.UserLogons
		WHERE UserId = @userId

		DELETE FROM Security.UserProfiles
		WHERE UserId = @userId	

		DELETE FROM Security.UserGroupRoles
		WHERE UserGroupId IN (SELECT Id FROM Security.UserGroups WHERE UserId = @userId )

		DELETE FROM Security.UserGroups
		WHERE UserId = @userId	

		DELETE FROM Security.Users
		WHERE Id = @userId	

		COMMIT TRANSACTION
	END TRY  
	BEGIN CATCH  
		ROLLBACK TRANSACTION
	END CATCH  
END