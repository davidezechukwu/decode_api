#!/usr/bin/env bash

#$1 = $(Pipeline.Workspace)/apps/api/$(Build.BuildId) 
#$2 = $(Pipeline.Workspace)/apps/api                
#$3 = $(Build.BuildId)

echo "Running Build($2)'s start up script: $0..."
echo "Build($3)'s files were deployed to: $1..."
echo "Use this script to run the docker compose (in an azure virtual machine, in the test or staging environment)"
echo "*********DO NO USE IN PRODUCTION*********" 

cd /opt/decode/api/www/src/_infrastructure/docker
#echo "Stopping Docker Compose on $(pwd)..."
####sudo docker compose down 

echo "Skipping DB migration..."
##### uncomment out if DB Migration is required
# echo "Removing db-migrate:latest..."
####sudo docker image rm decode-db-migrate:latest
# echo "Removing dev-sql-server-create:latest..."
####sudo docker image rm decode-dev-sql-server-create:latest
echo "Removing email-notification-worker:latest..."
####sudo docker image rm decode-email-notification-worker:latest
echo "Removing sms-notification-worker:latest..."
####sudo docker image rm decode-sms-notification-worker:latest
#echo "Removing volume decode_mssql..."
####sudo docker volume rm decode_mssql

# to do replace with npm run copy:all (done in npm postbuild)
cd "$1"
echo "Copying public files over to the destination folder; this is usually done by npm postbuild"
sudo cp -r -a -v src/_public dist 
echo "Copying Casbin over to the destination folder; this is usually done by npm postbuild"
sudo cp -r -a -v src/_infrastructure/fixtures/casbin dist/infrastructure/fixtures
echo "Copying Views over to the destination folder; this is usually done by npm postbuild"
sudo cp -r -a -v src/_views dist
echo "Copying Swagger files over to the destination folder; this is usually done by npm postbuild"
sudo cp  -a -v src/swagger.html.ejs dist/swagger.html.ejs
echo "Copying Template files over to the destination folder; this is usually done by npm postbuild"
sudo cp -r -a -v src/_infrastructure/fixtures/templates dist/_infrastructure/fixtures


#copy to web site folder
echo "Copying deployed files to/opt/decode/api/www..."
cd /opt/decode
sudo mkdir -p api
cd api
sudo mkdir -p www 
sudo cp -r -a -v "$1"/* www
cd www

#run docker compose up
echo "starting Docker Compose on $(pwd)..."
cd src/_infrastructure/docker
####sudo docker compose up -d
