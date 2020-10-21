/**
 * Created by Apple on 2016/6/23.
 */

//输入账户
var MPFindPasswordLayer = MPBaseModuleLayer.extend({

    submitBtn: null,

    _className: "MPFindPasswordLayer",
    _classPath: "src/layer/MPFindPasswordLayer.js",

    initEx: function () {
        this._super(cc.size(800,550));
        var self = this;

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("common_input_box.png");
        bg.size(750, 400).to(this).pp(0.5,0.50 - 0.05);
        // this.titleBG.display("#gui-gm-bt-bj-da.png");
        // this.titleBG.showHelp()
        this.titleBG.setSpriteFrame("safebox_title_reset_pwd.png");
        // this.titleSprite = new cc.Sprite("#accountSafe/title.png").to(this.titleBG).pp(0.5, 0.5);


        var hintLabel = new cc.LabelTTF("请输入您要找回的账号", GFontDef.fontName, 32).to(this).pp(0.5, 0.75- 0.05);

        hintLabel.setColor(cc.color(231, 208, 124));

        var module = this.module = this.buildInputModule("请输入要找回的账号", "账号").to(this).pp(0.5, 0.6- 0.05);
        // this.buildInputModule("请输入验证码", "验证码").to(this).pp(0.5, 0.5);
        module.editBox.setString(MPLoginLayerInstance.accountEdit.getString());

        this.submitBtn = new FocusButton("shell_btn_yes.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.3- 0.05);


        // this.submitBtn.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // this.submitBtn.setTitleText("确 定");
        // this.submitBtn.getTitleRenderer().pp(0.5, 0.55);
        // this.submitBtn.ignoreContentAdaptWithSize(false);
        // this.submitBtn.setScale9Enabled(true);
        // this.helpBtn.size(100, 200);
        // this.helpBtn.setTitleFontSize(32);
        this.submitBtn.addTouchEventListener(function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                self.onSubmit(module.editBox.getString());
            }
        });

    },

    initTV: function () {
        this._super();

        this.backBtn.setNextFocus(null, this.module.editBox, null, null);
        this.module.editBox.setNextFocus(this.backBtn, this.submitBtn, null, null);
        this.submitBtn.setNextFocus(this.module.editBox, null, null, null);
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.ForgotPassword:
                mpApp.removeWaitLayer();

                if (!data.errMsg) {
                    this.removeFromParent();

                    mpGD.userInfo.phone = data.phone;
                    new MPSafeMobileLayer(MPSafeMobileLayer.VerifySafeMobile, MPSafeMobileLayer.VerifyFindPassword,data.phone).to(cc.director.getRunningScene());
                }
                break;
        }
    },

    onSubmit: function (account) {

        if (mputil.accountIsLegal(account)) {
        //console.log("要找回的帐号是:"+account);
            mpGD.netHelp.requestFindPassword(account,null,"verifyPhone");
        }
    },

    //创建 密保 问题及答案输入模块
    buildInputModule: function (placeHolderText, hint) {


        var node = new ccui.Scale9Sprite();
        node.initWithSpriteFrameName("safebox_setpwd_input.png");
        node.size(700, 100);

        var editBox = mputil.buildEditBox(placeHolderText, hint).to(node).pp(0.55, 0.5- 0.05);

        node.editBox = editBox;

        return node;
    },
});