'use strict';

angular.module('switchr')
.controller('HomeController', function ($window, $state, $scope, $stateParams, $rootScope, $http, $location, $timeout, UserService, loading, edit ) {
  $rootScope.loading = loading;
  $scope.edit = edit;
  
  if ($stateParams.id) {
    $scope.currentUser.id = $stateParams.id;
  }

  $scope.currentUser.token = UserService.currentUser.token() || null;
  $scope.$watch('currentUser', function(newVal, oldVal){
    $scope.currentUser = newVal;
  })
  $rootScope.$watch('loading', function(newVal, oldVal){
    $rootScope.loading = newVal;
  })

  $location.url($location.path());
});
