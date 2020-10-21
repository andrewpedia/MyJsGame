var MPMainInputBankPasswordLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new ccs.load('res/plaza1v1/images/bank_popup/bank/MainInputBankPasswordLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var closeBtn = this.panel.getChildByName('Button_1');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var submitBtn = this.panel.getChildByName('submitBtn');
        submitBtn.tag = 10;

        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var findBtn = this.panel.getChildByName('findBtn');
        findBtn.tag = 16;
        findBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        var tf1     = this.panel.getChildByName('tf_1');
        this.tf1 = tf1;


    },


    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.9);
                sender.setColor(cc.color(255,128,128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                sender.tag == 1001 && this.closePanel();

                if (sender.tag == 10) {
                    if (mputil.passwordIsLegal(this.tf1.getString())) {
                        this.twoPassword = this.tf1.getString();
                        mpGD.netHelp.requestVerifyTwoPassword(this.tf1.getString());
                        mpApp.showWaitLayer("正在验证二级密码");
                    }
                }
                if (sender.tag == 16) {
                    if (mpGD.userInfo.phone) {
                        new MPSafeMobileLayer(MPSafeMobileLayer.VerifySafeMobile, MPSafeMobileLayer.VerifyFindTwoPassword).to(cc.director.getRunningScene());
                        this.removeFromParent();
                    }
                    else {
                        ToastSystemInstance.buildToast("您没有绑定手机, 无法找回密码。请前往个人中心->账户安全 设置密保手机")
                    }
                }

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.VerifyTwoPassword:
                mpApp.removeWaitLayer();
                // if (this.type === mpPasswordType.Plaintext) {
                if (data.success) {
                    mpGD.userInfo.twoPassword = this.twoPassword;
                    new MPMainBankBoxLayer().show();
                    this.closePanel()

                    // this.callback && this.callback();
                    // this.removeFromParent();
                }
                // }
                // else if (this.type === mpPasswordType.Graphical) {
                //     if (data.errMsg) {
                //         this.pattern.wrongPasswordLine();
                //         this.pattern.setFrameTouchEnabled(false);
                //         setTimeout(() => {
                //             this.pattern.resetGraphicalPasswordData();
                //             this.pattern.setFrameTouchEnabled(true);
                //         }, 1000);
                //     }
                //     else if (data.success) {
                //         mpGD.userInfo.twoPassword = this.graphicalPassword;   // 此处数值随意设置，仅用于标记而已
                //         this.pattern.resetGraphicalPasswordData();
                //         this.callback && this.callback();
                //         this.removeFromParent();
                //     }
                // }
                break;
        }
    },



})