'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('books', {
        url: '/books',
        templateUrl: 'templates/books.html',
        controller: 'BooksCtrl'
      })
      .state('places', {
        url: '/places',
        templateUrl: 'templates/places.html',
        controller: 'PlacesCtrl'
      })
      .state('music', {
      	url: '/music',
      	templateUrl: 'templates/music.html',
      	controller: 'MusicCtrl'
      })
      .state('movies', {
        url: '/movies',
        templateUrl: 'templates/movies.html',
        controller: 'MoviesCtrl'
      })
      .state('movieInfo',{
        url: '/movies/:traktSlug',
        templateUrl: 'templates/movie.html',
        controller: "MovieCtrl"
      })
      .state('shows', {
        url: '/shows',
        templateUrl: 'templates/shows.html',
        controller: 'ShowsCtrl'
      })
      ;
  });
}