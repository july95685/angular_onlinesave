'use strict';
/**
 * Created by panma on 7/21/15.
 */
angular.module('dalockrAppV2App')
    .directive('accountsRegion', ['dalockrServices','commonServices','$location','$mdDialog','$compile','$document','$rootScope','toastr','$q','appConfig','$sessionStorage','Upload','$filter','$timeout','$animate','userServices','userRightServices','cacheService','$dalMedia','addAccountService','addEditLockrManager','thumbnailServices','dalEntityMoreAction',
        function(dalockrServices,commonServices,$location,$mdDialog,$compile,$document,$rootScope,toastr,$q,appConfig,$sessionStorage, Upload,$filter,$timeout,$animate,userServices,userRightServices,cacheService,$dalMedia,addAccountService,addEditLockrManager,thumbnailServices,dalEntityMoreAction) {

        return {
            restrict: 'E',
            templateUrl: 'views/directives/accounts-region.html',
            scope:{
                accountsData:'=',
                loadingAccounts:'='
            },
            replace:true,
            link: function(scope,element){

                var accountarray,
                    assetsarray;
                scope.assetsData = [];

                scope.mobileDevice = $dalMedia('xs') ? true : false;
                scope.loadingAccount = true;
                scope.loadingAllAccount = true;
                scope.showMobileInfo = false;


                var followId = null;
                var useAccountDetails =false;
                var lockrsCache = commonServices.cacheInstance('lockrsCache');
                lockrsCache.remove('imageList');


                var screenWidth = commonServices.getCurrentBroswerWidth(),
                    cardW = commonServices.getMobileCardWidth(),
                    showWidth = scope.mobileDevice ? cardW  : 220,
                    tnSize = {
                        realWidth:0,
                        realHeight:0,
                        showWidth:showWidth,
                        showHeight: (showWidth * 240) / 319 //default height
                    };
                scope.mobileGap = (screenWidth - cardW*2) / 6;
                scope.mobileCardWidth = cardW;

                scope.$watch(function() {
                    return $dalMedia('max-width: 599px');
                }, function(val) {
                    scope.mobileScreen = val;
                    if(!val){
                        scope.showMobileInfo = false;
                        commonServices.allowBodyScroll();
                    }
                });

                userServices.getUserProfileInfo(function () {
                    scope.isIntegrator =  userRightServices.getUserRoles().INTEGRATOR;
                });

                scope.swipeOpenSlideMenu = function () {
                    $rootScope.$broadcast('$$openSliderMenu');
                };

                scope.batchHandle = function (ev,handleName,asset){
                    ev.getassetName = asset.name;
                    ev.getassetId = asset.id;
                    $rootScope.$broadcast('batchHandle',{name:handleName,event:ev});
                };
                scope.showMobileSider = function () {
                    if(scope.showMobileInfo){
                        scope.showMobileInfo = false;
                        commonServices.allowBodyScroll();
                    } else {
                        scope.showMobileInfo = true;
                        commonServices.banBodyScroll();
                    }
                };

                scope.$watch('accountsData', function(newVal) {
                    if(!angular.isArray(newVal)) return;
                    if (newVal.length !== 0) {
                        scope.loadingAllAccount = false;
                        setAccount(getCurrentAccount());
                    } else {
                        scope.loadingAllAccount = false;
                        scope.loadingAccount = false;
                     }
                });

                getChannels($location.search().aid);


                function getCurrentAccount() {
                    var aid =  $location.search().aid;
                    for(var i= scope.accountsData.length; i-- ;i >=0){
                        var ac = scope.accountsData[i];
                        if(ac.accountId === aid){
                            return ac;
                        }
                    }
                    return scope.accountsData[0];
                }

                function setAccount(accountInfo){
                    angular.forEach(scope.accountsData, function (v) {
                        v.active = false;
                    });
                    accountInfo.active = true;
                    commonServices.setAccountId(accountInfo.accountId);

                    $location.search('aid',accountInfo.accountId);
                    scope.currentLockrId = accountInfo.id;
                    initCurrentAccountData(true);
                    sendNotification(accountInfo);
                }
                function sendNotification(accountInfo){
                    $rootScope.$broadcast('change-account',accountInfo);
                }
                function accountInstanceWithId(accounts,id){
                    for (var i = 0; i < accounts.length; i++) {
                      var obj = accounts[i];
                        if(obj.accountId === id){
                            return obj;
                        }
                    }
                    return null;
                }


                function initCurrentAccountData(isHide){
                    var lockr = cacheService.checkLockrFromStack(scope.currentLockrId);
                    if(lockr){
                        handleCurrentAccountData(lockr);
                    } else {
                        getCurrentAccountDetails(isHide);
                    }
                }



                $rootScope.$on('$routeChangeSuccess',function (e,current) {
                    if(current.params.aid) {
                        getChannels(current.params.aid);
                    }
                });

                scope.$on('updateChannals',function (ev, data) {
                    data.fileType = 'subLockr';
                    data.isChannel = true;
                    data.fileTypeIcon = 'mdi-folder-star';
                    scope.assetsData.push(data);
                });

                function getChannels(aid){
                    dalockrServices.getAllChannel().success(function(data){
                        accountarray = [];
                        var accountID = aid;
                        angular.forEach(data,function(value){
                            if(accountID == value.accountId){
                                accountarray.push(value);
                                value.fileType = 'subLockr';
                                value.isChannel = true;
                                value.fileTypeIcon = 'mdi-folder-star';
                            }
                        });

                        if(assetsarray){
                            scope.assetsData = accountarray.concat(assetsarray);
                        }

                    });

                }

                //更新lockr details
                scope.$on('updateLockrDetails',function(ev,isHideDialog){
                    console.log('update');
                    getCurrentAccountDetails(isHideDialog);
                });


                scope.addAccount = function () {
                    addAccountService.addAccount().then(function (success) {
                        if(success){
                            scope.loadingAccount = true;
                            scope.loadingAllAccount = true;
                            scope.accountsData = null;
                            $rootScope.$broadcast('addAccountSuccess');
                        }
                    })
                };


                scope.switchAccount = function(index){
                    scope.loadingAccount = true;
                    scope.currentLockrDetails = null;
                    if(scope.assetsData){
                    scope.assetsData = [];}
                    setAccount(accountInstanceWithId(scope.accountsData,index.aid));
                    commonServices.saveAccounts(index.accounts);
                };


                scope.$on('$$ChangeAccountOfMobile', function (ev,account) {
                    scope.currentLockrDetails = null;
                    if(scope.assetsData){
                    scope.assetsData = [];}
                    setAccount(accountInstanceWithId(scope.accountsData,account.accountId));
                    scope.loadingAccount = true;
                });



                function getCurrentAccountDetails(isHideDialog){
                    dalockrServices.getLockrDetails( scope.currentLockrId ).then(function(response){
                        if(isHideDialog){
                            $mdDialog.hide();
                        }
                        var useAccountDetails = true;
                        cacheService.pushLockrToStack(response.data);
                        handleCurrentAccountData(response.data);

                    }).catch(function(error){
                        console.error(error);
                    });

                }


                function handleCurrentAccountData(data){

                    scope.showText = "Total Lockrs in account : 0";
                    scope.showHeader = true;
                    scope.loadingAccount = false;


                    //赋予计算后新的属性
                    data.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',data.id);
                    //data.thumbnailUrl = data.thumbnailUrl + '#timestamp=' + new Date().getTime();
                    data.socialChannelView = commonServices.getSocialChannelViewNum(data.links);
                    data.assetExtraInfo = {
                        'imageCount': 0,
                        'videoCount': 0,
                        'pdfCount':0,
                        'audioCount':0,
                        'lockrCount':0,
                        'assetCount':0,
                        'othersCount':0
                    };

                    scope.currentLockrDetails = data;

                    if( angular.isUndefined(data.assets) && angular.isUndefined(data.subLockrs) ) return;


                    var assetsDataTmp = [];

                    if(angular.isDefined(data.assets)){

                        commonServices.setAssets(data.assets);
                        data.assetExtraInfo.assetCount = data.assets.length;

                        var imageCount = 0,
                            audioCount = 0,
                            pdfCount = 0,
                            videoCount = 0,
                            othersCount = 0;

                        data.assets = $filter('orderBy')(data.assets,'dateLastUpdated',true);

                        setImageSwitchList(data.assets);

                        angular.forEach(data.assets, function(value,key){

                            value.tnSize = tnSize;
                            // var data = new Date().getTime();
                            value.thumbnailUrl = dalockrServices.getThumbnailUrl('asset', value.id);
                            //value.thumbnailUrl = value.thumbnailUrl + '?timestamp=' + new Date().getTime();

                                value.noTnDimensions = true;
                            value.socialChannelView = commonServices.getSocialChannelViewNum(value.links);

                            if(typeof value.tnDimensions !== 'undefined') {
                                var size = value.tnDimensions.split('x');
                                var showHeight = (showWidth * parseInt(size[1]) ) / parseInt(size[0]);
                                value.tnSize = {
                                    realWidth: parseInt(size[0]),
                                    realHeight: parseInt(size[1]),
                                     showWidth: Math.floor(showWidth),
                                    showHeight: Math.floor(showHeight)
                                };
                                value.noTnDimensions = false;
                            }

                            value.mimeType.isFileType('article') && (value.fileType = 'article') && ++othersCount;
                            value.mimeType.isFileType('doc') && (value.fileType = 'doc') && ++othersCount;
                            value.mimeType.isFileType('xls') && (value.fileType = 'xls') && ++othersCount;
                            value.mimeType.isFileType('ppt') && (value.fileType = 'ppt') && ++othersCount;
                            value.mimeType.isFileType('video') && (value.fileType = 'video') && ++videoCount;
                            value.mimeType.isFileType('audio') && (value.fileType = 'audio') && ++audioCount;
                            value.mimeType.isFileType('pdf') && (value.fileType = 'pdf') && ++pdfCount;
                            value.mimeType.isFileType('image') && (value.fileType = 'image') && ++imageCount;
                            value.fileTypeIcon = commonServices.getAssetFileTypeIconWithType(value.fileType);

                            assetsDataTmp.push(value);
                        });

                        data.assetExtraInfo = {
                            'imageCount': imageCount,
                            'videoCount': videoCount,
                            'pdfCount':pdfCount,
                            'audioCount':audioCount,
                            'lockrCount':0,
                            'othersCount':othersCount,
                            'excludeCount':imageCount + videoCount + pdfCount + audioCount
                        };
                    }

                    if(angular.isDefined(data.subLockrs)){
                        data.assetExtraInfo.lockrCount = data.subLockrs.length;
                        scope.showText = "Total Lockrs in account : " + data.subLockrs.length;
                        scope.showHeader = true;

                        angular.forEach(data.subLockrs, function(value,key){
                             userServices.getUserProfileInfo(function(info){
                         if(info){
                        value.iscontent=userRightServices.isContentManager(value.id,value.hierarchy);
                        value.iscommunity=userRightServices.isCommunityManager(value.id,value.hierarchy);
                           }
                         });

                            value.tnSize = tnSize;
                            value.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr', value.id);
                            //value.thumbnailUrl = value.thumbnailUrl + '&timestamp=' + new Date().getTime();
                            value.socialChannelView = commonServices.getSocialChannelViewNum(data.links);
                            value.fileType = 'subLockr';
                            value.noTnDimensions = true;
                            value.fileTypeIcon = 'dal-icon-mylocker_black';



                            if(typeof value.tnDimensions !== 'undefined') {

                                var size = value.tnDimensions.split('x');
                                var showHeight = (showWidth * parseInt(size[1]) ) / parseInt(size[0]);
                                value.tnSize = {
                                    realWidth: parseInt(size[0]),
                                    realHeight: parseInt(size[1]),
                                    showWidth: showWidth,
                                    showHeight: showHeight
                                };
                                value.noTnDimensions = false;
                            }
                            assetsDataTmp.push(value);
                        });

                    }

                    assetsarray = assetsDataTmp;
                    if(accountarray){
                       scope.assetsData = accountarray.concat(assetsarray);
                    }
                    scope.currentLockrDetails.assetExtraInfo = commonServices.formatExtraInfo(data.assetExtraInfo);

                }



                function setImageSwitchList(assets){

                    var imageList = [],
                        imageReg = /^image/,
                        idx = 0;
                    for (var i = 0; i < assets.length; i++) {
                        var obj = assets[i];
                        if(obj.mimeType.match(imageReg)){
                            imageList.push({id:obj.id,index:idx});
                            idx++;
                        }
                    }
                    lockrsCache.put('imageList',imageList);
                }


                scope.seeAssetOrLockr = function(value){
                    angular.forEach(scope.assetsData, function(v, key){
                        if(value.id === v.id){
                            if(value.type === 'subLockr'){
                                $location.path('/sublockr/' + value.id);
                            } else {
                                commonServices.setSelectedAssetId(value.id);
                                $location.path('/asset/' + value.id); //进入asset-details页
                            }
                        }
                    });
              
                };


                lockrHandle();
                assetHandle();



                function assetHandle(){

                    //set as lockr thumbnail
                    scope.setThumbnail = function(ev,assetId){
                        dalockrServices.updateLockr(scope.currentLockrId,{
                            thumbnailAssetId:assetId
                        },function(data){
                            $rootScope.$broadcast('updateLockrDetails',true);
                            toastr.success('Thumbnail '+ data.lockr.name + ' has been set.','Success');
                        },function(error){
                            toastr.error(error.message,'Error');
                        });

                        cancelBubble(ev);
                    };



                    scope.openDeleteAssetDialog = function(ev,value){
                        scope.deleteAssetInfo = value;


                        $mdDialog.show({
                            controller: deleteAssetDialogController,
                            templateUrl: 'views/templates/delete-asset-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });

                        cancelBubble(ev);

                    };
                    function editArticleDialogController($scope){
                        var token = userServices.getAccessToken();
                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.newArticle = {};
                        $scope.newArticle.articleDescription = scope.editAssetInfo.description;
                        $scope.newArticle.articleName = scope.editAssetInfo.name;

                        var src = dalockrServices.getAssetSrc('asset',scope.editAssetInfo.id);
                        dalockrServices.getArticleAssetContent(src).then(function(response){
                            $scope.newArticle.articleText = response.data;
                        },function(error){

                        });

                        $scope.menu = [
                            ['bold', 'italic', 'underline', 'strikethrough'],
                            ['format-block'],
                            ['font'],
                            ['font-size'],
                            ['font-color', 'hilite-color'],
                            ['remove-format'],
                            ['ordered-list', 'unordered-list', 'outdent', 'indent'],
                            ['left-justify', 'center-justify', 'right-justify'],
                            ['link', 'image'],
                            ['css-class']
                        ];
                        $scope.noSelectFile = true;

                        $scope.$watch('headlineImage', function (newVal, oldVal) {
                            if (newVal !== oldVal && newVal !== null) {
                                $scope.noSelectFile = false;
                                $scope.fileName = $scope.headlineImage.name;
                            }
                        });
                        $scope.buttonText = 'UPDATE';

                        $scope.loadingInProgress = false;
                        $scope.submitted = false;
                        $scope.uploadArticle = function() {

                            $scope.determinateValue = 0;
                            $scope.submitted = true;

                            if ($scope.upload_article_form.$valid) {

                                $scope.loadingInProgress = true;
                                $scope.newArticle.lockrId = scope.currentLockrId;

                                var assetData = $scope.newArticle;
                                assetData.headlineImage = $scope.headlineImage;
                                assetData.headlineImageName = $scope.newArticle.name;
                                assetData.headlineImageDescription = $scope.newArticle.description;


                                Upload.upload({
                                    url: appConfig.API_SERVER_ADDRESS + '/api/article/'+ scope.editAssetInfo.id +'/details?' + 'token=' + token, //upload.php script, node.js route, or servlet url
                                    method: 'PUT',
                                    fields: assetData,
                                    formDataAppender: function (fd, key, val) {
                                        if (angular.isArray(val)) {
                                            angular.forEach(val, function (v) {
                                                if (v === null) {
                                                    v = " ";
                                                }
                                                fd.append(key, v);
                                            });
                                        } else {
                                            if (val === null) {
                                                val = " ";
                                            }
                                            fd.append(key, val);
                                        }
                                    }
                                }).progress(function (evt) {
                                    $scope.determinateValue = parseInt(100.0 * evt.loaded / evt.total);
                                }).success(function (data, status, headers, config) {        // file is uploaded successfully
                                    $rootScope.$broadcast('updateLockrDetails', true);
                                    toastr.success('Article has been updated', 'Success');
                                }).error(function (data, status) {
                                    $scope.loadingInProgress = false;
                                    toastr.error(data.message, 'Error');
                                })
                                    .xhr(function (xhr) {

                                    });
                            } else {
                            }
                        };
                    }

                    scope.openEditAssetDialog = function(ev,value){

                        scope.editAssetInfo = value;


                        if(value.fileType === 'article'){
                            $mdDialog.show({
                                controller: editArticleDialogController,
                                templateUrl: 'views/templates/add-article-dialog.html',
                                parent: angular.element(document.body),
                                targetEvent: ev,
                                clickOutsideToClose:false,
                                fullscreen:$dalMedia('xs')
                            });

                        }else {
                            $mdDialog.show({
                                controller: editAssetDialogController,
                                templateUrl: 'views/templates/edit-asset-dialog.html',
                                parent: angular.element(document.body),
                                targetEvent: ev,
                                clickOutsideToClose: false,
                                fullscreen:$dalMedia('xs')

                            });
                        }

                        cancelBubble(ev);

                    };

                    function deleteAssetDialogController($scope){

                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.assetItem = scope.deleteAssetInfo;

                        $scope.deleteAsset = function(){

                            $scope.isDeleting = true;

                            dalockrServices.deleteAssetWithPromise($scope.assetItem.id)
                                .success(function(){
                                    toastr.success('Successfully deleted');
                                    $rootScope.$broadcast('updateLockrDetails',true);
                                }).error(function (error) {
                                    $scope.isDeleting = false;
                                    if(error && error.message)
                                        toastr.error(error.message);
                                });

                        }


                    }

                    function editAssetDialogController($scope){

                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.currentAssetData =  angular.copy(scope.editAssetInfo);
                        var tags = '';
                        var tagsLen = $scope.currentAssetData.tags.length;
                        if(tagsLen !== 0){
                            for (var i = 0; i <tagsLen ; i++) {
                                var obj = $scope.currentAssetData.tags[i];
                                if(i === tagsLen-1){
                                    tags += obj;
                                } else {
                                    tags += obj + ',';
                                }
                            }
                        }
                        $scope.tags = tags;


                        $scope.submitted = false;

                        $scope.updateAsset = function(){

                            $scope.submitted = true;
                            $scope.loadingInProgress = true;

                            if($scope.update_asset_form.$valid) {

                                var entityData = {
                                    name: $scope.currentAssetData.name,
                                    description: $scope.currentAssetData.description,
                                    tags: $scope.tags
                                };

                                dalockrServices.updateAssetDetails($scope.currentAssetData.id,entityData,function(data){
                                    $rootScope.$broadcast('updateLockrDetails', true);
                                    toastr.success("Asset " + data.asset.name +" has successfully been updated.",'Success');
                                }, function (error) {
                                    $scope.loadingInProgress = false;
                                    toastr.error(error.message,'Error');
                                });
                            }
                        };
                    }

                }




                function lockrHandle(){

                    scope.followLockr = function(ev,value){
                        dalockrServices.followLockr(value.id, function(data){
                            getLockrFollowers();
                            toastr.success('Follow '+ value.name + ' has successfully been created.','Success');
                        },function(error){
                            toastr.error(JSON.parse(error.responseText).message,'Error');
                        });

                        cancelBubble(ev);
                    };

                    scope.unFollowLockr = function(ev){
                        dalockrServices.deleteUserFollows(followId,function(data){
                            getLockrFollowers();
                            toastr.success(data.message,'Success');
                        },function(error){
                            toastr.error(JSON.parse(error.responseText).message,'Error');
                        });
                    };


                    scope.deleteLockrConfirm = function(value){
                        var confirm = $mdDialog.confirm()
                            .title('Are you sure you want to delete this post '  + value.name + '?')
                            .textContent('Please note that all assets and comments on social channels will be deleted ')
                            .ariaLabel('Lucky day')
                            .ok('OK')
                            .cancel('CANCEL');

                        $mdDialog.show(confirm).then(function() {
                            console.log(value);
                            scope.loadingInProgress = true;
                            dalockrServices.deleteLockr(value.id,true,true,function(data){
                                toastr.success(value.name + ' has been deleted successfully');
                                $rootScope.$broadcast('updateLockrDetails',true);
                                scope.$apply();

                            },function(error){
                                if(error && error.responseText)
                                    toastr.error(JSON.parse(error.responseText).message);
                                scope.loadingInProgress = false;
                                scope.$apply();
                            });
                        }, function() {
                            console.log(2);
                        });

                    };




                    scope.openDeleteLockrDialog = function(ev,value){

                        scope.currentDeleteLockr = value;

                        $mdDialog.show({
                            controller: deleteLockrDialogController,
                            templateUrl: 'views/templates/delete-lockr-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')

                        });
                        cancelBubble(ev);

                    };


                    function deleteLockrDialogController($scope){


                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.currentDeleteLockr = scope.currentDeleteLockr;

                        $scope.deleteData = {
                            deleteAssets:false,
                            socialChannels:false
                        };

                        $scope.$watch(function($scope){
                            return $scope.deleteData.deleteAssets;
                        },function(newVal,oldVal){
                            if(newVal === false){
                                $scope.deleteData.socialChannels = false;
                            }
                        });


                        $scope.deleteLockr = function(){

                            $scope.loadingInProgress = true;

                            dalockrServices.deleteLockr(scope.currentDeleteLockr.id,$scope.deleteData.deleteAssets,$scope.deleteData.socialChannels,function(data){

                                toastr.success('Successfully deleted');

                                if($scope.currentDeleteLockr.lockrType.toLowerCase() == 'channellockr'){
                                    getChannels($location.search().id);
                                    $mdDialog.hide();
                                } else {
                                    $rootScope.$broadcast('updateLockrDetails',true);
                                }
                                $scope.$apply();
                            },function(error){
                                if(error && error.responseText)
                                    toastr.error(JSON.parse(error.responseText).message);
                                $scope.loadingInProgress = false;
                                $scope.$apply();
                            });
                        }
                    }



                    scope.openEditLockrDialog = function(ev,value){

                        addEditLockrManager.edit(value);

                        //$mdDialog.show({
                        //    controller: editLockrDialogController,
                        //    templateUrl: 'views/templates/edit-lockr-dialog.html',
                        //    parent: angular.element(document.body),
                        //    targetEvent: ev,
                        //    clickOutsideToClose:false,
                        //    fullscreen:$dalMedia('xs')
                        //});

                        cancelBubble(ev);



                    };

                    //function editLockrDialogController($scope){
                    //
                    //    $scope.hide = function() {
                    //        $mdDialog.hide();
                    //    };
                    //    $scope.cancel = function() {
                    //        $mdDialog.cancel();
                    //    };
                    //    $scope.answer = function(answer) {
                    //        $mdDialog.hide(answer);
                    //    };
                    //    $scope.currentLockrData = angular.copy(scope.isEdittingLockr);
                    //
                    //    if($scope.currentLockrData.hiddenFromPublicView === true){
                    //        $scope.shareRules = 'private';
                    //    } else {
                    //        $scope.shareRules = 'public';
                    //    }
                    //
                    //    $scope.submitted = false;
                    //
                    //    $scope.updateLockr = function(){
                    //
                    //        $scope.submitted = true;
                    //
                    //        if($scope.update_lockr_form.$valid) {
                    //
                    //            $scope.loadingInProgress = true;
                    //            var hiddenFromPublicView = false;
                    //            if ($scope.shareRules === 'private') {
                    //                hiddenFromPublicView = true;
                    //            }
                    //
                    //
                    //            var entityData = {
                    //                name: $scope.currentLockrData.name,
                    //                description: $scope.currentLockrData.description,
                    //                hiddenFromPublicView: hiddenFromPublicView
                    //            };
                    //
                    //            dalockrServices.updateLockr($scope.currentLockrData.id, entityData, function (data) {
                    //
                    //                $rootScope.$broadcast('updateLockrDetails', true);
                    //                toastr.success("Lockr " + data.lockr.name +" has successfully been updated.",'Success');
                    //            }, function (error) {
                    //                $scope.loadingInProgress = false;
                    //                toastr.error(error.message,'Error');
                    //            });
                    //        }
                    //    };
                    //
                    //}





                    scope.openDownloadLockrDialog = function(ev,value){

                        scope.isDownloadingLockr = value;

                        $mdDialog.show({
                            controller: downloadLockrDialogController,
                            templateUrl: 'views/templates/download-lockr-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });

                        cancelBubble(ev);


                    };


                    function downloadLockrDialogController($scope){

                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };
                        $scope.currentLockrData = angular.copy(scope.isDownloadingLockr);
                        $scope.downloadLockrUrl = dalockrServices.downloadLockrUrl($scope.currentLockrData.id);

                        $scope.downloadLockr = function(){
                            $mdDialog.hide();
                            document.getElementById('lockr-download-a').click();
                        }

                    }
                }




                window.onresize = function(){
                    element.find('.asset-info').css('min-height',(commonServices.getCurrentBroswerHeight() - 90 - 82 -45) + 'px');
                };
                scope.$on('openFixedMenu', function(event,value){
                    if(value){
                        scope.regionSize = {
                            width:element[0].clientWidth,
                            height:element[0].clientHeight
                        };
                        scope.maskIsShow = true;
                    } else {
                        scope.maskIsShow = false;
                    }

                });


                //Notification
                scope.notificationAddAsset = function(ev){
                    $rootScope.$broadcast('addAsset',ev);
                };




                /*********** 批量操作 ASSET ***********/

                //selected-item



                var haveSelectedItem = [];

                scope.selectItem = function(ev,value){

                    if(haveSelectedItem.length === 0){
                        haveSelectedItem.push(value);
                        var nElem = element.find('#asset-' + value.id);
                        markElem(nElem);

                        //通知Fix-Menu
                        $rootScope.$broadcast('haveSelectedOneItem',true);

                    } else {
                        var isSave = false;
                        for(var k=0; k<haveSelectedItem.length; k++){
                            if(haveSelectedItem[k].id === value.id){
                                haveSelectedItem.splice(k,1);

                                var hmElem = element.find('#asset-' + value.id);
                                cancelMarkElem(hmElem);
                                isSave = true;
                                break;
                            }
                        }
                        if(!isSave){
                            haveSelectedItem.push(value);
                            var aElem = element.find('#asset-' + value.id);
                            markElem(aElem);
                        }


                        if(haveSelectedItem.length === 0){
                            $rootScope.$broadcast('haveSelectedOneItem',false);
                        }
                    }

                    cancelBubble(ev);

                };

                //全选
                function selectAllElem(){

                    haveSelectedItem = [];
                    angular.forEach(scope.currentLockrDetails.assets, function(value,key){
                        var item = element.find('#asset-'+value.id);
                        markElem(item);
                        haveSelectedItem.push({id:value.id,name:value.name});

                    })

                }
                //全不选
                function unSelectAllElem(){

                    angular.forEach(scope.currentLockrDetails.assets, function(value,key){
                        var item = element.find('#asset-'+value.id);
                        cancelMarkElem(item);
                    });
                    haveSelectedItem = [];

                }

                //选择
                function markElem(elem){
                    if(!elem.hasClass('selected-item')){
                        elem.addClass('selected-item');
                        elem.find('.selected-icon').removeClass('mdi-checkbox-multiple-blank-outline')
                            .addClass('mdi-checkbox-multiple-marked-outline');
                    }

                }
                //取消选择
                function cancelMarkElem(cElem){
                    if(cElem.hasClass('selected-item')){
                        cElem.removeClass('selected-item');
                        cElem.find('.selected-icon').removeClass('mdi-checkbox-multiple-marked-outline')
                            .addClass('mdi-checkbox-multiple-blank-outline');
                    }

                }

                scope.$on('batchHandle',function(event,handleName){

                    switch(handleName.name)
                    {
                        case 'move':
                            moveAssets(handleName.event);
                            break;
                        case 'copy':
                            copyAssets(handleName.event);
                            break;
                        case 'mark':
                            selectAllElem();
                            break;
                        case 'unMark':
                            unSelectAllElem();
                            $rootScope.$broadcast('haveSelectedOneItem',false);
                            break;
                        case 'clickAddBtn':
                            unSelectAllElem();
                            break;
                        case 'delete':
                            deleteAssets(handleName.event);
                            break;
                        case 'addToArticle':
                            addToArticle(handleName.event);
                            break;
                        default:
                            break;
                    }



                });

                function addToArticle(){
                    //addToArticleDialog(event);

                }

                //function addToArticleDialog(ev){
                //    $mdDialog.show({
                //        controller: addToArticleDialogController,
                //        templateUrl: 'views/templates/add-article-dialog.html',
                //        parent: angular.element(document.body),
                //        targetEvent: ev,
                //        clickOutsideToClose:false,
                //        fullscreen:$dalMedia('xs')
                //    });
                //}
                //
                //
                //
                //function addToArticleDialogController($scope){
                //
                //    var token = userServices.getAccessToken();
                //    $scope.hide = function() {
                //        $mdDialog.hide();
                //    };
                //    $scope.cancel = function() {
                //        $mdDialog.cancel();
                //    };
                //    $scope.answer = function(answer) {
                //        $mdDialog.hide(answer);
                //    };
                //
                //    $scope.menu = [
                //        ['bold', 'italic', 'underline', 'strikethrough'],
                //        ['format-block'],
                //        ['font'],
                //        ['font-size'],
                //        ['font-color', 'hilite-color'],
                //        ['remove-format'],
                //        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
                //        ['left-justify', 'center-justify', 'right-justify'],
                //        ['link', 'image'],
                //        ['css-class']
                //    ];
                //    $scope.noSelectFile = true;
                //
                //    $scope.$watch('headlineImage', function (newVal, oldVal) {
                //        if (newVal !== oldVal && newVal !== null) {
                //            $scope.noSelectFile = false;
                //            $scope.fileName = $scope.headlineImage.name;
                //        }
                //    });
                //
                //    $scope.buttonText = 'ADD ARTICLE';
                //
                //    var preDefinedHtmls = '';
                //
                //    $scope.newArticle = {};
                //
                //    angular.forEach(haveSelectedItem, function(value){
                //        if(value.fileType === 'image'){
                //            preDefinedHtmls = preDefinedHtmls + '<img src="'+ appConfig.API_SERVER_ADDRESS +'/a/demo/'+ value.trackingId  +'/tn">';
                //        }
                //    });
                //    $scope.newArticle.articleText = preDefinedHtmls;
                //
                //    $scope.loadingInProgress = false;
                //    $scope.submitted = false;
                //    $scope.uploadArticle = function(){
                //
                //        $scope.determinateValue = 0;
                //        $scope.submitted = true;
                //
                //        if($scope.upload_article_form.$valid){
                //
                //            $scope.loadingInProgress = true;
                //            $scope.newArticle.lockrId = scope.currentLockrId;
                //
                //            var assetData = $scope.newArticle;
                //            assetData.headlineImage =  $scope.headlineImage;
                //            assetData.headlineImageName = $scope.newArticle.name;
                //            assetData.headlineImageDescription = $scope.newArticle.description;
                //
                //            Upload.upload({
                //                url: appConfig.API_SERVER_ADDRESS + '/api/article?'+'token=' + token, //upload.php script, node.js route, or servlet url
                //                method: 'POST',
                //                fields:assetData,
                //                formDataAppender: function(fd, key, val){
                //                    if (angular.isArray(val)) {
                //                        angular.forEach(val, function(v) {
                //                            if(v === null){
                //                                v = " ";
                //                            }
                //                            fd.append(key, v);
                //                        });
                //                    } else {
                //                        if(val === null){
                //                            val = " ";
                //                        }
                //                        fd.append(key, val);
                //                    }
                //                }
                //            }).progress(function(evt) {
                //                $scope.determinateValue = parseInt(100.0 * evt.loaded / evt.total);
                //            }).success(function(data, status, headers, config) {        // file is uploaded successfully
                //                $rootScope.$broadcast('updateLockrDetails',true);
                //                toastr.success('Article has been created','Success');
                //            }).error(function(data,status){
                //                    $scope.loadingInProgress = false;
                //                    toastr.error(data.message,'Error');
                //                })
                //                .xhr(function(xhr){
                //
                //                });
                //        }else{
                //            //console.log('form error');
                //        }
                //
                //    };
                //
                //}



                function moveAssets(event){

                    function moveAssetsDialog(ev){

                        $mdDialog.show({
                            controller: moveAssetDialogController,
                            templateUrl: 'views/templates/move-assets-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });

                    }
                    moveAssetsDialog(event);


                    function moveAssetDialogController($scope){


                        $scope.isMoving = false;

                        if ( scope.currentLockrDetails.subLockrs ) {
                            $scope.currentLockrsData = angular.copy(scope.currentLockrDetails.subLockrs);
                            removeCurrentLockr();
                            $scope.moveToLockrId =  $scope.currentLockrsData[0].id;
                        }


                        function removeCurrentLockr(){
                            for(var i=0; i<$scope.currentLockrsData.length; i++) {
                                if($scope.currentLockrsData[i].id === scope.currentLockrId){
                                    $scope.currentLockrsData.splice(i,1);
                                }
                            }
                        }

                        if(event.getassetName){
                            $scope.haveSelectedItem = [];
                            var asset ={
                                name:event.getassetName,
                                id:event.getassetId
                            };
                            $scope.haveSelectedItem.push(asset);


                        }else{
                            $scope.haveSelectedItem = haveSelectedItem;
                        }

                        $scope.isLocked = scope.currentLockrDetails.locked;



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
                            $scope.isMoving = true;

                            //组合assetId
                            var assetIds = [];
                            for(var i=0; i<haveSelectedItem.length; i++){
                                assetIds.push(haveSelectedItem[i].id);
                            }

                            dalockrServices.moveAssetsToAnotherLockr(assetIds,scope.currentLockrId, $scope.moveToLockrId,function(data){

                                var toLockrName = '';
                                angular.forEach($scope.currentLockrsData, function(value,key){
                                    if(value.id === $scope.moveToLockrId){
                                        toLockrName = value.name;
                                    }
                                });
                                toastr.success('Moving of assets from lockr ' + scope.currentLockrDetails.name  + ' to ' + toLockrName  +' has completed.','Success');

                                unSelectAllElem();
                                $rootScope.$broadcast('haveSelectedOneItem',false);

                                $rootScope.$broadcast('updateLockrDetails', true);
                                $scope.isMoving = false;
                                $scope.$apply();
                            },function(error){
                                toastr.error("Move error",'Error');
                                $scope.isMoving = false;
                                $scope.$apply();
                            });


                        }


                    }



                }


                function copyAssets(event){

                    function copyAssetsDialog(ev){


                        $mdDialog.show({
                            controller: copyAssetDialogController,
                            templateUrl: 'views/templates/copy-assets-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });
                    }
                    copyAssetsDialog(event);


                    function copyAssetDialogController($scope){


                        $scope.isCopying = false;

                        if ( scope.currentLockrDetails.subLockrs) {
                            $scope.currentLockrsData = angular.copy(scope.currentLockrDetails.subLockrs);
                            removeCurrentLockr();
                            $scope.copyToLockrId =  $scope.currentLockrsData[0].id;
                        }



                        function removeCurrentLockr(){
                            for(var i=0; i<$scope.currentLockrsData.length; i++) {
                                if($scope.currentLockrsData[i].id === scope.currentLockrId){
                                    $scope.currentLockrsData.splice(i,1);
                                }
                            }
                        }
                        if(event.getassetName){
                            $scope.haveSelectedItem = [];
                            var asset ={
                                name:event.getassetName,
                                id:event.getassetId
                            };
                            $scope.haveSelectedItem.push(asset);


                        }else{
                            $scope.haveSelectedItem = haveSelectedItem;
                        }

                        $scope.isLocked = scope.currentLockrDetails.locked;



                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.startCopyAssets = function(){
                            $scope.isCopying = true;

                            //组合assetId
                            var assetIds = [];
                            for(var i=0; i<haveSelectedItem.length; i++){
                                assetIds.push(haveSelectedItem[i].id);
                            }


                            dalockrServices.copyAssetsToAnotherLockr(assetIds,scope.currentLockrId, $scope.copyToLockrId,function(data){

                                var toLockrName = '';
                                angular.forEach($scope.currentLockrsData, function(value,key){
                                    if(value.id === $scope.copyToLockrId){
                                        toLockrName = value.name;
                                    }
                                });

                                toastr.success('Copying of assets from lockr ' + scope.currentLockrDetails.name  + ' to ' + toLockrName  +' has completed.','Success');

                                //if($scope.copyToLockrId === scope.currentLockrId){
                                //
                                //    unSelectAllElem();
                                //    $rootScope.$broadcast('haveSelectedOneItem',false);
                                //    $rootScope.$broadcast('updateLockrDetails', true);
                                //    $scope.isMoving = false;
                                //
                                //} else {
                                $mdDialog.hide();
                                //}


                                $scope.$apply();
                            },function(error){
                                toastr.error("Copy error",'Error');
                                $scope.isCopying = false;
                                $scope.$apply();
                            });


                        }


                    }



                }





                function deleteAssets(event){

                    function deleteAssetsDialog(ev){


                        $mdDialog.show({
                            controller: deleteAssetDialogController,
                            templateUrl: 'views/templates/delete-assets-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });


                    }
                    deleteAssetsDialog(event);


                    function deleteAssetDialogController($scope){


                        $scope.isDeleting = false;

                        $scope.haveSelectedItem = haveSelectedItem;



                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.startDeleteAssets = function(){

                            $scope.isDeleting = true;

                            //组合assetId
                            var assetIds = [];
                            for(var i=0; i<haveSelectedItem.length; i++){
                                assetIds.push(haveSelectedItem[i].id);
                            }


                            var promiseArr = [];
                            for(var i=0; i<assetIds.length; i++){
                                promiseArr.push(dalockrServices.deleteAssetWithPromise(assetIds[i]))
                            }

                            $q.all(promiseArr).then(function(data){

                                toastr.success('Asset deleted','Success');
                                handleAfterDelete();

                            },function(error){
                                toastr.error('Asset delete error','Error');
                                handleAfterDelete();
                            });

                            function handleAfterDelete(){
                                unSelectAllElem();
                                $rootScope.$broadcast('haveSelectedOneItem',false);
                                $rootScope.$broadcast('updateLockrDetails', true);
                            }



                        }


                    }
                }



                scope.resultCallback = function (filterValue) {
                    scope.filterValue = filterValue;
                };


                $rootScope.$on('getPublishOrUnpublishAsset',function(event,value){
                    angular.forEach(scope.assetsData,function(val,key){
                        // console.log(value);
                        if(val.id === value.id){

                            if(value.type === 'publish'){
                                val.state = 'Published';
                            } else {
                                val.state = 'Draft';
                            }

                        }
                    });
                });

                scope.publishAsset = function(ev,item){

                    cancelBubble(ev);

                    if(angular.isUndefined(item.state)){
                        toastr.warning('The asset can\'t be published!','Warning');
                        return;
                    }


                    var type = 'publish';
                    if(item.state.toLowerCase() === 'published'){
                        type = 'unpublish';
                    }

                    dalockrServices.publishOrUnpublishAsset(type,item.id,function(data){
                        toastr.success(data.message,'Success');
                        if(type == 'unpublish'){
                            dalockrServices.getLockrOrAssetComments('asset',item.id,function(data){
                                angular.forEach(data,function(v){
                                    var commentData = v.comments;
                                    angular.forEach(commentData,function(val){
                                        dalockrServices.deleteCommentWhenUnplished(val.id);
                                    })
                                })
                            },function(){
                                toastr.error("Delete comments Error",'Error');
                            });
                        }

                        //修改模型
                        angular.forEach(scope.assetsData,function(value,key){
                            if(value.id === item.id){

                                if(type === 'publish'){
                                    value.state = 'Published';
                                } else {
                                    value.state = 'Draft';
                                    value.numberOfComments = 0;
                                }

                            }
                        });

                        scope.$apply();
                    },function(error){
                        toastr.error(error.message,'Error');
                        scope.$apply();
                    });

                };


                scope.addLockr = function(){
                    scope.$broadcast('add-lockr',true);
                };

                scope.lockLockr = function(ev,item){

                    var data = {
                        locked:true
                    };
                    if(item.locked){
                        data.locked = false;
                    }
                    dalockrServices.updateLockr(item.id,data,function(data){
                        item.locked = data.lockr.locked;
                        toastr.success('Lockr ' + data.lockr.name + ' has successfully been updated.','Success');
                    },function(){
                        toastr.error('Lock failed','Error');
                    });

                    ev.preventDefault();
                    cancelBubble(ev);
                };


                function cancelBubble(ev){
                    if(ev.stopPropagation()) {
                        ev.stopPropagation();
                    }else{
                        ev.cancelBubble = true;
                    }
                }


                // see lockr comments
                scope.seeLockrComments = function(){

                    commonServices.banBodyScroll();
                    $document.find('body').append($compile('<comment-flow-region asset-name="currentLockrDetails.name" file-id="{{currentLockrDetails.id}}" file-type="lockr"></comment-flow-region>')(scope));

                };


                scope.$on('addCloudServiceLockrNotification',function(){
                    scope.openAddCloudServiceLockrDialog();
                });



                scope.$on('addSafeLockrNotification',function(event,value){
                    scope.openAddSafeLockrDialog(value);
                });

                // 创建 Safe Lockr
                scope.openAddSafeLockrDialog = function(ev) {
                    $mdDialog.show({
                        controller: SafeDialogController,
                        templateUrl: 'views/templates/add-safe-lockr-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    })
                };


                function SafeDialogController($scope, $mdDialog, $rootScope) {

                    $scope.currentEntity = {
                        'name':null,
                        'description':''
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

                    $scope.submitted = false;
                    $scope.loadingInProgress = false;

                    $scope.createLockr = function(){

                        $scope.submitted = true;

                        if($scope.create_safe_lockr_form.$valid){
                            $scope.loadingInProgress = true;
                            var normalData = {
                                'name':$scope.currentEntity.name,
                                'description':$scope.currentEntity.description,
                                'parentLockrId':scope.currentLockrId
                            };
                            dalockrServices.createSafeLockr(normalData)
                                .then(function(){
                                    $rootScope.$broadcast('updateLockrDetails',true);
                                },function(error){
                                    $scope.loadingInProgress = false;
                                    toastr.error(error.data.message,'Error');
                                });
                        }
                    };
                }



                scope.openToolMenu = function ($mdOpenMenu,$event) {
                    $event.stopPropagation();
                    $mdOpenMenu($event);
                };


                scope.openAddCloudServiceLockrDialog = function(ev) {
                    $mdDialog.show({
                        controller: addCloudServiceLockrDialogController,
                        templateUrl: 'views/templates/add-cloud-service-lockr-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    });
                };

                function addCloudServiceLockrDialogController($scope, $mdDialog, $rootScope, amTreeManager, appConfig, $http) {

                    var selectedNode=null;

                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function(answer) {
                        $mdDialog.hide(answer);
                    };
                    $scope.loadingInProgress = true;
                    $scope.hasDropbox= true;
                    $scope.addText = "Add";



                    amTreeManager.setLoadingCb(function(item, apiType){

                        var url,
                            params,
                            defer = $q.defer();


                        if(item.root){
                            params = {};
                        } else {
                            params = {'path':item.label};
                        }

                        if(apiType === 'dropbox'){
                            url  = appConfig.API_SERVER_ADDRESS + '/api/social/dropbox/content/' + commonServices.getDropboxSocialChannelId();
                        } else {
                            url  = appConfig.API_SERVER_ADDRESS + '/api/social/box/content/' + commonServices.getBoxSocialChannelId();
                        }


                        $http.get(url,{
                            params:params
                        })
                            .success(function(response){

                                var children = [],
                                    file,
                                    folder;

                                if(apiType === 'dropbox'){
                                    for (var i = 0; i < response.dropBoxFolder.length; i++) {
                                        folder = response.dropBoxFolder[i];
                                        children.push({
                                            label:folder.path,
                                            isLoadingChildren:true,
                                            isFolder:true
                                        });
                                    }
                                    for (var i = 0; i < response.dropBoxFile.length; i++) {
                                        file= response.dropBoxFile[i];
                                        children.push({
                                            label:file.path
                                        })
                                    }

                                } else {

                                    for (var i = 0; i < response.boxFolder.length; i++) {
                                        folder = response.boxFolder[i];
                                        children.push({
                                            label:folder.path,
                                            isLoadingChildren:true,
                                            isFolder:true,
                                            name:folder.name,

                                        });
                                    }
                                    for (var i = 0; i < response.boxFile.length; i++) {
                                        file= response.boxFile[i];
                                        children.push({
                                            label:file.path,
                                            name:file.name
                                        })
                                    }

                                }
                                defer.resolve(children);
                            })
                            .error(function(error){
                                defer.reject(error);
                            });
                        return defer.promise;   //必须返回children数组的promise
                    });


                    dalockrServices.getShareSocialChannel().then(function(response){
                        var data = response.data;
                        var hasDropbox = false;
                        var treeData = [];

                        angular.forEach(data, function (value) {
                            if (value.socialChannelType === 'DropBox') {
                                hasDropbox = true;

                                commonServices.setDropboxSocialChannelId(value.id);
                                treeData.push( {
                                    label:'DropBox List',
                                    isFolder:true,
                                    isOpen:true,
                                    hiddenIcon:true,
                                    disabled:true,
                                    apiType:'dropbox',
                                    root:true,
                                    isLoadingChildren:true
                                });

                            } else if(value.socialChannelType === 'Box') {

                                commonServices.setBoxSocialChannelId(value.id);
                                treeData.push({
                                    label:'Box List',
                                    isFolder:true,
                                    isOpen:true,
                                    hiddenIcon:true,
                                    disabled:true,
                                    apiType:'box',
                                    root:true,
                                    isLoadingChildren:true
                                })
                            }
                        });
                        $scope.treeData = treeData;

                        $scope.loadingInProgress = false;

                        if(!hasDropbox){
                            $scope.hasDropbox = false;
                            $scope.loadingInProgress = false;
                        }
                    });
                    $scope.files = [];


                    $scope.selectItemCallback = function (node) {

                        selectedNode = node;
                        if(selectedNode.isFolder) {
                            $scope.addText = "Add Lockr";
                            $scope.selectName = 'You have selected folder ' + (node.name || node.label);
                        } else {
                            $scope.addText = "Add Asset";
                            $scope.selectName = 'You have selected file ' + (node.name || node.label);
                        }
                    };



                    $scope.addIt = function(){


                        var socialId;
                        if(selectedNode.name){
                            socialId = commonServices.getBoxSocialChannelId();
                        } else {
                            socialId = commonServices.getDropboxSocialChannelId();
                        }


                        if(selectedNode.isFolder){
                            $scope.loadingInProgress = true;
                            dalockrServices.addDropboxFolderToLockr(socialId, selectedNode.label,scope.currentLockrId,function(data){
                                toastr.success('You have added this folder to daLockr','Success');
                                $rootScope.$broadcast('updateLockrDetails',true);
                            }, function(data){
                                $scope.loadingInProgress = false;
                            });

                        } else {
                            if(selectedNode) {
                                $scope.loadingInProgress = true;
                                dalockrServices.addDropboxFileToLockr(socialId,scope.currentLockrId, selectedNode.label,function(data){
                                    toastr.success('You have added this file to daLockr','Success');
                                    $rootScope.$broadcast('updateLockrDetails',true);
                                }, function(data){
                                    if(data.result){
                                        toastr.error(data.result.errorMsg,'Error');
                                    }
                                    $scope.loadingInProgress = false;
                                });
                            }
                        }
                    };
                }





                //More Action
                scope.openEntityMoreAction = function (ev,item) {
                    ev.stopPropagation();
                    dalEntityMoreAction.open(item).then(function (key) {
                        var isLockr = item.fileType == 'subLockr';
                        switch (key){
                            case 'edit':
                                if(isLockr){
                                    scope.openEditLockrDialog(ev,item)
                                } else {
                                    scope.openEditAssetDialog(ev,item)
                                }
                                break;
                            case 'copy':
                                scope.batchHandle(ev,'copy',item)
                                break;
                            case 'follow':
                                scope.followLockr(ev,{id:item.id,name:item.name});
                                break;
                            case 'publish':
                                scope.publishAsset(ev,item);
                                break;
                            case 'move':
                                scope.batchHandle(ev,'move',item);
                                break;
                            case 'lock':
                                scope.lockLockr(ev,item);
                                break;
                            case 'download':
                                scope.openDownloadLockrDialog(ev,{id:item.id,name:item.name,createDate:item.dateCreated});
                                break;
                            case 'delete':
                                if(isLockr){
                                    //scope.openDeleteLockrDialog(ev,item);
                                    scope.deleteLockrConfirm(item);
                                } else {
                                    scope.openDeleteAssetDialog(ev,{id:item.id,name:item.name});
                                }
                                break;
                            case 'thumbnail':
                                if(isLockr){
                                    scope.toEditThumbnail = true;
                                    scope.toEditLockrInfo = item;
                                    var onListener = scope.$on('closeselectthumb',function(){
                                        scope.toEditThumbnail = false;
                                        scope.toEditLockrInfo = null;
                                        onListener();
                                        onListener = null;
                                    });
                                    
                                } else {
                                    scope.setThumbnail(ev,item.id);
                                }
                                break;
                            case 'share':
                                if(isLockr){
                                    scope.openShareLockrDialog(ev);
                                } else {
                                    scope.openShareAssetDialog(ev);
                                }
                                break;
                            case 'preview':
                                commonServices.openPreview(isLockr ? 'lockr':'asset',isLockr ? item.links[0].trackingId : item.defaultLink.trackingId,isLockr ? item.cluster.id : item.clusterId);
                                break;
                        }
                    });

                }



            }
        };
        }]);


