'use strict';

angular.module('switchr')
.controller('TopNavController', ['$window', '$state', '$scope', '$stateParams', '$timeout', '$rootScope', 'Restangular','UserService', 'Beats', function ($window, $state, $scope, $stateParams, $timeout, $rootScope, Restangular, UserService, Beats) {
  Beats.getUser($stateParams.id)
  .then(function(user){
    console.log('BEATS USER', user);
  });
  
  $scope.currentUser.token = UserService.currentUser.token() || null ;

}])
