/*    ==Scripting Parameters==

    Source Server Version : SQL Server 2022 (16.0.1135)
    Source Database Engine Edition : Microsoft SQL Server Enterprise Edition
    Source Database Engine Type : Standalone SQL Server

    Target Server Version : SQL Server 2022
    Target Database Engine Edition : Microsoft SQL Server Enterprise Edition
    Target Database Engine Type : Standalone SQL Server
*/

USE [MNC]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserWebLinks]') AND type in (N'U'))
ALTER TABLE [UserData].[UserWebLinks] DROP CONSTRAINT IF EXISTS [fk_UserWebLinks_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserWebLinks]') AND type in (N'U'))
ALTER TABLE [UserData].[UserWebLinks] DROP CONSTRAINT IF EXISTS [fk_UserData_UserWebLinks_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserWebLinks]') AND type in (N'U'))
ALTER TABLE [UserData].[UserWebLinks] DROP CONSTRAINT IF EXISTS [fk_UserData_UserWebLinks_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[Users]') AND type in (N'U'))
ALTER TABLE [UserData].[Users] DROP CONSTRAINT IF EXISTS [fk_UserData_Users_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[Users]') AND type in (N'U'))
ALTER TABLE [UserData].[Users] DROP CONSTRAINT IF EXISTS [fk_UserData_Users_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPhotos]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPhotos] DROP CONSTRAINT IF EXISTS [fk_UserPhotos_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPhotos]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPhotos] DROP CONSTRAINT IF EXISTS [fk_UserData_UserPhotos_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPhotos]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPhotos] DROP CONSTRAINT IF EXISTS [fk_UserData_UserPhotos_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPhoneNumbers]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPhoneNumbers] DROP CONSTRAINT IF EXISTS [fk_UserPhoneNumbers_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPhoneNumbers]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPhoneNumbers] DROP CONSTRAINT IF EXISTS [fk_UserData_UserPhoneNumbers_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPhoneNumbers]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPhoneNumbers] DROP CONSTRAINT IF EXISTS [fk_UserData_UserPhoneNumbers_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPasswords]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPasswords] DROP CONSTRAINT IF EXISTS [fk_UserPasswords_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPasswords]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPasswords] DROP CONSTRAINT IF EXISTS [fk_UserData_UserPasswords_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserPasswords]') AND type in (N'U'))
ALTER TABLE [UserData].[UserPasswords] DROP CONSTRAINT IF EXISTS [fk_UserData_UserPasswords_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserNotifications_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserNotifications_ParentId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserNotifications_NotificationStrategyId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserNotifications_NotificationStatusId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserNotifications_LanguageId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserNotifications_ImportanceId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserData_UserNotification_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNotifications]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNotifications] DROP CONSTRAINT IF EXISTS [fk_UserData_UserNotification_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNames]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNames] DROP CONSTRAINT IF EXISTS [fk_UserNames_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNames]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNames] DROP CONSTRAINT IF EXISTS [fk_UserData_UserNames_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserNames]') AND type in (N'U'))
ALTER TABLE [UserData].[UserNames] DROP CONSTRAINT IF EXISTS [fk_UserData_UserNames_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogons]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogons] DROP CONSTRAINT IF EXISTS [fk_UserLogons_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogons]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogons] DROP CONSTRAINT IF EXISTS [fk_UserLogons_ProviderId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogons]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogons] DROP CONSTRAINT IF EXISTS [fk_UserData_UserLogons_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogons]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogons] DROP CONSTRAINT IF EXISTS [fk_UserData_UserLogons_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogins]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogins] DROP CONSTRAINT IF EXISTS [fk_UserLogins_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogins]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogins] DROP CONSTRAINT IF EXISTS [fk_UserLogins_LocationId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogins]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogins] DROP CONSTRAINT IF EXISTS [fk_UserData_UserLogins_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserLogins]') AND type in (N'U'))
ALTER TABLE [UserData].[UserLogins] DROP CONSTRAINT IF EXISTS [fk_UserData_UserLogins_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroups]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroups] DROP CONSTRAINT IF EXISTS [fk_UserGroups_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroups]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroups] DROP CONSTRAINT IF EXISTS [fk_UserGroups_GroupId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroups]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroups] DROP CONSTRAINT IF EXISTS [fk_UserData_UserGroups_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroups]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroups] DROP CONSTRAINT IF EXISTS [fk_UserData_UserGroups_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroupRoles]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroupRoles] DROP CONSTRAINT IF EXISTS [fk_UserGroupRoles_UserGroupId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroupRoles]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroupRoles] DROP CONSTRAINT IF EXISTS [fk_UserGroupRoles_RoleId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroupRoles]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroupRoles] DROP CONSTRAINT IF EXISTS [fk_UserData_UserGroupRoles_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserGroupRoles]') AND type in (N'U'))
ALTER TABLE [UserData].[UserGroupRoles] DROP CONSTRAINT IF EXISTS [fk_UserData_UserGroupRoles_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserEmailAddresses]') AND type in (N'U'))
ALTER TABLE [UserData].[UserEmailAddresses] DROP CONSTRAINT IF EXISTS [fk_UserEmailAddresses_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserEmailAddresses]') AND type in (N'U'))
ALTER TABLE [UserData].[UserEmailAddresses] DROP CONSTRAINT IF EXISTS [fk_UserEmailAddress_EmailAddressTypeId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserEmailAddresses]') AND type in (N'U'))
ALTER TABLE [UserData].[UserEmailAddresses] DROP CONSTRAINT IF EXISTS [fk_UserData_UserEmailAddresses_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserEmailAddresses]') AND type in (N'U'))
ALTER TABLE [UserData].[UserEmailAddresses] DROP CONSTRAINT IF EXISTS [fk_UserData_UserEmailAddresses_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserDisplaySettings]') AND type in (N'U'))
ALTER TABLE [UserData].[UserDisplaySettings] DROP CONSTRAINT IF EXISTS [fk_UserDisplaySettings_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserDisplaySettings]') AND type in (N'U'))
ALTER TABLE [UserData].[UserDisplaySettings] DROP CONSTRAINT IF EXISTS [fk_UserDisplaySettings_ThemeId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserDisplaySettings]') AND type in (N'U'))
ALTER TABLE [UserData].[UserDisplaySettings] DROP CONSTRAINT IF EXISTS [fk_UserDisplaySettings_LanguageId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserDisplaySettings]') AND type in (N'U'))
ALTER TABLE [UserData].[UserDisplaySettings] DROP CONSTRAINT IF EXISTS [fk_UserData_UserDisplaySettings_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserDisplaySettings]') AND type in (N'U'))
ALTER TABLE [UserData].[UserDisplaySettings] DROP CONSTRAINT IF EXISTS [fk_UserData_UserDisplaySettings_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserCommunicationPreferences]') AND type in (N'U'))
ALTER TABLE [UserData].[UserCommunicationPreferences] DROP CONSTRAINT IF EXISTS [fk_UserData_UserCommunicationPreferences_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserCommunicationPreferences]') AND type in (N'U'))
ALTER TABLE [UserData].[UserCommunicationPreferences] DROP CONSTRAINT IF EXISTS [fk_UserData_UserCommunicationPreferences_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[UserData].[UserCommunicationPreferences]') AND type in (N'U'))
ALTER TABLE [UserData].[UserCommunicationPreferences] DROP CONSTRAINT IF EXISTS [fk_UserCommunicationPreferencess_UserId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Taxonomy].[Lookups]') AND type in (N'U'))
ALTER TABLE [Taxonomy].[Lookups] DROP CONSTRAINT IF EXISTS [fk_Taxonomy_Lookups_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Taxonomy].[Lookups]') AND type in (N'U'))
ALTER TABLE [Taxonomy].[Lookups] DROP CONSTRAINT IF EXISTS [fk_Taxonomy_Lookups_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Taxonomy].[Lookups]') AND type in (N'U'))
ALTER TABLE [Taxonomy].[Lookups] DROP CONSTRAINT IF EXISTS [fk_Lookups_LookupCategoryId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Taxonomy].[LookupCategories]') AND type in (N'U'))
ALTER TABLE [Taxonomy].[LookupCategories] DROP CONSTRAINT IF EXISTS [fk_Taxonomy_LookupCategories_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Taxonomy].[LookupCategories]') AND type in (N'U'))
ALTER TABLE [Taxonomy].[LookupCategories] DROP CONSTRAINT IF EXISTS [fk_Taxonomy_LookupCategories_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[Roles]') AND type in (N'U'))
ALTER TABLE [Security].[Roles] DROP CONSTRAINT IF EXISTS [fk_Security_Roles_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[Roles]') AND type in (N'U'))
ALTER TABLE [Security].[Roles] DROP CONSTRAINT IF EXISTS [fk_Security_Roles_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[Groups]') AND type in (N'U'))
ALTER TABLE [Security].[Groups] DROP CONSTRAINT IF EXISTS [fk_Security_Groups_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[Groups]') AND type in (N'U'))
ALTER TABLE [Security].[Groups] DROP CONSTRAINT IF EXISTS [fk_Security_Groups_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_Security_GroupNotifications_ParentId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_Security_GroupNotifications_NotificationStrategyId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_Security_GroupNotifications_LanguageId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_Security_GroupNotifications_GroupId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_Security_GroupNotifications_UpdatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_Security_GroupNotifications_CreatedById]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_GroupNotifications_NotificationStatusId]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Security].[GroupNotifications]') AND type in (N'U'))
ALTER TABLE [Security].[GroupNotifications] DROP CONSTRAINT IF EXISTS [fk_GroupNotifications_ImportanceId]
GO
/****** Object:  Table [UserData].[UserWebLinks]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserWebLinks]
GO
/****** Object:  Table [UserData].[Users]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[Users]
GO
/****** Object:  Table [UserData].[UserPhotos]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserPhotos]
GO
/****** Object:  Table [UserData].[UserPhoneNumbers]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserPhoneNumbers]
GO
/****** Object:  Table [UserData].[UserPasswords]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserPasswords]
GO
/****** Object:  Table [UserData].[UserNotifications]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserNotifications]
GO
/****** Object:  Table [UserData].[UserNames]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserNames]
GO
/****** Object:  Table [UserData].[UserLogons]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserLogons]
GO
/****** Object:  Table [UserData].[UserLogins]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserLogins]
GO
/****** Object:  Table [UserData].[UserGroups]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserGroups]
GO
/****** Object:  Table [UserData].[UserGroupRoles]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserGroupRoles]
GO
/****** Object:  Table [UserData].[UserEmailAddresses]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserEmailAddresses]
GO
/****** Object:  Table [UserData].[UserDisplaySettings]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserDisplaySettings]
GO
/****** Object:  Table [UserData].[UserCommunicationPreferences]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [UserData].[UserCommunicationPreferences]
GO
/****** Object:  Table [Taxonomy].[Lookups]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [Taxonomy].[Lookups]
GO
/****** Object:  Table [Taxonomy].[LookupCategories]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [Taxonomy].[LookupCategories]
GO
/****** Object:  Table [Security].[Roles]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [Security].[Roles]
GO
/****** Object:  Table [Security].[Groups]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [Security].[Groups]
GO
/****** Object:  Table [Security].[GroupNotifications]    Script Date: 21/03/2025 02:03:32 ******/
DROP TABLE IF EXISTS [Security].[GroupNotifications]
GO
/****** Object:  Schema [UserData]    Script Date: 21/03/2025 02:03:32 ******/
DROP SCHEMA IF EXISTS [UserData]
GO
/****** Object:  Schema [Taxonomy]    Script Date: 21/03/2025 02:03:32 ******/
DROP SCHEMA IF EXISTS [Taxonomy]
GO
/****** Object:  Schema [Security]    Script Date: 21/03/2025 02:03:32 ******/
DROP SCHEMA IF EXISTS [Security]
GO
/****** Object:  Schema [Security]    Script Date: 21/03/2025 02:03:32 ******/
CREATE SCHEMA [Security]
GO
/****** Object:  Schema [Taxonomy]    Script Date: 21/03/2025 02:03:32 ******/
CREATE SCHEMA [Taxonomy]
GO
/****** Object:  Schema [UserData]    Script Date: 21/03/2025 02:03:32 ******/
CREATE SCHEMA [UserData]
GO
/****** Object:  Table [Security].[GroupNotifications]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Security].[GroupNotifications](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[GroupId] [int] NULL,
	[LanguageId] [int] NULL,
	[NotificationStrategyId] [int] NULL,
	[NotificationStatusId] [int] NULL,
	[ImportanceId] [int] NULL,
	[ParentId] [int] NULL,
	[To] [nvarchar](max) NOT NULL,
	[From] [nvarchar](max) NULL,
	[FromName] [nvarchar](max) NULL,
	[Subject] [nvarchar](max) NULL,
	[Message] [nvarchar](max) NOT NULL,
	[Parameters] [nvarchar](max) NULL,
	[ResponseCode] [nvarchar](max) NULL,
	[ResponseBody] [nvarchar](max) NULL,
	[Retries] [int] NULL,
 CONSTRAINT [pk_Security_GroupNotifications] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [Security].[Groups]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Security].[Groups](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[Name] [nvarchar](max) NOT NULL,
	[DisplayName] [nvarchar](max) NOT NULL,
	[IsSystem] [bit] NULL,
 CONSTRAINT [pk_Security_Groups] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [Security].[Roles]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Security].[Roles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[Name] [nvarchar](max) NOT NULL,
	[DisplayName] [nvarchar](max) NOT NULL,
	[IsSystem] [bit] NULL,
	[Rank] [int] NOT NULL,
 CONSTRAINT [pk_Security_Roles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [Taxonomy].[LookupCategories]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Taxonomy].[LookupCategories](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[Name] [nvarchar](max) NOT NULL,
	[Value] [nvarchar](max) NOT NULL,
 CONSTRAINT [pk_Taxonomy_LookupCategories] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [Taxonomy].[Lookups]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Taxonomy].[Lookups](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[LookupCategoryId] [int] NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
	[OfficialName] [nvarchar](max) NOT NULL,
	[PluralName] [nvarchar](max) NOT NULL,
	[Value] [nvarchar](max) NULL,
	[OtherValue1] [nvarchar](max) NULL,
	[OtherValue2] [nvarchar](max) NULL,
	[OtherValue3] [nvarchar](max) NULL,
	[OtherValue4] [nvarchar](max) NULL,
	[OtherValue5] [nvarchar](max) NULL,
	[OtherValue6] [nvarchar](max) NULL,
	[OtherValue7] [nvarchar](max) NULL,
	[OtherValue8] [nvarchar](max) NULL,
	[OtherValue9] [nvarchar](max) NULL,
	[OtherValue10] [nvarchar](max) NULL,
	[OtherValue11] [nvarchar](max) NULL,
	[OtherValue12] [nvarchar](max) NULL,
	[OtherValue13] [nvarchar](max) NULL,
	[OtherValue14] [nvarchar](max) NULL,
	[OtherValue15] [nvarchar](max) NULL,
	[Rank] [int] NULL,
 CONSTRAINT [pk_Taxonomy.Lookups] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserCommunicationPreferences]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserCommunicationPreferences](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[UseInApp] [bit] NOT NULL,
	[UseEmail] [bit] NOT NULL,
	[UseSMS] [bit] NOT NULL,
	[UseWhatsApp] [bit] NOT NULL,
	[UseIMessage] [bit] NOT NULL,
 CONSTRAINT [pk_UserData_UserCommunicationPreferences] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserDisplaySettings]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserDisplaySettings](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[LanguageId] [int] NULL,
	[ThemeId] [int] NULL,
	[IsOnLowSpeedConnection] [bit] NOT NULL,
	[DisableAnimations] [bit] NOT NULL,
	[ShowBackgroundVideo] [bit] NOT NULL,
 CONSTRAINT [pk_UserData_UserDisplaySettings] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserEmailAddresses]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserEmailAddresses](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[EmailAddressTypeId] [int] NULL,
	[EmailAddress] [nvarchar](500) NOT NULL,
	[Rank] [int] NULL,
	[Verified] [bit] NULL,
	[VerificationToken] [nvarchar](max) NULL,
	[VerificationRequestedOn] [datetime] NULL,
	[VerificationAttempts] [int] NULL,
 CONSTRAINT [pk_UserData_UserEmailAddresses] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserGroupRoles]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserGroupRoles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserGroupId] [int] NULL,
	[RoleId] [int] NULL,
 CONSTRAINT [pk_UserData_UserGroupRoles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserGroups]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserGroups](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[GroupId] [int] NULL,
 CONSTRAINT [pk_UserData_UserGroups] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserLogins]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserLogins](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[LocationId] [int] NULL,
	[Latitude] [float] NULL,
	[Longitude] [float] NULL,
	[RawUserAgent] [nvarchar](max) NOT NULL,
	[RawClientAddress] [nvarchar](max) NULL,
	[ClientType] [nvarchar](max) NULL,
	[ClientName] [nvarchar](max) NULL,
	[ClientVersion] [nvarchar](max) NULL,
	[ClientEngine] [nvarchar](max) NULL,
	[ClientEngineVersion] [nvarchar](max) NULL,
	[OSName] [nvarchar](max) NULL,
	[OSVersion] [nvarchar](max) NULL,
	[OSPlatform] [nvarchar](max) NULL,
	[DeviceType] [nvarchar](max) NULL,
	[DeviceBrand] [nvarchar](max) NULL,
	[DeviceModel] [nvarchar](max) NULL,
	[Region] [nvarchar](max) NULL,
	[RegionCode] [nvarchar](max) NULL,
	[Postcode] [nvarchar](max) NULL,
	[City] [nvarchar](max) NULL,
	[IPAddress] [nvarchar](max) NULL,
 CONSTRAINT [pk_UserData_UserLogins] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserLogons]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserLogons](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[ProviderId] [int] NULL,
	[ProviderUserId] [nvarchar](max) NOT NULL,
	[ProviderUserName] [nvarchar](max) NULL,
	[Rank] [int] NULL,
 CONSTRAINT [pk_UserData_UserLogons] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserNames]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserNames](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[DisplayName] [nvarchar](500) NULL,
	[Title] [nvarchar](35) NULL,
	[FirstName] [nvarchar](35) NOT NULL,
	[MiddleName] [nvarchar](35) NULL,
	[LastName] [nvarchar](35) NOT NULL,
	[NickName] [nvarchar](35) NULL,
 CONSTRAINT [pk_UserData_UserNames] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserNotifications]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserNotifications](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[LanguageId] [int] NULL,
	[NotificationStrategyId] [int] NULL,
	[NotificationStatusId] [int] NULL,
	[ImportanceId] [int] NULL,
	[ParentId] [int] NULL,
	[To] [nvarchar](max) NOT NULL,
	[From] [nvarchar](max) NULL,
	[FromName] [nvarchar](max) NULL,
	[Subject] [nvarchar](max) NULL,
	[Message] [nvarchar](max) NOT NULL,
	[Parameters] [nvarchar](max) NULL,
	[ResponseCode] [nvarchar](max) NULL,
	[ResponseBody] [nvarchar](max) NULL,
	[Retries] [int] NULL,
 CONSTRAINT [pk_UserData_UserNotifications] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserPasswords]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserPasswords](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[PasswordHash] [nvarchar](max) NOT NULL,
	[PasswordSalt] [nvarchar](max) NOT NULL,
	[PasswordStrength] [int] NOT NULL,
	[FailedAttempts] [int] NOT NULL,
	[ResetToken] [nvarchar](max) NULL,
	[ResetRequestedOn] [datetime] NULL,
	[ResetAttempts] [int] NULL,
 CONSTRAINT [pk_UserData_UserPasswords] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserPhoneNumbers]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserPhoneNumbers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[PhoneTypeId] [int] NULL,
	[LocationId] [int] NULL,
	[PhoneNumber] [nvarchar](28) NOT NULL,
	[Rank] [int] NULL,
	[Verified] [bit] NULL,
	[VerificationToken] [nvarchar](max) NULL,
	[VerificationRequestedOn] [datetime] NULL,
	[VerificationAttempts] [int] NULL,
 CONSTRAINT [pk_UserData_UserPhoneNumbers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserPhotos]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserPhotos](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[PhotoTypeId] [int] NULL,
	[URL] [nvarchar](2000) NOT NULL,
	[Rank] [int] NULL,
 CONSTRAINT [pk_UserData_UserPhotos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [UserData].[Users]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[Users](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
 CONSTRAINT [pk_UserData_Users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [UserData].[UserWebLinks]    Script Date: 21/03/2025 02:03:32 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UserData].[UserWebLinks](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[IsDeleted] [bit] NULL,
	[CreatedById] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[UpdatedById] [int] NULL,
	[UpdatedOn] [datetime] NULL,
	[ValidFrom] [datetime] NULL,
	[ValidTo] [datetime] NULL,
	[UserId] [int] NULL,
	[ProviderLookupId] [int] NULL,
	[URL] [nvarchar](2000) NOT NULL,
	[Rank] [int] NULL,
 CONSTRAINT [pk_UserData_UserWebLinks] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_GroupNotifications_ImportanceId] FOREIGN KEY([ImportanceId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_GroupNotifications_ImportanceId]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_GroupNotifications_NotificationStatusId] FOREIGN KEY([NotificationStatusId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_GroupNotifications_NotificationStatusId]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_Security_GroupNotifications_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_Security_GroupNotifications_CreatedById]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_Security_GroupNotifications_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_Security_GroupNotifications_UpdatedById]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_Security_GroupNotifications_GroupId] FOREIGN KEY([GroupId])
REFERENCES [Security].[Groups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_Security_GroupNotifications_GroupId]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_Security_GroupNotifications_LanguageId] FOREIGN KEY([LanguageId])
REFERENCES [Taxonomy].[Lookups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_Security_GroupNotifications_LanguageId]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_Security_GroupNotifications_NotificationStrategyId] FOREIGN KEY([NotificationStrategyId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_Security_GroupNotifications_NotificationStrategyId]
GO
ALTER TABLE [Security].[GroupNotifications]  WITH CHECK ADD  CONSTRAINT [fk_Security_GroupNotifications_ParentId] FOREIGN KEY([ParentId])
REFERENCES [Security].[GroupNotifications] ([Id])
GO
ALTER TABLE [Security].[GroupNotifications] CHECK CONSTRAINT [fk_Security_GroupNotifications_ParentId]
GO
ALTER TABLE [Security].[Groups]  WITH CHECK ADD  CONSTRAINT [fk_Security_Groups_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Security].[Groups] CHECK CONSTRAINT [fk_Security_Groups_CreatedById]
GO
ALTER TABLE [Security].[Groups]  WITH CHECK ADD  CONSTRAINT [fk_Security_Groups_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Security].[Groups] CHECK CONSTRAINT [fk_Security_Groups_UpdatedById]
GO
ALTER TABLE [Security].[Roles]  WITH CHECK ADD  CONSTRAINT [fk_Security_Roles_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Security].[Roles] CHECK CONSTRAINT [fk_Security_Roles_CreatedById]
GO
ALTER TABLE [Security].[Roles]  WITH CHECK ADD  CONSTRAINT [fk_Security_Roles_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Security].[Roles] CHECK CONSTRAINT [fk_Security_Roles_UpdatedById]
GO
ALTER TABLE [Taxonomy].[LookupCategories]  WITH CHECK ADD  CONSTRAINT [fk_Taxonomy_LookupCategories_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Taxonomy].[LookupCategories] CHECK CONSTRAINT [fk_Taxonomy_LookupCategories_CreatedById]
GO
ALTER TABLE [Taxonomy].[LookupCategories]  WITH CHECK ADD  CONSTRAINT [fk_Taxonomy_LookupCategories_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Taxonomy].[LookupCategories] CHECK CONSTRAINT [fk_Taxonomy_LookupCategories_UpdatedById]
GO
ALTER TABLE [Taxonomy].[Lookups]  WITH CHECK ADD  CONSTRAINT [fk_Lookups_LookupCategoryId] FOREIGN KEY([LookupCategoryId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [Taxonomy].[Lookups] CHECK CONSTRAINT [fk_Lookups_LookupCategoryId]
GO
ALTER TABLE [Taxonomy].[Lookups]  WITH CHECK ADD  CONSTRAINT [fk_Taxonomy_Lookups_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Taxonomy].[Lookups] CHECK CONSTRAINT [fk_Taxonomy_Lookups_CreatedById]
GO
ALTER TABLE [Taxonomy].[Lookups]  WITH CHECK ADD  CONSTRAINT [fk_Taxonomy_Lookups_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [Taxonomy].[Lookups] CHECK CONSTRAINT [fk_Taxonomy_Lookups_UpdatedById]
GO
ALTER TABLE [UserData].[UserCommunicationPreferences]  WITH CHECK ADD  CONSTRAINT [fk_UserCommunicationPreferencess_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserCommunicationPreferences] CHECK CONSTRAINT [fk_UserCommunicationPreferencess_UserId]
GO
ALTER TABLE [UserData].[UserCommunicationPreferences]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserCommunicationPreferences_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserCommunicationPreferences] CHECK CONSTRAINT [fk_UserData_UserCommunicationPreferences_CreatedById]
GO
ALTER TABLE [UserData].[UserCommunicationPreferences]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserCommunicationPreferences_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserCommunicationPreferences] CHECK CONSTRAINT [fk_UserData_UserCommunicationPreferences_UpdatedById]
GO
ALTER TABLE [UserData].[UserDisplaySettings]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserDisplaySettings_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserDisplaySettings] CHECK CONSTRAINT [fk_UserData_UserDisplaySettings_CreatedById]
GO
ALTER TABLE [UserData].[UserDisplaySettings]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserDisplaySettings_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserDisplaySettings] CHECK CONSTRAINT [fk_UserData_UserDisplaySettings_UpdatedById]
GO
ALTER TABLE [UserData].[UserDisplaySettings]  WITH CHECK ADD  CONSTRAINT [fk_UserDisplaySettings_LanguageId] FOREIGN KEY([LanguageId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [UserData].[UserDisplaySettings] CHECK CONSTRAINT [fk_UserDisplaySettings_LanguageId]
GO
ALTER TABLE [UserData].[UserDisplaySettings]  WITH CHECK ADD  CONSTRAINT [fk_UserDisplaySettings_ThemeId] FOREIGN KEY([ThemeId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [UserData].[UserDisplaySettings] CHECK CONSTRAINT [fk_UserDisplaySettings_ThemeId]
GO
ALTER TABLE [UserData].[UserDisplaySettings]  WITH CHECK ADD  CONSTRAINT [fk_UserDisplaySettings_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserDisplaySettings] CHECK CONSTRAINT [fk_UserDisplaySettings_UserId]
GO
ALTER TABLE [UserData].[UserEmailAddresses]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserEmailAddresses_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserEmailAddresses] CHECK CONSTRAINT [fk_UserData_UserEmailAddresses_CreatedById]
GO
ALTER TABLE [UserData].[UserEmailAddresses]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserEmailAddresses_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserEmailAddresses] CHECK CONSTRAINT [fk_UserData_UserEmailAddresses_UpdatedById]
GO
ALTER TABLE [UserData].[UserEmailAddresses]  WITH CHECK ADD  CONSTRAINT [fk_UserEmailAddress_EmailAddressTypeId] FOREIGN KEY([EmailAddressTypeId])
REFERENCES [Taxonomy].[Lookups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserEmailAddresses] CHECK CONSTRAINT [fk_UserEmailAddress_EmailAddressTypeId]
GO
ALTER TABLE [UserData].[UserEmailAddresses]  WITH CHECK ADD  CONSTRAINT [fk_UserEmailAddresses_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserEmailAddresses] CHECK CONSTRAINT [fk_UserEmailAddresses_UserId]
GO
ALTER TABLE [UserData].[UserGroupRoles]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserGroupRoles_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserGroupRoles] CHECK CONSTRAINT [fk_UserData_UserGroupRoles_CreatedById]
GO
ALTER TABLE [UserData].[UserGroupRoles]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserGroupRoles_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserGroupRoles] CHECK CONSTRAINT [fk_UserData_UserGroupRoles_UpdatedById]
GO
ALTER TABLE [UserData].[UserGroupRoles]  WITH CHECK ADD  CONSTRAINT [fk_UserGroupRoles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [Security].[Roles] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserGroupRoles] CHECK CONSTRAINT [fk_UserGroupRoles_RoleId]
GO
ALTER TABLE [UserData].[UserGroupRoles]  WITH CHECK ADD  CONSTRAINT [fk_UserGroupRoles_UserGroupId] FOREIGN KEY([UserGroupId])
REFERENCES [UserData].[UserGroups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserGroupRoles] CHECK CONSTRAINT [fk_UserGroupRoles_UserGroupId]
GO
ALTER TABLE [UserData].[UserGroups]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserGroups_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserGroups] CHECK CONSTRAINT [fk_UserData_UserGroups_CreatedById]
GO
ALTER TABLE [UserData].[UserGroups]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserGroups_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserGroups] CHECK CONSTRAINT [fk_UserData_UserGroups_UpdatedById]
GO
ALTER TABLE [UserData].[UserGroups]  WITH CHECK ADD  CONSTRAINT [fk_UserGroups_GroupId] FOREIGN KEY([GroupId])
REFERENCES [Security].[Groups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserGroups] CHECK CONSTRAINT [fk_UserGroups_GroupId]
GO
ALTER TABLE [UserData].[UserGroups]  WITH CHECK ADD  CONSTRAINT [fk_UserGroups_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserGroups] CHECK CONSTRAINT [fk_UserGroups_UserId]
GO
ALTER TABLE [UserData].[UserLogins]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserLogins_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserLogins] CHECK CONSTRAINT [fk_UserData_UserLogins_CreatedById]
GO
ALTER TABLE [UserData].[UserLogins]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserLogins_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserLogins] CHECK CONSTRAINT [fk_UserData_UserLogins_UpdatedById]
GO
ALTER TABLE [UserData].[UserLogins]  WITH CHECK ADD  CONSTRAINT [fk_UserLogins_LocationId] FOREIGN KEY([LocationId])
REFERENCES [Taxonomy].[Lookups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserLogins] CHECK CONSTRAINT [fk_UserLogins_LocationId]
GO
ALTER TABLE [UserData].[UserLogins]  WITH CHECK ADD  CONSTRAINT [fk_UserLogins_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserLogins] CHECK CONSTRAINT [fk_UserLogins_UserId]
GO
ALTER TABLE [UserData].[UserLogons]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserLogons_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserLogons] CHECK CONSTRAINT [fk_UserData_UserLogons_CreatedById]
GO
ALTER TABLE [UserData].[UserLogons]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserLogons_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserLogons] CHECK CONSTRAINT [fk_UserData_UserLogons_UpdatedById]
GO
ALTER TABLE [UserData].[UserLogons]  WITH CHECK ADD  CONSTRAINT [fk_UserLogons_ProviderId] FOREIGN KEY([ProviderId])
REFERENCES [Taxonomy].[Lookups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserLogons] CHECK CONSTRAINT [fk_UserLogons_ProviderId]
GO
ALTER TABLE [UserData].[UserLogons]  WITH CHECK ADD  CONSTRAINT [fk_UserLogons_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserLogons] CHECK CONSTRAINT [fk_UserLogons_UserId]
GO
ALTER TABLE [UserData].[UserNames]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserNames_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserNames] CHECK CONSTRAINT [fk_UserData_UserNames_CreatedById]
GO
ALTER TABLE [UserData].[UserNames]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserNames_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserNames] CHECK CONSTRAINT [fk_UserData_UserNames_UpdatedById]
GO
ALTER TABLE [UserData].[UserNames]  WITH CHECK ADD  CONSTRAINT [fk_UserNames_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserNames] CHECK CONSTRAINT [fk_UserNames_UserId]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserNotification_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserData_UserNotification_CreatedById]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserNotification_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserData_UserNotification_UpdatedById]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserNotifications_ImportanceId] FOREIGN KEY([ImportanceId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserNotifications_ImportanceId]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserNotifications_LanguageId] FOREIGN KEY([LanguageId])
REFERENCES [Taxonomy].[Lookups] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserNotifications_LanguageId]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserNotifications_NotificationStatusId] FOREIGN KEY([NotificationStatusId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserNotifications_NotificationStatusId]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserNotifications_NotificationStrategyId] FOREIGN KEY([NotificationStrategyId])
REFERENCES [Taxonomy].[Lookups] ([Id])
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserNotifications_NotificationStrategyId]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserNotifications_ParentId] FOREIGN KEY([ParentId])
REFERENCES [UserData].[UserNotifications] ([Id])
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserNotifications_ParentId]
GO
ALTER TABLE [UserData].[UserNotifications]  WITH CHECK ADD  CONSTRAINT [fk_UserNotifications_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserNotifications] CHECK CONSTRAINT [fk_UserNotifications_UserId]
GO
ALTER TABLE [UserData].[UserPasswords]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserPasswords_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserPasswords] CHECK CONSTRAINT [fk_UserData_UserPasswords_CreatedById]
GO
ALTER TABLE [UserData].[UserPasswords]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserPasswords_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserPasswords] CHECK CONSTRAINT [fk_UserData_UserPasswords_UpdatedById]
GO
ALTER TABLE [UserData].[UserPasswords]  WITH CHECK ADD  CONSTRAINT [fk_UserPasswords_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserPasswords] CHECK CONSTRAINT [fk_UserPasswords_UserId]
GO
ALTER TABLE [UserData].[UserPhoneNumbers]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserPhoneNumbers_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserPhoneNumbers] CHECK CONSTRAINT [fk_UserData_UserPhoneNumbers_CreatedById]
GO
ALTER TABLE [UserData].[UserPhoneNumbers]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserPhoneNumbers_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserPhoneNumbers] CHECK CONSTRAINT [fk_UserData_UserPhoneNumbers_UpdatedById]
GO
ALTER TABLE [UserData].[UserPhoneNumbers]  WITH CHECK ADD  CONSTRAINT [fk_UserPhoneNumbers_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserPhoneNumbers] CHECK CONSTRAINT [fk_UserPhoneNumbers_UserId]
GO
ALTER TABLE [UserData].[UserPhotos]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserPhotos_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserPhotos] CHECK CONSTRAINT [fk_UserData_UserPhotos_CreatedById]
GO
ALTER TABLE [UserData].[UserPhotos]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserPhotos_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserPhotos] CHECK CONSTRAINT [fk_UserData_UserPhotos_UpdatedById]
GO
ALTER TABLE [UserData].[UserPhotos]  WITH CHECK ADD  CONSTRAINT [fk_UserPhotos_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserPhotos] CHECK CONSTRAINT [fk_UserPhotos_UserId]
GO
ALTER TABLE [UserData].[Users]  WITH CHECK ADD  CONSTRAINT [fk_UserData_Users_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[Users] CHECK CONSTRAINT [fk_UserData_Users_CreatedById]
GO
ALTER TABLE [UserData].[Users]  WITH CHECK ADD  CONSTRAINT [fk_UserData_Users_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[Users] CHECK CONSTRAINT [fk_UserData_Users_UpdatedById]
GO
ALTER TABLE [UserData].[UserWebLinks]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserWebLinks_CreatedById] FOREIGN KEY([CreatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserWebLinks] CHECK CONSTRAINT [fk_UserData_UserWebLinks_CreatedById]
GO
ALTER TABLE [UserData].[UserWebLinks]  WITH CHECK ADD  CONSTRAINT [fk_UserData_UserWebLinks_UpdatedById] FOREIGN KEY([UpdatedById])
REFERENCES [UserData].[Users] ([Id])
GO
ALTER TABLE [UserData].[UserWebLinks] CHECK CONSTRAINT [fk_UserData_UserWebLinks_UpdatedById]
GO
ALTER TABLE [UserData].[UserWebLinks]  WITH CHECK ADD  CONSTRAINT [fk_UserWebLinks_UserId] FOREIGN KEY([UserId])
REFERENCES [UserData].[Users] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [UserData].[UserWebLinks] CHECK CONSTRAINT [fk_UserWebLinks_UserId]
GO
