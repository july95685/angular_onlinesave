/**
 * Created by arnoma2015 on 16/2/16.
 */
angular.module('dalockrAppV2App')
    .service('notificationCenterService', function ($rootScope,$compile) {

        var notificationCenterCached = false;

        function show(){
            if(!notificationCenterCached){
                angular.element('body').append($compile(angular.element('<notification-center></notification-center>'))($rootScope.$new()));
                notificationCenterCached = true;
            } else {
                $rootScope.$broadcast('$openNotificationCenter');
            }
        }

        return {
            show:show
        }
    })
    .directive('notificationCenter',['dalockrServices','$location','dalockrMessages','commonServices','$document','$compile','$rootScope','toastr','$q','$dalMedia',function(dalockrServices,$location,dalockrMessages,commonServices,$document,$compile,$rootScope,toastr,$q,$dalMedia){
        return {
            restrict: 'E',
            templateUrl: 'views/directives/component/notification-center.html',
            replace:true,
            link:function(scope,elem){

                var activeClass = 'active',
                    readIndex = 0,
                    unReadIndex = 0;

               if (scope.mobileDevice = $dalMedia('xs')){
                   activeClass = 'mobile-active';
               }

                openNotificationView();

                //默认第一次进入时,打开通知,其它通过事件通知打开
                var onePageNumber = 10; //每一页显示的数量

                scope.hasReadNotifications = [];
                scope.unReadNotifications = [];
                scope.moderateDetailsShow = false;

                var readActive = false;
                var moderationActive = false;

                var firstLoadNotification = true;
                var firstLoadToModeration = true;

                var notificationCurItem = null;
                var moderationCurItem = null;

                scope.loadingUnread = false;
                scope.loadingRead = false;
                scope.loadingModeration = false;

                scope.moderationPending = [];
                scope.moderationOther = [];

                scope.currentParItem = 'notifications';
                scope.currentItem = 'unread';
                notificationCurItem = 'unread';


                scope.getApprovalImageSrc = function (item) {
                    var entity = item.entity;
                    if(entity.entityType === 'Lockr'){
                        return dalockrServices.getThumbnailUrl('lockr',entity.id);
                    } else {
                        return dalockrServices.getThumbnailUrl('asset',entity.id);
                    }
                };

                scope.getNotificationImageSrc = function (entity) {
                    var entity_type = entity.entity_type || entity['entity'].entityType,
                        entity_id = entity.entity_id || entity['entity'].id,
                        entity_tracking_id = entity.entity_tracking_id || entity['entity'].entity_tracking_id,
                        cluster_id = entity.cluster_id || entity['entity'].cluster_id;
                    return dalockrServices.getPublicThumbnailUrl(entity_type.toLowerCase()[0],cluster_id,entity_tracking_id);
                    //return dalockrServices.getThumbnailUrl(entity_type.toLowerCase(),entity_id);
                };

                var getSocialChannelIcon = function (channel) {
                    return commonServices.getIconClassByType(channel.socialChannelType);
                };

                scope.switchParItem = function (type) {
                    scope.currentParItem = type;
                    // 首次加载Moderation
                    if(type === 'moderation' && !moderationActive && firstLoadToModeration) {
                        moderationActive = true;
                        loadModerationToApproval(true, null, true);
                        firstLoadToModeration = !firstLoadToModeration;

                        scope.currentItem = 'moderation-unattended';
                        moderationCurItem = 'moderation-unattended';
                    }else if(type === 'moderation' && !firstLoadToModeration) {
                        scope.currentItem = moderationCurItem;
                    }else if(type === 'notifications') {
                        scope.currentItem = notificationCurItem;
                    }
                };


                scope.openApprovalDetails = function (item) {
                    scope.moderateDetailsShow = true;
                    scope.modetationItemDetails = item;
                };
                scope.hideApprovalDetails = function () {
                    scope.moderateDetailsShow = false;
                };

                scope.switchItem = function (type) {
                    scope.currentItem = type;

                    if(scope.currentParItem === 'notifications') {
                        notificationCurItem = type;
                    }else if( scope.currentParItem === 'moderation') {
                        moderationCurItem = type;
                    }

                    if(type === 'moderation-attended' && firstLoadToModeration) {
                        firstLoadToModeration = !firstLoadToModeration;
                        loadModerationToApproval(true, null, true);
                    }

                };


                loadReadNotification('seen',0,onePageNumber);
                loadUnreadNotification('unseen',0,onePageNumber);



                //if( firstLoadNotification === true) {
                    //scope.loadingUnread = true;
                    //scope.loadingRead = true;
                    //var isloadingUnread = true;
                    //
                    //dalockrServices.getUserNotification(function (response) {
                    //
                    //    var notifications = response.notifications;
                    //    unReadIndex = angular.copy(notifications).length;
                    //    notifications = commonServices.formatNotifications(notifications);
                    //
                    //    angular.forEach(notifications, function (noti) {
                    //
                    //        var fullDate = new Date(noti.notificationEvent.date);
                    //        noti.momentString = moment(fullDate).fromNow();
                    //
                    //        var len = noti.notificationEvent.event_type.length;
                    //        for(var i=0; i<len;i++){
                    //            var cc = noti.notificationEvent.event_type.charCodeAt(i);
                    //            if(65 <= cc && cc <= 90 && i!= 0){ //大写字母index
                    //                noti.notificationEvent.event_type_string = noti.notificationEvent.event_type.substr(0,i) + ' ' + noti.notificationEvent.event_type.substr(i,len);
                    //            }
                    //        }
                    //    });
                    //
                    //    scope.unReadNotifications = scope.unReadNotifications.concat(notifications);
                    //
                    //    isloadingUnread = false;
                    //    scope.loadingUnread = false;
                    //
                    //    scope.totalUnreadCount = response.totalCount;
                    //    $rootScope.$broadcast('changeNotificationCount',scope.unReadNotifications.length);
                    //
                    //    if(isloadingUnread == false && scope.loadingRead == false){
                    //        scope.loadingUnread = false;
                    //        firstLoadNotification = !firstLoadNotification;
                    //    }
                    //
                    //}, function () {
                    //
                    //    scope.loadingUnread = false;
                    //    isloadingUnread = false;
                    //
                    //}, 'unseen', 0, onePageNumber);

                    //
                    //dalockrServices.getUserNotification(function (response) {
                    //
                    //    var notifications = response.notifications;
                    //    readIndex = angular.copy(notifications).length;
                    //    notifications = commonServices.formatNotifications(notifications);
                    //
                    //
                    //    angular.forEach(response.notifications, function (noti) {
                    //
                    //        var fullDate = new Date(noti.notificationEvent.date);
                    //        noti.momentString = moment(fullDate).fromNow();
                    //
                    //        var len = noti.notificationEvent.event_type.length;
                    //        for(var i=0; i<len;i++){
                    //            var cc = noti.notificationEvent.event_type.charCodeAt(i);
                    //            if(65 <= cc && cc <= 90 && i!= 0){ //大写字母index
                    //                noti.notificationEvent.event_type_string = noti.notificationEvent.event_type.substr(0,i) + ' ' + noti.notificationEvent.event_type.substr(i,len);
                    //            }
                    //        }
                    //    });
                    //
                    //    scope.totalReadCount = response.totalCount;
                    //    scope.loadingRead = false;
                    //    scope.hasReadNotifications = scope.hasReadNotifications.concat(notifications);
                    //
                    //    if(isloadingUnread == false && scope.loadingRead == false){
                    //        scope.loadingUnread = false;
                    //        firstLoadNotification = !firstLoadNotification;
                    //    }
                    //
                    //}, function () {
                    //    scope.loadingRead = false;
                    //}, 'seen', 0, onePageNumber);

                //}



                //加载unread
                function loadUnreadNotification(type,offset,limit){
                    scope.loadingUnread = true;

                    dalockrServices.getUserNotification(function (response) {
                        scope.totalUnreadCount = response.totalCount;

                        var notifications = response.notifications;
                        unReadIndex += angular.copy(notifications).length;

                        notifications = commonServices.formatNotifications(notifications);

                        angular.forEach(notifications, function (noti) {

                            var fullDate = new Date(noti.notificationEvent.date);
                            noti.momentString = moment(fullDate).fromNow();

                            noti.notificationEvent.event_type_string = getEventTypeString(noti.notificationEvent.event_type);

                        });

                        scope.unReadNotifications = scope.unReadNotifications.concat(notifications);
                        scope.loadingUnread = false;
                        $rootScope.$broadcast('changeNotificationCount',scope.totalUnreadCount);

                    }, function () {
                        scope.loadingUnread = false;
                    },type,offset,limit)
                }



                function loadReadNotification(type,offset,limit){
                    scope.loadingRead = true;
                    dalockrServices.getUserNotification(function (response) {
                        scope.totalReadCount = response.totalCount;

                        var notifications = response.notifications;

                        readIndex += angular.copy(notifications).length;
                        notifications = commonServices.formatNotifications(notifications);

                        angular.forEach(notifications, function (noti) {
                            var fullDate = new Date(noti.notificationEvent.date);
                            noti.momentString = moment(fullDate).fromNow();
                            noti.notificationEvent.event_type_string = getEventTypeString(noti.notificationEvent.event_type);



                        });

                        scope.hasReadNotifications = scope.hasReadNotifications.concat(notifications);
                        scope.loadingRead = false;

                    }, function () {
                        scope.loadingRead = false;
                    },type,offset,limit);

                }
                scope.loadingMoreRead = function () {
                    console.log(readIndex);
                    loadReadNotification('seen',readIndex,onePageNumber);
                };
                scope.loadingMoreUnRead = function () {
                    console.log(unReadIndex);
                    console.log(onePageNumber);
                    loadUnreadNotification('unseen',unReadIndex,onePageNumber)
                };

                function getEventTypeString(event_type){
                    var types = event_type.split('-'),
                        typeStrings = [];

                    for(var j= 0,len = types.length; j<len; j++){
                        var iType = types[j],
                            ilen = iType.length;
                        for(var i=0; i<ilen;i++){
                            var cc = iType.charCodeAt(i);
                            if(65 <= cc && cc <= 90 && i!= 0){ //大写字母index
                                typeStrings.push(iType.substr(0,i) + ' ' + iType.substr(i,ilen));
                            }
                        }
                    }

                    return typeStrings.join(' & ');
                }


                function loadModerationToApproval(isUpdate, entityId ,isFull){
                    scope.loadingModerationToApprovals = true;
                    console.log(isUpdate);
                    dalockrServices.listToApprovalRequests(isUpdate, null, function (data) {
                        console.log(data);
                        angular.forEach(data, function (value) {
                            if(value.status === 'PENDING') {
                                scope.moderationPending.push(value);
                            }else{
                                scope.moderationOther.push(value);
                            }

                            value.socialChannelIcons = [];
                            if(value.commentApproval && angular.isDefined(value.commentApproval['socialChannels'])){
                                angular.forEach(value.commentApproval.socialChannels, function (val) {
                                    value.socialChannelIcons.push(getSocialChannelIcon(val));
                                });
                            } else if(value.shareApproval && angular.isDefined(value.shareApproval['socialChannels'])){
                                angular.forEach(value.shareApproval.socialChannels, function (val) {
                                    value.socialChannelIcons.push(getSocialChannelIcon(val));
                                });
                            }
                            var fullDate = new Date(value.dateCreated);
                            value.momentString = moment(fullDate).fromNow();
                        });
                        scope.moderationPendingCount = scope.moderationPending.length;
                        scope.moderationOtherCount = scope.moderationOther.length;

                        scope.loadingModerationToApprovals = false;
                    }, function () {

                    },true);
                }
                scope.editApprove = function (app) {
                    app.editing = !app.editing;
                };
                scope.approvedMoreModeration = function (item) {
                    console.log(item);

                    var approveParams = {};
                    if(item.type !== 'SHARE'){
                        approveParams.message = item.commentApproval.message;
                    }

                    scope.isUpdating = true;
                    dalockrServices.updateApprovalRequest(approveParams,true, item.id).success(function(data) {
                        scope.moderateDetailsShow = false;

                        scope.moderationPendingCount --;
                        scope.moderationOtherCount ++;
                        scope.moderationOther.unshift(item);
                        scope.moderationPending.splice(scope.moderationPending.indexOf(item),1);
                        scope.isUpdating = false;
                        toastr.success('APPROVE SUCCESS');
                    }).error(function () {
                        scope.isUpdating = false;
                    });
                };

                scope.deniedMoreModeration = function (item) {
                    console.log(item);

                    scope.isUpdating = true;
                    dalockrServices.updateApprovalRequest({},false, item.id).success(function(data) {
                        scope.moderationPendingCount --;
                        scope.moderationOtherCount ++;
                        scope.moderationOther.unshift(item);
                        scope.moderationPending.splice(scope.moderationPending.indexOf(item),1);
                        scope.isUpdating = false;
                        toastr.success('DENY SUCCESS');
                    }).error(function () {
                        scope.isUpdating = false;
                    });
                };

                scope.$on('$openNotificationCenter', function () {
                    openNotificationView();
                });
                scope.$on('updateModerationNotification', function () {
                    moderationActive = true;
                    loadModerationToApproval();
                });

                scope.userAvatar = function (c, i) {
                    return dalockrServices.getUserAvatar(c,i);
                };
                scope.enterRequestDetails = function (id) {
                    elem.removeClass(activeClass);
                    commonServices.allowBodyScroll();
                    $location.path('/sublockr/' + id);
                };

                //
                scope.enterNotificationDetails = function (item) {

                    //if(elem.hasClass(activeClass)){
                    //    elem.removeClass(activeClass);
                    //}
                    var event = item.notificationEvent,
                        type = event.entity_type.toLowerCase();
                    //scope.commentEvent = event;
                    //
                    //if(isUnSeen){
                    //    markSeen(item);
                    //}
                    //if(event.event_type.toLowerCase() === 'newcomment'){
                    //    if(event.entity_type.toLowerCase() === 'lockr'){
                    //        openCommentFlow('lockr',item.id);
                    //    }else {
                    //        openCommentFlow('asset');
                    //    }
                    //} else {
                    //    if(event.entity_type.toLowerCase() === 'lockr'){
                    //        $location.path('/sublockr/' + event.entity_id);
                    //    }
                    //}
                    if(elem.hasClass(activeClass)){
                        elem.removeClass(activeClass);
                        !window.isMobile && commonServices.allowBodyScroll();
                    }

                    if(type.match(/lockr$/)){
                        $location.path('/sublockr/' + event.entity_id);
                    } else {
                        $location.path('/asset/' + event.entity_id);
                    }
                };

                function openCommentFlow(type){
                    !window.isMobile && commonServices.banBodyScroll();
                    $document.find('body').append($compile('<comment-flow-region asset-name="commentEvent.entity_name" file-id="{{commentEvent.entity_id}}" file-type="' + type +'"></comment-flow-region>')(scope));
                }


                var documentElem = angular.element(document);
                var documentEvent = 'click';
                if(window.isMobile){
                    documentEvent = 'touchend';
                }
                documentElem.on(documentEvent, function (event) {
                    if(elem.hasClass(activeClass)){
                        elem.removeClass(activeClass);
                        !window.isMobile && commonServices.allowBodyScroll();
                    }
                });
                elem.on(documentEvent, function (event) {
                    event.stopImmediatePropagation();
                });

                scope.closeNotificationCenter = function () {
                    if(elem.hasClass(activeClass)){
                        elem.removeClass(activeClass);
                        !window.isMobile && commonServices.allowBodyScroll();
                    }
                };


                dalockrMessages.registerNotification({name:'notificationCenterRequestNotification',callback: function (data) {
                    if(data.messageType === 'ApprovalRequest'){
                        loadModerationNotification(true);
                    } else {
                    }
                }});


                scope.deleteNotification = function (event,item,isUnSeen) {
                    //scope.normalNotifications.splice(scope.normalNotifications.indexOf(item),1);
                    var nos = item.id.split('-'),
                        promises = [];

                    angular.forEach(nos, function (val) {
                        promises.push(dalockrServices.deleteAnNotification(val));
                    });

                    scope.isUpdating = true;
                    $q.all(promises).then(function () {
                        toastr.success('DELETE SUCCESS');
                        if(isUnSeen){
                            unReadIndex -= nos.length;
                            scope.unReadNotifications.splice(scope.unReadNotifications.indexOf(item),1);
                            scope.totalUnreadCount -= nos.length ;
                            $rootScope.$broadcast('changeNotificationCount',scope.totalUnreadCount);
                        } else {
                            readIndex -= nos.length;
                            scope.hasReadNotifications.splice(scope.hasReadNotifications.indexOf(item),1);
                            scope.totalReadCount -= nos.length ;
                        }
                        scope.isUpdating = false;
                    });

                    event.stopPropagation();
                    return false;
                };


                function markSeen(item){
                    dalockrServices.makeNotificationAsSeenById(item.id).success(function () {
                        $rootScope.$broadcast('changeNotificationCount',--scope.totalUnreadCount);
                        scope.unReadNotifications.splice(scope.unReadNotifications.indexOf(item),1);
                        if(readActive){
                            //加载read
                            item.hasSeen = true;
                            scope.hasReadNotifications.unshift(item); //加入已读数组
                        }
                    });
                }


                function openNotificationView(){
                    setTimeout(function () {
                        elem.addClass(activeClass);
                        commonServices.banBodyScroll();
                    });
                }
            }
        }
    }]);