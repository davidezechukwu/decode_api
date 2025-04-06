USE [decodedb]
BEGIN
	SELECT
		  usr.[Id],
		  usr.[UserGroupId],
		  g.[Id] AS [GroupId],
		  g.[Name] AS [GroupName],
		  --g.[DisplayName],
		  usr.[RoleId] AS [RoleId],	  
		  r.[Name] AS [RoleName]
		  --r.[DisplayName]
	  FROM [Security].[UserGroupRoles] AS usr
	  INNER JOIN [Security].[UserGroups] AS ug ON ug.Id = usr.UserGroupId
	  INNER JOIN [Security].[Groups] AS g ON g.Id = ug.GroupId
	  INNER JOIN [Security].[Roles] AS r ON r.Id = usr.RoleId
	  ORDER BY g.[Name] ASC, r.[Name] ASC


  END
