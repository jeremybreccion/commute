app.controller('ViewPostController', function($scope, $stateParams){
    $scope.message = $stateParams._id;
});