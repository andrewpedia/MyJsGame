var MPMainBankPasswordLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new ccs.load('res/plaza1v1/images/bank_popup/bank/MainBankPasswordLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var submitBtn = this.panel.getChildByName('submitBtn');
        submitBtn.tag = 10;
        var tf1 = this.panel.getChildByName('tf_1');
        var tf2 = this.panel.getChildByName('tf_2');
        this.tf1 = tf1;
        this.tf2 = tf2;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

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

                    if (this.tf1.getString() == '' || this.tf1.getString() == null){
                        return ToastSystemInstance.buildToast("请输入密码");
                    }
                    if (this.tf2.getString() == '' || this.tf2.getString() == null){
                        return ToastSystemInstance.buildToast("请输入确认密码");
                    }

                    if (!mputil.passwordIsLegal(this.tf1.getString())) return;

                    if (this.tf1.getString() != this.tf2.getString()){
                        return ToastSystemInstance.buildToast("两次密码不一致");
                    }

                    mpGD.netHelp.requestSetTwoPassword(this.tf1.getString(), 0);
                    mpApp.showWaitLayer("正在设置密码, 请等待");
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
            case mpNetEvent.ModifySetup:
                mpApp.removeWaitLayer();
                if (data.action == 3 && !data.errMsg && data.success == true) {
                    ToastSystemInstance.buildToast("设置保险柜密码成功");

                    //标识为已经设置了密码, 这边是随便设置的， 只是不是true和false, 就可以了
                    mpGD.userInfo.twoPassword = "123456";
                    this.onFinishCallback && this.onFinishCallback();
                    this.closePanel();
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



})