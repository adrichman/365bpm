'use strict';

angular.module('switchr')
  .controller('HomeController', function ($window, $state, $scope, $stateParams, $rootScope, $http, $location, $timeout) {
    $scope.userImage = {};
    $scope.oneAtATime = true;
    if ($stateParams['access_token']) $window.localStorage['beats_token'] = $stateParams['access_token'];
    console.log('$window.localStorage', $window.localStorage)
    // if(!$cacheFactory['beats_token'] || !$state.$current.resolve.isAuthorized($state, $cacheFactory['beats_token'])) {
      // $state.go('login');
    // }
      $scope.token = $window.localStorage['beats_user'] || null;
      $rootScope.currentUser.user = $scope.token;
      $location.url($location.path());
      if ($window.localStorage['beats_token']) {
        $http.get('https://partner.api.beatsmusic.com/v1/api/me', { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } } )
        .success(function(data){
          console.log(arguments);
          $http.get('https://partner.api.beatsmusic.com/v1/api/users/' + data.result.user_context + "?" + $window.localStorage['beats_token'], { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } })
          .success(function(userData){
            console.log(arguments);
            $scope.token = $rootScope.currentUser.user = userData.data['full_name'];
            $window.localStorage['beats_user'] = $rootScope.currentUser.user;
          })
          .error(function(){})
          $http.get('https://partner.api.beatsmusic.com/v1/api/users/' + data.result.user_context + "/playlists?order_by=created_at%20desc&access_token=" + $window.localStorage['beats_token'], { headers: { Authorization: "Bearer " + $window.localStorage['beats_token'] } })
          .success(function(playList){
            console.log(arguments);
            $scope.playlists = playList.data.reverse();
            $scope.userImage.url = 'https://partner.api.beatsmusic.com/v1/api/users/' + data.result.user_context + "/images/default?client_id=eunjtjg4755smmz8q942e9kp";
          })
          .error(function(){})
        })
        .error(function(){})
      }
      // $scope.$digest();
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
    controller: 'HomeController'
  }
});
