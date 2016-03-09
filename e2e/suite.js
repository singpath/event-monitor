/**
 * Experiment with REST base test suite.
 */
'use strict';

const testSuite = require('firebase-test');

exports.factory = function(defaultAuthData) {
  const firebaseId = process.env.SINGPATH_E2E_FIREBASE_ID;
  const firebaseSecret = process.env.SINGPATH_E2E_FIREBASE_SECRET;

  if (!firebaseId || !firebaseSecret) {
    throw new Error(
      'SINGPATH_E2E_FIREBASE_ID and SINGPATH_E2E_FIREBASE_SECRET should be set'
    );
  }

  return testSuite.factory({firebaseId, firebaseSecret, defaultAuthData});
};
