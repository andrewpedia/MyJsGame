/**
 * Created by Administrator on 2016/2/23.
 *  登录层
 */

var MPLoginLayerInstance = null;

var MPLoginLayer = MPBaseModuleLayer.extend({
    bgSprite: null,         //背景

    accountEdit: null,         //账号输入框
    pwdEdit: null,               //密码输入框

    loginBtn: null,             //登录按钮
    registerBtn: null,          //注册按钮
    closeBtn: null,             //关闭按钮
    forgetPwdBtn: null,         //忘记密码按钮

    loginType: null,         //登录方式， 0表示没有正在登录， 1表示账号密码， 2表示游客， 3表示qq

    ciphertext: "******",

    _className: "MPLoginLayer",
    _classPath: "src/login/MPLoginLayer.js",

    ctor: function (isAccount) {
        this._super();
        this.isAccount = isAccount ? true : false;
        // this.initEx();
        this.initTV();
        this.swallowTouch();
        var self = this;
        this.swallowKeyboard(function () {
            if (!self.onClosePre || self.onClosePre()) {
                self.close();
            }
        });
        this.accountEdit.setString(mpGD.storage.getValue("account") || "");
        this.pwdEdit.setString(mpGD.storage.getValue("pwd") ? this.ciphertext : "");

        MPLoginLayerInstance = this;
    },

    onEnter: function () {
        this._super();
        this.bindNetEvent();
    },

    initEx: function () {
        this._super(cc.size(800,550));

        var self = this;

        var bg = new ccui.Scale9Sprite("common_input_box.png");
        bg.size(710, 320).to(this).pp(0.5,0.53);

        // var title = new cc.Sprite("#font_denglu.png").to(this.titleBG).pp(0.5,0.6);
        this.titleBG.setSpriteFrame("login_title.png");
        // this.bgSprite = new cc.Sprite("res/gui/login/gui-login-Bg.png").to(this).pp();

        this.accountEdit = mputil.buildEditBox("请输入帐号", "账号:").to(this).p(mpV.w / 2 + 50, mpV.h / 2 + 144);

        this.pwdEdit = mputil.buildEditBox("请输入6-20位密码", "密码:").to(this).p(mpV.w / 2 + 50, mpV.h / 2 + 30);
        this.pwdEdit.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);

        //登录按钮
        this.loginBtn = new FocusButton().to(this).pp(0.4, 0.22);
        this.loginBtn.loadTextureNormal("login_btn_login.png", ccui.Widget.PLIST_TEXTURE);


        //注册按钮
        this.registerBtn = new FocusButton().to(this).pp(0.6, 0.22);
        this.registerBtn.loadTextureNormal("reward_register_btn.png", ccui.Widget.PLIST_TEXTURE);


        //忘记密码按钮
        this.forgetPwdBtn = new FocusSprite("#safebox_btn_forget.png").to(this).p(810,280)//mputil.buildUnderlineLabel("找回登录密码").torank(this).p(810, 280);


        //注册点击事件
        this.loginBtn.addTouchEventListener(this.touchEventListener, this);
        this.registerBtn.addTouchEventListener(this.touchEventListener, this);


        this.forgetPwdBtn.bindTouch({
            swallowTouches:true,
            onTouchBegan:function () {
                mpGD.loginScene.pushDefaultSelectArray(self.forgetPwdBtn);
                mpApp.loadHallSpriteFrames();
                new MPFindPasswordLayer().to(cc.director.getRunningScene());
            }
        });


        this.savePasswordCheckBox = new FocusButton("res/gui/login/gui-gm-check-box.png", "", "", ccui.Widget.LOCAL_TEXTURE).to(this).p(450, 280);
        this.savePasswordCheckBox.setFingerPPos(cc.p(0.5, 0.1));
        this.savePasswordFlag = new cc.Sprite("res/gui/login/gui-gm-check.png").to(this.savePasswordCheckBox).pp();
        var savePasswordTTF = new cc.LabelTTF("保存密码", GFontDef.fontName, 30).to(this).anchor(0, 0.5).p(500, 280);
        this.savePasswordCheckBox.addTouchEventListener(this.touchEventListener, this);

    },
    // TV 按键事件
    initTV: function () {
        mpGD.loginScene.setFocusSelected(this.loginBtn);

        this.backBtn.setNextFocus(null, this.accountEdit, this.accountEdit, null);
        this.accountEdit.setNextFocus(this.backBtn, this.pwdEdit, null, this.backBtn);
        this.pwdEdit.setNextFocus(this.accountEdit, this.savePasswordCheckBox, null, null);
        this.savePasswordCheckBox.setNextFocus(this.pwdEdit, this.loginBtn, null, this.forgetPwdBtn);
        this.forgetPwdBtn.setNextFocus(this.pwdEdit, this.registerBtn, this.savePasswordCheckBox, null);
        this.loginBtn.setNextFocus(this.savePasswordCheckBox, null, null, this.registerBtn);
        this.registerBtn.setNextFocus(this.forgetPwdBtn, null, this.loginBtn, null);
    },
    // 点击return键的处理函数
    editBoxReturn: function (sender) {
        var text = sender.getString().replace(/[\r\n]/g, "");
        sender.setString(text);
    },

    editBoxEditingDidBegin: function (sender) {

        if (sender.getString().length > 30) {
            sender.setString("");
        }
    },

    //uibutton 的触摸事件
    touchEventListener: function (sender, type) {

        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
        } else if (type == ccui.Widget.TOUCH_ENDED) {
            switch (sender) {
                case this.loginBtn:
                    this.runLogin();
                    break;
                case this.registerBtn:
                    
                    this.onClickRegisterBtn();
                    break;
                case this.backBtn:
                    this.close();
                    break;
                case this.savePasswordCheckBox:
                    if (this.savePasswordFlag.isVisible()) {
                        this.savePasswordFlag.hide();
                        this.getParent().isSavePassword = false;
                    }
                    else {
                        this.savePasswordFlag.show();
                        this.getParent().isSavePassword = true;
                    }
                    break;
            }
        }

    },


    //当点击注册界面
    onClickRegisterBtn: function () {
        this.close(true);
        // delay 调用 所以这边顺序可以， 父亲还在
        this.getParent().openRegisterLayer();
    },

    // //关闭窗口
    // close: function (isRegister) {
    //     this.getScene().pauseFocus();
    //     this.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
    //         if (!isRegister) {
    //             this.getScene().setFocusSelected(this.getScene().loginBtn);
    //         }
    //         // this.getScene().popDefaultSelectArray();
    //     }), cc.removeSelf()));
    //
    //     // this.setCascadeOpacityEnabled(true);
    //     // this.runAction(cc.sequence(cc.fadeOut(0.5), cc.removeSelf()));
    // },


    /**
     * 执行登录
     */
    runLogin: function () {
        if (!mputil.accountIsLegal(this.accountEdit.getString())) {
            return false;
        }
        if (this.pwdEdit.getString() != this.ciphertext && !mputil.passwordIsLegal(this.pwdEdit.getString())) {
            return false;
        }

        this.loginType = mpLoginType.Account;
        if (mpGD.netHelp.isConnect) {

            mpGD.userInfo.account = this.accountEdit.getString();
            if (this.pwdEdit.getString() != this.ciphertext)
                mpGD.userInfo.password = hex_sha1(this.pwdEdit.getString()).toUpperCase();
            else
                mpGD.userInfo.password = mpGD.storage.getValue("pwd");

            mpGD.netHelp.requestLogin({
                account: mpGD.userInfo.account,
                password: mpGD.userInfo.password,
                moorMachine: mpGD.storage.getValue("moorMachine")
            });
            mpApp.showWaitLayer();
        }
        else {
            mpGD.netHelp.reconnect();
            mpGD.saNetHelper.reconnect();
            mpApp.showWaitLayer("正在连接服务器...");
        }
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
            case mpNetEvent.VerifyUser:
                //实际的处理放在scene里面了， 因为注册那界面也需要如此处理
                this.loginType = mpLoginType.None;
                break;
            case "connect":
                if (this.loginType == mpLoginType.Account) {
                    this.runLogin();
                }
                break;
        }
    },

    onExit: function () {
        this._super();
        this.unbindNetEvent();
    },
});
