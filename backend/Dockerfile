FROM node:14.17.0-alpine

RUN mkdir /treedots
WORKDIR /treedots
COPY . .

RUN apk add --no-cache --virtual .gyp \
        libsecret-dev \
    && node /treedots/common/scripts/install-run-rush.js install --purge --bypass-policy \
    && yarn --cwd /treedots/packages/prisma run generate \
    && node /treedots/common/scripts/install-run-rush.js build --to @treedots/prisma \
    && node /treedots/common/scripts/install-run-rush.js build --to @treedots/titan-graphql \
    && apk del .gyp

WORKDIR /treedots/apps/titan-graphql

EXPOSE 80
CMD PORT=80 node /treedots/common/scripts/install-run-rushx.js start
