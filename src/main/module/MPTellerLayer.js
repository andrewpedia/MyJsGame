/**
 * Created by Apple on 2016/6/18.
 */

/**
 * 存入跟取出
 */
var MPTellerLayer = MPBaseModuleLayer.extend({

    titleSprite: null,

    bgMusicLabel: null,             //背景音乐文字
    effectLabel: null,              //音效文字

    helpBtn: null,                  //帮助按钮

    type: 1,                      //类型， 表明是取出还是存入

    editBox: null,                  //输入框
    resetBtn: null,                   //重置按钮
    submitBtn: null,                 //确定按钮

    slider: null,                    //滑动条
    bankBalanceNode: null,          //余额模块
    operationMoney: null,               //操作的钱

    _className: "MPTellerLayer",
    _classPath: "src/main/module/MPTellerLayer.js",

    ctor: function (type) {
        this.type = type;
        this._super();
    },

    cleanup: function () {
        this._super();
    },

    //因为资源限制， ccui的Slider， 不好满足现有需求
    buildSlider: function () {


        var slider = this.slider = new FocusSprite("#jindutiao_01.png");

        slider._percent = 0;
        slider._enable = true;

        var progressBar = new cc.Sprite("#jindutiao_02.png").to(slider);
        progressBar.anchor(0, 1).p(0, 35);

        slider.bindTouch({
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                SoundEngine.playEffect(commonRes.btnClick);
                if (!slider._enable) {
                    return false;
                }
                var location = progressBar.convertToNodeSpace(touch.getLocation());

                // if (location.y < 0) {
                //     return false;
                // }
                var x = location.x;

                slidBall.setScale(1.1);
                slider.setPercent(x / slidBallSize.width);
                return true;
            },
            onTouchMoved: function (touch, event) {
                var x = progressBar.convertToNodeSpace(touch.getLocation()).x;
                slider.setPercent(x / slidBallSize.width);
            },
            onTouchEnded: function (touch, event) {
                var x = progressBar.convertToNodeSpace(touch.getLocation()).x;
                slider.setPercent(x / slidBallSize.width);
                slidBall.setScale(1);
            }
        });

        new cc.Sprite("#BankUI/pic_jindu.png").to(slider).pp(0.53,-0.8);

        var slidBall = new cc.Sprite("#BankUI/bar.png").to(slider).p(19, 20);
        if (mpGD.userInfo.bankScore == 0)
        {
            slidBall.display("#BankUI/bar_huise.png");
        }
        var initProgressBarRect = progressBar.getTextureRect();
        var slidBallSize = progressBar.size();


        //设置进度条
        slider.setPercent = function (percent) {

            if (percent < 0) {
                percent = 0;
            }
            if (percent > 1) {
                percent = 1;
            }
            slidBall.x = percent * slidBallSize.width + progressBar.x;
            slider._percent = percent;
            var progressBarRect = progressBar.getTextureRect();
            progressBarRect.width = initProgressBarRect.width * percent;
            progressBar.setTextureRect(progressBarRect, progressBar.isTextureRectRotated(), progressBarRect);

            slider.onChangeCallback && slider.onChangeCallback(percent);
        };
        slider.setPercent(slider._percent);

        slider.getPercent = function () {
            return slider._percent;
        };
        slider.setEnable = function (enable) {
            this._enable = enable;
            if (this._enable) {
                slidBall.display("#BankUI/bar.png");
            }
            else {
                slidBall.display("#BankUI/bar_huise.png");
            }
            slider.maxBtn.setEnabled(enable);
        };

        slider.maxBtn = new FocusButton("BankUI/max.png", "", "BankUI/max_huise.png", ccui.Widget.PLIST_TEXTURE).to(slider).pp(1.15, 0.78);

        slider.maxBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                slider.setPercent(1);
            }
        });


        slider.setScale(0.9);

        slider.onChangeCallback = null;
        return slider;
    },

    initEx: function () {
        this._super();

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.size(1100, 350).to(this).pp(0.5,0.55);

        // this.titleBG.pp(0.3,0.6)
        // this.bgSprite.pp(0.4,0.5);

        var self = this;
        //---------------------------------------------------------------------------------------
        var text, tip;
        //存入
        if (this.type == MPTellerLayer.mpSave || this.type == MPTellerLayer.mpHongBaoSave) {
            this.titleSprite = new cc.Sprite("#BankUI/font_cunkuang.png").to(this.titleBG).pp(0.5, 0.6);
            text = "输入存入数额";
            tip = "存入";
        }
        else {
            this.titleSprite = new cc.Sprite("#BankUI/font_qukuan.png").to(this.titleBG).pp(0.5, 0.6);
            text = "输入取出数额";
            tip = "取出";

            // //充值
            // var addMoney = new ccs.Armature("chongzhitexiao").to(this, 5).p(300, 132);
            // addMoney.getAnimation().play("Animation1");

            //用来给充值按钮按点击区域的
            // var widget = this.widget = new FocusWidget().to(this, 5).anchor(0.5, 0.5).p(930, 465);
            // widget.ignoreContentAdaptWithSize(false);
            // widget.setContentSize(cc.size(55, 55));
            // widget.setTouchEnabled(true);
            //
            // widget.addClickEventListener(mpGD.mainScene.onClickCZ.bind(mpGD.mainScene));

        }


        this.editBox = mputil.buildEditBox(text, tip).to(this,10).pp(0.54, 0.63);
        this.editBox.mpBG.size(500, 50);
        this.editBox.mpTip.setFontFillColor(cc.color(255,255,255));
        this.editBox.setString("0");
        this.editBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);

        this.editBox.setDelegate({
            editBoxEditingDidEnd: function (editBox) {
                var money = Number(editBox.getString());

                var redPacketGoodsCount = mpApp.findGoodsSet(mpGoodsID.RedPacket).count;

                switch (self.type) {
                    case MPTellerLayer.mpSave:
                        if (money > mpGD.userInfo.score) {
                            money = mpGD.userInfo.score;
                            self.editBox.setString(money);
                        }
                        if (mpGD.userInfo.score == 0) {
                            self.slider.setPercent(0);
                        }
                        else {
                            self.slider.setPercent(money / mpGD.userInfo.score);
                        }
                        break;

                    case MPTellerLayer.mpTake:
                        if (money > mpGD.userInfo.bankScore) {
                            money = mpGD.userInfo.bankScore;
                            self.editBox.setString(money);
                        }
                        if (mpGD.userInfo.bankScore == 0) {
                            self.slider.setPercent(0);
                        }
                        else {
                            self.slider.setPercent(money / mpGD.userInfo.bankScore);
                        }
                        break;

                    case MPTellerLayer.mpHongBaoSave:
                        if (money > redPacketGoodsCount) {
                            money = redPacketGoodsCount;
                            self.editBox.setString(money);
                        }
                        if (redPacketGoodsCount <= 0) {
                            self.slider.setPercent(0);
                        }
                        else {
                            self.slider.setPercent(money / redPacketGoodsCount);
                        }
                        break;

                    case MPTellerLayer.mpHongBaoTake:
                        if (money > mpGD.userInfo.luckyRMB) {
                            money = mpGD.userInfo.luckyRMB;
                            self.editBox.setString(money);
                        }
                        if (mpGD.userInfo.luckyRMB <= 0) {
                            self.slider.setPercent(0);
                        }
                        else {
                            self.slider.setPercent(money / mpGD.userInfo.luckyRMB);
                        }
                        break;
                }

                self.operationMoney = money;
            }
        });

        new cc.Sprite("#jinbi_small.png").to(this,10).pp(0.365,0.63);

        var chongzhi = new cc.Sprite("#btn_add.png").to(this,10).pp(0.72,0.63);
        chongzhi.bindTouch({
            swallowTouches:true,
            onTouchBegan:function () {
                new MPRechargeLayer().to(cc.director.getRunningScene());
                return true;
            }
        });


        //---------------------------------------------------------------------------------------

        this.bankBalanceNode = this.buildBankBalance().to(this).pp(0.5, 0.74);

        this.cashNode = this.buildCashNode().to(this).pp(0.77, 0.74);

        //---------------------------------------------------------------
        this.slider = this.buildSlider().to(this,10).pp(0.47, 0.5);

        this.slider.onChangeCallback = function (percent) {

            switch (self.type) {
                case MPTellerLayer.mpSave:
                    self.operationMoney = Math.floor(mpGD.userInfo.score * percent);
                    self.editBox.setString(self.operationMoney);
                    break;

                case MPTellerLayer.mpTake:
                    self.operationMoney = Math.floor(mpGD.userInfo.bankScore * percent);
                    self.editBox.setString(self.operationMoney);
                    break;

                case MPTellerLayer.mpHongBaoSave:
                    self.operationMoney = Math.floor(mpApp.findGoodsSet(mpGoodsID.RedPacket).count * percent);
                    self.editBox.setString(self.operationMoney);
                    break;

                case MPTellerLayer.mpHongBaoTake:
                    self.operationMoney = Math.floor(mpGD.userInfo.luckyRMB * percent);
                    self.editBox.setString(self.operationMoney);
                    break;
            }
        };
        //---------------------------------------------------------------

        var self = this;

        this.resetBtn = new FocusButton("BankUI/btn_reset.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this,10).pp(0.35, 0.2).qscale(1.44);
        this.submitBtn = new FocusButton("BankUI/btn_sure.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this,10).pp(0.65, 0.2);

        this.resetBtn.addTouchEventListener(this.touchEventListener.bind(this));

        this.submitBtn.addTouchEventListener(this.touchEventListener.bind(this));

        this.updateUserInfo();
    },

    initTV: function () {

        this._super();
        var self = this;

        this.backBtn.setNextFocus(null, this.editBox, null, null);
        this.editBox.setNextFocus(this.backBtn, this.slider, null, this.widget ? this.widget : null);
        if (this.widget) {
            this.widget.setNextFocus(null, this.slider, this.editBox, null);
        }
        this.slider.setNextFocus(this.editBox, this.resetBtn, null, null);
        this.slider._onClickLeft = function () {
            var delta = self.slider._percent - 0.1;
            if (delta >= 0)
                self.slider.setPercent(delta)
        }
        this.slider._onClickRight = function () {
            var delta = self.slider._percent + 0.1;
            if (delta <= 1)
                self.slider.setPercent(delta)
        }
        this.slider.onClick = function () {
        }
        this.resetBtn.setNextFocus(this.slider, null, null, this.submitBtn);
        this.submitBtn.setNextFocus(this.slider, null, this.resetBtn, null);
    },

    //更新用户信息
    updateUserInfo: function () {
        // this._super();

        if (this.type == MPTellerLayer.mpTake || this.type == MPTellerLayer.mpSave) {
            this.bankBalanceNode.setMoneyString(ttutil.formatMoney(mpGD.userInfo.bankScore));
            this.cashNode.setMoneyString(ttutil.formatMoney(mpGD.userInfo.score));
        }
        else
            this.bankBalanceNode.setMoneyString(mpGD.userInfo.luckyRMB.toFixed(2));

        switch (this.type) {
            case MPTellerLayer.mpSave:
            case MPTellerLayer.mpHongBaoSave:
                if (mpGD.userInfo.score == 0 && this.type == MPTellerLayer.mpTake || mpApp.findGoodsSet(mpGoodsID.RedPacket).count <= 0 && this.type == MPTellerLayer.mpHongBaoTake) {
                    this.slider.setEnable(false);
                    this.editBox.setTouchEnabled(false);
                }
                else {
                    this.slider.setEnable(true);
                    this.editBox.setTouchEnabled(true);
                }
                break;

            case MPTellerLayer.mpTake:
            case MPTellerLayer.mpHongBaoTake:
                if (mpGD.userInfo.bankScore == 0 && this.type == MPTellerLayer.mpTake || mpGD.userInfo.luckyRMB <= 0 && this.type == MPTellerLayer.mpHongBaoTake) {
                    this.slider.setEnable(false);
                    this.editBox.setTouchEnabled(false);
                }
                else {
                    this.slider.setEnable(true);
                    this.editBox.setTouchEnabled(true);
                }
                break;
        }
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.BankBusiness:
                mpApp.removeWaitLayer();
                if (data.success == true) {


                    mpApp.updateUserInfo({
                        score: data.score,
                        bankScore: data.bankScore,
                        acer: data.acer,
                        bankAcer: data.bankAcer,
                        luckyRMB: data.luckyRMB
                    });

                    switch (data.type) {
                        case MPTellerLayer.mpSave:
                        case MPTellerLayer.mpHongBaoSave:
                            ToastSystemInstance.buildToast("存入操作成功, 请查验您的账户信息.");
                            break;

                        case MPTellerLayer.mpTake:
                        case MPTellerLayer.mpHongBaoTake:
                            ToastSystemInstance.buildToast("取出操作成功, 请查验您的账户信息.");
                            break;
                    }

                    this.editBox.setString("0");
                    this.slider.setPercent(0);

                    this.updateUserInfo();
                }
                break;
        }
    },

    touchEventListener: function (sender, type) {
        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
        } else if (type == ccui.Widget.TOUCH_ENDED) {
            switch (sender) {
                case this.resetBtn:
                    this.slider.setPercent(0);
                    break;

                case this.submitBtn:
                    if (!cc.sys.isNative)
                        this.operationMoney = Number(this.editBox.getString());

                    if (this.operationMoney > 0) {
                        mpApp.showWaitLayer("正在操作, 请稍候");
                        mpGD.netHelp.requestBankBusiness(this.operationMoney, this.type);
                    }
                    else {
                        ToastSystemInstance.buildToast("操作数额不能为0");
                    }
                    break;
            }
        }
    },

    buildBankBalance: function () {

        var node = new cc.Node().size(370, 50).anchor(0.5, 0.5);
        // node.showHelp();
        // var bg = new ccui.Scale9Sprite().to(node);
        var bg = new cc.Sprite("#BankUI/frame_jinbi_bg.png").to(node).pp(0.45,0.5);
        // bg.initWithSpriteFrameName("frame_jinbi_bg.png");
        // bg.setCapInsets(cc.rect(50, 1, 250, 50));
        // bg.size(250, 30).pp(0.6, 0.5);

        var tip = new cc.LabelTTF((this.type == MPTellerLayer.mpSave || this.type == MPTellerLayer.mpTake) ? "保险柜余额:" : "红包余额:", GFontDef.fontName, 26).anchor(1, 0.5).to(node).pp(-0.05, 0.5);
        tip.setColor(cc.color(255, 255, 255));

        var goldIcon = new cc.Sprite("#gui-bank-baoxianx.png").to(node).pp(0.07,0.51).qscale(1);

        var money = 0;

        if (this.type == MPTellerLayer.mpTake || this.type == MPTellerLayer.mpSave) {
            money = ttutil.formatMoney(mpGD.userInfo.bankScore);
        }
        else {
            money = mpGD.userInfo.luckyRMB.toFixed(2);
        }

        var moneyLabel = new cc.LabelBMFont(money, "res/font/zhs-fzzyjw-24-red.fnt").to(bg).anchor(0, 0.5).pp(0.15, 0.45);

        node.setMoneyString = (text) => {
            moneyLabel.setString(text);
        };
        return node;
    },

    buildCashNode: function () {

        var node = new cc.Node().size(370, 50).anchor(0.5, 0.5);

        var bg = new cc.Sprite("#BankUI/frame_jinbi_bg.png").to(node).pp(0.45,0.5);

        var goldIcon = new cc.Sprite("#jinbi_big.png").to(node).pp(0.09,0.51);

        var money = 0;

        if (this.type == MPTellerLayer.mpTake || this.type == MPTellerLayer.mpSave) {
            money = ttutil.formatMoney(mpGD.userInfo.bankScore);
        }
        else {
            money = mpGD.userInfo.luckyRMB.toFixed(2);
        }

        var moneyLabel = new cc.LabelBMFont(money, "res/font/zhs-fzzyjw-24-red.fnt").to(bg).anchor(0, 0.5).pp(0.16, 0.45);

        node.setMoneyString = (text) => {
            moneyLabel.setString(text);
        };

        return node;
    }

});

MPTellerLayer.mpSave = 1;       //存入
MPTellerLayer.mpTake = 2;       //取出
MPTellerLayer.mpHongBaoSave = 8;       //红包存入
MPTellerLayer.mpHongBaoTake = 7;       //红包取出