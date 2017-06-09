'use strict';
/**
 * Created by panma on 7/21/15.
 */
angular.module('dalockrAppV2App')
    .directive('lockrDetailsNavbar', ['commonServices','$location','$document','userRightServices','$dalMedia','$rootScope','dalockrServices','$mdDialog','toastr','thumbnailServices',function(commonServices,$location,$document,userRightServices,$dalMedia,$rootScope,dalockrServices,$mdDialog,toastr,thumbnailServices) {


        return {
            restrict: 'E',
            templateUrl: 'views/directives/lockr-details-navbar.html',
            scope:{
                pathData:'=',
                assetMenu:'@'
            },
            replace:true,
            link: function(scope,element){

                scope.openEditThumbnail = function(){
                    $rootScope.$broadcast('editLockrThumb',scope.lockrdata);
                };


                scope.isMobile = window.isMobile;
                scope.mobileDevice = $dalMedia('xs');
                scope.navbarFixed = false;
                scope.pathmovelockrdata = '';
                scope.$on('assetDataToPath',function(ev,data){
                    scope.assetdata = data;
                });
                scope.$watch('assetdata',function(newVal){
                    if(newVal){
                        scope.assetdata = newVal;
                    }

                });
                scope.downloadAsset = function(){

                    $mdDialog.show({
                        controller: downloadAssetDialogController,
                        templateUrl: 'views/templates/download-asset-dialog.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    });

                    function downloadAssetDialogController($scope){

                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };
                        $scope.currentAssetData = angular.copy(scope.assetdata);
                        $scope.downloadAssetUrl = dalockrServices.downloadAssetUrl(scope.assetdata.id);

                        $scope.downloadLockr = function(){
                            $mdDialog.hide();
                            document.getElementById('asset-download-a').click();
                        }

                    }
                };

                scope.$on('lockrDataToPath',function(ev,data){
                    scope.lockrdata = data;
                });

                scope.$watch('lockrdata',function(newVal){
                    //console.log(newVal);
                    if(newVal){
                        scope.lockrdata = newVal;
                    }

                });
                scope.previewAsset = function(){
                    $rootScope.$broadcast('mobileToPreview');
                };
                scope.setThumbnail = function(){
                    $rootScope.$broadcast('setTN',scope.assetdata.id);

                };
                scope.openShareDialog = function(){
                    $rootScope.$broadcast('shareLockr',scope.lockrdata);
                };
                scope.openPathEdit = function(){
                    $rootScope.$broadcast('InfoEditLockr',scope.lockrdata);
                };
                scope.openPathInfo = function(){
                    $rootScope.$broadcast('openInfo',scope.lockrdata);
                };
                scope.openPathDownload = function(){
                    $rootScope.$broadcast('openLockrDownload',scope.lockrdata);
                };
                scope.deleteLockrOnPathbar = function(){
                    scope.back();
                    $rootScope.$broadcast('deleteLockrOnPathbar',scope.lockrdata);
                };
                if(!scope.mobileDevice) {
                    var floatNavTop = element.offset().top;
                    window.onscroll = function(){
                        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                        if(floatNavTop < scrollTop){
                            scope.$apply(function(){
                                scope.navbarFixed = true;
                            });
                        } else {
                            scope.$apply(function(){
                                scope.navbarFixed = false;
                            });
                        }
                    };
                } else {
                    element.css({
                        'z-index':2,
                        'position': 'fixed',
                        'width':'100%'
                    });
                }
                scope.openEditAsset = function(){
                    $rootScope.$broadcast('editAsset',null);
                };
                scope.ChangeAssetState = function(){
                    $rootScope.$broadcast('ChangeAssetState',null);
                    if(scope.assetdata.state) {
                        if (scope.assetdata.state == 'Draft') {
                            scope.assetdata.state = 'Published';
                        } else {
                            scope.assetdata.state = 'Draft';
                        }
                    }
                };
                scope.openMoveAsset = function(){
                    dalockrServices.getLockrDetails(scope.assetdata.lockrId).success(function(data){
                        scope.pathmovelockrdata = data;
                        $mdDialog.show({
                            controller: PathmoveAssetController,
                            templateUrl: 'views/templates/move-assets-dialog.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')

                        });

                    });
                };

                function PathmoveAssetController($scope){
                    var toLockrName = '';
                    var assetdataArray = [];
                    $scope.haveSelectedItem = [];
                    $scope.haveSelectedItem[0] = scope.assetdata;
                    $scope.currentLockrsData = scope.pathmovelockrdata.subLockrs;
                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function(answer) {
                        $mdDialog.hide(answer);
                    };
                    $scope.startMoveAssets = function(){
                        dalockrServices.moveAssetsToAnotherLockr(scope.assetdata.id,scope.pathmovelockrdata.id, $scope.moveToLockrId).success(function(data){

                            angular.forEach($scope.currentLockrsData, function(value,key){
                                if(value.id === data.targetLockr){
                                    toLockrName = value.name;
                                }
                            });
                            $scope.cancel();
                            $location.path('/sublockr/' + data.targetLockr);


                            toastr.success('Moving of assets from lockr ' + scope.pathmovelockrdata.name  + ' to ' + toLockrName  +' has completed.','Success');
                        }).error(function(error){
                            toastr.error("Move error",'Error');
                        });


                    }
                }

                scope.deleteAsset = function(){
                    //$rootScope.$broadcast('usedeleteasset',scope.assetdata);
                    scope.back();
                    var confirm = $mdDialog.confirm()
                        .title('Are you sure you want to delete this asset ?')
                        .ariaLabel('Lucky day')
                        .ok('OK')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function() {
                        scope.assetItem = scope.assetdata;

                        dalockrServices.deleteAssetWithPromise(scope.assetItem.id)
                            .success(function(){
                                toastr.success('Successfully deleted');
                                $rootScope.$broadcast('updateLockrDetails',true);
                                if($rootScope.watchDelete){
                                    $rootScope.watchDelete = false;
                                }
                            }).error(function (error) {
                            if(error && error.message)
                                toastr.error(error.message);
                        });



                    }, function() {

                    });
                };

                scope.openToolMenu = function ($mdOpenMenu,$event) {
                    $event.stopPropagation();
                    $mdOpenMenu($event);
                };



                scope.inviteUser = function(){
                    $rootScope.$broadcast('$$InviteUser');
                }


                scope.back = function(){
                    var len = scope.pathData.length;
                    if(len <= 1){
                        $location.path('/accounts');
                    } else {
                        var willBackTo =scope.pathData[len - 2];
                        $location.path('/sublockr/' + willBackTo.id);
                    }
                };

                scope.backToLockr = function(id){
                    $location.path('/sublockr/' + id);

                };

            }
        };
    }])
    .directive('fixedMenuMask', ['$dalMedia',function($dalMedia) {
        return {
            restrict: 'E',
            template: '<div class="fixed-menu-mask" ng-show="isShow"></div>',
            scope:{
                regionSize:'=',
                isShow:'='
            },
            replace:true,
            link: function(scope,element){
                if($dalMedia('xs')){
                    element.addClass('mobile-menu-mask');
                } else {
                    scope.$watch('regionSize',function(){
                        if(scope.regionSize !== undefined){
                            element.css('height',(scope.regionSize.height) + 'px')
                                .css('width', scope.regionSize.width + 'px');
                        }
                    });
                }
            }
        };
    }]);