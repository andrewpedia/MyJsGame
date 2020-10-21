var MPMainChargeLayer = MPQBackgroundLayer.extend({

    //type 1 绑定 2 更改
    ctor:function (type) {
        this._super();
        
        this.bType = type;
        this.panel = new ccs.load('res/css/recharge/MPMainChargeLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var alidata=null;
        var vipdata=null;

        // var submitBtn = this.panel.getChildByName('submitBtn');
        // submitBtn.tag = 10;
        // submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1000;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));


        var listView = this.panel.getChildByName('listView');

        for (var i = 0; i < 10; i ++) {
            var item = listView.getChildByName('Panel_' + i);
            if (i==2) item.removeFromParent();
            if (i >= 4) item.removeFromParent();

            if (i == 0) this.currentCheckBox = item.getChildByName('CheckBox_2');
            item.getChildByName('CheckBox_2').addCCSEventListener(this.checkBoxEvents.bind(this));
            item.getChildByName('CheckBox_2').addTouchEventListener(this.buttonPressedEvents.bind(this));
            item.getChildByName('CheckBox_2').tag = 10000 + i;

        }

        //this.buildContent_0();
        //this.buildContent_1();
        //this.buildContent_2();
        //this.buildContent_3();
        //请求支付宝充值列表
        //mpGD.netHelp.requestPayConfig();
        //由于使用了 Sa服 所以再注册一个监听
        if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
            mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");
        }
        mpGD.saNetHelper.requestPayConfig();
        mpApp.showWaitLayer("如时间太久请重新登录再试");

    },
    cleanup: function () {
        console.log("移除监听");
        mpGD.saNetHelper.removeNetHandler(this);
        this._super();
    },
    checkBoxEvents:function (sender, type) {
        console.log('ccccccccc:' + type);
        var tag = sender.tag;

        if (this.currentCheckBox.tag == tag) return this.currentCheckBox.setSelected(true);

        this.currentCheckBox.setSelected(false);
        sender.setSelected(true);

        this.panel.getChildByName('content_' + (this.currentCheckBox.tag - 10000)).setVisible(false);
        this.panel.getChildByName('content_' + (sender.tag - 10000)).setVisible(true);


        this.currentCheckBox = sender;



    },
    buttonPressedEvents:function (sender, type) {
        
        var tag = sender.tag;
        console.log('xxooxxxoo===========' + tag);
        var content=sender.content;
        //console.log('xxooxxxoo' + content);
        

        

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.9);
                sender.setColor(cc.color(255,128,128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);
                
                 //   mpGD.netHelp.requestGetVipPayList();
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                sender.tag == 1000 && this.closePanel();

                // content_0事件
                if (sender.tag >= 2000 && sender.tag < 3000){

                    if (tag == 2000) this.aliChargeNumEditBox.setString('');

                    if (tag == 2001) 
                    {
                        
                        var payMoney=this.aliChargeNumEditBox.getString();
                        if(!mputil.isNumber(payMoney)||payMoney<10)
                        {
                            ToastSystemInstance.buildToast("充值金额为大于10元整数");
                            return;
                        }
                        else
                        {
                            //支付类型-1支付宝， 支付金额
                            //mpApp.requestPay("1", payMoney);
                            mpGD.saNetHelper.requestPay(1, payMoney, "CHANEL1", null, null, null);
                            mpApp.showWaitLayer("如时间太久请重新登录再试");
                        }
                    }
                    //new MPTipLayer('暂时还未对接接口').show();

                    if (tag >= 2100) {
                        this.aliChargeNumEditBox.setString(sender.money);
                    }

                }
                // content_1事件
                if (sender.tag >= 3000 && sender.tag < 4000){

                    if (tag == 3001) new MPTipLayer('暂时还未对接接口').show();

                    if (tag >= 3100) this.moneyNumLabel.setString('4999' + '元');
                }
                // content_2事件
                if (sender.tag >= 4000 && sender.tag < 5000){
                    if (tag == 4000) this.bankChargeNumEditBox.setString('');

                    if (tag == 4001) {
                        var payMoney=this.bankChargeNumEditBox.getString();
                        if(!mputil.isNumber(payMoney)||payMoney<10)
                        {
                            ToastSystemInstance.buildToast("充值金额为大于10元整数");
                            return;
                        }
                        mpGD.saNetHelper.requestPay(1, payMoney, "CHANEL2", null, null, null);
                            mpApp.showWaitLayer("如时间太久请重新登录再试");
                    }

                    //if (tag >= 4100) this.bankChargeNumEditBox.setString('4999');
                    if (tag >= 4100) {
                        this.bankChargeNumEditBox.setString(sender.money);
                    }
                }

                // content_3事件
                if (sender.tag >= 5000 && sender.tag < 6000){

                    if (tag == 5000) {
                        native.setClipboard(mpGD.userInfo.gameID);
                        ToastSystemInstance.buildToast("您的账号已复制成功，发送给代理即可充值");

                    };

                    if (tag == 5001) {
                        //new MPMainChargeReportLayer().show();
                    }

                    if (tag >= 5100) {
                    
                        new MPMainContactAgentLayer(content).show();

                    };
                }

                if (sender.tag == 10003){
                //请求vip充值列表
                //console.log("请求充值列表");
                    if(this.vipdata==null)
                    {
                    console.log("请求数据a");
                        mpGD.saNetHelper.requestGetVipPayList();
                        mpApp.showWaitLayer("如时间太久请重新登录再试");
                    }
                }
                break;
                if (sender.tag == 10000){
                //请求vip充值列表
                //console.log("请求充值列表");
                    if(this.alidata==null)
                    {
                    //console.log("请求数据b");
                        mpGD.saNetHelper.requestPayConfig();
                        mpApp.showWaitLayer("如时间太久请重新登录再试");
                    }
                }
                if (sender.tag == 10001){
                //请求vip充值列表
                //console.log("请求充值列表");
                    if(this.alidata==null)
                    {
                    //console.log("请求数据c");
                        mpGD.saNetHelper.requestPayConfig();
                        mpApp.showWaitLayer("如时间太久请重新登录再试");
                    }
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
    buildContent_0:function (infoArray) {

//        for (var i = 0; i < infoArray.length; i++) {
//            console.log("支付宝充值列表返回的数据--------"+infoArray[i].money);
//        }

        var content = this.panel.getChildByName('content_0');

        var delBtn = content.getChildByName('delBtn');
        var submitBtn = content.getChildByName('submitBtn');
        delBtn.tag = 2000;
        submitBtn.tag = 2001;

        delBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        //温馨提示
        var msgLabel = content.getChildByName("msgLabel");
        msgLabel.setString("如果您手机使用的是默认浏览器，请选择通道1支付，否则请选择通道2支付。");

        var itemsNode = content.getChildByName('itemsNode');

        for (var i = 0; i < 8; i ++) {

            var item = itemsNode.getChildByName('Button_' + i);
            item.tag = 2100 + i;
            var textLabel = item.getChildByName('textLabel');
            textLabel.setString(infoArray[i].money);
            item.money = infoArray[i].money;
            item.addTouchEventListener(this.buttonPressedEvents.bind(this));

        }
        var buildSingleEditBox =  (size,inputType,color,maxLength,placeHolder)=> {

            var editBox = new FocusEditBox(size, new cc.Scale9Sprite());
            editBox.setFontSize(36);
            editBox.setPlaceHolder(placeHolder);
            editBox.setPlaceholderFontSize(24);
            editBox.setPlaceholderFontColor(color);
            editBox.setMaxLength(maxLength || 20);
            editBox.setFontColor(color);
            editBox.setInputMode(inputType);

            return editBox;
        }
        var aliChargeNumEditBox = buildSingleEditBox(cc.size(326,55),cc.EDITBOX_INPUT_MODE_PHONENUMBER,cc.color(255,255,255),null,'请输入充值金额,最低10元');
        aliChargeNumEditBox.to(content).anchor(0,0.5);
        aliChargeNumEditBox.x = 174;
        aliChargeNumEditBox.y = 356;
        aliChargeNumEditBox.setPlaceholderFontColor(cc.color(255,255,255));
        this.aliChargeNumEditBox = aliChargeNumEditBox;

    },
    buildContent_1:function (infoArray) {

        var content = this.panel.getChildByName('content_1');
        //温馨提示
        var msgLabel = content.getChildByName("msgLabel");
        msgLabel.setString("如果您手机使用的是默认浏览器，请选择通道1支付，否则请选择通道2支付。");

        var delBtn = content.getChildByName('delBtn');
        var submitBtn = content.getChildByName('submitBtn');
        delBtn.tag = 4000;
        submitBtn.tag = 4001;

        delBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));



        var itemsNode = content.getChildByName('itemsNode');



        for (var i = 0; i < 8; i ++) {

            var item = itemsNode.getChildByName('Button_' + i);
            item.tag = 4100 + i;
            var textLabel = item.getChildByName('textLabel');
            textLabel.setString(infoArray[i].money);
            item.money = infoArray[i].money;
            item.addTouchEventListener(this.buttonPressedEvents.bind(this));

        }
        var buildSingleEditBox =  (size,inputType,color,maxLength,placeHolder)=> {

            var editBox = new FocusEditBox(size, new cc.Scale9Sprite());
            editBox.setFontSize(36);
            editBox.setPlaceHolder(placeHolder);
            editBox.setPlaceholderFontSize(24);
            editBox.setPlaceholderFontColor(color);
            editBox.setMaxLength(maxLength || 20);
            editBox.setFontColor(color);
            editBox.setInputMode(inputType);

            return editBox;
        }
        var bankChargeNumEditBox = buildSingleEditBox(cc.size(326,55),cc.EDITBOX_INPUT_MODE_PHONENUMBER,cc.color(255,255,255),null,'请输入充值金额,最低10元');
        bankChargeNumEditBox.to(content).anchor(0,0.5);
        bankChargeNumEditBox.x = 174;
        bankChargeNumEditBox.y = 356;
        bankChargeNumEditBox.setPlaceholderFontColor(cc.color(255,255,255));
        this.bankChargeNumEditBox = bankChargeNumEditBox;


    },
    buildContent_2:function () {

        var content = this.panel.getChildByName('content_2');


        var submitBtn = content.getChildByName('submitBtn');
        submitBtn.tag = 3001;

        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));


        var itemsNode = content.getChildByName('itemsNode');

        for (var i = 0; i < 12; i ++) {

            var item = itemsNode.getChildByName('Button_' + i);
            item.tag = 3100 + i;
            item.addTouchEventListener(this.buttonPressedEvents.bind(this));

        }

        this.moneyNumLabel = content.getChildByName('moneyNumLabel');

        var finger = content.getChildByName('finger');

        finger.runAction(cc.repeatForever(
            cc.sequence(
                cc.scaleTo(0.5, 1.3).easing(cc.easeBackOut(0.6)),
                cc.scaleTo(0.5, 1).easing(cc.easeBackIn(0.6))
            )
        ));
    },
    buildContent_3:function (datalist) {
        var self=this;
        //var datalist=data.data;

        var content = self.panel.getChildByName('content_3');
        //content.setVisible(true);accountLabel
        //var accountTips = content.getChildByName('Text_45');
        //accountTips.setString("我的GameID");
        //用户GameID
        var accountLabel = content.getChildByName('accountLabel');
        accountLabel.setString(mpGD.userInfo.gameID);
        var copyBtn = content.getChildByName('copyBtn');
        copyBtn.tag = 5000;
        copyBtn.addTouchEventListener(self.buttonPressedEvents.bind(self));

        var reportBtn = content.getChildByName('reportBtn');
        reportBtn.tag = 5001;
        reportBtn.hide();
        reportBtn.addTouchEventListener(self.buttonPressedEvents.bind(self));

        var listView = content.getChildByName('listView');
        var k = 0;
        for(var i=0;i<3;i++)
        {
                var panel = listView.getChildByName('panel_' + i);
                for (var j = 0; j < 3; j ++){

                    var submitBtn = panel.getChildByName('item_' + j).getChildByName('submitBtn');
                    submitBtn.tag = 5100 + k;
                    submitBtn.content=datalist[k].pay_account;
                    submitBtn.addTouchEventListener(self.buttonPressedEvents.bind(self));
                    var strText = panel.getChildByName('item_' + j).getChildByName('Text_1');
                    //console.log("请求vip充值列表"+datalist[k].nickname);
                    strText.setString(datalist[k].nickname);
                    k += 1;

                }
        }

    },

//    onSANetEvent: function (event, data) {

//        switch (event) {
//            case mpNetEvent.GetVipPayList:
//                if (!data.errMsg) {
//                        if (data.success) {
//                            mpApp.removeWaitLayer();
//                            this.buildContent_3(data.data);
//                            
//                        }
//                    
//                }
//                break;
//            case mpSANetEvent.ReadPayConfig:
//                mpApp.removeWaitLayer();
//                this.buildContent_0(data);
//                //this.fillData(data);
//                //this.initTV();
//            break;
//        }
//    },
    onSANetEvent: function (event, data) {
        switch (event) {
            case mpSANetEvent.ReadPayConfig:
                mpApp.removeWaitLayer();
                this.alidata=data;
                this.buildContent_0(data);
                this.buildContent_1(data);
                break;
            case mpSANetEvent.GetVipPayList:
                mpApp.removeWaitLayer();
                this.vipdata=data;
                this.buildContent_3(data);
            case mpSANetEvent.RequestPay:
                mpApp.removeWaitLayer();
                if (data.channel == "XXPay") {
                    cc.sys.openURL(data.req);
                }
                else if (data.channel == "jhpay") {
                    cc.sys.openURL(data.req);
                }
                break;
            break;
        }
    },

})