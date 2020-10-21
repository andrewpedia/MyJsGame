/**
 * Created by Apple on 2016/6/17.
 */

var _bankLayerInstance = null;

/**
 * 保险柜界面
 */
var MPBankLayer = MPBaseModuleLayer.extend({

    titleSprite: null,

    bgMusicLabel: null,             //背景音乐文字
    effectLabel: null,              //音效文字


    bankModule: null,               //保险柜模块
    walletModule: null,             //钱包模块

    bankGoldNode: null,             //打赏界面里的保险柜钱数

    rebateGoldNode: null,                //打赏界面里的返利点数

    oldTwoPassword: null,               //旧二级密码
    newTwoPassword: null,               //新二级密码
    confirmTwoPassword: null,           //确认二级密码

    passwordType: null,

    layerArray: null,

    mxListView: null,               //明细模块中的listView

    layerIndex: 0,

    _className: "MPBankLayer",
    _classPath: "src/main/module/MPBankLayer.js",

    initEx: function () {
        this._super(cc.size(1000, 500));

        _bankLayerInstance = this;

        // this.titleBG.showHelp()
        this.titleSprite = new cc.Sprite("#BankUI/font_title.png").to(this.titleBG).pp(0.5, 0.7).qscale(0.7);

        // this.setMoneyString(mpGD.userInfo.score);

        this.layerArray = [];

        this.layerArray.push(this.buildZCLayer().to(this).hide());   //资产模块
        G_OPEN_RED_PACKET && this.layerArray.push(this.buildHBLayer().to(this).hide());   //红包模块
        G_OPEN_ZHUAN_ZHANG && this.layerArray.push(this.buildZZLayer().to(this).hide());   //打赏模块
        this.layerArray.push(this.buildMMLayer().to(this).hide());   //密码模块
        this.layerArray.push(this.buildMXLayer().to(this).hide());   //明细模块

        var self = this;
        //绑定入场动画
        for (var i = 0; i < this.layerArray.length; ++i) {

            let index = i;

            this.layerArray[i].doEnter = (function () {

                self.layerIndex = index;

                this.show();
                // self.titleBG.display(this.mpTitleBackgroundName);
                self.titleSprite.display(this.mpTitleSpriteName);
                self.titleSprite.pp(this.mpTitleSpritePos);
                self.titleSprite.setScale(1.2);
                // this.p(mpV.w + 100, 0);
                // this.runAction(cc.moveTo(0.2, 0, 0).easing(cc.easeBackOut()));

                switch (this.mpTitleSpriteName) {
                    case "#BankUI/font_mingxi.png":
                        self.requestMXData();
                        break;
                }

            }).bind(this.layerArray[i]);
            this.layerArray[i].doExit = (function () {
                this.hide();
            }).bind(this.layerArray[i]);
        }

        this.tabButton = this.buildTabButton();
    },

    cleanup: function () {
        this._super();

        _bankLayerInstance = null;
    },

    initTV: function () {
        this._super();
        // for(var i = 0;i < this.tabButton.length; i++){
        //     this.tabButton[i].setNextFocus(null, null, i==0?null:this.tabButton[i-1], i==this.tabButton.length - 1?null:this.tabButton[i+1]);
        //     this.tabButton[i].setFingerZoder(1);
        // }
        this.refreshFocus();
    },

    refreshFocus: function () {
        if (!G_PLATFORM_TV) return;

        for (var i = 0; i < this.layerArray.length; i++) {
            var item = this.layerArray[i];
            if (item.isVisible()) {
                var upItem = this.backBtn;
                switch (i) {
                    case 0:
                    case 1:
                        var tabBtnIndex = i;
                        cc.director.getRunningScene().setDoubleClickCallback(null);
                        this.backBtn.setNextFocus(null, item.walletModule.button, null, item.walletModule.button);
                        item.walletModule.button.setNextFocus(this.backBtn, this.tabButton[tabBtnIndex], this.backBtn, item.bankModule.button);
                        item.bankModule.button.setNextFocus(this.backBtn, this.tabButton[tabBtnIndex], item.walletModule.button, null);
                        upItem = item.walletModule.button;
                        break;

                    case G_OPEN_ZHUAN_ZHANG ? 2 : -1:
                        var tabBtnIndex = G_OPEN_ZHUAN_ZHANG ? 2 : -1;
                        cc.director.getRunningScene().setDoubleClickCallback(null);
                        this.backBtn.setNextFocus(null, this.toUserEditBox, null, this.toUserEditBox);
                        this.toUserEditBox.setNextFocus(this.backBtn, this.moneyEditBox, this.backBtn, mpGD.userInfo.memberOrder == 9 ? this.takeRebateBtn : null);
                        this.moneyEditBox.setNextFocus(this.toUserEditBox, this.btnArray[0], null, mpGD.userInfo.memberOrder == 9 ? this.takeRebateBtn : null);
                        if (mpGD.userInfo.memberOrder == 9) {
                            this.takeRebateBtn.setNextFocus(null, null, this.toUserEditBox, null);
                        }
                        var btnArray = this.btnArray;
                        for (var i = 0; i < btnArray.length; i++) {
                            btnArray[i].setNextFocus(this.moneyEditBox, this.zzsureBtn, i == 0 ? null : this.btnArray[i - 1], i == btnArray.length - 1 ? this.chearMoneyLabel : btnArray[i + 1]);
                        }
                        this.chearMoneyLabel.setNextFocus(null, this.underlineLabel, btnArray[3], null);
                        this.underlineLabel.setNextFocus(this.chearMoneyLabel, null, this.zzsureBtn, null);
                        this.zzsureBtn.setNextFocus(btnArray[0], this.tabButton[tabBtnIndex], null, this.underlineLabel);
                        upItem = this.zzsureBtn;
                        break;

                    case G_OPEN_ZHUAN_ZHANG ? 3 : 2:
                        var tabBtnIndex = G_OPEN_ZHUAN_ZHANG ? 3 : 2;
                        if (this.passwordType === mpPasswordType.Plaintext) {
                            mpGD.mainScene.setDoubleClickCallback(null);
                            // mpGD.mainScene.setFocusSelected(this.plaintextPasswordLabel);
                            this.backBtn.setNextFocus(null, this.newTwoPassword, null, this.newTwoPassword);
                            this.newTwoPassword.setNextFocus(this.backBtn, this.confirmTwoPassword, null, null);
                            this.confirmTwoPassword.setNextFocus(this.newTwoPassword, this.mmsureBtn, null, null);
                            this.mmsureBtn.setNextFocus(this.confirmTwoPassword, this.tabButton[tabBtnIndex], null, this.plaintextPasswordLabel);
                            this.plaintextPasswordLabel.setNextFocus(null, null, this.mmsureBtn, null);
                            upItem = this.mmsureBtn;
                        } else if (this.passwordType === mpPasswordType.Graphical) {
                            cc.director.getRunningScene().setDoubleClickCallback(this.submitGraphicalPassword.bind(this));

                            // mpGD.mainScene.setFocusSelected(this.graphicalPasswordLabel);
                            var dotArray = this.pattern.originDotInfoArray;

                            dotArray[0].node.setNextFocus(this.backBtn, dotArray[3].node, null, dotArray[1].node);
                            dotArray[1].node.setNextFocus(this.backBtn, dotArray[4].node, dotArray[0].node, dotArray[2].node);
                            dotArray[2].node.setNextFocus(this.backBtn, dotArray[5].node, dotArray[1].node, null);
                            dotArray[3].node.setNextFocus(dotArray[0].node, dotArray[6].node, null, dotArray[4].node);
                            dotArray[4].node.setNextFocus(dotArray[1].node, dotArray[7].node, dotArray[3].node, dotArray[5].node);
                            dotArray[5].node.setNextFocus(dotArray[2].node, dotArray[8].node, dotArray[4].node, null);
                            dotArray[6].node.setNextFocus(dotArray[3].node, this.tabButton[tabBtnIndex], null, dotArray[7].node);
                            dotArray[7].node.setNextFocus(dotArray[4].node, this.tabButton[tabBtnIndex], dotArray[6].node, dotArray[8].node);
                            dotArray[8].node.setNextFocus(dotArray[5].node, this.tabButton[tabBtnIndex], dotArray[7].node, this.graphicalPasswordLabel);

                            this.backBtn.setNextFocus(null, dotArray[0].node, null, dotArray[0].node);
                            this.graphicalPasswordLabel.setNextFocus(null, this.tabButton[tabBtnIndex], dotArray[8].node, null);
                            upItem = dotArray[8].node;
                        }
                        break;

                    case G_OPEN_ZHUAN_ZHANG ? 4 : 3:
                        var tabBtnIndex = G_OPEN_ZHUAN_ZHANG ? 4 : 3;
                        cc.director.getRunningScene().setDoubleClickCallback(null);
                        var items = this.mxListView.getItems();

                        this.backBtn.setNextFocus(null, items.length == 0 ? this.tabButton[tabBtnIndex] : items[0], null, items.length == 0 ? this.tabButton[tabBtnIndex] : items[0]);
                        for (var i = 0; i < items.length; i++) {
                            items[i].setNextFocus(i == 0 ? this.backBtn : items[i - 1], i == items.length - 1 ? this.tabButton[tabBtnIndex] : items[i + 1], this.backBtn, this.tabButton[tabBtnIndex]);
                        }
                        upItem = items.length == 0 ? this.backBtn : items[items.length - 1];
                        break;

                    default:
                        break;
                }
                for (var z = 0; z < this.tabButton.length; z++) {
                    for (var i = 0; i < this.tabButton.length; i++) {
                        this.tabButton[i].setNextFocus(upItem, null, i == 0 ? null : this.tabButton[i - 1], i == this.tabButton.length - 1 ? null : this.tabButton[i + 1]);
                        this.tabButton[i].setFingerZoder(1);
                    }
                }
            }
        }
    },

    //创建返利的图标
    buildRebateGoldNode: function () {
        var node = new cc.Node().size(300, 64);
        var goldBox = new cc.Sprite("#gui-gm-gold-box.png").to(node).pp(0.5, 0.5);
        var goldIcon = new cc.Sprite("#gui-cz-icon-5.png").to(node).pp(0, 0.5).qscale(0.5);
        //
        // var hintText = new cc.LabelTTF("返利金额", GFontDef.fontName, 20).to(node).pp(0.8, 0.5);
        // hintText.setColor(cc.color(231, 208, 124));

        var goldLabel = new cc.LabelBMFont(ttutil.formatMoney(mpGD.userInfo.unRecvRebate || "0"), "res/font/zhs-yahei-orange-20.fnt").to(node).pp(0.2, 0.5).anchor(0, 0.5);
        node.setMoneyString = (text) => {
            goldLabel.setString(text);
        };

        return node;
    },

    //保险柜里的钱
    buildBankGoldNode: function () {

        var node = new cc.Node().size(300, 64);
        var goldBox = new cc.Sprite("#gui-gm-gold-box.png").to(node).pp(0.5, 0.5);
        var goldIcon = new cc.Sprite("#gui-bank-baoxianx.png").to(node).pp(0, 0.5);


        var goldLabel = new cc.LabelBMFont(ttutil.formatMoney(mpGD.userInfo.bankScore || "0"), "res/font/zhs-yahei-orange-20.fnt").to(node).pp(0.2, 0.5).anchor(0, 0.5);

        node.setMoneyString = (text) => {
            goldLabel.setString(text);
        };
        return node;
    },

    // ---------------------------------------
    //                 转账模块
    // ---------------------------------------
    // 创建转账页面
    buildZZLayer: function () {

        var self = this;
        var layer = new cc.Layer();
        layer.size(mpV.w, mpV.h);
        layer.mpTitleSpriteName = "#BankUI/font_zhuanzhang.png";
        layer.mpTitleSpritePos = cc.p(0.5, 0.6);

        layer.bg = new ccui.Scale9Sprite();
        layer.bg.initWithSpriteFrameName("frame_bg.png");
        layer.bg.size(900, 400).to(layer).pp(0.5, 0.45);


        //tax
        var tax = mpGD.vipConfig[mpGD.userInfo.memberOrder].tax;

        //接收人
        this.toUserEditBox = mputil.buildEditBox(" 输入ID   转账收取" + (tax * 100) + "%手续费", "接收人", cc.EDITBOX_INPUT_MODE_NUMERIC).to(layer.bg).pp(0.5, 0.72);
        this.toUserEditBox.setMaxLength(10);
        // this.toUserEditBox.setPlaceholderFontSize(29);
        this.toUserEditBox.setDelegate(this);
        // this.toUserEditBox._delegate = this;
        var label = this.toUserEditLable = new cc.LabelTTF("", GFontDef.fontName, 24).to(this.toUserEditBox).pp(0.7, 0.5);
        label.setColor(cc.color(255, 255, 255));

        //打赏金额
        this.moneyEditBox = mputil.buildEditBox(" 请输入打赏金额", "转账金额", cc.EDITBOX_INPUT_MODE_NUMERIC).to(layer.bg).pp(0.5, 0.59);
        // this.moneyEditBox.setPlaceholderFontSize(29);

        this.taxMoney = new cc.LabelTTF("手续费:0", GFontDef.fontName, 24).to(this.moneyEditBox).anchor(0, 0.5).pp(0.45, 0.5);
        this.taxMoney.setColor(cc.color(231, 208, 124));
        this.moneyEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        //大写金额
        this.capitalMoney = new cc.LabelTTF("", GFontDef.fontName, 24).to(this.moneyEditBox, 1).anchor(0.5, 0.5).pp(0.4, -1.2);
        this.capitalMoney.setColor(cc.color(231, 208, 124));

        var calcTaxMoney = function (money) {
            self.taxMoney.setString("手续费:" + ttutil.formatMoney(Math.floor(Number(money) * tax)) + "");
        };

        this.moneyEditBox.setDelegate({
            editBoxEditingDidEnd: function (editBox) {

                var money = Number(editBox.getString());
                if (money > mpGD.userInfo.bankScore) {
                    money = mpGD.userInfo.bankScore;
                    editBox.setString(money);
                }

                self.capitalMoney.setString(ttutil.convertMoneyToCapitals(money));
                if (money == 0) {
                    self.capitalMoney.hide();
                }
                else {
                    self.capitalMoney.show();
                }


                calcTaxMoney(money);
            }
        });

        this.bankGoldNode = this.buildBankGoldNode().to(layer).p(mpV.w /2, mpV.h - 280);

        ////-----------------------------------------------------------------------------------------------------------------------
        //会员9才看得到
        if (mpGD.userInfo.memberOrder == 9) {

            this.rebateGoldNode = this.buildRebateGoldNode().to(layer).p(mpV.w - 300, mpV.h - 290);
            //领取返利的按钮
            var takeRebateBtn = this.takeRebateBtn = new FocusButton("res/gui/file/gui-cz-title-button-select.png", "", "", ccui.Widget.PLIST_TEXTURE).to(layer).p(mpV.w - 150, mpV.h - 315);

            takeRebateBtn.setTitleText("点击领取返利");
            takeRebateBtn.setTitleFontSize(24);
            takeRebateBtn.getTitleRenderer().pp(0.5, 0.5);
            takeRebateBtn.setTitleColor(cc.color(255, 248, 44));

            takeRebateBtn.addTouchEventListener(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    SoundEngine.playEffect(commonRes.btnClick);
                } else if (type == ccui.Widget.TOUCH_ENDED) {

                    mpGD.netHelp.requestGetRebate();
                    mpApp.showWaitLayer("正在请求领取返利");
                    cc.log("点击领取返利");
                }
            });
        }


        ////-----------------------------------------------------------------------------------------------------------------------

        //+10w， +100w， +1000w， +1亿按钮
        //--------------------------------------------------------------------------------------------------------------------
        var self = this;
        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {


                //给打赏金额框加钱钱
                var str = self.moneyEditBox.getString();
                var num = Number(str) || 0;
                self.moneyEditBox.setString(sender.mpMoney + num);
                calcTaxMoney(self.moneyEditBox.getString());

                var money = sender.mpMoney + num;
                self.capitalMoney.setString(ttutil.convertMoneyToCapitals(money));
                if (money == 0) {
                    self.capitalMoney.hide();
                }
                else {
                    self.capitalMoney.show();
                }

            }
        };

        var createButton = function (nor, money,text) {
            var button = new FocusButton();
            button.loadTextureNormal(nor, ccui.Widget.LOCAL_TEXTURE);
            button.addTouchEventListener(touchEventListener);
            button.setTitleText(text);
            button.setTitleFontSize(20);
            //button.setTitleColor(cc.color(255, 248, 44));
            button.mpMoney = money;
            return button;
        };


        var btnArray = this.btnArray = [];
		btnArray.push(createButton("res/zhuanBg.png", 10,"+10元"));
        btnArray.push(createButton("res/zhuanBg.png", 100,"+100元"));
        btnArray.push(createButton("res/zhuanBg.png", 500,"+500元"));
        btnArray.push(createButton("res/zhuanBg.png", 1000,"+1000元"));
        btnArray.push(createButton("res/zhuanBg.png", 10000,"+1万元"));

        for (var i = 0; i < btnArray.length; ++i) {
            btnArray[i].to(layer).pp(0.27 + 0.12 * i, 0.39);
        }

        //--------------------------------------------------------------------------------------------------------------------


        //确定按钮
        var sureBtn = this.zzsureBtn = new FocusButton("BankUI/btn_sure.png", "", "", ccui.Widget.PLIST_TEXTURE).to(layer).pp(0.5, 0.26);
        // sureBtn.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // sureBtn.setTitleText("确 定");
        // sureBtn.getTitleRenderer().pp(0.5, 0.55);
        sureBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {

                // if(self.toUserEditBox)
                if (self.moneyEditBox.getString() > 0) {

                    if (self.moneyEditBox.getString() > mpGD.userInfo.bankScore) {
                        ToastSystemInstance.buildToast("您保险柜钱不够");
                        return;
                    }

                    if (mputil.gameIDIsLegal(self.toUserEditBox.getString())) {
                        //mpApp.showWaitLayer("正在请求转账");
                        //mpGD.netHelp.requestTransferMoney(self.toUserEditBox.getString(), self.moneyEditBox.getString());
						//弹出转账确认对话框
						var message="接收人："+self.toUserEditBox.getString()+"\n接收人昵称："+self.toUserEditLable.getString()+"\n转账金额："+ttutil.formatMoney(self.moneyEditBox.getString())+"("+ttutil.convertMoneyToCapitals(self.moneyEditBox.getString())+")";
                       
                        new MPMessageBoxLayer("转账确认",message, mpMSGTYPE.MB_OKCANCEL,function (){
                            mpGD.netHelp.requestTransferMoney(self.toUserEditBox.getString(), self.moneyEditBox.getString())}
                            ,null).to(cc.director.getRunningScene());;
                    }

                }
                else {
                    ToastSystemInstance.buildToast("转账金额不合法");
                }


            }
        });

        var underlineLabel = this.underlineLabel = new cc.Sprite("#BankUI/font_jilu.png").to(layer).pp(0.75, 0.25);//mputil.buildUnderlineLabel("打赏记录").to(layer).pp(0.8, 0.3);
        underlineLabel.bindTouch({
            swallowTouches: true,
            onTouchBegan: function () {
                mpGD.mainScene.pushDefaultSelectArray(underlineLabel);
                new MPBankTransferRecordLayer().to(cc.director.getRunningScene());
            },
        });
        // underlineLabel.addClickEventListener(function () {
        //     mpGD.mainScene.pushDefaultSelectArray(underlineLabel);
        //     new MPBankTransferRecordLayer().to(cc.director.getRunningScene());
        // });

        var chearMoneyLabel = this.chearMoneyLabel = new cc.Sprite("#BankUI/font_qingchu.png").to(layer).pp(0.75, 0.5);//mputil.buildUnderlineLabel("清除").to(layer).pp(0.8, 0.45);
        chearMoneyLabel.bindTouch({
            swallowTouches: true,
            onTouchBegan: function () {
                self.moneyEditBox.setString(0);
                self.taxMoney.setString("手续费:0");
            },
        });
        // chearMoneyLabel.addClickEventListener(function () {
        //     self.moneyEditBox.setString(0);
        //     self.taxMoney.setString("手续费:0");
        // });
        self.moneyEditBox.setString(0);

        return layer;
    },

    editBoxReturn: function () {
        if (this.toUserEditBox.getString() == this.toUserEditBox.lastValue) {
            this.toUserEditBox.lastValue = this.toUserEditBox.getString();
            return;
        }
        //if (this.toUserEditBox.getString().length == 8) {
        if (this.toUserEditBox.getString().length >0) {
            mpGD.netHelp.requestBusinessUN(this.toUserEditBox.getString());
        }
        else if (this.toUserEditBox.getString().length == 0) {
            this.toUserEditLable.setString("");
        }
//        else {
//            this.toUserEditLable.setString("用户不存在");
//        }
    },

    editBoxEditingDidEnded: function () {
        if (this.toUserEditBox.getString() == this.toUserEditBox.lastValue) {
            this.toUserEditBox.lastValue = this.toUserEditBox.getString();
            return;
        }
        //if (this.toUserEditBox.getString().length == 8) {
        if (this.toUserEditBox.getString().length >0) {
            mpGD.netHelp.requestBusinessUN(this.toUserEditBox.getString());
        } else {
            this.toUserEditLable.setString("用户不存在");
        }
    },

    // ---------------------------------------
    //                 密码模块
    // ---------------------------------------
    // 创建密码页面
    buildMMLayer: function () {
        var layer = new cc.Layer().size(mpV.w, mpV.h);
        layer.mpTitleBackgroundName = "#gui-gm-bt-bj-da.png";
        layer.mpTitleSpriteName = "#BankUI/font_titlemima.png";
        layer.mpTitleSpritePos = cc.p(0.5, 0.6);

        layer.bg = new ccui.Scale9Sprite();
        layer.bg.initWithSpriteFrameName("frame_bg.png");
        layer.bg.size(900, 400).to(layer).pp(0.5, 0.45);

        this.initPlaintextPasswordLayer(layer);
        this.initGraphicalPasswordLayer(layer);

        this.switchPasswordType(mpPasswordType.Plaintext);

        this.hintString = "";
        if (G_PLATFORM_TV) {
            this.hintString = "(双击“OK”键完成绘制)";
        }

        return layer;
    },

    // 初始化纯文本密码层
    initPlaintextPasswordLayer: function (layer) {

        this.hint = new cc.LabelTTF("温馨提示：为确保您的保险柜账户安全，请正确输入密码！", GFontDef.fontName, 24).to(layer.bg).pp(0.5, 0.9);
        this.hint.setColor(cc.color(231, 208, 124));

        // //原保险柜密码
        // this.oldTwoPassword = mputil.buildEditBox("请输入原保险柜密码", "保险柜原密码").to(layer).pp(0.55, 0.75);
        // this.oldTwoPassword.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        //保险柜新密码
        this.newTwoPassword = mputil.buildEditBox("请输入6-20位新密码", "新 密 码").to(layer.bg).pp(0.55, 0.65);
        this.newTwoPassword.setScale(1.2);
        this.newTwoPassword.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        //确认密码
        this.confirmTwoPassword = mputil.buildEditBox("请再输入一次新密码", "确认密码").to(layer.bg).pp(0.55, 0.45);
        this.confirmTwoPassword.setScale(1.2);
        this.confirmTwoPassword.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);

        // this.plaintextPasswordLabel = mputil.buildUnderlineLabel("图形密码").to(layer).pp(0.8, 0.3);
        this.plaintextPasswordLabel = mputil.buildUnderlineLabel("").to(layer).pp(0.8, 0.3);
        this.plaintextPasswordLabel.addClickEventListener(() => {
            return;
            // if (G_PLATFORM_TV) {
            //     ToastSystemInstance.buildToast({text: "TV版不支持图形密码设置，请到手机端尝试！"});
            //     return;
            // }
            // mpGD.mainScene.setFocusSelected(this.graphicalPasswordLabel);
            // this.switchPasswordType(mpPasswordType.Graphical);
            // this.refreshFocus();
        });

        //确定按钮
        var sureBtn = this.mmsureBtn = new FocusButton("BankUI/btn_sure.png", "", "", ccui.Widget.PLIST_TEXTURE).to(layer.bg).pp(0.5, 0.25);
        // sureBtn.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // sureBtn.setTitleText("确  定");
        // sureBtn.getTitleRenderer().pp(0.5, 0.55);

        var self = this;
        sureBtn.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    SoundEngine.playEffect(commonRes.btnClick);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    self.submitModifyTwoPassword();
                    break;
                default:
                    break;
            }
        });
    },

    // 提交修改二级密码请求
    submitModifyTwoPassword: function () {
        if (mputil.passwordIsLegal(mpGD.userInfo.twoPassword) && mputil.passwordIsLegal(this.newTwoPassword.getString()) && mputil.passwordIsLegal(this.confirmTwoPassword.getString())) {

            if (this.newTwoPassword.getString() != this.confirmTwoPassword.getString()) {
                ToastSystemInstance.buildToast("两次密码不一样");
                return false;
            }
            if (this.newTwoPassword.getString() == mpGD.userInfo.twoPassword) {
                ToastSystemInstance.buildToast("新旧密码一样");
                return false;
            }

            this.twoPassword = this.newTwoPassword.getString();

            mpGD.netHelp.requestModifyTwoPassword(mpGD.userInfo.twoPassword, this.newTwoPassword.getString(), mpPasswordType.Plaintext);
            mpApp.showWaitLayer("正在请求修改保险柜密码, 请稍候");
        }
    },

    // 初始化图形密码层
    initGraphicalPasswordLayer: function (layer) {
        this.graphicalPasswordLabel = mputil.buildUnderlineLabel("纯文本密码").to(layer).pp(0.8, 0.3);
        this.graphicalPasswordLabel.addClickEventListener(() => {
            mpGD.mainScene.setFocusSelected(this.plaintextPasswordLabel);
            this.switchPasswordType(mpPasswordType.Plaintext);
            this.refreshFocus();
        });

        this.pattern = new MPPatternFrame().to(layer).pp(0.5, 0.48);
        this.pattern.setTouchEventBeganCallback(() => {
            this.hint.setString("温馨提示：完成后松开手指即可。");
        });
        this.pattern.setTouchEventEndedCallback(() => {
            this.submitGraphicalPassword();
        });
    },

    submitGraphicalPassword: function () {
        var dotIndexArray = this.pattern.getNewDotIndexArray();
        if (!dotIndexArray || dotIndexArray.toString() === [].toString()) return false;

        this.pattern.setFrameTouchEnabled(false);
        if (this.pattern.getNewDotIndexArray().length >= 4) {
            this.hint.setString("温馨提示：已记录您的新图案。");
            setTimeout(() => {
                this.createAffirmBoxLayer();
            }, 1000);
        } else {
            this.hint.setString("温馨提示：请至少连接4个点，以确保密码的安全性。" + this.hintString);
            this.pattern.wrongPasswordLine();
            setTimeout(() => {
                this.pattern.resetGraphicalPasswordData();
                this.pattern.setFrameTouchEnabled(true);
            }, 1000);
        }
    },

    // 创建确认框层
    createAffirmBoxLayer: function () {
        var layer = new cc.LayerColor().to(this);
        layer.setColor(cc.color(0x00, 0x00, 0x00));
        layer.setOpacity(128);
        layer.swallowTouch();
        layer.swallowKeyboard(() => {
            layer.cancelCallback && layer.cancelCallback();
            mpGD.mainScene.popDefaultSelectArray();
            layer.removeFromParent();
        });

        var bg = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(layer).pp(0.5, 0.5);

        var title = new cc.LabelTTF("提  示", GFontDef.fontName, 36).to(bg).pp(0.5, 0.92);
        title.setColor(cc.color(231, 208, 124));

        var hint = new cc.LabelTTF("新图形密码已绘制成功，是否确认生效？", GFontDef.fontName, 36).to(bg).pp(0.5, 0.6);
        hint.setColor(cc.color(231, 208, 124));

        // 重绘按钮
        this.redrawBtn = new FocusButton("gui-gm-button-green-m.png", "", "gui-gm-button-green-m-d.png", ccui.Widget.PLIST_TEXTURE);
        this.redrawBtn.to(bg).pp(0.3, 0.25);
        this.redrawBtn.setTitleFontName("res/font/zhs-fz-36-green.fnt");
        this.redrawBtn.setTitleText("修  改");
        this.redrawBtn.getTitleRenderer().pp(0.5, 0.55);
        this.redrawBtn.addTouchEventListener((sender, type) => {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    this.hint.setString("温馨提示：为确保您的保险柜账户安全，请绘制合适的密码！" + this.hintString);
                    this.pattern.resetGraphicalPasswordData();
                    this.pattern.setFrameTouchEnabled(true);
                    bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                        mpGD.mainScene.popDefaultSelectArray();
                        layer.removeFromParent();
                    })));
                    break;
                default:
                    break;
            }
        });

        // 确认按钮
        this.sureBtn = new FocusButton("gui-gm-button-green-m.png", "", "gui-gm-button-green-m-d.png", ccui.Widget.PLIST_TEXTURE);
        this.sureBtn.to(bg).pp(0.7, 0.25);
        this.sureBtn.setTitleFontName("res/font/zhs-fz-36-green.fnt");
        this.sureBtn.setTitleText("确  认");
        this.sureBtn.getTitleRenderer().pp(0.5, 0.55);
        this.sureBtn.addTouchEventListener((sender, type) => {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    var password = "";
                    var dotIndexArray = this.pattern.getNewDotIndexArray();
                    for (var i = 0; i < dotIndexArray.length; i++) {
                        password = password + "#" + dotIndexArray[i].toString();
                    }

                    if (password === mpGD.userInfo.twoPassword) {
                        ToastSystemInstance.buildToast("新旧密码一样，请重新绘制。");
                        return false;
                    }

                    this.twoPassword = password;

                    mpGD.netHelp.requestModifyTwoPassword(mpGD.userInfo.twoPassword, password, mpPasswordType.Graphical);

                    mpApp.showWaitLayer("正在设置密码, 请等待");
                    break;
                default:
                    break;
            }
        });

        mpGD.mainScene.pushDefaultSelectArray(this.tabButton[2]);
        mpGD.mainScene.setFocusSelected(this.sureBtn);
        this.redrawBtn.setNextFocus(null, null, null, this.sureBtn);
        this.sureBtn.setNextFocus(null, null, this.redrawBtn, null);


        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));

        this.affirmBoxLayer = layer;
    },

    //
    switchPasswordType: function (type) {
        if (type === mpPasswordType.Plaintext) {
            this.passwordType = mpPasswordType.Plaintext;
            this.newTwoPassword.setVisible(true);
            this.confirmTwoPassword.setVisible(true);
            this.plaintextPasswordLabel.setVisible(true);
            this.mmsureBtn.setVisible(true);
            this.plaintextPasswordLabel.setVisible(true);

            this.pattern.setVisible(false);
            this.graphicalPasswordLabel.setVisible(false);

            this.hint.setString("温馨提示：为确保您的保险柜账户安全，请正确输入密码！");

        } else if (type === mpPasswordType.Graphical) {
            this.passwordType = mpPasswordType.Graphical;
            this.newTwoPassword.setVisible(false);
            this.confirmTwoPassword.setVisible(false);
            this.plaintextPasswordLabel.setVisible(false);
            this.mmsureBtn.setVisible(false);
            this.plaintextPasswordLabel.setVisible(false);

            this.pattern.setVisible(true);
            this.graphicalPasswordLabel.setVisible(true);

            this.hint.setString("温馨提示：为确保您的保险柜账户安全，请绘制合适的密码！" + this.hintString);
        }
    },

    //
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.ModifySetup:
                mpApp.removeWaitLayer();
                if (data.action == 6 && data.success == true) {
                    this.newTwoPassword.setString("");
                    this.confirmTwoPassword.setString("");
                    this.pattern.resetGraphicalPasswordData();
                    this.pattern.setFrameTouchEnabled(true);
                    if (this.affirmBoxLayer) {
                        this.affirmBoxLayer.removeFromParent();
                    }
                    mpGD.userInfo.twoPassword = this.twoPassword;
                    ToastSystemInstance.buildToast("修改保险柜密码成功, 请牢记您的新保险柜密码");

                    mpGD.mainScene.popDefaultSelectArray();
                    mpGD.mainScene.setFocusSelected(this.graphicalPasswordLabel);
                }
                break;

            case mpNetEvent.TransferMoney:
                mpApp.removeWaitLayer();
                if (data.success == true) {
                    //ToastSystemInstance.buildToast("打赏【" + ttutil.formatMoney(this.moneyEditBox.getString()) + "】给用户【" + this.toUserEditBox.getString() + "】成功");
                    var iteminfo={ts:Date.now(),id:data.detailID,detailID:data.detailID,tax:data.tax,fromGameID:data.fromGameID,fromNickname:data.fromNickname,toGameID:data.toGameID,toNickname:data.toNickname,money:data.money}
                    new MPBankTransferCertificatesLayer(iteminfo).to(cc.director.getRunningScene());
                    //接收人
                    this.toUserEditBox.setString("");
                    this.moneyEditBox.setString("");
                    this.taxMoney.setString("手续费:0");

                    mpApp.updateUserInfo(data);
                }
                break;

            case mpNetEvent.QueryBusiness:
                if (data.type == 3) {
                    this.toUserEditLable.setString(data.info);
                    break;
                }
                mpApp.removeWaitLayer();
                if (data.success == true) {
                    switch (data.type) {
                        case 1:
                            this.updateMXListView(data.data);
                            break;

                        case 4:
                            this.updateHBListView(data.data);
                            break;
                    }
                }
                break;

            case mpNetEvent.GetRebate:
                mpApp.removeWaitLayer();

                if (data.success == true) {
                    ToastSystemInstance.buildToast("本次领取返利金额:" + data.rebate);
                }
                break;

            case mpNetEvent.BankBusiness:
                if (data.success == true) {

                    mpApp.updateUserInfo({
                        score: data.score,
                        bankScore: data.bankScore,
                        acer: data.acer,
                        bankAcer: data.bankAcer,
                        luckyRMB: data.luckyRMB
                    });

                    this.updateUserInfo();
                }
                break;
        }
    },

    // ---------------------------------------
    //                 明细模块
    // ---------------------------------------
    // 创建明细页面
    buildMXLayer: function () {
        var layer = new cc.Layer().size(mpV.w, mpV.h);
        layer.mpTitleBackgroundName = "#gui-gm-bt-bj-xiao.png";
        layer.mpTitleSpriteName = "#BankUI/font_mingxi.png";
        layer.mpTitleSpritePos = cc.p(0.5, 0.6);

/*        var bg = new ccui.Scale9Sprite().to(layer);
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.size(mpV.w * 0.88, mpV.h * 0.5).pp(0.5, 0.55);
        layer.bg.size(900, 400).to(layer).pp(0.5, 0.45);*/
        layer.bg = new ccui.Scale9Sprite();
        layer.bg.initWithSpriteFrameName("frame_bg.png");
        layer.bg.size(900, 400).to(layer).pp(0.5, 0.45);


        var zichanUnderlineLabel = this.zichanUnderlineLabel = mputil.buildUnderlineLabel("资产明细").to(layer).pp(0.15, 0.85);
        zichanUnderlineLabel.addClickEventListener(() => {
            this.requestMXData();
        });

        var hongbaoUnderlineLabel = this.hongbaoUnderlineLabel = mputil.buildUnderlineLabel("红包明细").to(layer).pp(0.25, 0.85);
        hongbaoUnderlineLabel.addClickEventListener(() => {
            this.requestHBData();
        });

        if (!G_OPEN_RED_PACKET) {
            zichanUnderlineLabel.hide();
            hongbaoUnderlineLabel.hide();
        }

        var listView = new FocusListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(770, 380);
        listView.setItemsMargin(10);
        listView.to(layer.bg).pp(0.5, 0.5);

        this.mxListView = listView;

        var hint = new cc.LabelTTF("只显示最近50条", GFontDef.fontName, 24).to(layer.bg).pp(0.5, 0.05);
        hint.setColor(cc.color(194, 123, 160));

        return layer;
    },

    // 请求明细数据
    requestMXData: function () {
        mpApp.showWaitLayer("正在请求保险柜明细数据");
        mpGD.netHelp.requestBusinessMX();
    },

    //更新明细模块
    updateMXListView: function (data) {

        if (data.length <= 0) {
            return;
        }

        //时间 ， 操作类别， 操作描述， 操作金额， 剩下金额
        var createItem = function (time, type, desc, opMoney, leftMoney) {
            var widget = new FocusWidget();
            var bg = new ccui.Scale9Sprite().to(widget);
            bg.initWithSpriteFrameName("gui-gonggao-cell-bg.png");
            // var bg = new cc.Sprite("#frame_email_bg.png").to(widget);
            bg.size(768, 70);
            widget.size(768, 70);
            bg.pp();
            //------------------------
            var timeLabel = new ccui.Text(ttutil.formatDate(new Date(time)), "res/font/fzcy_s.TTF", 20).to(widget).pp(0.12, 0.5);
            timeLabel.setColor(cc.color(166, 28, 0));
            //------------------------

            var typeIconArray = ["#gui-bank-white.png", "#gui-bank-cr.png", "#gui-bank-qc.png", "#gui-bank-white.png", "#gui-bank-white.png", "#gui-bank-white.png", "#gui-bank-zs.png", "#gui-bank-zz.png", "#gui-bank-cz.png", "#gui-bank-tg.png", "#gui-bank-white.png", "#gui-bank-white.png", "#gui-bank-white.png"];

            if (!typeIconArray[type]) {
                typeIconArray[type] = "#gui-bank-white.png";
            }

            var typeIcon;

            if (typeIconArray[type] == "#gui-bank-white.png") {
                typeIcon = new cc.Sprite(typeIconArray[type]).to(widget).pp(0.32, 0.5);
                var tdescText = ["非法", "存入", "取出", "兑换", "存宝", "取宝", "赠送", "打赏", "充值", "推广", "返利", "购买", "活动", "道具赠送", "售出", "购买", "金币礼包"];
                typeIcon.setColor(cc.color(200, 200, 50));

                var fontSize = 32;
                tdescText[type] = tdescText[type] || desc;
                if (tdescText[type].length > 2) {
                    fontSize = 40 / tdescText[type].length * 2;
                }

                new ccui.Text(tdescText[type], "res/font/fzcy_s.TTF", fontSize).to(typeIcon).pp(0.5, 0.52);

            }
            else {
                typeIcon = new cc.Sprite(typeIconArray[type]).to(widget).pp(0.32, 0.5);
            }


            //------------------------
            var descLabel = new ccui.Text(desc, "res/font/fzcy_s.TTF", 20).to(widget).anchor(0, 0.5).pp(0.40, 0.5);
            descLabel.setColor(cc.color(231, 208, 124));

            //------------------------
            var opMoneyLabel = new ccui.Text("", "res/font/fzcy_s.TTF", 20).anchor(0, 0.5).to(widget).pp(0.57, 0.5);

            var opMoneyText = ttutil.formatMoney(opMoney);
            if (opMoney > 0) {
                opMoneyLabel.setColor(cc.color(0, 255, 0));
                opMoneyText = "+" + opMoneyText;
            }
            else {
                opMoneyLabel.setColor(cc.color(255, 0, 0));
            }
            opMoneyLabel.setString(opMoneyText);


            //------------------------
            var leftMoneyLabel = new ccui.Text("保险柜:" + ttutil.formatMoney(leftMoney), "res/font/fzcy_s.TTF", 20).anchor(0, 0.5).to(widget).pp(0.77, 0.5);
            leftMoneyLabel.setColor(cc.color(231, 208, 124));

            return widget;
        };

        this.mxListView.removeAllItems();
        for (var i = 0; i < data.length; ++i) {

            var item = createItem(data[i].ts, data[i].type, data[i].description, data[i].money, data[i].nowBankMoney);

            this.mxListView.pushBackCustomItem(item);

        }
        this.refreshFocus();
    },

    // ---------------------------------------
    //                 红包模块
    // ---------------------------------------
    //红包模块
    buildHBLayer: function () {
        var layer = new cc.Layer().size(this.size());
        layer.mpTitleSpriteName = "#gui-bank-hongbao.png";
        layer.mpTitleSpritePos = cc.p(0.48, 0.7);

        layer.bg = new ccui.Scale9Sprite();
        layer.bg.initWithSpriteFrameName("frame_bg.png");
        layer.bg.size(900, 400).to(layer).pp(0.5, 0.45);

        layer.walletModule = this.buildZCOperModule("#gui-bank-beibao.png", "背包", "取", function () {
            new MPTellerLayer(MPTellerLayer.mpHongBaoTake).to(cc.director.getRunningScene(), 10);
        }).to(layer.bg).pp(-0.5, 0.3);
        layer.bankModule = this.buildZCOperModule("#gui-bank-hongbaox.png", "红包", "存", function () {
            new MPTellerLayer(MPTellerLayer.mpHongBaoSave).to(cc.director.getRunningScene(), 10);
        }).to(layer.bg).pp(-0.5, -0.2);

        layer.walletModule.setMoneyString(mpApp.findGoodsSet(mpGoodsID.RedPacket).count);
        layer.bankModule.setMoneyString(mpGD.userInfo.luckyRMB.toFixed(2));

        return layer;
    },

    requestHBData: function () {
        mpApp.showWaitLayer("正在请求红包明细数据");
        mpGD.netHelp.requestBusinessHB();
    },

    //更新红包模块
    updateHBListView: function (data) {

        if (data.length <= 0) {
            return;
        }

        //时间 ， 操作类别， 操作描述， 操作金额， 剩下金额
        var createItem = function (time, type, desc, opMoney, leftMoney) {
            var widget = new FocusWidget();
            var bg = new ccui.Scale9Sprite().to(widget);
            bg.initWithSpriteFrameName("res/gui/file/gui-gm-mx-bj.png");

            bg.size(mpV.w * 0.85, 70);
            widget.size(mpV.w * 0.85, 70);
            bg.pp();
            //------------------------
            var timeLabel = new ccui.Text(ttutil.formatDate(new Date(time)), "res/font/fzcy_s.TTF", 20).to(widget).pp(0.1, 0.5);
            timeLabel.setColor(cc.color(231, 208, 124));
            //------------------------

            var typeIcon = new cc.Sprite("#gui-bank-white.png").to(widget).pp(0.25, 0.5);
            typeIcon.setColor(cc.color(200, 200, 50));

            var fontSize = 32;
            type = type || desc;
            if (type.length > 2) {
                fontSize = 40 / type.length * 2;
            }

            new cc.LabelTTF(type, GFontDef.fontName, fontSize).to(typeIcon).pp(0.5, 0.52);

            //------------------------
            var descLabel = new cc.LabelTTF(desc, GFontDef.fontName, 20).to(widget).anchor(0, 0.5).pp(0.35, 0.5);
            descLabel.setColor(cc.color(231, 208, 124));

            //------------------------
            var opMoneyLabel = new cc.LabelTTF("", GFontDef.fontName, 20).anchor(0, 0.5).to(widget).pp(0.6, 0.5);

            var opMoneyText = opMoney.toFixed(2);
            if (opMoney > 0) {
                opMoneyLabel.setColor(cc.color(0, 255, 0));
                opMoneyText = "+" + opMoneyText;
            }
            else {
                opMoneyLabel.setColor(cc.color(255, 0, 0));
            }
            opMoneyLabel.setString(opMoneyText);


            //------------------------
            var leftMoneyLabel = new cc.LabelTTF("剩余数额:" + leftMoney.toFixed(2), GFontDef.fontName, 20).anchor(0, 0.5).to(widget).pp(0.8, 0.5);
            leftMoneyLabel.setColor(cc.color(231, 208, 124));

            return widget;
        };

        this.mxListView.removeAllItems();
        for (var i = 0; i < data.length; ++i) {

            var item = createItem(data[i].ts, data[i].type, data[i].desc, data[i].money, data[i].afterMoney);

            this.mxListView.pushBackCustomItem(item);

        }
        this.refreshFocus();
    },

    // ---------------------------------------
    //                 资产模块
    // ---------------------------------------
    // 创建资产页面
    buildZCLayer: function () {
        var layer = new cc.Layer().size(this.size());
        layer.mpTitleBackgroundName = "#gui-gm-bt-bj-xiao.png";
        layer.mpTitleSpriteName = "#BankUI/font_title.png";
        layer.mpTitleSpritePos = cc.p(0.5, 0.6);
        layer.mpTitleScale = 1.2;

        layer.bg = new ccui.Scale9Sprite();
        layer.bg.initWithSpriteFrameName("frame_bg.png");
        layer.bg.size(900, 400).to(layer).pp(0.5, 0.45);

        layer.walletModule = this.buildZCOperModule("#BankUI/pic_qianbao.png", "钱包", "取", function () {
            new MPTellerLayer(MPTellerLayer.mpTake).to(cc.director.getRunningScene());
        }).to(layer.bg).pp(0.05, 0.48);

        layer.bankModule = this.buildZCOperModule("#BankUI/pic_yinhang.png", "保险柜", "存", function () {
            new MPTellerLayer(MPTellerLayer.mpSave).to(cc.director.getRunningScene());
        }).to(layer.bg).pp(0.05, 0.03);

        layer.walletModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.score));
        layer.bankModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.bankScore));

        return layer;
    },

    //创建底部 资产、打赏、密码、明细、红包五个按钮
    buildTabButton: function () {

        var self = this;
        var buttonArray = [];
        var nowSelectBtn = null;

        // var selectEffect = new cc.Sprite("#gui-hall-select.png").to(this);
        // selectEffect.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.3, 1.2), cc.scaleTo(0.3, 1.1))));


        // var effect = new ccs.Armature("2jijiemiantexiao_dating");
        // effect.getAnimation().play("Animation2");
        // effect.to(this);

        var touchEventListener = function (sender, type, isNotFresh) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {

                if (nowSelectBtn != sender) {
                    for (var i in buttonArray) {

                        buttonArray[i].loadTextureNormal(sender.nor, ccui.Widget.PLIST_TEXTURE);
                        buttonArray[i].mpSprite.display(buttonArray[i].mpNor);
                        self.layerArray[i].doExit();
                    }

                    sender.loadTextureNormal(sender.sel, ccui.Widget.PLIST_TEXTURE);
                    sender.mpSprite.display(sender.mpPre);
                    // selectEffect.exto(sender, -1).pp();
                    sender.mpCallback && sender.mpCallback();
                    self.layerArray[sender.mpIndex].doEnter();
                    nowSelectBtn = sender;
                    if (isNotFresh == null || !isNotFresh)
                        self.refreshFocus();
                }
            }
        };

        var createButton = function (nor, pre, index) {
            var button = new FocusButton();

            button.loadTextureNormal(nor, ccui.Widget.PLIST_TEXTURE);
            button.setCapInsets(cc.rect(13, 15, 200, 60));
            button.setScale9Enabled(true);
            button.size(150, 70);
            button.mpSprite = new cc.Sprite().to(button, 1).pp(0.5, 0.5);
            button.mpNor = nor;
            button.mpPre = pre;
            button.addTouchEventListener(touchEventListener, true);
            button.mpIndex = index;
            return button;
        };

        var index = 0;
        buttonArray.push(createButton("#BankUI/bottomButton/font_zc.png", "#BankUI/bottomButton/font_zc_h.png", index++).to(this));
        G_OPEN_RED_PACKET && buttonArray.push(createButton("#gui-bank-button-hongbao-b.png", "#gui-bank-button-hongbao-h.png", index++).to(this));
        G_OPEN_ZHUAN_ZHANG && buttonArray.push(createButton("#BankUI/bottomButton/font_zhuanzhang.png", "#BankUI/bottomButton/font_zhuanzhang_h.png", index++).to(this));
        buttonArray.push(createButton("#BankUI/bottomButton/font_mima.png", "#BankUI/bottomButton/font_mima_h.png", index++).to(this));
        buttonArray.push(createButton("#BankUI/bottomButton/font_mingxi.png", "#BankUI/bottomButton/font_mingxi_h.png", index++).to(this));

        switch (buttonArray.length) {
            case 5:
                buttonArray[0].pp(0.2, 0.15);
                buttonArray[1].pp(0.35, 0.15);
                buttonArray[2].pp(0.5, 0.15);
                buttonArray[3].pp(0.65, 0.15);
                buttonArray[4].pp(0.8, 0.15);
                break;

            case 4:
                buttonArray[0].pp(0.35, 0.78);
                buttonArray[1].pp(0.47, 0.78);
                buttonArray[2].pp(0.59, 0.78);
                buttonArray[3].pp(0.71, 0.78);
                break;

            case 3:
                buttonArray[0].pp(0.375, 0.11);
                buttonArray[1].pp(0.5, 0.1);
                buttonArray[2].pp(0.625, 0.11);
                break;
        }

        //模拟一次点击， 让资产界面显示出来
        touchEventListener(buttonArray[0], ccui.Widget.TOUCH_ENDED, true);

        return buttonArray;
    },

    //创建资产操作模块
    buildZCOperModule: function (imgPath, text, title, callback) {

        var node = new FocusNode().anchor(0, 0);
        node.size(800, 180);
        // node.showHelp()

        var bg = new ccui.Scale9Sprite().to(node).pp(0.5, 0.5);
        bg.initWithSpriteFrameName("frame_sub_bg.png");
        bg.size(800, 180)

        var icon = new cc.Sprite(imgPath).to(node).anchor(0, 0.5).p(30, 90);

        var labelHint = new cc.LabelTTF(text, GFontDef.fontName, 24).to(node).pp(0.5, 0.85);
        labelHint.setColor(cc.color(255, 255, 0));
        // var labelHint = new cc.Sprite("#BankUI/font_qk.png").to(node).p(80,210);
        var moneyBG = new cc.Sprite("#gui-bank-jinbi-box.png").to(node).p(170, 90).anchor(0, 0.5).qscale(0.8);

        var moneyLabel = new cc.LabelBMFont(0, "res/font/zhs-fzzyjw-24-red.fnt").to(node).anchor(0, 0.5).p(210, 90);
        title = title == "存" ? "BankUI/btn_ck.png" : "BankUI/btn_qk.png"
        var button = new FocusButton(title, "", "", ccui.Widget.PLIST_TEXTURE).to(node).pp(0.8,0.5);


    
        //button.title = new cc.Sprite(title).to(button).pp(0.5, 0.5);
        // button.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // button.setTitleText(title);
        // button.getTitleRenderer().pp(0.5, 0.55);
        // button.setTitleFontSize(32);

        button.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.pushDefaultSelectArray(button);
                callback && callback();
            }
        });
        node.button = button;
        node.setMoneyString = (text) => {
            moneyLabel.setString(text);
        };

        return node;
    },

    //更新用户信息
    updateUserInfo: function () {

        var layer = this.layerArray[this.layerIndex];

        //--------------------------------------------------------------------------------------
        // if (this.layerIndex == 0) {

        // layer.walletModule && layer.walletModule.setMoneyString(mpApp.findGoodsSet(mpGoodsID.RedPacket).count);
        // layer.bankModule && layer.bankModule.setMoneyString(mpGD.userInfo.luckyRMB.toFixed(2));
        layer.walletModule && layer.walletModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.score));
        layer.bankModule && layer.bankModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.bankScore));
        // }
        // else {
        //     layer.walletModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.score));
        //     layer.bankModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.bankScore));
        // // }
        //--------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------
        if (G_OPEN_ZHUAN_ZHANG) {
            //更新打赏界面里的数据
            this.bankGoldNode.setMoneyString(ttutil.formatMoney(mpGD.userInfo.bankScore));
            this.rebateGoldNode && this.rebateGoldNode.setMoneyString(ttutil.formatMoney(mpGD.userInfo.unRecvRebate));
            //--------------------------------------------------------------------------------------
        }

        // this.hongbaoLabel.setString(mpGD.userInfo.luckyRMB.toFixed(2));
    },

    onEnter: function () {
        this._super();
    },

    onExit: function () {
        this._super();
        if (this.pattern) {
            this.pattern.resetGraphicalPasswordData();
            this.pattern.historyDotIndexArray.length = 0;
        }

    },
});