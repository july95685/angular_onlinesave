'use strict';
/**
 * Created by Ann on 12/30/14.
 */

angular.module('dalockrAppV2App')
    .service('dalockrServices', ['$http','$window','$sessionStorage','userServices','commonServices','$filter','appConfig','$q',
        function ($http, $window,$sessionStorage,userServices,commonServices,$filter,appConfig,$q) {

            var dalockrServices = {};
            var authToken,
                clusterId;

            //if($sessionStorage.comDalockrDev){
            //    authToken = $sessionStorage.comDalockrDev.authToken;
            //    clusterId = $sessionStorage.comDalockrDev.clusterId;
            //}

            var apiServiceAddress = appConfig.API_SERVER_ADDRESS + '/api/';



            dalockrServices.getTimeline = function (successCallback, errorCallback) {

                $.ajax({
                    url: apiServiceAddress+'lockr?sort=name',
                    async: true,
                    type: 'GET', //POST for authentication
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');
                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });
            };

            dalockrServices.getClustersLockr = function(){
                return $http.get(apiServiceAddress+'lockr?sort=name');
            };




            dalockrServices.getThumbnailUrl = function (type,id) {
                return apiServiceAddress+ type +'/'+id +'/tn?token=' + userServices.getAccessToken() ;
            };
            dalockrServices.getAssetSrc = function(type,id){
                return apiServiceAddress+ type +'/'+id +'?hq=false' + '&token=' + userServices.getAccessToken();
            };
            dalockrServices.downloadLockrUrl = function(lockrId){
                return apiServiceAddress + 'lockr/'+ lockrId +'/contents?token=' + userServices.getAccessToken();
            };
            dalockrServices.downloadAssetUrl = function(assetId){
                return apiServiceAddress + 'asset/'+ assetId +'?dl=true&token=' + userServices.getAccessToken();
            };



            //dalockrServices.getAssetThumbnail = function(assetId, successCallback, errorCallback){
            //    var authTokenStr = JSON.stringify(authToken);
            //    var tnServiceAddress = apiServiceAddress+'asset/'+assetId+'/tn';
            //    $.ajax({
            //        url: tnServiceAddress,
            //        async: true,
            //        type: 'GET', //POST for authentication
            //        data:authToken
            //    }).done(function (data) {
            //        successCallback(data);
            //    }).fail(function (data) {
            //        errorCallback(data);
            //    });
            //};
            //

            dalockrServices.getArticleAssetContent = function(url){
                return $http.get(url);
            };



            dalockrServices.getLockrDetails = function(lockrId){
                var lockrServiceAddress = apiServiceAddress+'lockr/' + lockrId;
                return $http.get(lockrServiceAddress);
            };





            ///
            ///edit lockr name and des
            ///
            dalockrServices.editLockrDetails = function(lockrId,name,description,successCallback,errorCallback){
                var entityData = {
                    'name':name,
                    'description':description
                };

                dalockrServices.updateLockr(lockrId,entityData,successCallback,errorCallback);
            };

            dalockrServices.editLockrPublish = function(lockrId,hiddenFromPublicView,successCallback,errorCallback){
                var entityData = {
                    'hiddenFromPublicView':hiddenFromPublicView
                };
                dalockrServices.updateLockr(lockrId,entityData,successCallback,errorCallback);

            };

            ///
            /// Update Lockr
            ///
            dalockrServices.updateLockr = function(lockrId, entityData,successCallback,errorCallback){

                var entityDataString = JSON.stringify(entityData);// JSON Format
                var lockrServiceAddress = apiServiceAddress+'lockr/' + lockrId;

                return $http.put(lockrServiceAddress,entityDataString).success(function(data){
                    successCallback(data);
                }).error(function(error){
                    errorCallback(error);
                });


            };



            dalockrServices.createSubLockr = function(subLockrData,successCallback,errorCallback){

                var entityDataString = JSON.stringify(subLockrData);//Post JSON Format

                var createLockrServiceAddress = apiServiceAddress+'lockr';

                $.ajax({
                    url: createLockrServiceAddress,
                    async: true,
                    type: 'POST',
                    data:entityDataString,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');

                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });

            };

            dalockrServices.createProductLockr = function(entityData,successCallback,errorCallback){

                var entityDataString = JSON.stringify(entityData);//Post JSON Format

                var createLockrServiceAddress = apiServiceAddress+'store/product';

                $.ajax({
                    url: createLockrServiceAddress,
                    async: true,
                    type: 'POST',
                    data:entityDataString,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');

                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });

            };

            dalockrServices.createStoreLockr = function(entityData,successCallback,errorCallback){//ProductLockr

                var entityDataString = JSON.stringify(entityData);//Post JSON Format

                var createLockrServiceAddress = apiServiceAddress+'store';

                $.ajax({
                    url: createLockrServiceAddress,
                    async: true,
                    type: 'POST',
                    data:entityDataString,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');

                    }

                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });

            };
            dalockrServices.createCategoryLockr = function(entityData,successCallback,errorCallback){

                var entityDataString = JSON.stringify(entityData);//Post JSON Format

                var createLockrServiceAddress = apiServiceAddress+'store/category';

                $.ajax({
                    url: createLockrServiceAddress,
                    async: true,
                    type: 'POST',
                    data:entityDataString,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');

                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });

            };



            dalockrServices.createLockr = function(data,successCallback,errorCallback){

                var entityDataString = JSON.stringify(data);//Post JSON Format

                var createLockrServiceAddress = apiServiceAddress+'lockr';

                $.ajax({
                    url: createLockrServiceAddress,
                    async: true,
                    type: 'POST',
                    data:entityDataString,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });

            };
            dalockrServices.createSafeLockr = function(data){
                var entityDataString = JSON.stringify(data);
                var createLockrServiceAddress = apiServiceAddress+'safe';
                return $http.post(createLockrServiceAddress,entityDataString);
            };






            dalockrServices.deleteLockr = function(lockrId,deleteAssets,socialChannels,successCallback,errorCallback){
                var entityData = {
                    'deleteAssets':deleteAssets,
                    'socialChannels':socialChannels
                };
                var entityDataString = JSON.stringify(entityData);// JSON Format


                var lockrServiceAddress = apiServiceAddress+'lockr/' + lockrId;
                $.ajax({
                    url: lockrServiceAddress,
                    async: true,
                    data:entityDataString,
                    type: 'delete',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');

                    }
                }).done(function (data) {

                    successCallback && successCallback(data);

                }).fail(function (data) {
                    errorCallback && errorCallback(data);
                });

            };


            dalockrServices.getUserAvatar = function(clusterId,id){
                return appConfig.API_SERVER_ADDRESS + '/u/' + clusterId +'/' + id + '/avatar';
            };
            dalockrServices.getUserManagerAvatar = function(clusterId,username){
                return appConfig.API_SERVER_ADDRESS + '/u/' + clusterId +'/' + username + '/avatar';
            };


            dalockrServices.getAssetDetails = function(assetId,successCallback,errorCallback){

                var assetApiServiceAddress = apiServiceAddress + 'asset/' + assetId + '/details';
                $.ajax({
                    url: assetApiServiceAddress,
                    async: true,
                    type: 'GET', //POST for authentication
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');

                    }
                }).done(function (data) {
                    successCallback && successCallback(data);

                }).fail(function (data) {
                    errorCallback && errorCallback(data);
                });
            };

            dalockrServices.getLockrOrAssetComments = function(type,id,successCallback,errorCallback){
                var commentsApiServiceAddress = apiServiceAddress + type + '/' + id + '/comments';

                $.ajax({
                    url: commentsApiServiceAddress,
                    async: true,
                    type: 'GET', //POST for authentication
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });
            };

            dalockrServices.moveAssetsToAnotherLockr = function(assetsId,oldLokcrId,newLockrId){
                var moveApiServiceAddress = apiServiceAddress + 'lockr/' + oldLokcrId + '/move/assets/to/lockr/' + newLockrId;
                //var assetsIdStr = JSON.stringify(assetsId);
                var assetsIdStr = [];
                assetsIdStr.push(assetsId);
                return $http.put(moveApiServiceAddress,assetsIdStr)
                //$.ajax({
                //    url: moveApiServiceAddress,
                //    async: true,
                //    type: 'PUT', //POST for authentication
                //    data: assetsIdStr,
                //    beforeSend: function (xhr, settings) {
                //        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                //        xhr.setRequestHeader('Content-Type','application/json');
                //    }
                //}).done(function (data) {
                //    successCallback && successCallback(data);
                //
                //}).fail(function (data) {
                //    errorCallback && errorCallback(data);
                //});

            };

            dalockrServices.copyAssetsToAnotherLockr = function(assetsId,oldLokcrId,newLockrId,successCallback,errorCallback){
                var moveApiServiceAddress = apiServiceAddress + 'lockr/' + oldLokcrId + '/copy/assets/to/lockr/' + newLockrId;
                var assetsIdStr = JSON.stringify(assetsId);
                $.ajax({
                    url: moveApiServiceAddress,
                    async: true,
                    type: 'POST', //POST for authentication
                    data: assetsIdStr,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });

            };

            dalockrServices.publishOrUnpublishAsset = function(type, assetId, successCallback , errorCallback){
                var publishApiServiceAddress = apiServiceAddress + 'asset/' + assetId + '/' + type;

                $.ajax({
                    url: publishApiServiceAddress,
                    async: true,
                    type: 'POST', //POST for authentication
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        //xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback && successCallback(data);

                }).fail(function (data) {
                    errorCallback && errorCallback(data);
                });
            };

            dalockrServices.deleteAsset = function(assetId,successCallback,errorCallback){
                var deleteApiServiceAddress = apiServiceAddress + 'asset/' + assetId;

                $.ajax({
                    url: deleteApiServiceAddress,
                    async: true,
                    type: 'DELETE', //POST for authentication
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback && successCallback(data);

                }).fail(function (data) {
                    errorCallback && errorCallback(data);
                });
            };


            dalockrServices.deleteAssetWithPromise = function(assetId){
                var deleteApiServiceAddress = apiServiceAddress + 'asset/' + assetId;

                return $http.delete(deleteApiServiceAddress);
            };

            dalockrServices.deleteLockrThumbnail = function (lockrId) {
                var deleteLockrThu = apiServiceAddress + 'lockr/' + lockrId + '/thumbnail';
                return $http.delete(deleteLockrThu);
            };

            dalockrServices.checkUserExist = function (username) {
                var deleteLockrThu = apiServiceAddress + 'user/public/' + username;
                return $http.get(deleteLockrThu);
            };

            dalockrServices.uploadEncodedTn = function (lockrId,data) {
                var encodedTnUrl = apiServiceAddress + 'lockr/' + lockrId + '/encodedtn';
                return $http.post(encodedTnUrl,data);
            };




            dalockrServices.deleteLockrWithPromise = function(lockrId){

                var lockrServiceAddress = apiServiceAddress+'lockr/' + lockrId;

                return $http.delete(lockrServiceAddress);
            };






            dalockrServices.updateAssetDetails = function(assetId,assetDetailsData,successCallback,errorCallback){
                var updateApiServiceAddress = apiServiceAddress + 'asset/' + assetId + '/details';

                var assetDetailsDataStr = JSON.stringify(assetDetailsData);

                $.ajax({
                    url: updateApiServiceAddress,
                    async: true,
                    type: 'PUT', //POST for authentication
                    data: assetDetailsDataStr,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback && successCallback(data);

                }).fail(function (data) {
                    errorCallback && errorCallback(data);
                });
            };

            dalockrServices.shareAsset = function(assetId,data,successCallback,errorCallback){
                var shareApiServiceAddress = apiServiceAddress + 'asset/' + assetId + '/share';
                var assetShareDataStr = JSON.stringify(data);

                $.ajax({
                    url: shareApiServiceAddress,
                    async: true,
                    type: 'POST', //POST for authentication
                    data: assetShareDataStr,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');
                    }
                }).done(function (data) {
                    successCallback && successCallback(data);
                }).fail(function (data) {
                    errorCallback && errorCallback(data);
                });
            };

            dalockrServices.shareLockr = function(lockrId,data,successCallback,errorCallback){
                var shareApiServiceAddress = apiServiceAddress + 'lockr/' + lockrId + '/share';
                var lockrShareDataStr = JSON.stringify(data);

                $.ajax({
                    url: shareApiServiceAddress,
                    async: true,
                    type: 'POST', //POST for authentication
                    data: lockrShareDataStr,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });


            };

            dalockrServices.getSocialChannels = function(successCallback,errorCallback){
                var scApiServiceAddress = apiServiceAddress + 'social/share/channel';
                $.ajax({
                    url: scApiServiceAddress,
                    async: true,
                    type: 'GET', //POST for authentication
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });
            };

            dalockrServices.getShareSocialChannel = function(){
                var scApiServiceAddress = apiServiceAddress + 'social/' + commonServices.accountId() + '/share/channel';
                return $http.get(scApiServiceAddress);
            };


            var channelCaches = [];
            dalockrServices.getShareSocialChannelWithCache = function (sCb,eCb) {

                var accountId = commonServices.accountId();

                //已缓存 且数组成功加载
                if(angular.isDefined(channelCaches[accountId]) && channelCaches[accountId].data){
                    return sCb && sCb(channelCaches[accountId].data);
                }

                if(angular.isUndefined(channelCaches[accountId])){
                    channelCaches[accountId] = {
                        promise:null,
                        data:null
                    }
                }
                if(!channelCaches[accountId].promise){
                    var scApiServiceAddress = apiServiceAddress + 'social/' + commonServices.accountId() + '/share/channel';
                    channelCaches[accountId].promise =  $http.get(scApiServiceAddress);
                }
                channelCaches[accountId].promise.success(function (data) {
                    sCb && sCb(data);
                    channelCaches[accountId].data = data;
                }).error(function (error) {
                    eCb && eCb(error);
                });

            };




            dalockrServices.getAllSocialChannels = function(){
                var scApiServiceAddress = apiServiceAddress + 'social/channel';
                return $http.get(scApiServiceAddress);
            };





            dalockrServices.createUser = function(createUserData,successCallback,errorCallback){

                var createUserDataString = JSON.stringify(createUserData);//Post GuDing Geshi


                $.ajax({
                    url: apiServiceAddress +'user',
                    async: true,
                    type: 'POST', //POST for authentication
                    data: createUserDataString,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });


            };



            dalockrServices.getAllClusterUsers = function(clusterId,successCallback,errorCallback){
                $.ajax({
                    url: apiServiceAddress +'cluster/'+ clusterId + '/users',
                    async: true,
                    type: 'GET',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');

                    }
                }).done(function (data) {

                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });
            };

            dalockrServices.shareLockrWithAnotherUser = function(lockrId,userName,successCallback,errorCallback){

                $.ajax({
                    url: apiServiceAddress + 'lockr/'+ lockrId + '/share/with/' + userName,
                    async: true,
                    type: 'PUT', //POST for authentication
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);
                }).fail(function (data) {
                    errorCallback(data);
                });


            };



            dalockrServices.CreateSharingrule = function(sharingRule,successCallback,errorCallback){

                var sharingRuleData = JSON.stringify(sharingRule);

                $.ajax({
                    url: apiServiceAddress + 'sharingrule',
                    async: true,
                    type: 'POST', //POST for authentication
                    data:sharingRuleData,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);
                }).fail(function (data) {
                    errorCallback(data);
                });

            };


            ///Sharing Rule ///////
            var sRules, sRulePromise;
            dalockrServices.getUserSharingRules  = function(cb, errCb , up){

                if(sRules && !up) {
                    cb(sRules);
                    return;
                }

                !sRulePromise && ( sRulePromise = $http.get(apiServiceAddress + 'sharingrule') );

                sRulePromise.success(function (data) {
                    sRules = data;
                    cb(sRules);
                    sRulePromise = null;
                }).error(function (error) {
                    errCb && errCb(error);
                });
            };


            dalockrServices.getSharingRuleById = function (shareId) {
                var url = apiServiceAddress + 'sharingrule/' + shareId;
                return $http.get(url);
            };

            dalockrServices.updateSharingRule = function (shareId, params) {
                var url = apiServiceAddress + 'sharingrule/' + shareId;
                return $http.put(url,params);
            };




            dalockrServices.setSharingRuleForUser = function(ruleId,successCallback,errorCallback){
                $.ajax({
                    url: apiServiceAddress + 'sharingrule/' + ruleId + '/default',
                    async: true,
                    type: 'PUT',
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        //xhr.setRequestHeader('Content-Type','application/json');
                    }
                }).done(function (data) {
                    successCallback(data);
                }).fail(function (data) {
                    errorCallback(data);
                });
            };
            dalockrServices.deleteSharingRule = function(ruleId,successCallback,errorCallback){
                $.ajax({
                    url: apiServiceAddress + 'sharingrule/' + ruleId,
                    async: true,
                    type: 'DELETE',
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {
                    successCallback(data);
                }).fail(function (data) {
                    errorCallback(data);
                });
            };

            dalockrServices.replyComment = function( message , assetId, socialCommentId , successCallback, errorCallback){
                var replyApiServiceAddress = apiServiceAddress + 'asset/'+ assetId + '/' + socialCommentId +  '/' + 'reply';
                var messageStr = JSON.stringify(message);
                $http.post(replyApiServiceAddress,messageStr).success(function (data) {
                    successCallback(data);
                }).error(function (error) {
                    errorCallback(error);
                });
            };

            dalockrServices.likeComment = function(assetId, socialCommentId , successCallback, errorCallback){
                var likeApiServiceAddress = apiServiceAddress + 'asset/'+ assetId + '/' + socialCommentId +  '/' + 'like';
                var messageStr = JSON.stringify({'like':true});
                $http.post(likeApiServiceAddress,messageStr).success(function (data) {
                    successCallback(data);
                }).error(function (error) {
                    errorCallback(error);
                });
            };

            dalockrServices.sendMessageToBot = function(message){
                var sendMessageToBotAddress = apiServiceAddress + 'bot?message=' + message;
                return $http.post(sendMessageToBotAddress);
            };



            // dashboard services
            dalockrServices.getPublicAssetViewsPerCountry = function(date,accountId, successCallback,errorCallback){
                userServices.getUserProfileInfo(function (userInfo) {

                    var clusterId = userInfo.clusterId;

                    var url;
                    if(date !== null && date.startDate !== null && date.endDate !== null){
                        url = apiServiceAddress + clusterId  + '/track/public/views/country?start=' + $filter('date')((new Date(date.startDate)), 'yyyyMMdd') + '&end=' + $filter('date')((new Date(date.endDate)), 'yyyyMMdd') + '&accountId='+ accountId;
                    } else {
                        url = apiServiceAddress  + clusterId  +'/track/public/views/country?accountId=' + accountId;
                    }

                    $http.get(url).success(function(data){
                        successCallback(data);
                    }).error(function(error){
                        errorCallback(error);
                    });
                });


            };


            dalockrServices.getPublicViewsViaSocialChannelPerDay = function(typeOfView,date,successCallback,errorCallback){
                userServices.getUserProfileInfo(function (userInfo) {

                    var clusterId = userInfo.clusterId;
                    var url;
                    if (date.startDate !== null && date.endDate !== null) {
                        url = apiServiceAddress + clusterId + '/track/' + typeOfView + '/views/socialchannel/per/day?start=' + $filter('date')((new Date(date.startDate)), 'yyyyMMdd') + '&end=' + $filter('date')((new Date(date.endDate)), 'yyyyMMdd');
                    } else {
                        url = apiServiceAddress + clusterId + '/track/' + typeOfView + '/views/socialchannel/per/day';
                    }

                    $http.get(url).success(function (data) {
                        successCallback(data);
                    }).error(function (error) {
                        errorCallback(error);
                    });
                });
            };

            dalockrServices.getPublicViewsPerSocialChannel = function(typeOfView,successCallback,errorCallback){

                userServices.getUserProfileInfo(function (userInfo) {
                    var clusterId = userInfo.clusterId;
                    var url = apiServiceAddress + clusterId + '/track/' + typeOfView + '/views/socialchannel';
                    $http.get(url).success(function(data){
                        successCallback(data);
                    }).error(function(error){
                        errorCallback(error);
                    });
                });


            };

            dalockrServices.getPublicAssetViewsPerBrowserType = function(successCallback,errorCallback){

                userServices.getUserProfileInfo(function (userInfo) {

                    var clusterId = userInfo.clusterId;

                    var url = apiServiceAddress + clusterId + '/track/public/views/browsers';

                    $http.get(url).success(function (data) {
                        successCallback(data);
                    }).error(function (error) {
                        errorCallback(error);
                    });
                });
            };

            dalockrServices.getTotalNumberOfCommentsAndViewsPerDay = function(date,successCallback,errorCallback){
                var url;
                userServices.getUserProfileInfo(function (userInfo) {

                    var clusterId = userInfo.clusterId;

                    if (date !== null && date.startDate !== null && date.endDate !== null) {
                        url = apiServiceAddress + clusterId + '/track/rates?start=' + $filter('date')((new Date(date.startDate)), 'yyyyMMdd') + '&end=' + $filter('date')((new Date(date.endDate)), 'yyyyMMdd');
                    } else {
                        url = apiServiceAddress + clusterId + '/track/rates';
                    }


                    $http.get(url).success(function (data) {
                        successCallback(data);
                    }).error(function (error) {
                        errorCallback(error);
                    });
                });
            };


            dalockrServices.getNumberOfCommentsAndViewsPerDayForAssetOrLockr = function(typeId,successCallback,errorCallback){
                userServices.getUserProfileInfo(function (userInfo) {
                    var  clusterId = userInfo.clusterId;

                    var url = apiServiceAddress + clusterId + '/track/rates/' + typeId;

                    $http.get(url).success(function (data) {
                        successCallback(data);
                    }).error(function (error) {
                        errorCallback(error);
                    });
                });
            };


            dalockrServices.getNumberOfCommentsAndViewsPerDayOnSocialChannels = function(date,accountId,successCallback, errorCallback){
                userServices.getUserProfileInfo(function (userInfo) {

                    var clusterId = userInfo.clusterId;
                    var url;
                    if (date !== null && date.startDate !== null && date.endDate !== null) {
                        url = apiServiceAddress + clusterId + '/track/channel/rates?start=' + $filter('date')((new Date(date.startDate)), 'yyyyMMdd') + '&end=' + $filter('date')((new Date(date.endDate)), 'yyyyMMdd') + '&accountId=' + accountId;
                    } else {
                        url = apiServiceAddress + clusterId + '/track/channel/rates?accountId=' + accountId;
                    }

                    $http.get(url).success(function (data) {
                        successCallback(data);
                    }).error(function (error) {
                        errorCallback(error);
                    });
                });
            };

            dalockrServices.inviteNewUserForLockr = function(id,userNameOrMail,successCallback,errorCallback){
                var url = apiServiceAddress + 'lockr/' + id + '/invite/' + userNameOrMail;

                $http({
                   method:'PUT',
                   url:url
                }).success(function(data){
                    successCallback(data);
                }).error(function(error){
                    errorCallback(error);
                });
            };

            dalockrServices.inviteNewUser = function(lockrId, userNameOrMail, socialInviteData){
                var url = apiServiceAddress + 'lockr/' + lockrId + '/invite/' + userNameOrMail;

                if(socialInviteData !== null){
                    return $http({
                        method:'PUT',
                        url:url,
                        data:socialInviteData
                    })

                } else {
                    return $http({
                        method:'PUT',
                        url:url
                    })
                }
            };


            dalockrServices.shareNewUser = function(lockrId, userNameOrMail, socialInviteData){
                var url = apiServiceAddress + 'lockr/' + lockrId + '/share/with/' + userNameOrMail;

                if(socialInviteData !== null){
                    return $http({
                        method:'PUT',
                        url:url,
                        data:socialInviteData
                    })

                } else {
                    return $http({
                        method:'PUT',
                        url:url
                    })
                }
            };

            dalockrServices.getUserDashboard = function(date,accountId, successCallback,errorCallback){

                var url;
                if(date !== null && date.startDate !== null && date.endDate !== null){
                    url = apiServiceAddress + 'user/stats/dashboard?start=' + $filter('date')((new Date(date.startDate)), 'yyyyMMdd') + '&end=' + $filter('date')((new Date(date.endDate)), 'yyyyMMdd') + '&accountId=' + accountId;
                } else {
                    url = apiServiceAddress + 'user/stats/dashboard?accountId=' + accountId;
                }

                $http.get(url).success(function(data){
                    successCallback(data);
                }).error(function(error){
                    errorCallback(error);
                });
            };


            dalockrServices.getNumberOfCommentsAndViewsPerDayForAssetOrLockrOnSocialChannels = function(date, entityId, successCallback, errorCallback){

                //clusterId = $sessionStorage.comDalockrDev.clusterId;
                userServices.getUserProfileInfo(function (userInfo) {
                    clusterId = userInfo.clusterId;
                    var url;
                    if(date !== null && date.startDate !== null && date.endDate !== null){
                        url = apiServiceAddress + clusterId + '/track/channel/rates/' + entityId + '?start=' + $filter('date')((new Date(date.startDate)), 'yyyyMMdd') + '&end=' + $filter('date')((new Date(date.endDate)), 'yyyyMMdd');
                    } else {
                        url = apiServiceAddress + clusterId + '/track/channel/rates/' + entityId;
                    }
                    $http.get(url).success(function(data){
                        successCallback(data);
                    }).error(function(error){
                        errorCallback(error);
                    });

                });
            };


            var userAvailableSpaceInfo;
            var userAvailableSpaceInfoPromise;
            dalockrServices.getUsedAndAvailableSpaceInformationForUser = function(cb,update){
                if(userAvailableSpaceInfo && !update) cb(userAvailableSpaceInfo);
                if(userAvailableSpaceInfoPromise){
                    userAvailableSpaceInfoPromise.success(function (data) {
                        userAvailableSpaceInfo = data;
                        userAvailableSpaceInfoPromise = null;
                        cb(userAvailableSpaceInfo);
                    })
                } else {
                    var url = apiServiceAddress + 'user/storage?accountId=' + commonServices.accountId();
                    userAvailableSpaceInfoPromise = $http.get(url).success(function(data){
                        userAvailableSpaceInfo = data;
                        userAvailableSpaceInfoPromise = null;
                        cb(userAvailableSpaceInfo);
                    });
                }
            };

            dalockrServices.updateUserDetails = function(id, data ,successCallback, errorCallback){

                var url = apiServiceAddress + 'user/' + id;
                var dataStr = JSON.stringify(data);

                $http.put(url, dataStr).success(function(data){
                    ////console.log(data);
                    successCallback(data);
                }).error(function(error){
                    errorCallback(error);
                });
            };
            dalockrServices.deleteASocialChannel = function(scId , successCallback, errorCallback){
                var url = apiServiceAddress + 'social/channel/' + scId;

                return $http.delete(url);

            };

            dalockrServices.getUserDetails = function(id , successCallback, errorCallback){
                var url = apiServiceAddress + 'user/' + id;
                return $http.get(url);
            };


            var events;
            var eventsPromise;
            dalockrServices.getEvent = function(successCallback, errorCallback,offset,limit,isUpdate){

                if(!isUpdate && events) {
                    successCallback(events);
                    return;
                }
                if(!eventsPromise){
                    var url = apiServiceAddress + 'event?limit=' + parseInt(limit) +'&offset=' + offset;
                    eventsPromise = $http.get(url);
                }
                eventsPromise.success(function (data) {
                    events = data;
                    successCallback(events);
                    eventsPromise = undefined;
                }).error(function (error) {
                    errorCallback && errorCallback(error);
                    eventsPromise = undefined;
                });
            };

            dalockrServices.getUserFollowings = function(successCallback, errorCallback){
                var url = apiServiceAddress + 'user/following';
                $http.get(url).success(function(data){
                    successCallback(data);
                }).error(function(error){
                    errorCallback(error);
                });
            };
            dalockrServices.getUserFollowers = function(successCallback, errorCallback){
                var url = apiServiceAddress + 'user/followers';
                $http.get(url).success(function(data){
                    successCallback(data);
                }).error(function(error){
                    errorCallback(error);
                });
            };
            dalockrServices.getAssetOrLockrFollowers = function(type,id,successCallback,errorCallback){
                var url = apiServiceAddress + type + '/' + id + '/followers';
                $http.get(url).success(function(data){
                    successCallback(data);
                }).error(function(error){
                    errorCallback(error);
                });
            };
            dalockrServices.getInfoLockrFollowers = function(type,id,successCallback,errorCallback){
                var url = apiServiceAddress + type + '/' + id + '/followers';
                return $http.get(url)
            };
            dalockrServices.followUser = function(id,successCallBack, errorCallBack){
                var url = apiServiceAddress + 'user/follow/user/' + id;
                $.ajax({
                    url : url,
                    type : 'POST',
                    async : true,
                    beforeSend : function(xhr, sentings){
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        //xhr.setRequestHeader('Content-Type','application/json');


                    },
                    success : function(data){
                        successCallBack(data);
                    },
                    error : function(error){
                        errorCallBack(error);
                    }
                });
            };
            dalockrServices.followLockr = function(LockrId,successCallBack, errorCallBack){
                var url = apiServiceAddress + 'user/follow/lockr/' + LockrId;
                $.ajax({
                    url : url,
                    type : 'POST',
                    async : true,
                    beforeSend : function(xhr){
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());

                        //xhr.setRequestHeader('Content-Type','application/json');

                    },
                    success : function(data){
                        successCallBack(data);
                    },
                    error : function(error){
                        errorCallBack(error);
                    }
                });
            };
            dalockrServices.followAsset = function(assetId,successCallBack, errorCallBack){
                var url = apiServiceAddress + 'user/follow/asset/' + assetId;
                $.ajax({
                    url : url,
                    type : 'POST',
                    async : true,
                    beforeSend : function(xhr, sentings){
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        //xhr.setRequestHeader('Content-Type','application/json');


                    },
                    success : function(data){
                        successCallBack(data);
                    },
                    error : function(error){
                        errorCallBack(error);
                    }
                });
            };
            dalockrServices.deleteUserFollows = function(followId, successCallBack, errorCallBack){
                var url = apiServiceAddress + 'user/following/' + followId;
                $http.delete(url).success(function(data){
                    successCallBack(data);
                }).error(function(error){
                    errorCallBack(error);
                });
            };
            dalockrServices.getCluster = function(clusterId, successCallBack, errorCallBack){
                var url = apiServiceAddress + 'cluster/' + clusterId;
                $http.get(url).success(function(data){
                    successCallBack(data);
                }).error(function(error){
                    errorCallBack(error);
                });
            };
            dalockrServices.getClusters = function(successCallBack, errorCallBack){
                var url = apiServiceAddress + 'cluster';
                $http.get(url).success(function(data){
                    successCallBack(data);
                }).error(function(error){
                    errorCallBack(error);
                });
            };
            dalockrServices.updateCluster = function(clusterId,data, successCallBack, errorCallBack){
                var url = apiServiceAddress + 'cluster/' + clusterId;
                $http.put(url,data).success(function(data){
                    successCallBack(data);
                }).error(function(error){
                    errorCallBack(error);
                });
            };
            dalockrServices.createCluster = function(cluster,successCallback, errorCallback){

                var clusterData = JSON.stringify(cluster);
                var url = apiServiceAddress + 'cluster';

                $.ajax({
                    url: url,
                    async: true,
                    type: 'POST',
                    data:clusterData,
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader('Authorization', "Bearer " + userServices.getAccessToken());
                        xhr.setRequestHeader('Content-Type','application/json');


                    }
                }).done(function (data) {

                    successCallback(data);

                }).fail(function (data) {
                    errorCallback(data);
                });
            };
            dalockrServices.getClusterUsers = function(clusterId, successCallBack, errorCallBack){
                var url = apiServiceAddress + 'cluster/' + clusterId + '/users';
                $http.get(url).success(function(data){
                    successCallBack(data);
                }).error(function(error){
                    errorCallBack(error);
                });
            };
            dalockrServices.getClusterInfo = function(successCallBack,errorCallBack){
              var url = apiServiceAddress + 'cluster/info';
                $http.get(url).success(function(data){
                    successCallBack(data);
                }).error(function(error){
                    errorCallBack(error);
                });
            };
            dalockrServices.addSocialChannel = function(clusterId, name, successCallBack, errorCallBack){
                var url = apiServiceAddress + clusterId + '/adm/add/social/channel/' + name;
                $http.get(url).success(function(data){
                    successCallBack(data);
                }).error(function(error){
                    errorCallBack(error);
                });
            };
            dalockrServices.getSearch = function(searchText, successCallBack, errorCallBack){
                var url = apiServiceAddress + userServices.currentUser().clusterId + '/search?text=' + searchText + '&accountId=' + commonServices.accountId();
                $http.get(url)
                    .success(function(data){
                        successCallBack && successCallBack(data);
                    })
                    .error(function(error){
                        errorCallBack && errorCallBack(error);
                    });
            };

            dalockrServices.getLockrFollowers = function(lockrId, successCallback,errorCallback){

                var url = apiServiceAddress + 'lockr/' + lockrId + '/followers';

                $http.get(url)
                    .success(function(data){
                        successCallback(data);
                    })
                    .error(function(error){
                        errorCallback(error);
                    });
            };

            dalockrServices.getAssetFollowers = function(assetId){
                var url = apiServiceAddress + 'asset/' + assetId + '/followers';
                return $http.get(url)
            };

            dalockrServices.addComment = function(type,typeId,socialCommentId,message){
                var url = apiServiceAddress + type + '/' + typeId + '/' + socialCommentId + '/reply';
                return $http.post(url,{message:message});
            };


            dalockrServices.getSocialFriends = function(){

                var url = apiServiceAddress + 'user/social/friends';

                return $http.get(url).then(function(response){
                    return response.data;
                });
            };


            dalockrServices.getDropboxContent = function(socialChannelId, successfulCallback){

                var url = apiServiceAddress + 'social/dropbox/content/' + socialChannelId;

                return $http.get(url).then(function(response){
                    successfulCallback(response);
                });
            };

            dalockrServices.addDropboxFolderToLockr = function(socialChannelId, path,pId,successCallback,errorCallback){

                var url = apiServiceAddress + 'lockr/from/service';

                var data = {
                    'path': path,
                    'socialChannelId': socialChannelId,
                    'parentLockrId':pId
                };

                $http.post(url, data).success(function (data) {
                    successCallback(data);
                }).error(function (error) {
                    errorCallback(error);
                });
            };



            dalockrServices.addDropboxFileToLockr = function(socialChannelId,lockrId, path, successCallback,errorCallback){

                var url = apiServiceAddress + 'asset/from/service';

                var data = {
                    'path': path,
                    'socialChannelId': socialChannelId,
                    'lockrId': lockrId
                };

                $http.post(url, data).success(function (data) {
                    successCallback(data);
                }).error(function (error) {
                    errorCallback(error);
                });
            };


            /**
             * Log off
             * @returns {HttpPromise}
             */
            dalockrServices.logOff = function(){
                var token = angular.copy(userServices.getAccessToken()); //临时存储token
                commonServices.removeSessionData();//移除所有缓存, 包括token
                window.location.href = apiServiceAddress + 'session/logoff?token=' +  token + '&redirectUri=' + encodeURIComponent(appConfig.REDIRECT_URL_ADDRESS);
            };

            /**
             * Get invite link
             * @param lockrId
             * @returns {HttpPromise}
             */
            dalockrServices.getLockrInviteLink = function(lockrId){
                var url = apiServiceAddress + 'lockr/' + lockrId + '/invite_link';
                return $http.get(url);
            };



            dalockrServices.grantPermissions = function(id, type, permission, user,lockrRole){

                var url = apiServiceAddress + 'entitypermission';

                var entityData = {
                    entityId:id,
                    entityType:type,
                    permission:permission,
                    user:user,
                    lockrRole:lockrRole
                };

                return $http.post(url,entityData)
            };
            dalockrServices.deletePermissions  = function(permissionid){
                var url = apiServiceAddress + 'entitypermission/' + permissionid;
                return $http.delete(url);
            };
            dalockrServices.getUserPermissions  = function(username){
                var url = apiServiceAddress + 'entitypermission/' + username +"/Lockr";
                return $http.delete(url);
            };

            dalockrServices.getAllAccounts = function(){
                var url = apiServiceAddress + 'account';
                return $http.get(url);
            };


            dalockrServices.likeSpeicifiedComment = function(type, typeId, commentId, isLike){
                var url = apiServiceAddress + type + '/' + typeId + '/' + commentId + '/like';
                return $http.post(url,{
                    like:isLike
                });
            };


            dalockrServices.getfbPages = function(channelId){
                var url = apiServiceAddress + 'social/channel/' + channelId  + '/fbpages';
                return $http.get(url);
            };
            dalockrServices.putFbPages = function(channelId,pages){
                var url = apiServiceAddress + 'social/channel/' + channelId  + '/fbpages';
                return $http.put(url,{
                    "pages":pages
                });
            };
            dalockrServices.getAccessUsers = function(lockrId){
                var url = apiServiceAddress + 'lockr/' + lockrId + '/users';
                return $http.get(url);
            };

            dalockrServices.getLockrConverstion = function (lockrId, offset, limit) {
                var url = apiServiceAddress + 'conversation/lockr/' + lockrId + '?offset=' + offset + '&limit=' + limit;
                return $http.get(url);
            };

            dalockrServices.sendMessageToUser = function (id, msg) {
                var url = apiServiceAddress + 'conversation/user/' + id;
                return $http.post(url,{message:msg});
            };
            dalockrServices.sendMessageToLockr = function (lockrId, msg) {
                var url = apiServiceAddress + 'conversation/lockr/' + lockrId;
                return $http.post(url,{message:msg});
            };
            dalockrServices.markAllMessagesInConversation = function (cId, msg) {
                var url = apiServiceAddress + 'conversation/' + cId + '/seen';
                return $http.put(url);
            };
            dalockrServices.markMessageInConversation = function (msgId , cId) {
                var url = apiServiceAddress + 'conversation/' + cId + '/' + msgId + '/seen';
                return $http.put(url);
            };
            dalockrServices.getPrivateLockrUserList = function(lockrId){
                var url = apiServiceAddress +  'lockr/' + lockrId +'/invite';
                return $http.get(url);
            };


            /**
             * 获取lockr的User
             * @param lockrId
             * @returns {HttpPromise}
             */
            dalockrServices.getLockrUsers = function (lockrId) {
                var url = apiServiceAddress +  'lockr/' + lockrId + '/users';
                return $http.get(url);
            };

            dalockrServices.listScheduledShareEventsForAsset = function (assetId) {
                var url = apiServiceAddress +  'asset/' + assetId + '/schedule';
                return $http.get(url);
            };

            dalockrServices.scheduleShareEventForAssetOrLockr = function (type, eventId, httpBody) {
                var url = apiServiceAddress + type + '/' + eventId + '/schedule';
                return $http.post(url, httpBody);
            };

            //////////////////////////
            ///////// Moderation /////
            //////////////////////////

            /**
             * 获取 审核请求
             * @returns {HttpPromise}
             */
            dalockrServices.listApprovalRequests = function () {
                var url = apiServiceAddress +  'moderation/requests';
                return $http.get(url);
            };
            /**
             * 获取 有权审核的User
             * @returns {HttpPromise}
             */
            var toApprovalRequests;
            var toApprovalRequestsPromise;
            dalockrServices.listToApprovalRequests = function (update, entityId, sCb, eCb, isFull) {

                if (toApprovalRequests && !update) {
                    sCb(isFull ? toApprovalRequests : commonServices.requestsDataWithSameEntityId(toApprovalRequests,entityId));
                    return;
                }
                if(!toApprovalRequestsPromise){
                    var url = apiServiceAddress +  'moderation/approvals';
                    toApprovalRequestsPromise =  $http.get(url);
                }
                toApprovalRequestsPromise.success(function (data) {
                    toApprovalRequests = data;
                    sCb && sCb(isFull ? toApprovalRequests : commonServices.requestsDataWithSameEntityId(toApprovalRequests,entityId));
                    toApprovalRequestsPromise = undefined;
                }).error(function (error) {
                    toApprovalRequestsPromise = undefined;
                    eCb && eCb(error);
                });

            };
            /**
             * 提交审核结果 承认或拒绝
             */
            dalockrServices.updateApprovalRequest = function (params,isApproved, requestId) {
                var url = apiServiceAddress + 'moderation/' + requestId;
                params.status = isApproved ? 'APPROVED' : 'DENIED';
                return $http.put(url,params);
            };


            dalockrServices.addAccount = function (params) {
                var url = apiServiceAddress + 'account';
                return $http.post(url,params);
            };
            dalockrServices.getAllAccountLicense = function () {
                var url = apiServiceAddress + 'accountlicense';
                return $http.get(url,{cache:true});
            };
            dalockrServices.addAccountLicense = function(params) {
                var url = apiServiceAddress + 'accountlicense';
                return $http.post(url,params);
            }





            ////////////////////
            ////Notification////
            ////////////////////
            dalockrServices.getUserNotification = function (sCb, eCb, type, offset, limit) {
                var url = apiServiceAddress + 'event/notification?notificationType='+ type +'&limit=' + parseInt(limit) +'&offset=' + offset;
                $http.get(url,{cache:true}).success(function (data) {
                    sCb && sCb(data);
                }).error(function (error) {
                    eCb && eCb(error);
                })

            };

            dalockrServices.getUserAllNotification = function (sCb, eCb, offset, limit) {
                var url = apiServiceAddress + 'event/notification' +'?limit=' + parseInt(limit) +'&offset=' + offset;
                $http.get(url,{cache:true}).success(function (data) {
                    sCb && sCb(data);
                }).error(function (error) {
                    eCb && eCb(error);
                })

            };


            dalockrServices.makeNotificationAsSeenById = function (notificationId) {
                var url = apiServiceAddress + 'event/notification/' +notificationId +'/seen';
                return $http.put(url);
            };
            dalockrServices.makeAllNotificationAsSeen = function () {
              var url  = apiServiceAddress + 'event/notification/seen';
                return $http.put(url);
            };
            dalockrServices.deleteAnNotification = function (nId) {
                var url  = apiServiceAddress + 'event/notification/' + nId;
                return $http.delete(url);
            };


            var licenseData;
            var licensePromise;
            dalockrServices.getLicenseData = function (type,cb){
                if(licenseData){
                    cb && cb(commonServices.filterLicense(licenseData,type));
                    return;
                }
                if(!licensePromise){
                    licensePromise = $http.get('data/license.json');
                }
                licensePromise.success(function (data) {
                    licenseData = data;
                    cb && cb(commonServices.filterLicense(licenseData,type));
                });
            };



            //////Lockr Sharing Rule
            dalockrServices.assignSharingRuleForLockr = function (lid, rid) {
                var url  = apiServiceAddress + 'lockr/' + lid +'/assign/sharingrule/' + rid;
                return $http.put(url);
            };
            dalockrServices.unAssignSharingRuleForLockr = function (lid, rid) {
                var url  = apiServiceAddress + 'lockr/' + lid +'/remove/sharingrule/' + rid;
                return $http.put(url);
            };


            //PP layout
            dalockrServices.changePPLayout = function (lid, key, value) {
                var layoutParams = {
                    layoutParams: {}
                };

                layoutParams.layoutParams[key] = value;

                var url  = apiServiceAddress + 'lockr/' + lid;
                return $http.put(url, layoutParams);
            };



            //Comments
            dalockrServices.getLikesOfComment = function (commentId, offset, limit) {
                var url = apiServiceAddress + 'likes/' + commentId + '?offset=' + offset + '&limit=' + limit;
                return $http.get(url);
            };
            dalockrServices.getRepliesOfComment = function (commentId, offset, limit) {
                var url = apiServiceAddress + 'comments/' + commentId + '?offset=' + offset + '&limit=' + limit;
                return $http.get(url);
            };
            dalockrServices.deleteCommentById = function (commentId) {
                var url = apiServiceAddress + 'comment/' + commentId;
                return $http.delete(url);
            };
            dalockrServices.deleteCommentWhenUnplished = function (commentId) {
                var url = apiServiceAddress +  'comment/' + commentId + '?deleteFromChannel=true';
                return $http.delete(url);
            };





            //Facebook
            dalockrServices.getFacebookPageById = function(fId){
                var url = apiServiceAddress + 'social/channel/' + fId + '/fbpages';
                var  defer = $q.defer();
                $http.get(url).success(function (result) {
                    defer.resolve({data:result,fId:fId});
                }).error(function (err) {
                   defer.reject(err);
                });
                return defer.promise;
            };
            
            dalockrServices.addFacebookPage = function (pages, fid) {
              var url  = apiServiceAddress + 'social/channel/'+ fid +'/fbpages';
                return $http.put(url,{pages:pages});
            };

            dalockrServices.uploadShare = function(commentId,message, tit, txt) {
                var url  = apiServiceAddress + 'comment/'+ commentId ;
                var data = {
                    shareMsg:message,
                    title:tit,
                    text:txt
                };
                console.log(data);
                return $http.put(url,data);
            };

            
            dalockrServices.getFacebookPageInsightsById = function(fId){
                var url = apiServiceAddress + 'social/fb/' + fId + '/insights';
                return $http.get(url);
            };


            dalockrServices.assignUserToAccount = function (accountId, username) {
                var url  = apiServiceAddress + 'account/' + accountId +'/assign/' + username;
                return $http.put(url);
            };
            dalockrServices.removeUserFromAccount = function (accountId, username) {
                var url  = apiServiceAddress + 'account/' + accountId +'/unassign/' + username;
                return $http.put(url);
            };
            dalockrServices.deleteAccount = function (accountId) {
                var url  = apiServiceAddress + 'account/' + accountId;
                return $http.delete(url);
            };
            dalockrServices.updateAccount = function (accountData,accountId) {
                var url  = apiServiceAddress + 'account/' + accountId;
                return $http.put(url,accountData);
            };
            dalockrServices.getAccountInfo = function (accountId) {
                var url = apiServiceAddress + 'account/' + accountId;
                return $http.get(url);
            };
            dalockrServices.getAccountInfoDetails = function(accid){
                var url = apiServiceAddress + 'account/' + accid + '/info';
                return $http.get(url);
            };

            
            dalockrServices.getAccountUsers = function (accountId) {
                var url = apiServiceAddress + 'account/' + accountId + '/users';
                return $http.get(url);
            };


            dalockrServices.getAllChannel = function () {
                var url = apiServiceAddress + 'channel';
                return $http.get(url,{cache:true});
            };
            dalockrServices.createNewChannel = function (params) {
                var url = apiServiceAddress + 'channel';
                return $http.post(url,params);
            };
            dalockrServices.updateChannel = function (cId,params) {
                var url = apiServiceAddress + 'channel/' + cId;
                return $http.put(url,params);
            };
            dalockrServices.addEntityToChannel = function (channelId,entityType,entityId) {
                var url = apiServiceAddress + 'channel/' + channelId +'/add/' + entityType + '/' + entityId;
                return $http.put(url);
            };
            dalockrServices.removeEntityFromChannel = function () {
                var url = apiServiceAddress + 'channel/' + channelId +'/remove/' + entityType + '/' + entityId;
                return $http.put(url);
            };


            dalockrServices.getPublicThumbnailUrl = function (type,clusterId,trackingId) {
                return appConfig.API_SERVER_ADDRESS + '/'+ type +'/' + clusterId +'/' + trackingId +  '/tn';
            };

            dalockrServices.getChannelsDetails = function (cId) {
                var url = apiServiceAddress + 'channel/' + cId;
                return $http.get(url);
            };

            dalockrServices.getEntityStats = function (date,type,id) {
                var url;
                if(date !== null && date.startDate !== null && date.endDate !== null){
                    url = apiServiceAddress + type + '/' + id + '/stats?start=' + $filter('date')((new Date(date.startDate)), 'yyyyMMdd') + '&end=' + $filter('date')((new Date(date.endDate)), 'yyyyMMdd');
                } else {
                    url = apiServiceAddress + type + '/' + id + '/stats';
                }
                return $http.get(url);
            };

            return dalockrServices;

        }
    ]
);
