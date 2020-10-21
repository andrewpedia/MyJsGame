/**
 * Created by Apple on 2016/6/21.
 */


/**
 * 实物商品下单层
 */
var MPGoodsOrderLayer = cc.LayerColor.extend({

    choice: null,

    colors: null,
    colorIndex: 0,

    _className: "MPGoodsOrderLayer",
    _classPath: "src/main/module/MPGoodsOrderLayer.js",

    ctor: function (goodsInfo) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();

        this.goodsInfo = goodsInfo;

        if (goodsInfo.choice != null && goodsInfo.choice != "") {
            this.choice = JSON.parse(goodsInfo.choice);
            this.colors = this.choice.colors;
        }

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

        var bg = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(this).pp(0.5, 0.5).size(960, 460)

        var title = new cc.LabelTTF("下单成功后可以在 背包-实物订单 查看订单状态", GFontDef.fontName, 32).to(bg).pp(0.5, 0.92);
        title.setColor(cc.color(231, 208, 124));

        this.phoneEditBox = mputil.buildEditBox("请输入收货人手机号码", "", cc.EDITBOX_INPUT_MODE_NUMERIC, null, null, null, 50).to(bg, 1).pp(0.5, 0.6);
        this.addressEditBox = mputil.buildEditBox("请输入详细收货地址", "", null, null, null, null, 50).to(bg, 1).pp(0.5, 0.45);
        this.notesEditBox = mputil.buildEditBox("请输入备注内容（可不填）", "", null, null, null, null, 50).to(bg, 1).pp(0.5, 0.3);

        if (this.choice == null) {
            this.phoneEditBox.pp(0.5, 0.7);
            this.addressEditBox.pp(0.5, 0.5);
            this.notesEditBox.pp(0.5, 0.3);
        }

        var checkBoxArray = this.checkBoxArray = [];

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
                        this.colorIndex = i;
                    }
                }
            }
        };

        if (this.colors != null) {
            for (var i = 0; i < this.colors.length; i++) {
                mputil.buildCheckBox(this.colors[i], checkBoxArray, onRadioClick).to(bg).pp(0.3 + 0.15 * i, 0.7);
            }

            checkBoxArray.length > 0 && checkBoxArray[0].setSelected(true);
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
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.closeBtn);

        this.closeBtn.setNextFocus(null, this.checkBoxArray.length > 0 ? this.checkBoxArray[0] : this.phoneEditBox, null, null);
        for (var i = 0; i < this.checkBoxArray.length; i++) {
            var left = i == 0 ? null : this.checkBoxArray[i - 1];
            var right = i == this.checkBoxArray.length - 1 ? null : this.checkBoxArray[i + 1];

            this.checkBoxArray[i].setNextFocus(this.closeBtn, this.phoneEditBox, left, right);
        }
        this.phoneEditBox.setNextFocus(this.checkBoxArray.length > 0 ? this.checkBoxArray[0] : this.closeBtn, this.addressEditBox, null, this.zhifubaoCheckBox);
        this.addressEditBox.setNextFocus(this.phoneEditBox, this.notesEditBox, this.weixinCheckBox, null);
        this.notesEditBox.setNextFocus(this.addressEditBox, this.button, this.weixinCheckBox, null);
        this.button.setNextFocus(this.notesEditBox, null, null, null);
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.UseGoods:
                mpApp.removeWaitLayer();
                this.removeFromParent();
                break;
        }
    },

    onSubmit: function () {

        var phone = this.phoneEditBox.getString();
        if (phone.length != 11 || !cc.isNumber(parseInt(phone))) {
            ToastSystemInstance.buildToast("请输入正确的手机号");
            return;
        }

        var address = this.addressEditBox.getString();
        if (address.length < 10) {
            ToastSystemInstance.buildToast("您输入的收货地址过短");
            return;
        }

        var color = this.colors != null ? this.colors[this.colorIndex] : null;
        var choice = JSON.stringify({color: color});

        if (this.choice == null)
            choice = null;

        var notes = this.notesEditBox.getString();

        mpApp.showWaitLayer("正在下单...");
        mpGD.netHelp.requestUseGoods({
            goodsID: this.goodsInfo.id,
            phone: phone,
            address: address,
            choice: choice,
            notes: notes
        });
    }
});
