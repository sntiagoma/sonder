'use strict';

module.exports = function(app){
	app.controller('ShowsCtrl', function($scope, $http, socket){
		$scope.shows = [];
		$scope.waiting = true;
		$http.get("/api/shows").then(
			function(data){
				$scope.shows = data.data;
				$scope.waiting = false;
			},
			function(err){
				console.log(err);
				$scope.waiting = false;
			}
		);
	});

	app.controller('ShowCtrl', function($scope, $http, $stateParams, $state){
		$scope.show = {};
		$http.get("/api/shows/"+$stateParams.traktSlug)
		.then(
			function(data){
				$scope.show = data.data;
			},
			function(error){
				$state.go("pageNotFound");
			}
		)
	});
}