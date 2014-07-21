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

angular.module('switchr', ['ngTouch', 'restangular', 'ui.router', 'ngCookies', 'mm.foundation', 'ngAnimate', 'ui.tinymce'])
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
      controller: 'HomeController'
    })
    .state('main.login', {
      url: 'login',
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    })
    .state('users', {
      url: '/users',
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    })
    .state('users.detail', {
      url: '/users/{id}',
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    })

  $urlRouterProvider.otherwise('/');
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
.service('UserService', ['$window', function($window){
  return {
    currentUser : {
      token:  function(){ return $window.localStorage['beats_token'] },
      id:     function(){ return $window.localStorage['beats_id'] },
      name:   function(){ return $window.localStorage['beats_user'] }
    }
  }
}])
.service('Beats', function($window, $http, $q){
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
                          $scope.userData = userData.data;
                          $scope.name = $rootScope.currentUser.name = userData.data['full_name'];
                          $window.localStorage['beats_user'] = $rootScope.currentUser.name;
                        }).error(function(){
                          throw new Error({message:'There was an error during the getUser API call.'})
                        }),
                          
                        self.getPlaylists(userId).success(function(playList){
                          console.log('getPlaylists', playList);
                          $scope.playlists = playList.data.reverse();
                          $scope.userImage.url  = 'https://partner.api.beatsmusic.com/v1/api/users/' + userId + 
                                                  '/images/default?client_id=eunjtjg4755smmz8q942e9kp';
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
    sync  : function(scope){
              console.log('sync scope', scope);
              return $http.post('http://www.fakehost.com:8000/api/v1/sync', null, {
                params: {
                  currentUser : scope.currentUser,
                  userData    : scope.userData,
                  playlists   : scope.playlists
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
