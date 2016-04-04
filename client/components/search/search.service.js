'use strict';

module.exports = function(app){
	app.factory('Search', function($search, $http, $scope){
		return {
			search: function (text){
				//must do several requests, 1 per service (music, books, etc.)
				$http.get("/api/books/search/"+text)
					.then(function(response){ // 4 success
						$scope.booksSearch = response;
					}, function(error){
						//Aparently we must handle the error (?)
					}
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