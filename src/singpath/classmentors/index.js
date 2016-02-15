/**
 * ClassMentors service.
 */
'use strict';

const auth = require('../auth');
const singpath = require('../singpath/index');
const profiles = require('./profiles');
const thirdParties = require('./third-parties');
const events = require('./events');
const utils = require('../utils/index.js');

/**
 * ClassMentors service.
 *
 * Wrap the different services related the the ClassMentors firebase DB.
 *
 */
exports.ClassMentors = class ClassMentors {

  constructor(firebase, logger, promise, http, cacheFactory) {
    this.$firebase = firebase;
    this.$logger = logger;
    this.auth = new auth.Auth(firebase);
    this.profiles = new profiles.Profiles(firebase);
    this.singpath = new singpath.Singpath(firebase);
    this.services = [
      new thirdParties.CodeCombat(firebase, logger, promise, http, cacheFactory),
      new thirdParties.CodeSchool(firebase, logger, promise, http, cacheFactory)
    ].reduce((all, s) => {
      all[s.serviceId] = s;
      return all;
    });
    this.events = new events.Events(firebase, profiles, singpath, this.services, promise, logger);
  }

};

exports.create = (firebase, opts) => {
  opts = opts || {};

  const logger = opts.logger || console;
  const promise = opts.promise || utils.q;
  const http = opts.http || utils.httpFactory(promise);
  const cacheFactory = opts.cacheFactory || utils.cacheFactory;

  return new exports.ClassMentors(
    firebase, logger, promise, http, cacheFactory
  );
};
