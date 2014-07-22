'use strict';

angular.module('switchr')
.controller('UsersController', function($scope, $rootScope, userId, Beats, Restangular, UserService){
  $scope.userId = userId;
  $scope.userImage = Beats.getUserImage(userId);
  $scope.users = [];
  
  // Make request for all users if no userId param in the route
  if (!userId) {
    Restangular.all('users').getList().then(function(users){
      users.forEach(function(user){ 
        $scope.userImage = UserService.currentUser.img(user.id);
        $scope.users.push(user);
      });
    })
  }
})
