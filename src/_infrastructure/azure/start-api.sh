#!/usr/bin/env bash

#$1 = $(Pipeline.Workspace)/apps/api/$(Build.BuildId) 
#$2 = $(Pipeline.Workspace)/apps/api                
#$3 = $(Build.BuildId)

echo "Starting Build($2)'s start API script: $0"
echo "Starting Build($3)'s API on: $1/dist/index.js"
echo "Use this script to run the api app (in an azure virtual machine, in the test or staging environment)"
echo "*********DO NO USE IN PRODUCTION*********" 

# Restart API
echo "Restarting API..."
cd /opt/decode/api/www

# Update Nginx
echo Updating Nginx config 
sudo cp /opt/decode/api/www/src/_infrastructure/nginx/app.config /etc/nginx/sites-available/app.config
sudo cp -r /opt/decode/api/www/src/_infrastructure/fixtures/certificates /opt/decode/api

# If not using nvm, run the command which nvm to locate the path of nvm, alternatively add to the user bashrc file
# TODO: set --env from pipeline passed as a string argument to this script
# TODO change the NGINX settings using these setting, and perhaps doing a text/placeholder replace with what is passed in as an arg

#todo fix as this does not work in Azure Pipeline 
# this is used in test mode because of the use nvm on the vm
# in production, simple use 
pm2 start ecosystem.config.js --env test


# Restart nginx
echo "Restarting Nginx..." 
sudo systemctl restart nginx