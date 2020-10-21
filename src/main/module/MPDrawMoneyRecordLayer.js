/**
 * Created by Apple on 2016/6/23.
 */
/**
 * 保险柜打赏记录
 */
var MPDrawMoneyRecordLayer = cc.LayerColor.extend({

    _className: "MPDrawMoneyRecordLayer",
    _classPath: "src/main/module/MPDrawMoneyRecordLayer.js",

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
        mpGD.netHelp.requestDrawMoneyLog();
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
            case mpNetEvent.DrawMoneyLog:
                mpApp.removeWaitLayer();
                if (data.success == true) {
                    this.updateData(data);
                    //this.refreshFocus();
                }
                break;
        }
    },

    updateData: function (data) {

        //this.nearDesc.setString("最近" + data.days + "天,总转入: " + ttutil.formatMoney(data.income) + "    " + "总转出: " + ttutil.formatMoney(data.outgo));

        this.updateListView(data.data);

    },
    //更新明细模块
    updateListView: function (data) {
        if ((data && data.length == 0) || !data){
            this.tipsLabel.setString("当前没有兑换记录哦！");
        }
        if (data.length <= 0) {

            return;
        }
        //        this.mxcrtID = data[data.length - 1].id;


        //        var touchEventListener = function (sender, type) {
        //            switch (type) {

        //                case ccui.Widget.TOUCH_ENDED:
        //                    cc.log("点击到");
        //                    new MPBankTransferCertificatesLayer(sender.mpInfo).to(cc.director.getRunningScene());
        //                    break;
        //                case ccui.Widget.TOUCH_CANCELED:
        //                    cc.log("点击取消");
        //                    break;

        //            }
        //        };

        //时间 ， 操作类别， 操作描述， 操作金额， 剩下金额
        var createItem = function (info) {


            var widget = new FocusWidget();
            var bg = new ccui.Scale9Sprite("common_input_box2.png").to(widget);
            // bg.initWithSpriteFrameName("res/gui/file/gui-gm-mx-bj.png");
            bg.size(1020, 70);
            widget.size(1020, 70);
            bg.pp();

            widget.id = info.id;
            //------------------------

            //------------------------


            //------------------------
            //类型
            var drawtypeLabel = new cc.LabelTTF(info.drawtype, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.1, 0.5);
            drawtypeLabel.setColor(cc.color(231, 208, 124));
            //金额
            var moneyLabel = new cc.LabelTTF(info.money, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.27, 0.5);
            moneyLabel.setColor(cc.color(255, 255, 0));
            //收款帐号
             var accountLabel = new cc.LabelTTF(info.draw_account, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.48, 0.5);
             accountLabel.setColor(cc.color(231, 208, 124));
            //时间
            //var timeLabel = new cc.LabelTTF(ttutil.formatDate(new Date(info.ts)), GFontDef.fontName, 20).to(widget).pp(0.58, 0.5);
            var timeLabel = new cc.LabelTTF(info.ts, GFontDef.fontName, 20).to(widget).pp(0.735, 0.5);
            timeLabel.setColor(cc.color(231, 208, 124));
            //状态
            var stateLabel = new cc.LabelTTF(info.state, GFontDef.fontName, 20).anchor(0.5, 0.5).to(widget).pp(0.93, 0.5);
            //stateLabel.setColor(cc.color(255, 255, 0));
            if (info.state.indexOf("申请") > -1) {
                stateLabel.setColor(cc.color(0, 255, 0));
            }
            else {
                stateLabel.setColor(cc.color(255, 255, 0));
            }
            


            // widget.setTouchEnabled(true);
            //widget.addTouchEventListener(touchEventListener);

            // widget.mpInfo = info;
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
        var bg = this.bg = new cc.Sprite("res/images/nopack/hall_bg_common_1120x615.png");

        var title = new cc.Sprite("#ex_record_title.png");
        title.to(bg).pp(0.5,0.925);

        var bg2 = new cc.Scale9Sprite("common_input_box1.png");
        bg2.setContentSize(1020,450);
        bg2.to(this.bg).pp(0.5,0.47);

        var bg3 = new cc.Scale9Sprite("common_input_box.png");
        bg3.setContentSize(1020,400);
        bg3.to(this.bg).pp(0.5,0.43);

        //关闭按钮
        //--------------------------------------------关闭按钮
        var closeBtn = this.closeBtn = new FocusButton("common_btn_x.png", "common_btn_x.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(bg).pp(0.97, 0.95);
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
        //var nearLabel = new cc.LabelTTF("概况", GFontDef.fontName, 32).to(bg).p(50, 375);
        //nearLabel.setColor(cc.color(203, 186, 105));

        //this.nearDesc = new cc.LabelTTF("", GFontDef.fontName, 28).to(bg).anchor(0, 0.5).p(120, 375);
        //this.nearDesc.setColor(cc.color(203, 255, 105));

        var drawtypeLabel = new cc.Sprite("#ex_record_label_type.png").to(bg).p(150, 490);
        drawtypeLabel.setColor(cc.color(203, 186, 105));
        var moneyLabel = new cc.Sprite("#ex_record_moneynum.png").to(bg).p(322, 490);
        moneyLabel.setColor(cc.color(203, 186, 105));
        var accountLabel = new cc.Sprite("res/images/nopack/tikuanzhanghao.png").to(bg).p(540, 490);
        accountLabel.setColor(cc.color(203, 186, 105));
        var tsLabel = new cc.Sprite("#ex_record_label_date.png").to(bg).p(800, 490);
        tsLabel.setColor(cc.color(203, 186, 105));
        var stateLabel = new cc.Sprite("#ex_record_label_status.png").to(bg).p(1000, 490);
        stateLabel.setColor(cc.color(203, 186, 105));

        var hint = new cc.LabelTTF("只显示最近50条", GFontDef.fontName, 16).to(bg).p(600, 50);
        hint.setColor(cc.color("#ff6000"));

        this.tipsLabel = new cc.LabelTTF("",GFontDef.fontName,40);
        this.tipsLabel.to(bg3).pp();

        this.listView = new FocusListView().anchor(0.5, 0.5);
        this.listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.listView.setTouchEnabled(true);
        this.listView.setBounceEnabled(true);
        this.listView.setContentSize(1020, 400);
        this.listView.setItemsMargin(10);
        this.listView.to(bg3).pp(0.5, 0.5);
        //-------------------------------------------------------------------------
        //开场动画
        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));
        //-------------------------------------------------------------------------


        return bg;
    }


});