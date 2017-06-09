'use strict';
/**
 * Created by panma on 9/21/15.
 */
angular.module('dalockrAppV2App')
    .directive('commentFlowRegion',[
        'dalockrServices',
        'commonServices',
        '$templateCache',
        'toastr',
        '$filter',
        '$q',
        '$compile',
        commentFlowRegion]);

function commentFlowRegion(dalockrServices,commonServices,$templateCache,toastr,$filter,$q,$compile){
    return {
        restrict:'AE',
        scope:{
            assetName:'=',
            fileType:'@',
            fileId:'@'
        },
        template:function(){
            return $templateCache.get('views/directives/comment-flow-region.html');
        },
        link:function(scope, elem){

            scope.close = function(){
                commonServices.allowBodyScroll();
                elem.remove();
            };
        }
    }
}