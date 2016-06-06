"use strict";
var getId = function (obj,type) {
  var retObj = null;
  switch (type){
    case "movie":
          retObj = obj.traktSlug;
          break;
    case "show":
          retObj = obj.traktSlug;
          break;
    case "track":
          retObj = {artist:obj.artist,track:obj.track};
          break;
    case "book":
          retObj = obj.olid;
          break;
    case "place":
          retObj = obj.venueid;
          break;
  }
  return retObj;
};
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
  app.directive("poster",function($compile, Auth, $state, $http){
    return {
      restrict: "E",
      templateUrl: "/templates/directives/poster.html",
      link: function(scope, element, attrs, controller){
        var colors = {
          indigo: "#536dfe",
          green: "#A5D6A7",
          red: "#EF5350",
          bg: "#1A2327",
          white: "#FFFFFF"
        };
        var obj = JSON.parse(scope.state);
        scope.states = {
          like: false,
          later: false,
          dislike: false
        };
        scope.go = function () {
          $state.go(scope.type,obj);
        };
        scope.checkColors = function () {
          if(scope.states.like){
            $(element).find(".rate.like").css("background-color",colors.indigo);
            $(element).find(".rate.like").css("color",colors.white);
          }else{
            $(element).find(".rate.like").css("background-color",colors.bg);
            $(element).find(".rate.like").css("color",colors.white);
          }if(scope.states.later){
            $(element).find(".rate.later").css("background-color",colors.green);
            $(element).find(".rate.later").css("color",colors.white);
          }else{
            $(element).find(".rate.later").css("background-color",colors.bg);
            $(element).find(".rate.later").css("color",colors.white);
          }if(scope.states.dislike){
            $(element).find(".rate.dislike").css("background-color",colors.red);
            $(element).find(".rate.dislike").css("color",colors.white);
          }else{
            $(element).find(".rate.dislike").css("background-color",colors.bg);
            $(element).find(".rate.dislike").css("color",colors.white);
          }
        };
        scope.resetColors = function () {
          let link;
          if(scope.type=="track"){
            let id = getId(obj,scope.type);
            link = "/api/lists/check/"+scope.type+"/"+Auth.getCurrentUser().username+"/"+id.artist+"/"+id.track;
          }else{
            link = "/api/lists/check/"+scope.type+"/"+Auth.getCurrentUser().username+"/"+getId(obj,scope.type);
          }

          if(Auth.isLoggedIn()){
            $http.get(link).then(function (data) {
              scope.states = data.data;
              scope.checkColors();
            },function (err) {

            });
          }
        };
        scope.exists = function (id, type) {
          switch (type){
            case "movie":
            case "show":
            case "book":
            case "place":
              $http.get("/"+type+"/game-of-thrones")
                .then(function (data) {

                }, function (err) {
                  console.error(err);
                });
              break;
            case "track":
              $http.get("/"+type+"/"+id.artist+"/tracks/"+id.track)
                .then(function (data) {

                }, function (err) {
                  console.error(err);
                });
              break;
          }
        };
        scope.like = function () {
          var id = getId(obj,scope.type);
          scope.exists(id,scope.type);
          switch (scope.type){
            case "movie":
            case "show":
            case "book":
            case "place":
              $http.put("/api/lists/"+scope.type+"/like/"+Auth
                  .getCurrentUser().username+"/"+id)
                .then(function (data) {
                  scope.resetColors();
                },function (err) {
                  console.error(err);
                });
              break;
            case "track":
              $http.put("/api/lists/"+scope.type+"/like/"+Auth
                  .getCurrentUser().username+"/"+id.artist+"/"+id.track)
                .then(function (data) {
                  scope.resetColors();
                },function (err) {
                  console.error(err);
                });
              break;
          }
        };
        scope.later = function () {
          var id = getId(obj,scope.type);
          scope.exists(id,scope.type);
          switch (scope.type){
            case "movie":
            case "show":
            case "book":
            case "place":
              $http.put("/api/lists/"+scope.type+"/later/"+Auth
                  .getCurrentUser().username+"/"+id)
                .then(function (data) {
                  scope.resetColors();
                },function (err) {
                  console.error(err);
                });
              break;
            case "track":
              $http.put("/api/lists/"+scope.type+"/later/"+Auth
                  .getCurrentUser().username+"/"+id.artist+"/"+id.track)
                .then(function (data) {
                  scope.resetColors();
                },function (err) {
                  console.error(err);
                });
              break;
          }
        };
        scope.dislike = function () {
          var id = getId(obj,scope.type);
          scope.exists(id,scope.type);
          switch (scope.type){
            case "movie":
            case "show":
            case "book":
            case "place":
              $http.put("/api/lists/"+scope.type+"/dislike/"+Auth
                  .getCurrentUser().username+"/"+id)
                .then(function (data) {
                  scope.resetColors();
                },function (err) {
                  console.error(err);
                });
              break;
            case "track":
              $http.put("/api/lists/"+scope.type+"/dislike/"+Auth
                  .getCurrentUser().username+"/"+id.artist+"/"+id.track)
                .then(function (data) {
                  scope.resetColors();
                },function (err) {
                  console.error(err);
                });
              break;
          }
        };
        scope.logged = Auth.isLoggedIn();
        $(element).find(".card").css("background-color","#1A2327");
        $(element).find(".card").css("color","white");
        //$(element).find(".card-content").css("border-radius","#1A2327");
        //$(element).find(".card-action").css("background-color",colors.bg);

        scope.resetColors();

      },
      scope: {
        image: "@image",
        width: "@width",
        height: "@height",
        title: "@title",
        description: "@description",
        type: "@type",
        state: "@state"
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
        };
      }
    }
  });
};
