var MPMainPersonalChangeNickNameLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();

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

        var title = new cc.Sprite("#change_title_change.png").to(panel).pp(0.5,0.89);

        var submitBtn = new FocusButton("common_btn_yes.png","","",ccui.Widget.PLIST_TEXTURE);
        submitBtn.tag = 1002;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        submitBtn.to(panel).pp(0.5,0.15);

        var right = new cc.Scale9Sprite("common_input_box.png");
        right.setContentSize(550, 200);
        right.to(panel).pp(0.5,0.5);

        var label = new cc.LabelTTF("帮自己取一个独特的昵称吧",GFontDef.fontName,26);
        label.to(panel).pp(0.5,0.65);
        label.setColor(cc.color(8,183,255));

        this.nicknameEditBox = mputil.buildSingleEditBox(cc.size(450,55),cc.EDITBOX_INPUT_MODE_ANY,cc.color(255,255,255),12,'最大6位汉字或者12位英文数字');
        this.nicknameEditBox.to(this.panel).pp();

        this.nicknameEditBox.setPlaceholderFontColor(cc.color(255,255,255));
        var newNickname="";
    },

    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(1.1);

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);
                sender.setScale(1);



                sender.tag == 1001 && this.closePanel();

                //提交修改
                if (sender.tag == 1002){

                    //console.log(this.nicknameEditBox.string);
                    var nickname=this.nicknameEditBox.string;
                    if (nickname != mpGD.userInfo.nickname) {
                        if (mputil.nicknameIsLegal(nickname)) {
                            this.newNickname=nickname;
                            mpGD.netHelp.requestModifyUserInfo(nickname, mpGD.userInfo.faceID);
                            mpApp.showWaitLayer("正在提交数据,请耐心等候");
                        }
                    }

                }
                break;
            case ccui.Widget.TOUCH_CANCELED:

                sender.setScale(1);


                break;
        }
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.ModifySetup:
                //mpApp.removeWaitLayer();
                if (data.action == 1) {
                    if (!data.errMsg) {
                       //console.log("新的昵称========="+this.newNickname);
                        mpApp.updateUserInfo({nickname: this.newNickname});
                        //ToastSystemInstance.buildToast("您的昵称修改成功。");
                        this.closePanel();
                    }
                }
                break;
        }
    },

});