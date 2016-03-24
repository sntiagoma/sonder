'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'templates/admin.html',
        controller: 'AdminCtrl'
      });
  });
}