/**
 * Created by Apple on 2016/6/21.
 */


/**
 * 红包转出层
 */
var MPBankHongBaoLayer = cc.LayerColor.extend({

    payType: null,

    _className: "MPBankHongBaoLayer",
    _classPath: "src/main/module/MPBankHongBaoLayer.js",

    ctor: function (money) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();

        this.money = money;

        this.initEx();
        this.initTV();
    },

    onEnter: function () {
        this._super();
        mpGD.netHelp.addNetHandler(this);
    },

    onExit: function () {
        this._super();
        mpGD.netHelp.removeNetHandler(this);
    },

    initEx: function () {
        var bg = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(this).pp(0.5, 0.5);

        var title = new cc.LabelTTF("转出到微信或支付宝", GFontDef.fontName, 32).to(bg).pp(0.5, 0.92);
        title.setColor(cc.color(231, 208, 124));

        this.moneyEditBox = mputil.buildEditBox("请填写转出数额", "", cc.EDITBOX_INPUT_MODE_NUMERIC).to(bg, 1).qscale(0.8);
        this.accountEditBox = mputil.buildEditBox("请填写到账账户", "").to(bg, 1).qscale(0.8);
        this.accountEditBox.setString(mpGD.userInfo.phone);
        this.accountEditBox.setTouchEnabled(false);

        this.nameEditBox = mputil.buildEditBox("请填写账户真实姓名", "").to(bg, 1).qscale(0.8);
        this.nameEditBox.setString(mpGD.userInfo.realname);
        this.nameEditBox.setTouchEnabled(false);

        var checkBoxArray = [];

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
                        if (checkBoxArray[i] == this.weixinCheckBox) {
                            this.moneyEditBox.pp(0.5, 0.55);
                            this.nameEditBox.pp(0.5, 0.4);

                            this.accountEditBox.hide();

                            this.moneyEditBox.setNextFocus(this.zhifubaoCheckBox, this.nameEditBox, null, null);
                            this.nameEditBox.setNextFocus(this.moneyEditBox, this.button, null, null);

                            this.payType = 4;
                        }
                        else {
                            this.moneyEditBox.pp(0.5, 0.62);
                            this.accountEditBox.pp(0.5, 0.47);
                            this.nameEditBox.pp(0.5, 0.32);

                            this.accountEditBox.show();

                            this.moneyEditBox.setNextFocus(this.zhifubaoCheckBox, this.accountEditBox, null, null);
                            this.accountEditBox.setNextFocus(this.moneyEditBox, this.nameEditBox, null, null);
                            this.nameEditBox.setNextFocus(this.accountEditBox, this.button, null, null);

                            this.payType = 3;
                        }
                    }
                }
            }
        };

        if (G_SupportPayCashType.ali && G_SupportPayCashType.wx) {
            this.zhifubaoCheckBox = mputil.buildCheckBox("支付宝", checkBoxArray, onRadioClick).to(bg).pp(0.5, 0.7).checkBox;
            this.weixinCheckBox = mputil.buildCheckBox("微信", checkBoxArray, onRadioClick).to(bg).pp(0.4, 0.7).checkBox;
        }
        else if (G_SupportPayCashType.wx) {
            this.weixinCheckBox = mputil.buildCheckBox("微信", checkBoxArray, onRadioClick).to(bg).pp(0.45, 0.7).checkBox;
        }
        else if (G_SupportPayCashType.ali) {
            this.zhifubaoCheckBox = mputil.buildCheckBox("支付宝", checkBoxArray, onRadioClick).to(bg).pp(0.45, 0.7).checkBox;
        }


        var closeBtn = this.closeBtn = new FocusButton("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(bg).pp(0.97, 0.92);

        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
        };

        var close = () => {
            mpGD.mainScene.pauseFocus();
            bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                mpGD.mainScene.popDefaultSelectArray();
                this.removeFromParent();
            })));
        };

        closeBtn.addTouchEventListener(touchEventListener);
        closeBtn.addClickEventListener(function () {
            close();
        });

        this.swallowKeyboard(function () {
            close();
        });

        //确定按钮
        var button = this.button = new FocusButton("gui-gm-button-yellow.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.5, 0.15).qscale(0.7);
        button.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        button.setTitleText("确 定");
        button.getTitleRenderer().pp(0.5, 0.55);
        button.addTouchEventListener(touchEventListener);
        button.addClickEventListener(() => {
            this.onSubmit();
        });
        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));

        if (mpGD.userInfo.hasOpenID && G_SupportPayCashType.wx) {
            onRadioClick(this.weixinCheckBox, ccui.Widget.TOUCH_ENDED);
            this.weixinCheckBox.setSelected(true);
        }
        else if (G_SupportPayCashType.ali) {
            onRadioClick(this.zhifubaoCheckBox, ccui.Widget.TOUCH_ENDED);
            this.zhifubaoCheckBox.setSelected(true);
        }
        else {
            onRadioClick(this.weixinCheckBox, ccui.Widget.TOUCH_ENDED);
            this.weixinCheckBox.setSelected(true);
        }
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.closeBtn);
        this.closeBtn.setNextFocus(null, this.zhifubaoCheckBox, null, null);
        if (G_SupportPayCashType.ali) {
            this.zhifubaoCheckBox.setNextFocus(this.closeBtn, this.moneyEditBox, this.weixinCheckBox, null);
        }
        if (G_SupportPayCashType.wx) {
            this.weixinCheckBox.setNextFocus(this.closeBtn, this.moneyEditBox, null, this.zhifubaoCheckBox);
        }


        this.button.setNextFocus(this.nameEditBox, null, null, null);
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.PayCash:

                mpApp.removeWaitLayer();
                if (data.successMsg) {
                    this.removeFromParent();
                    _bankLayerInstance && _bankLayerInstance.requestHBData();
                }

                break;
        }
    },

    onSubmit: function () {

        if (this.money < parseInt(this.moneyEditBox.getString())) {
            ToastSystemInstance.buildToast("您的红包数额不够。");
            return;
        }

        if (this.accountEditBox.isVisible() && this.accountEditBox.getString().length == 0) {
            ToastSystemInstance.buildToast("到账账户不能为空。");
            return;
        }

        if (this.nameEditBox.getString().length == 0) {
            ToastSystemInstance.buildToast("账户姓名不能为空。");
            return;
        }

        mpGD.netHelp.requestPayCash(this.payType, this.moneyEditBox.getString(), this.nameEditBox.getString(), this.accountEditBox.getString());
        mpApp.showWaitLayer("正在转出红包到您的账户");
    }
});
