'use strict';
/**
 * Created by panma on 7/21/15.
 */
angular.module('dalockrAppV2App')
    .directive('sublockrDetailsRegion', ['dalockrServices','commonServices','$location','$mdDialog','$compile','$document','$rootScope','toastr','$q','appConfig','$sessionStorage','Upload','userServices','dalockrMessages','sharingRuleServices','$dalMedia','$mdSidenav','userRightServices','addEditLockrManager','$filter','thumbnailServices','cropAndUploadThumb','dalEntityMoreAction',
        function(dalockrServices,commonServices,$location,$mdDialog,$compile,$document,$rootScope,toastr,$q,appConfig,$sessionStorage, Upload,userServices,dalockrMessages,sharingRuleServices,$dalMedia,$mdSidenav,userRightServices,addEditLockrManager,$filter,thumbnailServices,cropAndUploadThumb,dalEntityMoreAction) {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/sublockr-details-region.html',
            scope:{
                assetsData:'=',
                currentLockrDetails:'=',
                isLoading:'=',
                currentLockrId:'='
            },
            replace:true,
            link: function(scope,element){
                var followId = null;
                scope.NewPrivateLockrShow = false;
                scope.inviteAgain = false;


                //element.find('.asset-info').css('min-height',(commonServices.getCurrentBroswerHeight() - 90 - 82 -45) + 'px');
                scope.pathData = null;
                scope.showText = "Total Lockrs : 0";

                var screenWidth = commonServices.getCurrentBroswerWidth(),
                    cardW = commonServices.getMobileCardWidth();
                scope.mobileGap = (screenWidth - cardW*2) / 6;
                scope.mobileCardWidth = cardW;

                scope.haveSelectedImage = false;
                var inputAvatar,dropBox;
                var imageFile;
                var options;

                //scope.marginStyle = {
                //    'padding':commonServices.getCurrentBroswerWidth()*0.01 + 'px'
                //};
                scope.$on('editLockrThumb',function(ev,val){
                    scope.chooseThumbLockr = val;
                    scope.showselectthumb = true;
                    setTimeout(function () {
                        inputAvatar = document.getElementById('crop-lockr-thumbnail-input');
                        dropBox =  element.find('#crop-lockr-thumbnail-area');
                        options =  {
                            readAsDefault: "DataURL",
                            on: {
                                progress: function() {
                                    //console.log(e);
                                },
                                load: function(e,file) {

                                    scope.$apply(function () {
                                        cropAndUploadThumb.open(e.target.result,file,scope.chooseThumbLockr.id).then(function (uploaded) {
                                            if(uploaded.success){
                                            }
                                        })
                                    });

                                }
                            }
                        };
                        FileReaderJS.setupInput(inputAvatar, options);
                        FileReaderJS.setupDrop(dropBox[0],options);
                        dropBox.bind('click', function () {
                            inputAvatar.click();
                        });

                    },0);
                });
                scope.openEditThumbnail = function(data){
                    scope.chooseThumbLockr = data;
                    scope.showselectthumb = true;
                    setTimeout(function () {
                        console.log(111);
                        inputAvatar = document.getElementById('crop-lockr-thumbnail-input');
                        dropBox =  element.find('#crop-lockr-thumbnail-area');
                        options =  {
                            readAsDefault: "DataURL",
                            on: {
                                progress: function() {
                                    //console.log(e);
                                },
                                load: function(e,file) {

                                    scope.$apply(function () {
                                        cropAndUploadThumb.open(e.target.result,file,scope.chooseThumbLockr.id).then(function (uploaded) {
                                            if(uploaded.success){
                                            }
                                        })
                                    });

                                }
                            }
                        };
                        FileReaderJS.setupInput(inputAvatar, options);
                        FileReaderJS.setupDrop(dropBox[0],options);
                        dropBox.bind('click', function () {
                            inputAvatar.click();
                        });

                    },0);
                };
                scope.closeselectthumb = function(){
                    scope.showselectthumb = false;
                };
                //scope.cropThumbLockr = function(data){
                //    console.log(data)
                //};




                scope.selectThumbLockr = function(data){
                    thumbnailServices.editThumbnailDialog(data);
                    scope.showselectthumb = false;

                };
                scope.deleteThumbLockr = function(data){

                    var confirm = $mdDialog.confirm()
                        .title('Are you sure you want to delete this account thumbnail ?')
                        .ariaLabel('delete thumbnail')
                        .ok('OK')
                        .cancel('Cancel');


                    $mdDialog.show(confirm).then(function() {
                        dalockrServices.deleteLockrThumbnail(data.id).success(function(data){
                            toastr.success(data.message,'Success');
                            scope.showselectthumb = false;
                        }).error(function(error){
                            console.log(error);
                            toastr.error(error.data.message,'Error');
                            scope.showselectthumb = false;
                        });
                    }, function() {
                        scope.showselectthumb = false;
                    });
                };

                scope.openLockrDetailsFixeDmenu = function(){
                    scope.NewPrivateLockrShow = false;
                    $rootScope.$broadcast('openDetailsFixedMenu');
                };
                scope.$on('privateLockrInviteSuc',function(){
                    scope.inviteAgain = true;
                });
                scope.$on('lockrThumbnailChange',function(ev,value){
                    angular.forEach(scope.assetsData,function(val,ind){
                        if(val.id == value.id){
                            //val.thumbnailUrl = value.thumbnailUrl;
                            //scope.assetsData.splice(ind,1);
                            val.name = 'changenameing'
                            scope.uploadData = val;
                            //uploadThumbnail();
                            //scope.assetsData.push(val);
                        }
                    });

                });


                scope.$watch('assetsData', function(newVal, oldVal){
                    console.log(newVal);
                    scope.assetsData = newVal;
                    angular.forEach(scope.assetsData,function(val,ind){
                        if(val.fileType === 'subLockr' && !val.totalAssets && !val.totalSubLockrs){
                            val.changeTH = true;
                        }
                    });
                    if(scope.currentLockrDetails) {
                        if (!scope.assetsData[0] && scope.currentLockrDetails.hiddenFromPublicView) {
                            scope.NewPrivateLockrShow  = true;
                            setTimeout(function(){
                                scope.deletePriUI();
                            },4000)

                        } else {
                            scope.NewPrivateLockrShow = false;
                        }
                    }else {
                        scope.NewPrivateLockrShow = false;
                    }

                });
                scope.deletePriUI=function(){
                    scope.NewPrivateLockrShow = false;
                    scope.$apply();
                };
                scope.$on('checkEmptyPri',function(){
                    if(scope.currentLockrDetails && scope.currentLockrDetails.hiddenFromPublicView) {
                        if (!scope.assetsData[0]) {
                            scope.NewPrivateLockrShow = true;
                            setTimeout(function(){
                                scope.deletePriUI();
                            },4000)
                        } else {
                            scope.NewPrivateLockrShow = false;
                        }
                    } else {
                        scope.NewPrivateLockrShow = false;
                    }
                });
                scope.priLockrInvite = function(){
                    $rootScope.$broadcast('$$InviteUser');
                };
                scope.resultCallback = function (filterValue) {
                    scope.filterValue = filterValue;
                };
                scope.openShareDialog = function(){
                    $rootScope.$broadcast('shareLockr',scope.lockrdata);
                };


                $rootScope.$on('uploadthumbnail', function (event,data) {
                    $rootScope.$broadcast('updateLockrDetails',true);
                });

                $rootScope.$on('usemoveasset', function (event,data) {

                });

                scope.batchHandle = function (ev,handleName,asset){
                    ev.getassetName = asset.name;
                    ev.getassetId = asset.id;

                    $rootScope.$broadcast('batchHandle',{name:handleName,event:ev});
                };

                // userServices.getUserProfileInfo(function(info){
                //     if(info){
                //         scope.iscommunity=userRightServices.isCommunityManager(scope.currentLockrId);
                //         scope.iscommunity=userRightServices.isCommunityManager(scope.currentLockrId);
                //     }
                // });

                scope.mobileDevice = $dalMedia('xs');

                loadToApprovalRequests(false);
                function loadToApprovalRequests(isUpdate) {
                    dalockrServices.listToApprovalRequests(isUpdate,scope.currentLockrId,function (data) {
                        scope.toApprovalRequests = data;
                    }, function (error) {
                    });
                }

                dalockrMessages.registerNotification({name:'requestNotification',callback: function (data) {
                    if(data.messageType === 'ApprovalRequest' && data.approvalRequest.entity.lockrId === scope.currentLockrId){
                        loadToApprovalRequests(true);
                    }
                }});
                
                scope.approvedThisRequest = function (isApproved, entityId) {
                    dalockrServices.updateApprovalRequest(isApproved,entityId).then(function (response) {
                        toastr.success(response.data.message,'Success');
                        loadToApprovalRequests(true);
                        $rootScope.$broadcast('updateModerationNotification');
                    });
                };


                ////////////////////
                ////Sharing Rule////
                ////////////////////
                function getSharingRule(sharingRule){

                    if(sharingRule){
                        scope.currentLockrDetails.sharingRule = sharingRule;
                    }

                    var sharingRulePromise = [];
                    angular.forEach(scope.currentLockrDetails.sharingRule, function (value) {
                        sharingRulePromise.push(dalockrServices.getSharingRuleById(value.id));
                    });
                    $q.all(sharingRulePromise).then(function (response) {
                        scope.sharingRules = formatSharingRule(response);
                        commonServices.saveCurrentSharingRule(formatSharingRule(response));
                    });



                    function formatSharingRule(response){
                        return response.map(function (value) {

                            value.data.creativeImage = commonServices.getCreativeCommonsImageUrl(value.data.license);

                            value.data.shareMime = commonServices.shareMimeFormat(value.data).shareOn;


                            dalockrServices.getShareSocialChannelWithCache(function (data) {
                                var shareSocialType = [];
                                angular.forEach(data, function (v1) {
                                    angular.forEach(value.data.postOnSocialChannel, function (v) {
                                        if(v1.id === v){
                                            var typeClass = commonServices.getIconClassByType(v1.socialChannelType);

                                            if(!shareSocialType.length){
                                                shareSocialType.push(typeClass);
                                            } else {
                                                var isSaved = false;
                                                for(var i=0; i<shareSocialType.length; i++){
                                                    if(shareSocialType[i] === typeClass){
                                                        isSaved = true;
                                                        return;
                                                    }
                                                }
                                                if(!isSaved){
                                                    shareSocialType.push(typeClass);
                                                }
                                            }
                                        }
                                    });
                                });
                                value.data.shareSocialType = shareSocialType;
                            });

                            return value.data;
                        });
                    }
                }


                scope.addCollaborator = function (ev) {

                    scope.mobileScreen && scope.showMobileSider();


                    $mdDialog.show({
                        controller: assignLockrController,
                        templateUrl: 'views/templates/assign-lockr-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')

                    });

                    function assignLockrController($scope){

                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.assignUser = '';
                        $scope.loadingInProgress = false;
                        $scope.assignType = 'READ_AND_MANAGE_CONTENT';
                        $scope.assignRole = 'CONTENT_MANAGER';



                        $scope.assignLockrToUser = function(){

                            $scope.loadingInProgress = true;

                            dalockrServices.grantPermissions(scope.currentLockrId,'Lockr',$scope.assignType,$scope.assignUser, $scope.assignRole)
                                .then(function(response){
                                    toastr.success('EntityPermission has successfully been created.','Success');
                                    $mdDialog.hide();
                                    loadAccessUsersForLockr();
                                }).catch(function(error){
                                $scope.loadingInProgress = false;
                                toastr.error(error.data.message,'Error');
                            });
                        }
                    }

                };

                scope.editLockrSharingRule = function(sr){
                    scope.mobileScreen && scope.showMobileSider();
                    sharingRuleServices.editSharingRule([angular.copy(sr)]);
                    scope.$on('$sharingRuleChangeSuccess', function () {
                        getSharingRule();
                    })
                };




                scope.assignLockrSharingRule = function (ev) {

                    scope.mobileScreen && scope.showMobileSider();


                    $mdDialog.show({
                        controller: assignSharingRuleDialogController,
                        templateUrl: 'views/templates/assign-sharingrules-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')

                    });

                    function assignSharingRuleDialogController($scope){

                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };
                        $scope.assignSharingRules = {
                            ruleId:''
                        };
                        dalockrServices.getUserSharingRules(function (data) {
                            $scope.allSharingRules = data;
                            $scope.assignSharingRules.ruleId = data[0].id;
                        });
                        $scope.toAssign = function () {
                            if($scope.assignSharingRules.ruleId){
                                $scope.loadingInProgress = true;
                                dalockrServices.assignSharingRuleForLockr(scope.currentLockrId,$scope.assignSharingRules.ruleId).success(function (data) {
                                    if(angular.isDefined(data.lockr)){
                                        getSharingRule(data.lockr.sharingRule);
                                    }
                                    $scope.hide();
                                    $scope.loadingInProgress = false;

                                }).error(function (error) {
                                    toastr.error(error.message, 'Error');
                                    $scope.loadingInProgress = false;
                                });
                            }
                        };

                    }
                };
                scope.unassignSharingRule = function (item) {
                    if(scope.sharingRules.length <= 1){
                        toastr.warning('A Lockr needs to have at least one SharingRule, assign another rule before unassigning this one.','Warning');
                        return;
                    }
                    scope.sharingRules.splice(scope.sharingRules.indexOf(item),1);
                    dalockrServices.unAssignSharingRuleForLockr(scope.currentLockrId,item.id);
                };




                scope.openAddSharingRuleDialog = function (ev) {
                    scope.mobileScreen && scope.showMobileSider();

                    scope.$on('$$reloadLockrSharingRule', function (ev,sharingRule) {
                        getSharingRule(sharingRule);
                    });

                    $mdDialog.show({
                        controller: addSharingRulesController,
                        templateUrl: 'views/templates/add-sharing-rule-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false,
                        fullscreen:$dalMedia('xs')

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
                        $scope.lockrId = scope.currentLockrId;
                    }
                };




                scope.$watch('currentLockrDetails',function(){
                    if(scope.currentLockrDetails !== null) {
                        $rootScope.$broadcast('lockrDataToPath',scope.currentLockrDetails);

                        getSharingRule();

                        userServices.getUserProfileInfo(function(info){
                            if(info){
                                scope.iscommunity=userRightServices.isCommunityManager(scope.currentLockrId,scope.currentLockrDetails.hierarchy);
                                scope.iscontent=userRightServices.isContentManager(scope.currentLockrId,scope.currentLockrDetails.hierarchy);
                                $rootScope.$broadcast('$$LockrPower',{iscontent:scope.iscontent,iscommunity:scope.iscommunity});
                            }
                        });



                        if (typeof scope.currentLockrDetails.hierarchy === 'undefined') {
                            scope.pathData =  [{id: scope.currentLockrDetails.id, name: scope.currentLockrDetails.name}];
                        } else {
                            var pathData = [];
                            angular.forEach(scope.currentLockrDetails.hierarchy, function (v, k) {
                                pathData.push(v);
                            });
                            pathData.push({id: scope.currentLockrDetails.id, name: scope.currentLockrDetails.name});
                            scope.pathData = pathData;
                        }

                        scope.pathData.splice(0,1);
                        $rootScope.$broadcast('issublockr',true);
                        $rootScope.$broadcast('$$PathData',scope.pathData);

                        if(scope.currentLockrDetails.user){
                            userServices.getUserProfileInfo(function (userInfo) {
                                if(scope.currentLockrDetails.user.id === userInfo.id){
                                    scope.ownerName = 'me';
                                }else{
                                    scope.ownerName = scope.currentLockrDetails.user.firstName + ' ' + scope.currentLockrDetails.user.lastName;
                                }
                            });
                        }
                        if(scope.currentLockrDetails.numberOfComments){
                            scope.showCommentPart = scope.currentLockrDetails.numberOfComments !== 0;
                        }
                        if(scope.currentLockrDetails.lockrType !== 'SafeLockr'){
                            loadAccessUsersForLockr();
                        }
                        if(scope.currentLockrDetails.subLockrs){
                            scope.showText = "Total SubLockrs in lockr : " + scope.currentLockrDetails.subLockrs.length;
                        }

                        //if(scope.currentLockrDetails.hiddenFromPublicView){
                        //    scope.isPrivate = true;
                        //    if(scope.currentLockrDetails.lockrType !== 'SafeLockr'){
                        //        loadAccessUsersForLockr();
                        //    }
                        //}else{
                        //    scope.isPrivate = false;
                        //}
                    }
                });




                getLockrFollowers();
                function getLockrFollowers(){
                    scope.isFollowedByMe = false;
                    dalockrServices.getLockrFollowers(scope.currentLockrId,function(data){

                        userServices.getUserProfileInfo(function (userInfo) {
                            //console.log(userInfo);
                            for (var i = 0, len = data.length; i < len; i++) {
                                data[i].userPic = appConfig.API_SERVER_ADDRESS + '/u/'+ data[i].follower.clusterId +'/' + data[i].follower.username + '/avatar';
                                if(data[i].follower.username === userInfo.username){
                                    followId = data[i].id;
                                    scope.isFollowedByMe = true;
                                    data[i].follower.firstName = 'me';
                                    data[i].follower.lastName = '';

                                }
                            }
                            scope.followersList = data;
                        });


                    },function(error){

                    });
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
                    var counti = 0;

                    //set as lockr thumbnail
                    scope.setThumbnail = function(assetId){
                        dalockrServices.updateLockr(scope.currentLockrId,{
                            thumbnailAssetId:assetId
                        },function(data){
                            $rootScope.$broadcast('updateLockrDetails',true);
                            toastr.success('Thumbnail '+ data.lockr.name + ' has been set.','Success');
                        },function(error){
                            toastr.error(error.message,'Error');
                        });

                        //cancelBubble(ev);
                    };

                    $rootScope.$on('setTN', function (event,data) {
                        if(!counti){
                            scope.setThumbnail(data);
                        }
                        counti = 1;

                    });


                    $rootScope.$on('usedeleteasset', function (event,data) {
                        if(!$rootScope.watchDelete){
                            $rootScope.watchDelete = true;
                            scope.openDeleteAssetDialog(event,data);
                        }

                    });

                    scope.openDeleteAssetDialog = function(value,ev){
                        var confirm = $mdDialog.confirm()
                            .title('Are you sure you want to delete this asset ?')
                            .ariaLabel('Lucky day')
                            .ok('OK')
                            .cancel('Cancel');

                        $mdDialog.show(confirm).then(function() {
                            scope.assetItem = value;

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


                        // cancelBubble(ev);

                    };
                    function editArticleDialogController($scope){
                        var authToken = userServices.getAccessToken();
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

                                //console.log(scope.editAssetInfo);

                                Upload.upload({
                                    url: appConfig.API_SERVER_ADDRESS + '/api/article/'+ scope.editAssetInfo.id +'/details?' + 'token=' + authToken, //upload.php script, node.js route, or servlet url
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
                                //console.log('form error');
                            }
                        };
                    }



                    scope.openEditAssetDialog = function(ev,value){
                        scope.editAssetInfo = value;


                        //console.log(value);

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

                        // cancelBubble(ev);

                    };

                    function deleteAssetDialogController($scope){

                        $scope.hide = function() {
                            $mdDialog.hide();
                            if($rootScope.watchDelete){
                                $rootScope.watchDelete = false;
                            }
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                            if($rootScope.watchDelete){
                                $rootScope.watchDelete = false;
                            }
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                            if($rootScope.watchDelete){
                                $rootScope.watchDelete = false;
                            }
                        };

                        $scope.assetItem = scope.deleteAssetInfo;

                        $scope.deleteAsset = function(){

                            $scope.isDeleting = true;

                            dalockrServices.deleteAssetWithPromise($scope.assetItem.id)
                                .success(function(){
                                    toastr.success('Successfully deleted');
                                    $rootScope.$broadcast('updateLockrDetails',true);
                                    if($rootScope.watchDelete){
                                        $rootScope.watchDelete = false;
                                    }
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
                        //console.log( scope.editAssetInfo);
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


                    scope.$on('deleteLockrOnPathbar',function(val){
                        scope.deleteLockrConfirm(val);
                    });

                    scope.deleteLockrConfirm = function(value){
                            var confirm = $mdDialog.confirm()
                                .title('Are you sure you want to delete this post '  + value.name + '?')
                                .textContent('Please note that all assets and comments on social channels will be deleted ')
                                .ariaLabel('Lucky day')
                                .ok('OK')
                                .cancel('CANCEL');

                            $mdDialog.show(confirm).then(function() {
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
                            });

                    };

                    scope.openDeleteLockrDialog = function(value){
                        scope.currentDeleteLockr = value;

                        $mdDialog.show({
                            controller: deleteLockrDialogController,
                            templateUrl: 'views/templates/delete-lockr-dialog.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')

                            });

                        //cancelBubble(ev);

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
                                $rootScope.$broadcast('updateLockrDetails',true);
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
                        scope.mobileScreen && scope.showMobileSider();
                        addEditLockrManager.edit(value);
                    };
                    scope.$on('InfoEditLockr',function(ev,val){
                        scope.openEditLockrDialog(ev,val);
                    });
                    scope.$on('openInfo',function(ev,val){
                        scope.openLockrInfoDialog(val);
                    });

                    scope.openLockrInfoDialog = function(value){
                        scope.getLockrInfodata = value;
                        $mdDialog.show({
                            controller: addLockrInfoController,
                            templateUrl: 'views/templates/add-lockr-info-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: null,
                            clickOutsideToClose: false,
                            fullscreen:$dalMedia('xs')
                        });
                    };


                    function addLockrInfoController($scope){
                        $scope.lockrInfodata  = angular.copy(scope.getLockrInfodata);
                        if($scope.lockrInfodata.user){
                            $scope.lockrInfodata.useravator = dalockrServices.getUserManagerAvatar($scope.lockrInfodata.user.clusterId,$scope.lockrInfodata.user.username);
                        }

                        $scope.openEditThumbnail = function(){
                            $scope.showselectthumb = true;
                        };
                        $scope.$on('closeselectthumb',function(ev,val){
                            $scope.showselectthumb = false;
                        });

                        $scope.showinfo  = true;
                        $scope.currentTabItem = 'info';
                        $scope.infoEditLockr = function(){
                            $mdDialog.cancel();
                            $rootScope.$broadcast('InfoEditLockr',$scope.lockrInfodata)
                        };
                        $scope.editColl = function(data){
                            $scope.showinfo  = false;
                            $scope.showEditColl = true;
                            $scope.assign = {
                                name:data.username,
                                userrole:'',
                                email:data.email
                            };
                        };

                        if($scope.lockrInfodata.numberOfFollowers){
                            dalockrServices.getInfoLockrFollowers('lockr',$scope.lockrInfodata.id).success(function(data){
                                $scope.lockrInfodata.lockrFollowers = data;
                                $scope.lockrInfodata.lockrFollowers.avatorurl = dalockrServices.getUserManagerAvatar(data[0].follower.clusterId,data[0].follower.username);
                            }).error(function(data){
                                console.log('error');
                            });
                        }

                        $scope.hide = function() {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };
                        dalockrServices.getLockrDetails($scope.lockrInfodata.id).success(function(data){
                            if(data.assets){
                                angular.forEach(data.assets,function(val,ind){
                                    if(val.mimeType.indexOf('image') != -1){
                                        if($scope.lockrInfodata.totalImage){
                                            $scope.lockrInfodata.totalImage = $scope.lockrInfodata.totalImage + 1;
                                        }else{
                                            $scope.lockrInfodata.totalImage = 1;
                                        }
                                    }else if(val.mimeType.indexOf('pdf') != -1){
                                        if($scope.lockrInfodata.totalPdf){
                                            $scope.lockrInfodata.totalPdf = $scope.lockrInfodata.totalPdf + 1;
                                        }else{
                                            $scope.lockrInfodata.totalPdf = 1;
                                        }
                                    }else if(val.mimeType.indexOf('video') != -1){
                                        if($scope.lockrInfodata.totalvideo){
                                            $scope.lockrInfodata.totalvideo = $scope.lockrInfodata.totalvideo + 1;
                                        }else{
                                            $scope.lockrInfodata.totalvideo = 1;
                                        }
                                    }else if(val.mimeType.indexOf('audio') != -1){
                                        if($scope.lockrInfodata.totalaudio){
                                            $scope.lockrInfodata.totalaudio = $scope.lockrInfodata.totalaudio + 1;
                                        }else{
                                            $scope.lockrInfodata.totalaudio = 1;
                                        }
                                    }else if(val.mimeType.indexOf('powerpoint') != -1){
                                        if($scope.lockrInfodata.totalpowerpoint){
                                            $scope.lockrInfodata.totalpowerpoint = $scope.lockrInfodata.totalpowerpoint + 1;
                                        }else{
                                            $scope.lockrInfodata.totalpowerpoint = 1;
                                        }
                                    }else if(val.mimeType.indexOf('msword') != -1){
                                        if($scope.lockrInfodata.totalmsword){
                                            $scope.lockrInfodata.totalmsword = $scope.lockrInfodata.totalmsword + 1;
                                        }else{
                                            $scope.lockrInfodata.totalmsword = 1;
                                        }
                                    }else if(val.mimeType.indexOf('excel') != -1){
                                        if($scope.lockrInfodata.totalexcel){
                                            $scope.lockrInfodata.totalexcel = $scope.lockrInfodata.totalexcel + 1;
                                        }else{
                                            $scope.lockrInfodata.totalexcel = 1;
                                        }
                                    }
                                })
                            }
                        }).error(function(){
                            console.log('error');
                        });
                        $scope.backFormColl = function(){
                            $scope.showAddColl = false;
                            $scope.showEditColl = false;
                            $scope.showinfo  = true;
                            $scope.currentTabItem = 'collaborator';
                        };
                        $scope.backFormSR = function(){
                            $scope.showAddShareRule = false;
                            $scope.showinfo  = true;
                            $scope.currentTabItem = 'share';
                        };
                        $scope.assign = {
                            name:'',
                            userrole:'',
                            email:'',
                            password:''
                        };
                        var assigntype = '';
                        var assignrole = '';
                        $scope.loaduserrole = function(){
                            $scope.chooseuserrole = {
                                1:{name:'Community Manager'},
                                2:{name:'Content Manager'}
                            }
                        };
                        $scope.loadingInProgress = false;
                        $scope.removeColl = function(val){
                            dalockrServices.deletePermissions(val.entityPermissionId).success(function(data){
                                toastr.success(data.message);
                            }).error(function(error){
                                toastr.error(error);
                            });
                        };
                        $scope.editInfoShareRule = function(item){
                            sharingRuleServices.editSharingRule([angular.copy(item)]);
                            //scope.$on('$sharingRuleChangeSuccess', function () {
                            //    getSharingRule();
                            //})
                        };
                        $scope.channelTypes = [
                            {
                                active:false,
                                name:'Facebook',
                                iconClass:'mdi-facebook'
                            },
                            {
                                active:false,
                                name:'Twitter',
                                iconClass:'mdi-twitter'
                            },
                            {
                                active:false,
                                name:'Instagram',
                                iconClass:'mdi-instagram'
                            },
                            {
                                active:false,
                                name:'Evernote',
                                iconClass:'mdi-evernote'
                            },
                            {
                                active:false,
                                name:'Pinterest',
                                iconClass:'mdi-pinterest'
                            },
                            {
                                active:false,
                                name:'Google',
                                iconClass:'mdi-google'
                            },
                            {
                                active:false,
                                name:'Youtube',
                                iconClass:'mdi-youtube-play'
                            }
                        ];
                        $scope.mimeTypes = [
                            {
                                mimeType:'image/*',
                                icon:'dal-icon-picture_black'
                            },
                            {
                                mimeType:'application/pdf',
                                icon:'dal-icon-pdf_black'
                            },
                            {
                                mimeType:'video/*',
                                icon:'dal-icon-video_black'
                            },
                            {
                                mimeType:'audio/*',
                                icon:'dal-icon-music_black'
                            },
                            {
                                mimeType:'application/vnd.ms-powerpoint',
                                icon:'dal-icon-pp_black'
                            },
                            {
                                mimeType:'application/msword',
                                icon:'dal-icon-word_black'
                            },
                            {
                                mimeType:'application/vnd.ms-excel',
                                icon:'dal-icon-excel_black'
                            }
                        ];
                        $scope.mimeTypeIsActive = function (type, rules) {
                            return rules.mimeType.indexOf(type.mimeType) > -1;
                        };
                        $scope.switchChannelType = function (rule,type) {
                            rule.channelActive = type.name;
                        };

                        function getCreativeCommonData(rule,func){


                            var ccTypeString,
                                ccTypeImage,
                                license = rule.license;

                            if(license == 'CC_BY'){
                                ccTypeString = 'Creative Commons Attribution 4.0 International License Agreement';
                            } else if(license == 'CC_BY_NC'){
                                ccTypeString = 'Creative Commons Attribution - NonCommercial 4.0 International License Agreement';
                            } else if(license == 'CC_BY_ND'){
                                ccTypeString = 'Creative Commons Attribution - No Derivative Works 4.0 International License Agreement';
                            } else if(license == 'CC_BY_NC_ND'){
                                ccTypeString = 'Creative Commons Attribution - Noncommercial - No Derivative Works 4.0 International License Agreement';
                            } else if(license == 'CC_BY_SA'){
                                ccTypeString = 'Creative Commons Attribution - Share Alike 4.0 International License Agreement';
                            } else if(license == 'CC_BY_NC_SA'){
                                ccTypeString = 'Creative Commons Attribution - NonCommercial - ShareAlike 4.0 International License Agreement';
                            }
                            ccTypeImage = 'images/cc/' + license.toLowerCase() + '.png';

                            dalockrServices.getLicenseData(license, function (data) {
                                if(data){
                                    func && func({
                                        desc:data.description,
                                        text:ccTypeString,
                                        image:ccTypeImage
                                    });
                                }
                            });

                        }


                        $scope.assignLockrToUser = function(){

                            $scope.loadingInProgress = true;
                            if($scope.assign.userrole === 'Content Manager'){
                                assigntype = 'WRITE_AND_MANAGE_CONTENT';
                                assignrole = 'CONTENT_MANAGER';
                            }else if($scope.assign.userrole === 'Community Manager'){
                                assigntype = 'READ_AND_MANAGE_CONTENT';
                                assignrole = 'COMMUNITY_MANAGER';
                            }
                            dalockrServices.grantPermissions($scope.lockrInfodata.id,'Lockr',assigntype, $scope.assign.name,assignrole)
                                .then(function(){
                                    toastr.success('EntityPermission has successfully been created.');
                                    $mdDialog.hide();
                                }).catch(function(error){
                                $scope.loadingInProgress = false;
                                toastr.error(error.data.message);
                            });
                        };
                        $scope.selectTabItem = function(val){
                            $scope.currentTabItem = val;
                            if(val === 'info'){

                            } else if(val === 'collaborator'){
                                $scope.loadColl = true;
                                dalockrServices.getLockrUsers($scope.lockrInfodata.id)
                                    .then(function(response){
                                        $scope.loadColl = false;
                                        var result = response.data;
                                        for (var i = 0; i < result.length; i++) {
                                            var obj = result[i];
                                            obj.userPic = dalockrServices.getUserAvatar(obj.clusterId,obj.username);
                                        }
                                        $scope.accessUsers = result;
                                    }).catch(function(error){

                                });
                                $scope.infoAddCollaborator  = function(){
                                    $scope.showAddColl = true;
                                    $scope.showinfo  = false;
                                }
                            }else if(val === 'share') {
                                $scope.loadshare = true;
                                $scope.showShareRule = '';
                                $scope.infoAddShareRule  = function(){
                                    $scope.showAddShareRule = true;
                                    $scope.showinfo  = false;
                                };
                                $scope.openShareRule = function (val) {
                                    //if($scope.showShareRule != val.id){
                                    //    $scope.showShareRule = val.id;
                                    //}else{
                                    //    $scope.showShareRule = '';
                                    //}
                                    val.selected = !val.selected;
                                    //getDescription(val.id);
                                };
                                $scope.shareRuleDetail = [];
                                if ($scope.lockrInfodata.sharingRule[0]) {
                                    angular.forEach($scope.lockrInfodata.sharingRule, function (val) {
                                        dalockrServices.getSharingRuleById(val.id).success(function (data) {
                                            $scope.shareRuleDetail.push(data);
                                            $scope.sharingRules = $scope.shareRuleDetail.map(function (val) {
                                                val.selected = false;
                                                if(val.userDefault){
                                                    $scope.selectedRule = val.id;
                                                }
                                                val.tabIndex = 0;
                                                val.postOnSocialChannelDetail = val.postOnSocialChannelDetail.map(function (val) {
                                                    val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                                    val.imgLink = commonServices.getSocialChannelAvatar(val);
                                                    return val;
                                                });

                                                val.channelActive = 'Facebook';
                                                getCreativeCommonData(val, function (data) {
                                                    val.ccContent = data;
                                                });
                                                return val;
                                            });
                                            $scope.shareRuleDetail = $scope.sharingRules;
                                            $scope.loadshare = false;
                                        }).error(function (error) {
                                            console.log(error)
                                        })
                                    });
                                } else {
                                    $scope.loadshare = false;
                                }

                                //dalockrServices.getUserSharingRules(function (data) {
                                //    console.log(data);
                                //    console.log($scope.sharingRules);
                                //    console.log($scope.shareRuleDetail);
                                //    $scope.sharingRules = $scope.shareRuleDetail.map(function (val) {
                                //        val.selected = false;
                                //        if(val.userDefault){
                                //            $scope.selectedRule = val.id;
                                //        }
                                //        val.tabIndex = 0;
                                //        val.postOnSocialChannelDetail = val.postOnSocialChannelDetail.map(function (val) {
                                //            val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                //            val.imgLink = commonServices.getSocialChannelAvatar(val);
                                //            return val;
                                //        });
                                //
                                //        val.channelActive = 'Facebook';
                                //        getCreativeCommonData(val, function (data) {
                                //            val.ccContent = data;
                                //        });
                                //        return val;
                                //    });
                                //    console.log($scope.sharingRules);
                                //    $scope.shareRuleDetail = $scope.sharingRules;
                                //    $scope.loadshare = false;
                                //});

                            }
                        }
                    };

                    function infoaddConllabor(){
                        $mdDialog.show({
                            controller: infoAddCollaboratorController,
                            templateUrl: 'views/templates/info-add-collaborator.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')

                        });
                        function infoAddCollaboratorController($scope) {

                            $scope.hide = function () {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                            $scope.answer = function (answer) {
                                $mdDialog.hide(answer);
                            };
                        }
                    }


                    //function editLockrDialogController($scope){
                    //
                    //    $scope.hide = function () {
                    //        $mdDialog.hide();
                    //    };
                    //
                    //
                    //    $scope.mobileDevice  = $dalMedia('xs');
                    //    $scope.createType = editingLockrData.hiddenFromPublicView ? 'private' : 'normal';
                    //    $scope.loadingInProgress = false;
                    //    $scope.allContacts = [];
                    //    $scope.guideStep = 0;
                    //
                    //    $scope.mimeTypes = [
                    //        {
                    //            mimeType:'image/*',
                    //            icon:'dal-icon-picture_black'
                    //        },
                    //        {
                    //            mimeType:'application/pdf',
                    //            icon:'dal-icon-pdf_black'
                    //        },
                    //        {
                    //            mimeType:'video/*',
                    //            icon:'dal-icon-video_black'
                    //        },
                    //        {
                    //            mimeType:['audio/*'],
                    //            icon:'dal-icon-music_black'
                    //        },
                    //        {
                    //            mimeType:'application/vnd.ms-powerpoint',
                    //            icon:'dal-icon-pp_black'
                    //        },
                    //        {
                    //            mimeType:'application/msword',
                    //            icon:'dal-icon-word_black'
                    //        },
                    //        {
                    //            mimeType:'application/vnd.ms-excel',
                    //            icon:'dal-icon-excel_black'
                    //        }
                    //    ];
                    //
                    //    $scope.mimeTypeIsActive = function (type, rules) {
                    //        return rules.mimeType.indexOf(type.mimeType) > -1;
                    //    };
                    //
                    //    $scope.switchChannelType = function (rule,type) {
                    //        rule.channelActive = type.name;
                    //    };
                    //
                    //    console.log(editingLockrData);
                    //
                    //    //$scope.hide = function() {
                    //    //    $mdDialog.hide();
                    //    //};
                    //    //$scope.cancel = function() {
                    //    //    $mdDialog.cancel();
                    //    //};
                    //    //$scope.answer = function(answer) {
                    //    //    $mdDialog.hide(answer);
                    //    //};
                    //    //$scope.currentLockrData = angular.copy(scope.isEdittingLockr);
                    //    //
                    //    //var approvalInfo = angular.isDefined($scope.currentLockrData.approvalInfo) && $scope.currentLockrData.approvalInfo;
                    //    //$scope.isActivedModeration = ( approvalInfo && approvalInfo.length > 0 );
                    //    //$scope.moderationActive = $scope.isActivedModeration;
                    //    //
                    //    //if($scope.currentLockrData.hiddenFromPublicView === true){
                    //    //    $scope.shareRules = 'private';
                    //    //} else {
                    //    //    $scope.shareRules = 'public';
                    //    //}
                    //    //$scope.submitted = false;
                    //    //
                    //    //$scope.updateLockr = function(){
                    //    //
                    //    //    $scope.submitted = true;
                    //    //
                    //    //    if($scope.update_lockr_form.$valid) {
                    //    //
                    //    //        var hiddenFromPublicView = false;
                    //    //        if ($scope.shareRules === 'private') {
                    //    //            hiddenFromPublicView = true;
                    //    //        }
                    //    //
                    //    //        var entityData = {
                    //    //            name: $scope.currentLockrData.name,
                    //    //            description: $scope.currentLockrData.description,
                    //    //            hiddenFromPublicView: hiddenFromPublicView
                    //    //        };
                    //    //
                    //    //
                    //    //        if($scope.moderationActive){
                    //    //
                    //    //            if ($scope.contacts.length && ($scope.moderationType.share || $scope.moderationType.comment)){
                    //    //
                    //    //                var approvalInfo = [];
                    //    //                var userString = '';
                    //    //                var len = $scope.contacts.length;
                    //    //
                    //    //                for(var i=0; i<len; i++){
                    //    //                    userString += $scope.contacts[i].username;
                    //    //                    if(i !== len - 1){
                    //    //                        userString += ',';
                    //    //                    }
                    //    //                }
                    //    //
                    //    //                angular.forEach($scope.moderationType, function(value, key){
                    //    //                    if(key === 'share' && value === true){
                    //    //                        approvalInfo.push({
                    //    //                            "approvalType":"SHARE",
                    //    //                            "required":true,
                    //    //                            "approvers":userString
                    //    //                        })
                    //    //                    }
                    //    //                    if(key === 'comment' && value === true){
                    //    //                        approvalInfo.push({
                    //    //                            "approvalType":"COMMENT",
                    //    //                            "required":true,
                    //    //                            "approvers":userString
                    //    //                        })
                    //    //                    }
                    //    //
                    //    //                });
                    //    //
                    //    //                entityData = {
                    //    //                    name: $scope.currentLockrData.name,
                    //    //                    description: $scope.currentLockrData.description,
                    //    //                    hiddenFromPublicView: hiddenFromPublicView,
                    //    //                    approvalInfo:approvalInfo
                    //    //                };
                    //    //
                    //    //
                    //    //            } else {
                    //    //
                    //    //                var oneTrue = false;
                    //    //                $scope.contacts.length == 0 && toastr.warning('You must to select one user at least !','Warning') && (oneTrue = true);
                    //    //                !oneTrue && !$scope.moderationType.share && !$scope.moderationType.comment && toastr.warning('You must to select one type at least !','Warning');
                    //    //
                    //    //                return;
                    //    //            }
                    //    //
                    //    //        } else {
                    //    //            // moderation not active
                    //    //            entityData.approvalInfo = [];
                    //    //        }
                    //    //
                    //    //        $scope.loadingInProgress = true;
                    //    //
                    //    //        dalockrServices.updateLockr($scope.currentLockrData.id, entityData, function (data) {
                    //    //
                    //    //            $rootScope.$broadcast('updateLockrDetails', true);
                    //    //            toastr.success("Lockr " + data.lockr.name +" has successfully been updated.",'Success');
                    //    //        }, function (error) {
                    //    //            $scope.loadingInProgress = false;
                    //    //            toastr.error(error.message,'Error');
                    //    //        });
                    //    //
                    //    //
                    //    //    }
                    //    //};
                    //    //
                    //    //
                    //    //
                    //    ////clusterId: "dalockr"
                    //    ////email: "content@manager.com1"
                    //    ////firstName: "Content"
                    //    ////id: "5629272a2c65cd5bf1bf6119"
                    //    ////lastName: "Manager"
                    //    ////username: "cn_man_dev"
                    //    //var moderationType = {
                    //    //    share:false,
                    //    //    comment:false
                    //    //};
                    //    //var haveModerationContact = [];
                    //    //
                    //    //$scope.querySearch = querySearch;
                    //    //$scope.allContacts = loadUsers();
                    //    //$scope.contacts = [];
                    //    //$scope.filterSelected = false;
                    //    //
                    //    //if($scope.isActivedModeration){
                    //    //    approvalInfo.map(function (value,key) {
                    //    //
                    //    //        var len = value.approvers.length;
                    //    //        for(var i=0; i<len; i++){
                    //    //            var approver = value.approvers[i];
                    //    //            if(haveModerationContact.indexOf(approver.email) < 0){
                    //    //              haveModerationContact.push(approver.email);
                    //    //            }
                    //    //        }
                    //    //
                    //    //        var type = value.approvalType.toLowerCase();
                    //    //        if(type === 'share'){
                    //    //            moderationType.share = true;
                    //    //        } else if(type === 'comment'){
                    //    //            moderationType.comment = true;
                    //    //        }
                    //    //        return value;
                    //    //    });
                    //    //} else {
                    //    //    moderationType.share = true;
                    //    //    moderationType.comment = true;
                    //    //}
                    //    //$scope.moderationType = moderationType;
                    //    //
                    //    //
                    //    //$scope.selectedThisContact = function (contact) {
                    //    //    $scope.contacts.push(contact);
                    //    //};
                    //    //
                    //    ///**
                    //    // * Search for contacts.
                    //    // */
                    //    //function querySearch (query) {
                    //    //    var results = query ?
                    //    //        $scope.allContacts.filter(createFilterFor(query)) : [];
                    //    //    return results;
                    //    //}
                    //    ///**
                    //    // * Create filter function for a query string
                    //    // */
                    //    //function createFilterFor(query) {
                    //    //    var lowercaseQuery = angular.lowercase(query);
                    //    //    return function filterFn(user) {
                    //    //        return (user._lowername.indexOf(lowercaseQuery) != -1);
                    //    //    };
                    //    //}
                    //    //function loadUsers() {
                    //    //    dalockrServices.getLockrUsers(scope.currentLockrId).then(function (res) {
                    //    //        var allUsers = res.data;
                    //    //        $scope.allContacts = allUsers.map(function (user, index) {
                    //    //            var name = user.firstName + ' ' + user.lastName;
                    //    //            var contact =  {
                    //    //                name: name,
                    //    //                email:user.email,
                    //    //                image:dalockrServices.getUserAvatar(user.clusterId,user.username),
                    //    //                id:user.id,
                    //    //                _lowername:name.toLowerCase(),
                    //    //                username:user.username
                    //    //            };
                    //    //            angular.forEach(haveModerationContact, function (value) {
                    //    //                if(value === contact.email){
                    //    //                    $scope.contacts.push(contact);
                    //    //                }
                    //    //            });
                    //    //            return contact;
                    //    //        });
                    //    //    });
                    //    //}
                    //
                    //}




                    scope.$on('openLockrDownload',function(ev,val){
                        scope.openDownloadLockrDialog({id:val.id,name:val.name,createDate:val.dateCreated});
                    });
                    scope.openDownloadLockrDialog = function(value){

                        scope.isDownloadingLockr = value;

                        $mdDialog.show({
                            controller: downloadLockrDialogController,
                            templateUrl: 'views/templates/download-lockr-dialog.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });

                        //cancelBubble(ev);


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
                    if(scope.mobileDevice){
                        commonServices.requestAssetResource(function (previewResource) {
                            scope.previewResource = previewResource;
                            showAddAssetView();
                        }, function () {
                            alert('Get resource error');
                        });
                    } else {
                        showAddAssetView();
                    }
                };

                function showAddAssetView(){
                    angular.element('body').append($compile(angular.element('<add-asset-view preview-resource="previewImage" lockr-id="currentLockrId"></add-asset-view>'))(scope));
                }




                /*********** 批量操作 ASSET ***********/

                    //selected-item



                var haveSelectedItem = [];

                scope.selectItem = function(ev,value){
                    //console.log(value);

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

                function addToArticle() {

                }


                function moveAssets(event){
                    function moveAssetsDialog(ev){

                        //scope.isDownloadingLockr = ev;

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
                            // console.log(asset);
                            $scope.haveSelectedItem.push(asset);


                        }else{
                            $scope.haveSelectedItem = haveSelectedItem;
                        }
                        // console.log(haveSelectedItem);
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

                function loadAccessUsersForLockr(){
                    dalockrServices.getLockrUsers(scope.currentLockrId)
                        .then(function(response){
                            var result = response.data;
                            for (var i = 0; i < result.length; i++) {
                                var obj = result[i];
                                obj.userPic = dalockrServices.getUserAvatar(obj.clusterId,obj.username);
                            }
                            scope.accessUsers = result;
                        }).catch(function(error){

                        });
                }



                // see lockr comments
                scope.seeLockrComments = function(){
                    scope.mobileScreen && scope.showMobileSider();
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
                                            name:folder.name,
                                            isLoadingChildren:true,
                                            isFolder:true
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
                    dalEntityMoreAction.open(item,true).then(function (key) {
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
                                scope.batchHandle(ev,'copy',item);
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
                                scope.openDownloadLockrDialog({id:item.id,name:item.name,createDate:item.dateCreated});
                                break;
                            case 'delete':
                                if(isLockr){
                                    //scope.openDeleteLockrDialog(item,ev);
                                    scope.deleteLockrConfirm(item);
                                } else {
                                    scope.openDeleteAssetDialog({id:item.id,name:item.name},ev);
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
                                    scope.setThumbnail(item.id);
                                }
                                break;
                            case 'share':
                                scope.openShareDialog();
                                break;
                            case 'info':
                                scope.openLockrInfoDialog(item);
                                break;
                            case 'preview':
                                commonServices.openPreview(isLockr ? 'lockr':'asset',isLockr ? item.links[0].trackingId : item.defaultLink.trackingId,isLockr ? item.cluster.id : item.clusterId);

                                //$rootScope.$broadcast('mobileToPreview');
                                break;
                        }
                    });

                }



            }
        };
    }]);
