/**
 * Experiment with REST base test suite.
 */
'use strict';

const restFirebase = require('rest-firebase');
const FirebaseTokenGenerator = require('firebase-token-generator');
const singpathEventMonitor = require('../');

/**
 * Chainable test suite context.
 *
 * Keep track of of the current user and authenticate it.
 *
 */
class Context {

  constructor(suite, chain, currentUser) {
    this.suite = suite;
    this.chain = chain || Promise.resolve();
    this.currentUser = currentUser || {};
  }

  firebase() {
    throw new Error('not implemented');
  }

  startWith(seed) {
    return this.asAdmin().set('/', seed || null).asGuest();
  }

  with(opts) {
    return new this.constructor(
      this.suite,
      opts && opts.chain || this.chain,
      opts && opts.currentUser || this.currentUser
    );
  }

  then(onSucess, onError) {
    let ctx;
    const newChain = this.chain.then(
      () => ({ctx}),
      err => {
        err.ctx = ctx;

        return Promise.reject(err);
      }
    ).then(onSucess, onError);

    ctx = this.with({chain: newChain});

    return ctx;
  }

  catch(fn) {
    let newCtx;

    newCtx = this.with({chain: this.chain.catch(err => {
      err.ctx = newCtx;

      return Promise.reject(err);
    }).catch(fn)});

    return newCtx;
  }

  ok(done) {
    const onSuccess = result => {
      if (done) {
        done();
      }

      return result;
    };
    const onError = err => {
      if (done) {
        done(err);
      }

      return Promise.reject(err);
    };

    return this.chain.then(onSuccess, onError);
  }

  shouldFail(done) {
    const onSuccess = () => {
      const err = new Error('Operation should have failed');

      if (done) {
        done(err);
      }

      return Promise.reject(err);
    };
    const onError = () => done && done();

    return this.chain.then(onSuccess, onError);
  }

  as(uid, opts, debug) {
    return this.then(e => {
      Object.assign(
        e.ctx.currentUser,
        e.ctx.suite.token(uid, opts, {debug: debug || false})
      );

      return e;
    });
  }

  asAdmin() {
    return this.then(e => {
      Object.assign(
        e.ctx.currentUser,
        e.ctx.suite.token('DB Admin', undefined, {admin: true})
      );

      return e;
    });
  }

  asGuest() {
    return this.with({currentUser: {}});
  }

  get(paths) {
    return this.then(e => e.ctx.firebase(paths).get());
  }

  set(paths, value) {
    return this.then(e => e.ctx.firebase(paths).set(value));
  }

  update(paths, data) {
    return this.then(e => e.ctx.firebase(paths).update(data));
  }

  push(paths, value) {
    return this.then(e => e.ctx.firebase(paths).push(value));
  }

  remove(paths) {
    return this.then(e => e.ctx.firebase(paths).remove());
  }
}

class RestContext extends Context {

  constructor(suite, chain, currentUser) {
    super(suite, chain, currentUser);
  }

  firebase(paths) {
    const auth = this.currentUser && this.currentUser.token;

    return this.suite.req({paths, auth});
  }
}

class SocketContext extends Context {

  constructor(suite, chain, currentUser) {
    super(suite, chain, currentUser);
  }

  firebase(paths) {
    return this.suite.ref({paths});
  }

  as(uid, opts, debug) {
    return super.as(uid, opts, debug).then(
      e => e.ctx.suite.ref().authWithCustomToken(e.ctx.currentUser.token)
    );
  }

  asAdmin() {
    return super.asAdmin().then(
      e => e.ctx.suite.ref().authWithCustomToken(e.ctx.currentUser.token)
    );
  }

  asGuest() {
    return super.asGuest().then(
      e => e.ctx.suite.ref().unauth()
    );
  }
}

/**
 * Test suite helper for firebase base e2e tests.
 *
 * Usage:
 *
 *    let suite, seed;
 *
 *    beforeEach(function() {
 *      suite = new Suite({firebaseId, firebaseSecret});
 *      seed = {users: {bob: {private: 'data'}, alice: {private: 'data'}}};
 *    });
 *
 *    it('should allow bob to read his data', function() {
 *      return suite.startWith(seed).as('bob').get('/users/bob').ok();
 *    });
 *
 *    it('should not allow bob to read someone else data', function() {
 *      return suite.startWith(seed).as('bob').get('/users/alice').shouldFail();
 *    });
 *
 * Note that firebase websocket client uses a singleton pattern and only one user
 * can be authenticated at one point. It will be slower, but you can use the a
 * rest operation to similate concurent request from different users:
 *
 *    it('should work with concurrent requests', function(done) {
 *      return suite.rest().startWith(seed).then(e => Promise.all([
 *        e.ctx.as('bob').get('/users/bob').ok(),
 *        e.ctx.as('alice').get('/users/bob').shouldFail();
 *      ]);
 *    });
 *
 */
class Suite {

  constructor(opts) {
    if (!opts || !opts.firebaseId || !opts.firebaseSecret) {
      throw new Error('The test suite requires the firebase credentials');
    }

    this.rxFirebase = singpathEventMonitor.firebaseFactory(opts.firebaseId);
    this.restFirebase = restFirebase.factory(opts.firebaseId);
    this.generator = new FirebaseTokenGenerator(opts.firebaseSecret);
    this.defaultAuthData = opts.defaultAuthData || {};
  }

  req(opts) {
    opts = opts || {};

    return this.restFirebase(opts);
  }

  ref(opts) {
    return this.rxFirebase(opts && opts.paths);
  }

  token(uid, opts, tokenOpts) {
    const data = Object.assign(
      {}, this.defaultAuthData, opts, {uid}
    );
    const token = this.generator.createToken(data, tokenOpts);

    return {uid, data, token};
  }

  startWith(seed) {
    return this.socket().startWith(seed);
  }

  rest() {
    return new RestContext(this);
  }

  socket() {
    return new SocketContext(this);
  }
}

exports.factory = function(defaultAuth) {
  const firebaseId = process.env.SINGPATH_E2E_FIREBASE_ID;
  const firebaseSecret = process.env.SINGPATH_E2E_FIREBASE_SECRET;

  if (!firebaseId || !firebaseSecret) {
    throw new Error(
      'SINGPATH_E2E_FIREBASE_ID and SINGPATH_E2E_FIREBASE_SECRET should be set'
    );
  }

  return new Suite({firebaseId, firebaseSecret, defaultAuth});
};
