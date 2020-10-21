/**
 * Created by 真心科技 on 2016/5/19.
 */

/**
 * 系统活动层
 */
var MPActivityLayer = MPQBackgroundLayer.extend({
    _className: "MPActivityLayer",
    _classPath: "src/main/module/activity/MPActivityLayer.js",


    activityData: null,
    activityBtnArray: null,
    box: null,
    btnListView: null,

    shareID: null,          //分享订单ID
    activityContent: null,      //活动内容
    ctor: function () {
        this._super(cc.color(0,0,0,255 * 0.3));
        this.swallowTouch();

        var self = this;
        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            self.getScene().popDefaultSelectArray();
            self.removeFromParent();
        });

        this.size(cc.director.getWinSize());
        mpGD.netHelp.addNetHandler(this);

        mpApp.showWaitLayer("正在请求活动数据, 请稍候");

        mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");

        this.box = this.buildMessageBox().to(this).pp();
        this.btnListView = this.buildBtnList().to(this.box).pp(0.16, 0.4);
        this.activityContent = new cc.Node().to(this.box);
        this.activityContent.size(800, 450).p(385, 35);

        mpGD.netHelp.requestActivity();

        // this.initTV();
    },
    
    initEx:function () {
        this._super();

        this.titleBG.display("#act_biaoti.png");
        this.titleBG.anchor(0.5, 0.5)

        this.titleBG.pp(0.5,1);

    },


    initTV: function () {
        // mpGD.mainScene.setFocusSelected(this.backBtn);

        var btns = this.activityBtnArray;//this.btnListView.getItems();

        this.backBtn.setNextFocus(null, btns[0], btns[0], null);
    },

    refreshFocus: function () {

        if (typeof (this.curActivity) == "undefined") return;
        var senderTitle = this.curActivity.getTitleText();
        var i = this.curActivity.index;
        var btns = this.activityBtnArray;//this.btnListView.getItems();
        //获取坐标
        var getPos = (index, border) => {
            return {x: index % border, y: Math.floor(index / border)};
        };
        //获取索引
        var getIndex = (ccp, border) => {
            border = border || 3;
            return ccp.x + ccp.y * border;
        };
        var item = null;

        switch (senderTitle) {
            case "亿元大礼" :
                this.backBtn.setNextFocus(null, this.activityContent.yydlUnderLineLabel, this.curActivity, null);
                this.activityContent.yydlBtn.setNextFocus(this.activityContent.yydlUnderLineLabel, null, this.curActivity, this.activityContent.yydlUnderLineLabel);
                this.activityContent.yydlUnderLineLabel.setNextFocus(this.backBtn, this.activityContent.yydlBtn, this.curActivity, this.backBtn);
                item = this.activityContent.yydlBtn;
                break;
            case "分享有礼":
                this.backBtn.setNextFocus(null, this.activityContent.fxBtn, this.curActivity, null);
                this.activityContent.fxBtn.setNextFocus(this.backBtn, null, this.curActivity, this.backBtn);
                item = this.activityContent.fxBtn;
                break;
            case "全民找BUG":
                // var securityCodeLayer = this.activityContent.securityCodeLayer.tvSpr;
                // this.backBtn.setNextFocus(null, this.activityContent.feedbackEditBox, this.curActivity, null);
                // this.activityContent.feedbackEditBox.setNextFocus(this.backBtn, this.activityContent.codeEditBox, this.curActivity, this.backBtn);
                // securityCodeLayer.setNextFocus(this.activityContent.feedbackEditBox, this.activityContent.btn, this.curActivity, this.activityContent.codeEditBox);
                // this.activityContent.codeEditBox.setNextFocus(this.activityContent.feedbackEditBox, this.activityContent.btn, securityCodeLayer, null);
                // this.activityContent.btn.setNextFocus(this.activityContent.codeEditBox, null, this.curActivity, null);
                // item = this.activityContent.feedbackEditBox;
                break;
            // case "公众号" :
            //     this.curActivity.setNextFocus(i == 0?this.closeBtn:btns[this.curActivity.index - 1], i == btns.length - 1?null:btns[this.curActivity.index+1], null, this.closeBtn);
            //     break;
            case "分享再送大礼":
                this.backBtn.setNextFocus(null, this.activityContent.fxzsdUnderLineLabel, this.curActivity, null);
                this.activityContent.fxzsdBtn.setNextFocus(this.activityContent.fxzsdUnderLineLabel, null, this.curActivity, this.activityContent.fxzsdUnderLineLabel);
                this.activityContent.fxzsdUnderLineLabel.setNextFocus(this.backBtn, this.activityContent.fxzsdBtn, this.curActivity, this.backBtn);
                item = this.activityContent.fxzsdBtn;
                break;
            case "我要上榜":
                var array = this.activityContent.underLineLabelArray;
                this.backBtn.setNextFocus(null, array[2], this.curActivity, null);
                for (var i = 0; i < array.length; i++) {
                    var pos = getPos(i, 3);
                    array[i].setNextFocus(
                        pos.y == 0 ? this.backBtn : array[getIndex({x: pos.x, y: pos.y - 1}, 3)],
                        pos.y == getPos(array.length - 1, 3).y ? null : array[getIndex({x: pos.x, y: pos.y + 1}, 3)],
                        pos.x == 0 ? this.curActivity : array[getIndex({x: pos.x - 1, y: pos.y}, 3)],
                        pos.x == (getPos(array.length - 1, 3).y > pos.y ? 3 : getPos(array.length - 1, 3).x) ? this.backBtn : array[getIndex({
                            x: pos.x + 1,
                            y: pos.y
                        }, 3)]
                    );
                }
                item = array[0];
                break;
            // case "红包大派送":
            //     break;
            case "一金币夺宝":
                this.backBtn.setNextFocus(null, this.activityContent.yjbdbBtn, this.curActivity, null);
                this.activityContent.yjbdbBtn.setNextFocus(this.backBtn, null, this.curActivity, this.backBtn);
                item = this.activityContent.yjbdbBtn;
                break;
            case "钜惠推荐":
                this.backBtn.setNextFocus(null, this.activityContent.btn, this.curActivity, null);
                this.activityContent.shareBtn.setNextFocus(this.activityContent.btn, null, this.curActivity, this.activityContent.btn);
                this.activityContent.btn.setNextFocus(this.backBtn, this.activityContent.shareBtn, this.curActivity, this.backBtn);
                item = this.activityContent.shareBtn;
                break;
            case "绑定手机":
                this.backBtn.setNextFocus(null, this.activityContent.phoneBtn, this.curActivity, null);
                this.activityContent.phoneBtn.setNextFocus(this.backBtn, null, this.curActivity, this.backBtn);
                item = this.activityContent.phoneBtn;
                break;
            case "充值天天送":
                // this.activityContent.czttsBtn
                this.backBtn.setNextFocus(null, this.activityContent.czttsBtn, this.curActivity, null);
                this.activityContent.czttsBtn.setNextFocus(this.backBtn, null, this.curActivity, this.backBtn);
                item = this.activityContent.czttsBtn;
                break;
            case "微信分享集赞活动":
                this.backBtn.setNextFocus(null, this.activityContent.wxfxjzTakeBtn, this.curActivity, null);
                this.activityContent.wxfxjzBtn.setNextFocus(this.activityContent.wxfxjzTakeBtn, null, this.curActivity, this.activityContent.wxfxjzTakeBtn);
                this.activityContent.wxfxjzTakeBtn.setNextFocus(this.backBtn, this.activityContent.wxfxjzBtn, this.curActivity, this.backBtn);
                item = this.activityContent.wxfxjzBtn;
                break;
            default:
                this.backBtn.setNextFocus(null, this.curActivity, this.curActivity, null);
                item = this.backBtn;
                break;
        }

        for (var i = 0; i < btns.length; i++) {
            btns[i].setNextFocus(i == 0 ? this.backBtn : btns[i - 1], i == btns.length - 1 ? null : btns[i + 1], null, item);
        }
    },
    updateUserInfo: function () {

        if (this.curActivityTitle && this.curActivityTitle.indexOf("绑定手机") != -1) {
            this.touchEventListener(this.curActivity, ccui.Widget.TOUCH_ENDED);
        }
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        mpGD.saNetHelper.removeNetHandler(this);

        this._super();
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.ReadActivity:
                mpApp.removeWaitLayer();
                this.fillData(data);
                break;

            case mpNetEvent.GetLastSharePrizeDrawList:
                mpApp.removeWaitLayer();
                this.showLastSharePrizeDrawList(data);
                break;
            case mpNetEvent.TakeActivityRedPackRainLog:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    this.showRedPackRainList(data);
                }

                break;
            case mpNetEvent.TakeActivityRechargeRebate:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    ToastSystemInstance.buildToast("领取奖励" + data.money + CURRENCY + "成功,请往保险柜查收");
                }
                break;
            case mpNetEvent.TakeActivityWXFXJZ:
                mpApp.removeWaitLayer();
                break;
            case mpNetEvent.TakePrizeCodeReward:
                mpApp.removeWaitLayer();
                break;
        }
    },


    //显示榜单
    showRankList: function (data) {

        if (!data || !data.list) {
            ToastSystemInstance.buildToast("没有数据");
            return;
        }

        var layer = new cc.LayerColor(cc.color(0, 0, 0, 128));

        layer.swallowTouch();
        layer.swallowKeyboard(function () {
            this.getScene().popDefaultSelectArray();
            layer.removeFromParent();
        });
        ////////////////////////////////////////////////////////////////////////////////
        //关闭按钮
        // var closeBtn = new FocusButton().to(layer, 1).p(1065, 600);
        // closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        // closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        // var bindTouchEvent = function (sender, type) {
        //     if (type == ccui.Widget.TOUCH_BEGAN) {
        //         SoundEngine.playEffect(commonRes.btnClick);
        //     } else if (type == ccui.Widget.TOUCH_ENDED) {
        //         mpGD.mainScene.popDefaultSelectArray();
        //         layer.removeFromParent();
        //     }
        // };
        // closeBtn.addTouchEventListener(bindTouchEvent);
        ////////////////////////////////////////////////////////////////////////////////

        var size = cc.size(mpV.w * 0.7, 500);
        var bg = new ccui.Scale9Sprite().to(layer);
        bg.initWithSpriteFrameName("res/gui/file/gui-ts-box.png");
        bg.size(size.width + 50, size.height + 50).pp();


        var listView = new FocusListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(mpV.w * 0.6, 400);


        new cc.LabelTTF(data.title, GFontDef.fontName, 32).to(layer).pp(0.5, 0.8);

        var list = data.list;
        for (var i = 0; i < list.length; ++i) {

            var widget = new FocusWidget().size(600, 50);

            new cc.LabelTTF(list[i].index, GFontDef.fontName, 22).to(widget).pp(0.2, 0.5);
            new cc.LabelTTF(list[i].nickname, GFontDef.fontName, 22).to(widget).pp(0.7, 0.5);
            // new cc.LabelTTF(ttutil.formatMoney(list[i].money), GFontDef.fontName, 18).anchor(0, 0.5).to(widget).pp(0.5, 0.5);
            // new cc.LabelTTF(list[i].hint, GFontDef.fontName, 18).anchor(0, 0.5).to(widget).pp(0.85, 0.5);
            listView.pushBackCustomItem(widget);
        }

        listView.setItemsMargin(10);

        listView.to(layer).pp(0.5, 0.45);

        layer.to(this);

        //TV init
        mpGD.mainScene.setFocusSelected(closeBtn);
        var items = listView.getItems();

        closeBtn.setNextFocus(null, items.length == 0 ? null : items[0], items.length == 0 ? null : items[0], null);
        for (var i = 0; i < items.length; i++) {
            items[i].setNextFocus(i == 0 ? closeBtn : items[i - 1], i == items.length - 1 ? null : items[i + 1], null, closeBtn);
        }

        return layer;
    },


    //显示红包雨获取记录
    showRedPackRainList: function (data) {
        var layer = new cc.LayerColor(cc.color(0, 0, 0, 128));

        layer.swallowTouch();
        layer.swallowKeyboard(function () {
            layer.getScene().popDefaultSelectArray();
            layer.removeFromParent();
        });
        ////////////////////////////////////////////////////////////////////////////////
        //关闭按钮
        var closeBtn = new FocusButton().to(layer, 1).p(1065, 600);
        closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.popDefaultSelectArray();
                layer.removeFromParent();
            }
        };
        closeBtn.addTouchEventListener(bindTouchEvent);
        ////////////////////////////////////////////////////////////////////////////////

        var size = cc.size(mpV.w * 0.7, 500);
        var bg = new ccui.Scale9Sprite().to(layer);
        bg.initWithSpriteFrameName("res/gui/file/gui-ts-box.png");
        bg.size(size.width + 50, size.height + 50).pp();


        var listView = new FocusListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(900, 400);


        new cc.LabelTTF(data.title, GFontDef.fontName, 32).to(layer).pp(0.5, 0.8);

        var list = data.list;
        if (list != null) {
            for (var i = list.length - 1; i >= 0; --i) {

                var widget = new FocusWidget().size(850, 50);
                var nicknameLabel = new cc.LabelTTF(list[i].nickname, GFontDef.fontName, 32).anchor(0.5, 0.5).to(widget).pp(0.15, 0.5);
                var moneyLabel = new cc.LabelTTF(list[i].money, GFontDef.fontName, 32).anchor(0, 0.5).to(widget).pp(0.4, 0.5);
                var indexLabel = new cc.LabelTTF(list[i].ts, GFontDef.fontName, 32).to(widget).anchor(1, 0.5).pp(1, 0.5);
                listView.pushBackCustomItem(widget);
            }
        }

        listView.setItemsMargin(10);


        listView.to(layer).pp(0.5, 0.45);

        layer.to(this);

        new cc.LabelTTF("玩家昵称", GFontDef.fontName, 32).anchor(0.5, 0.5).to(layer).pp(0.25, 0.8).qcolor(255, 0, 0);
        new cc.LabelTTF("红包金额", GFontDef.fontName, 32).anchor(0.5, 0.5).to(layer).pp(0.45, 0.8).qcolor(255, 0, 0);
        new cc.LabelTTF("时间", GFontDef.fontName, 32).anchor(0.5, 0.5).to(layer).pp(0.7, 0.8).qcolor(255, 0, 0);

        //TV init
        mpGD.mainScene.setFocusSelected(closeBtn);
        var items = listView.getItems();

        closeBtn.setNextFocus(null, items.length == 0 ? null : items[0], items.length == 0 ? null : items[0], null);
        for (var i = 0; i < items.length; i++) {
            items[i].setNextFocus(i == 0 ? closeBtn : items[i - 1], i == items.length - 1 ? null : items[i + 1], null, closeBtn);
        }
        return layer;
    },

    //显示上期获奖名单
    showLastSharePrizeDrawList: function (data) {


        var layer = new cc.LayerColor(cc.color(0, 0, 0, 128));

        layer.swallowTouch();
        layer.swallowKeyboard(function () {
            layer.getScene().popDefaultSelectArray();
            layer.removeFromParent();
        });
        ////////////////////////////////////////////////////////////////////////////////
        //关闭按钮
        var closeBtn = new FocusButton().to(layer, 1).p(1065, 600);
        closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.popDefaultSelectArray();
                layer.removeFromParent();
            }
        };
        closeBtn.addTouchEventListener(bindTouchEvent);
        ////////////////////////////////////////////////////////////////////////////////

        var size = cc.size(mpV.w * 0.7, 500);
        var bg = new ccui.Scale9Sprite().to(layer);
        bg.initWithSpriteFrameName("res/gui/file/gui-ts-box.png");
        bg.size(size.width + 50, size.height + 50).pp();


        var listView = new FocusListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(mpV.w * 0.6, 400);


        new cc.LabelTTF(data.title, GFontDef.fontName, 32).to(layer).pp(0.5, 0.8);

        var list = data.list;
        if (list != null) {
            for (var i = 0; i < list.length; ++i) {

                var widget = new FocusWidget().size(600, 50);
                var indexLabel = new cc.LabelTTF(list[i].index, GFontDef.fontName, 32).to(widget).pp(0.1, 0.5);
                var nicknameLabel = new cc.LabelTTF(list[i].nickname, GFontDef.fontName, 32).to(widget).pp(0.5, 0.5);
                var moneyLabel = new cc.LabelTTF(ttutil.formatMoney(list[i].money), GFontDef.fontName, 32).anchor(0, 0.5).to(widget).pp(0.9, 0.5);

                listView.pushBackCustomItem(widget);
            }
        }

        listView.setItemsMargin(10);


        listView.to(layer).pp(0.5, 0.45);

        layer.to(this);

        //TV init
        mpGD.mainScene.setFocusSelected(closeBtn);
        var items = listView.getItems();

        closeBtn.setNextFocus(null, items.length == 0 ? null : items[0], items.length == 0 ? null : items[0], null);
        for (var i = 0; i < items.length; i++) {
            items[i].setNextFocus(i == 0 ? closeBtn : items[i - 1], i == items.length - 1 ? null : items[i + 1], null, closeBtn);
        }
        return layer;
    },

    onSANetEvent: function (event, data) {
   console.log("正在请求分享订单正在请求分享订单e");
        switch (event) {

            case mpSANetEvent.GetShareOrder:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {

                    if (data.type == 2) {
                        ToastSystemInstance.buildToast("已经复制到剪切板中, 快去发布吧");
                        native.setClipboard(data.content);
                    }
                    else {
                    console.log("正在调用分享接口, 请稍候");
                        this.shareID = data.shareID;
                        
                        mpApp.showWaitLayer("正在调用分享接口, 请稍候");
                        native.wxShareUrl(G_WX_APPID, data.url, data.title, data.desc, data.wxScene, this.onWXShareResult.bind(this));
                    }

                }
                break;
            case mpSANetEvent.GetRanking:
                mpApp.removeWaitLayer();
                if (data.errMsg) {
                    break;
                }
                this.showRankList(data);
                break;
            case mpSANetEvent.HeHuoChaiHongBaoGenerate:
                mpApp.removeWaitLayer();
                if (data.errMsg) {
                    break;
                }
                mpApp.showWaitLayer("正在调用分享接口, 请稍候");
                native.wxShareUrl(G_WX_APPID, data.url, data.title, "", 1, () => {
                    mpApp.removeWaitLayer();
                });
                break;

        }
    },

    //微信 分享结果
    onWXShareResult: function (errCode, openID) {

        mpApp.removeWaitLayer();

        if (cc.sys.os == cc.sys.OS_IOS) {
            openID = native.getDeviceId();
        }


        errCode = Number(errCode);

        if (errCode == 0) {
            native.toast("微信分享成功");
        }
        else {
            native.toast("微信分享失败");
        }
        //无论成功与否， 都要把结果反馈过去
        mpGD.saNetHelper.sendShareResult(this.shareID, errCode, openID, mpGD.ipInfo.ip);

    },

    buildBtnList: function () {
        var listView = new FocusListView().anchor(0.5, 0.5);

        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(400, 440);
        // listView.setItemsMargin(10);

        return listView;
    },

    //创建活动
    buildActivityBtn: function (data, index) {

        if (G_APPLE_EXAMINE && (data.title.indexOf("钜惠推荐") != -1 || data.title.indexOf("夺宝") != -1 || data.title.indexOf("邀请码") != -1))
            return null;

        var btn = new FocusButton("res/plaza1v1/images/btn_bg_normal.png", "res/plaza1v1/images/btn_bg_selected.png", "");

        // btn.qscale(0.8);

        btn.setTitleText(data.title);
        btn.setTitleFontSize(30);
        btn.setTitleColor(cc.color(255, 255, 90, 255));

        btn.getTitleRenderer().pp(0.5, 0.5);
        btn.index = index;
        // btn.setScale9Enabled(true);
        // btn.setCapInsets(cc.rect())
        // btn.size(350,150);
        btn.addTouchEventListener(this.touchEventListener.bind(this), this);
        return btn;
    },

    touchEventListener: function (sender, type) {
        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
        }
        else if (type == ccui.Widget.TOUCH_ENDED) {

            for (var i = 0; i < this.activityBtnArray.length; ++i) {
                this.activityBtnArray[i].loadTextureNormal("res/plaza1v1/images/btn_bg_normal.png", ccui.Widget.LOCAL_TEXTURE);
            }
            sender.loadTextureNormal("res/plaza1v1/images/btn_bg_selected.png", ccui.Widget.LOCAL_TEXTURE);

            var senderTitle = sender.getTitleText();


            this.activityContent.removeAllChildren();

            this.curActivityTitle = senderTitle;
            this.curActivity = sender;

            if (senderTitle.indexOf("好评送") != -1) {
                this.haoPingSongJinBi(sender.index);
            }
            else if (senderTitle.indexOf("亿元大礼") != -1) {
                this.yiYuanDaLi(sender.index);
            }
            else if (senderTitle.indexOf("分享有礼") != -1) {
                this.fenXiangYouLi(sender.index);
            }
            else if (senderTitle.indexOf("全民找BUG") != -1) {
                this.findBUG(sender.index);
            }
            else if (senderTitle.indexOf("公众号") != -1) {
                this.gongZhongHao(sender.index);
            }
            else if (senderTitle.indexOf("分享再送大礼") != -1) {
                this.fenXiangZaiSongDaLi(sender.index);
            }
            else if (senderTitle.indexOf("我要上榜") != -1) {
                this.woYaoShangBang(sender.index);
            }
            else if (senderTitle.indexOf("红包大派送") != -1) {
                this.hongBaoDaPaiSong(sender.index);
            }
            else if (senderTitle.indexOf("现金红包雨") != -1) {
                this.hongBaoDaYu(sender.index);
            }
            else if (senderTitle.indexOf("夺宝") != -1) {
                this.yiJinBiDuoBao(sender.index);
            }
            else if (senderTitle.indexOf("钜惠推荐") != -1) {
                this.juHuiTuiJian(sender.index);
            }
            else if (senderTitle.indexOf("绑定手机") != -1) {
                this.bindMobileGiveMoney(sender.index);
            }
            else if (senderTitle.indexOf("充值天天送") != -1) {
                this.chongZhiTianTianSong(sender.index);
            }
            else if (senderTitle.indexOf("充值赢取iPhone8") != -1) {
                this.chongZhiYingQuIPhone8(sender.index);
            }
            else if (senderTitle.indexOf("微信分享集赞活动") != -1) {
                this.weiXinFenXiangJiZan(sender.index);
            }
            else if (senderTitle.indexOf("金币雨") != -1) {
                this.jinBiYu(sender.index);
            }
            else if (senderTitle.indexOf("合伙拆红包") != -1) {
                this.heHuoChaiHongBao(sender.index);
            }
            else if (senderTitle.indexOf("邀请码") != -1) {
                this.yaoQingMa(sender.index);
            }
            else {
                this.normalActivity(sender.index);
            }
            this.refreshFocus();
        }
    },

    bindMobileGiveMoney: function (index) {
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);

        if (mpGD.userInfo.hasMobile) {
            new cc.LabelTTF("您已经绑定手机", GFontDef.fontName, 32).to(this.activityContent).anchor(0.5, 0.5).pp(0.5, 0.5);
        }
        else {
            //点击绑定安全手机
            var btn = this.activityContent.phoneBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.2);
            btn.setTitleText("绑定手机");
            btn.setTitleFontSize(30);
            btn.getTitleRenderer().pp(0.5, 0.55);
            btn.setTitleColor(cc.color(255, 255, 128));
            btn.addClickEventListener(() => {
                new MPSafeMobileLayer(MPSafeMobileLayer.SetSafeMobile).to(this, 9999999);
            });
        }
    },

    //钜惠推荐
    juHuiTuiJian: function (index) {


        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        var label = new cc.LabelTTF("我的推荐码:", GFontDef.fontName, 32).to(this.activityContent).anchor(1, 0.5).pp(0.52, 0.3);
        label.setColor(cc.color(255, 128, 128));
        var code = new cc.LabelTTF(mpGD.userInfo.gameID, GFontDef.fontName, 32).to(this.activityContent).anchor(0, 0.5).pp(0.53, 0.3);
        code.setColor(cc.color(255, 255, 0));

        var self = this;

        var buildRecommendGameInfo = function () {
            var label = new cc.LabelTTF("我的推荐人:", GFontDef.fontName, 32).to(self.activityContent).anchor(1, 0.5).pp(0.79, 0.9);
            label.setColor(cc.color(255, 100, 200));
            var code = new cc.LabelTTF(mpGD.userInfo.recommendGameID, GFontDef.fontName, 32).to(self.activityContent).anchor(0, 0.5).pp(0.8, 0.9);
            code.setColor(cc.color(255, 200, 55));
        };
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (mpGD.userInfo.recommendGameID) {
            buildRecommendGameInfo();
        }
        else {
            var self = this;
            //点击填写我的推荐人
            var btn = this.activityContent.btn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.9, 0.9);
            btn.setTitleText("填写推荐人");
            btn.setTitleFontSize(20);
            btn.getTitleRenderer().pp(0.5, 0.55);
            btn.setTitleColor(cc.color(255, 255, 128));
            btn.addClickEventListener(function () {
                new MPJuHuiTuiJianInputLayer(function () {
                    btn.removeFromParent();
                    buildRecommendGameInfo();
                }).to(self, 99999999);
            });

        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        var shareBtn = this.activityContent.shareBtn = new FocusButton("btn_blue.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.12);
        shareBtn.setTitleText("点击复制分享内容");
        shareBtn.getTitleRenderer().pp(0.5, 0.6);
        shareBtn.setTitleFontSize(26);
        shareBtn.setTitleColor(cc.color(255, 255, 0, 255));
        shareBtn.addClickEventListener(function () {
            mpApp.showWaitLayer("正在请求分享订单");
            mpGD.saNetHelper.requestShareOrder(2,0);
        });
    },


    //一金币夺宝
    yiJinBiDuoBao: function (index) {

        var title = new cc.Sprite("res/activity/goldTitle.png").to(this.activityContent).pp(0.5, 0.9);
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);


        var btn = this.activityContent.yjbdbBtn = new FocusButton("btn_blue.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.12);

        btn.setTitleText("进入夺宝");
        btn.getTitleRenderer().pp(0.5, 0.6);
        btn.setTitleFontSize(28);
        btn.setTitleColor(cc.color(255, 255, 0, 255));
        btn.addClickEventListener(function () {

            if (mpGD.userInfo.memberOrder < 2) {
                ToastSystemInstance.buildToast("VIP2以上才能参与此活动");
                return;
            }

            mpGD.mainScene.pushDefaultSelectArray(btn);
            new MPDuoBaoLayer().to(cc.director.getRunningScene());
        });

    },


    //红包大派送
    hongBaoDaPaiSong: function (index) {
        var img = new cc.Sprite("res/activity/content-4.png").to(this.activityContent).pp(0.5, 0.6);
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 28);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.35, 0.55);
    },


    jinBiYu: function (index) {
        var img = new cc.Sprite("res/activity/coinRain.png").to(this.activityContent).qscale(0.65).pp(0.5, 0.52);

    },

    //现金红包雨
    hongBaoDaYu: function (index) {
        var img = new cc.Sprite("res/activity/hongbaoyu.jpg").to(this.activityContent).qscale(0.8).pp(0.5, 0.56);

        //领取奖励
        var btn = this.activityContent.wxfxjzTakeBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.05);
        btn.setTitleText("查看红包雨记录");
        btn.setTitleFontSize(20);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(() => {
            mpApp.showWaitLayer("正在请求红包雨记录");
            mpGD.netHelp.requestTakeActivityRedPackRainLog();
        });

    },

    //我要上榜活动
    woYaoShangBang: function (index) {
        var self = this;
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);

        var ydCZBtn = null, ydWinBtn = null, ydLoseBtn = null, tdCZBtn = null, tdWinBtn = null, tdLoseBtn = null;

        var clickEventListener = function (sender) {

            //TV 插入
            mpGD.mainScene.pushDefaultSelectArray(sender);
            // 0表示充值榜、1表示赢榜、2表示输榜
            // -1表示昨天， 0表示今天
            switch (sender) {
                case ydCZBtn:
                    mpGD.saNetHelper.requestRanking(0, -1);
                    break;
                case ydWinBtn:
                    mpGD.saNetHelper.requestRanking(1, -1);
                    break;
                case ydLoseBtn:
                    mpGD.saNetHelper.requestRanking(2, -1);
                    break;
                case tdCZBtn:
                    mpGD.saNetHelper.requestRanking(0, 0);
                    break;
                case tdWinBtn:
                    mpGD.saNetHelper.requestRanking(1, 0);
                    break;
                case tdLoseBtn:
                    mpGD.saNetHelper.requestRanking(2, 0);
                    break;
            }

            mpApp.showWaitLayer("正在请求数据， 请稍候");
        };

        var buildUnderLine = function (text, x, y) {
            var ul = mputil.buildUnderlineLabel(text).to(self.activityContent).p(x, y);
            ul.addClickEventListener(clickEventListener);
            return ul;
        };

        var underLineLabelArray = this.activityContent.underLineLabelArray = [];

        ydCZBtn = buildUnderLine("查看昨天土豪榜", 200, 520);
        ydCZBtn.setLocalZOrder(1);
        ydWinBtn = buildUnderLine("查看昨天大神榜", 400, 520);
        ydWinBtn.setLocalZOrder(1);
        ydLoseBtn = buildUnderLine("查看昨天贡献榜", 600, 520);
        ydLoseBtn.setLocalZOrder(1);
        tdCZBtn = buildUnderLine("查看今日土豪榜", 200, 480);
        tdWinBtn = buildUnderLine("查看今日大神榜", 400, 480);
        tdLoseBtn = buildUnderLine("查看今日贡献榜", 600, 480);

        underLineLabelArray.push(ydCZBtn);
        underLineLabelArray.push(ydWinBtn);
        underLineLabelArray.push(ydLoseBtn);
        underLineLabelArray.push(tdCZBtn);
        underLineLabelArray.push(tdWinBtn);
        underLineLabelArray.push(tdLoseBtn);

    },

    //充值赢取iphone8
    chongZhiYingQuIPhone8: function (index) {
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.4);

        var iphone8 = new cc.Sprite("res/activity/iphone8.png").to(this.activityContent).pp(0.5, 0.7).qscale(0.7);
        // iphone8.runAction(cc.sequence(cc.rotateBy(3, 360)).repeatForever());
    },

    //一般活动方法
    normalActivity: function (index) {

        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);
    },

    //创建分享的查看表
    buildShareTable: function () {

        var table = new cc.Sprite("#activity-share-content.png");
        table.size(880, 520);

        var buildLabel = function (score) {
            return new cc.LabelBMFont(ttutil.formatMoney(score || "0"), "res/font/zhs-yahei-orange-20.fnt");
        };

        var sx = 160, dx = 185;

        var posArray = [];

        for (var i = 0; i < 4; ++i) {
            posArray.push(cc.p(sx + dx * i, 350));
        }
        for (var i = 0; i < 3; ++i) {
            posArray.push(cc.p(sx + dx * i + 82, 165));
        }


        for (var i = 0; i < 7; ++i) {
            var label = buildLabel(mpGD.shareConfig[i + 1]);
            label.to(table).p(posArray[i]);
        }


        return table;
    },

    //分享有礼
    fenXiangYouLi: function (index) {
        // var title = new cc.LabelTTF(this.activityData[index].desc, GFontDef.fontName, 22).to(this.activityContent).pp(0.5, 0.95);

        var shareTable = this.buildShareTable();

        shareTable.to(this.activityContent).pp(0.43, 0.51);


        var btn = this.activityContent.fxBtn = new FocusButton("res/activity/shareToWx.png").to(this.activityContent).pp(0.4, 0.13);
        btn.addClickEventListener(this.shareToWX.bind(this));

        var btn2 = this.activityContent.fxBtn = new FocusButton("res/activity/shareToChat.png").to(this.activityContent).pp(0.6, 0.13);
        btn2.addClickEventListener(this.shareToChat.bind(this));
    },

    gongZhongHao: function (index) {
        var img = new cc.Sprite("res/activity/content-3.jpg").to(this.activityContent).qscale(0.8).pp(0.5, 0.52);

    },

    //全民找bug
    findBUG: function (index) {
        var img = new cc.Sprite("res/activity/content-3.jpg").to(this.activityContent).qscale(0.8).pp(0.5, 0.52);
    },


    //微信分享集赞
    weiXinFenXiangJiZan: function (index) {
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);

        // var underLineLabel = this.activityContent.yydlUnderLineLabel = mputil.buildUnderlineLabel("查看上期获奖名单").to(this.activityContent).p(700, 530);
        // underLineLabel.addClickEventListener(function () {
        //     mpGD.mainScene.pushDefaultSelectArray(underLineLabel);
        //     mpGD.netHelp.requestLastSharePrizeDrawList(1);
        //     mpApp.showWaitLayer("正在请求数据， 请稍候");
        // });
        //
        // underLineLabel.hide();

        var btn = this.activityContent.wxfxjzBtn = new FocusButton("startup/activity/gui-common-button-share.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.09);
        btn.addClickEventListener(this.shareToWX.bind(this));


        //领取奖励
        var btn = this.activityContent.wxfxjzTakeBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.9, 0.89);
        btn.setTitleText("领取奖励");
        btn.setTitleFontSize(30);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(() => {


            if (!mpGD.userInfo.hasMobile) {
                ToastSystemInstance.buildToast("请先绑定手机");
                return;
            }

            if (!mpGD.userInfo.hasWeiXin) {
                ToastSystemInstance.buildToast("请先绑定微信");
                return;
            }

            mpApp.showWaitLayer("正在领取奖励");
            mpGD.netHelp.requestTakeActivityWXFXJZ();
        });
    },

    //亿元大礼
    yiYuanDaLi: function (index) {

        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);

        var underLineLabel = this.activityContent.yydlUnderLineLabel = mputil.buildUnderlineLabel("查看上期获奖名单").to(this.activityContent).p(700, 530);
        underLineLabel.addClickEventListener(function () {
            mpGD.mainScene.pushDefaultSelectArray(underLineLabel);
            mpGD.netHelp.requestLastSharePrizeDrawList(1);
            mpApp.showWaitLayer("正在请求数据， 请稍候");
        });

        // underLineLabel.hide();

        var btn = this.activityContent.yydlBtn = new FocusButton("startup/activity/gui-common-button-share.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.09);
        btn.addClickEventListener(this.shareToWX.bind(this));
    },

    fenXiangZaiSongDaLi: function (index) {
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);

        var underLineLabel = this.activityContent.fxzsdUnderLineLabel = mputil.buildUnderlineLabel("查看上期获奖名单").to(this.activityContent).p(700, 530);
        underLineLabel.addClickEventListener(function () {
            mpGD.mainScene.pushDefaultSelectArray(underLineLabel);
            mpGD.netHelp.requestLastSharePrizeDrawList(2);
            mpApp.showWaitLayer("正在请求数据， 请稍候");
        });

        var btn = this.activityContent.fxzsdBtn = new FocusButton("gui-gm-button-green1.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.09);
        btn.setTitleText("点击复制分享内容");
        btn.getTitleRenderer().pp(0.5, 0.6);
        btn.setTitleFontSize(26);
        btn.setTitleColor(cc.color(255, 255, 0, 255));
        btn.addClickEventListener(function () {
            mpApp.showWaitLayer("正在请求分享订单");
            mpGD.saNetHelper.requestShareOrder(2,0);

        });
    },

    //好评送金币
    haoPingSongJinBi: function () {

        var img = new cc.Sprite("#activity-content-2.png").to(this.activityContent).qscale(0.9).pp(0.5, 0.52);

    },

    //分享到微信 朋友圈
    shareToWX: function () {
    //cc.log("正在请求分享订单正在请求分享订单");
    //console.log("正在请求分享订单正在请求分享订单a");
    mpApp.showWaitLayer("正在请求分享订单");
    //console.log("正在请求分享订单正在请求分享订单b");
            mpGD.saNetHelper.requestShareOrder(1,1);
            //console.log("正在请求分享订单正在请求分享订单c");
            
       
    },
    //分享到微信 聊天界面
    shareToChat: function () {
    //cc.log("正在请求分享订单正在请求分享订单");
    //console.log("正在请求分享订单正在请求分享订单a");
    mpApp.showWaitLayer("正在请求分享订单");
    //console.log("正在请求分享订单正在请求分享订单b");
            mpGD.saNetHelper.requestShareOrder(1,0);
            //console.log("正在请求分享订单正在请求分享订单c");
            
       
    },
    fillData: function (data) {

        this.activityData = data;
        this.activityBtnArray = [];

        console.log('activity:' + JSON.stringify(data));

        // var top = new ccui.Widget();
        // top.size(100,5);
        // this.btnListView.pushBackCustomItem(top);
        for (var i = 0; i < data.length; ++i) {
            var btn = this.buildActivityBtn(data[i], i);
            if (btn == null)
                continue;
            if (i == 0) {
                var hot = new cc.Sprite("#res/gui/file/gui-cz-hot.png").to(btn);
                if (cc.sys.isNative)
                    hot.pp(0.1, 0.64);
                else
                    hot.pp(0.07, 0.7);

                hot.runAction(cc.repeatForever(cc.sequence(cc.repeat(cc.sequence(cc.rotateBy(0.05, 10), cc.rotateBy(0.1, -20), cc.rotateBy(0.05, 10)), 5), cc.delayTime(3))));
            }

            this.activityBtnArray.push(btn);

            var widget = new ccui.Widget();
            widget.size(400,100);
            widget.btn = btn;
            btn.to(widget).pp();
            this.btnListView.pushBackCustomItem(widget);

        }

        if (this.activityBtnArray.length > 0) {
            //模拟点击一次
            this.touchEventListener(this.activityBtnArray[0], ccui.Widget.TOUCH_ENDED);
        }

        this.initTV();
    },

    //邀请码活动
    yaoQingMa: function (index) {
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);


        var editBox = mputil.buildEditBox("请输入邀请码", "邀请码").to(this.activityContent).pp(0.5, 0.5);

        //领取奖励
        var btn = this.activityContent.czttsBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.12);
        btn.setTitleText("领取奖励");
        btn.setTitleFontSize(30);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(() => {

            var code = editBox.getString();

            if (!code || code.length != 20) {
                ToastSystemInstance.buildToast("邀请码错误");
            }
            else {
                mpApp.showWaitLayer("正在领取奖励");
                mpGD.netHelp.requestTakePrizeReward(editBox.getString());
            }

        });
    },

    //领取奖励
    heHuoChaiHongBao: function (index) {
        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);

        //拆红包
        var btn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.9, 0.9).qscale(0.8);
        btn.setTitleText("拆红包");
        btn.setTitleFontSize(30);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(() => {
            ToastSystemInstance.buildToast("拆红包")
        });
        //拆红包记录
        var btn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.7, 0.9).qscale(0.8);
        btn.setTitleText("拆红包记录");
        btn.setTitleFontSize(30);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(() => {
            ToastSystemInstance.buildToast("拆红包记录")
        });

        //发起拆红包
        var btn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.12);
        btn.setTitleText("发起拆红包");
        btn.setTitleFontSize(25);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(() => {
            if (mpGD.userInfo.unionID) {
                if (cc.sys.isMobile) {
                    mpGD.saNetHelper.requestHeHuoChaiHongBaoGenerate(mpGD.userInfo.unionID);
                }
                else {
                    ToastSystemInstance.buildToast("请用手机版本!");
                }

            }
            else {
                ToastSystemInstance.buildToast("请先绑定微信!");
            }


        });
    },

    chongZhiTianTianSong: function (index) {

        var str = this.activityData[index].desc;
        var message = new ccui.Text(str, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        message.to(this.activityContent).pp(0.5, 0.8);


        //领取奖励
        var btn = this.activityContent.czttsBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.activityContent).pp(0.5, 0.12);
        btn.setTitleText("领取奖励");
        btn.setTitleFontSize(30);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(() => {
            mpApp.showWaitLayer("正在领取奖励");
            mpGD.netHelp.requestTakeActivityRechargeRebate();
        });

    },

    buildMessageBox: function () {

        var self = this;
        var node = new cc.Node().anchor(0.5, 0.5);


        // var bg = new cc.Sprite("#activity-bg.png").to(node);
        // node.size(bg.size());
        // bg.pp();

        var bg = new ccui.Scale9Sprite('res/plaza1v1/images/tab_bg.png').anchor(0.5,0.5);
        // bg.initWithSpriteFrameName("frame_bg.png");
        node.size(1231, 702);
        bg.to(node).size(1100, 530).pp(0.5,0.45);

        var split = new ccui.Scale9Sprite("line.png").to(node).pp(0.305,0.451);
        split.size(2,525);

        // //关闭按钮
        var closeBtn = this.backBtn = new FocusButton().to(node).anchor(1.5, 1.5).pp(1, 0.9);
        closeBtn.loadTextureNormal("res/plaza1v1/images/close.png", ccui.Widget.LOCAL_TEXTURE);
        closeBtn.loadTexturePressed("res/plaza1v1/images/close.png", ccui.Widget.LOCAL_TEXTURE);


        var self = this;
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                //TV
                mpGD.mainScene.setFocusSelected(mpGD.mainScene.bottomButtons[4]);
                self.getScene().popDefaultSelectArray();
                self.removeFromParent();
            }
        };

        closeBtn.addTouchEventListener(bindTouchEvent);

        new cc.LabelTTF('活动', GFontDef.fontName, 36).to(node).pp(0.5, 0.78);


        // node.setScale(1);
        // node.runAction(cc.scaleTo(0.5, 1).easing(cc.easeElasticOut()));


        return node;
    },


});
