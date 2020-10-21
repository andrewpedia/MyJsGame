/**
 * Created by Apple on 2016/7/5.
 */

/**
 * 基础房间场景
 */
var MPBaseRoomScene = cc.Scene.extend(FocusBase).extend({

    roomInfoArray: null,
    moduleID: null,
    onEnterGameRoomListener: null,

    selectRoomInfo: null,

    backBtn: null,
    isAutoEnterGame: false,             //是否是自动进入游戏的

    _className: "MPBaseRoomScene",
    _classPath: "src/scene/MPBaseRoomScene.js",

    ctor: function (moduleID, roomInfoArray) {
        this._super();
        mpGD.userStatus.moduleID = moduleID;
        var size = cc.director.getWinSize();
        this.bgSprite = new cc.Sprite("res/img/gui-Login-background3.jpg").to(this).p(size.width / 2,size.height / 2).qscale(1.1);

        var self = this;
        self.buildBackBtn();


        if (typeof app != "undefined") {
            var config = app.getConfig && app.getConfig();
            config = config || {};
            config.designResolutionSize = config.designResolutionSize || (cc.size(mpV.h, mpV.w));
            //切换成子游戏所要求的模式
            mpApp.switchScreen(config.requestedOrientation, config.designResolutionSize, config.resolutionPolicy);
        }

        this.moduleID = moduleID;
        this.roomInfoArray = roomInfoArray;
    },

    buildBackBtn: function () {
        this.backBtn = new FocusButton();
        this.backBtn.loadTextureNormal("res/img/icon_back.png", ccui.Widget.LOCAL_TEXTURE);

        var winSize = cc.director.getWinSize();

        this.backBtn.to(this, 100).p(50, winSize.height - 50);
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

        this.swallowKeyboard(function () {
            if (!self.onClosePre || self.onClosePre()) {
                self.close();
            }
        });
    },


    onEnter: function () {
        this._super();

        //监听进入游戏房间事件
        this.onEnterGameRoomListener = cc.eventManager.addCustomListener(mpEvent.EnterGameRoom, this.onEnterGameRoom.bind(this));
        mpGD.netHelp.addNetHandler(this);

        //如果是自动进入房间的， 则切换回来时， 直接回到大厅
        if (this.isAutoEnterGame) {
            var self = this;
            this.runAction(cc.callFunc(function () {
                //这边要调用 close, 而不能直接    cc.director.popScene();, 因为要释放脚本
                self.close();
            }));
        } else {
            //不是自动进入房间 判断一次是否是邀请进入
            this.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(this.onRoomInvitation.bind(this))));

        }
    }
    ,

    //标志场景是会自动跳转到子游戏的
    markAutoEnterGame: function () {
        this.isAutoEnterGame = true;
    },

    /**
     * 当用户点击进入游戏房间
     * @param roomInfo
     */
    onEnterGameRoom: function (event) {

        var roomInfo = event.getUserData();

        //过滤
        if (roomInfo.moduleID != 3 && roomInfo.moduleID != 215 && roomInfo.moduleID != 214 && roomInfo.moduleID != 24 && roomInfo.moduleID != 25) {
            if (mpGD.userInfo.score < roomInfo.enterScore) {
                ToastSystemInstance.buildToast("进入此游戏房间需要 " + roomInfo.enterScore + CURRENCY + "！");
                return;
            }
        }

        mpGD.userStatus.roomID = roomInfo.roomID;
        mpGD.userStatus.roomName = roomInfo.roomName;
        this.selectRoomInfo = roomInfo;

        //如果是防作弊
        if (roomInfo.cheatProof) {
            //请求玩游戏
            mpApp.showWaitLayer("连接房间,请求进入游戏...");
            mpGD.netHelp.requestPlayGame(roomInfo.roomID);
            mpGD.userStatus.cheatProof = true;
        }
        else {
            mpApp.showWaitLayer("连接房间中");
            mpGD.userStatus.cheatProof = false;
            //请求进入房间， 再请求坐下
            mpGD.netHelp.requestEnterRoom(roomInfo.roomID);
        }


    },

    cleanup: function () {
        mpApp.exitGameModules();
        //切换为横屏
        mpApp.switchScreen(native.SCREEN_ORIENTATION_LANDSCAPE, cc.size(mpV.w, mpV.h), mpV.ResolutionPolicy);

        this._super();
    },

    close: function () {
        cc.director.popScene();

        cc.log("MPBaseRoomScene close")
        if (!cc.sys.isNative)
            cc.director.runScene(mpGD.mainScene);

        mpApp.exitGameModules();
        //console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.EnterGame:
                mpApp.removeWaitLayer();
                if (this.selectRoomInfo.cheatProof) {
                    if (!data.errMsg) {
                        mpApp.loadSubGame(this.selectRoomInfo.moduleID, data.serverIP, this.selectRoomInfo.gamePort);
                    }
                }
                break;
            case mpNetEvent.EnterRoom:
                mpApp.removeWaitLayer();
                if (!this.selectRoomInfo.cheatProof) {
                    //运行桌子场景
                    if (!data.errMsg) {
                        mpApp.runTableScene(this.selectRoomInfo);
                    }
                }
                break;
            case mpNetEvent.VerifyUser:
                // if (this.moduleID) {
                //     cc.log("登录房间成功, 房间场景重连请求进入", this.moduleID)
                //     mpGD.netHelp.requestRoomList(this.moduleID) //必须请求下列表 服务器才当做他点击了
                // }
                break;
        }
    },

    // 更新tv手指规则
    refreshFocus: function () {
        var arrayItems = this.listView.getItems();
        this.backBtn.setNextFocus(null, arrayItems[0], null, null);
        this.listView.bindNextFocus(this.backBtn, null);
        // mlog("refreshFocus refreshFocus");
    },

    onEnterTransitionDidFinish: function () {
        this._super();
        // 检验子游戏加载的资源是否有大厅一样的路径
        if (cc.sys.platform == 101) {
            for (var i = 0; i < web_resources.length; i++) {
                var mRes = web_resources[i];
                if (mpGD.startupRes.indexOf(mRes) > 0) {
                    console.log("资源路径名重复：", mRes);
                }
            }
        }


        if (!this.useKeyboard)
            return;
        // 手指移动到回退按钮
        this.setFocusSelected(this.backBtn);

        this.keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        // 上下左右 按下状态
                        // mlog("refreshFingerFocus");
                        this.refreshFocus && this.refreshFocus();
                        var nextFocus = this.shared.selected.getNextFocus(code);
                        this.setFocusSelected(nextFocus);
                        break;

                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        break;
                }

            }.bind(this),
            onKeyReleased: function (code, event) {

                switch (code) {
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        this.shared.selected.onClick && this.shared.selected.onClick();
                        break;
                }
            }.bind(this),
        });
        cc.eventManager.addListener(this.keyboardListener, -1);
    },

    onExit: function () {
        this._super();

        cc.eventManager.removeListener(this.onEnterGameRoomListener);
        mpGD.netHelp.removeNetHandler(this);
        this.keyboardListener && cc.eventManager.removeListener(this.keyboardListener);
    },

    //邀请链接入桌
    onRoomInvitation: function () {
        if (!mpGD.inviteTable)return;

        for (var i = 0; i < this.roomInfoArray.length; i++) {
            if (this.roomInfoArray[i].roomID == mpGD.inviteTable.roomID) {
                this.touchEventListener && this.touchEventListener(this.listView.getItems()[i], ccui.Widget.TOUCH_ENDED);
                return;
            }
        }
        //数据出错则清空
        mpGD.inviteTable = null;
    },

});
