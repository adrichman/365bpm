'use strict';

angular.module('switchr')
.controller('BlogController', ['$state','$scope','$stateParams', '$rootScope', 'Blog','UserService','Restangular','$modal', function ($state, $scope, $stateParams, $rootScope, Blog, UserService, Restangular, $modal) {
  $scope.submitText = "Submit";
  $scope.entries = UserService.currentUser.entries;

  $scope.$on('edit', function(e, data){
    Blog.nowEditing.id = data[0];
    $scope.nowEditing.display = Blog.nowEditing.display = data[1];
    Blog.nowEditing.playListId = data[3];
    Blog.nowEditing.entry_id = data[4] || null;
    console.log('NOW EDITING ENTRY:', Blog.nowEditing.entry_id);
  });

  $scope.blogEditInput = {}; 
  $scope.blogEditInput.input = "THIS IS TEST INPUT FOR " + Blog.nowEditing.display;

  $scope.$watch('nowEditing.display', function(newVal, oldVal, scope){
    var entry = _.find($scope.entries, function(entry){
      return entry.id === Blog.nowEditing.entry_id
    });

    if (entry) {
      scope.blogEditInput.input = entry.body;
      scope.blogEditInput.entry_id = entry.id;       
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
    console.log('ENTRIES', $scope.entries)
    console.log('NOW EDITING', Blog.nowEditing)
    $scope.submitText = "Saving...";
    
    var method = Blog.nowEditing.entry_id ? 'patch' : 'post';
    var oneOrAll = Blog.nowEditing.entry_id ? 'one' : 'all';
    
    Restangular
    .one("users", UserService.currentUser.id())
    [oneOrAll]("entries", $scope.blogEditInput.entry_id)
    [method]({
      title: Blog.nowEditing.display, 
      body: $scope.blogEditInput.input,
      users_id: UserService.currentUser.id(),
      songs_id: Blog.nowEditing.id,
      playlists_id: Blog.nowEditing.playListId
    })
    .then(
    function(){ 
      $modal.open({
        templateUrl: 'partials/modal.html',
        controller: 'ModalInstanceCtrl'
      })
      .result.then(function () {
        $scope.submitText = "Submit";
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });
    }, 
    function(){ $scope.submitText = "Error!"});
  }
}])
.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
