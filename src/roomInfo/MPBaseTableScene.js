/**
 * Created by Apple on 2016/8/22.
 */

/**
 * 基础椅子类
 */
var MPBaseChair = ccui.Widget.extend({
    _className: "MPBaseChair",
    _classPath: "src/roomInfo/MPBaseTableScene.js",

    table: null,
    playerSprite: null,         //人物精灵
    chairSprite: null,           //椅子精灵
    userInfo: null,         //玩家的用户信息
    config: null,          //椅子配置
    chairID: null,
    touchSitDownWidget: null,    //点击做下的区域
    ctor: function (chairID, config, table) {
        this._super();
        this.chairID = chairID;
        this.config = config;
        this.table = table;
        this.initEx();
    },
    initEx: function () {
        this.playerSprite = new cc.Sprite().to(this, this.config.playerZOrder).p(this.config.playerPos);
        this.chairSprite = new cc.Sprite("#res/plaza/table/chair/" + this.config.chairRes + ".png").to(this);

        this.touchSitDownWidget = new ccui.Widget().to(this, 100).p(this.config.sitDownPos);

        this.touchSitDownWidget.size(50, 50);
        // this.touchSitDownWidget.showHelp();
        this.touchSitDownWidget.setTouchEnabled(true);
        this.touchSitDownWidget.addClickEventListener(this.onClickChair.bind(this));
    },

    /**
     * 更新用户信息
     * @param userInfo
     */
    updateUserInfo: function (userInfo) {
        this.userInfo = userInfo;
        this.updateSprite();
    },

    updateSprite: function () {
        if (this.userInfo) {
            this.playerSprite.show();
            //计算出 bodyID
            var bodyID = this.table.room.calcBodyIDFromMoney(this.userInfo.score);
            var sexRes = this.userInfo.faceID % 2 == 0 ? "boy" : "girl";
            var status = this.userInfo.status == MPUserStatusConst.US_PLAYING ? "g" : "";
            this.playerSprite.display("#res/plaza/table/" + sexRes + "/" + bodyID + "/" + status + this.config.playerRes + ".png");
            this.chairSprite.display("#res/plaza/table/chair/" + this.config.chairRes2 + ".png");
        }
        else {
            this.playerSprite.hide();
            this.chairSprite.display("#res/plaza/table/chair/" + this.config.chairRes + ".png");
        }
    },

    onClickChair: function (sender) {

        if (this.userInfo) {
            ToastSystemInstance.buildToast("该座位上已经有人了");
        }
        else {
            mpGD.netHelp.requestUserSitDown(this.table.room.roomInfo.roomID, this.table.tableID, this.chairID);
            mpApp.showWaitLayer("正在请求坐下");
        }

        cc.log(this.chairID);
    },
});

/**
 * 锁
 */
// var MPBaseLock = ccui.Widget.extend({
//     _className: "MPBaseLock",
//     _classPath: "src/roomInfo/MPBaseTableScene.js",
//
//     isLock: null,
//     ctor: function (isLock) {
//         this.isLock = isLock;
//     },
//
//     onClick: function(){
//
//     },
// });

/**
 * 基础桌子类
 */
var MPBaseTable = FocusWidget.extend({
    _className: "MPBaseTable",
    _classPath: "src/roomInfo/MPBaseTableScene.js",


    room: null,                 //房间引用
    tableID: null,           //桌子ID
    chairArray: null,        //椅子数组
    chairCount: null,       //椅子数
    tableSprite: null,      //桌子精灵
    bitStatus: 0,           //桌子的状态, 如果第x位是1， 表示第x号椅子是游戏状态， 否则非游戏状态
    touchWeightArray: null,     //点击区域

    lockStatus: null,        //桌子是否加锁
    tableConfig: null,

    ctor: function (room, tableID, chairCount, size) {
        this._super();
        this.room = room;
        this.tableID = tableID;
        this.chairCount = chairCount;
        this.lockStatus = TableLockStatus.unlock;
        if (size) {
            this.ignoreContentAdaptWithSize(false);
            this.size(size);
        }

        this.initEx();
        if (this.room.roomInfo.roomCard == 1)
            this.initLock();
    },

    initEx: function () {
        this.tableConfig = mpTableConfig["base" + this.chairCount];

        this.tableSprite = new cc.Sprite("#res/plaza/table/table/" + this.tableConfig.tableRes + "/0.png").to(this).pp();
        new cc.LabelTTF(this.tableID + 1, GFontDef.fontName, 32).to(this).pp(0.5, 0);
        this.initChair();

    },

    initChair: function () {
        this.chairArray = [];
        this.touchWeightArray = [];
        for (var i = 0; i < this.chairCount; ++i) {

            var c = this.tableConfig.chairConfig[i];
            this.chairArray[i] = new MPBaseChair(i, c, this).to(this, c.zOrder).p(c.chairPos);

        }
    },

    /**
     * 初始化锁
     */
    initLock: function () {
        var self = this;

        this.lock = new FocusButton("res/img/room024.png", "res/room/room029.png", "", ccui.Widget.LOCAL_TEXTURE).to(this, -1).qscale(1.3).pp(0.5, 0).py(12).hide();
        //this.lock = new FocusButton("res/img/room024.png", "res/img/room029.png", "", ccui.Widget.LOCAL_TEXTURE).to(this, -1).qscale(1.3).pp(0.5, 0).py(12);
        this.lock.addClickEventListener(() => {
            if (self.lockStatus == TableLockStatus.unlock) {

                //限制道具
                var count = 0;
                for (var i = 0; i < mpGD.goodsSet.length; ++i) {
                    if (mpGD.goodsSet[i].goodsID == mpGoodsID.RoomCard) {
                        count = mpGD.goodsSet[i].count;
                        break;
                    }
                }
//                if (count <= 0) {
//                    ToastSystemInstance.buildToast("您的道具不足，请到商城购买道具。");
//                    return;
//                }

                //该桌位已经有人了
                for (var i = 0; i < this.chairArray.length; i++) {
                    if (this.chairArray[i].userInfo) {
                        ToastSystemInstance.buildToast("该桌子上已经有人了无法加锁！");
                        return;
                    }
                }

                self.lockStatus == TableLockStatus.lock;
                var tableInfo = {
                    roomID: self.room.roomInfo.roomID,
                    tableID: self.tableID
                }
                //创建密码输入框
                var layer = new MPInputPasswordLayer().to(cc.director.getRunningScene());

                layer.addNetEvent((event, data) => {
                    switch (event) {
                        case mpNetEvent.EnterGame:
                            if (!data.errMsg) {
                                layer.removeFromParent();
                            }
                            break;
                    }
                });
                layer.addSubmitCallBack(() => {
                    var chairID = null;

                    for (var i = 0; i < self.chairArray.length; i++) {
                        if (!self.chairArray[i].userInfo) {
                            mpGD.netHelp.requestUserSitDown(tableInfo.roomID, tableInfo.tableID, i, null, layer.getValue());
                            //console.log("正在设置密码"+tableInfo.roomID+"  "+tableInfo.tableID);
                            mpApp.showWaitLayer("正在设置密码！");
                            return;
                        }
                    }

                    ToastSystemInstance.buildToast("该桌子上已经满人了");
                });
            } else
                ToastSystemInstance.buildToast("该桌子已经加锁！");
        });

    },

    /**
     * 更新状态
     */
    updateTableInfo: function (tableInfo) {
        if (!this.lock)return;
        if (tableInfo.status == TableLockStatus.lock) {
            this.lock.setSelectedTexture();
        } else if (tableInfo.status == TableLockStatus.unlock) {
            this.lock.setNormalTexture();
        }
        this.lockStatus = tableInfo.status;
    },

    /**
     * 更新桌面精灵
     */
    updateTableSprite: function () {
        if (this.bitStatus) {
            this.tableSprite.display("#res/plaza/table/table/" + this.tableConfig.tableRes + "/1.png");
        }
        else {
            this.tableSprite.display("#res/plaza/table/table/" + this.tableConfig.tableRes + "/0.png");
        }
    },
    /**
     * 更新 用户信息
     * @param chairID
     * @param userInfo
     */
    updateUserInfo: function (chairID, userInfo) {
        this.chairArray[chairID].updateUserInfo(userInfo);

        var bit = 1 << chairID;
        //如果有人
        if (userInfo && userInfo.status == MPUserStatusConst.US_PLAYING) {
            this.bitStatus |= bit;
        }
        else {
            this.bitStatus &= ~bit;
        }
        this.updateTableSprite();
    },

    onClick: function () {
        var bool = false;

        for (var i = 0; i < this.chairArray.length; i++) {
            if (!this.chairArray[i].userInfo) {
                this.chairArray[i].onClickChair(this.chairArray[i]);
                return;
            }
        }
        ToastSystemInstance.buildToast("该桌子上已经满人了");
    },
});

/**
 * 基础桌子场景信息
 */
var MPBaseTableScene = MPFocusTableScene.extend({

    roomUserList: null,     //房间里的用户

    roomInfo: null,
    backBtn: null,
    listView: null,
    tableArray: null,           //桌子数组

    _className: "MPBaseTableScene",
    _classPath: "src/roomInfo/MPBaseTableScene.js",

    ctor: function (roomInfo) {
        this._super();
        ttutil.dump("------------------------------------------------");
        ttutil.dump(roomInfo);
        ttutil.dump("------------------------------------------------");
        this.roomInfo = roomInfo;
        this.initEx();
        this.initTV();
        mpGD.netHelp.addNetHandler(this);
        mpGD.netHelp.requestRoomUserList(this.roomInfo.roomID);
        mpGD.netHelp.requestGameRoomTableList(this.roomInfo.roomID);
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        //发送退出房间消息
        mpGD.netHelp.requestLevelRoom(mpGD.userStatus.roomID);
        mpGD.userStatus.roomID = null;
        this._super();
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.GameRoomUsers:
                this.onGameRoomUsers(data);
                break;
            case  mpNetEvent.GameRoomTables:
                this.onGameRoomTables(data);
                //玩家信息填充之后请求邀请链接
                this.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.onRoomInvitation.bind(this))));
                break;
            case mpNetEvent.EnterGame:

                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    mpGD.userStatus.tableID = data.tableID;
                    mpApp.loadSubGame(this.roomInfo.moduleID, data.serverIP, this.roomInfo.gamePort);
                }
                if (data.failCode) {
                    switch (data.failCode) {
                        case SitdownResultCode.PWD_REQUIRED: //进入房间需要密码
                            //创建密码输入框
                            var layer = new MPInputPasswordLayer().to(cc.director.getRunningScene());
                            var tableInfo = data.tableInfo;
                            layer.addNetEvent((event, data) => {
                                switch (event) {
                                    case mpNetEvent.EnterGame:
                                        if (!data.errMsg) {
                                            layer.removeFromParent();
                                        }
                                        break;
                                }
                            });
                            layer.addSubmitCallBack(() => {
                                mpGD.netHelp.requestUserSitDown(tableInfo.roomID, tableInfo.tableID, tableInfo.chairID ? tableInfo.chairID : 0, layer.getValue());
                                mpApp.showWaitLayer("进入房间！");
                            });

                            break;
                    }
                }

                break;
            //玩家进出房间
            case mpNetEvent.UserOnlineList:
                this.onUserFlow(data);
                break;
            //玩家状态改变
            case mpNetEvent.UsersGameStatus:
                this.onUserStatus(data);
                break;
            case mpNetEvent.RoomUserInfoUpdate:
                this.onUserInfoUpdate(data);
                break;
            case  mpNetEvent.TableStatus:
                this.tableArray[data.tableID].updateTableInfo(data);
                break;
            case mpNetEvent.UpdateGoods:
                mpApp.updateGoodsSet(data);
                break;
        }
    },

    /**
     * 用户分数改变
     * @param data
     */
    onUserInfoUpdate: function (data) {

        if (!this.roomUserList) {
            return;
        }
        for (var i = 0; i < this.roomUserList.length; ++i) {

            if (this.roomUserList[i].userID == data.userID) {
                var oldUserInfo = this.roomUserList[i];
                oldUserInfo.score = data.score;

                if (oldUserInfo.tableID != null && oldUserInfo.status != MPUserStatusConst.US_FREE) {
                    this.tableArray[oldUserInfo.tableID].updateUserInfo(oldUserInfo.chairID, oldUserInfo);
                }
                break;
            }
        }
    },

    /**
     * 用户状态改变
     * @param data
     */
    onUserStatus: function (data) {

        if (!this.roomUserList) {
            return;
        }
        for (var i = 0; i < this.roomUserList.length; ++i) {
            if (this.roomUserList[i].userID == data.userID) {

                var oldUserInfo = this.roomUserList[i];

                //很暴力。。。
                //旧的清空
                if (oldUserInfo.tableID != null) {
                    this.tableArray[oldUserInfo.tableID].updateUserInfo(oldUserInfo.chairID, null);
                }
                oldUserInfo.tableID = data.tableID;
                oldUserInfo.chairID = data.chairID;
                oldUserInfo.status = data.status;

                if (oldUserInfo.tableID != null && oldUserInfo.status != MPUserStatusConst.US_FREE) {
                    this.tableArray[oldUserInfo.tableID].updateUserInfo(oldUserInfo.chairID, oldUserInfo);
                }
                break;
            }
        }
    },

    /**
     * 当用户流动
     * @param data
     */
    onUserFlow: function (data) {

        if (!this.roomUserList) {
            return;
        }
        if (data.Action == "In") {
            this.roomUserList.push(data);
        }
        else if (data.Action == "Out") {
            for (var i = 0; i < this.roomUserList.length; ++i) {
                if (this.roomUserList[i].userID == data.userID) {
                    var tableID = this.roomUserList[i].tableID;
                    var chairID = this.roomUserList[i].chairID;

                    //先起立
                    if (tableID != null && chairID != null) {
                        this.tableArray[tableID].updateUserInfo(chairID, null);
                    }
                    this.roomUserList.splice(i, 1);
                    break;
                }
            }
        }

    },
    /**
     * 清除所有的桌子状态
     */
    clearAllTable: function () {
        for (var i = 0; i < this.tableArray.length; ++i) {
            var table = this.tableArray[i];
            for (var j = 0; j < table.chairArray.length; ++j) {
                table.updateUserInfo(j, null);
            }
        }
    },

    /**
     * 房间玩家列表
     * @param userInfoList
     */
    onGameRoomUsers: function (userInfoList) {


        this.clearAllTable();

        this.roomUserList = userInfoList;
        for (var i = 0; i < userInfoList.length; ++i) {
            var userInfo = userInfoList[i];
            if (userInfo.tableID != null && userInfo.chairID != null) {
                this.tableArray[userInfo.tableID].updateUserInfo(userInfo.chairID, userInfo);
            }
        }
    },

    /**
     *
     */
    onGameRoomTables: function (tableInfoList) {

        for (var i = 0; i < tableInfoList.length; i++) {
            var tableInfo = tableInfoList[i];

            if (tableInfo) {
                this.tableArray[tableInfo.tableID].updateTableInfo(tableInfo);
            }
        }
    },

    initEx: function () {
        this.size(mpV.w, mpV.h);
        new cc.Sprite("res/table/bg.jpg").to(this).pp();

        this.initTopGui();
        this.listView = this.buildListView().to(this);

        var rowNum = Math.ceil(this.roomInfo.tableCount / this.getCustomTableNum());

        this.tableArray = [];
        for (var i = 0; i < rowNum; ++i) {
            this.listView.pushBackCustomItem(this.buildCustomItem(i));
        }
    },


    buildListView: function () {
        var listView = new FocusListView();
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);
        listView.setContentSize(mpV.w, mpV.h - 100);
        listView.setItemsMargin(10);
        return listView;
    },

    onEnter: function () {
        this._super();
        //调整成大厅的分辨率
        mpApp.switchScreen(native.SCREEN_ORIENTATION_LANDSCAPE, cc.size(mpV.w, mpV.h), mpV.ResolutionPolicy);

        //邀请链接
        // this.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.onRoomInvitation.bind(this))));
    },

    /**
     * 返回每行几张桌子
     * @returns {number}
     */
    getCustomTableNum: function () {
        return 3;
    },

    /**
     * 创建桌子方法， 请重写
     * @param tableID
     */
    buildTable: function (tableID) {
        return new MPBaseTable(this, tableID, this.roomInfo.chairCount, cc.size(250, 250));
    },

    /**
     * 每一行 的桌子
     * @returns {*}
     */
    buildCustomItem: function (rowIndex) {

        var widget = new ccui.Widget().size(mpV.w, 300);

        var perRowNum = this.getCustomTableNum();

        var tableSize;
        var stepPPX = 1 / (perRowNum + 1);

        for (var i = 0; i < perRowNum; ++i) {

            var table = this.buildTable(rowIndex * perRowNum + i);
            G_SHOW_HELP && table.showHelp();
            table.to(widget).pp(stepPPX * (i + 1), 0.5);
            if (!tableSize) {
                tableSize = table.size();
            }
            this.tableArray.push(table);
        }
        widget.size(mpV.w, tableSize.height + 50);
        return widget;
    },

    /**
     * 顶部的返回按钮跟快速开始， 还有房间图标
     */
    initTopGui: function () {
        new cc.LayerColor(cc.color(0x0, 0x0, 0x0, 0x50)).size(mpV.w, 100).p(0, mpV.h - 100).to(this);

        this.backBtn = new FocusButton("res/img/icon_back.png", "", "", ccui.Widget.LOCAL_TEXTURE);
        this.backBtn.to(this).p(50, mpV.h - 50);
        var self = this;
        this.backBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                if (!self.onClosePre || self.onClosePre()) {
                    self.close();
                }
            }
        });

        this.quickBtn = new FocusButton("res/img/19.png", "", "", ccui.Widget.LOCAL_TEXTURE);
        this.quickBtn.to(this).p(mpV.w / 2, mpV.h - 50);
        new cc.Sprite("res/img/79.png").to(this.quickBtn).pp(0.5, 0.57);

        this.quickBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                self.onClickQuick && self.onClickQuick();
            }
        });

        this.swallowKeyboard(function () {
            if (!self.onClosePre || self.onClosePre()) {
                self.close();
            }
        });

    },

    /**
     * 根据 身上的钱 计算 人物ID
     * @param money
     * @returns {*}
     */
    calcBodyIDFromMoney: function (money) {

        var moneyLevel = [1000, 10000, 100000, 3000000, 10000000, 20000000, 50000000, 100000000, 300000000];
        for (var i = 0; i < moneyLevel.length; ++i) {
            if (moneyLevel[i] >= money) {
                return i;
            }
        }

        return moneyLevel.length;
    },

    close: function () {
        cc.director.popScene();
    },
    //点击关闭前触发， 返回true 才会关闭
    onClosePre: function () {
        return true;
    },
    /**
     * 点击快速开始时触发
     */
    onClickQuick: function () {
        mpGD.netHelp.requestUserSitDown(this.roomInfo.roomID);
        mpApp.showWaitLayer("正在请求快速加入");
    },

    //邀请链接入桌
    onRoomInvitation: function () {
        if (!mpGD.inviteTable)return;

        if (this.roomInfo.roomID != mpGD.inviteTable.roomID && !mpGD.inviteTable.tableID && !mpGD.inviteTable.chairID) {
            //清除邀请链接
            mpGD.inviteTable = null;
            ToastSystemInstance.buildToast("邀请信息错误");
            return;
        }

        var table = this.tableArray[mpGD.inviteTable.tableID];

        for (var i = 0; i < table.chairArray.length; i++) {
            if (!table.chairArray[i].userInfo) {
                mpGD.netHelp.requestUserSitDown(mpGD.inviteTable.roomID, mpGD.inviteTable.tableID, i, null, null, mpGD.inviteTable.uuid);
                //清除邀请链接
                mpGD.inviteTable = null;
                return;
            }
        }
        ToastSystemInstance.buildToast("该桌子上已经满人了");
        //清除邀请链接
        mpGD.inviteTable = null;
        // 自动点击桌子  测试代码 免uuid
        // this.tableArray[mpGD.inviteTable.tableID].onClick();
        // this.tableArray[mpGD.tableID].

    },

});