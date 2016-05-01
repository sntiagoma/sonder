'use strict';

module.exports = function(app){
  app.controller('SignupCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.register = function() {
      Auth.createUser({
        name: $scope.user.name,
        username: $scope.user.username,
        email: $scope.user.email,
        password: $scope.user.password
      })
      .then( function() {
        $location.path('/');
        console.info("new User");
      })
      .catch( function(err) {
        console.error(err);
      });
    };
    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
};
