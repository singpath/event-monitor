/**
 * events service
 */
'use strict';

const Rx = require('rx');


/**
 * create a squence suitable for Rx.Observable.prototype.retryWhen.
 *
 * Will delay retries, increment the delay and stop retrying after some attempts.
 *
 * Delay = Math.pow(retryCount * opts.baseIncrement, opts.exponentIncrement) * opts.baseDelay;
 *
 * @param  {Observable} failure$ Stream error.
 * @param  {Object}     opts
 * @return {Observable}
 */
function retrySequence(failure$, opts) {
  opts = Object.assign({}, {
    maxRetries: 3,
    baseDelay: 1000,
    baseIncrement: 1,
    exponentIncrement: 1,
    timer: Rx.Observable.timer,
    logger: console
  }, opts);

  return Rx.Observable.zip(
    Rx.Observable.range(1, opts.maxRetries),
    failure$,
    function resultSelector(retries, err) {
      return {retries, err};
    }
  ).flatMap(failure => {
    const delay = Math.pow(failure.retries * opts.baseIncrement, opts.exponentIncrement) * opts.baseDelay;

    opts.logger.info('%s\nRetrying in %s seconds', failure.err.toString(), delay);

    return opts.timer(delay);
  });
}
class Wrapper {

  constructor(snapshot) {
    this.snapshot = snapshot;
  }

  val() {
    return this.snapshot.val();
  }

  key() {
    return this.snapshot.key();
  }

  ref() {
    return this.snapshot.ref();
  }
}

class Tasks extends Wrapper {

  constructor(eventId, snapshot) {
    super(snapshot);
    this.eventId = eventId;
  }

  hasSingPathTasks() {
    const tasks = this.val() || {};

    return Object.keys(tasks).some(
      k => tasks[k] && tasks[k].serviceId === 'singPath'
    );
  }

  hasCodeCombatTasks() {
    const tasks = this.val() || {};

    return Object.keys(tasks).some(
      k => tasks[k] && tasks[k].serviceId === 'codeCombat'
    );
  }

  hasCodeSchoolTasks() {
    const tasks = this.val() || {};

    return Object.keys(tasks).some(
      k => tasks[k] && tasks[k].serviceId === 'codeSchool'
    );
  }
}

class Solution extends Wrapper {

  constructor(eventId, publicId, snapshot, services) {
    super(snapshot);
    this.$services = services;
    this.eventId = eventId;
    this.publicId = publicId;
  }

  solves(task, achievements) {
    const solution = this.val();

    if (!task) {
      return Promise.resolve(null);
    }

    if (solution == null) {
      return Promise.resolve(false);
    }

    return Promise.all([
      this._hasRegistered(solution, task, achievements),
      this._hasBadge(solution, task, achievements),
      this._isResponseValid(solution, task, achievements),
      this._isSolutionLinkValid(solution, task, achievements),
      this._hasSolvedSingpathProblem(solution, task, achievements)
    ]).then(
      flags => flags.some(Boolean)
    );
  }

  _isSolutionLinkValid(solution, task) {
    return (
      task.linkPattern &&
      solution &&
      solution.match &&
      solution.match(task.linkPattern)
    );
  }

  _isResponseValid(solution, task) {
    return task.textResponse && solution;
  }

  _hasRegistered(solution, task, achievements) {
    const serviceId = task.serviceId;

    // test if task only require registration and nothing else
    if (!task.serviceId || task.badge || task.singPathProblem) {
      return false;
    }

    let isSolved = false;

    if (serviceId === 'singPath') {
      isSolved = !!achievements.spProblems;
    } else if (serviceId === 'codeCombat') {
      isSolved = !!achievements.codeCombat.id;
    } else if (serviceId === 'codeSchool') {
      isSolved = !!achievements.codeSchool.id;
    }

    return isSolved;
  }

  _hasBadge(solution, task, achievements) {
    const badgeId = task && task.badge && task.badge.id;
    const serviceId = task && task.serviceId;
    const userId = achievements && achievements[serviceId] && achievements[serviceId].id;

    if (!badgeId || !serviceId || !userId) {
      return Promise.resolve(false);
    }

    return this.$services[serviceId].fetchBadges(userId).then(
      badges => badges.some(
        b => b && b.id === badgeId
      )
    );
  }

  _hasSolvedSingpathProblem(solution, task, achievements) {
    if (
      !task.serviceId === 'singPath' ||
      !task.singPathProblem ||
      !achievements.spProblems
    ) {
      return false;
    }

    const pathId = (
      task.singPathProblem.path &&
      task.singPathProblem.path.id
    );
    const levelId = (
      task.singPathProblem.level &&
      task.singPathProblem.level.id
    );
    const problemId = (
      task.singPathProblem.problem &&
      task.singPathProblem.problem.id
    );
    const queueId = 'default';

    return (
      task.serviceId === 'singPath' &&
      achievements.spProblems &&
      achievements.spProblems.hasSolved(pathId, levelId, problemId, queueId));
  }
}

class Context {
  constructor(ctx) {
    Object.assign(this, ctx);
  }

  /**
   * Return a copy of the context extended with the given propertes.
   *
   * @param  {Object} prop
   * @return {Object}
   */
  with(prop) {
    return Object.assign(new this.constructor(this), prop);
  }
}

class SolutionContext extends Context {

  constructor(ctx) {
    super(ctx);
  }

  withTask(taskId) {
    const tasks = this.tasks && this.tasks.val();

    return this.with({
      taskId: taskId,
      task: tasks && tasks[taskId],
      wasSolved: (
        this.progress &&
        this.progress[taskId] &&
        this.progress[taskId].completed
      ) || false
    });
  }

  shouldSkip() {
    return (
      !this.task ||
      this.task.archived ||
      (this.task.closedAt && !this.wasSolved)
    );
  }

  isChanged() {
    return (
      this.isSolved !== null &&
      this.isSolved !== this.wasSolved
    );
  }

  patch() {
    if (!this.eventId || !this.publicId || !this.taskId) {
      return {};
    }

    return {
      [`classMentors/eventProgress/${this.eventId}/${this.publicId}/${this.taskId}/completed`]: this.isSolved
    };
  }
}

exports.Solution = Solution;

const REQUIREMENTS = ['spProblems', 'codeCombat', 'codeSchool'];

exports.Events = class Events {

  constructor(firebase, profiles, singpath, services, promise, logger) {
    this.$firebase = firebase;
    this.$profiles = profiles;
    this.$singpath = singpath;
    this.$services = services;
    this.$q = promise;
    this.$logger = logger;
  }

  eventsByOwner(publicId) {
    const ref = this.$firebase(['classMentors/events']);
    const query = ref.orderByChild('owner/publicId').equalTo(publicId);
    const activeEvents$ = this.$firebase.observe(query, 'child_added').map(
      e => ({eventId: e.key(), active: true, details: e.val()})
    );
    const removedEvents$ = this.$firebase.observe(query, 'child_removed').map(
      e => ({eventId: e.key(), active: false, details: e.val()})
    );

    return Rx.Observable.merge(activeEvents$, removedEvents$);
  }

  /**
   * Monitor the event participants solutions to update the participant progress.
   *
   * @param  {Object} events$ Observable emitting object representing event to
   *                          monitor or to stop to monitor. Should hold the
   *                          `eventId` and `active` properties.
   * @return {Object}         A cold Observable emitting patches to update the user
   *                          progress.
   */
  monitorEventSolutions(events$) {
    const newEventIds$ = events$.filter(event => event.active).map(event => event.eventId);
    const closedEventIds$ = events$.filter(event => !event.active).map(event => event.eventId);
    const stop$ = newEventIds$.takeLast(1);

    return newEventIds$.flatMap(eventId => {
      const tasks$ = this.tasks(eventId).shareReplay(1);
      const progress$ = this.progress(eventId).shareReplay(1);
      const required$ = tasks$.map(tasks => {
        return {
          spProblems: tasks.hasSingPathTasks(),
          codeCombat: tasks.hasCodeCombatTasks(),
          codeSchool: tasks.hasCodeSchoolTasks()
        };
      }).distinctUntilChanged(
        r => REQUIREMENTS.map(k => r[k]).toString()
      ).shareReplay(1);
      const removedParticipants$ = this.removedParticipants(eventId).share();
      const eventClosed$ = closedEventIds$.filter(id => id === eventId).take(1);

      const completedTasks = progress => Object.keys(progress).filter(
        taskKey => progress[taskKey].completed === true
      );
      const patches$ = this.newParticipants(eventId).flatMap(participant => {
        const publicId = participant.key();
        const participantProgress$ = progress$.map(
          snapshot => snapshot.val() || {}
        ).map(
          progress => progress[publicId] || {}
        ).distinctUntilChanged(
          progress => completedTasks(progress).sort().toString()
        );
        const participantHasLeft$ = removedParticipants$.filter(
          snapshot => snapshot.key() === publicId
        ).take(1);

        return this.monitorParticipantSolutions(
          eventId, publicId, tasks$, participantProgress$, required$
        ).takeUntil(participantHasLeft$);
      });

      return patches$.takeUntil(eventClosed$);
    }).takeUntil(stop$);
  }

  monitorParticipantSolutions(eventId, publicId, tasks$, progress$, required$) {
    const achievements$ = this.participantAchievements(publicId, required$);
    const context$ = Rx.Observable.combineLatest(
      tasks$,
      progress$,
      achievements$
    ).map(data => ({
      tasks: data[0],
      progress: data[1],
      achievements: data[2],
      eventId,
      publicId
    })).shareReplay(1);

    const solutionPatchesFactory = () => this.participantSolutions(eventId, publicId).flatMap(solution => {
      const taskId = solution.key();

      const solutionContext$ = context$.take(1).map(
        obj => new SolutionContext(obj)
      ).map(
        ctx => ctx.withTask(taskId)
      ).filter(
        // skip archived and unsolved closed tasks
        ctx => !ctx.shouldSkip()
      );

      const checkedSolution$ = solutionContext$.flatMap(
        ctx => solution.solves(ctx.task, ctx.achievements).then(
          isSolved => ctx.with({isSolved})
        )
      ).retryWhen(attempts$ => retrySequence(attempts$, {
        baseDelay: 1000,
        exponentIncrement: 3,
        maxRetries: 5,
        timer: delay => this.timer(delay),
        logger: this.$logger
      }));

      return checkedSolution$.filter(
        ctx => ctx.isChanged()
      ).flatMap(
        ctx => ctx.patch()
      );
    });

    // keep the shared context stream open while someone subscribes to the the solutions
    // stream.
    return Rx.Observable.using(
      () => context$.subscribe(),
      solutionPatchesFactory
    );
  }

  /**
   * Follow updates of the event details.
   *
   * @param  {String} eventId Id of the event to follow.
   * @return {Object}         A cold Observable emitting a snapshot of the event
   *                          details.
   */
  event(eventId) {
    return this.$firebase(
      ['classMentors/events', eventId]
    ).observe('value');
  }

  /**
   * Follow updates of the event tasks.
   *
   * @param  {String} eventId Id of the event to follow tasks for.
   * @return {Object}         A cold Observable emitting a snapshot of the event
   *                          tasks (the tasks object, not each items).
   */
  tasks(eventId) {
    return this.$firebase(
      ['classMentors/eventTasks', eventId]
    ).observe('value').map(
      snapshot => new Tasks(eventId, snapshot)
    );
  }

  /**
   * Follow participant joining.
   *
   * Emit each existing participant child and each child created later.
   *
   * @param  {String} eventId Id of the event to follow participants for.
   * @return {Object}         A cold Observable emitting a snapshot for each
   *                          event participant.
   */
  newParticipants(eventId) {
    return this.$firebase(
      ['classMentors/eventParticipants', eventId]
    ).observe('child_added');
  }

  /**
   * Follow participant leaving an event.
   *
   * @param  {String} eventId Id of the event to follow participants for.
   * @return {Object}         A cold Observable emitting a snapshot for each
   *                          event leaving.
   */
  removedParticipants(eventId) {
    return this.$firebase(
      ['classMentors/eventParticipants', eventId]
    ).observe('child_removed');
  }

  /**
   * Follow updates of the event participants progress.
   *
   * @param  {String} eventId Id of the event to follow progress for.
   * @return {Object}         A cold Observable emitting a snapshot of the event
   *                          progress (the progress object, not each items).
   */
  progress(eventId) {
    return this.$firebase(
      ['classMentors/eventProgress', eventId]
    ).observe('value');
  }

  /**
   * Follow a participant solution updates (creation, changes, removals).
   *
   * @param  {String} eventId       Id of the event to follow solutions for.
   * @param  {String} participantId Public Id of the participant to follow the
   *                                solutions for.
   * @return {Object}               A cold Observable emitting an object with
   *                                the solution `snapshot`, `eventId` and
   *                                `participantId` (public id of the
   *                                participant).
   */
  participantSolutions(eventId, participantId) {
    const ref = this.$firebase([
      'classMentors/eventSolutions', eventId, participantId
    ]);

    return Rx.Observable.merge(
      ref.observe('child_added'),
      ref.observe('child_changed'),
      ref.observe('child_removed').map(old => {
        return {
          key: () => old.key(),
          val: () => null
        };
      })
    ).map(
      snapshot => new Solution(eventId, participantId, snapshot, this.$services)
    );
  }

  participantAchievements(publicId, required$) {
    const handlers = {
      spProblems: () => this.$singpath.profiles.getSolutions(publicId),
      codeCombat: () => this.$profiles.getServiceDetails(publicId, 'codeCombat'),
      codeSchool: () => this.$profiles.getServiceDetails(publicId, 'codeSchool')
    };

    return required$.flatMapLatest(required => {
      const os$ = REQUIREMENTS.map(k => {
        return required[k] ? handlers[k]() : Rx.Observable.return();
      });

      return Rx.Observable.combineLatest(os$).map(
        arr => REQUIREMENTS.reduce((achievements, k, i) => {
          achievements[k] = arr[i];
          return achievements;
        }, {})
      ).filter(achievements => {
        // if more than one new service are required at the same time,
        // lets make sure both are ready.
        const missing = Object.keys(required).filter(
          k => required[k] && achievements[k] === undefined
        );

        return missing.length === 0;
      });
    });
  }

};
