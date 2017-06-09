'use strict';
/**
 * Created by panma on 9/14/15.
 */
angular.module('dalockrAppV2App')
    .directive('dalockrPdfView',[
        function(){

            return {

                restrict: 'E',
                templateUrl: 'views/templates/dalockr-pdf-view.html',
                replace:true,
                scope:{
                    pdfSrc:'@',
                    isShow:'='
                },
                link:function(scope,elem){

                    if(scope.isShow) {
                        var currentScale = 1;
                        var minScale = 1;
                        var maxScale = 2;
                        var scaleStep = 0.2;
                        var pageHeight = 20;
                        var pages = null;
                        var firstPageNum = 1;
                        var haveHandlePage = 0;
                        scope.pdf = null;
                        scope.totalNum = 0;
                        scope.loadingInProgress = true;
                        var pdfViewerElem = elem.find('.pdf-viewer');
                        var viewH = pdfViewerElem.innerHeight();

                        PDFJS.getDocument(scope.pdfSrc).then(function (pdf) {

                            scope.pdf = pdf;
                            scope.loadingInProgress = false;

                            var len = pdf.pdfInfo.numPages;
                            scope.totalNum = len;

                            for (var i = 0; i < len; i++) {
                                var pageElem = angular.element('<div id="pageContainer' + (i + 1) + '" class="page" data-page-num="' + (i + 1) + '">' +
                                '<div class="canvas-wrapper">' +
                                '<canvas id="page' + (i + 1) + '"></canvas>' +
                                '<div style="text-align: center;width: 100%;height: 20px;"></div>' +
                                '</div>' +
                                '</div>');
                                pdfViewerElem.append(pageElem);
                            }

                            pages = elem.find('.page');

                            //Load First Page
                            pdf.getPage(firstPageNum).then(function (page) {

                                haveHandlePage++;

                                var index = page.pageIndex;
                                var currentPage = $(pages[index]);
                                currentPage.addClass('loadCompleted');

                                var viewport = page.getViewport(currentScale);

                                if (!currentPage.hasClass('hasLoadedWH')) {
                                    pages.css({'width': viewport.width, 'height': viewport.height + pageHeight});
                                    pages.addClass('hasLoadedWH');
                                }

                                pages[index].page = page;

                                var canvas = elem.find('#page' + (index + 1))[0];
                                var context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;
                                var renderContext = {
                                    canvasContext: context,
                                    viewport: viewport
                                };
                                page.render(renderContext);
                            });

                            scope.$apply();
                        });


                        scope.scaleLarge = function () {
                            if (haveHandlePage > 0) {
                                currentScale += scaleStep;

                                if (currentScale > maxScale) {
                                    currentScale = maxScale;
                                    return;
                                }

                                for (var i = 1; i <= scope.totalNum; i++) {
                                    var index = i;

                                    if (pages[i - 1].page) {

                                        var viewport = pages[i - 1].page.getViewport(currentScale);

                                        if ($(pages[i - 1]).outerWidth() !== Math.round(viewport.width)) {
                                            pages.css({
                                                'width': viewport.width,
                                                'height': viewport.height + pageHeight
                                            });
                                        }


                                        var canvas = elem.find('#page' + index)[0];
                                        var context = canvas.getContext('2d');
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                                        var renderContext = {
                                            canvasContext: context,
                                            viewport: viewport
                                        };
                                        pages[i - 1].page.render(renderContext);

                                    }
                                }
                            }
                        };

                        scope.scaleSmall = function () {
                            if (haveHandlePage > 0) {
                                currentScale -= scaleStep;
                                if (currentScale < minScale) {
                                    currentScale = minScale;
                                    return;
                                }
                                for (var i = 1; i <= scope.totalNum; i++) {
                                    var index = i;

                                    if (pages[i - 1].page) {

                                        var viewport = pages[i - 1].page.getViewport(currentScale);

                                        if ($(pages[i - 1]).outerWidth() !== Math.round(viewport.width)) {
                                            pages.css({
                                                'width': viewport.width,
                                                'height': viewport.height + pageHeight
                                            });
                                        }

                                        var canvas = elem.find('#page' + index)[0];
                                        var context = canvas.getContext('2d');
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                                        var renderContext = {
                                            canvasContext: context,
                                            viewport: viewport
                                        };

                                        pages[i - 1].page.render(renderContext);
                                    }

                                }
                            }
                        };


                        pdfViewerElem.on('scroll', function (ev) {
                            if (scope.pdf === null || pages === null) return null;
                            var scrollTop = pdfViewerElem.scrollTop();

                            for (var i = 1; i <= pages.length; i++) {
                                var obj = $(pages[i - 1]);
                                if (obj.hasClass('loadCompleted') || obj.hasClass('is-loading')) continue;

                                var distanceTop = obj[0].offsetTop - viewH;
                                if (scrollTop >= distanceTop) {

                                    obj.addClass('is-loading');
                                    scope.pdf.getPage(i).then(function (page) {

                                        if (scope.page === null) {
                                            scope.page = page;
                                        }

                                        var index = page.pageIndex;
                                        var currentPage = $(pages[index]);
                                        currentPage.removeClass('is-loading');
                                        currentPage.addClass('loadCompleted');

                                        pages[index].page = page;
                                        var viewport = page.getViewport(currentScale);

                                        if (!currentPage.hasClass('hasLoadedWH')) {
                                            pages.css({
                                                'width': viewport.width,
                                                'height': viewport.height + pageHeight
                                            });
                                            pages.addClass('hasLoadedWH');
                                        }

                                        var canvas = elem.find('#page' + (index + 1))[0];
                                        var context = canvas.getContext('2d');

                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;

                                        var renderContext = {
                                            canvasContext: context,
                                            viewport: viewport
                                        };
                                        page.render(renderContext);
                                    });
                                }

                            }


                        });
                    }
                }
            }
        }

    ]);