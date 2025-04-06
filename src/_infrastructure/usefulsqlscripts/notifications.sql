USE [decodedb]
BEGIN
	UPDATE [decode].[Security].[UserNotifications]
	SET NotificationStatusId = 50


	SELECT TOP (1000) 
	  un.[Id],
      --un.[IsDeleted],
      --un.[CreatedById],
      --un.[CreatedOn],
      --un.[UpdatedById],
      --un.[UpdatedOn],
      --un.[ValidFrom],
      --un.[ValidTo],
      un.[UserId],
      un.[LanguageId],
      un.[NotificationTransportId],
	  lt.[OfficialName] AS [Notification Transport],
      un.[NotificationStatusId],
	  ls.[OfficialName] AS [Notification Status],
      un.[ParentId],
      un.[To],
      un.[From],
      un.[FromName],
      un.[Subject],
      un.[Message],
      un.[Parameters],
      un.[ResponseCode],
      un.[ResponseBody],
      un.[Retries]
	FROM [Security].[UserNotifications] AS un
	INNER JOIN [Taxonomy].Lookups AS ls ON ls.Id = un.NotificationStatusId
	INNER JOIN [Taxonomy].Lookups AS lt ON lt.Id = un.NotificationTransportId	
		
END