BEGIN
	DECLARE @UserId INT = 1
	SELECT
		'User',
		Security.Users.Id, 
		Security.Users.IsDeleted, 
		Security.Users.CreatedById, 
		Security.Users.CreatedOn, 
		Security.Users.UpdatedById, 
		Security.Users.UpdatedOn, 
		Security.Users.ValidFrom, 
		Security.Users.ValidTo
	FROM Security.Users
	WHERE Security.Users.Id = @UserId


	SELECT
		'UserPhotos',
		Security.UserPhotos.Id,
		Security.UserPhotos.URL, 
		Security.UserPhotos.PhotoTypeId, 		
		Security.UserPhotos.Position, 		
		Taxonomy.Lookups.Name AS PhoneType,
		Taxonomy.LookupCategories.Name AS Category,
		Taxonomy.LookupCategories.Id AS CategoryID
	FROM Security.Users
	INNER JOIN Security.UserPhotos ON Security.UserPhotos.UserId = Security.Users.Id
	INNER JOIN Taxonomy.Lookups ON Taxonomy.Lookups.Id = Security.UserPhotos.PhotoTypeId
	INNER JOIN Taxonomy.LookupCategories ON Taxonomy.LookupCategories.Id = Taxonomy.Lookups.LookupCategoryId
	WHERE Security.Users.Id = @UserId
	

	SELECT
		'UserEmailAddresses',
		Security.UserEmailAddresses.Id,
		Security.UserEmailAddresses.EmailAddress, 
		Security.UserEmailAddresses.EmailTypeId,         
		Taxonomy.Lookups.Name AS EmailType,
		Taxonomy.LookupCategories.Name AS Category,
		Taxonomy.LookupCategories.Id AS CategoryID
	FROM Security.Users
	INNER JOIN Security.UserEmailAddresses ON Security.UserEmailAddresses.UserId = Security.Users.Id
	INNER JOIN Taxonomy.Lookups ON Taxonomy.Lookups.Id = Security.UserEmailAddresses.EmailTypeId
	INNER JOIN Taxonomy.LookupCategories ON Taxonomy.LookupCategories.Id = Taxonomy.Lookups.LookupCategoryId
	WHERE Security.Users.Id = @UserId

	SELECT 
		'UserProfiles',
		Security.UserProfiles.Id, 
		Security.UserProfiles.ShowBackgroundVideo, 
		Security.UserProfiles.DisableAnimations, 
		Security.UserProfiles.IsOnLowSpeedConnection, 
		Security.UserProfiles.DisplayName, 
		Security.UserProfiles.LanguageId, 
		Security.UserProfiles.ThemeId, 
		Security.UserProfiles.UserId,
		l1.Name AS [Language],
		lc1.Name AS Category1,
		lc1.Id AS CategoryID1,
		l2.Name AS Theme,
		lc2.Name AS Category2,
		lc2.Id AS CategoryID2
	FROM Security.Users
	INNER JOIN Security.UserProfiles ON Security.UserProfiles.UserId = Security.Users.Id
	INNER JOIN Taxonomy.Lookups AS l1 ON l1.Id = Security.UserProfiles.LanguageId
	INNER JOIN Taxonomy.LookupCategories AS lc1 ON lc1.Id = l1.LookupCategoryId
	INNER JOIN Taxonomy.Lookups AS l2 ON l2.Id = Security.UserProfiles.ThemeId
	INNER JOIN Taxonomy.LookupCategories AS lc2 ON lc2.Id = l2.LookupCategoryId
	WHERE Security.Users.Id = @UserId	

	SELECT	
		'UserWebLinks',
		Security.UserWebLinks.Id,		
		Security.UserWebLinks.URL, 
		Security.UserWebLinks.Position,
		Security.UserWebLinks.ProviderLookupId,
		Taxonomy.Lookups.Name AS [Provider],
		Taxonomy.LookupCategories.Name AS Category,
		Taxonomy.LookupCategories.Id AS CategoryID
	FROM Security.Users
	INNER JOIN Security.UserWebLinks ON Security.UserWebLinks.UserId = Security.Users.Id
	INNER JOIN Taxonomy.Lookups ON Taxonomy.Lookups.Id = Security.UserWebLinks.ProviderLookupId
	INNER JOIN Taxonomy.LookupCategories ON Taxonomy.LookupCategories.Id = Taxonomy.Lookups.LookupCategoryId
	WHERE Security.Users.Id = @UserId
	
	SELECT
		'UserLogons',
		Security.UserLogons.Id, 
		Security.UserLogons.UserId, 		
		Security.UserLogons.Position, 
		Security.UserLogons.ProviderUserName, 
		Security.UserLogons.ProviderUserId, 
		Security.UserLogons.ProviderId,		
		Taxonomy.Lookups.Name AS [Provider],
		Taxonomy.LookupCategories.Name AS Category,
		Taxonomy.LookupCategories.Id AS CategoryID
	FROM Security.Users
	INNER JOIN Security.UserLogons ON Security.UserLogons.UserId = Security.Users.Id
	INNER JOIN Taxonomy.Lookups ON Taxonomy.Lookups.Id = Security.UserLogons.ProviderId
	INNER JOIN Taxonomy.LookupCategories ON Taxonomy.LookupCategories.Id = Taxonomy.Lookups.LookupCategoryId
	WHERE Security.Users.Id = @UserId

	SELECT
		'UserNames',
		Security.UserNames.Id,
		Security.UserNames.UserId, 
		Security.UserNames.Title, 
		Security.UserNames.DisplayName, 		 
		Security.UserNames.FirstName, 
		Security.UserNames.MiddleName, 
		Security.UserNames.LastName, 
		Security.UserNames.NickName				
	FROM Security.Users
	INNER JOIN Security.UserNames ON Security.UserNames.UserId = Security.Users.Id
	WHERE Security.Users.Id = @UserId
	
	SELECT
		'UserPhoneNumbers',		
		Security.UserPhoneNumbers.Id,
		Security.UserPhoneNumbers.PhoneNumber, 
		Security.UserPhoneNumbers.LocationId, 
		Security.UserPhoneNumbers.Position,
		Security.UserPhoneNumbers.PhoneTypeId,
		Taxonomy.Lookups.Name AS [Provider],
		Taxonomy.LookupCategories.Name AS Category,
		Taxonomy.LookupCategories.Id AS CategoryID
	FROM Security.Users
	INNER JOIN Security.UserPhoneNumbers ON Security.UserPhoneNumbers.UserId = Security.Users.Id
	INNER JOIN Taxonomy.Lookups ON Taxonomy.Lookups.Id = Security.UserPhoneNumbers.PhoneTypeId
	INNER JOIN Taxonomy.LookupCategories ON Taxonomy.LookupCategories.Id = Taxonomy.Lookups.LookupCategoryId
	WHERE Security.Users.Id = @UserId

	
	SELECT
		'UserNotifications',
		Security.UserNotifications.Id,
		Security.UserNotifications.UserId, 		
		Security.UserNotifications.LanguageId, 
		Security.UserNotifications.NotificationStatusId,
		Security.UserNotifications.NotificationTransportId, 		
		Security.UserNotifications.Retries, 
		Security.UserNotifications.ResponseBody, 
		Security.UserNotifications.ResponseCode, 
		Security.UserNotifications.Parameters, 
		Security.UserNotifications.Message, 
		Security.UserNotifications.Subject, 
		Security.UserNotifications.FromName, 
		Security.UserNotifications.[From], 
		Security.UserNotifications.[To], 
		Security.UserNotifications.ParentId, 		
		l1.Name AS [Language],
		lc1.Name AS Category1,
		lc1.Id AS CategoryID1,
		l2.Name AS NotificationStatus,
		lc2.Name AS Category2,
		lc2.Id AS CategoryID2,
		l3.Name AS NotificationTransportId,
		lc3.Name AS Category3,
		lc3.Id AS CategoryID3
	FROM Security.Users
	INNER JOIN Security.UserNotifications ON Security.UserNotifications.UserId = Security.Users.Id
	INNER JOIN Taxonomy.Lookups AS l1 ON l1.Id = Security.UserNotifications.LanguageId
	INNER JOIN Taxonomy.LookupCategories AS lc1 ON lc1.Id = l1.LookupCategoryId
	INNER JOIN Taxonomy.Lookups AS l2 ON l2.Id = Security.UserNotifications.NotificationStatusId
	INNER JOIN Taxonomy.LookupCategories AS lc2 ON lc2.Id = l2.LookupCategoryId
	INNER JOIN Taxonomy.Lookups AS l3 ON l3.Id = Security.UserNotifications.NotificationTransportId
	INNER JOIN Taxonomy.LookupCategories AS lc3 ON lc3.Id = l3.LookupCategoryId
	WHERE Security.Users.Id = @UserId

	SELECT 
		'UserPasswords',
		Security.UserPasswords.PasswordStrength, 
		Security.UserPasswords.PasswordSalt, 
		Security.UserPasswords.PasswordHash, 
		Security.UserPasswords.UserId, 
		Security.UserPasswords.Id
   	FROM Security.Users
	INNER JOIN Security.UserPasswords ON Security.UserPasswords.UserId = Security.Users.Id
	WHERE Security.Users.Id = @UserId
	
	SELECT
		'UserGroups',
		Security.UserGroups.Id,
		Security.UserGroups.GroupId, 
		Security.UserGroups.UserId,
		Security.Groups.Id AS GroupId, 
		Security.Groups.Name AS GroupName,
		Security.Groups.DisplayName, 				
		Security.Groups.IsSystem
	FROM Security.Users
	INNER JOIN Security.UserGroups ON Security.UserGroups.UserId = Security.Users.Id
	INNER JOIN Security.Groups ON Security.Groups.Id = Security.UserGroups.GroupId
	WHERE Security.Users.Id = @UserId	

	SELECT		
		'UserGroupRoles',
		Security.UserGroupRoles.Id, 
		Security.UserGroupRoles.RoleId,
		Security.UserGroupRoles.UserGroupId,
		Security.Roles.Id AS RoleId, 
		Security.Roles.Name AS RoleName,
		Security.Groups.Id AS GroupId, 
		Security.Groups.Name AS GroupName,
		Security.Groups.DisplayName, 				
		Security.Groups.IsSystem
	FROM Security.Users
	INNER JOIN Security.UserGroups ON Security.UserGroups.UserId = Security.Users.Id
	INNER JOIN Security.UserGroupRoles ON Security.UserGroupRoles.UserGroupId = Security.UserGroups.Id
	INNER JOIN Security.Roles ON Security.Roles.Id = Security.UserGroupRoles.RoleId 
	INNER JOIN Security.Groups ON Security.Groups.Id = Security.UserGroups.GroupId
	WHERE Security.Users.Id = @UserId		
			
END