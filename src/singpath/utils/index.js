'use strict';

const cache = require('./cache');
const http = require('./http');
const promise = require('./promise');
const classmentors = require('../classmentors/index');

exports.cacheFactory = cache.factory;
exports.httpFactory = http.factory;
exports.q = promise.promise;
exports.classMentors = (firebase, opts) => {
  opts = opts || {};

  const logger = opts.logger || console;
  const promise = opts.promise || exports.q;
  const http = opts.http || exports.httpFactory(promise);
  const cacheFactory = opts.cacheFactory || exports.cacheFactory;

  return new classmentors.ClassMentors(
    firebase, logger, promise, http, cacheFactory
  );
};
