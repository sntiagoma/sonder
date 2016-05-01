'use strict';

var app = angular.module('Sonder', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'ngMessages',
        'btford.socket-io',
        'ui.router',
        'imageCropper'
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
require("./admin/admin.controller.js")(app);
require("./admin/admin.js")(app);
require("./main/main.controller.js")(app);
require("./main/main.js")(app);
require("../components/mongoose-error/mongoose-error.directive.js")(app);
require("../components/socket/socket.service.js")(app);
require("./media/books/books.controller.js")(app);
require("./media/places/places.controller.js")(app);
require("./media/music/music.controller.js")(app);
require("./media/movies/movies.controller.js")(app);
require("./media/shows/shows.controller.js")(app);
require("./media/search/search.controller.js")(app);
require("./media/media.js")(app);
module.exports = app;
