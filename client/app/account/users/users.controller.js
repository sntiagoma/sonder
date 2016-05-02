'use strict';

module.exports = function(app){
  app.controller('UsersCtrl', function ($scope,$http, $stateParams, $state, Auth) {
    $scope.user = {};
    $http({
      method: "GET",
      url: "/api/users/"+$stateParams.username
    }).then(
      function (data) {
        $scope.user = data.data;
      },
      function (err) {
        console.error("Not Found, ERROR: %s",err);
        $state.go("notFound");
      }
    );
  });
};
