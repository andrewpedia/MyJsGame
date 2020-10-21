/**
 * Created by orange on 2016/10/10.
 * 背包层
 */

var MPGoodsLayer = MPBaseModuleLayer.extend({

    box: null,                      //道具背景框

    goodsScrollView: null,          //道具集合scroll view

    goodsListView: null,            //单个道具数量list view

    goodsSelect: null,              //物品选择框

    goodsBtnArray: null,

    selectGoodsID: null,            //选择的物品ID

    _className: "MPGoodsLayer",
    _classPath: "src/main/module/MPGoodsLayer.js",

    ctor: function () {
        this._super();
        this.swallowTouch();

        var self = this;
        this.swallowKeyboard(function () {
            if (!self.weatherLayer || !self.mobileLayer || !self.postcodeLayer || !self.calendarLayer) {
                self.cancelCallback && self.cancelCallback();
                self.goodsSelect && self.goodsSelect.release();
                mpGD.mainScene.popDefaultSelectArray();
                self.removeFromParent();
                // mpGD.mainScene.setFocusSelected(mpGD.mainScene.bottomButtons[2]);
            }
        });

        this.size(cc.director.getWinSize());

        this.box = this.buildMessageBox().to(this).pp(0.5, 0.46);

        this.goodsScrollView = this.buildScrollView().to(this.box).pp(0.3, 0.5);

        this.goodsListView = this.buildListView().to(this.box).pp(0.66, 0.5);
        // this.goodsListView.showHelp();

        this.goodsSelect = new cc.Sprite("#goods-select.png").anchor(0, 0);
        this.goodsSelect.retain();

        this.goodsBtnArray = [];

        this.fillData();

        this.initTV();
    },

    initEx:function () {
        this._super(cc.size(1000, 500));

    },

    initTV: function () {
        this.refreshFocus();

        mpGD.mainScene.setFocusSelected(this.backBtn);
    },

    refreshFocus: function () {
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

        mpGD.mainScene.setFocusSelected(this.useBtn);

        this.backBtn.setNextFocus(null, this.hotBtn.isVisible() ? this.hotBtn : null, array[array.length - 1 > 2 ? 2 : array.length - 1], null);
        if (this.useBtn)
            this.useBtn.setNextFocus(this.backBtn, this.sellBtn, array[array.length - 1 > 2 ? 2 : array.length - 1], this.backBtn);
        if (this.sellBtn)
            this.sellBtn.setNextFocus(this.useBtn, this.hotBtn.isVisible() ? this.hotBtn : null, array[array.length - 1 > 2 ? 2 : array.length - 1], this.backBtn);
        for (var i = 0; i < array.length; i++) {
            var pos = getPos(i, 3);
            array[i].setNextFocus(
                pos.y == 0 ? this.backBtn : array[getIndex({x: pos.x, y: pos.y - 1}, 3)],
                pos.y == getPos(array.length - 1, 3).y ? this.orderBtn : array[getIndex({x: pos.x, y: pos.y + 1}, 3)],
                pos.x == 0 ? null : array[i - 1],
                pos.x == (getPos(array.length - 1, 3).y > pos.y ? 3 : getPos(array.length - 1, 3).x) ? this.useBtn : array[i + 1]
            );
        }

        this.orderBtn.setNextFocus(array[array.length - 1], null, null, this.friendBtn.isVisible() ? this.friendBtn : null);
        this.friendBtn.setNextFocus(this.sellBtn ? this.sellBtn : this.backBtn, null, this.orderBtn, this.hotBtn);
        this.hotBtn.setNextFocus(this.sellBtn ? this.sellBtn : this.backBtn, null, this.friendBtn, this.sellBtn);
    },

    buildMessageBox: function () {

        var self = this;
        var node = new cc.Node().anchor(0.5, 0.5);


        // var bg = new cc.Sprite("#goods-bg.png").to(node);
        // node.size(bg.size());
        // bg.pp();
        var bg = new ccui.Scale9Sprite().anchor(0.5,0.5);
        bg.initWithSpriteFrameName("frame_bg.png");
        node.size(1274, 681);
        bg.to(node).size(900, 450).pp(0.52,0.5);

        var size = node.size();
        // new cc.Sprite("#goods-title.png").to(node).anchor(0.5, 0.5).p(size.width / 2, size.height - 10);
        new cc.Sprite("#goods-label.png").to(this.titleBG).anchor(0.5, 0.5).pp(0.5,0.6);


        var split = new cc.Scale9Sprite("line.png").to(bg).pp(0.4, 0.5);
        split.setContentSize(5, 400);


        mpGD.netHelp.addNetHandler(this);
        mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");

        var orderBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE);
        new cc.Sprite("#good-jpdd.png").to(orderBtn).pp(0.5, 0.6).qscale(0.9);
        orderBtn.to(node).pp(0.12, 0.12).qscale(0.9);
        orderBtn.setTouchEnabled(true);
        orderBtn.setPressedActionEnabled(true);
        orderBtn.addClickEventListener((sender) => {
            mpGD.mainScene.pushDefaultSelectArray(sender);
            new MPGoodsOrderDetailLayer().to(this.getScene());
        });
        !G_OPEN_PRIZE_ORDER && orderBtn.hide();
        this.orderBtn = orderBtn;

        //我的摊位
        var friendBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE);
        new cc.Sprite("#good-hytw.png").to(friendBtn).pp(0.5, 0.6).qscale(0.9);
        friendBtn.to(node).pp(0.78, 0.12).qscale(0.9);
        friendBtn.setTouchEnabled(true);
        friendBtn.setPressedActionEnabled(true);
        friendBtn.addClickEventListener(() => {
            if (G_PLATFORM_TV) {
                ToastSystemInstance.buildToast("TV版本暂不支持此功能，请下载手机版本。");
                return;
            }

            new MPStoreLayer(0).to(this.getScene());
        });
        !G_OPEN_BOOTH && friendBtn.hide();
        this.friendBtn = friendBtn;

        //竞价摊位
        var hotBtn = new FocusButton("btn_blue.png", "btn_blue.png", "", ccui.Widget.PLIST_TEXTURE);
        new cc.Sprite("#good-rmtw.png").to(hotBtn).pp(0.5, 0.6).qscale(0.9);
        hotBtn.to(node).pp(0.9, 0.12).qscale(0.9);
        hotBtn.setTouchEnabled(true);
        hotBtn.setPressedActionEnabled(true);
        hotBtn.addClickEventListener(() => {
            if (G_PLATFORM_TV) {
                ToastSystemInstance.buildToast("TV版本暂不支持此功能，请下载手机版本。");
                return;
            }

            new MPStoreLayer(1).to(this.getScene());
        });
        !G_OPEN_BOOTH && hotBtn.hide();
        this.hotBtn = hotBtn;

        node.setScale(0.9);
        // node.runAction(cc.scaleTo(0.5, 0.9).easing(cc.easeElasticOut()));


        return node;
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        mpGD.saNetHelper.removeNetHandler(this);
        this._super();
    },

    buildScrollView: function () {
        var scrollView = new FocusScrollView();

        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setAnchorPoint(0.5, 0.5);
        scrollView.setTouchEnabled(true);
        scrollView.setContentSize(300, 390);

        return scrollView;
    },

    buildListView: function () {
        var listView = new FocusListView();

        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setAnchorPoint(0.5, 0.5);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(480, 400);
        listView.setItemsMargin(10);

        return listView;
    },

    fillData: function () {

        this.goodsScrollView.removeAllChildren();

        if (mpGD.goodsSet == null) return;
        var kinds = mpGD.goodsSet.length;
        if (mpGD.goodsSet.length == 0) return;

        var cols = 2;
        var rows = Math.ceil(kinds / cols);
        var itemSize = {w: 150, h: 150};

        this.goodsScrollView.setInnerContainerSize(cc.size(300, (itemSize.h) * rows));

        var index = 0;

        for (var i = 0; i < mpGD.goodsSet.length; ++i) {
            var btn = this.buildGoodsBtn(mpGD.goodsSet[i], i);
            var size = this.goodsScrollView.getInnerContainerSize();

            btn.setPosition(itemSize.w / 2 + (i % cols) * itemSize.w, size.height - (itemSize.h / 2 + Math.floor(i / cols) * itemSize.h));

            this.goodsScrollView.addChild(btn);
            this.goodsBtnArray[i] = btn;

            if (mpGD.goodsSet[i].goodsID == this.selectGoodsID) {
                index = i;
            }
        }

        this.onClickGoods(this.goodsBtnArray[index]);
    },

    buildGoodsBtn: function (data, index) {

        var btn = new FocusButton("goods-bar.png", "goods-bar.png", "", ccui.Widget.PLIST_TEXTURE);

        // 图标
        var goodsConfig;
        for (var i = 0; i < mpGD.goodsConfig.length; i++) {
            if (mpGD.goodsConfig[i].id === data.goodsID) {
                goodsConfig = mpGD.goodsConfig[i];
                break;
            }
        }

        var goodsName = "";
        if (goodsConfig.iconID === null) {
            goodsName = "#goods-" + goodsConfig.id + ".png";
        } else {
            goodsName = "#goods-" + goodsConfig.iconID + ".png";
        }

        if (cc.spriteFrameCache.getSpriteFrame(goodsName.substr(1))) {
            new cc.Sprite(goodsName).to(btn).size(99, 88).pp(0.5, 0.5);
        } else {
            new cc.Sprite("#goods-null.png").to(btn).size(99, 88).pp(0.5, 0.5);
        }

        // new cc.Sprite("#goods-num.png").anchor(0.5, 0).to(btn).pp(0.5, 0);
        var nameTTF = new cc.LabelTTF(data.name, GFontDef.fontName, 18).anchor(0.5, 0).to(btn).pp(0.5, 0.07);
        nameTTF.setScale(Math.min(1, 120 / nameTTF.width));

        //加个"", 要不0他不显示， cocos bug
        new cc.LabelTTF("" + data.count, GFontDef.fontName, 24).anchor(1, 0).to(btn).pp(0.93, 0.75);
        btn.goodsData = data;
        btn.index = index;

        btn.addClickEventListener(this.onClickGoods.bind(this));


        return btn;
    },

    onClickGoods: function (sender) {
        this.goodsSelect.removeFromParent();
        this.goodsSelect.to(sender);

        this.fillListView(sender.goodsData);
        this.selectGoodsID = sender.goodsData.goodsID;

        this.refreshFocus();
    },

    fillListView: function (goodsData) {
        if (goodsData == null) return;

        this.goodsListView.removeAllChildren();

        var item = this.buildGoodsListItem(goodsData);
        this.goodsListView.pushBackCustomItem(item);
    },

    buildGoodsListItem: function (goodsData) {

        var layout = new ccui.Layout();
        layout.setContentSize(460, 150);
        var itemBG = new cc.Scale9Sprite("frame_sub_bg.png").pp(0.5, 0.5);
        itemBG.setContentSize(460, 150);



        var bar = new cc.Sprite("#goods-bar.png").to(itemBG).pp(0.15, 0.5);

        // 图标
        var goodsConfig;
        for (var i = 0; i < mpGD.goodsConfig.length; i++) {
            if (mpGD.goodsConfig[i].id === goodsData.goodsID) {
                goodsConfig = mpGD.goodsConfig[i];
                break;
            }
        }

        var goodsName = "";
        if (goodsConfig.iconID === null) {
            goodsName = "#goods-" + goodsConfig.id + ".png";
        } else {
            goodsName = "#goods-" + goodsConfig.iconID + ".png";
        }

        if (cc.spriteFrameCache.getSpriteFrame(goodsName.substr(1))) {
            new cc.Sprite(goodsName).to(bar).size(99, 88).pp(0.5, 0.5);
        } else {
            new cc.Sprite("#goods-null.png").to(bar).size(99, 88).pp(0.5, 0.5);
        }

        var desp = "";
        var goodsInfo = mpApp.findsGoodsConfig(goodsData.goodsID);

        if (goodsInfo) desp = goodsInfo.desp;
        if (goodsData.goodsID === mpGoodsID.GoodsCertificates) desp = "用于兑换商城中各种奖品";

        new cc.LabelTTF(desp, GFontDef.fontName, 20, cc.size(200, 120), cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER).to(itemBG).pp(0.5, 0.5);

        var useBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE);
        useBtn.to(itemBG, 1).pp(0.86, 0.7).qscale(0.6);
        useBtn.setTouchEnabled(true);
        useBtn.setPressedActionEnabled(true);
        this.useBtn = useBtn;

        if (goodsData.count !== 0) {
            new cc.Sprite("#goods-ljsy.png").to(this.useBtn).pp(0.5, 0.6);
            this.useBtn.addClickEventListener(this.onClickUseGoods.bind(this, goodsData.goodsID));
        } else {
            new cc.Sprite("#goods-gm.png").to(this.useBtn).pp(0.5, 0.6);
            this.useBtn.addClickEventListener(this.onClickGoToShop.bind(this, goodsData.goodsID));
        }

        if (G_OPEN_BOOTH)
        {
            var sellBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE);
            //出售
            new cc.Sprite("#good-sell.png").to(sellBtn).pp(0.5, 0.6);

            sellBtn.to(itemBG).pp(0.86, 0.25);
            sellBtn.qscale(0.8);
            sellBtn.setTouchEnabled(true);
            sellBtn.setPressedActionEnabled(true);
            sellBtn.addClickEventListener(this.onClickSellGoods.bind(this, goodsData.goodsID));
            this.sellBtn = sellBtn;
        }
        else
        {
            useBtn.pp(0.86,0.5);
        }


        itemBG.to(layout).pp(0.5, 0.5);

        return layout;
    },

    // 前往商城
    onClickGoToShop: function (goodsID) {

        var goodsInfo = mpApp.findsGoodsConfig(goodsID);

        if (!goodsInfo.enable) {
            ToastSystemInstance.buildToast("该商品已在商店下架！");
            return;
        }

        if (goodsInfo.price == 0) {
            ToastSystemInstance.buildToast("该商品为非卖品，您可以到竞价摊位看看是否有人售卖！");
            return;
        }

        if (G_PLATFORM_TV) {
            new MPShopLayer({
                goodsID: goodsID,
            }).to(cc.director.getRunningScene());

            this.removeFromParent();
        } else {
            new MPShopLayer({
                goodsID: goodsID,
                callback: this.fillData.bind(this),
            }).to(cc.director.getRunningScene());
        }
    },

    //售卖道具
    onClickSellGoods: function (goodsID) {
        var goodsSet = mpApp.findGoodsSet(goodsID);
        if (goodsSet && goodsSet.count <= 0) {
            ToastSystemInstance.buildToast({text: "该商品数量不足，无法出售。"});
            return;
        }
        new MPStoreSellBoxLayer(goodsID).to(this);
    },

    // 使用道具
    onClickUseGoods: function (goodsID) {

        var goodsInfo = mpApp.findsGoodsConfig(goodsID);

        if (goodsInfo.type == 3)//实物类兑换商品
        {
            if (G_PLATFORM_TV) {
                ToastSystemInstance.buildToast({text: "TV版暂不支持该功能，请到手机端尝试！"});
                return;
            }
            mpGD.mainScene.pushDefaultSelectArray(this.useBtn);
            this.goodsOrderLayer = new MPGoodsOrderLayer(goodsInfo).to(this);
            return;
        }

        switch (goodsID) {
            case mpGoodsID.Broadcast:
                mpGD.mainScene.pushDefaultSelectArray(this.useBtn);
                new MPGoodsUseBroadcastLayer(this.useBroadecast.bind(this)).to(this);
                break;

            case mpGoodsID.Weather:
                if (FocusBase.isTVDevice()) {
                    ToastSystemInstance.buildToast("TV版本暂时不支持使用该道具。");
                    break;
                }

                this.weatherLayer = new MPGoodsUseMobQueryLayer(mpGoodsID.Weather, this.useWeather.bind(this)).to(this);
                break;

            case mpGoodsID.Mobile:
                if (FocusBase.isTVDevice()) {
                    ToastSystemInstance.buildToast("TV版本暂时不支持使用该道具。");
                    break;
                }

                this.mobileLayer = new MPGoodsUseMobQueryLayer(mpGoodsID.Mobile, this.useMobile.bind(this)).to(this);
                break;

            case mpGoodsID.Postcode:
                if (FocusBase.isTVDevice()) {
                    ToastSystemInstance.buildToast("TV版本暂时不支持使用该道具。");
                    break;
                }

                this.postcodeLayer = new MPGoodsUseMobQueryLayer(mpGoodsID.Postcode, this.usePostcode.bind(this)).to(this);
                break;

            case mpGoodsID.Calendar:
                if (FocusBase.isTVDevice()) {
                    ToastSystemInstance.buildToast("TV版本暂时不支持使用该道具。");
                    break;
                }

                this.calendarLayer = new MPGoodsUseMobQueryLayer(mpGoodsID.Calendar, this.useCalendar.bind(this)).to(this);
                break;

            case mpGoodsID.TariffeCard1:
                mpGD.mainScene.pushDefaultSelectArray(this.useBtn);
                this.tariffeCardLayer = new MPGoodsUseTariffeCardLayer(mpGoodsID.TariffeCard1, this.useTariffeCard.bind(this)).to(this);
                break;

            case mpGoodsID.TariffeCard5:
                mpGD.mainScene.pushDefaultSelectArray(this.useBtn);
                this.tariffeCardLayer = new MPGoodsUseTariffeCardLayer(mpGoodsID.TariffeCard5, this.useTariffeCard.bind(this)).to(this);
                break;

            case mpGoodsID.TariffeCard10:
                mpGD.mainScene.pushDefaultSelectArray(this.useBtn);
                this.tariffeCardLayer = new MPGoodsUseTariffeCardLayer(mpGoodsID.TariffeCard10, this.useTariffeCard.bind(this)).to(this);
                break;
            case mpGoodsID.TariffeCard50:
                mpGD.mainScene.pushDefaultSelectArray(this.useBtn);
                this.tariffeCardLayer = new MPGoodsUseTariffeCardLayer(mpGoodsID.TariffeCard50, this.useTariffeCard.bind(this)).to(this);
                break;
            case mpGoodsID.TariffeCard100:
                mpGD.mainScene.pushDefaultSelectArray(this.useBtn);
                this.tariffeCardLayer = new MPGoodsUseTariffeCardLayer(mpGoodsID.TariffeCard100, this.useTariffeCard.bind(this)).to(this);
                break;

            case  mpGoodsID.RoomCard:
                ToastSystemInstance.buildToast("房卡需要在游戏房间内使用！");
                break;

            case  mpGoodsID.RedPacket:
                ToastSystemInstance.buildToast("推广红包转为现金红包需要在保险柜操作！");
                break;

            case mpGoodsID.GoodsCertificates:
                ToastSystemInstance.buildToast("兑换券需要在 商城-兑奖区 使用！");
                break;

            case mpGoodsID.RetroactiveCard:
                if (G_OPEN_DAILY_ATTENDANCE) {
                    if (!G_PLATFORM_TV) {
                        new MPDailyAttendanceLayer().to(cc.director.getRunningScene());
                    } else {
                        ToastSystemInstance.buildToast("TV版不支持签到功能，请在手机端尝试！");
                    }
                } else {
                    ToastSystemInstance.buildToast("暂时无法使用");
                }

                break;

            case mpGoodsID.RenameCard:
                new MPPersonalCenterLayer().to(cc.director.getRunningScene());
                break;

            case mpGoodsID.CoinPackage1:
            case mpGoodsID.CoinPackage10:
            case mpGoodsID.CoinPackage100:
            case mpGoodsID.CoinPackage1000:
                mpGD.netHelp.requestUseGoods({goodsID: goodsID});
                break;
        }
    },

    onSANetEvent: function (event, data) {
        switch (event) {
            case mpSANetEvent.UseBroadcast:
                if (data.successMsg) {
                    mpApp.removeWaitLayer();
                }
                break;

            // case mpSANetEvent.UseMobQuery:
            //     if (data.id === mpGoodsID.Weather) {
            //         this.weatherLayer.setWeatherContent(JSON.parse(data.data));
            //     } else if (data.id === mpGoodsID.Mobile) {
            //         this.mobileLayer.setMobileContent(JSON.parse(data.data));
            //     } else if (data.id === mpGoodsID.Postcode) {
            //         this.postcodeLayer.setPostcodeContent(JSON.parse(data.data));
            //     } else if (data.id === mpGoodsID.Calendar) {
            //         this.calendarLayer.setCalendarContent(JSON.parse(data.data));
            //     }
            //
            //     mpApp.removeWaitLayer();
        }
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.UpdateGoods:
                mpApp.updateGoodsSet(data);
                this.fillData();
                break;

            case mpNetEvent.UseGoods:
                if (!data.errMsg) {
                    mpGD.mainScene.popDefaultSelectArray();
                    this.tariffeCardLayer && this.tariffeCardLayer.removeFromParent();
                }
                mpApp.removeWaitLayer();
                break;

            case  mpNetEvent.StoreAdd:
                if (data.errMsg) {
                    break;
                }
                ToastSystemInstance.buildToast(data.msg);
                break;
        }
    },

    useBroadecast: function (msg) {
        var goodsSet = mpApp.findGoodsSet(mpGoodsID.Broadcast);
        if (goodsSet == null || goodsSet.count == 0) {
            ToastSystemInstance.buildToast("您的喇叭数量不够，不能发送喇叭消息");
            return;
        }

        mpApp.showWaitLayer("正在发送喇叭消息");
        mpGD.saNetHelper.requestUseBroadcast(msg);
    },

    useTariffeCard: function (msg) {
        var goodsSet = mpApp.findGoodsSet(msg.id);
        if (goodsSet == null || goodsSet.count == 0) {
            ToastSystemInstance.buildToast("您的“" + msg.txt + "”数量不够，不能充值话费。");
            return;
        }
        mpApp.showWaitLayer("正在请求充值话费...");

        mpGD.netHelp.requestUseGoods({goodsID: msg.id, phoneNo: msg.phone});
    },

    useWeather: function (msg) {
        var goodsSet = mpApp.findGoodsSet(mpGoodsID.Weather);
        if (goodsSet == null || goodsSet.count == 0) {
            ToastSystemInstance.buildToast("您的“天气预报”数量不够，不能查询天气状况。");
            return;
        }
        mpApp.showWaitLayer("请稍等，正在请求“天气预报”查询结果。");

        var that = this;
        var callback = function (flg, data) {
            that.weatherLayer.setWeatherContent(data);
            if (flg) {
                mpGD.netHelp.requestUseGoods({count: 1, goodsID: mpGoodsID.Weather});
            }
            mpApp.removeWaitLayer();
        };

        if (msg.province && msg.city) {
            var url = mpNetConfig.mobUrl + "/useMob?id=" + msg.id + "&province=" + msg.province + "&city=" + msg.city;
            this.requestMobQueryData(url, callback);
        }
    },

    useMobile: function (msg) {
        var goodsSet = mpApp.findGoodsSet(mpGoodsID.Mobile);
        if (goodsSet == null || goodsSet.count == 0) {
            ToastSystemInstance.buildToast("您的“手机号码归属地”数量不够，不能进行相关查询。");
            return;
        }
        mpApp.showWaitLayer("请稍等，正在请求“手机号码归属地”查询结果。");

        var that = this;
        var callback = function (flg, data) {
            that.mobileLayer.setMobileContent(data);
            if (flg) {
                mpGD.netHelp.requestUseGoods({count: 1, goodsID: mpGoodsID.Mobile});
            }
            mpApp.removeWaitLayer();
        };

        if (msg.phone) {
            var url = mpNetConfig.mobUrl + "/useMob?id=" + msg.id + "&phone=" + msg.phone;
            this.requestMobQueryData(url, callback);
        }
    },

    usePostcode: function (msg) {
        var goodSet = mpApp.findGoodsSet(mpGoodsID.Postcode);
        if (goodSet == null || goodSet.count == 0) {
            ToastSystemInstance.buildToast("您的“邮编查询”数量不够，不能进行相关查询。");
            return;
        }
        mpApp.showWaitLayer("请稍等，正在请求“邮编”查询结果。");

        var that = this;
        var callback = function (flg, data) {
            that.postcodeLayer.setPostcodeContent(data);
            if (flg) {
                mpGD.netHelp.requestUseGoods({count: 1, goodsID: mpGoodsID.Postcode});
            }
            mpApp.removeWaitLayer();
        };

        if (msg.postcode) {
            var url = mpNetConfig.mobUrl + "/useMob?id=" + msg.id + "&postcode=" + msg.postcode;
            this.requestMobQueryData(url, callback);
        }
    },

    useCalendar: function (msg) {
        var goodSet = mpApp.findGoodsSet(mpGoodsID.Calendar);
        if (goodSet == null || goodSet.count == 0) {
            ToastSystemInstance.buildToast("您的“万年历”数量不够，不能进行相关查询。");
            return;
        }
        mpApp.showWaitLayer("请稍等，正在请求“万年历”查询结果。");

        var that = this;
        var callback = function (flg, data) {
            that.calendarLayer.setCalendarContent(data);
            if (flg) {
                mpGD.netHelp.requestUseGoods({count: 1, goodsID: mpGoodsID.Calendar});
            }
            mpApp.removeWaitLayer();
        };

        if (msg.date) {
            var url = mpNetConfig.mobUrl + "/useMob?id=" + msg.id + "&date=" + msg.date;
            this.requestMobQueryData(url, callback);
        }
    },

    requestMobQueryData: function (url, callback) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                var httpStatus = xhr.statusText;
                var response = JSON.parse(xhr.responseText);

                if (response.errMsg || response.retCode !== "200") {
                    callback && callback(false, {retCode: 20404});
                } else {
                    callback && callback(true, response);
                }
            }
        };
        xhr.send();
    },
});
