
/**
 * Created by Admin on 2015/6/1.
 */
angular.module('dalockrAppV2App')
    .directive('allClusters', ['dalockrServices','$location','commonServices','$sessionStorage',
        function(dalockrServices,$location,commonServices,$sessionStorage) {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/all-clusters.html',
                scope:{
                    clusters:'='
                },
                link: function (scope, element) {
                    scope.turnTocreate = function(){
                        $('div.modal-backdrop.fade.in').hide();
                        $('body').removeClass('modal-open').css('padding-right','0');
                        $('#all-clusters').modal('hide');
                        $location.path('/createCluster');
                    };
                    scope.getCurrentCluster = function(clusterId){
                        $('#all-clusters').modal('hide');
                        $('div.modal-backdrop.fade.in').hide();
                        $('body').removeClass('modal-open').css('padding-right','0');
                        $location.path('/clusterManagement/' + clusterId);
                    }

                }
            }
        }]);
