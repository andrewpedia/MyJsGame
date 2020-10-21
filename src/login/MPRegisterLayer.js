/**
 * 注册层
 */
var MPRegisterLayer = MPBaseModuleLayer.extend({
    bgSprite: null,

    nicknameEdit: null,             //昵称输入框
    accountEdit: null,             //帐号输入框
    pwdEdit: null,                  //密码输入框

    // closeBtn: null,                 //关闭按钮
    submitBtn: null,                //提交按钮
    rankNicknameBtn: null,              //获取随机昵称按钮

    diceAni: null,                   //骰子骨骼动画

    showPwdCheckBox: null,          //显示密码
    agreementCheckBox: null,        //同意协议

    modeType: false,
    bindSuccessCallback: null,          //绑定成功回调

    showProtocolWidget: null,           //显示协议的触发按钮

    _className: "MPRegisterLayer",
    _classPath: "src/login/MPRegisterLayer.js",

    ctor: function (mode) {

        var self = this;
        ccs.armatureDataManager.addArmatureFileInfo("res/effect/startup/zhucheshaiziyaodong_dating/zhucheshaiziyaodong_dating.ExportJson");

        this.setMode((mode == "undefined" || mode == null) ? MPRegisterLayer.RegisterMode : mode);
        // this.initEx();

        this._super();



//        if (this.modeType == MPRegisterLayer.RegisterMode) {
//            var securityCodeLayer = new SecurityCodeLayer().to(this).pp(0.5, 0.39);
//            var underLabel = mputil.buildUnderlineLabel("点击刷新").to(this).pp(0.65, 0.39);
//            underLabel.addClickEventListener(function () {
//                securityCodeLayer.refresh();
//            });

//            self.securityCodeLayer = securityCodeLayer;
//            self.underLabel = underLabel;
//        }
        if (this.getScene().shared && this.getScene().shared.selected)
            this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
        this.swallowKeyboard(function () {
            if (!self.onClosePre || self.onClosePre()) {
                self.close();
            }
        });

        this.initTV();
    },
    setMode: function (mode) {
        this.modeType = mode;
    },
    onEnter: function () {
        this._super();
        this.bindNetEvent();

        // //入场 动画
        // this.bg.setScale(0);
        // this.bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));
        mpGD.netHelp.requestRandomName();
    },

    initEx: function () {
        if (this.modeType == MPRegisterLayer.RegisterMode)
        {
            this._super(cc.size(800,520));
            var bg = new ccui.Scale9Sprite("common_input_box.png");
            // bg.initWithSpriteFrameName("frame_bg.png");
            bg.to(this).size(730, 300).pp(0.5, 0.52);
        }
        else
        {
            this._super(cc.size(800,550));
            var bg = new ccui.Scale9Sprite("common_input_box.png");
            // bg.initWithSpriteFrameName();
            bg.to(this).size(730, 330).pp(0.5, 0.52);
        }


        // new cc.LayerColor(cc.color(0, 0, 0, 128)).to(this);
        // this.size(mpV.w, mpV.h);
        this.titleBG.setSpriteFrame( this.modeType == MPRegisterLayer.RegisterMode ? "login_title.png" : "bind_phone_title.png");

        // var titleSprite = new cc.Sprite("#font_login.png").to(this.titleBG).pp(0.5,0.6);


        var self = this;
        // this.bg = new cc.LayerColor(cc.color(0, 0, 0, 0)).to(this);

        // this.bgSprite = new cc.Sprite("res/gui/login/registerBg.png").to(this).pp();
 
        var xoffset = mpV.w / 2 + 20;

        var posArray;
        //if (this.modeType == MPRegisterLayer.RegisterMode) {
            posArray = [mpV.h / 2 + 120, mpV.h / 2 + 60, mpV.h / 2 - 5, mpV.h / 2 - 80];
        //}
        //else {
        //    posArray = [mpV.h / 2 + 130, mpV.h / 2 + 50, mpV.h / 2 - 30];
        //}

        this.nicknameEdit = mputil.buildEditBox("3-8个汉字或6-16位字符", "昵　称:").to(this).p(xoffset, posArray[0]);
        this.nicknameEdit.mpTip.setFontFillColor(cc.color(255,255,255));
        this.accountEdit = mputil.buildEditBox("请输入手机号码", "手机号:").to(this).p(xoffset, posArray[1]);
        this.accountEdit.mpTip.setFontFillColor(cc.color(255,255,255));

        this.pwdEdit = mputil.buildEditBox("请输入6-20位字符", "密　码:").to(this).p(xoffset, posArray[2]);
        this.pwdEdit.mpTip.setFontFillColor(cc.color(255,255,255));
        this.pwdEdit.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);


//-----------------------------------------------------------------
        //完成注册按钮
        this.submitBtn = new FocusButton().to(this).pp(0.5, 0.2);
        this.submitBtn.loadTextureNormal("reward_register_btn.png", ccui.Widget.PLIST_TEXTURE);
        // this.submitBtn.size(300, 75);
        // this.submitBtn.setTitleText("注册");
        // this.submitBtn.getTitleRenderer().pp(0.5, 0.55);
        // this.submitBtn.setTitleFontSize(45);
        // this.submitBtn.setTitleFontName(GFontDef.fontName);

        //获取随机昵称按钮
        this.rankNicknameBtn = new FocusButton().to(this).anchor(0.5, 0.5).p(907, cc.sys.isNative ? 465 : 545);

        if (this.modeType == MPRegisterLayer.BindMode) {
            this.rankNicknameBtn.py(470);
        }

        this.rankNicknameBtn.ignoreContentAdaptWithSize(false);
        this.rankNicknameBtn.size(60, 60);
        // G_SHOW_HELP && this.rankNicknameBtn.showHelp();
        //骰子骨骼动画
        this.diceAni = new ccs.Armature("zhucheshaiziyaodong_dating");
        this.diceAni.p(-170, -110);
        this.diceAni.to(this.rankNicknameBtn);

        // //关闭按钮
        // this.closeBtn = new FocusButton().to(this.bg).p(1000, 630);
        // this.closeBtn.loadTextureNormal("gui-gm-button-close.png", ccui.Widget.PLIST_TEXTURE);
        // this.closeBtn.loadTexturePressed("gui-gm-button-close-dj.png", ccui.Widget.PLIST_TEXTURE);

        //显示密码
        this.showPwdCheckBox = new FocusCheckBox("res/gui/login/cleartext_n.png", "res/gui/login/cleartext_s.png").to(this).p(905, cc.sys.isNative ? 380 : 330);
        if (this.modeType == MPRegisterLayer.BindMode) {
            // web 位置
            this.showPwdCheckBox.py(330);
        }
//        this.agreementCheckBox = new FocusCheckBox("", "res/gui/login/registerSelect.png").to(this).p(470, 260);
//        this.agreementCheckBox.ignoreContentAdaptWithSize(false);
//        this.agreementCheckBox.size(45, 45);
//        G_SHOW_HELP && this.agreementCheckBox.showHelp();
        //
//        this.agreementCheckBox.loadTextureBackGround("kuang_small.png", ccui.Widget.PLIST_TEXTURE);
//        this.showProtocolWidget = mputil.buildUnderlineLabel("同意 (" + productName + "协议)").to(this).p(650, 255);
//        this.showProtocolWidget.setFontSize(26);
//        this.showProtocolWidget.addClickEventListener(function () {
//            cc.director.getRunningScene().pushDefaultSelectArray(self.showProtocolWidget);
//            new MPShowProtocol().to(cc.director.getRunningScene(),1000000000);
//        });

        //注册点击事件
        this.submitBtn.addTouchEventListener(this.touchEventListener.bind(this));
        this.rankNicknameBtn.addTouchEventListener(this.touchEventListener.bind(this));
        this.showPwdCheckBox.addTouchEventListener(this.touchEventListener.bind(this));
        //this.agreementCheckBox.addTouchEventListener(this.touchEventListener.bind(this));


        //if (this.modeType == MPRegisterLayer.RegisterMode) {
            //var size = cc.size(200, 24);
            //this.codeEdit = mputil.buildEditBox("手机验证码", "验证码:",null,size).to(this).p(550, posArray[3]);
            //var size = cc.size(200, 24);
            this.codeEdit = mputil.buildEditBox("手机验证码", "验证码:").to(this).p(xoffset, posArray[3]);
            // this.nicknameEdit.p()
            this.submitBtn.pp(0.5, 0.23);
            this.showPwdCheckBox.p(905,355);
            this.diceAni.p(-190, -75);
            //this.agreementCheckBox.p(470, 210);
            //this.showProtocolWidget.p(650, 210);

            var sendMsgBtn = new FocusButton("common_btn_get_code.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).p(xoffset+280, 280).qscale(0.55);
            // sendMsgBtn.setTitleText("发送验证码");
            // sendMsgBtn.setTitleFontSize(30);
            // sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
            // sendMsgBtn.setTitleColor(cc.color(255, 255, 255));
            sendMsgBtn.addClickEventListener(this.onSendMobileNum.bind(this));
            self.sendMsgBtn=sendMsgBtn;
        //}


        this.swallowTouch();
    },
        //当发送验证码
    onSendMobileNum: function () {



            var mobileNum = this.accountEdit.getString();
            //console.log("手机号------------"+mobileNum);
            if (ttutil.isMobileNum(mobileNum)) {
            //     var codeLayer = new MPCodeLayer().to(cc.director.getRunningScene());
            //     codeLayer.setSubmitCallback(function (code) {
                mpGD.netHelp.requestGenerateMobileCode(mobileNum, "noNeedVertify");
                    mpApp.showWaitLayer("正在发送请求");
                // });
            }
            else {
                ToastSystemInstance.buildToast("请输入正确的手机号码");
            }
        


    },
    // TV 按键事件
    initTV: function () {
        // this.getScene().setFocusSelected(this.nicknameEdit);
        // this.backBtn.setNextFocus(null, this.nicknameEdit, this.nicknameEdit, null);
        // this.nicknameEdit.setNextFocus(this.backBtn, this.accountEdit, null, this.rankNicknameBtn);
        // this.rankNicknameBtn.setNextFocus(this.backBtn, this.showPwdCheckBox, this.nicknameEdit, this.backBtn);
        // this.accountEdit.setNextFocus(this.nicknameEdit, this.pwdEdit, null, this.showPwdCheckBox);
        // //大厅场景不需要验证码
        // var isCodeEdit = this.modeType == MPRegisterLayer.RegisterMode;
        // this.pwdEdit.setNextFocus(this.accountEdit, isCodeEdit ? this.codeEdit : this.agreementCheckBox, null, this.showPwdCheckBox);
        // this.showPwdCheckBox.setNextFocus(this.rankNicknameBtn, null, this.pwdEdit, this.backBtn);
        // if (isCodeEdit) {
        //     this.codeEdit.setNextFocus(this.pwdEdit, this.underLabel, null, null);
        //     this.underLabel.setNextFocus(this.codeEdit, this.agreementCheckBox, null, null);
        // }
        // this.agreementCheckBox.setNextFocus(isCodeEdit ? this.underLabel : this.pwdEdit, this.submitBtn, null, this.showProtocolWidget);
        // this.showProtocolWidget.setNextFocus(isCodeEdit ? this.underLabel : this.pwdEdit, this.submitBtn, this.agreementCheckBox, null);
        // this.submitBtn.setNextFocus(this.agreementCheckBox, null, null, null);
    },
    // 点击return键的处理函数
    editBoxReturn: function (sender) {
        var text = sender.getString().replace(/[\r\n]/g, "");
        sender.setString(text);
    },

    touchEventListener: function (sender, type) {
        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
        } else if (type == ccui.Widget.TOUCH_ENDED) {
            switch (sender) {
                //提交注册按钮
                case this.submitBtn:
                    this.submitRegister();

                    break;

                case this.backBtn:
                    this.close();
                    break;

                case this.rankNicknameBtn:
                    this.diceAni.getAnimation().play("Animation1");
                    mpGD.netHelp.requestRandomName();
                    break;
                case this.showPwdCheckBox:
                    var isSelect = this.showPwdCheckBox.isSelected();
                    if (isSelect) {
                        this.pwdEdit.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
                    }
                    else {
                        this.pwdEdit.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
                    }
                    //把值改变一下， 让他更新。。
                    var temp = this.pwdEdit.getString();
                    this.pwdEdit.setString(temp + "3");
                    this.pwdEdit.setString(temp);

                    break;
                case this.agreementCheckBox:
                    var isSelect = this.agreementCheckBox.isSelected();
                    cc.log("isSelect:\t", isSelect);
                    break;
            }
        }

    },

    //提交注册按钮
    submitRegister: function () {
    //ToastSystemInstance.buildToast("请输入验证码=============="+native.getChannelID());
    //            return;
        var account = this.accountEdit.getString();
        var nickname = this.nicknameEdit.getString();
        var pwd = this.pwdEdit.getString();


//        if (!this.agreementCheckBox.isSelected()) {
//            native.toast("必须同意协议方可注册");
//            return;
//        }

        var code;
        //if (this.modeType == MPRegisterLayer.RegisterMode) {
            code = this.codeEdit.getString();
            if (code.length == 0) {
                ToastSystemInstance.buildToast("请输入验证码");
                return;
            }

        //}


        if (mputil.accountIsLegal(account) && mputil.nicknameIsLegal(nickname) && mputil.passwordIsLegal(pwd)) {

            if (this.modeType == MPRegisterLayer.RegisterMode) {
                mpGD.netHelp.requestRegister(account, nickname, pwd, code);
                mpApp.showWaitLayer("发送注册请求..");
            }
            else if (this.modeType == MPRegisterLayer.BindMode) {
                mpGD.netHelp.requestBindAccount(1, account, nickname, pwd, code);
                mpApp.showWaitLayer("发送绑定请求..");
            }

        }


    },


    // //关闭窗口
    // close: function () {
    //     var self = this;
    //
    //     // 暂停按钮点击
    //     this.getScene().pauseFocus();
    //     this.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
    //         this.getScene().popDefaultSelectArray();
    //     }), cc.removeSelf()));
    //
    // },

    //当注册成功
    onRegisterSuccess: function () {

        mpGD.userInfo.account = this.accountEdit.getString();
        mpGD.userInfo.password = this.pwdEdit.getString();

        mpGD.netHelp.requestLogin({account: this.accountEdit.getString(), password: this.pwdEdit.getString()});
        mpApp.showWaitLayer("注册成功, 正在登录...");
    },

    /**
     * 绑定网络事件
     */
    bindNetEvent: function () {
        mpGD.netHelp.addNetHandler(this);
    },
    /**
     * 解除绑定网络事件
     */
    unbindNetEvent: function () {
        mpGD.netHelp.removeNetHandler(this);
    },
    //事件
    onNetEvent: function (event, data) {

        switch (event) {
            //获取随机昵称
            case mpNetEvent.GetRandomName:
                this.nicknameEdit.setString(data.nickname);

                break;
            case mpNetEvent.PhoneReg:
                mpApp.removeWaitLayer();
                //注册成功
                if (data.success == true) {
                    this.onRegisterSuccess();
                }
                //注册失败
                else {
                    //ToastSystemInstance.buildToast(data.errMsg);
                    //ttutil.toast(data.msg);
                }
                break;

            //绑定账号回发
            case mpNetEvent.BindAccount:
                mpApp.removeWaitLayer();

                if (data.success == true && data.type == 1) {
                    ToastSystemInstance.buildToast("账号绑定成功");
					mpApp.updateUserInfo({bankScore: data.bankScore});
                    mpGD.userInfo.hasAccount = true;
                    this.close();
                    this.bindSuccessCallback && this.bindSuccessCallback(this.nicknameEdit.getString());

                }
                break;
            case mpNetEvent.GenerateMobileCode:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    if (data.success) {
                        ToastSystemInstance.buildToast("验证码已发送， 请留意手机短信");

                        var sendMsgBtn = this.sendMsgBtn;
                        sendMsgBtn.setEnabled(false);
                        //sendMsgBtn.setTitleText("发送验证码(60)");
                        //sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
                        var secondNum = 60;
                        sendMsgBtn.runAction(cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
                            secondNum--;
                            if (secondNum <= 0) {
                                //sendMsgBtn.setTitleText("发送验证码");
                                //sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
                                sendMsgBtn.setEnabled(true);
                            }
                            else {
                                //sendMsgBtn.setTitleText("发送验证码(" + secondNum + ")");
                                //sendMsgBtn.getTitleRenderer().pp(0.5, 0.55);
                            }
                        })), 60));
                    }
                }
                break;
        }
    },

    onExit: function () {
        this._super();
        this.unbindNetEvent();
    },


});

//绑定模式
MPRegisterLayer.BindMode = 0;
//注册模式
MPRegisterLayer.RegisterMode = 1;