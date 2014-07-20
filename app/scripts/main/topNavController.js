'use strict';

angular.module('switchr')
.controller('TopNavController', ['$window', '$state', '$scope', '$stateParams', '$timeout', '$rootScope', function ($window, $state, $scope, $stateParams, $timeout, $rootScope) {
  // if ($stateParams['access_token']) $cookies['beats_token'] = $stateParams['access_token'];

  // if(!$cookies['beats_token'] || !$state.$current.resolve.isAuthorized($state, $cookies['beats_token'])) {
    // $state.go('login');
  // }
  $rootScope.currentUser.user = $window.localStorage['beats_user'] || null ;
  $rootScope.currentUser = {};
  $rootScope.logout = function(){
    $rootScope.currentUser.user = null;
    $window.localStorage['beats_token'] = null;
    $window.localStorage['beats_user'] = null;
    $state.go('login');
  }
}]);
