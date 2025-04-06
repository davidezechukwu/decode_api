FROM node:20.10.0

#Copy api and workers
WORKDIR /opt/decode/api/www
COPY ./package.json .
COPY ./dist  ./dist
COPY ./node_modules  ./node_modules
COPY ./dist/.env ./dist
COPY ./dist/.env ./dist/workers
RUN chmod 777 /opt/decode/api/www/dist/.env
RUN chmod 777 /opt/decode/api/www/dist/workers/.env
RUN chmod 777 /opt/decode/api/www/dist/workers/SMSNotificationWorker.js

#install systemctl
RUN apt-get update
RUN apt-get install systemctl -y 

#install systemd
RUN apt-get update
RUN apt-get install systemd -y

#setup cron and the scheduled worker
ADD ./sms-notification-worker-crontab /etc/cron.d/worker-cron-file
RUN chmod 777 /etc/cron.d/worker-cron-file
RUN apt-get update && apt-get install cron -y 
RUN crontab /etc/cron.d/worker-cron-file

ENTRYPOINT ["cron", "-f"]
