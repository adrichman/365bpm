'use strict';

angular.module('switchr')
.controller('UsersController', function($scope, $rootScope, userId, Beats){
  // $rootScope.loading = false;
  $scope.userId = userId;
  $scope.userImage = Beats.getUserImage(userId);

  // Beats.getUser($scope.user).then(function(data){
    // $scope.userData = data.data;
    // console.log(data)
  // })
  // $scope.playlists = UserService.currentUser.playlists;
  // $scope.lastIndex = -1;
})
