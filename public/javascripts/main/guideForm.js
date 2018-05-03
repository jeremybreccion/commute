app.controller('GuideFormController', function($scope, $http, $stateParams, $filter){
    $scope.message = '';
    $scope.stepForm = {};
    $scope.guide = {
        title: {},
        steps: []
    };
    var guide = {
        title: {},
        steps: []
    };

    function getGuide(){
        $http.post('/guides/view', {id: $stateParams._id}).then(function(res){
            $scope.guide = res.data;

            /* //set time format (NOT WORKING)
            $scope.guide.title.startTime = new Date($scope.guide.title.startTime);
            $scope.guide.title.endTime = new Date($scope.guide.title.endTime); */
        }).catch(function(err){

        });
    }

    if($stateParams._id != ''){
        getGuide();
    }

    //convert timeString for the input fields

    $scope.submitStep = function(){
        console.log($scope.stepForm);
        if($scope.stepForm.index == undefined){
            $scope.guide.steps.push($scope.stepForm);
        }
        else{
            angular.copy($scope.stepForm, $scope.guide.steps[$scope.stepForm.index]);
        }

        $scope.stepForm = {};

    }

    $scope.editStep = function(index){
        angular.copy($scope.guide.steps[index], $scope.stepForm);
        $scope.stepForm.index = index;
    }

    $scope.deleteStep = function(index){
        $scope.guide.steps.splice(index, 1);
    }

    $scope.submitGuide = function(){
        //use Object.assign to avoid referencing 
        guide = angular.copy($scope.guide);

        if(guide.steps.length == 0){
            alert('add at least 1 step');
        }
        else{
            //convert the time to HH:mm when submitting
            
            guide.title.startTime = $filter('date')(new Date(guide.title.startTime), 'HH:mm');
            guide.title.endTime = $filter('date')(new Date(guide.title.endTime), 'HH:mm');

             //add (guide)
            if(guide._id == undefined){
                $http.post('/guides/add', guide).then(function(res){
                    $scope.message = res.data.message;
                }).catch(function(err){
                    $scope.message = err.data.message;
                });
            }
            //update (put)
            else{ 
                $http.put('/guides/update', guide).then(function(res){
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