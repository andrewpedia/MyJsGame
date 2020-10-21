/**
 * Created by Apple on 2016/6/23.
 */
/**
 * 保险柜打赏记录
 */
var MPBankTransferRecordLayer = cc.LayerColor.extend({

    _className: "MPBankTransferRecordLayer",
    _classPath: "src/main/module/MPBankTransferRecordLayer.js",

    ctor: function () {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();
        this.size(mpV.w, mpV.h);
        this.initEx();
        this.initTV();
    },

    onExit: function () {
        this._super();
        mpGD.netHelp.removeNetHandler(this);
    },

    onEnter: function () {
        this._super();
        mpGD.netHelp.addNetHandler(this);
    },
    initEx: function () {
        var self = this;
        this.buildRecordInfo().to(this).pp(0.5, 0.5);
        mpGD.netHelp.requestBusinessZZ();
        mpApp.showWaitLayer("正在请求数据， 请稍候");

        this.swallowKeyboard(function () {
            SoundEngine.playEffect(commonRes.btnClick);
            self.getScene().pauseFocus();
            self.bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                mpGD.mainScene.popDefaultSelectArray();
                self.removeFromParent();
            })));
        });
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.closeBtn);
    },

    refreshFocus: function () {
        var items = this.listView.getItems();

        this.closeBtn.setNextFocus(null, items.length == 0 ? null : items[0], items.length == 0 ? null : items[0], null);

        for (var i = 0; i < items.length; i++) {
            items[i].setNextFocus(i == 0 ? this.closeBtn : items[i - 1], i == items.length - 1 ? null : items[i + 1], null, this.closeBtn);
        }
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.QueryBusiness:
                mpApp.removeWaitLayer();
                if (data.success == true) {
                    this.updateData(data);
                    this.refreshFocus();
                }
                break;
        }
    },

    updateData: function (data) {

        this.nearDesc.setString("最近" + data.days + "天,总转入: " + ttutil.formatMoney(data.income) + "    " + "总转出: " + ttutil.formatMoney(data.outgo));

        this.updateListView(data.data);

    },
    //更新明细模块
    updateListView: function (data) {

        if (data.length <= 0) {
            return;
        }
        this.mxcrtID = data[data.length - 1].id;


        var touchEventListener = function (sender, type) {
            switch (type) {

                case ccui.Widget.TOUCH_ENDED:
                    cc.log("点击到");
                    new MPBankTransferCertificatesLayer(sender.mpInfo).to(cc.director.getRunningScene());
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    cc.log("点击取消");
                    break;

            }
        };

        //时间 ， 操作类别， 操作描述， 操作金额， 剩下金额
        var createItem = function (info) {


            var widget = new FocusWidget();
            var bg = new ccui.Scale9Sprite().to(widget);
            bg.initWithSpriteFrameName("res/gui/file/gui-gm-mx-bj.png");
            bg.size(mpV.w * 0.85, 70);
            widget.size(mpV.w * 0.85, 70);
            bg.pp();

            widget.id = info.id;
            //------------------------
            var timeLabel = new cc.LabelTTF(ttutil.formatDate(new Date(info.ts)), GFontDef.fontName, 20).to(widget).pp(0.1, 0.5);
            timeLabel.setColor(cc.color(231, 208, 124));
            //------------------------


            //------------------------
            var fromInfoNickname = new cc.LabelTTF(info.fromNickname, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.3, 0.5);
            fromInfoNickname.setColor(cc.color(231, 208, 124));

            var fromInfoGameID = new cc.LabelTTF(info.fromGameID, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.42, 0.5);
            fromInfoGameID.setColor(cc.color(255, 255, 0));

            //------------------------
            var opMoneyLabel = new cc.LabelTTF("", GFontDef.fontName, 20).anchor(0.5, 0.5).to(widget).pp(0.57, 0.5);

            var opMoneyText = ttutil.formatMoney(info.money);
            if (info.fromGameID != mpGD.userInfo.gameID) {
                opMoneyLabel.setColor(cc.color(0, 255, 0));
            }
            else {
                opMoneyLabel.setColor(cc.color(255, 0, 0));
            }
            opMoneyLabel.setString(opMoneyText);


            //------------------------
            var toInfoNickname = new cc.LabelTTF(info.toNickname, GFontDef.fontName, 20).anchor(0.5, 0.5).to(widget).pp(0.8, 0.5);
            toInfoNickname.setColor(cc.color(231, 208, 124));
            var toInfoGameID = new cc.LabelTTF(info.toGameID, GFontDef.fontName, 20).anchor(0, 0.5).to(widget).pp(0.95, 0.5);
            toInfoGameID.setColor(cc.color(255, 255, 0));

            widget.setTouchEnabled(true);
            widget.addTouchEventListener(touchEventListener);

            widget.mpInfo = info;
            return widget;
        };

        this.listView.removeAllItems();
        for (var i = 0; i < data.length; ++i) {

            var item = createItem(data[i]);
            this.listView.pushBackCustomItem(item);

        }

    },

    buildRecordInfo: function () {
        var self = this;
        var bg = this.bg = new cc.Sprite("res/gui/file/gui-bank-translation_log_bg.png");

        //关闭按钮
        //--------------------------------------------关闭按钮
        var closeBtn = this.closeBtn = new FocusButton("res/img/close.png", "res/img/close_dj.png", "", ccui.Widget.LOCAL_TEXTURE);
        closeBtn.to(bg).pp(0.97, 0.92);
        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.pauseFocus();
                bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                    mpGD.mainScene.popDefaultSelectArray();
                    self.removeFromParent();
                })));
            }
        };
        closeBtn.addTouchEventListener(touchEventListener);
        //--------------------------------------------关闭按钮

        //近期
        var nearLabel = new cc.LabelTTF("概况", GFontDef.fontName, 32).to(bg).p(50, 375);
        nearLabel.setColor(cc.color(203, 186, 105));

        this.nearDesc = new cc.LabelTTF("", GFontDef.fontName, 28).to(bg).anchor(0, 0.5).p(120, 375);
        this.nearDesc.setColor(cc.color(203, 255, 105));

        var timeLabel = new cc.LabelTTF("时间", GFontDef.fontName, 24).to(bg).p(150, 325);
        timeLabel.setColor(cc.color(203, 186, 105));
        var fromInfoLabel = new cc.LabelTTF("打赏方信息", GFontDef.fontName, 24).to(bg).p(400, 325);
        fromInfoLabel.setColor(cc.color(203, 186, 105));
        var moneyLabel = new cc.LabelTTF("打赏金额", GFontDef.fontName, 24).to(bg).p(650, 325);
        moneyLabel.setColor(cc.color(203, 186, 105));
        var toInfoLabel = new cc.LabelTTF("接受方信息", GFontDef.fontName, 24).to(bg).p(1000, 325);
        toInfoLabel.setColor(cc.color(203, 186, 105));

        var hint = new cc.LabelTTF("只显示最近50条", GFontDef.fontName, 24).to(bg).p(972, 375);
        hint.setColor(cc.color(255, 150, 100));

        this.listView = new FocusListView().anchor(0.5, 0.5);
        this.listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.listView.setTouchEnabled(true);
        this.listView.setBounceEnabled(true);
        this.listView.setContentSize(bg.cw() * 0.95, 270);
        this.listView.setItemsMargin(10);
        this.listView.to(bg).pp(0.5, 0.33);
        //-------------------------------------------------------------------------
        //开场动画
        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));
        //-------------------------------------------------------------------------


        return bg;
    }


});