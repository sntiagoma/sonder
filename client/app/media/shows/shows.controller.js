'use strict';

module.exports = function(app){
	app.controller('ShowsCtrl', function($scope, $http){
		$scope.shows = [];
		$http.get("/api/shows").then(
			function(data){
				$scope.shows = data.data;
			},
			function(err){
				console.log(err);
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
				$state.go("notFound");
			}
		)
	});
}
