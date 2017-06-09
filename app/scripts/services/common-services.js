'use strict';
/**
 * Created by Ann on 1/6/15.
 */

angular.module('dalockrAppV2App').service('commonServices',['$sessionStorage','appConfig','$cacheFactory','$rootScope','ipCookie','cacheService','$dalMedia',function($sessionStorage,appConfig,$cacheFactory,$rootScope,ipCookie,cacheService,$dalMedia) {

    var commonServices ={};
    var currentlockrsInTimelines;
    var userStats = null;
    var userSpaceInfo = null;
    var userDetails = null;
    var toShowAssetDetails = null;
    var selectedAssetId = null;
    var dropboxSocialChannelId;
    var boxSocialChannelId;
    var assetFollowers;
    var accountLockrs;
    var currentLockrSharingRule,
        fileInput;


    commonServices.isOpInSublockrToolBar = false;
    commonServices.socialChannels = null;

    var selectedLockr={
        name: '',
        description:'',
        id:''
    };

    // to save currentLockrselected before edit
    var selectedLockrSaved;

    //get Authentication Token
    //commonServices.getAuthToken = function (sessionId, sessionSecret) {
    //    if (sessionId && sessionSecret) {
    //        var salt = '' + Date.now();
    //        var signature = CryptoJS.HmacSHA256(salt, sessionSecret);
    //
    //        var authToken = {
    //            salt: salt,
    //            sessionId: sessionId,
    //            signature: signature.toString()
    //        };
    //
    //        return authToken;
    //    }
    //    return false;
    //};

    commonServices.openPreview = function(type,id,clusterId){
        var url =  appConfig.API_SERVER_ADDRESS + '/publishing-point/#/m/' + type + '/' + id + '?clusterId=' + clusterId; 
        window.open(url);
    };

    //findIndex in a list
    commonServices.findIndex = function(obj,id){
        var index = 0;
        angular.forEach(obj,function(value,key){
            if(value['id'] == id ){
                index = key;
            }
        });
        return index;
    };


    commonServices.setUserStats=function(data){
        userStats = data;
    };

    commonServices.getUserStats=function(){
        return userStats;
    };

    commonServices.setSelectedAssetId=function(data){
        selectedAssetId = data;
    };

    commonServices.getSelectedAssetId=function(){
        return selectedAssetId;
    };

    commonServices.getAssetStats = function(assetId,successfulCallback,errorCallback){
        var assetIsShare = false;
        angular.forEach(userStats.assetsWithStats, function(value){
            if(value.assetId === assetId){
                assetIsShare = true;
                successfulCallback(value);
            }
        });

        if(!assetIsShare){
            errorCallback(null);
        }
    };

    commonServices.setUserSpaceInfo = function(data){
      userSpaceInfo = data;
    };
    commonServices.getUserSpaceInfo = function(){
        return userSpaceInfo;
    };

    commonServices.setUserDetails = function(data){
      userDetails = data;
    };
    commonServices.getUserDetails = function(data){
      return userDetails;
    };

    commonServices.setShowAssetDetails = function(data){
        toShowAssetDetails = data;
    };
    commonServices.getShowAssetDetails = function(data){
        return toShowAssetDetails;
    };



    commonServices.removeSessionData = function(){

        commonServices.socialChannels = null;
        commonServices.setUserSpaceInfo(null);
        accounts = null;
        accountLockrs = null;



        ipCookie.remove('accessToken');
        cacheService.clearLockrStack();
        delete $sessionStorage.rootLockr;
        delete $sessionStorage.accountId;
    };
    
    commonServices.setAccountId = function(id){
        $sessionStorage.accountId = id;
        $rootScope.$broadcast('account-change');
    };
    commonServices.accountId = function(){
        return $sessionStorage.accountId;
    };


    commonServices.getRedirectUrlParams = function(url){

        var params = {};


        var reg = new RegExp('\\?([^&#]+=[^&#]+&*)+','g');

        var result = url.match(reg);

        if( result === null ){
            return false;
        }

        var resultStr = result[0].replace(/^\?/,'');
        var paramsArr = resultStr.split('&');
        for(var i = 0; i < paramsArr.length; i++){
            var itemArr = paramsArr[i].split('=');
            params[itemArr[0]] = itemArr[1];
        }

        if(params.sid && params.ss){
            return params;
        } else {
            return false;
        }


    };


    commonServices.in_array = function(search,array){
        for(var i in array){
            if(array[i] === search){
                return true;
            }
        }
        return false;
    };

    commonServices.loadJsCssFile = function(filename,filetype){
        var fileref;
        if(filetype == 'js'){
            fileref = document.createElement('script');
            fileref.setAttribute('type','text/javascript');
            fileref.setAttribute('src',filename);
        }else if(filetype == 'css'){
            fileref = document.createElement('link');
            fileref.setAttribute('rel','stylesheet');
            fileref.setAttribute('type','text/css');
            fileref.setAttribute('href',filename);
        }
        if(typeof fileref != 'undefined'){
            document.getElementsByTagName('head')[0].appendChild(fileref);
        }
    };


    commonServices.labJs = function (files,success,error) {
        angular.forEach(files, function (v) {

        })
    };


    commonServices.addCss = function addCSS(cssText){
        var style = document.createElement('style'),
            head = document.head || document.getElementsByTagName('head')[0];
        style.type = 'text/css';
        if(style.styleSheet){ //IE
            var func = function(){
                try{
                    style.styleSheet.cssText = cssText;
                }catch(e){

                }
            };
            if(style.styleSheet.disabled){
                setTimeout(func,10);
            }else{
                func();
            }
        }else{ //w3c
            var textNode = document.createTextNode(cssText);
            style.appendChild(textNode);
        }
        head.appendChild(style); //
    };


    commonServices.getSocialChannelViewNum = function(viewLink){

        var socialChannelView = [];
        angular.forEach(viewLink, function(value, key){

            if(typeof value.socialChannelType !== 'undefined'){

                var type = value.socialChannelType.toLowerCase();
                var mdiIcon = '';

                if(type === 'facebook'){
                    mdiIcon = 'mdi-facebook';
                } else if(type === 'twitter'){
                    mdiIcon = 'mdi-twitter';
                } else if(type === 'google'){
                    mdiIcon = 'mdi-google';
                } else if(type === 'youtube'){
                    mdiIcon = 'mdi-youtube-play';
                } else if(type === 'linkedin'){
                    mdiIcon = 'mdi-linkedin';
                }else if(type === 'pinterest'){
                    mdiIcon = 'mdi-pinterest';
                }else if(type === 'evernote'){
                    mdiIcon = 'mdi-evernote';
                }

                if(socialChannelView.length === 0){
                    socialChannelView.push(mdiIcon)
                } else {

                    var isExists = false;
                    angular.forEach(socialChannelView, function(v,k){

                        if(mdiIcon === v){
                            isExists = true;
                        }
                    });

                    if(!isExists){
                        socialChannelView.push(mdiIcon)
                    }
                }
            }
        });
        return socialChannelView;

    };


    commonServices.getCommentList = function(comments){
        var commentList = [];
        if (comments.length !== 0) {
            for (var i = 0; i < comments.comments.length; i++) {
                for (var j = 0; j < comments.comments[i].comments.length; j++) {
                    if (comments.comments[i].comments[j].commentType.toLowerCase() === 'facebook') {
                        comments.comments[i].comments[j].iType = 'mdi-facebook';
                        comments.comments[i].comments[j].userPicSrc = commonServices.getProfilePicByTypeAndId('facebook',comments.comments[i].comments[j].by[0].fromId);
                    } else if (comments.comments[i].comments[j].commentType.toLowerCase() === 'twitter') {
                        comments.comments[i].comments[j].iType = 'mdi-twitter';
                        //console.log(comments.comments[i].comments[j].by[0]);
                        comments.comments[i].comments[j].userPicSrc = commonServices.getProfilePicByTypeAndId('twitter',comments.comments[i].comments[j].by[0].fromId);
                    } else if (comments.comments[i].comments[j].commentType.toLowerCase() === 'dalockr') {
                        comments.comments[i].comments[j].iType = 'dl-dalockr';
                        comments.comments[i].comments[j].userPicSrc = appConfig.API_SERVER_ADDRESS + '/u/demo/' + comments.comments[i].comments[j].by[0].username + '/avatar';
                    }
                    commentList.push(comments.comments[i].comments[j]);
                }
            }
        }
        return commentList;
    };




    commonServices.getProfilePicByTypeAndId = function (type, id) {
        var picUrl;
        switch (type){
            case 'facebook':
                picUrl = 'https://graph.facebook.com/' + id + '/picture?type=square';
                break;
            case 'twitter':
                picUrl = 'https://twitter.com/' + id + '/profile_image?size=normal'; //screen name
                //picUrl = 'http://pbs.twimg.com/profile_images/' + id  +'/7df3h38zabcvjylnyfe3_normal.png';
                break;
        }
        return picUrl;
    };


    commonServices.getUserPicType = function(type,comment){
        if(type === 'facebook'){
            return 'https://graph.facebook.com/' + comment.by[0].fromId + '/picture?type=square';
        } else if(type === 'twitter'){
           return 'https://twitter.com/' + comment.by[0].screenName + '/profile_image?size=normal'; //screen name
            //return 'https://abs.twimg.com/sticky/default_profile_images/default_profile_4_normal.png';
        } else if(type === 'dalockr'){
            if(comment.byUserName){
                return appConfig.API_SERVER_ADDRESS + '/u/dalockr/' + comment.byUserName + '/avatar';
            } else {
                return appConfig.API_SERVER_ADDRESS + '/u/dalockr/' + comment.by[0].username + '/avatar';
            }

        }
    };

    commonServices.convertBase64UrlToBlob = function(urlData){
        var bytes=window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte

        var ab = new ArrayBuffer(bytes.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob( [ab] , {type : 'image/png'});
    };

    commonServices.convertBase64UrlToBlobThumb = function(urlData){
        //var bytes=window.atob(urlData.split(',')[1]);
        // 去掉url的头，并转换为byte
        //var bytes = {
        //    "mimeType": urlData.split(',')[0],
        //    "data": urlData.split(',')[1]
        //};
        //return bytes;
        console.log(urlData);
        return urlData.split(';')[1];

        //var ab = new ArrayBuffer(bytes.length);
        //var ia = new Uint8Array(ab);
        //for (var i = 0; i < bytes.length; i++) {
        //    ia[i] = bytes.charCodeAt(i);
        //}
        //return new Blob( [ab] , {type : 'image/png'});
    };

    commonServices.getCurrentBroswerHeight = function(){
        return $(document.body).outerHeight(true);
    };
    commonServices.getCurrentBroswerWidth = function(){
        return $(document.body).outerWidth(true);
    };



    var searchKeyword = null;
    commonServices.setSearchKeyWord = function(data){
        searchKeyword = data;
    };
    commonServices.getSearchKeyWord = function(){
        return searchKeyword;
    };

    commonServices.setRootLockr = function(data){
        $sessionStorage.rootLockr = data;
    };
    commonServices.getRootLockr = function(){
        return $sessionStorage.rootLockr;
    };


    commonServices.cacheInstance = function(cacheID){
        if($cacheFactory.get(cacheID)){
            return $cacheFactory.get(cacheID);
        } else {
            return $cacheFactory(cacheID);
        }

    };

    commonServices.banBodyScroll = function(){
        var bodyElem = angular.element('body');
        if(!bodyElem.hasClass('stop-scroll')){
            bodyElem.addClass('stop-scroll');
        }
    };
    commonServices.allowBodyScroll = function(){
        var bodyElem = angular.element('body');
        if(bodyElem.hasClass('stop-scroll')){
            bodyElem.removeClass('stop-scroll');
        }
    };

    var currentAudio = null;
    commonServices.setCurrentAudio = function(audioObj){
        currentAudio = audioObj;
    };
    commonServices.getCurrentAudio = function(){
        return currentAudio;
    };
    commonServices.setDropboxSocialChannelId = function(data){
            dropboxSocialChannelId = data;
    }

    commonServices.getDropboxSocialChannelId = function(){
        return dropboxSocialChannelId;
    }
    commonServices.setBoxSocialChannelId = function(data){
        boxSocialChannelId = data;
    }

    commonServices.getBoxSocialChannelId = function(){
        return boxSocialChannelId;
    }

    commonServices.changeDropboxToTreeView = function(dpData){
        var dataTree = {
            label: 'All files',
            children: []
        };

        angular.forEach(dpData.data.dropBoxFile,function(data){
            var element = {};
            if(data){
                element.label = data.path;
                element.id = data.id;
            }
            dataTree.children.push(element);
        });

        angular.forEach(dpData.data.dropBoxFolder,function(data){
            if(data.dropBoxFolder){
                if(data.dropBoxFolder.length > 0){
                    dataTree.children.push(insertChildrenToParent(data.path,data.id, data.dropBoxFolder));
                }else if(data.dropBoxFile.length > 0){
                    var subDataTree = {
                        label: data.path,
                        id:data.id,
                        children: []
                    };
                    angular.forEach(data.dropBoxFile, function(data){
                        var element = {};
                        if(data){
                            element.label = data.path;
                            element.id = data.id;
                        }
                        subDataTree.children.push(element);
                    });
                    dataTree.children.push(subDataTree);
                }
            }
        });

        return dataTree;
    };

    var insertChildrenToParent = function(name, id,objects){

        var dataTree = {
            label: name,
            id:id,
            children: []
        };

        angular.forEach(objects,function(object){
            if(object.dropBoxFolder.length > 0){
                dataTree.children.push(insertChildrenToParent(object.path,object.id,object.dropBoxFolder));
            }else{
                angular.forEach(object.dropBoxFile, function(data){
                    var element = {};
                    if(data){
                        element.label = data.path;
                        element.id = data.id;
                    }
                    dataTree.children.push(element);
                });
            }
        });

        return dataTree;

    };

    var accounts = null;
    commonServices.saveAccounts = function (ac) {
      accounts = ac;
    };
    commonServices.accounts = function(){
        return accounts;
    };
    commonServices.willUpElementEvent = null;

    var assets = [];
    commonServices.setAssets = function(data){
        assets = data;
    };
    commonServices.assets = function(){
        return assets;
    };
    commonServices.clearAssets = function(){
        assets = [];
    };

    var articleAssets = [];
    commonServices.setArticleAssets = function(data){
        articleAssets = data;
    };
    commonServices.getArticleAssets = function(){
        return articleAssets;
    };
    commonServices.clearArticleAssets = function(){
        articleAssets = [];
    };



    commonServices.addSocialIconForObject = function (field,sourceData) {

        angular.forEach(sourceData,function(value,key){
            switch (value[field].toLowerCase()){
                case 'facebook':
                    value.iconClass = 'mdi-facebook';
                    break;
                case 'youtube':
                    value.iconClass = 'mdi-youtube-play';
                    break;
                case 'google':
                    value.iconClass = 'mdi-google';
                    break;
                case 'twitter':
                    value.iconClass = 'mdi-twitter';
                    break;
                case 'dropbox':
                    value.iconClass = 'mdi-dropbox';
                    break;
                case 'box':
                    value.iconClass = 'mdi-box';
                    break;
                case 'pinterest':
                    value.iconClass = 'mdi-pinterest';
                    break;
                case 'linkedin':
                    value.iconClass = 'mdi-linkedin-box';
                    break;
                case 'dalockr':
                    value.iconClass = 'dl-dalockr';
                    break;
                case 'instagram':
                    value.iconClass = 'mdi-instagram';
                    break;
                default :
                    break;
            }
        });
        return sourceData;
    };

    commonServices.getIconClassByType = function (type) {

        var value = {iconClass:''};

        switch (type.toLowerCase()){
            case 'facebook':
                value.iconClass = 'mdi-facebook';
                break;
            case 'youtube':
                value.iconClass = 'mdi-youtube-play';
                break;
            case 'google':
                value.iconClass = 'mdi-google';
                break;
            case 'twitter':
                value.iconClass = 'mdi-twitter';
                break;
            case 'dropbox':
                value.iconClass = 'mdi-dropbox';
                break;
            case 'box':
                value.iconClass = 'mdi-box';
                break;
            case 'pinterest':
                value.iconClass = 'mdi-pinterest';
                break;
            case 'linkedin':
                value.iconClass = 'mdi-linkedin';
                break;
            case 'dalockr':
                value.iconClass = 'dl-dalockr';
                break;
            case 'evernote':
                value.iconClass = 'mdi-evernote';
                break;
            case 'instagram':
                value.iconClass = 'mdi-instagram';
                break;
            default :
                break;
        }
        return value.iconClass;
    };


    commonServices.formatActivityText = function (type) {

        var lowerStr = type.toLowerCase();
        var behaviour,
            newReg = /^new./,
            deleteReg = /^delete./,
            publishReg= /^publish./,
            unpublishReg = /^unpublish./;

        if(newReg.test(lowerStr)){
            behaviour = 'created';
        } else if(deleteReg.test(lowerStr)){
            behaviour = 'deleted';
        } else if(publishReg.test(lowerStr)){
            behaviour = 'published';
        } else if(unpublishReg.test(lowerStr)){
            behaviour = 'unpublished';
        }

        return behaviour;
    };

    commonServices.getDefaultTrackingId = function (links) {

        for(var i=0; i<links.length; i++){
            var value = links[i];
            if (value.default) {
                return value.trackingId;
            }
        }
        return null;
    };

    commonServices.isHaveAccount = true;
    commonServices.setAssetFollowers = function (data) {
        assetFollowers = data;
    };
    commonServices.getAssetFollowers = function () {
        return assetFollowers ? assetFollowers : null;
    };

    commonServices.setAccountLockrs = function (lockrs) {
        accountLockrs = lockrs;
    };
    commonServices.accountLockrs = function () {
        return accountLockrs
    };


    commonServices.requestsDataWithSameEntityId = function (arr, entityId) {
        var newArr = [];
        angular.forEach(arr, function (value) {
            if(entityId === value.entity.lockrId && value.status === 'PENDING'){
                var fullDate = new Date(value.dateCreated);
                value.momentString = moment(fullDate).fromNow();
                newArr.push(value);
            }
        });
        return newArr;
    };

    commonServices.getCreativeCommonsImageUrl = function (license) {
        if(license === 'Copyright' || license === 'PublicDomain'){
            return 'images/cc/cc_by.png';
        } else {
            return 'images/cc/' + license.toLowerCase() + '.png';
        }
    };

    commonServices.deleteItemWithArray = function (item,array) {
        var arrCopy = angular.copy(array);
        var deleteIndex = 0;
        angular.forEach(arrCopy, function (value, key) {
            if(value === item){
                deleteIndex = key;
            }
        });
        arrCopy.splice(deleteIndex,1);
        return arrCopy;
    };


    commonServices.shareMimeFormat = function (ruleData) {

        var shareMime = {
            shareOn:[],
            noShare:[]
        };

        var allMimeTypeClass = ['mdi-image-filter','mdi-filmstrip','mdi-file-pdf','mdi-file-music','mdi-file-powerpoint-box','mdi-file-word-box','mdi-file-excel-box'];

        angular.forEach(ruleData.mimeType, function (mimeType) {

            if(mimeType === '*/*'){
                shareMime.shareOn = allMimeTypeClass;
            } else {
                if(mimeType.isFileType('image')){
                    shareMime.shareOn.push('mdi-image-filter');
                    //shareMime.noShare = commonServices.deleteItemWithArray('mdi-image-filter',allMimeTypeClass);
                }
                if(mimeType.isFileType('pdf')){
                    shareMime.shareOn.push('mdi-file-pdf');
                    //shareMime.noShare = commonServices.deleteItemWithArray('mdi-file-pdf',allMimeTypeClass);
                }
                if(mimeType.isFileType('video')){
                    shareMime.shareOn.push('mdi-filmstrip');
                    //shareMime.noShare = commonServices.deleteItemWithArray('mdi-filmstrip',allMimeTypeClass);
                }
                if(mimeType.isFileType('ppt')){
                    shareMime.shareOn.push('mdi-file-powerpoint-box');
                    //shareMime.noShare = commonServices.deleteItemWithArray('mdi-file-powerpoint-box',allMimeTypeClass);
                }
                if(mimeType.isFileType('doc')){
                    shareMime.shareOn.push('mdi-file-word-box');
                    //shareMime.noShare = commonServices.deleteItemWithArray('mdi-file-word-box',allMimeTypeClass);
                }
                if(mimeType.isFileType('xls')){
                    shareMime.shareOn.push('mdi-file-excel-box');
                    //shareMime.noShare = commonServices.deleteItemWithArray('mdi-file-excel-box',allMimeTypeClass);
                }
                if(mimeType.isFileType('audio')){
                    shareMime.shareOn.push('mdi-file-music');
                    //shareMime.noShare = commonServices.deleteItemWithArray('mdi-file-music',allMimeTypeClass);
                }
            }
        });

        return shareMime;
    };


    commonServices.filterLicense = function (licenseData, type) {
        var len = licenseData.length;
        for(var i=0; i<len; i++){
            if(licenseData[i].type === type){
                return licenseData[i];
            }
        }
    };
    commonServices.getCurrentSharingRule = function(){
        return currentLockrSharingRule;

    };
    commonServices.saveCurrentSharingRule = function(currentSharingRule){
        currentLockrSharingRule = currentSharingRule;
    };

    commonServices.requestAssetResource = function (onchange) {
        if(!fileInput){
            if($dalMedia('xs')){
                fileInput = angular.element('<input type="file" accept="image/*,video/*,audio/*,application/pdf,application/vnd.ms-excel,application/msword,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation" style="display: none;"/>');
            } else {
                fileInput = angular.element('<input type="file" accept="image/*,video/*,audio/*,application/pdf,application/vnd.ms-excel,application/msword,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation" style="display: none;"/>');
            }
            angular.element('body').append(fileInput);
        }
        var fi = fileInput[0];
        fi.onchange = onchange;
        fi.click();
    };

    commonServices.formatExtraInfo = function (info) {
        var result = [];
        angular.forEach(info, function (v, k) {
            switch (k){
                case 'imageCount':
                    result.push({
                        icon:'dal-icon-picture_black',
                        text:'Images',
                        num:v
                    });
                    break;
                case 'videoCount':
                    result.push({
                        icon:'dal-icon-video_black',
                        text:'Videos',
                        num:v
                    });
                    break;
                case 'audioCount':
                    result.push({
                        icon:'dal-icon-music_black',
                        text:'Audios',
                        num:v
                    });
                    break;
                case 'pdfCount':
                    result.push({
                        icon:'dal-icon-pdf_black',
                        text:'PDFs',
                        num:v
                    });
                    break;
                case 'othersCount':
                    result.push({
                        text:'Others',
                        num:v
                    });
                    break;
            }
        });
        return result;
    };

    commonServices.getAssetFileTypeIconWithType = function (type) {
        var icons = {
            'image':'dal-icon-picture_black',
            'pdf':'dal-icon-pdf_black',
            'audio':'dal-icon-music_black',
            'video':'dal-icon-video_black',
            'ppt':'dal-icon-pp_black',
            'xls':'dal-icon-excel_black',
            'doc':'dal-icon-word_black',
            'article':'mdi-file-document-box'
        };
        return icons[type.toLowerCase()];

    };
    commonServices.getDate = function(str){

        var y = parseInt(str.substring(0,4));
        var m = parseInt(str.substring(4,6));
        var d = parseInt(str.substring(6,8));

        return d + '.' + m + '.' + y;
    };

    commonServices.debounce = debounce;

    function debounce(func, wait, options) {
        var lastArgs,
            lastThis,
            maxWait,
            result, //func的返回值
            timerId, //计时器
            lastCallTime,
            lastInvokeTime = 0,
            leading = false,  //在计时一开始就执行
            maxing = false, //是否有最大时间限制
            trailing = true; //在计时结束后执行

        if (typeof func != 'function') {
            throw new TypeError("Must a function");
        }
        wait = Number(wait) || 0;
        if (isObject(options)) {
            leading = !!options.leading;
            maxing = 'maxWait' in options;
            maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : maxWait;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        /**
         * 执行函数
         * @param time
         * @returns {*}
         */
        function invokeFunc(time) {
            var args = lastArgs,
                thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) { //leading 头部
            // Reset any `maxWait` timer.
            lastInvokeTime = time;
            // Start the timer for the trailing edge.
            timerId = setTimeout(timerExpired, wait);
            // Invoke the leading edge.
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime,
                result = wait - timeSinceLastCall;

            return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result;
        }

        /**
         * 是否应该调用函数
         * @param time
         * @returns {boolean}
         */
        function shouldInvoke(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime;
            // Either this is the first call, activity has stopped and we're at the
            // trailing edge, the system time has gone backwards and we're treating
            // it as the trailing edge, or we've hit the `maxWait` limit.
            return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
            var time = now();
            if (shouldInvoke(time)) {
                return trailingEdge(time); //trailing:落后
            }
            // Restart the timer.
            timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timerId = undefined;

            // Only invoke if we have `lastArgs` which means `func` has been
            // debounced at least once.
            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timerId !== undefined) {
                clearTimeout(timerId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(now());
        }

        function debounced() {
            var time = now(),
                isInvoking = shouldInvoke(time);

            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time; //最后一次调用时间是 当前时间

            if (isInvoking) {
                if (timerId === undefined) {
                    return leadingEdge(lastCallTime);
                }
                if (maxing) {
                    // Handle invocations in a tight loop.
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined) {
                timerId = setTimeout(timerExpired, wait);
            }
            return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    }

    function now() {
        return Date.now();
    }

    function isObject(value) {
        var type = typeof value;
        return !!value && (type == 'object' || type == 'function');
    }


    commonServices.arrayBufferToBase64 = arrayBufferToBase64;
    function arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }



    commonServices.base64ToArrayBuffer = base64ToArrayBuffer;
    function base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }


    commonServices.getSocialChannelAvatar = function (val) {
        var avatarPic;
        if(val.socialChannelType === 'Facebook'){
                if(val.pageId){
                    avatarPic = commonServices.getProfilePicByTypeAndId('facebook',val.socialId || val.pageId);
                } else {
                    avatarPic = commonServices.getProfilePicByTypeAndId('facebook',val.socialId || val.facebookId);
                }
        } else if(val.socialChannelType === 'Twitter'){
            avatarPic = commonServices.getProfilePicByTypeAndId('twitter',val.socialId || val.screenName);
        }

        return avatarPic;
    };

    commonServices.getMobileCardWidth = function () {
        var screenWidth = commonServices.getCurrentBroswerWidth(),
            gap = 5;
        return Math.floor( (screenWidth - gap*6) / 2);
    };

    /**
     * Format Notification Data
     * Group notification if same entity with time interval less than 1 second
     * @param nos
     */
    commonServices.formatNotifications = function (nos) {
        var newNos = [];

        angular.forEach(angular.copy(nos), function (val) {

            var prevTime,
                curTime,
                preNotification,
                preEvent,
                curEvent;

            if (!newNos.length) {
                newNos.push(val);
            } else {

                preNotification = newNos[newNos.length - 1];
                preEvent = preNotification.notificationEvent;
                curEvent = val.notificationEvent;

                prevTime = new Date(preEvent.date).getTime();
                curTime = new Date(curEvent.date).getTime();

                //相隔小于1s, 并且是同一个id
                if(Math.abs(curTime - prevTime) <= 1000 &&
                    curEvent.entity_id === preEvent.entity_id &&
                    curEvent.entity_type.toLowerCase() === "asset" &&
                    preEvent.entity_type.toLowerCase() === "asset" &&
                    !curEvent.event_type.toLowerCase().match(/share$/ig)){

                    //替换稍晚的时间  合并
                    preNotification.id += '-' + val.id;
                    preEvent.date = curEvent.date;
                    preEvent.event_type += '-' + curEvent.event_type;
                    if(preEvent.event.message
                        && curEvent.event.message){
                        preEvent.event.message += ' ' + curEvent.event.message;
                    }
                } else {
                    newNos.push(val);
                }
            }


        });
        return newNos;
    };

    commonServices.uuid = function() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    }

    return commonServices;
}]);



/**
 * 扩展String: 检查MimeType
 * @param fileType   :  audio  video image text  doc ppt xls  //dalockr 支持的类型
 * @returns {boolean}
 */
String.prototype.isFileType = function (fileType) {

    var audio = /^audio/ig,
        video = /^video/ig,
        image = /^image/ig,
        dlText = /text\/x-dalockr-article/ig,
        doc = /msword$/,
        docx = /wordprocessingml\.document$/ig,
        ppt = /ms-powerpoint$/ig,
        pptx = /presentationml\.presentation$/ig,
        xls = /ms-excel$/ig,
        xlsx = /spreadsheetml\.sheet$/ig,
        pdf = /pdf$/ig;


    if(this.match(audio) && fileType === 'audio'){
        return true;
    } else if(this.match(video) && fileType === 'video'){
        return true;
    } else if(this.match(image) && fileType === 'image'){
        return true;
    }else if(this.match(dlText) && fileType === 'article'){
        return true;
    } else if( (this.match(doc) || this.match(docx) ) && fileType === 'doc'){
        return true;
    }else if((this.match(ppt) || this.match(pptx)) && fileType === 'ppt'){
        return true;
    } else if((this.match(xls) || this.match(xlsx)) && fileType === 'xls'){
        return true;
    } else if(this.match(pdf) && fileType === 'pdf'){
        return true;
    }

    return false;

};
