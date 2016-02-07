/**
 * Subset of angularjs $q service using ES6 promises.
 *
 */
'use strict';

exports.promise = executor => new Promise(executor);
exports.promise.resolve = reason => Promise.resolve(reason);
exports.promise.reject = reason => Promise.reject(reason);
exports.promise.all = function all() {
  return Promise.all.apply(Promise, arguments);
};
