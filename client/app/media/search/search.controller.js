'use strict';

module.exports = function (app) {
  app.controller('SearchCtrl', function ($scope, $http, $stateParams, $state) {
    $scope.songs = [];
    $scope.books = [];
    $scope.movies = [];
    $scope.shows = [];
    $scope.places = [];
    $scope.show = false;
    var search = function (form) {
      $http.get("/api/music/search/" + form).then(
        function (data) {
          $scope.songs = data.data;
        },
        function (err) {
          console.log(err);
        }
      );
      $http.get("/api/books/search/" + form).then(
        function (data) {
          $scope.books = data.data;
        },
        function (error) {
          console.log(error);
        }
      );
      $http.get("/api/movies/search/" + form).then(
        function (data) {
          $scope.movies = data.data;
        },
        function (error) {
          console.log(error);
        }
      );
      $http.get("/api/shows/search/" + form).then(
        function (data) {
          $scope.shows = data.data;
        },
        function (error) {
          console.log(error);
        }
      );
      $http.get("/api/places/search/" + form).then(
        function (data) {
          $scope.places = data.data;
        },
        function (error) {
          console.log(error);
        }
      );
    };
    if ($stateParams.term == null) {
      $scope.show = false;
    } else {
      $scope.show = true;
      search($stateParams.term);
    }
  });
}
