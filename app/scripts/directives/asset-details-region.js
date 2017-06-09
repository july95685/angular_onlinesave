'use strict';

angular.module('dalockrAppV2App')
    .directive('assetDetailsRegion', ['$rootScope','$mdDialog','$dalMedia','dalockrServices',function($rootScope,$mdDialog,$dalMedia,dalockrServices) {

        return {
            restrict: 'E',
            templateUrl: function () {
                if($rootScope.mobileDevice){
                    return 'views/mobile/mobile-asset-details-region.html';
                }
                return 'views/directives/asset-details-region.html';
            },
            replace:true,
            link:function(scope,elem){

                $rootScope.$on('UserAvator', function (ev,image) {
                    scope.avatorRobot = image;
                });

                scope.$on('openFixedMenu', function(event,value){
                    if(value){
                        scope.regionSize = {
                            width:elem[0].clientWidth,
                            height:elem[0].clientHeight
                        };
                        scope.maskIsShow = true;
                    } else {
                        scope.maskIsShow = false;
                    }

                });
                //scope.openRobot = function(){
                //    $mdDialog.show({
                //        controller: OpenRobotController,
                //        templateUrl: 'views/mobile/mobile-robot.html',
                //        parent: angular.element(document.body),
                //        clickOutsideToClose:false,
                //        fullscreen:$dalMedia('xs')
                //
                //    });
                //};
                //function OpenRobotController($scope){
                //    $scope.giveRobotMessage = '';
                //    $scope.BobResponse = '';
                //    $scope.hide = function() {
                //        $mdDialog.hide();
                //    };
                //    $scope.cancel = function() {
                //        $mdDialog.cancel();
                //    };
                //    $scope.answer = function(answer) {
                //        $mdDialog.hide(answer);
                //    };
                //    $scope.Rbavator = scope.avatorRobot;
                //    $scope.askToBob = function(){
                //        var sendmessage = $scope.giveRobotMessage;
                //        var trackingId = '58258c1a2c65cd2008646add';
                //        var askdata = {
                //            'sendmessage':$scope.giveRobotMessage,
                //            'trackingId':'58258c1a2c65cd2008646add'
                //        };
                //        console.log(askdata);
                //        dalockrServices.sendMessageToBot(sendmessage).success(function(data){
                //            $scope.BobResponse = data.RESPONSE;
                //            console.log(data);
                //        }).error(function(error){
                //            $scope.BobResponse = "Some error has occurred!";
                //        })
                //    };
                //
                //}

            }
        }

    }]);

