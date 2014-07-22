'use strict';

angular.module('switchr')
.controller('PlaylistNavController', function ($window, $state, $scope, $stateParams, $rootScope, $timeout, Blog, UserService, Beats, Restangular) {
  console.log($state)
  $scope.activeTracks = {};
  $scope.userImage = $stateParams.id ? Beats.getUserImage($stateParams.id) : UserService.currentUser.img;
  
  // check for user detail view, or edit view
  if ($state.current.name === "users") {
    
    Beats.getPlaylists($stateParams.id)
    .then(function(playlists){
      
      $scope.playlists = playlists.data.data.reverse();
      
      Restangular.one('users', $stateParams.id).all('entries').getList()
      .then(function(list){
        
        UserService.currentUser.entries = list;
        
        $scope.playlists.forEach(function(playlist){
          playlist.refs.tracks.forEach(function(track){

            var entries = _.filter(UserService.currentUser.entries, function(entry){
              return track.id === entry.songs_id;
            });

            entries.forEach(function(entry){ $scope.activeTracks[entry.songs_id] = true });

          })
        })
      })
    })

  } else { 
    $scope.editing = true;
    $scope.playlists = UserService.currentUser.playlists; 
  }

  $scope.nowEditing = Blog.nowEditing;
  $scope.lastIndex = -1;


  $scope.playlistSelect = function(trackId, trackName, index, playlistId){
    var entry = _.find(UserService.currentUser.entries, function(entry){
      return entry.songs_id === trackId && entry.playlists_id === playlistId;
    }) || null;
    var params = [trackId, trackName, index, playlistId];
    if (entry) params[4] = entry.id;
    $scope.$emit('playlistSelect', params);
    $scope.lastIndex = index;
  }
})

.directive('editBlog', function($window){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/edit-blog.html',
    controller: 'EditBlogController'
  }
})
.directive('readBlog', function($window){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/read-blog.html',
    controller: 'ReadBlogController'
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
