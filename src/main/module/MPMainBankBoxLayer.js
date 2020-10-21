var MPMainBankBoxLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new ccs.load('res/css/bank/MainBankBoxLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var bankBoxPanel = this.panel;

        var saveBtn = bankBoxPanel.getChildByName('saveBtn');
        saveBtn.setTouchEnabled(false);
        saveBtn.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);

        var saveNode = ccs.load('res/css/bank/MainBankBoxSaveLayer.json').node;
        saveNode.to(bankBoxPanel)
        saveNode.x = 207;
        saveNode.y = 12.5;

        var getBtn = bankBoxPanel.getChildByName('getBtn');

        var getNode = ccs.load('res/css/bank/MainBankBoxGetLayer.json').node;
        getNode.to(bankBoxPanel)
        getNode.x = 207;
        getNode.y = 12.5;
        getNode.setVisible(false);

        var shiftBtn = bankBoxPanel.getChildByName('shiftBtn');
        shiftBtn.hide();

        var shiftNode = ccs.load('res/css/bank/MainBankBoxShiftLayer.json').node;
        shiftNode.to(bankBoxPanel);
        shiftNode.x = 207;
        shiftNode.y = 12.5;
        shiftNode.setVisible(false);


        var pwBtn = bankBoxPanel.getChildByName('pwBtn');
        pwBtn.hide();

        var pwNode = ccs.load('res/css/bank/MainBankBoxPasswordLayer.json').node;
        pwNode.to(bankBoxPanel);
        pwNode.x = 207;
        pwNode.y = 12.5;
        pwNode.setVisible(false);

        //明细按钮
        var deBtn = bankBoxPanel.getChildByName('deBtn');
        deBtn.tag = 15;
        deBtn.hide();
        deBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));


        saveBtn.addTouchEventListener(this.bankBoxButtonPressedEvents.bind(this));
        getBtn.addTouchEventListener(this.bankBoxButtonPressedEvents.bind(this));
        shiftBtn.addTouchEventListener(this.bankBoxButtonPressedEvents.bind(this));
        pwBtn.addTouchEventListener(this.bankBoxButtonPressedEvents.bind(this));
        this.bankButtons = [saveBtn,getBtn,shiftBtn,pwBtn];
        this.bankPanels = [saveNode,getNode,shiftNode,pwNode];

        var idTf = this.bankPanels[2].getChildByName('idTf');
        idTf.setVisible(false);
        var tax = mpGD.vipConfig[mpGD.userInfo.memberOrder].tax;
        var idBox = mputil.buildEditBox(" 输入ID   转账收取" + (tax * 100) + "%手续费", "", cc.EDITBOX_INPUT_MODE_NUMERIC, idTf.getSize());
        idBox.tag = 10086;
        idBox.to(this.bankPanels[2]);
        idBox.anchor(0,0.5);
        idBox.x = idTf.x;
        idBox.y = idTf.y;
        idBox.mpBG.setVisible(false);

        var moneyTf = this.bankPanels[2].getChildByName('jineTf');
        moneyTf.setVisible(false);
        var moneyBox = mputil.buildEditBox(" 输入转账金额", "", cc.EDITBOX_INPUT_MODE_NUMERIC, moneyTf.getSize());
        moneyBox.tag = 10010;
        moneyBox.to(this.bankPanels[2]);
        moneyBox.anchor(0,0.5);
        moneyBox.x = moneyTf.x;
        moneyBox.y = moneyTf.y;
        moneyBox.mpBG.setVisible(false);

        this.bankReloadData();

        this.saveMoneyEvents();
        this.getMoneyEvents();
        this.shiftEvents();
        this.bankResetPasswordEvents();


        this.toUserName="";
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

                //最大兑换按钮
                if (sender.tag == 15) {
                    new MPBankDetailRecordLayer().to(cc.director.getRunningScene());
                    
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

                if (data.action == 6 && data.success == true) {

                    mpGD.userInfo.twoPassword = true;
                    ToastSystemInstance.buildToast("修改保险柜密码成功, 请牢记您的新保险柜密码");
                    this.closePanel();

                }
                break;
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

                    this.bankReloadData();
                    // this.updateUserInfo();
                }
                break;
            case mpNetEvent.TransferMoney:
                mpApp.removeWaitLayer();
                if (data.success == true) {
                    //ToastSystemInstance.buildToast("打赏【" + ttutil.formatMoney(this.moneyEditBox.getString()) + "】给用户【" + this.toUserEditBox.getString() + "】成功");
                    var iteminfo={ts:Date.now(),id:data.detailID,detailID:data.detailID,tax:data.tax,fromGameID:data.fromGameID,fromNickname:data.fromNickname,toGameID:data.toGameID,toNickname:data.toNickname,money:data.money}
                    new MPBankTransferCertificatesLayer(iteminfo).to(cc.director.getRunningScene());
                    //接收人
                    //this.toUserEditBox.setString("");
                    //this.moneyEditBox.setString("");
                    //this.taxMoney.setString("手续费:0");
                    //console.log("=========="+data.bankScore);
                    this.bankPanels[2].getChildByTag(10086).setString("");
                    this.bankPanels[2].getChildByTag(10010).setString("");

                    this.bankPanels[0].getChildByName('reGoldLabel').setString(data.bankScore);
                    this.bankPanels[1].getChildByName('reGoldLabel').setString(data.bankScore);
                    this.bankPanels[2].getChildByName('reLabel').setString(data.bankScore);
                    mpApp.updateUserInfo(data);
                }
                break;

            case mpNetEvent.QueryBusiness:
                if (data.type == 3) {
                    //this.toUserEditLable.setString(data.info);
                    this.toUserName=data.info;

                    break;
                }
                mpApp.removeWaitLayer();
                
                break;
        }
    },
    //存款相关操作
    saveMoneyEvents:function () {

        var node = this.bankPanels[0];

        var submitBtn = node.getChildByName('submitBtn');
        var maxBtn  = node.getChildByName('maxBtn');
        var delBtn  = node.getChildByName('delBtn');
        var slider  = node.getChildByName('slider');
        var tf      = node.getChildByName('saveTf');

        var  saveBankButtonPressedEvents = function(sender, type){
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

                    if (sender.tag == 10){
                        var money = parseFloat(tf.getString());
                        if (money > 0) {
                            mpApp.showWaitLayer("正在操作, 请稍候");
                            mpGD.netHelp.requestBankBusiness(money, 1);
                        }
                        else {
                            ToastSystemInstance.buildToast("操作数额不能为0");
                        }

                    }

                    if (sender.tag == 11){

                        slider.setPercent(100);
                        console.log(mpGD.userInfo.score)
                        tf.setString(parseInt( mpGD.userInfo.score));

                    }
                    if (sender.tag == 12){
                        tf.setString('0');
                        slider.setPercent(0);

                    }

                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    setTimeout(function () {
                        sender.setScale(1);
                        sender.setColor(cc.color(255,255,255));
                    },0.2);

                    break;
            }

        };
        submitBtn.tag = 10;
        maxBtn.tag = 11;
        delBtn.tag = 12;
        submitBtn.addTouchEventListener(saveBankButtonPressedEvents.bind(this));
        maxBtn.addTouchEventListener(saveBankButtonPressedEvents.bind(this));
        delBtn.addTouchEventListener(saveBankButtonPressedEvents.bind(this));



        slider.addCCSEventListener((sender, type) => {
        
            tf.setString(parseInt(sender.getPercent() / 100 * mpGD.userInfo.score));

        });

    },

    //取款相关操作
    getMoneyEvents:function () {

        var node = this.bankPanels[1];

        var submitBtn = node.getChildByName('submitBtn');
        var maxBtn  = node.getChildByName('maxBtn');
        var delBtn  = node.getChildByName('delBtn');
        var slider  = node.getChildByName('slider');
        var tf      = node.getChildByName('saveTf');

        var  saveBankButtonPressedEvents = function(sender, type){
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

                    if (sender.tag == 10){

                        var money = parseFloat(tf.getString());
                        if (money > 0) {
                            mpApp.showWaitLayer("正在操作, 请稍候");
                            mpGD.netHelp.requestBankBusiness(money, 2);
                        }
                        else {
                            ToastSystemInstance.buildToast("操作数额不能为0");
                        }

                    }

                    if (sender.tag == 11){

                        slider.setPercent(100);
                        
                        tf.setString(mpGD.userInfo.bankScore);
                        //console.log(mpGD.userInfo.bankScore);
                        //tf.setString(parseInt(mpGD.userInfo.bankScore));

                    }
                    if (sender.tag == 12){

                        tf.setString('0');
                        slider.setPercent(0);

                    }

                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    setTimeout(function () {
                        sender.setScale(1);
                        sender.setColor(cc.color(255,255,255));
                    },0.2);

                    break;
            }

        };
        submitBtn.tag = 10;
        maxBtn.tag = 11;
        delBtn.tag = 12;
        submitBtn.addTouchEventListener(saveBankButtonPressedEvents.bind(this));
        maxBtn.addTouchEventListener(saveBankButtonPressedEvents.bind(this));
        delBtn.addTouchEventListener(saveBankButtonPressedEvents.bind(this));


        slider.addCCSEventListener((sender, type) => {
            console.log('99999999999:' + sender.getPercent());
            tf.setString(parseInt(sender.getPercent() / 100 * mpGD.userInfo.bankScore));

        });

    },

    //转账相关操作
    shiftEvents:function () {

        var idBox = this.bankPanels[2].getChildByTag(10086);
        var moneyBox = this.bankPanels[2].getChildByTag(10010);

        var feeLabel = this.bankPanels[2].getChildByName('shouxufeiLabel');
        feeLabel.setString("手续费:0");
        var delBtn = this.bankPanels[2].getChildByName('clearBtn');
        var recordBtn = this.bankPanels[2].getChildByName('recordBtn');
        var submitBtn = this.bankPanels[2].getChildByName('submitBtn');
        var calcTaxMoney = function (money) {
            var tax = mpGD.vipConfig[mpGD.userInfo.memberOrder].tax;
            //feeLabel.setString("手续费:" + ttutil.formatMoney(Math.floor(Number(money) * tax)) + "");
            console.log("=================="+parseFloat(Number(money) * tax).toFixed(2));
            feeLabel.setString("手续费:" + parseFloat(Number(money) * tax).toFixed(2) + "");
        };

        moneyBox.setDelegate({
            editBoxEditingDidEnd: function (editBox) {

                var money = Number(editBox.getString());
                if (money > mpGD.userInfo.bankScore) {
                    money = mpGD.userInfo.bankScore;
                    editBox.setString(money);
                }

                calcTaxMoney(money);
            }
        });

        idBox.setDelegate({
            editBoxReturn: function (editBox) {
                if (editBox.getString() == editBox.lastValue) {
                    editBox.lastValue = editBox.getString();
                    return;
                }
                //if (this.toUserEditBox.getString().length == 8) {
                if (editBox.getString().length >0) {
                    mpGD.netHelp.requestBusinessUN(editBox.getString());
                }
                else if (editBox.getString().length == 0) {
                    // this.toUserEditLable.setString("");
                    this.toUserName="";
                }
//        else {
//            this.toUserEditLable.setString("用户不存在");
//        }
            },

            editBoxEditingDidEnded: function (editBox) {
                if (editBox.getString() == editBox.lastValue) {
                    editBox.lastValue = editBox.getString();
                    return;
                }
                //if (this.toUserEditBox.getString().length == 8) {
                if (editBox.getString().length >0) {
                    mpGD.netHelp.requestBusinessUN(editBox.getString());
                } else {
                    // this.toUserEditLable.setString("用户不存在");
                    ToastSystemInstance.buildToast("用户不存在");

                }
            }
        })

        // moneyTf.addEventListener(function (sender, type) {
        //     console.log('ksdjflskdjfl');
        //     console.log(sender);
        //     console.log(type);
        // },this);

        delBtn.tag = 10;
        recordBtn.tag = 11;
        submitBtn.tag = 12;


        var events = function (sender, type) {
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

                    if (sender.tag == 10){

                        idBox.setString('');
                        moneyBox.setString('');
                        feeLabel.setString('手续费:0');

                    }
                    //转账记录
                    if (sender.tag == 11){

                        new MPBankTransferRecordLayer().to(cc.director.getRunningScene(),100000000);

                    }
                    //提交
                    if (sender.tag == 12){

                        if (moneyBox.getString() > 0) {

                            if (moneyBox.getString() > mpGD.userInfo.bankScore) {
                                ToastSystemInstance.buildToast("您保险柜钱不够");
                                return;
                            }

                            if (mputil.gameIDIsLegal(idBox.getString())) {
                                // mpApp.showWaitLayer("正在请求转账");
                                // mpGD.netHelp.requestTransferMoney(idBox.getString(), moneyBox.getString());
                                //弹出转账确认对话框
                                var message="接收人："+idBox.getString()+"\n接收人昵称："+this.toUserName +"\n转账金额："+ttutil.formatMoney(moneyBox.getString())+"("+ttutil.convertMoneyToCapitals(moneyBox.getString())+")";
                                //console.log(message);


                                new MPMessageBoxLayer("转账确认",message, mpMSGTYPE.MB_OKCANCEL,
                                ()=>{

                                    mpGD.netHelp.requestTransferMoney(idBox.getString(), moneyBox.getString())
                                }).to(cc.director.getRunningScene(),1000000000);

//                                new MPMessageBoxLayer("转账确认",message, mpMSGTYPE.MB_OKCANCEL,function (){
//                                console.log("转账转账");
//                                        mpGD.netHelp.requestTransferMoney(idBox.getString(), moneyBox.getString())}
//                                    ,null).to(cc.director.getRunningScene(),10000000000);


                            }

                        }
                        else {
                            ToastSystemInstance.buildToast("转账金额不合法");
                        }

                    }

                    if (sender.tag >= 20){

                        //万 十万 百万 千万 万万
                        var vals = [10,100,500,1000, 5000,10000];

                        var tagVal = sender.tag - 20;

                        moneyBox.setString(Number(moneyBox.getString()) + vals[tagVal]);
                        calcTaxMoney(parseFloat(moneyBox.getString()));

                    }

                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    setTimeout(function () {
                        sender.setScale(1);
                        sender.setColor(cc.color(255,255,255));
                    },0.2);

                    break;
            }
        };

        delBtn.addTouchEventListener(events.bind(this));
        recordBtn.addTouchEventListener(events.bind(this));
        submitBtn.addTouchEventListener(events.bind(this));

        for (var i = 0; i < 6; i ++){

            // var addBtn = this.bankPanels[2].getChildByName('addBtn' + i);
            // addBtn.tag = 20 + i;
            // addBtn.addTouchEventListener(events.bind(this));

        }


    },
    //保险箱重置密码操作
    bankResetPasswordEvents:function () {

        var nTf = this.bankPanels[3].getChildByName('tf_1');
        var rTf = this.bankPanels[3].getChildByName('tf_2');

        var submitBtn = this.bankPanels[3].getChildByName('submitBtn');

        submitBtn.addTouchEventListener(function (sender,type) {

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

                    if (mputil.passwordIsLegal(mpGD.userInfo.twoPassword) && mputil.passwordIsLegal(nTf.getString()) && mputil.passwordIsLegal(rTf.getString())) {

                        if (nTf.getString() != rTf.getString()) {
                            ToastSystemInstance.buildToast("两次密码不一样");
                            return false;
                        }
                        if (nTf.getString() == mpGD.userInfo.twoPassword) {
                            ToastSystemInstance.buildToast("新旧密码一样");
                            return false;
                        }

                        this.twoPassword = nTf.getString();

                        mpGD.netHelp.requestModifyTwoPassword(mpGD.userInfo.twoPassword, nTf.getString(), mpPasswordType.Plaintext);
                        mpApp.showWaitLayer("正在请求修改保险柜密码, 请稍候");
                    }

                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    setTimeout(function () {
                        sender.setScale(1);
                        sender.setColor(cc.color(255,255,255));
                    },0.2);

                    break;
            }

        });

    },

    //刷新保险箱数据
    bankReloadData:function () {
        // layer.walletModule && layer.walletModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.score));
        // layer.bankModule && layer.bankModule.setMoneyString(ttutil.formatMoney(mpGD.userInfo.bankScore));

        var curGoldLabel = this.bankPanels[0].getChildByName('curGoldLabel');
        var reGoldLabel = this.bankPanels[0].getChildByName('reGoldLabel');
        var curGoldLabel2 = this.bankPanels[1].getChildByName('curGoldLabel');
        var reGoldLabel2 = this.bankPanels[1].getChildByName('reGoldLabel');
        var tf = this.bankPanels[0].getChildByName('saveTf');
        var tf2 = this.bankPanels[1].getChildByName('saveTf');
        var slider = this.bankPanels[0].getChildByName('slider');
        var slider2 = this.bankPanels[1].getChildByName('slider');

        console.log('0000000000');
        console.log(mpGD.userInfo.score);
        console.log(mpGD.userInfo.bankScore);
        
        curGoldLabel.setString(ttutil.roundFloat(mpGD.userInfo.score, 2));
        reGoldLabel.setString(mpGD.userInfo.bankScore);
        curGoldLabel2.setString(ttutil.roundFloat(mpGD.userInfo.score, 2));
        reGoldLabel2.setString(mpGD.userInfo.bankScore);


        tf.setString('');
        tf2.setString('');
        slider.setPercent(0);
        slider2.setPercent(0);

        // var idTf = this.bankPanels[2].getChildByTag(10086);
        // var tax = mpGD.vipConfig[mpGD.userInfo.memberOrder].tax;
        // idTf.setPlaceHolder('输入ID 转账收取' + (tax * 100) + '%手续费');

        var reLabel = this.bankPanels[2].getChildByName('reLabel');
        reLabel.setString(mpGD.userInfo.bankScore);

    },

    //切换选中状态
    bankSwitchSelectedStatus:function (button) {

        for (var i = 0; i < this.bankButtons.length; i ++) {

            var currentBtn = this.bankButtons[i];
            currentBtn.setTouchEnabled(true);
            currentBtn.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);

            var currentPanels = this.bankPanels[i];
            currentPanels.setVisible(false);

            if (currentBtn == button){
                currentBtn.setTouchEnabled(false);
                currentBtn.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
                currentPanels.setVisible(true);
            }

        }

    },

    bankBoxButtonPressedEvents:function (sender, type) {
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

                this.bankSwitchSelectedStatus(sender);

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },



})