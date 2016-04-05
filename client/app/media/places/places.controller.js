'use strict';

module.exports = function(app){
  app.controller('PlacesCtrl', function ($scope, $http, socket) {
    $scope.places = [];
    $scope.waiting = true;
    $http.get("http://ipinfo.io/loc").then(
      function(data){
        var loc = data.data;
        $http.get("/api/places?loc="+loc).then(
          function(places){
            $scope.places = places.data;
            $scope.waiting = false;
          },
          function(err){
            console.log(err);
          }
        );
      },
      function(err){
        $http.get("/api/places").then(
          function(places){
            $scope.places = places.data;
            $scope.waiting = false;
          },
          function(err){
            console.log(err);
          }
        );
      }
    );
  });
  app.controller('PlaceCtrl', function($scope, $http, $stateParams, $state){
    $scope.place = {};
    $http.get("/api/places/"+$stateParams.venueid)
    .then(
      function(data){
        $scope.place = data.data;
      },
      function(error){
        $state.go("pageNotFound");
      }
    )
  });
}