'use strict';
/**
 * Created by panma on 11/19/15.
 */
angular.module('dalockrAppV2App')
    .factory('dalockrMessages',['$websocket','$sessionStorage','appConfig','ipCookie','$timeout',function ($websocket, $sessionStorage,appConfig,ipCookie,$timeout) {

        var notificationQueue = [],
            ws = null,
            connCount = 0,
            authToken;

        /**
         * 打开WebSocket通知
         */
        function openNotification(){

            if(angular.isUndefined(ipCookie('accessToken'))) { //用户未登陆
                ws && ws.close();
                return;
            }
            if( ws ) return;

            authToken = authToken || ipCookie('accessToken');


            ws = ws ? ws : $websocket( appConfig.WEB_SOCKET_URL + '/ws/register?token=' + authToken);

            ws.onMessage(function(event) {

                var result =  JSON.parse(event.data);
                /**
                 * 执行通知队列
                 */
                for (var i = 0; i < notificationQueue.length; i++) {
                    var notification = notificationQueue[i];
                    if(angular.isFunction(notification.callback)){
                        notification.callback(result);
                    }
                }

            });
            ws.onError(function(event) {

                //连接错误 再次发起连接
                console.log('WS连接错误,5秒后重试');
                ws.close();
                ws = null;

                if(connCount <= 8){
                    $timeout(function () {
                        console.log('重新发起WS连接');
                        connCount++;
                        openNotification();
                    },5000);
                } else {
                    console.log('经过10次尝试后,WS未能成功连接,停止连接!!!');
                }
                ////console.log('connection Error', event);
            });
            ws.onOpen(function() {
                //console.log(ws.readyState);
                ////console.log('connection open');
            });
            ws.onClose(function(){
                //alert('connection close');
            });

        }

        /**
         * 注册通知
         */
        function registerNotification(notify){ //{name:'',callback:function}
            for (var i = 0; i < notificationQueue.length; i++) {
                var obj = notificationQueue[i];
                if(notify.name === obj.name){ //避免加入重复的通知函数
                    //将之前的notify 去掉加入新的
                    notificationQueue.splice(i,1);
                }
            }
            notificationQueue.push(notify);
        }

        /**
         * 关闭通知
         */
        function closeNotification(){
            ws.close();
        }

        return {
            registerNotification:registerNotification,
            closeNotification:closeNotification,
            openNotification:openNotification
        }

    }]);
