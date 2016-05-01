'use strict';

module.exports = function(app){
  app.controller('ProfileCtrl', function ($scope, Auth) {
    $scope.user = Auth.getCurrentUser();
    $scope.current = Auth.getCurrentUser();
  });
};
