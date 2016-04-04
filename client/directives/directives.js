"use strict";
//E->Elementos, A->Atributo (def), C->Class, M->Comments, AEC-> Varias 
module.exports = function(app){
  app.directive("parallaxImg",function(){
    return {
      restrict: "E",
      scope: {
        image: "@pImg"
      },
      transclude: true,
      templateUrl: "/templates/directives/parallax-img.html",
      link: function(scope, element, attrs){
        $('.parallax').parallax();
      }
    };
  });
}