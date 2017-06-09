/**
 * Created by panma on 8/7/15.
 */
angular.module('dalockrAppV2App')
    .directive('assetMediaBox',['dalockrServices','$document','$animate','$compile','commonServices','$window','$location','$filter','ngAudio','$rootScope','$dalMedia','$sce','$timeout','$mdDialog','toastr',
        function(dalockrServices,$document,$animate,$compile,commonServices,$window,$location,$filter,ngAudio,$rootScope,$dalMedia,$sce,$timeout,$mdDialog,toastr){
        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/directives/asset/mobile/asset-media-box.html';
                }
                return 'views/directives/asset/asset-media-box.html';
            },
            replace:true,
            scope:{
                mediaType:'@',
                currentAssetDetails:'=',
                currentAssetId:'@'
            },
            link:function(scope,elem){
                var isOldVersion = false;
                var lockrsCache = commonServices.cacheInstance('lockrsCache');

                commonServices.setCurrentAudio(null);

                //scope.shoedec = false;
                scope.mobileDevice = $dalMedia('sm');
                var padding = 20,
                    lbPadding = 50;

                var imageMaxW = 0,
                    imageMaxH = 0;
                if(scope.currentAssetDetails.state.toLowerCase() === 'published'){
                    scope.type = 'publish';
                }else{
                    scope.type = 'unpublish';
                }
                scope.lightBox = false;
                scope.originW = 0;
                scope.originH = 0;
                scope.fullscreenBtnShow = false;
                scope.isFirst = true;
                scope.isLast = true;
                scope.isShowPdf = false;
                scope.imageSrc = null;
                scope.showTags = false;
                scope.clientWidth = commonServices.getCurrentBroswerWidth();

                scope.$on('ChangeAssetState', function (event, $ev) {
                    scope.changeAssetDetails();
                });

                scope.openEditTags = function(data){
                    $mdDialog.show({
                        controller: openEditTagsController,
                        templateUrl: 'views/templates/edit-tags-dialog.html',
                        parent: angular.element(document.body),
                        targetEvent: null,
                        fullscreen:true
                    });
                    function openEditTagsController($scope){
                        var tags = '';
                        $scope.assetsData = data;
                        var tagsLen = $scope.assetsData.tags.length;
                        if(tagsLen !== 0){
                            for (var i = 0; i <tagsLen ; i++) {
                                var obj = $scope.assetsData.tags[i];
                                if(i === tagsLen-1){
                                    tags += obj;
                                } else {
                                    tags += obj + ',';
                                }
                            }
                        }
                        $scope.tags = tags;
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.answer = function (answer) {
                            $mdDialog.hide(answer);
                        };
                        $scope.changeAsset = function(){
                            $scope.editAssetData = {
                                name:$scope.assetsData.name,
                                description:$scope.assetsData.description,
                                tags:$scope.tags
                            };
                            console.log($scope.editAssetData);
                            dalockrServices.updateAssetDetails($scope.assetsData.id,$scope.editAssetData,function(data){
                                $rootScope.$broadcast('updateLockrDetails', true);
                                toastr.success("Asset " + data.asset.name +" has successfully been updated.",'Success');
                            }, function (error) {
                                $scope.loadingInProgress = false;
                                toastr.error(error.message,'Error');
                            });
                            $scope.hide();
                        }
                    }
                };

                scope.changeAssetDetails = function(){
                    if(scope.type == 'publish'){
                        scope.type = 'unpublish';
                    }else{
                        scope.type = 'publish';
                    }
                    dalockrServices.publishOrUnpublishAsset(scope.type,scope.currentAssetId,function(data){
                        var assetstatedata = {
                            'id':scope.currentAssetId,
                            'type':scope.type
                        };
                        $rootScope.$broadcast('getPublishOrUnpublishAsset',assetstatedata);

                    },function(error){
                        toastr.error(error.message,'Error');
                        // scope.$apply();
                    });

                };



                if(scope.mediaType === 'image'){

                    //scope.imageSrc = dalockrServices.getAssetSrc('asset',scope.currentAssetId);
                    scope.$watch('currentAssetDetails',function(){

                        if(scope.currentAssetDetails !== null) {

                            $timeout(function () {

                                scope.imageBoxElem = scope.imageBoxElem || elem.find('.imageWrapper');

                                scope.currentAssetDetails.imageLoading = true;
                                if(scope.imageSrc === scope.currentAssetDetails.srcUrl) return;

                                if (typeof scope.currentAssetDetails.publicDimensions !== 'undefined') {

                                    var imageElem = $compile(angular.element('<img ng-src="{{imageSrc}}" />'))(scope);
                                    scope.imageBoxElem.append(imageElem);
                                    scope.imageElem = imageElem;


                                    setImageMaxWHValue(scope.imageElem);


                                    var imageOriginSize = scope.currentAssetDetails.publicDimensions.split('x');
                                    scope.originW = imageOriginSize[0];
                                    scope.originH = imageOriginSize[1];

                                    setImageShow(scope.originH, scope.originW, imageMaxH, imageMaxW, scope.imageElem);
                                    scope.imageSrc = dalockrServices.getAssetSrc('asset', scope.currentAssetDetails.id);
                                    scope.fullscreenBtnShow = true;

                                } else { //兼容v1,无publicDimensions属性

                                    scope.imageBoxElem.find('img').remove();
                                    scope.imageSrc = dalockrServices.getAssetSrc('asset', scope.currentAssetDetails.id);

                                    var imgObject = new Image();
                                    imgObject.src = dalockrServices.getAssetSrc('asset', scope.currentAssetDetails.id);

                                    var check = function () {
                                        if (imgObject.width > 0 || imgObject.height > 0) {

                                            scope.imageElem = $(imgObject);
                                            setImageMaxWHValue(scope.imageElem);

                                            scope.originW = imgObject.width;
                                            scope.originH = imgObject.height;

                                            setImageShow(scope.originH, scope.originW, imageMaxH, imageMaxW, scope.imageElem);
                                            scope.fullscreenBtnShow = true;

                                            scope.imageBoxElem.append(imgObject);

                                            scope.$apply();
                                            clearInterval(set);
                                        }
                                    };
                                    var set = setInterval(check, 40);
                                }

                                scope.imageList = [];
                                if (angular.isUndefined(lockrsCache.get('imageList'))) {

                                    dalockrServices.getLockrDetails(scope.currentAssetDetails.lockrId, function (data) {
                                        var imageList = [],
                                            imageReg = /^image/;
                                        var idx = 0;

                                        data.assets = $filter('orderBy')(data.assets, 'dateLastUpdated', true);

                                        for (var i = 0; i < data.assets.length; i++) {
                                            var obj = data.assets[i];
                                            if (obj.mimeType.match(imageReg)) {
                                                imageList.push({id: obj.id, index: idx});
                                                idx++;
                                            }
                                        }
                                        lockrsCache.put('imageList', imageList);
                                        scope.imageList = imageList;

                                        scope.isFirst = scope.imageList[0].id === scope.currentAssetId ? true : false;
                                        scope.isLast = scope.imageList[scope.imageList.length - 1].id === scope.currentAssetId ? true : false;

                                        scope.$apply();

                                    }, function (error) {

                                    });
                                }

                                changeSwitchStatus();


                            });

                        }
                    });

                    function changeSwitchStatus(){

                        if(lockrsCache.get('imageList')){
                            scope.imageList = lockrsCache.get('imageList');

                            scope.isFirst =  scope.imageList[0].id === scope.currentAssetId ? true:false;
                            scope.isLast = scope.imageList[scope.imageList.length - 1].id === scope.currentAssetId ? true:false;

                        }

                    }


                    //pre image
                    scope.pre = function(){
                        var imageList = lockrsCache.get('imageList'),
                            currentIndex = 0;
                        angular.forEach(imageList,function(value,key){
                            if(value.id === scope.currentAssetId){
                                currentIndex = value.index;
                                return;
                            }
                        });

                        if(scope.imageBoxElem.find('img')){
                            scope.imageBoxElem.find('img').remove();
                        }
                        scope.fullscreenBtnShow = false;
                        $location.path('asset/' + imageList[currentIndex - 1].id);
                        //$rootScope.$broadcast('switchImageAsset',imageList[currentIndex - 1].id);
                    };
                    scope.next = function(){
                        var imageList = lockrsCache.get('imageList'),
                            currentIndex = 0;
                        angular.forEach(imageList,function(value,key){
                            if(value.id === scope.currentAssetId){
                                currentIndex = value.index;
                                return;
                            }
                        });

                        if(scope.imageBoxElem.find('img')){
                            scope.imageBoxElem.find('img').remove();
                        }

                        scope.fullscreenBtnShow = false;
                        $location.path('asset/' + imageList[currentIndex + 1].id);

                        //$rootScope.$broadcast('switchImageAsset',imageList[currentIndex + 1].id);
                    };
                }

                if(scope.mediaType === 'video'){

                    //videojs(document.getElementById('asset_video_1'));
                    var thumbnail = dalockrServices.getThumbnailUrl('asset',scope.currentAssetId);
                    var src = dalockrServices.getAssetSrc('asset',scope.currentAssetId);
                    scope.videoConfig = {
                            sources: [
                                {src: $sce.trustAsResourceUrl(src), type: "video/mp4"},
                                {src:  $sce.trustAsResourceUrl(src), type: "video/webm"},
                                {src:  $sce.trustAsResourceUrl(src), type: "video/ogg"}
                            ],
                            //tracks: [
                            //    {
                            //        src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                            //        kind: "subtitles",
                            //        srclang: "en",
                            //        label: "English",
                            //        default: ""
                            //    }
                            //],
                            //theme: "bower_components/videogular-themes-default/videogular.css",
                            plugins: {
                                poster: thumbnail
                            }
                        };


                }

                if(scope.mediaType === 'audio'){

                    src = dalockrServices.getAssetSrc('asset',scope.currentAssetId);
                    scope.audioThumbnail = dalockrServices.getThumbnailUrl('asset',scope.currentAssetId);
                    scope.audio = ngAudio.load(src);
                    scope.audio.progress = 0;
                    scope.mobileAudioSrc = $sce.trustAsResourceUrl(src);

                    if(commonServices.getCurrentAudio() === null){
                        commonServices.setCurrentAudio(scope.audio);
                    }
                    //scope.moveProgress = function(ev){
                    //    scope.audio.progress = ((ev.offsetX / ev.currentTarget.clientWidth) * (scope.audio.remaining + scope.audio.currentTime)) / (scope.audio.remaining + scope.audio.currentTime);
                    //};
                }


                if(scope.mediaType === 'article'){
                    src = dalockrServices.getAssetSrc('asset',scope.currentAssetId);
                    dalockrServices.getArticleAssetContent(src).then(function(response){
                        scope.assetArticleContent = response.data;
                    },function(error){});
                }





                function setImageMaxWHValue(imageElem){

                    var mediaW = commonServices.getCurrentBroswerWidth(),
                        mediaH = commonServices.getCurrentBroswerHeight(),
                        maxW = 0,
                        maxH = 0;

                    /*maxW = elem.innerWidth() - 200;
                    maxH = commonServices.getCurrentBroswerHeight() * 0.6;*/

                    if(mediaW >= 1200){ //大屏幕

                        maxW = mediaW * 0.6;
                        maxH = mediaH * 0.6;

                    } else if(mediaW >= 980){ //默认

                        maxW = mediaW * 0.6;
                        maxH = mediaH * 0.6;

                    } else if(mediaW >= 768){ //平板

                        maxW = mediaW * 0.6;
                        maxH = mediaH * 0.6;
                    } else { //小屏幕

                        maxW = mediaW * 0.6;
                        maxH = mediaH * 0.6;
                    }
                    imageElem.css({maxWidth:maxW, maxHeight:maxH});

                    imageMaxW = maxW;
                    imageMaxH = maxH;
                }



                function setImageShow(oH,oW,showRegionHeight,showRegionWidth,imageElem){

                    var imageW = 0,
                        imageH = 0;


                    if(oW > showRegionWidth && oH <= showRegionHeight){

                        imageW = showRegionWidth;
                        imageH = (imageW * oH) / oW;

                    } else if(oW <= showRegionWidth && oH > showRegionHeight){

                        imageH = showRegionHeight;
                        imageW = (imageH * oW) / oH;

                    } else if(oW > showRegionWidth && oH > showRegionHeight){

                        imageH = showRegionHeight;
                        imageW = (imageH * oW) / oH;

                        if(imageW > showRegionWidth){
                            imageW = showRegionWidth;
                            imageH = (imageW * oH) / oW;
                        }
                    } else {
                        imageH = oH;
                        imageW = oW;
                    }

                    imageElem.css('width',imageW +'px')
                        .css('height',imageH + 'px');

                }


                window.onresize = function(){


                    if(typeof scope.imageElem !== 'undefined'){
                        if(scope.lightBox) {
                            var lb_showW = scope.lbElem.innerWidth() - lbPadding * 2,
                                lb_showH = scope.lbElem.innerHeight() - lbPadding * 2;
                            throttle(setImageShow, scope.originH, scope.originW, lb_showH, lb_showW, scope.lbElem.find('img'));
                        } else {
                            throttle(setImageMaxWHValue,scope.imageElem);
                            throttle(setImageShow,scope.originH,scope.originW,imageMaxH,imageMaxW,scope.imageElem);
                        }
                            //var showRegionWidth =  scope.imageBoxElem.innerWidth() - padding * 2;


                    }
                };
                function throttle(method,a,b,c,d,e){
                    if(typeof method.tId !== 'undefined'){
                        clearTimeout(method.tId);
                    }
                    method.tId = setTimeout(function(){
                        method.call(null,a,b,c,d,e);
                    },50);
                }






                /*************全屏显示**************/
                scope.fullscreen = function(imageSrc){
                    var pswpElement = document.querySelectorAll('.pswp')[0];
                    var wh = (scope.currentAssetDetails.publicDimensions && scope.currentAssetDetails.publicDimensions.split('x')) || [200,200];
                    var items = [
                        {
                            src:imageSrc,
                            w: wh[0],
                            h: wh[1]
                        }
                    ];
                    var options = {
                        history:false,
                        index: 0, // start at first slide
                        tapToToggleControls: false,
                        pinchToClose:true
                    };
                    console.log(pswpElement);
                    var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
                    gallery.init();
                };





                scope.exitfullscreen = function(){
                    scope.lightBox = false;
                    scope.lbElem.addClass('v2-hidden');

                    setImageMaxWHValue(scope.imageElem);
                    setImageShow(scope.originH,scope.originW,imageMaxH,imageMaxW,scope.imageElem);
                };


                var imageTop = 0;
                var isZoom = false;

                scope.showLargePicture = function($event){

                    isZoom = true;
                    var imageElem = scope.lbElem.find('img');

                    var zoomElem = angular.element('<div class="zoom-modal">' +
                    '<div class="zoom-photo-container absolute-center" style="position: absolute;">' +
                    '<img src="'  + scope.imageSrc + '" style="width:100%;height:100%;outline: none;cursor: -webkit-zoom-out;cursor: -moz-zoom-out;" ng-click="closeShowPicture($event)">' +
                    '<span class="facade-of-protection-zoom"></span>'+
                    '</div>' +
                    '</div>');


                    zoomElem.find('.zoom-photo-container').css('width',imageElem.width() + 'px')
                        .css('height',imageElem.height() + 'px');

                    elem.append($compile(zoomElem)(scope));

                    imageTop = imageElem.offset().top - getScrollTop();

                    var phoneCon = zoomElem.find('.zoom-photo-container');


                    phoneCon.css('width',$event.target.clientWidth).css('height',$event.target.clientHeight);


                    var midH  = $event.target.naturalHeight - zoomElem.outerHeight();
                    var midW = $event.target.naturalWidth - zoomElem.outerWidth();
                    var transY  = -midH * 0.5;
                    var transX = -midW * 0.5;

                    zoomElem.addClass('zoom-mask-fadein');
                    $animate.animate(phoneCon,{},
                        {width:$event.target.naturalWidth,height:$event.target.naturalHeight},'temp-class')
                        .then(function(){

                            phoneCon.css('left',0).css('top',0).css('transform','translate(' + transX + 'px,' + transY + 'px)');
                            scope.transY = transY;
                            scope.transX = transX;
                            phoneCon.removeClass('absolute-center');

                        });

                    zoomElem.bind('wheel',function(e){
                        e = e || $window.event;
                        if(isZoom){
                            transX += e.originalEvent.deltaX * 0.35;
                            transY += e.originalEvent.deltaY * 0.35;

                            if(midW*0.5 + 100 > 0){

                                if(transX <= -midW - 100){
                                    transX = -midW - 100;
                                }else if(transX >= 100){
                                    transX = 100;
                                }

                            } else {
                                transX = -midW * 0.5;
                            }
                            if(midH*0.5 + 100 > 0){
                                if(transY <= -midH - 100){
                                    transY = -midH - 100;
                                }else if(transY >= 100){
                                    transY = 100;
                                }
                            } else {
                                transY =  -midH * 0.5;
                            }

                            scope.transY = transY;
                            scope.transX = transX;


                            var phoneCon = zoomElem.find('.zoom-photo-container');
                            phoneCon.css('transform','translate(' + transX  + 'px,' + transY + 'px)');

                        }
                        if(e.preventDefault) {
                            e.preventDefault();
                        }else{
                            e.returnValue = false;
                        }
                        return false;
                    });


                    var oldPosition = null;
                    zoomElem.bind('mousemove', function(e){

                        if(isZoom){

                            if(oldPosition === null){
                                oldPosition = {
                                    'clientX':e.originalEvent.clientX,
                                    'clientY':e.originalEvent.clientY
                                };
                            } else {
                                transX += (oldPosition.clientX - e.originalEvent.clientX) * 1.5 ;
                                transY += (oldPosition.clientY - e.originalEvent.clientY) * 1.5 ;

                                oldPosition = {
                                    'clientX':e.originalEvent.clientX,
                                    'clientY':e.originalEvent.clientY
                                };
                            }


                            if(midW*0.5 + 100 > 0){
                                if(transX <= -midW - 100){
                                    transX = -midW - 100;
                                }else if(transX >= 100){
                                    transX = 100;
                                }
                            } else {
                                transX = -midW * 0.5;
                            }
                            if(midH*0.5 + 100 > 0){
                                if(transY <= -midH - 100){
                                    transY = -midH - 100;
                                }else if(transY >= 100){
                                    transY = 100;
                                }
                            } else {
                                transY =  -midH * 0.5;
                            }

                            scope.transY = transY;
                            scope.transX = transX;

                            var phoneCon = zoomElem.find('.zoom-photo-container');
                            phoneCon.css('transform','translate(' + transX  + 'px,' + transY + 'px)');
                        }

                    });



                };
                scope.$on('moredetail',function(ev,val){
                    if(val){
                        scope.showDetails = true;
                    }else{
                        scope.showTags = true;
                    }

                });
                scope.closeShowPicture = function($event){
                    isZoom = false;

                    var imageElem = scope.lbElem.find('img'),
                        zoomElem = elem.find('.zoom-modal'),

                        imageW = imageElem.width(),
                        imageH = imageElem.height();

                    //if(isOldVersion){
                    //    imageH = 0;
                    //    imageW = 0;
                    //}

                    $animate.animate(zoomElem.find('.zoom-photo-container'),{},
                    {width:imageW,height:imageH,left:imageElem.offset().left - scope.transX, top:imageTop - scope.transY},'temp-class')
                    .then(function(){

                        $animate.removeClass(zoomElem,'zoom-mask-fadein')
                            .then(function(){

                                zoomElem.remove();
                                scope.transY = null;
                                scope.transX = null;

                            });

                    });

                };

                function getScrollTop(){
                    var scrollTop=0;
                    if(document.documentElement&&document.documentElement.scrollTop){
                        scrollTop=document.documentElement.scrollTop;
                    }else if(document.body){
                        scrollTop=document.body.scrollTop;
                    }
                    return scrollTop;
                }






            }
        }
    }])
.directive('descasset',["$compile","$timeout","$rootScope",function($compile,$timeout,$rootScope){
    return {
        restrict:'A',
        link:function(scope,element){
            var obj = element;
            var dec = '';

            scope.MoreDetails = function(){
                element.css({
                    height: 'auto'
                });
                $rootScope.$broadcast('moredetail',false);
                element.html(dec);
                // element.remove(moredetails);
            };
            $timeout(function () {
                if (obj[0]) {
                    if(obj[0].clientHeight > 34){
                        scope.hiddendes = 'true';
                        dec = obj[0].innerText;
                        decshort = obj[0].innerText.substring(0,90) + "...";
                        element.css({
                            height: '34px'
                        });
                        element.html(decshort);
                        var moredetails = $compile("<span style='color:#30cdff;' ng-click='MoreDetails()'>see more ...</span>")(scope)
                        element.append(moredetails);


                        // scope.$apply();
                    }
                    else{
                        dec = obj[0].innerText;
                        var moredetails = $compile("<div layout='row'><span flex></span><span style='color:#30cdff;' ng-click='MoreDetails()'>see more</span></div>")(scope)
                        element.append(moredetails);
                    }
                }
            },0);

        }
    }
}])
.directive('autoResize',[function () {
    return {
        restrict:'A',
        link: function (scope, element,attrs) {

            var imageWrapperSize,
                parentElem = element.parent();
            scope.$watch(attrs['size'], function (newVal) {
               if(newVal){
                   scope.imgSize = newVal;
                   var showSize = caculateSize(newVal);
                   element.css({
                       width:showSize.showWidth + 'px',
                       height:showSize.showHeight + 'px'
                   });
               }
            });

            element[0].onload = function (ev) {
                scope.$apply(function () {
                    scope.currentAssetDetails.imageLoading = false;
                });
                if(scope.imgSize) return;
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
            function caculateSize(s){
                if (!angular.isObject(s)){
                    var size = angular.copy(s),
                        realSize = {
                            width:size.split('x')[0],
                            height:size.split('x')[1]
                        };
                } else {
                    realSize = s;
                }

                imageWrapperSize = imageWrapperSize || {
                        width:parentElem.width(),
                        height:parentElem.height()
                    };
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

            //function ajustImageDisplay(size){
            //    if(size){
            //
            //        var pElem = element.parent();
            //        var pW = pElem.width(),
            //            pH = pElem.height(),
            //            pScale = pW / pH;
            //        //宽高比例
            //        var imgW = size.split('x')[0],
            //            imgH = size.split('x')[1];
            //        var imgScale = imgW / imgH;
            //
            //        if(imgH <= pH && imgW <= pW){
            //            return;
            //        } else {
            //
            //            if((imgH > pH && imgW <= pH) || (imgH > pH && imgW > pW && imgH >= imgW)){//高度优先
            //                imgH = pH;
            //                imgW = imgH * imgScale;
            //            } else if((imgH <= pH && imgW > pW) || (imgH > pH && imgW > pW && imgH < imgW)){ //宽度优先
            //                imgW = pW;
            //                imgH = imgW / imgScale;
            //            }
            //        }
            //        element.css({width:imgW,height:imgH});
            //
            //    } else {
            //        element.css({width:'100%',height:'auto'});
            //    }
            //}
            //
            //scope.$on('$destroy', function () {
            //    watcher();
            //    console.log('auto resize destroy');
            //});
        }
    }
}]);