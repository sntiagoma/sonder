'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }).state('notFound',{
        url: '/404',
        templateUrl: 'templates/404.html',
        controller: function($scope){

        }
      })
      ;
  });
}
