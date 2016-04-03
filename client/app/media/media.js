'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('books', {
        url: '/books',
        templateUrl: 'templates/books.html',
        controller: 'BooksCtrl'
      })
      .state('book', {
        url: '/books/:olid',
        templateUrl: 'templates/book.html',
        controller: 'BookCtrl'
      })
      .state('places', {
        url: '/places',
        templateUrl: 'templates/places.html',
        controller: 'PlacesCtrl'
      })
      .state('place', {
        url: '/places/:venueid',
        templateUrl: 'templates/place.html',
        controller: 'PlaceCtrl'
      })
      .state('movies', {
        url: '/movies',
        templateUrl: 'templates/movies.html',
        controller: 'MoviesCtrl'
      })
      .state('movie',{
        url: '/movies/:traktSlug',
        templateUrl: 'templates/movie.html',
        controller: "MovieCtrl"
      })
      .state('shows', {
        url: '/shows',
        templateUrl: 'templates/shows.html',
        controller: 'ShowsCtrl'
      })
      .state('show',{
        url: '/shows/:traktSlug',
        templateUrl: 'templates/show.html',
        controller: "ShowCtrl"
      })
      .state('music', {
        url: '/music',
        templateUrl: 'templates/music.html',
        controller: 'MusicCtrl'
      })
      .state('track', {
        url: '/music/:artist/tracks/:track',
        templateUrl: 'templates/track.html',
        controller: 'TrackCtrl'
      })
      ;
  });
}