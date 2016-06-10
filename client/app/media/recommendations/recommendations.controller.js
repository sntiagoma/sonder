'use strict';

module.exports = function (app) {
  app.controller('RecommendationsCtrl', function ($scope, $http, Auth) {
    $scope.songs = [];
    $scope.books = [];
    $scope.movies = [];
    $scope.shows = [];
    $scope.places = [];
    var user = Auth.getCurrentUser().username
    if(user == undefined){
      user = "manuela6";
    }
    $http.get("/api/recommender/"+user).then(
      function (data) {
        $scope.books = data.data.books_recom;
        $scope.shows = data.data.shows_recom;
        $scope.places = data.data.places_recom;
        $scope.movies = data.data.movies_recom;
        $scope.songs = data.data.music_recom;
      },
      function (err) {
        console.log(err);
      }
    );

  });
}