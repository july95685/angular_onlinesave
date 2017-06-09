/**
 * Am-tree   author: Arno Ma
 */
(function(window, _,undefined){
    "use strict";

    var amTree = _.module('amTree',[]);
    var loadingTemplate = '<img style="width: 18px;height: 14px;padding-left: 5px;" src="images/loading-icon.gif">';

    amTree
        .factory('amTreeManager',[function(){

            var loadingCb,
                selectItemCb;

            function setLoadingCb(cb){
                loadingCb = cb;
            }
            function getLoadingCb(){
                return loadingCb ? loadingCb : _.noop;
            }

            function setSelectItemCb(cb) {
                selectItemCb = cb;
            }
            function getSelectItemCb() {
                return selectItemCb;
            }

            return {
                setLoadingCb:setLoadingCb,
                getLoadingCb:getLoadingCb,
                setSelectItemCb:setSelectItemCb,
                getSelectItemCb:getSelectItemCb
            }
        }])
        .directive('amTree', ['$compile','$rootScope','amTreeManager',function ($compile, $rootScope,amTreeManager) {

            var template = '<div class="am-tree">\
            \
            </div>\
            \
            ';

            return {
                restrict: 'EA',
                scope:{
                    ngModel:'=',
                    selectItemCallback:'&'
                },
                template:template,
                replace:true,
                link: function (scope, element, attrs) {

                    ////console.log(scope.ngModel);
                    var tmpElem,
                        tmpScope = null;

                    scope.$watch('ngModel',function(newVal, oldVal){
                        if(newVal !== oldVal && newVal) {

                            amTreeManager.setSelectItemCb(scope.selectItemCallback);
                            //amTreeCtrl.setSelectItemCallback(scope.selectItemCallback);

                            for (var i = 0; i < scope.ngModel.length; i++) {
                                var obj = scope.ngModel[i];
                                tmpScope = $rootScope.$new();
                                tmpScope.item = obj;
                                tmpScope.apiType = obj.apiType;
                                if( obj.isFolder ) {
                                    tmpElem = $compile(_.element('<am-tree-parent item="item" api-type="apiType"></am-tree-parent>'))(tmpScope);
                                    element.append(tmpElem);
                                } else {
                                    tmpElem = $compile(_.element('<am-tree-children item="item"></am-tree-children>'))(tmpScope);
                                    element.append(tmpElem);
                                }
                                tmpScope = null;
                            }
                        }


                    });







                    //scope.selectItemCallback({node:scope.ngModel[0]});




                }
            }
        }])
        .directive('amTreeParent', ['$compile','$rootScope','amTreeManager',function ($compile,$rootScope,amTreeManager) {

            var template = '<div class="am-tree-item am-tree-parent">\
            <div class="am-tree-label" ng-class="{\'am-disabled\':item.disabled}" ng-click="openChildren(item)"><i class="mdi {{iconClass}}" ng-hide="hideIcon"></i><span ng-hide="boxFile">{{getName(item.label)}}</span><span ng-show="boxFile">{{item.name}}</span></div>\
            <div class="am-children-list" style="padding-left: 20px;">\
            \
            </div>\
            </div>\
            \
            ';

            return {
                restrict: 'EA',
                template:template,
                scope:{
                    item:'=',
                    apiType:'='
                },
                link: function (scope, element, attrs) {
                    var tmpElem,
                        childrenListElem = element.find('.am-children-list'),
                        tmpScope = null,
                        childrens = null;

                    scope.boxFile = false;
                    scope.hideIcon = scope.item.hiddenIcon;
                    scope.iconClass = 'mdi-folder-plus';
                    scope.openChildren = showChildren;
                    scope.getName = generateFileName;

                    if(scope.item.name){
                        scope.boxFile = true;
                    }

                    if(scope.item.isOpen){
                        showChildren(scope.item);
                    }

                    /**
                     * 展开children
                     * @param children
                     */
                    var isLoading = false;
                    function showChildren(iT){

                        if(isLoading) return;

                        if(!scope.item.disabled){
                            $('.am-tree').find('.am-tree-label').removeClass('am-active');
                            $(element.find('.am-tree-label')[0]).toggleClass('am-active');
                            amTreeManager.getSelectItemCb()({node:scope.item});
                        }

                        if(iT.isLoadingChildren && childrens === null){
                            isLoading = true;
                            var loadingElem = _.element(loadingTemplate);
                            element.find('.am-tree-label').append(loadingElem);
                            amTreeManager.getLoadingCb()(scope.item, scope.apiType)
                                .then(function(data){
                                    loadingElem.remove();
                                    loadingElem = null;
                                    childrens = data;
                                    isLoading = false;
                                    appendChildren(data);

                                }, function(){
                                    loadingElem.remove();
                                    loadingElem = null;
                                    isLoading = false;
                                });
                        } else {
                            appendChildren(iT.children)
                        }


                        function appendChildren(c){

                            if(childrenListElem.hasClass('children-appended')){

                                childrenListElem.css('display') === 'none' ? childrenListElem.show() : childrenListElem.hide();
                                childrenListElem.css('display') === 'none' ? scope.iconClass = 'mdi-folder-plus' : scope.iconClass = 'mdi-folder-outline';


                            } else {

                                for (var i = 0; i < c.length; i++) {

                                    var obj = c[i];
                                    tmpScope = $rootScope.$new();
                                    tmpScope.itemObj = obj;
                                    tmpScope.apiType = scope.apiType;

                                    if( obj.isFolder ) {
                                        tmpElem = $compile(_.element('<am-tree-parent item="itemObj" api-type="apiType"></am-tree-parent>'))(tmpScope);
                                        childrenListElem.append(tmpElem);
                                    } else {
                                        tmpElem = $compile(_.element('<am-tree-children item="itemObj"></am-tree-children>'))(tmpScope);
                                        childrenListElem.append(tmpElem);
                                    }
                                    tmpScope = null;
                                }

                                childrenListElem.addClass('children-appended');
                                scope.iconClass = 'mdi-folder-outline';

                            }
                        }





                    }


                }
            }
        }])
        .directive('amTreeChildren', ['amTreeManager',function (amTreeManager) {

            var template = '<div class="am-tree-item am-tree-child">\
            <div class="am-tree-label" ng-click="selectThisItem()"><i class="mdi {{fileClass}}"></i><span ng-hide="boxFile">{{getName(item.label)}}</span><span ng-show="boxFile">{{item.name}}</span></div>\
            \
            ';
            return {
                restrict: 'EA',
                template:template,
                scope:{
                    item:'='
                },
                link: function (scope, element, attrs) {


                    scope.boxFile = false;
                    scope.fileClass = generateIconClassByFileName(scope.item.label);
                    scope.selectThisItem = selectThisItem;
                    scope.getName = generateFileName;

                    if(scope.item.name){
                        scope.boxFile = true;
                    }

                    function selectThisItem(){
                        $('.am-tree').find('.am-tree-label').removeClass('am-active');
                        element.find('.am-tree-label').toggleClass('am-active');
                        amTreeManager.getSelectItemCb()({node:scope.item});
                    }
                }
            }
        }]);


    /**
     * 通过后缀识别文件类型，并返回适合的icon class
     * @param fileName
     */
    function generateIconClassByFileName(fileName){

        var fileSplits = fileName.split('.'),
            type = fileSplits[fileSplits.length - 1].toLowerCase(),
            iconClass;

        switch (type){
            case 'jpg' :
                iconClass = 'mdi-file-image';
                break;
            case 'png' :
                iconClass = 'mdi-file-image';
                break;
            case 'zip' :
                iconClass = 'mdi-zip-box';
                break;
            case 'pdf' :
                iconClass = 'mdi-file-pdf';
                break;
            case 'excel' :
                iconClass = 'mdi-file-excel';
                break;
            case 'mp3' :
                iconClass = 'mdi-file-music';
                break;
            case 'mp4' :
                iconClass = 'mdi-file-video';
                break;
            case 'ppt' :
                iconClass = 'mdi-file-powerpoint';
                break;
            case 'word' :
                iconClass = 'mdi-file-word';
                break;
            default  :
                iconClass = 'mdi-file-outline';
                break;
        }

        return iconClass;

    }

    /**
     *
     * @param path
     * @returns {*}
     */
    function generateFileName(path){
        var fileSplits = path.split('/');
        return fileSplits[fileSplits.length - 1];
    }



})(window,angular);
