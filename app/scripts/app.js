'use strict';

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
        
        var deferred = $q.defer();  
        var scope = $rootScope.$new();

        ///////////////////////////////////////////////////////////////////////////////
        // Resolve the home state's loading status once all API calls have been made //
        ///////////////////////////////////////////////////////////////////////////////
        
        if ($stateParams['access_token']){
          $window.localStorage['beats_token'] = $stateParams['access_token'];
        }
        
        // First, all beats data
        Beats.fetchAll(scope, $rootScope).then(function(promise){
            
            // then, switchr API for the authenticated user's blog entries
            SwitchrApi.sync(UserService).then(function(){
                Restangular.one('users', UserService.currentUser.id()).getList('entries').then(
                  // on success
                  function(data){ 
                    UserService.currentUser.entries = data;
                    deferred.resolve(false); 
                  },
                  // on error
                  function(err){ 
                    console.log('ERR', err);
                    deferred.reject(false); 
                  }
                );
            });
        });
        return deferred.promise;
    },

    edit: function($q, $stateParams, UserService){
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

  // handle path to /users when not transitioning from another state
  $urlRouterProvider.when('/users', function(){
    $state.go('users');
  })
  .otherwise('/');
  
  $locationProvider.html5Mode(true);

})
.run(function($state, $window, $rootScope, $location){
  $rootScope.currentUser = { token : null, name : '' };
  
  // destroy all the tokens  
  $rootScope.logout = function(){
    delete $rootScope.currentUser.token;
    delete $window.localStorage['beats_token'];
    delete $window.localStorage['beats_user'];
    delete $window.localStorage['beats_id'];
    $state.go('main.login');
  }

  // some client side route protection never hurt anybody!
  $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams){ 
    console.log(arguments);
    if (toState.name !== 'users'){
      if (toParams['access_token']) $window.localStorage['beats_token'] = toParams['access_token']; 
      if (toState.name === 'main.login') return;
      if ($window.localStorage['beats_token'] === null || $window.localStorage['beats_token'] === undefined) {
        e.preventDefault();
        $state.go('main.login');
      }
    }
  });
})
