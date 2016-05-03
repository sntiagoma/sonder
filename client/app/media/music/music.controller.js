'use strict';

module.exports = function(app){
	app.controller('MusicCtrl', function($scope, $http){
		$scope.music = [];
		$http.get("/api/music").then(
			function(data){
				$scope.music = data.data;
			},
			function(err){
				console.log(err);
			}
		);
	});
  app.controller('TrackCtrl', function($scope, $http, $stateParams, $state){
    $scope.track = {};
    $http.get("/api/music/"+$stateParams.artist+"/tracks/"+$stateParams.track)
    .then(
      function(data){
        $scope.track = data.data;
      },
      function(error){
        $state.go("notFound");
      }
    )
  });
}
