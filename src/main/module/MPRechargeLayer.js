/**
 * Created by Apple on 2016/6/30.
 */


var MPRechargeLayer = MPBaseModuleLayer.extend({

    czBox: null,
    listView: null,

    payTypeBtnArray: null,

    czType: null,       //充值类型

    _className: "MPRechargeLayer",
    _classPath: "src/main/module/MPRechargeLayer.js",

    ctor: function (callback) {
        this._super();
        this.swallowTouch();
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);

        this._super();
    },

    updateUserInfo: function () {
        this.acerNode.setAcerString(mpGD.userInfo.acer);
        this.bankNode.setAcerString(mpGD.userInfo.bankScore);
    },

    //关闭窗口
    // close: function () {
    //     var self = this;
    //     // 暂停按钮点击
    //     this.getScene().pauseFocus();
    //     this.czBox.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
    //         self.runAction(cc.sequence(cc.fadeOut(0.2), cc.callFunc(function () {
    //             mpGD.mainScene.popDefaultSelectArray();
    //         }), cc.removeSelf()));
    //     })));
    // },

    initEx: function () {
        this._super();

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(this).size(mpV.w * 0.75, mpV.h * 0.6).pp(0.5, 0.4);

        this.czBox = this.buildCZBox().to(this).pp(0.5, 0.5);
        // this.czBox.setScale(0);
        // this.czBox.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));

        this.titleSprite = new cc.Sprite("#gui-grzx-czzx.png").to(this.titleBG).pp(0.5, 0.6);

        mpGD.netHelp.requestPayConfig();
        mpApp.showWaitLayer("正在请求充值配置");

        var self = this;
        this.swallowKeyboard(function () {
            self.close();
        });

        // if (!mpGD.userInfo.recommendGameID) {
        //     ToastSystemInstance.buildToast("【钜惠推荐】活动提醒, 你可以绑定推荐人，充值将多获赠5%现金红包")
        // }
    },

    initTV: function () {
        //不是苹果平台就不显示了
        // 苹果无TV 直接返回
        if (G_OPEN_APPLE_PAY)
            return;
        //支付金额
        var items = this.listView.getItems();

        mpGD.mainScene.setFocusSelected(this.payTypeBtnArray[0]);
        //支付类型
        var payTypeBtnArray = this.payTypeBtnArray;

        for (var i = 0; i < payTypeBtnArray.length; i++) {
            payTypeBtnArray[i].setNextFocus(this.backBtn, typeof(items[0]) == "undefined" ? null : items[0].czNode1, i == 0 ? null : payTypeBtnArray[i - 1], i == payTypeBtnArray.length - 1 ? this.backBtn : payTypeBtnArray[i + 1]);
        }

        this.backBtn.setNextFocus(null, null, payTypeBtnArray[payTypeBtnArray.length - 1], null);

        for (var i = 0; i < items.length; i++) {
            items[i].czNode1.setNextFocus(this.payTypeBtnArray[0], items[i].czNode2, i == 0 ? null : items[i - 1].czNode1, i == items.length - 1 ? null : items[i + 1].czNode1);
            items[i].czNode2.setNextFocus(items[i].czNode1, null, i == 0 ? null : items[i - 1].czNode2, i == items.length - 1 ? null : items[i + 1].czNode2);
        }

    },
    buildCZBox: function () {
        var box = new cc.Node().anchor(0.5, 0.5);
        box.size(1100, 600);

        this.payTypeBtnArray = [];

        this.payTypeBtnArray.push(this.buildBtn("#gui-cz-title-alipay.png", mpCZType.ZFB).anchor(0.5, 0).to(box).pp(0.35, 0.9));
        this.payTypeBtnArray.push(this.buildBtn("#gui-cz-title-weichat.png", mpCZType.WX).anchor(0.5, 0).to(box).pp(0.65, 0.9));

        this.listView = this.buildListView().to(box).pp(0.5, 0.38);

        //创建身上钻石模块
        this.acerNode = this.buildAcerNode().to(box).pp(0.4, 0.915).qscale(1);
        this.bankNode = this.buildBankMoney().to(box).pp(0.7, 0.915).qscale(1);

        //模拟点击一次
        this.onClickPayTypeBtn(this.payTypeBtnArray[0]);

        return box;
    },

    buildBtn: function (textPath, cxType) {
        var self = this;
        var btn = new FocusButton("gui_btn_nor.png", "gui_btn_sel.png", "", ccui.Widget.PLIST_TEXTURE);
        var title = textPath ? new cc.Sprite(textPath) : new cc.LabelTTF("苹果", "Microsoft YaHei", 38);

        btn.mpCZType = cxType;
        title.to(btn).pp(0.5, 0.5);

        btn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                self.onClickPayTypeBtn(sender);
            }
        });

        return btn;
    },

    buildCZBox2: function () {

        var box = new cc.Node().anchor(0.5, 0.5);
        box.size(1100, 600);
        // new cc.Sprite("res/gui/file/gui-cz-bg.png").qscale(0.92, 0.87).to(box).pp(0.5, 0.45);
        // new cc.Sprite("#res/gui/file/gui-cz-title-bg.png").to(box).pp(0.5, 0.95);

        // new cc.Sprite("res/gui/file/gui-cz-bar.png").to(box).pp(0.5, 0.38).qscale(1.05, 0.95);

        this.payTypeBtnArray = [];

        if (G_OPEN_APPLE_PAY) {
            this.payTypeBtnArray.push(this.buildBtn(null, mpCZType.IAP).to(box).pp(0.1, 0.785));
        }
        else {
            this.payTypeBtnArray.push(this.buildBtn("#gui-cz-title-alipay.png", mpCZType.ZFB).to(box).pp(0.3, 1));
            this.payTypeBtnArray.push(this.buildBtn("#gui-cz-title-weichat.png", mpCZType.WX).to(box).pp(0.5, 1));
        }

        this.listView = this.buildListView().to(box).pp(0.5, 0.38);

        // this.fillData([
        //     {money: 1, score: 10000, present: 0.5},
        //     {money: 6, score: 60000, present: 0.55},
        //     {money: 12, score: 120000, present: 0.6},
        //     {money: 50, score: 500000, present: 0.65},
        //     {money: 188, score: 1880000, present: 0.7},
        //     {money: 488, score: 4880000, present: 0.75},
        //     {money: 1000, score: 10000000, present: 0.75},
        //     {money: 2000, score: 20000000, present: 0.75},
        //
        // ]);
        //TV 覆写 修改
        this.listView.isOnFinger = function () {
            var count = -1;
            var arrayItems = this.getItems();
            for (var i = 0; i < arrayItems.length; i++) {
                var item = arrayItems[i];
                if (this.shared.selected == item.czNode1 || this.shared.selected == item.czNode2) {
                    count = i;
                    break;
                }
            }
            return count;
        };

        // this.closeBtn = this.buildCloseBtn().to(box, 100).pp(0.97, 0.88);
        //创建保险柜里的钱模块
        // this.buildBankGoldNode().to(box).pp(0.75, 0.74);

        //创建身上钻石模块
        this.acerNode = this.buildAcerNode().to(box).pp(0.58, 0.75).qscale(0.8);

        this.bankNode = this.buildBankMoney().to(box).pp(0.8, 0.75).qscale(0.8);

        //模拟点击一次
        this.onClickPayTypeBtn(this.payTypeBtnArray[0]);

        return box;
    },

    buildCloseBtn: function () {
        //关闭按钮

        var self = this;
        var closeBtn = new FocusButton("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);


        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                self.close();
            }
        };

        closeBtn.addTouchEventListener(touchEventListener);

        return closeBtn;
    },

    onClickPayTypeBtn: function (sender) {

        for (var i = 0; i < this.payTypeBtnArray.length; ++i) {
            this.payTypeBtnArray[i].loadTextureNormal("gui_btn_nor.png", ccui.Widget.PLIST_TEXTURE);
        }
        sender.loadTextureNormal("gui_btn_sel.png", ccui.Widget.PLIST_TEXTURE);

        this.czType = sender.mpCZType;
    },


    //创建充值模块
    buildCZNode: function (index, info) {

        // {
        //     money:xx, score:xx, present:xx
        // }

        // var FoucusWidget = ccui.Widget.extend(FocusBase).extend({});

        var widget = new FocusWidget();
        var bg = new cc.Sprite("#gui-cz-button.png");
        // bg.initWithSpriteFrameName("gui-fly-main-award-shuzi-box.png");
        // bg.size(270,160);
        bg.size(145, 165);
        widget.size(bg.size());
        bg.to(widget).pp(0.5, 0.5);

        if (index > 8) {
            index = 8;
        }

        //金币数量
        new cc.LabelTTF(info.score + CURRENCY, GFontDef.fontName, 20).to(widget).pp(0.5, 0.9);
        // new cc.LabelBMFont(info.score + CURRENCY, "res/font/zhs-fzzyjw-32-Yellow.fnt").to(widget).anchor(0.5,0.5).pp(0.5, 0.85).qscale(0.55);

        var icon = new cc.Sprite("#pay/" + index + ".png").to(widget).pp().qscale(0.5);

        // var moneyLabel = new cc.LabelBMFont(info.money + "元", "res/font/zhs-fzzyjw-32-Gold.fnt").to(widget).anchor(0, 0.5).pp(0.05, 0.85);

        // var srcScore1 = new cc.LabelBMFont(info.acer + "钻石 赠 (" + info.score + ")" + CURRENCY, "res/font/zhs-fzzyjw-32-Yellow.fnt").to(widget).pp(0.5, 0.1).qscale(0.55);

        ///////////////////////////////////////////////////
        //右上角的 赠百分比
        if (info.present > 0) {
            let songBg = new cc.Sprite("#gui-cz-give-box.png");
            songBg.to(widget).pp(0.5, 0.75).qscale(0.65);

            let text = (info.present * 100).toFixed(0) + "%";
            let zengLbl = new cc.LabelTTF(text, GFontDef.fontName, 26).to(songBg).pp(0.5, 0.5);
            // zengLbl.setColor(cc.color(0, 180, 80, 255));
            // new cc.LabelBMFont("赠", "res/font/zhs-fzzyjw-32-Yellow.fnt").to(widget).anchor(0.5,0.5).pp(0.3, 0.7).qscale(0.55);
            // new cc.LabelBMFont((info.present * 100).toFixed(0) + "%", "res/font/zhs-fzzyjw-36-Gold.fnt").to(widget).anchor(0.5,0.5).pp(0.5, 0.7).qscale(0.6);
        }
        ///////////////////////////////////////////////////

        if (info.acer > 0) {
            let songBg = new cc.Sprite("#gui-cz-give-box.png");
            songBg.to(widget).pp(0.5, 0.3).qscale(0.7);

            let text = info.acer + "钻石";
            let zengLbl = new cc.LabelTTF(text, GFontDef.fontName, 22).to(songBg).pp(0.7, 0.5);
        }

        //价格
        let priceBtn = new FocusButton();

        let moneyBg = new cc.Sprite("#btn_green3.png");
        moneyBg.qscale(0.6);
        moneyBg.to(priceBtn).pp();

        // new cc.LabelBMFont(info.money + "元", "res/font/zhs-fzzyjw-32-Gold.fnt",20).to(priceBtn).pp();
        new cc.LabelTTF(info.money + "元", GFontDef.fontName, 28).to(priceBtn).pp();

        priceBtn.setContentSize(moneyBg.size());
        priceBtn.to(widget).pp(0.5, 0.1);


        widget.setTouchEnabled(true);
        var self = this;
        //TV change
        widget.addClickEventListener(self.onClickPay.bind(self));
        widget.mpInfo = info;
        widget.qscale(0.95);
        return widget;
    },

    //保险柜里的钱
    buildBankGoldNode: function () {

        var node = new cc.Node().size(300, 64);
        var goldBox = new cc.Sprite("#gui-gm-gold-box.png").to(node).pp(0.5, 0.5);
        var goldIcon = new cc.Sprite("#gui-bank-baoxianx.png").to(node).pp(0, 0.5).qscale(0.35);


        var goldLabel = new cc.LabelBMFont(ttutil.formatMoney(mpGD.userInfo.bankScore || "0"), "res/font/zhs-yahei-orange-20.fnt").to(node).pp(0.2, 0.5).anchor(0, 0.5);
        node.setMoneyString = (text) => {
            goldLabel.setString(text);
        };

        return node;
    },

    //身上钻石模块
    buildAcerNode: function () {
        var node = new cc.Node().size(300, 64).anchor(0.5, 1);
        var goldBox = new cc.Sprite("#frame_jinbi_bg.png").to(node).pp(0.35, 0.5).qscale(0.8, 1);
        var goldIcon = new cc.Sprite("#pay/1.png").to(node).pp(-0.02, 0.47).qscale(0.6);


        var goldLabel = new cc.LabelBMFont(ttutil.formatMoney(mpGD.userInfo.acer || "0"), "res/font/zhs-yahei-orange-20.fnt").to(node).pp(0.15, 0.5).anchor(0, 0.5);
        node.setAcerString = (text) => {
            goldLabel.setString(text);
        };

        return node;
    },

    //保险柜金币模块
    buildBankMoney: function () {
        var node = new cc.Node().size(300, 64).anchor(0.5, 1);
        var goldBox = new cc.Sprite("#frame_jinbi_bg.png").to(node).pp(0.35, 0.5).qscale(0.8, 1);
        var goldIcon = new cc.Sprite("#gui-bank-baoxianx.png").to(node).pp(-0.03, 0.5).qscale(1);


        var goldLabel = new cc.LabelBMFont(ttutil.formatMoney(mpGD.userInfo.bankScore || "0"), "res/font/zhs-yahei-orange-20.fnt").to(node).pp(0.15, 0.5).anchor(0, 0.5);
        node.setAcerString = (text) => {
            goldLabel.setString(text);
        };

        return node;
    },

    //当点击充值时触发
    onClickPay: function (sender) {
        //new MPRankLayer().to(this);
        //console.log(this.czType);
        //1支付宝支付 2微信支付
        if (this.czType == "1") {
            mpApp.requestPay(this.czType, sender.mpInfo.money);
        }
        else {
            new MPRankLayer().to(this);
        }
    },

    //填充充值数据
    fillData: function (infoArray) {
        var self = this;
        //时间 ， 操作类别， 操作描述， 操作金额， 剩下金额
        var createItem = function (aIndex, bIndex) {

            var widget = new FocusWidget();
            // var widget = new ccui.Widget();
            widget.size(200, 360);
            if (aIndex < infoArray.length) {
                var czNode1 = widget.czNode1 = self.buildCZNode(aIndex + 1, infoArray[aIndex]).to(widget).pp(0.5, 0.75);
            }
            if (bIndex < infoArray.length) {
                var czNode2 = widget.czNode2 = self.buildCZNode(bIndex + 1, infoArray[bIndex]).to(widget).pp(0.5, 0.25);
            }

            return widget;
        };
        for (var i = 0; i < infoArray.length; i += 2) {

            var item = createItem(i, i + 1);
            this.listView.pushBackCustomItem(item);
            // this.listView.pushBackCustomFocusItem(item);
        }
    },

    //创建 listView
    buildListView: function () {

        var listView = new FocusListView().anchor(0.5, 0.5);

        listView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);
        listView.setContentSize(820, 600);
        listView.setItemsMargin(-5);

        return listView;
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.ReadPayConfig:

                mpApp.removeWaitLayer();
                this.fillData(data);
                this.initTV();
                break;
            case mpNetEvent.RequestPay:
                mpApp.requestPayCallback(data, this);
                break;
        }
    },


});


