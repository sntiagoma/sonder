'use strict';

module.exports = function(app){
	app.factory('Search', function($search, $http, $scope){
		return {
			search: function (text){
				//books
				$http.get("/api/books/search/"+text)
					.then(function(response){

						$scope.booksSearch = response;
					}, function(error){}
				);
				//music
				$http.get("/api/music/search/"+text)
				  .then(function(response){
				  	$scope.musicSearch = response;
				  }, function(error){}
				);
				//movies
				$http.get("/api/movies/search"+text)
				  .then(function(response){
				  	$scope.moviesSearch = response;
				  }, function(error){}
				);
				//shows
				$http.get("/api/shows/search"+text)
					.then(function(response){
						$scope.showsSearch = response;
					}, function(error){}
					);
				//places
				$http.get("/api/places/search"+text)
					.then(function(response){
						$scope.placesSearch = response;
					}, function(error){}
					);
			}
		};
	});
}