/**
 * Classmentor profile service.
 */
'use strict';

exports.Profiles = class Profiles {

  constructor(firebase) {
    this.$firebase = firebase;
  }

  getServiceDetails(publicId, serviceId) {
    return this.$firebase(
      ['classMentors/userProfiles', publicId, 'services', serviceId, 'details']
    ).observe('value');
  }
};
