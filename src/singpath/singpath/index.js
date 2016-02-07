/**
 * limited Singpath app service.
 */
'use strict';

/**
 * Wrap the user started/solved solutions snapshot.
 *
 * Adds a public id property and some methods.
 */
class UserSolutions {

  constructor(publicId, snapshot) {
    this.snapshot = snapshot;
    this.publicId = publicId;
  }

  hasSolved(pathId, levelId, problemId, queueId) {
    const val = this.snapshot.val();

    queueId = queueId || 'default';

    return (
      pathId && levelId && problemId && queueId &&
      val &&
      val[pathId] &&
      val[pathId][levelId] &&
      val[pathId][levelId][problemId] &&
      val[pathId][levelId][problemId][queueId] &&
      val[pathId][levelId][problemId][queueId].solved
    );
  }
}

/**
 * Singpath app profile service.
 *
 */
class Profiles {

  constructor(firebase) {
    this.$firebase = firebase;
  }

  getSolutions(publicId) {
    return this.$firebase(
      ['singpath/userProfiles', publicId, 'queuedSolutions']
    ).observe('value').map(
      snapshot => new UserSolutions(publicId, snapshot)
    );
  }
}

/**
 * Singpath app service.
 *
 * @type {constructor}
 */
exports.Singpath = class Singpath {

  constructor(firebase) {
    this.$firebase = firebase;
    this.profiles = new Profiles(firebase);
  }
};
