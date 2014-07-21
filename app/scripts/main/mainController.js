'use strict';

angular.module('switchr')
.controller('MainController', ['$state', '$scope', '$stateParams', '$timeout', '$rootScope', 'UserService', function ($state, $scope, $stateParams, $timeout, $rootScope, UserService) {
    $scope.go = function(state){
      $state.go(state);
    }
}]);
