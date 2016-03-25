'use strict';

module.exports = function(app){
  app.controller('BooksCtrl', function ($scope, $http, socket) {
    $scope.books = [];
    $scope.waiting = true;
    $http.get("/api/books").success(function(books){
      $scope.books = books.sort(function() {return Math.random() - 0.5});
      $scope.waiting = false;
    });
  });
}