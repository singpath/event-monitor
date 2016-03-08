'use strict';

const expect = require('expect.js');

const fakeServer = require('./fakeserver');
const monitor = require('../');
const seed = require('./seed');
const ccProfile = require('./codecombat-profile.js');
const csProfile = require('./codeschool-profile.js');
const testSuite = require('./suite');
const utils = require('../src/singpath/utils/index');

const noop = () => undefined;

describe('classmemtors/events', function() {
  const port = 8000;
  let suite, server;

  this.timeout(10000);

  beforeEach(function() {
    suite = testSuite.factory();
    server = fakeServer.factory({
      port,

      returns(req, resp) {
        if (req.url.startsWith('/codeCombat/db/user/9012/level.sessions')) {
          resp.writeHead(200, {'Content-Type': 'application/json'});
          resp.end(JSON.stringify(ccProfile.factory()));
        } else if (req.url.startsWith('/codeSchool/users/bobCSID.json')) {
          resp.writeHead(200, {'Content-Type': 'application/json'});
          resp.end(JSON.stringify(csProfile.factory()));
        } else {
          resp.writeHead(404, {'Content-Type': 'application/json'});
          resp.end('{"error": "not found"}');
        }
      }
    });
    server.start();
  });

  afterEach(function() {
    server.stop();
  });

  describe('monitoring event', function() {
    it('should check all progresses at the start', () => {
      const noProgress = seed.factory();
      const progress = noProgress.classMentors.eventProgress.someEventId.bob;
      const expected = Object.keys(progress).reduce(
        (all, taskId) => Object.assign(all, {
          [`classMentors/eventProgress/someEventId/bob/${taskId}/completed`]: progress[taskId].completed
        }), {
          'classMentors/eventRankings/someEventId/bob/codeCombat': 2,
          'classMentors/eventRankings/someEventId/bob/codeSchool': 2,
          'classMentors/eventRankings/someEventId/bob/singPath': 1,
          'classMentors/eventRankings/someEventId/bob/total': 5
        }
      );

      noProgress.classMentors.eventProgress.someEventId = null;

      return suite.startWith(noProgress).as('google:alice').then(() => {
        const classMentors = utils.classMentors(suite.rxFirebase, {logger: {
          log: noop,
          error: noop,
          warn: noop,
          info: noop
        }});

        classMentors.services.codeCombat.serverURL = `http://127.0.0.1:${port}/codeCombat`;
        classMentors.services.codeSchool.serverURL = `http://127.0.0.1:${port}/codeSchool`;

        return monitor.start('alice', {classMentors}).scan(
          (all, patch) => Object.assign(all, patch)
        ).takeWhile(
          patch => (
            Object.keys(patch).length < Object.keys(expected).length ||
            patch['classMentors/eventRankings/someEventId/bob/total'] < 5
          )
        ).toPromise().then(
          patch => expect(patch).to.eql(expected)
        );
      }).ok();
    });
  });

});
