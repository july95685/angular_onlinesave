/**
 * Created by Administrator on 2015/7/17 0017.
 */
angular.module('dalockrAppV2App')
    .directive('dalockrHeader', [
        '$rootScope',
        'commonServices',
        'userServices',
        '$location',
        'userRightServices',
        'dalockrServices',
        '$sessionStorage',
        'appConfig',
        'toastr',
        '$mdDialog',
        'dalockrMessages',
        'notificationCenterService',
        '$compile',
        '$timeout',
        '$mdSidenav',
        '$dalMedia',
        'modalMenuService',
        '$routeParams','$q',
        function($rootScope,commonServices,userServices,$location,userRightServices,dalockrServices,$sessionStorage,appConfig,toastr,$mdDialog, dalockrMessages,notificationCenterService,$compile,$timeout,$mdSidenav,$dalMedia,modalMenuService,$routeParams,$q) {

        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/mobile/dalockr-mobile-header.html';
                }
                return 'views/directives/dalockr-header.html';
            },
            scope:{
                lockrsData:'=',
                currentAssetId:'='
            },
            link: function(scope,element,attr,ctrl){
                scope.isOpen = false;
                scope.showSearchBar = true;
                scope.mobileSlideMenuShow = false;
                scope.mobileNotificationShow  = false;
                scope.sublockrView = false;
                scope.assetView = false;
                scope.notContentManager = true;
                scope.appVersion = appConfig.CURRENT_VERSION;

                element.css('z-index','10');


                dalockrMessages.registerNotification({
                    name:'dl-notification',
                    callback:notificationCallback
                });


                /**
                 * 检查是否能够管理Sharing Rules
                 */
                scope.$on('$$LockrPower', function (ev, data) {
                    scope.notContentManager = !data.iscontent;
                });




                /**
                 * 通知回调函数
                 * @param event
                 */
                function notificationCallback(data){
                    if( data.messageType === 'Notification' && data.notification.activity) {
                        toastr.success('You have an update, please check your activity flow');
                    }
                }


                $("#dalockr-prof-detail").mouseenter(function(){
                    $("#lockr-storage").show(0).removeClass('showStorage');
                });
                $("#lockr-storage").mouseleave(function(){
                    $(this).addClass('showStorage');
                    element.find("#headerbtngroup").hide();
                });
                $("#dalockr-prof-detail").prev().mouseenter(function(){
                    element.find("div#lockr-storage").addClass('showStorage');
                });
                $("#progress >div").mouseenter(function(){
                    var perval=$(this).find('span').text();
                    var percolor=$(this).css('backgroundColor');
                    $("#lockr-storage-showpercent").css('backgroundColor',percolor);
                    $("#lockr-storage-showpercent").addClass("showpercent").text(perval);
                });
                $("#progress >div").mouseleave(function(){
                    $("#lockr-storage-showpercent").removeClass("showpercent");
                    $("#lockr-storage-showpercent").text('');
                });


                scope.showMenu = false;
                var menuBox = element.find('.menu-box');
                scope.openMainTopMenu = function(){
                    scope.showMenu = !scope.showMenu;
                    if(menuBox.hasClass('show')){
                        menuBox.removeClass('show').removeClass('show-ui');
                    } else {
                        menuBox.addClass('show');
                        $timeout(function () {
                            menuBox.addClass('show-ui'); //避免闪烁出现
                        });
                    }
                };


                var searchRouteReg = /^\/search\//ig;
                var path = $location.path();
                if(searchRouteReg.test(path)){
                    scope.searchKeyword = path.substring(path.match(searchRouteReg)[0].length, path.length);
                }


                scope.enterMyLockrs = enterMyLockrs;
                scope.enterDashboard = enterDashboard;
                function enterMyLockrs(){
                    scope.openMainTopMenu();
                    $location.path('/accounts');
                    // userServices.getUserProfileInfo(function () {
                       
                    // });
                }

                function enterDashboard(){
                    scope.openMainTopMenu();
                    $location.path('/dashboard');
                }

                scope.backMainPage = function(){
                    $location.path('/');
                };



                scope.disableMenuBtn = false;
                scope.navActive = {
                    'dashboard':false,
                    'mylockrs':false,
                    'activity':false,
                    'upgrade':false
                };

                var url = [];
                url = $location.url().split('/');
                url.shift();


                scope.openDetailsInfo = function () {
                    angular.element('#sublockr-details-view').addClass('fullscreen-view');
                    $mdSidenav('left')
                        .toggle();
                };

                scope.$on('AssetData', function (ev, data) {
                   scope.state = data;
                });

                scope.openMenuModal = function () {
                    if(scope.assetView){
                        modalMenuService.open('asset',scope.state);
                    } else if(scope.sublockrView){
                        modalMenuService.open('lockr','published');
                    }
                };


                if($location.path().match(/\/sublockr\/.*/ig)){
                    scope.sublockrView = true;
                } else if($location.path().match(/\/asset\/.*/ig)){
                    scope.assetView = true;
                }
                scope.$on('$$PathData', function (ev,paths) {
                    scope.paths = paths;
                });
                scope.backToLockr = function (id) {
                    if(!scope.paths) return;
                    if(id === scope.paths[0].id){
                        $location.path('/accounts');
                    } else{
                        if(scope.paths.length == 1){
                            $location.path('/');
                        } else {
                            $location.path('/sublockr/' + id);
                        }
                    }
                };


                var mylockrsReg = /^mylockrs/;
                var dashboardReg = /^dashboard/;
                var activityReg = /^activity/;
                var upgradeReg = /^upgrade/;

                if(dashboardReg.test(url[0]) ){
                    scope.navActive[url[0].match(dashboardReg)] = true;
                    //scope.openMainTopMenu();
                    scope.disableMenuBtn = true;
                } else if(activityReg.test(url[0])){
                    scope.navActive[url[0].match(activityReg)] = true;
                } else if(upgradeReg.test(url[0])){
                    scope.navActive[url[0].match(upgradeReg)] = true;
                } else {
                    scope.navActive.mylockrs = true;
                }





                scope.loadServices = false;
                scope.loadServicesError = false;
                scope.showServices = function(){
                    if(!scope.services){
                        scope.loadServices = true;
                        dalockrServices.getAllSocialChannels()
                            .then(function(response){
                                var result = response.data;
                                var services = [];
                                angular.forEach(result, function(value, key){
                                    if(value.socialChannelType.toLowerCase() === 'dropbox'){
                                        value.class = 'mdi-dropbox';
                                        services.push(value);
                                    } else if(value.socialChannelType.toLowerCase() === 'evernote') {
                                        value.class = 'mdi-evernote';
                                        services.push(value);
                                    }else if(value.socialChannelType.toLowerCase() === 'box') {
                                        value.class = 'mdi-box';
                                        services.push(value);
                                    }
                                });
                                scope.services = services;
                                scope.loadServices = false;
                            },function(error){
                                scope.loadServicesError = true;
                                scope.loadServices = false;
                            });
                    }
                };



                servicesHandle();
                function servicesHandle(){

                    scope.openServicesDialog = function(ev){
                        scope.openMainTopMenu();
                        $mdDialog.show({
                            controller: servicesDialogController,
                            templateUrl: 'views/templates/profile-services-dialog.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose:false,
                            fullscreen:$dalMedia('xs')
                        });
                    };


                    function servicesDialogController($scope,$dalMedia){
                        $scope.showDropbox=false;
                        $scope.showBox=false;
                        $scope.showEvernote=false;
                        $scope.show=function(temp)
                        {
                            if(temp=='DropBox') $scope.showDropbox=!$scope.showDropbox;
                              else if(temp=='Box')   $scope.showBox=!$scope.showBox;
                              else
                                $scope.showEvernote=!$scope.showEvernote;
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

                        var token = userServices.getAccessToken();
                        $scope.mobileDevice = $dalMedia('xs');


                        function getAddSocialChannelUrl(name) {
                            var ru = encodeURIComponent(appConfig.REDIRECT_URL_ADDRESS + '/redirect.html');
                            if (typeof userServices.currentUser() === 'undefined') {
                                return null;
                            } else {
                                return appConfig.API_SERVER_ADDRESS + '/api/' + userServices.currentUser().clusterId + '/adm/add/social/channel/' + name + '?redirectUri=' + ru +'&token=' + token;

                            }
                        }


                        $scope.addSocialChannel = function(name){
                            if(getAddSocialChannelUrl(name)){
                                window.open(getAddSocialChannelUrl(name),'addSocialChannel','height=400, width=400, top=0,left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');
                                window.addSuccess = function(){
                                    $scope.$apply(function(){
                                        commonServices.socialChannels = null; //确保social channels能够重新加载
                                        toastr.success('Add success','Success');
                                        getSocialChannel();
                                    });
                                }

                            }
                        };



                        function getSocialChannel(){
                            $scope.socialChannelsData = [];
                            $scope.loadingSocialChannels = true;
                            dalockrServices.getAllSocialChannels().then(function(response){
                                var data = response.data;
                                var socialChannelsData = [];
                                angular.forEach(data, function(value, key){
                                    if(value.socialChannelType.toLowerCase() === 'dropbox'){
                                        value.class = 'mdi-dropbox';
                                        socialChannelsData.push(value);
                                    } else if(value.socialChannelType.toLowerCase() === 'evernote') {
                                        value.class = 'mdi-evernote';
                                        socialChannelsData.push(value);
                                    }else if(value.socialChannelType.toLowerCase() === 'box') {
                                        value.class = 'mdi-box';
                                        socialChannelsData.push(value);
                                    }
                                });
                                $scope.socialChannelsData = socialChannelsData;
                                scope.services = socialChannelsData;
                                $scope.loadingSocialChannels = false;

                            },function(){
                                $scope.loadingSocialChannels = false;
                            });
                        }

                        if(scope.services){
                            $scope.socialChannelsData = scope.services;
                            $scope.loadingSocialChannels = false;
                        } else {
                            getSocialChannel();
                        }


                        $scope.deleteSC = function(scId, socialChannelType){
                            $scope.loadingSocialChannels = true;
                            dalockrServices.deleteASocialChannel(scId).success(function (data) {
                                if(socialChannelType.toLowerCase() === 'dropbox'){
                                    toastr.success('Delete success, dropbox lockr will remain active for 3h before being deleted from system.','Success');
                                }else{
                                    toastr.success('Delete success','Success');
                                }
                                getSocialChannel();
                            }).error(function () {
                                toastr.error('Delete error','Error');
                            });
                        };
                    }
                }

                scope.logout = function(){
                    var bodyElem = angular.element('body');
                    var maskElem = $compile(angular.element('<body-loading-mask></body-loading-mask>'))(scope);

                    bodyElem.append(maskElem);
                    dalockrServices.logOff();
                }


                scope.openActivityDialog = function(ev){
                    scope.openMainTopMenu();
                    if($rootScope.mobileDevice) {
                        $mdDialog.show({
                            controller: activityDialogController,
                            templateUrl: 'views/templates/activity-flow-mobile.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose: true,
                            fullscreen: $dalMedia('xs')
                        });
                    }else if(!$rootScope.mobileDevice){
                        $mdDialog.show({
                            controller: activityDialogController,
                            templateUrl: 'views/templates/activity-flow.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose: true,
                            fullscreen: $dalMedia('xs')
                        });
                    }

                    function activityDialogController($scope){

                        $scope.showIndex = 0;
                        $scope.indexCallback = function(index){
                            $scope.$apply(function(){
                                $scope.showIndex  = Number(index);
                            });
                            if(index >= $scope.events.length - 3){
                                getEvents(true,offset,limit);
                            }
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

                        dalockrMessages.registerNotification({
                            name:'activity-notification',
                            callback:activityNotification
                        });

                        $scope.enterDetails = enterDetails;
                        $scope.events = [];

                        $timeout(function () {
                            $scope.activityContainer = angular.element('.activity-container');

                        });

                        var offset = 0, limit = 20;
                        function enterDetails(value){
                            if(value.text !== 'deleted'){

                                if(value.entity_type.toLowerCase().match(/lockr/ig)){
                                    $mdDialog.hide();
                                     $location.path('/sublockr/' + value.entity_id);
                                 } else if(value.entity_type.toLowerCase().match(/asset/ig)){
                                     //TODO 需要Asset的MimeType
                                    $mdDialog.hide();
                                    $location.path('/asset/' + value.entity_id);
                                 }
                            }
                        }

                        function activityNotification(data){
                            if( data.messageType === 'Notification' && data.notification.activity ) {
                                if( $scope.events ) {
                                   getEvents(true);
                                }
                            }
                        }

                        $scope.infiniteEvents = {
                            loadMoreEvents: function () {
                                if(this.isBusy) return;
                                offset = $scope.events.length;
                                getEvents(true,offset,limit);
                            },
                            isBusy:false
                        };


                        getEvents(true, offset,limit);
                        function getEvents(isUpdate, offset, limit){

                            $scope.infiniteEvents.isBusy = true;
                            $scope.isLoading = true;
                            dalockrServices.getEvent(function(data){
                                var date = new Date();
                                angular.forEach(data,function(value,key){
                                    var timediff = (Date.parse(date) - Date.parse(value.date))/1000;
                                    var timediffminute = parseInt(timediff%86400%3600/60);
                                    var timediffhour = parseInt(timediff%86400/3600);
                                    var timediffday = parseInt(timediff/86400)
                                    if(timediffminute < 1){
                                        value.showtime = 'A few seconds ago';
                                    }else if(timediffminute > 0 && timediffhour < 1 && timediffday  < 1 ){
                                        value.showtime =  timediffminute + ' minutes ago';
                                    }else if(timediffhour > 0 && timediffday  < 1 ){
                                        value.showtime =  timediffhour + ' hour ago';
                                    }else if(timediffday  > 1){
                                        value.showtime =  timediffday  + ' day ago';
                                    }

                                    value.start = true;


                                    value.userPic = dalockrServices.getUserAvatar(value.cluster_id, value.event.initiator_username);

                                    var eventType = value.event_type;
                                    value.text = commonServices.formatActivityText(eventType);
                                    if(eventType === 'NewLike'){
                                        value.text = 'Like';
                                    } else if(eventType === 'NewComment'){
                                        value.text = 'Comment';
                                    } else if(eventType === 'NewShare'){
                                        value.text = 'Share';
                                    }

                                    if(value.entity_type === 'Asset'){
                                        value.thumbnailUrl = dalockrServices.getThumbnailUrl('asset',value.entity_id);
                                    } else {
                                        value.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',value.entity_id);
                                    }

                                });
                                $scope.isLoading = false;
                                $scope.events = $scope.events.concat(data);
                                $scope.infiniteEvents.isBusy = false;

                                console.log($scope.events);

                                //禁用无限加载
                                if(!data.length){
                                    $scope.infiniteEvents.loadMoreEvents = null;
                                }

                            },function(error){

                                $scope.isLoading = false;

                            },offset,limit,isUpdate);
                        }
                    }
                };



                ////////////////////
                ///////处理通知//////
                ////////////////////
                scope.totalNotification = 0;
                handleNotification();

                function handleNotification(){

                    loadNotifications('unseen');
                    function loadNotifications(type){
                        dalockrServices.getUserNotification(function (data) {
                            scope.totalNotification = data.totalCount;
                        }, function () {
                        },type,0,10); //获取1个数据
                    }

                    //通知数量改变
                    scope.$on('changeNotificationCount', function (event, count) {
                        scope.totalNotification = count;
                    });


                    dalockrMessages.registerNotification({name:'profileRequestNotification',callback: function (data) {
                        if(data.messageType === 'ApprovalRequest'){
                            showModerationNotification(data.approvalRequest);
                        }
                    }});

                    function showModerationNotification(data){
                        var formatString = '';
                        if(data.type === 'COMMENT'){
                            formatString += '<div>' + data.type + ' : ' + data.commentApproval.message + '</div>';
                        } else {
                            formatString += '<div>' + data.type + ' : ' + data.shareApproval.description + '</div>';
                        }
                        toastr.info(formatString, 'Moderation feed', {
                            closeButton: false,
                            timeOut:5000,
                            tapToDismiss:true,
                            allowHtml: true,
                            onTap: function (tap) {
                                $location.path('/sublockr/' + data.entity.lockrId);
                            }
                        });
                    }
                    scope.openEditPpView = function () {
                        angular.element('body').append($compile(angular.element('<pp-edit-view></pp-edit-view>'))(scope));
                        scope.openMainTopMenu();
                    };

                    scope.openNotification = function () {
                        if($rootScope.mobileDevice){
                            scope.mobileNotificationShow = true;
                            scope.NotselectTabItem('notifications');
                        }else{
                            notificationCenterService.show();
                        }
                        //notificationCenterService.show();
                    }
                }
                scope.NotcurrentTabItem = "notifications";
                scope.moderationData = '';
                scope.notificationsData = '';
                scope.notificationsIndex = 30;
                scope.PendingMenuWatch = false;
                scope.EditPendForm = {
                    "lockrname" : '',
                    "lockrdes"  : ''
                };
                var isUpdate = true;
                scope.showPendingMenu = function(item){
                    scope.PendingMenuWatch = item.id;

                };
                scope.formPendingMenuback = function(){
                    scope.PendingMenuWatch = false;
                    scope.EditPendMenu = false;
                };
                scope.formPendingDelete = function(item){
                    scope.loadingMessage = true;
                    dalockrServices.updateApprovalRequest({},false, item.id).success(function(data) {
                        scope.loadingMessage = false;
                        scope.moderationData[scope.moderationData.indexOf(item)].status = "DENIED";
                        scope.formPendingMenuback();
                        toastr.success('DENY SUCCESS');
                    }).error(function () {
                        scope.loadingMessage = false;
                    });

                };
                scope.formPendingEdit = function(item){
                    scope.EditPendMenu = true;
                    scope.EditPendForm.lockrname = item.entity.name;
                    scope.EditPendForm.lockrdes = item.type === 'SHARE' ? item.shareApproval.description : item.commentApproval.message;

                };
                scope.fromPendimgApprove = function(item){
                    var approveParams = {};
                    approveParams.text = scope.EditPendForm.lockrdes;
                    approveParams.title = scope.EditPendForm.lockrname;
                    scope.loadingMessage = true;
                    dalockrServices.updateApprovalRequest(approveParams,true, item.id).success(function(data) {
                        scope.loadingMessage = false;
                        scope.moderationData[scope.moderationData.indexOf(item)].status = "APPROVED";
                        scope.moderationData[scope.moderationData.indexOf(item)].commentApproval.message = scope.EditPendForm.lockrdes;
                        if(item.type !== 'SHARE') {
                            scope.moderationData[scope.moderationData.indexOf(item)].commentApproval.message = scope.EditPendForm.lockrdes;
                        }else{
                            scope.moderationData[scope.moderationData.indexOf(item)].shareApproval.description = scope.EditPendForm.lockrdes;

                        }
                        scope.formPendingMenuback();
                        toastr.success('APPROVE SUCCESS');
                    }).error(function () {
                        scope.loadingMessage = false;
                    });
                };
                scope.NotselectTabItem = function (item) {
                    scope.NotcurrentTabItem = item;
                    if(item == 'moderation' && !scope.moderationData){
                        scope.loadingMessage = true;
                        dalockrServices.listToApprovalRequests(isUpdate, null, function (data) {
                            scope.moderationData = data;
                            scope.loadingMessage = false;
                        },function () {
                            scope.loadingMessage = false;
                        },true)
                    }
                    if(item == 'notifications' && !scope.notificationsData){
                        scope.loadingMessage = true;
                        dalockrServices.getUserAllNotification(function(data){
                            scope.loadingMessage = false;
                            scope.notificationsData = data;
                            totalNotification = data.totalCount;
                            angular.forEach(scope.notificationsData.notifications,function(val,ind){
                                if(val.notificationEvent.event_type == 'NewAsset'){
                                    val.notificationEvent.event_showtype = 'ASSET ADDED'
                                }else if(val.notificationEvent.event_type == 'NewLockr'){
                                    val.notificationEvent.event_showtype = 'LOCKR ADDED'
                                }else if(val.notificationEvent.event_type == "DeleteAsset"){
                                    val.notificationEvent.event_showtype = 'ASSET DELETED'
                                }else if(val.notificationEvent.event_type == 'DeleteLockr'){
                                    val.notificationEvent.event_showtype = 'LOCKR DELETED'
                                }else if(val.notificationEvent.event_type == 'PublishAsset'){
                                    val.notificationEvent.event_showtype = 'ASSET PUBLISHED'
                                }else if(val.notificationEvent.event_type == 'UnPublishAsset'){
                                    val.notificationEvent.event_showtype = 'ASSET UNPUBLISHED'
                                }else if(val.notificationEvent.event_type == 'UnPublishLockr'){
                                    val.notificationEvent.event_showtype = 'LOCKR UNPUBLISHED'
                                }

                            });
                            if(totalNotification > scope.notificationsIndex){
                                scope.showMoreNoificationBtn = true;
                            }
                        },function(error){
                            scope.loadingMessage = false;
                            console.log('error')
                        },0,scope.notificationsIndex);
                    }
                };
                scope.LoadMoreNotification = function(){
                    scope.loadingMessage = true;
                    dalockrServices.getUserAllNotification(function(data){
                        scope.loadingMessage = false;
                        angular.forEach(data.notifications,function(val,ind){
                            scope.notificationsData.notifications.push(val);
                        })

                    },function(error){
                        scope.loadingMessage = false;
                        console.log('error')
                    },scope.notificationsIndex,10);

                }




                scope.deleteNotification = function (event,item) {
                    var nos = item.id.split('-'),
                        promises = [];

                    angular.forEach(nos, function (val) {
                        promises.push(dalockrServices.deleteAnNotification(val));
                    });

                    scope.isUpdating = true;
                    $q.all(promises).then(function () {
                        toastr.success('DELETE SUCCESS');
                            scope.notificationsData.notifications.splice(scope.notificationsData.notifications.indexOf(item),1);
                            //scope.totalUnreadCount -= nos.length ;
                            //$rootScope.$broadcast('changeNotificationCount',scope.totalUnreadCount);

                        scope.isUpdating = false;
                    });

                    event.stopPropagation();
                    return false;
                };
                scope.userAvatar = function(c,i){
                    return dalockrServices.getUserAvatar(c,i);
                };
                scope.getNotificationImageSrc = function (entity) {
                    var entity_type = entity.entity_type || entity['entity'].entityType,
                        entity_id = entity.entity_id || entity['entity'].id,
                        entity_tracking_id = entity.entity_tracking_id || entity['entity'].entity_tracking_id,
                        cluster_id = entity.cluster_id || entity['entity'].cluster_id;
                    return dalockrServices.getPublicThumbnailUrl(entity_type.toLowerCase()[0],cluster_id,entity_tracking_id);
                    //return dalockrServices.getThumbnailUrl(entity_type.toLowerCase(),entity_id);
                };


                scope.getApprovalImageSrc = function (item) {
                    var entity = item.entity;
                    if(entity.entityType === 'Lockr'){
                        return dalockrServices.getThumbnailUrl('lockr',entity.id);
                    } else {
                        return dalockrServices.getThumbnailUrl('asset',entity.id);
                    }
                };

                scope.openNotificationMenu = function(){
                    scope.mobileNotificationShow = !scope.mobileNotificationShow;
                };

                scope.openAssetMenu = function ($mdOpenMenu, ev) {
                    $mdOpenMenu(ev);
                };
                scope.editAsset = function (ev) {
                    $rootScope.$broadcast('editAsset',ev);
                };
                scope.previewLockrOrAsset = function () {
                    $rootScope.$broadcast('mobileToPreview');
                };


                //mobile
                scope.$on('$$openSliderMenu', function () {
                    openMobileSliderMenu();
                });


                scope.openMobileSliderMenu = openMobileSliderMenu;
                function openMobileSliderMenu(){
                    if(!scope.mobileSlideMenuShow){
                        $rootScope.$broadcast('sildehidemenubutton',true);
                    } else {
                        $rootScope.$broadcast('showmenubutton',true);
                    }
                    scope.mobileSlideMenuShow = !scope.mobileSlideMenuShow;

                }

                scope.toSearch = function () {
                    $location.path('mobile/search');
                };

            }
        };
    }])
    .filter('ByteToMb',function(){
        return function(bytes){
            if(bytes){
                return parseFloat(bytes / 1000 / 1000,2).toFixed(2);
            } else {
                return 0;
            }
        }
    });
