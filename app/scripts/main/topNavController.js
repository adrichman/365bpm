'use strict';

angular.module('switchr')
.controller('TopNavController', ['$window', '$state', '$scope', '$stateParams', '$timeout', '$rootScope', 'Restangular','UserService', function ($window, $state, $scope, $stateParams, $timeout, $rootScope, Restangular, UserService) {

  $scope.currentUser.token = UserService.currentUser.token() || null ;

}])
