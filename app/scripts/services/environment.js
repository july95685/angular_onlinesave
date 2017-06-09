'use strict';

/**
 * Created by panma on 6/14/15.
 */
angular.module('dalockrAppV2App')
    ////production
    //.constant("appConfig",{
    //    'API_SERVER_ADDRESS':'https://dev.dalockr.com',
    //    'REDIRECT_URL_ADDRESS':'http://localhost:9000',
    //    'DASTORR_CLUSTER_ID':'ithink',
    //    'CURRENT_VERSION':'2.0.5'
    //});
    //production local
    //.constant("appConfig",{
    //    'API_SERVER_ADDRESS':'https://app.dalockr.com',
    //    'REDIRECT_URL_ADDRESS':'http://localhost:3000',
    //    'DASTORR_CLUSTER_ID':'ithink',
    //    'CURRENT_VERSION':'2.0.5'
    //});

    //development Local
    //.constant('appConfig',{
    //   'API_SERVER_ADDRESS':'https://dev.dalockr.com',
    //   'REDIRECT_URL_ADDRESS':'http://localhost:3000',
    //    'WEB_SOCKET_URL':'wss://dev.dalockr.com',
    //    'DASTORR_CLUSTER_ID':'ithink',
    //    'CURRENT_VERSION':'2.0.3'
    //});

    //.constant('appConfig',{
    //    'DEFAULT_CLUSTER':'dalockr',
    //    'API_SERVER_ADDRESS':'https://dev.dalockr.com',
    //    'REDIRECT_URL_ADDRESS':'http://localhost:3000',
    //    'WEB_SOCKET_URL':'wss://dev.dalockr.com',
    //    'DASTORR_CLUSTER_ID':'ithink',
    //    'CURRENT_VERSION':'2.10'
    //});

    //development Prod
     .constant("appConfig",{
         'API_SERVER_ADDRESS':'https://dev.dalockr.com',
         'REDIRECT_URL_ADDRESS':'http://localhost:3000',
         'WEB_SOCKET_URL':'wss://dev.dalockr.com',
         'DASTORR_CLUSTER_ID':'ithink',
         'CURRENT_VERSION':'2.1.1'
     });

    //production env
    //.constant("appConfig",{
    //    'API_SERVER_ADDRESS':'https://app.dalockr.com',
    //    'REDIRECT_URL_ADDRESS':'https://app.dalockr.com',
    //    'WEB_SOCKET_URL':'wss://app.dalockr.com',
    //    'DASTORR_CLUSTER_ID':'ithink',
    //    'CURRENT_VERSION':'2.0.5'
    //});