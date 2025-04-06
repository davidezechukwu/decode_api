USE [master];
SET XACT_ABORT ON
BEGIN	
	DECLARE @kill varchar(8000) = '';  
	SELECT @kill = @kill + 'KILL ' + CONVERT(varchar(5), session_id) + ';'  
	FROM sys.dm_exec_sessions
	WHERE database_id  = db_id('decodedb')
	EXEC(@kill);
END
GO
BEGIN
	DECLARE @SQL nvarchar(1000);
	IF EXISTS (SELECT 1 FROM sys.databases WHERE [name] = N'decodedb')
	BEGIN		
		PRINT 'Waiting 30 seconds to avoid transaction deadlocks as the database is dropped'
		RAISERROR ('Waiting 30 seconds to avoid transaction deadlocks as the database is dropped', 0, 1) WITH NOWAIT
		WAITFOR DELAY '00:00:30';
		SET @SQL = N'USE [decodedb];
					 ALTER DATABASE [decodedb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
					 USE [tempdb];
					 DROP DATABASE [decodedb];';
		EXEC (@SQL);
		PRINT 'Waiting 30 seconds to avoid transaction deadlocks after the database is dropped'
		RAISERROR ('Waiting 30 seconds to avoid transaction deadlocks after the database is dropped', 0, 1) WITH NOWAIT
		WAITFOR DELAY '00:00:30';		
	END
END
GO
USE [master]
GO
CREATE DATABASE [decodedb] CONTAINMENT = NONE COLLATE Latin1_General_100_CS_AI_SC_UTF8
 WITH LEDGER = OFF
GO
ALTER DATABASE [decodedb] SET MULTI_USER
GO
ALTER DATABASE [decodedb] SET COMPATIBILITY_LEVEL = 160
GO
ALTER DATABASE [decodedb] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [decodedb] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [decodedb] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [decodedb] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [decodedb] SET ARITHABORT OFF 
GO
ALTER DATABASE [decodedb] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [decodedb] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [decodedb] SET AUTO_CREATE_STATISTICS ON(INCREMENTAL = OFF)
GO
ALTER DATABASE [decodedb] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [decodedb] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [decodedb] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [decodedb] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [decodedb] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [decodedb] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [decodedb] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [decodedb] SET  DISABLE_BROKER 
GO
ALTER DATABASE [decodedb] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [decodedb] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [decodedb] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [decodedb] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [decodedb] SET  READ_WRITE 
GO
ALTER DATABASE [decodedb] SET RECOVERY FULL 
GO
ALTER DATABASE [decodedb] SET  MULTI_USER 
GO
ALTER DATABASE [decodedb] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [decodedb] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [decodedb] SET DELAYED_DURABILITY = DISABLED 
GO
USE [decodedb]
GO
ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = Off;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET LEGACY_CARDINALITY_ESTIMATION = Primary;
GO
ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 0;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET MAXDOP = PRIMARY;
GO
ALTER DATABASE SCOPED CONFIGURATION SET PARAMETER_SNIFFING = On;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET PARAMETER_SNIFFING = Primary;
GO
ALTER DATABASE SCOPED CONFIGURATION SET QUERY_OPTIMIZER_HOTFIXES = Off;
GO
ALTER DATABASE SCOPED CONFIGURATION FOR SECONDARY SET QUERY_OPTIMIZER_HOTFIXES = Primary;
GO
USE [decodedb]
GO
IF NOT EXISTS (SELECT name FROM sys.filegroups WHERE is_default=1 AND name = N'PRIMARY') ALTER DATABASE [decodedb] MODIFY FILEGROUP [PRIMARY] DEFAULT
GO

PRINT 'Creating the CoreAPIAdministrator logon'
GO
USE [master]
GO
IF EXISTS (SELECT name  FROM master.sys.server_principals WHERE name = 'CoreAPIAdministrator')
BEGIN
    DROP LOGIN [CoreAPIAdministrator]
END
CREATE LOGIN [CoreAPIAdministrator] WITH PASSWORD=N'YourPassword', DEFAULT_DATABASE=[master], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
GO
ALTER SERVER ROLE [dbcreator] ADD MEMBER [CoreAPIAdministrator]
GO
ALTER SERVER ROLE [diskadmin] ADD MEMBER [CoreAPIAdministrator]
GO
ALTER SERVER ROLE [processadmin] ADD MEMBER [CoreAPIAdministrator]
GO
ALTER SERVER ROLE [securityadmin] ADD MEMBER [CoreAPIAdministrator]
GO
ALTER SERVER ROLE [serveradmin] ADD MEMBER [CoreAPIAdministrator]
GO
ALTER SERVER ROLE [setupadmin] ADD MEMBER [CoreAPIAdministrator]
GO
ALTER SERVER ROLE [sysadmin] ADD MEMBER [CoreAPIAdministrator]
GO
use [msdb];
GO
USE [master]
GO
DROP USER IF EXISTS [CoreAPIAdministrator]  
GO
CREATE USER [CoreAPIAdministrator] FOR LOGIN [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_accessadmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_datareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_denydatareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_denydatawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_owner] ADD MEMBER [CoreAPIAdministrator]
GO
USE [master]
GO
ALTER ROLE [db_securityadmin] ADD MEMBER [CoreAPIAdministrator]
GO
use [master];
GO
USE [model]
GO
DROP USER IF EXISTS [CoreAPIAdministrator]  
GO
CREATE USER [CoreAPIAdministrator] FOR LOGIN [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_accessadmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_datareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_denydatareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_denydatawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_owner] ADD MEMBER [CoreAPIAdministrator]
GO
USE [model]
GO
ALTER ROLE [db_securityadmin] ADD MEMBER [CoreAPIAdministrator]
GO
use [model];
GO
USE [msdb]
GO
DROP USER IF EXISTS [CoreAPIAdministrator]  
GO
CREATE USER [CoreAPIAdministrator] FOR LOGIN [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [DatabaseMailUserRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_accessadmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_datareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_denydatareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_denydatawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_owner] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_securityadmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_ssisadmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_ssisltduser] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [db_ssisoperator] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [dc_admin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [dc_operator] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [dc_proxy] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [PolicyAdministratorRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [ServerGroupAdministratorRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [ServerGroupReaderRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [SQLAgentOperatorRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [SQLAgentReaderRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [SQLAgentUserRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [TargetServersRole] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [UtilityCMRReader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [UtilityIMRReader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [msdb]
GO
ALTER ROLE [UtilityIMRWriter] ADD MEMBER [CoreAPIAdministrator]
GO
use [msdb];
GO
DROP USER IF EXISTS [CoreAPIAdministrator]  
GO
USE [decodedb]
GO
DROP USER IF EXISTS [CoreAPIAdministrator]  
GO
CREATE USER [CoreAPIAdministrator] FOR LOGIN [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_accessadmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_datareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_denydatareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_denydatawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_owner] ADD MEMBER [CoreAPIAdministrator]
GO
USE [decodedb]
GO
ALTER ROLE [db_securityadmin] ADD MEMBER [CoreAPIAdministrator]
GO
use [decodedb];
GO
USE [tempdb]
GO
DROP USER IF EXISTS [CoreAPIAdministrator]  
GO
CREATE USER [CoreAPIAdministrator] FOR LOGIN [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_accessadmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_datareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_denydatareader] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_denydatawriter] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_owner] ADD MEMBER [CoreAPIAdministrator]
GO
USE [tempdb]
GO
ALTER ROLE [db_securityadmin] ADD MEMBER [CoreAPIAdministrator]
GO

PRINT 'Creating the Taxonomy schema'
GO
USE [decodedb]
GO
CREATE SCHEMA [Taxonomy] AUTHORIZATION [dbo]
GO

PRINT 'Creating the Security schema'
GO
USE [decodedb]
GO
CREATE SCHEMA [Security] AUTHORIZATION [dbo]
GO

PRINT 'Creating the User schema'
GO
USE [decodedb]
GO
CREATE SCHEMA [UserData] AUTHORIZATION [dbo]
GO
