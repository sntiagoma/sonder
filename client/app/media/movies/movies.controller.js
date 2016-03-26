'use strict';

module.exports = function(app){
	app.controller('MoviesCtrl', function($scope, $http, socket){
		$scope.movies = [];
		$scope.waiting = true;
		$http.get("/api/movies").then(
			function(data){
				$scope.movies = data.data;
				$scope.waiting = false;
			},
			function(err){
				console.log(err);
				$scope.waiting = false;
			}
		);
	});
}