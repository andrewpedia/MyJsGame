var MPMainPersonalChangeAvatarLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new cc.Sprite("res/images/nopack/hall_bg_common_1120x615.png");
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var panel = this.panel;

        //this.runPanelAction();


        var closeBtn = new FocusButton("common_btn_x.png","","",ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(panel);
        closeBtn.x = panel.cw() - 30;
        closeBtn.y = panel.ch() - 30;
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var title = new cc.Sprite("#user_title.png").to(panel).pp(0.5,0.925)

        var left = new cc.Sprite("#user_bg_left.png");
        left.to(panel).pp(0.1525,0.45);

        let avatarButton = new FocusButton();
        avatarButton.ignoreContentAdaptWithSize(false);
        avatarButton.setContentSize(100, 100);
        avatarButton.to(left).pp(0.5,0.7);
        avatarButton.qscale(1.5);
        avatarButton.tag = 15;

        var avatarSprite = new cc.Sprite().to(avatarButton).pp(0.5,0.5).qscale(0.8);
        var avatarFrameSprite = new cc.Sprite("#head_frame_box.png").to(avatarButton).pp(0.5,0.5);

        panel.setAvatar = function (faceID) {
            avatarSprite.setSpriteFrame('head_animal_' + (faceID + 1) + '.png.png');
            avatarFrameSprite.pp(0.5,0.5);
        };
        panel.setAvatar(mpGD.userInfo.faceID);

        var canChangeLabel = new cc.LabelTTF("点击头像可更换",GFontDef.fontName,24);
        canChangeLabel.to(left).pp(0.5,0.5);

        var bindPhoneButton = new cc.Sprite("#user_btn_head.png");
        bindPhoneButton.to(left).pp(0.5,0.3);
        bindPhoneButton.tag = 28;

        var right = new cc.Scale9Sprite("common_input_box.png");
        right.setContentSize(1120 - 260 - 90, 470);
        right.to(panel).pp(0.62,0.45);

        var startX = 50;
        var startY = 50;

        var avatarSelectedFlag = new cc.Sprite("#head_frame_box_select.png");
        this.avatarSelectedFlag = avatarSelectedFlag;
        avatarSelectedFlag.to(right,2);

        for (var i = 0 ; i < 12; ++i){

            var section = parseInt(i / 5);
            var row = i % 5;

            let avatarButton1 = new FocusButton();
            avatarButton1.ignoreContentAdaptWithSize(false);
            avatarButton1.setContentSize(100, 100);
            avatarButton1.to(right).p(80 + row * 150, 470 - 80 - 150 * section);
            avatarButton1.tag = i + 10;
            avatarButton1.addTouchEventListener(this.buttonPressedEvents.bind(this))

            var avatarSprite2 = new cc.Sprite('#head_animal_' + (i + 1) + '.png.png').to(avatarButton1).pp(0.5,0.5).qscale(0.8);
            var avatarFrameSprite2 = new cc.Sprite("#head_frame_box.png").to(avatarButton1).pp(0.5,0.5);

            if (i == mpGD.userInfo.faceID){
                this.avatarSelectedFlag.x = avatarButton1.x;
                this.avatarSelectedFlag.y = avatarButton1.y;
            }

        }

    },


    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                sender.qscale(1.1);
                SoundEngine.playEffect(commonRes.btnClick);

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                 sender.qscale(1);

                sender.tag == 1001 && this.closePanel();
                if (sender.tag >= 10 && sender.tag <= 21){

                    this.avatarSelectedFlag.x = sender.x ;
                    this.avatarSelectedFlag.y = sender.y ;

                    var faceID = sender.tag - 10;
                    this.panel.setAvatar(faceID);

                    console.log('xxoo:' +mpGD.userInfo.nickname);
                    mpGD.userInfo.faceID = faceID;
                    mpGD.netHelp.requestModifyUserInfo(mpGD.userInfo.nickname, faceID);


                }
                break;
            case ccui.Widget.TOUCH_CANCELED:

                sender.qscale(1);

                break;
        }
    },



})