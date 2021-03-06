(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: '/templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: '/templates/signup.html',
        controller: 'SignupCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: '/templates/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      })
      .state('profile', {
        url: "/profile",
        templateUrl: "/templates/profile.html",
        controller: "ProfileCtrl",
        authenticate: true
      })
      .state('user',{
        url: "/users/:username",
        templateUrl: "/templates/profile.html",
        controller: "UsersCtrl"
      })
    ;
  });
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('LoginCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.login = function() {
      window.debugUser = $scope.user;
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      })
      .then( function(res) {
        console.info("Logged");
        $location.path('/recommendations');
      })
      .catch( function(err) {
        console.error("On error: %s", err);
        $scope.errors.other = err.message;
      });
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
};





},{}],3:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('ProfileCtrl', function ($scope, Auth) {
    $scope.user = Auth.getCurrentUser();
    $scope.current = Auth.getCurrentUser();
  });
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = function (app) {
  app.controller('SettingsCtrl', function ($scope, Auth) {
    $scope.changePassword = function () {
      Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword)
        .then(function () {
          alert('Password successfully changed.');
        })
        .catch(function () {
          alert('Incorrect password');
        });
    };
  });
};

},{}],5:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('SignupCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.register = function() {
      Auth.createUser({
        name: $scope.user.name,
        username: $scope.user.username,
        email: $scope.user.email,
        password: $scope.user.password
      })
      .then( function() {
        $location.path('/');
        console.info("new User");
      })
      .catch( function(err) {
        console.error(err);
      });
    };
    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
};

},{}],6:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('UsersCtrl', function ($scope,$http, $stateParams, $state, Auth) {
    $scope.user = {};
    $http({
      method: "GET",
      url: "/api/users/"+$stateParams.username
    }).then(
      function (data) {
        $scope.user = data.data;
      },
      function (err) {
        console.error("Not Found, ERROR: %s",err);
        $state.go("notFound");
      }
    );
  });
};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });
}

},{}],8:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'templates/admin.html',
        controller: 'AdminCtrl'
      });
  });
}
},{}],9:[function(require,module,exports){
'use strict';

var app = angular.module('Sonder', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'ngMessages',
        'btford.socket-io',
        'ui.router',
        'imageCropper',
        'nlFramework',
        'angular-md5'
    ])

.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
        .otherwise('/');
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
})

.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function(config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if (response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
})

.run(function($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
                event.preventDefault();
                $location.path('/login');
            }
        });
    });
})

.constant('_', window._)

.run(function($rootScope){
    $rootScope._ = window._;
})

;

require("../directives/directives.js")(app);
require("../components/auth/auth.service.js")(app);
require("../filters/filters.js")(app);
require("./account/account.js")(app);
require("./account/login/login.controller.js")(app);
require("./account/settings/settings.controller.js")(app);
require("./account/signup/signup.controller.js")(app);
require("./account/profile/profile.controller.js")(app);
require("./account/users/users.controller")(app);
require("./admin/admin.controller.js")(app);
require("./admin/admin.js")(app);
require("./main/main.controller.js")(app);
require("./main/main.js")(app);
require("../components/mongoose-error/mongoose-error.directive.js")(app);
//require("../components/socket/socket.service.js")(app);
require("./media/books/books.controller.js")(app);
require("./media/places/places.controller.js")(app);
require("./media/music/music.controller.js")(app);
require("./media/movies/movies.controller.js")(app);
require("./media/shows/shows.controller.js")(app);
require("./media/search/search.controller.js")(app);
require("./media/recommendations/recommendations.controller.js")(app);
require("./media/media.js")(app);
module.exports = app;

},{"../components/auth/auth.service.js":20,"../components/mongoose-error/mongoose-error.directive.js":21,"../directives/directives.js":22,"../filters/filters.js":23,"./account/account.js":1,"./account/login/login.controller.js":2,"./account/profile/profile.controller.js":3,"./account/settings/settings.controller.js":4,"./account/signup/signup.controller.js":5,"./account/users/users.controller":6,"./admin/admin.controller.js":7,"./admin/admin.js":8,"./main/main.controller.js":10,"./main/main.js":11,"./media/books/books.controller.js":12,"./media/media.js":13,"./media/movies/movies.controller.js":14,"./media/music/music.controller.js":15,"./media/places/places.controller.js":16,"./media/recommendations/recommendations.controller.js":17,"./media/search/search.controller.js":18,"./media/shows/shows.controller.js":19}],10:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('MainCtrl', function ($scope, $http, //socket
    Auth, $state, $nlFramework, $nlDrawer, $nlBurger, $nlRefresh, $nlConfig, $nlToast, $nlMenu) {
    var nlOptions = {
      drawer: {
        maxWidth: 300,
        openCb: function() {
          //console.log('nlDrawer: openned')
        },
        closeCb: function() {
          //console.log('nlDrawer closed')
        }
      },
      burger: {
        use: true
      }
    };
    $nlFramework.init(nlOptions);
    //$nlDrawer.show();
    $scope.Auth = Auth;
    $scope.date = new Date();
    $scope.search = true;
    $scope.logout = function(){
      Auth.logout();
      $state.go("main");
    };
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      //socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.getSpan = function($index) {
      var _d = ($index + 1) % 11;

      if (_d === 1 || _d === 5) {
        return 2;
      }
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    /*$scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });*/
  });
}

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }).state('notFound',{
        url: '/404',
        templateUrl: 'templates/404.html',
        controller: function($scope){

        }
      })
      ;
  });
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('BooksCtrl', function ($scope, $http) {
    $scope.books = [];
    $http.get("/api/books").success(function(books){
      //$scope.books = books.sort(function() {return Math.random() - 0.5});
      $scope.books = books;
    });
  });

  app.controller('BookCtrl', function($scope, $http, $stateParams, $state){
    $scope.book = {};
    $http.get("/api/books/"+$stateParams.olid)
    .then(
      function(data){
        $scope.book = data.data;
      },
      function(error){
        $state.go("notFound");
      }
    )
  });
}

},{}],13:[function(require,module,exports){
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
			.state('search', {
				url: '/search',
				templateUrl: 'templates/search.html',
				controller: 'SearchCtrl'
			})
      .state('recommendations', {
        url: '/recommendations',
        templateUrl: 'templates/recommendations.html',
        controller: 'RecommendationsCtrl'
      })
      .state('search-result',{
        url: '/search/:term',
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      })
      ;
  });
}

},{}],14:[function(require,module,exports){
'use strict';

module.exports = function(app){
	app.controller('MoviesCtrl', function($scope, $http){
		$scope.movies = [];
		$http.get("/api/movies").then(
			function(data){
				$scope.movies = data.data;
			},
			function(err){
				console.log(err);
			}
		);
	});

	app.controller('MovieCtrl', function($scope, $http, $stateParams, $state){
		$scope.movie = {};
		$http.get("/api/movies/"+$stateParams.traktSlug)
		.then(
			function(data){
				$scope.movie = data.data;
			},
			function(error){
				$state.go("notFound");
			}
		);
		$scope.filterDirector = function(movie){
			try {
        return _.find(movie.people.crew.directing,function(sm){
          return (sm.job=="Director");
        });
      }catch (err) {
        console.log("Error Filtering by Director");
      }
		}
	});
};

},{}],15:[function(require,module,exports){
'use strict';

module.exports = function(app){
	app.controller('MusicCtrl', function($scope, $http){
		$scope.music = [];
		$http.get("/api/music").then(
			function(data){
				$scope.music = data.data;
			},
			function(err){
				console.log(err);
			}
		);
	});
  app.controller('TrackCtrl', function($scope, $http, $stateParams, $state){
    $scope.track = {};
    $http.get("/api/music/"+$stateParams.artist+"/tracks/"+$stateParams.track)
    .then(
      function(data){
        $scope.track = data.data;
      },
      function(error){
        $state.go("notFound");
      }
    )
  });
}

},{}],16:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('PlacesCtrl', function ($scope, $http) {
    $scope.places = [];
    $http.get("http://ipinfo.io/loc").then(
      function(data){
        var loc = data.data;
        $http.get("/api/places?loc="+loc).then(
          function(places){
            $scope.places = places.data;
          },
          function(err){
            console.log(err);
          }
        );
      },
      function(err){
        $http.get("/api/places").then(
          function(places){
            $scope.places = places.data;
          },
          function(err){
            console.log(err);
          }
        );
      }
    );
  });
  app.controller('PlaceCtrl', function($scope, $http, $stateParams, $state){
    $scope.place = {};
    $http.get("/api/places/"+$stateParams.venueid)
    .then(
      function(data){
        $scope.place = data.data;
      },
      function(error){
        $state.go("notFound");
      }
    )
  });
}

},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
'use strict';

module.exports = function(app){
	app.controller('ShowsCtrl', function($scope, $http){
		$scope.shows = [];
		$http.get("/api/shows").then(
			function(data){
				$scope.shows = data.data;
			},
			function(err){
				console.log(err);
			}
		);
	});

	app.controller('ShowCtrl', function($scope, $http, $stateParams, $state){
		$scope.show = {};
		$http.get("/api/shows/"+$stateParams.traktSlug)
		.then(
			function(data){
				$scope.show = data.data;
			},
			function(error){
				$state.go("notFound");
			}
		)
	});
}

},{}],20:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.factory('Auth', function Auth($location, $rootScope, $http, $cookieStore, $q) {
    var currentUser = {};
    var getUser = function () {
      var deferred = $q.defer();
      $http({
        method: "GET",
        url: "/api/users/me",
        params: {
          access_token: $cookieStore.get('token')
        }
      })
        .success(function (data) {
          currentUser = data;
          deferred.resolve(data);
        })
        .error(function (msg, code) {
          deferred.reject(msg);
          console.log(msg,code);
        });
      return deferred.promise;
    };
    var changePassword = function (oldPassword,newPassword) {
      var deferred = $q.defer();
      $http({
        method: "PUT",
        url: "/api/users/"+currentUser._id+"/password",
        params: {
          access_token: $cookieStore.get('token')
        },
        data: {
          oldPassword: oldPassword,
          newPassword: newPassword
        }
      })
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (msg, code) {
          deferred.reject(msg);
          console.log(msg,code);
        });
      return deferred.promise;
    };
    if($cookieStore.get('token')) {
      currentUser = getUser();
    }
    return {
      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user) {
        var deferred = $q.defer();
        $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = getUser();
          deferred.resolve(data);
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
        });
        return deferred.promise;
      },

      /**
       * Delete access token and user info
       */
      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @return {Promise}
       */
      createUser: function(user) {
        var createPOST = function (user) {
          var deferred = $q.defer();
          $http.post("/api/users/",user)
            .success(function (data) {
              $cookieStore.put('token', data.token);
              currentUser = getUser().then(function (user) {
                return user;
              });
              deferred.resolve(data);
            })
            .error(function (msg, code) {
              deferred.reject(msg);
              console.log(msg,code);
            });
          return deferred.promise;
        };
        return createPOST(user);
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword) {
        return changePassword(oldPassword,newPassword);
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      }
    };
  });
}

},{}],21:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.directive('mongooseError', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        element.on('keydown', function() {
          return ngModel.$setValidity('mongoose', true);
        });
      }
    };
  });
}
},{}],22:[function(require,module,exports){
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
  app.directive("sidenav",function ($compile, Auth, $state, $http, md5) {
    return {
      restrict: "E",
      templateUrl: "/templates/directives/sidenav.html",
      link: function (scope, element, attrs) {
      }
    }
  });
};

},{}],23:[function(require,module,exports){
"use strict";
module.exports = function(app){
app.filter('msToMin', function() {
    return function(milliseconds, withHour) {
        var seconds = parseInt((milliseconds / 1000) % 60);
        var minutes = parseInt((milliseconds / (100060)) % 60);
        var hours = parseInt((milliseconds / (100060 * 60)) % 24);
        var out = "";
        if (withHour) {
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            out = hours + ":" + minutes + ":" + seconds;
        } else {
            minutes = (parseInt(minutes) + (60 * parseInt(hours)));
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            out = minutes + ":" + seconds;
        }
        return out;
    };
});

}
},{}]},{},[9]);
