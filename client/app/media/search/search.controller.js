'use strict';

module.exports = function(app) {
    app.controller('SearchCtrl', function($scope, $http, $stateParams, $state) {
        $scope.songs = [];
        $scope.books = [];
        $scope.movies = [];
        $scope.shows = [];
        $scope.places = [];
        $scope.waiting = false;
        $scope.show = false;
        var search = function(form) {
            $scope.waiting = true;
            $http.get("/api/music/search/" + form).then(
                function(data) { //success
                    $scope.songs = data.data;
                },
                function(data) {
                    console.log(err);
                    $scope.waiting = false;
                }
                );
            $http.get("/api/books/search/" + form).then(
                function(data) {
                    $scope.books = data.data;
                },
                function(error) {
                    console.log(error);
                    $scope.waiting = false;
                }
                );
            $http.get("/api/movies/search/" + form).then(
                function(data) {
                    $scope.movies = data.data;
                },
                function(error) {
                    $scope.waiting = false;
                    console.log(error);
                }
                );
            $http.get("/api/shows/search/" + form).then(
                function(data) {
                    $scope.shows = data.data;
                },
                function(error) {
                    console.log(error);
                    $scope.waiting = false;
                }
                );
            $http.get("/api/places/search/" + form).then(
                function(data) {
                    $scope.places = data.data;
                    $scope.waiting = false;
                },
                function(error) {
                    console.log(error);
                    $scope.waiting = false;
                }
                );
        }
        if($stateParams.term == null){
            $scope.show = false;
        }else{
            $scope.show = true;
            search($stateParams.term);
        }
    });
}
