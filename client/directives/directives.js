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
  app.directive("poster",function($compile){
    return {
      restrict: "E",
      templateUrl: "/templates/directives/poster.html",
      link: function(scope, element, attrs){
        scope.href = $compile(attrs.href);
      },
      scope: {
        image: "@image",
        width: "@width",
        height: "@height",
        title: "@title",
        description: "@description",
        type: "@type"
      }
    };
  });
  app.directive("esearchbox",function($state){
    return {
      restrict: "E",
      templateUrl: "/templates/directives/esearchbox.html",
      link: function(scope, element, attrs){
        $(element).find("form").css("display","flex");
        $(element).find("input[type=\"text\"]").addClass("esearchbox-input");
        $(element).find("input[type=\"submit\"]").addClass("esearchbox-btn");
        scope.search = function(term){
          $state.go("search-result",{term:term});
        }
      }
    }
  });
}