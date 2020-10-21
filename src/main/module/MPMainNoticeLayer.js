var MPMainNoticeLayer = MPQBackgroundLayer.extend({


    mailListView: null,

    prePageBtn: null,           //上一页
    nextPageBtn: null,          //下一页
    allDeleteBtn: null,          //全部删除
    nowStart: 0,         //当前开始页
    pageSize: 20,         //当前结束页

    mailInfoArray: null,     //邮件信息
    ctor: function () {
        this._super();

        this.weixin="";  //客服微信
        this.qq="";      //客服QQ

        this.requestMailBox();
        this.panel = new ccs.load('res/css/notice/Layer.json').node;
        this.panel.to(this).anchor(0.5, 0.5).pp(0.5, 0.5);

        this.runPanelAction();


        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        for (var i = 0; i < 2; i++) {

            if (i == 0) this.currentCheckBox = this.panel.getChildByName('CheckBox_' + i);
            this.panel.getChildByName('CheckBox_' + i).addCCSEventListener(this.checkBoxEvents.bind(this));
            this.panel.getChildByName('CheckBox_' + i).addTouchEventListener(this.buttonPressedEvents.bind(this));
            this.panel.getChildByName('CheckBox_' + i).tag = 10000 + i;

        }

        //this.buildContent_0();
        this.buildContent_1();


        var wxBtn = this.panel.getChildByName('btn_wx');
        wxBtn.tag = 20;
        wxBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var qqBtn = this.panel.getChildByName('btn_qq');
        qqBtn.tag = 30;
        qqBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));


        if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
            mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");
        }
        mpGD.saNetHelper.requestKefuNumber();
        mpApp.showWaitLayer("正在请求数据");

    },
    cleanup: function () {
        console.log("移除监听");
        mpGD.saNetHelper.removeNetHandler(this);
        this._super();
    },
    checkBoxEvents: function (sender, type) {
        console.log('ccccccccc:' + type);
        var tag = sender.tag;

        if (this.currentCheckBox.tag == tag) return this.currentCheckBox.setSelected(true);

        this.currentCheckBox.setSelected(false);
        sender.setSelected(true);

        this.panel.getChildByName('content_' + (this.currentCheckBox.tag - 10000)).setVisible(false);
        this.panel.getChildByName('content_' + (sender.tag - 10000)).setVisible(true);


        this.currentCheckBox = sender;



    },

    buttonPressedEvents: function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(1.2);
                sender.setColor(cc.color(255, 128, 128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);
                sender.setScale(1);
                    sender.setColor(cc.color(255, 255, 255));
                 

                sender.tag == 1001 && this.closePanel();
                sender.tag == 10 && this.submitZXQuestion();
                if(sender.tag == 20)
                {
                    native.setClipboard(this.weixin);
				    //new MPMessageBoxLayer("通知", "复制完成", mpMSGTYPE.MB_OK, null).to(kefuLayer);
				    ToastSystemInstance.buildToast("客服微信 "+this.weixin+" 已复制到您的剪贴板中");
                }
                if(sender.tag == 30)
                {
                    native.setClipboard(this.qq);
				    //new MPMessageBoxLayer("通知", "复制完成", mpMSGTYPE.MB_OK, null).to(kefuLayer);
				    ToastSystemInstance.buildToast("客服QQ "+this.qq+" 已复制到您的剪贴板中");
                }
             
                break;
            case ccui.Widget.TOUCH_CANCELED:
                 sender.setScale(1);
                 sender.setColor(cc.color(255, 255, 255));

                break;
        }
    },

    specialButtonEvents:function(sender,type){
    switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.7);
                sender.setColor(cc.color(255, 128, 128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);
                sender.setScale(0.6);
                    sender.setColor(cc.color(255, 255, 255));
                 

           
                
                if(sender.tag == 11)
                {
                    var token=Encrypt.MD5(mpGD.userInfo.userID+"6b3af6bf-3016b7b8-a03d3b66-9b072ba6");
                    cc.sys.openURL("http://"+apiDomain+"/upfile?uid="+mpGD.userInfo.userID+"&token="+token+"&feedContent=");
                }
                break;
            case ccui.Widget.TOUCH_CANCELED:
                 sender.setScale(0.6);
                 sender.setColor(cc.color(255, 255, 255));

                break;
        }
    },
    
    buildContent_0: function () {

        var content = this.panel.getChildByName('content_0');

        this.gameNoticeListView = content.getChildByName('listView');

        for (var i = 0; i < 10; i++) {

            var panel = new ccs.load('res/css/notice/cell.json').node.getChildByName('Panel');
            panel.retain();
            panel.removeFromParent();
            panel.tag = 100 + i
            this.gameNoticeListView.pushBackCustomItem(panel);
            panel.addTouchEventListener(this.itemsEvents.bind(this));

        }

    },

    itemsEvents: function (sender, type) {

        if (type == ccui.Widget.TOUCH_ENDED) {

            var ann_readed = sender.getChildByName('ann_readed');
            var ann_gained = sender.getChildByName('ann_gained');

            ann_readed.setVisible(true);

            new MPMainNoticeDetailLayer().show();

        }

    },

    requestMailBox: function () {
        mpGD.netHelp.requestMailbox(this.nowStart, this.pageSize);
        mpApp.showWaitLayer("正在获取邮箱数据， 请稍候");
    },
        fillMessageData: function (data) {
        var self = this;
        var touchEventListener = function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                if (sender) {
                    cc.log("点击删除" + sender.mailID);
                    mpGD.netHelp.requestWriteSystemMail(sender.mailID, 1);
                    sender.getParent().removeFromParent();

                    //TV删除功能
                    // var items = self.mailListView.getItems();
                    // var index = items.indexOf(sender.getParent());
                    // if (index > -1) {
                    //     items.splice(index, 1);
                    //     mpGD.mainScene.setFocusSelected(items.length == 0 ? self.backBtn : (items.length == index ? items[index - 1] : items[index].button));
                    //     self.refreshFocus();
                    // }
                }
            }
        };

        var buildMessageItem = function (mailID, status, title, createTime) {

            var content = self.panel.getChildByName('content_0');

            self.gameNoticeListView = content.getChildByName('listView');
    
            var panel = new ccs.load('res/css/notice/cell.json').node.getChildByName('Panel');
            panel.retain();
            panel.removeFromParent();
            //panel.tag = 100 + i;
            var titleLabel = panel.getChildByName('titleLabel');
            //console.log('------------'+title);
            titleLabel.setString("消息");
            var dateLabel = panel.getChildByName('dateLabel');
            dateLabel.setString(ttutil.formatDate(new Date(createTime), "yyyy-MM-dd hh:mm:ss"));
            var Text_4 = panel.getChildByName('Text_4');
            //title="[test001/50000034] 向您打赏 11000 游戏币(含税收 220),注意查收";
            //console.log('------------'+title);
            Text_4.setString(title);


            
            //var icon;
            if (status == 1) {
                var ann_readed = panel.getChildByName('ann_readed');
                //var ann_gained = panel.getChildByName('ann_gained');
                ann_readed.setVisible(true);
            }

            self.gameNoticeListView.pushBackCustomItem(panel);
            //点击查看消息
            //panel.addTouchEventListener(self.itemsEvents.bind(self));
    
            
        };

        var mailList = data;

        //self.mailListView.removeAllItems();

        var unreadMailArray = [];
        // this.mailListView.pushBackCustomItem(fillWidget);
        for (var i = 0; i < mailList.length; i++) {

            var rankItem = buildMessageItem(mailList[i].mailID, mailList[i].status, mailList[i].title, mailList[i].createTime);

//            rankItem.setTouchEnabled(true);
//            rankItem.addClickEventListener(this.rankClickEventListener.bind(this));

//            this.mailListView.pushBackCustomItem(rankItem);
//            // this.mailListView.pushBackCustomFocusItem(rankItem);

//            //未读, 把所有未读标志成已经 读
            if (mailList[i].status == 0) {
                unreadMailArray.push(mailList[i].mailID);
            }
        }

        //把这些未读取的邮件标志成已经读取
        if (unreadMailArray.length > 0) {
            // mpGD.netHelp.//
            mpGD.netHelp.requestMarkMailAlreadyRead(unreadMailArray);
            //mpGD.mainScene.setUnReadMessageNum(mpGD.mainScene.messageBtn.unreadNum - unreadMailArray.length);
            mpGD.mainScene.setUnReadMessageNum(0);
        }

        //this.updateBottom();


    },

    rankClickEventListener: function (sender) {
        //请求邮箱数据

        var mailID = sender.mailID;

        //todo

    },
    buildContent_1: function () {

        var content = this.panel.getChildByName('content_1');

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

        var editBox = buildSingleEditBox(cc.size(550, 262), cc.EDITBOX_INPUT_MODE_ANY, cc.color(255, 255, 255), 10000, '请输入咨询内容');
        editBox.to(content).anchor(0, 1);
        editBox.x = 27;
        editBox.y = 463;
        editBox.setPlaceholderFontColor(cc.color(255, 255, 255));
        this.editBox = editBox;

        var submitBtn = content.getChildByName('submitBtn');
        submitBtn.tag = 10;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var ctfkBtn = content.getChildByName('ctfkBtn');;
        ctfkBtn.tag = 11;
        ctfkBtn.addTouchEventListener(this.specialButtonEvents.bind(this));

    },
    submitZXQuestion: function () {
        
        if (this.editBox.getString().length < 5) {
            new MPTipLayer('问题内容至少5个字符').show();
            return;
        }
        mpGD.netHelp.requestMyQuestion(this.editBox.getString());

        //new MPTipLayer('已为您提交咨询内容，请注意查看游戏公告内的回复').show();

    },
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.MyQuestion:
                if (!data.errMsg) {
                    //ToastSystemInstance.buildToast("打赏【" + ttutil.formatMoney(this.moneyEditBox.getString()) + "】给用户【" + this.toUserEditBox.getString() + "】成功");
                    //var iteminfo={ts:Date.now(),id:data.detailID,detailID:data.detailID,tax:data.tax,fromGameID:data.fromGameID,fromNickname:data.fromNickname,toGameID:data.toGameID,toNickname:data.toNickname,money:data.money}
                    //new MPBankTransferCertificatesLayer(iteminfo).to(cc.director.getRunningScene());
                    //接收人
                    //this.toUserEditBox.setString("");
                    //this.moneyEditBox.setString("");
                    //this.taxMoney.setString("手续费:0");
                    new MPTipLayer('已为您提交咨询内容，请注意查看游戏公告内的回复').show();
                }
                break;
            case mpNetEvent.GetMailList:

                mpApp.removeWaitLayer();
                this.mailInfoArray = data;
                this.fillMessageData(data);
                //this.refreshFocus();
                break;
        }
    },
    onSANetEvent: function (event, data) {
        switch (event) {
            case mpSANetEvent.KefuNumber:
                mpApp.removeWaitLayer();
                //console.log("=========="+data["Weixin"]);
                if(data)
                {
                    this.weixin=data["Weixin"];
                    this.qq=data["QQ"];
                }
                break;
        }
    },
})