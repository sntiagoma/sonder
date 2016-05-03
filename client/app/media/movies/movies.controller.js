'use strict';

module.exports = function(app){
	app.controller('MoviesCtrl', function($scope, $http){
		$scope.movies = [];
		$http.get("/api/movies").then(
			function(data){
				$scope.movies = data.data;
			},
			function(err){
				console.log(err);
			}
		);
	});

	app.controller('MovieCtrl', function($scope, $http, $stateParams, $state){
		$scope.movie = {};
		$http.get("/api/movies/"+$stateParams.traktSlug)
		.then(
			function(data){
				$scope.movie = data.data;
			},
			function(error){
				$state.go("notFound");
			}
		);
		$scope.filterDirector = function(movie){
			return _.find(movie.people.crew.directing,function(sm){
				return (sm.job=="Director");
			});
		}
	});
}
