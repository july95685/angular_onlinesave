(function () {
    "use strict";

    /**
     * 添加合作者  通用组件
     */
    angular.module('dalockrAppV2App')
        .service('addCollaboratorService',['$mdDialog','$dalMedia','dalockrServices','toastr',function ($mdDialog,$dalMedia,dalockrServices,toastr) {

            var lockrId;

            this.open = function (lId) {
                lockrId = lId;
                return $mdDialog.show({
                        skipHide:true,
                        controller: handleController,
                        templateUrl: 'views/directives/component/add-collaborator.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    });
            };

            function handleController($scope){

                $scope.hide = function () {
                    $mdDialog.hide();
                };


                $scope.currentSet = 'cm_manager';
                $scope.username = '';

                $scope.roleSetting = {
                    cm_manager:{
                        permission:'READ_AND_MANAGE_CONTENT',
                        lockrRole:'COMMUNITY_MANAGER',
                        name:'Community Manager'
                    },
                    cn_manager:{
                        permission:'WRITE_AND_MANAGE_CONTENT',
                        lockrRole:'CONTENT_MANAGER',
                        name:'Content Manager'
                    }
                };

                $scope.toAdd = function(){
                    var data = $scope.roleSetting[$scope.currentSet];
                    $scope.loadingInProgress = true;
                    dalockrServices.grantPermissions(lockrId,'Lockr',data.permission,$scope.username, data.lockrRole)
                        .then(function(data){
                            toastr.success('Added successfully.');
                            $mdDialog.hide(true);
                        }).catch(function(error){
                            $scope.loadingInProgress = false;
                            toastr.error(error.data.message);
                        });
                }
            }

        }]);
})();