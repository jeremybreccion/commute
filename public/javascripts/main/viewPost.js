app.controller('ViewPostController', function($scope, $http, $stateParams, $rootScope){
    $scope.post = {};
    //initialize as null (for both neither liked nor disliked)
    $scope.isLiked = null;
    function getPost(){
        $http.post('/posts/viewPost', {id: $stateParams._id}).then(function(res){
            $scope.post = res.data;
    
            //method for setting the active class for like/dislike button
            if($scope.post.likes.indexOf($rootScope.current_user.username) != -1){
                $scope.isLiked = true;
            }
            else if($scope.post.dislikes.indexOf($rootScope.current_user.username) != -1){
                $scope.isLiked = false;
            }
        }).catch(function(err){
            $scope.message = err.data.message;
        });
    }

    getPost();

    $scope.likePost = function(){
        //no need to pass current user since server already knows from session
        $http.put('/posts/likePost/' + $scope.post._id).then(function(){
            $scope.isLiked = true;
        }).catch(function(err){
            $scope.isLiked = null;
        }).finally(function(){
            getPost();
        });
    }

    $scope.dislikePost = function(){

    }
});