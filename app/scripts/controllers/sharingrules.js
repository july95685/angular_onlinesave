"use strict";
angular.module('dalockrAppV2App')
    .controller('SharingRulesCtrl', function ($window,$location,$scope) {
        $window.scrollTo(0,0);
        $scope.backToHome = function () {
            $location.path('/accounts');
        };

    }).controller('UserProfileCtrl', function ($window,$location,$scope,userServices) {
        userServices.getUserProfileInfo(function (userInfo) {
            $scope.username = userInfo.username;
        },false);
        $scope.backToHome = function () {
            $location.path('/accounts');
        };
    });