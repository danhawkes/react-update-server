'use strict';

import process from 'process';
import path from 'path';
import ZSchema from "z-schema";
import config from './data/config';
import configSchema from './config_schema.json';
import Server from './Server';

// Validate the config up-front
let validator = new ZSchema();
validator.validate(config, configSchema);
var errors = validator.getLastErrors();
if (errors !== undefined) {
  console.error("Config validation failed:");
  errors.forEach(error => console.error(error));
  process.exit(1);
}

let server = new Server(config, path.join(__dirname, 'data'));
server.listen(process.env.PORT);
