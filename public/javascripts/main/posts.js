app.controller('PostsController', function($scope, $http){
    $scope.posts = [];
    function getOwnPosts(){
        $http.get('/posts/getOwnPosts').then(function(res){
            $scope.posts = res.data;
        }).catch(function(err){

        });
    }

    getOwnPosts();
});