'use strict';

import Resolver from '../src/Resolver';
import Server from '../src/Server';
import expect from 'expect.js';
import restify from 'restify';
import fs from 'fs';
import path from 'path';
import config from './data/config';

let resolver = new Resolver(config);

describe('resolve bundle version', function () {
  it('1', function () {
    expect(resolver.resolveBundleVersion('com.example', 'ios', '1.0.2', '1.0.0')).to.equal('1.5.1');
  });

  it('2', () => {
    expect(resolver.resolveBundleVersion('com.example', 'ios', '1.1.0', '1.0.0')).to.equal('1.6.6');
  });

  it('3', () => {
    expect(resolver.resolveBundleVersion('com.example', 'ios', '1.2.4', '1.0.0')).to.equal('1.6.6');
  });
});

describe('resolve path', () => {
  it('to new', () => {
    expect(resolver.resolvePath('com.example', 'ios', '1.0.2', '1.0.0')).to.equal('bundles/com.example/1.5.1/ios/main.jsbundle');
  });

  it('to same', () => {
    expect(resolver.resolvePath('com.example', 'ios', '1.0.2', '1.5.1')).to.equal(undefined);
  });

  it('for unknown app ID', () => {
    expect(resolver.resolvePath('com.unknown', 'ios', '1.0.2', '1.0.0')).to.equal(undefined);
  });
});

describe('server', () => {

  let server, client;

  beforeEach(() => {
    let port = 12345;

    server = new Server(path.join(__dirname, 'data'));
    server.listen(port);

    client = restify.createStringClient({
      url: `http://localhost:${port}`
    });
  });

  afterEach(() => {
    server.close();
    client.close();
  });

  it('return 204', done => {
    client.get('/update-check?id=com.example&platform=ios&container=1.0.2&bundle=1.5.1', (err, req, res, data) => {
      if (err) {
        expect().fail(err);
      } else {
        expect(res.statusCode).to.equal(204);
      }
      done();
    });
  });

  it('return 302', done => {
    client.get('/update-check?id=com.example&platform=ios&container=1.0.2&bundle=1.3.3', (err, req, res, data) => {
      if (err) {
        expect().fail(err);
      } else {
        expect(res.headers.location).to.equal('bundles/com.example/1.5.1/ios/main.jsbundle');
      }
      done();
    });
  });

  it('return bundle file', done => {
    client.get('/bundles/com.example/1.5.1/ios/main.jsbundle', (err, req, res, data) => {
      if (err) {
        expect().fail(err);
      } else {
        expect(data).to.equal('BUNDLE');
      }
      done();
    })
  });

  it('return config', done => {
    client.get('/config', (err, req, res, data) => {
      if (err) {
        expect().fail(err);
      } else {
        expect(data).to.eql(JSON.stringify(config));
      }
      done();
    })
  });
});
