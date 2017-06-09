/**
 * Created by panma on 7/19/15.
 */
angular.module('dalockrAppV2App')
    .directive('assetDetailsFixedMenu', ['$rootScope','$mdDialog','appConfig','Upload','$sessionStorage','toastr','dalockrServices','commonServices','userServices','userRightServices','$q','sharingRuleToShareService','cacheService','$dalMedia','$location',function($rootScope,$mdDialog,appConfig,Upload,$sessionStorage,toastr,dalockrServices,commonServices,userServices,userRightServices,$q,sharingRuleToShareService,cacheService,$dalMedia,$location) {

        return {
            restrict: 'E',
            templateUrl: 'views/directives/asset-details-fixed-menu.html',
            scope:{
                currentAssetDetails:'=',
                currentAssetId:'='
            },
            replace:true,
            link: function(scope,element){

                scope.mobileDevice = $dalMedia('xs');

                element.on('click',function(event){
                    event.stopPropagation();
                    return false;
                });

                scope.$watch(function() {
                    return $dalMedia('xs');
                }, function(val) {
                    if(val){
                        element.css({top:'auto',bottom:'40px'});
                    } else {
                        element.css({top:'80px',bottom:'auto'});
                    }
                });


                scope.canShare = true;
                var assetParentLockr;
                if(assetParentLockr = cacheService.getLockrStackTopElement()){
                    scope.canShare = assetParentLockr.lockrType.toLowerCase() !== 'safelockr';
                } else {
                    var lockrIdWatcher = scope.$watch(function () {
                        return scope.currentAssetDetails;
                    }, function (v) {
                        if(v){
                            dalockrServices.getLockrDetails(v.lockrId).success(function (data) {
                                cacheService.pushLockrToStack(data);
                                scope.canShare = data.lockrType.toLowerCase() !== 'safelockr';
                                $rootScope.$broadcast('$$thisAssetIsCanShare',scope.canShare);
                            });
                            lockrIdWatcher();
                        }
                    });
                }



                scope.$on('$$ToShareAsset', function () {
                    scope.openShareAssetDialog();
                });

                scope.openShareAssetDialog = function(ev){
                    $rootScope.$broadcast('openFixedMenu', false);
                    element.find('.dropdown-fixed-menu').slideUp('fast');
                    menuIsDisplay = false;

                    $mdDialog.show({
                        controller: shareAssetController,
                        templateUrl: 'views/templates/share-asset-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    })

                };

                scope.editAsset = function ($event) {
                    $rootScope.$broadcast('editAsset',$event);
                };


                scope.putchannals = function($event){


                    menuIsDisplay = false;
                    $mdDialog.show({
                        controller: putChannalsController,
                        templateUrl: 'views/templates/put-channals-dialog.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    });
                    function putChannalsController($scope){
                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        var currentChannel = null;
                        $scope.choosechannel = function(dat){
                            angular.forEach($scope.channals,function (value) {
                                value.active = false;
                            });
                            dat.active = true;
                            currentChannel = dat;
                        };

                        $scope.loadingInProgress = false;
                        var accountid = $location.search().aid;
                        dalockrServices.getAllChannel(accountid).success(function(data){
                           $scope.channals = data;
                        });

                        $scope.joinChannals = function(){

                            if(currentChannel){
                                var entityid = scope.currentAssetId;
                                $scope.loadingInProgress = true;
                                dalockrServices.addEntityToChannel(currentChannel.id,entityid,'asset').success(function(){
                                    $scope.loadingInProgress = false;
                                    $mdDialog.hide();
                                }).error(function(error){
                                    $scope.loadingInProgress = false;
                                    if(error.message){
                                        toastr.error(error.message);
                                    }
                                    //throw Error(error);
                                })
                            }
                        };
                    }
                }
                

                //判断是否用户是否是Asset的Account的Manager
                var watcher = scope.$watch('currentAssetDetails',function(newVal, oldVale) {
                    $rootScope.$broadcast('assetDataToPath',newVal);
                    if(newVal){
                        userServices.getUserProfileInfo(function () {
                            scope.isAccountManager = userRightServices.isAccountManager(scope.currentAssetDetails.accountId);
                        });
                        watcher();
                    }
                });


                function shareAssetController($scope,toastr,$mdDialog){


                    $scope.socialChannels = [];
                    $scope.loadingSocialChannels = true;
                    $scope.noSocialChannels = false;
                    $scope.isScheduling = false;
                    $scope.hasTwitter = false;
                    $scope.shareDate = new Date();


                    var currentAssetMimeType  = scope.currentAssetDetails.mimeType;
                    var haveSelectedChannels = [];
                    getAssetParentLockrSharingRule();

                    function getAssetParentLockrSharingRule() {

                        sharingRuleToShareService.getCanSharedSocialChannelsAndRule(scope.currentAssetDetails.lockrId, currentAssetMimeType).then(function (rule) {
                            $scope.loadingSocialChannels = false;
                            if(rule.usedRule){
                                $scope.currentAvaliableSharingRule = rule.usedRule;
                                haveSelectedChannels = rule.usedRule.postOnSocialChannel;
                                $scope.socialChannels = rule.usedRule.postOnSocialChannelDetail.map(function (val) {
                                    val.active = true;
                                    val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                    return val;
                                });

                            } else { //没有对应的Rule 显示account的所有social channels
                                dalockrServices.getShareSocialChannelWithCache(function (results) {
                                    $scope.socialChannels = results.map(function (val) {
                                        val.active = false;
                                        val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                        return val;
                                    });
                                })
                            }
                        });


                        //
                        //sharingRuleToShareService.getSharingRuleCanShareForEntity(scope.currentAssetDetails.lockrId, currentAssetMimeType, function (data) {
                        //
                        //    $scope.loadingSocialChannels = false;
                        //    $scope.socialChannels = data.normalSocialChannels;
                        //
                        //    if($scope.socialChannels.length === 0){
                        //        $scope.noSocialChannels = true;
                        //    } else {
                        //        $scope.currentAvaliableSharingRule =  data.avaliableSharingRules;
                        //        if($scope.currentAvaliableSharingRule){
                        //            haveSelectedChannels =  data.avaliableSharingRules.postOnSocialChannel;
                        //            if (haveSelectedChannels.length) {
                        //                var tempArr = [];
                        //                angular.forEach($scope.socialChannels, function (v1) {
                        //                    angular.forEach(haveSelectedChannels, function (v2) {
                        //                        if (v1.id === v2) {
                        //                            tempArr.push(v1);
                        //                        }
                        //                    });
                        //                });
                        //                $scope.socialChannels = tempArr;
                        //                checkActiveItem();
                        //            } else {
                        //                //toastr.warning('The sharing rule does\'t have any social channels, you can select', 'Warning');
                        //            }
                        //        } else {
                        //            //toastr.warning('The sharing rule does\'t have any social channels, you can select', 'Warning');
                        //        }
                        //    }
                        //});
                    }


                    $scope.selectShareSocialChannels = function(id){
                        var idx = 0;
                        if( (idx = haveSelectedChannels.indexOf(id)) < 0){
                            haveSelectedChannels.push(id);
                        } else {
                            haveSelectedChannels.splice(idx,1);
                        }
                        checkActiveItem();
                    };

                    function checkActiveItem(){
                        for(var k= 0, l3 = $scope.socialChannels.length; k<l3;k++){
                            $scope.socialChannels[k].active = false;
                        }

                        for(var i= 0, l1 = haveSelectedChannels.length;i<l1; i++){
                            var obj1 = haveSelectedChannels[i];
                            for(var j= 0, l2 = $scope.socialChannels.length; j<l2;j++){
                                var obj2 = $scope.socialChannels[j];
                                if(obj1 === obj2.id){
                                    obj2.active = true;

                                    //检查是否有twitter
                                    if(obj2.socialChannelType.toLowerCase() === 'twitter'){
                                        $scope.hasTwitter = true;
                                    }

                                }
                            }
                        }
                    }




                    $scope.shareEntity = {
                        title:'',
                        text:'',
                        shareMsg:'',
                        channels:null
                    };


                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function(answer) {
                        $mdDialog.hide(answer);
                    };


                    $scope.loadingInProgress = false;
                    $scope.submitted = false;
                    $scope.shareAsset = function(){

                        $scope.submitted = true;

                        if($scope.share_asset_form.$valid){

                            $scope.shareEntity.channels = haveSelectedChannels;
                            $scope.loadingInProgress = true;

                            if($scope.isScheduling){ //定时Share
                                var httpBody = angular.extend($scope.shareEntity,{"shareByDate":$scope.shareDate.toISOString()});
                                dalockrServices.scheduleShareEventForAssetOrLockr('asset',scope.currentAssetId,httpBody).then(function (res) {

                                    toastr.success(res.data.message);
                                    $rootScope.$broadcast('shareSuccess',true);
                                    $mdDialog.hide();
                                }).catch(function (error) {
                                    if(error && error.message){
                                        toastr.error(error.message);
                                    }
                                    $scope.loadingInProgress = false;
                                });

                            } else {
                                dalockrServices.shareAsset(scope.currentAssetId,$scope.shareEntity,function(data){
                                    $rootScope.$broadcast('shareSuccess',true);
                                    if(data.socialInteractionResults){
                                        angular.forEach(data.socialInteractionResults, function (value, key) {
                                            if(value.socialPostStatus.toLowerCase() === 'failed'){
                                                toastr.error(value.failedMsg,value.socialChannelType + ' share error');
                                            }
                                        });
                                    } else {
                                        toastr.success(data.message);
                                    }
                                    $mdDialog.hide();
                                },function(error){
                                    if(error && error.responseText){
                                        toastr.error(JSON.parse(error.responseText).message);
                                    }
                                    $scope.loadingInProgress = false;

                                });

                            }




                        }

                    };





                }

                var menuIsDisplay = false;
                var documentElem = angular.element(document);
                scope.ismenuopen = false;
                scope.showDropMenu = function(){
                    scope.ismenuopen = !scope.ismenuopen;
                    if( !menuIsDisplay ) {
                        $rootScope.$broadcast('openFixedMenu', true);
                        element.find('.dropdown-fixed-menu').slideDown('fast');
                        documentElem.on('click',closefixedMenu);
                    } else {
                        $rootScope.$broadcast('openFixedMenu', false);
                        element.find('.dropdown-fixed-menu').slideUp('fast');
                    }
                    menuIsDisplay = !menuIsDisplay;
                };

                function closefixedMenu(){
                    scope.ismenuopen =  false;
                    if(menuIsDisplay){
                        scope.$apply(function(){
                            $rootScope.$broadcast('openFixedMenu', false);
                            element.find('.dropdown-fixed-menu').slideUp('fast');
                            menuIsDisplay = false;
                        });
                    }

                }





                scope.addComment = function(){
                    $rootScope.$broadcast('addComment',true);
                    scope.showDropMenu();
                };


                /**
                 *  publish asset by date
                 */
                scope.$on('$$publishAsset', function () {
                    scope.openUpdateAssetDialog(null);
                });

                scope.openUpdateAssetDialog = function(ev){

                    $rootScope.$broadcast('openFixedMenu', false);
                    element.find('.dropdown-fixed-menu').slideUp('fast');
                    menuIsDisplay = false;



                    $mdDialog.show({
                        controller: publishAssetByDateCtrl,
                        templateUrl: 'views/templates/publish-asset-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')

                    });


                    function publishAssetByDateCtrl($scope){
                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.mobileDevice = $dalMedia('xs');
                        $scope.publishDate = new Date();
                        $scope.unpublishByDate = new Date();

                        if(!angular.isUndefined(scope.currentAssetDetails.publishByDate)){
                            $scope.publishDate = new Date(scope.currentAssetDetails.publishByDate);
                        }
                        $scope.shareMsg = '';

                        $scope.publishAsset = function(){
                            if($scope.publishDate && $scope.unpublishByDate){
                                $scope.loadingInProgress = true;
                                var updateData = {
                                    publishByDate:$scope.publishDate.toISOString(),
                                    unpublishByDate:$scope.unpublishByDate.toISOString()
                                };
                                dalockrServices.getLockrOrAssetComments('asset',scope.currentAssetId,function(data){
                                },function(){
                                   console.log(error);
                                });

                                dalockrServices.updateAssetDetails(scope.currentAssetId,updateData,function(data){

                                    toastr.success(data.message,'Success');
                                    //$rootScope.$broadcast('updateAssetDetails',true);
                                    $mdDialog.hide();

                                },function(error){

                                    $scope.loadingInProgress = false;
                                    toastr.error('Update error','Error');

                                });
                            }

                        }

                    }
                };

                scope.$on('mobileToPreview',previewAsset);
                scope.previewAsset = previewAsset;
                /**
                 * 进入PP预览Lockr
                 */
                function previewAsset(){
                    var previewUrl = appConfig.API_SERVER_ADDRESS + '/publishing-point/#/m/asset/' + commonServices.getDefaultTrackingId(scope.currentAssetDetails.links) + '?clusterId=' + scope.currentAssetDetails.clusterId;
                    window.open(previewUrl);
                }


            }
        };
    }]);
