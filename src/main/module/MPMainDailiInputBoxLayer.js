var MPMainDailiInputBoxLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();
        //callback: null,

        this.panel = new cc.Sprite("res/images/nopack/hall_bg_common_632x433.png");
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var panel = this.panel;

        this.runPanelAction();

        var closeBtn = new FocusButton("common_btn_x.png","","",ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(panel);
        closeBtn.x = panel.cw() - 30;
        closeBtn.y = panel.ch() - 30;
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var title = new cc.Sprite("#common_title_txmsg.png").to(panel).pp(0.5,0.89);

        var submitBtn = new FocusButton("common_btn_yes.png","","",ccui.Widget.PLIST_TEXTURE);
        submitBtn.tag = 36;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        submitBtn.to(panel).pp(0.5,0.15);

        var right = new cc.Scale9Sprite("common_input_box.png");
        right.setContentSize(550, 200);
        right.to(panel).pp(0.5,0.5);

        //var label = new cc.LabelTTF("确定登出当前账号吗?",GFontDef.fontName,26);
        //label.to(panel).pp(0.5,0.5);
        //label.setColor(cc.color(8,183,255));
        var inviteCodeLabel = new cc.LabelTTF("您还未填写邀请码，请填写邀请码", "宋体", 28).to(panel).anchor(0.5,0.5).pp(0.5,0.5);
            inviteCodeLabel.setVisible(true);

            //this.lastlastGameIDEditBox = mputil.buildEditBox("请输入邀请码", "", cc.EDITBOX_INPUT_MODE_NUMERIC,cc.size(150, 24)).to(panel).pp(0.6,0.5);
            //this.lastlastGameIDEditBox.mpTip.setFontFillColor(cc.color(255,255,255));
            //this.lastlastGameIDEditBox.setFontSize(16);
            //this.lastlastGameIDEditBox.setMaxLength(10);

    },
    //setSubmitCallback: function (callback) {
    //    this.callback = callback;
    //},

    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);


                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);
                this.removeFromParent();
                new MPMainTuiGuangLayer().to(cc.director.getRunningScene());

//                sender.tag == 1001 && this.closePanel();
//                if (sender.tag == 36){
//                    //var lastUserID=this.lastlastGameIDEditBox.getString();

//                    //if (lastUserID.length == 0) {
//                    //    ToastSystemInstance.buildToast("邀请码错误");
//                    //    return;
//                    //}

//                    //this.callback && this.callback(lastUserID);
//                    //this.getScene().popDefaultSelectArray();
//                    this.removeFromParent();
//                    new MPMainTuiGuangLayer().to(cc.director.getRunningScene());

//                    //mpGD.netHelp.logout();
//                    //mpGD.saNetHelper.logout();
//                    //mpApp.comeToLogon();
//                }
                break;
            case ccui.Widget.TOUCH_CANCELED:


                break;
        }
    },



})