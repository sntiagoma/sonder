'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: '/templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: '/templates/signup.html',
        controller: 'SignupCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: '/templates/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      })
      .state('profile', {
        url: "/profile",
        templateUrl: "/templates/profile.html",
        controller: "ProfileCtrl",
        authenticate: true
      })
      .state('user',{
        url: "/users/:username",
        templateUrl: "/templates/profile.html",
        controller: "UsersCtrl"
      })
    ;
  });
}
