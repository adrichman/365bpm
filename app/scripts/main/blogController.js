'use strict';

angular.module('switchr')
.controller('BlogController', ['$state','$scope','$stateParams', '$rootScope', 'Blog','UserService','Restangular', function ($state, $scope, $stateParams, $rootScope, Blog, UserService, Restangular) {
  var entries;

  Restangular.one('users', UserService.currentUser.id())
  .getList('entries')
  .then(function(data){ entries = data });

  $scope.$on('edit', function(e, data){
    Blog.nowEditing.id = data[0];
    $scope.nowEditing.display = Blog.nowEditing.display = data[1];
    Blog.nowEditing.playListId = data[3];
  });

  $scope.blogEditInput = {}; 
  $scope.blogEditInput.input = "THIS IS TEST INPUT FOR " + Blog.nowEditing.display;

  $scope.$watch('nowEditing.display', function(newVal, oldVal, scope){
    
      var match = _.find(entries, function(entry){
        console.log(entry.song_id, Blog.nowEditing.id)
        return entry.song_id === Blog.nowEditing.id
      });

      if (match) {
        scope.blogEditInput.input = match.body;          
      } else {
        scope.blogEditInput.input = "I have something to say about " + newVal + "."
      }

  });

  $scope.tinymceOptions = {
    theme: "modern",
    skin: "light",
    // plugins: [
    //   "advlist autolink lists link image charmap print preview hr anchor pagebreak",
    //   "searchreplace visualblocks visualchars code fullscreen",
    //   "insertdatetime media nonbreaking save table contextmenu directionality",
    //   "emoticons template paste textcolor"
    // ],
    toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
    toolbar2: "print preview media | forecolor backcolor emoticons",
    image_advtab: true,
    height: "300px",
    width: "650px"
  };

  $scope.submitForm = function(){
    Restangular
    .one("users", UserService.currentUser.id())
    .all("entries").post({
      title: Blog.nowEditing.display, 
      body: $scope.blogEditInput.input,
      user_id: UserService.currentUser.id(),
      song_id: Blog.nowEditing.id,
      playlist_id: Blog.nowEditing.playListId
    });
  }
}]);
