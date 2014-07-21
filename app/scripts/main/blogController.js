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
   $scope.tinymceOptions = {
        theme: "modern",
        skin: "light",
        plugins: [
            "advlist autolink lists link image charmap print preview hr anchor pagebreak",
            "searchreplace visualblocks visualchars code fullscreen",
            "insertdatetime media nonbreaking save table contextmenu directionality",
            "emoticons template paste textcolor"
        ],
        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
        toolbar2: "print preview media | forecolor backcolor emoticons",
        image_advtab: true,
        height: "300px",
        width: "650px"
    };
}]);
