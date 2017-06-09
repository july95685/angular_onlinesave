/**
 * Created by user on 2015/7/31.
 */
angular.module('dalockrAppV2App')
.directive('assetDetailsInfo',['$rootScope','dalockrServices','$mdDialog','appConfig',function($rootScope,dalockrServices,$mdDialog,appConfig){
        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/directives/asset/mobile/asset-details-info.html';
                }
                return 'views/directives/asset/asset-details-info.html';
            },
            replace:true,
            link:function(scope,elem){

                scope.left="left100";
                scope.people=['dan'];

                scope.commentsNum = 0;
                scope.$on('comments-count',function(event,value){
                    scope.commentsNum = value;
                });

            }
        }
    }]);