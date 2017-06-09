'use strict';
/**
 * Created by panma on 10/28/15.
 */
angular.module('dalockrAppV2App')
    .directive('articleAssetModal',['$templateCache','commonServices','appConfig',function($templateCache,commonServices,appConfig){
        return {
            restrict: 'E',
            templateUrl:'views/templates/select-asset-dialog.html',
            replace:false,
            scope:{
              closeModal:'&'
            },
            link:function(scope,elem){

                var mod = elem.find('#select-asset-modal');
                mod.modal({
                    backdrop:'static',
                    keyboard:false
                });

                scope.assets = angular.copy(commonServices.assets());
                scope.cancel = function(){
                    mod.on('hidden.bs.modal',function(){
                        elem.remove();
                    });
                    mod.modal('hide');
                };
                scope.commitSelect = function(){

                    mod.on('hidden.bs.modal',function(){
                        var selectAssets = [];

                        angular.forEach(scope.assets,function(value,key){
                            if(value.focused){
                                selectAssets.push(appConfig.API_SERVER_ADDRESS + '/a/' + value.defaultLink.clusterId + '/' +  value.defaultLink.trackingId + '/tn');
                            }
                        });
                        scope.closeModal({info:{isCancel:false,assets:selectAssets}});
                        elem.remove();

                    });
                    mod.modal('hide');


                };
                scope.selectItem = function(ev,item){

                    if(angular.isDefined(item.focused)){
                        $(ev.currentTarget).removeClass('article-asset-active');
                        delete item.focused;
                    } else {
                        item.focused = true;
                        $(ev.currentTarget).addClass('article-asset-active');

                    }

                };

                scope.canSubmit = function(){
                    for (var i = 0; i < scope.assets.length; i++) {
                      var obj = scope.assets[i];
                      if(obj.focused){
                          return false;
                      }
                    }
                    return true;
                }

            }
        }
    }]);