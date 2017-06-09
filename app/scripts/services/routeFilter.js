'use strict';
/**
 * Created by panma on 10/26/15.
 */
angular.module('dalockrAppV2App')
  .service('routeFilter',function($location){


    var filterRouters = [];

    function getFilter(route){
      for (var i = 0; i < filterRouters.length; i++) {
        var obj = filterRouters[i];
        for (var j = 0; j < obj.routers.length; j++) {
          var obj1 = obj.routers[j];
          if(matchRoute(route,obj1)){
            return obj;
          }
        }
      }
      return null;
    }

    function matchRoute(obj1, route){
      if(route instanceof RegExp){
        return route.test(obj1);
      } else {
        return obj1 === route;
      }
    }


    return {

      canAccess:function(route){

        var filter = getFilter(route);
        return filter.cb();

      },

      registerRouters:function(name, routers, cb, redirectTo){

        redirectTo = typeof redirectTo !== "undefined" ? redirectTo : null;

        filterRouters.push({
          name:name,
          routers:routers,
          cb:cb,
          redirectTo:redirectTo
        });

      },
      run:function(route){

        var filter = getFilter(route);
        if(filter !== null && filter.redirectTo !== null){
          if(!filter.cb()){
            if(angular.isFunction(filter.redirectTo)){
              $location.path(filter.redirectTo());
            } else {
              $location.path(filter.redirectTo);
            }
          }
        }


      }



    };
  });
