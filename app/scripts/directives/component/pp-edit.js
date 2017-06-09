"use strict";

angular.module('dalockrAppV2App')
    .directive('ppEditView', ['dalockrServices','commonServices','$timeout','cacheService','appConfig','toastr',function(dalockrServices, commonServices,$timeout,cacheService,appConfig,toastr){
        return {
            restrict: 'E',
            templateUrl: 'views/directives/component/pp-edit.html',
            replace:true,
            link:function(scope,element){

                openMe();
                scope.closeView = closeMe;
                var iframe = element.find('#pp-edit-frame');
                //当前lockr details
                var currentLockr = cacheService.getLockrStackTopElement();
                if(currentLockr){
                    scope.previewSrc = appConfig.API_SERVER_ADDRESS + '/publishing-point/#/m/lockr/' + currentLockr.links[0].trackingId + '?clusterId=dalockr';
                    iframe.attr('src',scope.previewSrc);
                }
                scope.switchTheme = function () {

                };

                scope.activeBanner = function(){
                    dalockrServices.changePPLayout(currentLockr.id,'bannerActive','Yes').then(function(data){
                        //console.log(data);
                        toastr.success('Reloading publishing point');
                        iframe[0].contentWindow.location.reload(true);
                    });
                };

                scope.deactivateBanner = function(){
                    dalockrServices.changePPLayout(currentLockr.id,'bannerActive','No').then(function(data){
                        //console.log(data);
                        toastr.success('Reloading publishing point');

                        iframe[0].contentWindow.location.reload(true);
                    });
                };

                scope.$on('$$closePpEditView', function () {
                   closeMe();
                });

                function openMe(){
                    $timeout(function(){
                        element.addClass('pp-edit-view-show');
                    });
                    document.body.scrollTop = 0;
                    commonServices.banBodyScroll();
                }
                function closeMe(){
                    element.removeClass('pp-edit-view-show');
                    commonServices.allowBodyScroll();
                    $timeout(function (){
                        element.remove();
                    },200);
                }
            }
        }
    }]);

