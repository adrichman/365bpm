'use strict';

angular.module('switchr')
.controller('UsersController', function($scope, $rootScope, userId, Beats, Restangular, UserService){
  // $rootScope.loading = false;
  $scope.userId = userId;
  $scope.userImage = Beats.getUserImage(userId);
  $scope.users = [];
  console.log($scope.userImage);
  if (!userId) {
    Restangular.all('users').getList().then(function(users){
      users.forEach(function(user){ 
        $scope.userImage = UserService.currentUser.img(user.id);
        $scope.users.push(user);
      });
    })
  }
  // Beats.getUser($scope.user).then(function(data){
    // $scope.userData = data.data;
    // console.log(data)
  // })
  // $scope.playlists = UserService.currentUser.playlists;
  // $scope.lastIndex = -1;
})
