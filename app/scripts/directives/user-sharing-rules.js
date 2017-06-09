/**
 * Created by Administrator on 2015/5/15.
 */

angular.module('dalockrAppV2App')
    .directive('userSharingRules', [
        'dalockrServices',
        'commonServices',
        'toastr',
        '$mdDialog',
        function(dalockrServices,commonServices,toastr,$mdDialog) {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/user-sharing-rules.html',
            scope:{
                sharingRules:'='
            },
            link:function(scope,element){


                scope.isLoading = true;
                scope.sharingRuleFilter = {
                    'filterKey':''
                };

                if(scope.sharingRules){
                    scope.editSharingRule = true;
                    scope.isLoading = false;
                    scope.userSharingRules = scope.sharingRules;
                    angular.forEach(scope.userSharingRules,function(value,key){
                        value.expandBox  = (key === 0);
                        value.creativeCommons = createCreativeCommons(value.license);
                    });

                } else {
                    getUserSharingRule();
                    scope.$on('reloadUserSharingRule', function () {
                        getUserSharingRule();
                    });
                }

                function getUserSharingRule(){
                    dalockrServices.getUserSharingRules(function (data) {
                        scope.userSharingRules = data;
                        scope.isLoading = false;
                        angular.forEach(scope.userSharingRules,function(value,key){
                            value.expandBox = value.userDefault;
                            value.creativeCommons = createCreativeCommons(value.license);
                        });
                    }, function () {

                    }, true);
                }



                scope.addSharingRules = function (ev) {
                    $mdDialog.show({
                        controller: addSharingRulesController,
                        templateUrl: 'views/templates/add-sharing-rule-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false
                    });

                    function addSharingRulesController($scope) {
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function (answer) {
                            $mdDialog.hide(answer);
                        };
                        dalockrServices.getShareSocialChannelWithCache(function (data) {
                            angular.forEach(data, function (value,key) {
                                value.iconClass = commonServices.getIconClassByType(value.socialChannelType);
                            });
                            $scope.socialChannelsData = data;
                        });
                    }
                };





                function createCreativeCommons(license){

                    if(license === 'Copyright' || license === 'PublicDomain' || license === 'CC_BY'){
                        return {
                            isShare:'1',
                            isCommercial:'1'
                        };
                    } else if(license === 'CC_BY_NC'){
                        return {
                            isShare:'1',
                            isCommercial:'0'
                        };
                    } else if(license === 'CC_BY_ND'){
                        return {
                            isShare:'0',
                            isCommercial:'1'
                        };
                    } else if(license === 'CC_BY_NC_ND'){
                        return {
                            isShare:'0',
                            isCommercial:'0'
                        };
                    } else if(license === 'CC_BY_SA'){
                        return {
                            isShare:'-1',
                            isCommercial:'1'
                        };
                    } else if(license === 'CC_BY_NC_SA'){
                        return {
                            isShare:'-1',
                            isCommercial:'0'
                        };
                    }

                }



            }
        };
    }]);
