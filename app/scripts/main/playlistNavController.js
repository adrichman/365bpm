'use strict';

angular.module('switchr')
.controller('PlaylistNavController', function ($window, $state, $scope, $stateParams, $rootScope, $timeout, Blog, UserService) {
  $scope.userImage = UserService.currentUser.img;
  $scope.playlists = UserService.currentUser.playlists;
  $scope.nowEditing = Blog.nowEditing;
  $scope.lastIndex = -1;

  $scope.edit = function(trackId, trackName, index, playlistId){
    var entry = _.find(UserService.currentUser.entries, function(entry){
      return entry.songs_id === trackId && entry.playlists_id === playlistId;
    }) || null;
    var params = [trackId, trackName, index, playlistId];
    if (entry) params[4] = entry.id;
    $scope.$emit('edit', params);
    $scope.lastIndex = index;
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
