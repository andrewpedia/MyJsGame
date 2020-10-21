/**
 * Created by grape on 2017/10/10.
 */

var _mpStoreInstance;

var MPStoreLayer = MPBaseModuleLayer.extend({
    box: null,
    btnListView: null,
    storeType: 0,//0是我的摊位，1是竞价摊位

    ctor: function (type) {
        this._super();

        _mpStoreInstance && _mpStoreInstance.removeFromParent();

        _mpStoreInstance = this;

        this.swallowTouch();

        var self = this;
        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            self.getScene().popDefaultSelectArray();
            self.removeFromParent();
        });
        this.size(cc.director.getWinSize());

        this.storeType = type;

        this.box = this.buildMessageBox().to(this).pp();
        this.btnListView = this.buildBtnList().to(this.box).pp(0.17, 0.42);
        this.storeContent = new cc.Node().to(this.box);
        this.storeContent.size(800, 550).p(385, 35);
    },

    close: function () {

        this.getScene().pauseFocus();
        this.bg.runAction(cc.fadeOut(1));
        this.dialog.runAction(cc.moveTo(1, mpV.w / 2, mpV.h * 1.5).easing(cc.easeExponentialOut()));
        this.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(() => {
            this.getScene().popDefaultSelectArray();
        }), cc.removeSelf()));
    },

    onEnter: function () {
        mpGD.netHelp.addNetHandler(this);

        this._super();

        mpApp.showWaitLayer("正在请求数据，请稍候");
        mpGD.netHelp.requestStoreGoods();
    },

    cleanup: function () {
        _mpStoreInstance = null;
        mpGD.netHelp.removeNetHandler(this);

        this._super();
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case  mpNetEvent.StoreGoods:
                mpApp.removeWaitLayer();
                if (data.errMsg) {
                    return;
                }
                this.fillData(data);
                break;
        }
    },

    getWorth: function (price, payType) {
        switch (payType) {
            case 0:
                return price;

            case 1:
                return price * 2;

            case 10:
                return price * 10000;

            default:
                return 0;
        }
    },

    sortData: function (data) {
        data.sort((a, b) => {
            return this.getWorth(a.price, a.payType) - this.getWorth(b.price, b.payType);
        });
    },

    fillData: function (data) {

        this.storeBtnArray = [];

        data.sort(function (a, b) {
            return mpApp.findsGoodsConfig(b.goodsID).sortID - mpApp.findsGoodsConfig(a.goodsID).sortID;
        });

        for (var i in data) {
            var goodsID = data[i].goodsID;

            var goodsName = mpApp.findsGoodsConfig(goodsID).name;

            if (data[i].count == 0)
                continue;

            if (this.storeType == 0 && data[i].userCount == 0)
                continue;

            var btn = this.buildStoreBtn(goodsName, goodsID);

            this.storeBtnArray.push(btn);
            this.btnListView.pushBackCustomItem(btn);
        }

        this.clickFirst();
    },

    ////模拟点击第一个
    clickFirst: function () {
        if (this.storeBtnArray.length > 0) {
            this.touchEventListener(this.storeBtnArray[0], ccui.Widget.TOUCH_ENDED);
        }
    },

    buildStoreBtn: function (title, goodsID) {
        var btn = new FocusButton("activity-btn.png", "activity-btn-click.png", "", ccui.Widget.PLIST_TEXTURE);

        btn.qscale(0.95);

        btn.setTitleText(title);
        btn.setTitleFontSize(30);
        btn.setTitleColor(cc.color(255, 255, 90, 255));

        btn.getTitleRenderer().pp(0.5, 0.5);
        btn.setScale9Enabled(true);
        btn.goodsID = goodsID;
        btn.addTouchEventListener(this.touchEventListener.bind(this), this);
        return btn;
    },

    touchEventListener: function (sender, type) {
        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
        } else if (type == ccui.Widget.TOUCH_ENDED) {
            for (var i = 0; i < this.storeBtnArray.length; ++i) {
                this.storeBtnArray[i].loadTextureNormal("activity-btn.png", ccui.Widget.PLIST_TEXTURE);
            }
            sender.loadTextureNormal("activity-btn-click.png", ccui.Widget.PLIST_TEXTURE);

            this.storeContent.removeAllChildren();
            this.storeContent.boothNode = new MPBoothNode(this, sender).qscale(0.75).pp(0.05, 0.08).to(this.storeContent);
        }
    },

    buildBtnList: function () {

        var listView = new FocusListView().anchor(0.5, 0.5);

        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(350, 510);
        listView.setItemsMargin(20);

        return listView;
    },

    buildMessageBox: function () {

        var self = this;
        var node = new cc.Node().anchor(0.5, 0.5);


        var bg = new cc.Sprite("#activity-bg.png").to(node);
        node.size(bg.size());
        bg.pp();

        //头位置 覆盖底下
        new cc.Sprite("#goods-title.png").to(node).anchor(0.5, 0.5).p(646, 663);
        new cc.Sprite("#store-label.png").to(node, 100000).anchor(0.5, 0.5).pp(0.52, 0.94);

        //关闭按钮
        var closeBtn = this.closeBtn = new FocusButton().to(node).anchor(1.5, 1.5).pp(1, 1);
        closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);


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

        node.setScale(0);
        node.runAction(cc.scaleTo(0.5, 1).easing(cc.easeElasticOut()));


        return node;
    },

});

var MPBoothNode = cc.Node.extend({
    box: null,                      //道具背景框

    goodsScrollView: null,          //道具集合scroll view

    goodsSelect: null,              //物品选择框

    goodsBtnArray: null,

    goodsInfoLayout: null,          //物品详细信息列表

    preBuyLabel: null,              //预计购买花费

    userAllDiamond: null,           // 玩家钻石

    userAllCoin: null,              // 玩家金币

    userAllRMB: null,               // 玩家红包

    storeLayer: null,

    button: null,

    _className: "MPShopLayer",
    _classPath: "src/main/module/MPShopLayer.js",

    ctor: function (storeLayer, button) {
        this._super();

        this.storeLayer = storeLayer;
        this.button = button;

        var self = this;

        this.size(cc.director.getWinSize());

        this.size(800, 550);

        this.box = this;
        this.goodsScrollView = this.buildScrollView().to(this.box).pp(0.22 - 0.02, 0.55 + 0.02);

        this.goodsSelect = new cc.Sprite("#goods-select.png").anchor(0, 0);

        this.goodsSelect.retain();

        this.goodsBtnArray = [];

        mpGD.netHelp.requestStoreGet(button.goodsID);
        this.onUserInfoUpdateListener = cc.eventManager.addCustomListener(mpEvent.UpdateUserInfo, this.updateUserInfo.bind(this));
    },

    fillData: function (data) {
        this.goodsScrollView.removeAllChildren();
        this.goodsInfoLayout && this.goodsInfoLayout.removeFromParent();
        this.goodsInfoLayout = null;
        this.goodsBtnArray = [];

        if (data == null)
            return;

        if (data.length == 0) {
            ttutil.arrayRemove(this.storeLayer.storeBtnArray, this.button);
            this.button.removeFromParent();

            this.removeFromParent();
            this.storeLayer.clickFirst();
            return;
        }

        this.storeLayer.sortData(data);

        var kinds = data.length;

        var cols = 3;
        var rows = Math.ceil(kinds / cols);
        var itemSize = {w: 150, h: 150};

        this.goodsScrollView.setInnerContainerSize(cc.size(450, (itemSize.h) * rows));

        for (var i = 0; i < data.length; ++i) {

            if (this.storeLayer.storeType == 0 && data[i].userID != mpGD.userInfo.userID)
                continue;

            var btn = this.buildGoodsBtn(data[i]);
            var size = this.goodsScrollView.getInnerContainerSize();

            var length = this.goodsBtnArray.length;

            btn.setPosition(itemSize.w / 2 + (length % cols) * itemSize.w, size.height - (itemSize.h / 2 + Math.floor(length / cols) * itemSize.h));

            this.goodsScrollView.addChild(btn);
            this.goodsBtnArray.push(btn);
        }

        if (this.goodsBtnArray.length > 0)
            this.onClickGoods(this.goodsBtnArray[0]);
    },

    buildGoodsBtn: function (data) {

        var btn = new FocusButton("goods-bar.png", "goods-bar.png", "", ccui.Widget.PLIST_TEXTURE);

        var iconID = mpApp.findsGoodsConfig(data.goodsID).iconID;

        var goodsName = "#goods-" + (iconID != null ? iconID : data.goodsID) + ".png";
        if (cc.spriteFrameCache.getSpriteFrame(goodsName.substr(1))) {
            new cc.Sprite(goodsName).to(btn).pp(0.5, 0.5);
        } else {
            new cc.Sprite("#goods-null.png").to(btn).pp(0.5, 0.5);
        }

        new cc.LabelTTF(data.price, GFontDef.fontName, 20).anchor(0, 0).to(btn).pp(0.08, 0.06);
        new cc.Sprite("#gui-gm-icon-" + data.payType + ".png").anchor(1, 0).to(btn).pp(0.95, 0.03).qscale(0.5);
        new cc.LabelTTF("数量:" + data.count, GFontDef.fontName, 20).anchor(1, 0).to(btn).pp(0.93, 0.75);
        var desp = "";
        var goodsInfo = mpApp.findsGoodsConfig(data.goodsID);
        btn.goodsInfo = goodsInfo;
        btn.goodsData = data;

        btn.addClickEventListener(this.onClickGoods.bind(this), this);

        return btn;
    },

    onClickGoods: function (sender) {

        this.goodsSelect.removeFromParent();
        this.goodsSelect.to(sender);

        if (this.goodsInfoLayout) this.goodsInfoLayout.removeFromParent();

        this.preBuyLabel = null;

        this.goodsInfoLayout = this.buildGoodsInfoPanel(sender.goodsInfo, sender.goodsData).to(this.box).pp(0.45, 0.25);
    },

    //创建商品详细信息面板
    buildGoodsInfoPanel: function (goodsInfo, goodsData) {

        var layout = new ccui.Layout();
        layout.setContentSize(600, 400);

        new cc.LabelTTF("摊主：" + goodsData.nickname, GFontDef.fontName, 30).to(layout).p(40, 370).anchor(0, 0.5);

        // 玩家身上钻石
        new cc.Sprite("#gui-geren-box.png").to(layout).p(570, 450).qscale(0.4, 0.5);
        new cc.Sprite("#gui-gm-icon-1.png").to(layout).p(500, 447).qscale(0.6);
        this.userAllDiamond = new cc.LabelTTF(mpGD.userInfo.acer || "0", GFontDef.fontName, 22).to(layout).p(520, 447).anchor(0, 0.5);

        // 玩家身上金币
        new cc.Sprite("#gui-geren-box.png").to(layout).p(570, 410).qscale(0.4, 0.5);
        new cc.Sprite("#gui-gm-icon-0.png").to(layout).p(500, 407).qscale(0.6);
        this.userAllCoin = new cc.LabelTTF(mpGD.userInfo.score || "0", GFontDef.fontName, 22).to(layout).p(520, 407).anchor(0, 0.5);

        // 玩家身上红包
        new cc.Sprite("#gui-geren-box.png").to(layout).p(570, 370).qscale(0.4, 0.5);
        new cc.Sprite("#gui-gm-icon-10.png").to(layout).p(500, 367).qscale(0.6);
        this.userAllRMB = new cc.LabelTTF(mpGD.userInfo.luckyRMB.toFixed(2) || "0", GFontDef.fontName, 22).to(layout).p(520, 367).anchor(0, 0.5);

        // 商品详情
        new cc.LabelTTF("商品详情：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 300);

        var lineNumber = Math.ceil(goodsInfo.desp.length / 16.0);
        var desp = new cc.LabelTTF(goodsInfo.desp, GFontDef.fontName, 24, cc.size(400, 27 * lineNumber), cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        desp.anchor(0, 1).p(155, 314).to(layout);

        var despHeight = desp.getContentSize().height;

        // 有效期
        new cc.LabelTTF("有效期：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 314 - despHeight - 30);
        var lifeString = goodsInfo.life ? goodsInfo.life + "天" : "永久有效";
        var lineNumber = Math.ceil(lifeString.length / 16.0);
        var life = new cc.LabelTTF(lifeString, GFontDef.fontName, 24, cc.size(400, 27 * lineNumber), cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_TOP);

        life.anchor(0, 1).p(155, 314 - despHeight - 15).to(layout);

        // 购买方式
        new cc.LabelTTF("购买方式：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 314 - despHeight - 70);
        new cc.Sprite("#gui-gm-icon-" + goodsData.payType + ".png").to(layout).p(180, 314 - despHeight - 70).qscale(0.7);
        new cc.LabelTTF("单价：" + goodsData.price, GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 314 - despHeight - 105);
        new cc.LabelTTF("数量：" + goodsData.count, GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 314 - despHeight - 140);


        var fixHeight = despHeight > 35 * 3 ? 35 : 0;
        //如果是店主
        if (goodsData.userID == mpGD.userInfo.userID) {
            var btn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(layout).p(450, 50);
            new cc.LabelTTF("下架", GFontDef.fontName, 30).to(btn).pp(0.5, 0.6);
            btn.setPressedActionEnabled(true);
            btn.addClickEventListener(this.onClickDecGoods.bind(this, goodsData.id));
        } else {
            // 购买数量
            new cc.LabelTTF("购买数量：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 50 - fixHeight);

            this.editBox = new FocusEditBox(cc.size(140, 40), new cc.Scale9Sprite("gui-gm-check-box.png")).anchor(0, 0.5).to(layout).p(160, 50 - fixHeight);
            this.editBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.editBox.setDelegate(this);
            this.editBox.setFontSize(24);
            this.editBox.goodsData = goodsData;

            var num = 1;

            this.editBox.setString(1);

            var btn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(layout).p(450, 50 - fixHeight);
            new cc.LabelTTF("立即购买", GFontDef.fontName, 30).to(btn).pp(0.5, 0.6);
            btn.setPressedActionEnabled(true);
            btn.addClickEventListener(() => {
                new MPMessageBoxLayer("提 示", "购买前请注意物品单价，您确定要购买吗?", mpMSGTYPE.MB_OKCANCEL, this.onClickBuyGoods.bind(this, goodsData)).to(this.getScene());
            });
            // 预计花费
            var price = goodsData.price * num;
            this.preBuyLabel = new cc.LabelTTF("预计花费：" + price, GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 10 - fixHeight);
            this.preBuyIcon = new cc.Sprite("#gui-gm-icon-" + goodsData.payType + ".png").to(layout).qscale(0.4);

            var width = this.preBuyLabel.getContentSize().width;
            this.preBuyIcon.p(width + 55, 10 - fixHeight);

            if(G_OPEN_StoreBatchBuy){
                new cc.LabelTTF("购买方式：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(-430, -160);

                // 单选框
                var buildCheckBox = function (payType) {
                    var checkBox = new FocusCheckBox("res/goods/gui-gm-icon-" + payType + "-Empty.png", "res/goods/gui-gm-icon-" + payType + "-selected.png");
                    checkBox.ignoreContentAdaptWithSize(false);
                    checkBox.size(45, 45);
                    checkBox.payType = payType;
                    return checkBox;
                };

                var checkBoxArray = this.checkBoxArray = [];

                checkBoxArray.push(buildCheckBox(0).to(layout).p(-300, -160));
                checkBoxArray.push(buildCheckBox(1).to(layout).p(-260, -160));

                goodsInfo.id != 10 && checkBoxArray.push(buildCheckBox(10).to(layout).p(-220, -160));

                var onRadioClick = (sender, type) => {
                    if (type == ccui.Widget.TOUCH_BEGAN) {
                        SoundEngine.playEffect(commonRes.btnClick);
                    } else if (type == ccui.Widget.TOUCH_ENDED) {
                        //3.15变成 先调用  onRadioClick后， 再处理自身的点击逻辑， 所以要让一个checkBox为selected, 这边就先设置为false, 等他内部再处理成true
                        sender.setSelected(false);
                        for (var i = 0; i < checkBoxArray.length; ++i) {
                            if (checkBoxArray[i] != sender) {
                                checkBoxArray[i].setSelected(false);
                            }
                            else {
                                this.payType = sender.payType;
                            }
                        }
                    }
                };

                for (var i = 0; i < checkBoxArray.length; ++i) {
                    checkBoxArray[i].setSelected(false);
                    checkBoxArray[i].addTouchEventListener(onRadioClick);
                }

                new cc.LabelTTF("单价不高于：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(-200, -160);

                this.priceEditBox = new FocusEditBox(cc.size(140, 40), new cc.Scale9Sprite("gui-gm-check-box.png")).anchor(0, 0.5).to(layout).p(-50, -160);
                this.priceEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
                this.priceEditBox.setDelegate(this);
                this.priceEditBox.setFontSize(24);

                new cc.LabelTTF("数量：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(120, -160);

                this.numEditBox = new FocusEditBox(cc.size(140, 40), new cc.Scale9Sprite("gui-gm-check-box.png")).anchor(0, 0.5).to(layout).p(200, -160);
                this.numEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
                this.numEditBox.setDelegate(this);
                this.numEditBox.setFontSize(24);

                var btn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(layout).p(450, -160);
                new cc.LabelTTF("批量购买", GFontDef.fontName, 30).to(btn).pp(0.5, 0.6);
                btn.setPressedActionEnabled(true);
                btn.addClickEventListener(this.onClickBatchBuyGoods.bind(this, goodsInfo));
            }
        }

        return layout;
    },

    editBoxEditingDidEnd: function (editBox) {

        var num = editBox.getString();
        num = parseInt(num, 10);

        if (isNaN(num) || num <= 0) {
            ToastSystemInstance.buildToast("请输入正确的数值");
            return;
        }

        if (editBox == this.editBox && this.preBuyLabel) {
            var totalPrice = num * editBox.goodsData.price;
            this.preBuyLabel.setString("预计花费：" + totalPrice);
            var width = this.preBuyLabel.getContentSize().width;
            this.preBuyIcon.p(width + 55, 10);
        }
    },

    //立即购买
    onClickBuyGoods: function (goodsData) {
        var num = this.editBox.getString();
        num = parseInt(num, 10);

        if (isNaN(num) || num <= 0) {
            ToastSystemInstance.buildToast("请输入正确的购买数量");
            return;
        }

        var totalPrice = num * goodsData.price;

        switch (goodsData.payType) {
            case 0:
                // 金币
                if (mpGD.userInfo.score < totalPrice) {
                    ToastSystemInstance.buildToast("您的" + CURRENCY + "不够");
                    return;
                }
                break;

            case 1:
                // 钻石
                if (mpGD.userInfo.acer < totalPrice) {
                    ToastSystemInstance.buildToast("您的钻石不够");
                    return;
                }
                break;

            case 10:
                // 红包
                if (mpGD.userInfo.luckyRMB < totalPrice) {
                    ToastSystemInstance.buildToast("您的红包不够");
                    return;
                }
                break;

            default:
                ToastSystemInstance.buildToast("购买方式错误！！！");
                break;
        }

        mpGD.netHelp.requestStoreBuy(goodsData.userID, goodsData.id, parseInt(num));
    },

    //批量购买
    onClickBatchBuyGoods: function (goodsInfo) {
        if (this.payType == null) {
            ToastSystemInstance.buildToast("请先选择购买方式");
            return;
        }

        var price = this.priceEditBox.getString();
        price = parseInt(price, 10);

        if (isNaN(price) || price <= 0) {
            ToastSystemInstance.buildToast("请输入正确的最高单价");
            return;
        }

        var num = this.numEditBox.getString();
        num = parseInt(num, 10);

        if (isNaN(num) || num <= 0) {
            ToastSystemInstance.buildToast("请输入正确的购买数量");
            return;
        }

        mpGD.netHelp.requestStoreBatchBuy(goodsInfo.id, this.payType, price, num);
    },

    onClickDecGoods: function (id) {
        mpGD.netHelp.requestStoreDec(id)
    },


    onEnter: function () {
        mpGD.netHelp.addNetHandler(this);

        this._super();
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        cc.eventManager.removeListener(this.onUserInfoUpdateListener);
        this._super();
    },

    buildScrollView: function () {
        var scrollView = new ccui.ScrollView();

        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setAnchorPoint(0.5, 0.5);
        scrollView.setTouchEnabled(true);
        scrollView.setContentSize(450, 450);

        return scrollView;
    },

    onNetEvent: function (event, data) {
        switch (event) {

            case mpNetEvent.StoreGet:
                if (data.errMsg) {
                    break;
                }

                var list = [];

                for (var key in data) {
                    list.push(data[key]);
                }

                this.fillData(list);
                break;

            case mpNetEvent.StoreBuy:
                mpApp.removeWaitLayer();
                if (data.errMsg) {
                    break;
                }

                this.userAllDiamond.setString(mpGD.userInfo.acer);
                this.userAllCoin.setString(mpGD.userInfo.score);
                this.userAllRMB.setString(mpGD.userInfo.luckyRMB);

                ToastSystemInstance.buildToast("您购买了" + data.count + "个" + data.name + "成功");
                break;

            case mpNetEvent.StoreBatchBuy:
                mpApp.removeWaitLayer();
                break;
        }
    },

    updateUserInfo: function () {
        this.userAllDiamond.setString(mpGD.userInfo.acer);
        this.userAllCoin.setString(mpGD.userInfo.score);
        this.userAllRMB.setString(mpGD.userInfo.luckyRMB);
    }
});