'use strict';
/**
 * Created by user on 2015/7/28.
 */

/**
 * Created by ann on 12/14/14.
 */
angular.module('dalockrAppV2App')
    .directive('dalockrUserProfileRegion', ['$rootScope','dalockrServices','$location','commonServices','$sessionStorage','appConfig','$mdDialog','toastr','$compile','$window','userServices','userRightServices','notificationCenterService','sharingRuleServices','dalockrMessages','$q','changeAccountService','accountInfoManager','$filter','addAccountService',
        function($rootScope,dalockrServices,$location,commonServices,$sessionStorage,appConfig,$mdDialog,toastr,$compile,$window,userServices,userRightServices,notificationCenterService,sharingRuleServices,dalockrMessages,$q,changeAccountService,accountInfoManager,$filter,addAccountService) {

            return {
                restrict: 'E',
                templateUrl: function () {
                    if($rootScope.mobileDevice){
                        return 'views/mobile/mobile-user-profile-region.html';
                    }
                    return 'views/directives/user-profile-region.html';
                },
                replace:true,
                link:function(scope,element){

                    element.find('i[rel=\'tooltip\']').tooltip({
                        container: 'body',
                        delay: { 'show': 300, 'hide': 0 }
                    });

                    scope.ClusterAccount = {
                        show:''
                    };

                    scope.addAccount = function () {
                        addAccountService.addAccount().then(function () {
                            $rootScope.$broadcast('addAccountSuccess');
                        });
                    };

                    scope.$watch('ClusterAccount.show',function(newVal,oldVal){
                        var ac;
                        if(oldVal && newVal){
                            angular.forEach(scope.accounts, function (v) {
                                if(v.name == newVal){
                                    ac = v;
                                }
                                //v.active = v.accountId == ac.accountId;
                            });
                            angular.forEach(scope.accounts, function (v) {
                                v.active = v.accountId == ac.accountId;
                            });
                            commonServices.setAccountId(ac.accountId);
                            $rootScope.$broadcast('$$ChangeAccountOfMobile',ac);
                        }else if(!newVal && oldVal){
                            scope.ClusterAccount.show = oldVal;
                        }

                    })


                    var accountsWatcher;
                    scope.storageData = null;
                    scope.perMimeTypeStorage = {};
                    scope.isAdmin = false;
                    scope.accounts = [];


                    var getUserStorage = function(update){
                        dalockrServices.getUsedAndAvailableSpaceInformationForUser(function(data){
                            scope.storageData = data;
                            scope.totalBytesHalf =Math.floor(data.totalBytes / 2);


                            scope.perMimeTypeStorage = {
                                image:{
                                    bytes:0,
                                    spaceInTotal:0
                                },
                                video:{
                                    bytes:0,
                                    spaceInTotal:0
                                },
                                audio:{
                                    bytes:0,
                                    spaceInTotal:0
                                },
                                text:{
                                    bytes:0,
                                    spaceInTotal:0
                                }
                            };
                            angular.forEach(data.perMimeType, function (value, key) {

                                var mimeType = value.mimeType;
                                mimeType.isFileType('audio') && (scope.perMimeTypeStorage.audio.bytes += value.bytes);
                                mimeType.isFileType('image') && (scope.perMimeTypeStorage.image.bytes += value.bytes);
                                mimeType.isFileType('video') && (scope.perMimeTypeStorage.video.bytes += value.bytes);
                                (mimeType.isFileType('ppt') ||  mimeType.isFileType('doc') || mimeType.isFileType('article') ||  mimeType.isFileType('xls') ||  mimeType.isFileType('pdf')) && (scope.perMimeTypeStorage.text.bytes += value.bytes);

                            });

                            angular.forEach(scope.perMimeTypeStorage, function(value, key){
                                value.spaceInTotal = (value.bytes / scope.storageData.maxBytes * 100).toFixed(0);
                            });

                            commonServices.setUserSpaceInfo({
                                storageData:scope.storageData,
                                perMimeTypeStorage:scope.perMimeTypeStorage
                            });

                        },update);
                    };



                    var userSpaceInfo = commonServices.getUserSpaceInfo();
                    if(userSpaceInfo !== null){
                        scope.storageData = userSpaceInfo.storageData;
                        scope.totalBytesHalf = Math.floor(userSpaceInfo.storageData.totalBytes / 2);
                        scope.perMimeTypeStorage = userSpaceInfo.perMimeTypeStorage;
                    }

                    var deleteSocialChannel = function(){
                        scope.deleteSC = function(scId){
                            dalockrServices.deleteASocialChannel(scId, function(data){
                                getSocialChannel();
                            }, function(error){

                            })
                        };
                    };

                    deleteSocialChannel();

                    scope.$on('account-change', function () {
                        userServices.getUserProfileInfo(function () {
                            getUserStorage(true);
                        });
                    });

                    scope.$on('$$UserAvatarChanged', function (ev,image) {
                        scope.userOriginAvatar = image;
                    });


                    function assignUserInfo(userInfo){
                        scope.userData = userInfo;
                        scope.userName = scope.userData.firstName +  ' ' + scope.userData.lastName;
                        scope.userDetailsData = {
                            firstName:scope.userData.firstName,
                            lastName:scope.userData.lastName,
                            phoneNumber:scope.userData.phoneNumber,
                            roles:scope.userData.roles.join('   ')
                        };
                    }

                    userServices.getUserProfileInfo(function (userInfo) {
                        assignUserInfo(userInfo);
                        //scope.getUserAvatar =  function(){
                        //    return dalockrServices.getUserAvatar(userInfo.clusterId, userInfo.id);
                        //};
                        scope.userOriginAvatar = dalockrServices.getUserAvatar(userInfo.clusterId, userInfo.username);
                        $rootScope.$broadcast('UserAvator',scope.userOriginAvatar);
                        commonServices.accountId() && getUserStorage(false);
                    });

                    scope.clusters = null;


                    profileHandle();


                    function profileHandle(){

                        scope.openProfileDialog = function(ev){
                            $location.path('/profile/userprofile');
                        };


                        function profileEditDialogController($scope){

                            $scope.hide = function() {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function() {
                                $mdDialog.cancel();
                            };
                            $scope.answer = function(answer) {
                                $mdDialog.hide(answer);
                            };
                            $scope.userDetailsData = scope.userDetailsData;

                            $scope.preventDefaultEvent = function (ev) {
                                ev.stopPropagation();
                            };


                            var authToken = userServices.getAccessToken();

                            function getAddSocialChannelUrl(name) {
                                var ru = encodeURIComponent(appConfig.REDIRECT_URL_ADDRESS  + '/redirect.html');
                                if (typeof userServices.currentUser() === 'undefined') {
                                    return null;
                                } else {
                                    return appConfig.API_SERVER_ADDRESS + '/api/' +userServices.currentUser().clusterId + '/adm/add/social/channel/' + name + '?redirectUri=' + ru +'&token=' + authToken;
                                }
                            }


                            $scope.addFacebookPage = function (item) {
                                dalockrServices.addFacebookPage(item.id,item.channleId).success(function () {
                                    commonServices.socialChannels = null;
                                    toastr.success('Add success','Success');
                                    getSocialChannel();
                                    $scope.needToAddedPages.splice($scope.needToAddedPages.indexOf(item),1);
                                });
                            };


                            $scope.addSocialChannel = function(name, isFacebook){

                                if(name === 'Facebook' && !isFacebook){

                                    if($scope.socialChannelsData){ //如果有数据


                                        var facebookAccount = [];
                                        var facebookPages = [];

                                        angular.forEach($scope.socialChannelsData,function (v,k) {
                                            if(v.socialChannelType === 'Facebook'){
                                                if(v.name.split('-')[0] === 'Facebook'){
                                                    facebookAccount.push(v);
                                                } else {
                                                    facebookPages.push(v);
                                                }
                                            }
                                        });


                                        if(facebookAccount.length){

                                            $scope.loadingPage = true;
                                            $scope.showFacebookPage = true;
                                            $scope.needToAddedPages = [];

                                            var promise = [];
                                            var allPages = [];
                                            angular.forEach(facebookAccount, function (v2) {
                                                promise.push(dalockrServices.getFacebookPageById(v2.id));
                                            });

                                            $q.all(promise).then(function (response) {

                                                $scope.loadingPage = false;

                                                angular.forEach(response, function (v3) {
                                                    var result = v3.data;
                                                    var fid = v3.fId;
                                                    angular.forEach(result,function (v) {
                                                        v.channleId = fid;
                                                    });
                                                    allPages = allPages.concat(result);
                                                });

                                                var needToAddedPages = [];
                                                //去掉已经加入的Page
                                                angular.forEach(allPages, function (v4) {

                                                    var hasExisted = false;
                                                    angular.forEach(facebookPages, function (v5) {
                                                       if(v4.id === v5.pageId){ //已经存在
                                                           hasExisted = true;
                                                       }
                                                    });

                                                    if(!hasExisted){
                                                        needToAddedPages.push(v4);
                                                    }
                                                });

                                                $scope.needToAddedPages = needToAddedPages;

                                            }).catch(function () {
                                                $scope.loadingPage = false;
                                            });

                                            //是否存在facebook , 如果有则

                                            return;
                                        }



                                    }



                                }

                                if(getAddSocialChannelUrl(name)){
                                    window.open(getAddSocialChannelUrl(name),'addSocialChannel','height=400, width=400, top=0,left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');
                                    window.addSuccess = function(){
                                        $scope.$apply(function(){
                                            commonServices.socialChannels = null;
                                            toastr.success('Add success','Success');
                                            getSocialChannel();
                                        });
                                    }
                                }
                            };






                            $scope.isUpdating = false;
                            $scope.updateUser = function(){
                                if($scope.profile_form.$valid){
                                    $scope.isUpdating = true;
                                    dalockrServices.updateUserDetails(userServices.currentUser().id, $scope.userDetailsData, function(data){
                                        $scope.isUpdating = false;
                                        toastr.success('User updated','Success');
                                    },function(error){
                                        toastr.error(error.message,'Error');
                                    });
                                }

                            };


                            function getSocialChannel(){

                                $scope.socialChannelsData = [];
                                $scope.loadingSocialChannels = true;

                                dalockrServices.getAllSocialChannels()
                                    .then(function(response){

                                        var data = response.data;
                                        var socialChannelsData = [];
                                        angular.forEach(data, function(value, key){
                                            value.class = commonServices.getIconClassByType(value.socialChannelType);
                                            socialChannelsData.push(value);
                                        });

                                        $scope.socialChannelsData = socialChannelsData;
                                        $scope.loadingSocialChannels = false;

                                    },function(error){
                                        $scope.loadingSocialChannels = false;

                                    });
                            }
                            getSocialChannel();

                            $scope.deleteSC = function(scId){
                                dalockrServices.deleteASocialChannel(scId, function(data){

                                    toastr.success('Delete success','Success');
                                    getSocialChannel();

                                }, function(error){
                                    toastr.error('Delete error','Error');

                                })
                            };




                            /********Change password **********/
                            $scope.openChangePwdDialog = function(){
                                $mdDialog.show({
                                    controller: changePwdDialogController,
                                    templateUrl: 'views/templates/change-pwd-dialog.html',
                                    parent: angular.element(document.body),
                                    targetEvent: null,
                                    clickOutsideToClose:false
                                })
                            };

                            function changePwdDialogController($scope) {


                                $scope.hide = function () {
                                    $mdDialog.hide();
                                };
                                $scope.cancel = function () {
                                    $mdDialog.cancel();
                                };
                                $scope.answer = function (answer) {
                                    $mdDialog.hide(answer);
                                };

                                $scope.isChaning = false;
                                // Change Password
                                $scope.pwdData = {
                                    newPassword:'',
                                    oldPassword:''
                                };
                                $scope.isChaning = false;
                                $scope.changePwd = function(){
                                    if($scope.changePwdForm.$valid){
                                        $scope.isChaning = true;
                                        dalockrServices.updateUserDetails(userServices.currentUser().id, $scope.pwdData, function(data){

                                            toastr.success('Change success','Success');
                                            $scope.isChaning = false;
                                            $mdDialog.hide();

                                        },function(error){
                                            toastr.error('Change error','Error');
                                            $scope.isChaning = false;
                                        });
                                    }
                                }
                            }

                        }
                    }



                    scope.openSharingRuleDialog = function(){
                        $location.path('/profile/sharingrules');
                    };



                    scope.openFollowingDialog = function(){

                        $mdDialog.show({
                            controller: followingDialogController,
                            templateUrl: 'views/templates/following-list-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: null,
                            clickOutsideToClose:false,
                            fullscreen:true
                        });


                        function followingDialogController($scope) {

                            $scope.hide = function () {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                            $scope.answer = function (answer) {
                                $mdDialog.hide(answer);
                            };

                            function getUserFollows(){
                                $scope.isLoading = true;
                                $scope.loadError = false;

                                dalockrServices.getUserFollowers(function(data){
                                    $scope.followers = data;
                                },function(error){

                                });
                                dalockrServices.getUserFollowings(function(data){
                                    $scope.isLoading = false;
                                    $scope.followings = data;
                                    //console.log(data);
                                    angular.forEach($scope.followings,function(value,key){
                                        if(value.lockr){
                                            value.thumbnail = dalockrServices.getThumbnailUrl('lockr',value.lockr.id);
                                            value.name = value.lockr.name;
                                        }else if(value.user){
                                            value.thumbnail = dalockrServices.getUserAvatar(value.user.clusterId, value.user.id);
                                            value.name = value.user.name;
                                        } else if(value.asset){
                                            value.thumbnail = dalockrServices.getThumbnailUrl('asset',value.asset.id);
                                            value.name = value.asset.name;
                                        }
                                    });
                                },function(){
                                    $scope.isLoading = false;
                                    $scope.loadError = true;
                                });
                            }
                            getUserFollows();
                            $scope.deleteFollowing = function (follow) {
                                dalockrServices.deleteUserFollows(follow.id, function (data) {
                                    if(data){
                                        toastr.success('delete following','Success');
                                    }
                                }, function (error) {
                                    if(error && error.status === 404){
                                        toastr.error('Not Found', 'Error');
                                    }
                                });
                                getUserFollows();
                            };
                        }
                    };


                    scope.$on('updateUserInfoSuccess', function () {
                        userServices.getUserProfileInfo(function (userInfo) {
                            assignUserInfo(userInfo);
                            scope.userOriginAvatar = dalockrServices.getUserAvatar(userInfo.clusterId, userInfo.username);
                        },true);
                    });



                    accountsWatcher = scope.$watch(function () {
                        return commonServices.accounts();
                    }, function (newVal) {
                        if(userRightServices.getUserRoles()){
                            scope.isIntegrator =  userRightServices.getUserRoles().INTEGRATOR;
                        }
                        scope.Cluster = newVal;
                        angular.forEach(scope.Cluster,function(val,ind){
                            if(val.active){
                                scope.ClusterAccount.show = val.name;
                            }
                        });
                        scope.accounts = newVal;
                        angular.forEach(newVal, function (v) {
                            if(v.active){
                                scope.account = v;
                            }
                        });
                        if( scope.accounts && !scope.account){
                            angular.forEach(newVal,function(val){
                                if(val.accountId == $location.search().aid){
                                    scope.account = val;
                                }
                            })

                        }
                    },true);

                    function loadAccounts(){
                        //dalockrServices.getClustersLockr()
                        //    .then(function(response){
                        //
                        //        var result = response.data;
                        //        //if(result.length === 0) return;
                        //        for (var i = 0; i < result.length; i++) {
                        //            var obj = result[i];
                        //            obj.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',obj.id);
                        //            (function(obj){
                        //                userServices.getUserProfileInfo(function(userinfo){
                        //                    if (userinfo) {
                        //                        obj.isManager = userRightServices.isAccountManager(obj.accountId);
                        //                    }
                        //                });
                        //            })(obj);
                        //
                        //        }
                        //        scope.accountsData = $filter('orderBy')(result, 'dateCreated',true);
                        //        commonServices.saveAccounts(scope.accountsData);
                        //
                        //    },function(){
                        //
                        //    });
                    }

                    scope.$on('$destroy', function () {
                        accountsWatcher();
                    });
                    scope.changeAccount = function (ev) {
                        changeAccountService.show(ev);
                    };




                    scope.changeAvatar = function () {




                        //$mdDialog.show({
                        //    controller: changeAvatarDialogController,
                        //    templateUrl: 'views/templates/change-avatar-dialog.html',
                        //    parent: angular.element(document.body),
                        //    targetEvent: null,
                        //    clickOutsideToClose:false
                        //});
                        //
                        //
                        //function changeAvatarDialogController($scope){
                        //    $scope.hide = function () {
                        //        $mdDialog.hide();
                        //    };
                        //    $scope.cancel = function () {
                        //        $mdDialog.cancel();
                        //    };
                        //    $scope.answer = function (answer) {
                        //        $mdDialog.hide(answer);
                        //    };
                        //
                        //
                        //
                        //
                        //}

                    };

                    scope.enterAccountDetails = function (acc) {
                        accountInfoManager.show({aId:acc.accountId,isManager:acc.isManager,aDet:acc});
                    };
                    scope.closeSlideBar = function(){
                        scope.$broadcast('$$openSliderMenu');
                    };

                    scope.logout = function(){

                        var bodyElem = angular.element('body');
                        var maskElem = $compile(angular.element('<body-loading-mask></body-loading-mask>'))(scope);

                        bodyElem.append(maskElem);
                        dalockrServices.logOff();
                            //.then(function(){

                            //maskElem.remove();
                            //$location.path('/logout');

                        //},function(){
                        //    maskElem.remove();
                        //    toastr.error('Log off failed, Please retry','Error');
                        //});
                    };



                }
            };
        }]);