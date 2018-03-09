FROM daocloud.io/node:8

RUN mkdir -p /opt/apps/welogix-web
WORKDIR /opt/apps/welogix-web
COPY package.json /opt/apps/welogix-web
RUN npm install
COPY .  /opt/apps/welogix-web

EXPOSE 3030

CMD [ "pm2", "start", "pm2/staging.json", "--no-daemon" ]