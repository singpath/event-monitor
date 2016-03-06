/**
 * 3rd party services
 */
'use strict';

const ERR_NO_SERVICE_ID = 'Service id is missing';
const ERR_NOT_IMPLEMENTED = 'Not implemented';
const ERR_NO_CODE_COMBAT_USER_ID = 'The code combat user id is missing.';
const ERR_NO_CODE_SCHOOL_USER_ID = 'The code school user id is missing.';
const ERR_NO_BADGE_URL = 'No badge url.';

class UserIdTakenError extends Error {

  constructor(serviceId, userId, publicId) {
    super(`This account is already registered with ${publicId}`);
    this.name = 'UserIdTakenError';

    this.serviceId = serviceId;
    this.userId = userId;
    this.owner = publicId;
  }
}

class CodeSchoolBadgeUrlError extends Error {

  constructor(url) {
    super(`A code school badge URL should start with "http(s)://www.codeschool.com/courses/" (${url}).`);
    this.name = 'CodeSchoolBadgeUrlError';

    this.url = url;
  }
}

const allBadgesKey = Symbol('availableBadges');
const allBadgesPromiseKey = Symbol('allBadgesPromise');

/**
 * Abstract 3rd party class
 *
 */
class ThirdParty {

  constructor(serviceId, firebase, logger, promise) {
    if (serviceId == null) {
      throw new Error(ERR_NO_SERVICE_ID);
    }

    this.$firebase = firebase;
    this.$log = logger;
    this.$q = promise;

    this.serviceId = serviceId;

    this[allBadgesKey] = undefined;
    this[allBadgesPromiseKey] = undefined;
  }

  /**
   * Fetch the list (object) of tracked badges.
   *
   * @return {Promise} resolve to the list of badges.
   */
  availableBadges() {
    if (this[allBadgesKey]) {
      return this.$q.resolve(this[allBadgesKey]);
    }

    if (this[allBadgesPromiseKey]) {
      return this[allBadgesPromiseKey];
    }

    this[allBadgesPromiseKey] = this.$firebase(
      ['classMentors/badges', this.serviceId]
    ).once('value').then(
      snapshot => this[allBadgesKey] = snapshot.val()
    );

    return this[allBadgesPromiseKey];
  }

  /**
   * Fetch a user profile.
   *
   * @param  {string}  userId Class Mentor profile of a user.
   * @return {Promise}        Promise resolving to profile snapshot.
   */
  fetchProfile(userId) {
    /* eslint no-unused-vars: 0 */
    return this.$q.reject(ERR_NOT_IMPLEMENTED);
  }

  /**
   * Fetch the user list of badge and normalize them.
   *
   * If the user details for the services are not set, it should resolve
   * to an empty array.
   *
   * @param  {Object} userId User's id on the 3rd party service.
   * @return {Promise}       Promise resolving to an array of new earned badges.
   */
  fetchBadges(userId) {
    /* eslint no-unused-vars: 0 */
    return this.$q.reject(ERR_NOT_IMPLEMENTED);
  }
}

exports.CodeCombat = class CodeCombat extends ThirdParty {

  constructor(firebase, logger, promise, http, cacheFactory) {
    super('codeCombat', firebase, logger, promise);
    this.$http = http;
    this.$cache = cacheFactory('CodeCombat', {ttl: 60000});
  }

  fetchProfile(userId) {
    if (!userId) {
      return this.$q.reject(new Error(ERR_NO_CODE_COMBAT_USER_ID));
    }

    return this.$http.get(
      `https://codecombat.com/db/user/${userId}/level.sessions`,{
        params: {project: 'state.complete,levelID,levelName'},
        cache: this.$cache
      }
    ).then(
      resp => resp.data
    );
  }

  /**
   * Fetch code combat badges.
   *
   * @param  {Object} userId User's code combat id.
   * @return {Promise}       Promise resolving to the users code combat badges.
   */
  fetchBadges(userId) {
    if (userId) {
      return this.$q.resolve([]);
    }

    return this.$q.all([
      this.fetchProfile(userId),
      this.availableBadges()
    ]).then(results => {
      const ccProfile = results[0];
      const allBadges = results[1];

      return ccProfile.map(level => {
        const badgeId = level.levelID;

        if (
          !badgeId ||
          !allBadges[badgeId] ||
          !level.state ||
          !level.state.complete
        ) {
          return;
        }

        return Object.assign({}, allBadges[badgeId]);
      }).filter(
        badge => badge !== undefined
      );
    });
  }
};

exports.CodeSchool = class CodeSchool extends ThirdParty {
  constructor(firebase, logger, promise, http, cacheFactory) {
    super('codeSchool', firebase, logger, promise);
    this.$http = http;
    this.$cache = cacheFactory('CodeSchool', {ttl: 60000});
  }

  fetchProfile(userId) {
    if (!userId) {
      return this.$q.reject(ERR_NO_CODE_SCHOOL_USER_ID);
    }

    return this.$http.get(
      `https://www.codeschool.com/users/${userId}.json`,
      {cache: this.$cache}
    ).then(
      resp => resp.data
    );
  }

  /**
   * Fetch code school badges.
   *
   * @param  {Object} userId User's code school id.
   * @return {Promise}       Promise resolving to the users code school badges.
   */
  fetchBadges(userId) {
    if (!userId) {
      return this.$q.resolve([]);
    }

    return this.fetchProfile(userId).then(
      csProfile => csProfile.badges || []
    ).then(
      badges => badges.map(badge => {
        //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        return {
          'id': this._badgeId(badge.course_url, badge.name),
          'name': badge.name,
          'url': badge.course_url,
          'iconUrl': badge.badge
        };
      }).filter(
        badge => badge && badge.id
      )
    );
  }

  /**
   * Create a badge id from the badge course url and the badge name.
   *
   * @param  {String} url
   * @param  {String} name
   * @return {String}
   */
  _badgeId(url, name) {
    var id;

    if (!url) {
      this.$log.error(ERR_NO_BADGE_URL);
      return;
    }

    if (url.startsWith('http://www.codeschool.com/courses/')) {
      id = url.slice(34) + '-' + name;
    } else if (url.startsWith('https://www.codeschool.com/courses/')) {
      id = url.slice(35) + '-' + name;
    } else {
      this.$log.error(new CodeSchoolBadgeUrlError(url));
      return;
    }

    return id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
};
