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
      });
  });
}