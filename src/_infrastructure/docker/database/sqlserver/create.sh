#!/bin/sh

echo "Running decodedb SQl Server initial database creation and setup scripts..."
/opt/mssql-tools/bin/sqlcmd -S tcp:dev-sql-server,1433 -U sa -P "YourPassword" -d master -i create.sql
