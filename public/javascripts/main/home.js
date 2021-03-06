app.controller('HomeController', function($scope, $http, $rootScope){
    $scope.search = function(){
        var searchObject = {
            from: $scope.search.from,
            to: $scope.search.to
        }
        $http.post('/guides/search', searchObject).then(function(res){
            $scope.guides = res.data;
        }).catch(function(err){
            $scope.message = err.data.message;
        });
    }
});