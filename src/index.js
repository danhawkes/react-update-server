'use strict';

import packageJson from '../package';
import restify from 'restify';
import semver from 'semver';
import process from 'process';
import Resolver from './Resolver';

import ZSchema from "z-schema";
import config from './data/config';
import configSchema from './config_schema.json';

// Work in script directory for access to ./data
process.chdir(__dirname);

// Validate the config up-front
let validator = new ZSchema();
validator.validate(config, configSchema);
var errors = validator.getLastErrors();
if (errors !== undefined) {
  console.error("Config validation failed:");
  errors.forEach(error => console.error(error));
  process.exit(1);
}

let server = restify.createServer();
server.name = 'react-update-server';
server.use(restify.queryParser());

let resolvePath = new Resolver(config).resolvePath;


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

  let resolvedPath = resolvePath(id, platform, container, bundle);
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
  directory: './data'
}));

server.listen(80, function () {
  console.log('%s listening at %s', server.name, server.url);
});
