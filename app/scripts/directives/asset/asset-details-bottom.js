/**
 * Created by user on 2015/7/31.
 */
angular.module('dalockrAppV2App')
.directive('assetDetailsBottom',[
        'dalockrServices',
        '$mdDialog',
        'toastr',
        '$sessionStorage',
        '$rootScope',
        'commonServices',
        'userServices',
    '$dalMedia',
    'appConfig',
        function(dalockrServices,$mdDialog,toastr,$sessionStorage,$rootScope,commonServices,userServices,$dalMedia,appConfig){
        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/directives/asset/mobile/asset-details-bottom.html';
                }
                return 'views/directives/asset/asset-details-bottom.html';
            },
            scope:{
                currentAssetDetails:'=',
                currentAssetId:'='
            },
            link:function(scope,elem){

                var followId,
                    _scope = scope;
                scope.isFollowedByMe = false;


                var getFollowers = function(successCb,errorCb){
                    scope.isFollowedByMe = false;
                    dalockrServices.getAssetFollowers(scope.currentAssetId).success(function(data){
                        commonServices.setAssetFollowers(data);
                        scope.followerCount = data.length;
                        userServices.getUserProfileInfo(function (userInfo) {
                            angular.forEach(data, function(value){
                                if(value.follower.username === userInfo.username){
                                    scope.isFollowedByMe = true;
                                    followId = value.id;
                                }
                            });
                        });

                        _scope.assetFollowers = data.map(function (val) {
                            val.userPic = appConfig.API_SERVER_ADDRESS + '/u/'+ val.follower.clusterId +'/' + val.follower.username + '/avatar';
                            return val;
                        });

                        successCb && successCb(_scope.assetFollowers);

                    }).error(function () {
                        errorCb && errorCb();
                    });
                };
                getFollowers();


                scope.openFollowerDialog = function () {

                    $mdDialog.show({
                        controller: followerListController,
                        templateUrl: 'views/mobile/follower-list-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        clickOutsideToClose: false,
                        fullscreen:true
                    });

                    function followerListController($scope) {
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.loading = true;
                        if(_scope.assetFollowers){
                            $scope.assetFollowers = _scope.assetFollowers;
                            $scope.loading = false;
                        } else {
                            getFollowers(function (data) {
                                $scope.loading = false;
                                $scope.assetFollowers = data;
                            }, function () {
                                $scope.loading = false;
                            });
                        }

                    }


                };


                scope.followAsset = function(ev,value){
                    dalockrServices.followAsset(value.id, function(data){
                        //getLockrFollowers();
                        toastr.success('Follow '+ value.name + ' has successfully been created.','Success');
                        scope.isFollowedByMe = true;
                        getFollowers();
                    },function(error){
                        toastr.error(JSON.parse(error.responseText).message,'Error');
                    });
                    cancelBubble(ev);
                };

                scope.unFollowAsset = function () {
                    dalockrServices.deleteUserFollows(followId, function (data) {
                        getFollowers();
                        toastr.success(data.message,'Success');
                    },function(error){
                        toastr.error(JSON.parse(error.responseText).message,'Error');
                    });
                };


                scope.$on('editAsset', function (event, $ev) {
                    scope.openEditAssetDialog($ev,scope.currentAssetDetails);
                });

                scope.openEditAssetDialog = function(ev,value){

                    scope.editAssetInfo = value;

                    $mdDialog.show({
                        controller: editAssetDialogController,
                        templateUrl: 'views/templates/edit-asset-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        fullscreen:$dalMedia('xs')
                    });
                    // cancelBubble(ev);

                };
                function editAssetDialogController($scope){

                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function(answer) {
                        $mdDialog.hide(answer);
                    };

                    $scope.currentAssetData =  angular.copy(scope.editAssetInfo);
                    //console.log( scope.editAssetInfo);
                    var tags = '';
                    var tagsLen = $scope.currentAssetData.tags.length;
                    if(tagsLen !== 0){
                        for (var i = 0; i <tagsLen ; i++) {
                            var obj = $scope.currentAssetData.tags[i];
                            if(i === tagsLen-1){
                                tags += obj;
                            } else {
                                tags += obj + ',';
                            }
                        }
                    }
                    $scope.tags = tags;


                    $scope.submitted = false;

                    $scope.updateAsset = function(){

                        $scope.submitted = true;
                        $scope.loadingInProgress = true;

                        if($scope.update_asset_form.$valid) {

                            var entityData = {
                                name: $scope.currentAssetData.name,
                                description: $scope.currentAssetData.description,
                                tags: $scope.tags
                            };

                            dalockrServices.updateAssetDetails($scope.currentAssetData.id,entityData,function(data){
                                $rootScope.$broadcast('updateAssetDetails',true);
                                toastr.success("Asset " + data.asset.name +" has successfully been updated.",'Success');
                            }, function (error) {
                                $scope.loadingInProgress = false;
                                toastr.error(error.message,'Error');
                            });
                        }
                    };
                }



                function cancelBubble(ev){
                    if(ev.stopPropagation()) {
                        ev.stopPropagation();
                    }else{
                        ev.cancelBubble = true;
                    }
                }



            }
        }
    }]);