/**
 * Created by panma on 8/5/15.
 */
angular.module('dalockrAppV2App')
    .directive('dalockrFooter', ['dalockrServices','userServices','commonServices',function(dalockrServices,userServices,commonServices) {

        return {
            restrict: 'E',
            templateUrl: 'views/directives/dalockr-footer.html',
            scope:{
                footerPosition:'@'
            },
            replace:true,
            link: function(scope,element,attr,ctrl){


            }
        };
    }]);
