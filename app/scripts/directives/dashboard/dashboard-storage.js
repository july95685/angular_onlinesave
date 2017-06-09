/**
 * Created by user on 2015/7/28.
 */
/**
 * Created by panma on 4/26/15.
 */
'use strict';
angular.module('dalockrAppV2App')
    .directive('dashboardRightRegion', ['dalockrServices','commonServices',function(dalockrServices, commonServices) {

        return {
            restrict: 'E',
            templateUrl: 'views/directives/dashboard/dashboard-storage.html',
            link:function(scope,element){

            }
        };
    }]);