app.controller('GuidesController', function($scope, $http){
    $scope.guides = [];
    function getOwnGuides(){
        $http.get('/guides/posted').then(function(res){
            $scope.guides = res.data;
        }).catch(function(err){

        });
    }

    getOwnGuides();

    $scope.deleteGuide = function(id){
        if(confirm('Are you sure you want to delete this post?')){
            $http.delete('/guides/delete/' + id).then(function(res){
                $scope.message = res.data.message;
                getOwnGuides();
            }).catch(function(err){

            });
        }
    }
});