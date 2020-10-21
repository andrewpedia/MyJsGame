/**
 * Created by Apple on 2016/6/21.
 */


/**
 * 构建输入保险柜密码层
 */
var MPBankInputPasswordLayer = MPBaseModuleLayer.extend({
    callback: null,
    passwordEditBox: null,

    type: null,

    _className: "MPBankInputPasswordLayer",
    _classPath: "src/main/module/MPBankInputPasswordLayer.js",

    ctor: function (passwordType, callback) {
        this.callback = callback;
        this._super();
        this.swallowTouch();

        this.swallowKeyboard(() => {
            this.cancelCallback && this.cancelCallback();
            mpGD.mainScene.popDefaultSelectArray();
            this.removeFromParent();
        });

        this.type = passwordType;

        switch (passwordType) {
            case mpPasswordType.Plaintext:
                this.initPlaintextPasswordLayer();
                break;
            case mpPasswordType.Graphical:
                this.initGraphicalPasswordLayer();
                break;
        }

        this.initTV();
    },

    /**
     * 进入
     */
    onEnter: function () {
        this._super();
        mpGD.netHelp.addNetHandler(this);
    },

    /**
     * 退出
     */
    onExit: function () {
        this._super();
        mpGD.netHelp.removeNetHandler(this);
    },

    initEx:function () {
        this._super(cc.size(1050,400));

        this.titleBG.hide();
        this.bg = new ccui.Scale9Sprite();
        this.bg.initWithSpriteFrameName("frame_bg.png");
        this.bg.size(970, 320).to(this).pp(0.5,0.5);
    },
    /**
     * 初始化纯文本密码
     */
    initPlaintextPasswordLayer: function () {
        var self = this;
        // var bg = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(self).pp(0.5, 0.5);
        // var title = new cc.LabelTTF("提示", GFontDef.fontName, 32).to(bg).pp(0.5, 0.92);
        // title.setColor(cc.color(231, 208, 124));

        var text1 = new cc.LabelTTF("为确保您的账户安全和存取便捷, 每次使用需输入", GFontDef.fontName, 30).to(this.bg).pp(0.38, 0.85);
        text1.setColor(cc.color(231, 208, 124));
        var text2 = new cc.LabelTTF("游戏保险柜密码", GFontDef.fontName, 30).to(text1).anchor(0, 0.5).pp(1.01, 0.5);
        text2.setColor(cc.color(255, 0, 0));

        this.passwordEditBox = mputil.buildEditBox("请输入保险柜密码", "").to(this.bg, 1).pp(0.5,0.62);
        this.passwordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);

        // //关闭按钮
        // var closeBtn = this.closeBtn = new FocusButton("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        // closeBtn.to(bg).pp(0.97, 0.92);

        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
        };

        // var close = function () {
        //     mpGD.mainScene.pauseFocus();
        //     // mpGD.mainScene.setFocusSelected(mpGD.mainScene.bottomButtons[6]);
        //     bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
        //         mpGD.mainScene.popDefaultSelectArray();
        //         self.removeFromParent();
        //     })));
        // };

        // closeBtn.addTouchEventListener(touchEventListener);
        // closeBtn.addClickEventListener(function () {
        //     close();
        // });

        this.swallowKeyboard(function () {
            close();
        });


        //确定按钮
        var button = this.button = new FocusButton("modify/btn_sure.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.bg).pp(0.5, 0.25);
        // button.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // button.setTitleText("确 定");
        // button.getTitleRenderer().pp(0.5, 0.55);
        button.addTouchEventListener(touchEventListener);
        button.addClickEventListener(() => {
            if (mputil.passwordIsLegal(this.passwordEditBox.getString())) {
                mpGD.netHelp.requestVerifyTwoPassword(this.passwordEditBox.getString());
                mpApp.showWaitLayer("正在验证二级密码");
            }
        });
        // bg.setScale(0);
        // bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));


        this.urlLable = new cc.Sprite("#BankUI/font_forgetbank.png").to(this.bg).pp(0.85, 0.2);//mputil.buildUnderlineLabel("找回保险柜密码").to(bg).pp(0.85, 0.15);
        this.urlLable.bindTouch({
            swallowTouches:true,
            onTouchBegan:function () {
                if (mpGD.userInfo.phone) {
                    new MPSafeMobileLayer(MPSafeMobileLayer.VerifySafeMobile, MPSafeMobileLayer.VerifyFindTwoPassword).to(cc.director.getRunningScene());
                    this.removeFromParent();
                }
                else {
                    ToastSystemInstance.buildToast("您没有绑定手机, 无法找回密码。请前往个人中心->账户安全 设置密保手机")
                }
            }
        });
        // this.urlLable.addClickEventListener((sender) => {
        //
        //     if (mpGD.userInfo.phone) {
        //         new MPSafeMobileLayer(MPSafeMobileLayer.VerifySafeMobile, MPSafeMobileLayer.VerifyFindTwoPassword).to(cc.director.getRunningScene());
        //         this.removeFromParent();
        //     }
        //     else {
        //         ToastSystemInstance.buildToast("您没有绑定手机, 无法找回密码。请前往个人中心->账户安全 设置密保手机")
        //     }
        // });
    },

    /**
     * 初始化图形密码
     */
    initGraphicalPasswordLayer: function () {
        // 背景
        this.background = new cc.Sprite("#res/gui/file/gui-ti-box-2.png").to(this).pp(0.5, 0.5);

        // 标题
        this.title = new cc.LabelTTF("提示", GFontDef.fontName, 32).to(this.background).pp(0.5, 0.95);
        this.title.setColor(cc.color(231, 208, 124));

        // 提示标签
        this.hint = new cc.LabelTTF("温馨提示：为确保您的保险柜账户安全，请输入正确密码！", GFontDef.fontName, 20).to(this.background).pp(0.51, 0.85);
        this.hint.setColor(cc.color(231, 208, 124));

        if (G_PLATFORM_TV) {
            this.hintString = new cc.LabelTTF("(双击“OK”键完成绘制)", GFontDef.fontName, 16).to(this.background).pp(0.5, 0.81);
            this.hintString.setColor(cc.color(255, 50, 50));
        }

        // 关闭按钮
        this.closeBtn = new FocusButton("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.to(this.background).pp(0.95, 0.955);
        this.closeBtn.addClickEventListener(() => {
            SoundEngine.playEffect(commonRes.btnClick);
            this.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                mpGD.mainScene.popDefaultSelectArray();
                this.pattern.resetGraphicalPasswordData();
                this.removeFromParent();
            })));
        });

        // 图形锁
        this.pattern = new MPPatternFrame().to(this.background).pp(0.5, 0.46);
        this.pattern.setTouchEventEndedCallback(() => {
            var dotIndexArray = this.pattern.getNewDotIndexArray();
            var password = "";
            for (var i = 0; i < dotIndexArray.length; i++) {
                password = password + "#" + dotIndexArray[i].toString();
            }

            this.graphicalPassword = password;
            mpGD.netHelp.requestVerifyTwoPassword(password);
            mpApp.showWaitLayer("正在验证保险柜密码，请稍等...");
        });

        // 找回密码
        this.urlLable1 = mputil.buildUnderlineLabel("找回保险柜密码").to(this.background).pp(0.5, 0.08);
        this.urlLable1.addClickEventListener((sender) => {

            this.pattern.resetGraphicalPasswordData();

            if (mpGD.userInfo.phone) {
                new MPSafeMobileLayer(MPSafeMobileLayer.VerifySafeMobile, MPSafeMobileLayer.VerifyFindTwoPassword).to(cc.director.getRunningScene());
                this.removeFromParent();
            }
            else {
                ToastSystemInstance.buildToast("您没有绑定手机, 无法找回密码。请前往个人中心->账户安全 设置密保手机")
            }
        });

        this.background.setScale(0);
        this.background.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));
    },

    /**
     * 处理响应
     * @param event
     * @param data
     */
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.VerifyTwoPassword:
                mpApp.removeWaitLayer();
                if (this.type === mpPasswordType.Plaintext) {
                    if (data.success) {
                        mpGD.userInfo.twoPassword = this.passwordEditBox.getString();
                        this.callback && this.callback();
                        this.removeFromParent();
                    }
                }
                else if (this.type === mpPasswordType.Graphical) {
                    if (data.errMsg) {
                        this.pattern.wrongPasswordLine();
                        this.pattern.setFrameTouchEnabled(false);
                        setTimeout(() => {
                            this.pattern.resetGraphicalPasswordData();
                            this.pattern.setFrameTouchEnabled(true);
                        }, 1000);
                    }
                    else if (data.success) {
                        mpGD.userInfo.twoPassword = this.graphicalPassword;   // 此处数值随意设置，仅用于标记而已
                        this.pattern.resetGraphicalPasswordData();
                        this.callback && this.callback();
                        this.removeFromParent();
                    }
                }
                break;
        }
    },

    /**
     * 初始化TV
     */
    initTV: function () {
        if (!G_PLATFORM_TV) return false;

        if (this.type === mpPasswordType.Plaintext) {
            mpGD.mainScene.setFocusSelected(this.closeBtn);

            this.closeBtn.setNextFocus(null, this.passwordEditBox, null, null);
            this.passwordEditBox.setNextFocus(this.closeBtn, this.button, null, null);
            this.button.setNextFocus(this.passwordEditBox, null, null, this.urlLable);
            this.urlLable.setNextFocus(null, null, this.button, null);
        } else if (this.type === mpPasswordType.Graphical) {
            mpGD.mainScene.setFocusSelected(this.closeBtn);

            var dotArray = this.pattern.originDotInfoArray;

            this.closeBtn.setNextFocus(null, dotArray[0].node, null, null);
            dotArray[0].node.setNextFocus(this.closeBtn, dotArray[3].node, null, dotArray[1].node);
            dotArray[1].node.setNextFocus(this.closeBtn, dotArray[4].node, dotArray[0].node, dotArray[2].node);
            dotArray[2].node.setNextFocus(this.closeBtn, dotArray[5].node, dotArray[1].node, null);
            dotArray[3].node.setNextFocus(dotArray[0].node, dotArray[6].node, null, dotArray[4].node);
            dotArray[4].node.setNextFocus(dotArray[1].node, dotArray[7].node, dotArray[3].node, dotArray[5].node);
            dotArray[5].node.setNextFocus(dotArray[2].node, dotArray[8].node, dotArray[4].node, null);
            dotArray[6].node.setNextFocus(dotArray[3].node, this.urlLable1, null, dotArray[7].node);
            dotArray[7].node.setNextFocus(dotArray[4].node, this.urlLable1, dotArray[6].node, dotArray[8].node);
            dotArray[8].node.setNextFocus(dotArray[5].node, this.urlLable1, dotArray[7].node, null);
            this.urlLable1.setNextFocus(dotArray[7].node, null, null, null);

            cc.director.getRunningScene().setDoubleClickCallback(() => {
                var dotIndexArray = this.pattern.getNewDotIndexArray();

                if (!dotIndexArray || dotIndexArray.toString() === [].toString()) return false;

                var password = "";
                for (var i = 0; i < dotIndexArray.length; i++) {
                    password = password + "#" + dotIndexArray[i].toString();
                }

                this.graphicalPassword = password;
                mpGD.netHelp.requestVerifyTwoPassword(password);
                mpApp.showWaitLayer("正在验证保险柜密码，请稍等...");
            });
        }


    },


});


