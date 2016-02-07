'use strict';

const cache = require('./cache');
const http = require('./http');
const promise = require('./promise');

exports.cacheFactory = cache.factory;
exports.httpFactory = http.factory;
exports.q = promise.promise;
