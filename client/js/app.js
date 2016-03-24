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
      });
  });
}
},{}],2:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('LoginCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
}

},{}],3:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('SettingsCtrl', function ($scope, User, Auth) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};
  });
}

},{}],4:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('SignupCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Account created, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
}

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
'use strict';

var app = angular.module('Sonder', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'ngMessages',
        'btford.socket-io',
        'ui.router'
    ])
    // .config(function($mdIconProvider) {
    //     $mdIconProvider
    //         .iconSet('action', '../assets/iconsets/action-icons.svg', 24)
    //         .iconSet('alert', '../assets/iconsets/alert-icons.svg', 24)
    //         .iconSet('av', '../assets/iconsets/av-icons.svg', 24)
    //         .iconSet('communication', '../assets/iconsets/communication-icons.svg', 24)
    //         .iconSet('content', '../assets/iconsets/content-icons.svg', 24)
    //         .iconSet('device', '../assets/iconsets/device-icons.svg', 24)
    //         .iconSet('editor', '../assets/iconsets/editor-icons.svg', 24)
    //         .iconSet('file', '../assets/iconsets/file-icons.svg', 24)
    //         .iconSet('hardware', '../assets/iconsets/hardware-icons.svg', 24)
    //         .iconSet('icons', '../assets/iconsets/icons-icons.svg', 24)
    //         .iconSet('image', '../assets/iconsets/image-icons.svg', 24)
    //         .iconSet('maps', '../assets/iconsets/maps-icons.svg', 24)
    //         .iconSet('navigation', '../assets/iconsets/navigation-icons.svg', 24)
    //         .iconSet('notification', '../assets/iconsets/notification-icons.svg', 24)
    //         .iconSet('social', '../assets/iconsets/social-icons.svg', 24)
    //         .iconSet('toggle', '../assets/iconsets/toggle-icons.svg', 24)
    //         .iconSet('avatar', '../assets/iconsets/avatar-icons.svg', 128);
    // })
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
});

require("./account/account.js")(app);
require("./account/login/login.controller.js")(app);
require("./account/settings/settings.controller.js")(app);
require("./account/signup/signup.controller.js")(app);
require("./admin/admin.controller.js")(app);
require("./admin/admin.js")(app);
require("./main/main.controller.js")(app);
require("./main/main.js")(app);
require("../components/auth/auth.service.js")(app);
require("../components/auth/user.service.js")(app);
require("../components/mongoose-error/mongoose-error.directive.js")(app);
require("../components/shell/dialog/dialog.controller.js")(app);
require("../components/shell/shell.controller.js")(app);
require("../components/socket/socket.service.js")(app);

module.exports = app;

},{"../components/auth/auth.service.js":10,"../components/auth/user.service.js":11,"../components/mongoose-error/mongoose-error.directive.js":12,"../components/shell/dialog/dialog.controller.js":13,"../components/shell/shell.controller.js":14,"../components/socket/socket.service.js":15,"./account/account.js":1,"./account/login/login.controller.js":2,"./account/settings/settings.controller.js":3,"./account/signup/signup.controller.js":4,"./admin/admin.controller.js":5,"./admin/admin.js":6,"./main/main.controller.js":8,"./main/main.js":9}],8:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('MainCtrl', function ($scope, $http, socket, Auth) {
    $scope.Auth = Auth;
    $scope.logout = function(){
      Auth.logout();
    }
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.getColor = function($index) {
      var _d = ($index + 1) % 11;
      var bg = '';

      switch(_d) {
        case 1:       bg = 'red';         break;
        case 2:       bg = 'green';       break;
        case 3:       bg = 'darkBlue';    break;
        case 4:       bg = 'blue';        break;
        case 5:       bg = 'yellow';      break;
        case 6:       bg = 'pink';        break;
        case 7:       bg = 'darkBlue';    break;
        case 8:       bg = 'purple';      break;
        case 9:       bg = 'deepBlue';    break;
        case 10:      bg = 'lightPurple'; break;
        default:      bg = 'yellow';      break;
      }

      return bg;
    };

    $scope.getSpan = function($index) {
      var _d = ($index + 1) % 11;

      if (_d === 1 || _d === 5) {
        return 2;
      }
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.printUser = function(){
      var user = Auth.getCurrentUser();
      console.log(user);
      /*user.then(function(userData){
        console.log(userData);
      }).catch(function(err){
        console.err(err);
      });*/
    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
}
},{}],9:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      });
  });
}
},{}],10:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
    var currentUser = {};
    if($cookieStore.get('token')) {
      currentUser = User.get();
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.save(user,
          function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
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
},{}],11:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
}
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('DialogController', function ($scope, $mdDialog, $http) {
  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

  
  $scope.addThing = function() {
    if($scope.newThing === '') {
      return;
    }
    $http.post('/api/things', { name: $scope.newThing });
    $scope.newThing = '';
    $mdDialog.hide();
  };
});
}
},{}],14:[function(require,module,exports){
'use strict';

module.exports = function(app){
  app.controller('ShellCtrl', function ($mdSidenav, $mdDialog, $scope, $location, Auth) {

    
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };

    var originatorEv;
    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.notificationsEnabled = true;
    $scope.toggleNotifications = function() {
      $scope.notificationsEnabled = !$scope.notificationsEnabled;
    };

    $scope.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Suddenly, a redial')
          .content('You just called a friend; who told you the most amazing story. Have a cookie!')
          .ok('That was easy')
        );
      originatorEv = null;
    };

    $scope.checkVoicemail = function() {
      // This never happens.
    };

    $scope.showAddDialog = function($event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl: 'templates/dialog.html',
        controller: 'DialogController'
      });
    };
  });
}
},{}],15:[function(require,module,exports){
/* global io */
'use strict';

module.exports = function(app){
  app.factory('socket', function(socketFactory) {

    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io('', {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
      path: '/socket.io-client'
    });

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,

      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      }
    };
  });
}
},{}]},{},[7]);
