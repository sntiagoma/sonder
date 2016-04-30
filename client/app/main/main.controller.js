'use strict';

module.exports = function(app){
  app.controller('MainCtrl', function ($scope, $http, socket, Auth) {
    $scope.Auth = Auth;
    $scope.date = new Date();
    $scope.search = true;
    $scope.logout = function(){
      Auth.logout();
    }
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.getSpan = function($index) {
      var _d = ($index + 1) % 11;

      if (_d === 1 || _d === 5) {
        return 2;
      }
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
}
