'use strict';
/**
 * Created by panma on 9/22/15.
 */
angular.module('dalockrAppV2App')
    .directive('assetStatsRegion',[
        'dalockrServices',
        function(dalockrServices){
        return {
            restrict: 'E',
            templateUrl: 'views/directives/asset/asset-stats-region.html',
            replace:true,
            scope:{
              assetId:'='
            },
            link:function(scope,element){

                scope.loadingDailyStats = true;
                scope.viewType = 'views';
                scope.isChangeDate = false;
                scope.totalNum = 0;
                scope.canDisplayData = true;
                //scope.loadingMap = true;
                scope.currentDateRange = {
                    startDate:null,
                    endDate:null
                };
                var socialChannelData = null;

                scope.$on('switchImageAsset',function(event,value){
                    scope.currentDateRange = {
                        startDate:null,
                        endDate:null
                    };
                    loadData();
                });
                loadData();
                function loadData(){
                    dalockrServices.getNumberOfCommentsAndViewsPerDayForAssetOrLockrOnSocialChannels(scope.currentDateRange,scope.assetId, function(d){
                        scope.loadingDailyStats = false;
                        if(d.rows.length === 0){
                            scope.canDisplayData = false;
                            return;
                        }

                        socialChannelData = d;
                        var startTime = getDate(d.rows[0][0]).split('.');
                        var endTime = getDate(d.rows[d.rows.length-1][0]).split('.');
                        startTime = new Date(
                            startTime[2],
                            startTime[1]-1,
                            startTime[0]);
                        endTime = new Date(
                            endTime[2],
                            endTime[1]-1,
                            endTime[0]);
                        scope.currentDateRange = {
                            startDate:startTime,
                            endDate:endTime
                        };

                        filterNvdDate(scope.viewType, d , false);

                    },function(error){});
                }

                //function getMapInfo(){
                //    dalockrServices.getPublicAssetViewsPerCountry(scope.currentDateRange, function(data){
                //
                //        scope.loadingMap = false;
                //
                //        var markers = [];
                //        var numList = [];
                //
                //        angular.forEach(data.rows,function(value,key){
                //
                //            var mapInfo = null;
                //            var num = null;
                //            var countries = angular.copy(jvmCountries);
                //
                //            angular.forEach(countries,function(v,k){
                //                if(value[2] === k){
                //                    v.latLng = v.coords;
                //                    delete v.coords;
                //                    mapInfo = v;
                //                    num = value[1];
                //                }
                //            });
                //
                //            if(mapInfo){
                //                mapInfo.style = {
                //                    fill: '#33b5e5', stroke: false
                //                };
                //                numList.push(num);
                //                markers.push(mapInfo);
                //            }
                //
                //
                //        });
                //
                //        //console.log(numList);
                //
                //        var map = element.find('#asset-social-world-map');
                //        map.empty();
                //
                //        map.vectorMap({
                //            map: 'world_mill_en',
                //            scaleColors: ['#C8EEFF', '#0071A4'],
                //            normalizeFunction: 'polynomial',
                //            hoverOpacity: 0.7,
                //            hoverColor: false,
                //            markerStyle: {
                //                initial: {
                //                    fill: 'red',
                //                    stroke: 'none',
                //                    r:15
                //                },
                //                hover:{
                //                    stroke:'none'
                //                }
                //            },
                //            regionStyle:{
                //                initial:{
                //                    fill:'#ececec'
                //                },
                //                hover:{
                //                    fill:'#006fd5',
                //                    'fill-opacity':0.5
                //                }
                //            },
                //            backgroundColor: 'white',
                //            markers:markers,
                //            series:{
                //                markers:[{
                //                    attribute: 'r',
                //                    scale: [5, 15],
                //                    normalizeFunction: 'polynomial',
                //                    values:numList
                //                }]
                //            },
                //            onMarkerTipShow: function(event, label, index){
                //                label.css({'background':'#0071A4','boxShdow':'none','border':'none'});
                //                label.html(
                //                    '<b>'+ markers[index].name + '  ' + numList[index] +'</b>'
                //                );
                //            }
                //
                //        });
                //
                //    },function(error){
                //        scope.loadingMap = false;
                //    });
                //}
                var lastClick = scope.viewType;
                scope.changeViewMode = function(type){
                    if(type !== lastClick){
                        if(type === 'views'){
                            scope.viewType = 'views';
                        } else {
                            scope.viewType = 'comments';
                        }
                        if(socialChannelData !== null){
                            filterNvdDate(scope.viewType,socialChannelData,true);
                        }
                        lastClick = type;
                    }
                };

                scope.updateData = function() {
                    scope.isChangeDate = true;

                };

                scope.updateAllData = function(){

                    scope.isLoading = true;
                    scope.loadingDailyStats = true;
                    scope.loaddingMapInfo = true;

                    //getMapInfo();
                    loadData();

                    scope.isChangeDate = false;

                };


                function filterNvdDate(type,d,isUpdate){
                    var cursorList = [];
                    var chartAllData = {
                        labels:null,
                        datasets:[]
                    };
                    var labels = [];


                    scope.iconList = [];

                    for(var i=0; i< d.columns.length; i++){
                        var v1 = d.columns[i];

                        var cname;

                        if(v1 === 'defaultComments' || v1 === 'defaultViews' || v1 === 'date'){
                            continue;
                        }

                        if (type === 'views') {

                            if (v1.match(/Views$/)) {
                                cname = v1.substring(0, v1.length - 5);
                                cursorList.push({'value': cname, 'key': i});

                                if(cname.toLowerCase()==='dalockr'){
                                    scope.iconList.push('dl-dalockr');
                                } else if(cname.toLowerCase() === 'facebook'){
                                    scope.iconList.push('mdi-facebook');
                                } else if(cname.toLowerCase() === 'twitter'){
                                    scope.iconList.push('mdi-twitter');
                                } else if(cname.toLowerCase() === 'google'){
                                    scope.iconList.push('mdi-google');
                                } else if(cname.toLowerCase() === 'youtube'){
                                    scope.iconList.push('mdi-youtube-play');
                                } else if(cname.toLowerCase() === 'linkedin'){
                                    scope.iconList.push('mdi-linkedin');
                                }
                            }

                        } else {

                            if (v1.match(/Comments$/)) {
                                cname = v1.substring(0, v1.length - 8);
                                cursorList.push({'value': cname, 'key': i});


                                if(cname.toLowerCase()==='dalockr'){
                                    scope.iconList.push('dl-dalockr');
                                } else if(cname.toLowerCase() === 'facebook'){
                                    scope.iconList.push('mdi-facebook');
                                } else if(cname.toLowerCase() === 'twitter'){
                                    scope.iconList.push('mdi-twitter');
                                } else if(cname.toLowerCase() === 'google'){
                                    scope.iconList.push('mdi-google');
                                } else if(cname.toLowerCase() === 'youtube'){
                                    scope.iconList.push('mdi-youtube-play');
                                } else if(cname.toLowerCase() === 'linkedin'){
                                    scope.iconList.push('mdi-linkedin');
                                }

                            }

                        }




                    }


                    angular.forEach(d.rows, function (v3, k3) {
                        var date = getDate(v3[0]);
                        labels.push(date);

                    });
                    if(chartAllData.labels === null){
                        chartAllData.labels = labels;
                    }

                    var totalNum = 0;

                    angular.forEach(cursorList, function (v2, k2) {

                        var values = [];
                        angular.forEach(d.rows, function (v3, k3) {
                            totalNum += v3[v2.key];
                            values.push([v3[v2.key]]);
                        });

                        var fillValue = null;
                        var strokeValue = null;

                        if(v2.value.toLowerCase()==='dalockr'){
                            fillValue = 'rgba(51,181,229,0.3)';
                            strokeValue = 'rgba(51,181,229,1)';
                        } else if(v2.value.toLowerCase() === 'facebook'){
                            fillValue = 'rgba(252,240,243,1)';
                            strokeValue =  'rgba(208,10,27,1)';
                        } else if(v2.value.toLowerCase() === 'twitter'){
                            fillValue = 'rgba(227,245,252,1)';
                            strokeValue =  'rgba(51,181,229,1)';
                        }

                        var viewData = {
                            label: v2.value,
                            fillColor: fillValue,
                            strokeColor: strokeValue,
                            strokeWidth:5,
                            pointColor: strokeValue,
                            pointStrokeColor: strokeValue,
                            pointHighlightFill: strokeValue,
                            pointHighlightStroke: strokeValue,
                            data: values
                        };
                        chartAllData.datasets.push(viewData);
                    });

                    scope.totalNum = totalNum;
                    startDraw(chartAllData);
                }



                function getDate(str){

                    var y = parseInt(str.substring(0,4));
                    var m = parseInt(str.substring(4,6));
                    var d = parseInt(str.substring(6,8));

                    return d + '.' + m + '.' + y;
                }

                var options= {
                    ///Boolean - Whether grid lines are shown across the chart
                    scaleShowGridLines : false,

                    //String - Colour of the grid lines
                    scaleGridLineColor : "rgba(0,0,0,.05)",

                    //Number - Width of the grid lines
                    scaleGridLineWidth : 1,

                    showScale:false,

                    //Boolean - Whether to show horizontal lines (except X axis)
                    scaleShowHorizontalLines: true,

                    //Boolean - Whether to show vertical lines (except Y axis)
                    scaleShowVerticalLines: false,

                    //Boolean - Whether the line is curved between points
                    bezierCurve : true,

                    //Number - Tension of the bezier curve between points
                    bezierCurveTension : 0.4,

                    //Boolean - Whether to show a dot for each point
                    pointDot : false,

                    //Number - Radius of each point dot in pixels
                    pointDotRadius : 1,

                    //Number - Pixel width of point dot stroke
                    pointDotStrokeWidth : 1,

                    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
                    pointHitDetectionRadius : 20,

                    //Boolean - Whether to show a stroke for datasets
                    datasetStroke : true,

                    scaleBeginAtZero:true,

                    //Number - Pixel width of dataset stroke
                    datasetStrokeWidth : 3,

                    //Boolean - Whether to fill the dataset with a colour
                    datasetFill : true,
                    showTooltips:true,
                    tooltipCornerRadius:3,

                    tooltipFillColor:"rgba(0,0,0,0.5)",
                    //String - A legend template
                    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\" style='background-color: #c1e2b3;'><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
                };


                var myChart;
                var ctx;
                function startDraw(data){

                    options.pointDot = data.datasets[0].data.length <= 1;

                    var canvasWrapper = angular.element('#assetCanvasWrapper');
                    var canvasH =  canvasWrapper.innerHeight();
                    var canvasW = canvasWrapper.innerWidth();

                    $('#myChartView').replaceWith('<canvas id="myChartView" width="' + canvasW +'" height="' + canvasH +'"></canvas>');

                    if(!data.datasets.length){
                        return;
                    }

                    ctx = document.getElementById("myChartView").getContext("2d");
                    myChart = new Chart(ctx).Line(data, options);

                    window.onresize = function(){
                        canvasH =  canvasWrapper.innerHeight();
                        canvasW = canvasWrapper.innerWidth();

                        $('#myChartView').replaceWith('<canvas id="myChartView" width="' + canvasW +'" height="' + canvasH +'"></canvas>');


                        ctx = document.getElementById("myChartView").getContext("2d");
                        myChart = new Chart(ctx).Line(data, options);


                    };
                }



                //init dateRange
                var myDate  = new Date();
                scope.todayDate = new Date(
                    myDate.getFullYear(),
                    myDate.getMonth(),
                    myDate.getDate());

                scope.currentDateRange = {
                    startDate:scope.todayDate,
                    endDate:scope.todayDate
                };


            }
        }
    }]);