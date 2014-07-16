'use strict';

var isLoggedIn = function($state, token){
  if (token) {
    return true;
  } else {
    console.log('no cookie')
    return false;
  }
}

angular.module('switchr', ['ngTouch', 'restangular', 'ui.router', 'ngCookies', 'mm.foundation', 'ngAnimate'])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  
  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'partials/main.html',
      controller: 'MainController',
      resolve : {
        currentUser: function(UserService){
          return UserService.currentUser;
        }
      }
    })
    .state('home', {
      url: '/home?scope&access_token&token_type&expires_in&state',
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    })
    .state('main.login', {
      url: 'login',
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    })
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
})
.run(function($state, $window, $rootScope, $location){
  $rootScope.currentUser = {};
  $rootScope.logout = function(){
    $rootScope.currentUser.user = null
    $window.localStorage['beats_token'] = null;
    $window.localStorage['beats_user'] = null;
  }
})
.service('UserService', function(){
  return {
    currentUser : 'Adam'
  }
})
