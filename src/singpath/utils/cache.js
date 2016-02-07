/**
 * Angularjs cacheFactory service based ES6 Map.
 *
 * Extended with the `ttl` option.
 */
'use strict';

/**
 * timed cache.
 */

class ExpiringItem {

  constructor(value, ttl) {
    this.value = value;
    this.cacheUntil = Date.now() + ttl;
  }

  isStale() {
    return Date.now() > this.cacheUntil;
  }
}

class Cache {
  constructor(id) {
    this.id = id;
    this.cache = new Map();
  }

  info() {
    return {
      id: this.id,
      size: this.cache.size
    };
  }

  get(key) {
    return this.cache.get(key);
  }

  put(key, value) {
    this.cache.set(key, value);
  }

  remove(key) {
    this.cache.delete(key);
  }

  removeAll() {
    this.cache.clear();
  }

  destroy() {
    this.removeAll();
  }
}

class TimedCache extends Cache {

  constructor(id, ttl) {
    super(id);
    this.ttl = ttl || 300000;
  }

  info() {
    return Object.assign({ttl: this.ttl}, super.info());
  }

  get(key) {
    const item = super.get(key);

    if (item == null) {
      return;
    }

    if (item.isStale()) {
      this.remove(key);
    }

    return item.value;
  }

  put(key, value) {
    super.put(key, new ExpiringItem(value, this.ttl));
  }

  gc() {
    this.cache.forEach(
      (item, key, cache) => item.isStale() && cache.delete(key)
    );
  }
}

const caches = new Map();

exports.factory = function cacheFactory(id, options) {
  let cache = caches.get(id);

  if (!cache) {
    cache = options && options.ttl ? new TimedCache(id, options.ttl) : new Cache(id);
    caches.set(id, cache);
  }

  return cache;
};
