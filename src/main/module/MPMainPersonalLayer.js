var MPMainPersonalLayer  = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new cc.Sprite("res/images/nopack/hall_bg_common_1120x615.png");
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var panel = this.panel;

        this.runPanelAction();


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
        avatarButton.addTouchEventListener(this.avatarButtonPressed.bind(this));

        var avatarSprite = new cc.Sprite().to(avatarButton).pp(0.5,0.5).qscale(0.8);
        var avatarFrameSprite = new cc.Sprite("#head_frame_box.png").to(avatarButton).pp(0.5,0.5);

        panel.setAvatar = function (faceID) {
            avatarSprite.setSpriteFrame('head_animal_' + (faceID + 1) + '.png.png');
            avatarFrameSprite.pp(0.5,0.5);
        };
        panel.setAvatar(mpGD.userInfo.faceID);

        var vipSprite = new cc.Sprite("res/plaza1v1/images/vip_bg.png");
        vipSprite.to(left).anchor(0.5,0.5).pp(0.5,0.55);

        var vipLabel = new cc.LabelBMFont(mpGD.userInfo.memberOrder|| "0","res/plaza1v1/images/numberlabel_vip.fnt");
        vipLabel.to(left).anchor(0.5,0.5).pp(0.575,0.575).qscale(0.2);

        var canChangeLabel = new cc.LabelTTF("点击头像可更换",GFontDef.fontName,24);
        canChangeLabel.to(left).pp(0.5,0.5);

        var bindPhoneButton = new FocusButton("user_btn_bind_phone.png","","",ccui.Widget.PLIST_TEXTURE);
        bindPhoneButton.to(left).pp(0.5,0.3);
        bindPhoneButton.tag = 28;
        bindPhoneButton.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var right = new cc.Scale9Sprite("common_input_box.png");
        right.setContentSize(1120 - 260 - 90, 470);
        right.to(panel).pp(0.62,0.45);

        var idTitleSprite = new cc.Sprite("#user_label_id.png").to(right).anchor(1,0.5);
        idTitleSprite.pp(0.2,0.9);

        var box = new cc.Scale9Sprite("user_input.png");
        box.setContentSize(450,50);
        box.to(right).pp(0.5,0.9);

        var textLabel = new cc.LabelTTF(mpGD.userInfo.gameID,GFontDef.fontName,26)
        textLabel.to(box);
        textLabel.anchor(0,0.5);
        textLabel.pp(0.05,0.5);

        var rightButton = new FocusButton("user_btn_copy.png","","",ccui.Widget.PLIST_TEXTURE);
        rightButton.to(right).pp(0.875,0.9);
        rightButton.tag = 14;
        rightButton.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var nickNameTitleSprite = new cc.Sprite("#user_label_name.png").to(right).anchor(1,0.5);
        nickNameTitleSprite.pp(0.2,0.78);

        var box = new cc.Scale9Sprite("user_input.png");
        box.setContentSize(450,50);
        box.to(right).pp(0.5,0.78);

        var textLabel = new cc.LabelTTF(mpGD.userInfo.nickname,GFontDef.fontName,26)
        textLabel.to(box);
        textLabel.anchor(0,0.5);
        textLabel.pp(0.05,0.5);

        var rightButton = new FocusButton("user_btn_modifyName.png","","",ccui.Widget.PLIST_TEXTURE);
        rightButton.to(right).pp(0.875,0.78);
        rightButton.tag = 101;
        rightButton.addTouchEventListener(this.buttonPressedEvents.bind(this));
        var phoneTitleSprite = new cc.Sprite("#user_label_phone.png").to(right).anchor(1,0.5);
        phoneTitleSprite.pp(0.2,0.66);

        var box = new cc.Scale9Sprite("user_input.png");
        box.setContentSize(450,50);
        box.to(right).pp(0.5,0.66);

        var textLabel12 = new cc.LabelTTF("未绑定",GFontDef.fontName,26)
        textLabel12.to(box);
        textLabel12.anchor(0,0.5);
        textLabel12.pp(0.05,0.5);

        if(!mpGD.userInfo.hasAccount)
        {
            textLabel12.setColor(cc.color(255,82,0));
        }



        var rightButton = new FocusButton("user_btn_bind.png","","",ccui.Widget.PLIST_TEXTURE);
        rightButton.to(right).pp(0.875,0.66);
        rightButton.tag = 28;
        rightButton.addTouchEventListener(this.buttonPressedEvents.bind(this));

        if(mpGD.userInfo.hasAccount){
            textLabel12.setString(mpGD.userInfo.phone);
            bindPhoneButton.hide();
            rightButton.hide();
        }

        var moneyTitleSprite = new cc.Sprite("#user_label_gold.png").to(right).anchor(1,0.5);
        moneyTitleSprite.pp(0.2,0.54);

        var box = new cc.Scale9Sprite("user_input.png");
        box.setContentSize(450,50);
        box.to(right).pp(0.5,0.54);

        var moneyFlag = new cc.Sprite("#common_flag_gold.png");
        moneyFlag.to(box);
        moneyFlag.anchor(0,0.5);
        moneyFlag.pp(0.05,0.5).qscale(0.9);
        var textLabel = new cc.LabelTTF( "" +  ttutil.roundFloat(mpGD.userInfo.score),GFontDef.fontName,26)
        textLabel.to(box);
        textLabel.anchor(0,0.5);
        textLabel.pp(0.15,0.5);

        var bankTitleSprite = new cc.Sprite("#user_label_safebox.png").to(right).anchor(1,0.5);
        bankTitleSprite.pp(0.2,0.42);

        var box = new cc.Scale9Sprite("user_input.png");
        box.setContentSize(450,50);
        box.to(right).pp(0.5,0.42);

        var moneyFlag = new cc.Sprite("#common_flag_gold.png");
        moneyFlag.to(box);
        moneyFlag.anchor(0,0.5);
        moneyFlag.pp(0.05,0.5).qscale(0.9);

        var textLabel = new cc.LabelTTF( "" + mpGD.userInfo.bankScore,GFontDef.fontName,26)
        textLabel.to(box);
        textLabel.anchor(0,0.5);
        textLabel.pp(0.15,0.5);

        var changeAccountButton = new FocusButton("user_btn_change_account.png","","",ccui.Widget.PLIST_TEXTURE);
        changeAccountButton.to(right).pp(0.3,0.17);
        changeAccountButton.tag = 27;
        changeAccountButton.addTouchEventListener(this.buttonPressedEvents.bind(this));
        
        var settingButton = new FocusButton("user_btn_setting.png","","",ccui.Widget.PLIST_TEXTURE);
        settingButton.to(right).pp(0.7,0.17);
        
        settingButton.tag = 29;
        settingButton.addTouchEventListener(this.buttonPressedEvents.bind(this));

        if(! mpGD.userInfo.hasWeiXin)
        {
            var bindWxButton = new FocusButton("user_btn_change_account.png","","",ccui.Widget.PLIST_TEXTURE);
            bindWxButton.to(right).pp(0.1,0.17);
            bindWxButton.tag = 30;
            bindWxButton.addTouchEventListener(this.buttonPressedEvents.bind(this));
        }

        return true;
    },
    avatarButtonPressed:function (sender,type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:sender.qscale(1.7);break;
            case ccui.Widget.TOUCH_ENDED:sender.qscale(1.5);this.loadChangeAvatar();break;
            case ccui.Widget.TOUCH_CANCELED:sender.qscale(1.5);break;
        }
        },
    updateUserInfo:function () {
        this.panel.setAvatar(mpGD.userInfo.faceID);
    },

    buttonPressedEvents:function (sender, type) {

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);


                return true;
                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);



                sender.tag == 1001 && this.closePanel();

                switch (sender.tag){
                    case 15:{this.loadChangeAvatar()};break;
                    case 18:{this.loadChangeAvatar()};break;
                    case 14:{this.copyGameID()      };break;
                    case 27:{this.loadLoginOut()    };break;
                    case 28:{this.loadRegister()    };break;
                    case 29:{this.loadSetting()     };break;
                     case 30:{this.bindWx()     };break;
                    case 100:{new MPMainVipLayer().show()};break;
                    case 101:{if (mpGD.userInfo.memberOrder < 2) {
                            ToastSystemInstance.buildToast("VIP2以上才能修改昵称");
                        }
                        else {
                            new MPMainPersonalChangeNickNameLayer().show();
                        }
					};break;
                }



                break;
            case ccui.Widget.TOUCH_CANCELED:


                break;
        }
    },
    onWXCode: function (code, isWeb) {
    console.log("aaaaaaa");
        mpGD.netHelp.requestBindAccount(2, null, null, null, code, isWeb);

        mpApp.showWaitLayer("正在绑定微信, 请稍候..");
    },
    //绑定微信
    bindWx:function () {
                var self = this;
                if(!cc.sys.isNative)
                {
                    ToastSystemInstance.buildToast("网页版本暂不支持此功能！");
                    return;
                }

                if (native.isWXAppInstalled()||1==1) {
                    native.wxLogin(G_WX_APPID, Math.random(), this.onWXCode.bind(this));
                }
                else {
                    if (cc.sys.isMobile && !G_PLATFORM_TV) {
                        ToastSystemInstance.buildToast("您的设备没有安装微信, 无法微信登录");
                    }
                    else {
                        mpGD.netHelp.requestWXWebLoginAddr();
                        mpApp.showWaitLayer("正在请求微信web绑定地址");
                    }
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
            case mpNetEvent.BindAccount:
                mpApp.removeWaitLayer();

                if (data.success) {
                    if (data.type == -2) {
                        ToastSystemInstance.buildToast("解绑微信成功");
                        mpGD.userInfo.hasWeiXin = false;
                        this.zhaqLayer.wxItem.statusLabel.setString("未绑定");
                        this.zhaqLayer.wxItem.editBtn.setTitleText("绑 定");
                        this.zhaqLayer.wxItem.statusLabel.setColor(cc.color(255, 0, 0));
                        this.zhaqLayer.wxItem.editBtn.getTitleRenderer().pp(0.5, 0.6).qscale(0.8);

                    }
                    else if (data.type == 2) {
                        mpGD.userInfo.hasWeiXin = true;
                        ToastSystemInstance.buildToast("绑定微信成功");
                        
                    }
                }
                break;
            case mpNetEvent.WXWebLoginAddr:
                mpApp.removeWaitLayer();

                if (data.errMsg) {
                    return;
                }
                //console.log("data.url========="+data.url);
                new WebViewLayer(data.url).to(this);
                break;
        }
    },

    //复制游戏ID
    copyGameID:function () {
        native.setClipboard(mpGD.userInfo.gameID);
        ToastSystemInstance.buildToast("ID已经复制到剪切板中");
    },
    //TODO:加载更换头像弹窗
    loadChangeAvatar:function () {

        new MPMainPersonalChangeAvatarLayer().show();

    },


    //TODO:加载登出弹窗
    loadLoginOut:function () {

        new MPMainPersonalLogoutLayer().show();

    },


    //TODO:加载注册弹窗
    loadRegister:function () {
    
        var nowScene = cc.director.getRunningScene();
        var bindAccountLayer = new MPRegisterLayer(MPRegisterLayer.BindMode).to(nowScene);

        // var backgroundLayer = new MPQBackgroundLayer();
        // backgroundLayer.to(nowScene,100000000,100000000);
        //
        // var settingPanel = ccs.load('res/plaza1v1/images/personal_popup/personal/MainPersonalRegisterLayer.json').node;
        // settingPanel.to(backgroundLayer).anchor(0.5,0.5).pp(0.5,0.5);
        // settingPanel.setScale(0.2);
        // settingPanel.runAction(cc.ScaleTo(0.25,1,1))
        //
        // //关闭按钮
        // var closeBtn            = settingPanel.getChildByName('closeBtn');
        // closeBtn.setTag(35);
        // closeBtn.addTouchEventListener(this.loginOutButtonPressedEvents.bind(this));


    },

    //TODO:加载设置弹窗
    loadSetting:function () {

        new MPMainPersonalSettingLayer().show();

    },


})