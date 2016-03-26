'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('books', {
        url: '/books',
        templateUrl: 'templates/books.html',
        controller: 'BooksCtrl'
      })
      .state('music', {
      	url: '/music',
      	templateUrl: 'templates/music.html',
      	controller: 'MusicCtrl'
      });
  });
}