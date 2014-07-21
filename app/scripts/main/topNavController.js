'use strict';

angular.module('switchr')
.controller('TopNavController', ['$window', '$state', '$scope', '$stateParams', '$timeout', '$rootScope', 'Restangular','UserService', function ($window, $state, $scope, $stateParams, $timeout, $rootScope, Restangular, UserService) {
  $rootScope.currentUser.name = UserService.currentUser.name() || null ;
  $rootScope.currentUser.token = UserService.currentUser.token() || null ;
  $window.rest = Restangular;
  console.log('in here');
}])
