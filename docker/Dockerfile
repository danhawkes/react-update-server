FROM mhart/alpine-node:5.7.0

RUN apk update && apk add git
RUN mkdir /app
WORKDIR /app

# Install from npm
RUN NPM_CONFIG_LOGLEVEL=verbose npm install react-update-server@0.6.0

# Volume to overlay data directory. To avoid having an long 'node_modules/…'
# path, move the built-in data directory to /app/data, and add a symlink.
RUN mv /app/node_modules/react-update-server/dist/data /app/data && \
    ln -s -f /app/data node_modules/react-update-server/dist/
VOLUME /app/data

# For dokku deployment
COPY CHECKS CHECKS

EXPOSE 80
WORKDIR node_modules/react-update-server
ENTRYPOINT ["node", "dist/index.js"]
