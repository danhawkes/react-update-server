'use strict';

import Resolver from '../src/Resolver';
import expect from 'expect.js';


const config = [
  {
    "id": "com.example",
    "container": ">=1.0.0 <1.1.0",
    "bundle": "1.5.1",
    "platforms": ["ios", "android"]
  },
  {
    "id": "com.example",
    "container": "1.x.x",
    "bundle": "1.6.6"
  }
];

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
