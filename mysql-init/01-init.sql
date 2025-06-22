-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS teamlink_db;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'teamlink_user'@'%' IDENTIFIED BY 'teamlink_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON teamlink_db.* TO 'teamlink_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Switch to the database
USE teamlink_db;

-- The tables will be created automatically by TypeORM synchronize 