/**
 * Created by magic_cube on 2017/9/12.
 */

var MPGoodsUseTariffeCardLayer = cc.LayerColor.extend({

    callback: null,

    background: null,

    _className: "MPGoodsUseTariffeCardLayer",
    _classPath: "src/main/module/MPGoodsUseTariffeCardLayer.js",

    ctor: function (type, callback) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));

        this.swallowTouch();

        this.swallowKeyboard(() => {
            mpGD.mainScene.popDefaultSelectArray();
            this.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                this.removeFromParent();
            })));
        });

        this.goodsID = type;

        this.callback = callback;

        this.initTariffeCardLayer();

        this.initTV();
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.closeBtn);

        this.refreshFocus();
    },

    refreshFocus: function () {
        this.closeBtn.setNextFocus(null, this.editBox, null, null);
        this.editBox.setNextFocus(this.closeBtn, this.sureBtn, null, this.sureBtn);
        this.sureBtn.setNextFocus(this.editBox, null, this.editBox, null);
    },

    initTariffeCardLayer: function () {
        // 背景
        this.background = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(this).pp();
        // 标题
        var titleTxt = "";
        if (this.goodsID === mpGoodsID.TariffeCard1)
            titleTxt = "1元话费充值卡";
        else if (this.goodsID === mpGoodsID.TariffeCard5)
            titleTxt = "5元话费充值卡";
        else if (this.goodsID === mpGoodsID.TariffeCard10)
            titleTxt = "10元话费充值卡";
        else if (this.goodsID === mpGoodsID.TariffeCard50)
            titleTxt = "50元话费充值卡";
        else if (this.goodsID === mpGoodsID.TariffeCard100)
            titleTxt = "100元话费充值卡";

        var title = new cc.LabelTTF(titleTxt, GFontDef.fontName, 32).to(this.background).pp(0.5, 0.91);
        title.setColor(cc.color(231, 208, 124));
        //关闭按钮
        this.closeBtn = new FocusButton().to(this.background).pp(0.97, 0.92);
        this.closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.addClickEventListener(() => {
            SoundEngine.playEffect(commonRes.btnClick);
            mpGD.mainScene.popDefaultSelectArray();
            this.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                this.removeFromParent();
            })));
        });

        // 编辑框
        this.editBox = new FocusEditBox(cc.size(580, 80), new ccui.Scale9Sprite("res/gui/login/gui-Login-text-box.png")).to(this.background).pp(0.33, 0.53);
        this.editBox.setFontSize(64);
        this.editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
        this.editBox.setMaxLength(11);
        this.editBox.setInputMode(cc.EDITBOX_INPUT_MODE_PHONENUMBER);
        this.editBox.setFontColor(cc.color(200, 200, 200, 255));
        // 确定按钮
        var button = new FocusButton("gui-gm-button-yellow.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.background).pp(0.82, 0.51);
        button.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        button.setTitleText("确   定");
        button.getTitleRenderer().pp(0.5, 0.55);
        button.addClickEventListener(() => {
            if (!this.editBox.isFocused()) {
                var phone = this.editBox.getString();
                if (phone) {
                    this.callback && this.callback({id: this.goodsID, txt: titleTxt, phone: phone});
                } else {
                    ToastSystemInstance.buildToast("请输入手机号码再充值！");
                }
            }
        });
        this.sureBtn = button;
        // 注意事项
        var content = new cc.LabelTTF("备注：确认充值后，话费将在10分钟内到账，到账后会有短信通知。如果充值失败，请与客服联系！", GFontDef.fontName, 18).to(this.background).pp(0.5, 0.1);
        content.setColor(cc.color(231, 208, 124));
    },
});