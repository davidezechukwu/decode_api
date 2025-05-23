SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE	pg_stat_activity.datname = 'decodedb'	AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS "decodedb";

CREATE DATABASE "decodedb"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;