'use strict';
/**
 * Created by Kamita on 12/30/14.
 */


angular.module('dalockrAppV2App')
    .service('userRightServices', ['commonServices','appConfig','userServices','$sessionStorage',
        function (commonServices,appConfig,userServices,$sessionStorage) {

            var _ = angular,
                _cs = commonServices,
                _us = userServices;

            var userRightServices = {};

            var userRoles = {
                'CAN_SHARE_LOCKR':false,
                'ENTERPRISE_ADMIN':false,
                'ENTERPRISE_USER':false,
                'CAN_SCHEDULE_PUBLISH':false,
                'INTEGRATOR':false
            };


            userRightServices.isContentManager = function(lockrId,par){
                return getRole(lockrId,par)  === 'CONTENT_MANAGER';
            };
            userRightServices.isCommunityManager = function(lockrId,par){
                return getRole(lockrId,par) === 'COMMUNITY_MANAGER';

            };

            function getRole(lockrId,par){
                var curr = {lockrId:lockrId};
                var newPar = angular.copy(par);
                var roles = userServices.currentUser().lockrRoles,
                    role;

                if(newPar){
                    newPar.push(curr);
                } else {
                    newPar = [curr];
                }
                
                newPar.reverse();

                angular.forEach(newPar,function(v1) {
                   if(!role){
                       var lockrId = v1.lockrId;
                       var kg = true;
                       angular.forEach(roles,function(v2,k2) {
                        if(kg){
                            if(lockrId === k2){
                             role = v2;
                             kg = false;
                           } 
                        }
                       });
                   }
                });
                return role;
            }

            userRightServices.isAccountManager = function(accountId){
                if(userServices.currentUser())
                {
                    var accounts = userServices.currentUser().accounts;
                    for (var i = accounts.length - 1; i >= 0; i--) {
                        var acc = accounts[i];
                        if (acc.id === accountId) {
                            return acc.manager;
                        }
                    }
                }
                return false;
            };

            userRightServices.isClusterAdmin = function(){
                return userRightServices.getUserRoles().ENTERPRISE_ADMIN;
            };

            userRightServices.getUserRoles = function(){

                var roles = {};

                if(_us.isActive() && _us.currentUser() && _.isDefined(_us.currentUser())){
                    if(_us.currentUser().roles){
                        var urs =_us.currentUser().roles;
                        _.forEach(userRoles,function(value,key){
                            value = _cs.in_array(key, urs);
                            roles[key] = value;
                        });
                    }

                }
                return roles;

            };

            return userRightServices;
        }
    ]
);
