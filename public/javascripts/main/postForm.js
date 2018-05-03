app.controller('PostFormController', function($scope, $http, $stateParams, $filter){
    $scope.message = '';
    $scope.post = {
        title: {},
        steps: []
    };
    var post = {
        title: {},
        steps: []
    };

    function getPost(){
        $http.post('/posts/view', {id: $stateParams._id}).then(function(res){
            $scope.post = res.data;

            /* //set time format (NOT WORKING)
            $scope.post.title.startTime = new Date($scope.post.title.startTime);
            $scope.post.title.endTime = new Date($scope.post.title.endTime); */
        }).catch(function(err){

        });
    }

    if($stateParams._id != ''){
        getPost();
    }

    //convert timeString for the input fields

    $scope.submitStep = function(){
        console.log($scope.stepForm);
        if($scope.stepForm.index == undefined){
            $scope.post.steps.push($scope.stepForm);
        }
        else{
            angular.copy($scope.stepForm, $scope.post.steps[$scope.stepForm.index]);
        }

        $scope.stepForm = {};

    }

    $scope.editStep = function(index){
        angular.copy($scope.post.steps[index], $scope.stepForm);
        $scope.stepForm.index = index;
    }

    $scope.deleteStep = function(index){
        $scope.post.steps.splice(index, 1);
    }

    $scope.submitPost = function(){
        //use Object.assign to avoid referencing 
        post = angular.copy($scope.post);

        if(post.steps.length == 0){
            alert('add at least 1 step');
        }
        else{
            //convert the time to HH:mm when submitting
            
            post.title.startTime = $filter('date')(new Date(post.title.startTime), 'HH:mm');
            post.title.endTime = $filter('date')(new Date(post.title.endTime), 'HH:mm');

             //add (post)
            if(post._id == undefined){
                $http.post('/posts/add', post).then(function(res){
                    $scope.message = res.data.message;
                }).catch(function(err){
                    $scope.message = err.data.message;
                });
            }
            //update (put)
            else{ 
                $http.put('/posts/update/' + post._id, post).then(function(res){
                    $scope.message = res.data.message;
                }).catch(function(err){
                    $scope.message = err.data.message;
                });
            }
        }
    }

    $scope.resetStepForm = function(){
        $scope.stepForm = {};
    }
});