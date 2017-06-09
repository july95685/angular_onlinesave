'use strict';
/**
 * Created by Ann on 12/30/14.
 */


angular.module('dalockrAppV2App')
    .service('userServices', ['$http','$window','$sessionStorage','commonServices','appConfig','ipCookie',
        function ($http, $window,$sessionStorage,commonServices,appConfig,ipCookie) {

            var userServices = {};
            var currentUser = null;
            var userInfoPromise;

            //PPR
            var apiServerAddress = appConfig.API_SERVER_ADDRESS + '/api';

            userServices.isActive = function(){
                return angular.isDefined(ipCookie('accessToken'));
            };

            userServices.setAccessToken = function (token) {
                ipCookie('accessToken',token,{expires:1,path:'/'});
            };

            userServices.getAccessToken = function () {
               return ipCookie('accessToken');
            };

            userServices.removeAccessToken = function () {
                return ipCookie.remove('accessToken',{path:'/'});
            };

            userServices.getUserProfileInfo = function (cb, update) {
                if(currentUser && !update)  return cb(currentUser);
                if(!userInfoPromise){
                    var url = apiServerAddress + '/user';
                    userInfoPromise =  $http.get(url);
                }
                userInfoPromise.success(function (data) {
                    userServices.setUser(data);
                    userInfoPromise = null;
                    cb && cb(currentUser);
                });
            };

            userServices.currentUser = function () {
                return currentUser;
            };
            userServices.setUser = function (user) {
                currentUser = user;
            };


            return userServices;
        }
    ]
);
