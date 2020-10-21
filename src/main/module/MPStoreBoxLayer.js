/**
 * Created by orange on 2016/10/11.
 */

var MPStoreSellBoxLayer = cc.LayerColor.extend({
    goodsID: null,
    payType: null,
    cb: null,

    closeBtn: null,
    valueEditBox: null,
    countEditBox: null,
    sureBtn: null,
    payTypeBtn: null,
    checkBoxArray: null,

    _className: "MPStoreSellBoxLayer",
    _classPath: "src/main/module/MPStoreSellBoxLayer.js",

    ctor: function (goodsID, cb) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();
        this.swallowKeyboard(() => {
            this.getScene().popDefaultSelectArray();
            this.removeFromParent();
        });
        this.goodsID = goodsID;
        // this.cb = cb;
        // this.payType = 0;
        this.initEx();
        this.initTV();
    },

    onEnter: function () {
        mpGD.netHelp.addNetHandler(this);
        this._super();
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        this._super();
    },

    initTV: function () {
        this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
        this.getScene().setFocusSelected(this.closeBtn);

        this.refreshFocus();
    },

    refreshFocus: function () {
        this.closeBtn.setNextFocus(null, this.countEditBox, this.countEditBox, null);

        for (var i = 0; i < this.checkBoxArray.length; i++) {
            this.checkBoxArray[i].setNextFocus(this.closeBtn, this.sureBtn, i == 0 ? null : this.checkBoxArray[i - 1], i == this.checkBoxArray.length - 1 ? this.valueEditBox : this.checkBoxArray[i + 1]);
        }
        // this.payTypeBtn.setNextFocus(this.closeBtn, this.sureBtn, null, this.valueEditBox);
        this.valueEditBox.setNextFocus(this.closeBtn, this.sureBtn, this.checkBoxArray[this.checkBoxArray.length - 1], this.countEditBox);
        this.countEditBox.setNextFocus(this.closeBtn, this.sureBtn, this.valueEditBox, this.closeBtn);
        this.sureBtn.setNextFocus(this.valueEditBox, null, null, this.closeBtn);
    },

    initEx: function () {
        var bg = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(this).pp();

        var goodsInfo = mpApp.findsGoodsConfig(this.goodsID);

        // 物品名称
        new cc.LabelTTF(goodsInfo ? goodsInfo.name : "道具不存在", GFontDef.fontName, 24).anchor(0, 0.5).to(bg).p(418, 247);
        // 售卖类型
        new cc.LabelTTF("售卖类型：", GFontDef.fontName, 24).anchor(0, 0.5).to(bg).p(110, 182);

        // 单选框
        var buildCheckBox = function (payType) {
            var checkBox = new FocusCheckBox("res/goods/gui-gm-icon-" + payType + "-Empty.png", "res/goods/gui-gm-icon-" + payType + "-selected.png");
            checkBox.ignoreContentAdaptWithSize(false);
            checkBox.size(45, 45);
            checkBox.payType = payType;
            return checkBox;
        };

        var checkBoxArray = this.checkBoxArray = [];

        checkBoxArray.push(buildCheckBox(0).to(bg).pp(0.25, 0.52));
        checkBoxArray.push(buildCheckBox(1).to(bg).pp(0.29, 0.52));

        this.goodsID != 10 && checkBoxArray.push(buildCheckBox(10).to(bg).pp(0.33, 0.52));

        var onRadioClick = (sender, type) => {
            // if (type != 0) {
            //     ToastSystemInstance.buildToast("暂时不支持该支付方式");
            //     return;
            // }
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
        // checkBoxArray[0].setSelected(true);
        // var btn = new FocusButton("res/goods/gui-gm-icon-" + this.payType + ".png", "").to(bg).p(276, 180).qscale(0.6);
        //
        // btn.addClickEventListener(() => {
        //     this.payType = this.payType == 1 ? 0 : 1;
        //
        //     btn.loadTextures("res/goods/gui-gm-icon-" + this.payType + ".png", "res/goods/gui-gm-icon-" + this.payType + ".png");
        // });

        // this.payTypeBtn = btn;
        // 金额
        new cc.LabelTTF("单价：", GFontDef.fontName, 24).anchor(0, 0.5).to(bg).p(338, 180);
        // 数量
        new cc.LabelTTF("数量：", GFontDef.fontName, 24).anchor(0, 0.5).to(bg).p(630, 180);

        var title = new cc.LabelTTF("请输入售卖的单价和数量", GFontDef.fontName, 32).to(bg).pp(0.5, 0.92);
        title.setColor(cc.color(231, 208, 124));

        //关闭按钮
        var closeBtn = new FocusButton().to(bg).pp(0.97, 0.92);
        closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);

        this.closeBtn = closeBtn;

        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
        };

        var valueEditBox = new FocusEditBox(cc.size(140, 40), new cc.Scale9Sprite("gui-gm-check-box.png")).anchor(0, 0.5);
        valueEditBox.to(bg).pp(0.42, 0.53);
        valueEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        valueEditBox.setDelegate(this);
        valueEditBox.setFontSize(24);
        valueEditBox.setString(0);

        this.valueEditBox = valueEditBox;

        var countEditBox = new FocusEditBox(cc.size(140, 40), new cc.Scale9Sprite("gui-gm-check-box.png")).anchor(0, 0.5);
        countEditBox.to(bg).pp(0.72, 0.53);
        countEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        countEditBox.setDelegate(this);
        countEditBox.setFontSize(24);
        countEditBox.setString(1);

        this.countEditBox = countEditBox;

        this.closeBtn.addTouchEventListener(touchEventListener);
        this.closeBtn.addClickEventListener(() => {
            this.getScene().popDefaultSelectArray();
            bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                this.removeFromParent();
            })));
        });

        //确定按钮
        var button = new FocusButton("gui-gm-button-yellow.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.5, 0.2);
        button.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        button.setTitleText("确 定");
        button.getTitleRenderer().pp(0.5, 0.55);
        button.addTouchEventListener(touchEventListener);
        button.addClickEventListener(this.onSubmit.bind(this));
        this.sureBtn = button;
    },

    editBoxEditingDidEnd: function (editBox) {
        var num = editBox.getString();
        num = parseInt(num, 10);

        if (isNaN(num) || num <= 0) {
            ToastSystemInstance.buildToast("请输入正确的购买数量");
            return false;
        }

        switch (editBox) {
            case this.countEditBox:
                var count = mpApp.findGoodsSet(this.goodsID).count;
                num > count && editBox.setString(count);
                break;

            case this.valueEditBox:
                var goodsInfo = mpApp.findsGoodsConfig(this.goodsID);
                var goodsID = goodsInfo.id;
                var price = goodsInfo.price;

                if (goodsInfo.type == 1) {
                    price *= 2;//一个钻石估价两个金币
                }
                else if (goodsInfo.type == 10) {
                    price *= 10000;//一个红包估价一万金币
                }


                if (this.goodsID == 10) {
                    price = 10000;
                }
                else if (this.goodsID == 13) {
                    price = 10;//兑换券估价十金币
                }


                var value = num;
                var highValue = price * 2;
                var lowValue = price * 0.5;
                var highPrice = highValue;
                var lowPrice = lowValue;
                var desc = CURRENCY;
                if (this.payType == 1) {
                    value *= 2;
                    highPrice = highValue / 2;
                    lowPrice = lowValue / 2;
                    desc = "钻石";
                }
                else if (this.payType == 10) {
                    value *= 10000;
                    highPrice = highValue / 10000;
                    lowPrice = lowValue / 10000;
                    desc = "红包";
                }
                //不是非卖品，售价不高于商城售价
                if (goodsInfo.price != 0) {
                    highPrice /= 2;
                }

                if (value > highValue) {
                    ToastSystemInstance.buildToast("您的售价过高，此物品售价不得高于" + highPrice + desc);
                    editBox.setString(highPrice);
                    return false;
                }
                else if (value < lowValue) {
                    ToastSystemInstance.buildToast("您的售价过低，此物品售价不得低于" + lowPrice + desc);
                    editBox.setString(lowPrice);
                    return false;
                }
                break;
        }

        return true;
    },

    onSubmit: function () {

        if (this.payType == null) {
            ToastSystemInstance.buildToast("请选择售卖类型");
            return;
        }

        if (this.countEditBox.getString() <= 0 || this.valueEditBox.getString() <= 0) {
            ToastSystemInstance.buildToast("价格或者数量不能为0");
            return;
        }

        if (!this.editBoxEditingDidEnd(this.valueEditBox) || !this.editBoxEditingDidEnd(this.countEditBox))
            return;

        mpGD.netHelp.requestStoreAdd(parseInt(this.countEditBox.getString()), parseInt(this.valueEditBox.getString()), this.goodsID, this.payType);

        this.getScene().popDefaultSelectArray();
        // this.cb && this.cb(msg);
        this.removeFromParent();
    }
});