'use strict';

angular.module('switchr')
.service('UserService', ['$window', 'Restangular', function($window, Restangular){

  ///////////////////////////////////////////////////////////
  // Service to maintain global state of the current User  //
  ///////////////////////////////////////////////////////////

  return {
    currentUser : {
      token:        function(){ return $window.localStorage['beats_token'] },
      id:           function(){ return $window.localStorage['beats_id'] },
      name:         function(id){ 
                      if (id){
                        return Restangular.one('users', id).get();
                      } else { 
                        return $window.localStorage['beats_user'] 
                      }
      },
      userData:     {},
      img:          function(userId){
                      userId = userId || $window.localStorage['beats_id'];
                      return {
                        url : 'https://partner.api.beatsmusic.com/v1/api/users/' + 
                        userId + '/images/default?client_id=eunjtjg4755smmz8q942e9kp'
                      }
      },
      playlists:    [],
      entries:      []
    }
  }
}])
.service('Beats', function($window, $http, $q, UserService){

  ///////////////////////////////////////////////////////////////////////////////
  // Call all Beats API helper methods with dependencies on synchronus returns //
  ///////////////////////////////////////////////////////////////////////////////

  return {
    fetchAll    : function($scope, $rootScope){
                    var userId;
                    var self = this;
                    var results = {};
                    
                    var deferred = $q.defer();

                    ///////////////////////////////////////////////////////////
                    // Make async call to Beats for authorized user's data   //
                    ///////////////////////////////////////////////////////////
                    self.getMe().success(function(data){
                        $scope.currentUser = data.result;
                        userId = data.result.user_context;
                        $window.localStorage['beats_id'] = userId;
        
                        ///////////////////////////////////////////////////////////////////////////////////
                        // Upon return, make requests for User's profile and User's Playlists from Beats //
                        ///////////////////////////////////////////////////////////////////////////////////
                        
                        deferred.resolve($q.all([
                            self.getUser(userId).success(function(userData){
                              UserService.currentUser.userData = userData.data;
                              $window.localStorage['beats_user'] = $rootScope.currentUser.name = userData.data['full_name'];
                            }).error(function(){
                              throw new Error({message:'There was an error during the getUser API call.'})
                            }),
                              
                            self.getPlaylists(userId).success(function(playList){
                              UserService.currentUser.playlists = playList.data.reverse();
                            }).error(function(){
                              throw new Error({message:'There was an error during the getPlayList API call.'})
                            })
                        ]))
                    }).error(function(){
                      throw new Error({message:'There was an error during the getMe API call.'})
                    });

                    return deferred.promise;
                  },

    //////////////////////////////////////////////////////
    // Helper Methods for Beats API                     //
    //////////////////////////////////////////////////////
    getMe       : function(){
                    return $http.get('https://partner.api.beatsmusic.com/v1/api/me', 
                      { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } } 
                    );
                  },

    getUser     : function(userId){
                    return $http.get('https://partner.api.beatsmusic.com/v1/api/users/' + userId + "?" + $window.localStorage['beats_token'], 
                      { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } }
                    );
                  },

    getPlaylists: function(userId){
                    return $http.get('https://partner.api.beatsmusic.com/v1/api/users/' + userId + "/playlists?order_by=created_at%20desc&access_token=" + $window.localStorage['beats_token'],
                      { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } }
                    );
                  },
    getUserImage: function(userId){
                    return { url : 'https://partner.api.beatsmusic.com/v1/api/users/' + userId + '/images/default?client_id=eunjtjg4755smmz8q942e9kp'};
                    { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } }
                  },
    getTrackInfo: function(trackId){
                    return $http.get('https://partner.api.beatsmusic.com/v1/api/tracks/' + trackId + '?client_id=eunjtjg4755smmz8q942e9kp', 
                      { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } } 
                    );
                  }
  };
})
.service('Blog', function(){

  ////////////////////////////////////////////////////////////////////////////
  // Service to maintain global state of the current user's blog navigation //
  ////////////////////////////////////////////////////////////////////////////
  return {
    nowEditing : {
      display: '',
      id: '',
      playListId: ''
    }
  }
})
.service('SwitchrApi', ['$http', function($http){
  return {
  
  ///////////////////////////////////////////////////////////
  // Helper method to save all Beats data to the app's DB  //
  ///////////////////////////////////////////////////////////   
    sync  : function(UserService){
              return $http.post('http://beats-365bpm.herokuapp.com/api/v1/sync', null, {
                params: {
                  currentUser : UserService.currentUser,
                  userData    : UserService.currentUser.userData,
                  playlists   : UserService.currentUser.playlists
                }
              });
              win.user = scope;
            }
  }
}])