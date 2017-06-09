'use strict';
/**
 * Created by panma on 9/15/15.
 */
angular.module('dalockrAppV2App')
    .directive('dashboardStatsAcross', ['dalockrServices','commonServices',function(dalockrServices, commonServices) {

        return {
            restrict: 'EA',
            templateUrl: 'views/directives/dashboard/dashboard-stats-across.html',
            link:function(scope,element){

            }
        };
    }]);