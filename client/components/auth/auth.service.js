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
