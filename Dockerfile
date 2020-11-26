FROM keymetrics/pm2:10-jessie

# Bundle APP files
COPY src src/
COPY package.json .
COPY pm2.json .

# Install app dependencies
RUN pm2 install typescript
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production
RUN apt install -y wget && wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem && apt autoremove -y wget

CMD [ "pm2-runtime", "start", "pm2.json" ]
