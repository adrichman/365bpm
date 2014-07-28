'use strict';

angular.module('switchr')
.controller('PlaylistNavController', function ($window, $state, $scope, $stateParams, $rootScope, $timeout, Blog, UserService, Beats, Restangular) {
  $scope.activeTracks = {};
  $scope.userImage = $stateParams.id ? Beats.getUserImage($stateParams.id) : UserService.currentUser.img();
  
  // check for user detail view, or edit view
  if ($state.current.name === "users") {
    
    var userId = $stateParams.id;

    Restangular.one('users', userId).get().then(function(user){
      $scope.currentUser =  user;
    })
    
    // Get user's playlists
    Beats.getPlaylists(userId)
    .success(function(playlists){
      $scope.playlists = playlists.data.reverse();
    })
    .catch(function(){
      Restangular.one('users', userId).getList('playlists').then(function(playlists){
        $scope.playlists = playlists;
        Restangular  
      })
    })
    .finally(function(){
      // retrieve the user info from switchr DB

      // retrieve all entries for the current user
      Restangular.one('users', $stateParams.id)
      .all('entries').getList().then(function(list){
        
        // store the entries response on the UserService
        UserService.currentUser.entries = list;
        
        // iterate through the playlists' tracks and evaluate which
        // tracks in the playlists also have entries
        // store the tracks with current user's entries in activeTracks
        var tracks = [];
        $scope.playlists.forEach(function(playlist){
          if (playlist.refs){
            tracks = playlist.refs.tracks;
          } else {
            Restangular.all('songs').getList().then(function(songs){
              songs.forEach(function(song){
                debugger;
                tracks = tracks.concat(_.where(playlist, { id : song.id }));
              })
            })
          }
          tracks.forEach(function(track){

            var entries = _.filter(UserService.currentUser.entries, function(entry){
              return track.id === entry.songs_id;
            });

            entries.forEach(function(entry){ $scope.activeTracks[entry.songs_id] = true });
          })
        })
      })
    })

  } else { 
    // edit view, "home" state
    $scope.editing = true;
    $scope.playlists = UserService.currentUser.playlists; 
  }

  $scope.nowEditing = Blog.nowEditing;
  
  // store the last clicked index in order to apply the selected class
  $scope.lastIndex = -1;


  $scope.playlistSelect = function(trackId, trackName, index, playlistId){
    
    // update the blog view with the current entry via the playlist
    var entry = _.find(UserService.currentUser.entries, function(entry){
      return entry.songs_id === trackId && entry.playlists_id === playlistId;
    }) || null;

    var params = [trackId, trackName, index, playlistId];
    
    if (entry) params[4] = entry.id;
    $scope.$emit('playlistSelect', params);
    $scope.lastIndex = index;
  }
})
