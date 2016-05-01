'use strict';

module.exports = function (app) {
  app.controller('SettingsCtrl', function ($scope, Auth) {
    $scope.changePassword = function () {
      Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
        .then(function () {
          alert('Password successfully changed.');
        })
        .catch(function () {
          alert('Incorrect password');
        });
    };
  });
};
