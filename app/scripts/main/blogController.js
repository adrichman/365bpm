'use strict';

angular.module('switchr')
  .controller('BlogController', ['$window', '$state','$scope','$stateParams', '$rootScope', function ($window, $state, $scope, $stateParams, $rootScope) {
    console.log(arguments);
    // if ($cacheFactory['beats_token']) {
      // $state.go('home')
    // };
    $rootScope.currentUser.user = $window.localStorage['beats_user'] || null;
  }]);
