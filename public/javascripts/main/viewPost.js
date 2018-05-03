app.controller('ViewPostController', function($scope, $http, $stateParams, $rootScope, $filter){
    $scope.post = {};
    $scope.commentForm = '';

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
            else{
                $scope.isLiked = null;
            }
        }).catch(function(err){
            $scope.message = err.data.message;
            $scope.isLiked = null;
        });
    }

    getPost();

    //converts date string for sorting comments
    $scope.toDate = function(date){
        return new Date(date);
    }

    $scope.likePost = function(){
        //no need to pass current user since server already knows from session
        $http.put('/posts/likePost/' + $scope.post._id).then(function(){
            getPost();
        }).catch(function(err){
            $scope.isLiked = null;
        });
    }

    $scope.dislikePost = function(){
        //no need to pass current user since server already knows from session
        $http.put('/posts/dislikePost/' + $scope.post._id).then(function(){
            getPost();
        }).catch(function(err){
            $scope.isLiked = null;
        });
    }

    $scope.comment = function(){
        var commentBody = {
            postID: $scope.post._id,
            comment: {
                text: $scope.commentForm,
                date: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm')
            }
        }

        $http.put('/posts/comment', commentBody).then(function(){
            $scope.commentForm = '';
            getPost();
        }).catch(function(err){

        });
    }

    $scope.deleteComment = function(id){
        $http.put('/posts/deleteComment/' + id).then(function(){
            getPost();
        }).catch(function(err){

        });
    }
});