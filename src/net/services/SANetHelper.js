/**
 * Created by orange on 2016/9/30.
 */

var SANetHelper = cc.Class.extend({
    _className: "SANetHelper",
    _classPath: "src/net/services/SANetHelper.js",


    connector: null,
    addNetHandler: null,
    removeNetHandler: null,
    isConnect: false,
    isLogin: false,

    autoTimer: null,

    ctor: function () {
        //初始化网络链接
        this.connector = new Connector();
        this.connector.addNetHandler(this);

        this.addNetHandler = this.connector.addNetHandler.bind(this.connector);
        this.removeNetHandler = this.connector.removeNetHandler.bind(this.connector);

        //初始化网络链接
        this.connector.connect(mpApp.getSaURL());
        this.registerEvents();
    },

    registerEvents: function () {
        //注册事件
        for (var attr in mpSANetEvent) {
            mpSANetEvent[attr] && this.connector.registerEvent(mpSANetEvent[attr]);
        }
    },

    addNetHandler: function () {

    },

    removeNetHandler: function () {

    },

    onNetEvent: function (eventName, data) {

        switch (eventName) {
            case "connect":
                this.isConnect = true;
                //先自动登录一下
                this.autoLogin();
                clearTimeout(this.autoTimer);

                //心跳循环
                this.pingServer()
                break;

            case "disconnect":
                this.isConnect = false;
                this.isLogin = false;

                this.autoReconnect();
                break;

            case "error":
                this.isConnect = false;
                this.autoReconnect();
                break;

            case mpSANetEvent.Login:

                if (data.errMsg) {
                    return;
                }

                if (data.loginSuccess) {
                    this.isLogin = true;
                    this.getFriendList();
                    this.getFriendRequest();
                    cc.log("大厅辅助服登录验证成功");
                }

                break;
            case "Pong":
                this.onPong(data)
                break;
            case mpSANetEvent.GetFriendList:
                mpGD.friendList = data.list;
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

    /**
     * 心跳返回
     */
    onPong: function (data) {

        cc.log("pong",Date.now()-data)
    },

    autoReconnect: function () {
        var self = this;

        clearTimeout(this.autoTimer);
        this.autoTimer = setTimeout(function () {
            self.reconnect();
        }, 3000);
    },

    autoLogin: function () {
        if (mpGD.netHelp.getLoginStatus())
            this.requestLogin();
    },

    reconnect: function () {

        if (!this.connector.isConnecting && !this.connector.isConnect) {
            // this.connector.connect(mpApp.getSaURL());
            this.registerEvents();
        }
    },

    emit: function (event, data) {
        if (this.isConnect)
            this.connector && this.connector.emit(event, data);
    },

    //请求验证码地址
    requestCodeAddr: function () {
        var os = cc.sys.os;
        if (os == cc.sys.OS_ANDROID && G_PLATFORM_TV)
            os = "Android_TV";

        this.connector.emit("CodeAddr", {channel: native.getUmengChannel(), os: os});
    },

    /**
     * 登出 重连
     */
    logout: function () {
        this.emit(mpSANetEvent.Logout, null);
        this.isLogin = false;
    },

    /**
     * 登录
     */
    requestLogin: function () {
        this.emit(mpSANetEvent.Login, {userID: mpGD.userInfo.userID});
    },


    /**
     * 请求使用道具
     * @param msg
     */
    requestUseBroadcast: function (msg) {
        this.emit(mpSANetEvent.UseBroadcast, {msg: msg, count: 1, goodsID: mpGoodsID.Broadcast})
    },

    /**
     * 发送子游戏聊天信息
     * @param msg
     */
    sendRoomMessage: function (data) {
        this.emit(mpSANetEvent.SubgameChat, data);
    },

    /**
     * 发送好友聊天信息
     * @param msg
     */
    sendFriendMessage: function (data) {
        this.emit(mpSANetEvent.FriendChat, data);
    },

    /**
     * 获取语音消息
     * @param msg
     */
    getVoiceMsg: function (id) {
        this.emit(mpSANetEvent.GetVoiceMsg, {id: id});
    },

    /**
     * 发送玩家反馈
     * @param msg
     */
    sendUserFeedback: function (data) {
        this.emit(mpSANetEvent.UserFeedback, data);
    },

    /**
     * 发送好友请求
     * @param msg
     */
    sendAddFriendRequest: function (friendID) {
        var refuseFlag = mpGD.storage.getValue("refuseFlag" + mpGD.userInfo.userID + friendID);
        if (refuseFlag && refuseFlag == "TRUE") {
            ToastSystemInstance.buildToast("对方拒绝再接收您的好友请求！");
            return;
        }

        if (mpGD.friendList) {
            for (var i = 0; i < mpGD.friendList.length; i++) {
                if (mpGD.friendList[i].userID == friendID) {
                    ToastSystemInstance.buildToast("对方已经是您的好友！");
                    return;
                }
            }
        }

        //今日请求次数
        var requestCount = mpGD.storage.getValue("requestCount" + mpGD.userInfo.userID + friendID) || 0;
        requestCount = parseInt(requestCount);
        //最后请求时间
        var lastRequestTime = mpGD.storage.getValue("lastRequestTime" + mpGD.userInfo.userID + friendID);

        if (lastRequestTime) {
            lastRequestTime = new Date(lastRequestTime);
            var old_year = lastRequestTime.getFullYear();
            var old_month = lastRequestTime.getMonth();
            var old_day = lastRequestTime.getDay();

            var nowTime = new Date();
            var now_year = nowTime.getFullYear();
            var now_month = nowTime.getMonth();
            var now_day = nowTime.getDay();

            if (now_year >= old_year && now_month >= old_month && now_day > old_day) {
                requestCount = 0;
            }

            if (nowTime.getTime() - lastRequestTime.getTime() < 31000) {
                // ToastSystemInstance.buildToast("已发送好友请求，30秒后才能再次发送！");
                ToastSystemInstance.buildToast("对同一名玩家发送好友请求需要间隔30秒！");
                return;
            }
        }

        if (requestCount && requestCount > 10) {
            ToastSystemInstance.buildToast("今天对该玩家的好友请求已达上限！");
            return;
        }

        this.emit(mpSANetEvent.AddFriend, {friendID: friendID});
    },

    /**
     * 根据gameID添加好友
     * @param gameID
     */
    addFriendByGameID: function (gameID) {
        this.emit(mpSANetEvent.AddFriendByGameID, {gameID: gameID});
    },

    /**
     * 同意好友请求
     * @param friendID
     */
    sendSureAddFriendRequest: function (friendID) {
        this.emit(mpSANetEvent.SureAddFriendRequest, {friendID: friendID});
    },

    /**
     * 拒绝好友请求
     * @param msg
     */
    sendRefuseAddFriendRequest: function (friendID, refuseFlag) {
        this.emit(mpSANetEvent.RefuseAddFriendRequest, {friendID: friendID, refuseFlag: refuseFlag});
    },

    /**
     * 删除好友
     * @param msg
     */
    sendDelFriendRequest: function (friendID) {
        this.emit(mpSANetEvent.DelFriend, {friendID: friendID});
    },

    /**
     * 获取好友列表
     * @param msg
     */
    getFriendList: function () {
        this.emit(mpSANetEvent.GetFriendList, null);
    },

    /**
     * 获取玩家聊天记录
     * @param msg
     */
    getChatLog: function (sendUserID, receiveUserID, channel) {
        this.emit(mpSANetEvent.GetChatLog, {sendUserID: sendUserID, receiveUserID: receiveUserID, channel: channel});
    },

    /**
     * 请求分享的订单
     */
    requestShareOrder: function (type,wxScene) {
        this.emit(mpSANetEvent.GetShareOrder, {type: type,wxScene:wxScene})
    },


    //发送分享结果
    sendShareResult: function (shareID, errCode, openID, ip) {
        this.emit(mpSANetEvent.ShareResult, {shareID: shareID, errCode: errCode, openID: openID, ip: ip})
    },

    /**
     * 获取榜单,
     * @param type   0表示充值榜、1表示赢榜、2表示输榜
     * @param timeType -1表示昨天， 0表示今天
     */
    requestRanking: function (type, timeType) {
        this.emit(mpSANetEvent.GetRanking, {type: type, timeType: timeType})
    },

    /**
     * 发起合伙拆红包
     */
    requestHeHuoChaiHongBaoGenerate: function (unionID) {
        this.emit(mpSANetEvent.HeHuoChaiHongBaoGenerate, {unionID: unionID})
    },

    /**
     * 发送反馈
     * @param feedback
     */
    requestFeedback: function (feedback, code) {

        //userAgent是 网页特有的， 这边先随便传了
        this.emit(mpSANetEvent.SendFeedback, {
            userAgent: cc.sys.platform,
            feedback: feedback,
            dev: cc.sys.os,
            code: code
        });
    },

    /**
     *  获取好友商店列表
     */
    requestGetFriendStoreList: function () {
        this.emit(mpSANetEvent.GetFriendStoreList, {});
    },

    /**
     * 获取摊位列表
     * @param type
     */
    requestGetStoreRanking: function (userID) {
        this.emit(mpSANetEvent.GetStoreRanking);
    },

    /**
     * 获取玩家排行，  和排行榜逻辑分开写了
     * @param type
     */
    requestGetUserRanking: function (type) {
        this.emit(mpSANetEvent.GetUserRanking, {type: type});
    },

    /**
     * 获取好友请求
     */
    getFriendRequest: function () {
        this.emit(mpSANetEvent.GetFriendRequest, {});
    },
    //请求支付充值配置（以前写在主服务里）
    requestPayConfig: function () {
        this.emit(mpSANetEvent.ReadPayConfig, {});
    },
    //请求vip充值代理列表
    requestGetVipPayList: function () {
        this.emit(mpSANetEvent.GetVipPayList, {});
    },
    //请求充值
    requestPay: function (type, money, kind, productId, goodsID, goodsNum) {

        this.connector.emit(mpSANetEvent.RequestPay, {
            money: money,
            type: type,
            channel: kind,
            productId: productId,
            goodsID: goodsID,           //道具ID  如果有goodsID, 则指定充值的钱直接用来购买道具, money不用填
            goodsNum: goodsNum,          //道具数量  道具数量
			os: cc.sys.os,
            ip: mpGD.ipInfo.ip
        });
    },
    //请求微信和QQ客服号码
    requestKefuNumber: function () {
        this.emit(mpSANetEvent.KefuNumber, {});
    },
});