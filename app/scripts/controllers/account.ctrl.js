'use strict';

angular.module('dalockrAppV2App')
    .controller('AccountsCtrl', ['$scope', 'dalockrServices','commonServices','$routeParams','$rootScope','$location','$window','$filter','userRightServices','userServices',
        function ($scope,dalockrServices,commonServices,$routeParams,$rootScope,$location,$window,$filter,userRightServices,userServices) {

            $window.scrollTo(0,0);
            commonServices.clearAssets();

            if(angular.isUndefined($location.search().aid)) {
                $location.search('');
            }

            if(commonServices.accounts()){
                $scope.accountsData = commonServices.accounts();
            } else {
                loadAccounts();
            }

            $scope.$on('addAccountSuccess', function () {
               loadAccounts();
            });

            function loadAccounts(){
                dalockrServices.getClustersLockr()
                    .then(function(response){

                        var result = response.data;
                        //if(result.length === 0) return;
                        for (var i = 0; i < result.length; i++) {
                            var obj = result[i];
                            obj.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',obj.id);
                            (function(obj){
                                userServices.getUserProfileInfo(function(userinfo){
                                    if (userinfo) {
                                        obj.isManager = userRightServices.isAccountManager(obj.accountId);
                                    }
                                });
                            })(obj);
                        
                        }                     
                        $scope.accountsData = $filter('orderBy')(result, 'dateCreated',true);
                        commonServices.saveAccounts($scope.accountsData);

                    },function(){

                    });
            }



        }]);
