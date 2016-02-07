'use strict';

const expect = require('expect.js');
const Rx = require('rx');
const sinon = require('sinon');

const events = require('../../src/singpath/classmentors/events.js');

const noop = () => undefined;

describe('classmentors/events', () => {

  describe('Events', () => {
    let service, firebase, profiles, singpath, thirdPartyServices, promise, snapshotFactory;

    beforeEach(() => {
      snapshotFactory = (val, key, ref) => ({key: () => key, val: () => val, ref: () => ref});
      firebase = sinon.stub();
      firebase.observe = sinon.stub();
      profiles = {
        getServiceDetails: sinon.stub()
      };
      singpath = {
        profiles: {
          getSolutions: sinon.stub()
        }
      };
      thirdPartyServices = {
        codeCombat: {
          fetchBadges: sinon.stub()
        },
        codeSchool: {
          fetchBadges: sinon.stub()
        }
      };
      promise = sinon.stub();
      promise.all = sinon.stub();
      promise.resolve = sinon.stub();
      promise.reject = sinon.stub();

      service = new events.Events(firebase, profiles, singpath, thirdPartyServices, promise);
    });

    it('should set services', () => {
      expect(service.$firebase).to.be(firebase);
      expect(service.$profiles).to.be(profiles);
      expect(service.$singpath).to.be(singpath);
      expect(service.$services).to.be(thirdPartyServices);
      expect(service.$firebase).to.be(firebase);
      expect(service.$q).to.be(promise);
    });

    describe('event', () => {
      let ref, observable$;

      beforeEach(() => {
        observable$ = {};
        ref = {
          observe: sinon.stub().returns(observable$)
        };
        service.$firebase.returns(ref);
      });

      it('should observe the value of an event', () => {
        service.event('someEventId');
        sinon.assert.calledOnce(service.$firebase);
        sinon.assert.calledWithExactly(service.$firebase, sinon.match(
          v => v.join('/') === 'classMentors/events/someEventId')
        );
        sinon.assert.calledOnce(ref.observe);
        sinon.assert.calledWithExactly(ref.observe, 'value');
      });

      it('should return an observable', () => {
        expect(service.event('someEventId')).to.be(observable$);
      });

    });

    describe('tasks', () => {
      let ref, tasks$;

      beforeEach(() => {
        tasks$ = new Rx.Subject();
        ref = {
          observe: sinon.stub().returns(tasks$)
        };
        service.$firebase.returns(ref);
      });

      afterEach(() => {
        tasks$.onCompleted();
      });

      it('should observe the value of an event tasks', () => {
        service.tasks('someEventId');
        sinon.assert.calledOnce(service.$firebase);
        sinon.assert.calledWithExactly(service.$firebase, sinon.match(
          v => v.join('/') === 'classMentors/eventTasks/someEventId')
        );
        sinon.assert.calledOnce(ref.observe);
        sinon.assert.calledWithExactly(ref.observe, 'value');
      });

      it('should return an observable', () => {
        expect(service.tasks('someEventId').subscribe).to.be.a(Function);
      });

      it('should wrap the emitted tasks snapshots', done => {
        const ref = {};
        const t1 = {};
        const t2 = {};
        const update$ = service.tasks('someEventId').toArray();

        update$.subscribe(tasks => {
          expect(tasks).to.have.length(2);
          expect(tasks[0].val()).to.be(t1);
          expect(tasks[0].key()).to.be('someEventId');
          expect(tasks[0].ref()).to.be(ref);
          expect(tasks[1].val()).to.be(t2);
          expect(tasks[1].key()).to.be('someEventId');
          expect(tasks[1].ref()).to.be(ref);
        }, done, done);
        tasks$.onNext(snapshotFactory(t1, 'someEventId', ref));
        tasks$.onNext(snapshotFactory(t2, 'someEventId', ref));
        tasks$.onCompleted();
      });

      it('should allow to test if there are any SingPath tasks', done => {
        const t1 = {someTaskId: {}, someOtherTaskId: {serviceId: 'codeSchool'}};
        const t2 = {someTaskId: {}, someOtherTaskId: {serviceId: 'singPath'}};
        const update$ = service.tasks('someEventId').filter(t => t.hasSingPathTasks()).toArray();

        update$.subscribe(tasks => {
          expect(tasks).to.have.length(1);
          expect(tasks[0].val()).to.be(t2);
        }, done, done);
        tasks$.onNext(snapshotFactory(t1));
        tasks$.onNext(snapshotFactory(t2));
        tasks$.onCompleted();
      });

      it('should allow to test if there are any Code Combat tasks', done => {
        const t1 = {someTaskId: {}, someOtherTaskId: {serviceId: 'codeSchool'}};
        const t2 = {someTaskId: {}, someOtherTaskId: {serviceId: 'codeCombat'}};
        const update$ = service.tasks('someEventId').filter(t => t.hasCodeCombatTasks()).toArray();

        update$.subscribe(tasks => {
          expect(tasks).to.have.length(1);
          expect(tasks[0].val()).to.be(t2);
        }, done, done);
        tasks$.onNext(snapshotFactory(t1));
        tasks$.onNext(snapshotFactory(t2));
        tasks$.onCompleted();
      });

      it('should allow to test if there are any Code School tasks', done => {
        const t1 = {someTaskId: {}, someOtherTaskId: {serviceId: 'codeSchool'}};
        const t2 = {someTaskId: {}, someOtherTaskId: {serviceId: 'singPath'}};
        const update$ = service.tasks('someEventId').filter(t => t.hasCodeSchoolTasks()).toArray();

        update$.subscribe(tasks => {
          expect(tasks).to.have.length(1);
          expect(tasks[0].val()).to.be(t1);
        }, done, done);
        tasks$.onNext(snapshotFactory(t1));
        tasks$.onNext(snapshotFactory(t2));
        tasks$.onCompleted();
      });

    });

    describe('newParticipants', () => {
      let ref, observable$;

      beforeEach(() => {
        observable$ = {};
        ref = {
          observe: sinon.stub().returns(observable$)
        };
        service.$firebase.returns(ref);
      });

      it('should observe an event new participants', () => {
        service.newParticipants('someEventId');
        sinon.assert.calledOnce(service.$firebase);
        sinon.assert.calledWithExactly(service.$firebase, sinon.match(
          v => v.join('/') === 'classMentors/eventParticipants/someEventId')
        );
        sinon.assert.calledOnce(ref.observe);
        sinon.assert.calledWithExactly(ref.observe, 'child_added');
      });

      it('should return an observable', () => {
        expect(service.newParticipants('someEventId')).to.be(observable$);
      });

    });

    describe('removedParticipants', () => {
      let ref, observable$;

      beforeEach(() => {
        observable$ = {};
        ref = {
          observe: sinon.stub().returns(observable$)
        };
        service.$firebase.returns(ref);
      });

      it('should observe an event removed participants', () => {
        service.removedParticipants('someEventId');
        sinon.assert.calledOnce(service.$firebase);
        sinon.assert.calledWithExactly(service.$firebase, sinon.match(
          v => v.join('/') === 'classMentors/eventParticipants/someEventId')
        );
        sinon.assert.calledOnce(ref.observe);
        sinon.assert.calledWithExactly(ref.observe, 'child_removed');
      });

      it('should return an observable', () => {
        expect(service.removedParticipants('someEventId')).to.be(observable$);
      });

    });

    describe('progress', () => {
      let ref, observable$;

      beforeEach(() => {
        observable$ = {};
        ref = {
          observe: sinon.stub().returns(observable$)
        };
        service.$firebase.returns(ref);
      });

      it('should observe the value of an event progresses', () => {
        service.progress('someEventId');
        sinon.assert.calledOnce(service.$firebase);
        sinon.assert.calledWithExactly(service.$firebase, sinon.match(
          v => v.join('/') === 'classMentors/eventProgress/someEventId')
        );
        sinon.assert.calledOnce(ref.observe);
        sinon.assert.calledWithExactly(ref.observe, 'value');
      });

      it('should return an observable', () => {
        expect(service.progress('someEventId')).to.be(observable$);
      });

    });

    describe('participantSolutions', () => {
      let ref, addedSolution$, removedSolution$, changedSolution$;

      beforeEach(() => {
        addedSolution$ = new Rx.Subject();
        changedSolution$ = new Rx.Subject();
        removedSolution$ = new Rx.Subject();
        ref = {observe: sinon.stub()};
        ref.observe.withArgs('child_added').returns(addedSolution$);
        ref.observe.withArgs('child_changed').returns(changedSolution$);
        ref.observe.withArgs('child_removed').returns(removedSolution$);
        service.$firebase.returns(ref);
      });

      afterEach(() => {
        addedSolution$.onCompleted();
        changedSolution$.onCompleted();
        removedSolution$.onCompleted();
      });

      it('should observe an event new participants', () => {
        service.participantSolutions('someEventId', 'somePublicId');
        sinon.assert.calledOnce(service.$firebase);
        sinon.assert.calledWithExactly(service.$firebase, sinon.match(
          v => v.join('/') === 'classMentors/eventSolutions/someEventId/somePublicId')
        );
        sinon.assert.calledThrice(ref.observe);
        sinon.assert.calledWithExactly(ref.observe, 'child_added');
        sinon.assert.calledWithExactly(ref.observe, 'child_removed');
        sinon.assert.calledWithExactly(ref.observe, 'child_changed');
      });

      it('should return an observable', () => {
        expect(
          service.participantSolutions('someEventId', 'somePublicId').subscribe
        ).to.be.a(Function);
      });

      it('should merge the event type', done => {
        service.participantSolutions('someEventId', 'somePublicId')
          .toArray()
          .subscribe(values => {
            expect(values).to.have.length(3);
            expect(values[0].val()).to.be(true);
            expect(values[1].val()).to.be(false);
            expect(values[2].val()).to.be(null);
            expect(values[2].key()).to.be('someTaskId');
          }, done, done);

        addedSolution$.onNext(snapshotFactory(true, 'someTaskId'));
        changedSolution$.onNext(snapshotFactory(false, 'someTaskId'));
        removedSolution$.onNext(snapshotFactory(false, 'someTaskId'));
        addedSolution$.onCompleted();
        changedSolution$.onCompleted();
        removedSolution$.onCompleted();
      });

    });

    describe('participantAchievements', () => {
      let requirements$, spSolutions$, serviceDetails$;

      beforeEach(() => {
        requirements$ = new Rx.Subject();
        spSolutions$ = new Rx.Subject();
        serviceDetails$ = new Rx.Subject();

        service.$singpath.profiles.getSolutions.returns(spSolutions$);
        service.$profiles.getServiceDetails.returns(serviceDetails$);
      });

      afterEach(() => {
        requirements$.onCompleted();
        spSolutions$.onCompleted();
        serviceDetails$.onCompleted();
      });

      it('should initiate singpath, code combat and code school required data', done => {
        service.participantAchievements('somePublicId', requirements$).toArray().subscribe(sequences => {
          expect(sequences).to.have.length(1);
          // the properties exist but are set to undefined.
          // `null` would be a value. `undefined` means it hasn't be fetched.
          expect(sequences[0]).to.have.property('spProblems');
          expect(sequences[0]).to.have.property('codeCombat');
          expect(sequences[0]).to.have.property('codeSchool');
          expect(sequences[0].spProblems).to.be(undefined);
          expect(sequences[0].codeCombat).to.be(undefined);
          expect(sequences[0].codeSchool).to.be(undefined);
        }, done, done);

        requirements$.onNext({
          spProblems: false,
          codeCombat: false,
          codeSchool: false
        });
        requirements$.onCompleted();
      });

      it('should get singpath profile solution when required', done => {
        const paths1 = {somePathId: {}};
        const paths2 = {somePathId: {}};

        service.participantAchievements('somePublicId', requirements$).toArray().subscribe(sequences => {
          expect(sequences).to.have.length(3);
          expect(sequences[0].spProblems).to.be(undefined);
          expect(sequences[1].spProblems.val()).to.be(paths1);
          expect(sequences[2].spProblems.val()).to.be(paths2);
          sinon.assert.calledOnce(service.$singpath.profiles.getSolutions);
          sinon.assert.calledWithExactly(service.$singpath.profiles.getSolutions, 'somePublicId');
        }, done, done);

        requirements$.onNext({
          spProblems: false,
          codeCombat: false,
          codeSchool: false
        });
        requirements$.onNext({
          spProblems: true,
          codeCombat: false,
          codeSchool: false
        });
        spSolutions$.onNext(snapshotFactory(paths1));
        spSolutions$.onNext(snapshotFactory(paths2));
        requirements$.onCompleted();
        spSolutions$.onCompleted();
      });

      it('should get code combat details when required', done => {
        const details1 = null;
        const details2 = {id: 'bob'};

        service.participantAchievements('somePublicId', requirements$).toArray().subscribe(sequences => {
          expect(sequences).to.have.length(3);
          expect(sequences[0].codeCombat).to.be(undefined);
          expect(sequences[1].codeCombat.val()).to.be(details1);
          expect(sequences[2].codeCombat.val()).to.be(details2);
          sinon.assert.calledOnce(service.$profiles.getServiceDetails);
          sinon.assert.calledWithExactly(service.$profiles.getServiceDetails, 'somePublicId', 'codeCombat');
        }, done, done);

        requirements$.onNext({
          spProblems: false,
          codeCombat: false,
          codeSchool: false
        });
        requirements$.onNext({
          spProblems: false,
          codeCombat: true,
          codeSchool: false
        });
        serviceDetails$.onNext(snapshotFactory(details1));
        serviceDetails$.onNext(snapshotFactory(details2));
        requirements$.onCompleted();
        serviceDetails$.onCompleted();
      });

      it('should get code school details when required', done => {
        const details1 = null;
        const details2 = {id: 'bob'};

        service.participantAchievements('somePublicId', requirements$).toArray().subscribe(sequences => {
          expect(sequences).to.have.length(3);
          expect(sequences[0].codeSchool).to.be(undefined);
          expect(sequences[1].codeSchool.val()).to.be(details1);
          expect(sequences[2].codeSchool.val()).to.be(details2);
          sinon.assert.calledOnce(service.$profiles.getServiceDetails);
          sinon.assert.calledWithExactly(service.$profiles.getServiceDetails, 'somePublicId', 'codeSchool');
        }, done, done);

        requirements$.onNext({
          spProblems: false,
          codeCombat: false,
          codeSchool: false
        });
        requirements$.onNext({
          spProblems: false,
          codeCombat: false,
          codeSchool: true
        });
        serviceDetails$.onNext(snapshotFactory(details1));
        serviceDetails$.onNext(snapshotFactory(details2));
        requirements$.onCompleted();
        serviceDetails$.onCompleted();
      });
    });

    describe('monitorParticipantSolutions', () => {
      let eventId, publicId, tasks$, progress$, requirements$;
      let achievements$, solutions$;
      let tasks, progress, achievements, solution;
      let emit, complete;
      let makeSolution;

      beforeEach(() => {
        eventId = 'someEventId';
        publicId = 'bob';
        tasks$ = new Rx.ReplaySubject(1);
        progress$ = new Rx.ReplaySubject(1);
        requirements$ = {};
        solutions$ = new Rx.Subject();

        achievements$ = new Rx.Subject();
        sinon.stub(service, 'participantAchievements').returns(achievements$);
        sinon.stub(service, 'participantSolutions').returns(solutions$);
        achievements = {
          spProblems: snapshotFactory({}),
          codeCombat: snapshotFactory({}),
          codeSchool: snapshotFactory({})
        };

        emit = () => {
          tasks$.onNext(snapshotFactory(tasks, eventId));
          progress$.onNext(progress);
          achievements$.onNext(achievements);
          solutions$.onNext(solution);
        };
        complete = () => {
          tasks$.onCompleted();
          progress$.onCompleted();
          achievements$.onCompleted();
          solutions$.onCompleted();
        };
        makeSolution = (val, key) => new events.Solution(
          eventId, publicId, snapshotFactory(val, key), service.$services
        );
      });

      afterEach(() => {
        complete();
      });

      it('should get the participant achievements', () => {
        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        );

        sinon.assert.calledOnce(service.participantAchievements);
        sinon.assert.calledWithExactly(service.participantAchievements, publicId, requirements$);
      });

      it('should get the the participant solution', done => {
        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(() => {
          sinon.assert.calledOnce(service.participantSolutions);
          sinon.assert.calledWithExactly(service.participantSolutions, eventId, publicId);
        }, done, done);

        complete();
      });

      it('should return patch when participant provides a text response', done => {
        tasks = {
          'someTaskId': {textResponse: 'some thing'}
        };

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(1);
          expect(sequence[0]['classMentors/eventProgress/someEventId/bob/someTaskId/completed']).to.be(true);
        }, done, done);

        // should skip
        progress = {};
        solution = makeSolution('', 'someTaskId');
        solution = makeSolution('bar', 'someMissingTaskId');
        emit();

        // should emit
        solutions$.onNext(makeSolution('foo', 'someTaskId'));
        progress$.onNext({someTaskId: {completed: true}});

        // should skip
        solutions$.onNext(makeSolution('bar', 'someTaskId'));
        complete();
      });

      it('should return patch when participant provides a valid link', done => {
        tasks = {
          'someTaskId': {linkPattern: 'http://github\.com'}
        };

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(1);
          expect(sequence[0]['classMentors/eventProgress/someEventId/bob/someTaskId/completed']).to.be(true);
        }, done, done);

        // should skip
        progress = {};
        solution = makeSolution('', 'someTaskId');
        solution = makeSolution('bar', 'someMissingTaskId');
        emit();

        // should emit
        solutions$.onNext(makeSolution('http://github.com/foo', 'someTaskId'));

        // should skip
        progress$.onNext({someTaskId: {completed: true}});
        solutions$.onNext(makeSolution('http://github.com/bar', 'someTaskId'));
        complete();
      });

      it('should return patch when participant join required service', done => {
        tasks = {
          'someSingpathTaskId': {serviceId: 'singPath'},
          'someCodeCombatTaskId': {serviceId: 'codeCombat'},
          'someCodeSchoolTaskId': {serviceId: 'codeSchool'},
          'someOtherServiceTaskId': {serviceId: 'unknown'},
          'someOtherTaskId': {
            serviceId: 'codeCombat',
            badge: {id: 'someOtherBadgeId'}
          }
        };
        achievements.spProblems = {};
        achievements.codeCombat = {id: 'bobCCID'};
        achievements.codeSchool = {id: 'bobCSID'};
        service.$services.codeCombat.fetchBadges.withArgs('bobCCID').returns(
          Promise.resolve([{id: 'someBadgeId'}])
        );

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(3);
          expect(sequence[0]['classMentors/eventProgress/someEventId/bob/someSingpathTaskId/completed']).to.be(true);
          expect(sequence[1]['classMentors/eventProgress/someEventId/bob/someCodeCombatTaskId/completed']).to.be(true);
          expect(sequence[2]['classMentors/eventProgress/someEventId/bob/someCodeSchoolTaskId/completed']).to.be(true);
        }, done, done);

        emit();
        solutions$.onNext(makeSolution(true, 'someSingpathTaskId'));
        solutions$.onNext(makeSolution(true, 'someCodeCombatTaskId'));
        solutions$.onNext(makeSolution(true, 'someCodeSchoolTaskId'));

        // should skip
        progress$.onNext({
          someSingpathTaskId: {completed: true},
          someCodeCombatTaskId: {completed: true},
          someCodeSchoolTaskId: {completed: true}
        });
        solutions$.onNext(makeSolution(true, 'someCodeCombatTaskId'));
        solutions$.onNext(makeSolution(true, 'someOtherServiceTaskId'));
        solutions$.onNext(makeSolution(true, 'someOtherTaskId'));
        complete();
      });

      it('should return patch when participant solved a problem', done => {
        tasks = {
          'someTaskId': {
            serviceId: 'singPath',
            singPathProblem: {
              path: {id: 'somePathId'},
              level: {id: 'someLevelId'},
              problem: {id: 'someProblemId'}
            }
          }
        };
        achievements.spProblems = {
          hasSolved: sinon.stub().withArgs('somePathId', 'someLevelId', 'someProblemId', 'default').returns(true)
        };

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(1);
          expect(sequence[0]['classMentors/eventProgress/someEventId/bob/someTaskId/completed']).to.be(true);
        }, done, done);

        emit();
        solutions$.onNext(makeSolution(true, 'someTaskId'));

        // should skip
        progress$.onNext({someTaskId: {completed: true}});
        solutions$.onNext(makeSolution(true, 'someTaskId'));
        complete();
      });

      it('should return patch when participant earns a code combat badge', done => {
        tasks = {
          'someTaskId': {
            serviceId: 'codeCombat',
            badge: {id: 'someBadgeId'}
          },
          'someOtherTaskId': {
            serviceId: 'codeCombat',
            badge: {id: 'someOtherBadgeId'}
          }
        };
        achievements.codeCombat = {id: 'bobCCID'};
        service.$services.codeCombat.fetchBadges.returns(
          Promise.resolve([{id: 'someBadgeId'}])
        );

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(1);
          expect(sequence[0]['classMentors/eventProgress/someEventId/bob/someTaskId/completed']).to.be(true);
        }, done, done);

        emit();
        solutions$.onNext(makeSolution(true, 'someTaskId'));

        // should skip
        progress$.onNext({someTaskId: {completed: true}});
        solutions$.onNext(makeSolution(true, 'someTaskId'));
        solutions$.onNext(makeSolution(true, 'someOtherTaskId'));
        complete();
      });

      it('should skip archived tasks', done => {
        tasks = {
          'someTaskId': {textResponse: 'some thing', archived: true}
        };
        progress = {};

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(0);
        }, done, done);

        solution = makeSolution('foo', 'someTaskId');
        emit();
        complete();
      });

      it('should skip closed tasks', done => {
        tasks = {
          'someTaskId': {textResponse: 'some thing', closedAt: 12345}
        };
        progress = {};

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(0);
        }, done, done);

        solution = makeSolution('foo', 'someTaskId');
        emit();
        complete();
      });

      it('should not skip closed tasks if the user had solved it', done => {
        tasks = {
          'someTaskId': {linkPattern: 'http://github\.com', closedAt: 12345}
        };
        progress = {someTaskId: {completed: true}};

        service.monitorParticipantSolutions(
          eventId, publicId, tasks$, progress$, requirements$
        ).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(1);
        }, done, done);

        solution = makeSolution('foo', 'someTaskId');
        emit();
        complete();
      });

    });

    describe('monitorEventSolutions', () => {
      let events$;
      let resources;
      let makeStub, completeAll;

      beforeEach(() => {
        events$ = new Rx.Subject();
        resources = [events$];

        completeAll = () => resources.forEach(r => r.onCompleted());

        makeStub = eventId => {
          let thisStub;
          let start, complete, stop;
          let tasks$, progress$, removedParticipants$, newParticipants$, solutionsPathes$;
          let tasks, progress;

          tasks$ = new Rx.ReplaySubject(1);
          progress$ = new Rx.ReplaySubject(1);
          removedParticipants$ = new Rx.Subject();
          newParticipants$ = new Rx.Subject();
          solutionsPathes$ = new Rx.Subject();

          resources.push(tasks$, progress$, removedParticipants$, newParticipants$, solutionsPathes$);

          tasks = {
            hasSingPathTasks: sinon.stub().returns(false),
            hasCodeCombatTasks: sinon.stub().returns(false),
            hasCodeSchoolTasks: sinon.stub().returns(false)
          };
          progress = {};

          sinon.stub(service, 'tasks').withArgs(eventId).returns(tasks$);
          sinon.stub(service, 'progress').withArgs(eventId).returns(progress$);
          sinon.stub(service, 'removedParticipants').withArgs(eventId).returns(removedParticipants$);
          sinon.stub(service, 'newParticipants').withArgs(eventId).returns(newParticipants$);
          sinon.stub(service, 'monitorParticipantSolutions').returns(solutionsPathes$);

          start = () => {
            events$.onNext({eventId, active: true});
            tasks$.onNext(tasks);
            progress$.onNext(snapshotFactory(progress, eventId));
            return thisStub;
          };

          stop = () => {
            events$.onNext({eventId, active: false});
            return thisStub;
          };

          complete = () => {
            events$.onCompleted();
            tasks$.onCompleted();
            progress$.onCompleted();
            removedParticipants$.onCompleted();
            newParticipants$.onCompleted();
            solutionsPathes$.onCompleted();
            return thisStub;
          };

          thisStub = {
            tasks$,
            progress$,
            removedParticipants$,
            newParticipants$,
            solutionsPathes$,

            tasks,
            progress,

            start,
            stop,
            complete
          };

          return thisStub;
        };
      });

      afterEach(() => completeAll());

      it('should completed once the events observable is cancelled (1/2)', done => {
        service.monitorEventSolutions(events$).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(0);
          done();
        }, done);

        events$.onCompleted();
      });

      it('should completed once the events observable is cancelled (2/2)', done => {
        const stub = makeStub('someEventId');

        service.monitorEventSolutions(events$).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(0);
          done();
        }, done);

        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));

        events$.onCompleted();
      });

      it('should monitor the participant solutions', done => {
        service.monitorEventSolutions(events$).subscribe(noop, done);

        const stub = makeStub('someEventId');

        service.monitorParticipantSolutions = function(eventId, publicId, tasks$, progress$, required$) {
          expect(eventId).to.be('someEventId');
          expect(publicId).to.be('bob');
          return Rx.Observable.combineLatest(tasks$, progress$, required$).flatMap(arr => {
            expect(arr[0]).to.be(stub.tasks);
            expect(arr[1]).to.be(stub.progress.bob);
            expect(arr[2].spProblems).to.be(false);
            expect(arr[2].codeCombat).to.be(false);
            expect(arr[2].codeSchool).to.be(false);
            done();
            return Rx.Observable.empty();
          });
        };

        stub.progress.bob = {someTaskId: {completed: true}};
        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
      });

      it('should emit empty participant progress', done => {
        service.monitorEventSolutions(events$).subscribe(noop, done);

        const stub = makeStub('someEventId');

        service.monitorParticipantSolutions = function(eventId, publicId, tasks$, progress$) {
          return progress$.flatMap(progress => {
            expect(progress).to.eql({});
            done();
            return Rx.Observable.empty();
          });
        };

        stub.progress = {};
        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
      });

      it('should require singpath problems', done => {
        service.monitorEventSolutions(events$).subscribe(noop, done);

        const stub = makeStub('someEventId');

        service.monitorParticipantSolutions = function(eventId, publicId, tasks$, progress$, required$) {
          return required$.flatMap(required => {
            expect(required.spProblems).to.be(true);
            done();
            return Rx.Observable.empty();
          });
        };

        stub.tasks.hasSingPathTasks.returns(true);
        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
      });

      it('should require code combat details', done => {
        service.monitorEventSolutions(events$).subscribe(noop, done);

        const stub = makeStub('someEventId');

        service.monitorParticipantSolutions = function(eventId, publicId, tasks$, progress$, required$) {
          return required$.flatMap(required => {
            expect(required.codeCombat).to.be(true);
            done();
            return Rx.Observable.empty();
          });
        };

        stub.tasks.hasCodeCombatTasks.returns(true);
        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
      });

      it('should require code school details', done => {
        service.monitorEventSolutions(events$).subscribe(noop, done);

        const stub = makeStub('someEventId');

        service.monitorParticipantSolutions = function(eventId, publicId, tasks$, progress$, required$) {
          return required$.flatMap(required => {
            expect(required.codeSchool).to.be(true);
            done();
            return Rx.Observable.empty();
          });
        };

        stub.tasks.hasCodeSchoolTasks.returns(true);
        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
      });

      it('should emit update patches', done => {
        const stub = makeStub('someEventId');
        const patch1 = {foo: false};
        const patch2 = {foo: true};

        service.monitorEventSolutions(events$).toArray().map(sequence => {
          expect(sequence).to.have.length(2);
          expect(sequence[0]).to.be(patch1);
          expect(sequence[1]).to.be(patch2);
        }).subscribe(noop, done, done);

        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
        stub.solutionsPathes$.onNext(patch1);
        stub.solutionsPathes$.onNext(patch2);
        completeAll();
      });

      it('should emit update patches while the event is active', done => {
        const stub = makeStub('someEventId');
        const patch1 = {foo: false};
        const patch2 = {foo: true};

        service.monitorEventSolutions(events$).toArray().map(sequence => {
          expect(sequence).to.have.length(1);
          expect(sequence[0]).to.be(patch1);
        }).subscribe(noop, done, done);

        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
        stub.solutionsPathes$.onNext(patch1);
        stub.stop();
        stub.solutionsPathes$.onNext(patch2);
        completeAll();
      });

      it('should emit update patches while the participant part of the event', done => {
        const stub = makeStub('someEventId');
        const patch1 = {foo: false};
        const patch2 = {foo: true};

        service.monitorEventSolutions(events$).toArray().map(sequence => {
          expect(sequence).to.have.length(1);
          expect(sequence[0]).to.be(patch1);
        }).subscribe(noop, done, done);

        stub.start();
        stub.newParticipants$.onNext(snapshotFactory({}, 'bob'));
        stub.solutionsPathes$.onNext(patch1);
        stub.removedParticipants$.onNext(snapshotFactory(null, 'bob'));
        stub.solutionsPathes$.onNext(patch2);
        completeAll();
      });

    });

    describe('eventsByOwner', () => {
      let ref, query, childAdded$, childRemoved$;
      let complete;

      beforeEach(() => {
        ref = {orderByChild: sinon.stub()};
        query = {
          equalTo: sinon.stub().returnsThis(),
          on: sinon.stub().returnsThis()
        };
        childAdded$ = new Rx.Subject();
        childRemoved$ = new Rx.Subject();

        service.$firebase.withArgs(sinon.match(
          x => [].concat(x).join('/') === 'classMentors/events'
        )).returns(ref);
        ref.orderByChild.withArgs('owner/publicId').returns(query);
        service.$firebase.observe.withArgs(query, 'child_added').returns(childAdded$);
        service.$firebase.observe.withArgs(query, 'child_removed').returns(childRemoved$);

        complete = () => {
          childAdded$.onCompleted();
          childRemoved$.onCompleted();
        };
      });

      afterEach(() => complete());

      it('should return an observable', () => {
        const events$ = service.eventsByOwner('bob');

        expect(events$.subscribe).to.be.a(Function);
      });

      it('should emit an active event for each existing event', done => {
        service.eventsByOwner('bob').filter(e => e.active === true).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(2);
          expect(sequence[0].eventId).to.be('event0');
          expect(sequence[1].eventId).to.be('event1');
          done();
        }, done);

        childAdded$.onNext(snapshotFactory({}, 'event0'));
        childAdded$.onNext(snapshotFactory({}, 'event1'));
        complete();
      });

      it('should emit an active event for each removed event', done => {
        service.eventsByOwner('bob').filter(e => e.active === false).toArray().subscribe(sequence => {
          expect(sequence).to.have.length(2);
          expect(sequence[0].eventId).to.be('event1');
          expect(sequence[1].eventId).to.be('event0');
          done();
        }, done);

        childAdded$.onNext(snapshotFactory({}, 'event0'));
        childAdded$.onNext(snapshotFactory({}, 'event0'));
        childRemoved$.onNext(snapshotFactory({}, 'event1'));
        childAdded$.onNext(snapshotFactory({}, 'event3'));
        childRemoved$.onNext(snapshotFactory({}, 'event0'));
        complete();
      });

      it('should emit event details', done => {
        const details = {};

        service.eventsByOwner('bob').toArray().subscribe(sequence => {
          expect(sequence).to.have.length(2);
          expect(sequence[0].details).to.be(details);
          expect(sequence[1].details).to.be(details);
          done();
        }, done);

        childAdded$.onNext(snapshotFactory(details, 'event0'));
        childRemoved$.onNext(snapshotFactory(details, 'event0'));
        complete();
      });

    });

  });

});
