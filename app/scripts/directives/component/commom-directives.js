/**
 * Created by arnoma2015 on 16/2/16.
 */
angular.module('dalockrAppV2App')
    .service('sharingRuleServices',function ($mdDialog,dalockrServices,commonServices) {

        function editSharingRule(currentSharingRule){

            $mdDialog.show({
                controller: sharingRuleDialogController,
                templateUrl: 'views/templates/sharing-rule-dialog.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose:false,
                fullscreen:true
            });

            function sharingRuleDialogController($scope) {
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                };

                if(currentSharingRule){
                    $scope.currentSharingRule = currentSharingRule;
                }

                $scope.OpenAddSharingRuleDialog = function(ev) {

                    $mdDialog.show({
                        controller: addSharingRulesController,
                        templateUrl: 'views/templates/add-sharing-rule-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false
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
                    }
                };
            }
        }

        return {
            editSharingRule:editSharingRule
        }
    })
    .service('thumbnailServices',function ($rootScope,$mdDialog,dalockrServices,commonServices,$dalMedia,userServices,userRightServices,$filter,toastr,cacheService,cropAndUploadThumb) {
        var accountData = '';
        function editThumbnailDialog(data){
            $mdDialog.show({
                controller: selectThumbController,
                templateUrl: 'views/templates/select-thumbnail.html',
                parent: angular.element(document.body),
                clickOutsideToClose:false,
                skipHide:true,
                fullscreen:$dalMedia('xs')

            });

            function selectThumbController($scope){
                $scope.search = {
                    text:''
                };

                $scope.$watch('search.text',function(newVal){
                    if(newVal) {
                        angular.forEach($scope.thumbData, function (val) {
                            if (val.name.indexOf(newVal) == -1) {
                                val.searchHide = true;
                            } else {
                                val.searchHide = false;
                            }
                        });
                    }else{
                        angular.forEach($scope.thumbData, function (val) {
                            val.searchHide = false;
                        });
                    }
                });

                $scope.showThumbList = true;

                $scope.mobileDevice = $dalMedia('xs');

                $scope.selectThumbAsset = function(value){
                    $scope.showThumbList = false;
                    if(value.fileType == "subLockr" || !value.fileType){
                        commonServices.clearAssets();
                        var lockrsCache = commonServices.cacheInstance('lockrsCache');
                        lockrsCache.remove('imageList');
                        var currentLockrId = value.id,
                            showWidth = $dalMedia('xs') ? commonServices.getMobileCardWidth()  : 220,
                            tnSize = {
                                realWidth:0,
                                realHeight:0,
                                showWidth:showWidth,
                                showHeight: (showWidth * 240) / 319 //default height
                            };
                        $scope.currentLockrDetails = null;
                        $scope.assetsData = [];
                        $scope.currentLockrId = currentLockrId;
                        var lockr =  cacheService.checkLockrFromStack($scope.currentLockrId);
                        if(lockr){
                            handleLockrData(lockr);
                        } else {
                            getCurrentLockrDetails();
                        }
                    }else{
                        console.log('this is asset');
                        $scope.updataThumb(value);
                    }


                    function setImageSwitchList(assets){
                        var imageList = [],
                            imageReg = /^image/,
                            idx = 0;
                        for (var i = 0; i < assets.length; i++) {
                            var obj = assets[i];
                            if(obj.mimeType.match(imageReg)){
                                imageList.push({id:obj.id,index:idx});
                                idx++;
                            }
                        }
                        lockrsCache.put('imageList',imageList);
                    }

                    function handleLockrData(data){
                        $scope.assetsData = [];
                        //赋予计算后新的属性
                        data.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',data.id);
                        data.thumbnailUrl = data.thumbnailUrl + '&timestamp=' + new Date().getTime();
                        data.socialChannelView = commonServices.getSocialChannelViewNum(data.links);
                        data.assetExtraInfo = {
                            'imageCount': 0,
                            'videoCount': 0,
                            'pdfCount':0,
                            'audioCount':0,
                            'lockrCount':0,
                            'othersCount':0
                        };

                        userServices.getUserProfileInfo(function(userinfo){
                            if (userinfo) {
                                data.noContentManager = !userRightServices.isContentManager(data.id);
                            }
                        });

                        $scope.currentLockrDetails = data;

                        if( angular.isUndefined(data.assets) && angular.isUndefined(data.subLockrs) ) return;

                        var assetsDataTmp = [];

                        if(angular.isDefined(data.assets)){

                            commonServices.setAssets(data.assets);


                            var imageCount = 0,
                                audioCount = 0,
                                pdfCount = 0,
                                videoCount = 0,
                                othersCount = 0;

                            data.assets = $filter('orderBy')(data.assets,'dateLastUpdated',true);

                            setImageSwitchList(data.assets);

                            angular.forEach(data.assets, function(value,key){

                                value.tnSize = tnSize;
                                value.thumbnailUrl = dalockrServices.getThumbnailUrl('asset', value.id);
                                value.noTnDimensions = true;
                                value.socialChannelView = commonServices.getSocialChannelViewNum(value.links);

                                if(typeof value.tnDimensions !== 'undefined') {
                                    var size = value.tnDimensions.split('x');
                                    var showHeight = (showWidth * parseInt(size[1]) ) / parseInt(size[0]);
                                    value.tnSize = {
                                        realWidth: parseInt(size[0]),
                                        realHeight: parseInt(size[1]),
                                        showWidth: Math.floor(showWidth),
                                        showHeight: Math.floor(showHeight)
                                    };
                                    value.noTnDimensions = false;
                                }



                                value.mimeType.isFileType('article') && (value.fileType = 'article') && ++othersCount;
                                value.mimeType.isFileType('doc') && (value.fileType = 'doc') && ++othersCount;
                                value.mimeType.isFileType('xls') && (value.fileType = 'xls') && ++othersCount;
                                value.mimeType.isFileType('ppt') && (value.fileType = 'ppt') && ++othersCount;
                                value.mimeType.isFileType('video') && (value.fileType = 'video') && ++videoCount;
                                value.mimeType.isFileType('audio') && (value.fileType = 'audio') && ++audioCount;
                                value.mimeType.isFileType('pdf') && (value.fileType = 'pdf') && ++pdfCount;
                                value.mimeType.isFileType('image') && (value.fileType = 'image') && ++imageCount;

                                value.fileTypeIcon = commonServices.getAssetFileTypeIconWithType(value.fileType);

                                assetsDataTmp.push(value);
                            });

                            data.assetExtraInfo = {
                                'imageCount': imageCount,
                                'videoCount': videoCount,
                                'pdfCount':pdfCount,
                                'audioCount':audioCount,
                                'othersCount':othersCount,
                                'lockrCount':0,
                                'excludeCount':imageCount + videoCount + pdfCount + audioCount
                            };
                        }

                        if(angular.isDefined(data.subLockrs)){

                            data.assetExtraInfo.lockrCount = data.subLockrs.length;


                            angular.forEach(data.subLockrs, function(value,key){
                                // value.iscontent=userRightServices.isContentManager(value.id);
                                // value.iscommunity=userRightServices.isCommunityManager(value.id);
                                userServices.getUserProfileInfo(function(info){
                                    if(info){
                                        value.iscontent=userRightServices.isContentManager(value.id,value.hierarchy);
                                        value.iscommunity=userRightServices.isCommunityManager(value.id,value.hierarchy);

                                    }
                                });

                                value.tnSize = tnSize;
                                value.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr', value.id);
                                value.socialChannelView = commonServices.getSocialChannelViewNum(data.links);
                                value.fileType = 'subLockr';
                                value.noTnDimensions = true;
                                value.fileTypeIcon = 'dal-icon-mylocker_black';


                                if(typeof value.tnDimensions !== 'undefined') {

                                    var size = value.tnDimensions.split('x');
                                    var showHeight = (showWidth * parseInt(size[1]) ) / parseInt(size[0]);
                                    value.tnSize = {
                                        realWidth: parseInt(size[0]),
                                        realHeight: parseInt(size[1]),
                                        showWidth: showWidth,
                                        showHeight: showHeight
                                    };
                                    value.noTnDimensions = false;
                                }
                                assetsDataTmp.push(value);
                            });
                        }

                        $scope.assetsData = assetsDataTmp;
                        $scope.thumbData = $scope.assetsData;
                        $scope.showThumbList = true;

                        $scope.currentLockrDetails.assetJSONExtraInfo = data.assetExtraInfo;
                        $scope.currentLockrDetails.assetExtraInfo = commonServices.formatExtraInfo(data.assetExtraInfo);
                    }

                    function getCurrentLockrDetails(isHideDialog){
                        dalockrServices.getLockrDetails(currentLockrId).then(function(response){
                            if(isHideDialog){
                                $mdDialog.hide();
                            }
                            var data = response.data;
                            cacheService.pushLockrToStack(data);
                            handleLockrData(data);

                        }).catch(function(error){
                            console.error(error);
                        });

                    }
                };

                if(commonServices.accounts()){
                    $scope.accountsData = commonServices.accounts();
                    angular.forEach($scope.accountsData,function(val,ind){
                        if(val.accountId == data.accountId){
                            $scope.selectThumbAsset(val);
                           // $scope.thumbData = $scope.accountsData;
                        }
                    })
                } else {
                    $scope.showThumbList = false;
                    loadAccounts();
                }

                function loadAccounts(){
                    dalockrServices.getClustersLockr()
                        .then(function(response){

                            var result = response.data;
                            //if(result.length === 0) return;
                            for (var i = 0; i < result.length; i++) {
                                var obj = result[i];
                                obj.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',obj.id);
                                (function(obj){
                                    userServices.getUserProfileInfo(function(userinfo){
                                        if (userinfo) {
                                            obj.isManager = userRightServices.isAccountManager(obj.accountId);
                                        }
                                    });
                                })(obj);

                            }
                            $scope.accountsData = $filter('orderBy')(result, 'dateCreated',true);
                            angular.forEach($scope.accountsData,function(val,ind){
                                if(val.accountId == data.accountId){
                                    //$scope.thumbData = $scope.accountsData;
                                    $scope.selectThumbAsset(val);
                                }
                            });
                            commonServices.saveAccounts($scope.accountsData);

                        },function(){

                        });
                }



                $scope.selectedItem = data;

                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                    //scope.showselectthumb = false;
                };
                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };


                $scope.updataThumb = function(item,$event){
                    $event.stopPropagation();
                    cropAndUploadThumb.open(item.thumbnailUrl,null,$scope.selectedItem.id);
                    //dalockrServices.updateLockr($scope.selectedItem.id,{
                    //    thumbnailAssetId:item.id
                    //},function(data){
                    //    $scope.cancel();
                    //    toastr.success('Thumbnail '+ data.lockr.name + ' has been set.','Success');
                    //    $rootScope.$broadcast('lockrThumbnailChange',$scope.selectedItem);
                    //},function(error){
                    //    toastr.error(error.message,'Error');
                    //});
                };
                var screenWidth = commonServices.getCurrentBroswerWidth(),
                    cardW = commonServices.getMobileCardWidth(),
                    showWidth = $scope.mobileDevice ? cardW  : 220,
                    tnSize = {
                        realWidth:0,
                        realHeight:0,
                        showWidth:showWidth,
                        showHeight: (showWidth * 240) / 319 //default height
                    };
                $scope.mobileGap = (screenWidth - cardW*2) / 6;
                $scope.mobileCardWidth = cardW;

            }

        }

        return {
            editThumbnailDialog:editThumbnailDialog
        }
    })
    .directive('sharingRuleItem', function (dalockrServices,commonServices,toastr,$rootScope,$mdDialog) {
        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/directives/component/mobile-sharing-rule-item.html';
                }
                return 'views/directives/component/sharing-rule-item.html';
            },
            replace:true,
            scope:{
                sharingRule:'=',
                lockrId:'@'
            },
            link:function(scope,elem) {

                var rememberStartStatus;
                var allMimeTypeCache;
                var currentMimeTypeCache;
                var selectedSocialData = [];
                var stepId;
                scope.editSharingrules = false;
                scope.stepId=0;
                scope.currentMimeType = [];
                scope.currentSRTab = 'mimeType';
                var allMimeType = {
                    image:{name:'image',mimeType:['image/*'],icon:'dal-icon-picture_black',isCanActive:false,currentActive:false,title:'Pictures'},
                    pdf:{name:'pdf',mimeType:['application/pdf'],icon:'dal-icon-pdf_black',isCanActive:false,currentActive:false,title:'PDFs'},
                    video:{name:'video',mimeType:['video/*'],icon:'dal-icon-video_black',isCanActive:false,currentActive:false,title:'Videos'},
                    audio:{name:'audio',mimeType:['audio/*'],icon:'dal-icon-music_black',isCanActive:false,currentActive:false,title:'Audios'},
                    ppt:{name:'ppt',mimeType:['application/vnd.ms-powerpoint'],icon:'dal-icon-pp_black',isCanActive:false,currentActive:false,title:'Powerpoints'},
                    doc:{name:'doc',mimeType:['application/msword'],icon:'dal-icon-word_black',isCanActive:false,currentActive:false,title:'Word Docs'},
                    xls:{name:'xls',mimeType:['application/vnd.ms-excel'],icon:'dal-icon-excel_black',isCanActive:false,currentActive:false,title:'Excel Docs'}
                };
                scope.currentChannel = 'Facebook';
                scope.channelTypes = [
                    {
                        active:true,
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
                scope.activeThisChannel = function (item) {
                    scope.channelTypes = scope.channelTypes.map(function (val) {
                        val.active = false;
                        return val;
                    });
                    scope.currentChannel = item.name;
                    item.active = true;
                };
                scope.chooseChannelUser = function(item){
                    if(item.selected){
                        item.selected = false;
                        selectedSocialData.splice(selectedSocialData.indexOf(item.id),1);
                    }else{
                        item.selected = true;
                        selectedSocialData.push(item.id);
                    }
                };

                scope.creativeCommons = {};

                if(scope.sharingRule){

                    scope.editSharingrules = true;
                    !scope.sharingRule.expandBox && (scope.sharingRule.expandBox = true);
                    scope.isEditing = true;
                    scope.sharingRulesName = {
                        name: angular.copy(scope.sharingRule.name)
                    };
                    angular.forEach(scope.sharingRule.postOnSocialChannel,function(val){
                        selectedSocialData.push(val);
                    });


                    rememberStartStatus = {
                        name: angular.copy(scope.sharingRule.name),
                        creativeCommons:angular.copy(scope.sharingRule.creativeCommons),
                        mimeType: angular.copy(scope.sharingRule.mimeType)
                    };

                    scope.creativeCommons = scope.sharingRule.creativeCommons;
                    //scope.isEditing = false;


                    angular.forEach(allMimeType,function (value, key) {
                        angular.forEach(scope.sharingRule.mimeType, function (type) {
                            type.isFileType('image') && (key === 'image') && (value.currentActive = true) && scope.currentMimeType.push('image');
                            type.isFileType('pdf') && (key === 'pdf')  &&  (value.currentActive = true) && scope.currentMimeType.push('pdf');
                            type.isFileType('video') && (key === 'video') && (value.currentActive = true)  && scope.currentMimeType.push('video');
                            type.isFileType('audio') && (key === 'audio') && (value.currentActive = true) && scope.currentMimeType.push('audio');
                            type.isFileType('ppt') && (key === 'ppt') && (value.currentActive = true) && scope.currentMimeType.push('ppt');
                            type.isFileType('doc') && (key === 'doc') && (value.currentActive = true) && scope.currentMimeType.push('doc');
                            type.isFileType('xls') && (key === 'xls') && (value.currentActive = true) && scope.currentMimeType.push('xls');
                        });
                    });
                    scope.allMimeType = allMimeType;
                    allMimeTypeCache = angular.copy(scope.allMimeType);
                    currentMimeTypeCache = angular.copy(scope.currentMimeType);

                } else {
                    scope.creativeCommons = {
                        isShare:'1',
                        isCommercial:'1'
                    };
                    scope.allMimeType = allMimeType;
                    scope.allMimeType.image.currentActive = true;
                    scope.currentMimeType = ['image'];
                    scope.sharingRulesName = {
                        name:''
                    };
                    scope.isEditing = true;

                    scope.saveThisSharingRule = saveThisSharingRule;

                }


                scope.selectedMimeType = function (item) {

                    item.currentActive =  item.currentActive ? false : true;

                    if(item.currentActive){
                        scope.currentMimeType.push(item.name);
                    } else {

                        var index = 0;
                        angular.forEach(scope.currentMimeType,function (value,key) {
                            if(value === item.name){
                                index = key;
                            }
                        });
                        scope.currentMimeType.splice(index,1);
                    }
                };

                scope.showContentCard = function () {
                    scope.sharingRule.expandBox = scope.sharingRule.expandBox === true ? false : true;
                };



                scope.editThisSharingRule = function () {
                    if(scope.isEditing) {
                        //保存
                        var sharingRule = {sharingRule:{
                            name:scope.sharingRule.name,
                            mimeType:formatMimeType(),
                            license : scope.ccType,
                            postOnSocialChannel : selectedSocialData
                        }};
                        dalockrServices.updateSharingRule(scope.sharingRule.id,sharingRule).success(function () {
                            toastr.success('Update success','Success');
                            $rootScope.$broadcast('reloadUserSharingRule');
                            $rootScope.$broadcast('$sharingRuleChangeSuccess');
                            //scope.isEditing = false;
                        }).error(function (error) {
                            toastr.error(error.message,'Error');
                        });
                    } else {
                        !scope.sharingRule.expandBox && (scope.sharingRule.expandBox = true);
                        scope.isEditing = true;
                    }
                };

                scope.cancelEditing = function () {
                    //scope.isEditing = false;
                    resetStatus();
                };

                function formatMimeType(){
                    var mimeType = [];
                    angular.forEach(scope.currentMimeType, function (value) {
                        angular.forEach(allMimeType[value].mimeType, function (v) {
                            mimeType.push(v);
                        });
                    });
                    return mimeType;
                }


                function resetStatus(){
                    scope.sharingRule.name = rememberStartStatus.name;
                    scope.creativeCommons = rememberStartStatus.creativeCommons;
                    scope.allMimeType = angular.copy(allMimeTypeCache);
                    scope.currentMimeType = angular.copy(currentMimeTypeCache);
                    //scope.sharingRule.mimeType = rememberStartStatus.mimeType;
                    getShareSocialChannel();
                }

                function getActiveChannel(){
                    var arr = [];

                    var shareChannelsType = [];

                    angular.forEach(scope.socialChannelArrByType, function (value,key) {
                        value.active = false;
                        angular.forEach(value.data, function (v2) {
                            if(v2.sharingRuleActive){
                                arr.push(v2.id);

                                if(!shareChannelsType.length){
                                    shareChannelsType.push({icon:value.icon,title:key});
                                } else {
                                    var isSaved = false;
                                    for(var i=0; i<shareChannelsType.length; i++){
                                        if(shareChannelsType[i].icon === value.icon){
                                            isSaved = true;
                                        }
                                    }

                                    if(!isSaved){shareChannelsType.push({icon:value.icon,title:key})}
                                }
                                !value.active && (value.active = true);
                            }
                        });
                    });
                    angular.forEach(scope.socialChannelArrByType,function(val){
                        angular.forEach(scope.channelTypes,function(value){
                            if(val.icon === value.iconClass){
                                if(val.data[0]){
                                    angular.forEach(val.data, function (va) {
                                        var type = va.socialChannelType.toLowerCase();
                                        if(type === 'facebook'){
                                            if(va.pageId){
                                                va.avatarPic = commonServices.getProfilePicByTypeAndId(type,va.pageId);
                                            } else {
                                                va.avatarPic = commonServices.getProfilePicByTypeAndId(type,va.facebookId);
                                            }
                                        } else if(type === 'twitter'){
                                            va.avatarPic = commonServices.getProfilePicByTypeAndId(type,va.screenName);
                                        }
                                        val.iconClass = commonServices.getIconClassByType(va.socialChannelType);
                                        if(scope.sharingRule){
                                            angular.forEach(scope.sharingRule.postOnSocialChannel,function(v){
                                                if(v == va.id){
                                                    va.selected = true;
                                                }
                                            })
                                        }
                                    });
                                }
                                value.data = val.data;
                            }

                        })
                    });
                    scope.shareChannelsType = shareChannelsType;

                    return arr;
                }



                getShareSocialChannel();

                function getShareSocialChannel(){
                    dalockrServices.getShareSocialChannelWithCache(function(data) {

                        var socialChannelArrByType = {};

                        angular.forEach(angular.copy(data),function(value, key){

                            var isHaveActiveChild = false;

                            if(scope.sharingRule){
                                for(var i=0; i<scope.sharingRule.postOnSocialChannel.length;i++){
                                    if(scope.sharingRule.postOnSocialChannel[i] === value.id){
                                        value.sharingRuleActive = true;
                                        !isHaveActiveChild && (isHaveActiveChild = true);
                                    }
                                }
                            }

                            if(value.shareType === "TO_CHANNEL") {
                                if (!socialChannelArrByType[value.socialChannelType]) {
                                    socialChannelArrByType[value.socialChannelType] = {icon: '', active: false, data: []};
                                    socialChannelArrByType[value.socialChannelType].icon = commonServices.getIconClassByType(value.socialChannelType);
                                    socialChannelArrByType[value.socialChannelType].data.push(value);
                                } else {
                                    socialChannelArrByType[value.socialChannelType].data.push(value);
                                }
                                if (isHaveActiveChild) {
                                    socialChannelArrByType[value.socialChannelType].active = true;
                                }
                            }
                        });
                        scope.socialChannelArrByType = socialChannelArrByType;
                        getActiveChannel();
                    });
                }




                scope.selectedThisAccount = function (account) {
                    account.active = account.active ? false : true;
                    angular.forEach(account.data, function (value) {
                        value.sharingRuleActive = account.active;
                    });
                    getActiveChannel();
                };

                scope.switchSRTab = function (tab) {
                    scope.currentSRTab = tab;
                };


                scope.updateSharingChannelActive = function (item, parent) {
                    item.sharingRuleActive = item.sharingRuleActive ? false : true;
                    getActiveChannel();
                };

                scope.updateSharingRule = function(){
                    dalockrServices.setSharingRuleForUser(scope.sharingRule.id,function(data){
                        $rootScope.$broadcast('reloadUserSharingRule');
                        toastr.success('SharingRule' + data.sharingRule.name + 'has successfully been updated.','Success');
                    },function(error){
                        toastr.error(JSON.parse(error.responseText).message,'Error');
                    });
                };

                scope.deleteSharingRule = function(){
                    dalockrServices.deleteSharingRule(scope.sharingRule.id, function(data){
                        toastr.success('Delete success','Success');
                        $rootScope.$broadcast('reloadUserSharingRule');
                    },function(error){
                        toastr.error(JSON.parse(error.responseText).message,'Error');
                    });
                };


                function saveThisSharingRule(){

                    function arraysEqual(a, b) {
                        if (a === b) return true;
                        if (a == null || b == null) return false;
                        if (a.length != b.length) return false;

                        for (var i = 0; i < a.length; ++i) {
                            if (a[i] !== b[i]) return false;
                        }
                        return true;
                    }

                    var isDuplicated = false;

                    //angular.forEach(commonServices.getCurrentSharingRule(), function (e) {
                    //});

                    if(!isDuplicated){
                        if(!scope.sharingRulesName.name) {
                            elem.find('#add-sharingrule-name').focus();
                            return;
                        }

                        var sharingRule = {
                            sharingRule : {
                                name:scope.sharingRulesName.name,
                                description:scope.sharingRulesName.description,
                                mimeType: formatMimeType(),
                                license : scope.ccType,
                                postOnSocialChannel : selectedSocialData
                            }
                        };
                        scope.isAdding = true;
                        dalockrServices.CreateSharingrule(sharingRule,function(data){
                            if(scope.lockrId){
                                dalockrServices.assignSharingRuleForLockr(scope.lockrId,data.sharingRule.id).success(function (d) {

                                    if(d.lockr){
                                        $rootScope.$broadcast('$$reloadLockrSharingRule',d.lockr.sharingRule);
                                    }
                                    toastr.success('Add success','Success');
                                    scope.isAdding = false;
                                    $mdDialog.hide();
                                }).error(function (error) {
                                    scope.isAdding = false;
                                    dalockrServices.deleteSharingRule(data.sharingRule.id,function(data){
                                    },function(error){
                                        console.log('error');
                                    });
                                    toastr.error(error.message, 'Error');
                                });

                            } else {
                                scope.$apply(function(){
                                    toastr.success('Add success','Success');
                                    $mdDialog.hide();
                                });
                                $rootScope.$broadcast('reloadUserSharingRule');
                                $rootScope.$broadcast('newLockrSharing',data);
                            }

                        },function(error){
                            scope.isAdding = false;
                            toastr.error(JSON.parse(error.responseText).message,'Error');
                            scope.$apply();
                        });
                    }

                }

                var watcher = scope.$watch('creativeCommons', function () {

                    if(angular.isUndefined( scope.creativeCommons.isShare)) return;

                    var ccTypeString = '';
                    var ccType = '';

                    var isShare = scope.creativeCommons.isShare;
                    var isCommercial = scope.creativeCommons.isCommercial;
                    if(isShare === '1' && isCommercial === '1'){
                        ccType = 'CC_BY';
                        ccTypeString = 'Creative Commons Attribution 4.0 International License Agreement';
                    } else if(isShare === '1' && isCommercial ==='0'){
                        ccType = 'CC_BY_NC';
                        ccTypeString = 'Creative Commons Attribution - NonCommercial 4.0 International License Agreement';
                    } else if(isShare === '0' && isCommercial === '1'){
                        ccType = 'CC_BY_ND';
                        ccTypeString = 'Creative Commons Attribution - No Derivative Works 4.0 International License Agreement';
                    } else if(isShare === '0' && isCommercial === '0'){
                        ccType = 'CC_BY_NC_ND';
                        ccTypeString = 'Creative Commons Attribution - Noncommercial - No Derivative Works 4.0 International License Agreement';
                    } else if(isShare === '-1' && isCommercial === '1'){
                        ccType = 'CC_BY_SA';
                        ccTypeString = 'Creative Commons Attribution - Share Alike 4.0 International License Agreement';
                    } else if(isShare === '-1' && isCommercial === '0'){
                        ccType = 'CC_BY_NC_SA';
                        ccTypeString = 'Creative Commons Attribution - NonCommercial - ShareAlike 4.0 International License Agreement';
                    }
                    scope.ccTypeImage = 'images/cc/' + ccType.toLowerCase() + '.png';
                    scope.ccTypeString = ccTypeString;
                    scope.ccType = ccType;
                    dalockrServices.getLicenseData(scope.ccType, function (data) {
                        if(data){
                            scope.ccDescription = data.description;
                            scope.ccLinks = data.links;
                        }
                    });

                },true);

                scope.$on('$destory', function () {
                    watcher();
                });
            }
        }
    }).directive('uploadAvatar',['Upload','appConfig','toastr','userServices','$rootScope',function (Upload,appConfig,toastr,userServices,$rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'views/templates/upload-avatar.html',
            replace: true,
            link: function (scope,element) {


                scope.haveSelectedImage = false;
                var imageFile;
                var inputAvatar = element.find('#upload-avatar-input');
                var dropBox = element.find('#upload-avatar-area');
                var options = {
                    readAsDefault: "DataURL",
                    on: {
                        load: function(e, file) {
                            //var img = new Image();
                            //img.onload = function() {
                            //    //document.body.appendChild(img);
                            //};
                            //img.src = e.target.result;
                            imageFile = file;
                            scope.haveSelectedImage = true;
                            scope.userAvatarPreview = e.target.result;
                            scope.$apply();
                        }
                    }
                };

                FileReaderJS.setupInput(inputAvatar[0], options);
                FileReaderJS.setupDrop(dropBox[0],options);

                scope.uploadNewAvatar = function () {
                    inputAvatar.click();
                };


                scope.uploadAvatar = function () {
                    scope.loadingInProgress = true;
                    var authToken = userServices.getAccessToken();
                    Upload.upload({
                        url: appConfig.API_SERVER_ADDRESS + '/api/user/avatar?'+'token=' + authToken, //upload.php script, node.js route, or servlet url
                        method: 'POST',
                        file: imageFile
                    }).success(function(data, status, headers, config) {        // file is uploaded successfully
                        toastr.success('Upload success','Success');
                        $rootScope.$broadcast('uploadAvatarSuccess',scope.userAvatarPreview);
                    }).error(function(data,status){
                        scope.loadingInProgress = false;
                        toastr.error(data.message,'Error');
                    });
                }
            }
        }
    }])
    .directive('autoCenterMonsary', function (commonServices,$timeout,$dalMedia) {
        return {
            restrict:'A',
            link: function (scope,element) {
                // Mobile端
                var cardWidth = 240;
                var mainMaWrapper, mainListWrapper;
                if($dalMedia('max-width: 599px')){
                    $timeout(function () {
                        mainMaWrapper = element;
                        mainListWrapper = element.parent();
                        mainMaWrapper.addClass('center');
                        resizeMasonry();
                    },800);
                }

                scope.$watch(function() {
                    return $dalMedia('max-width: 599px');
                }, function(val) {
                    if(val){
                        mainMaWrapper = element;
                        mainListWrapper = element.parent();
                        mainMaWrapper.addClass('center');
                        resizeMasonry();
                    } else {
                        mainMaWrapper = element;
                        mainListWrapper = element.parent();
                        mainMaWrapper.removeClass('center').css('width','auto');
                    }
                });

                function resizeMasonry(){
                    var innerWidth = mainListWrapper.innerWidth();
                    mainMaWrapper.css('width',cardWidth * Math.floor(innerWidth / cardWidth));
                }

            }
        }
    })
    .directive('shareLimit', function () {

        /*
         inpu 字数限制
         */

        return {
            restrict:'A',
            link: function (scope,element,attrs) {
                //console.log(scope.$eval(attr['shareLimit']));

                attrs.$observe('shareLimit', function (v) {
                    var val = scope.$eval(attrs['shareLimit']);
                    if(val === true){
                        addMaxLength();
                    } else {
                        removeMaxLength();
                    }
                });


                function addMaxLength(){
                    element.attr('maxLength',140);
                    element.parent().addClass('max-length-view');
                }

                function removeMaxLength(){
                    element.attr('maxLength','auto');
                    element.parent().removeClass('max-length-view');
                }

            }
        }

    })
    .directive('dailyStats',['commonServices',function (commonServices) {
        return {
            restrict:'EA',
            scope:{
                seriesData:'=',
                showTitle:'@',
                confirmHeight:'@'
            },
            templateUrl:'views/templates/daily-stats.html',
            link: function (scope, element) {

                scope.currentId = 'chart-' + commonServices.uuid();
                scope.currentMode = 'visits';

                scope.legends = {};
                var toDrawFunc = null;
                var hc = false,
                    chartInstance = null;

                scope.loadingStats = true;

                $LAB
                    .script("lazy-load-js/highcharts.js")
                    .wait(function () {
                        toDrawFunc && toDrawFunc(formatData(scope.seriesData));
                        hc = true;
                    });

                scope.$watch('seriesData', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        if(hc){
                            startToDraw(formatData(newVal));
                        } else {
                            toDrawFunc = startToDraw;
                        }
                    }
                }, true);


                scope.switchSeeMode = function (mode) {
                    scope.currentMode = mode;
                    if(hc){
                        scope.seriesData && startToDraw(formatData(scope.seriesData))
                    } else {
                        toDrawFunc = startToDraw;
                    }
                };
                scope.switchSeeMode('visits');


                scope.selectSerie = function(key){
                    key = key == 'default' ? 'publishing point' : key;
                    var serie,
                        tmp;
                    for (var i = chartInstance.series.length - 1; i >= 0; i--) {
                        serie = chartInstance.series[i];
                        if (serie.name == key) break;
                    }

            

                    if (serie) {
                        tmp = key == 'publishing point' ? 'default' : key;
                        scope.legends[tmp].selected = !scope.legends[tmp].selected;
                        serie.setVisible(scope.legends[tmp].selected);
                    }

                }

                function startToDraw(d) {
                    chartInstance = Highcharts.chart(scope.currentId,{
                        chart: {
                            type: 'area',
                            height:200
                            // spacing:[8,8,8,8]
                        },
                        title: {
                            text: ''
                        },
                        xAxis: {
                            type:'datetime',
                            visible: false,
                            dateTimeLabelFormats: {
                                month: '%e. %b',
                                year: '%b'
                            }
                        },
                        legend:{
                            enabled:false
                        },
                        yAxis: {
                            visible: false,
                            title: {
                                text: ''
                            },
                            labels: {
                                formatter: function () {
                                    return this.value;
                                }
                            }
                        },
                        tooltip: {
                            pointFormat: '{series.name} <b>{point.y:,.0f}</b>'
                        },
                        plotOptions: {
                            area: {
                                pointStart: 0,
                                marker: {
                                    enabled: false,
                                    symbol: 'circle',
                                    radius: 2,
                                    states: {
                                        hover: {
                                            enabled: true
                                        }
                                    }
                                }
                            }
                        },
                        series: d.series
                    });
                }


                function formatData(d) {

                    scope.legends = {
                        facebook:{
                            color:'#0097af',
                            icon:'dalello-icon-fb_black',
                            active:false,
                            selected:true
                        },
                       
                        twitter:{
                            color:'#d0011b',
                            icon:'dalello-icon-twitter_black',
                            active:false,
                            selected:true
                        },
                         default:{
                            color:'#006fd5',
                            icon:'dalello-icon-publishing_point_rounded',
                            active:false,
                            selected:true
                        },
                        evernote:{
                            color:'#390036',
                            icon:'dalello-icon-evernote',
                            active:false,
                            selected:true
                        },
                        dropbox:{
                            color:'#D0011B',
                            icon:'dalello-icon-dropbox',
                            active:false,
                            selected:true
                        },
                        instagram:{
                            color:'#A05E24',
                            icon:'dalello-icon-instagram_black',
                             active:false,
                            selected:true
                        },
                        pinterest:{
                            color:'#A05E24',
                            icon:'dalello-icon-pinterest_black',
                             active:false,
                            selected:true
                        },
                        linkedin:{
                            color:'#3DCD58',
                            icon:'dalello-icon-linkedin_black',
                            active:false,
                            selected:true
                        }
                        // youtube:{
                        //     color:'#33B5E5',
                        //     icon:'dalello-icon-google-+-black',
                        //     active:false,
                        //     selected:true
                        // },
                        // google:{
                        //     color:'#0097AF',
                        //     icon:'dalello-icon-google-+-black',
                        //     active:false,
                        //     selected:true
                        // }
                    };


                    var result = [];
                    var fillColor;
                    var dataset;
                    var total = 0;


                    if(scope.currentMode === 'comments'){
                        dataset = d.comments;
                        scope.hideLoading = true;
                    } else {
                        dataset = d.views;
                        scope.hideLoading = true;
                    }

                    angular.forEach(dataset, function (value, key) {

                        key = key.toLowerCase();

                        angular.forEach(value, function (v, k) {
                            total += Number(v[1]);
                        });
                        
                        if (!scope.legends[key]) return;

                        scope.legends[key].active = true;
                        fillColor = scope.legends[key].color || '#006fd5';

                        // switch (key.toLowerCase()){
                        //     case 'default':
                        //         fillColor = '#006fd5';
                        //         break;
                        //     case 'facebook':
                        //         fillColor = '#0097af';
                        //         break;
                        //     case 'google':
                        //         fillColor = '#0097AF';
                        //         break;
                        //     case 'youtube':
                        //         fillColor = '#33B5E5';
                        //         break;
                        //     case 'linkedin':
                        //         fillColor = '#3DCD58';
                        //         break;
                        //     case 'twitter':
                        //         fillColor = '#d0011b';
                        //         break;
                        //     case 'pinterest':
                        //         fillColor = '#A05E24';
                        //         break;
                        //     case 'dropbox':
                        //         fillColor = '#D0011B';
                        //         break;
                        //     case 'evernote':
                        //         fillColor = '#390036';
                        //         break;
                        //     case 'flickr':
                        //         fillColor = '#ff0084';
                        //         break;
                        // }
                        result.push({
                            name:key == 'default' ? 'publishing point' : key,
                            color:fillColor,
                            fillOpacity: 0.45,
                            lineColor:fillColor,
                            lineWidth:2,
                            data:value
                        });
                    });

                    scope.currentModeTotalNumber = total;

                    return {
                        series:result
                    };
                }

            }



        }





    }])
    .directive('sublockrInfo',['$rootScope','$mdSidenav',function ($rootScope,$mdSidenav) {
        return {
            restrict:'EA',
            replace:true,
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/mobile/mobile-sublockr-info.html';
                }
                return 'views/templates/sublockr-info.html';
            },
            link: function (scope, element) {

                scope.currentTab = 'info';

                scope.closeDetailsInfo = function () {
                    $mdSidenav('left')
                        .toggle();
                    angular.element('#sublockr-details-view').removeClass('fullscreen-view');
                };

                //element.find('.m-sublockr-scroll-view').bind('wheel', function (e) {
                //    e.stopPropagation();
                //});

                scope.switchInfoTab = function (item) {
                    scope.currentTab = item;
                };
            }
        }
    }])
    .directive('scrollMeFixedBar',['commonServices',function (commonServices) {
        return {
            restrict:'EA',
            controller: function () {
                var listeners = [];
                this.registerListener = function (cb) {
                    listeners.push(cb);
                };
                this.getListener = function () {
                    return listeners;
                };
            },
            require:'^scrollMeFixedBar',
            link: function (scope,element,attrs,meC) {
                var mTabs;
                var mFixedTabs;
                var mFixedNavbar;
                var state = 'normal'; //正常状态
                var listeners = meC.getListener();

                element.bind('scroll', function ($event) {
                    mTabs = mTabs || element.find('.m-tabs-normal');
                    if(mTabs.offset().top <= 56 && state == 'normal'){
                        state = 'top'; //置顶状态
                        handleState(state);
                    } else if(mTabs.offset().top > 56 && state == 'top'){
                        state = 'normal'; //正常状态
                        handleState(state);
                    }
                    angular.forEach(listeners, function (v) {
                        v($event);
                    });
                });

                function handleState(state){
                    mFixedTabs = mFixedTabs || element.find('.m-tabs-fixed');
                    mFixedNavbar = mFixedNavbar || element.find('.m-fixed-navbar');
                    switch (state){
                        case 'normal':
                            mFixedTabs.toggleClass('display-flex');
                            mFixedNavbar.toggleClass('m-path-flex');
                            break;
                        case 'top':
                            mFixedTabs.toggleClass('display-flex');
                            mFixedNavbar.toggleClass('m-path-flex');
                            break;
                    }
                }
            }
        }
    }])
    .directive('imageLoaded',[function () {
        return {
            restrict:'EA',
            link: function (scope, element) {
                element[0].onload = function () {
                    scope.$apply(function () {
                        scope.currentAssetDetails.imageLoading = false;
                    });
                };
            }
        }
    }])
    .service('modalMenuService', function ($rootScope,$compile) {
        this.open = function (entity,state) {
            var scope = $rootScope.$new();
            scope.entity = entity;
            scope.state = state;
            var menuElement = $compile(angular.element('<operation-modal-menu entity-state="state" entity-data="entity" ></operation-modal-menu>'))(scope);
            angular.element('body').append(menuElement);
        };
    })
    .directive('operationModalMenu', function ($mdSidenav,$rootScope,cacheService,userRightServices) {
        return {
            restrict:'EA',
            scope:{
                entityData:'=',
                entityState:'='
            },
            templateUrl:'views/templates/operation.modal.menu.html',
            link: function (scope, element) {
                if(scope.entityState === 'Published') {
                    scope.Assetstate = 'Unpublish Asset'
                } else {
                    scope.Assetstate = 'Publish Asset'
                }

                scope.closeThisMenu = function () {
                    if(element) {
                        element.remove();
                    }
                };

                var lockr;
                if( lockr = cacheService.getLockrStackTopElement()){
                    scope.locked = lockr.hiddenFromPublicView;
                    scope.noContentManager = !userRightServices.isContentManager(lockr.id,lockr.hierarchy);
                }

                scope.openLockrDetails = function () {
                    angular.element('#sublockr-details-view').addClass('fullscreen-view');
                    $mdSidenav('left')
                        .toggle();
                    scope.closeThisMenu();
                };
                scope.managePermissionsAndUser = function () {
                    $rootScope.$broadcast('$$openAssignLockrDialog');
                    scope.closeThisMenu();
                };
                scope.inviteUserToPrivateLockr = function () {
                    $rootScope.$broadcast('$$InviteUser');
                    scope.closeThisMenu();
                };
                scope.managePublishPoint = function () {
                    $rootScope.$broadcast('$$openManagePpDialog');
                    scope.closeThisMenu();
                };

                scope.editAsset = function () {
                    $rootScope.$broadcast('editAsset',null);
                    scope.closeThisMenu();
                };

                scope.publishAsset = function () {
                    $rootScope.$broadcast('$$publishAsset',null);
                    scope.closeThisMenu();
                };
            }
        }
    })
    .directive('filterToolbar',['$dalMedia','$rootScope',function ($dalMedia,$rootScope) {
        return {
            restrict:'E',
            templateUrl:'views/directives/component/filter-toolbar.html',
            scope:{
                showText:'=',
                showHeader:'=',
                resultCallback:'&'
            },
            link: function (scope,element) {

                scope.mobileDevice = $dalMedia('xs');
                scope.textvalue='All Lockrs';
                scope.filterItems = [
                    {
                        icon:'dalello-icon-mylocker_black',
                        active:true,
                        delegate:'allLockr',
                        delegateValue:true,
                        tooltip:'All Lockrs'
                    },
                    {
                        icon:'dalello-icon-unpublish_black',
                        active:false,
                        delegate:'state',
                        delegateValue:'Draft',
                        tooltip:'Unpublished Lockrs'
                    },
                    {
                        icon:'dalello-icon-private_locker_black',
                        active:false,
                        delegate:'hiddenFromPublicView',
                        delegateValue:true,
                        tooltip:'Private Lockrs'
                    },
                    {
                        icon:'dalello-icon-likes_black',
                        active:false,
                        delegate:'haveFollowers',
                        delegateValue:true,
                        tooltip:'Followed Lockrs'

                    },
                    {
                        icon:'dalello-icon-store_locker_black',
                        active:false,
                        delegate:'lockrType',
                        delegateValue:'StoreLockr',
                        tooltip:'Store Lockrs'
                    },
                    {
                        icon:'dalello-icon-music_black',
                        active:false,
                        delegate:'mimeType',
                        delegateValue:'audio',
                        tooltip:'Audio'

                    }
                ];
                //scope.openFilterItem
                scope.openFilterItem = false;
                scope.$watch('scope.openFilterItem',function(){
                    $rootScope.$broadcast('issublockr',false);
                });
                scope.openFilterList = function () {
                    scope.openFilterItem = !scope.openFilterItem;
                    scope.showFilterItemList = true;
                    $rootScope.$broadcast('openFilterItemBack');
                };
                scope.open = function () {
                    scope.openFilterItem = !scope.openFilterItem;
                };
                scope.$on('closeFilterItemBack',function(){
                   if(scope.showFilterItemList ){
                       scope.showFilterItemList = false;
                    }
                });
                scope.selectOrUnselectItem = function (item) {
                    if(scope.showFilterItemList ){
                        $rootScope.$broadcast('DcloseFilterItemBack');
                        scope.textvalue=item.tooltip;
                    }
                    item.active = !item.active;
                    scope.activeItems = [];
                    var result = {};
                    var flag=0;
                    angular.forEach(scope.filterItems, function (v) {
                        if(v.active&&v.tooltip!='All Lockrs'&&scope.textvalue==v.tooltip){
                            result[v.delegate] = v.delegateValue;
                            scope.activeItems.push(v);
                            flag=1;
                            return;
                        }
                    });
                    if(flag==0)
                    {
                        angular.forEach(scope.filterItems, function (v) {
                            if(v.tooltip=='All Lockrs'){
                               v.active=true;
                                scope.textvalue='All Lockrs';
                            }
                            else{
                                v.active=false;
                            }
                        });
                    }
                    else
                    {
                        angular.forEach(scope.filterItems, function (v) {
                            if(v.active&&scope.textvalue!=v.tooltip){
                                v.active=false;
                                return ;
                            }
                        });
                    }
                    scope.resultCallback({data:result});
                };
            }
        }


    }])
    .service('cropAndUploadAvatar',['$mdDialog','$dalMedia','userServices','Upload','appConfig','toastr','commonServices',function ($mdDialog,$dalMedia,userServices,Upload,appConfig,toastr,commonServices) {
        var self = this;
        var imageEntity;

        self.open = function (img) {

            imageEntity = img;
            return $mdDialog.show({
                    controller: cropAndUploadAvatarController,
                    templateUrl: 'views/templates/crop-avatar-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose:true,
                    fullscreen: $dalMedia('xs')
                });
        };

        function cropAndUploadAvatarController($scope){
            $scope.hide = function () {
                $mdDialog.hide({success:false});
            };

            $scope.myCroppedImage='';
            $scope.myImage = imageEntity;
            $scope.uploadAvatar = uploadAvatar;


            function uploadAvatar() {

                var cropImage = $scope.myCroppedImage;
                var blobFile =  commonServices.convertBase64UrlToBlob(cropImage);
                //var formData = new FormData();
                //formData.append('user_avatar.png',blobFile);
                $scope.uploading = true;
                var authToken = userServices.getAccessToken();
                Upload.upload({
                    url: appConfig.API_SERVER_ADDRESS + '/api/user/avatar?'+'token=' + authToken, //upload.php script, node.js route, or servlet url
                    method: 'POST',
                    file: blobFile
                }).progress(function(evt) {
                        $scope.determinateValue = parseInt(100.0 * evt.loaded / evt.total);
                    })
                    .success(function() {
                    toastr.success('Avatar updated','Success');
                        $scope.uploading = false;
                        $mdDialog.hide({success:true,image:cropImage});
                }).error(function(data){
                    toastr.error(data.message,'Error');
                    $scope.uploading = false;
                });
            }

        }

    }])


.service('cropAndUploadThumb',['$mdDialog','$dalMedia','userServices','Upload','appConfig','toastr','commonServices','dalockrServices','$rootScope',function ($mdDialog,$dalMedia,userServices,Upload,appConfig,toastr,commonServices,dalockrServices,$rootScope) {
    var self = this;
    var imageEntity;
    var lockrid;
    var uploadFile;
    self.open = function (img,fi,id) {
        lockrid = id;
        uploadFile = fi;
        imageEntity = img;

        return $mdDialog.show({
            controller: cropAndUploadThumbController,
            templateUrl: 'views/templates/crop-thumbnail-dialog.html',
            parent: angular.element(document.body),
            targetEvent: null,
            clickOutsideToClose:true,
            fullscreen: $dalMedia('xs')
        });
    };

    function cropAndUploadThumbController($scope){
        $rootScope.$broadcast('closeselectthumb',false);
        $scope.hide = function () {
            $mdDialog.hide({success:false});
        };

        $scope.resImgFormat = 'image/jpeg';
        $scope.myCroppedImage='';
        $scope.myImage = imageEntity;
        $scope.uploadAvatar = uploadThumbnail;


        function uploadThumbnail() {

            var cropImage = $scope.croppedThumbnail;

            var imageData = {
                "data":cropImage,
                "mimeType": "image/jpeg"
            };

            dalockrServices.uploadEncodedTn(lockrid,imageData).success(function(data){
                $rootScope.$broadcast('uploadthumbnail',lockrid);
                dalockrServices.getLockrDetails(lockrid).success(function(data){
                }).error(function(error){
                    console.log(error);
                });
                $scope.hide();
                toastr.success('Thumbnail updated','Success');
            }).error(function(){
                $scope.hide();
                toastr.error('Thumbnail update failed','Error');
            });




            //Upload.upload({
            //    url: appConfig.API_SERVER_ADDRESS + '/api/lockr/thumbnail',
            //    data: {
            //        method: 'POST',
            //        content: cropImage,
            //        lockrId:lockrid
            //    },
            //}).then(function (response) {
            //    toastr.success('Avatar updated','Success');
            //    $scope.uploading = false;
            //    $mdDialog.hide({success:true,image:cropImage});
            //}, function (response) {
            //    toastr.error(data.message,'Error');
            //    $scope.uploading = false;
            //    //console.log(response);
            //}, function (evt) {
            //    //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            //});
        }

    }

}])

    .directive('pdfView',['dalockrServices','$compile','$timeout','commonServices',function(dalockrServices,$compile,$timeout,commonServices){

    return {
        restrict:'E',
        template:'<div class="pdf-view">' +
        '<div layout="row" class="loading" ng-if="loading || errorMessage" layout-align="center center">' +
        '<md-progress-circular ng-if="loading" md-mode="indeterminate"></md-progress-circular>' +
        '<span ng-if="errorMessage" class="color-warning">{{::errorMessage}}</span>' +
        '</div>' +
        '<div class="toolbar" layout="row" layout-align="start center">' +
        '<span flex></span>' +
        '<div layout="row" layout-align="start center">' +
        '<i ng-click="zoomOut()" style="color: white;font-size: 18px;padding: 0 8px;" class="mdi mdi-minus"></i>' +
        '<i ng-click="goPrevious()" class="mdi mdi-menu-up white" style="font-size: 22px;cursor: pointer;"></i>' +
        '<span style="width: 8px;"></span>' +
        '<input ng-model="pageNum" type="text" style="border: none;outline: none;max-width: 40px;max-height: 16px;padding: 2px;font-size: 12px;">' +
        '<span style="margin-left:5px;" class="white"> / {{pageCount}}</span>' +
        '<span style="width: 8px;"></span>' +
        '<i ng-click="goNext()" class="mdi mdi-menu-down white" style="font-size: 22px;cursor: pointer;"></i>' +
        '<i ng-click="zoomIn()" style="color: white;font-size: 18px;padding: 0 8px;" class="mdi mdi-plus"></i>' +
        '</div>' +
        '<span flex></span>' +
        '</div>' +
        '<div class="wrapper">' +
        '<div class="canvasWrapper">' +
        '' +
        '</div>' +
        '</div>' +
        '</div>',
        scope:{
            currentAssetId:'@'
        },
        replace:true,
        link: function (scope, element) {
            $LAB
                .script("lazy-load-js/pdf.js")
                .script("lazy-load-js/pdf.worker.js")
                .wait(function () {

                    var elem =  $compile(angular.element('<ng-pdf template-url="/partials/pdf-viewer.html"></ng-pdf>'))(scope);
                    element.find('.canvasWrapper').append(elem);

                    scope.pdfUrl = dalockrServices.getAssetSrc('asset',scope.currentAssetId);
                    scope.loading = true;

                    scope.onLoad = function () {
                        scope.loading = false;
                    };
                    scope.onError = function (error) {
                        scope.loading = false;
                        if(error.message){
                            scope.errorMessage = error.message;
                        } else {
                            scope.errorMessage = "Unknown error";
                        }
                    };

                    scope.$apply();

                });
        }
    }
}])
.service('dlAlert', function ($q,$rootScope,$compile) {

    var self = this;
    var defaultOptions = {
        title:'',
        message:'',
        cancelBtnText:'CANCEL',
        confirmBtnText:'OK'
    };
    var template = '<div class="dl-alert-view" layout="row" layout-align="center center">' +
        '<div class="dl-alert-content" layout="column">' +
        '<h5 class="text-center">{{::options.title}}</h5>' +
        '<p class="text-center">{{::options.message}}</p>' +
        '<div layout="row">' +
        '<md-button ng-click="cancel()">{{::options.cancelBtnText}}</md-button>' +
        '<span flex></span>' +
        '<md-button ng-click="confirm()">{{::options.confirmBtnText}}</md-button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '' +
        '' +
        '';


    self.show = function (op) {
        var defer = $q.defer();
        var options = angular.extend(defaultOptions,op);
        var body = angular.element('body');
        var alert;

        var scope = $rootScope.$new();
        scope.options = options;
        scope.cancel = function () {
            alert.remove();
            defer.reject(0);
        };
        scope.confirm = function () {
            alert.remove();
            defer.resolve(1);
        };
        alert = $compile(angular.element(template))(scope);
        body.append(alert);

        return defer.promise;
    };


})

/**
 * 单个Account详情管理模态框
 */
    .service('accountInfoManager',['$q','$compile','$rootScope','commonServices','$window',function ($q,$compile,$rootScope,commonServices,$window) {

        var self = this,
            body = angular.element('body'),
            aimv;

        self.show = function (entity) {

            $window.scrollTo(0,0);
            commonServices.banBodyScroll();

            var defer = $q.defer(),
                scope = $rootScope.$new();
            scope.accountEntity = entity;
            scope.resultCallback = function (result) {
                aimv.remove();
                defer.resolve(result);
                commonServices.allowBodyScroll();
            };
            aimv = $compile(angular.element('<account-info-manage-view account-entity="accountEntity" result-callback="resultCallback(result)"></account-info-manage-view>'))(scope);
            body.append(aimv);
            return defer.promise;
        };

    }])


    .directive('accountInfoManageView',['dalockrServices','toastr','userRightServices','$dalMedia','$timeout','$q','$rootScope','$mdDialog','accountmanager','appConfig','userServices','commonServices','thumbnailServices','cropAndUploadThumb',function (dalockrServices,toastr,userRightServices,$dalMedia,$timeout,$q,$rootScope,$mdDialog,accountmanager,appConfig,userServices,commonServices,thumbnailServices,cropAndUploadThumb) {
        return {
            restrict:'E',
            scope:{
                resultCallback:'&',
                accountEntity:'='
            },
            replace:true,
            templateUrl:'views/templates/account-info-manage-view.html',
            controller: function ($scope) {
                var managers,
                    accountId = $scope.accountEntity.aId;
                $scope.lockrlitst = [];
                var lockridlitst = [];
                var managerarray = [];
                var resetForm = function () {
                    $scope.adduserlist = {
                        clusterId:'',
                        username:'',
                        password:'',
                        firstName:'',
                        lastName:'',
                        email:'',
                        phoneNumber:'',
                        accountId:accountId,
                        isAssignManager:false
                    };
                };


                $scope.channelTypesname = 'Facebook';

                $scope.channelTypes = [
                    {
                        active:true,
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
                    },
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




                $scope.currentTab = 'info';
                $scope.isIntegrator = userRightServices.getUserRoles().INTEGRATOR;
                $scope.addassignmanager = false;
                $scope.mobileDevice = $dalMedia('xs');
                $scope.isUpdating = false;
                $scope.currentTabItem = 'info';
                $scope.accountLockrInfo = '';
                $scope.accountthumbnailUrl = ($scope.accountEntity.aDet && $scope.accountEntity.aDet.thumbnailUrl) || $scope.accountEntity.thumbnailUrl;

                $rootScope.$on('uploadthumbnail',function(ev,val){
                    console.log(val);
                    console.log(111);
                });

                resetForm();
                getAccountInfo();

                $scope.switchChannelType = function (rule) {
                    //rule.channelActive = type.name;
                    $scope.channelTypesname = rule.name;
                    angular.forEach($scope.channelTypes,function(val,ind){
                        if(val.name === rule.name){
                            val.active = true;
                        }else{
                            val.active = false;
                        }
                    });
                };
                $scope.socialChooseType = 'CHOOSE YOUR SOCIAL CHANNEL'
                $scope.selectType = function (key) {
                    $scope.socialChooseType = key.name;
                    if(key.name == 'Facebook'){
                        $scope.addSocialChannelForAccount(key.name,true);
                    }else{
                        $scope.addSocialChannelForAccount(key.name);
                    }
                };
                $scope.backFromEditInfo = function(){
                    $scope.EditInfoMessage = false;
                };
                $scope.updateFromEditInfo = function(){
                    $scope.EditInfoMessage = false;
                    var entity = angular.copy($scope.infoCurrentEntity);
                    //entity.allowUserChannels = String(entity.allowUserChannels);
                    $scope.accountInfo.name = entity.name;
                    $scope.accountInfo.clusterId = entity.clusterId;
                    dalockrServices.updateAccount(entity,accountId).success(successHandler).error(errorHandler);
                };

                $scope.infoEditLockr = function(data){
                    $scope.EditInfoMessage = true;
                    $scope.infoCurrentEntity = {
                        name: data.name,
                        clusterId: data.clusterId,
                        accountLicense: data.accountLicense,
                        allowUserChannels: data.allowUserChannels
                    };
                };
                $scope.backForm = function(){
                    $scope.showAddShareRule = false;
                    $scope.showAddCollaborators = false;
                };

                $scope.showtext = function(){
                    $scope.showcctext = true;
                };

                $scope.showdesc = function(){
                    $scope.showcctext = false;
                };

                $scope.deleteRule = function(data){
                    angular.forEach($scope.shareRuleDetail,function(val){
                        if(data.id == val.id){
                            $scope.shareRuleDetail.splice($scope.shareRuleDetail.indexOf(val),1);
                        }
                    });

                    dalockrServices.deleteSharingRule(data.id,function(data){
                        $rootScope.$broadcast('reloadUserSharingRule');
                        toastr.success(data.message,'Success');
                    },function(error){
                        toastr.error('Error','Error');
                    });
                };

                $scope.setAsDefaultRule = function(data){
                    dalockrServices.setSharingRuleForUser(data.id,function(data){
                        $rootScope.$broadcast('reloadUserSharingRule');
                        toastr.success('SharingRule' + data.name + 'has successfully been updated.','Success');
                    },function(error){
                        toastr.error(JSON.parse(error.responseText).message,'Error');
                    });
                };
                $scope.addAccountChannel = {
                    socialState:'',
                    channelName:''
                };
                //$scope.SaveallowUserChannels = function(){
                //        var entity = {
                //            allowUserChannels:''
                //        };
                //        entity.allowUserChannels = $scope.currentEntity.allowUserChannels;
                //        dalockrServices.updateAccount(entity,accountId).success(successHandler).error(errorHandler);
                //
                //};
                $scope.$watch('currentEntity.allowUserChannels',function(newVal,oldVal){
                    if(oldVal != undefined){
                        var entity = {
                            allowUserChannels:''
                        };
                        entity.allowUserChannels = $scope.currentEntity.allowUserChannels;
                        dalockrServices.updateAccount(entity,accountId).success(successHandler).error(errorHandler);
                    }

                });

                $scope.addSocialChannelForAccount = function (name) {
                    var width = 400,
                        height = 400;
                    var iTop = (window.screen.availHeight-30-400)/2;
                    var iLeft = (window.screen.availWidth-10-400)/2;
                    if(getAddSocialChannelUrl(name)){
                        window.open(getAddSocialChannelUrl(name),'addSocialChannel','height='+height+', width='+width+', top='+iTop+',left='+iLeft+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');
                        window.addSuccess = function(){
                            getAccountInfo();
                            //dalockrServices.getAccountInfo(accountId).success(function (data) {
                            //    console.log(data);
                            //}).error(function(error){
                            //    console.log(error);
                            //})
                        }
                    }
                };
                function getAccountInfo(){
                    $scope.currentEntity = null;

                    dalockrServices.getAccountInfo(accountId).success(function (data) {
                        managers = data.managers;
                        angular.forEach(data.accountSocialChannels, function (val) {
                            val.selected = true;
                            var type = val.socialChannelType.toLowerCase();
                            if(type === 'facebook'){
                                if(val.pageId){
                                    val.avatarPic = commonServices.getProfilePicByTypeAndId(type,val.pageId);
                                } else {
                                    val.avatarPic = commonServices.getProfilePicByTypeAndId(type,val.facebookId);
                                }
                            } else if(type === 'twitter'){
                                val.avatarPic = commonServices.getProfilePicByTypeAndId(type,val.screenName);
                            }
                            val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                        });
                        $scope.accountInfo = data;
                        $scope.adduserlist.clusterId = data.clusterId;
                        $scope.currentEntity = {
                            name:data.name,
                            clusterId:data.clusterId,
                            allowUserChannels:data.allowUserChannels,
                            accountLicenseId:data.accountLicense.id
                            //trial:data.trialAccount
                        };
                    });
                }

                function getAddSocialChannelUrl(name) {
                    var ru = encodeURIComponent(appConfig.REDIRECT_URL_ADDRESS  + '/redirect.html');
                    if (typeof userServices.currentUser() === 'undefined') {
                        return null;
                    } else {
                        return appConfig.API_SERVER_ADDRESS + '/api/' + userServices.currentUser().clusterId + '/adm/add/social/channel/' + name + '?redirectUri=' + ru +'&accountId=' + $scope.accountInfo.id +'&token=' + userServices.getAccessToken();
                    }
                }

                $scope.showAddAccountChannels = function(){
                    $scope.showList = true;
                };
                $scope.saveAddAccountChannels = function(){
                    $scope.showList = false;
                };

                $scope.checkUserName = function(){
                    var useroremaildata = $scope.adduserlist.username?$scope.adduserlist.username:$scope.adduserlist.email;
                    dalockrServices.checkUserExist(useroremaildata).success(function(data){
                        var checkUserData = data;
                        $scope.roletype = 'comm';
                        $scope.rolename = data.username;
                        if($scope.adduserlist.userrole == "Community Manager"){
                            $scope.roletype = 'comm';
                            $scope.rolename = data.username;
                            getCollaborators();
                        }else if($scope.adduserlist.userrole == "Content Manager"){
                            $scope.roletype = 'conm';
                            $scope.rolename = data.username;
                            getCollaborators();
                        }else if($scope.adduserlist.userrole == 'Account Manager'){
                            $scope.showmain = false;
                            var role = 'accm';
                            dalockrServices.assignUserToAccount(accountId, $scope.rolename).success(function(data){
                            }).error(function(){
                                console.log(error);
                            });
                            getCollaborators(role,checkUserData);
                            $scope.backForm()
                        }

                    }).error(function(error){
                        $scope.isStep = 1;
                    })
                };
                $scope.toCheckUser = function(){
                    $scope.isStep = 0;
                };

                $scope.selectTabItem = function(val){
                    $scope.currentTabItem = val;
                    if(val === 'info'){

                    }
                    else if(val === 'collaborator'){
                        if(!$scope.collaborators){
                            getCollaborators();
                        }
                        $scope.infoAddCollaborators  = function(){
                            $scope.showAddCollaborators = true;
                            $scope.isStep = 0;
                        };

                    }else if(val === 'share') {
                        $scope.loadshare = true;
                        $scope.showShareRule = '';
                        $scope.infoAddShareRule  = function(){
                            $scope.showAddShareRule = true;
                        };
                        $scope.openShareRule = function (val) {
                            val.selected = !val.selected;
                        };
                        $scope.shareRuleDetail = [];
                        dalockrServices.getUserSharingRules(function (data) {
                            $scope.sharingRules = data.map(function (val) {
                                val.selected = false;
                                if(val.userDefault){
                                    $scope.selectedRule = val.id;
                                }
                                val.tabIndex = 0;
                                if(val.postOnSocialChannelDetail)
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
                            $scope.shareRuleDetail = data;
                            $scope.loadshare = false;
                        });
                        $scope.shareSwitchChannelType = function (rule,type) {
                            rule.channelActive = type.name;
                        };
                        $scope.mimeTypeIsActive = function (type, rules) {
                            return rules.mimeType.indexOf(type.mimeType) > -1;
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
                    }
                };


                $scope.accounts = commonServices.accounts();
                angular.forEach($scope.accounts,function(val,ind){
                    if(val.active){
                        managerarray.push(val.id);
                    }
                });
                $scope.chooseSocialChannels = function(channel){
                    angular.forEach($scope.accountInfo.accountSocialChannels,function(val,ind){
                        if(val === channel){
                            val.selected = !val.selected;
                        }
                    });
                };

                dalockrServices.getAllAccountLicense().success(function (data) {
                    $scope.allLicense = data;
                });

                $scope.loaduserrole = function(){
                    $scope.userrole = {
                        1:{name:'Account Manager'},
                        2:{name:'Community Manager'},
                        3:{name:'Content Manager'}
                    }
                };

                $scope.selectOtherLockr = false;


                $scope.changeItem = function (item) {
                    $scope.selectOtherLockr = item ? true : false;
                    $scope.selectLockr = item && ( item._id || item.id);
                    $scope.getLockr = item;
                    var chooselockr = '';
                    if(item){
                    var i = lockridlitst.indexOf(item._id);
                    if(i == -1){
                        $scope.lockrlitst.push(item);
                        lockridlitst.push(item._id);
                    }
                    }
                };
                $scope.DeleteAssignLockr = function(item){
                    var i = lockridlitst.indexOf(item._id);
                    $scope.lockrlitst.splice(i,1);
                    lockridlitst.splice(i,1);
                };
                $scope.createOtherNewLockr = function () {
                    var defer = $q.defer();
                    $rootScope.$broadcast('add-lockr',defer);
                    //新建成功后,返回得到该数据
                    defer.promise.then(function (data) {
                        var lockrlistdata ={
                            'name':data.lockr.name,
                            '_id':data.lockr.id
                        };
                        // $scope.showmain = false;
                        var lockr;
                        if(data && ( lockr =  data.lockr) ){
                            $scope.selectOtherLockr = true;
                            $scope.selectLockr = lockr.id;
                            $scope.lockrlitst.push(lockrlistdata);
                            lockridlitst.push(data.lockr.id);
                            // autoCompleteCallback(lockr);
                        }


                    });
                };
                $scope.registerAutoCompleteCallback = function (cb) {
                    autoCompleteCallback = cb;
                };


                $scope.searchLockrWithName = function (text) {
                    if(text.length){
                        $scope.searching = true;
                        dalockrServices.getSearch(text, function (data) {
                            $scope.lockrList = data.result.Lockr;
                            $scope.searching = false;
                            if($scope.lockrList.length){
                                $scope.selectLockr.id = $scope.lockrList[0]._id;
                            }
                        });
                    } else {
                        $scope.lockrList = null;
                    }
                };

                $scope.adduser = function(){
                    resetForm();
                    $scope.showmain = true;
                };


                $scope.adduserCancel = function(){
                    $scope.showmain = false;
                };
                $scope.saveAsset = function(){
                    var assignType = '';
                    var assignRole = '';
                    var assignUser = '';
                    var lockrdata = '';
                    var collaboratorslength = $scope.collaborators.length;
                    $scope.collaborators[collaboratorslength - 1].enterpriseLockrRoles = [];


                    // console.log($scope.lockrlitst.length);
                    if($scope.roletype === 'conm'){
                        assignType = 'WRITE_AND_MANAGE_CONTENT';
                        assignRole = 'CONTENT_MANAGER';
                        assignUser = $scope.rolename;

                        angular.forEach($scope.lockrlitst,function(val,ind){
                            lockrdata = {
                                role:assignRole,
                                lockrName:val.name
                            };
                            if($scope.collaborators[collaboratorslength - 1].enterpriseLockrRoles){
                                $scope.collaborators[collaboratorslength - 1].enterpriseLockrRoles.push(lockrdata);
                            }
                            dalockrServices.grantPermissions(val._id,'Lockr',assignType,assignUser,assignRole)
                                .then(function(response){
                                    toastr.success('EntityPermission has successfully been created.','Success');
                                    $scope.showmain = false;
                                    $scope.showassignlockr = false;
                                }).catch(function(error){
                                $scope.loadingInProgress = false;
                            if(error.data.message){
                                toastr.error(error.data.message,'Error');
                            }
                            });
                        });

                    } else if($scope.roletype  === 'comm'){
                        assignType = 'READ_AND_MANAGE_CONTENT';
                        assignRole = 'COMMUNITY_MANAGER';
                        assignUser = $scope.rolename;
                        angular.forEach($scope.lockrlitst,function(val,ind){
                            lockrdata = {
                                role:assignRole,
                                lockrName:val.name
                            };
                            if($scope.collaborators[collaboratorslength - 1].enterpriseLockrRoles){
                                $scope.collaborators[collaboratorslength - 1].enterpriseLockrRoles.push(lockrdata);
                            }
                            dalockrServices.grantPermissions(val._id,'Lockr',assignType,assignUser,assignRole)
                              .then(function(response){
                                toastr.success('EntityPermission has successfully been created.','Success');
                                $mdDialog.hide();
                                $scope.showmain = false;
                                $scope.showassignlockr = false;
                            }).catch(function(error){
                            $scope.loadingInProgress = false;
                            if(error.data.message){
                                toastr.error(error.data.message,'Error');
                            }
                          });
                        });
                    }
                    if($scope.showAddCollaborators){
                    $scope.showAddCollaborators = false;}
                };

                 $scope.postuser = function(){
                     $scope.isUpdating = true;
                     var userList = angular.copy($scope.adduserlist);
                     var isAssign = userList.isAssignManager;
                     delete userList.isAssignManager;
                     dalockrServices.createUser(userList,function(data){
                        var msg="success add user!";

                        $scope.isUpdating = false;
                        if(userList.userrole === 'Account Manager'){
                            toastr.success(msg);
                            $scope.showmain = false;
                            var role = 'accm';
                            getCollaborators(role);
                        }else if(userList.userrole === 'Content Manager'){
                            $scope.showassignlockr = true;
                            $scope.roletype = 'conm';
                            $scope.rolename = userList.username;
                            getCollaborators();
                        }else if(userList.userrole === 'Community Manager'){
                            $scope.showassignlockr = true;
                            $scope.roletype = 'comm';
                            $scope.rolename = userList.username;
                            getCollaborators();
                        }

                    },function(error){
                        $scope.isUpdating = false;
                        var errormes = error.responseText;
                        //eval("msg="+errormes);
                        toastr.error(JSON.parse(errormes).message);

                    })
                };



                $scope.switchInfoTab = function (tab) {
                    $scope.currentTab = tab;
                    //懒加载
                    if(tab == 'collaborator' && !$scope.collaborators){
                        getCollaborators();
                    }
                };

                $scope.closeThisManageBox = function () {
                    $scope.resultCallback && $scope.resultCallback();
                };

                $scope.ShowAccountManager = function(item){
                    accountmanager.open(item,accountId,$scope.ismanger,managerarray);
                };

                $scope.BecomeAccountManager = function (userdata) {
                    var i;
                    var ids = [];
                    if(userdata){
                        angular.forEach($scope.collaborators,function(val,ind){
                           if(val.id == userdata.id){
                               i = ind;
                           }
                        })
                        angular.forEach($scope.collaborators, function (v) {
                            //目前是manager的数量
                            if(v.active){
                                ids.push(v.id);
                            }
                        });
                        ids.push($scope.collaborators[i].id);
                        dalockrServices.updateAccount({managerIds:ids.join(',')},accountId).success(function(){}).error(errorHandler);


                    }else{
                        i = $scope.collaborators.length - 1;
                        angular.forEach($scope.collaborators, function (v) {
                            //目前是manager的数量
                            if(v.active){
                                ids.push(v.id);
                            }
                        });
                        ids.push($scope.collaborators[i].id);
                        dalockrServices.updateAccount({managerIds:ids.join(',')},accountId).success(function(){}).error(errorHandler);

                    }
                };


                $scope.updateAccountManager = function (item) {

                    var ids = [];
                    angular.forEach($scope.collaborators, function (v) {
                        //目前是manager的数量
                        if(v.active){
                            ids.push(v.id);
                        }
                    });

                    //如果当前的是激活状态的,就要被移除
                    if(item.active){
                        if(ids.indexOf(item.id) > -1){
                            ids.splice(ids.indexOf(item.id),1);
                        }
                    } else {
                        ids.push(item.id);
                    }
                    $scope.isUpdating = true;
                    dalockrServices.updateAccount({managerIds:ids.join(',')},accountId).success(successHandler).error(errorHandler);
                };




                $scope.canAddedSocialChannels = [
                    {
                        name:'Google',
                        iconClass:'mdi-youtube-play'
                    },
                    {
                        name:'Facebook',
                        iconClass:'mdi-facebook'
                    },
                    {
                        name:'Twitter',
                        iconClass:'mdi-twitter'
                    },
                    {
                        name:'LinkedIn',
                        iconClass:'mdi-linkedin'
                    },
                    {
                        name:'Pinterest',
                        iconClass:'mdi-pinterest'
                    },
                    {
                        name:'Instagram',
                        iconClass:'mdi-instagram'
                    }
                ];

                $scope.openChannelsMenu = function ($mdOpenMenu,ev) {
                    $mdOpenMenu(ev);
                };


                $scope.updateAccount = function () {
                    $scope.isUpdating = true;
                    var entity = angular.copy($scope.currentEntity);
                    entity.allowUserChannels = String(entity.allowUserChannels);
                    dalockrServices.updateAccount(entity,accountId).success(successHandler).error(errorHandler);
                };

                $scope.manageAccountWithOp = function (op,username) {
                    $scope.isUpdating = true;
                    switch (op){
                        case 'assign':
                            dalockrServices.assignUserToAccount(accountId,$scope.accountInfo.manageusername).success(successHandler).error(errorHandler);
                            break;
                        case 'unassign':
                            dalockrServices.removeUserFromAccount(accountId,username).success(successHandler).error(errorHandler);
                            break;
                        default :
                            break;
                    }
                };

                $scope.$on('deleteManager',function(){
                    getCollaborators();
                });




                function getCollaborators(role,userdata){
                    $scope.collaborators = null;
                    if(userdata){
                        dalockrServices.getAccountUsers(accountId).success(function (data) {
                            angular.forEach(data, function (v) {
                                v.img = dalockrServices.getUserAvatar(v.clusterId, v.username);

                                v.active = false;
                                var vu = v.username;
                                for (var i = 0, len = managers.length; i < len; i++) {
                                    if (managers[i].username === vu) {
                                        v.active = true;
                                        break;
                                    }
                                }
                            });
                            $scope.collaborators = data;
                            if (role === 'accm') {
                                $scope.BecomeAccountManager(userdata);
                            }
                        });
                    }else {
                        dalockrServices.getAccountUsers(accountId).success(function (data) {
                            angular.forEach(data, function (v) {
                                v.img = dalockrServices.getUserAvatar(v.clusterId, v.username);

                                v.active = false;
                                var vu = v.username;
                                for (var i = 0, len = managers.length; i < len; i++) {
                                    if (managers[i].username === vu) {
                                        v.active = true;
                                        break;
                                    }
                                }
                            });
                            $scope.collaborators = data;
                            if (role === 'accm') {
                                $scope.BecomeAccountManager();
                            }
                        });
                    }
                }

                function successHandler(success){
                    var msg;
                    if(msg = success.message){
                        toastr.success(msg);
                    }
                    if(success.account){
                        managers = success.account.managers;
                    }
                    $scope.isUpdating = false;
                    getCollaborators();
                }

                function errorHandler(error){
                    var msg;
                    $scope.isUpdating = false;
                    if(msg = error.message){
                        toastr.error(msg);
                    }
                }

            },
            link: function (scope,element) {
                if(!$dalMedia('xs')){
                    element.addClass('mobile');
                }

                scope.openEditThumbnail = function(){
                    scope.showselectthumb = true;
                };
                scope.$on('closeselectthumb',function(ev,val){
                    scope.showselectthumb = false;
                });
            }

        }
    }])
    .directive('previewImage', function () {
        return {
            restrict:'A',
            link: function (scope,element,attr) {
                var imageWrapperSize;
                element[0].onload = function (ev) {
                    var realSize = {
                        width:ev.target.naturalWidth,
                        height:ev.target.naturalHeight
                    };
                    var showSize = caculateSize(realSize);
                    element.css({
                        width:showSize.showWidth + 'px',
                        height:showSize.showHeight + 'px'
                    });
                };
                function caculateSize(realSize){
                    imageWrapperSize = imageWrapperSize || {
                            width:element.parent().width(),
                            height:element.parent().height() };

                    var scale = realSize.width/realSize.height;
                    var wrapperScale = imageWrapperSize.width/imageWrapperSize.height;


                    var showWidth = realSize.width,
                        showHeight = realSize.height;

                    if(imageWrapperSize.width < realSize.width || imageWrapperSize.height < realSize.height){
                        if(wrapperScale>scale){
                            showHeight = imageWrapperSize.height;
                            showWidth = scale*showHeight;
                        } else {
                            showWidth = imageWrapperSize.width;
                            showHeight = showWidth/scale;
                        }
                    }
                    return {
                        showWidth:showWidth,
                        showHeight:showHeight
                    }
                }

            }
        }

    })
    .directive('transformSmileys',['$timeout',function ($timeout) {
        return {
            restrict:'A',
            link: function (scope, element, attrs) {
                var watcher = scope.$watch(attrs['ngBind'], function (newVal,oldVal) {
                    if(newVal){
                        watcher();
                        $timeout(function () {
                            element.smilify();
                        });
                    }
                });
            }
        }
    }])
    .service('lockrfixedmenu', function ($rootScope,$compile) {
        this.open = function (level,callback) {
            var scope = $rootScope.$new();
            scope.indexCallback = function (res) {
                callback(res);
                scope.$destroy();
            };
            scope.level = level;
            angular.element('body').append($compile(angular.element('<mobile-fixed-menu level="{{level}}" index-callback="indexCallback(data)"></mobile-fixed-menu>'))(scope));
        };
    })
    // .directive('mobileFixedMenu',function(){
    //    return{
    //        restrict:'EA',
    //        templateUrl:'views/mobile/mobile-details-fixed-menu.html',
    //        scope:{
    //            level:'@',
    //            indexCallback:'&'
    //        },
    //        link: function (scope, element) {
    //
    //            scope.closeThisMenu = function () {
    //                element.remove();
    //                scope.$destroy();
    //                scope.indexCallback({data:{index:-1}});
    //            };
    //
    //            scope.selectOperate = function (ev) {
    //                if(angular.isDefined(ev.target.dataset.index)){
    //                    scope.indexCallback({data:{index:ev.target.dataset.index,ev:ev}});
    //                    scope.closeThisMenu();
    //                }
    //            };
    //
    //        }
    //    }
    // });
    .service('accountmanager', function ($rootScope,$compile) {
        this.open = function (item,accountid,ismanger,managerarray) {
            var scope = $rootScope.$new();
            scope.item = item;
            scope.accountid = accountid;
            scope.ismanger = ismanger;
            scope.ismanger = managerarray;
            angular.element('body').append($compile(angular.element('<collaborators-detail  accountid="{{accountid}}" item="item" ismanger="ismanger" managerarray = "managerarray"></collaborators-detail>'))(scope));
        };
})
    .directive('collaboratorsDetail',function(dalockrServices,$rootScope,$q,toastr,$location){
        return{
            restrict:'EA',
            templateUrl:'views/directives/collaborators-details.html',
            scope:{
                item:'=',
                ismanger:'=',
                managerarray:'=',
                accountid:'@'

            },
            replace:true,
            link:function($scope, element){
                angular.forEach($scope.item.enterpriseLockrRoles,function(val,ind){
                    val.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',val.lockrId);
                });

                // $scope.sublockrList = [];
                $scope.addlockrlist  = [];
                var lockr = {};
                var checkwrong = true;
                var assignType = '',
                    assignRole = '',
                    assignUser = '';
                var strmanage = '';
                $scope.chooserole = '';
                var managelist = [];
                var updatalockrmessage;
                var oldactive = $scope.item.active;
                if($scope.item.enterpriseLockrRoles){
                    angular.forEach($scope.item.enterpriseLockrRoles,function(val){
                        if(val.role === "COMMUNITY_MANAGER"){
                            val.role = "Community manager";
                        }
                        if(val.role === "CONTENT_MANAGER"){
                            val.role = "Content manager";
                        }
                    })
                }


                $scope.loaduserrole = function(){
                    $scope.chooseuserrole = {
                        1:{name:'Community Manager'},
                        2:{name:'Content Manager'}
                    }
                };
                $scope.closeThisMenu = function () {
                    element.remove();
                    $scope.$destroy();
                };
                $scope.deleteManage = function(){
                        element.remove();
                    $scope.$destroy();
                    dalockrServices.removeUserFromAccount($scope.accountid,$scope.item.username).success(function(){
                        element.remove();
                        $scope.$destroy();
                         $rootScope.$broadcast('deleteManager',true);
                    }).error(function(error){
                        var msg;
                        if(msg = error.message){
                            toastr.error(msg);
                        }
                    });

                };
                $scope.$on('searchlockdata',function(event,data){
                    if(data != $scope.item){
                        var newlockrdata ={
                            'name':data.name,
                            'id':data._id
                        };
                        $scope.addlockrlist.push(newlockrdata);
                    }
                });
                // $scope.changeItem = function (item) {
                //     $scope.selectOtherLockr = item ? true : false;
                //     $scope.selectLockr = item && ( item._id || item.id);
                //     $scope.getLockr = item;
                //     if(item){
                //         var i = lockridlitst.indexOf(item._id);
                //         if(i == -1){
                //             $scope.lockrlitst.push(item);
                //             lockridlitst.push(item._id);
                //         }
                //     }
                // };
                $scope.DeleteLockrlistdata = function(item){
                    var i = $scope.addlockrlist.indexOf(item);
                    $scope.addlockrlist.splice(i,1);
                };
                $scope.createOtherNewLockr = function () {
                    var defer = $q.defer();
                    $rootScope.$broadcast('add-lockr',defer);
                    //新建成功后,返回得到该数据
                    defer.promise.then(function (data) {
                        var newlockrdata ={
                            'name':data.lockr.name,
                            'id':data.lockr.id
                        };
                        $scope.addlockrlist.push(newlockrdata);
                        var lockr;
                        if(data && ( lockr =  data.lockr) ){
                            $scope.selectOtherLockr = true;
                            // $scope.selectLockr = lockr.id;
                            // $scope.lockrlitst.push(lockrlistdata);
                            // lockridlitst.push(data.lockr.id);
                        }

                    });
                };
                // $scope.registerAutoCompleteCallback = function (cb) {
                //     autoCompleteCallback = cb;
                // };


                $scope.searchLockrWithName = function (text) {
                    if(text.length){
                        $scope.searching = true;
                        dalockrServices.getSearch(text, function (data) {
                            $scope.lockrList = data.result.Lockr;
                            $scope.searching = false;
                            if($scope.lockrList.length){
                                $scope.selectLockr.id = $scope.lockrList[0]._id;
                            }
                        });
                    } else {
                        $scope.lockrList = null;
                    }
                };
                $scope.EditManage = function(){
                    $scope.editpage = true;
                };
                $scope.deleteLockrList = [];
                $scope.chooseLockr = function(data){
                  if($scope.deleteLockrList.indexOf(data) == -1){
                      $scope.deleteLockrList.push(data);
                  }else{
                      $scope.deleteLockrList.splice($scope.deleteLockrList.indexOf(data),1);
                  }
                };
                $scope.editUserManager = function(){
                    $scope.editusermanager = true;
                };
                $scope.backshowpage = function(){
                    $scope.editpage = false;
                };
                $scope.assignmorelockr = function(){
                    $scope.assignlockrlist = true;
                };
                $scope.BackFormAssign = function(){
                    $scope.showAssign = false;
                };
                $scope.AssignLockrList = [];
                $scope.chooseAssignLockr = function(data){
                    if($scope.AssignLockrList.indexOf(data) == -1){
                        $scope.AssignLockrList.push(data);
                    }else{
                        $scope.AssignLockrList.splice($scope.AssignLockrList.indexOf(data),1);
                    }
                };
                $scope.assign = {
                    searchText:''
                }
                $scope.$watch('assign.searchText',function(newVal,oldval){
                    if(newVal){
                        $scope.showAllState = [];
                        angular.forEach($scope.allStates,function(val,ind){
                            if(val.name.indexOf(newVal) != -1){
                                $scope.showAllState.push(val);
                            }
                        })
                    }else{
                        $scope.showAllState = angular.copy($scope.allStates);
                    }
                })
                var updatelockrlist = function(currentLockr){
                    if(currentLockr.chooserole === 'Content Manager'){
                        assignType = 'WRITE_AND_MANAGE_CONTENT';
                        assignRole = 'CONTENT_MANAGER';
                        assignUser = $scope.item.username;
                            dalockrServices.grantPermissions(currentLockr.id,'Lockr',assignType,assignUser,assignRole)
                                .then(function(response){
                                    updatalockrmessage = {
                                        role:assignRole,
                                        lockrName:currentLockr.name,
                                        entityPermission:response.entityPermission,
                                        thumbnailUrl:currentLockr.thumbnailUrl

                                    };
                                    if($scope.item.enterpriseLockrRoles){
                                        $scope.item.enterpriseLockrRoles.push(updatalockrmessage);
                                    }else{
                                        $scope.item.enterpriseLockrRoles = [];
                                        $scope.item.enterpriseLockrRoles.push(updatalockrmessage);
                                    }
                                    toastr.success('EntityPermission has successfully been created.','Success');
                                    $scope.BackFormAssign();
                                }).catch(function(error){
                                $scope.loadingInProgress = false;
                                if(error.data.message){
                                    toastr.error(error.data.message,'Error');
                                }
                            });

                    } else if(currentLockr.chooserole  === 'Community Manager'){
                        assignType = 'READ_AND_MANAGE_CONTENT';
                        assignRole = 'COMMUNITY_MANAGER';
                        assignUser = $scope.item.username;
                            dalockrServices.grantPermissions(currentLockr.id,'Lockr',assignType,assignUser,assignRole)
                                .then(function(response){
                                    updatalockrmessage = {
                                        role:assignRole,
                                        lockrName:currentLockr.name,
                                        entityPermission:response.entityPermission,
                                        thumbnailUrl:currentLockr.thumbnailUrl
                                    };
                                    if($scope.item.enterpriseLockrRoles){
                                        $scope.item.enterpriseLockrRoles.push(updatalockrmessage);
                                    }else{
                                        $scope.item.enterpriseLockrRoles = [];
                                        $scope.item.enterpriseLockrRoles.push(updatalockrmessage);
                                    }
                                    toastr.success('EntityPermission has successfully been created.','Success');
                                    $scope.BackFormAssign();
                                }).catch(function(error){
                                $scope.loadingInProgress = false;
                                if(error.data.message){
                                    toastr.error(error.data.message,'Error');
                                }
                            });
                    }
                };
                $scope.updateAssgin = function(){
                    angular.forEach($scope.AssignLockrList,function(val,ind){
                        updatelockrlist(val);
                    })
                }
                $scope.openFormAssign = function(){
                    $scope.showAssign = true;
                    $scope.loadingAssignLockr = true;
                    $scope.allStates = loadAll();
                    function loadAll() {
                        var allStates = [];
                        dalockrServices.getClustersLockr()
                            .then(function(response) {
                                var result = response.data;
                                var currentAccount  = getCurrentAccount(result);
                                dalockrServices.getLockrDetails(currentAccount.id).success(function(data){
                                    angular.forEach(data.subLockrs,function(val){
                                        val.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',val.id);
                                        allStates.push(val);
                                    })
                                    $scope.loadingAssignLockr = false;
                                })
                            },function(){
                                toastr.error('Not found lockr','Error');
                            });
                        $scope.showAllState = allStates;
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
                };
                $scope.deleteManageLockr = function(){
                    angular.forEach($scope.deleteLockrList,function(val,ind){
                        dalockrServices.getLockrUsers(val.lockrId)
                            .success(function(data){
                                angular.forEach(data,function(value,ind){
                                    if($scope.item.id == value.id){
                                        dalockrServices.deletePermissions(value.entityPermissionId).success(function(data){

                                            $scope.item.enterpriseLockrRoles.splice($scope.item.enterpriseLockrRoles.indexOf(val),1);
                                        }).error(function(error){
                                            console.log(error);
                                        })
                                    }
                                })
                            }).error(function(error){
                            console.log('error')
                        });
                        if(ind == $scope.deleteLockrList.length -1){
                            $scope.deleteLockrList = [];
                        }
                    })
                };
                var changeaccountmanger = function(data,accountid){
                    dalockrServices.updateAccount(data,accountid).success(function(data){
                        toastr.success(data.message,'Success');
                    }).error(function(error){
                        toastr.error('Invalid request','Error');
                    });
                };
                var updateactive =  function(){
                    if(oldactive != $scope.item.active){
                        dalockrServices.getAccountInfo($scope.accountid).success(function(accoutdata){
                            dalockrServices.getAccountUsers($scope.accountid).success(function (data) {
                                angular.forEach(accoutdata.managers,function(value,ind){
                                    angular.forEach(data,function(val,ind){
                                        if(val.id == value.id) {
                                            if(managelist.indexOf(val.id) == -1){
                                                managelist.push(val.id);
                                            }
                                        }
                                    })

                                });
                                var num = managelist.indexOf($scope.item.id);
                                if(num!= -1){
                                    managelist.splice(num,1);
                                    strmanage = managelist.join(",");
                                }else{
                                    managelist.push($scope.item.id);
                                    strmanage = managelist.join(",");
                                }
                                // changeaccountmanger({managerIds:strmanage},$scope.accountid);
                                changeaccountmanger({managerIds:strmanage},$scope.accountid);

                            });


                        });
                    }
                };
                $scope.updatamessage = function(){
                    if($scope.addlockrlist[0] && !$scope.chooserole){
                        toastr.error('Please choose Userrole','Error');
                    }else if(!$scope.addlockrlist[0] && $scope.chooserole){
                        toastr.error('Please choose Lockr ','Error');
                    }else {
                        $q.all([updateactive(), updatelockrlist()])
                            .then(function () {
                                $scope.closeThisMenu();
                            });
                    }
                }
            }
        }
    })
    .directive('collaboratorsAddPersonal',function(dalockrServices,$rootScope,$q,toastr,commonServices,userServices,appConfig){
        return{
            restrict:'EA',
            templateUrl:'views/directives/collaborators-add-personal.html',
            scope:{

            },
            replace:true,
            link:function($scope, element){
                $scope.showList = false;
                $scope.addColl = function(){
                    $scope.showList = true;
                };
                $scope.socialType = 'CHOOSE YOUR SOCIAL CHANNEL';
                $scope.hideList = function(){
                    $scope.showList = false;
                    $rootScope.$broadcast('getNewChannels',$scope.updataChannel);
                };
                var authToken = userServices.getAccessToken();
                $scope.selectType = function (key) {
                    $scope.socialType = key.name;
                        if(key.name == 'Facebook'){
                            $scope.addSocialChannel(key.name,true);
                        }else{
                            $scope.addSocialChannel(key.name);
                        }
                };
                $scope.socialList = [
                    {
                        active:true,
                        name:'Facebook',
                        iconClass:'dalello-icon-fb_black'
                    },
                    {
                        active:false,
                        name:'Twitter',
                        iconClass:'dalello-icon-twitter_black'
                    },
                    {
                        active:false,
                        name:'LinkedIn',
                        iconClass:'dalello-icon-linkedin_black'
                    },
                    //{
                    //    active:false,
                    //    name:'Evernote',
                    //    iconClass:'mdi-evernote'
                    //},
                    {
                        active:false,
                        name:'Pinterest',
                        iconClass:'dalello-icon-pinterest_black'
                    },
                    {
                        active:false,
                        name:'Instagram',
                        iconClass:'dalello-icon-instagram_black'
                    },
                    //{
                    //    active:false,
                    //    name:'Google',
                    //    iconClass:'dalello-icon-google-+-black'
                    //},
                    {
                        active:false,
                        name:'Youtube',
                        iconClass:'dalello-icon-ytube_black'
                    },
                ];
                $scope.ctrl = {
                    socialState:'',
                    channelName:''

                };
                $scope.addSocialChannel = function(name, isFacebook){
                    $scope.updataChannel = '';
                    $scope.oldSocialChannels = userServices.currentUser().socialChannel;

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
                            dalockrServices.getAllSocialChannels()
                                .then(function(response){

                                    var data = response.data;
                                    var count  = 0;
                                    angular.forEach(data,function(val){
                                        angular.forEach($scope.oldSocialChannels,function(value){
                                            if(value.id == val.id){
                                                count = 1;
                                            }
                                        });
                                        if(count){
                                            count = 0;
                                        }else{
                                            $scope.updataChannel = val;
                                            $scope.ctrl.channelName = val.name.split('-')[1];
                                        }
                                    });

                                    assignSocialChannel(data);


                                },function(error){

                                });
                        }
                    }
                };

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

                    $scope.socialChannelsData = socialChannelsData;

                }
                function getAddSocialChannelUrl(name) {
                    if(name) {
                        var ru = encodeURIComponent(appConfig.REDIRECT_URL_ADDRESS + '/redirect.html');
                        if (typeof userServices.currentUser() === 'undefined') {
                            return null;
                        } else {
                            return appConfig.API_SERVER_ADDRESS + '/api/' + userServices.currentUser().clusterId + '/adm/add/social/channel/' + name + '?redirectUri=' + ru + '&token=' + authToken;
                        }
                    }
                }

            }
        }
    })



    .directive('shareOnList',['commonServices',function (commonServices) {

        return {
            restrict:'E',
            replace:true,
            templateUrl:'views/templates/share-on-list.html',
            scope:{
                activeCallback:'&',
                socialChannels:'=',
                changeCallback:'&',
                styleFromassetdetail:'='
            },
            link: function (scope, elem) {

                var selectedItems = [];

                scope.channelsArray = [];

                var watcher = scope.$watch('socialChannels', function (newVal, oldVal) {

                    if(newVal){
                        if(angular.isArray(newVal)){
                            scope.channelsArray = newVal.map(function (val) {
                                val.iconClass = val.iconClass || commonServices.getIconClassByType(val.socialChannelType);
                                val.selected = angular.isDefined(val.selected) ? val.selected : true;
                                return val;
                            });
                        } else if(angular.isObject(newVal)){
                            angular.forEach(newVal, function (val) {
                                scope.channelsArray = scope.channelsArray.concat(val.data.map(function (val) {
                                    val.iconClass = val.iconClass || commonServices.getIconClassByType(val.socialChannelType);
                                    val.selected = angular.isDefined(val.selected) ? val.selected : true;
                                    return val;
                                }));
                            });
                        }
                        watcher();
                    }
                });
                var itemWidth = 50;

                scope.SubmitShareForm = function(){
                    console.log('share');
                };
                scope.ChangeSocialAccountState = function(data){
                    data.selected = !data.selected;
                };

                scope.currentChannel = 'Facebook';
                scope.channelTypes = [
                    {
                        active:true,
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


                elem.find('.list-label').css({
                    width:90
                });
                elem.find('.list-tabs').css({
                    width:elem.parent().width()
                });
                elem.find('.tabs-wrapper').css({
                    width:itemWidth*scope.channelTypes.length
                });

                scope.selectedOrUnselectThisItem = function (item) {
                    item.selected = !item.selected;

                    selectedItems = [];
                    angular.forEach(scope.channelsArray, function (val) {
                        if(val.selected){
                            selectedItems.push(val.id);
                        }
                    });
                    scope.changeCallback({items:selectedItems});

                };

                scope.activeThisChannel = function (item) {
                    scope.channelTypes = scope.channelTypes.map(function (val) {
                        val.active = false;
                        return val;
                    });
                    scope.currentChannel = item.name;
                    item.active = true;
                }

            }
        }

    }])

    .service('toastr',['$mdToast',function ($mdToast) {
        var last = {
            bottom: false,
            top: true,
            left: false,
            right: true
        };
        var toastPosition = angular.extend({},last);
        var getToastPosition = function() {
            sanitizePosition();
            return Object.keys(toastPosition)
                .filter(function(pos) { return toastPosition[pos]; })
                .join(' ');
        };
        function sanitizePosition() {
            var current = toastPosition;
            if ( current.bottom && last.top ) current.top = false;
            if ( current.top && last.bottom ) current.bottom = false;
            if ( current.right && last.left ) current.left = false;
            if ( current.left && last.right ) current.right = false;
            last = angular.extend({},current);
        }

        this.error = this.success = this.warning = this.info = function(text) {
            var pinTo = getToastPosition();
            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .position(pinTo)
                    .hideDelay(2000)
            );
        };

    }])

    //添加或者编辑Lockr管理
    .service('addEditLockrManager',['$mdDialog','$dalMedia','dalockrServices','commonServices','$rootScope','toastr','$location','addCollaboratorService',function ($mdDialog,$dalMedia,dalockrServices,commonServices,$rootScope,toastr,$location,addCollaboratorService) {


        var neededData,
            isEditing,
            deferPromise;

        this.edit = function (lockrData,defer) {
            neededData = lockrData;
            isEditing = true;
            deferPromise = defer;
            openModal();
        };

        this.add = function (parentLockrId,defer) {
            neededData = parentLockrId;
            isEditing = false;
            deferPromise = defer;
            openModal();
        };



        function openModal(){

            $mdDialog.show({
                controller: handleController,
                templateUrl: 'views/templates/add-sublockr-dialog.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose:false,
                fullscreen:$dalMedia('xs')
            });
        }


        function handleController($scope){

            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.typeSettings = {
                "normal":{
                    icon:'dalello-icon-mylocker_black',
                    name:'NORMAL LOCKR'
                },
                "private":{
                    icon:'dal-icon-private_locker_black',
                    name:'PRIVATE LOCKR'
                },
                "no":{
                    name:'TYPE OF LOCKR'
                }
            };
            $scope.isEditing = isEditing;
            $scope.currentEntity = {
                name:isEditing ? neededData.name : '',
                description:isEditing ? neededData.description : '',
                tags:isEditing ? neededData.tags : ''
            };
            $scope.mobileDevice  = $dalMedia('xs');
            $scope.createType = isEditing ? neededData.hiddenFromPublicView ? 'private' : 'normal' : 'no';
            $scope.loadingInProgress = false;
            $scope.allContacts = [];
            $scope.guideStep = 0;
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
                    mimeType:['audio/*'],
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
            var getUserSharingRules = false;


            $scope.mimeTypeIsActive = function (type, rules) {
                return rules.mimeType.indexOf(type.mimeType) > -1;
            };

            $scope.switchChannelType = function (rule,type) {
                rule.channelActive = type.name;
            };

            $scope.selectType = function (key) {
                $scope.createType = key;
            };

            $scope.$on('newLockrSharing',function(ev,value){
                if(getUserSharingRules){
                    value.sharingRule.selected = true;
                    $scope.sharingRules.push(value.sharingRule);

                    value.sharingRule.tabIndex = 0;
                    if(value.sharingRule.postOnSocialChannelDetail)
                        value.sharingRule.postOnSocialChannelDetail = value.sharingRule.postOnSocialChannelDetail.map(function (val) {
                            val.iconClass = commonServices.getIconClassByType(val.socialChannelType);
                            val.imgLink = commonServices.getSocialChannelAvatar(val);
                            return val;
                        });

                    value.sharingRule.channelActive = 'Facebook';

                    getCreativeCommonData(value.sharingRule, function (data) {
                        value.sharingRule.ccContent = data;
                    });

                    $scope.selectedRule = value.sharingRule.id;
                };
            });


            dalockrServices.getUserSharingRules(function (data) {
                getUserSharingRules = true;
                $scope.sharingRules = data.map(function (val) {
                    val.selected = false;

                    //选取默认的sharing rule
                    var sharingRule = neededData.sharingRule;
                    if(isEditing && angular.isArray(sharingRule) && sharingRule.length){
                        if(sharingRule[0].id == val.id){
                            $scope.selectedRule = val.id;
                        }
                    } else {
                        if(val.userDefault){
                            $scope.selectedRule = val.id;
                        }
                    }

                    val.tabIndex = 0;
                    if(val.postOnSocialChannelDetail)
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
            });


            $scope.moderationType = {
                share:false,
                comment:false
            };



            if(isEditing){
                angular.forEach(neededData.approvalInfo, function (val) {
                   var type = val.approvalType.toLowerCase();
                    if(type == 'comment'){
                        $scope.moderationType.comment = true;
                    } else if(type == 'share'){
                        $scope.moderationType.share = true;
                    }
                });
            }





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



            $scope.createLockr = function(){

                $scope.loadingInProgress = true;

                //组装moderation信息
                var userString = '',
                    approvalInfo = [],
                    userArr,
                    lockrData;

                angular.forEach($scope.allContacts, function (val,key) {
                    if(val.selected){
                        userString += val.username + ',';
                    }
                });

                userArr = userString.split(',');
                userArr.splice(-1,1);
                userString = userArr.join(',');

                angular.forEach($scope.moderationType, function (value,key) {
                    if(key === 'share' && value === true){
                        approvalInfo.push({
                            "approvalType":"SHARE",
                            "required":true,
                            "approvers":userString
                        })
                    }

                    if(key === 'comment' && value === true){
                        approvalInfo.push({
                            "approvalType":"COMMENT",
                            "required":true,
                            "approvers":userString
                        })
                    }
                });

                lockrData = {
                    hiddenFromPublicView:$scope.createType == 'private',
                    name:$scope.currentEntity.name,
                    tags:$scope.currentEntity.tags,
                    description:$scope.currentEntity.description,
                    parentLockrId:neededData,
                    sharingRule:[$scope.selectedRule],
                    approvalInfo:[]
                };

                if(userString && approvalInfo.length){
                    lockrData.approvalInfo = approvalInfo;
                }

                if(isEditing){
                    dalockrServices.updateLockr(neededData.id,lockrData, function (data) {
                        $rootScope.$broadcast('updateLockrDetails',true);
                        deferPromise && deferPromise.resolve(data);
                    }, function (error) {
                        $scope.loadingInProgress = false;
                        if(error && error.message){
                            toastr.error(error.message);
                        }
                    });
                } else {
                    dalockrServices.createLockr(lockrData,function(data){
                        $rootScope.$broadcast('updateLockrDetails',true);
                        deferPromise && deferPromise.resolve(data);
                        $scope.$apply();
                        $location.path('/sublockr/' + data.lockr.id);
                    },function(error){
                        throwError(error);
                        $scope.$apply();
                    });

                }
            };



            loadUsers();

            function loadUsers() {
                dalockrServices.getLockrUsers(isEditing ? neededData.id : neededData).then(function (res) {
                    var allUsers = res.data;

                    $scope.allContacts = allUsers.map(function (user, index) {

                        var selected = false;
                        var name = user.firstName + ' ' + user.lastName;


                        if(isEditing){
                            angular.forEach(neededData.approvalInfo, function (val) {
                                angular.forEach(val.approvers, function (val) {
                                    if(val.username == user.username){
                                        selected = true;
                                    }
                                })
                            });
                        }

                        return {
                            selected:selected,
                            name: name,
                            email:user.email,
                            image:dalockrServices.getUserAvatar(user.clusterId,user.username),
                            username:user.username
                        };
                    });
                });
            }


            $scope.addCollaborator = function () {
                addCollaboratorService.open(isEditing ? neededData.id : neededData).then(function (isRefresh) {
                    isRefresh && loadUsers();
                });
            };


            $scope.addSharingRules = function (ev) {
                $mdDialog.show({
                    controller: addSharingRulesController,
                    templateUrl: 'views/templates/add-sharing-rule-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    skipHide:true,
                    clickOutsideToClose: false
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
                }
            };

            function throwError(error){
                $scope.loadingInProgress = false;
                toastr.error(JSON.parse(error.responseText).message);
            }
        }






    }])
    .directive('listSharingRule',['commonServices','$dalMedia','$rootScope','dalockrServices',function (commonServices,
                                                                                                       $dalMedia,$rootScope, dalockrServices) {
        return{
            restrict: 'E',
            // replace:true,
            templateUrl: 'views/directives/list-sharing-rule.html',
            link: function (scope,element)
            {
                scope.openShareRule = function (val) {
                    val.selected = !val.selected;
                };
                dalockrServices.getUserSharingRules(function (data) {
                    scope.sharingRules = data.map(function (val) {
                        val.selected = false;
                        if(val.userDefault){
                            scope.selectedRule = val.id;
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
                    scope.shareRuleDetail = data;
                    scope.loadshare = false;
                });
                scope.channelTypes = [
                    {
                        active:true,
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
                scope.mimeTypes = [
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
                        mimeType:['audio/*'],
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
                scope.mimeTypeIsActive = function (type, rules) {
                    return rules.mimeType.indexOf(type.mimeType) > -1;
                };
                scope.shareSwitchChannelType = function (rule,type) {
                    rule.channelActive = type.name;
                };
                scope.showdesc = function(){
                    scope.showcctext = false;
                };
                scope.showtext = function(){
                    scope.showcctext = true;
                };
                scope.setAsDefaultRule = function(data){
                    dalockrServices.setSharingRuleForUser(data.id,function(data){
                        $rootScope.$broadcast('reloadUserSharingRule');
                        toastr.success('SharingRule' + data.name + 'has successfully been updated.','Success');
                    },function(error){
                        toastr.error(JSON.parse(error.responseText).message,'Error');
                    });
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
                        ccTypeString = 'Creative Commons Attribution - No Derivative Works 4.0 International LicenseAgreement';
                    } else if(license == 'CC_BY_NC_ND'){
                        ccTypeString = 'Creative Commons Attribution - Noncommercial - No Derivative Works 4.0International License Agreement';
                    } else if(license == 'CC_BY_SA'){
                        ccTypeString = 'Creative Commons Attribution - Share Alike 4.0 International License Agreement';
                    } else if(license == 'CC_BY_NC_SA'){
                        ccTypeString = 'Creative Commons Attribution - NonCommercial - ShareAlike 4.0 International LicenseAgreement';
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


            },


        }
    }])

    .directive('activityFlowOuter',[function() {
        return {
            restrict:'E',
            replace:true,
            scope:{
                activitySource:'=',
                indexCallback:'&'
            },
            templateUrl:'views/templates/activity-flow-outer.html',
            link:function(scope,elem){
                scope.positions = [];

                scope.positionCallback = function(val){
                    scope.positions.push(val);
                };

                var currentIndex = 0,
                    oldIndex = currentIndex;

                elem.scroll(function(ev){
                    var top = elem[0].scrollTop;
                    for (var i = 0; i < scope.positions.length; i++) {
                        if ( top >= scope.positions[i].offset ) {
                            currentIndex = scope.positions[i].index;
                        }
                    }
                    if(currentIndex != oldIndex){
                        oldIndex = currentIndex;
                        scope.indexCallback({data:currentIndex})
                    }

                });
            }
        }
    }])
    .directive('activityItem',[function(){
        return {
            restrict:'E',
            replace:true,
            scope:{
                itemKey:'@',
                itemData:'=',
                positionCallback:'&'
            },
            templateUrl:'views/templates/activity-item.html',
            link:function(scope,elem){
                if(scope.itemData.start){ //start代表每个阶段的开始
                    scope.positionCallback({data:{
                        offset:elem.position().top,
                        index:scope.itemKey
                    }});
                }
            }
        }
    }])
    .directive('onError',[function () {
        return {
            restrict:'A',
            link:function(scope,elem){
                elem[0].onerror = function(){
                    elem.addClass('overlay');
                }
            }
        }
    }]);


