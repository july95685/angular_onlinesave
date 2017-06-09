/**
 * Created by Administrator on 2015/5/13.
 */
/**
 * Created by ann on 12/14/14.
 */
/**
 * Created by ann on 12/14/14.
 */
angular.module('dalockrAppV2App')
    .directive('createUserSharingRules', ['$rootScope','dalockrServices','commonServices','$mdDialog','toastr',function($rootScope,dalockrServices,commonServices,$mdDialog,toastr) {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/create-user-sharing-rules.html',
            scope: {
                socialChannelsData : '='
            },
            link:function(scope,element){

                //scope.$watch('sharingRule',function(oldValue, newValue){
                //    if(oldValue !== newValue){
                //        scope.showDanger = false;
                //        scope.showSuccess = false;
                //    }
                //});
                scope.isAdding = false;
                scope.sharingRule = {
                    sharingRule : {
                        name:'',
                        mimeType: '',
                        license : '',
                        postOnSocialChannel : []
                    }
                };
                scope.addSharingRule = function(sharingRule){
                    scope.isAdding = true;
                    dalockrServices.CreateSharingrule(sharingRule,function(data){

                        scope.$apply(function(){
                            toastr.success('Add success','Success');
                            $mdDialog.hide();
                        });
                        //$rootScope.$broadcast('createSharingRules');

                        $rootScope.$broadcast('reloadUserSharingRule');

                    },function(error){
                        scope.isAdding = false;
                        toastr.error(JSON.parse(error.responseText).message,'Error');
                        scope.$apply();
                    });
                };
                scope.socialSelectedForRule = function(channelId){
                    var index = scope.sharingRule.sharingRule.postOnSocialChannel.indexOf(channelId);
                    if(index !== -1){
                        scope.sharingRule.sharingRule.postOnSocialChannel.splice(index,1);
                    }else{
                        scope.sharingRule.sharingRule.postOnSocialChannel.push(channelId);
                    }

                }

            }
        };
    }]);
//.filter('getChannel',function(){
//    return function(input , param){
//        return input.split('-')[0].toLowerCase();
//    }
//});

