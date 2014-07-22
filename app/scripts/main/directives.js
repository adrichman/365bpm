'use strict';

angular.module('switchr')
.directive('topNavBar', function(){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: '/partials/top-nav.html',
    controller: 'TopNavController'
  }
})
.directive('editBlog', function($window){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/edit-blog.html',
    controller: 'EditBlogController'
  }
})
.directive('readBlog', function($window){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/read-blog.html',
    controller: 'ReadBlogController'
  }
})
.directive('playlistNav', function(){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/playlist-nav.html',
    controller: 'PlaylistNavController'
  }
})
.directive('userImage', function(){
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'partials/user-image.html',
    scope: {
      userImage : '=',
      loading   : '='
    }
  }
})