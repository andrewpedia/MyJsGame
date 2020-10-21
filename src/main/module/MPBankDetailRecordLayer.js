/**
 * Created by Apple on 2016/6/23.
 */
/**
 * 保险柜打赏记录
 */
var MPBankDetailRecordLayer = cc.LayerColor.extend({

    _className: "MPBankDetailRecordLayer",
    _classPath: "src/main/module/MPBankDetailRecordLayer.js",

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
        
        mpGD.netHelp.requestBusinessMX();
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
                if (data.type == 3) {
                    //this.toUserEditLable.setString(data.info);
                    break;
                }
                mpApp.removeWaitLayer();
                if (data.success == true) {
                    switch (data.type) {
                        case 1:
                            this.updateListView(data.data);
                            break;
                    }
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


            console.log("更新数据=================" + data.length);
            if (data.length <= 0) {
                return;
            }
            
            //时间 ， 操作类别， 操作描述， 操作金额， 剩下金额
            var createItem = function (time, type, desc, opMoney, leftMoney) {
                var widget = new FocusWidget();
                var bg = new ccui.Scale9Sprite().to(widget);
                bg.initWithSpriteFrameName("res/gui/file/gui-gm-mx-bj.png");
                bg.size(mpV.w * 0.85, 70);
                widget.size(mpV.w * 0.85, 70);
                bg.pp();
                //------------------------
                //银行剩余leftMoney
                //var leftMoneyLabel = new ccui.Text("保险柜:" + ttutil.formatMoney(leftMoney), "res/font/fzcy_s.TTF", 20).anchor(0, 0.5).to(widget).pp(0.77, 0.5);
                //leftMoneyLabel.setColor(cc.color(231, 208, 124));


                //类型
                var typeLabel = new cc.LabelTTF(desc, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.11, 0.5);
                typeLabel.setColor(cc.color(231, 208, 124));
                //金额
                var moneyLabel = new cc.LabelTTF(opMoney, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.36, 0.5);
                moneyLabel.setColor(cc.color(255, 255, 0));
                //银行余额
                var bankMoneyLabel = new cc.LabelTTF(leftMoney, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.58, 0.5);
                bankMoneyLabel.setColor(cc.color(231, 208, 124));
                //时间
                var timeLabel = new cc.LabelTTF(ttutil.formatDate(new Date(time)), GFontDef.fontName, 20).to(widget).pp(0.9, 0.5);
                //var timeLabel = new cc.LabelTTF(info.ts, GFontDef.fontName, 20).to(widget).pp(0.71, 0.5);
                timeLabel.setColor(cc.color(231, 208, 124));

                return widget;
            };
            
            this.listView.removeAllItems();

            
            for (var i = 0; i < data.length; ++i) {
                
                var item = createItem(data[i].ts, data[i].type, data[i].description, data[i].money, data[i].nowBankMoney);

                this.listView.pushBackCustomItem(item);

            }

            //------------------------

            //------------------------


            //------------------------
            
            //状态
//            var stateLabel = new cc.LabelTTF(info.state, GFontDef.fontName, 20).anchor(0.5, 0.5).to(widget).pp(0.89, 0.5);
//            //stateLabel.setColor(cc.color(255, 255, 0));
//            if (info.state.indexOf("申请") > -1) {
//                stateLabel.setColor(cc.color(0, 255, 0));
//            }
//            else {
//                stateLabel.setColor(cc.color(255, 255, 0));
//            }
            


            // widget.setTouchEnabled(true);
            //widget.addTouchEventListener(touchEventListener);

            // widget.mpInfo = info;
            

//        this.listView.removeAllItems();
//        for (var i = 0; i < data.length; ++i) {

//            var item = createItem(data[i]);
//            this.listView.pushBackCustomItem(item);

//        }

    },

    buildRecordInfo: function () {
        var self = this;
        var bg = this.bg = new cc.Sprite("res/gui/file/gui-bank-translation_log_bg.png");

        //关闭按钮
        //--------------------------------------------关闭按钮
        var closeBtn = this.closeBtn = new FocusButton("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
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
        //var nearLabel = new cc.LabelTTF("概况", GFontDef.fontName, 32).to(bg).p(50, 375);
        //nearLabel.setColor(cc.color(203, 186, 105));

        //this.nearDesc = new cc.LabelTTF("", GFontDef.fontName, 28).to(bg).anchor(0, 0.5).p(120, 375);
        //this.nearDesc.setColor(cc.color(203, 255, 105));

        var drawtypeLabel = new cc.LabelTTF("类型", GFontDef.fontName, 24).to(bg).p(150, 375);
        drawtypeLabel.setColor(cc.color(203, 186, 105));
        var moneyLabel = new cc.LabelTTF("操作金额", GFontDef.fontName, 24).to(bg).p(422, 375);
        moneyLabel.setColor(cc.color(203, 186, 105));
        var bankMoneyLabel = new cc.LabelTTF("银行余额", GFontDef.fontName, 24).to(bg).p(670, 375);
        bankMoneyLabel.setColor(cc.color(203, 186, 105));
        var tsLabel = new cc.LabelTTF("创建时间", GFontDef.fontName, 24).to(bg).p(1000, 375);
        tsLabel.setColor(cc.color(203, 186, 105));
//        var stateLabel = new cc.LabelTTF("状态", GFontDef.fontName, 24).to(bg).p(1000, 325);
//        stateLabel.setColor(cc.color(203, 186, 105));

        var hint = new cc.LabelTTF("只显示最近50条", GFontDef.fontName, 16).to(bg).p(600, 35);
        hint.setColor(cc.color(255, 150, 100));

        this.listView = new FocusListView().anchor(0.5, 0.5);
        this.listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.listView.setTouchEnabled(true);
        this.listView.setBounceEnabled(true);
        this.listView.setContentSize(bg.cw() * 0.95, 290);
        this.listView.setItemsMargin(10);
        this.listView.to(bg).pp(0.5, 0.43);
        //-------------------------------------------------------------------------
        //开场动画
        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));
        //-------------------------------------------------------------------------


        return bg;
    }


});