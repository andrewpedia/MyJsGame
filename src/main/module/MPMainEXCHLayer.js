//兑换

var MPMainEXCHLayer = MPQBackgroundLayer.extend({
    exType: null, //1 支付宝 2 银行卡
    ctor: function () {
        this._super();

        this.panel = new ccs.load('res/css/ec/MPMainEXCHLayer.json').node;
        this.panel.to(this).anchor(0.5, 0.5).pp(0.5, 0.5);

        this.runPanelAction();

        var submitBtn = this.panel.getChildByName('submitBtn');
        submitBtn.tag = 10;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1000;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        this.exType = 1;
        this.initEx();

    },

    initEx: function () {

        var aliCheckBox = this.panel.getChildByName('exAliCheckBox');
        this.aliCheckBox = aliCheckBox;
        var bankCheckBox = this.panel.getChildByName('exBankCheckBox');
        this.bankCheckBox = bankCheckBox;
        aliCheckBox.tag = 11;
        aliCheckBox.addTouchEventListener(this.buttonPressedEvents.bind(this));
        bankCheckBox.tag = 12;
        bankCheckBox.addTouchEventListener(this.buttonPressedEvents.bind(this));

        this.currentCheckBox = aliCheckBox;

        //tab
        aliCheckBox.addCCSEventListener(this.checkBoxEvents.bind(this));
        bankCheckBox.addCCSEventListener(this.checkBoxEvents.bind(this));

        //金币
        var goldLabel = this.panel.getChildByName('goldLabel');
        this.goldLabel = goldLabel;
        var self = this;

        var exRecordBtn = this.panel.getChildByName('exRecordBtn');
        var delBtn = this.panel.getChildByName('delBtn');
        var maxBtn = this.panel.getChildByName('maxBtn');
        var bindChangeBtn = this.panel.getChildByName('bindChangeBtn');

        exRecordBtn.tag = 13;
        exRecordBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        delBtn.tag = 14;
        delBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        maxBtn.tag = 15;
        maxBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        bindChangeBtn.tag = 16;
        bindChangeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        this.bindChangeBtn = bindChangeBtn;

        //this.exNumLabel = this.panel.getChildByName('exNumLabel');

        var buildSingleEditBox =  (size,inputType,color,maxLength,placeHolder)=> {

            var editBox = new FocusEditBox(size, new cc.Scale9Sprite());
            editBox.setFontSize(36);
            editBox.setPlaceHolder(placeHolder);
            editBox.setPlaceholderFontSize(24);
            editBox.setMaxLength(maxLength || 20);
            editBox.setFontColor(color);
            editBox.setInputMode(inputType);

            return editBox;
        }

        this.bankChargeNumEditBox = buildSingleEditBox(cc.size(210,55),cc.EDITBOX_INPUT_MODE_NUMERIC,cc.color(255,255,255),null,'0');
        this.bankChargeNumEditBox.to(this.panel).anchor(0,0.5);
        this.bankChargeNumEditBox.x = 424;
        this.bankChargeNumEditBox.y = 317;
        this.bankChargeNumEditBox.setPlaceholderFontColor(cc.color(255,255,255));

        this.slider = this.panel.getChildByName('slider');
        this.accountLabel = this.panel.getChildByName('accountLabel');
        if (mpGD.userInfo.alipay_account) {
            this.accountLabel.setString(mpGD.userInfo.alipay_account);
        }
        this.exBg = this.panel.getChildByName('exbg');
        this.accountBg = this.panel.getChildByName('accountBg');
        this.setGoldLabelValue = function (text,userscore) {
            self.goldLabel.setString( parseFloat( mpGD.userInfo.bankScore).toFixed(2));
            self.bankChargeNumEditBox.setString(text);
            //self.exNumLabel.setString(text);
        }

        if(!mpGD.userInfo.alipay_account||!mpGD.userInfo.realname)
        {
            this.bindChangeBtn.setVisible(true);
        }

        this.goldLabel.setString(ttutil.roundFloat(mpGD.userInfo.bankScore, 2));

        this.slider.addCCSEventListener(function (sender, type) {
            var drawMoney=   parseInt((mpGD.userInfo.bankScore * sender.getPercent() / 100));

            drawMoney = drawMoney - drawMoney % 10;

            self.setGoldLabelValue(drawMoney,mpGD.userInfo.bankScore-drawMoney);

        });

    },

    checkBoxEvents: function (sender, type) {
        console.log('ccccccccc:' + type);
        var tag = sender.tag;

        if (this.currentCheckBox.tag == tag) return this.currentCheckBox.setSelected(true);

        if (tag == 11 && this.currentCheckBox != this.aliCheckBox) {
            // 支付宝
            this.aliCheckBox.setSelected(true);
            this.bankCheckBox.setSelected(false);
            this.currentCheckBox = this.aliCheckBox;
        }
        if (tag == 12 && this.currentCheckBox != this.bankCheckBox) {
            //银行卡

            this.bankCheckBox.setSelected(true);
            this.aliCheckBox.setSelected(false);
            this.currentCheckBox = this.bankCheckBox;

        }
    },

    buttonPressedEvents: function (sender, type) {
        //console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.9);
                sender.setColor(cc.color(255, 128, 128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255, 255, 255));
                }, 0.2);
                var tag = sender.tag;
                if (tag == 1000) {
                    this.closePanel();
                }

                if (tag == 10) {
                    this.submitEvent();
                }

                if (tag == 11 && this.currentCheckBox != this.aliCheckBox) {
                    // 支付宝
                    this.exType = 1;
                    this.exBg.loadTexture('res/css/ec/exc_mid.png');
                    this.accountBg.loadTexture('res/css/ec/exc_text_bind.png');
                    if (mpGD.userInfo.alipay_account) {
                        this.accountLabel.setString(mpGD.userInfo.alipay_account);
                    }
                    else
                    {
                        this.accountLabel.setString("");
                    }
                    if(!mpGD.userInfo.alipay_account||!mpGD.userInfo.realname)
                    {
                        this.bindChangeBtn.setVisible(true);
                    }
                    else
                    {
                        this.bindChangeBtn.setVisible(false);
                    }
                }
                if (tag == 12 && this.currentCheckBox != this.bankCheckBox) {
                    //银行卡
                    this.exType = 2;
                    this.exBg.loadTexture('res/css/ec/bank_mid.png');
                    this.accountBg.loadTexture('res/css/ec/bank_text_bind.png');
                    if (mpGD.userInfo.bank_account) {
                        this.accountLabel.setString(mpGD.userInfo.bank_account);
                    }
                    else
                    {
                        this.accountLabel.setString("");
                    }
                    console.log("银行卡");
                    if(!mpGD.userInfo.bank_account||!mpGD.userInfo.realname)
                    {
                        this.bindChangeBtn.setVisible(true);
                    }
                    else
                    {
                        this.bindChangeBtn.setVisible(false);
                    }
                }
                //兑换记录
                if (tag == 13) {
                    //new MPWebViewLayer('https://www.baidu.com').to(cc.director.getRunningScene());
                    new MPDrawMoneyRecordLayer().to(cc.director.getRunningScene());
                }

                if (tag == 14) {
                    this.slider.setPercent(0);
                    this.goldLabel.setString(mpGD.userInfo.bankScore);
                    this.bankChargeNumEditBox.setString(0);
                }
                //最大兑换按钮
                if (tag == 15) {

                    var drawMoney=   parseInt(mpGD.userInfo.bankScore)-parseInt(mpGD.userInfo.bankScore)%10;

                    this.setGoldLabelValue(drawMoney,mpGD.userInfo.bankScore-drawMoney);
                    this.slider.setPercent(100);
                }

                if (tag == 16) {
                    if (!this.xxxxxxx) this.xxxxxxx = 0;
                    if(this.exType ==1)
                    {
                        new MPMainBindAlipayLayer(this.xxxxxxx % 2 ? 1 : 2).to(cc.director.getRunningScene());
                    }
                    else if(this.exType ==2)
                    {
                        new MPMainBindBankLayer(this.xxxxxxx % 2 ? 1 : 2).to(cc.director.getRunningScene());
                    }
                    this.xxxxxxx += 1;
                }

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255, 255, 255));
                }, 0.2);

                break;
        }
    },
    submitEvent: function () {


        var drawMoney=this.bankChargeNumEditBox.getString();
        //console.log("请求兑换====a======="+drawMoney);
        if(!mputil.isNumber(drawMoney)||drawMoney<1)
        {
            ToastSystemInstance.buildToast("兑换金额错误");
            return;
        }
        if(drawMoney%10!=0)
        {
            ToastSystemInstance.buildToast("兑换金额只能为10的整数倍");
            return;
        }
        //console.log("==========="+this.exType);
        mpGD.netHelp.requestDrawMoney(this.bankChargeNumEditBox.getString(),this.exType);
    },
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.ModifySetup:
                if (!data.errMsg) {

                    if (data.action == 10) {
                        if (data.success) {
                            ToastSystemInstance.buildToast("操作成功");
                            mpApp.updateUserInfo({realname: data.realName,alipay_account:data.drawaccount});
                            this.bindChangeBtn.setVisible(false);
                            this.accountLabel.setString(data.drawaccount);
                        }
                    }
                    if (data.action == 11) {
                        if (data.success) {
                            ToastSystemInstance.buildToast("操作成功");
                            mpApp.updateUserInfo({realname: data.realName,bank_account:data.drawaccount});
                            this.bindChangeBtn.setVisible(false);
                            this.accountLabel.setString(data.drawaccount);
                        }
                    }
                }
                break;
            case mpNetEvent.DrawMoney:
                if (!data.errMsg) {
                    //ToastSystemInstance.buildToast("打赏【" + ttutil.formatMoney(this.moneyEditBox.getString()) + "】给用户【" + this.toUserEditBox.getString() + "】成功");
                    //var iteminfo={ts:Date.now(),id:data.detailID,detailID:data.detailID,tax:data.tax,fromGameID:data.fromGameID,fromNickname:data.fromNickname,toGameID:data.toGameID,toNickname:data.toNickname,money:data.money}
                    //new MPBankTransferCertificatesLayer(iteminfo).to(cc.director.getRunningScene());
                    //接收人
                    //this.toUserEditBox.setString("");
                    //this.moneyEditBox.setString("");
                    //this.taxMoney.setString("手续费:0");
                    this.goldLabel.setString( data.bankScore);
                    ToastSystemInstance.buildToast("兑换已申请成功，请等客服人员处理");
                    mpApp.updateUserInfo(data);
                }
                break;
        }
    },

})