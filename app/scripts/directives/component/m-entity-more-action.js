(function () {

    "use strict";

    angular.module('dalockrAppV2App')
        .service('dalEntityMoreAction',['$mdBottomSheet','$rootScope',function ($mdBottomSheet,$rootScope) {

            this.open = function (currentItem,isSubRoute) {
                var scope = $rootScope.$new();

                scope.currentItem = currentItem;
                scope.isSubRoute = isSubRoute;

                return $mdBottomSheet.show({
                    scope:scope, //当模板移除的时候 scope也会被自动销毁
                    templateUrl: 'views/directives/component/m-entity-more-action.html',
                    controller: 'dalEntityMoreActionController',
                    clickOutsideToClose: true
                });

            };
        }])
        .controller('dalEntityMoreActionController',['$scope','$mdBottomSheet',function ($scope,$mdBottomSheet) {

            var items = {};

            if($scope.currentItem.fileType != 'subLockr'){


                items = {
                    preview:{
                        icon:'dalello-icon-preview_black',
                        name:'PREVIEW'
                    },
                    edit:{
                        icon:'mdi-pencil',
                        name:'EDIT'
                    },
                    copy:{
                        icon:'mdi-file-outline',
                        name:'COPY'
                    },
                    move:{
                        icon:'dalello-icon-move_black',
                        name:'MOVE'
                    },
                    publish:{
                        nonactive:{
                            icon:'dal-icon-unpublish_black',
                            name:'UNPUBLISH'
                        },
                        active:{
                            icon:'dal-icon-preview_black',
                            name:'PUBLISH'
                        }
                    },
                    thumbnail:{
                        icon:'dalello-icon-locker_thumbnail_black',
                        name:'SET AS THUMBNAIL'
                    },
                    delete:{
                        icon:'mdi-delete',
                        name:'DELETE'
                    }
                };




            } else {
                items = {
                    preview:{
                        icon:'dalello-icon-preview_black',
                        name:'PREVIEW'
                    },
                    follow:{
                        icon:'mdi-heart',
                        name:'FOLLOW'
                    },
                    edit:{
                        icon:'mdi-pencil',
                        name:'EDIT'
                    },
                    download:{
                        icon:'dal-icon-download_black',
                        name:'DOWNLOAD'
                    },
                    share:{
                        icon:'dalello-icon-total_shares_black',
                        name:'SHARE'
                    },
                    lock:{
                        nonactive:{
                            icon:'mdi-lock-open',
                            name:'UNLOCK'
                        },
                        active:{
                            icon:'mdi-lock',
                            name:'LOCK'
                        }
                    },
                    thumbnail:{
                        icon:'dalello-icon-locker_thumbnail_black',
                        name:'EDIT THUMBNAIL'
                    },
                    //invite:{
                    //    icon:'dalello-icon-invite_black',
                    //    name:'INVITE'
                    //},
                    delete:{
                        icon:'mdi-delete',
                        name:'DELETE'
                    }
                };

            }


            $scope.items = items;
            $scope.selectAction = function (key) {
                $mdBottomSheet.hide(key);
            }

        }]);


})();