/**
 * Created by orange on 2016/10/11.
 */

var MPShopLayer = MPBaseModuleLayer.extend({
    box: null,                      //商店背景框

    goodsScrollView: null,          //商品集合 scroll view

    goodsBtnArray: null,            //商品集合

    goodsSelect: null,              //物品选择框

    goodsInfoLayout: null,          //物品详细信息列表

    preBuyLabel: null,              //预计购买花费

    userAllDiamond: null,           // 玩家钻石

    userAllCoin: null,              // 玩家金币

    selectIndex: null,              // 选择index

    defaultSelectIndex: 0,

    _className: "MPShopLayer",
    _classPath: "src/main/module/MPShopLayer.js",

    ctor: function (args) {
        this._super();
        this.swallowTouch();

        var self = this;
        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            mpGD.mainScene.popDefaultSelectArray();
            self.goodsSelect && self.goodsSelect.release();
            self.removeFromParent();
        });

        this.size(cc.director.getWinSize());

        var args = args || {};
        this.buyGoodsCallback = args.callback || null;

        mpGD.netHelp.addNetHandler(this);

        this.box = this.buildMessageBox().to(this).pp(0.5, 0.46);

        this.goodsScrollView = this.buildScrollView().to(this.box).pp(0.19, 0.55);

        this.goodsSelect = new cc.Sprite("#goods-select.png").anchor(0, 0);
        this.goodsSelect.retain();

        this.goodsBtnArray = [];

        this.initData();

        this.initTV();
    },

    initEx:function () {
        this._super(cc.size(1184,670));
    },

    initTV: function () {
        if (!G_PLATFORM_TV) return;

        mpGD.mainScene.setFocusSelected(this.closeBtn);

        // this.refreshFocus();
    },

    refreshFocus: function () {
        if (!G_PLATFORM_TV) return;

        //获取坐标
        var getPos = (index, border) => {
            border = border || 3;
            return {x: index % border, y: Math.floor(index / border)};
        };
        //获取索引
        var getIndex = (ccp, border) => {
            border = border || 3;
            return ccp.x + ccp.y * border;
        };
        var array = this.goodsBtnArray;

        mpGD.mainScene.setFocusSelected(this.btn);

        this.closeBtn.setNextFocus(null, this.btn, array[array.length - 1 > 2 ? 2 : array.length - 1], null);
        this.btn.setNextFocus(this.closeBtn, this.friendBoothBtn.isVisible() ? this.friendBoothBtn : null, array[array.length - 1 > 2 ? 2 : array.length - 1], this.detailButton ? this.detailButton : this.closeBtn);
        this.buyAreaBtn.setNextFocus(array[array.length - 1], null, null, this.prizeAreaBtn);
        this.prizeAreaBtn.setNextFocus(array[array.length - 1], null, this.buyAreaBtn, this.friendBoothBtn.isVisible() ? this.friendBoothBtn : null);
        this.friendBoothBtn.setNextFocus(this.btn, null, this.prizeAreaBtn, this.hotBoothBtn);
        this.hotBoothBtn.setNextFocus(this.btn, null, this.friendBoothBtn, null);
        this.detailButton && this.detailButton.setNextFocus(this.closeBtn, null, this.btn, null);

        for (var i = 0; i < array.length; i++) {
            var pos = getPos(i, 3);
            array[i].setNextFocus(
                pos.y == 0 ? this.closeBtn : array[getIndex({x: pos.x, y: pos.y - 1}, 3)],
                pos.y == getPos(array.length - 1, 3).y ? this.buyAreaBtn : array[getIndex({x: pos.x, y: pos.y + 1}, 3)],
                pos.x == 0 ? null : array[i - 1],
                pos.x == (getPos(array.length - 1, 3).y > pos.y ? 3 : getPos(array.length - 1, 3).x) ? this.btn : array[i + 1]
            );
        }
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        this._super();
    },

    buildMessageBox: function () {

        var self = this;
        var node = new cc.Node().anchor(0.5, 0.5);

        // var bg = new cc.Sprite("#goods-bg.png").to(node);
        node.size(1184,620);

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.size(1110, 510).to(this).pp(0.5,0.45);

        // new cc.Sprite("#line.png").to(this).pp(0.44,0.45).qscale(1.5,1.1);
        // bg.pp();

        var split = new cc.Scale9Sprite("line.png").to(node).pp(0.4, 0.486);
        split.size(3, 560);

        var size = cc.size(1184,620);
        // new cc.Sprite("#goods-title.png").to(node).anchor(0.5, 0.5).p(size.width / 2, size.height - 10);
        new cc.Sprite("#shop-label.png").to(this.titleBG).anchor(0.5, 0.5).pp(0.5,0.6);

        // 关闭按钮
        // var closeBtn = this.closeBtn = new FocusButton().to(node, 10).anchor(2, 1.2).pp(1, 1);
        // closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        // closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);

        var self = this;
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.popDefaultSelectArray();
                self.removeFromParent();
            }
        };

        // closeBtn.addTouchEventListener(bindTouchEvent);

        this.buyAreaBtn = new FocusButton().to(node).pp(0.08, 0.115).qscale(0.95);
        this.buyAreaBtn.loadTextureNormal("btn_yellow.png", ccui.Widget.PLIST_TEXTURE);
        this.buyAreaBtn.loadTexturePressed("btn_yellow_h.png", ccui.Widget.PLIST_TEXTURE);
        //new cc.LabelTTF("购买区", GFontDef.fontName, 32).to(this.buyAreaBtn).pp(0.5, 0.55);
		this.buyAreaBtn.setTitleText("购买区");
		this.buyAreaBtn.setTitleFontSize(32);        this.buyAreaBtn.setTag(ShopFunctionType.Buy);
        this.buyAreaBtn.addClickEventListener(this.onClickAreaBtn.bind(this));
        !G_OPEN_PRIZE_AREA && this.buyAreaBtn.hide();

        this.prizeAreaBtn = new FocusButton().to(node).pp(0.24, 0.115).qscale(0.95);
        this.prizeAreaBtn.loadTextureNormal("btn_yellow.png", ccui.Widget.PLIST_TEXTURE);
        this.prizeAreaBtn.loadTexturePressed("btn_yellow_h.png", ccui.Widget.PLIST_TEXTURE);
        //new cc.LabelTTF("兑奖区", GFontDef.fontName, 32).to(this.prizeAreaBtn).pp(0.5, 0.55);
        this.prizeAreaBtn.setTitleText("兑奖区");
        this.prizeAreaBtn.setTitleFontSize(32);
        
        this.prizeAreaBtn.setTag(ShopFunctionType.Prize);
        this.prizeAreaBtn.addClickEventListener(this.onClickAreaBtn.bind(this));
        !G_OPEN_PRIZE_AREA && this.prizeAreaBtn.hide();

        //我的摊位
        this.friendBoothBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(node).pp(0.78, 0.12).qscale(0.9);
        new cc.Sprite("#good-hytw.png").to(this.friendBoothBtn).pp(0.5, 0.6).qscale(0.9);
        this.friendBoothBtn.setPressedActionEnabled(true);
        this.friendBoothBtn.addClickEventListener(() => {
            if (G_PLATFORM_TV) {
                ToastSystemInstance.buildToast("TV版本暂不支持此功能，请下载手机版本。");
                return;
            }

            new MPStoreLayer(0).to(this.getScene());
        });
        !G_OPEN_BOOTH && this.friendBoothBtn.hide();

        this.hotBoothBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(node).pp(0.9, 0.12).qscale(0.9);
        new cc.Sprite("#good-rmtw.png").to(this.hotBoothBtn).pp(0.5, 0.6).qscale(0.85);
        this.hotBoothBtn.setPressedActionEnabled(true);
        this.hotBoothBtn.addClickEventListener(() => {
            if (G_PLATFORM_TV) {
                ToastSystemInstance.buildToast("TV版本暂不支持此功能，请下载手机版本。");
                return;
            }

            new MPStoreLayer(1).to(this.getScene());
        });
        !G_OPEN_BOOTH && this.hotBoothBtn.hide();

        node.setScale(0.9);
        // node.runAction(cc.scaleTo(0.5, 0.9).easing(cc.easeElasticOut()));

        return node;
    },

    buildScrollView: function () {
        var scrollView = new FocusScrollView();

        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setAnchorPoint(0.5, 0.5);
        scrollView.setTouchEnabled(true);
        scrollView.setContentSize(450, 450);

        return scrollView;
    },

    initData: function () {
        if (mpGD.goodsConfig === null || mpGD.goodsConfig === undefined) return;

        if (mpGD.goodsConfig.length === 0) return;

        this.buyAreaCountArray = [];
        this.prizeAreaCountArray = [];

        mpGD.goodsConfig.sort(function (a, b) {
            if (a.sortID != b.sortID) {
                return b.sortID - a.sortID;
            }
            return b.id - a.id;
        });

        for (var i = 0; i < mpGD.goodsConfig.length; i++) {
            if (!mpGD.goodsConfig[i].enable) continue;

            if (mpGD.goodsConfig[i].areaType === ShopFunctionType.Buy) {
                this.buyAreaCountArray.push(mpGD.goodsConfig[i].id);
            } else if (mpGD.goodsConfig[i].areaType === ShopFunctionType.Prize) {
                this.prizeAreaCountArray.push(mpGD.goodsConfig[i].id);
            }
        }

        this.defaultSelectIndex = 0;
        this.onClickAreaBtn(this.buyAreaBtn);
    },

    fillData: function (type) {
        this.goodsScrollView.removeAllChildren();
        this.goodsBtnArray.length = 0;

        var goodsNum = type === 0 ? this.buyAreaCountArray.length : this.prizeAreaCountArray.length;
        var cols = 3;
        var rows = Math.ceil(goodsNum / cols);
        var itemSize = {w: 150, h: 150};

        this.goodsScrollView.setInnerContainerSize(cc.size(450, (itemSize.h) * rows));

        var count = 0;
        for (var i = 0; i < mpGD.goodsConfig.length; ++i) {
            if (type === mpGD.goodsConfig[i].areaType) {
                if (!mpGD.goodsConfig[i].enable) continue;

                var btn = this.buildGoodsBtn(mpGD.goodsConfig[i], mpGD.goodsConfig[i].id);
                var size = this.goodsScrollView.getInnerContainerSize();

                btn.setPosition(itemSize.w / 2 + (count % cols) * itemSize.w, size.height - (itemSize.h / 2 + Math.floor(count / cols) * itemSize.h));

                this.goodsScrollView.addChild(btn);
                this.goodsBtnArray.push(btn);

                count++;
            }
        }

        this.onClickGoods(this.goodsBtnArray[this.defaultSelectIndex]);
    },

    onClickAreaBtn: function (sender) {
        this.buyAreaBtn.loadTextureNormal("btn_yellow.png", ccui.Widget.PLIST_TEXTURE);
        this.prizeAreaBtn.loadTextureNormal("btn_yellow.png", ccui.Widget.PLIST_TEXTURE);

        sender.loadTextureNormal("btn_yellow_h.png", ccui.Widget.PLIST_TEXTURE);

        this.fillData(sender.getTag());
    },


    buildGoodsBtn: function (data, index) {
        // 背景
        var btn = new FocusButton("goods-bar.png", "goods-bar.png", "", ccui.Widget.PLIST_TEXTURE);

        // 图标
        var goodsName = "";
        if (data.iconID === null) {
            goodsName = "#goods-" + data.id + ".png";
        } else {
            goodsName = "#goods-" + data.iconID + ".png";
        }

        if (cc.spriteFrameCache.getSpriteFrame(goodsName.substr(1))) {
            new cc.Sprite(goodsName).to(btn).size(99, 88).pp(0.5, 0.55);
        } else {
            new cc.Sprite("#goods-null.png").to(btn).size(99, 88).pp(0.5, 0.55);
        }

        if (data.price != 0 && (data.type == 0 || data.type == 1)) {
            new cc.LabelTTF(data.price, GFontDef.fontName, 20).anchor(0, 0).to(btn).pp(0.08, 0.06);
            new cc.Sprite("#gui-gm-icon-" + data.type + ".png").anchor(1, 0).to(btn).pp(0.9, 0.03).qscale(0.5);
        }
        else {
            new cc.LabelTTF(data.name, GFontDef.fontName, 20).anchor(0.5, 0).to(btn).pp(0.5, 0.05);
        }

        // 送金币-标签
        if (data.giveMoney !== 0) {
            new cc.Sprite("#songjinbi.png").to(btn, 10).pp(0.78, 0.81);
        }

        // 热度-标签
        if (data.name.indexOf("话费") != -1 || data.type == 10) {
            var hot = new cc.Sprite("#res/gui/file/gui-cz-hot.png").to(btn, 10).pp(0.18, 0.81);
            hot.runAction(cc.repeatForever(cc.sequence(cc.repeat(cc.sequence(cc.rotateBy(0.05, 10), cc.rotateBy(0.1, -20), cc.rotateBy(0.05, 10)), 5), cc.delayTime(3))));
        }

        btn.goodsInfo = data;
        btn.index = index;
        btn.addClickEventListener(this.onClickGoods.bind(this));

        return btn;
    },

    onClickGoods: function (sender) {
        this.selectIndex = sender.index;

        this.goodsSelect.removeFromParent();
        this.goodsSelect.to(sender);

        this.goodsInfoLayout && this.goodsInfoLayout.removeFromParent();
        this.goodsInfoLayout = this.buildGoodsInfoPanel(sender.goodsInfo).to(this.box).pp(0.4, 0.25);
        //layout.showHelp();
        this.refreshFocus();
    },

    //创建商品详细信息面板
    buildGoodsInfoPanel: function (goodsInfo) {
        var layout = new ccui.Layout();
        layout.setContentSize(600, 400);

        new cc.LabelTTF("商品名称：" + goodsInfo.name, GFontDef.fontName, 30).to(layout).p(40, 370).anchor(0, 0.5);

        // 玩家身上钻石
        new cc.Sprite("#gui-geren-box.png").to(layout).p(620, 400).qscale(0.4, 0.5);
        new cc.Sprite("#gui-gm-icon-1.png").to(layout).p(550, 397).qscale(0.6);
        this.userAllDiamond = new cc.LabelTTF(mpGD.userInfo.acer || "0", GFontDef.fontName, 22).to(layout).p(570, 397).anchor(0, 0.5);

        // 玩家身上金币
        new cc.Sprite("#gui-geren-box.png").to(layout).p(620, 360).qscale(0.4, 0.5);
        new cc.Sprite("#gui-gm-icon-0.png").to(layout).p(550, 357).qscale(0.6);
        this.userAllCoin = new cc.LabelTTF(mpGD.userInfo.score || "0", GFontDef.fontName, 22).to(layout).p(570, 357).anchor(0, 0.5);

        if(G_OPEN_PRIZE_AREA)
        {
            // 玩家身上的兑奖券
            new cc.Sprite("#gui-geren-box.png").to(layout).p(620, 320).qscale(0.4, 0.5);
            new cc.Sprite("#gui-gm-icon-2.png").to(layout).p(550, 317).qscale(0.4, 0.5);
            this.userAllTicket = new cc.LabelTTF("0", GFontDef.fontName, 22).to(layout).p(570, 317).anchor(0, 0.5);
        }

        if (G_OPEN_RED_PACKET)
        {
            // 玩家身上的红包
            new cc.Sprite("#gui-geren-box.png").to(layout).p(620, 280).qscale(0.4, 0.5);
            new cc.Sprite("#gui-gm-icon-10.png").to(layout).p(550, 277).qscale(0.4, 0.5);
            this.userAllLuckyRMB = new cc.LabelTTF(mpGD.userInfo.luckyRMB.toFixed(2) || "0", GFontDef.fontName, 22).to(layout).p(570, 277).anchor(0, 0.5);
        }

        if (G_OPEN_PRIZE_AREA && mpGD.goodsSet.length > 0) {
            for (var i = 0; i < mpGD.goodsSet.length; i++) {
                if (mpGD.goodsSet[i].goodsID === mpGoodsID.GoodsCertificates) {
                    this.userAllTicket.setString(mpGD.goodsSet[i].count);
                }
            }
        }

        // 商品详情
        new cc.LabelTTF("商品详情：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 300);
        // 1个汉字的宽高：24/25（win版）
        var str = goodsInfo.desp.replace(/[^a-z\d .*]/ig, "");
        var count = goodsInfo.desp.length - Math.floor(str.length / 2);
        var lineNumber = Math.ceil(count / 14.0);
        var desp = new cc.LabelTTF(goodsInfo.desp, GFontDef.fontName, 24, cc.size(336, 25 * lineNumber), cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        desp.anchor(0, 1).p(155, 314).to(layout);

        var despHeight = desp.getContentSize().height;

        // 有效期
        new cc.LabelTTF("有效期限：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 314 - despHeight - 30);
        var lifeString = goodsInfo.life ? goodsInfo.life + "天" : "永久有效";
        var lineNumber = Math.ceil(lifeString.length / 16.0);
        var life = new cc.LabelTTF(lifeString, GFontDef.fontName, 24, cc.size(400, 27 * lineNumber), cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_TOP);

        life.anchor(0, 1).p(155, 314 - despHeight - 15).to(layout);

        if (goodsInfo.price !== 0) {
            // 购买方式
            new cc.LabelTTF("购买方式：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 314 - despHeight - 70);

            if (goodsInfo.type == 2 || goodsInfo.type == 3) {
                new cc.Sprite("#gui-gm-icon-2.png").to(layout).p(180, 314 - despHeight - 70).qscale(0.7);
                new cc.Sprite("#gui-gm-icon-0.png").to(layout).p(230, 314 - despHeight - 70).qscale(0.7);
            } else {
                new cc.Sprite("#gui-gm-icon-" + goodsInfo.type + ".png").to(layout).p(180, 314 - despHeight - 70).qscale(0.7);
            }

            // 赠送金币
            if (goodsInfo.giveMoney !== 0) {
                new cc.LabelTTF("赠送" + CURRENCY + "：" + goodsInfo.giveMoney, GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 314 - despHeight - 110);
            }

            // 购买数量
            new cc.LabelTTF("购买数量：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 50);

            this.editBox = new FocusEditBox(cc.size(140, 40), new cc.Scale9Sprite("gui-gm-check-box.png")).anchor(0, 0.5).to(layout).p(160, 50);
            this.editBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.editBox.setDelegate(this);
            this.editBox.setFontSize(24);

            var num = 1;
            // if (goodsInfo.type === 1) {
            //     num = Math.floor(mpGD.userInfo.acer / goodsInfo.price);
            //     num = num >= 100 ? 100 : num;
            //     num = num === 0 ? 1 : num;
            // }
            this.editBox.setString(num);

            if (goodsInfo.url != null && goodsInfo.url != "") {
                var detailButton = this.detailButton = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(layout).p(550, 50).qscale(0.8);
                new cc.LabelTTF("查看详情", GFontDef.fontName, 30).to(detailButton).pp(0.5, 0.6);
                detailButton.setPressedActionEnabled(true);
                detailButton.addClickEventListener(this.onClickViewGoods.bind(this, goodsInfo));
            }

            var btn = this.btn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(layout).p(400, 50).qscale(0.8);
            new cc.LabelTTF("立即购买", GFontDef.fontName, 30).to(btn).pp(0.5, 0.6);
            btn.setPressedActionEnabled(true);
            btn.addClickEventListener(this.onClickBuyGoods.bind(this, goodsInfo));

            this.preBuyLabel1 = null;
            this.preBuyLabel2 = null;
            this.preBuyIcon1 = null;
            this.preBuyIcon2 = null;

            // 预计花费
            var price = goodsInfo.price * num;
            var cost = goodsInfo.ticket * num;

            this.preBuyLabel1 = new cc.LabelTTF("预计花费：", GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 10);

            if (goodsInfo.type == 2 || goodsInfo.type == 3) {
                this.preBuyLabel1.setString("预计花费：" + cost);
                this.preBuyIcon1 = new cc.Sprite("#gui-gm-icon-2.png").to(layout).qscale(0.4);
                this.preBuyLabel2 = new cc.LabelTTF("+ " + price, GFontDef.fontName, 24).anchor(0, 0.5).to(layout).p(40, 10);
                this.preBuyIcon2 = new cc.Sprite("#gui-gm-icon-0.png").to(layout).qscale(0.4);
            } else {
                this.preBuyLabel1.setString("预计花费：" + price);
                this.preBuyIcon1 = new cc.Sprite("#gui-gm-icon-" + goodsInfo.type + ".png").to(layout).qscale(0.4);
            }

            var width1 = this.preBuyLabel1 ? this.preBuyLabel1.getContentSize().width : 0;
            var width2 = this.preBuyLabel2 ? this.preBuyLabel2.getContentSize().width : 0;

            this.preBuyIcon1 && this.preBuyIcon1.p(width1 + 60, 8);
            this.preBuyIcon2 && this.preBuyIcon2.p(width1 + width2 + 100, 8);
            this.preBuyLabel2 && this.preBuyLabel2.p(width1 + 85, 10);
        } else {
            if (G_PLATFORM_TV) {
                var btn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE).to(layout).p(450, 50);
                btn.setTitleLabel(new cc.LabelTTF("确  定", GFontDef.fontName, 32).anchor(0.5, 0.3));
                btn.addClickEventListener(() => {
                    ToastSystemInstance.buildToast({text: "该商品为系统赠送品，多玩多得！"});
                });

                this.btn = btn;
            }
        }

        return layout;
    },

    editBoxEditingDidEnd: function (editBox) {
        var num = this.editBox.getString();
        num = parseInt(num, 10);

        if (isNaN(num) || num <= 0) {
            ToastSystemInstance.buildToast("请输入正确的购买数量");
            return;
        }

        var index1 = ttutil.arrayContains(this.buyAreaCountArray, this.selectIndex);
        var index2 = ttutil.arrayContains(this.prizeAreaCountArray, this.selectIndex);
        var selectGoods = null;

        if (index1 !== -1) {
            selectGoods = this.goodsBtnArray[index1];
        } else if (index2 !== -1) {
            selectGoods = this.goodsBtnArray[index2];
        }

        if (selectGoods) {
            var totalPrice = num * selectGoods.goodsInfo.price;
            var totalCost = num * selectGoods.goodsInfo.ticket;

            if (selectGoods.goodsInfo.type == 2 || selectGoods.goodsInfo.type == 3) {
                this.preBuyLabel1.setString("预计花费：" + totalCost);
                this.preBuyLabel2.setString("+ " + totalPrice);
            } else {
                this.preBuyLabel1.setString("预计花费：" + totalPrice);
            }

            var width1 = this.preBuyLabel1 ? this.preBuyLabel1.getContentSize().width : 0;
            var width2 = this.preBuyLabel2 ? this.preBuyLabel2.getContentSize().width : 0;

            this.preBuyIcon1 && this.preBuyIcon1.p(width1 + 60, 8);
            this.preBuyIcon2 && this.preBuyIcon2.p(width1 + width2 + 100, 8);
            this.preBuyLabel2 && this.preBuyLabel2.p(width1 + 85, 10);
        }
    },

    onClickViewGoods: function (goodsInfo) {
        new WebViewLayer(goodsInfo.url).to(this);
    },

    //购买数量
    onClickBuyGoods: function (goodsInfo) {
        var num = this.editBox.getString();
        num = parseInt(num, 10);

        if (isNaN(num) || num <= 0) {
            ToastSystemInstance.buildToast("请输入正确的购买数量");
            return;
        }

        var totalPrice = num * goodsInfo.price;
        var totalCost = num * goodsInfo.ticket;

        switch (goodsInfo.type) {
            case 1:
                // 钻石
                if (mpGD.userInfo.acer < totalPrice) {
                    ToastSystemInstance.buildToast("您的钻石数量不够");
                    return;
                }
                break;

            case 2:
            case 3:
                // 兑换券
                var goodsSet = mpApp.findGoodsSet(mpGoodsID.GoodsCertificates);
                if (!goodsSet || goodsSet.count < totalCost) {
                    ToastSystemInstance.buildToast("您的物品兑换券数量不够");
                    return;
                }
                else if (mpGD.userInfo.score < totalPrice) {
                    ToastSystemInstance.buildToast("您的" + CURRENCY + "数量不够");
                    return;
                }
                break;

            case 10:
                // 红包
                if (mpGD.userInfo.luckyRMB < totalPrice) {
                    if (mpGD.userInfo.memberOrder >= 2) {
                        new MPGoodsBuyLayer(goodsInfo, num).to(this);
                    }
                    else {
                        ToastSystemInstance.buildToast("您的红包数量不够");
                    }
                    return;
                }
                break;

            default:
                // 金币
                if (mpGD.userInfo.score < totalPrice) {
                    ToastSystemInstance.buildToast("您的" + CURRENCY + "数量不够");
                    return;
                }
                break;
        }

        mpApp.showWaitLayer("正在请求购买道具");

        mpGD.netHelp.requestBuyGoods(goodsInfo.id, num);
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.BuyGoods:
                mpApp.removeWaitLayer();

                if (data.errMsg) return;
                mpApp.updateGoodsSet(data);

                this.userAllDiamond.setString(mpGD.userInfo.acer);
                this.userAllCoin.setString(mpGD.userInfo.score);
                G_OPEN_RED_PACKET && this.userAllLuckyRMB.setString(mpGD.userInfo.luckyRMB.toFixed(2));

                var goodInfo = mpApp.findGoodsSet(data.goodsID);

                var count = this.editBox.getString();
                var getMoney = goodInfo.giveMoney * count;
                if (getMoney > 0) {
                    ToastSystemInstance.buildToast("购买[" + goodInfo.name + "]数目[" + count + "]成功，获赠[" + getMoney + "]" + CURRENCY + ",请在背包及保险柜中查收");
                }
                else {
                    ToastSystemInstance.buildToast("购买[" + goodInfo.name + "]数目[" + count + "]成功,请在背包查收");
                }

                this.buyGoodsCallback && this.buyGoodsCallback();

                break;
            case mpNetEvent.UpdateGoods:
                if (G_OPEN_PRIZE_AREA && data.goodsID === mpGoodsID.GoodsCertificates) {
                    this.userAllTicket.setString(data.count);
                }
                break;
            default:
                break;
        }
    }

});