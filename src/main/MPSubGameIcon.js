/**
 * Created by 真心科技 on 2016/1/27.
 */

var MPDownloadProgressTimer = cc.Node.extend({
    _className: "MPDownloadProgressTimer",
    _classPath: "src/main/MPSubGameIcon.js",


    progressTimer1: null,
    progressTimer2: null,
    bgSprite: null,
    progressLabel: null,
    progressValue: null,

    needDownloadIcon: null,         //需要下载的图标

    ctor: function (itemSize) {
        this._super();
        this.initEx(itemSize);
        this.itemSize = itemSize;
    },
    initEx: function (itemSize) {

        this.needDownloadIcon = new cc.Sprite("#hall_download_mark.png").to(this).p(itemSize.width / 2 - 78 / 2,itemSize.height / 2 - 53 / 2);

    },


    //开始下载
    startDownload: function () {

        this.bgSprite = new cc.Sprite("#hall_download_progress_bg.png").to(this);

        //因为进度条的光效也要跟着进度， cc.ProgressTimer又不支持子结点。。所以只好分成两个

        var sprite =  new cc.Sprite("#hall_download_progress_ft.png").anchor(0,0.5);

        this.progressTimer1 = new ccui.ScrollView().to(this).anchor(0,0.5).pp(-0.5,0.5);
        this.progressTimer1.x = sprite.cw() * -0.5;
        //this.progressTimer1.setClippingEnabled(true);
        this.progressTimer1.setScrollBarEnabled(false);

        this.progressTimer1.size(0,sprite.height);
        sprite.to(this.progressTimer1).p(0,sprite.ch() / 2);
        this.progressTimer1TotalWidth = sprite.width;

        // this.progressTimer1.setType(cc.ProgressTimer.TYPE_BAR);
        // this.progressTimer1.setMidpoint(cc.p(0,0.5));
        //百分比值放在光效下
        this.progressLabel = new cc.LabelTTF("0%", GFontDef.fontName, 16).to(this).p(-2, 5).hide();
        this.progressValue = 0;

        this.progressTimer2 = new cc.ProgressTimer(new cc.Sprite("#hall_download_progress_ft.png")).to(this).hide();
    },

    downloadFinish: function () {
        this.progressLabel.hide();
    },

    /**
     * 设置进度， 0到100
     * @param percentage
     */
    setPercentage: function (percentage) {

        if (isNaN(percentage))
            percentage = 0;

        this.progressTimer1.width = this.progressTimer1TotalWidth * percentage / 100;
        this.progressTimer2.setPercentage(percentage);
        //this.progressValue = Math.floor(this.progressTimer1.getPercentage());
        this.progressLabel.setString(this.progressValue + "%");
    },
});


var MPSubGameIcon = FocusWidget.extend({
    bgMask: null,               //降低暗度的 遮罩层
    moduleID: null,
    _status: mpSubGameStatus.UnCheck,
    downloadProgressTimer: null,
    waitSprite: null,               //等待状态
    waitBgSprite: null,               //等待状态

    norSprite: null,        //正常
    selectSprite: null,      //选中
    shadow: null,           //倒影
    lightEffect: null,       //光效

    canClick: true,        //是否可以被点击

    // longTouch: false,      //是否长按
    // longTouchAction: false,  //倒计时设置长按的动作

    removeBtn: null,   //删除子游戏按钮

    _className: "MPSubGameIcon",
    _classPath: "src/main/MPSubGameIcon.js",

    ctor: function (moduleID,itemSize) {
        this._super();

        this.moduleID = moduleID;
        this.initEx(itemSize);

        // TV 有用 暂时不用删除
        this.onClick = this.onClicked;
    },

    initEx: function (itemSize) {

        this.size(itemSize.width, itemSize.height);
        G_SHOW_HELP && this.showHelp();
        var content = this.getContentSize();
        this.setTouchEnabled(true);


        var iconIndex = this.moduleID;

        if (forReview) {
            iconIndex = "review-" + iconIndex;
        }

        //由于没有资源， 暂时全设定为203

        // if (!cc.spriteFrameCache.getSpriteFrame("res/gui/file/gui-hall-game-" + iconIndex + ".png")) {
        //     iconIndex = "next";
        //     // this.canClick = false;
        // }

        // this.selectSprite = new cc.Sprite("#res/gui/file/gui-hall-game-" + iconIndex + "-click.png").to(this).pp().hide();

        //加载特效
        if (mpGD && mpGD.subGameIcoEffect[this.moduleID]) {
            console.log(mpGD.subGameIcoEffect[this.moduleID]);
            this.iconSprite = new cc.Sprite( "#" + mpGD.subGameIcoEffect[this.moduleID]).to(this).pp();

        }

        //倒影
        // this.shadow = new cc.Sprite("#res/gui/file/gui-hall-game-" + iconIndex + "-shadow.png").to(this).anchor(0.5, 1).pp(0.51, 0.15);


        //添加点击事件
        this.addTouchEventListener(this.onWidgetTouchCallback.bind(this));


        //光效
        // this.lightEffect = new ccs.Armature("youxitubiaosaoguang_dating");
        // this.lightEffect.to(this).pp(0.49, 0.22).hide();

        //版本需要更新
        if (cc.sys.isNative && cc.game.config.runGamesUpdate && mpGD.subGameInfoMap[this.moduleID].version != mpApp.getLocalVersion(this.moduleID)) {
            this.downloadProgressTimer = new MPDownloadProgressTimer(itemSize).to(this).pp(0.5, 0.5);
            mpGD.subGameInfoMap[this.moduleID].status = mpSubGameStatus.UnCheck;
        }
        else {
            this.status = mpSubGameStatus.Ready;
            mpGD.subGameInfoMap[this.moduleID].status = mpSubGameStatus.Ready;
            //this.initRemoveBtn();
        }


    },

    //处理touch事件
    onWidgetTouchCallback: function (sender, type) {
        //console.log('touksldkfjalsdkjfaldfkj')
        if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
            this.setNormal();
            // this.stopLongTouchAction();
        }
        else if (type == ccui.Widget.TOUCH_BEGAN) {
            this.setSelected();
            // this.startLongTouch();
        }

        if (type == ccui.Widget.TOUCH_ENDED)
            this.onClicked();
    },

    //选中状态
    setSelected: function () {
        // this.selectSprite.show();
        // this.norSprite.hide();
    },
    //正常状态
    setNormal: function () {
        // this.selectSprite.hide();
        // this.norSprite.show();
    },

    //暂时注释，后续再删除
    // startLongTouch: function () {
    //     this.stopLongTouchAction();
    //
    //     var that = this;
    //     this.longTouchAction = this.runAction(cc.sequence(
    //         cc.delayTime(2),
    //         cc.callFunc(function () {
    //             that.longTouch = true;
    //             new MPMessageBoxLayer("提 示", "您确定要删除子游戏吗?", mpMSGTYPE.MB_OKCANCEL, function () {
    //                 that.processLongTouch();
    //             }, null).to(cc.director.getRunningScene());
    //             that.longTouchAction = false;
    //         })
    //     ));
    // },

    // 点击删除子游戏按钮
    clickRemoveBtn: function () {
        var that = this;
        new MPMessageBoxLayer("提 示", "您确定要删除子游戏吗?", mpMSGTYPE.MB_OKCANCEL, function () {
            that.processLongTouch();
            that.hideRemoveBtn();
        }, null).to(cc.director.getRunningScene());
    },

    //暂时注释
    // stopLongTouchAction: function () {
    //     if (this.longTouchAction)
    //     {
    //         this.stopAction(this.longTouchAction);
    //         this.longTouchAction = false;
    //     }
    // },

    //处理长按事件
    processLongTouch: function () {
        var gameInfo = mpGD.subGameInfoMap[this.moduleID];
        //
        // var basePath;
        // if (cc.game.config.debugMode == 0) {
        //     basePath = jsb.fileUtils.getWritablePath() + "release/subGame/" + gameInfo.resName + "/";
        // }
        // else {
        //     basePath = jsb.fileUtils.getWritablePath() + "debug/subGame/" + gameInfo.resName + "/";
        // }
        //
        jsb.fileUtils.removeDirectory(gameInfo.storagePath + "src/");
        jsb.fileUtils.removeDirectory(gameInfo.storagePath + "res/");
        jsb.fileUtils.removeFile(gameInfo.storagePath + "project.manifest");
        mpApp.setLocalVersion(this.moduleID, "");

        //版本需要更新
        if (cc.sys.isNative && cc.game.config.runGamesUpdate && mpGD.subGameInfoMap[this.moduleID].version != mpApp.getLocalVersion(this.moduleID)) {
            this.downloadProgressTimer = this.downloadProgressTimer || new MPDownloadProgressTimer().to(this).pp(0.86, 0.4);
            mpGD.subGameInfoMap[this.moduleID].status = mpSubGameStatus.UnCheck;
        }
        else {
            this.status = mpSubGameStatus.Ready;
            mpGD.subGameInfoMap[this.moduleID].status = mpSubGameStatus.Ready;

        }

        this.hideRemoveBtn();

        cc.log("==== 删除子游戏！");
        cc.log("==== " + gameInfo.storagePath + "src");
    },

    initRemoveBtn: function () {

        //网页版本不需要
        if (!cc.sys.isNative) {
            return;
        }

        return;

        if (this.removeBtn) {
            this.removeBtn.show();
            return;
        }

        this.removeBtn = new FocusSprite("res/img/close.png").to(this, 1000).pp(0.8, 0.8);
        var that = this;
        this.removeBtn.bindTouch({
            swallowTouches: true,
            onTouchBegan: function (touch) {
                this.startPosX = touch.getLocationX();
                this.startPosY = touch.getLocationY();
                return true;
            },

            onTouchEnded: function (touch) {
                if (Math.abs(this.startPosX - touch.getLocationX()) < 5 && Math.abs(this.startPosY - touch.getLocationY()) < 5) {
                    that.clickRemoveBtn();
                }
            },
        });
        this.removeBtn.onClick = () => {
            this.getScene().setFocusSelected(this);
            this.clickRemoveBtn();
        };
        // this.removeBtn.addClickEventListener(this.processLongTouch.bind(this));
    },

    hideRemoveBtn: function () {
        //this.removeBtn.hide();
    },

    //被点击时触发
    onClicked: function () {
        if (!this.canClick) {
            return;
        }

        // if(this.longTouch)
        // {
        //     this.longTouch = false;
        //     return;
        // }
        //
        // this.stopLongTouchAction();

        cc.log("被点击-" + mpGD.subGameInfoMap[this.moduleID].gameName + " " + this.status);

        //版本需要更新
        if (cc.sys.isNative && cc.game.config.runGamesUpdate && mpApp.getLocalVersion(this.moduleID) && mpGD.subGameInfoMap[this.moduleID].version != mpApp.getLocalVersion(this.moduleID)) {
            this.processLongTouch()
        }

        //防止多次点击
        if (this.status != mpSubGameStatus.UnCheck && this.status != mpSubGameStatus.Ready && this.status != mpSubGameStatus.DownloadFail)
            return;
        var callback = function (event) {
            switch (event.getEventCode()) {
                case jsb.EventAssetsManager.UPDATE_FINISHED:
                    if (this.downloadProgressTimer) {
                        this.initRemoveBtn();
                        this.downloadProgressTimer.removeFromParent();
                        this.downloadProgressTimer = null;
                    }
                    break;

                case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                    cc.eventManager.dispatchCustomEvent(mpEvent.EnterGameModules, {
                        moduleID: this.moduleID,
                    });
                    break;

                case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                case jsb.EventAssetsManager.ASSET_UPDATED:
                case jsb.EventAssetsManager.ERROR_UPDATING:
                case jsb.EventAssetsManager.UPDATE_FAILED:
                case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                    break;
            }
        }.bind(this);

        if (!cc.sys.isNative || !cc.game.config.runGamesUpdate || mpGD.subGameInfoMap[this.moduleID].version == mpApp.getLocalVersion(this.moduleID)) {
            callback({
                getEventCode: function () {
                    return jsb.EventAssetsManager.ALREADY_UP_TO_DATE;
                }
            });
            return;
        }

        if (!this.downloadProgressTimer)
            this.downloadProgressTimer = new MPDownloadProgressTimer().to(this).pp(0.86, 0.4);

        mpGD.mainScene.subGameManager.checkUpdate(this.moduleID, callback);
    },


    //开始下载
    startDownloading: function () {
        this.downloadProgressTimer.startDownload();
    },


    /**
     * 当游戏状态改变时触发
     */
    onStatusChange: function (oldStatus, newStatus) {
        // ttutil.dump({oldStatus: oldStatus, newStatus: newStatus});
    },

    getStatus: function () {
        return this._status;
    },

    setStatus: function (status, otherInfo) {

        // ttutil.dump({status: status, otherInfo: otherInfo});

        switch (status) {
            case mpSubGameStatus.UnCheck: //未检查状态

                this.onStatusChange(this._status, status);
                this._status = status;
                break;
            case mpSubGameStatus.Downloading:   //正在下载

                if (this._status != status) {
                    this.onStatusChange(this._status, status);
                    this.startDownloading();
                }
                this.downloadProgressTimer.setPercentage(otherInfo);
                this._status = status;
                break;
            case mpSubGameStatus.UnInstall://未安装
                this.onStatusChange(this._status, status);
                this._status = status;
                break;
            case mpSubGameStatus.CheckUpdate://正在检查更新
                this.onStatusChange(this._status, status);
                this._status = status;
                break;
            case mpSubGameStatus.Loading: //正在加载
                this.onStatusChange(this._status, status);
                this._status = status;
                break;
            case mpSubGameStatus.Ready://已准备状态
                this.onStatusChange(this._status, status);
                this.downloadProgressTimer && this.downloadProgressTimer.downloadFinish();

                //设置本地版本号
                mpApp.setLocalVersion(this.moduleID, mpGD.subGameInfoMap[this.moduleID].version);
                this._status = status;
                break;
            case mpSubGameStatus.Playing://正在玩状态
                this.onStatusChange(this._status, status);
                this._status = status;
                break;
            case mpSubGameStatus.DownloadFail:  //下载失败
                this.onStatusChange(this._status, status);
                this._status = status;
                ToastSystemInstance.buildToast("下载失败");
                break;
            default :
                break;
        }

        mpGD.subGameInfoMap[this.moduleID]._status = status;
    },

    // 播放光效
    playLightEffetc: function () {
        var anims = {6: "Animation3", 12: "Animation1", 13: "Animation3", 20: "Animation2"};
        var anim = anims[this.moduleID] ? anims[this.moduleID] : "Animation3";

        this.lightEffect.show();
        this.lightEffect.getAnimation().play(anim, null, false);
    },

    // 停止光效
    stopLigthEffect: function () {
        this.lightEffect.hide();
        this.lightEffect.getAnimation().stop();
    },

});


var _p = MPSubGameIcon.prototype;

cc.defineGetterSetter(_p, "status", _p.getStatus, _p.setStatus);
