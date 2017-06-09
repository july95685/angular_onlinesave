/**
 * Created by user on 2015/7/31.
 */
angular.module('dalockrAppV2App')
    .directive('assetDetailsComments',[
        '$compile',
        function($compile){
        return {
            restrict: 'E',
            templateUrl: 'views/directives/asset/asset-details-comments.html',
            replace:true,
            link:function(scope,elem){

            }
        }
    }])
    .directive('replyCommentBox',['dalockrServices','toastr',function(dalockrServices,toastr) {
        return {
            restrict: 'E',
            templateUrl: 'views/templates/reply-comment-box.html',
            replace: true,
            scope:{
                commentId:'@',
                currentAssetId:'@',
                fileType:'@'
            },
            link:function(scope,elem){
                elem.find('textarea').focus();

                scope.cancelComment = function(){
                    scope.$emit('cancelReply',{status:true,id:scope.commentId});
                };
                scope.replyMessage = '';
                scope.isReplying = false;

                scope.reply = function(){

                    scope.isReplying = true;
                    dalockrServices.addComment(scope.fileType,scope.currentAssetId,scope.commentId,scope.replyMessage)
                        .then(function(){
                            scope.$emit('cancelReply',{status:false,id:scope.commentId});
                            toastr.success("Reply success",'Success');
                        }).catch(function(){
                            scope.isReplying = false;
                            toastr.error("Reply error",'Error');
                        });
                };

            }
        }
    }]);