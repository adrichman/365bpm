'use strict';

angular.module('switchr')
  .controller('MainController', ['$window', '$state', '$scope', '$stateParams', '$timeout', '$rootScope', function ($window, $state, $scope, $stateParams, $timeout, $rootScope) {
      // if ($stateParams['access_token']) $cookies['beats_token'] = $stateParams['access_token'];
  
      // if(!$cookies['beats_token'] || !$state.$current.resolve.isAuthorized($state, $cookies['beats_token'])) {
        // $state.go('login');
      // }
      $rootScope.currentUser.user = $window.localStorage['beats_user'] || null ;
  
        // $timeout(function(){
          // $state.go('login')
        // }, 2000);
    }]);
