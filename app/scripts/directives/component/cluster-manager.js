'use strict';
/**
 * Created by panma on 10/15/15.
 */
angular.module('dalockrAppV2App')
    .service('clustersManager',[
        '$mdDialog',
        'dalockrServices',
        'toastr',
        '$dalMedia',
        function($mdDialog,dalockrServices,toastr,$dalMedia){

        var clustersManager = {};
        clustersManager.openSwitchDialog = function(cb) {



            $mdDialog.show({
                controller: ManagerDialogController,
                templateUrl: 'views/directives/component/cluster-switch-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen:$dalMedia('xs')
            });

            function ManagerDialogController($scope,$mdDialog,$dalMedia) {
                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                    cb()
                };
                $scope.mobileDevice = $dalMedia('sm');
                $scope.isLoading = true;
                $scope.loadError = false;
                $scope.noAccount = false;


                loadClustersLockr();
                function loadClustersLockr(){
                    dalockrServices.getClustersLockr()
                        .then(function(response){
                            //console.log(response);
                            var result = response.data;

                            if(!result.length) {
                                toastr.warning('No account','Warning');
                                $scope.noAccount = true;
                                $scope.isLoading = false;

                                return false;
                            }

                            for (var i = 0; i < result.length; i++) {
                                var obj = result[i];
                                obj.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',obj.id);
                            }
                            $scope.clustersLockr = result;

                            $scope.isLoading = false;
                            $scope.loadError = false;


                        },function(error){
                            $scope.isLoading = false;
                            $scope.loadError = true;

                        });
                }


                $scope.selectLockr = function(lockr){
                    if(cb){
                        cb(lockr);
                        $mdDialog.hide();
                    }
                };

                $scope.reloadData = function(){
                    $scope.isLoading = true;
                    loadClustersLockr();
                };
            }
        };

        return clustersManager;

    }]);








