'use strict';

module.exports = function(app) {
    app.controller('SearchCtrl', function($scope, $http) {
        $scope.musicResults = [];
        $scope.bookResults = [];
        $scope.movieResults = [];
        $scope.showResults = [];
        $scope.placeResults = [];
        $scope.waiting = false;
        $scope.searchTerm = "";
        $scope.search = function(form) {
        		$scope.waiting = true;
            $http.get("/api/music/search/" + $scope.searchTerm).then(
                function(data) { //success
                    $scope.musicResults = data.data;
                },
                function(data) {
                    console.log(err);
                    $scope.waiting = false;
                }
            );
            $http.get("/api/books/search/" + $scope.searchTerm).then(
                function(data) {
                    $scope.bookResults = data.data;
                },
                function(error) {
                    console.log(error);
                    $scope.waiting = false;
                }
            );
            $http.get("/api/movies/search/" + $scope.searchTerm).then(
                function(data) {
                    $scope.movieResults = data.data;
                },
                function(error) {
                    $scope.waiting = false;
                    console.log(error);
                }
            );
            $http.get("/api/shows/search/" + $scope.searchTerm).then(
                function(data) {
                    $scope.showResults = data.data;
                },
                function(error) {
                    console.log(error);
                    $scope.waiting = false;
                }
            );
            $http.get("/api/places/search/" + $scope.searchTerm).then(
                function(data) {
                    $scope.placeResults = data.data;
                    $scope.waiting = false;
                },
                function(error) {
                    console.log(error);
                    $scope.waiting = false;
                }
            );
        }
    });
}
