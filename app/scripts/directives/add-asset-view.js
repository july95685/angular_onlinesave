angular.module('dalockrAppV2App')
    .service('sharingRuleToShareService', function (dalockrServices,$q,toastr,commonServices,cacheService) {



        this.getCanSharedSocialChannelsAndRule = function (param, entityType) {

            var defer = $q.defer(),
                lockrEntity;

            if(angular.isArray(param)){

                getSharingRuleDetails(param)
                    .then(confirmChannels(entityType, function (rule) {
                        defer.resolve({
                            usedRule:rule
                        });
                    }));


            } else if(angular.isString(param)){

                lockrEntity = cacheService.checkLockrFromStack(param);
                if(lockrEntity){
                    getSharingRuleDetails(lockrEntity.sharingRule.map(function (val) {
                        return val.id;
                    })).then(confirmChannels(entityType, function (rule) {
                        defer.resolve({
                            usedRule:rule
                        });
                    }))

                } else {
                    dalockrServices.getLockrDetails(param).success(function (data) {
                        lockrEntity = data;
                        cacheService.pushLockrToStack(lockrEntity);

                        getSharingRuleDetails(lockrEntity.sharingRule.map(function (val) {
                            return val.id;
                        })).then(confirmChannels(entityType, function (rule) {
                            defer.resolve({
                                usedRule:rule
                            });
                        }));
                    });
                }

            } else {
                throw Error('Param type must \'String\' or \'Array\'');
            }

            return defer.promise;

        };

        function confirmChannels(mimeType, func){
            var hasSharingRule = false,
                mimeTypes,
                currentRule;

            return function (data) {
                for(var i= 0,dLen = data.length; i<dLen; i++){
                    mimeTypes = data[i].mimeType;
                    for(var j= 0,mLen = mimeTypes.length; j<mLen; j++){
                        if(typeIsSame(mimeTypes[j],mimeType)) {
                            hasSharingRule = true;
                            currentRule = data[i];
                            break;
                        }
                    }
                    if(hasSharingRule) break;
                }
                return func(currentRule);
            }

        }


        function getSharingRuleDetails(rules){
            var defer = $q.defer();
            var getPromises = rules.map(function (val) {
                return dalockrServices.getSharingRuleById(val);
            });
            $q.all(getPromises).then(function (res) {
                defer.resolve(res.map(function (val) {
                    return val.data;
                }));
            });

            return defer.promise;
        }




        //======废弃开始====
        //返回lockr的sharing rule
        var self = this;
        var avaliableSharingRules = [];
        var userSocialChannels;
        var currentAssetMimeType;

        self.getSharingRuleCanShareForEntity = function (idOrArr,mimeType, successCallback, failCallback) {

            currentAssetMimeType = mimeType;


            var defer1 = $q.defer();
            var defer2 = $q.defer();


            $q.all([defer1.promise, defer2.promise]).then(function () {
                successCallback && successCallback({socialChannels:userSocialChannels.format,normalSocialChannels:userSocialChannels.normal,avaliableSharingRules:avaliableSharingRules});
            }).catch(function () {
                failCallback && failCallback();
            });

            //获取user social channels
            getUserSocialChannels(function (data) {
                userSocialChannels  = data;
                defer1.resolve();
            }, function () {
                defer1.resolve();
            });

            if(angular.isArray(idOrArr)){
                getSharingRules(idOrArr, function (data) {
                    avaliableSharingRules = data;
                    defer2.resolve();
                }, function () {
                    defer2.reject(); // err
                });
            } else {

                //如果lockr栈不为空,则栈顶元素即为该lockrDetails, 如果为空,说明在asset details里面刷新后的情况,栈是空的
                // 因此在任何获取lockr details的地方都应该 将lockr details 入栈
                var lockr = cacheService.checkLockrFromStack(idOrArr);
                if(lockr){
                    getSharingRules(lockr.sharingRule, function (data) {
                        avaliableSharingRules = data;
                        defer2.resolve();
                    }, function () {
                        defer2.reject(); //err
                    });
                } else {
                    dalockrServices.getLockrDetails(idOrArr).success(function (data) {
                        cacheService.pushLockrToStack(data);

                        getSharingRules(data.sharingRule, function (data) {
                            avaliableSharingRules = data;
                            defer2.resolve();
                        }, function () {
                            defer2.reject(); //err
                        });
                    }).error(function () {
                        defer2.reject(); //err
                    });
                }
            }
        };


        function getSharingRules(sharingRule, successCallback, failCallback){

            var meSharingRules = [];
            var sharingRulePromise = [];
            var currentAvaliableSharingRule = null;

            angular.forEach(sharingRule, function (value) {
                sharingRulePromise.push(dalockrServices.getSharingRuleById(value.id));
            });
            $q.all(sharingRulePromise).then(function (response) {
                meSharingRules = response.map(function (value) {
                    return value.data;
                });
                var len = meSharingRules.length;
                var defaultSharingRule;
                while(len--){
                    var ruleObj = meSharingRules[len];
                    var ruleMimeTypes = ruleObj.mimeType;

                    if(ruleObj.userDefault){
                        defaultSharingRule = ruleObj;
                    }

                    for(var i= 0, l = ruleMimeTypes.length; i<l; i++){
                        var mt = ruleMimeTypes[i];
                        if(typeIsSame(mt,currentAssetMimeType)){
                            currentAvaliableSharingRule = meSharingRules[len];
                            break;
                        }
                    }

                    if(currentAvaliableSharingRule) break;
                }

                if(!currentAvaliableSharingRule){
                    currentAvaliableSharingRule = defaultSharingRule || meSharingRules[0];
                }
                successCallback && successCallback(currentAvaliableSharingRule);

            }).catch(function (error) {
               failCallback && failCallback(error);
            });
        }



        function getUserSocialChannels(successCallback,fail){
            dalockrServices.getShareSocialChannelWithCache(function (data) {
                var socialChannelArrByType = {};
                var normalSocialChannels = [];

                angular.forEach(angular.copy(data),function(value, key){

                    if(value.shareType === "TO_CHANNEL") {

                        var tempValue = angular.copy(value);
                        tempValue.iconClass = commonServices.getIconClassByType(value.socialChannelType);
                        tempValue.active = false;
                        normalSocialChannels.push(tempValue);


                        if (!socialChannelArrByType[value.socialChannelType]) {
                            socialChannelArrByType[value.socialChannelType] = {icon: '', active: false, data: []};
                            socialChannelArrByType[value.socialChannelType].icon = commonServices.getIconClassByType(value.socialChannelType);
                            socialChannelArrByType[value.socialChannelType].data.push(value);
                        } else {
                            socialChannelArrByType[value.socialChannelType].data.push(value);
                        }
                    }
                });

                //console.log('测试facebook page服务---');
                //dalockrServices.getFacebookPageById(socialChannelArrByType['Facebook'].data[0].id);
                //dalockrServices.getFacebookPageInsightsById(socialChannelArrByType['Facebook'].data[0].id);

                successCallback && successCallback({normal:normalSocialChannels,format:socialChannelArrByType});

            },fail);
        }
        //======废弃结束=====


        function typeIsSame(o1,o2){
            //先判断o1的类型
            var o1Type = '';
            o1.isFileType('image') && (o1Type = 'image');
            o1.isFileType('video') && (o1Type = 'video');
            o1.isFileType('pdf') && (o1Type = 'pdf');
            o1.isFileType('doc') && (o1Type = 'doc');
            o1.isFileType('xls') && (o1Type = 'xls');
            o1.isFileType('ppt') && (o1Type = 'ppt');
            o1.isFileType('audio') && (o1Type = 'audio');

            var o2Type = '';
            o2.isFileType('image') && (o2Type = 'image');
            o2.isFileType('video') && (o2Type = 'video');
            o2.isFileType('pdf') && (o2Type = 'pdf');
            o2.isFileType('doc') && (o2Type = 'doc');
            o2.isFileType('xls') && (o2Type = 'xls');
            o2.isFileType('ppt') && (o2Type = 'ppt');
            o2.isFileType('audio') && (o2Type = 'audio');

            return o1Type == o2Type;
        }

    })
    .directive('addAssetView', ['$timeout','commonServices','sharingRuleToShareService','dalockrServices','Upload','appConfig','userServices','$rootScope','toastr','$dalMedia','$q','$mdDialog','$mdBottomSheet','$location',function($timeout,commonServices,sharingRuleToShareService,dalockrServices,Upload,appConfig,userServices,$rootScope,toastr,$dalMedia,$q,$mdDialog,$mdBottomSheet,$location) {
            return {
                restrict: 'E',
                templateUrl: function () {
                    if($dalMedia('xs')){
                        return 'views/mobile/mobile-add-asset-view.html';
                    } else {
                        return 'views/directives/add-asset-view.html';
                    }
                },
                scope:{
                    pathLevel:'@',
                    lockrId:'=',
                    lockrName:'=',
                    previewResource:'='
                },
                replace:true,
                link: function (scope, element, attr) {

                    var step = {
                            PREVIEW:0,
                            INFO:1,
                            PARENT:2
                        },
                        tmpAsset = null;

                    scope.step = step.INFO;

                    scope.mobileDevice = $dalMedia('xs');
                    scope.uploadAssetEntity = {
                        name:'',
                        description:'',
                        tags:scope.mobileDevice ? '' : [],
                        publish:false
                    };
                    scope.toShare = scope.mobileDevice ? true : false;;
                    scope.openOther = scope.mobileDevice ? true : false;
                    scope.determinateValue = 0;
                    scope.disableUserToSelectChannel = false;
                    scope.myAsset = null;
                    scope.fileIcon = '';
                    scope.fileType = {
                        isImage:false,
                        isVideo:false,
                        isPdf:false,
                        isAudio:false,
                        isWord:false,
                        isExcel:false,
                        isPpt:false,
                        isOther:false
                    };

                    scope.selectLockr = {};
                    scope.selectOtherLockr = false;

                    scope.shareAssetEntity = {
                        shareMsg:'',
                        channels:[]
                    };

                    var authToken = userServices.getAccessToken(),
                        haveSelectedChannels = [],
                        previewBox = element.find('.preview-box'),
                        autoCompleteCallback = angular.noop;

                    scope.closeView  = function () {
                        if(scope.step == step.PARENT){
                            scope.step = step.INFO;
                        } else {
                            closeMe();
                        }
                    };
                    scope.uploadAsset = uploadAsset;
                    openMe();


                    //重新请求资源
                    scope.retryRequest = function () {
                      commonServices.requestAssetResource(function (e) {
                         displayResource(e);
                      });
                    };

                    scope.confirmUpload = function () {
                        scope.step = step.INFO; //进入上传阶段
                    };

                    if(scope.previewResource){
                        displayResource(scope.previewResource);
                    }


                    function displayResource(e){
                        var loadingImage;

                        scope.myAsset = e.target.files[0];
                        formatMimeType(scope.myAsset.type);

                        if(scope.fileType.isImage){

                            var options = {
                                maxWidth: previewBox.width(),
                                maxHeight:previewBox.height(),
                                canvas: true,
                                contain: true,
                                pixelRatio:window.devicePixelRatio
                            };

                            loadImage.parseMetaData(scope.myAsset, function (data) {
                                if (data.exif) {
                                    options.orientation = data.exif.get('Orientation')
                                }
                                loadingImage = loadImage(
                                    scope.myAsset,
                                    function replaceResults (img) {
                                        previewBox.empty().append(img);

                                    },
                                    options
                                );

                            });

                            if (!loadingImage) {
                                // Alternative code ...
                            }
                        }
                        scope.toShare && getShareCondition(scope.myAsset.type);

                        if(!$rootScope.$$phase) {
                            scope.$apply();
                        }
                    }

                    function formatMimeType(type){
                        scope.fileType = {
                            isImage:type.isFileType('image'),
                            isVideo:type.isFileType('video'),
                            isPdf:type.isFileType('pdf'),
                            isAudio:type.isFileType('audio'),
                            isWord:type.isFileType('doc'),
                            isExcel:type.isFileType('xls'),
                            isPpt:type.isFileType('ppt'),
                            isOther:!type.isFileType('image') &&
                            !type.isFileType('video') &&
                            !type.isFileType('pdf') &&
                            !type.isFileType('audio') &&
                            !type.isFileType('doc') &&
                            !type.isFileType('xls') &&
                            !type.isFileType('ppt')
                        };
                        scope.fileIcon = type.isFileType('pdf') ? 'dal-icon-pdf_black' :
                            (type.isFileType('audio') ? 'dal-icon-music_black' :
                                (type.isFileType('video') ? 'dal-icon-video_black' :
                                (type.isFileType('ppt') ? 'dal-icon-pp_black' :
                            (type.isFileType('doc') ? 'dal-icon-word_black' :
                                (type.isFileType('xls') ? 'dal-icon-excel_black' :'')) )));

                    }


                    function uploadAsset(isShare){
                        if(scope.mobileDevice && scope.step != step.PARENT){
                            scope.step = step.PARENT;
                            return;
                        }

                        scope.isUploading = true;
                        scope.determinateValue = 0;
                        Upload.upload({
                            url: appConfig.API_SERVER_ADDRESS + '/api/asset?token=' + authToken, //upload.php script, node.js route, or servlet url
                            method: 'POST',
                            fields:{
                                lockrId: ( scope.openOther && scope.selectOtherLockr ) ? scope.selectLockr  : scope.lockrId,
                                description:scope.uploadAssetEntity.description,
                                name:scope.uploadAssetEntity.name, //时间戳name
                                draft:!scope.uploadAssetEntity.publish
                            },
                            file: scope.myAsset,
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
                            scope.determinateValue = parseInt(100.0 * evt.loaded / evt.total);
                        }).success(function(data) {

                            scope.isUploading = false;
                            $rootScope.$broadcast('updateLockrDetails',false);
                            closeMe();

                            if(!scope.mobileDevice && isShare && data.asset){
                                shareAsset(data.asset.id);
                            }

                            if(scope.mobileDevice){
                                tmpAsset = data.asset;
                                pSConfirmDialog();
                            }



                        }).error(function(data){
                            scope.isUploading = false;
                            toastr.error(data.message);
                        });
                    }



                    scope.$watch('toShare', function () {
                        scope.toShare && scope.myAsset && getShareCondition(scope.myAsset.type);
                    });

                    function getShareCondition(mimeType){

                        haveSelectedChannels = [];
                        scope.loadSharingRule = true;
                        //scope.noSocialChannels = false;
                        //scope.socialChannels = {};
                        //scope.hasTwitter = false;

                        sharingRuleToShareService.getCanSharedSocialChannelsAndRule(scope.selectOtherLockr ? scope.selectLockr.id : scope.lockrId, mimeType).then(function (rule) {
                            scope.loadSharingRule = false;
                            if(rule.usedRule){
                                scope.currentAvaliableSharingRule = rule.usedRule;
                                haveSelectedChannels = rule.usedRule.postOnSocialChannel;
                                scope.socialChannels = rule.usedRule.postOnSocialChannelDetail.map(function (val) {
                                    val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                    val.active = false;
                                    val.avatarPic = commonServices.getSocialChannelAvatar(val);

                                    return val;
                                });
                                formatSocialChannels();
                                checkActiveItem();


                            } else { //没有对应的Rule 显示account的所有social channels
                                dalockrServices.getShareSocialChannelWithCache(function (results) {
                                    scope.socialChannels = results.map(function (val) {
                                        val.selected = false;
                                        val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                                        val.avatarPic = commonServices.getSocialChannelAvatar(val);

                                        return val;
                                    });
                                    formatSocialChannels();
                                })
                            }
                        });

                        //用户选取了asset后激活
                        //sharingRuleToShareService.getSharingRuleCanShareForEntity(scope.selectOtherLockr ? scope.selectLockr.id : scope.lockrId, mimeType, function (data) {
                        //    scope.loadSharingRule = false;
                        //    scope.socialChannels = data.normalSocialChannels;
                        //    scope.currentAvaliableSharingRule = data.avaliableSharingRules;
                        //    if(scope.socialChannels.length === 0){
                        //        scope.noSocialChannels = true;
                        //    } else {
                        //        if(scope.currentAvaliableSharingRule){
                        //            haveSelectedChannels = scope.currentAvaliableSharingRule.postOnSocialChannel;
                        //            if(haveSelectedChannels.length){
                        //                var socialChannelArrByType = {};
                        //
                        //                angular.forEach(scope.socialChannels, function (value) {
                        //                    angular.forEach(haveSelectedChannels, function (v2) {
                        //                        if(v2 === value.id){
                        //                            if(value.shareType === "TO_CHANNEL") {
                        //                                if (!socialChannelArrByType[value.socialChannelType]) {
                        //                                    socialChannelArrByType[value.socialChannelType] = {icon: '', active: false, data: []};
                        //                                    socialChannelArrByType[value.socialChannelType].icon = value.iconClass;
                        //                                    socialChannelArrByType[value.socialChannelType].data.push(value);
                        //                                } else {
                        //                                    socialChannelArrByType[value.socialChannelType].data.push(value);
                        //                                }
                        //                            }
                        //                        }
                        //                    })
                        //                });
                        //                scope.socialChannels = socialChannelArrByType;
                        //                checkActiveItem();
                        //            } else {
                        //                scope.socialChannels = data.socialChannels;
                        //                //toastr.warning('The sharing rule does\'t have any social channels, you can select','Warning');
                        //            }
                        //        } else {
                        //            scope.socialChannels = data.socialChannels;
                        //            //toastr.warning('The sharing rule does\'t have any social channels, you can select','Warning');
                        //        }
                        //    }
                        //
                        //
                        //}, function () {
                        //    //加载失败, 提示重新加载
                        //    //console.log('load failed');
                        //});
                    }

                    function formatSocialChannels(){
                        var socialChannelArrByType = {};
                        angular.forEach(scope.socialChannels, function (value) {
                            if (!socialChannelArrByType[value.socialChannelType]) {
                                socialChannelArrByType[value.socialChannelType] = {icon: '', active: false, data: []};
                                socialChannelArrByType[value.socialChannelType].icon = value.iconClass;
                                socialChannelArrByType[value.socialChannelType].data.push(value);
                            } else {
                                socialChannelArrByType[value.socialChannelType].data.push(value);
                            }
                        });
                        scope.socialChannels = socialChannelArrByType;
                    }


                    scope.changeItem = function (item) {
                        scope.selectOtherLockr = item ? true : false;
                        scope.selectLockr = item && ( item._id || item.id);
                    };
                    scope.createOtherNewLockr = function () {
                        var defer = $q.defer();
                        $rootScope.$broadcast('add-lockr',defer);
                        //新建成功后,返回得到该数据
                        defer.promise.then(function (data) {
                            var lockr;
                            if(data && ( lockr =  data.lockr) ){
                                scope.selectOtherLockr = true;
                                scope.selectLockr = lockr.id;
                                autoCompleteCallback(lockr);
                            }

                        });
                    };
                    scope.registerAutoCompleteCallback = function (cb) {
                        autoCompleteCallback = cb;
                    };


                    scope.searchLockrWithName = function (text) {
                        if(text.length){
                            scope.searching = true;
                            dalockrServices.getSearch(text, function (data) {
                                scope.lockrList = data.result.Lockr;
                                scope.searching = false;
                                if(scope.lockrList.length){
                                    scope.selectLockr.id = scope.lockrList[0]._id;
                                }
                            });
                        } else {
                            scope.lockrList = null;
                        }
                    };




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
                        angular.forEach(scope.socialChannels, function (v1, k1) {
                            angular.forEach(v1.data, function (v2, k2) {
                                v2.active = false;
                            })
                        });

                        for(var i= 0, l1 = haveSelectedChannels.length;i<l1; i++){
                            var obj1 = haveSelectedChannels[i];

                            angular.forEach(scope.socialChannels, function (v1, k1) {
                                angular.forEach(v1.data, function (v2, k2) {
                                    if(obj1 === v2.id){
                                        v2.active = true;

                                        //检查是否有twitter
                                        if(v2.socialChannelType.toLowerCase() === 'twitter'){
                                            scope.hasTwitter = true;
                                        }

                                    }
                                })
                            });
                        }
                    }


                    function shareAsset(assetId){
                        scope.shareAssetEntity.channels = haveSelectedChannels;
                        dalockrServices.shareAsset(assetId,scope.shareAssetEntity, function (data) {
                            if(data.socialInteractionResults){
                                angular.forEach(data.socialInteractionResults, function (value, key) {
                                    if(value.socialPostStatus.toLowerCase() === 'failed'){
                                        toastr.error(value.failedMsg,value.socialChannelType + ' share error');
                                    }
                                });
                            } else {
                                toastr.success(data.message,'Success');
                            }

                        }, function (error) {
                            toastr.error(error.message,'Error');
                        });
                    }


                    function openMe(){
                        document.body.scrollTop = 0;
                        commonServices.banBodyScroll();
                    }

                    function closeMe(){
                        commonServices.allowBodyScroll();
                        element.remove();
                        scope.$destroy();
                    }

                    scope.$on('$$closeAddAssetView', function () {
                        closeMe();
                    });


                    function pSConfirmDialog(){

                        $mdBottomSheet.show({
                            templateUrl: 'views/templates/publish-share-confirm-dialog.html',
                            controller: publishShareConfirmController,
                            clickOutsideToClose: true
                        }).then(function(clickedItem) {
                            if(clickedItem){
                                openPublishShareDialog();
                            } else {
                                $location.path('/asset/' + tmpAsset.id);
                            }
                        });


                    }

                    function publishShareConfirmController($scope){
                        var confirmScope = $scope;
                        confirmScope.assetTitle = tmpAsset.name;
                        confirmScope.hide = function (idx) {
                            $mdBottomSheet.hide(idx);
                        }
                    }


                    function openPublishShareDialog(){
                        $mdDialog.show({
                                controller: publishShareAssetController,
                                templateUrl: 'views/templates/publish-share-asset-dialog.html',
                                parent: angular.element(document.body),
                                targetEvent: null,
                                clickOutsideToClose:false,
                                fullscreen:true
                            });
                    }


                    function publishShareAssetController($scope,$mdBottomSheet){


                        var _scope = $scope;


                        _scope.hide = function () {
                            $mdDialog.hide();
                        };
                        _scope.loadingInProgress = false;
                        _scope.events = {
                            share:false,
                            publish:true
                        };
                        _scope.shareEntity = {
                            title:'',
                            text:'',
                            shareMsg:'',
                            channels:[]
                        };

                        var selectedChannels = [];

                        if(tmpAsset)
                            _scope.assetTitle = tmpAsset.name;

                        _scope.socialChannels = scope.socialChannels;

                        if(scope.currentAvaliableSharingRule){
                            selectedChannels = scope.currentAvaliableSharingRule.postOnSocialChannel;
                            //angular.forEach(_scope.socialChannels, function (social) {
                            //    angular.forEach(social.data, function (val) {
                            //        selectedChannels.push(val.id);
                            //    });
                            //});
                        }


                        _scope.sharingRule = scope.currentAvaliableSharingRule;

                        _scope.changeCallback = function (items) {
                            selectedChannels = items;
                        };
                        _scope.publishAsset = function () {
                            _scope.loadingInProgress = true;
                            dalockrServices.publishOrUnpublishAsset('publish',tmpAsset.id, function (data) {
                                _scope.$apply(function () {
                                    _scope.loadingInProgress = false;
                                    if(data && data.message)
                                        toastr.success(data.message);
                                });
                                _scope.hide();
                            }, function (error) {
                                _scope.$apply(function () {
                                    if(error && error.message)
                                        toastr.error(error.message,'Error');
                                    _scope.loadingInProgress = false;
                                });
                            });
                        };

                        _scope.shareAsset = function () {
                            var failed = false;
                            _scope.loadingInProgress = true;
                            _scope.shareEntity.channels = selectedChannels;
                            dalockrServices.shareAsset(tmpAsset.id,_scope.shareEntity, function (data) {

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

                                _scope.hide();
                                _scope.loadingInProgress = false;
                                _scope.$apply();
                            }, function (error) {
                                if(error && error.responseText)
                                    toastr.error(JSON.parse(error.responseText).message);
                                _scope.loadingInProgress = false;
                                _scope.$apply();
                            });
                        };

                        _scope.schedulePostForMobile = function () {
                            $mdBottomSheet.show({
                                templateUrl:'views/templates/mobile-schedule-post-view.html',
                                controller: MobileSchedulePostCtrl,
                                parent: angular.element('.md-dialog-container').first()
                            });
                        };

                        function MobileSchedulePostCtrl($scope){
                            var _scheduleScope = $scope;
                            _scheduleScope.shareDate = new Date();
                            _scheduleScope.schedulePostThisShare = function () {
                                if(!_scheduleScope.shareDate) return;
                                _scope.shareDate = _scheduleScope.shareDate;
                                scheduleShareAsset();
                                $mdBottomSheet.hide();
                            }
                        }

                        function scheduleShareAsset() {
                            _scope.loadingInProgress = true;
                            _scope.shareEntity.channels = selectedChannels;
                            var httpBody = angular.extend(_scope.shareEntity,{"shareByDate":_scope.shareDate.toISOString()});
                            dalockrServices.scheduleShareEventForAssetOrLockr('asset',tmpAsset.id,httpBody).then(function (res) {
                                toastr.success(res.data.message);
                                _scope.loadingInProgress = false;
                                _scope.hide();
                            }).catch(function (error) {
                                _scope.loadingInProgress = false;
                                if(error && error.data){
                                    toastr.error(error.data.message);
                                }
                            });
                        }

                    }

                }
            }
        }])

    .controller('SearchLockrAutoCompleteCtrl', SearchLockrAutoCompleteCtrl);



function SearchLockrAutoCompleteCtrl ($scope,dalockrServices, $q,$rootScope,$location,toastr) {
    var self = this,
        _super = $scope.$parent.$parent || $scope;

    self.isDisabled = false;

    self.state = loadAll();
    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange = angular.noop;
    if(_super.pathLevel == '1'){
        self.selectedItem = {name:_super.lockrName,id:_super.lockrId};
    }
    if(_super.registerAutoCompleteCallback) {
        _super.registerAutoCompleteCallback(function (item) {
            self.selectedItem = item;
        })
    }

    function querySearch(query) {
        var results = self.state;
        var deferred = $q.defer();
        if(query && query.length){
            dalockrServices.getSearch(query, function (data) {
                if(data.result && data.result.Lockr){
                    deferred.resolve(data.result.Lockr.filter(createFilterFor(query)));
                } else {
                    deferred.resolve([]);
                }
            }, function () {
                deferred.resolve([]);
            });
            return deferred.promise;
        } else {
            return results;
        }
    }


    //input得到焦点
    self.focusAutoCompleteInput = function (cName) {
        angular.element('.' + cName + ' input')[0].focus();
    };


    function selectedItemChange(item) {
        if(_super.changeItem){
        _super.changeItem(item);
        }else{
            console.log(item);
            $rootScope.$broadcast('searchlockdata',item);
        }
    }


    function loadAll() {
        // var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut';
        var allStates = [];
              dalockrServices.getClustersLockr()
                .then(function(response) {
                   var result = response.data;
                   var currentAccount  = getCurrentAccount(result);
                   dalockrServices.getLockrDetails(currentAccount.id).success(function(data){
                       angular.forEach(data.subLockrs,function(val){
                           var lockrdata = {
                               "_id":val.id,
                               "name":val.name
                           }
                           allStates.push(lockrdata);
                       })
                       console.log(allStates);
                   })
                 },function(){
                    toastr.error('Not found lockr','Error');
                 });
        return allStates;
    }

    function getCurrentAccount(result) {
        var aid =  $location.search().aid;
        for(var i= result.length; i-- ;i >=0){
            var ac = result[i];
            if(ac.accountId === aid){
                return ac;
            }
        }
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (item.name.toLowerCase().indexOf(lowercaseQuery) === 0);
        };

    }
}