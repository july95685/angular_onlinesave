/**
 * Created by panma on 7/19/15.
 */
angular.module('dalockrAppV2App')
    .directive('lockrDetailsFixedMenu', [
        '$rootScope',
        '$mdDialog',
        'appConfig',
        'Upload',
        '$sessionStorage',
        'toastr',
        '$document',
        'dalockrServices',
        'commonServices',
        '$timeout',
        '$q',
        'userServices',
        'userRightServices',
        'textAngularManager',
        '$location',
        '$compile',
        '$dalMedia',
        'lockrfixedmenu',
        'addEditLockrManager',
        function($rootScope,$mdDialog,appConfig,Upload,$sessionStorage,toastr,$document,dalockrServices,commonServices,$timeout,$q,userServices,userRightServices,textAngularManager,$location,$compile,$dalMedia,lockrfixedmenu,addEditLockrManager) {

            return {
                restrict: 'E',
                // templateUrl: 'views/directives/lockr-details-fixed-menu.html',
                templateUrl:function(){
                    // if($rootScope.mobileDevice){
                    //     return 'views/directives/mobile-lockr-details-fixed-menu.html';
                    // }
                    return 'views/directives/lockr-details-fixed-menu.html';
                },
                scope:{
                    currentLockrDetails:'=',
                    currentLockrId:'=',
                    isLockr:'@',
                    pathLevel:'@',
                    accountsData:'='
                },
                replace:true,
                link: function(scope,element){
                    scope.$on('openFilterItemBack',function(){
                        scope.openFilterBackground = true;
                    });
                    scope.$on('DcloseFilterItemBack',function(){
                        scope.openFilterBackground = false;
                        $rootScope.$broadcast('closeFilterItemBack');
                    });
                    scope.closeFilterBackground = function(){
                        scope.openFilterBackground = false;
                        $rootScope.$broadcast('closeFilterItemBack');
                    };

                    scope.mobileDevice = $dalMedia('xs');
                    scope.isManager = '';
                    userServices.getUserProfileInfo(function () {
                        scope.canShareLockr = userRightServices.getUserRoles().CAN_SHARE_LOCKR;
                    });
                    scope.$watch('accountsData', function(newVal) {
                        if(newVal) {
                            angular.forEach(newVal, function (val, ind) {
                                if (val.active) {
                                    scope.isManager = userRightServices.isAccountManager(val.accountId);
                                }
                            });
                        }else{
                            scope.isManager = true;
                        }
                    });
                    //
                    //scope.$watch(function() {
                    //    return $dalMedia('xs');
                    //}, function(val) {
                    //    if(val){
                    //        element.css({top:'auto',bottom:'40px'});
                    //
                    //    } else {
                    //        element.css({top:'80px',bottom:'auto'});
                    //    }
                    //});


                    var menuIsDisplay = false;
                    var documentElem = angular.element(document);

                    element.on('click',function(event){
                        event.stopPropagation();
                        return false;
                    });

                    scope.$on('change-account',function(e,value){
                        if(value){
                            scope.currentLockrDetails = value;
                            scope.currentLockrId = value.id;
                        }
                    });
                    scope.$on('$$LockrPower', function (ev, data) {
                        scope.noContentManager = !data.iscontent;
                    });

                    //scope.$watch('currentLockrId',function(){
                    //    userServices.getUserProfileInfo(function () {
                    //        scope.canShare = userRightServices.isContentManager(scope.currentLockrId);
                    //        scope.canAssignLockr = userRightServices.isContentManager(scope.currentLockrId) && createRouteReg('sublockr').test($location.path());
                    //    });
                    //});




                    function createRouteReg(name){
                        return new RegExp('^\/' + name + '(\/(?:([^\/]+)))?$');
                    }


                    scope.openAddArticleDialog = function(ev){
                        closeFixMenu();
                        $mdDialog.show({
                            controller: addArticleController,
                            templateUrl: 'views/templates/add-article-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });
                    };



                    function addArticleController($scope,toastr,$mdDialog){

                        $timeout(function() {
                            var editorScope = textAngularManager.retrieveEditor('articleEditor').scope;
                            editorScope.displayElements.text.trigger('focus');
                        }, 0, false);


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

                        $scope.buttonText = 'ADD ARTICLE';
                        $scope.noSelectFile = true;


                        $scope.newArticle = {};
                        $scope.newArticle.articleText = '';



                        $scope.$watch('headlineImage', function (newVal, oldVal) {
                            if (newVal !== oldVal && newVal !== null) {
                                $scope.noSelectFile = false;
                                $scope.fileName = $scope.headlineImage.name;
                            }
                        });

                        $scope.loadingInProgress = false;
                        $scope.submitted = false;

                        $scope.uploadArticle = function(){

                            $scope.determinateValue = 0;
                            $scope.submitted = true;

                            //if($scope.noSelectFile){
                            //    return;
                            //}

                            if($scope.upload_article_form.$valid){

                                $scope.loadingInProgress = true;
                                $scope.newArticle.lockrId = scope.currentLockrId;

                                var assetData = $scope.newArticle;
                                Upload.upload({
                                    url: appConfig.API_SERVER_ADDRESS + '/api/article?'+'token=' + authToken, //upload.php script, node.js route, or servlet url
                                    method: 'POST',
                                    fields:assetData,
                                    file: $scope.headlineImage,
                                    formDataAppender: function(fd, key, val){
                                        if (angular.isArray(val)) {
                                            angular.forEach(val, function(v) {
                                                if(v === null){
                                                    v = " ";
                                                }
                                                fd.append(key, v);
                                            });
                                        } else {
                                            if(val === null){
                                                val = " ";
                                            }
                                            fd.append(key, val);
                                        }
                                    }
                                }).progress(function(evt) {
                                    $scope.determinateValue = parseInt(100.0 * evt.loaded / evt.total);
                                }).success(function(data, status, headers, config) {        // file is uploaded successfully
                                    $rootScope.$broadcast('updateLockrDetails',true);
                                    toastr.success('Article has been created','Success');
                                }).error(function(data,status){
                                    $scope.loadingInProgress = false;
                                    toastr.error(data.message,'Error');
                                })
                                    .xhr(function(xhr){

                                    });
                            }else{
                                //console.log('form error');
                            }
                        };
                    }


                    /***************Add Asset************/
                    scope.openAddAssetDialog = function(){
                        closeFixMenu();
                        if(scope.mobileDevice){
                            commonServices.requestAssetResource(function (ev) {
                                scope.previewResource = ev;
                                showAddAssetView();
                            });
                        } else {
                            showAddAssetView();
                        }

                    };

                    function showAddAssetView(){
                        angular.element('body').append($compile(angular.element('<add-asset-view path-level="{{pathLevel}}" preview-resource="previewResource" lockr-name="currentLockrDetails.name" lockr-id="currentLockrId"></add-asset-view>'))(scope));
                    }






                    scope.ismenuopen = false;
                    scope.mobilemenubutton = true;
                    scope.$on('showmenubutton',function(){
                        scope.mobilemenubutton = true;
                    });
                    scope.$on('hidemenubutton',function(){
                        scope.mobilemenubutton = false;
                    });
                    scope.$on('sildehidemenubutton',function(){
                        scope.sildemenu = true;
                        scope.mobilemenubutton = false;
                    });
                    scope.showDropMenu = function(){


                        //if(scope.mobileDevice){
                        //    scope.hideFabButton = true;
                        //    lockrfixedmenu.open(scope.pathLevel,function (data) {

                        //        scope.hideFabButton = false;
                        //    });
                        //    return;
                        //}


                        // lockrfixedmenu.open();

                        scope.ismenuopen = !scope.ismenuopen;

                        if(scope.isBatchHandle && menuIsDisplay){
                            $rootScope.$broadcast('batchHandle',{name:'clickAddBtn'});
                            if(menuIsDisplay){
                                element.find('.dropdown-fixed-menu').slideUp('fast');
                            }
                            menuIsDisplay = false;
                            return;
                        }

                        scope.isBatchHandle = false;
                        if( !menuIsDisplay ) {
                            element.find('.dropdown-fixed-menu').slideDown('fast');
                            documentElem.on(scope.mobileDevice ? 'touchend' : 'click',closefixedMenu);
                            $rootScope.$broadcast('openFixedMenu', true);
                        } else {
                            $rootScope.$broadcast('openFixedMenu', false);
                            element.find('.dropdown-fixed-menu').slideUp('fast');
                        }
                        menuIsDisplay = !menuIsDisplay;
                    };


                    scope.selectOperate = function (ev) {
                        switch (Number(ev.target.dataset.index)){
                            case 0:
                                scope.openAddAssetDialog(ev);
                                break;
                            case 1:
                                scope.openAddArticleDialog(ev);
                                break;
                            case 2:
                                scope.openCreateSubLockrDialog();
                                break;
                            case 3:
                                scope.notifyOpenAddSafeLockrDialog(ev);
                                break;
                        }
                        closefixedMenu();
                    };


                    function closefixedMenu(event){
                        scope.ismenuopen =  false;
                        if(menuIsDisplay && !scope.isBatchHandle){
                            scope.$apply(function(){
                                $rootScope.$broadcast('openFixedMenu', false);
                                element.find('.dropdown-fixed-menu').slideUp('fast');
                                menuIsDisplay = false;
                                //$rootScope.$broadcast('checkEmptyPri');
                            });
                        }

                    }


                    scope.$on('add-lockr',function(ev,defer){
                        scope.openCreateSubLockrDialog(defer);
                    });

                    scope.$on('issublockr', function (ev,data) {
                        scope.issublockr = data;
                    });


                    scope.$on('haveSelectedOneItem',function(event,value){

                        if(value){
                            scope.isBatchHandle = true;

                            if(!menuIsDisplay){
                                element.find('.dropdown-fixed-menu').slideDown('fast');
                            }
                            menuIsDisplay = true;

                        } else {

                            if(menuIsDisplay){
                                element.find('.dropdown-fixed-menu').slideUp('fast');
                            }
                            menuIsDisplay = false;


                        }
                    });

                    scope.batchHandle = function (ev,handleName){
                        $rootScope.$broadcast('batchHandle',{name:handleName,event:ev});
                    };



                    scope.$on('$$openAssignLockrDialog', function () {
                        scope.openAssignLockrDialog(null);
                    });

                    scope.$on('$$openManagePpDialog', function () {
                        scope.openManagePublishingPointDialog(null);
                    });


                    scope.openManagePublishingPointDialog = function () {
                        $mdDialog.show({
                            controller: managePpController,
                            templateUrl: 'views/templates/manage-pp-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: null,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });
                        function managePpController($scope){
                            $scope.answer = function(answer) {
                                $mdDialog.hide(answer);
                            };
                            $scope.layoutParams = {};

                            if(scope.currentLockrDetails.layoutParams && scope.currentLockrDetails.layoutParams.bannerActive){
                                $scope.layoutParams.bannerActive = scope.currentLockrDetails.layoutParams.bannerActive === 'Yes';
                            } else {
                                $scope.layoutParams = {bannerActive:false};
                            }



                            $scope.changeModel = function () {
                                if($scope.layoutParams.bannerActive){
                                    activeBanner();
                                } else {
                                    deactivateBanner();
                                }
                            };
                            function activeBanner(){
                                dalockrServices.changePPLayout(scope.currentLockrId,'bannerActive','Yes').then(function(data){
                                    toastr.success('Active');
                                });
                            }
                            function deactivateBanner(){
                                dalockrServices.changePPLayout(scope.currentLockrId,'bannerActive','No').then(function(data){
                                    //console.log(data);
                                    toastr.success('Deactivate');
                                });
                            }

                        }

                    };

                    scope.openAssignLockrDialog = function(ev){
                        closeFixMenu();
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
                                    }).catch(function(error){
                                    $scope.loadingInProgress = false;
                                    toastr.error(error.data.message,'Error');
                                });

                            }

                        }


                    };

                    scope.$on('shareLockr',function(){
                        scope.openShareLockrDialog();
                    });




                    /********** Lockr Share **********/
                    scope.openShareLockrDialog = function(ev){
                        closeFixMenu();
                        $mdDialog.show({
                            controller: shareLockrController,
                            templateUrl: 'views/templates/share-lockr-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')

                        });

                    };

                    function shareLockrController($scope,toastr,$mdDialog){


                        $scope.socialChannels = [];
                        $scope.loadingSocialChannels = true;
                        $scope.noSocialChannels = false;
                        $scope.isScheduling = false;
                        $scope.shareDate = new Date();



                        dalockrServices.getShareSocialChannelWithCache(function (results) {
                            $scope.loadingSocialChannels = false;
                            $scope.socialChannels = results.map(function (val) {
                                val.active = false;
                                val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                return val;
                            });
                            if($scope.socialChannels.length === 0){
                                $scope.noSocialChannels = true;
                            }
                        });


                        //if(commonServices.socialChannels === null){
                        //
                        //    dalockrServices.getShareSocialChannel()
                        //        .then(function(response){
                        //            var data = response.data;
                        //            //console.log('share channel...');
                        //            //console.log(data);
                        //            angular.forEach(data,function(value,key) {
                        //
                        //                var channelType = value.socialChannelType.toLowerCase();
                        //
                        //                if (channelType === 'facebook') {
                        //                    value.bgClass='facebook-bg-color';
                        //                    value.iconClass = 'mdi-facebook';
                        //                    $scope.socialChannels.push(value);
                        //                }
                        //                if (channelType === 'twitter') {
                        //                    value.bgClass='twitter-bg-color';
                        //                    value.iconClass = 'mdi-twitter';
                        //                    $scope.socialChannels.push(value);
                        //                }
                        //                if (channelType === 'youtube') {
                        //                    value.bgClass='youtube-bg-color';
                        //                    value.iconClass = 'mdi-youtube-play';
                        //                    $scope.socialChannels.push(value);
                        //                }
                        //                if (channelType === 'google') {
                        //                    value.bgClass='google-bg-color';
                        //                    value.iconClass = 'mdi-google';
                        //                    $scope.socialChannels.push(value);
                        //                }
                        //                if (channelType === 'linkedin') {
                        //                    value.bgClass='linkedin-bg-color';
                        //                    value.iconClass = 'mdi-linkedin';
                        //                    $scope.socialChannels.push(value);
                        //                }
                        //                if (channelType === 'evernote') {
                        //                    value.bgClass='evernote-bg-color';
                        //                    value.iconClass = 'mdi-evernote';
                        //                    $scope.socialChannels.push(value);
                        //                }
                        //                if (channelType === 'pinterest') {
                        //                    value.bgClass='pinterest-bg-color';
                        //                    value.iconClass = 'mdi-pinterest';
                        //                    $scope.socialChannels.push(value);
                        //                }
                        //            });
                        //            commonServices.socialChannels = $scope.socialChannels;
                        //            $scope.loadingSocialChannels = false;
                        //
                        //            if($scope.socialChannels.length === 0){
                        //                $scope.noSocialChannels = true;
                        //            }
                        //        },function(error){
                        //            $scope.loadingSocialChannels = false;
                        //
                        //        });
                        //
                        //} else {
                        //    $scope.socialChannels = commonServices.socialChannels;
                        //    $scope.loadingSocialChannels = false;
                        //
                        //    if($scope.socialChannels.length === 0){
                        //        $scope.noSocialChannels = true;
                        //    }
                        //}


                        var haveSelectedChannels = [];
                        $scope.selectShareSocialChannels = function(id){

                            var len  = haveSelectedChannels.length;

                            if(len === 0){
                                angular.element('#social-' + id).addClass('social-grid-selected');
                                haveSelectedChannels.push(id);
                            } else {

                                var isSave = false;
                                for(var i=0; i<len; i++){
                                    if(haveSelectedChannels[i] === id){
                                        haveSelectedChannels.splice(i,1);
                                        angular.element('#social-' + id).removeClass('social-grid-selected');
                                        isSave = true;
                                    }
                                }
                                if(!isSave){
                                    angular.element('#social-' + id).addClass('social-grid-selected');
                                    haveSelectedChannels.push(id);
                                }

                            }

                        };



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
                        $scope.shareLockr = function(){

                            $scope.submitted = true;

                            if($scope.share_lockr_form.$valid){

                                $scope.shareEntity.channels = haveSelectedChannels;
                                $scope.loadingInProgress = true;

                                if($scope.isScheduling){ //定时Share
                                    var httpBody = angular.extend($scope.shareEntity,{"shareByDate":$scope.shareDate.toISOString()});
                                    dalockrServices.scheduleShareEventForAssetOrLockr('lockr',scope.currentLockrId,httpBody).then(function (res) {
                                        toastr.success(res.data.message);
                                        $mdDialog.hide();
                                    }).catch(function (error) {
                                        if(error && error.message){
                                            toastr.error(error.message);
                                        }
                                        $scope.loadingInProgress = false;
                                    });

                                } else {

                                    dalockrServices.shareLockr(scope.currentLockrId, $scope.shareEntity, function (data) {
                                        toastr.success(data.message);
                                        $mdDialog.hide();
                                    }, function (error) {
                                        if(error && error.responseText){
                                            toastr.error(JSON.parse(error.responseText).message);
                                        }
                                        $scope.loadingInProgress = false;
                                    });
                                }


                            }

                        };

                    }



                    /********* Invite User ************/
                    scope.$on('$$InviteUser', function (e) {
                        scope.openCurrentLockrInviteUser(null);
                    });

                    scope.openCurrentLockrInviteUser = function(ev){
                        scope.inviteLockrId = scope.currentLockrId;
                        scope.inviteUserLockrName = scope.currentLockrDetails.name;
                        scope.openInviteUserDialog(ev);
                    };

                

                    scope.openInviteUserDialog = function(ev){

                        closeFixMenu();

                        $mdDialog.show({
                            controller: inviteUserController,
                            templateUrl: 'views/templates/invite-user-dialog.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });



                    };
                    function inviteUserController($scope){
                        $scope.inviteeslength = 0;
                        $scope.allTwitterContactsData = '';
                        var twitterSearchBox  = [];
                        $scope.inviteUserData = {
                            email:'',
                            twitter:[],
                            searchtwitter:''
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
                        $scope.$watch('inviteUserData.searchtwitter',function(newVal,oldVal){
                            if(newVal!= oldVal){
                                if(newVal){
                                    twitterSearchBox = [];
                                    angular.forEach($scope.allTwitterContactsData,function(val){
                                        if(val.name.search(newVal) > -1){
                                            twitterSearchBox.push(val);
                                        }
                                    });
                                    $scope.twitterContactsData = twitterSearchBox;
                                }else{
                                    angular.forEach($scope.allTwitterContactsData,function(val){
                                        $scope.twitterContactsData.push(val);
                                    });
                                }
                            }
                        });

                        $scope.InvitechooseTwitter = function(){
                            $scope.showTwitterList = true;
                            $scope.loadingInProgress =true;
                            dalockrServices.getSocialFriends().then(function(data){
                                $scope.twitterContactsData = data;
                                $scope.allTwitterContactsData = data;
                                $scope.loadingInProgress = false;
                            },function(error){
                                $scope.loadingInProgress = false;
                                console.log('error');
                            })
                        };
                        $scope.InvitechooseFb = function(){
                            dalockrServices.getLockrInviteLink(scope.inviteLockrId)
                                .then(function(response){
                                    window.location.replace("https://www.facebook.com/dialog/send?" +
                                        "app_id=574992532543841" +
                                        "&link=" + response.data.link +
                                        "&redirect_uri=https://www.bancsabadell.com/cs/Satellite/SabAtl/"
                                    );

                                    $.ajaxSetup({ cache: true });
                                    $.getScript('//connect.facebook.net/en_US/sdk.js', function() {
                                        FB.init({
                                            appId: '574992532543841', // <-- v2 FB app id, should be received from the backend in the future but hardcode for now
                                            status: true,
                                            xfbml: true,
                                            version: 'v2.8'
                                        });
                                        FB.ui({
                                            method: 'send',
                                            link: response.data.link // <-- The link from the new service
                                        });
                                    });
                                },function(error){
                                    $scope.loadLinkError = true;
                                });

                        };
                        $scope.backToInviteUser = function(){
                            $scope.showTwitterList = false;
                        };
                        $scope.existsThisTwitter = function(item){
                            return $scope.inviteUserData.twitter.indexOf(item) > -1;
                        };
                        $scope.existsAllTwitter = function(){
                            if($scope.inviteUserData.twitter.length){
                            return $scope.inviteUserData.twitter.length === $scope.twitterContactsData.length;}
                            else {
                                return false;
                            }
                        };
                        $scope.isIndeterminate = function() {
                            return ($scope.inviteUserData.twitter.length !== 0 &&
                            $scope.inviteUserData.twitter.length !== $scope.twitterContactsData.length);
                        };
                        $scope.chooseTwitterUser = function(item){
                            var idx = $scope.inviteUserData.twitter.indexOf(item);
                            if(idx > -1){
                                $scope.inviteUserData.twitter.splice(idx,1);
                            }else {
                                $scope.inviteUserData.twitter.push(item);
                            }
                        };
                        $scope.chooseAllTwitterUser = function(){
                            if($scope.inviteUserData.twitter.length == $scope.twitterContactsData.length){
                                $scope.inviteUserData.twitter = [];
                            }else{
                                //$scope.inviteUserData.twitter =  $scope.twitterContactsData;
                                $scope.inviteUserData.twitter = [];
                                angular.forEach($scope.twitterContactsData,function(val){
                                    $scope.inviteUserData.twitter.push(val);
                                });
                            }
                        };
                        $scope.postInvite = function(){
                            if($scope.inviteUserData.email){
                                dalockrServices.inviteNewUser(scope.inviteLockrId,$scope.inviteUserData.email,null)
                                    .then(function(response){
                                        toastr.success(response.data.message,'Success');
                                        $rootScope.$broadcast('privateLockrInviteSuc');
                                        $mdDialog.hide();
                                    },function(error){
                                        toastr.error(error.data.message,'Error');
                                        $scope.loadingInProgress = false;
                                    });
                            }else if($scope.inviteUserData.twitter){
                                angular.forEach($scope.inviteUserData.twitter,function(val){
                                    var socialInviteData = {
                                        "socialInvite": true,
                                        "socialChannelId": val.socialChannel.id
                                    };
                                    dalockrServices.inviteNewUser(scope.inviteLockrId,val.socialIdentifier,socialInviteData)
                                            .then(function(response){
                                                toastr.success(response.data.message,'Success');
                                                $rootScope.$broadcast('privateLockrInviteSuc');
                                                $mdDialog.hide();
                                            },function(error){
                                                toastr.error(error.data.message,'Error');
                                                $scope.loadingInProgress = false;
                                            });
                                });


                            }
                        };


                        $scope.mobileDevice = $dalMedia('xs');
                        $scope.lockrName = scope.inviteUserLockrName;

                        $scope.waitingFb = false;
                        $scope.loadLinkError = false;
                        $scope.emailOrUser = '';
                        $scope.inviteFbUser = function(){
                            //invite facebook user
                            $scope.waitingFb = true;
                            dalockrServices.getLockrInviteLink(scope.inviteLockrId)
                                .then(function(response){
                                    $scope.waitingFb = false;
                                    $.ajaxSetup({ cache: true });
                                    $.getScript('//connect.facebook.net/en_US/sdk.js', function() {
                                        FB.init({
                                            appId: '574992532543841', // <-- v2 FB app id, should be received from the backend in the future but hardcode for now
                                            xfbml: true,
                                            version: 'v2.8'
                                        });
                                        FB.ui({
                                            method: 'send',
                                            link: response.data.link // <-- The link from the new service
                                        });
                                    });
                                },function(error){
                                    $scope.waitingFb = false;
                                    $scope.loadLinkError = true;
                                });
                        };






                        $scope.inviteInfo = '';
                        $scope.loadingInProgress = false;

                        // $scope.$watch('emailOrUser',function(newval){
                        //     console.log(newval);
                        // });

                        $scope.inviteUser = function(value){
                            $scope.loadingInProgress = true;
                            if(value.emailOrUser){
                                dalockrServices.inviteNewUser(scope.inviteLockrId,value.emailOrUser,null)
                                    .then(function(response){
                                        toastr.success(response.data.message,'Success');
                                        $mdDialog.hide();
                                    },function(error){
                                        toastr.error(error.data.message,'Error');
                                        $scope.loadingInProgress = false;
                                    });
                            }
                            else if(value.socialInviteId !== null){
                                var socialInviteData = {
                                    "socialInvite": true,
                                    "socialChannelId": value.socialInviteId
                                };
                                dalockrServices.inviteNewUser(scope.inviteLockrId,value.userNameOrMail,socialInviteData)
                                    .then(function(response){
                                        toastr.success(response.data.message,'Success');
                                        $mdDialog.hide();
                                    },function(error){
                                        toastr.error(error.data.message,'Error');
                                        $scope.loadingInProgress = false;
                                    });

                            } else {
                                dalockrServices.inviteNewUser(scope.inviteLockrId,value.userNameOrMail,null)
                                    .then(function(response){
                                        toastr.success(response.data.message,'Success');
                                        $mdDialog.hide();
                                    },function(error){
                                        toastr.error(error.data.message,'Error');
                                        $scope.loadingInProgress = false;
                                    });

                            }
                        };


                    }


                    /*****Create subLockr *******/

                    scope.openCreateSubLockrDialog = function(defer){
                        closeFixMenu();

                        //创建Lockr defer能够回调创建后的lockr数据
                        addEditLockrManager.add(scope.currentLockrId,defer);


                    };







                    /********* create channals **********/
                    scope.openCreateChannalsDialog = function(ev){

                        closeFixMenu();
                        scope.channelType = ["All","Image","Video","PDF"];
                        $mdDialog.show({
                            controller: createChannalsController,
                            templateUrl: 'views/templates/add-channels-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });



                        function createChannalsController($scope){
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
                            $scope.accountid = $location.search().aid;
                            $scope.createChannals = function(){

                                $scope.submitted = true;

                                if($scope.create_channals_form.$valid){
                                    $scope.loadingInProgress = true;

                                    var normalData = {
                                        'name':$scope.channalsEntity.name,
                                        'description':$scope.channalsEntity.description,
                                        'channelType': $scope.type,
                                        'accountId':$scope.accountid
                                    };

                                    dalockrServices.createNewChannel(normalData).success(function(data){
                                        if(data.lockr){
                                            $rootScope.$broadcast('updateChannals',data.lockr);
                                        }
                                        $scope.loadingInProgress = false;
                                        $mdDialog.cancel();
                                    }).error(function(error){
                                        $scope.loadingInProgress = false;
                                        if(error.message){
                                            toastr.error(error.message);
                                        }
                                    });


                                } else {
                                    angular.element("input[name='title']").focus();
                                }


                            };

                        }


                    }




                    /********* Share User **********/
                    scope.openShareWithUserDialog = function(ev){

                        closeFixMenu();

                        $mdDialog.show({
                            controller: shareWithAnotherUserController,
                            templateUrl: 'views/templates/share-another-user-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });


                        function shareWithAnotherUserController($scope){
                            $scope.hide = function() {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function() {
                                $mdDialog.cancel();
                            };
                            $scope.answer = function(answer) {
                                $mdDialog.hide(answer);
                            };

                            $scope.inviteInfo = '';
                            $scope.loadingInProgress = false;

                            $scope.shareUser = function(value){

                                $scope.loadingInProgress = true;

                                if(value.socialInviteId !== null){
                                    var socialInviteData = {
                                        "socialInvite": true,
                                        "socialChannelId": value.socialInviteId
                                    };

                                    dalockrServices.shareNewUser(scope.currentLockrId,value.userNameOrMail,socialInviteData)
                                        .then(function(response){
                                            toastr.success(response.data.message,'Success');
                                            $mdDialog.hide();
                                        },function(error){
                                            toastr.error(error.data.message,'Error');
                                            $scope.loadingInProgress = false;
                                        });

                                } else {

                                    dalockrServices.shareNewUser(scope.currentLockrId,value.userNameOrMail,null)
                                        .then(function(response){
                                            toastr.success(response.data.message,'Success');
                                            $mdDialog.hide();
                                        },function(error){
                                            toastr.error(error.data.message,'Error');
                                            $scope.loadingInProgress = false;
                                        });

                                }
                            };

                        }

                    };


                    scope.$on('mobileToPreview',previewLockr);
                    scope.previewLockr = previewLockr;


                    /**
                     * 进入PP预览Lockr
                     */
                    function previewLockr(){

                        var previewUrl = appConfig.API_SERVER_ADDRESS + '/publishing-point/#/m/lockr/' + commonServices.getDefaultTrackingId(scope.currentLockrDetails.links) + '?clusterId=' + scope.currentLockrDetails.cluster.id;
                        window.open(previewUrl);
                    }




                    scope.notifyOpenAddCloudServiceLockrDialog = function(ev){
                        closeFixMenu();
                        //documentElem.off('click');

                        $rootScope.$broadcast('addCloudServiceLockrNotification',ev);
                    };

                    scope.notifyOpenAddSafeLockrDialog = function(ev){
                        closeFixMenu();
                        $rootScope.$broadcast('addSafeLockrNotification',ev);
                    };

                    function closeFixMenu(){
                        $rootScope.$broadcast('openFixedMenu', false);
                        element.find('.dropdown-fixed-menu').slideUp('fast');
                        menuIsDisplay = false;
                    }



                }
            };
        }])
    .directive('dalFabButton',['$timeout',function ($timeout) {



        return {
            restrict:'E',
            templateUrl:'views/mobile/mobile-details-fixed-menu.html',
            replace:true,
            scope:{
                showDropMenu:'&',
                isMenuOpen:'=',
                isManager:'=',
                selectOperate:'&'
            },
            controller: function ($scope) {
                $scope.openMenu = function () {
                    $scope.showDropMenu && $scope.showDropMenu();
                };
                $scope.$on('openDetailsFixedMenu',function(){
                    $scope.openMenu();
                });
            },
            link: function (scope,element) {



                var bgEl = element.find('.fb-background'),
                    fabEl = element.find('.md-fab'),
                    actionEl = element.find('.fab-actions');

                scope.selectOp = function (ev) {
                    if(angular.isDefined(ev.target.dataset.index)){
                        scope.selectOperate({ev:ev});
                    }
                };

                scope.$watch('isMenuOpen', function (newVal,oldVal) {
                    if(newVal !== oldVal){
                        if(newVal){
                            element.css({
                                width:'100%'
                            });
                            bgEl.addClass('active');

                            fabEl.animate({
                                opacity:0,
                                zIndex:3
                            },100,null, function () {
                                actionEl.animate({
                                    opacity:1,
                                    zIndex:4
                                })
                            },200);

                            //fabEl.addClass('active');

                        } else {
                            bgEl.removeClass('active');
                            //fabEl.removeClass('active');

                            actionEl.animate({
                                opacity:0,
                                zIndex:3
                            },200,null, function () {
                                fabEl.animate({
                                    opacity:1,
                                    zIndex:4
                                })
                            },100);


                            $timeout(function () {
                                element.css({
                                    width:'90px'
                                });
                            },600);
                        }
                    }
                })
            }
        }




    }])
    .controller('autoCompletedCtrl',autoCompletedCtrl);


function autoCompletedCtrl($timeout, $q, $log,dalockrServices) {
    var self = this;
    self.simulateQuery = false;
    self.isDisabled    = false;
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    self.isFindingFriends = true;
    self.message = 'Looking for all friends ... ';
    self.currentText = '';
    self.autoFocus = false;
    self.socialInviteId = null;
    self.emailOrUser = '';


    //self.findMsg = 'No matches found.';
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for repos... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
        var results = query ? self.repos.filter( createFilterFor(query) ) : self.repos,
            deferred;
        if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }
    function searchTextChange(text) {
        //$log.info('Text changed to ' + text);
        self.currentText = text;
        self.socialInviteId = null;
    }
    function selectedItemChange(item) {
        if(item){
            self.currentText = item.socialIdentifier;
            self.socialInviteId = item.socialChannel.id;
        }
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.value.indexOf(lowercaseQuery) === 0);
        };
    }


    dalockrServices.getSocialFriends()
        .then(function(data){

            self.isFindingFriends = false;
            self.message = 'Your friends on Twitter';
            self.repos = loadAll();
            function loadAll() {
                return data.map( function (repo) {
                    repo.value = repo.name.toLowerCase();
                    return repo;
                });
            }
            self.autoFocus = true;

        },function(error){

        });
}