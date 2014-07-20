'use strict';

angular.module('switchr')
.controller('PlaylistNavController', function ($window, $state, $scope, $stateParams, $rootScope, $location, $timeout, Beats, SwitchrApi, Blog) {
  $scope.userImage = {};
  $scope.nowEditing = Blog.nowEditing;
  $scope.lastIndex = -1;
  
  if ($stateParams['access_token']) $window.localStorage['beats_token'] = $stateParams['access_token'];

  $scope.token = $window.localStorage['beats_user'] || null;
  
  $location.url($location.path());

  $scope.edit = function(trackId, trackName, index){
    $scope.$emit('edit', [trackId, trackName]);
    $scope.lastIndex = index;
  }

  if ($window.localStorage['beats_token']) {      
    Beats.fetchAll($scope, $rootScope).then(function(promise){
      console.log($scope, arguments);
      SwitchrApi.sync($scope).then(function(){console.log(arguments)})
    });
  }
})
.directive('blog', function(){
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
