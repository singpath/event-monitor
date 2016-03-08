/**
 * Watch event particpant solution and update their progress.
 *
 */
'use strict';

const Rx = require('rx');

const utils = require('./singpath/utils/index');
const rxFirebase = require('rx-firebase');

exports.firebaseFactory = rxFirebase.factory;

exports.start = function start(publicId, opts) {
  let cm;

  opts = opts || {};
  if (opts.firebase) {
    cm = utils.classMentors(opts.firebase, opts);
  } else if (opts.classMentors) {
    cm = opts.classMentors;
  } else {
    throw new Error('a firebase factory or classMentors service should be provided');
  }

  const events$ = cm.events.eventsByOwner(publicId).doOnNext(e => {
    if (e.active) {
      cm.$logger.log('Watching "%s" (%s).', e.details.title, e.eventId);
    } else {
      cm.$logger.log('Stopping watching %s (%s).', e.details.name, e.eventId);
    }
  }).share();

  if (opts.listOnly) {
    cm.$logger.log('Listing user\'s events only...');

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

  cm.$logger.log('Starting monitoring events...');

  return patches$.bufferWithTime(500).flatMap(patches => {
    const patch = Object.assign.apply(Object, [{}].concat(patches));

    cm.$logger.info('patching "%s" with "%j"', origin, patch);

    return ref.update(patch).then(() => patch);
  });
};

