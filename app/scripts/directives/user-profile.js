/**
 * Created by Administrator on 2016/05/18.
 */

angular.module('dalockrAppV2App')
    .directive('userProfile', [
        'dalockrServices','commonServices','toastr','userServices','$mdDialog','appConfig','$rootScope','$q','$dalMedia','cropAndUploadAvatar','userRightServices','dlAlert',
        function(dalockrServices,commonServices,toastr,userServices,$mdDialog,appConfig,$rootScope,$q,$dalMedia,cropAndUploadAvatar,userRightServices,dlAlert) {
        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/mobile/mobile-user-profile.html';
                }
                return 'views/directives/user-profile.html';
            },
            scope:{

            },
            link:function(scope,element){

                scope.userAvatarPreview = null;
                scope.mobileDevice = $dalMedia('xs');
                scope.isLoading = true;
                scope.editSocialChannel = false;
                scope.currentTab = 'profile';
                scope.selectedRemovedList = [];

                scope.currentTabItem = 'info';
                scope.channelUserData = [];
                scope.channelTypesname = 'Facebook';
                scope.channelTypes = [
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

                var accountsWatcher;
                var ruledata = {
                    name:'Facebook'
                };

                scope.mbchangeAvator = function(){
                };
                scope.mbEditUser = function(){
                  scope.EditUser = true;
                };
                scope.$on('getNewChannels',function(ev,val){
                    angular.forEach(scope.socialChannelsData,function(value,ind){
                        if(ind == val.socialChannelType){
                            value.push(val);
                            if(val.socialChannelType == ruledata.name){
                                scope.channelUserData = value;
                            }else{
                                //console.log(scope.socialChannelsData);
                            }
                        }
                    });
                    //scope.$apply()
                });
                scope.switchChannelType = function (rule) {
                    console.log(rule);
                    ruledata = rule;
                    scope.channelUserData = [];
                    angular.forEach(scope.socialChannelsData,function(val,ind){
                        if(ind == rule.name){
                            scope.channelUserData = val;
                        }
                    });
                    scope.channelTypesname = rule.name;
                    angular.forEach(scope.channelTypes,function(val,ind){
                        if(val.name === rule.name){
                            val.active = true;
                        }else{
                            val.active = false;
                        }
                    });
                };
                scope.chooseSocialChannels = function(channel){
                    angular.forEach(scope.socialChannelsData,function(val,ind){
                        if(val === channel){
                            val.remove = !val.remove;
                        }
                    });
                    angular.forEach(scope.channelUserData,function(val,ind){
                        if(val === channel){
                            val.remove = !val.remove;
                        }
                    });
                    if(scope.selectedRemovedList.indexOf(channel.id) == -1){
                    scope.selectedRemovedList.push(channel.id)
                    }else{
                        scope.selectedRemovedList.splice(scope.selectedRemovedList.indexOf(channel.id),1);
                    }
                };

                scope.deleteAccount = function(acc){

                    var confirm = $mdDialog.confirm()
                        .title('Are you sure you want to delete this collaborator ?')
                        .ariaLabel('Lucky day')
                        .ok('OK')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function() {
                        scope.accounts.splice(scope.accounts.indexOf(acc),1);
                        dalockrServices.removeUserFromAccount(acc.accountId,scope.userData.username).success(function(data){
                            toastr.success('Successfully deleted');
                        }).error(function(error){
                            console.log('error');
                        });
                    }, function() {

                    });


                };

                scope.$on('profileDeleteLockr',function(ev,val){
                    var deleteLockrData = '';
                    angular.forEach(scope.userData.enterpriseLockrRoles,function(value,ind){
                        if(value.lockrId == val.lockrId){
                            deleteLockrData = value;
                        }
                    });
                    if(deleteLockrData){
                        scope.userData.enterpriseLockrRoles.splice(scope.userData.enterpriseLockrRoles.indexOf(deleteLockrData),1);
                    }
                });

                scope.openDeleteLockrDialog = function(value){
                        // Appending dialog to document.body to cover sidenav in docs app
                        var confirm = $mdDialog.confirm()
                            .title('Are you sure you want to delete this collaborator ?')
                            .ariaLabel('Lucky day')
                            .ok('OK')
                            .cancel('Cancel');

                        $mdDialog.show(confirm).then(function() {
                            dalockrServices.getLockrUsers(value.lockrId)
                                .then(function(response){
                                    var result = response.data;
                                    angular.forEach(result,function(val){
                                        if(val.username == scope.userData.username){
                                            dalockrServices.deletePermissions(val.entityPermissionId).success(function(data){
                                                toastr.success(data.message);
                                                angular.forEach(scope.userData.enterpriseLockrRoles,function(v){
                                                    if(value.lockrId == v.lockrId){
                                                        scope.userData.enterpriseLockrRoles.splice(scope.userData.enterpriseLockrRoles.indexOf(v),1);
                                                    }
                                                });
                                            }).error(function(error){
                                                toastr.error(error);
                                            });
                                        }
                                    });
                                }).catch(function(error){

                            });
                        }, function() {

                        });

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



                    $scope.deleteData = {
                        deleteAssets:false,
                        socialChannels:false
                    };
                    //dalockrServices.getLockrDetails(scope.currentDeleteLockr.lockrId).success(function(data){
                    //    $scope.currentDeleteLockr = data;
                    //}).error(function(error){
                    //    console.log('error');
                    //});

                    $scope.$watch(function($scope){
                        return $scope.deleteData.deleteAssets;
                    },function(newVal,oldVal){
                        if(newVal === false){
                            $scope.deleteData.socialChannels = false;
                        }
                    });


                    $scope.deleteLockr = function(){

                        $scope.loadingInProgress = true;

                        dalockrServices.deleteLockr(scope.currentDeleteLockr.lockrId,$scope.deleteData.deleteAssets,$scope.deleteData.socialChannels,function(data){
                            toastr.success('Successfully deleted');
                            $scope.loadingInProgress = false;
                            $rootScope.$broadcast('profileDeleteLockr',scope.currentDeleteLockr);
                            $mdDialog.cancel();
                        },function(error){
                            if(error && error.responseText)
                                toastr.error(JSON.parse(error.responseText).message);
                            $scope.loadingInProgress = false;
                            $scope.$apply();
                        });
                    }
                }

                scope.selectTabItem = function(val){
                    scope.currentTabItem = val;
                    if(val === 'info'){

                    }
                    else if(val === 'role'){
                        scope.accounts = commonServices.accounts();
                        scope.isIntegrator =  userRightServices.getUserRoles().INTEGRATOR;
                        angular.forEach(scope.accounts,function(val,ind){
                            val.user.img = dalockrServices.getUserManagerAvatar(val.user.clusterId,val.user.username);
                            //if(!val.isManager) {
                            //    dalockrServices.getAccountUsers(val.accountId).success(function (data) {
                            //        scope.collaborators = data;
                            //
                            //        angular.forEach(data,function(val){
                            //        });
                            //        console.log(data);
                            //    });
                            //}
                        });
                        angular.forEach(scope.userData.enterpriseLockrRoles,function(val,ind){
                            val.img = dalockrServices.getThumbnailUrl('lockr',val.lockrId);

                        });


                    }else if(val === 'channels') {
                        scope.$watch('socialChannelsData',function(newVal){
                            scope.isLoading = true;
                            scope.isLoadingChannel = false;
                            if(newVal){
                                scope.isLoading = false;
                                scope.isLoadingChannel = true;
                                angular.forEach(scope.socialChannelsData,function(val,ind){
                                    if(ind == 'Facebook'){
                                        scope.switchChannelType({iconClass: "mdi-facebook", name: "Facebook"});
                                        scope.channelUserData = val;
                                    }
                                })
                            }else{
                                scope.isLoading = true;
                            }
                        });

                    }
                };
                scope.changePassWord = function(){
                    scope.mbChangePwd = !scope.mbChangePwd;
                };
                scope.closeEditUser = function(){
                    scope.EditUser = false;
                };
                scope.SaveNewPsd = function(){
                    if(scope.mbChangePwdData.newPassword != scope.mbChangePwdData.confirmNewPassword){
                        toastr.error('The passwords you entered must be the same','Error');
                    } else if(!scope.mbChangePwdData.newPassword || !scope.mbChangePwdData.confirmNewPassword || !scope.mbChangePwdData.oldPassword){
                        toastr.error('Password can not be empty','Error');
                    }else{
                        dalockrServices.updateUserDetails(userServices.currentUser().id, scope.mbChangePwdData, function(data){
                                    toastr.success('Change success','Success');
                                    scope.isChaning = false;
                                    $mdDialog.hide();

                                },function(error){
                                    toastr.error('Change error','Error');
                                    scope.isChaning = false;
                                });
                    }
                    //if(scope.changePwdForm.$valid){
                    //    scope.isChaning = true;
                    //    dalockrServices.updateUserDetails(userServices.currentUser().id, scope.pwdData, function(data){
                    //
                    //        toastr.success('Change success','Success');
                    //        scope.isChaning = false;
                    //        $mdDialog.hide();
                    //
                    //    },function(error){
                    //        toastr.error('Change error','Error');
                    //        scope.isChaning = false;
                    //    });
                    //}
                };

                scope.mbChangePwdData = {
                    newPassword:'',
                    oldPassword:'',
                    confirmNewPassword:''
                };


                userServices.getUserProfileInfo(function (userInfo) {
                    if(userInfo){
                        scope.isLoading = false;
                        assignUserInfo(userInfo);
                        getSocialChannel();
                        scope.canManageRules = userRightServices.isContentManager();
                        scope.userAvatarPreview = dalockrServices.getUserAvatar(userInfo.clusterId, userInfo.username);
                    }
                    //scope.$apply();
                },false);

                scope.preventDefaultEvent = function (ev) {
                    ev.stopPropagation();
                };
                scope.removeFbPage = function (item) {
                    item.remove = !item.remove;
                    if(scope.selectedRemovedList.indexOf(item.id) > -1){
                        scope.selectedRemovedList.splice(scope.selectedRemovedList.indexOf(item.id),1);
                    } else {
                        scope.selectedRemovedList.push(item.id);
                    }
                };

                scope.updateSocialChannels = function () {
                    console.log(scope.selectedRemovedList);
                    if(!scope.editSocialChannel){
                        scope.editSocialChannel = true;
                        toastr.warning('You can modify social channels now');
                        return;
                    }
                    if(scope.editSocialChannel && scope.selectedRemovedList.length == 0){
                        toastr.warning('You can modify social channels now');
                    } else {
                        //updateSocialChannel();
                    }
                };


                function assignUserInfo(userInfo) {
                    scope.userData = userInfo;
                    scope.userName = scope.userData.firstName +  ' ' + scope.userData.lastName;
                    scope.userDetailsData = {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        phoneNumber: userInfo.phoneNumber,
                        email: userInfo.primaryEmail,
                        roles: userInfo.roles.join('   ')
                    };
                }

                function assignSocialChannel(data) {
                    var socialChannelsData = {};
                    angular.forEach(data, function(value, key){
                        value.class = commonServices.getIconClassByType(value.socialChannelType);

                        if(value.name.indexOf('-') != -1) {
                            value.name = value.name.split('-')[1];
                        }

                        if(socialChannelsData[value.socialChannelType] === undefined) {
                            socialChannelsData[value.socialChannelType] = [];
                        }
                        var type = value.socialChannelType.toLowerCase();

                        value.remove = false;

                        if(type === 'facebook'){
                            if(value.pageId){
                                value.avatarPic = commonServices.getProfilePicByTypeAndId(type,value.pageId);
                            } else {
                                value.avatarPic = commonServices.getProfilePicByTypeAndId(type,value.facebookId);
                            }
                        } else if(type === 'twitter'){
                            value.avatarPic = commonServices.getProfilePicByTypeAndId(type,value.screenName);
                        }

                        socialChannelsData[value.socialChannelType].push(value);
                    });

                    scope.socialChannelsData = socialChannelsData;

                }

                var authToken = userServices.getAccessToken();

                function getAddSocialChannelUrl(name) {
                    var ru = encodeURIComponent(appConfig.REDIRECT_URL_ADDRESS  + '/redirect.html');
                    if (typeof userServices.currentUser() === 'undefined') {
                        return null;
                    } else {
                        return appConfig.API_SERVER_ADDRESS + '/api/' +userServices.currentUser().clusterId + '/adm/add/social/channel/' + name + '?redirectUri=' + ru +'&token=' + authToken;
                    }
                }


                scope.addFacebookPage = function (item) {
                    dalockrServices.addFacebookPage(item.id,item.channleId).success(function () {
                        commonServices.socialChannels = null;
                        toastr.success('Add success','Success');
                        getSocialChannel();
                        scope.needToAddedPages.splice(scope.needToAddedPages.indexOf(item),1);
                    });
                };

                scope.isUpdating = false;
                scope.updateUser = function(){
                    if(scope.userDetailsData){

                        if(!scope.mobileDevice){
                            updateSocialChannel();
                        }
                        scope.isUpdating = true;
                        dalockrServices.updateUserDetails(userServices.currentUser().id, scope.userDetailsData, function(data){
                            console.log(data);
                            scope.isUpdating = false;
                            scope.EditUser = false;
                            $rootScope.$broadcast('updateUserInfoSuccess');
                            toastr.success('User updated','Success');

                        },function(error){
                            scope.isUpdating = false;
                            toastr.error(error.message,'Error');
                        });
                    }
                    return false;
                };

                function updateSocialChannel(){
                    if(scope.mobileDevice){
                        scope.isUpdating = true;
                    }
                    var deletedList = [];
                    angular.forEach(scope.selectedRemovedList, function (value) {
                        deletedList.push(dalockrServices.deleteASocialChannel(value));
                    });
                    $q.all(deletedList).then(function () {
                        if(deletedList.length){
                            getSocialChannel(); //重新加载
                            scope.editSocialChannel = false;
                            scope.selectedRemovedList = [];
                            toastr.success('Deleted','Success');
                        }
                        if(scope.mobileDevice){
                            scope.isUpdating = false;
                        }
                    });

                }

                scope.openChangePwdDialog = function(){
                    $mdDialog.show({
                        controller: changePwdDialogController,
                        templateUrl: 'views/templates/change-pwd-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    })
                };

                function changePwdDialogController(scope) {
                    scope.hide = function () {
                        $mdDialog.hide();
                    };
                    scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };

                    scope.isChaning = false;
                    // Change Password
                    scope.pwdData = {
                        newPassword:'',
                        oldPassword:''
                    };
                    scope.isChaning = false;
                    scope.changePwd = function(){
                        if(scope.changePwdForm.$valid){
                            scope.isChaning = true;
                            dalockrServices.updateUserDetails(userServices.currentUser().id, scope.pwdData, function(data){

                                toastr.success('Change success','Success');
                                scope.isChaning = false;
                                $mdDialog.hide();

                            },function(error){
                                toastr.error('Change error','Error');
                                scope.isChaning = false;
                            });
                        }
                    }
                }

                scope.switchTabs = function (name) {
                    scope.currentTab = name;
                };




                scope.haveSelectedImage = false;
                var inputAvatar,dropBox;
                var imageFile;
                var options;

                setTimeout(function () {
                    inputAvatar = document.getElementById('profile-upload-avatar-input');
                    dropBox =  element.find('#profile-upload-avatar-area');
                    options =  {
                        readAsDefault: "DataURL",
                        on: {
                            progress: function(e) {
                                console.log(e);
                            },
                            load: function(e) {

                                scope.$apply(function () {
                                    cropAndUploadAvatar.open(e.target.result).then(function (uploaded) {
                                        if(uploaded.success){
                                            scope.haveSelectedImage = true;
                                            scope.userAvatarPreview = uploaded.image;
                                            $rootScope.$broadcast('$$UserAvatarChanged',uploaded.image);
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




                scope.addPicture = function () {
                    inputAvatar.click();
                };





                scope.addSocialChannel = function(name, isFacebook){

                    if(name === 'Facebook' && !isFacebook){

                        if(scope.socialChannelsData.Facebook &&
                            scope.socialChannelsData.Facebook.length){ //如果有数据

                            var facebookAccount = [];
                            var facebookPages = [];

                            angular.forEach(scope.socialChannelsData.Facebook,function (v,k) {

                                if(v.socialChannelType === 'Facebook'){
                                    if(v.username.split('-')[0] === 'FacebookPage'){
                                        facebookPages.push(v);
                                    } else {
                                        facebookAccount.push(v);
                                    }
                                }
                            });


                            if(facebookAccount.length){

                                scope.loadingPage = true;
                                scope.showFacebookPage = true;
                                scope.needToAddedPages = [];

                                var promise = [];
                                var allPages = [];
                                angular.forEach(facebookAccount, function (v2) {
                                    promise.push(dalockrServices.getFacebookPageById(v2.id));
                                });

                                $q.all(promise).then(function (response) {

                                    scope.loadingPage = false;

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

                                    scope.needToAddedPages = needToAddedPages;

                                }).catch(function () {
                                    scope.loadingPage = false;
                                });

                                //是否存在facebook , 如果有则

                                return;
                            }
                        }
                    }

                    if(getAddSocialChannelUrl(name)){

                        var width = 400,
                            height = 400;
                        var iTop = (window.screen.availHeight-30-400)/2;
                        var iLeft = (window.screen.availWidth-10-400)/2;

                        window.open(getAddSocialChannelUrl(name),'addSocialChannel','height='+height+', width='+width+', top='+iTop+',left='+iLeft+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');
                        window.addSuccess = function(){
                            scope.$apply(function(){
                                commonServices.socialChannels = null;
                                toastr.success('Add success','Success');
                                getSocialChannel();
                            });
                        }
                    }
                };



                function getSocialChannel(){

                    scope.socialChannelsData = [];
                    scope.loadingSocialChannels = true;

                    dalockrServices.getAllSocialChannels()
                        .then(function(response){

                            var data = response.data;
                            assignSocialChannel(data);
                            //var socialChannelsData = [];
                            //angular.forEach(data, function(value, key){
                            //    value.class = commonServices.getIconClassByType(value.socialChannelType);
                            //    socialChannelsData.push(value);
                            //});
                            //
                            //scope.socialChannelsData = socialChannelsData;
                            scope.loadingSocialChannels = false;

                        },function(error){
                            scope.loadingSocialChannels = false;
                        });
                }

                scope.deleteSC = function(scId){
                    dalockrServices.deleteASocialChannel(scId, function(data){

                        toastr.success('Delete success','Success');
                        getSocialChannel();

                    }, function(error){
                        toastr.error('Delete error','Error');

                    })
                };


            }
        };
    }]);
