/**
 * Created by Apple on 2016/6/21.
 */


/**
 * 保险柜界面
 */
var MPSettingPasswordLayer = MPBaseModuleLayer.extend({

    titleSprite: null,
    passwordEdit: null,
    confirmPasswordEdit: null,

    onFinishCallback: null,
    type: null,
    hintString: null,

    _className: "MPSettingPasswordLayer",
    _classPath: "src/main/module/MPSettingPasswordLayer.js",

    ctor: function (type, callback) {

        this.type = type || MPSettingPasswordLayer.BankPassword;
        this.onFinishCallback = callback;
        this._super();
    },

    initEx: function () {
        this._super();
        // 标题背景
        // this.titleBG.display("#gui-gm-bt-bj-da.png");
        // 标题

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.size(1000, 450).to(this).pp(0.5,0.5);

        this.titleBG.hide();
        // this.titleSprite = new cc.Sprite("#gui-bank-bank.png").to(this.titleBG).pp(0.5, 0.65).qscale(0.8);
        // 提示
        this.hint = new cc.LabelTTF("温馨提示：使用银行需先设置密码，纯文本密码不能与登录密码一致。", GFontDef.fontName, 26);
        this.hint.to(this).pp(0.5, 0.77);
        this.hint.setColor(cc.color(231, 208, 124));
        // 纯文本密码
        this.initPlaintextPasswordLayer();
        // // 图形密码
        // this.initGraphicalPasswordLayer();

        this.switchToPlainTextPasswordLayer();
    },

    /**
     * 初始化纯文本密码界面
     */
    initPlaintextPasswordLayer: function () {
        // 首次输入框
        this.passwordEdit = this.passwordEdit = mputil.buildEditBox("请输入6-20位新密码", "密    码").to(this).pp(0.55, 0.65);
        this.passwordEdit.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        // 再次确认框
        this.confirmPasswordEdit = this.confirmPasswordEdit = mputil.buildEditBox("请再输入一次新密码", "确认密码").to(this).pp(0.55, 0.5);
        this.confirmPasswordEdit.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        // // 切换文本按钮
        // this.graphicalPasswordLabel = this.linkTitle = mputil.buildUnderlineLabel("设置图形密码>>>").to(this).p(1010, 200);
        // this.graphicalPasswordLabel.addClickEventListener(this.switchToGraphicalPasswordLayer.bind(this));
        // 确定按钮
        this.checkButton = new FocusButton("modify/btn_sure.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.3);
        // this.checkButton.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // this.checkButton.setTitleText("确 定");
        // this.checkButton.getTitleRenderer().pp(0.5, 0.55);
        this.checkButton.addTouchEventListener(this.bindCheckButtonEvent.bind(this));
    },

    /**
     * 绑定确认按钮事件
     * @param sender
     * @param type
     */
    bindCheckButtonEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                if (mputil.passwordIsLegal(this.passwordEdit.getString())) {
                    if (this.passwordEdit.getString() === this.confirmPasswordEdit.getString()) {
                        if (this.type === MPSettingPasswordLayer.BankPassword) {
                            mpGD.netHelp.requestSetTwoPassword(this.passwordEdit.getString(), 0);
                        }
                        mpApp.showWaitLayer("正在设置密码, 请等待");
                    } else {
                        ToastSystemInstance.buildToast("两次密码不相同");
                    }
                }
                break;
            default:
                break;
        }
    },

    /**
     * 初始化图形密码界面
     */
    initGraphicalPasswordLayer: function () {
        this.pattern = new MPPatternFrame().to(this).pp(0.5, 0.47);
        this.pattern.setTouchEventBeganCallback(() => {
            this.hint.setString("温馨提示：完成后松开手指即可。");
        });
        this.pattern.setTouchEventEndedCallback(this.submitGraphicalPassword.bind(this));

        // 切换图形按钮
        this.plainTextPasswordLabel = this.linkTitle = mputil.buildUnderlineLabel("<<<设置纯文本密码").to(this).p(250, 200);
        this.plainTextPasswordLabel.addClickEventListener(this.switchToPlainTextPasswordLayer.bind(this));

        // 重绘按钮
        this.redrawBtn = new FocusButton("gui-gm-button-green-m.png", "", "gui-gm-button-green-m-d.png", ccui.Widget.PLIST_TEXTURE);
        this.redrawBtn.to(this).pp(0.4, 0.11).qscale(0.8);
        this.redrawBtn.setTitleFontName("res/font/zhs-fz-36-green.fnt");
        this.redrawBtn.setTitleText("修  改");
        this.redrawBtn.getTitleRenderer().pp(0.5, 0.55);
        this.redrawBtn.addTouchEventListener(this.bindRedrawButtonEvent.bind(this));

        // 确认按钮
        this.sureBtn = new FocusButton("gui-gm-button-green-m.png", "", "gui-gm-button-green-m-d.png", ccui.Widget.PLIST_TEXTURE);
        this.sureBtn.to(this).pp(0.6, 0.11).qscale(0.8);
        this.sureBtn.setTitleFontName("res/font/zhs-fz-36-green.fnt");
        this.sureBtn.setTitleText("确  认");
        this.sureBtn.getTitleRenderer().pp(0.5, 0.55);
        this.sureBtn.addTouchEventListener(this.bindSureButtonEvent.bind(this));

        this.hintString = "";
        if (G_PLATFORM_TV) {
            this.hintString = "(双击“OK”键完成绘制)";
        }
    },

    submitGraphicalPassword: function () {
        if (this.pattern.linesArray.length === 0) return false;

        var oldIndexArray = this.pattern.getOldDotIndexArray();
        var newIndexArray = this.pattern.getNewDotIndexArray();

        if (oldIndexArray.length !== 0) {
            this.pattern.setFrameTouchEnabled(false);
            if (newIndexArray.toString() === oldIndexArray.toString()) {
                this.hint.setString("温馨提示：您的新密码图案。");
                this.sureBtn.setEnabled(true);
            } else {
                this.hint.setString("温馨提示：两次密码不一致，请重试。" + this.hintString);
                this.pattern.wrongPasswordLine();
                setTimeout(() => {
                    this.pattern.setFrameTouchEnabled(true);
                    this.pattern.resetGraphicalPasswordData();
                }, 1000);
            }
        } else {
            this.pattern.setFrameTouchEnabled(false);
            if (newIndexArray.length >= 4) {
                this.hint.setString("温馨提示：已记录图案。");
                setTimeout(() => {
                    this.hint.setString("温馨提示：再次绘制图案进行确认。" + this.hintString);
                    ttutil.copyAttr(this.pattern.historyDotIndexArray, this.pattern.dotIndexArray);
                    this.pattern.resetGraphicalPasswordData();
                    this.pattern.setFrameTouchEnabled(true);
                    this.redrawBtn.setEnabled(true);
                }, 1000);
            } else {
                this.hint.setString("温馨提示：至少连接4个点，请重试。" + this.hintString);
                this.pattern.wrongPasswordLine();
                setTimeout(() => {
                    this.pattern.resetGraphicalPasswordData();
                    this.pattern.setFrameTouchEnabled(true);
                }, 1000);
            }
        }
    },

    /**
     * 绑定重绘按钮事件
     */
    bindRedrawButtonEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                this.hint.setString("温馨提示：绘制解锁图案，请至少连接4个点。" + this.hintString);
                this.pattern.resetGraphicalPasswordData();
                this.pattern.historyDotIndexArray.length = 0;
                this.pattern.setFrameTouchEnabled(true);
                this.redrawBtn.setEnabled(false);
                this.sureBtn.setEnabled(false);
                break;
            default:
                break;
        }
    },

    /**
     * 绑定确认按钮事件
     */
    bindSureButtonEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                var dotIndexArray = this.pattern.getOldDotIndexArray();
                var password = "";
                for (var i = 0; i < dotIndexArray.length; i++) {
                    password = password + "#" + dotIndexArray[i].toString();
                }

                if (this.type === MPSettingPasswordLayer.BankPassword) {
                    mpGD.netHelp.requestSetTwoPassword(password, 1);
                }
                mpApp.showWaitLayer("正在设置密码, 请等待");
                break;
            default:
                break;
        }
    },


    switchToGraphicalPasswordLayer: function () {
        if (G_PLATFORM_TV) {
            ToastSystemInstance.buildToast({text: "TV版本暂不支持此功能，请下载手机版本。"});
            return;
        }

        this.hint.setString("温馨提示：绘制解锁图案，请至少连接4个点。" + this.hintString);
        this.passwordEdit.setVisible(false);
        this.confirmPasswordEdit.setVisible(false);
        this.checkButton.setVisible(false);
        this.graphicalPasswordLabel.setVisible(false);

        this.pattern.setVisible(true);
        this.redrawBtn.setVisible(true);
        this.sureBtn.setVisible(true);
        this.plainTextPasswordLabel.setVisible(true);
        this.redrawBtn.setEnabled(false);
        this.sureBtn.setEnabled(false);

        if (G_PLATFORM_TV) {
            mpGD.mainScene.setDoubleClickCallback(this.submitGraphicalPassword.bind(this));
            mpGD.mainScene.setFocusSelected(this.plainTextPasswordLabel);
            var dotArray = this.pattern.originDotInfoArray;
            this.backBtn.setNextFocus(null, dotArray[0].node, null, dotArray[0].node);
            dotArray[0].node.setNextFocus(this.backBtn, dotArray[3].node, this.plainTextPasswordLabel, dotArray[1].node);
            dotArray[1].node.setNextFocus(this.backBtn, dotArray[4].node, dotArray[0].node, dotArray[2].node);
            dotArray[2].node.setNextFocus(this.backBtn, dotArray[5].node, dotArray[1].node, null);
            dotArray[3].node.setNextFocus(dotArray[0].node, dotArray[6].node, this.plainTextPasswordLabel, dotArray[4].node);
            dotArray[4].node.setNextFocus(dotArray[1].node, dotArray[7].node, dotArray[3].node, dotArray[5].node);
            dotArray[5].node.setNextFocus(dotArray[2].node, dotArray[8].node, dotArray[4].node, null);
            dotArray[6].node.setNextFocus(dotArray[3].node, this.redrawBtn, this.plainTextPasswordLabel, dotArray[7].node);
            dotArray[7].node.setNextFocus(dotArray[4].node, this.sureBtn, dotArray[6].node, dotArray[8].node);
            dotArray[8].node.setNextFocus(dotArray[5].node, this.sureBtn, dotArray[7].node, null);

            this.redrawBtn.setNextFocus(dotArray[6].node, null, this.plainTextPasswordLabel, this.sureBtn);
            this.sureBtn.setNextFocus(dotArray[8].node, null, this.redrawBtn, null);
            this.plainTextPasswordLabel.setNextFocus(this.backBtn, null, this.backBtn, dotArray[0].node);
        }
    },

    switchToPlainTextPasswordLayer: function () {
        this.hint.setString("温馨提示：使用银行需先设置密码，纯文本密码不能与登录密码一致。");
        this.passwordEdit.setVisible(true);
        this.confirmPasswordEdit.setVisible(true);
        this.checkButton.setVisible(true);
        // this.graphicalPasswordLabel.setVisible(true);

        // this.pattern.setVisible(false);
        // this.redrawBtn.setVisible(false);
        // this.sureBtn.setVisible(false);
        // this.plainTextPasswordLabel.setVisible(false);

        if (G_PLATFORM_TV) {
            // mpGD.mainScene.setDoubleClickCallback(null);
            // mpGD.mainScene.setFocusSelected(this.graphicalPasswordLabel);
            this.backBtn.setNextFocus(null, this.passwordEdit, null, this.passwordEdit);
            this.passwordEdit.setNextFocus(this.backBtn, this.confirmPasswordEdit, this.backBtn, null);
            this.confirmPasswordEdit.setNextFocus(this.passwordEdit, this.checkButton, null, null);
            this.checkButton.setNextFocus(this.confirmPasswordEdit, null, null, this.graphicalPasswordLabel);
            // this.graphicalPasswordLabel.setNextFocus(this.confirmPasswordEdit, null, this.checkButton, null);
        }
    },

    /**
     *
     * @param event
     * @param data
     */
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.ModifySetup:
                mpApp.removeWaitLayer();
                if (data.action == 3 && !data.errMsg && data.success == true) {
                    ToastSystemInstance.buildToast("设置保险柜密码成功");

                    //标识为已经设置了密码, 这边是随便设置的， 只是不是true和false, 就可以了
                    mpGD.userInfo.twoPassword = "123456";
                    this.onFinishCallback && this.onFinishCallback();
                    this.removeFromParent();
                }
                break;
            case mpNetEvent.ForgotPassword:
                mpApp.removeWaitLayer();
                if (data.type == 2 && data.success == true) {
                    ToastSystemInstance.buildToast("设置新密码成功");
                    this.removeFromParent();
                }
                break;
        }
    },

    initTV: function () {
        this._super();
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
        // this.pattern.resetGraphicalPasswordData();
        // this.pattern.historyDotIndexArray.length = 0;
    },

});


MPSettingPasswordLayer.LoginPassword = 1;   //登录密码
MPSettingPasswordLayer.BankPassword = 2;    //保险柜密码