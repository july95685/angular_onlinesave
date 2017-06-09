'use strict';

angular.module('dalockrAppV2App')
    .controller('AssetDetailsCtrl', ['$scope','$routeParams','commonServices','$rootScope','dalockrServices', '$window','$location','$mdDialog','userServices','userRightServices',function ($scope,$routeParams,commonServices,$rootScope,dalockrServices,$window,$location,$mdDialog,userServices,userRightServices) {

        $window.scrollTo(0,0);

        var currentAssetId = $routeParams.assetId;
        $scope.currentAssetDetails = null;
        $scope.currentAssetId = currentAssetId;
        $scope.pathData = null;

        loadData();


        function loadData(){

            dalockrServices.getAssetDetails(currentAssetId,function(data){

                data.mimeType.isFileType('article') && (data.fileType = 'article');
                data.mimeType.isFileType('doc') && (data.fileType = 'doc');
                data.mimeType.isFileType('xls') && (data.fileType = 'xls');
                data.mimeType.isFileType('ppt') && (data.fileType = 'ppt');
                data.mimeType.isFileType('video') && (data.fileType = 'video');
                data.mimeType.isFileType('audio') && (data.fileType = 'audio');
                data.mimeType.isFileType('pdf') && (data.fileType = 'pdf');
                data.mimeType.isFileType('image') && (data.fileType = 'image');

                $scope.mediaType = data.fileType;

                $rootScope.$broadcast('AssetData',data.state);

                data.socialChannelView = commonServices.getSocialChannelViewNum(data.links);
                data.srcUrl = dalockrServices.getAssetSrc('asset',data.id);

                userServices.getUserProfileInfo(function(info){
                    if(info){
                        var hi = angular.copy(data.hierarchy);
                        hi.splice(hi.length-1,1);
                        data.iscontent=userRightServices.isContentManager(data.lockrId,hi);
                        data.iscommunity=userRightServices.isCommunityManager(data.lockrId,hi);
                        $rootScope.$broadcast('$$LockrPower',{iscontent:data.iscontent,iscommunity:data.iscommunity});
                    }
                });


                var pathData = [];
                angular.forEach(data.hierarchy, function (v, k) {
                    pathData.push(v);
                });
                pathData.push({id: data.id, name: data.name});
                $scope.pathData = pathData;
                $scope.pathData.splice(0,1);

                $rootScope.$broadcast('issublockr',true);
                $rootScope.$broadcast('$$PathData',pathData);

                $mdDialog.hide();

                $scope.currentAssetDetails = data;
                $scope.$apply();
            });
        }

        $scope.$on('updateAssetDetails',function(event,value){
            if(value){
                $scope.currentAssetDetails = null;
                loadData();
            }
        });



        }]);





