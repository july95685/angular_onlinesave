'use strict';
/**
 * Created by panma on 9/19/15.
 */
angular.module('dalockrAppV2App')
    .directive('assetStatusRegion',[
        'dalockrServices',
        'commonServices',
        '$filter',
        '$rootScope',
        'toastr',
        '$mdDialog',
        '$compile',
        '$document',
        '$q',
        'appConfig',
        'sharingRuleServices',
        'sharingRuleToShareService',
        'cacheService',
        '$mdBottomSheet',
        '$mdPanel','$dalMedia',
        function(dalockrServices,commonServices,$filter,$rootScope,toastr,$mdDialog,$compile,$document,$q,appConfig,sharingRuleServices,sharingRuleToShareService,cacheService,$mdBottomSheet,$mdPanel,$dalMedia){
        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/directives/asset/mobile/asset-status-region.html';
                }
                return 'views/directives/asset/asset-status-region.html';
            },
            replace:true,
            scope:{
                assetOldLicense:'=',
                currentAssetId:'=',
                assetName:'=',
                assetDetails:'='
            },
            link:function(scope,elem){

                var hasShowStats = false;
                scope.isShared = true;
                scope.commentBoxShow = false;
                scope.isCommenting = false;
                scope.shareSocialChannelsList = [];
                scope.shareDialogHidden = true;
                scope.commentMaxListIndex = 0;
                scope.commentsData = null;
                scope.selectedIndex = 0;
                scope.assetFollowers = [];
                scope.loadingCommentFlow = true;
                scope.assetCanShare = true;
                scope.currentTabItem = 'share';
                scope.commentsDataTips = '';
                scope.test=function(){};

                scope.seriesData = {
                    labels:[],
                    views:{},
                    comments:{}
                };
                scope.currentDateRange = {
                    startDate:null,
                    endDate:null
                };

                scope.openShareEditDialog = function(data){
                    console.log(data);
                    scope.clickdata = data;
                        $mdDialog.show({
                                controller: openShareDialogController,
                                templateUrl: 'views/mobile/mobile-asset-details-form.html',
                                parent: angular.element(document.body),
                                clickOutsideToClose:true
                            })
                            .then(function(answer) {
                                console.log(2);
                            }, function() {
                                console.log(1);
                            });
                    function openShareDialogController($scope){



                        console.log(data);
                        console.log(scope.clickdata);
                        $scope.item = scope.clickdata;
                        console.log($scope.item);

                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };

                        $scope.editShareForm = function(){
                            $scope.showShareForm = true;
                        };
                        $scope.backForm= function(){
                            $scope.showShareForm = false;
                        };
                        $scope.formData = {
                            title:$scope.item.title,
                            message:$scope.item.message,
                            customShareMsg:$scope.item.customShareMsg
                        };
                        $scope.updateShare = function(){
                            console.log($scope.formData);
                            dalockrServices.uploadShare( data.id,$scope.formData.customShareMsg, $scope.formData.title, $scope.formData.message).success(function(data){
                                console.log(data);
                                $scope.cancel();
                                $rootScope.$broadcast('load-comments',true);
                            }).error(function(error){
                                console.log(error);
                            })
                        };

                        $scope.deleteShare = function(){
                            console.log(2);
                            dalockrServices.deleteCommentById(data.id).success(function(data){
                                console.log(data);
                                $scope.cancel();
                            }).error(function(data){
                                console.log(data);
                            })
                        }
                    }
                };



                scope.$on('shareSuccess',function(event,value){
                    if(value){
                        $rootScope.$broadcast('load-comments',true);
                    }
                });
                dalockrServices.getLockrOrAssetComments('asset', scope.assetDetails.id, function(data){
                    if(data[0].comments) {
                        scope.commentsData = data[0].comments;
                        getCommentsTip(scope.commentsData);
                    }
                });

                var getCommentsTip = function(data){
                    if(data[0] && data[1]){
                        scope.commentsDataTips = data[0].by[0].username + " and others";
                    }else if(data[0] || data[1]){
                        scope.commentsDataTips = data[0].by[0].username;
                    }else{
                        scope.commentsDataTips = 'No one like comments';
                    }
                };

                scope.openRobot = function(){
                    $mdDialog.show({
                        controller: OpenRobotController,
                        templateUrl: 'views/mobile/mobile-robot.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')

                    });
                };
                function OpenRobotController($scope){
                    $scope.initial = true;
                    $scope.talkList = [{
                        title : 'Hi how can i help you ?',
                        formBob : true
                    }];
                    //if(!$scope.talkList) {
                    //    $scope.talkList.push(messageStart);
                    //}
                    $scope.sendMessage = {
                        title : '',
                        formBob : false
                    };
                    $scope.giveRobotMessage = '';
                    $scope.BobResponse = '';
                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function(answer) {
                        $mdDialog.hide(answer);
                    };
                    $scope.getUserPic =  function(type,comment){
                        if(comment){
                            return commonServices.getUserPicType(type,comment);
                        } else {
                            return null;
                        }
                    };
                    $scope.Rbavator = dalockrServices.getUserAvatar(scope.assetDetails.user.clusterId,scope.assetDetails.user.username);
                    $scope.askToBobAgain = function(){
                        var sendmessage = $scope.sendMessage.title;
                        var newAsk = angular.copy($scope.sendMessage);
                        var DataResult = [];
                        $scope.talkList.push($scope.sendMessage);
                        dalockrServices.sendMessageToBot(sendmessage).success(function(data){
                            $scope.BobResponse = data.RESPONSE;
                            if(data.COMMAND_RESULT){
                                if(data.COMMAND_RESULT.RESULT_TYPE == "SEARCH") {
                                    angular.forEach(data.COMMAND_RESULT.RESULT.result, function (value, index) {
                                        angular.forEach(value, function (val) {
                                            // console.log(val);
                                            if (index == 'Lockr') {
                                                val.src = dalockrServices.getThumbnailUrl('lockr', val._id);
                                                DataResult.push(val);
                                            }
                                            else if (index == 'DA') {
                                                val.src = dalockrServices.getThumbnailUrl('asset', val._id);
                                                DataResult.push(val);
                                            }

                                        })
                                    })
                                }else if(data.COMMAND_RESULT.RESULT_TYPE == 'COMMENTS'){
                                    DataResult = data.COMMAND_RESULT.RESULT;
                                }
                            }
                            if(data.COMMAND_RESULT){//console.log(dalockrServices.getThumbnailUrl('asset',data.COMMAND_RESULT.RESULT.result.DA[0]._id));
                                var resuleData = {
                                    title : data.RESPONSE,
                                    formBob : true,
                                    getMessage : DataResult
                                }
                            }else{
                                var resuleData = {
                                    title : data.RESPONSE,
                                    formBob : true
                                }
                            }
                            $scope.talkList.push(resuleData);
                        }).error(function(error){
                            $scope.BobResponse = "Some error has occurred!";
                        })
                    };
                    $scope.askToBob = function(){
                        $scope.oData = new Date().getTime();
                        var sendmessage = $scope.sendMessage.title;
                        var newAsk = angular.copy($scope.sendMessage);

                        var DataResult = [];
                        $scope.talkList.push(newAsk);
                        $scope.initial = false;
                        dalockrServices.sendMessageToBot(sendmessage).success(function(data){
                            $scope.BobResponse = data.RESPONSE;
                            if(data.COMMAND_RESULT){
                                if(data.COMMAND_RESULT.RESULT_TYPE == "SEARCH") {
                                    angular.forEach(data.COMMAND_RESULT.RESULT.result, function (value, index) {
                                        angular.forEach(value, function (val) {
                                            // console.log(val);
                                            if (index == 'Lockr') {
                                                val.src = dalockrServices.getThumbnailUrl('lockr', val._id);
                                                DataResult.push(val);
                                            }
                                            else if (index == 'DA') {
                                                val.src = dalockrServices.getThumbnailUrl('asset', val._id);
                                                DataResult.push(val);
                                            }

                                        })
                                    })
                                }else if(data.COMMAND_RESULT.RESULT_TYPE == 'COMMENTS'){
                                    DataResult = data.COMMAND_RESULT.RESULT;
                                }
                            }
                            if(data.COMMAND_RESULT){
                               //console.log(dalockrServices.getThumbnailUrl('asset',data.COMMAND_RESULT.RESULT.result.DA[0]._id));
                                var resuleData = {
                                    title : data.RESPONSE,
                                    formBob : true,
                                    getMessage : DataResult
                                }
                            }else{
                                var resuleData = {
                                    title : data.RESPONSE,
                                    formBob : true
                                }
                            }
                            $scope.talkList.push(resuleData);
                            //console.log($scope.talkList);
                        }).error(function(error){
                            $scope.BobResponse = "Some error has occurred!";
                        })
                    };

                }
                


                var assetParentLockr;
                if(assetParentLockr = cacheService.getLockrStackTopElement()){
                    scope.assetCanShare = assetParentLockr.lockrType.toLowerCase() !== 'safelockr';
                } else {
                    scope.$on('$$thisAssetIsCanShare',function(event,value){
                        scope.assetCanShare = value;
                    });
                }



                scope.$on('comments-data',function(event, data){
                    scope.shareSocialChannelsList = [];
                    scope.loadingCommentFlow = false;


                    if(data.comments.length === 1 || data.comments.length === 0 ){
                        if(data.comments.length === 1){
                            if(data.comments[0].by.length === 0){
                                scope.shareBtnMessage = 'Share';
                                scope.isShared = false;
                            }else{
                                scope.shareBtnMessage = 'Reshare';
                                scope.isShared = true;
                            }
                        }else{
                            scope.shareBtnMessage = 'Share';
                            scope.isShared = false;
                        }
                    }else{
                        scope.shareBtnMessage = 'Reshare';
                        scope.isShared = true;
                    }





                    angular.forEach(data.comments,function(value,key){
                        value.userAvatarPreview = dalockrServices.getUserAvatar('dalockr',value.byUserName);
                        angular.forEach(value.by,function(v,k){
                                if(scope.shareSocialChannelsList.length === 0){
                                    v.iconClass = commonServices.getIconClassByType(v.userType);
                                    scope.shareSocialChannelsList.push({type: v.userType,id: v.commentId,name: v.channelName,iconClass: v.iconClass});
                                } else {
                                    var isSaved = false;
                                    angular.forEach(scope.shareSocialChannelsList,function(v2){
                                        if(v2.name === v.channelName){
                                            isSaved = true;
                                            return null;
                                        }
                                    });
                                    if(!isSaved){
                                        v.iconClass = commonServices.getIconClassByType(v.userType);
                                        scope.shareSocialChannelsList.push({type: v.userType,id: v.commentId,name: v.channelName,iconClass: v.iconClass});
                                    }
                                }
                          });
                    });
                    data.comments = $filter('orderBy')(data.comments, 'commentDate', true);

                    angular.forEach(data.comments, function (v) {
                        var byFormat = {};
                        if(v.by.length){
                            v.by.map(function (value,k) {
                                value.iconClass = commonServices.getIconClassByType(value.userType);
                                byFormat[value.userType] = byFormat[value.userType] || [];
                                byFormat[value.userType].push(value);

                                return value;
                            });
                        }
                        // dalockrServices.getSharingRuleById(v.id).success(function(data){
                        //     console.log(data);
                        // });
                        v.byFormat = byFormat;
                    });
                    scope.commentsDetails = data;
                    if(scope.commentsDetails.comments[0]){
                        scope.commentsDetails.comments[0].firstTimelineIcon = true;
                    }
                    scope.loadingCommentFlow = false;

                });

                scope.showShareEntitySocialChannelsDetails = function (ev,item) {
                    var position = $mdPanel.newPanelPosition()
                        .relativeTo('.share-entity-' + item.id)
                        .addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.BELOW);
                    var config = {
                        attachTo: angular.element(document.body),
                        controller: PanelMenuCtrl,
                        controllerAs: 'ctrl',
                        templateUrl:'views/templates/share-entity-panel.html',
                        panelClass: 'share-entity-panel',
                        position: position,
                        locals: {
                            'entity': item
                        },
                        openFrom: ev,
                        clickOutsideToClose: true,
                        escapeToClose: true,
                        focusOnOpen: false,
                        zIndex: 9999999999999999
                    };
                    $mdPanel.open(config);
                };


                function PanelMenuCtrl(){
                    angular.forEach(this.entity.by, function (v) {
                        var type = v.userType.toLowerCase();
                        if(type == 'facebook'){
                            v.avatarURL = commonServices.getProfilePicByTypeAndId(type, v.fromId);
                        } else if(type == 'twitter'){
                            v.avatarURL = commonServices.getProfilePicByTypeAndId(type, v.screenName);
                        }
                    });

                }


                scope.openShareDialog = function(ev){
                    if(scope.shareBtnMessage === 'Share'){
                        $rootScope.$broadcast('$$ToShareAsset');
                    } else {
                        scope.shareDialogHidden = false;
                        var firstShare = scope.commentsDetails.comments[0];
                        scope.shareEntity = {
                            title:firstShare.title,
                            text:firstShare.message,
                            shareMsg:firstShare.customShareMsg,
                            channels:[]
                        };
                       
                    }
                  
                };

                scope.openMobileShareDialog = function (entity) {
                    scope.shareEntity = scope.shareEntity || {title:'',shareMsg:'',text:'',channels:[]};
                    if(entity){
                        scope.shareEntity.title = entity.title;
                        scope.shareEntity.text = entity.text;
                        scope.shareEntity.shareMsg = entity.message;
                    }
                    //scope.shareDialogHidden = false;
                    $mdDialog.show({
                        controller: OpenShareAssetPage,
                        templateUrl: 'views/mobile/mobile-share-asset.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    });
                };

                function OpenShareAssetPage($scope){
                    $scope.styleFromassetdetail = true;
                    $scope.socialChannels = scope.socialChannels;
                    $scope.shareEntityDialog = scope.shareEntity;
                    $scope.currentAvaliableSharingRule = scope.currentAvaliableSharingRule;

                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function(answer) {
                        $mdDialog.hide(answer);
                    };
                    $scope.UseshareAsset = function(){
                        var socialChannelsdata = [];
                        if($scope.socialChannels[0]){
                            angular.forEach($scope.socialChannels,function(val){
                                if(val.selected){
                                    socialChannelsdata.push(val.id);
                                }
                            });
                            $scope.shareEntityDialog.channels = socialChannelsdata;
                            dalockrServices.shareAsset(scope.currentAssetId,$scope.shareEntityDialog,function(data){
                                toastr.success(data.message);
                                $scope.cancel();
                            },function(error){
                                if(error && error.responseText)
                                    toastr.error(JSON.parse(error.responseText).message);
                            });
                        }



                    }
                }


                scope.hasTwitter = false;
                var haveSelectedChannels = [];
                    var tempArrb = [];
                    var tempArrc = [];


                function resetHaveSelectedChannels(){
                    haveSelectedChannels = angular.copy(scope.currentAvaliableSharingRule.postOnSocialChannel);
                    if(haveSelectedChannels.length){
                        var tempArr = [];
                        var i=-1;
                        angular.forEach(scope.normalSocialChannels, function (v1) {                   
                            angular.forEach(haveSelectedChannels, function (v2) {
                                if(v1.id === v2){
                                    tempArr.push(v1);
                                }

                            });

                        });
                         angular.forEach(haveSelectedChannels, function (v2){
                            i=-1;
                            angular.forEach(tempArrb, function(v1){
                                i++;
                                if(v1.id==v2){
                                    tempArrb.splice(i,1);
                                    
                                }
                            })
                        });

                        scope.socialChannels = tempArr;
               
                          angular.forEach(scope.socialChannels,function(val,ind){
                            if(val.socialChannelType === 'Facebook'){
                            if(val.pageId){
                           
                                val.avatarPic = commonServices.getProfilePicByTypeAndId('facebook',val.pageId);
                            } else {  
                                val.avatarPic = commonServices.getProfilePicByTypeAndId('facebook',val.facebookId);
                            }
                        } else if(val.socialChannelType === 'Twitter'){
                   
                            val.avatarPic = commonServices.getProfilePicByTypeAndId('twitter',val.screenName);
                        }
                                  })
                        checkActiveItem();
                    } else {
                        scope.socialChannels = angular.copy(scope.normalSocialChannels);

                    }
                   
                }


                scope.selectShareSocialChannels = function(id){
      
                    var idx = 0;
                    if( (idx = haveSelectedChannels.indexOf(id)) < 0){
                        haveSelectedChannels.push(id);
                        
                    } else {
                        haveSelectedChannels.splice(idx,1);
                      
                    }
                    checkActiveItem();
                };

                function checkActiveItem(){
                  
                    for(var k= 0, l3 = scope.socialChannels.length; k<l3;k++){
                        scope.socialChannels[k].active = false;
                    }
                    for(var i= 0, l1 = haveSelectedChannels.length;i<l1; i++){
                        var obj1 = haveSelectedChannels[i];
                        for(var j= 0, l2 = scope.socialChannels.length; j<l2;j++){
                            var obj2 = scope.socialChannels[j];
                            if(obj1 === obj2.id){
                                obj2.active = true;

                                //检查是否有twitter
                                if(obj2.socialChannelType.toLowerCase() === 'twitter'){
                                    scope.hasTwitter = true;
                                }
                            }
                        }
                    }
                }



                scope.loadingInProgress = false;
                scope.submitted = false;
                scope.isScheduling = false;

                scope.shareAsset = function(){

                    scope.submitted = true;

                    if(scope.reshare_asset_form.$valid){

                        scope.shareEntity.channels = haveSelectedChannels;
                        scope.loadingInProgress = true;


                        if(scope.isScheduling){ //定时Share
                            var httpBody = angular.extend(scope.shareEntity,{"shareByDate":scope.shareDate.toISOString()});
                            dalockrServices.scheduleShareEventForAssetOrLockr('asset',scope.currentAssetId,httpBody).then(function (res) {
                                toastr.success(res.data.message);
                                scope.shareDialogHidden = true;
                                scope.loadingInProgress = false;
                                $rootScope.$broadcast('shareSuccess',true);
                            }).catch(function (error) {
                                scope.loadingInProgress = false;
                                if(error && error.data)
                                    toastr.error(error.data.message);
                            });

                        } else {
                            dalockrServices.shareAsset(scope.currentAssetId,scope.shareEntity,function(data){

                                var failed = false;
                                if(data.status === 'ok' && data.message === 'Request sent for Approval'){
                                    toastr.success(data.message);
                                } else {
                                    if(data.socialInteractionResults){
                                        angular.forEach(data.socialInteractionResults, function (value, key) {
                                            if(value.socialPostStatus.toLowerCase() === 'failed'){
                                                failed = true;
                                                toastr.error(value.failedMsg,value.socialChannelType + ' share failed');
                                            }
                                        });
                                    }

                                    if(!failed){
                                        toastr.success('Shared');
                                    }
                                }

                                scope.shareDialogHidden = true;
                                scope.loadingInProgress = false;
                                $rootScope.$broadcast('load-comments',true);
                                scope.$apply();

                            },function(error){
                                scope.loadingInProgress = false;
                                if(error && error.responseText)
                                    toastr.error(JSON.parse(error.responseText).message);
                                scope.$apply();
                            });

                        }
                    }
                };


                scope.schedulePostForMobile = function () {
                    $mdBottomSheet.show({
                        templateUrl:'views/templates/mobile-schedule-post-view.html',
                        controller: MobileSchedulePostCtrl
                    });
                };

                function MobileSchedulePostCtrl($scope){
                    $scope.shareDate = new Date();
                    $scope.schedulePostThisShare = function () {
                        if(!$scope.shareDate) return;
                        scope.isScheduling = true;
                        scope.shareDate = $scope.shareDate;
                        scope.shareAsset();
                        $mdBottomSheet.hide();
                        scope.isScheduling = false;
                    }
                }

                scope.closeReshareDialog = function(){
                    scope.shareDialogHidden = true;
                };
                scope.activeCurrentChannelTab = function (item) {
        
                    angular.forEach(scope.socialTypes, function (v) {
                        v.active = false;
                    });
                    scope.filterSocialChannel = item.name;

                    item.active = true;
                };

                scope.changeCallback = function (items) {
                    haveSelectedChannels = items;
                };

                scope.$watch('assetDetails.lockrId', function (newVal,oldVal) {
                    if(newVal){
                        if(!scope.normalSocialChannels && !scope.currentAvaliableSharingRule){
                            scope.loadSharingRule = true;

                            sharingRuleToShareService.getCanSharedSocialChannelsAndRule(scope.assetDetails.lockrId,scope.assetDetails.mimeType).then(function (rule) {
                                scope.loadSharingRule = false;
                                if(rule.usedRule){
                                    scope.currentAvaliableSharingRule = rule.usedRule;
                                    haveSelectedChannels = rule.usedRule.postOnSocialChannel;
                                    scope.socialChannels = rule.usedRule.postOnSocialChannelDetail.map(function (val) {
                                        val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                        val.active = true;
                                        val.avatarPic = commonServices.getSocialChannelAvatar(val);
                                        return val;
                                    });
                                } else { //没有对应的Rule 显示account的所有social channels
                                    dalockrServices.getShareSocialChannelWithCache(function (results) {
                                        scope.socialChannels = results.map(function (val) {
                                            val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                            val.selected = false;
                                            val.active = false;
                                            val.avatarPic = commonServices.getSocialChannelAvatar(val);
                                            return val;
                                        });
                                    })
                                }
                            });


                        //    sharingRuleToShareService.getSharingRuleCanShareForEntity(scope.assetDetails.lockrId,scope.assetDetails.mimeType, function (data) {
                        //
                        //        scope.loadSharingRule = false;
                        //        scope.normalSocialChannels = data.normalSocialChannels;
                        //        scope.currentAvaliableSharingRule = data.avaliableSharingRules;
                        //        if(scope.currentAvaliableSharingRule){
                        //            resetHaveSelectedChannels();
                        //        } else {
                        //            scope.socialChannels = angular.copy(scope.normalSocialChannels);
                        //            angular.forEach(scope.socialChannels,function(val,ind){
                        //                if(val.socialChannelType === 'Facebook'){
                        //                        if(val.pageId){
                        //                            val.avatarPic = commonServices.getProfilePicByTypeAndId('facebook',val.pageId);
                        //                        } else {
                        //                            val.avatarPic = commonServices.getProfilePicByTypeAndId('facebook',val.facebookId);
                        //                        }
                        //                } else if(val.socialChannelType === 'Twitter'){
                        //                    val.avatarPic = commonServices.getProfilePicByTypeAndId('twitter',val.screenName);
                        //                }
                        //            });
                        //        }
                        //
                        //
                        //    }, function () {
                        //        scope.loadSharingRule = false;
                        //        scope.loadingSharingRuleError = true;
                        //    });
                        //
                        //} else {
                        //    if(scope.currentAvaliableSharingRule){
                        //        resetHaveSelectedChannels();
                        //    } else {
                        //        scope.socialChannels = angular.copy(scope.normalSocialChannels);
                        //    }
                        }
          
                    }
           
                },true);



                var watcher = scope.$watch('selectedIndex', function () {
                   if(scope.selectedIndex === 3){
                       var followers = commonServices.getAssetFollowers();
                       if(followers){
                           adjustFollowersData(followers);
                           scope.assetFollowers = followers;
                       } else {
                           loadAssetFollowers();
                       }
                   } else if(scope.selectedIndex === 2 && !hasShowStats){
                       hasShowStats = true;
                       loadData();
                   }
                });

                function loadAssetFollowers(){
                    dalockrServices.getAssetOrLockrFollowers('asset',scope.currentAssetId, function (data) {
                        adjustFollowersData(data);
                        scope.assetFollowers = data;
                    }, function (error) {

                    });
                }

                function adjustFollowersData(data){
                    for(var i=0; i<data.length; i++){
                        data[i].userPic = appConfig.API_SERVER_ADDRESS + '/u/'+ data[i].follower.clusterId +'/' + data[i].follower.username + '/avatar';
                    }
                }



                //scope.$watch('assetDetails', function (value) {
                //    if(value != null){
                //        getSharingRule();
                //    }
                //});

                ////////////////////
                ////Sharing Rule////
                ////////////////////
                //function getSharingRule(){
                //
                //    dalockrServices.getLockrDetails(scope.assetDetails.lockrId).success(function (data) {
                //        var sharingRulePromise = [];
                //        angular.forEach(data.sharingRule, function (value) {
                //            sharingRulePromise.push(dalockrServices.getSharingRuleById(value.id));
                //        });
                //        $q.all(sharingRulePromise).then(function (response) {
                //            scope.sharingRules = response.map(function (value) {
                //                value.data.creativeImage = commonServices.getCreativeCommonsImageUrl(value.data.license);
                //                return value.data;
                //            });
                //            scope.assetLicense = scope.sharingRules[0].license;
                //            dalockrServices.getLicenseData(scope.assetLicense, function (v) {
                //                scope.licenseDesc = v.description;
                //            });
                //        });
                //    }).error(function () {
                //
                //    });
                //}

                scope.selectTabItem = function (item) {
                    scope.currentTabItem = item;
                    if(item === 'follow'){
                        var followers = commonServices.getAssetFollowers();
                        if(followers){
                            adjustFollowersData(followers);
                            scope.assetFollowers = followers;
                        } else {
                            loadAssetFollowers();
                        }
                    } else if(item === 'stats' && !hasShowStats){
                        hasShowStats = true;
                        loadData();
                    }
                };

                scope.editSharingRules = function(){
                    sharingRuleServices.editSharingRule(scope.sharingRules);
                };
                scope.$on('switchImageAsset',function(){
                    scope.currentDateRange = {
                        startDate:null,
                        endDate:null
                    };
                    loadData();
                });


                function loadData(){
                    dalockrServices.getNumberOfCommentsAndViewsPerDayForAssetOrLockrOnSocialChannels(scope.currentDateRange,scope.currentAssetId, function(d){

                        if(d.rows.length === 0){ //没有数据
                            return;
                        }

                        var startTime = commonServices.getDate(d.rows[0][0]).split('.');
                        var endTime = commonServices.getDate(d.rows[d.rows.length-1][0]).split('.');
                        startTime = new Date(
                            startTime[2],
                            startTime[1]-1,
                            startTime[0]);
                        endTime = new Date(
                            endTime[2],
                            endTime[1]-1,
                            endTime[0]);
                        scope.currentDateRange = {
                            startDate:startTime,
                            endDate:endTime
                        };
                        formatStatsData(d);
                    },function(error){});
                }


                function formatStatsData(d){
                    var result;
                    angular.forEach(d.columns, function (v1, index) {
                        if(v1.match(/(.+)Views$/)){
                            result = v1.match(/(.+)Views$/);
                            angular.forEach(d.rows, function (v) {

                                var y = parseInt(v[0].substring(0,4));
                                var m = parseInt(v[0].substring(4,6));
                                var d = parseInt(v[0].substring(6,8));

                                scope.seriesData.views[result[1]] = scope.seriesData.views[result[1]] || [];
                                scope.seriesData.views[result[1]].push([Date.UTC(y, m-1, d),v[index]]);
                            });
                        } else if(v1.match(/Comments$/)){
                            result = v1.match(/(.+)Comments$/);
                            angular.forEach(d.rows, function (v) {


                                var y = parseInt(v[0].substring(0,4));
                                var m = parseInt(v[0].substring(4,6));
                                var d = parseInt(v[0].substring(6,8));

                                scope.seriesData.comments[result[1]] = scope.seriesData.comments[result[1]] || [];
                                scope.seriesData.comments[result[1]].push([Date.UTC(y, m-1, d),v[index]]);
                            });
                        }
                    });
                    angular.forEach(d.rows, function (row) {
                        scope.seriesData.labels.push(row[0]);
                    });

                }


                scope.$on('$destory', function () {
                    watcher();
                });


            }
        }
    }]);
