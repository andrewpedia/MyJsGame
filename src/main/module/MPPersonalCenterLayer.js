/**
 * Created by Apple on 2016/6/18.
 */


/**
 * 个人中心
 */
var MPPersonalCenterLayer = MPBaseModuleLayer.extend({

    titleSprite: null,

    layerArray: null,
    grzxLayer: null,                  //个人中心模块
    xgmmLayer: null,                   //修改密码模块
    zhaqLayer: null,                   //账户安全模块

    newNickname: null,              //新的昵称
    newFaceID: null,                //新的头像

    wantToClose: false,             //是否想要关闭窗口
    oldPasswordEditBox: null,           //旧密码框
    newPasswordEditBox: null,           //新密码框
    confirmNewPasswordEditBox: null,        //确认密码框

    verifySafeEmailSuccessListener: null,
    verifySafeQuestionSuccessListener: null,

    _className: "MPPersonalCenterLayer",
    _classPath: "src/main/module/MPPersonalCenterLayer.js",

    onEnter: function () {
        this._super();

        this.verifySafeEmailSuccessListener = cc.eventManager.addCustomListener(mpEvent.VerifySafeEmailSuccess, this.onVerifySafeEmailSuccess.bind(this));
        this.verifySafeQuestionSuccessListener = cc.eventManager.addCustomListener(mpEvent.VerifySafeQuestionSuccess, this.onVerifySafeQuestionSuccess.bind(this));


    },

    ctor:function (type) {
        this.panelType = type; // 0 修改密码 1 账户安全
        this._super();
    },

    //当安全问题验证成功
    onVerifySafeQuestionSuccess: function () {
        //在该界面如果收到此通知， 肯定就是要换密保了
        new MPSafeQuestionLayer(MPSafeQuestionLayer.ModifySafeQuestion, "您正在修改密保问题").to(cc.director.getRunningScene());
    },
    //当安全邮箱验证成功
    onVerifySafeEmailSuccess: function () {
        //在该界面如果收到此通知， 肯定就是要换安全邮箱了
        new MPSafeEmailLayer(MPSafeEmailLayer.ModifySafeEmail, "您正在修改安全邮箱问题").to(cc.director.getRunningScene());
    },

    onExit: function () {
        this._super();

        cc.eventManager.removeListener(this.verifySafeEmailSuccessListener);
        cc.eventManager.removeListener(this.verifySafeQuestionSuccessListener);

        // cc.director.getRunningScene().runAction(cc.sequence(
        //     cc.delayTime(1),
        //     cc.callFunc(()=>{
        //         cc.log("====== what the fuck");
        cc.sys.cleanScript("src/main/module/MPPersonalCenterLayer.js");
        cc.sys.cleanScript("src/main/module/MPBaseModuleLayer.js");
        cc.loader.loadJs("src/main/module/MPBaseModuleLayer.js");
        cc.loader.loadJs("src/main/module/MPPersonalCenterLayer.js");
        //     })
        // ));

    },

    initEx: function () {

        this._super(cc.size(800, 500));

        // this.titleBG.display("#gui-gm-bt-bj-da.png");
        this.titleSprite = new cc.Sprite("#safebox_title_setpwd1.png").to(this.titleBG).pp(0.5, 0.6);

        this.layerArray = [];
        // this.layerArray.push(this.buildGRZXLayer().to(this).hide());   //个人中心模块
        this.layerArray.push(this.buildXGMMLayer().to(this).hide());   //修改密码模块
        //this.layerArray.push(this.buildZHAQLayer().to(this).hide());   //账户安全模块

        var self = this;
        //绑定入场动画
        for (var i = 0; i < this.layerArray.length; ++i) {
            this.layerArray[i].doEnter = (function () {
                this.show();
                self.titleSprite.display(this.mpTitleSpriteName);
                // this.p(mpV.w + 100, 0);
                // this.runAction(cc.moveTo(0.2, 0, 0).easing(cc.easeBackOut()));
            }).bind(this.layerArray[i]);
            this.layerArray[i].doExit = (function () {
                this.hide();
            }).bind(this.layerArray[i]);
        }


        // //如果不是游客登录
        // if (mpGD.userInfo.hasAccount) {
        this.buildTabButton();
        // }
        //this.layerArray[1].show();
        this.layerArray[0].show();

        this.newFaceID = mpGD.userInfo.faceID;
        this.newNickname = mpGD.userInfo.nickname;


        //设定关闭窗口前处理函数
        this.setClosePreCallback(function () {
            self.wantToClose = true;
            return self.submitGRZX();
        });
    },

    initTV: function () {
        this._super();

        if (!mpGD.userInfo.hasAccount) {
            this.backBtn.setNextFocus(null, this.grzxLayer.node.editBox, null, this.grzxLayer.node.editBox);
            var items = this.grzxLayer.selectBoxListView.getItems();
            this.grzxLayer.node.editBox.setNextFocus(this.backBtn, this.grzxLayer.node.copyLabel, this.backBtn, this.grzxLayer.node.editBtn);
            this.grzxLayer.node.editBtn.setNextFocus(null, this.grzxLayer.node.copyLabel, this.grzxLayer.node.editBox, null);
            this.grzxLayer.node.copyLabel.setNextFocus(this.grzxLayer.node.editBox, items[0], null, null);
            for (var i = 0; i < items.length; i++) {
                items[i].setNextFocus(this.grzxLayer.node.copyLabel, null, i == 0 ? null : items[i - 1], i == items.length - 1 ? null : items[i + 1]);
            }
        }
        this.refreshFocus(0);
    },

    // //关闭窗口
    // close: function () {
    //     this.getScene().pauseFocus();
    //     this.runAction(cc.sequence(cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
    //         cc.callFunc(() => {
    //             mpGD.mainScene.setFocusSelected(mpGD.mainScene.headIcon);
    //         }), cc.removeSelf()));
    // },

    refreshFocus: function (index) {
        var upItem = null;
        switch (index) {
            case 2:
                this.backBtn.setNextFocus(null, this.grzxLayer.node.editBox, null, this.grzxLayer.node.editBox);
                var items = this.grzxLayer.selectBoxListView.getItems();
                this.grzxLayer.node.editBox.setNextFocus(this.backBtn, this.grzxLayer.node.copyLabel, this.backBtn, null);
                // this.grzxLayer.node.editBtn.setNextFocus(null, this.grzxLayer.node.copyLabel, this.grzxLayer.node.editBox, null);
                this.grzxLayer.node.copyLabel.setNextFocus(this.grzxLayer.node.editBox, items[0], null, null);
                upItem = items[0];
                for (var i = 0; i < items.length; i++) {
                    items[i].setNextFocus(this.grzxLayer.node.copyLabel, this.buttonArray[0], i == 0 ? null : items[i - 1], i == items.length - 1 ? null : items[i + 1]);
                }
                break;
            case  0:
                this.backBtn.setNextFocus(null, this.oldPasswordEditBox, null, this.oldPasswordEditBox);
                this.oldPasswordEditBox.setNextFocus(this.backBtn, this.newPasswordEditBox, this.backBtn, null);
                this.newPasswordEditBox.setNextFocus(this.oldPasswordEditBox, this.confirmNewPasswordEditBox, null, null);
                this.confirmNewPasswordEditBox.setNextFocus(this.newPasswordEditBox, this.xgmmLayer.sureButton, null, null);
                this.xgmmLayer.sureButton.setNextFocus(this.confirmNewPasswordEditBox, this.buttonArray[1], null, null);
                upItem = this.xgmmLayer.sureButton;
                break;
            case  1:
                var items = this.zhaqLayer.checkBoxArray;
                this.backBtn.setNextFocus(null, this.zhaqLayer.wxItem.editBtn, null, this.zhaqLayer.wxItem.editBtn);
                // this.zhaqLayer.safeQuestionItem.editBtn.setNextFocus(this.backBtn, this.zhaqLayer.wxItem.isVisible() ? this.zhaqLayer.wxItem.editBtn : this.zhaqLayer.safeMobileItem.editBtn, this.backBtn, null);

                this.zhaqLayer.wxItem.editBtn.setNextFocus(this.backBtn, this.zhaqLayer.safeMobileItem.editBtn, this.backBtn, null);

                this.zhaqLayer.safeMobileItem.editBtn.setNextFocus(this.zhaqLayer.wxItem.isVisible() ? this.zhaqLayer.wxItem.editBtn : this.backBtn, null, items[items.length - 1].checkBox, null);


                for (var i = 0; i < items.length; i++) {
                    items[i].checkBox.setNextFocus(this.zhaqLayer.wxItem.editBtn, this.buttonArray[2], i == 0 ? null : items[i - 1].checkBox, i == items.length - 1 ? this.zhaqLayer.safeMobileItem.editBtn : items[i + 1].checkBox);
                }
                upItem = this.zhaqLayer.safeMobileItem.editBtn;
                break;
            default:
                this.backBtn.setNextFocus(null, this.buttonArray[1], null, this.oldPasswordEditBox);
                upItem = this.backBtn;
                break;
        }
        //tab button
        for (var i = 0; i < this.buttonArray.length; i++) {
            this.buttonArray[i].setNextFocus(upItem, null, i == 0 ? null : this.buttonArray[i - 1], i == this.buttonArray.length - 1 ? null : this.buttonArray[i + 1]);
            this.buttonArray[i].setFingerZoder(10);
        }
    },

    //当用户数据更新
    updateUserInfo: function () {
        this._super();
        //当设置密保问题界面退出前回调
        if (mpGD.userInfo.question1) {
            // this.zhaqLayer.safeQuestionItem.statusLabel.setString("已设置");
            // this.zhaqLayer.safeQuestionItem.statusLabel.setColor(cc.color(0, 255, 0));
            // this.zhaqLayer.safeQuestionItem.editBtn.setTitleText("修改");
        }
        if (mpGD.userInfo.safeEmail) {
            this.zhaqLayer.safeEmailItem.statusLabel.setString("已设置");
            this.zhaqLayer.safeEmailItem.statusLabel.setColor(cc.color(0, 255, 0));
            this.zhaqLayer.safeEmailItem.editBtn.setTitleText("修改");
        }
        if (mpGD.userInfo.hasMobile) {
            this.zhaqLayer.safeMobileItem.statusLabel.setString("已绑定");
            this.zhaqLayer.safeMobileItem.statusLabel.setColor(cc.color(0, 255, 0));
            this.zhaqLayer.safeMobileItem.editBtn.setTitleText("解 绑");
            this.zhaqLayer.safeMobileItem.editBtn.getTitleRenderer().pp(0.5, 0.6).qscale(0.8);
        }
        else {
            this.zhaqLayer.safeMobileItem.statusLabel.setString("未绑定");
            this.zhaqLayer.safeMobileItem.statusLabel.setColor(cc.color(255, 0, 0));
            this.zhaqLayer.safeMobileItem.editBtn.setTitleText("绑 定");
            this.zhaqLayer.safeMobileItem.editBtn.getTitleRenderer().pp(0.5, 0.6).qscale(0.8);
        }

    },

    //头像， 昵称 编辑的那个框
    buildUserInfoNode: function () {

        //-------------------------------------------------------------------------------------
        var node = new cc.Node().size(620, 140).anchor(0, 0);

        var editBox = node.editBox = mputil.buildEditBox("请输入昵称", "", null, cc.size(300, 65)).to(node);
        editBox.mpBG.initWithSpriteFrameName("personal/frame_mingcheng.png", cc.rect(10, 10, 300, 34));
        editBox.mpBG.setContentSize(cc.size(280, 50));
        editBox.mpBG.pp(0.4, 0.5);
        editBox.setMaxLength(16);
        editBox.pp(0.5, 0.6);

        // editBox.setTouchEnabled(false);
        editBox.setFontSize(25);
        editBox.setString(mpGD.userInfo.nickname);
        editBox.setFontColor(cc.color(231, 208, 124));

        var self = this;
        editBox.setDelegate({
            editBoxEditingDidEnd: function (sender) {

                if (sender.getString() == mpGD.userInfo.nickname) {
                    return;
                }
                // 改名卡限制
                var renameCard = mpGD.goodsSet.filter(item => item.goodsID === mpGoodsID.RenameCard);
                if (renameCard.length === 0 || renameCard[0].count <= 0) {
                    sender.setString(mpGD.userInfo.nickname);
                    ToastSystemInstance.buildToast({text: "您没有改名卡或数量不足，无法改名！"});
                    return;
                }

                // 昵称合法性
                if (mputil.nicknameIsLegal(sender.getString())) {
                    self.newNickname = sender.getString();
                }
            }
        });

        //头像
        var headIcon = node.headIcon = ttutil.buildHeadIcon(mpGD.userInfo.faceID).to(node).pp(0.1, 0.5);


        //编辑按钮
        var editBtn = node.editBtn = new FocusButton("personal/btn_bianji.png", "", "", ccui.Widget.PLIST_TEXTURE).to(node).pp(1.05, 0.6);

        // editBtn.setTitleFontName("res/font/zhs-fz-36-green.fnt");
        // editBtn.setTitleText("编辑");
        // editBtn.getTitleRenderer().pp(0.5, 0.55);
        // editBtn.setTitleFontSize(32);
        editBtn.setSwallowTouches(false);


        editBtn.addTouchEventListener(function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                // editBox.onTouchEnded(editBox, ccui.Widget.TOUCH_ENDED);
                editBtn.callback && editBtn.callback();
            }
            return false;
        });

        //如果是游客登录
        if (!mpGD.userInfo.hasAccount) {

            editBtn.loadTextureNormal("btn_blue.png", ccui.Widget.PLIST_TEXTURE);
            // new cc.LabelTTF("立即绑定","res/font/fzcy_s.TTF",35).to(editBtn).pp();


            editBox.setTouchEnabled(false);
            editBtn.setSwallowTouches(true);
            editBtn.setScale9Enabled(true);
            editBtn.setTitleFontName("res/font/zhs-yh-46.fnt");
            editBtn.setTitleText("立即绑定");

            editBtn.size(300, 100);
            editBtn.getTitleRenderer().pp(0.5, 0.55);
            editBtn.setScale(0.8);

            var ttf = new cc.LabelTTF("为了您的账户安全请绑定正式账户", GFontDef.fontName, 20).to(node).anchor(0, 0.5).pp(0.77, 0.2);
            ttf.setColor(cc.color(231, 208, 124));

            editBtn.callback = this.showBindAccount.bind(this);
        }

        //ID
        // var idLabel = new cc.LabelTTF("ID:" + mpGD.userInfo.gameID, "res/font/方正粗圆体.ttf", 35).anchor(0, 0.5).to(node).pp(1.4, 0.6);
        var idLabel = new ccui.Text("ID:" + mpGD.userInfo.gameID, "res/font/fzcy_s.TTF", 35).anchor(0, 0).to(node).pp(0.25, 0.0);
        // idLabel.setFontName("res/font/fzcy_s.TTF");
        // idLabel.setText("ID:");
        // idLabel.setFontSize(35);
        idLabel.setColor(cc.color(255, 255, 255));

        // var copyLabel = node.copyLabel = mputil.buildUnderlineLabel("复制").to(node).pp(1.75, 0.6);
        // copyLabel.setFontSize(32);
        var copyLabel = node.copyLabel = new FocusNode().anchor(0, 0).to(node).pp(0.65, 0.0);
        var copyImg = new cc.Sprite("#personal/font_copy.png");
        copyLabel.size(copyImg.getContentSize());
        copyImg.to(copyLabel).pp();
        copyLabel.bindTouch({
            swallowTouches: true,
            onTouchBegan: function () {
                native.setClipboard(mpGD.userInfo.gameID);
                ToastSystemInstance.buildToast("ID已经复制到剪切板中");
                return true;
            }
        })
        // copyLabel.addClickEventListener(function () {
        //     native.setClipboard(mpGD.userInfo.gameID);
        //     ToastSystemInstance.buildToast("ID已经复制到剪切板中");
        // });

        node.setScale(0.8);
        node.headIcon = headIcon;
        //-------------------------------------------------------------------------------------
        return node;
    },


    /**
     * 显示绑定账户 密码界面
     */
    showBindAccount: function () {

        var bindAccountLayer = new MPRegisterLayer(MPRegisterLayer.BindMode).to(this);

        var self = this;

        mpGD.mainScene.pushDefaultSelectArray(this.grzxLayer.node.editBtn);
        //当绑定成功时调用
        bindAccountLayer.bindSuccessCallback = function (nickname) {

            self.removeFromParent();

            mpApp.updateUserInfo({nickname: nickname, loginType: mpLoginType.Account});

            //删除游客ID
            mpGD.storage.delKey("guestID", true);

            new MPPersonalCenterLayer().to(cc.director.getRunningScene());
        };
    },


    //构建头像选择框
    buildHeadIconSelectBox: function (onSelect) {


        var self = this;

        var listView = new FocusListView().anchor(0.5, 0.5);


        listView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);


        listView.setContentSize(750, 200);
        listView.setItemsMargin(20);


        for (var i = 0; i < 10; i++) {

            var headIcon = ttutil.buildHeadIcon(i);

            headIcon.setTouchEnabled(true);
            headIcon.setScale(1);

            listView.pushBackCustomItem(headIcon);
            headIcon.mpIndex = i;

            headIcon.selectImage = new cc.Sprite("#personal/icon_xuanze.png").to(headIcon, 1).pp(0.9, 0.1).hide();
            headIcon.setSelect = (function () {
                this.selectImage.show();
                this.iconBox.display("#personal/female_bg.png");
                onSelect && onSelect(this.mpIndex);

            }).bind(headIcon);
            headIcon.setNormal = (function () {
                this.selectImage.hide();
                //this.iconBox.display("#personal/female_nor.png");
                //this.iconBox.display("#personal/female_nor.png");
            }).bind(headIcon);
            headIcon.setNormal();
            if (i == mpGD.userInfo.faceID) {
                headIcon.setSelect();

            }

            // TV 特殊处理 会触发两次
            headIcon.addClickEventListener(function (sender, type) {
                SoundEngine.playEffect(commonRes.btnClick);
                for (var i = 0, len = listView.getItems().length; i < len; ++i) {
                    listView.getItem(i).setNormal();
                }
                sender.setSelect();
            })
        }

        // TV 特殊处理 会触发两次
        listView.addEventListener(function (sender, type) {
            // TV 特殊处理 关闭触发
            if (FocusBase.useKeyboard) return;
            switch (type) {

                case  ccui.ListView.ON_SELECTED_ITEM_START:
                    SoundEngine.playEffect(commonRes.btnClick);
                    break;

                case ccui.ListView.ON_SELECTED_ITEM_END:

                    for (var i = 0, len = sender.getItems().length; i < len; ++i) {
                        sender.getItem(i).setNormal();
                    }

                    var item = sender.getItem(sender.getCurSelectedIndex());
                    if (item) {
                        item.setSelect();
                    }

                    break;
                default:
                    break;
            }
        });


        return listView;
    },

    //个人中心模块
    buildGRZXLayer: function () {

        var layer = new cc.Layer();
        layer.size(mpV.w, mpV.h);
        layer.mpTitleSpriteName = "#personal/title.png";
        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(layer).size(800, 420).pp(0.57, 0.48);


        var node = layer.node = this.buildUserInfoNode().to(bg).pp(0.1, 0.7);

        var self = this;
        layer.selectBoxListView = this.buildHeadIconSelectBox(function (faceID) {
            self.newFaceID = faceID;
            node.headIcon.icon.display(ttutil.getHeadIconName(faceID));
        }).to(bg).pp(0.5, 0.4);

        //个人中心
        this.grzxLayer = layer;
        return layer;
    },

    //提交个人中心修改的头像跟昵称
    submitGRZX: function () {


        //有改变才提交
        if (this.newFaceID != mpGD.userInfo.faceID || this.newNickname != mpGD.userInfo.nickname) {
            mpGD.netHelp.requestModifyUserInfo(this.newNickname, this.newFaceID);
            mpApp.showWaitLayer("正在提交数据,请耐心等候");
            return false;
        }
        return true;

    },


    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.ModifySetup:

                mpApp.removeWaitLayer();

                if (data.action == 1) {
                    if (!data.errMsg) {

                        mpApp.updateUserInfo({faceID: this.newFaceID, nickname: this.newNickname});
                        ToastSystemInstance.buildToast("您的个人信息修改成功。");
                    }

                    if (this.wantToClose) {
                        this.close();
                    }
                }
                else if (data.action == 2) {
                    if (!data.errMsg && data.success == true) {
                        ToastSystemInstance.buildToast("修改密码成功, 请牢记您的新密码");

                        this.oldPasswordEditBox.setString("");
                        this.newPasswordEditBox.setString("");
                        this.confirmNewPasswordEditBox.setString("");

                    }

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
                        this.zhaqLayer.wxItem.statusLabel.setString("已绑定");
                        this.zhaqLayer.wxItem.editBtn.setTitleText("解 绑");
                        this.zhaqLayer.wxItem.statusLabel.setColor(cc.color(0, 255, 0));
                        this.zhaqLayer.wxItem.editBtn.getTitleRenderer().pp(0.5, 0.6).qscale(0.8);
                    }
                }
                break;
            case mpNetEvent.SetMobileVerifyLevel:
                if (!data.errMsg) {
                    mpApp.updateUserInfo({mobileVerifyLevel: data.mobileVerifyLevel});
                }

                break;
            case mpNetEvent.WXWebLoginAddr:
                mpApp.removeWaitLayer();

                if (data.errMsg) {
                    return;
                }

                new WebViewLayer(data.url).to(this);
                break;
            case mpNetEvent.WXLoginCode:
                _webViewInstance && _webViewInstance.close();

                if (data.errMsg) {
                    return;
                }

                this.onWXCode(data.code, true);
                break;
        }
    },


    //修改密码模块
    buildXGMMLayer: function () {

        var layer = new cc.Layer();
        layer.size(mpV.w, mpV.h);
        layer.mpTitleSpriteName = "#safebox_title_setpwd1.png";
        var bg = new ccui.Scale9Sprite("common_input_box.png");
        bg.to(layer).size(750, 360).pp(0.5, 0.455);



        //原密码
        this.oldPasswordEditBox = mputil.buildEditBox("请输入旧密码", new cc.Sprite("res/img/font_7.png"), false, cc.size(500, 30)).to(bg).pp(0.6, 0.82);
        this.oldPasswordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this.oldPasswordEditBox.mpTip.pp(0.12, 0.55);
        this.oldPasswordEditBox.mpTip.setScale(0.9);
        this.oldPasswordEditBox.mpTip.setColor(cc.color(255, 255, 255));
        this.oldPasswordEditBox.mpBG.pp(0.3, 0.5);

        //新密码
        this.newPasswordEditBox = mputil.buildEditBox("请输入6-20位新密码", new cc.Sprite("res/img/font_4.png"), false, cc.size(500, 30)).to(bg).pp(0.6, 0.6);
        this.newPasswordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this.newPasswordEditBox.mpTip.pp(0.12, 0.55);
        this.newPasswordEditBox.mpTip.setScale(0.9);
        this.newPasswordEditBox.mpTip.setColor(cc.color(255, 255, 255));
        this.newPasswordEditBox.mpBG.pp(0.3, 0.5);


        //确认密码
        this.confirmNewPasswordEditBox = mputil.buildEditBox("请再输入一次新密码", new cc.Sprite("res/img/font_3.png"), false, cc.size(500, 30)).to(bg).pp(0.63, 0.38);
        this.confirmNewPasswordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this.confirmNewPasswordEditBox.mpTip.pp(0.143, 0.55);
        this.confirmNewPasswordEditBox.mpTip.setScale(0.9);
        this.confirmNewPasswordEditBox.mpTip.setColor(cc.color(255, 255, 255));
        this.confirmNewPasswordEditBox.mpBG.pp(0.25, 0.5);


        //确定按钮
        var sureButton = layer.sureButton = new FocusButton("common_btn_yes.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.5, 0.15);
        // sureButton.loadTextureNormal("res/gui/file/gui-cz-title-button.png");

        // sureButton.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // sureButton.setTitleText("确 定");
        // sureButton.getTitleRenderer().pp(0.5, 0.6);
        var self = this;
        sureButton.addTouchEventListener(function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {

                if (self.checkPassword(self.oldPasswordEditBox.getString(), self.newPasswordEditBox.getString(), self.confirmNewPasswordEditBox.getString())) {
                    mpGD.netHelp.requestModifyPassword(self.oldPasswordEditBox.getString(), self.newPasswordEditBox.getString());
                    mpApp.showWaitLayer("正在修改密码， 请等候");
                }
            }
        });


        //修改密码
        this.xgmmLayer = layer;

        return layer;
    },

    //检查密码是否合法， 不合法返回false
    checkPassword: function (oldPassword, newPassword, confirmNewPassword) {

        if (mputil.passwordIsLegal(oldPassword) && mputil.passwordIsLegal(newPassword) && mputil.passwordIsLegal(confirmNewPassword)) {

            if (newPassword != confirmNewPassword) {
                ToastSystemInstance.buildToast("两次密码不相等");
            }
            else {
                if (newPassword == oldPassword) {
                    ToastSystemInstance.buildToast("新旧密码不能相同");
                }
                else {
                    return true;
                }

            }
        }
        return false;
    },

    onWXCode: function (code, isWeb) {

        mpGD.netHelp.requestBindAccount(2, null, null, null, code, isWeb);

        mpApp.showWaitLayer("正在绑定微信, 请稍候..");
    },
    //账户 安全模块
    buildZHAQLayer: function () {
        var self = this;
        var layer = new cc.Layer();
        layer.size(mpV.w, mpV.h);
        layer.mpTitleSpriteName = "#accountSafe/title.png";
        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(layer).size(800, 420).pp(0.57, 0.455);


        //-----------------------------------------------------------------------------------------------------------------
        // layer.safeQuestionItem = this.buildZHAQItem("#gui-geren-icon-mima.png", mpGD.userInfo.question1 ? "已设置" : "未设置", "密码保护设置可用于找回登录密码/保险柜密码", function (zhaqItem) {
        //     mpGD.mainScene.pushDefaultSelectArray(layer.safeQuestionItem.editBtn);
        //     if (mpGD.userInfo.question1) {
        //         var mpSafeQuestionLayer = new MPSafeQuestionLayer(MPSafeQuestionLayer.VerifySafeQuestion, "您正在验证密保问题").to(cc.director.getRunningScene());
        //     }
        //     else {
        //         var temp = new MPSafeQuestionLayer(MPSafeQuestionLayer.SetSafeQuestion, "您正在设置密保问题").to(cc.director.getRunningScene());
        //
        //     }
        // }).to(layer).pp(0.5, 0.7).qscale(0.8);

        // //-----------------------------------------------------------------------------------------------------------------
        // layer.safeEmailItem = this.buildZHAQItem("#gui-geren-icon-youxiang.png", mpGD.userInfo.safeEmail ? "已设置" : "未设置", "邮箱保护设置可用于找回登录密码/保险柜密码", function (zhaqItem) {
        //     cc.log("安全邮箱");
        //     ToastSystemInstance.buildToast("安全邮箱暂时未实现");
        //     // if (mpGD.userInfo.safeEmail) {
        //     //     new MPSafeQuestionLayer(MPSafeQuestionLayer.ModifySafeQuestion).to(cc.director.getRunningScene());
        //     // }
        //     // else {
        //     //     new MPSafeQuestionLayer(MPSafeQuestionLayer.SetSafeQuestion).to(cc.director.getRunningScene());
        //     // }
        // }).to(layer).pp(0.5, 0.5);

        layer.wxItem = this.buildZHAQItem("#gui-geren-icon-weixin.png", mpGD.userInfo.hasWeiXin ? "已绑定" : "未绑定", "绑定微信可用于微信登录", function (zhaqItem) {


            //解绑微信
            if (mpGD.userInfo.hasWeiXin) {

                new MPMessageBoxLayer("通知", "您确定要解绑微信吗", mpMSGTYPE.MB_OKCANCEL, function () {
                    mpGD.netHelp.requestBindAccount(-2, null, null, null, null);
                    mpApp.showWaitLayer("正在解绑微信, 请稍候..");
                }, function () {
                }).to(cc.director.getRunningScene());
            }
            else {

                if(!cc.sys.isNative)
                {
                    ToastSystemInstance.buildToast("网页版本暂不支持此功能！");
                    return;
                }

                if (native.isWXAppInstalled()) {
                    native.wxLogin(G_WX_APPID, Math.random(), self.onWXCode.bind(self));
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
            }

        }).to(bg).pp(0.5, 0.75).hide();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        layer.safeMobileItem = this.buildZHAQItem("#gui-geren-icon-shouji.png", mpGD.userInfo.hasMobile ? "已绑定" : "未绑定", "绑定手机可用于登录验证", function (zhaqItem) {
            mpGD.mainScene.pushDefaultSelectArray(layer.safeMobileItem.editBtn);
            if (mpGD.userInfo.hasMobile) {
                if (mpGD.userInfo.realname) {
                    ToastSystemInstance.buildToast("现已支持相同手机号码绑定多个账号，不再提供解绑服务。");
                    return;
                }

                new MPSafeMobileLayer(MPSafeMobileLayer.UnBindSafeMobile).to(cc.director.getRunningScene());
            }
            else {
                new MPSafeMobileLayer(MPSafeMobileLayer.SetSafeMobile).to(cc.director.getRunningScene());
            }


        }).to(bg).pp(0.5, 0.5)

        // layer.safeMobileItem.hint.pp(0.407, 0.2);
        var hint = new cc.LabelTTF("登录验证级别:", GFontDef.fontName, 20).to(layer.safeMobileItem).anchor(0, 0.5).pp(0.32, 0.42);
        hint.setColor(cc.color(205, 91, 69));

        var buildCheckBox = function (hint) {

            var node = new cc.Node();
            var hint = new cc.LabelTTF(hint, GFontDef.fontName, 20);
            hint.setColor(cc.color(205, 91, 69));

            var checkBox = node.checkBox = new FocusCheckBox("res/gui/login/radioEmpty.png", "res/gui/login/radio.png");
            checkBox.ignoreContentAdaptWithSize(false);
            checkBox.size(45, 45);
            node.size(hint.width + checkBox.width + 20, checkBox.height + 5);
            hint.to(node).anchor(0, 0.5).pp(0, 0.5);
            checkBox.to(node).p(hint.width + checkBox.width - 20, hint.y);
            return node;
        };
        var checkBoxArray = layer.checkBoxArray = [];
        checkBoxArray.push(buildCheckBox("从不验证:").qscale(0.8).to(layer.safeMobileItem).pp(0.32, 0.1));
        checkBoxArray.push(buildCheckBox("首次验证:").qscale(0.8).to(layer.safeMobileItem).pp(0.47, 0.1));
        checkBoxArray.push(buildCheckBox("每次验证:").qscale(0.8).to(layer.safeMobileItem).pp(0.62, 0.1));


        var onRadioClick = (sender, type) => {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                //3.15变成 先调用  onRadioClick后， 再处理自身的点击逻辑， 所以要让一个checkBox为selected, 这边就先设置为false, 等他内部再处理成true
                sender.setSelected(false);
                for (var i = 0; i < checkBoxArray.length; ++i) {
                    if (checkBoxArray[i].checkBox != sender) {
                        checkBoxArray[i].checkBox.setSelected(false);
                    }
                    else {
                        if (!mpGD.userInfo.hasMobile) {
                            ToastSystemInstance.buildToast("请先绑定手机");
                        }
                        else {
                            mpGD.netHelp.requestSetMobileVerifyLevel(i);
                        }
                    }
                }
            }
        };

        for (var i = 0; i < checkBoxArray.length; ++i) {
            checkBoxArray[i].checkBox.setSelected(false);
            // checkBoxArray[i].checkBox.addClickEventListener(onRadioClick);
            checkBoxArray[i].checkBox.addTouchEventListener(onRadioClick);
        }
        checkBoxArray[mpGD.userInfo.mobileVerifyLevel].checkBox.setSelected(true);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // var item = layer.safeQuestionItem;

        //没安装微信就跳网页
        if (G_APPLE_EXAMINE && !native.isWXAppInstalled()) {
            layer.wxItem.hide();
            layer.safeMobileItem.pp(0.5, 0.5);
        }

        //账户安全
        this.zhaqLayer = layer;

        return layer;
    },

    //账户 安全 ITEM
    buildZHAQItem: function (iconPath, status, hint, callback) {
        var node = new ccui.Scale9Sprite();
        node.initWithSpriteFrameName("gui-gonggao-cell-bg.png");
        node.size(750, 150);

        var iconPath = new cc.Sprite(iconPath).to(node).pp(0.1, 0.5);
        var statusLabel = new cc.LabelTTF(status, GFontDef.fontName, 20).to(node).pp(0.22, 0.5);


        var hint = new cc.LabelTTF(hint, GFontDef.fontName, 20).to(node).pp(0.5, 0.85);
        hint.setColor(cc.color(205, 91, 69));


        //编辑按钮
        var editBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(node).pp(0.85, 0.5).qscale(0.8);
        editBtn.setTitleFontSize(50);
        editBtn.addTouchEventListener(function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                callback && callback(node);
                sender.getTitleRenderer().qscale(sender.labelScale);
            }
            else if (type == ccui.Widget.TOUCH_CANCELED) {
                sender.getTitleRenderer().qscale(sender.labelScale);
            }
        });
        editBtn.labelScale = 1;
        editBtn.setTitleFontName("res/font/fzcy_s.TTF");
        if (status == "已设置") {
            statusLabel.setColor(cc.color(0, 255, 0));
            editBtn.setTitleText("修改");
            editBtn.getTitleRenderer().pp(0.5, 0.55);
        }
        else if (status == "未设置") {
            statusLabel.setColor(cc.color(255, 0, 0));
            editBtn.setTitleText("设置");
            editBtn.getTitleRenderer().pp(0.5, 0.55);
        }
        else if (status == "已绑定") {
            statusLabel.setColor(cc.color(0, 255, 0));
            editBtn.setTitleText("解 绑");
            editBtn.getTitleRenderer().pp(0.5, 0.6).qscale(0.8);
            editBtn.labelScale = 0.8;
        }
        else if (status == "未绑定") {
            statusLabel.setColor(cc.color(255, 0, 0));
            editBtn.setTitleText("绑 定");
            editBtn.getTitleRenderer().pp(0.5, 0.6).qscale(0.8);
            editBtn.labelScale = 0.8;
        }


        node.statusLabel = statusLabel;
        node.editBtn = editBtn;
        node.hint = hint;


        return node;
    },


    //创建底部 个人中心、修改密码、账户安全
    buildTabButton: function () {


        // listView.showHelp();

        // var selectEffect = new cc.Sprite("#gui-hall-select.png").to(this);
        // selectEffect.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.3, 1.2), cc.scaleTo(0.3, 1.1))));


        // var effect = new ccs.Armature("2jijiemiantexiao_dating");
        // effect.getAnimation().play("Animation2");
        // effect.to(this);

        var self = this;
        var buttonArray = this.buttonArray = [];
        var nowSelectBtn = null;
        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {

                if (nowSelectBtn != sender) {
                    for (var i in buttonArray) {
                        buttonArray[i].loadTextureNormal(sender.mpNor, ccui.Widget.PLIST_TEXTURE);
                        buttonArray[i].mpSprite.display(buttonArray[i].mpNor);
                        //self.layerArray[i].doExit();
                    }
                    sender.loadTextureNormal(sender.mpPre, ccui.Widget.PLIST_TEXTURE);
                    sender.mpSprite.display(sender.mpPre);
                    // selectEffect.exto(sender, -1).pp();
                    sender.mpCallback && sender.mpCallback();
                    self.layerArray[sender.mpIndex].doEnter();
                    nowSelectBtn = sender;
                    self.refreshFocus(sender.mpIndex)
                }

            }
        };

        var touchEventListener1 = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                ToastSystemInstance.buildToast("请先绑定账号");
            }
        }


        var createButton = function (nor, pre, index) {
            var button = new FocusButton();

            button.loadTextureNormal(nor, ccui.Widget.PLIST_TEXTURE);
            button.setCapInsets(cc.rect(13, 15, 200, 60));
            button.setScale9Enabled(true);
            button.size(150, 70);
            button.mpSprite = new cc.Sprite().to(button, 1).pp(0.5, 0.5);
            button.mpNor = nor;
            button.mpPre = pre;
            
            if (mpGD.userInfo.hasAccount || index == 0) {
                button.addTouchEventListener(touchEventListener);
            }
            else {
                button.addTouchEventListener(touchEventListener1);
            }
            button.mpIndex = index;
            return button;
        };



        // var grzx = createButton("#font_geren_nor.png", "#font_geren_sel.png", 0).to(this).pp(0.19, 0.63);
        var xgmm = createButton("res/activity/txt_dt_yh_btn8.png", "res/activity/txt_dt_yh_btn7.png", 0).to(this).pp(0.19, 0.5).qscale(0.7);
        var zhaq = createButton("#font_anquan_nor.png", "#font_anquan_sel.png", 1).to(this).pp(0.19, 0.37);

        zhaq.setVisible(false);
        // buttonArray.push(grzx);
        buttonArray.push(xgmm);
        buttonArray.push(zhaq);


        //模拟一次点击， 让个人界面显示出来
        touchEventListener(this.panelType == 0 ? xgmm : zhaq, ccui.Widget.TOUCH_ENDED);
    },

    // build


});