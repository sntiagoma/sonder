'use strict';

module.exports = function(app){
  app.controller('ProfileCtrl', function ($scope, User, Auth) {
    $scope.user = User.get();
    $scope.current = Auth.getCurrentUser();
  });
}
