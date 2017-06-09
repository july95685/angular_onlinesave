'use strict';
/**
 * Created by panma on 9/23/15.
 */
angular.module('dalockrAppV2App')
    .directive('bodyLoadingMask',[function(){
        return {
            restrict: 'E',
            templateUrl: 'views/directives/component/body-loading-mask.html',
            replace:true,
            link:function(scope,elem){

            }
        }
    }]);