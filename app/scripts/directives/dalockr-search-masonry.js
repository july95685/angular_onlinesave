/**
 * Created by KAMITA on 7/15/15.
 */
angular.module('dalockrAppV2App')
  .directive('dalockrSearchMasonry', [
        'dalockrServices',
        '$filter',
        '$location',
        'commonServices',
        '$mdDialog',
        'toastr',
        '$rootScope',
        '$q',
        '$compile',
      'userServices',
      '$dalMedia',
        'dalEntityMoreAction','addEditLockrManager','thumbnailServices',
        function(dalockrServices,$filter,$location,commonServices,$mdDialog,toastr,$rootScope,$q,$compile,userServices,$dalMedia,dalEntityMoreAction,addEditLockrManager,thumbnailServices) {

    return {
      restrict: 'E',
        templateUrl: function () {
            if($rootScope.mobileDevice){
                return 'views/mobile/mobile-search-region.html';
            }
            return 'views/directives/dalockr-search-masonry.html';
        },
      scope:{
        searchKeyword:'='
      },
      replace:true,
      link: function(scope,element){

       //var cardWidth = 240;
           //mainMaWrapper = element.find('.main-masonry-wrapper'),
           //mainFilter =  element.find('.main-filter'),
           //mainListWrapper = element.find('#main-list-wrapper');
          //resizeMasonry();



        //window.onresize = function(){
        //    throttle(resizeMasonry)
        //};
        //
        //  function resizeMasonry(){
        //
        //      var innerWidth = mainListWrapper.innerWidth();
        //
        //      mainFilter.css('width',cardWidth * Math.floor( innerWidth / cardWidth) - 10);
        //      mainMaWrapper.css('width',cardWidth * Math.floor(innerWidth / cardWidth));
        //  }
        //  function throttle(method, context){
        //      clearTimeout(method.tId);
        //      method.tId = setTimeout(function(){
        //          method.call(context);
        //      },50);
        //  }



          var screenWidth = commonServices.getCurrentBroswerWidth(),
              showWidth = $dalMedia('xs') ? (screenWidth-screenWidth*0.01*6)/2  : 220,
              tnSize = {
                  realWidth:0,
                  realHeight:0,
                  showWidth:showWidth,
                  showHeight: (showWidth * 240) / 319 //default height
              };

          scope.marginStyle = {
              'padding':screenWidth*0.01 + 'px'
          };

          scope.noSearchData = false;

          userServices.getUserProfileInfo(function () {
              if(scope.searchKeyword){
                  searchContent();
              }
          },false);

          scope.searchContent = searchContent;

          lockrHandle();

          function searchContent() {

              scope.loading = true;

              dalockrServices.getSearch(scope.searchKeyword,function(data){
                  scope.loading = false;
                  var result = data.result,
                      searchDataTemp = [],
                      daLen = result.DA.length,
                      loLen = result.Lockr.length;

                  if(daLen === 0 && loLen === 0){
                      scope.noSearchData = true;
                  } else {

                      if(daLen !== 0){
                          angular.forEach(result.DA, function(value,key){
                              value.tnSize = tnSize;
                              value.thumbnailUrl = dalockrServices.getThumbnailUrl('asset', value._id);
                              value.noTnDimensions = true;
                              if(typeof value.assetViewCount !== 'undefined') {

                                  value.socialChannelView = commonServices.getSocialChannelViewNum(value.assetViewCount);
                              }

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

                              value.mimeType.isFileType('article') && (value.fileType = 'article');
                              value.mimeType.isFileType('doc') && (value.fileType = 'doc');
                              value.mimeType.isFileType('xls') && (value.fileType = 'xls');
                              value.mimeType.isFileType('ppt') && (value.fileType = 'ppt');
                              value.mimeType.isFileType('video') && (value.fileType = 'video');
                              value.mimeType.isFileType('audio') && (value.fileType = 'audio');
                              value.mimeType.isFileType('pdf') && (value.fileType = 'pdf');
                              value.mimeType.isFileType('image') && (value.fileType = 'image');
                              value.fileTypeIcon = commonServices.getAssetFileTypeIconWithType(value.fileType);

                              searchDataTemp.push(value);
                          });

                      }

                      if(loLen !== 0){
                          angular.forEach(result.Lockr, function(value,key){

                              value.tnSize = tnSize;
                              value.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr', value._id);
                              if(typeof value.assetViewCount !== 'undefined'){
                                  value.socialChannelView = commonServices.getSocialChannelViewNum(value.assetViewCount);
                              }
                              value.fileType = 'Lockr';
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
                              searchDataTemp.push(value);
                          });
                      }
                  }
                  scope.searchData = searchDataTemp;
              },function(error){});
          }



          scope.seeAssetOrLockr = function(value){
                  if(value.type === 'Lockr'){
                      $location.path('/sublockr/' + value.id);
                  } else {
                      commonServices.setSelectedAssetId(value.id);
                      $location.path('/asset/' + value.id); //进入asset-details页
                  }
          };

          function cancelBubble(ev){
              if(ev.stopPropagation()) {
                  ev.stopPropagation();
              }else{
                  ev.cancelBubble = true;
              }
          }

          scope.openEntityMoreAction = function (ev,item) {
              ev.stopPropagation();
              dalEntityMoreAction.open(item).then(function (key) {
                  var isLockr = item.fileType == 'subLockr' || 'Lockr';
                  switch (key){
                      case 'edit':
                          if(isLockr){
                              scope.openEditLockrDialog(ev,item)
                          } else {
                              scope.openEditAssetDialog(ev,item)
                          }
                          break;
                      case 'copy':
                          scope.batchHandle(ev,'copy',item)
                          break;
                      case 'follow':
                          scope.followLockr(ev,{id:item.id,name:item.name});
                          break;
                      case 'publish':
                          scope.publishAsset(ev,item);
                          break;
                      case 'move':
                          scope.batchHandle(ev,'move',item);
                          break;
                      case 'lock':
                          scope.lockLockr(ev,item);
                          break;
                      case 'download':
                          scope.openDownloadLockrDialog(ev,{id:item.id,name:item.name,createDate:item.dateCreated});
                          break;
                      case 'delete':
                          if(isLockr){
                              //scope.openDeleteLockrDialog(ev,item);
                              scope.deleteLockrConfirm(item);
                          } else {
                              scope.openDeleteAssetDialog(ev,{id:item.id,name:item.name});
                          }
                          break;
                      case 'thumbnail':
                          if(isLockr){
                              scope.toEditThumbnail = true;
                              scope.toEditLockrInfo = item;
                              var onListener = scope.$on('closeselectthumb',function(){
                                  scope.toEditThumbnail = false;
                                  scope.toEditLockrInfo = null;
                                  onListener();
                                  onListener = null;
                              });

                          } else {
                              scope.setThumbnail(ev,item.id);
                          }
                          break;
                      case 'share':
                          if(isLockr){
                              scope.openShareLockrDialog(ev);
                          } else {
                              scope.openShareAssetDialog(ev);
                          }
                          break;
                      case 'preview':
                          console.log(item);
                          if(!item.links)
                              toastr.error('Sorry, this entity hasn\'t been published yet.', 'Error');
                          commonServices.openPreview(isLockr ? 'lockr':'asset',isLockr ? item.links[0].trackingId : item.defaultLink.trackingId,isLockr ? item.cluster.id : item.clusterId);
                          break;
                  }
              });

          };
          scope.openEditLockrDialog = function(ev,value){
              addEditLockrManager.edit(value);
              cancelBubble(ev);
          };
          scope.batchHandle = function (ev,handleName,asset){
              ev.getassetName = asset.name;
              ev.getassetId = asset.id;
              $rootScope.$broadcast('batchHandle',{name:handleName,event:ev});
          };
          scope.openEditAssetDialog = function(ev,value){

              scope.editAssetInfo = value;

              if(value.fileType === 'article'){
                  $mdDialog.show({
                      controller: editArticleDialogController,
                      templateUrl: 'views/templates/add-article-dialog.html',
                      parent: angular.element(document.body),
                      targetEvent: ev,
                      clickOutsideToClose:false,
                      fullscreen:$dalMedia('xs')
                  });

              }else {
                  $mdDialog.show({
                      controller: editAssetDialogController,
                      templateUrl: 'views/templates/edit-asset-dialog.html',
                      parent: angular.element(document.body),
                      targetEvent: ev,
                      clickOutsideToClose: false,
                      fullscreen:$dalMedia('xs')

                  });
              }

              cancelBubble(ev);

          };
          scope.$on('batchHandle',function(event,handleName){

              switch(handleName.name)
              {
                  case 'move':
                      moveAssets(handleName.event);
                      break;
                  case 'copy':
                      copyAssets(handleName.event);
                      break;
                  case 'mark':
                      selectAllElem();
                      break;
                  case 'unMark':
                      unSelectAllElem();
                      $rootScope.$broadcast('haveSelectedOneItem',false);
                      break;
                  case 'clickAddBtn':
                      unSelectAllElem();
                      break;
                  case 'delete':
                      deleteAssets(handleName.event);
                      break;
                  case 'addToArticle':
                      addToArticle(handleName.event);
                      break;
                  default:
                      break;
              }

          });

          function lockrHandle() {

              scope.followLockr = function (ev, value) {
                  dalockrServices.followLockr(value.id, function (data) {
                      getLockrFollowers();
                      toastr.success('Follow ' + value.name + ' has successfully been created.', 'Success');
                  }, function (error) {
                      toastr.error(JSON.parse(error.responseText).message, 'Error');
                  });

                  cancelBubble(ev);
              };

              scope.unFollowLockr = function (ev) {
                  dalockrServices.deleteUserFollows(followId, function (data) {
                      getLockrFollowers();
                      toastr.success(data.message, 'Success');
                  }, function (error) {
                      toastr.error(JSON.parse(error.responseText).message, 'Error');
                  });
              };


              scope.deleteLockrConfirm = function (value) {
                  var confirm = $mdDialog.confirm()
                      .title('Are you sure you want to delete this post ' + value.name + '?')
                      .textContent('Please note that all assets and comments on social channels will be deleted ')
                      .ariaLabel('Lucky day')
                      .ok('OK')
                      .cancel('CANCEL');

                  $mdDialog.show(confirm).then(function () {
                      console.log(value);
                      scope.loadingInProgress = true;
                      dalockrServices.deleteLockr(value.id, true, true, function (data) {
                          console.log(data);
                          toastr.success(value.name + ' has been deleted successfully');
                          $rootScope.$broadcast('updateLockrDetails', true);
                          scope.$apply();

                      }, function (error) {
                          if (error && error.responseText)
                              toastr.error(JSON.parse(error.responseText).message);
                          scope.loadingInProgress = false;
                          scope.$apply();
                      });
                  }, function () {
                      console.log(2);
                  });

              };
          }
          scope.lockLockr = function(ev,item){

              var data = {
                  locked:true
              };
              if(item.locked){
                  data.locked = false;
              }
              dalockrServices.updateLockr(item.id,data,function(data){
                  item.locked = data.lockr.locked;
                  toastr.success('Lockr ' + data.lockr.name + ' has successfully been updated.','Success');
              },function(){
                  toastr.error('Lock failed','Error');
              });

              ev.preventDefault();
              cancelBubble(ev);
          };
          scope.publishAsset = function(ev,item){

              cancelBubble(ev);

              if(angular.isUndefined(item.state)){
                  toastr.warning('The asset can\'t be published!','Warning');
                  return;
              }


              var type = 'publish';
              if(item.state.toLowerCase() === 'published'){
                  type = 'unpublish';
              }

              dalockrServices.publishOrUnpublishAsset(type,item.id,function(data){
                  toastr.success(data.message,'Success');
                  if(type == 'unpublish'){
                      dalockrServices.getLockrOrAssetComments('asset',item.id,function(data){
                          angular.forEach(data,function(v){
                              var commentData = v.comments;
                              angular.forEach(commentData,function(val){
                                  dalockrServices.deleteCommentWhenUnplished(val.id);
                              })
                          })
                      },function(){
                          toastr.error("Delete comments Error",'Error');
                      });
                  }

                  //修改模型
                  angular.forEach(scope.assetsData,function(value,key){
                      if(value.id === item.id){

                          if(type === 'publish'){
                              value.state = 'Published';
                          } else {
                              value.state = 'Draft';
                              value.numberOfComments = 0;
                          }

                      }
                  });

                  scope.$apply();
              },function(error){
                  toastr.error(error.message,'Error');
                  scope.$apply();
              });

          };
          scope.openDownloadLockrDialog = function(ev,value){

              scope.isDownloadingLockr = value;

              $mdDialog.show({
                  controller: downloadLockrDialogController,
                  templateUrl: 'views/templates/download-lockr-dialog.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:false,
                  fullscreen:$dalMedia('xs')
              });

              cancelBubble(ev);

          };


          function downloadLockrDialogController($scope){

              $scope.hide = function() {
                  $mdDialog.hide();
              };
              $scope.cancel = function() {
                  $mdDialog.cancel();
              };
              $scope.answer = function(answer) {
                  $mdDialog.hide(answer);
              };
              $scope.currentLockrData = angular.copy(scope.isDownloadingLockr);
              $scope.downloadLockrUrl = dalockrServices.downloadLockrUrl($scope.currentLockrData.id);

              $scope.downloadLockr = function(){
                  $mdDialog.hide();
                  document.getElementById('lockr-download-a').click();
              }

          }



          scope.backMainPage = function(){
              $location.path('/accounts');
          }








      }
    };
  }]);
