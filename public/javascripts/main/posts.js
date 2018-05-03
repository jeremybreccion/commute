app.controller('PostsController', function($scope, $http){
    $scope.posts = [];
    function getOwnPosts(){
        $http.get('/posts/posted').then(function(res){
            $scope.posts = res.data;
        }).catch(function(err){

        });
    }

    getOwnPosts();

    $scope.deletePost = function(id){
        if(confirm('Are you sure you want to delete this post?')){
            $http.delete('/posts/delete/' + id).then(function(res){
                $scope.message = res.data.message;
            }).catch(function(err){

            });
        }
    }
});