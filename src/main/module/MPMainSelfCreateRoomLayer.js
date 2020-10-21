var MPMainSelfCreateRoomLayer = MPQBackgroundLayer.extend({


    ctor:function () {
        this._super();
        
        this.panel = new ccs.load('res/css/selfroom/Main.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();



  
        var submitBtn = this.panel.getChildByName('Button_1');
        submitBtn.tag = 1000;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

       mpApp.showWaitLayer("正在请求数据， 请稍候");
       mpGD.netHelp.requestRoomList(1);
        //mpGD.netHelp.requestRoomList(1);
       return true;

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

                sender.setScale(0.8);
                sender.setColor(cc.color(255,128,128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);
                
                 //   mpGD.netHelp.requestGetVipPayList();
                setTimeout(function () {
                    sender.setScale(0.7);
                    sender.setColor(cc.color(255,255,255));
                },0.2);
                
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
                    sender.setScale(0.8);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },
    //TODO:网络事件
    /**
     * 当网络事件来时
     * @param event
     * @param data
     */
    onNetEvent: function (event, data) {
        //console.log('2222222' + event);

        switch (event) {
            case mpNetEvent.GameRoomList:
                //mpApp.removeWaitLayer();
                console.log(JSON.stringify(data));
                //var isSuccess = this.onRoomListMessage(data);
                //if (!isSuccess) {
                    //进入子游戏失败 清除邀请数据
                    //mpGD.inviteTable = null;
                //}
                break;
        }
    },

})