app.controller('ViewGuideController', function($scope, $http, $stateParams, $rootScope, $filter){
    $scope.guide = {};
    $scope.commentForm = '';

    //initialize as null (for both neither liked nor disliked)
    $scope.isLiked = null;
    function getGuide(){
        $http.post('/guides/view', {id: $stateParams._id}).then(function(res){
            $scope.guide = res.data;
    
            //method for setting the active class for like/dislike button
            if($scope.guide.likes.indexOf($rootScope.current_user.username) != -1){
                $scope.isLiked = true;
            }
            else if($scope.guide.dislikes.indexOf($rootScope.current_user.username) != -1){
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

    getGuide();

    //converts date string for sorting comments
    $scope.toDate = function(date){
        return new Date(date);
    }

    $scope.likeGuide = function(){
        //no need to pass current user since server already knows from session
        $http.put('/guides/like/' + $scope.guide._id).then(function(){
            getGuide();
        }).catch(function(err){
            $scope.isLiked = null;
        });
    }

    $scope.dislikeGuide = function(){
        //no need to pass current user since server already knows from session
        $http.put('/guides/dislike/' + $scope.guide._id).then(function(){
            getGuide();
        }).catch(function(err){
            $scope.isLiked = null;
        });
    }

    $scope.comment = function(){
        var commentBody = {
            guideID: $scope.guide._id,
            comment: {
                text: $scope.commentForm,
                date: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm')
            }
        }

        $http.put('/guides/comment', commentBody).then(function(){
            $scope.commentForm = '';
            getGuide();
        }).catch(function(err){

        });
    }

    $scope.deleteComment = function(id){
        $http.put('/guides/deleteComment/' + id).then(function(){
            getGuide();
        }).catch(function(err){

        });
    }
});