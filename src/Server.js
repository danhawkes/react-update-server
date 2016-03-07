'use strict';

import packageJson from '../package';
import restify from 'restify';
import bunyan from 'bunyan';
import semver from 'semver';
import process from 'process';
import Resolver from './Resolver';


export default class Server {

  constructor(config, dataDir) {

    let resolver = new Resolver(config);

    let server = restify.createServer();
    server.name = 'react-update-server';
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());

    server.get('/update-check', (req, res, next) => {

      let {id, platform, container, bundle} = req.query;

      if (id === undefined) {
        res.send(400, new Error(`'id' parameter is missing.`));
      }
      if (platform === undefined) {
        res.send(400, new Error(`'platform' parameter is missing.`));
      }
      if (container === undefined) {
        res.send(400, new Error(`'container' version parameter is missing.`));
        return next();
      }
      if (!semver.valid(container)) {
        res.send(400, new Error(`Container version '${container}' is not valid semver.`));
        return next();
      }
      if (bundle === undefined) {
        res.send(400, new Error(`'bundle' version parameter is missing.`));
        return next();
      }
      if (!semver.valid(bundle)) {
        res.send(400, new Error(`Bundle version '${bundle}' is not valid semver.`));
        return next();
      }

      let resolvedPath = resolver.resolvePath(id, platform, container, bundle);
      if (resolvedPath === undefined) {
        res.send(204);
        return res.next();
      }
      res.redirect(302, resolvedPath, next);
    });

    server.get('/', (req, res, next) => {
      // For dokku's CHECKS test
      res.send(200, {name: packageJson.name, version: packageJson.version});
      next();
    });

    server.get(/\/bundles\/?.*/, restify.serveStatic({
      directory: dataDir
    }));

    server.on('after', restify.auditLogger({
      log: bunyan.createLogger({
        name: 'audit',
        stream: process.stdout
      })
    }));

    this.server = server;
  }

  listen(port = 80) {
    this.server.listen(port, () => {
      console.log('%s listening at %s', this.server.name, this.server.url);
    });
  }

  close() {
    console.log('Stopped server', this.server.name);
    this.server.close();
  }
}

