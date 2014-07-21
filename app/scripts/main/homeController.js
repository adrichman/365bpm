'use strict';

angular.module('switchr')
.controller('HomeController', function ($window, $state, $scope, $stateParams, $rootScope, $http, $location, $timeout, UserService, loading ) {
  $rootScope.loading = loading;
  $scope.currentUser.token = UserService.currentUser.token() || null;
  $scope.$watch('currentUser', function(newVal, oldVal){
    console.log('current user watch in home', arguments)
    $scope.currentUser = newVal;
  })
  $rootScope.$watch('loading', function(newVal, oldVal){
    console.log('LOADING watch in home', arguments)
    $rootScope.loading = newVal;
  })

  $location.url($location.path());
});
