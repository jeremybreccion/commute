var app  = angular.module('UserApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('register', {
        url: '/register',
        templateUrl: 'register.html',
        controller: 'RegisterController'
    })
    .state('login', {
        url: '/login',
        templateUrl: 'login.html',
        controller: 'LoginController'
    })
    .state('main', {
        templateUrl: 'main.html',
        controller: 'MainController'
    })
    .state('home', {
        parent: 'main',
        url: '/',
        templateUrl: 'main/home.html',
        controller: 'HomeController'
    })
    .state('settings', {
        parent: 'main',
        url: '/settings',
        templateUrl: 'main/settings.html',
        controller: 'SettingsController'
    })
    .state('guides', {
        parent: 'main',
        url: '/guides',
        templateUrl: 'main/guides.html',
        controller: 'GuidesController'
    })
    .state('admin', {
        parent: 'main',
        url: '/admin',
        templateUrl: 'main/admin.html',
        //controller: 'AdminController'
    })
    .state('viewGuide', {
        parent: 'main',
        url: '/viewGuide/:_id',
        templateUrl: 'main/viewGuide.html',
        controller: 'ViewGuideController'
    })
    .state('guide', {
        parent: 'main',
        url: '/guide/:_id',
        templateUrl: 'main/guideForm.html',
        controller: 'GuideFormController'
    });

    //catch response errors from server resulted from no authorization token found? or token expired
    //401 == unauthorized http request. refer to app.js
    $httpProvider.interceptors.push(function($q, $window, $location, $rootScope, ModalService){
        return {
            'responseError': function(rejection){
                var defer = $q.defer();
                if(rejection.status == 401){
                    //console.log('UMM');
                    alert('Unauthorized http request');
                    //reset current_user & token so that /#/login redirect in $stateChangeStart will not execute
                    $rootScope.current_user = {};
                    $rootScope.token = undefined;
                    //hide modal in case of http request errors from modals
                    ModalService.hide();
                    $window.location.href = '/#/login';
                }
                defer.reject(rejection);
                return defer.promise;
            }
        }
    });
});

app.run(function($rootScope, $state, $http, $window){
    $rootScope.current_user = {}; 
    $rootScope.languages = {};
    $rootScope.fromState = {
        name: 'home',
        params: {}
    };

    //get english & nihongo languages from server and set to rootScope
    $http.get('/languages/getLanguages').then(function(res){
        //console.log('getting languages...');
        $rootScope.languages = res.data.languages;
    });

    //run once? OR RUN EVERY STATECHANGE TO DETERMINE IF SERVER RESTARTS?
    //need this here for enabling multiple tabs since each tab will @ first load will run this
    //disadvantage: double codes, double execution ??
    //console.log('getting token...');
    $http.get('/session').then(function(res){
        //console.log(res);
        $rootScope.token = res.data.token;
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
        $rootScope.current_user = res.data.user;
        //$state.transitionTo('home');
    }).catch(function(err){
        $rootScope.current_user = {};
        $rootScope.token = undefined;
        //$state.transitionTo('login');
    });
    
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        //console.log(toState);
        //console.log('on state change success', $rootScope.current_user);
        //console.log($rootScope.token);
        //getting token per page transition solves the expired session from server. 
        //this will stop access and redirect to login page
        //disadvantage: make request to server every page transition

        //experiment: using $rootScope & $state.transitionTo() instead of javascript's back() method
        //use url instead of name in order to include query parameters
        if(toState.name == 'login'){
            $rootScope.fromState.name = (fromState.name != '') ? fromState.name : 'home';
            $rootScope.fromState.params = fromParams;
        }

        console.log('getting token...');
        $http.get('/session').then(function(res){
            //console.log(res);
            //console.log(res.data);
            $rootScope.token = res.data.token;
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
            $rootScope.current_user = res.data.user;
            $rootScope.current_user.isLoggedIn = true;
            //$state.transitionTo('home');
        }).catch(function(err){
            $rootScope.current_user = {};
            $rootScope.token = undefined;
            //console.log($rootScope.current_user);
            //$state.transitionTo('login');

            //need this so that changes are immediately applied.
            //this is from one page to another
            /* if(toState.name != 'login' && toState.name != 'register'){
                $state.transitionTo('login');
            }
            else{
                $state.transitionTo(toState.name);
            } */
        });

        //need this if user tries to access a page without completely logging in (i.e. type the link)
        if($rootScope.token == undefined && (toState.name == "guide" || toState.name == "guides")){
            alert('You must log in first');
            //event.preventDefault();
            $state.transitionTo('home');
        }
        //if user tries to access login or register page while already logged in
        else if($rootScope.token != undefined && (toState.name == "login" || toState.name == "register")){
            alert('You are already logged in');
            //event.preventDefault();
            $state.transitionTo('home');
        }
        //check if the user has access to the desired page
        else if(!isPageAccessible($rootScope.current_user.role, toState.name)){
            alert('You are not authorized to access this page');
            event.preventDefault();
            $state.transitionTo('home');
        }
    });


    function isPageAccessible(role, stateName){
        var isPageAccessible = true;
        
        //allowed states for 'User' roles only
        var allowedStates = ["login", "register", "home", "guides", "guide", "viewGuide", "settings"];

        var isStateAllowed = allowedStates.find(function(state){
            return state == stateName;
        });
        
        if(role == 'User' && isStateAllowed == undefined){
            isPageAccessible = false;
        }
        return isPageAccessible;
    }
});

