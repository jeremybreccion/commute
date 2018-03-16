app.controller('PostController', function($scope, $stateParams){
    $scope.message = $stateParams._id;
});