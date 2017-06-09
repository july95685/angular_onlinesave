angular.module('dalockrAppV2App')
    .directive('accountsList',['$compile','commonServices','$timeout','$animate','$location',function ($compile,commonServices,$timeout,$animate,$location) {

        var TEMPLATE = '<div layout="column" class="dl-accounts-list"></div>';

        return {
            restrict:'E',
            replace:true,
            template:TEMPLATE,
            scope:{
                selectAccount:'&selectAccount',
                allAccounts:'=',
                setAccount:'&setAccount'
            },
            link: function (scope, element, attrs) {

                scope.switchAccount = switchAccount;
                scope.setAccount = setAccount;

                var willUpElementId;
                var accountOrderData;

                /**
                 *  如果执行了SetAccount方法,说明存在search
                 */
                function setAccount(){
                    var aid;
                    if(aid = $location.search().aid){
                        animateAccountsOrder(aid);
                    }
                }

                function renderAccountList(accounts, isHaveNewData){
                    for (var i = 0; i < accounts.length; i++) {
                        element.append($compile(angular.element('<account-item ng-class="{\'center margin-bottom-10\':openAccounts && mobileScreen}" switch-account="switchAccount(ac)" account-index="' + i +'" accounts="allAccounts"></account-item>'))(scope));
                    }
                    var aid;
                    angular.element(element.find('.active-account')[0]).removeClass('hidden');
                    if((aid = $location.search().aid) && (aid !== accounts[0].accountId) && !isHaveNewData){
                        $timeout(function () {
                            switchAccount({account:{accountId:aid}});
                        });
                    } else {
                        changeAccount(accounts[0].accountId);
                    }
                }
                function switchAccount(ac){
                    var cid = ac.account.accountId;
                    willUpElementId = cid;
                    animateAccountsOrder(cid);
                    scope.selectAccount({index:{lid:lidByAid(cid),aid:cid,accounts:accountOrderData}});
                }

                /**
                 * 根据accountId获取该account的根lockrId
                 * @param aid
                 * @returns {*}
                 */
                function lidByAid(aid){
                    for(var i=0; i<scope.allAccounts; i++){
                        if (scope.allAccounts[i].accountId === aid){
                            return scope.allAccounts[i].id;
                        }
                    }
                }

                function animateAccountsOrder(newAccountId){

                    changeAccount(newAccountId);

                    //渲染account
                    adjustAccountOrder(newAccountId);
                    if(willUpElementId) {
                        var willUpElem = element.find('#account-item-' + willUpElementId),
                            allAccountElems = element.find('.account-item'),
                            willDownElem = angular.element(allAccountElems[0]);

                        //显示遮罩
                        allAccountElems.find('.active-account').addClass('hidden');
                        willUpElem.find('.active-account').removeClass('hidden');

                        /**
                         * 给定所有account item left和top值
                         */
                        for (var i = 0; i < allAccountElems.length; i++) {
                            var obj = angular.element(allAccountElems[i]);
                            obj.css({
                                'left': obj.position().left,
                                'top': obj.position().top
                            });
                        }

                        //绝对定位
                        allAccountElems.css({
                            'position': 'absolute'
                        });

                        var top = willUpElem.position().top;
                        willUpElem.css({
                            'top':'15px'
                        });

                        $animate.animate(willDownElem,{},{'top':top}).then(function(){
                            allAccountElems.css({
                                'top':'auto',
                                'left':'auto',
                                'position': 'static'
                            });
                            exchange(angular.element(allAccountElems[0]),element.find('#account-item-' + willUpElementId));
                        });

                    }
                }

                /**
                 * 将当前选中的元素的位置移动到第一位
                 * @param curId
                 */
                function adjustAccountOrder(curId){
                    var tempData;

                    if(willUpElementId === null) {
                        angular.forEach(scope.allAccounts,function(value,key){
                            if(value.accountId === curId){
                                tempData = value;
                                scope.allAccounts.splice(key,1);
                            }
                        });
                        if(tempData){
                            scope.allAccounts.unshift(tempData);
                        }

                    } else {
                        var accountData  = angular.copy(scope.allAccounts);
                        angular.forEach(accountData,function(value,key){
                            if(value.accountId === curId){
                                tempData = value;
                                accountData.splice(key,1);
                            }
                        });
                        if(tempData){
                            accountData.unshift(tempData);
                        }
                        accountOrderData = accountData;
                    }
                }



                function changeAccount(newId){
                    var accountId = newId;
                    angular.forEach(scope.allAccounts, function (value, key) {
                        if(value.accountId === newId) {
                            accountId = value.accountId;
                        }
                    });
                    commonServices.setAccountId(accountId);
                }

                /**
                 * 节点位置调换
                 * @param a
                 * @param b
                 */
                function exchange(a,b){
                    if(scope.allAccounts.length <= 2){
                        b.insertBefore(a);
                    } else {
                        var p = b.prev();
                        b.insertBefore(a);
                        a.insertBefore(p);
                    }
                }

                var rememberOldData;

                var watcher = scope.$watch('allAccounts', function () {
                    var len = scope.allAccounts && scope.allAccounts.length;
                    element.empty();
                    if(len){
                        if(!rememberOldData){
                            rememberOldData = scope.allAccounts;
                        }
                        if(rememberOldData.length === len){
                            renderAccountList(scope.allAccounts);
                        } else {
                            renderAccountList(scope.allAccounts,true);
                            rememberOldData = scope.allAccounts;
                        }
                    }
                });
                scope.$on('$destory', function () {
                    watcher();
                });
            }

        }

    }])
    .service('changeAccountService',['commonServices','userServices','$mdDialog','$dalMedia','$rootScope','userRightServices','addAccountService','dalockrServices','toastr','dlAlert','accountInfoManager',function (commonServices,userServices,$mdDialog,$dalMedia,$rootScope,userRightServices,addAccountService,dalockrServices,toastr,dlAlert,accountInfoManager) {
        this.show = function (ev) {
            $mdDialog.show({
                    controller: ChangeAccountCtrl,
                    templateUrl: 'views/templates/change.account.dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:false,
                    fullscreen: true
                });
        };

        function ChangeAccountCtrl($scope){
            $scope.mobileDevice = $dalMedia('sm');
            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.isIntegrator =  userRightServices.getUserRoles().INTEGRATOR;

            $scope.addAccount = function () {
                $scope.hide();
                addAccountService.addAccount().then(function () {
                    $rootScope.$broadcast('addAccountSuccess');
                });
            };

            $scope.accounts = commonServices.accounts();
            angular.forEach($scope.accounts,function(val,ind){
               val.user.img = dalockrServices.getUserManagerAvatar(val.user.clusterId,val.user.username);
            });

            $scope.changeAccount = function (ac) {
                angular.forEach($scope.accounts, function (v) {
                    v.active = v.accountId == ac.accountId;
                });
                commonServices.setAccountId(ac.accountId);
                $rootScope.$broadcast('$$ChangeAccountOfMobile',ac);
                $scope.hide();
            };

            $scope.deleteAccount = function (acc) {
                dlAlert.show({
                    title:'Delete',
                    message:'Are you true to delete "' + acc.name + '" ?'
                }).then(function (idx) {
                    if(idx){
                        dalockrServices.deleteAccount(acc.accountId).success(function () {
                            $scope.hide();
                            $rootScope.$broadcast('addAccountSuccess');
                        }).error(function (error) {
                            var msg;
                            if(msg = error.message){
                                toastr.error(msg);
                            }
                        });
                    }
                });
            };


            $scope.manageThisAccount = function (acc) {
                accountInfoManager.show({aId:acc.accountId,isManager:acc.isManager}).then(function (result) {});
                $mdDialog.hide();
            };



        }
    }])
    .service('addAccountService',['$dalMedia','$mdDialog','userServices','commonServices','dalockrServices','$rootScope','toastr',function ($dalMedia,$mdDialog,userServices,commonServices ,dalockrServices,$rootScope,toastr) {

        var editAccount;

        this.addAccount = function (account) {
            editAccount = account;
            return $mdDialog.show({
                controller: AddAccountController,
                templateUrl: 'views/templates/add-account-dialog.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose:false,
                fullscreen:$dalMedia('xs')
            });

        };


        function AddAccountController($scope){
            $scope.Collaborator={
                name:'',
                type:'',
                email:''
            }
            $scope.Account={
                socialChannel:'',
                address:''
            }
            $scope.channelUserData = [];
            $scope.selectedRemovedList = [];
            $scope.stepId=0;
            $scope.editing = false;
            $scope.currentEntity = {
                name:'',
                clusterId:userServices.currentUser().clusterId,
                accountLicenseId:'',
                managerId:userServices.currentUser().id,
                allowUserChannels:true,
                trial:true
            };
            $scope.socialChannelsData=[];
            $scope.Collaboratorshow=false;
            $scope.shadowshow=false;
            $scope.Channelsshow=false;
            $scope.Shareruleshow=false;
            $scope.constValue=["","ADD COLLABORATOR","ADD CHANNELS","CREATE SHARING RULE"];
            $scope.ChannelListshow=false;
             $scope.channelTypes = [
                {
                    active:true,
                    name:'Facebook',
                    iconClass:'mdi-facebook'
                },
                {
                    active:false,
                    name:'Twitter',
                    iconClass:'mdi-twitter'
                },
                {
                    active:false,
                    name:'Instagram',
                    iconClass:'mdi-instagram'
                },
                {
                    active:false,
                    name:'Evernote',
                    iconClass:'mdi-evernote'
                },
                {
                    active:false,
                    name:'Pinterest',
                    iconClass:'mdi-pinterest'
                },
                {
                    active:false,
                    name:'Google',
                    iconClass:'mdi-google'
                },
                {
                    active:false,
                    name:'Youtube',
                    iconClass:'mdi-youtube-play'
                }
            ];
            $scope.hide = function(tmp) {
                $mdDialog.hide(tmp);
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
            function assignSocialChannel(data) {
                var socialChannelsData = {};
                angular.forEach(data, function(value, key){
                    value.class = commonServices.getIconClassByType(value.socialChannelType);

                    if(value.name.indexOf('-') != -1) {
                        value.name = value.name.split('-')[1];
                    }

                    if(socialChannelsData[value.socialChannelType] === undefined) {
                        socialChannelsData[value.socialChannelType] = [];
                    }
                    var type = value.socialChannelType.toLowerCase();

                    value.remove = false;

                    if(type === 'facebook'){
                        if(value.pageId){
                            value.avatarPic = commonServices.getProfilePicByTypeAndId(type,value.pageId);
                        } else {
                            value.avatarPic = commonServices.getProfilePicByTypeAndId(type,value.facebookId);
                        }
                    } else if(type === 'twitter'){
                        value.avatarPic = commonServices.getProfilePicByTypeAndId(type,value.screenName);
                    }

                    socialChannelsData[value.socialChannelType].push(value);
                });
                $scope.socialChannelsData = socialChannelsData;
            }
            function CreateAccount() {
                // console.log(123);
                if($scope.create_account_form.$invalid) {
                    $scope.showInvalid=true;
                    toastr.error('You don\'t have enough permission.' );
                    return;
                }
                // console.log(145);
                $scope.loadingInProgress = true;

                if($scope.editing){
                    dalockrServices.updateAccount($scope.currentEntity,accountId).success(function () {
                        $scope.hide(true);
                    }).error(function (data) {
                        toastr.error(data.message,'Error');
                        $scope.loadingInProgress = false;
                    });
                } else {
                    dalockrServices.addAccount($scope.currentEntity).success(function () {
                        $scope.hide(true);
                    }).error(function (data) {
                        toastr.error(data.message,'Error');
                        $scope.loadingInProgress = false;
                    });
                }
            }
            function getSocialChannel(){
                $scope.socialChannelsData = [];
                $scope.loadingSocialChannels = true;
                dalockrServices.getAllSocialChannels()
                    .then(function(response){
                        var data = response.data;
                        assignSocialChannel(data);
                        //var socialChannelsData = [];
                        //angular.forEach(data, function(value, key){
                        //    value.class = commonServices.getIconClassByType(value.socialChannelType);
                        //    socialChannelsData.push(value);
                        //});
                        //
                        //scope.socialChannelsData = socialChannelsData;
                        $scope.loadingSocialChannels = false;

                    },function(error){
                        $scope.loadingSocialChannels = false;
                    });
            }
            $scope.switchChannelType = function (rule) {
                $scope.channelUserData = [];
                angular.forEach($scope.socialChannelsData,function(val,ind){
                    if(ind == rule.name){
                        $scope.channelUserData = val;
                    }
                });
                $scope.channelTypesname = rule.name;
                angular.forEach($scope.channelTypes,function(val,ind){
                    if(val.name === rule.name){
                        val.active = true;
                    }else{
                        val.active = false;
                    }
                });
            };
            $scope.chooseSocialChannels = function(channel){
                angular.forEach($scope.socialChannelsData,function(val,ind){
                    if(val === channel){
                        val.remove = !val.remove;
                    }
                });
                angular.forEach($scope.channelUserData,function(val,ind){
                    if(val === channel){
                        val.remove = !val.remove;
                    }
                });
                if($scope.selectedRemovedList.indexOf(channel.id) == -1){
                    $scope.selectedRemovedList.push(channel.id)
                }else{
                    $scope.selectedRemovedList.splice($scope.selectedRemovedList.indexOf(channel.id),1);
                }
            };

            var accountId;
            $scope.showChannel=function () {
                $scope.ChannelListshow=true;
            }
            $scope.AddorCreate=function(id)
            {
                if(id==1)
                {
                    $scope.Collaboratorshow=true;
                    $scope.shadowshow=true;
                }
                else if(id==2)
                {
                    $scope.Channelsshow=true;
                    $scope.ChannelListshow=true;
                }
                else {
                    $scope.Shareruleshow=true;
                }
            }
            $scope.backForm=function () {
                $scope.Shareruleshow=false;
            }
            $scope.changeShadow=function () {
                $scope.shadowshow=false;
                $scope.Collaboratorshow=false;
            }
            if(editAccount){
                $scope.editAccountName = editAccount.name;
                $scope.editing = true;
                dalockrServices.getAccountInfo(editAccount.accountId).success(function (accountInfo) {
                    accountId = accountInfo.id;
                    $scope.currentEntity.name = accountInfo.name;
                    $scope.currentEntity.clusterId = accountInfo.clusterId;
                    $scope.currentEntity.allowUserChannels = accountInfo.allowUserChannels;
                    $scope.currentEntity.accountLicenseId = accountInfo.accountLicense.id;
                    $scope.currentEntity.trial = accountInfo.trialAccount;
                });
            }

            dalockrServices.getAllAccountLicense().success(function (data) {
                $scope.currentEntity.accountLicenseId = data[0].id;
                $scope.allLicense = data;
            });
            $scope.getNext=function(id){
                if(id==3)
                {
                    CreateAccount();
                    return;
                }
                $scope.stepId=($scope.stepId+1)%4;
                if($scope.stepId==2)
                {
                    getSocialChannel();
                }
            }
            $scope.getPrevious=function(){
                $scope.stepId=($scope.stepId-1+4)%4;
            }
            $scope.createAccount = function () {
                if($scope.create_account_form.$invalid) return;
                $scope.loadingInProgress = true;

                if($scope.editing){
                    dalockrServices.updateAccount($scope.currentEntity,accountId).success(function () {
                        $scope.hide(true);
                    }).error(function (data) {
                        toastr.error(data.message,'Error');
                        $scope.loadingInProgress = false;
                    });
                } else {
                    dalockrServices.addAccount($scope.currentEntity).success(function () {
                        $scope.hide(true);
                    }).error(function (data) {
                        toastr.error(data.message,'Error');
                        $scope.loadingInProgress = false;
                    });
                }
            };
        }


    }]);