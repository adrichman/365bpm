'use strict';

angular.module('switchr')
.controller('PlaylistNavController', function ($window, $state, $scope, $stateParams, $rootScope, $timeout, Beats, SwitchrApi, Blog, UserService) {
  $scope.userImage = {};
  $scope.nowEditing = Blog.nowEditing;
  $scope.lastIndex = -1;
  $scope.loading = true;

  $scope.edit = function(trackId, trackName, index, playlistIndex){
    $scope.$emit('edit', [trackId, trackName, playlistIndex]);
    $scope.lastIndex = index;
  }

  if (UserService.currentUser.token()) {      
    Beats.fetchAll($scope, $rootScope).then(function(promise){
      SwitchrApi.sync($scope).then(function(){
        console.log(arguments);
        $scope.loading = false;
      })
    });
  }
})
.directive('blog', function($window){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/blog.html',
    controller: 'BlogController'
  }
})
.directive('playlistNav', function(){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/partials/playlist-nav.html',
    controller: 'PlaylistNavController'
  }
});
