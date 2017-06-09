

/**
 * Created by Admin on 2015/6/2.
 */
/**
 * Created by Admin on 2015/6/2.
 */
angular.module('dalockrAppV2App')
    .directive('userFollowing', ['toastr','dalockrServices','$location','commonServices','$sessionStorage',
        function(toastr,dalockrServices,$location,commonServices,$sessionStorage) {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/user-following.html',
                link: function (scope, element) {
                    element.find("i[rel='tooltip']").tooltip({
                        container: 'body',
                        delay: { 'show': 300, 'hide': 0 }
                    });
                    function getUserFollows(){
                        dalockrServices.getUserFollowers(function(data){
                            scope.followers = data;
                        },function(error){

                        });
                        dalockrServices.getUserFollowings(function(data){

                            //console.log('-----following data -----');
                            //console.log(data);

                            scope.followings = data;
                            angular.forEach(scope.followings,function(value,key){
                                if(value.lockr){
                                    value.lockr.thumbnail = dalockrServices.getThumbnailUrl('lockr',value.lockr.id);
                                }else if(value.user){
                                    value.user.thumbnail = dalockrServices.getUserAvatar(value.user.clusterId, value.user.id);
                                }
                            });

                        },function(error){

                        });
                    }
                    getUserFollows();

                    scope.$on('follow',function(event){
                        getUserFollows();
                    });
                    scope.deleteFollowing = function (follow) {
                        dalockrServices.deleteUserFollows(follow.id, function (data) {
                            if(data){
                                toastr.success('delete following','Success');
                            }
                        }, function (error) {
                            if(error && error.status === 404){
                                toastr.error('Not Found', 'Error');
                            }
                        });
                        getUserFollows();
                    };

                }
            }
        }]);