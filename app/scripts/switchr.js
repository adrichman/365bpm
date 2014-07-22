'use strict';
var win = {};
var isLoggedIn = function($state, token){
  if (token) {
    return true;
  } else {
    console.log('no cookie')
    return false;
  }
}

angular.module('switchr', ['ngTouch', 'restangular', 'ui.router', 'ngCookies', 'mm.foundation', 'ngAnimate', 'ui.tinymce', 'ngSanitize'])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
  RestangularProvider.setBaseUrl('http://www.fakehost.com:8000/api/v1');

  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'partials/main.html',
      controller: 'MainController'
    })
    .state('home', {
      url: '/home?scope&access_token&token_type&expires_in&state',
      templateUrl: 'partials/home.html',
      controller: 'HomeController',
      resolve : {
        loading : function($window, $q, Restangular, UserService, Beats, SwitchrApi, $rootScope, $stateParams){
                    console.log('STATE PARAMS', $stateParams);
                    if ($stateParams['access_token']){
                      $window.localStorage['beats_token'] = $stateParams['access_token'];
                    }
                    var deferred = $q.defer();  
                    var scope = $rootScope.$new();
                    console.log("SCOPES!!", scope, $rootScope)
                    Beats.fetchAll(scope, $rootScope)
                    .then(function(promise){
                      SwitchrApi.sync(UserService).then(function(){
                        Restangular.one('users', UserService.currentUser.id())
                        .getList('entries')
                        .then(
                          function(data){ 
                            UserService.currentUser.entries = data;
                            deferred.resolve(false); 
                          },
                          function(err){ 
                            console.log('ERR', err);
                            deferred.reject(false); 
                          }
                        );
                      });
                    });
                    return deferred.promise;
      },
      edit : function($q, $stateParams, UserService){
              var deferred = $q.defer();
              if ($stateParams['access_token'] || UserService.currentUser.id()) {
                deferred.resolve(true);
              } else {
                deferred.reject(false);
              }
              return deferred.promise;
            }
      }

    })
    .state('users', {
      url: '/users?id',
      templateUrl: 'partials/users.html',
      controller: 'UsersController',
      resolve: {
        userId : function($q, $stateParams){
                  var deferred = $q.defer();
                  if ($stateParams.id) {
                    deferred.resolve($stateParams.id)
                  } else {
                    deferred.resolve(false);
                  }
                  return deferred.promise;
                }
      }
    })
    .state('main.login', {
      url: 'login',
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    })

  $urlRouterProvider
  .when('/users', function(){
    $state.go('users');
  })
  .otherwise('/');
  $locationProvider.html5Mode(true);

})
.run(function($state, $window, $rootScope, $location){
  $rootScope.currentUser = { token : null };
  $rootScope.logout = function(){
    delete $rootScope.currentUser.token;
    delete $window.localStorage['beats_token'];
    delete $window.localStorage['beats_user'];
    delete $window.localStorage['beats_id'];
    $state.go('main.login');
  }

  $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams){ 

    if (toParams['access_token']) $window.localStorage['beats_token'] = toParams['access_token']; 
    if (toState.name === 'main.login') return;
    if ($window.localStorage['beats_token'] === null || $window.localStorage['beats_token'] === undefined) {
      e.preventDefault();
      $state.go('main.login');
    }
  });
})
.service('UserService', ['$window', 'Restangular', function($window, Restangular){
  return {
    currentUser : {
      token:        function(){ return $window.localStorage['beats_token'] },
      id:           function(){ return $window.localStorage['beats_id'] },
      name:         function(id){ 
                      if (id){
                        Restangular.one('users', id).get().then(function(user){ return user.name });
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
  return {
    fetchAll    : function($scope, $rootScope){
                    var userId;
                    var self = this;
                    var results = {};
                    
                    var deferred = $q.defer();

                    self.getMe().success(function(data){
                      console.log('getMe', data);
                      $scope.currentUser = data.result;
                      userId = data.result.user_context;
                      $window.localStorage['beats_id'] = userId;

                      deferred.resolve($q.all([
                        self.getUser(userId).success(function(userData){
                          console.log('getUser', userData);
                          UserService.currentUser.userData = userData.data;
                          $window.localStorage['beats_user'] = $rootScope.currentUser.name = userData.data['full_name'];
                        }).error(function(){
                          throw new Error({message:'There was an error during the getUser API call.'})
                        }),
                          
                        self.getPlaylists(userId).success(function(playList){
                          console.log('getPlaylists', playList);
                          UserService.currentUser.playlists = playList.data.reverse();
                        }).error(function(){
                          throw new Error({message:'There was an error during the getPlayList API call.'})
                        })
                      ]));
                    }).error(function(){
                      throw new Error({message:'There was an error during the getMe API call.'})
                    });

                    return deferred.promise;
                  },

    getMe       : function(){
                    console.log('BEARER:', $window.localStorage['beats_token'])
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
  return {
    nowEditing : {
      display: '',
      id: '',
      playListId: ''
    }
  }
})
.factory('Models', ['Restangular', function(Restangular){
  console.log(Restangular);
  return {
    users      : Restangular.all('users'),
    songs      : Restangular.all('songs'),
    playlists  : Restangular.all('playlists'),
    entries    : Restangular.all('entries'),
    artists    : Restangular.all('artists')
  };
}])
.service('SwitchrApi', ['Models', '$http', function(Models, $http){
  return {
    sync  : function(UserService){
              return $http.post('http://www.fakehost.com:8000/api/v1/sync', null, {
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
.directive('topNavBar', function(){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/partials/top-nav.html',
    controller: 'TopNavController'
  }
});
