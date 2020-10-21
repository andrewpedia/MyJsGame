/**
 * Created by 真心科技 on 2016/2/29.
 */



var NetHelp = cc.Class.extend({
    _className: "NetHelp",
    _classPath: "src/net/NetHelp.js",


    connector: null,
    addNetHandler: null,
    removeNetHandler: null,
    isConnect: false,
    isLogin: false,
    pingTimer: null,

    ctor: function () {

        //this._super();
        //初始化
        this.initialization();

    },

    getSocketID: function () {
        return this.connector.sock.id;
    },

    /**
     * 初始化
     */
    initialization: function () {

        mpApp.initAgentID();

        //初始化网络链接
        this.connector = new Connector();
        this.connector.connect(mpApp.getHallURL() + mpNetConfig.namespace);
        this.connector.addNetHandler(this);


        this.addNetHandler = this.connector.addNetHandler.bind(this.connector);
        this.removeNetHandler = this.connector.removeNetHandler.bind(this.connector);

        this.registerEvents();
    },

    setLoginStatus: function (isLogin) {
        this.isLogin = isLogin;
    },

    getLoginStatus: function () {
        return this.isLogin;
    },

    registerEvents: function () {
        //注册事件
        for (var attr in mpNetEvent) {
            mpNetEvent[attr] && this.connector.registerEvent(mpNetEvent[attr]);
        }
    },

    reconnect: function () {

        if (!this.connector.isConnecting && !this.connector.isConnect) {
            this.connector.connect(mpApp.getHallURL() + mpNetConfig.namespace);
            this.registerEvents();
        }

    },

    // 断开连接
    disconnect: function () {
        this.connector.disconnect();
    },

    onNetEvent: function (eventName, data) {

        switch (eventName) {
            case "connect":
                this.isConnect = true;

                //超过1分钟就重新获取一下ISP
                if (mpGD.ipInfo.ip == "0.0.0.0" || mpGD.ipInfo.ts + 60000 <= Date.now()) {
                    //获取ip信息
                    mpGD.netUtil.getIPInfo(function (result) {
                        mpGD.ipInfo.ip = result.ip;
                        mpGD.ipInfo.isp = result.address;
                        mpGD.ipInfo.ts = Date.now();


                        // mpGD.ipInfo.city = city;
                        // mpGD.ipInfo.province = province;
                        // mpGD.ipInfo.country = country;
                    });
                }



                this.pingServer()

                mpApp.saveLocalAgentID(mpGD.agentID);

                break;
            case "disconnect":

                //主动断开就不触发跳到登录界面了， 由主动断开的代码那边去处理
                if (!this.connector.activeDisConnect) {
                    mpApp.unexpectedDisconnect();
                }

                this.isConnect = false;
                this.setLoginStatus(false);
                //this.onDisconnect();
                break;

            case "error":
                this.isConnect = false;
                this.setLoginStatus(false);
                this.onError();
                break;
            case "Pong":
                this.onPong(data)
                break;
            case mpNetEvent.VerifyUser:
                // this.onLoginOK(data)
                break;
                
        }

    },


     /**
     * 心跳
     */
    pingServer: function () {
        var self = this
        this.pingTimer = setInterval(() => {
            //cc.log("发送心跳包",Date.now())
            self.connector.emit(mpNetEvent.Ping, Date.now());             
        },3000);
    },


    onLoginOK: function (data) {
            if (data && !data.errCode) {
                cc.log("登录成功 保存数据 消息",data)
                mpApp.updateUserInfo(data);
            }
    },


     /**
     * 心跳
     */
    onPong: function (data) {

        cc.log("pong",Date.now()-data)
    },


     /**
     * 心跳
     */
    onInGame: function (data) {

        cc.log("玩家在玩游戏",data)


        //先请求进入房间， 再请求坐下
        this.requestEnterRoom(data.roomID);
        this.requestUserSitDown(data.roomID, data.tableID, data.chairID);


    },

    /**
     * 出错，重连
     */
    onError: function () {
        var self = this;
        this.pingTimer && clearInterval(this.pingTimer);

        mpApp.updateAgentID();
        setTimeout(function () {            
            self.reconnect();
        }, 1000);
    },

/*    onDisconnect: function () {

        var self = this;
        mpApp.showWaitLayer("正在请求重连服务器...");
        setTimeout(function () {            
            self.reconnect();
        }, 1000);

    },*/

    /**
     * 登出
     */
    logout: function () {
        this.connector.emit(mpNetEvent.Logout);

        //不要把自己断掉， 用上一条链接就好了
        // this.connector.disconnect();
        //

        this.setLoginStatus(false);

    },

    //自动 sha1,
    autoSha1: function (str) {
        if (str) {
            return str.length == 40 ? str : hex_sha1(str).toUpperCase();
        }

    },

    /**
     * 登录
     * @param account
     * @param password
     * @param imsi  机器码
     */
    requestLogin: function (arg) {
		var json_proxydata=native.getChannelID();
        var _porxyid=0;
        var _dailiID=0;
        if(json_proxydata &&json_proxydata!="0")
        {
            _porxyid=JSON.parse(json_proxydata).id;  //获取推广人的代理id
            _dailiID=JSON.parse(json_proxydata).dailiid;  //获取推广人的代理id
        }
        // ttutil.dump(arg);
        var data = {
            // moorMachine: native.getIMEI(),
            channel: native.getUmengChannel(),
            deviceID: native.getDeviceId(),
            isp: mpGD.ipInfo.isp,
            ip: mpGD.ipInfo.ip,
            os: cc.sys.os,
            code: arg.code,
            moorMachine: arg.moorMachine,
            mobileCode: arg.mobileCode,
			proxyid:_porxyid,
            dailiID:_dailiID,
        };
        if (arg.account) {

            data.account = arg.account;
            data.password = this.autoSha1(arg.password);
            data.loginType = mpLoginType.Account;
        }
        else if (arg.qqID) {
            data.qqID = arg.qqID;
            data.loginType = mpLoginType.QQID;
        }
        else if (arg.wxCode) {
            data.wxCode = arg.wxCode;
            data.loginType = mpLoginType.WXCode;
            data.isWeb = arg.isWeb;
            data.plaza = GNativeInfo.plaza;
        }
        else if (arg.userID) {
            data.userID = arg.userID;
            data.socketID = arg.socketID;
            data.loginType = mpLoginType.AccountScanType;
        }
        else {
            data.guestID = arg.guestID;
            data.loginType = mpLoginType.GuestID;
        }

        data.version = native.getVersion();

        mpGD.saveLoginArgs = data
        this.connector.emit(mpNetEvent.VerifyUser, data);
    },

    /**
     * 请求游戏列表
     */
    requestGameList: function () {
        this.connector.emit(mpNetEvent.GameList);
    },
    /**
     * 请求自建房间游戏列表
     */
    requestSelfCreateGameList: function () {
        this.connector.emit(mpNetEvent.SelfCreateGameList);
    },

    /**
     * 签到信息读取
     */
    requestSignRead: function () {
        this.connector.emit(mpNetEvent.SignRead);
    },


    /**
     * 请求签到
     */
    requestSignWrite: function () {
        this.connector.emit(mpNetEvent.SignWrite);
    },

    /**
     * 提交昵称跟头像
     * @param nickname
     * @param faceID
     */
    requestModifyUserInfo: function (nickname, faceID) {

        var data = {
            nickname: nickname,
            address: mpGD.userInfo.address,
            underWrite: mpGD.userInfo.underWrite,
            faceID: faceID,
            gender: mpGD.userInfo.gender,
            action: 1,
        };

        this.connector.emit(mpNetEvent.ModifySetup, data)
    },

    /**
     * 提交修改密码
     * @param oldPassword
     * @param newPassword
     */
    requestModifyPassword: function (oldPassword, newPassword) {
        var data = {
            oldPassword: this.autoSha1(oldPassword),
            newPassword: this.autoSha1(newPassword),
            action: 2,
        };

        this.connector.emit(mpNetEvent.ModifySetup, data)
    },

    /**
     * 请求房间列表
     * @param moduleID
     */
    requestRoomList: function (moduleID) {
        this.connector.emit(mpNetEvent.GameRoomList, {
            GamesListID: moduleID,
            mbVersion: mpApp.getLocalVersion(moduleID)
        });
    },
    /**
     * 请求自建房间列表
     * @param moduleID
     */
    requestCreateRoomList: function (moduleID) {
    //console.log("requestCreateRoomList===="+moduleID);
        this.connector.emit(mpNetEvent.GameCreateRoomList, {
            GamesListID: moduleID,
            mbVersion: mpApp.getLocalVersion(moduleID)
        });
    },

    /**
     * 用户请求进入房间
     */
    requestEnterRoom: function (roomID) {
        var data = {GamesRoomID: roomID};
        this.connector.emit(mpNetEvent.EnterRoom, data);
    },

    /**
     * 请求玩游戏
     * @param roomID
     */
    requestPlayGame: function (roomID) {

        //先请求进入房间， 再请求坐下
        this.requestEnterRoom(roomID);
        this.requestUserSitDown(roomID, null, null);
    },
    /**
     * 请求玩游戏(创建房间
     * @param roomID
     */
    requestCreateGame: function (roomID) {

        //先请求进入房间， 再请求坐下
        this.requestEnterRoom(roomID);
        //console.log("setPass=========="+setPass);
        //roomID, tableID, chairID, enterPwd, setPwd, uuid,action
        this.requestUserSitDown(roomID, null, null,null,null,null,2);
    },
    requestJoinGameByPass:function (tablePwd) {
        var data = {tablePwd: tablePwd};
        //请求加入游戏
        this.connector.emit(mpNetEvent.JoinGameByPass, data);
    },
    requestSitdownByPass:function (roomID,password,tableID) {
        //var data = {roomID: roomID};
        //请求加入游戏
        //console.log("请求坐下roomID  "+roomID+"  tableID   "+tableID+"  password  "+ password)
        //this.requestEnterRoom(roomID);
        this.requestUserSitDown(roomID, tableID, null,password,null,null,3);
    },
    /**
     * 请求邮箱列表
     * @param roomID
     */
    requestMailbox: function (start, size) {
        var data = {start: start || 0, size: size || 30};
        this.connector.emit(mpNetEvent.GetMailList, data);
    },


    /**
     * 获取随机昵称
     */
    requestRandomName: function () {
        this.connector.emit(mpNetEvent.GetRandomName);
    },


    /**
     * 用户请求坐下
     */
    requestUserSitDown: function (roomID, tableID, chairID, enterPwd, setPwd, uuid,action) {
        var data = {};
        data.GamesRoomID = roomID;
        //console.log("action+================="+action);
        if (tableID == null) {
            data.Action = 1;
            if(action!=null)
            {
                data.action = action; //创建带密码的桌子
            }
        }
        else {
            
            if(action!=null&&action==3)
            {
                data.action = action; //创建带密码的桌子
                data.TableID = tableID;
                data.enterPwd = enterPwd;
                
            }
            else
            {
                data.TableID = tableID;
                data.ChairID = chairID;
                data.enterPwd = enterPwd;
                data.setPwd = setPwd;
                data.uuid =  uuid;
            }
        }
        //console.log("data.action==="+data.action);
        data.agentID = mpGD.agentID;

        this.connector.emit(mpNetEvent.EnterGame, data);
    },

    /**
     * 获取桌子uuid
     */
    requestTableUuid: function () {

        this.connector.emit(mpNetEvent.TableUuid, {});
    },
    /**
     * 请求验证二级密码
     * @param password
     */
    requestVerifyTwoPassword: function (password) {
        var data = {};
        data.twoPassword = this.autoSha1(password);
        this.connector.emit(mpNetEvent.VerifyTwoPassword, data);
    },

    //用户注册
    requestRegister: function (account, nickname, pwd, code) {
        //console.log("native.getChannelID()========="+native.getChannelID());
        //ToastSystemInstance.buildToast("请输入验证码=============="+native.getChannelID());
        var json_proxydata=native.getChannelID();
        var _porxyid=0;
        var _dailiID=0;
        if(json_proxydata &&json_proxydata!="0")
        {
            _porxyid=JSON.parse(json_proxydata).id;  //获取推广人的代理id
            _dailiID=JSON.parse(json_proxydata).dailiid;  //获取推广人的代理id
        }
        //ToastSystemInstance.buildToast("请输入验证码======ccccd========"+_porxyid);
        var data = {
            account: account,
            nickname: nickname,
            password: this.autoSha1(pwd),
            code: code,
            ip: mpGD.ipInfo.ip,
            isp: mpGD.ipInfo.isp,
            deviceID: native.getDeviceId(),
            os: cc.sys.os,
            channel: native.getUmengChannel(),
            version: native.getVersion(),
            proxyid:_porxyid,
            dailiID:_dailiID,
        };

        this.connector.emit(mpNetEvent.PhoneReg, data);
    },
//-------------------------------------------------------------------------------------------------------------------------
    //请求设定密保问题
    requestSetSafeQuestion: function (question1, answer1, question2, answer2) {

        var data = {
            question1: question1,
            answer1: this.autoSha1(answer1),
            question2: question2,
            answer2: this.autoSha1(answer2),
            action: 4,
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },


    //请求验证密保问题
    requestVerifySafeQuestion: function (answer1, answer2) {
        var data = {answer1: this.autoSha1(answer1), answer2: this.autoSha1(answer2)};
        this.connector.emit(mpNetEvent.VerifyQuestion, data);
    },
    //请求修改密保问题
    requestModifySafeQuestion: function (question1, answer1, question2, answer2) {
        var data = {
            question1: question1,
            answer1: this.autoSha1(answer1),
            question2: question2,
            answer2: this.autoSha1(answer2),
            action: 5,
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
    //---------------------------------------------------------------------------------------------------------------------
    //绑定提现支付宝帐号
    requestSetDrawAccounts: function (drawaccount, realname) {
        var data = {
            drawaccount: drawaccount,
            realname: realname,
            action: 10,
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
    //绑定提现银行卡帐号
    requestSetDrawBankAccounts: function (drawaccount, realname) {
        var data = {
            drawaccount: drawaccount,
            realname: realname,
            action: 11,
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
    //绑定安全手机
    requestSetSafeMobile: function (mobileNum, realname, code, idcard) {
        var data = {
            mobileNum: mobileNum,
            realname: realname,
            code: code,
            idcard: idcard,
            action: 8,
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
    //解除绑定安全手机
    requestUnBindSafeMobile: function (code) {
        var data = {
            action: 9,
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },

    //请求绑定安全邮箱
    requestSetSafeEmail: function (email, code) {
        var data = {email: email, code: code};
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
    //请求验证安全邮箱
    requestVerifySafeEmail: function (code) {
        var data = {code: code};
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
    //请求向指定邮箱发送验证码
    requestEmailCode: function (code) {
        var data = {code: code};
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
    //请求修改安全邮箱
    requestModifySafeEmail: function (email, code) {
        var data = {email: code, code: code};
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },
//-------------------------------------------------------------------------------------------------------------------------
    //修改二级密码
    requestModifyTwoPassword: function (oldTwoPassword, newTwoPassword, passwordType) {
        var data = {
            oldTwoPassword: this.autoSha1(oldTwoPassword),
            newTwoPassword: this.autoSha1(newTwoPassword),
            passwordType: passwordType,
            action: 6,
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },

    //设定二级密码
    requestSetTwoPassword: function (password, passwordType) {
        var data = {
            twoPassword: this.autoSha1(password),
            passwordType: passwordType,
            action: 3
        };
        this.connector.emit(mpNetEvent.ModifySetup, data);
    },


    //绑定或解绑账号 //type 1表示绑定账号， 2表示绑定微信，-2 表示解绑微信
    requestBindAccount: function (type, account, nickname, pwd, code, isWeb) {
        var data = {
            account: account,
            nickname: nickname,
            password: this.autoSha1(pwd),
            type: type,
            code: code,
            isWeb: isWeb,
            plaza: GNativeInfo.plaza
        };
        this.connector.emit(mpNetEvent.BindAccount, data);
    },


    //得到排行 数据
    requestRanking: function () {
        this.connector.emit(mpNetEvent.GetScoreRank);
    },

    //读取VIP配置
    requestVipConfig: function () {
        this.connector.emit(mpNetEvent.ReadVipConfig);

    },

    /**
     * 离开房间
     * @param roomID
     */
    requestLevelRoom: function (roomID) {
        this.connector.emit(mpNetEvent.LeaveRoom, {UserID: mpGD.userInfo.UserID, GamesRoomID: roomID});
    },

    //--------------------------------------------------------------------------------------------------------------------
    requestBankBusiness: function (money, type) {
        money = Number(money);
        var data = {money: money, type: type};
        this.connector.emit(mpNetEvent.BankBusiness, data);
    },

    //打赏
    requestTransferMoney: function (toGameID, money) {
        money = Number(money);
        var data = {money: money, toGameID: toGameID};
        this.connector.emit(mpNetEvent.TransferMoney, data);
    },
    //查询游戏名
    requestBusinessUN: function (gameID) {
        var data = {type: 3, gameID: gameID};
        this.connector.emit(mpNetEvent.QueryBusiness, data);
    },
    //查询保险柜明细
    requestBusinessMX: function (crtID) {
        var data = {type: 1, crtID: crtID};
        this.connector.emit(mpNetEvent.QueryBusiness, data);
    },
    //查询红包明细
    requestBusinessHB: function (crtID) {
        var data = {type: 4, crtID: crtID};
        this.connector.emit(mpNetEvent.QueryBusiness, data);
    },
    //查询摊位明细
    requestBusinessTW: function (startIndex, limitSize) {
        var data = {type: 102, index: startIndex, size: limitSize};
        this.connector.emit(mpNetEvent.QueryBusiness, data);
    },
    //查询身上金币明细
    requestBusinessCoinDetail: function (startIndex, limitSize) {
        var data = {type: 103, index: startIndex, size: limitSize};
        this.connector.emit(mpNetEvent.QueryBusiness, data);
    },
    //查询保险柜打赏
    requestBusinessZZ: function (crtID) {
        var data = {type: 2, crtID: crtID};
        this.connector.emit(mpNetEvent.QueryBusiness, data);
    },
    //查询实物订单
    requestBusinessGoodsOrder: function () {
        var data = {type: 101, startIndex: 0, limitSize: 50};
        this.connector.emit(mpNetEvent.QueryBusiness, data);
    },
    //--------------------------------------------------------------------------------------------------------------------

    //请求找回登录密码,
    requestFindPassword: function (account, mobileCode,codeType) {
        mpApp.showWaitLayer("正在请求数据");

        var data = {account: account, mobileCode: mobileCode,codeType:codeType};
        this.connector.emit(mpNetEvent.ForgotPassword, data);
    },

    //请求找回保险柜密码,
    requestFindTwoPassword: function (mobileCode) {
        mpApp.showWaitLayer("正在请求数据");

        var data = {mobileCode: mobileCode};
        this.connector.emit(mpNetEvent.ForgotTwoPassword, data);
    },

    //--------------------------------------------------------------------------------------------------------------------
    //邮件相关接口
    //请求未读邮件
    requestMailListTip: function () {
        this.connector.emit(mpNetEvent.GetMailListTip);
    },

    //标志邮件已经读取 
    requestMarkMailAlreadyRead: function (mailList) {
        this.connector.emit(mpNetEvent.WriteSystemMail, {action: 3, mailList: mailList});
    },

    /**
     * 读取邮件
     * @param mailID
     */
    requestReadMail: function (mailID) {
        var data = {MailID: mailID};
        this.connector.emit(mpNetEvent.ReadSystemMail, data);
    },

    /**
     * 操作邮件
     * @param id 邮件id 或附件id
     * @param action 1表示 标志为删除， 2表示  领取附件， 3表示 标志为读取
     * @param mobileNum 如果领取的附件是话费的话， 要带上手机号码
     */
    requestWriteSystemMail: function (id, action, mobileNum) {
        var data = {id: id, action: action, mobileNum: mobileNum};
        this.connector.emit(mpNetEvent.WriteSystemMail, data);
    },
    //--------------------------------------------------------------------------------------------------------------------

    //请求领取返利
    requestGetRebate: function () {
        this.connector.emit(mpNetEvent.GetRebate);
    },

    //读取充值配置
    requestPayConfig: function () {
        this.connector.emit(mpNetEvent.ReadPayConfig);
    },

    //请求充值
    requestPay: function (type, money, kind, productId, goodsID, goodsNum) {

        this.connector.emit(mpNetEvent.RequestPay, {
            money: money,
            type: type,
            channel: kind,
            productId: productId,
            goodsID: goodsID,           //道具ID  如果有goodsID, 则指定充值的钱直接用来购买道具, money不用填
            goodsNum: goodsNum          //道具数量  道具数量
        });
    },

    //请求领取现金红包
    requestTakeCash: function () {

        this.connector.emit(mpNetEvent.RequestTakeCash);
    },

    //请求房间玩家列表
    requestRoomUserList: function (roomID) {
        this.connector.emit(mpNetEvent.GameRoomUsers, {GamesRoomID: roomID});
    },

    //请求房间玩家列表
    requestGameRoomTableList: function (roomID) {
        this.connector.emit(mpNetEvent.GameRoomTables, {GamesRoomID: roomID});
    },
    //请求系统配置,
    requestSystemConfig: function () {
        this.connector.emit(mpNetEvent.SystemConfig);
    },

    //请求系统公告
    requestSystemNotice: function () {
        this.connector.emit(mpNetEvent.SystemNotice);
    },

    //发送已进入大厅消息
    requestEnterPlazaMain: function () {
        this.connector.emit(mpNetEvent.EnterPlazaMain);
    },

    //请求验证码地址
    requestCodeAddr: function () {
        var os = cc.sys.os;
        if (os == cc.sys.OS_ANDROID && G_PLATFORM_TV)
            os = "Android_TV";

        this.connector.emit(mpNetEvent.CodeAddr, {channel: native.getUmengChannel(), os: os});
    },

    //请求活动
    requestActivity: function () {
        this.connector.emit(mpNetEvent.ReadActivity);
    },

    //请求分享订单
    requestShareOrder: function () {
        this.connector.emit(mpNetEvent.GetShareOrder);
    },


    //请求道具配置，也就是商店
    requestGoodsConfig: function () {
        this.connector.emit(mpNetEvent.GetGoodsConfig, null);
    },

    //请求自己道具
    requestGoods: function () {
        this.connector.emit(mpNetEvent.GetGoods, null);
    },

    requestBuyGoods: function (goodsID, count) {
        this.connector.emit(mpNetEvent.BuyGoods, {goodsID: goodsID, count: count});
    },
    //请求微信web登录的地址
    requestWXWebLoginAddr: function () {
        this.connector.emit(mpNetEvent.WXWebLoginAddr, {plaza: GNativeInfo.plaza});
    },

    //请求上期获奖名单
    requestLastSharePrizeDrawList: function (type) {
        this.connector.emit(mpNetEvent.GetLastSharePrizeDrawList, {type: type});
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //获取宝物信息
    requestDuoBaoGetPrizeInfo: function (prizeID) {
        this.connector.emit(mpNetEvent.DuoBaoGetPrizeInfo, {prizeID: prizeID});
    },

    //进入夺宝
    requestEnterDuoBao: function () {
        this.connector.emit(mpNetEvent.DuoBaoEnterDuoBao);
    },

    //退出夺宝
    requestOutDuoBao: function () {
        this.connector.emit(mpNetEvent.DuoBaoOutDuoBao);
    },

    //请求夺宝
    requestDuoBao: function (money, prizeID, shapeID) {
        this.connector.emit(mpNetEvent.DuoBaoDoDuoBao, {money: money, prizeID: prizeID, shapeID: shapeID});
    },

    //宝物记录
    requestDuoBaoPrizeLog: function (shapeID) {
        this.connector.emit(mpNetEvent.DuoBaoGetPrizeLog, {shapeID: shapeID});
    },
    //当前宝物押宝情况
    requestDuoBaoPrizeBetStat: function (prizeID, shapeID) {
        this.connector.emit(mpNetEvent.DuoBaoGetPrizeBetStat, {prizeID: prizeID, shapeID: shapeID});
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //发送手机验证码
    requestGenerateMobileCode: function (mobileNum, code,codeType) {
        this.connector.emit(mpNetEvent.GenerateMobileCode, {
            mobileNum: mobileNum,
            code: code,
            codeType:codeType,
            ip:mpGD.ipInfo.ip
        });
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    requestSetRecommendGameID: function (recommendGameID) {
        this.connector.emit(mpNetEvent.SetRecommendGameID, {
            recommendGameID: recommendGameID,
        });
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //设定手机验证级别， 0表示不验证， 1表示在陌生设备上登录需要验证， 2表示每次都验证
    requestSetMobileVerifyLevel: function (mobileVerifyLevel) {
        this.connector.emit(mpNetEvent.SetMobileVerifyLevel, {
            mobileVerifyLevel: mobileVerifyLevel,
        });
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 抢红包
     * @param id  红包ID
     */
    requestActivityHongBao: function (id) {
        this.connector.emit(mpNetEvent.ActivityRandomHongBao, {
            id: id,
        });
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 领取充值天天送红包
     */
    requestTakeActivityRechargeRebate: function () {
        this.connector.emit(mpNetEvent.TakeActivityRechargeRebate);
    },


    /**
     * 邀请码
     * @param code
     */
    requestTakePrizeReward: function (code) {
        this.connector.emit(mpNetEvent.TakePrizeCodeReward, {prizeCode: code});
    },

    /**
     * 领取微信分享集赞活动奖励
     */
    requestTakeActivityWXFXJZ: function () {
        this.connector.emit(mpNetEvent.TakeActivityWXFXJZ);
    },
    /**
     * 获取 红包雨记录
     */
    requestTakeActivityRedPackRainLog: function () {
        this.connector.emit(mpNetEvent.TakeActivityRedPackRainLog);
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    requestUseGoods: function (msg) {
        mpApp.showWaitLayer("正在发送请求");
        this.connector.emit(mpNetEvent.UseGoods, msg);
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 请求兑换现金红包
     * @param type      3 支付宝现金， 4微信现金，
     * @param payRMB   兑换金额， 单位元
     * @param realName 真名
     * @param outAccount 账号， 支付宝时需要填写
     */
    requestPayCash: function (type, payRMB, outRealName, outAccount) {
        this.connector.emit(mpNetEvent.PayCash, {
            type: type,
            payRMB: payRMB,
            outRealName: outRealName,
            outAccount: outAccount,
        });
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 摊位物品
     * @param msg
     */
    requestStoreGoods: function () {
        this.connector.emit(mpNetEvent.StoreGoods);
    },

    /**
     * 查询物品摊位数
     * @param msg
     */
    requestStoreGet: function (goodsID) {
        this.connector.emit(mpNetEvent.StoreGet, {goodsID: goodsID});
    },

    /**
     * 用户交易
     * @param msg
     */
    requestStoreBuy: function (sellerID, id, count) {
        mpApp.showWaitLayer("正在请求购买道具");
        this.connector.emit(mpNetEvent.StoreBuy, {sellerID: sellerID, id: id, count: count});
    },

    requestStoreBatchBuy: function (goodsID, payType, price, count) {
        mpApp.showWaitLayer("正在请求批量购买");
        this.connector.emit(mpNetEvent.StoreBatchBuy, {goodsID: goodsID, payType: payType, price: price, count: count});
    },

    /**
     * 上架物品
     * @param msg
     */
    requestStoreAdd: function (count, price, goodsID, payType) {
        this.connector.emit(mpNetEvent.StoreAdd, {count: count, price: price, goodsID: goodsID, payType: payType});
    },

    /**
     * 下架物品
     * @param msg
     */
    requestStoreDec: function (id) {
        this.connector.emit(mpNetEvent.StoreDec, {id: id});
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 开启每日签到
     */
    requestOpenDailyAttendance: function () {
        this.connector.emit(mpNetEvent.OpenDailyAttendance, null);
    },

    /**
     * 每日签到
     * @param date 日期
     * @param type 类型（签到|补签）
     */
    requestDailyAttendance: function (date, type) {
        this.connector.emit(mpNetEvent.DailyAttendance, {date: date, type: type});
    },

    /**
     * 幸运转盘
     * @param date
     */
    requestJqueryrotate: function (date) {
        this.connector.emit(mpNetEvent.Jqueryrotate, {date: date});
    },

    /**
     * 请求提现
     * @param date
     */
    requestDrawMoney: function (date,type) {
    var data = {
            drawscore: date,
            accountType:type
        };
        this.connector.emit(mpNetEvent.DrawMoney, data);
    },

    /**
     * 查询历史游戏成绩
     * @param type
     * @param moduleID
     * @param roomID
     * @param tableID
     * @param startIndex
     * @param queryCount
     * @param queryType
     */
    requestHistoricRecord: function (moduleID, roomID, tableID, startIndex, queryCount, queryType) {
        this.connector.emit(mpNetEvent.HistoricRecord, {
            moduleID: moduleID,
            roomID: roomID,
            tableID: tableID,
            startIndex: startIndex,
            queryCount: queryCount,
            queryType: queryType
        });
    },
    requestMyQuestion: function (content) {
    var data = {
            content: content,
        };
        this.connector.emit(mpNetEvent.MyQuestion, data);
    },
    requestDrawMoneyLog:function(){
    this.connector.emit(mpNetEvent.DrawMoneyLog);
    },
    //请求推广数据
    requestGetProxyInfo:function(){
        this.connector.emit(mpNetEvent.GetProxyInfo);
    },
    //我的玩家数据
    requestGetProxyPlayer:function(gameID, startIndex, queryCount){
        this.connector.emit(mpNetEvent.GetProxyPlayer,{
            gameID: gameID,
            index: startIndex,
            size: queryCount});

    },
    //我的业绩数据
    requestGetProxyYeji:function(){
        this.connector.emit(mpNetEvent.GetProxyYeji);
    },
    //我的奖励数据
    requestGetProxyLastWeekInfo:function(){
        this.connector.emit(mpNetEvent.GetProxyLastWeekInfo);
    },
    //领取奖励数据
    requestGetLingquJiangli:function(){
        this.connector.emit(mpNetEvent.GetLingquJiangli);
    },

    //代理申请提现操作(type 1提现到支付宝，2提现到余额，account_type(1代理支付宝收款，2 其它收款）)
    requestProxyTixian:function(tixian_account,tixian_name,tixiMoney,account_type,type){
        this.connector.emit(mpNetEvent.ProxyTixian,{
        tixian_account:tixian_account,
        tixian_name:tixian_name,
        type:type,
        money:tixiMoney,
        account_type:account_type
        });
    },
    //手动绑定上级代理ID
    requestBindLastProxyID:function(_lastGameID){
        var data = {
            lastGameID: _lastGameID,
        };
        this.connector.emit(mpNetEvent.BindLastProxyID, data);
    },
});