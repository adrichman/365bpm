'use strict';

angular.module('switchr')
.controller('HomeController', function ($window, $state, $scope, $stateParams, $rootScope, $http, $location, $timeout, UserService) {
  if ($stateParams['access_token']) $window.localStorage['beats_token'] = $stateParams['access_token'];
  $rootScope.currentUser.token = UserService.currentUser.token() || null;
  $rootScope.$watch('currentUser', function(newVal, oldVal){
    console.log('current user watch in home', arguments)
    $rootScope.currentUser = newVal;
  })
  $location.url($location.path());
});
