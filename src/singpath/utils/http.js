/**
 * Subset of angularjs $http service based on request.
 *
 */
'use strict';

const request = require('request');

const noop = () => undefined;
const dummyCache = {
  get: noop,
  put: noop
};

exports.factory = function httpFactory(promise) {

  function http(config) {
    if (!config.method || config.method === 'GET') {
      return http.get(config.url, config);
    } else {
      return promise.reject(new Error('not implemented'));
    }
  }

  function resolver(resolve, reject, config) {
    return (error, response, body) => {
      if (error) {
        return reject(error);
      }

      const resp = {
        status: response.statusCode,
        statusText: response.statusMessage,
        data: body,
        config: config,
        headers: name => response.headers[name]
      };

      if (resp.status >= 200 && resp.status < 300) {
        resolve(resp);
      } else {
        reject(resp);
      }
    };
  }

  function hash(url, params) {
    return [url].concat(
      Object.keys(params).sort().map(k => '' + k + params[k])
    ).join(':');
  }

  http.get = (url, config) => {
    const reqConfig = {
      url: url,
      qs: config.params,
      headers: config.headers
    };

    const cache = config.cache || dummyCache;
    const key = hash(url, config.params || {});
    const value = cache.get(key);

    if (value) {
      return promise.resolve(value);
    }

    return promise((resolve, reject) => {
      request.get(reqConfig, resolver(resolve, reject, Object.assign(
        {}, config, {url: url, method: 'GET'})
      ));
    }).then(v => {
      cache.put(v);
      return v;
    });
  };

  return http;
};
