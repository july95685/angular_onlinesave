;(function (angular) {
    "use strict";
    angular.module('dalockrAppV2App')
        .service('cacheService', function () {

            var lockrStack = new Stack();// 存储具有层级关系的lockr的栈
            //添加lockr入栈
            this.pushLockrToStack = function (lockr) {
                //判断栈顶元素是否为父元素
                if(lockr.hierarchy){
                    if(lockrStack.length()){ //栈中是否有元素
                        var peekId = lockrStack.peek().id;
                        lockr.id === peekId ? lockrStack.pop() : (lockr.hierarchy[lockr.hierarchy.length - 1].lockrId !== peekId ?
                            lockrStack.clear() : '');
                    }
                } else { //如果是没有hierarchy ,则root lockr
                    lockrStack.clear();
                }
                lockrStack.push(lockr);
            };

            this.getLockrStackTopElement = function () {
              return lockrStack.peek();
            };

            this.checkLockrFromStack = function (lockrId) {

                if(!lockrStack.length()){ //栈是空的
                    return null;
                } else {
                    //从asset中返回父级lockr时,判断
                    if(lockrStack.peek().id === lockrId){
                        return lockrStack.peek();
                    }
                    //栈不是空的
                    //判断是否需要上游: 根据路径,判断当前点击的lockr是不是父lockr, 如果是则上游
                    var hierarchy;
                    var isUp = false;

                    if(hierarchy = lockrStack.peek().hierarchy){
                        angular.forEach(hierarchy, function (v) {
                            if(v.lockrId === lockrId){
                                isUp = true;
                            }
                        });
                    }
                    if(isUp){
                        while (lockrStack.length()){
                            if(lockrStack.peek().id === lockrId){
                                break;
                            } else {
                                lockrStack.pop();
                            }
                        }
                        if(lockrStack.length()){
                            return lockrStack.peek();
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }
            };
            this.clearLockrStack = function () {
                lockrStack.clear();
            };

        });



    ////////////////////
    ////////模拟栈///////
    ////////////////////
    function Stack(){
        this.dataStore = [];
        this.top = 0;
        this.push = push;
        this.pop = pop;
        this.peek = peek;
        this.clear = clear;
        this.length = length;
    }
    function push(element){
        this.dataStore[this.top++] = element;
    }
    function pop(){
        return this.dataStore[--this.top]; //返回栈顶元素,并将top减一
    }
    function peek(){
        return this.dataStore[this.top-1]; //返回栈顶元素
    }
    function clear(){
        this.top = 0;
    }
    function length(){
        return this.top;
    }

})(angular);