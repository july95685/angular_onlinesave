'use strict';
/**
 * Created by panma on 9/15/15.
 */
angular.module('dalockrAppV2App')
    .directive('dashboardPerformance', ['$rootScope',function($rootScope) {

        return {
            restrict: 'EA',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/mobile/dashboard-mobile-performance.html';
                }
                return 'views/directives/dashboard/dashboard-performance.html';
            },
            link:function(scope,element){


            }
        };
    }]);