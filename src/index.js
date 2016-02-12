/**
 * Watch event particpant solution and update their progress.
 *
 */
'use strict';

const Rx = require('rx');

const classMentors = require('./singpath/classmentors/index');
const firebase = require('./singpath/firebase.js');

exports.firebaseFactory = firebase.factory;

exports.start = function start(publicId, firebase, opts) {
  opts = opts || {};

  const cm = classMentors.create(firebase, opts);
  const events$ = cm.events.eventsByOwner(publicId).tap(e => {
    if (e.active) {
      cm.$logger.info('Watching "%s" (%s).', e.details.title, e.eventId);
    } else {
      cm.$logger.info('Stopping watching %s (%s).', e.details.name, e.eventId);
    }
  });

  if (opts.listOnly) {
    cm.$logger.info('Listing user\'s events only...');
    return Rx.Observable.merge(
      events$,
      Rx.Observable.interval(1100)
    ).takeWhile(
      x => x.interval < 1000
    ).toPromise();
  }

  const patches$ = cm.events.monitorEventSolutions(events$);
  const ref = cm.$firebase();
  const origin = ref.toString();

  cm.$logger.info('Starting monitoring events...');

  return patches$.bufferWithTime(500).flatMap(patches => {
    const patch = Object.assign.apply(Object, [{}].concat(patches));

    cm.$logger.debug('patching "%s" with "%j"', origin, patch);

    return ref.update(patch);
  }).takeLast(1).toPromise();
};

