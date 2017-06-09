/**
 * Created by Administrator on 2016/12/28
 */
angular.module('dalockrAppV2App')
    .directive('lockrSelectThumbnail',['dalockrServices','toastr','userRightServices','$dalMedia','$timeout','$q','$rootScope','$mdDialog','accountmanager','appConfig','userServices','commonServices','thumbnailServices','cropAndUploadThumb',
        function(dalockrServices,toastr,userRightServices,$dalMedia,$timeout,$q,$rootScope,$mdDialog,accountmanager,appConfig,userServices,commonServices,thumbnailServices,cropAndUploadThumb) {
        return {
            restrict:'E',
            scope:{
                accountEntity:'=',
                lockrInfodata:'='
            },
            replace:true,
            templateUrl:'views/directives/lockr-select-thumbnail.html',
            link: function (scope,element) {
                if(scope.accountEntity){
                    scope.currentLockrData = scope.accountEntity.aDet;
                }else if(scope.lockrInfodata){
                    scope.currentLockrData = scope.lockrInfodata;
                }

                setTimeout(function () {
                    inputAvatar = document.getElementById('crop-lockr-thumbnail-input');
                    dropBox =  element.find('#crop-lockr-thumbnail-area');
                    options =  {
                        readAsDefault: "DataURL",
                        on: {
                            progress: function() {
                                //console.log(e);
                            },
                            load: function(e,file) {
                                scope.$apply(function () {
                                    cropAndUploadThumb.open(e.target.result,file,scope.currentLockrData.id).then(function (uploaded) {
                                        if(uploaded.success){
                                        }
                                    })
                                });
                            }
                        }
                    };
                    FileReaderJS.setupInput(inputAvatar, options);
                    FileReaderJS.setupDrop(dropBox[0],options);
                    dropBox.bind('click', function () {
                        inputAvatar.click();
                    });

                },0);
                scope.closeselectthumb = function(){
                    $rootScope.$broadcast('closeselectthumb',false);
                };
                scope.selectThumbLockr = function(){
                    thumbnailServices.editThumbnailDialog(scope.currentLockrData);
                    scope.closeselectthumb();
                };
                scope.deleteThumbLockr = function(){
                    var confirm = $mdDialog.confirm()
                        .title('Are you sure you want to delete this account thumbnail ?')
                        .ariaLabel('delete thumbnail')
                        .ok('OK')
                        .cancel('Cancel');


                    $mdDialog.show(confirm).then(function() {
                        scope.closeselectthumb();
                        dalockrServices.deleteLockrThumbnail(scope.currentLockrData.id).success(function(data){
                            toastr.success(data.message,'Success');
                        }).error(function(error){
                            toastr.error(error.data.message,'Error');
                        });
                    }, function() {
                    });

                };
            }

        }
    }]);
