/**
 * Created by KAMITA on 7/15/15.
 */
angular.module('dalockrAppV2App')
  .directive('dalockrMasonry', ['dalockrServices','$filter','$location','commonServices','$mdDialog','toastr','$rootScope','$q',function(dalockrServices,$filter,$location,commonServices,$mdDialog,toastr,$rootScope,$q) {

    return {
      restrict: 'E',
      templateUrl: 'views/directives/dalockr-masonry.html',
      scope:{
        lockrsData:'=',
          startLoading:'='
      },
      replace:true,
      link: function(scope,element){

       var cardWidth = 240,
           mainMaWrapper = element.find('.main-masonry-wrapper'),
           mainFilter =  element.find('.main-filter'),
           mainListWrapper = element.find('#main-list-wrapper');
       resizeMasonry();

        window.onresize = function(){
            throttle(resizeMasonry)
        };

          function resizeMasonry(){

              var innerWidth = mainListWrapper.innerWidth();
              mainFilter.css('width',cardWidth * Math.floor( innerWidth / cardWidth) - 10);
              mainMaWrapper.css('width',cardWidth * Math.floor(innerWidth / cardWidth));
          }
          function throttle(method, context){
              clearTimeout(method.tId);
              method.tId = setTimeout(function(){
                  method.call(context);
              },50);
          }

        element.css('min-height',commonServices.getCurrentBroswerHeight() + 'px');


          scope.$watch('lockrsData', function(newVal, oldVal){
              scope.lockrsData = newVal;
              scope.startLoading = false;
          });




        scope.enterLockrDetails = function(ev,lockrId){
            angular.forEach(scope.lockrsData, function(value, key){
                if(value.id === lockrId) {
                    $location.path('/lockr/' + lockrId);
                }
            });

        };








          // 创建 Safe Lockr
          scope.openAddSafeLockrDialog = function(ev) {
              $mdDialog.show({
                  controller: SafeDialogController,
                  templateUrl: 'views/templates/add-safe-lockr-dialog.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:false
              })
          };


          function SafeDialogController($scope, $mdDialog, $rootScope) {

              $scope.currentEntity = {
                  'name':null,
                  'description':''
              };

              $scope.hide = function() {
                  $mdDialog.hide();
              };
              $scope.cancel = function() {
                  $mdDialog.cancel();
              };
              $scope.answer = function(answer) {
                  $mdDialog.hide(answer);
              };

              $scope.submitted = false;
              $scope.loadingInProgress = false;

              $scope.createLockr = function(){

                  $scope.submitted = true;

                  if($scope.create_safe_lockr_form.$valid){
                      $scope.loadingInProgress = true;
                      var normalData = {
                          'name':$scope.currentEntity.name,
                          'description':$scope.currentEntity.description
                      };

                      dalockrServices.createSafeLockr(normalData)
                          .then(function(){
                              $rootScope.$broadcast('updateLockrs',true);
                          },function(error){
                              $scope.loadingInProgress = false;
                              toastr.error(error.data.message,'Error');
                          });
                  }
              };
          }



          scope.openAddLockrDialog = function(ev) {
              $mdDialog.show({
                  controller: DialogController,
                  templateUrl: 'views/templates/add-lockr-dialog.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:false
              })
          };


          function DialogController($scope, $mdDialog, $rootScope) {

              $scope.currentEntity = {
                  'name':null,
                  'description':''
              };

              $scope.hide = function() {
                  $mdDialog.hide();
              };
              $scope.cancel = function() {
                  $mdDialog.cancel();
              };
              $scope.answer = function(answer) {
                  $mdDialog.hide(answer);
              };

              $scope.createType = 'normal';
              $scope.submitted = false;
              $scope.loadingInProgress = false;

              $scope.createLockr = function(){

                  $scope.submitted = true;

                  if($scope.create_lockr_form.$valid){

                      $scope.loadingInProgress = true;
                      if($scope.createType === 'normal'){

                          var normalData = {
                              'name':$scope.currentEntity.name,
                              'description':$scope.currentEntity.description
                          };

                          dalockrServices.createLockr(normalData,function(data){

                              $rootScope.$broadcast('updateLockrs',true);
                              $scope.$apply();

                          },function(error){

                              throwError(error);
                              $scope.$apply();

                          });
                      } else if($scope.createType === 'private') {

                          var privateData = {
                              'name':$scope.currentEntity.name,
                              'description':$scope.currentEntity.description,
                              'hiddenFromPublicView':true
                          };

                          dalockrServices.createLockr(privateData, function(data){

                              $rootScope.$broadcast('updateLockrs',true);
                              $scope.$apply();

                          },function(error){
                              throwError(error);
                              $scope.$apply();
                          });
                      } else if($scope.createType === 'store'){

                          var storeData = {
                              'name':$scope.currentEntity.name,
                              'description':$scope.currentEntity.description
                          };

                          dalockrServices.createStoreLockr(storeData, function(data){
                              $rootScope.$broadcast('updateLockrs',true);
                              $scope.$apply();
                          },function(error){
                              throwError(error);
                              $scope.$apply();
                          });

                      }


                  } else {
                      angular.element("input[name='title']").focus();
                  }
              };

              function throwError(error){
                  $scope.loadingInProgress = false;
                  toastr.error(JSON.parse(error.responseText).message,'Error');
              }
          }




          scope.followLockr = function(ev,value){
              dalockrServices.followLockr(value.id, function(data){
                  toastr.success('Follow '+ value.name + ' has successfully been created.','Success');
              },function(error){
                  toastr.error(JSON.parse(error.responseText).message,'Error');
              });
              cancelBubble(ev);
          };


          scope.openDeleteLockrDialog = function(ev,value){

              scope.currentDeleteLockr = value;

              $mdDialog.show({
                  controller: deleteLockrDialogController,
                  templateUrl: 'views/templates/delete-lockr-dialog.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:false
              })
                  .then(function(answer) {
                      scope.status = 'You said the information was "' + answer + '".';
                  }, function() {
                      scope.status = 'You cancelled the dialog.';
                  });

              cancelBubble(ev);


          };


          function deleteLockrDialogController($scope){


              $scope.hide = function() {
                  $mdDialog.hide();
              };
              $scope.cancel = function() {
                  $mdDialog.cancel();
              };
              $scope.answer = function(answer) {
                  $mdDialog.hide(answer);
              };

              $scope.currentDeleteLockr = scope.currentDeleteLockr;

              $scope.deleteData = {
                  deleteAssets:false,
                  socialChannels:false
              };

              $scope.$watch(function($scope){
                  return $scope.deleteData.deleteAssets;
              },function(newVal,oldVal){
                  if(newVal === false){
                      $scope.deleteData.socialChannels = false;
                  }
              });


              $scope.deleteLockr = function(){

                $scope.loadingInProgress = true;

                dalockrServices.deleteLockr(scope.currentDeleteLockr.id,$scope.deleteData.deleteAssets,$scope.deleteData.socialChannels,function(data){
                    toastr.error('Lockr deleted');
                    $rootScope.$broadcast('updateLockrs',true);
                    $scope.$apply();

                },function(error){
                    var errorData = JSON.parse(error.responseText);
                    toastr.error(errorData.message);
                    $scope.loadingInProgress = false;
                    $scope.$apply();

                });
              }
          }



          scope.openEditLockrDialog = function(ev,value){

              scope.isEdittingLockr = value;

              $mdDialog.show({
                  controller: editLockrDialogController,
                  templateUrl: 'views/templates/edit-lockr-dialog.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:false
              })
                  .then(function(answer) {
                      scope.status = 'You said the information was "' + answer + '".';
                  }, function() {
                      scope.status = 'You cancelled the dialog.';
                  });

            cancelBubble(ev);

          };

          function editLockrDialogController($scope){

              $scope.hide = function() {
                  $mdDialog.hide();
              };
              $scope.cancel = function() {
                  $mdDialog.cancel();
              };
              $scope.answer = function(answer) {
                  $mdDialog.hide(answer);
              };
              $scope.currentLockrData = angular.copy(scope.isEdittingLockr);

              if($scope.currentLockrData.hiddenFromPublicView === true){
                  $scope.shareRules = 'private';
              } else {
                  $scope.shareRules = 'public';
              }

              $scope.submitted = false;

              $scope.updateLockr = function(){

                  $scope.submitted = true;

                  if($scope.update_lockr_form.$valid) {

                      $scope.loadingInProgress = true;
                      var hiddenFromPublicView = false;
                      if ($scope.shareRules === 'private') {
                          hiddenFromPublicView = true;
                      }


                      var entityData = {
                          name: $scope.currentLockrData.name,
                          description: $scope.currentLockrData.description,
                          hiddenFromPublicView: hiddenFromPublicView
                      };

                      dalockrServices.updateLockr($scope.currentLockrData.id, entityData, function (data) {
                          $rootScope.$broadcast('updateLockrs', true);
                          toastr.success("Lockr " + data.lockr.name +" has successfully been updated.",'Success');
                      }, function (error) {
                          $scope.loadingInProgress = false;
                          toastr.error(error.message,'Error');
                      });
                  }
              };

          }





          scope.openDownloadLockrDialog = function(ev,value){

              scope.isDownloadingLockr = value;

              $mdDialog.show({
                  controller: downloadLockrDialogController,
                  templateUrl: 'views/templates/download-lockr-dialog.html',
                  parent: angular.element(document.body),
                  targetEvent: ev,
                  clickOutsideToClose:false
              })
                  .then(function(answer) {
                      scope.status = 'You said the information was "' + answer + '".';
                  }, function() {
                      scope.status = 'You cancelled the dialog.';
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
              angular.element('.download-btn').focus();


              $scope.downloadLockr = function(){
                  $mdDialog.hide();
                  document.getElementById('lockr-download-a').click();
              }

          }


          //filter Lockr
          scope.filterValue = {};
          filterLockrs();
          function filterLockrs(){

              var filterTextElem = $(element.find('.main-filter-box ul b')[0]),
                  filterIconElem = element.find('.main-filter-box ul i'),
                  filterTypeBox = [];

              scope.filterLockrs = function(ev){

                  var filterType = $(ev.target).attr('data-filter-type');

                  if(filterType === 'all'){
                      handleAllClick();
                  } else {

                      for(var j=0; j<filterIconElem.length; j++){
                          if( $(filterIconElem[j]).hasClass('filter-icon-selected')){
                              $(filterIconElem[j]).removeClass('filter-icon-selected');
                          }
                      }

                      var isInBox = false;
                      for(var k=0; k<filterTypeBox.length; k++){
                          if(filterType === filterTypeBox[k]){
                              filterTypeBox.splice(k,1);
                              isInBox = true;
                              break;
                          }
                      }

                      if(!isInBox){
                          filterTypeBox.push(filterType);
                      }

                      if(filterTypeBox.length === 0){
                          if( !element.find('.filter-all').hasClass('filter-icon-selected')){
                              element.find('.filter-all').addClass('filter-icon-selected');
                          }
                      } else {
                          if( element.find('.filter-all').hasClass('filter-icon-selected')){
                              element.find('.filter-all').removeClass('filter-icon-selected');
                          }
                      }

                      for(var i=0; i<filterTypeBox.length; i++){
                          if( !element.find('.filter-' + filterTypeBox[i]).hasClass('filter-icon-selected')){
                              element.find('.filter-' + filterTypeBox[i]).addClass('filter-icon-selected');
                          }
                      }


                      handleFilterData();
                  }

                  function handleAllClick(){
                      if( !element.find('.filter-all').hasClass('filter-icon-selected')){
                          element.find('.filter-all').addClass('filter-icon-selected');
                      }
                      filterTypeBox = [];

                      for(var j=0; j<filterIconElem.length; j++){
                          if( $(filterIconElem[j]).hasClass('filter-icon-selected')){
                              $(filterIconElem[j]).removeClass('filter-icon-selected');
                          }
                      }

                      handleFilterData();

                  }




                  function handleFilterData(){

                      scope.filterValue = {};
                      if(filterTypeBox.length === 0){
                          return;
                      }

                      for(var i=0; i<filterTypeBox.length; i++){

                          if(filterTypeBox[i] === 'public'){
                              if(typeof scope.filterValue.hiddenFromPublicView === 'undefined'){
                                  scope.filterValue.hiddenFromPublicView = true;
                              }
                          } else if(filterTypeBox[i] === 'locked'){

                              if(typeof scope.filterValue.locked === 'undefined'){
                                  scope.filterValue.locked = true;
                              }
                          } else if(filterTypeBox[i] === 'store'){

                              if(typeof scope.filterValue.lockrType === 'undefined'){
                                  scope.filterValue.lockrType = 'StoreLockr';
                              }
                          } else if(filterTypeBox[i] === 'follow'){
                              if(typeof scope.filterValue.haveFollowers === 'undefined'){
                                  scope.filterValue.haveFollowers = true;
                              }
                          } else if(filterTypeBox[i] === 'draft'){
                              if(typeof scope.filterValue.state === 'undefined'){
                                  scope.filterValue.state = 'Draft';
                              }
                          }
                      }

                  }

              }
          }






          scope.$on('openFixedMenu', function(event,value){
              if(value){
                  scope.regionSize = {
                      width:element[0].clientWidth,
                      height:element[0].clientHeight
                  };
                  scope.maskIsShow = true;
              } else {
                  scope.maskIsShow = false;
              }

          });
          scope.openFilterBox = function(){
              element.find('.main-filter-box').fadeIn(500);
          };
          scope.closeFilterBox = function(){
              element.find('.main-filter-box').fadeOut(500);
          };



          scope.$on('addLockrNotification',function(event,value){
              scope.openAddLockrDialog(value);
          });
          scope.$on('addSafeLockrNotification',function(event,value){
              scope.openAddSafeLockrDialog(value);
          });
          scope.$on('addCloudServiceLockrNotification',function(event,value){
              scope.openAddCloudServiceLockrDialog(value);
          });







          /*********** 批量操作 ASSET ***********/

          //selected-item



          var haveSelectedItem = [];

          scope.selectItem = function(ev,value){

              if(haveSelectedItem.length === 0){
                  haveSelectedItem.push(value);
                  var nElem = element.find('#lockr-' + value.id);
                  markElem(nElem);

                  //通知Fix-Menu
                  $rootScope.$broadcast('haveSelectedOneItem',true);

              } else {
                  var isSave = false;
                  for(var k=0; k<haveSelectedItem.length; k++){
                      if(haveSelectedItem[k].id === value.id){
                          haveSelectedItem.splice(k,1);

                          var hmElem = element.find('#lockr-' + value.id);
                          cancelMarkElem(hmElem);
                          isSave = true;
                          break;
                      }
                  }
                  if(!isSave){
                      haveSelectedItem.push(value);
                      var aElem = element.find('#lockr-' + value.id);
                      markElem(aElem);
                  }


                  if(haveSelectedItem.length === 0){
                      $rootScope.$broadcast('haveSelectedOneItem',false);
                  }
              }

              cancelBubble(ev);
          };

          //全选
          function selectAllElem(){

              haveSelectedItem = [];
              angular.forEach(scope.lockrsData, function(value,key){
                  var item = element.find('#lockr-'+value.id);
                  markElem(item);
                  haveSelectedItem.push({id:value.id,name:value.name});

              })

          }
          //全不选
          function unSelectAllElem(){

              angular.forEach(scope.lockrsData, function(value,key){
                  var item = element.find('#lockr-'+value.id);
                  cancelMarkElem(item);
              });
              haveSelectedItem = [];

          }

          //选择
          function markElem(elem){
              if(!elem.hasClass('selected-item')){
                  elem.addClass('selected-item');
                  elem.find('.selected-icon').removeClass('mdi-checkbox-multiple-blank-outline')
                      .addClass('mdi-checkbox-multiple-marked-outline');
              }

          }
          //取消选择
          function cancelMarkElem(cElem){
              if(cElem.hasClass('selected-item')){
                  cElem.removeClass('selected-item');
                  cElem.find('.selected-icon').removeClass('mdi-checkbox-multiple-marked-outline')
                      .addClass('mdi-checkbox-multiple-blank-outline');
              }

          }

          scope.$on('batchHandle',function(event,handleName){

              switch(handleName.name)
              {
                  case 'move':
                      //moveAssets(event);
                      break;
                  case 'copy':
                      //copyAssets(event);
                      break;
                  case 'mark':
                      if(typeof handleName.isHandle !== 'undefined' && handleName.isHandle){
                          $rootScope.$broadcast('haveSelectedOneItem',true);
                      }
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
                      deleteLockrs(handleName.event);
                      break;
                  default:
                      break;
              }



          });

          function deleteLockrs(event){

              function deleteLockrsDialog(ev){


                  $mdDialog.show({
                      controller: deleteLockrsDialogController,
                      templateUrl: 'views/templates/delete-lockrs-dialog.html',
                      parent: angular.element(document.body),
                      targetEvent: ev,
                      clickOutsideToClose:false
                  })
                      .then(function(answer) {
                          scope.status = 'You said the information was "' + answer + '".';
                      }, function() {
                          scope.status = 'You cancelled the dialog.';
                      });


              }
              deleteLockrsDialog(event);


              function deleteLockrsDialogController($scope){


                  $scope.isDeleting = false;

                  $scope.haveSelectedItem = haveSelectedItem;



                  $scope.hide = function() {
                      $mdDialog.hide();
                  };
                  $scope.cancel = function() {
                      $mdDialog.cancel();
                  };
                  $scope.answer = function(answer) {
                      $mdDialog.hide(answer);
                  };

                  $scope.startDeleteLockrs = function(){

                      $scope.isDeleting = true;

                      //组合assetId
                      var lockrIds = [];
                      for(var i=0; i<haveSelectedItem.length; i++){
                          lockrIds.push(haveSelectedItem[i].id);
                      }


                      var promiseArr = [];
                      for(var i=0; i<lockrIds.length; i++){
                          promiseArr.push(dalockrServices.deleteLockrWithPromise(lockrIds[i]))
                      }

                      $q.all(promiseArr).then(function(data){

                          toastr.success('Lockr deleted','Success');
                          handleAfterDelete();

                      },function(error){
                          toastr.error('Lockr delete error','Error');
                          handleAfterDelete();
                      });

                      function handleAfterDelete(){
                          unSelectAllElem();
                          $rootScope.$broadcast('haveSelectedOneItem',false);
                          $rootScope.$broadcast('updateLockrs', true);
                      }


                  }


              }



          }


          function cancelBubble(ev){
              if(ev.stopPropagation()) {
                  ev.stopPropagation();
              }else{
                  ev.cancelBubble = true;
              }
          }







      }
    };
  }]);
