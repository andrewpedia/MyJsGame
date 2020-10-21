/**
 * Created by grape on 2017/10/10.
 */

var _mpBoothInstance;

var MPBoothLayer = cc.LayerColor.extend({
    box: null,
    pageIndex: 0,
    pageSize: 7,

    ctor: function () {
        this._super();

        this._super(cc.color(0x00, 0x00, 0x00, 128));

        _mpBoothInstance && _mpBoothInstance.removeFromParent();

        _mpBoothInstance = this;

        this.swallowTouch();

        var self = this;
        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            self.getScene().popDefaultSelectArray();
            self.removeFromParent();
        });
        this.size(cc.director.getWinSize());

        this.box = this.buildMessageBox().to(this).pp();

        this.createItem("交易时间", "交易类型", "交易描述", "单价", "数量", "总计").to(this.box).anchor(0.5, 0.5).pp(0.5, 0.8);

        var listView = new FocusListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(mpV.w * 0.85, mpV.h * 0.5);
        listView.setItemsMargin(0);
        listView.to(this.box).pp(0.5, 0.5);

        this.mxListView = listView;

        //上一页
        var upBtn = new FocusButton("shangyiye.png", "shangyiye.png", "", ccui.Widget.PLIST_TEXTURE);
        upBtn.to(this.box).pp(0.13, 0.16).qscale(0.9);
        upBtn.setTouchEnabled(true);
        upBtn.setPressedActionEnabled(true);
        upBtn.addClickEventListener(() => {
            if (this.pageIndex == 0) {
                ToastSystemInstance.buildToast("没有上一页了");
                return;
            }

            this.pageIndex--;
            mpGD.netHelp.requestBusinessTW(this.pageIndex * this.pageSize, this.pageSize);
        });
        this.upBtn = upBtn;

        //下一页
        var downBtn = new FocusButton("xiayiye.png", "xiayiye.png", "", ccui.Widget.PLIST_TEXTURE);
        downBtn.to(this.box).pp(0.22, 0.16).qscale(0.9);
        downBtn.setTouchEnabled(true);
        downBtn.setPressedActionEnabled(true);
        downBtn.addClickEventListener(() => {
            this.pageIndex++;
            mpGD.netHelp.requestBusinessTW(this.pageIndex * this.pageSize, this.pageSize);
        });
        this.upBtn = upBtn;

        //我的摊位
        var friendBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE);
        new cc.Sprite("#good-hytw.png").to(friendBtn).pp(0.5, 0.6).qscale(0.9);
        friendBtn.to(this.box).pp(0.73, 0.16).qscale(0.9);
        friendBtn.setTouchEnabled(true);
        friendBtn.setPressedActionEnabled(true);
        friendBtn.addClickEventListener(() => {
            if (G_PLATFORM_TV) {
                ToastSystemInstance.buildToast("TV版本暂不支持此功能，请下载手机版本。");
                return;
            }

            new MPStoreLayer(0).to(this.getScene());
        });

        //竞价摊位
        var hotBtn = new FocusButton("btn_blue2.png", "btn_blue2.png", "", ccui.Widget.PLIST_TEXTURE);
        new cc.Sprite("#good-rmtw.png").to(hotBtn).pp(0.5, 0.6).qscale(0.9);
        hotBtn.to(this.box).pp(0.85, 0.16).qscale(0.9);
        hotBtn.setTouchEnabled(true);
        hotBtn.setPressedActionEnabled(true);
        hotBtn.addClickEventListener(() => {
            if (G_PLATFORM_TV) {
                ToastSystemInstance.buildToast("TV版本暂不支持此功能，请下载手机版本。");
                return;
            }

            new MPStoreLayer(1).to(this.getScene());
        });
    },

    onEnter: function () {
        mpGD.netHelp.addNetHandler(this);

        this._super();

        // mpApp.showWaitLayer("正在请求数据，请稍候");
        mpGD.netHelp.requestBusinessTW(0, this.pageSize);
    },

    cleanup: function () {
        _mpBoothInstance = null;
        mpGD.netHelp.removeNetHandler(this);

        this._super();
    },

    //时间 ， 交易类别， 交易描述， 单价， 数量， 总计
    createItem: function (time, type, desc, price, count, total, payType) {
        payType = payType || "";

        var widget = new FocusWidget();
        widget.size(mpV.w * 0.85, 50);

        var timeLabel = new cc.LabelTTF(cc.isString(time) ? time : ttutil.formatDate(new Date(time)), GFontDef.fontName, 20).to(widget).pp(0.12, 0.5);
        timeLabel.setColor(cc.color(231, 208, 124));

        var typeLabel = new cc.LabelTTF(type, GFontDef.fontName, 20).to(widget).pp(0.3, 0.5);
        typeLabel.setColor(cc.color(231, 208, 124));

        var descLabel = new cc.LabelTTF(desc, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.5, 0.5);
        descLabel.setColor(cc.color(231, 208, 124));

        var priceLabel = new cc.LabelTTF(price + payType, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.7, 0.5);
        priceLabel.setColor(cc.color(231, 208, 124));

        var countLabel = new cc.LabelTTF(count, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.8, 0.5);
        countLabel.setColor(cc.color(231, 208, 124));

        var sumLabel = new cc.LabelTTF(total, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.9, 0.5);
        sumLabel.setColor(cc.color(231, 208, 124));

        if (!cc.isString(total)) {
            if (total < 0) {
                sumLabel.setColor(cc.color(255, 0, 0));
            }
            else {
                sumLabel.setColor(cc.color(0, 255, 0));
                sumLabel.setString("+" + total);
            }
        }

        return widget;
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case  mpNetEvent.QueryBusiness:
                // mpApp.removeWaitLayer();
                if (data.errMsg) {
                    return;
                }
                this.fillData(data.data);
                break;
        }
    },

    fillData: function (data) {
        if (data.length <= 0) {
            ToastSystemInstance.buildToast("没有数据");

            if (this.pageIndex != 0)
                this.pageIndex--;

            return;
        }

        this.mxListView.removeAllItems();
        for (var i = 0; i < data.length; ++i) {

            var type = data[i].buyerID == mpGD.userInfo.userID ? "购买" : "出售";
            var goodsName = mpApp.findsGoodsConfig(data[i].goodsID).name;
            var desc = type == "购买" ? ("向" + data[i].nickname + "购买了" + goodsName) : (data[i].nickname + "购买了我的" + goodsName);
            var total = type == "购买" ? -data[i].price * data[i].count : data[i].price * data[i].count;

            var payType = "";

            switch (data[i].payType) {
                case 0:
                    payType = CURRENCY;
                    break;

                case 1:
                    payType = "钻石";
                    break;

                case 10:
                    payType = "红包";
                    break;
            }

            var item = this.createItem(data[i].ts, type, desc, data[i].price, data[i].count, total, payType);
            this.mxListView.pushBackCustomItem(item);
        }
    },

    buildMessageBox: function () {

        var self = this;
        var node = new cc.Node().anchor(0.5, 0.5);


        var bg = new cc.Sprite("#goods-bg.png").to(node);
        node.size(bg.size());
        bg.pp().qscale(0.9);

        //头位置 覆盖底下
        var size = bg.size();
        new cc.Sprite("#goods-title.png").to(node).qscale(0.9).p(size.width / 2, size.height - 45);
        new cc.Sprite("#store-label.png").to(node, 100000).p(size.width / 2, size.height - 45);

        //关闭按钮
        var closeBtn = this.closeBtn = new FocusButton().to(node).pp(0.885, 0.9);
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
