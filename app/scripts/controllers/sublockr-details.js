'use strict';

angular.module('dalockrAppV2App')
    .controller('SubLockrDetailsCtrl', ['$scope', 'dalockrServices','commonServices','$routeParams','$rootScope','$location','$window','$filter','$templateRequest','$mdDialog','cacheService','userRightServices','userServices','$dalMedia',
        function ($scope,dalockrServices,commonServices,$routeParams,$rootScope,$location,$window,$filter,$templateRequest,$mdDialog,cacheService,userRightServices,userServices,$dalMedia) {

        $window.scrollTo(0,0);
        commonServices.clearAssets();

        var lockrsCache = commonServices.cacheInstance('lockrsCache');
        lockrsCache.remove('imageList');

        var currentLockrId = $routeParams.lockrId,
            //screenWidth = commonServices.getCurrentBroswerWidth(),
            showWidth = $dalMedia('xs') ? commonServices.getMobileCardWidth()  : 220,
            tnSize = {
                realWidth:0,
                realHeight:0,
                showWidth:showWidth,
                showHeight: (showWidth * 240) / 319 //default height
            };


        $scope.loading = true;
        $scope.currentLockrDetails = null;
        $scope.assetsData = [];
        $scope.currentLockrId = currentLockrId;

        var lockr =  cacheService.checkLockrFromStack($scope.currentLockrId);
            console.log(lockr);
            if(lockr){
                console.log(1);
            handleLockrData(lockr);
        } else {
                console.log(2);
            getCurrentLockrDetails();
        }

        $scope.$on('updateLockrDetails', function(ev,isHideDialog){
            getCurrentLockrDetails(isHideDialog);
        });

        function handleLockrData(data){

                $scope.loading = false;
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

                ////console.log(data.assetExtraInfo);


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
                console.log($scope.assetsData);
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


    }]);
