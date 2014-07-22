angular.module('switchr')
.controller('ReadBlogController', ['$state','$scope','$stateParams', '$rootScope', 'Blog','UserService','Restangular','$modal','Beats', function ($state, $scope, $stateParams, $rootScope, Blog, UserService, Restangular, $modal, Beats) {
  $scope.nowReading = {};
  $scope.$on('playlistSelect', function(e, data){
    $scope.nowReading.id = data[0];
    $scope.nowReading.display = Blog.nowEditing.display = data[1];
    Beats.getTrackInfo($scope.nowReading.id).then(function(track){
      console.log(track)
      $scope.nowReading.track = track.data.data;
    });
    $scope.nowReading.playListId = data[3];
    $scope.nowReading.entry_id = data[4] || null;
    Restangular.one('entries', $scope.nowReading.entry_id).get().then(function(entry){
      $scope.nowReading.entry = entry.body;
    })
    console.log('NOW SELECTED ENTRY:', data);
  });
}]);