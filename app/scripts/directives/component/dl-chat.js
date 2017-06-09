'use strict';

angular.module('dalockrAppV2App')
    .directive('dlChat', ['dalockrServices','$compile','$dalMedia',function (dalockrServices, $compile, $dalMedia) {

        return {
            restrict: 'EA',
            scope:{
                entityId:'@',
                lockrDetails:'='
            },
            transclude:true,
            replace:true,
            template:'<div></div>',  //此时作用域在父scope  无法访问该指令的scope
            controller: function ($scope) {

            },
            link: function (scope, element, attrs, ctrl, transclude) {

                scope.showChatBtn = false;
                scope.chatWindowActive = false;
                scope.openChatWindow = openChatWindow;
                scope.conversationData = null;
                scope.$on('close-chat-window',closeChatWindow);

                // Safe lockr 能够发送信息
                scope.$watch('lockrDetails', function () {

                    if(scope.lockrDetails && scope.lockrDetails.lockrType === 'SafeLockr' && !$dalMedia('xs')){
                        scope.showChatBtn = true;
                    }

                });

                /**
                 * 打开聊天窗口
                 */
                function openChatWindow(){
                    scope.chatWindowActive = true;
                    var chatWindow = $compile(angular.element('<dl-chat-window entity-id="{{entityId}}"></dl-chat-window>'))(scope);
                    angular.element(document.body).append(chatWindow);
                }

                /**
                 *  关闭了聊天窗口
                 */
                function closeChatWindow(){
                    scope.chatWindowActive = false;
                }

                /**
                 * 将transclude 内容复制到dl-chat中, 并将指令作用域scope传入
                 */
                transclude(scope, function(clone){
                    element.append(clone);
                });



            }
        }
    }])
    .directive('dlChatWindow', ['$templateCache','$timeout','$animate','$rootScope','dalockrServices','$sessionStorage','dalockrMessages','$filter','userServices',
        function ($templateCache, $timeout, $animate, $rootScope, dalockrServices,$sessionStorage,dalockrMessages,$filter,userServices) {

        return {
            restrict: 'EA',
            replace:true,
            scope:{
              entityId:'@'
            },
            templateUrl: function () {
              return 'views/templates/dl-chat-window.html';
            },
            link: function (scope, element, attrs) {

                var sendInput = element.find('.dl-chat-send-input'),
                    messagesElem = element.find('.dl-chat-messages'),
                    body = document.body,
                    range = 20,
                    limit = 20,
                    offset = 0;

                scope.msgCount = 0;
                scope.windowMin = false;
                scope.loadingConversation = true;
                scope.conversationId = null;
                scope.minChatWindow = minChatWindow;
                scope.closeChatWindow = closeChatWindow;
                scope.message = '';
                scope.messages= [];
                scope.noMessages = false;
                scope.noMore = false;
                scope.loadingM = false;
                scope.loadingMore = loadingMore;


                dalockrMessages.registerNotification({
                    name:'dl-chat-notification',
                    callback:notificationCallback
                });
                getLockrConversation(offset, limit);


                $rootScope.$on('$locationChangeStart',closeChatWindow);
                $timeout(maxChatWindow);


                messagesElem
                    .bind('mouseover', function ($event) {
                        body.style.overflow = 'hidden';
                    })
                    .bind('mouseleave', function () {
                        body.style.overflow = 'auto';
                    });

                sendInput
                    .bind('keydown', function (ev) {
                        if(ev.keyCode === 13 && scope.message !== '') {

                            var message = {
                                userPic:dalockrServices.getUserAvatar(userServices.currentUser().clusterId,userServices.currentUser().id),
                                message:{
                                    message:scope.message,
                                    dateCreated:new Date()
                                },
                                isSending:true,
                                me:true
                            };
                            scope.messages.push(message);
                            scope.noMessages = false;

                            dalockrServices.sendMessageToLockr(scope.entityId,scope.message)
                                .then(function (response) {
                                    message.isSending = false;
                                }, function (error) {

                                });
                            scope.message = '';
                            toBottom();
                            scope.$apply();
                        }
                    });



                function loadingMore(){
                    scope.loadingM = true;
                    getLockrConversation(offset, limit);
                }

                /**
                 * 获取对话
                 */
                function getLockrConversation(o, l){
                    dalockrServices.getLockrConverstion(scope.entityId, o, l)
                        .then(function (response) {

                            var messageRefsCopy,
                                result = response.data;

                            if( result.messageRefs.length === range ) {
                                offset += range;
                                limit += range;
                            } else {
                                scope.noMore = true;
                            }

                            if( !scope.messages.length ) {

                                scope.conversationId = result.id;
                                messageRefsCopy = angular.copy(result.messageRefs);
                                scope.messages = $filter('orderBy')(changeModel(messageRefsCopy, true), 'message.dateCreated', false) ;
                                toBottom();
                                scope.loadingConversation = false;

                            } else {

                                messageRefsCopy = angular.copy(result.messageRefs);
                                var tempMessages = $filter('orderBy')(changeModel(messageRefsCopy, true), 'message.dateCreated', true );
                                for (var i = 0; i < tempMessages.length; i++) {
                                    var obj = tempMessages[i];
                                    scope.messages.unshift(obj);
                                }
                                scope.loadingM = false;

                            }


                        }, function (error) {
                            if(error.data.status === 404){
                                scope.noMessages = true;
                                scope.loadingConversation = false;
                                scope.noMore = true;

                            }
                        })
                }

                function notificationCallback(data){
                    if( data.messageType === 'Conversation' ) {

                        scope.messages.push(changeModel(data.message, false));
                        toBottom();
                        scope.noMessages = false;

                        //如果 是最大化窗口 并且element存在, 则标记已读
                        if( element && !scope.windowMin) {
                            readOne(data.message.message.conversationId,data.message.id);
                        } else {
                            scope.msgCount ++;
                        }
                    }
                }

                function closeChatWindow(){
                    animate(0, function () {
                        $rootScope.$broadcast('close-chat-window',true);
                        element.remove();
                    });
                }
                function minChatWindow(){
                    animate(scope.windowMin ? 380 : 36, function () {
                        !scope.windowMin || focusSendInput();
                        scope.windowMin = !scope.windowMin;

                        //console.log(scope.windowMin);
                        if(scope.windowMin === false && scope.msgCount !== 0) {
                            readAll(function () {
                                scope.msgCount = 0;
                            });
                        }

                    });
                }

                function maxChatWindow(){
                    animate(380,focusSendInput);
                }

                function animate(desH, cb){
                    $animate.animate(element,{},{height:desH},'dl-animation-500ms')
                        .then(function () {
                            cb && cb();
                        });
                }

                function focusSendInput(){
                    sendInput.focus();
                }

                function toBottom(){
                    $timeout(function () {
                        messagesElem[0].scrollTop = messagesElem[0].scrollHeight;
                    });
                }

                function changeModel(msgRefs, isArray){

                    var user;

                    if(isArray){
                        for (var i = 0; i < msgRefs.length; i++) {
                            var obj = msgRefs[i];
                            user = obj.message.fromUser;
                            obj.me = ( user.id === userServices.currentUser().id ) ? true : false;
                            obj.userPic = dalockrServices.getUserAvatar(user.clusterId,user.id);
                        }
                    } else {

                        user = msgRefs.message.fromUser;
                        msgRefs.me = ( user.id === userServices.currentUser().id ) ? true : false;
                        msgRefs.userPic = dalockrServices.getUserAvatar(user.clusterId,user.id);
                    }

                    return msgRefs;
                }


                function readAll(cb) {
                    dalockrServices.markAllMessagesInConversation(scope.conversationId)
                        .then(function () {
                            cb();
                        });
                }

                function readOne( cid ,msgId){
                    dalockrServices.markMessageInConversation(msgId, cid);
                }


            }
        }
    }]);

