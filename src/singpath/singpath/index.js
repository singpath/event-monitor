/**
 * limited Singpath app service.
 */
'use strict';

const Rx = require('rx');

/**
 * For each obj own property, emit an array with its key and value (default),
 * or the result of the provided resultSelector callback function.
 *
 * Usage: https://jsbin.com/hayoje/edit?js,console
 *
 * @param  {object}    obj
 * @param  {function}  resultSelector
 * @return {Observable}
 */
function entries(obj, resultSelector) {
  const defaulResult = (key, value) => ([key, value]);

  resultSelector = resultSelector || defaulResult;

  return Rx.Observable.from(Object.keys(obj)).map(
    key => resultSelector(key, obj[key])
  );
}

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

  /**
   * Count started and solved promise
   *
   * @param  {string}  queueId Defaults to 'default'
   * @return {promise}
   */
  problemCount(queueId) {
    const problems$ = this._problems(queueId).share();

    return Rx.Observable.zip(
      problems$.count(problem => problem.value.started > 0),
      problems$.count(problem => problem.value.solved === true),
      function resultSelector(started, solved) {
        return {started, solved};
      }
    ).toPromise();
  }

  /**
   * Flatten problems.
   *
   * Will only return problem started/solved for a specific queue.
   *
   * @param  {string}  queueId   Defaults to 'default'
   * @return {Promise}           Resolve to an array of problem.
   */
  problems(queueId) {
    return this._problems(queueId).toArray().toPromise();
  }

  _problems(queueId) {
    const solutions = this.snapshot.val() || {};

    queueId = queueId || 'default';

    return this._levels(solutions).flatMap(
      level => entries(
        level.problems,
        function resultSelector(problemId, queues) {
          return {
            pathId: level.pathId,
            levelId: level.pathId,
            problemId,
            queueId,
            value: queues[queueId]
          };
        }
      )
    ).filter(
      problem => problem.value
    );
  }

  _levels(solutions) {
    return this._paths(solutions).flatMap(path => {
      const pathId = path.pathId;

      return entries(
        path.levels,
        function resultSelector(levelId, problems) {
          return {pathId, levelId, problems};
        }
      );
    });
  }

  _paths(solutions) {
    solutions = solutions || {};

    return entries(
      solutions,
      function resultSelector(pathId, levels) {
        return {pathId, levels};
      }
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
    this.$profiles = new Profiles(firebase);
  }
};
