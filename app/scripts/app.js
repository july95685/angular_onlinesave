'use strict';

/**
 * @ngdoc overview
 * @name dalockrAppV2App
 * @description
 * # dalockrAppV2App
 *
 * Main module of the application.
 */
angular
    .module('dalockrAppV2App', [
        'ngAnimate',
        'ngRoute',
        'ngSanitize',
        'ngStorage',
        'ngMessages',
        'wu.masonry',
        'ngMaterial',
        'wu.masonry',
        'ngFileUpload',
        'ngAudio',
        'wysiwyg.module',
        'textAngular',
        'angular-timeline',
        'amTree',
        'ngWebSocket',
        'infinite-scroll',
        'ipCookie',
        "com.2fdevs.videogular",
        "com.2fdevs.videogular.plugins.controls",
        "com.2fdevs.videogular.plugins.overlayplay",
        "com.2fdevs.videogular.plugins.poster",
        "uiCropper",
        'pdf',
        'mdPickers'
    ])
    //.constant("$MD_THEME_CSS","")
    .config(function ($routeProvider, $httpProvider, $provide, $mdThemingProvider) {

        //$mdThemingProvider.setDefaultTheme('none');

        //$mdThemingProvider.definePalette('primarycolor',
        //    { '50': '#dff0ff', '100': '#93cbff', '200': '#5bb0ff', '300': '#138eff', '400': '#007ff4', '500': '#006fd5', '600': '#005fb6', '700': '#004f98', '800': '#003f79', '900': '#002f5b', 'A100': '#dff0ff', 'A200': '#93cbff', 'A400': '#007ff4', 'A700': '#004f98', 'contrastDefaultColor': 'light', 'contrastDarkColors': '50 100 200 A100 A200' }
        //);
        //$mdThemingProvider.definePalette('accentcolor',
        //    { '50': '#ffffff', '100': '#fffdf6', '200': '#fff1be', '300': '#ffe176', '400': '#ffdb58', '500': '#ffd439', '600': '#ffcd1a', '700': '#fbc400', '800': '#dcac00', '900': '#be9400', 'A100': '#ffffff', 'A200': '#fffdf6', 'A400': '#ffdb58', 'A700': '#fbc400', 'contrastDefaultColor': 'light', 'contrastDarkColors': '50 100 200 300 400 500 600 700 800 900 A100 A200 A400 A700' }
        //);
        //$mdThemingProvider.theme('dalockr')
        //    .primaryPalette('primarycolor',{
        //    })
        //    .accentPalette('accentcolor',{
        //    });
        //$mdThemingProvider.definePalette('subprimarycolor',
        //    { '50': '#dff0ff', '100': '#93cbff', '200': '#5bb0ff', '300': '#138eff', '400': '#007ff4', '500': '#006fd5', '600': '#005fb6', '700': '#004f98', '800': '#003f79', '900': '#002f5b', 'A100': '#dff0ff', 'A200': '#93cbff', 'A400': '#007ff4', 'A700': '#004f98', 'contrastDefaultColor': 'light', 'contrastDarkColors': '50 100 200 A100 A200' }
        //);
        //$mdThemingProvider.definePalette('subaccentcolor',
        //    { '50': '#ffffff', '100': '#fffdf6', '200': '#fff1be', '300': '#ffe176', '400': '#ffdb58', '500': '#ffd439', '600': '#ffcd1a', '700': '#fbc400', '800': '#dcac00', '900': '#be9400', 'A100': '#ffffff', 'A200': '#fffdf6', 'A400': '#ffdb58', 'A700': '#fbc400', 'contrastDefaultColor': 'light', 'contrastDarkColors': '50 100 200 300 400 500 600 700 800 900 A100 A200 A400 A700' }
        //);
        //$mdThemingProvider.theme('dalockr-sub')
        //    .primaryPalette('subprimarycolor')
        //    .accentPalette('subaccentcolor');


        $routeProvider
        //  .when('/lockr', {
        //    templateUrl:'views/choose.html',
        //    controller: 'ChooseClusterCtrl'
        //  })
        //.when('/lockr/:lockrId', {
        //  templateUrl: 'views/lockr-details.html',
        //  controller: 'LockrDetailsCtrl'
        //})
            .when('/dashboard', {
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .when('/accounts', {
                templateUrl: 'views/accounts.html',
                controller: 'AccountsCtrl'
            })
            .when('/:access_token', {
                template: '<div></div>',
                resolve: {
                    isLogged: isLoggedIn
                }
            }).when('/register', {
                templateUrl: 'views/register.html',
                controller: 'RegisterCtrl'
            })
            .when('/search/:keyword', {
                templateUrl: 'views/search.html',
                controller: 'SearchCtrl'
            })
            .when('/mobile/search', {
                templateUrl: 'views/search.html',
                controller: 'SearchCtrl'
            })
            .when('/profile/userprofile', {
                templateUrl: 'views/profile.html',
                controller: 'UserProfileCtrl',
                reloadOnSearch: false
            })
            .when('/profile/sharingrules', {
                templateUrl: 'views/sharingrules.html',
                controller: 'SharingRulesCtrl',
                reloadOnSearch: false
            })
            .when('/sublockr/:lockrId', {
                templateUrl: 'views/sublockr-details.html',
                controller: 'SubLockrDetailsCtrl',
                reloadOnSearch: false
            })
            .when('/asset/:assetId', {
                templateUrl: 'views/asset-details.html',
                controller: 'AssetDetailsCtrl',
                reloadOnSearch: false
            }).when('/pp/edit/:lockrId', {
                templateUrl: 'views/pp-edit.html',
                controller: 'PpEditCtrl'
            })
            .otherwise({
                redirectTo: '/login'
            });


        /**
         * 判断是否用户已完成认证,如果认证成功,则跳转至主页,否则进入Login Page
         */
        function isLoggedIn($q, userServices, appConfig, $location, userRightServices, $compile, $rootScope) {

            var bodyElem = angular.element('body');
            var maskElem = $compile(angular.element('<body-loading-mask></body-loading-mask>'))($rootScope);

            var defer = $q.defer();
            var path = $location.path();
            if (path.match(/^\/access_token=/ig)) {
                var tokens = path.split('=')[1].split('&');
                userServices.setAccessToken(tokens[0]);
            }

            if (!userServices.isActive()) {  //未登录
                defer.reject('Go login server');
                bodyElem.append(maskElem);
                window.location = appConfig.API_SERVER_ADDRESS + '/api/auth?redirectUri=' + encodeURIComponent(appConfig.REDIRECT_URL_ADDRESS);
            } else {

                defer.reject('Authorization ok');
                bodyElem.append(maskElem);

                userServices.getUserProfileInfo(function () {
                    maskElem.remove();
                    $location.path('/accounts');
                });
            }
            return defer.promise;
        }


        $httpProvider.interceptors.push('authInterceptor');


        $provide.decorator('taOptions', ['taRegisterTool', 'taToolFunctions', '$delegate', '$compile', '$document', '$rootScope', function (taRegisterTool, taToolFunctions, taOptions, $compile, $document, $rootScope) { // $delegate is the taOptions we are decorating

            taRegisterTool('test', {
                buttontext: 'Select asset',
                action: function () {


                    var self = this;

                    var newScope = $rootScope.$new();
                    newScope.closeAssetModal = function (info) {
                        if (!info.isCancel) {
                            self.$editor().wrapSelection('insertImage', null, true);
                            for (var i = 0; i < info.assets.length; i++) {
                                var obj = info.assets[i];
                                self.$editor().wrapSelection('insertImage', obj, true);
                            }
                        }

                    };

                    var selectModal = $compile(angular.element('<article-asset-modal close-modal="closeAssetModal(info)"></article-asset-modal>'))(newScope);
                    $document.find('body').append(selectModal);
                },
                onElementSelect: {
                    element: 'img',
                    action: taToolFunctions.imgOnSelectAction
                }
            });


            taOptions.toolbar = [
                ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
                ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
                ['html', 'insertImage', 'insertLink', 'insertVideo']
            ];
            taOptions.toolbar[3].push('test');
            return taOptions;

        }]);


    })
    .factory('authInterceptor', function ($rootScope, $location, $q, commonServices, $sessionStorage, ipCookie) {
        return {

            request: function (config) {

                var token;

                if (token = ipCookie('accessToken')) {  //token存在
                    config.headers.Authorization = "Bearer " + token;
                }
                return config;
            },

            // Intercept 401s and redirect you to login
            responseError: function (response) {
                if (response.status === 401) {
                    $rootScope.$broadcast('401Error');
                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            }
        };
    })
    .run(function ($rootScope, $window, $sessionStorage, commonServices, $location, $templateRequest, userServices, userRightServices, dalockrMessages, dalockrServices, $dalMedia) {

        //探测是否为移动设备
        window.isMobile = false;
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) window.isMobile = true;


        $rootScope.mobileDevice = $dalMedia('xs') ? true : false;

        //检测路由变化
        $rootScope.$on('$locationChangeStart', function (ev, state) {

            /**
             * 打开通知， 此通知只有用户登陆后才被打开, 如果用户未登陆，则关闭
             */
            dalockrMessages.openNotification();

            //关闭Audio
            if (commonServices.getCurrentAudio()) {
                var audio = commonServices.getCurrentAudio();
                audio.pause();
                audio = null;
                commonServices.setCurrentAudio(null);
            }

            if (angular.element('add-asset-view')) { //如果asset-view存在, 通知他去隐藏
                $rootScope.$broadcast('$$closeAddAssetView');
            }
            if (angular.element('pp-edit-view')) { //如果asset-view存在, 通知他去隐藏
                $rootScope.$broadcast('$$closePpEditView');
            }

        });

        $rootScope.$on('401Error', function () {
            if (userServices.getAccessToken()) {
                userServices.removeAccessToken(); //移除当前token,  如果用户尚未退出换取新的token
            }
            $location.path('/');
        });

    })


    //override angular-material $dalMedia factory
    .factory('$dalMedia', ['$mdMedia', function ($mdMedia) {
        return function (size) {
            if (size == 'xs') {
                return $mdMedia('max-width: 767px');
            } else {
                return $mdMedia(size);
            }
        }
    }]);


