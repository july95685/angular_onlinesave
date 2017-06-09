'use strict';
/**
 * Created by panma on 9/19/15.
 */
angular.module('dalockrAppV2App')
    .directive('assetDetailsView',[
        'dalockrServices',
        'commonServices',
        '$mdDialog',
        'toastr',
        '$document',
        '$templateCache',
        function(dalockrServices,commonServices,$mdDialog,toastr,$document,$templateCache){
        return {
            restrict: 'E',
            template:function(){
                return $templateCache.get('views/directives/asset/asset-details-view.html');
            },
            scope:{
              assetId:'@',
              assetType:'@'
            },
            replace:true,
            link:function(scope,elem){

                scope.currentAssetDetails = null;
                scope.mediaType = scope.assetType;
                scope.currentAssetId = scope.assetId;
                scope.pathData = null;

                loadData();

                function loadData(){
                    dalockrServices.getAssetDetails(scope.currentAssetId,function(data){
                        scope.currentAssetDetails = data;
                        data.socialChannelView = commonServices.getSocialChannelViewNum(data.links);
                        data.srcUrl = dalockrServices.getAssetSrc('asset',data.id);
                        $mdDialog.hide();
                        scope.$apply();
                    });

                }

                scope.close = function(){
                    var bodyElem = angular.element('body');
                    if(bodyElem.hasClass('stop-scroll')){
                        bodyElem.removeClass('stop-scroll');
                    }
                    elem.remove();
                };


                scope.$on('updateAssetDetails',function(event,value){
                   if(value){
                       loadData();
                   }
                });
                scope.$on('switchImageAsset',function(event,value){
                  if(value){
                      scope.currentAssetId = value;
                      loadData();
                  }
                });

            }
        }
    }]);