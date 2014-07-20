'use strict';

angular.module('switchr')
.controller('BlogController', ['$window', '$state','$scope','$stateParams', '$rootScope', 'Blog', function ($window, $state, $scope, $stateParams, $rootScope, Blog) {
  console.log(arguments);
  // if ($cacheFactory['beats_token']) {
    // $state.go('home')
  // };

  $scope.$on('edit', function(e, data){
    Blog.nowEditing.id = data[0];
    $scope.nowEditing.display = Blog.nowEditing.display = data[1];
  });
  
  $rootScope.currentUser.user = $window.localStorage['beats_user'] || null;
}]);
