'use strict';

import semver from 'semver';

class Resolver {

  constructor(config) {
    this.config = config;
  }

  resolveBundleVersion(appId, platformName, containerVersion) {
    for (let spec of this.config) {
      if (spec.id === appId) {
        if (spec.platforms === undefined || spec.platforms.indexOf(platformName) !== -1) {
          if (semver.satisfies(containerVersion, spec.container)) {
            return spec.bundle;
          }
        }
      }
    }
  }

  /**
   * Returns the relative path to a resolved bundle update, or undefined if no update was found/required.
   * @param {string} appId  - E.g. 'com.example.app'
   * @param platformName - 'android' or 'ios'.
   * @param containerVersion
   * @param bundleVersion
   * @returns {string|undefined}
   */
  resolvePath(appId, platformName, containerVersion, bundleVersion) {
    let newVersion = this.resolveBundleVersion(appId, platformName, containerVersion);
    if (newVersion !== undefined && newVersion !== bundleVersion) {
      return `bundles/${appId}/${newVersion}/${platformName}/main.jsbundle`;
    }
  }
}

module.exports = Resolver;
