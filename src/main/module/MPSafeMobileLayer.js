/**
 * Created by Apple on 2016/6/21.
 */


/**
 * 绑定手机
 */
var MPSafeMobileLayer = MPQBackgroundLayer.extend({

    titleSprite: null,

    inputModule1: null,     //输入模块1
    submitBtn: null,                 //确定按钮
    questionListView: null,


    hintLabel: null,                    //提示label
    type: null,
    verifyType: null,

    _className: "MPSafeMobileLayer",
    _classPath: "src/main/module/MPSafeMobileLayer.js",

    ctor: function (type, verifyType,verifyMobileNum) {

        this.type = type;
        this.verifyType = verifyType;
        this.verifyMobileNum=verifyMobileNum;

        this._super();
        this.initEx();
    },

    initEx: function () {

        // this.size(mpV.w, mpV.h);

        // this.titleBG.display("#gui-gm-bt-bj-da.png");
        // this.titleBG.showHelp()
        this.bgSprite = new ccui.Scale9Sprite('res/images/nopack/hall_bg_common_632x433.png').to(this).pp();

        // this.bgSprite.setCapInsets(cc.rect(100, 100, 984, 420));
        var bgSize = cc.size(1000, 450);
        this.bgSprite.size(bgSize);

        // ttutil.adjustNodePos(this.bgSprite);
        // this.titleBG = new cc.Sprite("#top_bg.png").anchor(0, 1).to(this.bgSprite).p(-43, bgSize.height + 50);

        this.backBtn = new FocusButton();
        this.backBtn.loadTextureNormal("common_btn_x.png", ccui.Widget.PLIST_TEXTURE);
        this.backBtn.to(this.bgSprite).p(bgSize.width - 30, bgSize.height - 24);
        var self = this;
        this.backBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                self.getScene().popDefaultSelectArray();
                self.removeFromParent();
            }
        });

        // this.titleSprite = new cc.Sprite("#hall_btn_start_bind_phone.png").to(this.bgSprite).pp(0.5, 0.9);

        this.inputModule1 = this.buildInputModule("安全手机:").to(this).pp(0.5, 0.5);

        var hintText;
        if (this.type == MPSafeMobileLayer.VerifySafeMobile) {
            hintText = "请先验证安全手机";
        }
        else if (this.type == MPSafeMobileLayer.SetSafeMobile) {
            hintText = "您正在设置安全手机";
        }
        else if (this.type == MPSafeMobileLayer.UnBindSafeMobile) {
            hintText = "您正在解绑安全手机";

            mpGD.netHelp.requestUnBindSafeMobile();
        }

        this.hintLabel = new cc.LabelTTF(hintText, GFontDef.fontName, 24).to(this).pp(0.5, 0.76);
        this.hintLabel.setColor(cc.color(0, 255, 0));
        // this.hintText.setColor(cc.color(231, 208, 124));

        //确定按钮
        this.submitBtn = new FocusButton("shell_btn_yes.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.265);

        // this.submitBtn.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // this.submitBtn.setTitleText("确 定");
        // this.submitBtn.getTitleRenderer().pp(0.5, 0.55);
        this.submitBtn.addTouchEventListener(this.touchEventListener.bind(this));
    },

    initTV: function () {
        this._super();

        this.backBtn.setNextFocus(null, this.inputModule1.mobileEditBox, null, this.inputModule1.mobileEditBox);
        this.inputModule1.mobileEditBox.setNextFocus(this.backBtn, this.inputModule1.realnameEditBox, this.backBtn, null);
        this.inputModule1.realnameEditBox.setNextFocus(this.inputModule1.mobileEditBox, this.inputModule1.codeEditBox, this.backBtn, null);
        this.inputModule1.codeEditBox.setNextFocus(this.inputModule1.realnameEditBox, this.submitBtn, this.backBtn, this.inputModule1.sendMsgBtn);
        this.inputModule1.sendMsgBtn.setNextFocus(null, null, this.inputModule1.codeEditBox, null);
        this.submitBtn.setNextFocus(this.inputModule1.codeEditBox, null, this.backBtn, null);
    },

    touchEventListener: function (sender, type) {

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                SoundEngine.playEffect(commonRes.btnClick);
                break;
            case ccui.Widget.TOUCH_ENDED:
                if (sender == this.submitBtn) {
                    this.onSubmit();
                }

                break;
        }
    },

    /**
     * 提交按钮
     */
    onSubmit: function () {
        var mobileNum = this.inputModule1.mobileEditBox.getString();
        var code = this.inputModule1.codeEditBox.getString();

        if (mobileNum == "") {
            ToastSystemInstance.buildToast("手机号码不能为空");
            return false;
        }

        if (code == "") {
            ToastSystemInstance.buildToast("验证码不能为空");
            return false;
        }

        if (this.type == MPSafeMobileLayer.SetSafeMobile) {

            var realname = this.inputModule1.realnameEditBox.getString();
            if (G_OPEN_REALNAME_REWARD && realname == "") {
                ToastSystemInstance.buildToast("真实姓名不能为空");
                return false;
            }

            var idcard = this.inputModule1.idcardEditBox.getString();
            if (idcard != "" && idcard.length != 18) {
                ToastSystemInstance.buildToast("身份证位数必须为18位！");
                return false;
            }

            if (G_OPEN_REALNAME_REWARD && mpGD.userInfo.luckyRMB < 0.2) {
                ToastSystemInstance.buildToast("您的红包不足，不能实名认证。");
                return false;
            }

            mpGD.netHelp.requestSetSafeMobile(mobileNum, realname, code, idcard);
        }
        else if (this.type == MPSafeMobileLayer.VerifySafeMobile) {
            switch (this.verifyType)
            {
                case MPSafeMobileLayer.VerifyLogin:
                    mpGD.netHelp.requestLogin({
                        account: mpGD.userInfo.account,
                        password: mpGD.userInfo.password,
                        moorMachine: mpGD.storage.getValue("moorMachine"),
                        mobileCode: code
                    });
                    break;

                case MPSafeMobileLayer.VerifyFindPassword:
                    var mobileNum = this.inputModule1.mobileEditBox.getString();
                    console.log("要找回的帐号为："+mobileNum);
                    mpGD.netHelp.requestFindPassword(mobileNum, code);
                    break;

                case MPSafeMobileLayer.VerifyFindTwoPassword:
                    mpGD.netHelp.requestFindTwoPassword(code);
                    break;
            }
        }

        mpApp.showWaitLayer("正在请求, 请稍候");
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.GenerateMobileCode:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    if (data.success) {
                        ToastSystemInstance.buildToast("验证码已发送， 请留意手机短信");

                        var sendMsgBtn = this.inputModule1.sendMsgBtn;
                        sendMsgBtn.setEnabled(false);
                        sendMsgBtn.setTitleText("发送验证码(60)");
                        sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
                        var secondNum = 60;
                        sendMsgBtn.runAction(cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
                            secondNum--;
                            if (secondNum <= 0) {
                                sendMsgBtn.setTitleText("发送验证码");
                                sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
                                sendMsgBtn.setEnabled(true);
                            }
                            else {
                                sendMsgBtn.setTitleText("发送验证码(" + secondNum + ")");
                                sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
                            }
                        })), 60));
                    }
                }
                break;

            case mpNetEvent.ModifySetup:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {

                    if (data.action == 8) {
                        if (data.success) {
                            if (!data.successMsg)
                                ToastSystemInstance.buildToast("绑定成功");

                            //更新数据
                            mpApp.updateUserInfo({
                                phone: data.phone,
                                realname: data.realname,
                                hasMobile: true,
                            });
                            this.close();
                        }
                    }
                    else if (data.action == 9) {
                        if (data.success) {
                            ToastSystemInstance.buildToast("解绑成功");
                            //更新数据
                            mpApp.updateUserInfo({
                                phone: null,
                                hasMobile: false,
                            });
                            this.close();
                        }
                    }
                }
                break;

            case mpNetEvent.ForgotPassword:
                mpApp.removeWaitLayer();

                if(!data.errMsg){
                    this.removeFromParent();

                    //ToastSystemInstance.buildToast("您的密码已重置为" + data.password + "，请前往个人中心->修改密码 设置新密码");

                    ToastSystemInstance.buildToast("您的新密码已经发送到您的手机，请查收");
                }
                break;

            case mpNetEvent.ForgotTwoPassword:
                mpApp.removeWaitLayer();

                if(!data.errMsg){
                    this.removeFromParent();

                    new MPSettingPasswordLayer(MPSettingPasswordLayer.BankPassword, function () {
                        new MPBankLayer().to(cc.director.getRunningScene());
                    }).to(cc.director.getRunningScene());
                }
                break;
        }
    },

    //当发送验证码
    onSendMobileNum: function () {

        if (this.type == MPSafeMobileLayer.VerifySafeMobile) {


            var mobileNum = this.inputModule1.mobileEditBox.getString();
            console.log("mobileNum======="+mobileNum);
            if (ttutil.isMobileNum(mobileNum)) {
                var codeLayer = new MPCodeLayer().to(cc.director.getRunningScene());
                codeLayer.setSubmitCallback(function (code) {
                    mpGD.netHelp.requestGenerateMobileCode(mobileNum, code,"ForgotPassword");
                    mpApp.showWaitLayer("正在发送请求");
                });

            }
            else {
                ToastSystemInstance.buildToast("请输入正确的手机号码");
            }

            
        }
        else if (this.type == MPSafeMobileLayer.SetSafeMobile) {
            if (G_OPEN_REALNAME_REWARD && mpGD.userInfo.luckyRMB < 0.2) {
                ToastSystemInstance.buildToast("您的红包不足，不能实名认证。");
                return;
            }

            var mobileNum = this.inputModule1.mobileEditBox.getString();
            if (ttutil.isMobileNum(mobileNum)) {
                var codeLayer = new MPCodeLayer().to(cc.director.getRunningScene());
                codeLayer.setSubmitCallback(function (code) {
                    mpGD.netHelp.requestGenerateMobileCode(mobileNum, code);
                    mpApp.showWaitLayer("正在发送请求");
                });

            }
            else {
                ToastSystemInstance.buildToast("请输入正确的手机号码");
            }
        }


    },

    //绑定手机输入模块
    buildInputModule: function (hint) {

        var self = this;
        var node = new ccui.Scale9Sprite("common_input_box.png");
        // node.initWithSpriteFrameName("frame_bg.png");
        node.size(mpV.w * 0.7, 260);

        var mobileEditBox = mputil.buildEditBox("要绑定的安全手机号码", hint).to(node).pp(0.55, 0.8);

        var realnameEditBox = mputil.buildEditBox("请输入真实姓名", "姓 名:").to(node).pp(0.55, 0.6);
        !G_OPEN_REALNAME_REWARD && realnameEditBox.hide();

        var codeEditBox = mputil.buildEditBox("请输入验证码", "验 证 码:").to(node).pp(0.55, 0.4);

        var idcardEditBox = mputil.buildEditBox("可不填,不填没有奖励!", "身 份 证:").to(node).pp(0.55, 0.2);
        !G_OPEN_REALNAME_REWARD && idcardEditBox.hide();

        var sendMsgBtn = new FocusButton("common_btn_get_code.png", "", "", ccui.Widget.PLIST_TEXTURE).to(node).pp(0.88, 0.4).qscale(0.75);
        // sendMsgBtn.setTitleText("发送验证码");
        // sendMsgBtn.setTitleFontSize(30);
        // sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
        // sendMsgBtn.setTitleColor(cc.color(255, 255, 255));
        sendMsgBtn.addClickEventListener(this.onSendMobileNum.bind(this));


        /////----------------------------------------------------------------------
        if (this.type == MPSafeMobileLayer.SetSafeMobile) {
            G_OPEN_REALNAME_REWARD && new cc.LabelTTF("实名认证失败将扣除手续费0.2个红包，首次填写身份证实名认证成功奖励5个红包。", GFontDef.fontName, 20).to(node).pp(0.5, -0.1);
        }
        else if (this.type == MPSafeMobileLayer.VerifySafeMobile) {
            if(this.verifyMobileNum)
                mobileEditBox.setString(this.verifyMobileNum);
            else
                mobileEditBox.setString(mpGD.userInfo.account);

            mobileEditBox.setTouchEnabled(false);

            realnameEditBox.hide();
            idcardEditBox.hide();
        }

        /////----------------------------------------------------------------------


        node.mobileEditBox = mobileEditBox;
        node.realnameEditBox = realnameEditBox;
        node.codeEditBox = codeEditBox;
        node.idcardEditBox = idcardEditBox;
        node.sendMsgBtn = sendMsgBtn;

        return node;
    }

});

MPSafeMobileLayer.SetSafeMobile = 1;            //设置安全手机
MPSafeMobileLayer.VerifySafeMobile = 2;         //验证安全手机
MPSafeMobileLayer.UnBindSafeMobile = 3;         //解绑安全手机

MPSafeMobileLayer.VerifyLogin = 4;               //验证登录
MPSafeMobileLayer.VerifyFindPassword = 5;       //验证找回登录密码
MPSafeMobileLayer.VerifyFindTwoPassword = 6;       //验证找回保险柜密码
