/**
 * Created by panma on 8/7/15.
 */
angular.module('dalockrAppV2App')
    .directive('assetDetailsTop',['$rootScope',function($rootScope){
        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/directives/asset/mobile/asset-details-top.html';
                }
                return 'views/directives/asset/asset-details-top.html';
            },
            scope:{
                currentAssetDetails:'=',
                mediaType:'@',
                currentAssetId:'@'
            },
            link:function(scope,elem){

            }
        }
    }]);