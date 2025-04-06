FROM ubuntu:20.04
RUN apt-get update
RUN apt install -y gnupg gnupg2 gnupg1  
RUN apt install -y curl 
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | tee /etc/apt/sources.list.d/msprod.list
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
WORKDIR /opt/decode/api/www
COPY ./database/sqlserver/create.sql .
COPY ./database/sqlserver/create.sh .
COPY ./database/sqlserver/start.sh .
COPY ./os/linux/wait-for-it.sh .
RUN cd /opt/decode/api/www
RUN chmod 777 ./create.sql
RUN chmod 777 ./create.sh
RUN chmod 777 ./start.sh
RUN chmod 777 ./wait-for-it.sh