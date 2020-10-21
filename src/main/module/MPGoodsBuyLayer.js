/**
 * Created by Apple on 2016/6/21.
 */


/**
 * 道具充值购买层
 */
var MPGoodsBuyLayer = cc.LayerColor.extend({

    czType: null,

    _className: "MPBankHongBaoLayer",
    _classPath: "src/main/module/MPBankHongBaoLayer.js",

    ctor: function (goodsInfo, goodsNum) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();

        this.goodsInfo = goodsInfo;
        this.goodsNum = goodsNum;

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

    initEx: function (goodsInfo, goodsNum) {

        var bg = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(this).pp(0.5, 0.5);

        var title = new cc.LabelTTF("购买" + this.goodsNum + "个" + this.goodsInfo.name, GFontDef.fontName, 32).to(bg).pp(0.5, 0.92);
        title.setColor(cc.color(231, 208, 124));

        new cc.LabelTTF("您的红包数量不够，请使用微信或支付宝支付" + this.goodsInfo.price * this.goodsNum + "元", GFontDef.fontName, 32).to(bg).pp(0.5, 0.7);

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
                            this.czType = mpCZType.WX;
                        }
                        else {
                            this.czType = mpCZType.ZFB;
                        }
                    }
                }
            }
        };

        this.weixinCheckBox = mputil.buildCheckBox("微信", checkBoxArray, onRadioClick).to(bg).pp(0.4, 0.4).checkBox;
        this.zhifubaoCheckBox = mputil.buildCheckBox("支付宝", checkBoxArray, onRadioClick).to(bg).pp(0.5, 0.4).checkBox;

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

        onRadioClick(this.weixinCheckBox, ccui.Widget.TOUCH_ENDED);
        this.weixinCheckBox.setSelected(true);
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.closeBtn);

        this.closeBtn.setNextFocus(null, this.zhifubaoCheckBox, null, null);
        this.weixinCheckBox.setNextFocus(this.closeBtn, this.button, null, this.zhifubaoCheckBox);
        this.zhifubaoCheckBox.setNextFocus(this.closeBtn, this.button, this.weixinCheckBox, null);
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.RequestPay:
                mpApp.requestPayCallback(data, this);
                break;

            case mpNetEvent.GoodsPayStatus:
                ToastSystemInstance.buildToast("支付成功，物品已放在您的背包，请注意查收。");
                this.removeFromParent();
                break;
        }
    },

    onSubmit: function () {
        mpApp.requestPay(this.czType, this.goodsInfo.price * this.goodsNum, this.goodsInfo.id, this.goodsNum)
    }
});
