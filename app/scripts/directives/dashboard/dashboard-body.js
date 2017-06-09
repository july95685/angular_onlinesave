(function () {

    'use strict';


    var dashStats = {
        totalViews:{
            icon:'mdi-eye',
            text:0,
            percent:false,
            desc:"Total Views"
        },
        conversationRate:{
            icon:'dal-icon-conversation_rate_black',
            text:0,
            percent:true,
            desc:'Conversation rate'
        },
        applauseRate:{
            icon:'dalello-icon-applause_rate_black',
            text:0,
            percent:true,
            desc:'Applause rate'
        },
        amplificationRate:{
            icon:'dal-icon-amplification_rate_black',
            text:0,
            percent:true,
            desc:'Amplification rate'
        },
        totalShares:{
            icon:'dal-icon-total_shares_black',
            text:0,
            percent:false,
            desc:"Total Shares"
        },
        totalLikes:{
            icon:'dal-icon-total_likes_black',
            text:0,
            percent:false,
            desc:"Total Likes"
        },
        positivePercentage:{
            icon:'dal-icon-happy_black',
            text:0,
            percent:true,
            desc:"Positive rating"
        },
        negativePercentage:{
            icon:'dal-icon-sad_black',
            text:0,
            percent:true,
            desc:"Negative rating"
        }
    };


    angular.module('dalockrAppV2App')
        .directive('dashboardBody', ['dalockrServices','commonServices','$sessionStorage','$rootScope','userRightServices','$location','userServices','$timeout','$dalMedia','entityStatsService','dateSettingService',function(dalockrServices, commonServices,$sessionStorage,$rootScope, userRightServices,$location,userServices,$timeout,$dalMedia,entityStatsService,dateSettingService) {

            return {
                restrict: 'EA',
                templateUrl: function () {
                    if($dalMedia('xs')){
                        return 'views/directives/dashboard/mobile/dashboard-body.html';
                    } else {
                        return 'views/directives/dashboard/dashboard-body.html';
                    }
                },

                link:function(scope,element){

                    var defaultReg = { //模式匹配
                        0:'Views',
                        1:'ReShares',
                        2:'Likes',
                        3:'Comments'
                    };

                    scope.lockrSeeNumber = 3;
                    scope.assetSeeNumber = 3;
                    scope.hiddenAssetsSeeMore = false;
                    scope.hiddenLockrsSeeMore = false;
                    scope.currentDateRange = null;
                    scope.canChangeDate = false;
                    scope.viewType = 'views';
                    scope.currentAccount = null; //= angular.copy(commonServices.accountId()
                    scope.allAccounts = [];
                    scope.isAccountManager = false;
                    scope.seriesData = {
                        labels:[],
                        views:{},
                        comments:{}
                    };




                    var commonCalc = {
                        totalNumberOfViews:function(d,cName){
                            return d['numberOf' + cName + 'Views'] || 0;
                        },
                        conversationRate:function(d,cName){
                            if ((d['numberOf' + cName + 'Shares'] || 0) == 0 ) return 0 + '%';
                            return (((d['numberOf' + cName + 'Commnets'] || 0) / d['numberOf' + cName + 'Shares'])*100).toFixed(0) + '%';
                        },
                        applauseRate:function(d,cName){
                            if ((d['numberOf' + cName + 'Shares'] || 0) == 0 ) return 0 + '%';
                            return (((d['numberOf' + cName + 'Likes'] || 0) / d['numberOf' + cName + 'Shares'])*100).toFixed(0) + '%';
                        },
                        amplificationRate:function(d,cName){
                            if ((d['numberOf' + cName + 'Shares'] || 0)== 0 ) return 0 + '%';
                            return (((d['numberOf' + cName + 'ReShares'] || 0) / d['numberOf' + cName + 'Shares'])*100).toFixed(0) + '%';
                        },
                        totalNumberOfShares:function(d,cName){
                            return (d['numberOf' + cName + 'ReShares'] || 0) + (d['numberOf' + cName + 'Shares'] || 0);
                        },
                        totalNumberOfLikes:function(d,cName){
                            return d['numberOf' + cName + 'Likes'] || 0;
                        }
                    };

                    scope.viewSetting = {
                        mode:{
                              totalNumberOfViews:{
                                    icon:'mdi-eye',
                                    text:0,
                                    percent:false,
                                    desc:"Total Views"
                                },
                                conversationRate:{
                                    icon:'dal-icon-conversation_rate_black',
                                    text:0,
                                    percent:true,
                                    desc:'Conversation rate'
                                },
                                applauseRate:{
                                    icon:'dalello-icon-applause_rate_black',
                                    text:0,
                                    percent:true,
                                    desc:'Applause rate'
                                },
                                amplificationRate:{
                                    icon:'dal-icon-amplification_rate_black',
                                    text:0,
                                    percent:true,
                                    desc:'Amplification rate'
                                },
                                totalNumberOfShares:{
                                    icon:'dal-icon-total_shares_black',
                                    text:0,
                                    percent:false,
                                    desc:"Total Shares"
                                },
                                totalNumberOfLikes:{
                                    icon:'dal-icon-total_likes_black',
                                    text:0,
                                    percent:false,
                                    desc:"Total Likes"
                                }
                        },
                        channels:{
                            All:{
                                name:'All Channels',
                                icon:'dalello-icon-social_channels_black',
                                calc:{
                                    totalNumberOfViews:function(d){
                                        return d.totalNumberOfViews;
                                    },
                                    conversationRate:function(d){
                                        if (d.numberOfShares == 0 ) return 0 + '%';
                                        return ((d.totalNumberOfComments / d.numberOfShares)*100).toFixed(0) + '%';
                                    },
                                    applauseRate:function(d){
                                        if (d.numberOfShares == 0) return 0 + '%';
                                        return ((d.totalNumberOfLikes / d.numberOfShares)*100).toFixed(0) + '%';
                                    },
                                    amplificationRate:function(d){
                                        if (d.numberOfShares == 0) return 0 + '%';
                                        return ((d.totalNumberOfReShares/d.numberOfShares)*100).toFixed(0) + '%';
                                    },
                                    totalNumberOfShares:function(d){
                                        return  d.totalNumberOfReShares + d.numberOfShares;
                                    },
                                    totalNumberOfLikes:function(d){
                                        return d.totalNumberOfLikes;
                                    }
                                }
                            },
                            Evernote:{
                                name:'Evernote',
                                icon:commonServices.getIconClassByType('Evernote'),
                                calc:commonCalc
                            },
                            Facebook:{
                                name:'Facebook',
                                icon:commonServices.getIconClassByType('Facebook'),
                                calc:commonCalc
                            },
                            Twitter:{
                                name:'Twitter',
                                icon:commonServices.getIconClassByType('Twitter'),
                                calc:commonCalc
                            },
                            YouTube:{
                                name:'YouTube',
                                icon:commonServices.getIconClassByType('YouTube'),
                                calc:commonCalc
                            },
                            Pinterest:{
                                name:'Pinterest',
                                icon:commonServices.getIconClassByType('Pinterest'),
                                calc:commonCalc
                            },
                            LinkedIn:{
                                name:'LinkedIn',
                                icon:commonServices.getIconClassByType('LinkedIn'),
                                calc:commonCalc
                            },
                            Instagram:{
                                name:'Instagram',
                                icon:commonServices.getIconClassByType('Instagram'),
                                calc:commonCalc
                            }
                        }
                    };
                    scope.assetsView = {
                        activeMode:'totalNumberOfViews',
                        activeChannel:'All'
                    };
                    scope.lockrsView = {
                        activeMode:'totalNumberOfViews',
                        activeChannel:'All'
                    };



                    scope.dashStats = angular.copy(dashStats);

                    userServices.getUserProfileInfo(function (userInfo) {
                        scope.clusterName = userInfo.clusterId;
                        loadAccounts();
                    });

                    scope.isLoading = true;
                    scope.loadingDailyStats = true;
                    scope.loaddingMapInfo = true;
                    scope.isChangeDate = false;
                    scope.loadingMap = true;

                    scope.selectAccount = selectAccount;

                    var nvdData = null;
                    var isLoadLockrAndAsset = false;


                    function loadAccounts(){
                        var result;
                        if(result = commonServices.accounts()){
                            scope.allAccounts = result;
                            var aid = $location.search().aid;
                            scope.currentAccount = getAccountByAccountId(result,aid);
                            if(!aid){
                                $location.search('aid',scope.currentAccount.accountId);
                            }
                            $timeout(refreshData);
                        } else {
                            dalockrServices.getClustersLockr()
                                .then(function(response){
                                    var result = response.data;
                                    if(result.length === 0) return;

                                    for (var i = 0; i < result.length; i++) {
                                        var obj = result[i];
                                        obj.thumbnailUrl = dalockrServices.getThumbnailUrl('lockr',obj.id);
                                    }
                                    scope.allAccounts = result;
                                    commonServices.saveAccounts(result);

                                    var aid = $location.search().aid;
                                    scope.currentAccount = getAccountByAccountId(result,aid);
                                    if(!aid){
                                        $location.search('aid',scope.currentAccount.accountId);
                                    }

                                },function(){

                                });
                        }

                    }


                    function getAccountByAccountId(accounts,accountId){
                        for(var i= 0,len = accounts.length; i<len; i++){
                            accounts[i].active = false;
                            if(accounts[i].accountId == accountId){
                                accounts[i].active = true;
                                return accounts[i];
                            }
                        }
                        return accounts[0];
                    }



                    function selectAccount(index){
                        scope.currentAccount = getAccountByAccountId(index.accounts,index.aid);
                        $location.search('aid', index.aid);
                        commonServices.saveAccounts(index.accounts);
                    }


                    scope.$watch('currentAccount',function(newVal, oldVal){
                        if(newVal !== oldVal && newVal !== null){
                            refreshData();
                        }
                    });

                    function refreshData(){
                        scope.currentDateRange = null;
                        scope.updateAllData();
                        initDataRange();
                    }


                    function getUserDashboard(dateRange,accountId){
                        dalockrServices.getUserDashboard(dateRange,accountId,function(d){

                            //console.log(d);

                            scope.isLoading = false;
                            scope.lockrSeeNumber = 3;
                            scope.assetSeeNumber = 3;
                            scope.hiddenAssetsSeeMore = false;
                            scope.hiddenLockrsSeeMore = false;

                            setDashboard(d);

                        },function(){
                            //error
                            scope.isLoading = false;

                        });
                    }

                    scope.addSeeLockrNumber = function(){
                        scope.lockrSeeNumber += 5;

                        if(scope.lockrsData.length <= scope.lockrSeeNumber){
                            scope.hiddenLockrsSeeMore = true;
                        }
                    };


                    scope.addSeeAssetNumber = function(){
                        scope.assetSeeNumber += 5;
                        if(scope.assetsData.length <= scope.assetSeeNumber){
                            scope.hiddenAssetsSeeMore = true;
                        }
                    };




                    function setDashboard(d){

                        for(var key in scope.dashStats){

                            var tmp = 0;

                            if(d.hasOwnProperty(key)){
                                tmp = d[key];
                                if(/Percentage$/.test(key)){
                                    tmp = d[key] / 100;
                                }
                            }

                            if (d.totalNumberOfShares != 0) {
                                if (key == 'conversationRate') {
                                    tmp = d.totalNumberOfComments / d.totalNumberOfShares;
                                }
                                if (key == 'applauseRate') {
                                    tmp = d.totalLikes / d.totalNumberOfShares;
                                }
                                if (key == 'amplificationRate') {
                                    tmp = d.totalReShares/d.totalNumberOfShares;
                                }
                                if (key == 'totalShares') {
                                    tmp = d.totalReShares + d.totalNumberOfShares;
                                }
                            }

                          

                            scope.dashStats[key].text = tmp;

                        }


                        scope.topLockrData = null;
                        scope.topAssetData = null;

                        scope.totalLikes = d.totalLikes || 0;
                        scope.totalNumberOfComments = d.totalNumberOfComments || 0;
                        scope.totalNumberOfShares = d.totalNumberOfShares || 0;
                        scope.totalReShares = d.totalNumberOfShares || 0;
                        scope.totalViews = d.totalViews || 0;

                        scope.lockrsData = d.lockrsWithStats.map(function (val) {
                            val.thumbnail =  dalockrServices.getThumbnailUrl('lockr',val.lockrId);
                            return val;
                        });
                        scope.assetsData = d.assetsWithStats.map(function (val) {
                            val.thumbnail =  dalockrServices.getThumbnailUrl('asset',val.assetId);
                            return val;
                        });

                        scope.averageComments =   d.averageComments.toFixed(2);
                        scope.averageLikes = d.averageLikes.toFixed(2);
                        scope.averageReShares = d.averageReShares.toFixed(2);
                        scope.totalSentiment = d.totalSentiment.toFixed(1);


                        if(userRightServices.isCommunityManager()){
                            scope.totalViews = d.totalViews -10 || 0;
                            scope.totalNumberOfComments = d.totalNumberOfComments - 1 || 0;
                            scope.totalLikes = d.totalLikes - 1|| 0;
                        }

                        if(scope.lockrsData.length <= scope.lockrSeeNumber){
                            scope.hiddenLockrsSeeMore = true;
                        }
                        if(scope.assetsData.length <= scope.assetSeeNumber){
                            scope.hiddenAssetsSeeMore = true;
                        }

                        if(scope.lockrsData.length){
                            scope.topLockrData = angular.copy(scope.lockrsData).shift();
                            scope.topLockrData.imageSrc = dalockrServices.getThumbnailUrl('lockr',scope.topLockrData.lockrId);
                        }
                        if(scope.assetsData.length){
                            scope.topAssetData = angular.copy(scope.assetsData).shift();
                            scope.topAssetData.imageSrc = dalockrServices.getThumbnailUrl('asset',scope.topAssetData.assetId);
                        }

                    }





                    function getViewsAndCommentsPerDay(date,type) {

                        dalockrServices.getNumberOfCommentsAndViewsPerDayOnSocialChannels(date,scope.currentAccount.accountId,function (d) {

                            scope.loadingDailyStats = false;
                            nvdData = d;

                            if(d.rows.length && d.columns.length) {
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
                            }

                            scope.seriesData = formatStatsData(d);

                        }, function () {
                            scope.loadingDailyStats = false;
                        });

                    }


                    scope.$on('$$ChangeAccountOfMobile', function (ev,account) {
                        scope.currentAccount = account;
                        refreshData();
                    });





                    //var lastClick = scope.viewType;
                    //scope.changeViewMode = function(type){
                    //
                    //    if(type !== lastClick){
                    //        if(type === 'views'){
                    //            scope.viewType = 'views';
                    //        } else {
                    //            scope.viewType = 'comments';
                    //        }
                    //        //if(nvdData !== null){
                    //        //
                    //        //    filterNvdDate(scope.viewType,nvdData,true);
                    //        //    startDraw(chartAllData);
                    //        //
                    //        //}
                    //        lastClick = type;
                    //    }
                    //};

                    scope.switchToPerformace = function(){
                        if(!isLoadLockrAndAsset){
                            loadingLockrAndAssetDetails();
                        }
                    };
                    function loadingLockrAndAssetDetails(){

                        if(scope.topLockrData) {

                            dalockrServices.getLockrDetails(scope.topLockrData.lockrId).then(function (response) {

                                var data = response.data;

                                scope.topLockrDetails = data;
                                scope.topLockrSocialView = commonServices.getSocialChannelViewNum(data.links);
                                scope.topLockrSentiment = scope.topLockrData.sentiment.toFixed(1);


                                var len = data.links.length;
                                scope.topLockrSocialChannelPenetration = {
                                    'shares':((scope.topLockrData.numberOfShares || 0 ) / len).toFixed(2),
                                    'likes':((scope.topLockrData.totalNumberOfLikes || 0 ) / len).toFixed(2),
                                    'comments':((scope.topLockrData.totalNumberOfComments || 0 ) / len).toFixed(2)
                                };
                            });
                        }

                        if(scope.topAssetData){
                            dalockrServices.getAssetDetails(scope.topAssetData.assetId,function(data){
                                scope.topAssetDetails = data;
                                scope.topAssetSentiment = scope.topAssetData.sentiment.toFixed(1);

                                var len = data.links.length;

                                scope.topAssetSocialView = commonServices.getSocialChannelViewNum(data.links);

                                scope.topAssetSocialChannelPenetration = {
                                    'shares':((scope.topAssetData.numberOfShares || 0) / len).toFixed(2),
                                    'likes':((scope.topAssetData.totalNumberOfLikes || 0) / len).toFixed(2),
                                    'comments':((scope.topAssetData.totalNumberOfComments || 0) / len).toFixed(2)
                                };

                                scope.$apply();
                            });
                        }
                    }









                    scope.isChangeDate = false;
                    scope.updateData = function() {
                        scope.isChangeDate = true;
                    };

                    scope.updateAllData = function(){

                        scope.isLoading = true;
                        scope.loadingDailyStats = true;
                        scope.loaddingMapInfo = true;

                        getUserDashboard(scope.currentDateRange,scope.currentAccount.accountId);
                        getMapInfo(scope.currentDateRange);
                        getViewsAndCommentsPerDay(scope.currentDateRange,scope.viewType);

                        scope.isChangeDate = false;

                    };






                    function getMapInfo(date){
                        dalockrServices.getPublicAssetViewsPerCountry(date,scope.currentAccount.accountId, function(data){

                            scope.loadingMap = false;

                            var markers = [];
                            var numList = [];

                            angular.forEach(data.rows,function(value,key){

                                var mapInfo = null;
                                var num = null;
                                var countries = angular.copy(jvmCountries);

                                angular.forEach(countries,function(v,k){
                                    if(value[2] === k){
                                        v.latLng = v.coords;
                                        delete v.coords;
                                        mapInfo = v;
                                        num = value[1];
                                    }
                                });

                                if(mapInfo){
                                    mapInfo.style = {
                                        fill: '#33b5e5', stroke: false
                                    };
                                    numList.push(num);
                                    markers.push(mapInfo);
                                }


                            });


                            var max = Math.max.apply(null, numList);
                            var min = Math.min.apply(null, numList);


                            var map = element.find('#social-world-map');
                            map.empty();

                            map.vectorMap({
                                map: 'world_mill_en',
                                scaleColors: ['#C8EEFF', '#0071A4'],
                                normalizeFunction: 'polynomial',
                                hoverOpacity: 0.7,
                                hoverColor: false,
                                markerStyle: {
                                    initial: {
                                        fill: 'red',
                                        stroke: 'none',
                                        r:15
                                    },
                                    hover:{
                                        stroke:'none'
                                    }
                                },
                                regionStyle:{
                                    initial:{
                                        fill:'#ececec'
                                    },
                                    hover:{
                                        fill:'#006fd5',
                                        'fill-opacity':0.5
                                    }
                                },
                                backgroundColor: 'white',
                                markers:markers,
                                //labels:{
                                //    markers:{
                                //        render: function (index) {
                                //            return numList[index];
                                //
                                //        },
                                //        offsets: function (index, marker) {
                                //            var num = numList[index];
                                //            var r = ((( min / max ) * num) / ( 5/15)).toFixed(0);
                                //            r = r > 15 ? 15 : r;
                                //            var fontW = ((num + '').length * 12) / 2;
                                //
                                //
                                //            //console.log('fontW',fontW);
                                //
                                //            return [-5-r-fontW,0];
                                //        }
                                //    }
                                //},
                                markerLabelStyle:{
                                    initial: {
                                        'font-family': 'Verdana',
                                        'font-size': '12',
                                        'font-weight': 'bold',
                                        cursor: 'default',
                                        fill: 'white'
                                    },
                                    hover: {
                                        cursor: 'pointer'
                                    }
                                },
                                series:{
                                    markers:[{
                                        attribute: 'r',
                                        scale: [5, 15],
                                        normalizeFunction: 'polynomial',
                                        values:numList
                                    }
                                    ]
                                },
                                onMarkerTipShow: function(event, label, index){
                                    label.css({'background':'#0071A4','boxShdow':'none','border':'none'});
                                    label.html(
                                        '<b>'+ markers[index].name + '  ' + numList[index] +'</b>'
                                    );
                                }
                            });

                        },function(error){
                            scope.loadingMap = false;
                        });
                    }


                    function initDataRange(){
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







                    scope.enterEntityStatsDisplay = function (ev,displayEntity,entityType) {
                        entityStatsService.open(displayEntity,entityType);
                    };

                    scope.openDateSetting = function () {
                        dateSettingService.open(scope.currentDateRange, function (range,compareToDateRange) {
                            scope.currentDateRange = range;
                            scope.updateAllData();
                            scope.compareToDateRange = compareToDateRange;
                            if (scope.compareToDateRange) {
                                getComparedDashboard(scope.compareToDateRange);
                            }
                        },true);
                    };


                    function getComparedDashboard(dateRange) {
                        dalockrServices.getUserDashboard(dateRange,scope.currentAccount.accountId,function(d){
                            scope.comparedLockrsData = d.lockrsWithStats;
                            scope.comparedAssetsData = d.assetsWithStats;
                        },function(){});
                    }



                    scope.comparedStatsOfEntity = function(type,currentEntity,comparedList){
                        if (!comparedList) return {};
                        var idx = type + 'Id',
                            willCompare;
                        for (var i = comparedList.length - 1; i >= 0; i--) {
                            willCompare = comparedList[i];
                            if (willCompare[idx] == currentEntity[idx]) break;
                        }
                        return willCompare;
                    }

                }
            };
        }])
        //时间选择服务
        .service('dateSettingService',['$mdDialog','$mdpDatePicker',function ($mdDialog,$mdpDatePicker) {


            this.open = function (initDateRange,selectedCb,isCompareTo) {

                $mdDialog.show({
                    skipHide:true,
                    templateUrl: 'views/mobile/date-setting-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose:false,
                    fullscreen:true,
                    controller: function($scope) {

                        $scope.hide = function (isRefresh) {
                            var time,
                                compareTime,
                                willCompare = $scope.compareTo.custom;

                            if(isRefresh){
                                switch ($scope.selectedTab){
                                    case 0:
                                        willCompare = $scope.compareTo.day;
                                        if (willCompare) {
                                            compareTime = $scope.timeList[$scope.compareSelection.day];
                                        }
                                        time = $scope.timeList[$scope.selection.day];
                                        break;
                                    case 1:
                                        willCompare = $scope.compareTo.week;
                                        if (willCompare) {
                                            compareTime = $scope.timeList[$scope.compareSelection.week];
                                        }
                                        time = $scope.timeList[$scope.selection.week];
                                        break;
                                    case 2:
                                        willCompare = $scope.compareTo.month;
                                        if (willCompare) {
                                            compareTime = $scope.timeList[$scope.compareSelection.month];
                                        }
                                        time = $scope.timeList[$scope.selection.month];
                                        break;
                                }
                                if(time){
                                    $scope.currentDateRange = {
                                        startDate:time.start,
                                        endDate:time.end
                                    };
                                }
                                if (compareTime) {
                                    $scope.compareDateRange = {
                                        startDate:compareTime.start,
                                        endDate:compareTime.end
                                    };
                                }
                                if (selectedCb) {
                                    if (willCompare) {
                                        selectedCb($scope.currentDateRange,$scope.compareDateRange);
                                    } else {
                                        selectedCb($scope.currentDateRange);
                                    }
                                    
                                }
                            }
                            $mdDialog.hide();
                        };

                        $scope.currentDateRange = initDateRange;
                        $scope.compareDateRange = angular.copy(initDateRange);
                        $scope.selectedTab = 0;
                        $scope.isCompareTo = isCompareTo;

                        $scope.selection = {
                            day:'today',
                            week:'last7days',
                            month:'last30days'
                        };
                        $scope.compareSelection = {
                            day:'yesterday',
                            week:'previousweek',
                            month:'thismonth'
                        };


                        $scope.compareTo = {
                            day:false,
                            week:false,
                            month:false,
                            custom:false
                        }

                        var today = new Date();
                        $scope.timeList = {
                            today:{
                                start:today,
                                end:today
                            },
                            yesterday:{
                                start:new Date(moment().subtract(1, 'days')),
                                end:new Date(moment().subtract(1, 'days'))
                            },
                            last7days:{
                                start:new Date(moment().subtract(7, 'days')),
                                end:today
                            },
                            thisweek:{
                                start:new Date(moment().startOf('week')),
                                end:today
                            },
                            lastweek:{
                                start:new Date(moment().startOf('week').subtract(1,'weeks')),
                                end:new Date(moment().startOf('week').subtract(1,'days'))
                            },
                            previousweek:{
                                start:new Date(moment().startOf('week').subtract(1,'weeks')),
                                end:new Date(moment().startOf('week').subtract(1,'days'))
                            },
                            fourweeksago:{
                                start:new Date(moment().subtract(28, 'days')),
                                end:today
                            },
                            onemonthago:{
                                start:new Date(moment().subtract(30, 'days')),
                                end:today
                            },
                            last30days:{
                                start:new Date(moment().subtract(30, 'days')),
                                end:today
                            },
                            thismonth:{
                                start:new Date(moment().startOf('month')),
                                end:today
                            },
                            lastmonth:{
                                start:new Date(moment().startOf('month').subtract(1,'months')),
                                end:new Date(moment().startOf('month').subtract(1,'days'))
                            }
                        };




                        $scope.selectStartDate = function (ev,isCompare) {
                            if (isCompare) {
                                $mdpDatePicker($scope.compareDateRange.startDate, {
                                    targetEvent: ev
                                }).then(function(selectedDate) {
                                    console.log(selectedDate);
                                    $scope.compareDateRange.startDate = selectedDate;
                                });   
                            } else {
                                $mdpDatePicker($scope.currentDateRange.startDate, {
                                    targetEvent: ev
                                }).then(function(selectedDate) {
                                    $scope.currentDateRange.startDate = selectedDate;
                                });                                
                            }

                        };

                        $scope.selectEndDate = function (ev,isCompare) {
                            if (isCompare) {
                                $mdpDatePicker($scope.compareDateRange.endDate, {
                                    targetEvent: ev
                                }).then(function(selectedDate) {
                                    $scope.compareDateRange.endDate = selectedDate;
                                });
                            } else {
                                $mdpDatePicker($scope.currentDateRange.endDate, {
                                    targetEvent: ev
                                }).then(function(selectedDate) {
                                    $scope.currentDateRange.endDate = selectedDate;
                                });                                
                            }

                        };
                    }
                });

            }


        }])


        //asset 或 locker 的stats服务
        .service('entityStatsService',['$mdDialog','dateSettingService','commonServices','dalockrServices',function ($mdDialog,dateSettingService,commonServices,dalockrServices) {
            this.open = function (entity,type) {
                $mdDialog.show({
                    skipHide:true,
                    templateUrl: 'views/mobile/entity-stats-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose:false,
                    fullscreen:true,
                    controller: function ($scope) {
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.entityType = type;
                        $scope.displayEntity = entity;
                        $scope.isLoading = true;

                        var currentDateRange = null;

                        $scope.openDateSetting = function () {
                            dateSettingService.open(currentDateRange || {startDate:new Date(),endDate:new Date()}, function (range) {
                                currentDateRange = range;
                                getChartData();
                                getStatsForEntity();
                            });
                        };

                        $scope.switchViewMode = function (key) {
                            $scope.currentChannelKey = key;
                        };


                        $scope.dashStats = {
                                totalNumberOfViews:{
                                    icon:'mdi-eye',
                                    text:0,
                                    percent:false,
                                    desc:"Total Views"
                                },
                                conversationRate:{
                                    icon:'dal-icon-conversation_rate_black',
                                    text:0,
                                    percent:true,
                                    desc:'Conversation rate'
                                },
                                applauseRate:{
                                    icon:'dalello-icon-applause_rate_black',
                                    text:0,
                                    percent:true,
                                    desc:'Applause rate'
                                },
                                amplificationRate:{
                                    icon:'dal-icon-amplification_rate_black',
                                    text:0,
                                    percent:true,
                                    desc:'Amplification rate'
                                },
                                totalNumberOfShares:{
                                    icon:'dal-icon-total_shares_black',
                                    text:0,
                                    percent:false,
                                    desc:"Total Shares"
                                },
                                totalNumberOfLikes:{
                                    icon:'dal-icon-total_likes_black',
                                    text:0,
                                    percent:false,
                                    desc:"Total Likes"
                                }
                        };


                        getChartData();
                        getStatsForEntity();

                        function getChartData(){
                            dalockrServices.getNumberOfCommentsAndViewsPerDayForAssetOrLockrOnSocialChannels(currentDateRange,entity[type + 'Id'], function (d) {
                                if(d.rows.length && d.columns.length) {
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
                                    currentDateRange = {
                                        startDate:startTime,
                                        endDate:endTime
                                    };
                                }
                                $scope.seriesData = formatStatsData(d);

                            }, function () {

                            });
                        }

                        function getStatsForEntity(){
                            $scope.isLoading = true;
                            dalockrServices.getEntityStats(currentDateRange,type,entity[type + 'Id'])
                                .success(function (d) {
                                    $scope.dashData = d;
                                    $scope.isLoading = false;
                                })
                                .error(function (error) {
                                    $scope.isLoading = false;
                                });
                        }



                        $scope.currentChannelKey = 0;
                        var commonCalc = { //除了Twitter和总量，其它的channel通用此计算方式
                            totalNumberOfViews:function(d){
                                var cName = $scope.channels[$scope.currentChannelKey].name;
                                return d['numberOf' + cName + 'Views'] || 0;
                            },
                            conversationRate:function(d){
                                var cName = $scope.channels[$scope.currentChannelKey].name;
                                if ((d['numberOf' + cName + 'Shares'] || 0) == 0 ) return 0;
                                return (d['numberOf' + cName + 'Commnets'] || 0) / d['numberOf' + cName + 'Shares'];
                            },
                            applauseRate:function(d){
                                var cName = $scope.channels[$scope.currentChannelKey].name;
                                if ((d['numberOf' + cName + 'Shares'] || 0) == 0 ) return 0;

                                return (d['numberOf' + cName + 'Likes'] || 0) / d['numberOf' + cName + 'Shares'];
                            },
                            amplificationRate:function(d){
                                var cName = $scope.channels[$scope.currentChannelKey].name;
                                if ((d['numberOf' + cName + 'Shares'] || 0)== 0 ) return 0;
                                return (d['numberOf' + cName + 'ReShares'] || 0) / d['numberOf' + cName + 'Shares'];
                            },
                            totalNumberOfShares:function(d){
                                var cName = $scope.channels[$scope.currentChannelKey].name;
                                return (d['numberOf' + cName + 'ReShares'] || 0) + (d['numberOf' + cName + 'Shares'] || 0);
                            },
                            totalNumberOfLikes:function(d){
                                var cName = $scope.channels[$scope.currentChannelKey].name;
                                return d['numberOf' + cName + 'Likes'] || 0;
                            }
                        };
                        $scope.channels = {
                            0:{
                                name:'All Channels',
                                icon:'dalello-icon-social_channels_black',
                                calc:{
                                    totalNumberOfViews:function(d){
                                        return d.totalNumberOfViews;
                                    },
                                    conversationRate:function(d){
                                        if (d.numberOfShares == 0 ) return 0;
                                        return d.totalNumberOfComments / d.numberOfShares;
                                    },
                                    applauseRate:function(d){
                                        if (d.numberOfShares == 0) return 0;
                                        return d.totalNumberOfLikes / d.numberOfShares;
                                    },
                                    amplificationRate:function(d){
                                        if (d.numberOfShares == 0) return 0;
                                        return d.totalNumberOfReShares/d.numberOfShares;
                                    },
                                    totalNumberOfShares:function(d){
                                        return  d.totalNumberOfReShares + d.numberOfShares;
                                    },
                                    totalNumberOfLikes:function(d){
                                        return d.totalNumberOfLikes;
                                    }
                                }
                            },
                            1:{
                                name:'Evernote',
                                icon:commonServices.getIconClassByType('Evernote'),
                                prefix:'numberOfEvernote',
                                calc:commonCalc
                            },
                            2:{
                                name:'Facebook',
                                icon:commonServices.getIconClassByType('Facebook'),
                                prefix:'numberOfFacebook',
                                calc:commonCalc
                            },
                            3:{
                                name:'Twitter',
                                icon:commonServices.getIconClassByType('Twitter'),
                                prefix:'numberOfTwitter',
                                calc:commonCalc
                            },
                            4:{
                                name:'YouTube',
                                icon:commonServices.getIconClassByType('YouTube'),
                                prefix:'numberOfYouTube',
                                calc:commonCalc
                            },
                            5:{
                                name:'Pinterest',
                                icon:commonServices.getIconClassByType('Pinterest'),
                                prefix:'numberOfPinterest',
                                calc:commonCalc
                            },
                            6:{
                                name:'LinkedIn',
                                icon:commonServices.getIconClassByType('LinkedIn'),
                                prefix:'numberOfLinkedIn',
                                calc:commonCalc
                            },
                            7:{
                                name:'Instagram',
                                icon:commonServices.getIconClassByType('Instagram'),
                                prefix:'numberOfInstagram',
                                calc:commonCalc
                            }
                        }

                    }
                });
            }
        }]);





    function getDate(str){
        var y = parseInt(str.substring(0,4));
        var m = parseInt(str.substring(4,6));
        var d = parseInt(str.substring(6,8));

        return d + '.' + m + '.' + y;
    }


    function formatStatsData(d){

        var seriesData = {
            labels:[],
            views:{},
            comments:{}
        };

        var result;
        angular.forEach(d.columns, function (v1, index) {
            if(v1.match(/(.+)Views$/)){
                result = v1.match(/(.+)Views$/);
                angular.forEach(d.rows, function (v) {

                    var y = parseInt(v[0].substring(0,4));
                    var m = parseInt(v[0].substring(4,6));
                    var d = parseInt(v[0].substring(6,8));

                    seriesData.views[result[1]] = seriesData.views[result[1]] || [];
                    seriesData.views[result[1]].push([Date.UTC(y, m-1, d),v[index]]);
                });
            } else if(v1.match(/Comments$/)){
                result = v1.match(/(.+)Comments$/);
                angular.forEach(d.rows, function (v) {


                    var y = parseInt(v[0].substring(0,4));
                    var m = parseInt(v[0].substring(4,6));
                    var d = parseInt(v[0].substring(6,8));

                    seriesData.comments[result[1]] = seriesData.comments[result[1]] || [];
                    seriesData.comments[result[1]].push([Date.UTC(y, m-1, d),v[index]]);
                });
            }
        });
        angular.forEach(d.rows, function (row) {
            seriesData.labels.push(row[0]);
        });

        return seriesData;
    }


})();