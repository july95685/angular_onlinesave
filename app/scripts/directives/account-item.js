'use strict';
/**
 * Created by panma on 11/10/15.
 */
angular.module('dalockrAppV2App')
    .directive('accountItem', ['$location','accountInfoManager',function ($location,accountInfoManager) {


        var template = '<div class="account-item" id="account-item-{{account.accountId}}" ng-click="switch($event)" style="width: 220px;margin-left:20px;margin-bottom:20px;">\
            <div class="card-shadow" style="cursor: pointer;position: relative;">\
                <i class="mdi mdi-star color-warning icon-size-1" ng-if="account.isManager" style="position:absolute;top:3px;left:3px;z-index:3;"></i>\
                <div style="position: absolute;top:0;left: 0;right: 0;bottom: 0;z-index:2;background-color: rgba(0,0,0,0.2);" class="active-account hidden"></div>\
                <div class="image" style="width:100%;height:165px;overflow: hidden;position: relative;">\
                    <img on-error style="width:100%;" data-ng-src="{{account.thumbnailUrl}}">\
                </div>\
                <div style="padding: 10px;">\
                    <div style="font-size: 16px;padding:0 0 10px 0;" class="v2-color">\
                        {{account.name}}\
                    </div>\
                    <div layout="row">\
                    <div layout="row" layout-align="start center">\
                        <i class="mdi icon-size-1 mdi-clock"></i><span class="gray-9B font-size-12 lh-0">{{account.dateCreated | date : \'MMM,d yyyy\'}}</span>\
                    </div>\
                    <span flex></span>\
                    <div layout="row" layout-align="start center">\
                        <i style="color: #f27065;" class="mdi mdi-heart icon-size-1"></i>\
                        <span class="font-size-1 lh-0">{{account.numberOfFollowers || 0}}</span>\
                    </div>\
                    </div>\
                    <div layout="row" style="padding-top: 16px;"><span flex></span><a ng-click="manageAccountDetails($event)">Account details</a></div>\
                </div>\
            </div>\
           </div>\\';

        return {
            restrict: 'EA',
            template:template,
            replace:true,
            scope:{
                accounts:'=',
                switchAccount:'&',
                accountIndex:'@'
            },
            controller:function($scope) {
                $scope.account = $scope.accounts[$scope.accountIndex];

                $scope.switch = function (ev) {
                    if($scope.account.accountId === $location.search().aid) return;
                    $scope.switchAccount({ac:{account:$scope.account}});
                };

                $scope.manageAccountDetails = function (ev) {
                    ev.stopPropagation();
                    accountInfoManager.show({aId:$scope.account.accountId,isManager:$scope.account.isManager});
                }
            }
        }
    }]);