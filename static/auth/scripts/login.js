/**
 * Created by Administrator ddz on 2016/12/22.
 */
'use strict';
angular.module('dl_login',[
    'ngMessages',
    'ngMaterial',
])
    .controller('MainCtrl',['$dalMedia','$scope','$rootScope',function ($dalMedia,$scope,$rootScope) {
        $scope.Mobile=$dalMedia('xs');
        $scope.Pc=!$scope.Mobile;
        $scope.loginPage = true;
        $scope.toRegisterOrLogin = function () {
            $scope.loginPage = !$scope.loginPage;
        }
        $scope.toForgotpassword=function () {
            
        }
    }])
    .controller('LoginCtrl',['$scope','userServices','toaster','authConfig',function ($scope,userServices,toaster,authConfig) {
        $scope.isLogining = false;
        $scope.loginInfo = {
            username:'',
            password:''
        };
        $scope.startLogin = function () {

            if($scope.dlLoginForm.$invalid) return;
            $scope.isLogining = true;
            userServices.loginWithUserInfo($scope.loginInfo)
                .then(function () {
                    window.location.replace( authConfig.API_ADDRESS + "/api/oauth/authorize?"+userServices.urlParams());
                }).
            catch(function (error) {
                toaster.error(error.data.message);
                $scope.isLogining = false;

            });

        }
        $scope.loginWithSocial = function(name){

            var url = null;
            var ru =  encodeURIComponent( authConfig.REDIRECT_URL_ADDRESS + '#/login');

            if(name === 'facebook'){
                url = authConfig.API_ADDRESS + '/api/dalockrv2/auth/social/channel/Facebook?redirectUri=' + ru;
            } else if(name === 'google'){
                url = authConfig.API_ADDRESS + '/api/dalockrv2/auth/social/channel/Google?redirectUri=' + ru;
            } else if(name === 'linkedin'){
                url = authConfig.API_ADDRESS + '/api/dalockrv2/auth/social/channel/LinkedIn?redirectUri=' + ru;
            }
            window.location.href = url;

        };

    }])
    .controller('RegisterCtrl',['$scope','userServices','toaster','authConfig',function ($scope,userServices,toaster,authConfig){
        var clusterId;

        $scope.isRegistering = false;
        $scope.registerInfo = {
            firstName:'',
            lastName:'',
            username:'',
            email:'',
            password:''
        };
        $scope.rePassword = '';

        $scope.startRegister = function () {

            if($scope.dlRegisterForm.$invalid) return;
            $scope.isRegistering = true;
            if(clusterId = userServices.getParameterByName('clusterId')){
                $scope.registerInfo.clusterId = clusterId;
            }
            userServices.registerWithUserInfo($scope.registerInfo).then(function () {
                window.location.replace( authConfig.API_ADDRESS + "/api/oauth/authorize?"+userServices.urlParams());
            }).catch(function (error) {
                toaster.error(error.data.message);
                $scope.isRegistering = false;
            });

        }
    }])
    .service('userServices',['$http', '$location','authConfig',function ($http, $location,authConfig) {
        var apiAddress = authConfig.API_ADDRESS + '/api/user/';

        function loginWithUserInfo(userInfo){
            var loginUrl = apiAddress + 'login';
            return $http.post(loginUrl, userInfo);
        }

        function registerWithUserInfo(userInfo){
            var registerUrl = apiAddress + 'register';
            return $http.post(registerUrl, userInfo);
        }

        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(window.location.search);
            return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        return {
            loginWithUserInfo:loginWithUserInfo,
            registerWithUserInfo:registerWithUserInfo,
            getParameterByName:getParameterByName,
            urlParams: function () {
                return window.location.href.split('?')[1];
            }
        }
    }])
    .service('toaster',['$mdToast',function ($mdToast) {
        var last = {
            bottom: false,
            top: true,
            left: false,
            right: true
        };
        var toastPosition = angular.extend({},last);

        function getToastPosition() {
            sanitizePosition();
            return Object.keys(toastPosition)
                .filter(function(pos) { return toastPosition[pos]; })
                .join(' ');
        }
        function sanitizePosition() {
            var current = toastPosition;
            if ( current.bottom && last.top ) current.top = false;
            if ( current.top && last.bottom ) current.bottom = false;
            if ( current.right && last.left ) current.left = false;
            if ( current.left && last.right ) current.right = false;
            last = angular.extend({},current);
        }

        function toastError(text){
            $mdToast.show(
                $mdToast.simple()
                    .content(text)
                    .position(getToastPosition())
                    .hideDelay(3000)
            );
        }

        return {
            error:toastError
        }
    }])
    .directive('confirmPasswd',[function () {
        return {
            restrict: 'A',
            require: '^ngModel',
            scope:{
                realPassword:'=realPassword'
            },
            link: function(scope, element, attrs, ngModelCtrl) {
                ngModelCtrl.$parsers.push(function (value) {
                    if(value === scope.realPassword){
                        ngModelCtrl.$setValidity('passwordSame', true);
                    } else {
                        ngModelCtrl.$setValidity('passwordSame', false);
                    }
                    return value;
                })


            }
        };
    }])
    .constant('authConfig',{
        API_ADDRESS:'https://account.dalockr.com'
    })
    .run(['$rootScope','$dalMedia',function ($rootScope,$dalMedia) {
        $rootScope.Mobile= $dalMedia('xs') ? true : false;
    }])
    .factory('$dalMedia',['$mdMedia',function ($mdMedia) {
        return function (size) {
            if(size == 'xs'){
                return $mdMedia('max-width: 767px');
            }
            else {
                return $mdMedia(size);
            }
        }
    }]);


