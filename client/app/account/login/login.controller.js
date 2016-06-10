'use strict';

module.exports = function(app){
  app.controller('LoginCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.login = function() {
      window.debugUser = $scope.user;
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      })
      .then( function(res) {
        console.info("Logged");
        $location.path('/recommendations');
      })
      .catch( function(err) {
        console.error("On error: %s", err);
        $scope.errors.other = err.message;
      });
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
};




