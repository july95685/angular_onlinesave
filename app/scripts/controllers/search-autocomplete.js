/**
 * Created by arnoma2015 on 16/1/12.
 */
angular.module('dalockrAppV2App')
.controller('searchAutoComplete',searchAutoComplete);


function searchAutoComplete($location,$log,dalockrServices,userServices,$q,commonServices,$timeout){


    var self = this;
    self.simulateQuery = false;
    self.isDisabled    = false;
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    self.searchByKeyword = searchByKeyword;
    self.searchText = '';
    self.repos = [];
    var allMimeTypeClass = ['mdi-image-filter','mdi-filmstrip','mdi-file-pdf','mdi-file-music','mdi-file-powerpoint-box','mdi-file-word-box','mdi-file-excel-box','mdi-file-outline'];


    function searchByKeyword(){
        if(self.searchText !== ''){
            document.getElementsByTagName('html')[0].style = '';
            document.body.style = '';
            $location.path('/search/' + self.searchText);
        }
    }

    /**
     * remote dataservice call.
     */
    function querySearch (query) {
        if(!query.length) return [];

        var deferred = $q.defer();
        userServices.getUserProfileInfo(function () {
            dalockrServices.getSearch(query, function (data) {
                var DA = data.result.DA.map(function (value) {
                    value.typeOfDa = true;

                    value.mimeType.isFileType('article') && (value.fileType = 'article') && (value.icon = allMimeTypeClass[7]);
                    value.mimeType.isFileType('doc') && (value.fileType = 'doc')  && (value.icon = allMimeTypeClass[5]);
                    value.mimeType.isFileType('xls') && (value.fileType = 'xls')  && (value.icon = allMimeTypeClass[6]);
                    value.mimeType.isFileType('ppt') && (value.fileType = 'ppt')  && (value.icon = allMimeTypeClass[4]);
                    value.mimeType.isFileType('video') && (value.fileType = 'video')  && (value.icon = allMimeTypeClass[1]);
                    value.mimeType.isFileType('audio') && (value.fileType = 'audio')  && (value.icon = allMimeTypeClass[3]);
                    value.mimeType.isFileType('pdf') && (value.fileType = 'pdf')  && (value.icon = allMimeTypeClass[2]);
                    value.mimeType.isFileType('image') && (value.fileType = 'image')  && (value.icon = allMimeTypeClass[0]);

                    value.nameHtml = value.name.replace(query,'<span style="color: #006fd5;">' + query + '</span>');
                    return value;
                });
                var LOCKR = data.result.Lockr.map(function (l) {
                    l.typeOfLockr = true;
                    l.nameHtml = l.name.replace(query,'<span style="color: #006fd5;">' + query + '</span>');
                    return l;
                });
                self.repos = LOCKR.concat(DA);
                var results = query ? self.repos.filter(createFilterFor(query)) : self.repos;
                deferred.resolve(results);
            });

        }, function (error) {

        });
        return deferred.promise;
    }

    function searchTextChange(text) {

    }
    function selectedItemChange(item) {
        $timeout(function () {
            if(item && item.typeOfLockr){
                $location.path('/sublockr/' + item['_id']);
            } else {
                commonServices.setSelectedAssetId(item['_id']);
                $location.path('/asset/' + item.fileType + '-' + item['_id']); //进入asset-details页
            }
        });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
            return (angular.lowercase(item.name).indexOf(lowercaseQuery) === 0);
        };
    }


}

//function selectOtherLockrController($q,userServices,dalockrServices,$scope){
//
//
//    var self = this;
//    self.simulateQuery = false;
//    self.isDisabled    = false;
//    // list of `state` value/display objects
//
//    self.querySearch   = querySearch;
//    self.selectedItemChange = selectedItemChange;
//    self.searchTextChange   = searchTextChange;
//    self.newState = newState;
//    function newState(state) {
//        //alert("Sorry! You'll need to create a Constitution for " + state + " first!");
//    }
//
//    // ******************************
//    // Internal methods
//    // ******************************
//    /**
//     * Search for states... use $timeout to simulate
//     * remote dataservice call.
//     */
//    function querySearch (query) {
//
//        if(!query || !query.length) return [];
//
//        var deferred = $q.defer();
//        userServices.getUserProfileInfo(function () {
//            dalockrServices.getSearch(query, function (data) {
//                self.repos = data.result.Lockr;
//                var results = query ? self.repos.filter(createFilterFor(query)) : self.repos;
//                deferred.resolve(results);
//            });
//
//        }, function (error) {
//
//        });
//        return deferred.promise;
//
//    }
//    function searchTextChange(text) {
//
//    }
//    function selectedItemChange(item) {
//        $scope.$emit('ReceiveSelectLockrId',item._id);
//    }
//
//    /**
//     * Create filter function for a query string
//     */
//    function createFilterFor(query) {
//        //var lowercaseQuery = angular.lowercase(query);
//        return function filterFn(state) {
//            return (state.name.indexOf(query) === 0);
//        };
//    }
//
//
//}