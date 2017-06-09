'use strict';
/**
 * Created by panma on 11/12/15.
 */
angular.module('dalockrAppV2App')
    .directive('dlComments', ['dalockrServices','$compile','commonServices','$rootScope','$dalMedia',function (dalockrServices,$compile,commonServices,$rootScope,$dalMedia) {

        return {
            restrict: 'EA',
            scope:{
                entityType:'@',
                entityId:'@',
                entityData:'=',
                showSeeAll:'='
            },
            require:'dlComments',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/mobile/dl-mobile-comments.html';
                }
                return 'views/directives/dl-comments.html';
            },
            controller:function(){

                var expandComments = null,
                    oldReplyElem = null,
                    oldReplyId = null,
                    replyIsShow = false,
                    likeCallback = null,
                    replyCallback = null,
                    firstLevelComments = null;


                this.setFirstLevelComments = function(comments){
                    firstLevelComments = comments;
                };
                this.getFirstLevelComments = function(){
                    if(firstLevelComments) {
                        return firstLevelComments;
                    }
                };

                this.expandComments = function(item){
                    if(expandComments){
                        expandComments(item);
                    }
                };
                this.registerCallback = function (ec, lc, rc) {
                    expandComments = ec;
                    likeCallback = lc;
                    replyCallback = rc;
                };

                this.likeComment = function(){
                    if(likeCallback){
                        likeCallback();
                    }
                };
                this.replySuccess = function (pid,model) {
                    if(replyCallback){
                        replyCallback(pid,model);
                    }
                };

                this.manageReply = function(sco, element){


                    if(replyIsShow && oldReplyId === sco.commentItem.id){
                        oldReplyElem.remove();
                        replyIsShow = false;
                    } else {
                        if(oldReplyElem !== null){
                            oldReplyElem.remove();
                        }
                        oldReplyElem = $compile(angular.element('<reply-text-area comment-id="{{commentItem.id}}" entity-type="{{entityType}}" entity-id="{{entityId}}"></reply-text-area>'))(sco);
                        oldReplyId = sco.commentItem.id;
                        element.append(oldReplyElem);
                        replyIsShow = true;
                    }
                };
                this.hideReplyBox = function () {
                    oldReplyElem.remove();
                    replyIsShow = false;
                };




            },
            link: function (scope, element, attrs, dlCommentsCtrl) {

                scope.comments = null;
                scope.loading = true;
                scope.notShare = false;
                scope.mobileDevice = $dalMedia('xs');



                dlCommentsCtrl.registerCallback(openCommentsList, likeCommentSuccess, replySuccess);
                /**
                 * 如果传递了评论数据,则直接展示，无需重新加载
                 */
                if(scope.entityData){

                } else {

                    if(scope.comments === null){
                        loadCommentsData();
                    }

                }

                scope.getUserPic = getUserPic;
                scope.bys = setIconClass;
                scope.loadMoreComments = loadMoreComments;

                scope.$on('load-comments',function(event){
                   loadCommentsData();
                });


                function loadMoreComments(event){
                    event.loadingMore = true;
                    dalockrServices.getRepliesOfComment(event.id,event.comments.length,10).success(function (data) {
                        event.loadingMore = false;
                        event.comments = event.comments.concat(data);
                    });
                }

                /**
                 * 回复成功， 重新加载comment数据
                 */
                function replySuccess(pid,model){

                    //回复成功, 将comment添加
                    appendComment(scope.comments, pid, model);
                }

                /**
                 * 向模型中添加数据
                 * @param comments
                 * @param pid
                 * @param model
                 */
                function appendComment(comments, pid, model){
                    for (var i = 0; i < comments.length; i++) {
                      var obj = comments[i];
                      if( obj.id === pid ) {
                          obj.comments.push(model);
                          return comments;
                      } else {
                          if(obj.comments && obj.comments.length) {
                              appendComment(obj.comments, pid, model);
                          }
                      }
                    }
                    return comments;
                }

                /**
                 * Like 评论成功， 重新加载comment数据
                 */
                function likeCommentSuccess(){
                    loadCommentsData();
                }

                /**
                 * 打开comments
                 */
                function openCommentsList(item){

                    if(angular.isUndefined(item.comments)){
                        item.comments = [];
                        loadMoreComments(item);
                    }

                    var listElem = element.find('#comment-list-' + item.id);
                    //给toolbar:comments btn 改变颜色
                    var commentBtnElem = element.find('.comments-toolbar-btn-' + item.id),
                        iElem =  commentBtnElem.find('i'),
                        spanElem = commentBtnElem.find('span');

                    if(listElem.hasClass('hidden')){
                        listElem.removeClass('hidden');
                        iElem.addClass('comment-tool-color');
                        spanElem.addClass('comment-tool-color');
                    } else {
                        listElem.addClass('hidden');
                        iElem.removeClass('comment-tool-color');
                        spanElem.removeClass('comment-tool-color');
                    }
                }


                /**
                 * 获取用户头像
                  * @param type
                 * @param comment
                 */
                function getUserPic(type,comment){
                    if(comment){
                        return commonServices.getUserPicType(type,comment);
                    } else {
                        return null;
                    }
                }

                /**
                 * 加载评论数据
                 */
                function loadCommentsData(){
                    scope.notShare = false;
                    dalockrServices.getLockrOrAssetComments(scope.entityType, scope.entityId, function(data){

                        data = {comments:data};
                        $rootScope.$broadcast('comments-data',data);

                        if(angular.isDefined(data.comments) && data.comments.length){
                            var count = commentsCount(data.comments);
                            $rootScope.$broadcast('comments-count',count); //通知其它需要获取comment数量的地方
                            angular.forEach(data.comments, function (v) {
                                var byFormat = {};
                                if(v.by.length){
                                    v.by.map(function (value,k) {
                                        value.iconClass = commonServices.getIconClassByType(value.userType);
                                        byFormat[value.userType] = byFormat[value.userType] || [];
                                        byFormat[value.userType].push(value);
                                    });
                                }
                                v.byFormat = byFormat;
                                return v;
                            });
                            scope.comments = data.comments;
                            saveFirstLevelComments(scope.comments);

                        } else {
                            scope.notShare = true;
                        }
                        scope.loading = false;
                        scope.$apply();

                    }, function(error){

                        scope.loading = false;
                        scope.$apply();

                    });

                }

                scope.fixedPost = null;
                scope.$watch('comments', function (newVal, oldVal) {
                    if(newVal !== oldVal){
                        var idx;
                        angular.forEach(newVal, function (v, key) {
                            if(v.fixed){
                                idx = key;
                            }
                        });
                        scope.fixedPost = idx !== undefined ? newVal[idx] : null;
                    }
                },true);

                /**
                 * 计算总comment数量 (share event)
                 */
                function commentsCount(comments){
                    var count = 0;
                    for (var i = 0; i < comments.length; i++) {
                      var obj = comments[i];
                      if(obj.comments.length){
                          count += obj.comments.length;
                      }
                    }
                    return count;
                }

                function setIconClass(by){
                    for(var i=0; i<by.length; i++){
                        var obj = by[i];
                        obj.iconClass = commonServices.getIconClassByType(obj['userType']);
                    }
                    return by;
                }

                /**
                 * 记录第一层的comment的id
                 * @param comments
                 */
                function saveFirstLevelComments(comments){
                    var firstLevelComments = [];
                    for (var i = 0; i < comments.length; i++) {
                      var share = comments[i];
                      firstLevelComments.push(share.id);
                    }
                    dlCommentsCtrl.setFirstLevelComments(firstLevelComments);
                }

            }
        }
    }])
    .directive('commentToolbar', ['$compile','dalockrServices','toastr','commonServices','$timeout','$sessionStorage','userServices','whoLikesService',function ($compile,dalockrServices,toastr,commonServices,$timeout,$sessionStorage,userServices,whoLikesService) {

        return {
            restrict: 'EA',
            require:'^dlComments',
            scope:{
                commentItem:'=',
                replyToParent:'@',
                entityType:'@',
                entityId:'@'
            },
            templateUrl:'views/directives/comment-toolbar.html',
            link: function (scope, element, attrs,dlCommentsCtrl) {


                // 判断该comment item是否被like
                if(angular.isDefined(scope.commentItem.likeObjects)){
                    checkLiked();
                } else {
                    scope.commentItem.likeObjects = [];
                    dalockrServices.getLikesOfComment(scope.commentItem.id,0,1000).success(function (data) {
                        scope.commentItem.likeObjects = scope.commentItem.likeObjects.concat(data);
                        checkLiked();
                    });
                }

                scope.seeWhoLikes = function () {
                    whoLikesService.open(scope.commentItem.likeObjects);
                };


                function checkLiked(){
                    userServices.getUserProfileInfo(function (userInfo) {
                        angular.forEach(scope.commentItem.likeObjects, function (value) {
                            if(value.fromUsername === userInfo.username){
                                scope.commentItem.isLiked = true;
                            }
                        });
                    });
                }



                scope.commentType = scope.commentItem.commentType.toLowerCase(); //评论类型， 决定使用哪一种toolbar
                scope.likeStyle = {
                    'color': '#006fd5'
                };

                scope.likeThisComment = likeThisComment;
                scope.expandChildComments = expandChildComments;
                scope.replyThisComment = replyThisComment;
                scope.likeing = false;

                //scope.expandChildComments();
                /**
                 * Like comment
                 */
                function likeThisComment(){

                    if(scope.likeing) return;
                    var like = !scope.commentItem.isLiked;
                    scope.commentItem.isLiked = like;
                    scope.likeing = true;
                    dalockrServices.likeSpeicifiedComment(scope.entityType,scope.entityId,scope.commentItem.id,like)
                        .then(function(){
                            var userInfo = userServices.currentUser();
                            if(like){
                                scope.commentItem.likeObjects.push({
                                    fromUsername:userInfo.username,
                                    fromName:userInfo.firstName + ' ' + userInfo.lastName,
                                    socialChannelType:'daLockr',
                                    by:[
                                        {
                                            username:userInfo.username
                                        }
                                    ]
                                });
                                scope.commentItem.numberOfLikeObjects++;
                            } else {
                                scope.commentItem.likeObjects.splice(scope.commentItem.likeObjects.indexOf(userInfo.username),1);
                                scope.commentItem.numberOfLikeObjects--;
                            }
                            scope.likeing = false;
                        })
                        .catch(function(){
                            scope.commentItem.isLiked = !like;
                            scope.likeing = false;
                        });
                }

                /**
                 * 展开comments
                 */
                function expandChildComments(){
                    if(scope.replyToParent){
                        angular.element.find('#reply-textarea-' + scope.replyToParent)[0].focus();
                    } else {
                        dlCommentsCtrl.expandComments(scope.commentItem);
                    }
                }

                /**
                 * 展开全部comments
                 */
                for (var i = 0; i < dlCommentsCtrl.getFirstLevelComments().length; i++) {
                  var obj = dlCommentsCtrl.getFirstLevelComments()[i];
                  if(obj === scope.commentItem.id){
                      $timeout(scope.expandChildComments);
                  }
                }



                /**
                 * 回复 comment
                 */
                function replyThisComment(){
                    dlCommentsCtrl.manageReply(scope, element);
                }
            }
        }
    }])
    .directive('replyTextArea', ['dalockrServices','toastr',function (dalockrServices,toastr) {
        return {
            restrict: 'EA',
            require:'^dlComments',
            scope:{
                commentItem:'=',
                commentId:'@',
                entityId:'@',
                entityType:'@'
            },
            templateUrl:'views/directives/reply-textarea.html',
            link: function (scope, elem, attrs,dlCommentsCtrl) {

                elem.find('textarea').focus();

                scope.sendText = 'Send';
                scope.replyText = '';
                scope.isReplying = false;

                scope.reply = function(){
                    scope.sendText = 'Sending...';
                    scope.isReplying = true;
                    dalockrServices.addComment(scope.entityType,scope.entityId,scope.commentId,scope.replyText)
                        .then(function(response){
                            scope.isReplying = false;
                            scope.replyText = '';
                            scope.sendText = 'Send';
                            if(response.data.status === 'ok' && response.data.message === 'Request sent for Approval'){
                                toastr.success(response.data.message,'Success');
                            } else {
                                scope.commentItem.comments.push(response.data.assetComment);
                                scope.commentItem.numberOfComments++;
                                //dlCommentsCtrl.replySuccess(scope.commentId, response.data.assetComment);
                                //toastr.success("Reply success",'Success');
                            }
                        }).catch(function(){
                            scope.isReplying = false;
                            scope.sendText = 'Send';
                            //toastr.error("Reply error",'Error');
                        });
                };


            }
        }
    }])
.directive('mobilePostItem', function (whoLikesService,commonServices,dalockrServices,toastr,userServices,$mdPanel,fixedCommentService) {
   return {
       restrict:'E',
       scope:{
           entityType:'=',
           entityId:'=',
           post:'='
       },
       templateUrl:'views/mobile/mobile-post-item.html',
       link: function (scope) {

           scope.displayCount = 5;
           scope.likeing = false;

           angular.forEach(scope.post.comments, function (value) {
                value.expand = true;
                value.level_1 = true;
                value.reply_active = false;
           });

           checkLiked();
           function checkLiked(){
               scope.post.isLiked = false;
               userServices.getUserProfileInfo(function (userInfo) {
                   angular.forEach(scope.post.likeObjects, function (value) {
                       if(value.fromUsername === userInfo.username){
                           scope.post.isLiked = true;
                       }
                   });
               });
           }
           scope.seeMore = function () {
               scope.displayCount += 5;
           };
           scope.seeWhoLikes = function () {
               whoLikesService.open(scope.post.likeObjects);
           };

           scope.showShareEntitySocialChannelsDetails = function (ev,item) {
               var position = $mdPanel.newPanelPosition()
                   .relativeTo('.post-entity-' + item.id)
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



           scope.getUserPic =  function(type,comment){
               if(comment){
                   return commonServices.getUserPicType(type,comment);
               } else {
                   return null;
               }
           };


           scope.likeThisComment =  function (){
               if(scope.likeing) return;
               var like = !scope.post.isLiked;
               scope.post.isLiked = like;
               scope.likeing = true;
               dalockrServices.likeSpeicifiedComment(scope.entityType,scope.entityId,scope.post.id,like)
                   .then(function(){
                       var userInfo = userServices.currentUser();
                       if(like){
                           scope.post.likeObjects.unshift({
                               fromUsername:userInfo.username,
                               fromName:userInfo.firstName + ' ' + userInfo.lastName,
                               socialChannelType:'daLockr',
                               by:[
                                   {
                                       username:userInfo.username
                                   }
                               ]
                           });
                           scope.post.numberOfLikeObjects++;
                       } else {
                           var likeObjects = scope.post.likeObjects;
                           for(var i= 0, len = likeObjects.length; i<len; i++){
                               if(likeObjects[i].fromUsername == userInfo.username){
                                   scope.post.likeObjects.splice(i,1);
                                   break;
                               }
                           }
                           scope.post.numberOfLikeObjects--;
                       }
                       scope.likeing = false;
                   })
                   .catch(function(){
                       scope.post.isLiked = !like;
                       scope.likeing = false;
                   });
           };


           scope.addComment = function () {
               fixedCommentService.comment({
                   entityType:scope.entityType,
                   entityId:scope.entityId,
                   id:scope.post.id,
                   comment:true
               }).then(function (comment) {
                   scope.post.comments = scope.post.comments || [];
                   scope.post.comments.push(comment);
               });
           };

           scope.expandComment = function (item) {
               item.expand = true;
           }

       }
   }
})
.directive('mobileCommentItem', function (commonServices,dalockrServices,toastr,userServices,whoLikesService,fixedCommentService) {

    return {
        restrict:'E',
        scope:{
            entityType:'=',
            entityId:'=',
            comment:'=',
            littleSize:'@',
            firstChildCommentsOpen:'='
        },
        templateUrl:'views/mobile/mobile-comment-item.html',
        link: function (scope) {
            scope.replyData = {
                text:''
            };
            scope.otherComment = true;
            if(scope.littleSize && !scope.firstChildCommentsOpen){
                scope.firstChildCommentsOpen = true;
                scope.otherComment = false;
            }else if(scope.littleSize && scope.firstChildCommentsOpen){
                scope.firstChildCommentsOpen = true;
                scope.otherComment = true;
            }
            scope.likeing = false;
            scope.comment.comments = [];
            angular.forEach(scope.comment.comments, function (value) {
                value.expand = false;
            });

            if(angular.isDefined(scope.comment.likeObjects)){
                checkLiked();
            } else {
                scope.comment.likeObjects = [];
                dalockrServices.getLikesOfComment(scope.comment.id,0,1000).success(function (data) {
                    scope.comment.likeObjects = scope.comment.likeObjects.concat(data);
                    checkLiked();
                });
            }

            function checkLiked(){
                scope.comment.isLiked = false;
                userServices.getUserProfileInfo(function (userInfo) {
                    angular.forEach(scope.comment.likeObjects, function (value) {
                        if(value.fromUsername === userInfo.username){
                            scope.comment.isLiked = true;
                        }
                    });
                });
            }

            scope.likeThisComment =  function (){
                if(scope.likeing) return;
                var like = !scope.comment.isLiked;
                scope.comment.isLiked = like;
                scope.likeing = true;
                dalockrServices.likeSpeicifiedComment(scope.entityType,scope.entityId,scope.comment.id,like)
                    .then(function(){
                        var userInfo = userServices.currentUser();
                        if(like){
                            scope.comment.likeObjects.push({
                                fromUsername:userInfo.username,
                                fromName:userInfo.firstName + ' ' + userInfo.lastName,
                                socialChannelType:'daLockr',
                                by:[
                                    {
                                        username:userInfo.username
                                    }
                                ]
                            });
                            scope.comment.numberOfLikeObjects++;
                        } else {
                            var likeObjects = scope.comment.likeObjects;
                            for(var i= 0, len = likeObjects.length; i<len; i++){
                                if(likeObjects[i].fromUsername == userInfo.username){
                                    scope.comment.likeObjects.splice(i,1);
                                    break;
                                }
                            }
                            scope.comment.numberOfLikeObjects--;
                        }
                        scope.likeing = false;
                    })
                    .catch(function(){
                        scope.commentItem.isLiked = !like;
                        scope.likeing = false;
                    });
            };



            scope.seeWhoLikes = function () {
                whoLikesService.open(scope.comment.likeObjects);
            };


            if(scope.comment.numberOfComments > 0) {
                loadMoreComments();
            }
            scope.loadMoreComments = loadMoreComments;
            function loadMoreComments(){
                scope.comment.loadingMore = true;
                dalockrServices.getRepliesOfComment(scope.comment.id,scope.comment.comments.length,10).success(function (data) {
                    scope.comment.loadingMore = false;
                    angular.forEach(data, function (value) {
                        value.expand = false;
                        value.reply_active = false;
                    });
                    scope.comment.comments = scope.comment.comments.concat(data);
                    if(!scope.littleSize){
                        scope.expandComment(scope.comment.comments[0]);
                    }
                });
            }


            scope.expandComment = function (item) {
                item.expand = true;
            };
            scope.getUserPic =  function(type,comment){
                if(comment){
                    return commonServices.getUserPicType(type,comment);
                } else {
                    return null;
                }
            };
            scope.openReply = function () {
                fixedCommentService.comment({
                    entityType:scope.entityType,
                    entityId:scope.entityId,
                    id:scope.comment.id,
                    comment:false
                }).then(function (comment) {
                    scope.comment.comments = scope.comment.comments || [];
                    scope.comment.comments.push(comment);
                });
            };
            scope.closeExpand = function () {
                scope.comment.expand = false;
            };

            scope.bys = function(by){
                for(var i=0; i<by.length; i++){
                    var obj = by[i];
                    obj.iconClass = commonServices.getIconClassByType(obj['userType']);
                }
                return by;
            }

        }

    }

})
.directive('stickyScroll',[function () {
    return {
        strict:'A',
        require:'^scrollMeFixedBar',
        link: function (scope, element, attrs, scrollCtrl) {
            var post = scope.$eval(attrs['post']);
            var boxHeight;
            var top;
            scrollCtrl.registerListener(listenParentScroll);
            function listenParentScroll(){
                boxHeight =  boxHeight || element.find('div:first').height();
                top = top || 56 + 48 - boxHeight;
                post.fixed = element.offset().top <= top;

            }
        }
    }


}])
    .service('fixedCommentService',['$q','$rootScope','$compile',function ($q,$rootScope,$compile) {
        var body = angular.element('body');

        this.comment = function (entity) {
            var newScope = $rootScope.$new(),
                defer = $q.defer();

            newScope.commentEntity = entity;
            newScope.complete = function (comment) {
                defer.resolve(comment);
            };
            newScope.error = function () {
                defer.reject();
            };

            var compiledElem = $compile(angular.element('<fixed-comment-view></fixed-comment-view>'))(newScope);
            body.append(compiledElem);
            return defer.promise;
        }
    }])
    .directive('fixedCommentView',['dalockrServices','toastr',function (dalockrServices,toastr) {
        return {
            restrict:'E',
            templateUrl:'views/templates/fixed-comment-view.html',
            link: function (scope, element) {

                scope.replyData = {
                    text:''
                };
                scope.placeholder = 'COMMENT POST';

                if(!scope.commentEntity.comment){
                    scope.placeholder = "REPLY COMMENT";
                }

                scope.reply = function(){
                    scope.isReplying = true;
                    dalockrServices.addComment(scope.commentEntity.entityType,scope.commentEntity.entityId,scope.commentEntity.id,scope.replyData.text)
                        .then(function(response){
                            scope.isReplying = false;
                            scope.replyData.text = '';
                            if(response.data.status === 'ok' && response.data.message === 'Request sent for Approval'){
                                toastr.success(response.data.message,'Success');
                            } else {
                                response.data.assetComment.expand = true;
                                scope.complete(response.data.assetComment);
                            }
                        }).catch(function(){
                            scope.isReplying = false;
                        });
                };

                scope.dismiss = function () {
                    element.remove();
                    scope.$destroy();
                };
                scope.stopEvent = function ($event) {
                    $event.stopPropagation();
                }


                element.find('input')[0].focus();

            }
        }
    }])
.service('whoLikesService',['$mdDialog','$dalMedia','commonServices',function ($mdDialog,$dalMedia,commonServices) {

    var likeObjects;

    this.open = function (lo) {
        likeObjects = lo;
        $mdDialog.show({
            controller: whoLikesDialogController,
            templateUrl: 'views/templates/who-likes-dialog.html',
            parent: angular.element(document.body),
            targetEvent: null,
            clickOutsideToClose:false,
            fullscreen:$dalMedia('xs')
        });
    };

    function whoLikesDialogController($scope,$dalMedia){
        $scope.cancel = function () {
            $mdDialog.hide();
        };

        if(!$dalMedia('xs')){
            $scope.desktopStyle = {
                'min-width':600,
                'min-height':400
            }
        }

        angular.forEach(likeObjects,function (value) {
            value.avatarPic =  commonServices.getUserPicType(value.socialChannelType.toLowerCase(),value);
        });
        $scope.likeObjects = likeObjects;
    }
}]);