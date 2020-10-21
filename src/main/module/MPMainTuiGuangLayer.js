//申请提现/申请预支
var TGApplyType = {
    TX:0, //提现
    YZ:1  //预支
}
//提取到目标平台
var TQPlatform = {
    ALI:0,//支付宝
    YUE:1 //余额
}

//申请提现/申请预支
var MPMainTuiGuangApplyLayer = cc.Layer.extend({
    m_touchListener:null,
    applyType:0, //申请类型 0 提现 1 预支
    platform:0,
    ctor:function(type,tixiMoney){
        this._super();
        var touchListener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan
        };
        cc.eventManager.addListener(touchListener, this);
        this.m_touchListener = touchListener;

        this.applyType = type;
        this.tixiMoney=tixiMoney;
        this.initEx();



    },
    onEnter:function () {
        this._super();
        this.onUserInfoUpdateListener = cc.eventManager.addCustomListener(mpEvent.UpdateUserInfo, this.updateUserInfo.bind(this));
        mpGD.netHelp.addNetHandler(this);
    },
    onExit:function () {
        this._super();
        cc.eventManager.removeListener(this.onUserInfoUpdateListener);
        mpGD.netHelp.removeNetHandler(this);
    },
    updateUserInfo: function () {

    },
    onTouchBegan:function(touch, event) {

        function isTouchInside(owner,touch) {
            if(!owner || !owner.getParent()){
                return false;
            }
            var touchLocation = touch.getLocation(); // Get the touch position
            touchLocation = owner.getParent().convertToNodeSpace(touchLocation);
            return cc.rectContainsPoint(owner.getBoundingBox(), touchLocation);
        }
        var target = event.getCurrentTarget();
        if(!target.isVisible() || (!isTouchInside(target,touch))){
            return false;
        }
        return true;
    },
    initEx:function () {

        this.size(mpV.w,mpV.h);
        this.anchor(0.5,0.5);
        var w = 600;
        var h = 500;

        this.platform = TQPlatform.ALI;



        var bgtop = new cc.Scale9Sprite("res/plaza1v1/images/tuiguang/square.png");
        bgtop.setContentSize(mpV.w,mpV.h);
        bgtop.setCapInsets(cc.rect(20,20,20,20));
        bgtop.to(this).anchor(0,1).pp(0,1);


        var panel = new cc.Node();
        panel.to(this).size(w, h).anchor(0.5,0.5).pp();

        var bg = new cc.Scale9Sprite("res/plaza1v1/images/tuiguang/woshihaokandebeijing.png");
        bg.setContentSize(w,h);
        bg.setCapInsets(cc.rect(20,20,20,20));
        bg.to(panel).anchor(0,1).pp(0,1);

        var subBg = new cc.Scale9Sprite("res/plaza1v1/images/tuiguang/public_youjian_diban_03.png");
        subBg.setContentSize(w- 40,h - 100);
        subBg.setCapInsets(cc.rect(20,20,20,20));
        subBg.to(panel).anchor(0.5,0).pp(0.5,0.05);

        var closeBtn =  new FocusButton("res/plaza1v1/images/tuiguang/list_icon_cha.png","res/plaza1v1/images/tuiguang/list_icon_cha.png","res/plaza1v1/images/tuiguang/list_icon_cha.png",ccui.Widget.LOCAL_TEXTURE);
        closeBtn.to(panel).pp(0.95,0.93).qscale(0.7);

        var goAlipayBtn = new FocusButton("res/plaza1v1/images/tuiguang/zfb.png","res/plaza1v1/images/tuiguang/zfb_pressed.png","res/plaza1v1/images/tuiguang/zfb.png",ccui.Widget.LOCAL_TEXTURE);
        goAlipayBtn.to(panel).anchor(1,0.5).pp(0.5,0.91).qscale(0.8);
        goAlipayBtn.setSelected();

        var goYuEBtn = new FocusButton("res/plaza1v1/images/tuiguang/ye.png","res/plaza1v1/images/tuiguang/ye_pressed.png","res/plaza1v1/images/tuiguang/ye.png",ccui.Widget.LOCAL_TEXTURE);
        goYuEBtn.to(panel).anchor(0,0.5).pp(0.5,0.91).qscale(0.8);
        var self = this;

        var aliContent = new cc.Node();
        aliContent.to(this).size(w,h);
        aliContent.anchor(0.5,0).pp(0.5,0.05);

        var yeContent = new cc.Node();
        yeContent.to(this).size(w,h);
        yeContent.anchor(0.5,0).pp(0.5,0.05);

        yeContent.hide();

        var aliAccount = this.buildTextView('支付宝账号:',"",24,cc.size(380,45),cc.EDITBOX_INPUT_MODE_ANY,100);
        aliAccount.to(aliContent).size(aliContent.cw(),45).p(35,465);
        if(mpGD.userInfo.alipay_account)
            aliAccount.editBox.setString(mpGD.userInfo.alipay_account);
        else
            aliAccount.editBox.setString("");
        //aliAccount.setTouchEnabled(false);
        var name = this.buildTextView('实名制姓名:',"",24,cc.size(380,45),cc.EDITBOX_INPUT_MODE_ANY,100);
        name.to(aliContent).size(aliContent.cw(),45).p(35,415 - 10);
        if(mpGD.userInfo.realname)
            name.editBox.setString(mpGD.userInfo.realname);
        else
            name.editBox.setString("");

        //提取到支付宝 剩余金额
        var moneyTitle = this.applyType == TGApplyType.TX ? "剩余奖励金:" : "剩余预支金:";

        //console.log("提现金额========="+this.tixiMoney);


        var money = this.buildTextView(moneyTitle,this.tixiMoney,24,cc.size(380,45),cc.EDITBOX_INPUT_MODE_ANY,100);
        money.to(aliContent).size(aliContent.cw(),45).p(35,330 - 20);
        money.editBox.setTouchEnabled(false);
        money.editBox.setString(0);
        this.tixiMoney && money.editBox.setString(this.tixiMoney);


        //提取到支付宝 提取金额
        var tiQuMoneyTitle = this.applyType == TGApplyType.TX ? "提取奖励金:" : "提取预支金:";
        var tiQuMoney = this.buildTextView(tiQuMoneyTitle,"请输入提取金额",24,cc.size(300,45),cc.EDITBOX_INPUT_MODE_ANY,100);
        tiQuMoney.to(aliContent).size(aliContent.cw(),45).p(35,275 - 20);
        tiQuMoney.editBox.setString(Math.floor( parseFloat( this.tixiMoney)));

        var aliMaxBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_xiaoyuan_huang.png","","",ccui.Widget.LOCAL_TEXTURE);
        aliMaxBtn.to(aliContent).p(530,275 - 20).qscale(0.4);
        aliMaxBtn.setTitleText("最大");
        aliMaxBtn.setTitleFontSize(40);

        var tipsLabel = new cc.LabelTTF("请输入正确的支付宝账号以及实名制姓名\n否则会导致提取失败",GFontDef.fontName,20,null,cc.TEXT_ALIGNMENT_CENTER,cc.TEXT_ALIGNMENT_CENTER);
        tipsLabel.to(aliContent).p(370,360);
        tipsLabel.setColor(cc.color("#535353"));


        var cancelBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_xiaoyuan_lan.png","","",ccui.Widget.LOCAL_TEXTURE);
        cancelBtn.to(this).pp(0.4,0.275);
        cancelBtn.setTitleText("取消");
        cancelBtn.setTitleFontSize(32);

        var commitBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_xiaoyuan_huang.png","","",ccui.Widget.LOCAL_TEXTURE);
        commitBtn.to(this).pp(0.6,0.275);
        commitBtn.setTitleText("确定");
        commitBtn.setTitleFontSize(32);

        //提取到余额 剩余金额
        var yeMoney = this.buildTextView(moneyTitle,"0",24,cc.size(380,45),cc.EDITBOX_INPUT_MODE_ANY,100);
        yeMoney.to(yeContent).size(aliContent.cw(),45).p(35,465);
        yeMoney.editBox.setString(0)
        this.tixiMoney && yeMoney.editBox.setString( this.tixiMoney);
        yeMoney.editBox.setTouchEnabled(false);
        yeMoney.editBox.setPlaceholderFontColor(cc.color(0,0,0));
        //提取到余额 提取金额
        var yeTiQuMoney = this.buildTextView(tiQuMoneyTitle,"请输入提取金额",24,cc.size(300,45),cc.EDITBOX_INPUT_MODE_ANY,100);
        yeTiQuMoney.to(yeContent).size(aliContent.cw(),45).p(35,415 - 10);
        yeTiQuMoney.editBox.setString(Math.floor( parseFloat( this.tixiMoney)));

        var yeMaxBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_xiaoyuan_huang.png","","",ccui.Widget.LOCAL_TEXTURE);
        yeMaxBtn.to(yeContent).p(530,415 - 10).qscale(0.4);
        yeMaxBtn.setTitleText("最大");
        yeMaxBtn.setTitleFontSize(40);

        //按钮事件
        function buttonEvents(sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) return sender.qscale(0.75);
            sender.qscale(0.7);
            if (type != ccui.Widget.TOUCH_ENDED) return;

            switch (sender) {
                //关闭
                case closeBtn:{

                    self.removeFromParent();

                };break;


            }
        }
        var self = this;
        function switchType(sender, type){

            if (type != ccui.Widget.TOUCH_ENDED) return;

            switch (sender) {
                //提取到支付宝
                case goAlipayBtn:{
                    goAlipayBtn.setSelected();
                    goYuEBtn.setNormal();

                    yeContent.hide();
                    aliContent.show();

                    self.platform = TQPlatform.ALI;

                };break;
                //提取到余额
                case goYuEBtn:{
                    goAlipayBtn.setNormal();
                    goYuEBtn.setSelected();
                    yeContent.show();
                    aliContent.hide();
                    self.platform = TQPlatform.YUE;
                };break;

            }

        }

        function normalEvents(sender, type){
            if (type != ccui.Widget.TOUCH_ENDED) return;

            switch (sender) {
                //提取最大化
                case aliMaxBtn:
                    //console.log("提现金额-----"+self.tixiMoney);
                    tiQuMoney.editBox.setString( Math.floor( parseFloat( self.tixiMoney)));
                    break;
                case yeMaxBtn:
                    yeTiQuMoney.editBox.setString( Math.floor( parseFloat( self.tixiMoney)));
                    break;
                //取消
                case cancelBtn:{self.removeFromParent()};break;
                //提交确定
                case commitBtn:{
                    //var apply = self.applyType == TGApplyType.TX ? "提现:" : "预支:";
                    //var msg = self.platform == TQPlatform.ALI ? "提取到支付宝" : "提取到余额";

                    var tixian_account=aliAccount.editBox.getString();
                    var tixian_name=name.editBox.getString();

                    if(self.platform == TQPlatform.ALI)
                    {
                        var money=tiQuMoney.editBox.getString();
                        console.log("提取到支付宝"+tixian_account+" "+tixian_name);
                        if(tixian_account.length<1||tixian_name.length<1)
                        {
                            ToastSystemInstance.buildToast("请输入提现帐号和真实姓名");
                            return;
                        }
                        //console.log("提取到支付宝"+money);
                        if (mputil.isNumber(money)&&money>=100) {
                            if(money>parseFloat(self.tixiMoney))
                            {
                                ToastSystemInstance.buildToast("可供提现余额不足");
                                return;
                            }
                            //console.log("self.playerGameID==="+cc.isNumber(parseInt(self.playerGameID)));
                            mpGD.netHelp.requestProxyTixian(tixian_account,tixian_name,money,1,1);
                            mpApp.showWaitLayer("正在请求提现， 请稍候");
                        }
                        else
                        {
                            ToastSystemInstance.buildToast("提现金额为大于100元的整数");
                            return;
                        }
                    }
                    else
                    {
                        console.log("提取到余额");
                        var money=yeTiQuMoney.editBox.getString();
                        if (mputil.isNumber(money)) {
                            if(money>parseFloat(self.tixiMoney))
                            {
                                ToastSystemInstance.buildToast("可供提现余额不足");
                                return;
                            }
                            //console.log("self.playerGameID==="+cc.isNumber(parseInt(self.playerGameID)));
                            mpGD.netHelp.requestProxyTixian(tixian_account,tixian_name,money,1,2);
                            mpApp.showWaitLayer("正在请求提现， 请稍候");
                        }
                        else
                        {
                            ToastSystemInstance.buildToast("提现金额应为整数");
                            return;
                        }
                    }
                    //ToastSystemInstance.buildToast({text: apply + msg});
                };break;

            }
        }

        closeBtn.addTouchEventListener(buttonEvents);

        goAlipayBtn.addTouchEventListener(switchType);
        goYuEBtn.addTouchEventListener(switchType);

        aliMaxBtn.addTouchEventListener(normalEvents);
        yeMaxBtn.addTouchEventListener(normalEvents);
        cancelBtn.addTouchEventListener(normalEvents);
        commitBtn.addTouchEventListener(normalEvents);



    },

    buildTextView:function (title,placeHolder,font,size,type,maxLength) {

        var titleLabel = new cc.LabelTTF(title || '',GFontDef.fontName,font);
        titleLabel.setColor(cc.color("#0da9ff"));

        var bg = new cc.Scale9Sprite("res/plaza1v1/images/tuiguang/InputFieldBackground_d1.png");
        bg.setContentSize(size || cc.size(100,100));
        bg.setCapInsets(cc.rect(10,10,10,10));

        var editBox = new FocusEditBox(size, bg);
        editBox.setFontSize(font);
        editBox.setPlaceHolder( placeHolder || '');
        editBox.setPlaceholderFontSize(font);
        editBox.setMaxLength(maxLength || 10000);
        editBox.setFontColor(cc.color(0,0,0));
        editBox.setPlaceholderFontColor(cc.color(230,230,230));
        editBox.setInputMode(type || cc.EDITBOX_INPUT_MODE_ANY);

        var node = new cc.Node();
        node.anchor(0,0);

        titleLabel.to(node).anchor(1,0.5).p(150,0.5);

        editBox.to(node).anchor(0,0.5).p(150,0.5);

        node.titleLabel = titleLabel;
        node.editBox = editBox;

        return node;

    }

})


var MPMainTuiGuangLayer = cc.Layer.extend({
    m_touchListener:null,
    pageIndex: 0,
    queryCount: 6,
    pageNum:1, //总页数
    pageLabel:null, //
    myPlayerTableBG:null,
    playerGameID:null, //要查询的玩家ID
    ctor:function(color){
        this._super(cc.color(0,0,0,255 * 0.7));
        var touchListener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan
        };
        cc.eventManager.addListener(touchListener, this);
        this.m_touchListener = touchListener;

        this.mySpreadNode=null; //我的推广数据
        this.myPlayerNode=null; //我的玩家数据
        this.myYejiNode=null; //我的业绩数据
        this.myLastWeekNode=null; //我的奖励数据
        this.lingquJiangli=null; //领取奖励
        this.jiangliDesc=null; //奖励说明
        this.tixianMoney=0; //可提现金额
        this.initEx();

    },
    onEnter:function () {
        this._super();
        this.onUserInfoUpdateListener = cc.eventManager.addCustomListener(mpEvent.UpdateUserInfo, this.updateUserInfo.bind(this));
        mpGD.netHelp.addNetHandler(this);
    },
    onExit:function () {
        this._super();
        cc.eventManager.removeListener(this.onUserInfoUpdateListener);
        mpGD.netHelp.removeNetHandler(this);
    },
    updateUserInfo: function () {

    },
    onTouchBegan:function(touch, event) {

        function isTouchInside(owner,touch) {
            if(!owner || !owner.getParent()){
                return false;
            }
            var touchLocation = touch.getLocation(); // Get the touch position
            touchLocation = owner.getParent().convertToNodeSpace(touchLocation);
            return cc.rectContainsPoint(owner.getBoundingBox(), touchLocation);
        }
        var target = event.getCurrentTarget();
        if(!target.isVisible() || (!isTouchInside(target,touch))){
            return false;
        }
        return true;
    },

    initEx:function () {

        this.size(mpV.w,mpV.h);
        new cc.Sprite("res/plaza1v1/images/main_bg.png").to(this).pp();
        new cc.Sprite("res/plaza1v1/images/tuiguang/bgsd.png").to(this).anchor(0.5,0.5).pp(0.5,0.5);
        new cc.Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_bg_left.png").to(this).anchor(0,0.5).pp(0,0.5).qscale(0.72);
        var self = this;
        var backBtn = new FocusButton("res/plaza1v1/images/tuiguang/icon_fanhui.png","","",ccui.Widget.LOCAL_TEXTURE);
        backBtn.to(this).pp(0.05,0.935).qscale(0.8);
        backBtn.addTouchEventListener(function (sender, type) {
            if (type != ccui.Widget.TOUCH_ENDED) return;
            self.removeFromParent();
        })
        // new cc.LabelTTF("测试",GFontDef.fontName,32).to(this).pp(0.5,0.7);
        // var kkk = new cc.LabelTTF("测试","res/plaza1/v1/images/tuiguang/Text.ttf", 32).to(this).pp();

        var x = 0.13;
        var cx = 0.015;

        var y = 0.8;
        var cy = 0.13;

        this.leftBtns = [];

        var btn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_fang_lan.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png",ccui.Widget.LOCAL_TEXTURE);
        this.leftBtns.push(btn);
        btn.to(this).pp(x,y).qscale(0.6);
        btn.setTitleText("我的推广");
        btn.setTitleFontSize(64);
        btn.tag = 10;
        btn.addTouchEventListener(this.buttonTouchEndEvents, this);

        var btn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_fang_lan.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png",ccui.Widget.LOCAL_TEXTURE);
        this.leftBtns.push(btn);

        btn.to(this).pp(x - cx,y-cy).qscale(0.6);
        btn.setTitleText("我的玩家");
        btn.setTitleFontSize(64);
        btn.tag = 11;
        btn.addTouchEventListener(this.buttonTouchEndEvents, this);

        var btn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_fang_lan.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png",ccui.Widget.LOCAL_TEXTURE);
        this.leftBtns.push(btn);

        btn.to(this).pp(x - 2 * cx,y - 2 * cy).qscale(0.6);
        btn.setTitleText("我的业绩");
        btn.setTitleFontSize(64);
        btn.tag = 12;
        btn.addTouchEventListener(this.buttonTouchEndEvents, this);

        var btn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_fang_lan.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png",ccui.Widget.LOCAL_TEXTURE);
        this.leftBtns.push(btn);

        btn.to(this).pp(x - 2 * cx,y - 3 * cy).qscale(0.6);
        btn.setTitleText("我的奖励");
        btn.setTitleFontSize(64);
        btn.tag = 13;
        btn.addTouchEventListener(this.buttonTouchEndEvents, this);

        var btn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_fang_lan.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png",ccui.Widget.LOCAL_TEXTURE);
        this.leftBtns.push(btn);

        btn.to(this).pp(x - cx, y - 4 * cy).qscale(0.6);
        btn.setTitleText("领取奖励");
        btn.setTitleFontSize(64);
        btn.tag = 14;
        btn.addTouchEventListener(this.buttonTouchEndEvents, this);

        var btn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_fang_lan.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png","res/plaza1v1/images/tuiguang/Public_btn_fang_huang.png",ccui.Widget.LOCAL_TEXTURE);
        this.leftBtns.push(btn);

        btn.to(this).pp(x,y - 5 * cy).qscale(0.6);
        btn.setTitleText("奖励说明");
        btn.setTitleFontSize(64);
        btn.tag = 15;
        btn.addTouchEventListener(this.buttonTouchEndEvents, this);

        //模拟点击第一个
        this.setLeftSelected(this.leftBtns[0]);

    },

    setLeftSelected:function (btn) {

        for (var i = 0; i < this.leftBtns.length; i ++) {
            var cuBtn = this.leftBtns[i];
            cuBtn.setNormal();

            //var content = this["content_" + (cuBtn.tag - 10)];
            //content && content.hide();
        }
        btn.setSelected();
        this.mySpreadNode && this.mySpreadNode.setVisible(false);
        this.myPlayerNode && this.myPlayerNode.setVisible(false);
        this.myYejiNode && this.myYejiNode.setVisible(false);
        this.myLastWeekNode&&this.myLastWeekNode.setVisible(false);
        this.lingquJiangli&&this.lingquJiangli.setVisible(false);
        this.jiangliDesc && this.jiangliDesc.setVisible(false);
        if(btn.tag==10)
        {
            if(this.mySpreadNode==null)
            {
                //请求我的推广数据
                //console.log("请求我的推广数据");
                mpGD.netHelp.requestGetProxyInfo();
                mpApp.showWaitLayer("正在获取数据， 请稍候");
            }
            else
            {
                this.mySpreadNode.setVisible(true);
            }
        }
        else if(btn.tag==11)
        {
            if(this.myPlayerNode==null)
            {
                this.build_1();
                //请求我的玩家数据
                //console.log("请求我的玩家数据");
                mpGD.netHelp.requestGetProxyPlayer(null,this.pageIndex * this.queryCount, this.queryCount);
                mpApp.showWaitLayer("正在获取数据， 请稍候");
            }
            else
            {

                this.myPlayerNode.setVisible(true);
            }
        }
        else if(btn.tag==12)
        {
            if(this.myYejiNode==null)
            {
                //this.build_2();
                //请求我的业绩数据
                console.log("请求我的玩家数据");
                mpGD.netHelp.requestGetProxyYeji();
                mpApp.showWaitLayer("正在获取数据， 请稍候");
            }
            else
            {

                this.myYejiNode.setVisible(true);
            }
        }
        else if(btn.tag==13)
        {
            if(this.myLastWeekNode==null)
            {
                //this.build_2();
                //请求我的业绩数据
                console.log("请求我的奖励数据");
                mpGD.netHelp.requestGetProxyLastWeekInfo();
                mpApp.showWaitLayer("正在获取数据， 请稍候");
            }
            else
            {

                this.myLastWeekNode.setVisible(true);
            }
        }
        else if(btn.tag==14)
        {
            if(this.lingquJiangli==null)
            {
                //this.build_2();
                //请求我的业绩数据
                console.log("请求领取奖励数据");
                mpGD.netHelp.requestGetLingquJiangli();
                mpApp.showWaitLayer("正在获取数据， 请稍候");
            }
            else
            {

                this.lingquJiangli.setVisible(true);
            }
        }
        else if(btn.tag==15)
        {
            if(this.jiangliDesc==null)
            {
                this.build_5();
//                //请求我的业绩数据
//                console.log("请求领取奖励数据");
//                mpGD.netHelp.requestGetLingquJiangli();
//                mpApp.showWaitLayer("正在获取数据， 请稍候");
            }
            else
            {

                this.jiangliDesc.setVisible(true);
            }
        }

//        var content = this["content_" + (btn.tag - 10)];
//        content && content.show();
//        if (!content) {
//            //this["content_" + (btn.tag - 10)] = this["build_" + (btn.tag - 10)]();
//            //this["content_" + (btn.tag - 10)].setCascadeOpacityEnabled(true)
//        };

    },
    buttonTouchEndEvents:function (sender, type) {

        if (type != ccui.Widget.TOUCH_ENDED) return;

        this.setLeftSelected(sender);

    },
    //初始化我的推广
    build_0:function (data,proxyUrl) {

        //console.log("我的推广数据"+data.t_all_streamy);

        var node = new cc.Node();
        node.anchor(0.5,0.5);
        node.size(mpV.w,mpV.h);
        node.to(this).pp();

        new cc.Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_biaoti.png").to(node).pp(0.85,0.925).qscale(0.8);

        var tableBG = new cc.Sprite("res/plaza1v1/images/tuiguang/public_tuiguang_biaoge05_wode.png").to(node).pp(0.63,0.75).qscale(0.68);

        new cc.LabelTTF("推广说明：推荐使用手机浏览器扫码或者复制推广链接到手机浏览器打开", "宋体", 24).to(node).pp(0.63,0.6);

        var _proxyUrl = proxyUrl;  //推广链接
        //console.log("获取到的推广链接======="+proxyUrl);
        //_proxyUrl=proxyUrl;
        //console.log("获取二维码"+ttutil.getQRCodeUrl(_proxyUrl));
        //保存二维码按钮
        var saveQRCode = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_dayuan_lan.png", "res/plaza1v1/images/tuiguang/Public_btn_dayuan_lan.png", "res/plaza1v1/images/tuiguang/Public_btn_dayuan_lan.png", ccui.Widget.LOCAL_TEXTURE);
        saveQRCode.setTitleText("保存二维码");
        saveQRCode.setTitleFontSize(58);
        saveQRCode.to(node).pp(0.4, 0.1).qscale(0.7).hide();
        var self = this;
        cc.loader.loadImg(ttutil.getQRCodeUrl(_proxyUrl), {isCrossOrigin: true}, (err, img) => {
            if (err) {
                //console.log("二维码加载失败", err, _proxyUrl);
                ToastSystemInstance.buildToast("二维码加载失败");
                return;
            }
            var qrCodeSprite = new cc.Sprite(img);
            self.qrCodeSprite = qrCodeSprite;
            qrCodeSprite.to(node).pp(0.4,0.375).qscale(0.7);
            saveQRCode.show();
        });


        //二维码
        //var qrCodeSprite = new cc.Sprite("res/2weima.jpg");
        //qrCodeSprite.to(node).pp(0.4,0.375);

        //保存二维码
        saveQRCode.addTouchEventListener(function (sender,type) {

            if (type == ccui.Widget.TOUCH_BEGAN) return sender.qscale(0.75);
            sender.qscale(0.7);
            if (type != ccui.Widget.TOUCH_ENDED) return;
            ToastSystemInstance.buildToast({text:"二维码已保存到系统相册中"});
            ttutil.getQRCodeUrl(_proxyUrl) && native.saveImageToLib(ttutil.getQRCodeUrl(_proxyUrl));

        });
        //邀请码
            new cc.LabelTTF("您的推广邀请码", "宋体", 28).to(node).anchor(0,0.5).pp(0.6,0.5);
            var inviteCodeLabel2 = new cc.LabelTTF(mpGD.userInfo.userID, "宋体", 28).to(node).anchor(0,0.5).pp(0.78,0.5);
            inviteCodeLabel2.setColor(cc.color("#ffcc2f"));
        //console.log(data.t_last_proxy_gameid);
        if(!data.t_last_proxy_gameid||data.t_last_proxy_gameid==0)
        {
            

            var inviteCodeLabel = new cc.LabelTTF("上级邀请码", "宋体", 28).to(node).anchor(0,0.5).pp(0.58,0.4);
            inviteCodeLabel.setVisible(true);

            var lastlastGameIDEditBox = mputil.buildEditBox("填写上级邀请码", "", cc.EDITBOX_INPUT_MODE_NUMERIC,cc.size(178, 24)).to(node).pp(0.78,0.4);
            lastlastGameIDEditBox.mpTip.setFontFillColor(cc.color(255,255,255));
            lastlastGameIDEditBox.setFontSize(16);
            lastlastGameIDEditBox.setMaxLength(10);
            //绑定上级按钮
            var bindBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_dayuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_dayuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_dayuan_huang.png",ccui.Widget.LOCAL_TEXTURE);
            bindBtn.setTitleText("确认绑定");
            bindBtn.setTitleFontSize(50);
            bindBtn.to(node).pp(0.93,0.4).qscale(0.4);
        
            bindBtn.addTouchEventListener(function (sender,type) {
                if (type == ccui.Widget.TOUCH_BEGAN) return sender.qscale(0.45);
                sender.qscale(0.4);
                if (type != ccui.Widget.TOUCH_ENDED) return;
                //console.log("aaaaaaaaa");
                var lastGameID=lastlastGameIDEditBox.getString();
                 if (!lastGameID || lastGameID.length > 8|| lastGameID.length < 4) {
                    ToastSystemInstance.buildToast("上级ID填写错误");
                }
                else {
                    mpApp.showWaitLayer("正在请求绑定");
                    mpGD.netHelp.requestBindLastProxyID(lastGameID);
                }
                //native.setClipboard(_proxyUrl);
                //ToastSystemInstance.buildToast({text:"已复制"+_proxyUrl+"到剪切板"})

            });
        }

        new cc.LabelTTF("推广链接", "宋体", 28).to(node).anchor(0,0.5).pp(0.6,0.3);

        var inviteBg = new cc.Scale9Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_lamps_01.png");
        inviteBg.to(node).anchor(0,0.5).pp(0.7,0.3);
        inviteBg.setCapInsets(cc.rect(20,20,20,180));
        inviteBg.setContentSize(cc.size(350,40));

        //推广链接
        var inviteLinkLabel = new cc.LabelTTF(proxyUrl, "宋体", 28).to(node).anchor(0,0.5).pp(0.71,0.3);

        //复制推广链接按钮
        var copyLink = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_dayuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_dayuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_dayuan_huang.png",ccui.Widget.LOCAL_TEXTURE);
        copyLink.setTitleText("复制推广链接");
        copyLink.setTitleFontSize(50);
        copyLink.to(node).pp(0.78,0.1).qscale(0.7);

        //复制推广链接
        copyLink.addTouchEventListener(function (sender,type) {
            if (type == ccui.Widget.TOUCH_BEGAN) return sender.qscale(0.75);
            sender.qscale(0.7);
            if (type != ccui.Widget.TOUCH_ENDED) return;

            native.setClipboard(_proxyUrl);
            ToastSystemInstance.buildToast({text:"已复制"+_proxyUrl+"到剪切板"})

        });

        function createTabelCell(titleColor, font) {
            var tempNode = new cc.Node();
            tempNode.anchor(0.5,0.5);
            tempNode.size(tableBG.cw() * 0.68,tableBG.ch() * 0.68 * 0.5);

            var parentID = new cc.LabelTTF("上级ID", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(1 / 12,0.5);
            titleColor && parentID.setColor(titleColor);

            var ID = new cc.LabelTTF("ID", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(3 / 12,0.5);
            titleColor && ID.setColor(titleColor);

            var teamNumber = new cc.LabelTTF("团队人数", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(5 / 12,0.5);
            titleColor && teamNumber.setColor(titleColor);

            var myPlayer = new cc.LabelTTF("直属玩家", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(7 / 12,0.5);
            titleColor && myPlayer.setColor(titleColor);

            var dayAdd = new cc.LabelTTF("今日新增", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(9 / 12,0.5);
            titleColor && dayAdd.setColor(titleColor);

            var dayActive = new cc.LabelTTF("今日活跃", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(11 / 12,0.5);
            titleColor && dayActive.setColor(titleColor);

            tempNode.parentIDLabel = parentID;
            tempNode.IDLabel = ID;
            tempNode.teamNumLabel = teamNumber;
            tempNode.myPlayer = myPlayer;
            tempNode.dayAddLabel = dayAdd;
            tempNode.dayActiveLabel = dayActive;

            return tempNode;
        }

        var tableTitleNode = createTabelCell(cc.color(255,255,255), 28);
        tableTitleNode.to(node).p(tableBG.x,tableBG.y + tableTitleNode.ch() / 2);

        //表格赋值单元
        var tableValueNode = createTabelCell(cc.color("#ffcc2f"), 28);
        tableValueNode.to(node).p(tableBG.x,tableBG.y - tableValueNode.ch() / 2);

        //案例
        if(data.t_last_proxy_gameid==0)
        {
            tableValueNode.parentIDLabel.setString("无");
        }
        else
        {
            tableValueNode.parentIDLabel.setString(data.t_last_proxy_gameid);
        }
        tableValueNode.IDLabel.setString(mpGD.userInfo.gameID);
        tableValueNode.teamNumLabel.setString(data.t_team_count);
        tableValueNode.myPlayer.setString(data.t_regCount);
        tableValueNode.dayAddLabel.setString(data.t_todayRegCount);
        tableValueNode.dayActiveLabel.setString(data.t_activeNum);
        this.mySpreadNode=node;
        node.setCascadeOpacityEnabled(true);

    },

    //我的玩家
    build_1:function () {

        //console.log("我的玩家数据++++"+data[0].nickname);
        var node = new cc.Node();
        node.anchor(0.5,0.5);
        node.size(mpV.w,mpV.h);
        node.to(this).pp();

        new cc.Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_biaoti.png").to(node).pp(0.85,0.925).qscale(0.8);

        //var tipLabel = new cc.LabelTTF("温馨提示：我的玩家数据每五分钟刷新一次。", "宋体", 14).to(node).anchor(0,0.5).pp(0.35,0.9);
        var tipLabel = new cc.LabelTTF("温馨提示：如果玩家没有业绩数据在本页面不显示。", "宋体", 14).to(node).anchor(0,0.5).pp(0.35,0.9);
        tipLabel.setColor(cc.color("#ffd781"));

        var tableBG = new cc.Sprite("res/plaza1v1/images/tuiguang/public_tuiguang_biaoge04_wanjia.png").to(node).pp(0.625,0.5).qscale(0.68);
        this.myPlayerTableBG=tableBG;
        var queryBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_xiaoyuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_xiaoyuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_xiaoyuan_huang.png",ccui.Widget.LOCAL_TEXTURE);
        queryBtn.setTitleText("查询");
        queryBtn.setTitleFontSize(40);
        queryBtn.to(node).pp(0.325,0.0725).qscale(0.7);

        var bg = new cc.Scale9Sprite("res/plaza1v1/images/tuiguang/InputFieldBackground_d1.png");
        bg.setContentSize(cc.size(300,45));
        bg.setCapInsets(cc.rect(10,10,10,10));

        var editBox = new FocusEditBox(cc.size(300,45), bg);
        editBox.setFontSize(20);
        editBox.setPlaceHolder( "请输入玩家ID");
        editBox.setPlaceholderFontSize(20);
        editBox.setMaxLength(20);
        editBox.setFontColor(cc.color(0,0,0));
        editBox.setPlaceholderFontColor(cc.color(155,155,155));
        editBox.setInputMode(cc.EDITBOX_INPUT_MODE_PHONENUMBER);
        editBox.to(node).pp(0.5,0.0725);

        var lastPageBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_lan.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_lan.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_lan.png",ccui.Widget.LOCAL_TEXTURE);
        lastPageBtn.setTitleText("上一页");
        lastPageBtn.setTitleFontSize(40);
        lastPageBtn.to(node).pp(0.725,0.0725).qscale(0.7);

        var nextPageBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_huang.png",ccui.Widget.LOCAL_TEXTURE);
        nextPageBtn.setTitleText("下一页");
        nextPageBtn.setTitleFontSize(40);
        nextPageBtn.to(node).pp(0.925,0.0725).qscale(0.7);

        //当前页数
        var pageLabel = new cc.LabelTTF("1/1", "宋体", 28).to(node).pp(0.825,0.0725);
        this.pageLabel=pageLabel;
        var self = this;


        var tempNode = new cc.Node();
        tempNode.anchor(0.5,0.5);
        tempNode.size(self.myPlayerTableBG.cw() * 0.68,self.myPlayerTableBG.ch() * 0.68 * (1/7));

        var ID = new cc.LabelTTF("ID", "宋体", 28).to(tempNode).anchor(0.5,0.5).pp(1 / 14 + 0.01,0.5);
        ID.setColor(cc.color(255,255,255));

        var nickname = new cc.LabelTTF("玩家昵称", "宋体", 28).to(tempNode).anchor(0.5,0.5).pp(3 / 14+ 0.01,0.5);
        nickname.setColor(cc.color(255,255,255));

        var teamValue = new cc.LabelTTF("本周团队贡献", "宋体", 28).to(tempNode).anchor(0.5,0.5).pp(4.85 / 12,0.5);
        teamValue.setColor(cc.color(255,255,255));

        var playerValue = new cc.LabelTTF("本周玩家贡献", "宋体", 28).to(tempNode).anchor(0.5,0.5).pp(7.25 / 12,0.5);
        playerValue.setColor(cc.color(255,255,255));

        var weekNum = new cc.LabelTTF("本周人数", "宋体", 28).to(tempNode).anchor(0.5,0.5).pp(11 / 14- 0.01,0.5);
        weekNum.setColor(cc.color(255,255,255));

        var myPlayer = new cc.LabelTTF("直属玩家", "宋体", 28).to(tempNode).anchor(0.5,0.5).pp(13 / 14,0.5);
        myPlayer.setColor(cc.color(255,255,255));

        tempNode.IDLabel = ID;
        tempNode.nicknameLabel = nickname;
        tempNode.teamValueLabel = teamValue;
        tempNode.playerValueLabel = playerValue;
        tempNode.weekNumLabel = weekNum;
        tempNode.myPlayer = myPlayer;



        tempNode.to(node).p(self.myPlayerTableBG.x,self.myPlayerTableBG.y + self.myPlayerTableBG.ch() * 0.68 / 2 - tempNode.ch() / 2);
        //tableTitleNode.to(self.myPlayerNode).p(self.myPlayerTableBG.x,self.myPlayerTableBG.y + self.myPlayerTableBG.ch() * 0.68 / 2 - tableTitleNode.ch() / 2);

        //按钮事件
        function buttonEvents(sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) return sender.qscale(0.75);
            sender.qscale(0.7);
            if (type != ccui.Widget.TOUCH_ENDED) return;

            switch (sender) {
                //查询
                case queryBtn:
                    self.playerGameID=editBox.getString();

                    if (mputil.gameIDIsLegal(self.playerGameID)) {
                        //console.log("self.playerGameID==="+cc.isNumber(parseInt(self.playerGameID)));
                        mpGD.netHelp.requestGetProxyPlayer(self.playerGameID,0, 10);
                    }

                    break;
                //上一页
                case lastPageBtn:
                    if (self.pageIndex == 0) {
                        ToastSystemInstance.buildToast("没有上一页了");
                        return;
                    }
                    //console.log("上一页====="+self.pageIndex);
                    self.pageIndex--;
                    mpGD.netHelp.requestGetProxyPlayer(self.playerGameID,self.pageIndex * self.queryCount, self.queryCount);
                    self.pageLabel.setString("0/2");
                    self.pageLabel.setString((self.pageIndex+1)+"/"+Math.ceil(self.pageNum/self.queryCount));
                    break;
                //下一页
                case nextPageBtn:

                    if ((self.pageIndex+1) == Math.ceil(self.pageNum/self.queryCount)) {
                        ToastSystemInstance.buildToast("没有下一页了");
                        return;
                    }
                    self.pageIndex++;
                    console.log(" a "+self.pageIndex+" b "+ self.pageNum +" c "+self.queryCount);
                    mpGD.netHelp.requestGetProxyPlayer(self.playerGameID,self.pageIndex * self.queryCount, self.queryCount);
                    self.pageLabel.setString((self.pageIndex+1)+"/"+Math.ceil(self.pageNum/self.queryCount));
                    break;

            }

        }

        queryBtn.addTouchEventListener(buttonEvents);
        lastPageBtn.addTouchEventListener(buttonEvents);
        nextPageBtn.addTouchEventListener(buttonEvents);

        this.myPlayerNode=node;
        //return node;
    },
    createMyPlayerData:function(data,pageCount)
    {
        var self=this;
        if(data&&data.length>0){
            //console.log("data==b==="+data);
            //console.log(" self.pageNum===="+self.pageNum);
            //self.pageLabel.setString(self.pageIndex+"/"+Math.ceil(self.pageNum/self.queryCount));
            function createTabelCell(titleColor, font,i) {

                var tempNode = self.myPlayerNode.getChildByTag(7000+i);
                if(!tempNode){
                    //console.log("创建新的");
                    var tempNode = new cc.Node();
                    tempNode.anchor(0.5,0.5);
                    tempNode.setTag(7000+i);
                    tempNode.size(self.myPlayerTableBG.cw() * 0.68,self.myPlayerTableBG.ch() * 0.68 * (1/7));

                    var ID = new cc.LabelTTF("ID", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(1 / 14 + 0.01,0.5);
                    titleColor && ID.setColor(titleColor);

                    var nickname = new cc.LabelTTF("玩家昵称", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(3 / 14+ 0.01,0.5);
                    titleColor && nickname.setColor(titleColor);

                    var teamValue = new cc.LabelTTF("本周团队贡献", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(4.85 / 12,0.5);
                    titleColor && teamValue.setColor(titleColor);

                    var playerValue = new cc.LabelTTF("本周玩家贡献", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(7.25 / 12,0.5);
                    titleColor && playerValue.setColor(titleColor);

                    var weekNum = new cc.LabelTTF("本周人数", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(11 / 14- 0.01,0.5);
                    titleColor && weekNum.setColor(titleColor);

                    var myPlayer = new cc.LabelTTF("直属玩家", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(13 / 14,0.5);
                    titleColor && myPlayer.setColor(titleColor);

                    tempNode.IDLabel = ID;
                    tempNode.nicknameLabel = nickname;
                    tempNode.teamValueLabel = teamValue;
                    tempNode.playerValueLabel = playerValue;
                    tempNode.weekNumLabel = weekNum;
                    tempNode.myPlayer = myPlayer;


                    //标题不要用这个方法
                    tempNode.setIndex = function (index) {
                        tempNode.p(self.myPlayerTableBG.x,self.myPlayerTableBG.y + self.myPlayerTableBG.ch() * 0.68 / 2 - tempNode.ch() / 2 * ( 1 + 2 * index) + 7)
                    }
                    tempNode.to(self.myPlayerNode).setIndex(i + 1);
                    self.pageNum=pageCount;
                    self.pageLabel.setString((self.pageIndex+1)+"/"+Math.ceil(self.pageNum/self.queryCount));
                }

                return tempNode;
            }

            //var tableTitleNode = createTabelCell(cc.color(255,255,255), 28);
            //tableTitleNode.to(self.myPlayerNode).p(self.myPlayerTableBG.x,self.myPlayerTableBG.y + self.myPlayerTableBG.ch() * 0.68 / 2 - tableTitleNode.ch() / 2);


            for (var i = 0; i < 6; i ++) {
                //表格赋值单元
                var tableValueNode = createTabelCell(cc.color("#ffcc2f"), 22,i);

                //案例

                if(data[i]!=null)
                {
                    tableValueNode.IDLabel.setString(data[i].gameID);
                    tableValueNode.nicknameLabel.setString(data[i].nickname);
                    tableValueNode.teamValueLabel.setString(data[i].team_streamy);
                    tableValueNode.playerValueLabel.setString(data[i].my_streamy);
                    tableValueNode.weekNumLabel.setString(data[i].childcount);
                    tableValueNode.myPlayer.setString(data[i].parent_nickname);
                }
                else
                {
                    tableValueNode.IDLabel.setString("");
                    tableValueNode.nicknameLabel.setString("");
                    tableValueNode.teamValueLabel.setString("");
                    tableValueNode.playerValueLabel.setString("");
                    tableValueNode.weekNumLabel.setString("");
                    tableValueNode.myPlayer.setString("");
                }
            }
        }
        this.myPlayerNode.setCascadeOpacityEnabled(true);
    },
    //我的业绩
    build_2:function (week_data,day_data) {
        var node = new cc.Node();
        node.anchor(0.5,0.5);
        node.size(mpV.w,mpV.h);
        node.to(this).pp();

        new cc.Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_biaoti.png").to(node).pp(0.85,0.925).qscale(0.8);

        var tipLabel = new cc.LabelTTF("温馨提示：预估收益每小时更新，仅供参考，实际收益以\n\n周一9:30推广奖励为准。业绩数据每五分钟刷新一次", "宋体", 14).to(node).anchor(0,0.5).pp(0.35,0.925);
        tipLabel.setColor(cc.color("#ffd781"));


        var xiaoBg = new cc.Sprite("res/plaza1v1/images/tuiguang/table_yeji_xiao.png").to(node).pp(0.64,0.8)

        var daBg = new cc.Sprite("res/plaza1v1/images/tuiguang/table_yeji_da.png").to(node).pp(0.64,0.36)
        //小表格
        function createXiaoTabelCell(titleColor, font, rate) {
            var tempNode = new cc.Node();
            tempNode.anchor(0.5,0.5);
            tempNode.size(xiaoBg.cw(),xiaoBg.ch() * (rate));

            var totalYeJi = new cc.LabelTTF("本周总业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(1 / 10,0.5);
            titleColor && totalYeJi.setColor(titleColor);

            var teamYeJi = new cc.LabelTTF("本周团队业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(278/892,0.5);
            titleColor && teamYeJi.setColor(titleColor);

            var selfYeJi = new cc.LabelTTF("本周个人业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(478 / 892,0.5);
            titleColor && selfYeJi.setColor(titleColor);

            var maybeYeJi = new cc.LabelTTF("预估收益", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(652/892,0.5);
            titleColor && maybeYeJi.setColor(titleColor);

            var yuzhiEdu = new cc.LabelTTF("可预支额度", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(807/892,0.5);
            titleColor && yuzhiEdu.setColor(titleColor);


            tempNode.totalYeJi = totalYeJi;
            tempNode.teamYeJi = teamYeJi;
            tempNode.selfYeJi = selfYeJi;
            tempNode.maybeYeJi = maybeYeJi;
            tempNode.yuzhiEdu = yuzhiEdu;

            return tempNode;
        }

        var xiaoTableTitleNode = createXiaoTabelCell(cc.color(255,255,255), 28,2/5);
        xiaoTableTitleNode.to(node).p(xiaoBg.x,xiaoBg.y + xiaoBg.ch() / 2  - xiaoTableTitleNode.ch() / 2 - 3);

        var xiaoTableNode = createXiaoTabelCell(cc.color("#ffcc2f"), 28,3/5);
        xiaoTableNode.to(node).p(xiaoBg.x,xiaoBg.y - xiaoBg.ch() / 2  + xiaoTableNode.ch() / 2 - 3);
        //案例
        //console.log("业绩数据----------"+JSON.stringify(week_data));

        xiaoTableNode.totalYeJi.setString(week_data.t_all_streamy);
        xiaoTableNode.teamYeJi.setString(week_data.t_team_streamy);
        xiaoTableNode.selfYeJi.setString(week_data.t_my_streamy);
        xiaoTableNode.maybeYeJi.setString(week_data.t_profit);
        xiaoTableNode.yuzhiEdu.setString("0");


        //大表格
        function createDaTabelCell(titleColor, font) {
            var tempNode = new cc.Node();
            tempNode.anchor(0.5,0.5);
            tempNode.size(daBg.cw(),daBg.ch() / 9);

            var date = new cc.LabelTTF("时间", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(1 / 8,0.5);
            titleColor && date.setColor(titleColor);

            var totalYeJi = new cc.LabelTTF("日总业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(3/8,0.5);
            titleColor && totalYeJi.setColor(titleColor);

            var teamYeJi = new cc.LabelTTF("日团队业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(5/8,0.5);
            titleColor && teamYeJi.setColor(titleColor);

            var selfYeJi = new cc.LabelTTF("日个人业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(7/8,0.5);
            titleColor && selfYeJi.setColor(titleColor);


            tempNode.date = date;
            tempNode.teamYeJi = teamYeJi;
            tempNode.selfYeJi = selfYeJi;
            tempNode.totalYeJi = totalYeJi;

            tempNode.setIndex = function (index) {
                tempNode.to(node).p(daBg.x,daBg.y + daBg.ch() / 2  - 50 - tempNode.ch() / 2 * (1 + 2 * index) );
            }

            return tempNode;
        }

        var daTableTitleNode = createDaTabelCell(cc.color(255,255,255), 28);
        daTableTitleNode.to(node).p(daBg.x,daBg.y + daBg.ch() / 2  - daTableTitleNode.ch() / 2 + 3);
        if(day_data)
        {
            for (var i = 0; i < day_data.length; i ++) {
                var daTableNode = createDaTabelCell(cc.color("#ffcc2f"), 28);
                daTableNode.setIndex(i);
                //案例
                daTableNode.totalYeJi.setString(day_data[i].all_streamy);
                daTableNode.teamYeJi.setString(day_data[i].team_streamy);
                daTableNode.selfYeJi.setString(day_data[i].my_streamy);
                daTableNode.date.setString(day_data[i].addtime);
            }
        }

        this.myYejiNode=node;
        this.myYejiNode.setCascadeOpacityEnabled(true);
        //return node;
    },
    //我的奖励
    build_3:function (data) {
        var node = new cc.Node();
        node.anchor(0.5,0.5);
        node.size(mpV.w,mpV.h);
        node.to(this).pp();

        new cc.Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_biaoti.png").to(node).pp(0.85,0.925).qscale(0.8);

        var wodeBg = new cc.Sprite("res/plaza1v1/images/tuiguang/table_wode.png").to(node).pp(0.61,0.5)
        //大表哥
        function createDaTabelCell(titleColor, font) {
            var tempNode = new cc.Node();
            tempNode.anchor(0.5,0.5);
            tempNode.size(wodeBg.cw(),wodeBg.ch() / 4);

            var date = new cc.LabelTTF("发送时间", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(100 / 914,0.5);
            titleColor && date.setColor(titleColor);

            var totalYeJi = new cc.LabelTTF("上周总业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(314/914,0.5);
            titleColor && totalYeJi.setColor(titleColor);

            var teamYeJi = new cc.LabelTTF("上周团队业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(550/914,0.5);
            titleColor && teamYeJi.setColor(titleColor);

            var selfYeJi = new cc.LabelTTF("上周个人业绩", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(794/914,0.5);
            titleColor && selfYeJi.setColor(titleColor);


            tempNode.date = date;
            tempNode.teamYeJi = teamYeJi;
            tempNode.selfYeJi = selfYeJi;
            tempNode.totalYeJi = totalYeJi;

            tempNode.setIndex = function (index) {
                tempNode.to(node).p(wodeBg.x,wodeBg.y + wodeBg.ch() / 2 - tempNode.ch() / 2 * (1 + 2 * index) );
            }

            return tempNode;
        }

        var wodeTableTitleNode = createDaTabelCell(cc.color(255,255,255), 28);
        wodeTableTitleNode.setIndex(0);

        var wodeTableTitleNode2 = createDaTabelCell(cc.color(255,255,255), 28);
        wodeTableTitleNode2.setIndex(2);

        wodeTableTitleNode2.totalYeJi.setString("上周奖励");
        wodeTableTitleNode2.teamYeJi.setString("上周已预支");
        wodeTableTitleNode2.selfYeJi.setString("上周实际奖励");
        wodeTableTitleNode2.date.setString("状态");



        var wodeTableNode = createDaTabelCell(cc.color(255,255,255), 28);
        wodeTableNode.setIndex(1);

        wodeTableNode.totalYeJi.setString(data.t_all_streamy);
        wodeTableNode.teamYeJi.setString(data.t_team_streamy);
        wodeTableNode.selfYeJi.setString(data.t_my_streamy);
        if(data.t_datetime)
            wodeTableNode.date.setString(data.t_datetime);
        else
            wodeTableNode.date.setString("无");

        var wodeTableNode2 = createDaTabelCell(cc.color(255,255,255), 28);
        wodeTableNode2.setIndex(3);

        wodeTableNode2.totalYeJi.setString(data.t_jiangli);
        wodeTableNode2.teamYeJi.setString(data.t_blocked_money);
        wodeTableNode2.selfYeJi.setString(data.t_jiangli);
        wodeTableNode2.date.setString(data.t_state);

        this.myLastWeekNode=node;
        this.myLastWeekNode.setCascadeOpacityEnabled(true);
        //return node;
    },
    //领取奖励
    build_4:function (tixan_log,tixian_info) {
        var node = new cc.Node();
        node.anchor(0.5,0.5);
        node.size(mpV.w,mpV.h);
        node.to(this).pp();

        new cc.Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_biaoti.png").to(node).pp(0.85,0.925).qscale(0.8);

        var tiXianBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_huang.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_huang.png",ccui.Widget.LOCAL_TEXTURE);
        tiXianBtn.setTitleText("申请提现");
        tiXianBtn.setTitleFontSize(40);
        tiXianBtn.to(node).pp(0.525,0.0725).qscale(0.7);


        var yuZhiBtn = new FocusButton("res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_lan.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_lan.png","res/plaza1v1/images/tuiguang/Public_btn_zhongyuan_lan.png",ccui.Widget.LOCAL_TEXTURE);
        yuZhiBtn.setTitleText("申请预支");
        yuZhiBtn.setTitleFontSize(40);
        yuZhiBtn.to(node).pp(0.725,0.0725).qscale(0.7);

        var self = this;

        //按钮事件
        function buttonEvents(sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) return sender.qscale(0.75);
            sender.qscale(0.7);
            if (type != ccui.Widget.TOUCH_ENDED) return;

            switch (sender) {
                //申请提现
                case tiXianBtn:{
                    //console.log("ssssssssss==="+self.tixianMoney);
                    new MPMainTuiGuangApplyLayer(TGApplyType.TX,self.tixianMoney).to(cc.director.getRunningScene(),100);

                };break;
                //申请预支
                case yuZhiBtn:{
                    new MPMainTuiGuangApplyLayer(TGApplyType.YZ,self.tixianMoney).to(cc.director.getRunningScene(),100);

                };break;


            }

        }

        tiXianBtn.addTouchEventListener(buttonEvents);
        yuZhiBtn.addTouchEventListener(buttonEvents);

        var title = new cc.LabelTTF("申请记录",GFontDef.fontName,32);
        title.setColor(cc.color("#ffbc14"));
        title.to(node).pp(0.62,0.85);

        var jiluDaBg = new cc.Sprite("res/plaza1v1/images/tuiguang/table_lingqu_da.png").to(node).pp(0.62,0.58)
        var jiluXiaoBg = new cc.Sprite("res/plaza1v1/images/tuiguang/table_lingqu_xiao.png").to(node).pp(0.62,0.23)

        //大表格
        function createDaTabelCell(titleColor, font) {
            var tempNode = new cc.Node();
            tempNode.anchor(0.5,0.5);
            tempNode.size(jiluDaBg.cw(),jiluDaBg.ch() / 6);

            var date = new cc.LabelTTF("申请时间", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(102 / 893,0.5);
            titleColor && date.setColor(titleColor);

            var model = new cc.LabelTTF("类型", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(256/893,0.5);
            titleColor && model.setColor(titleColor);

            var money = new cc.LabelTTF("申请金额", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(374/893,0.5);
            titleColor && money.setColor(titleColor);

            var orderID = new cc.LabelTTF("申请编号", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(598/893,0.5);
            titleColor && orderID.setColor(titleColor);

            var status = new cc.LabelTTF("状态", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(823/893,0.5);
            titleColor && status.setColor(titleColor);

            tempNode.date = date;
            tempNode.model = model;
            tempNode.money = money;
            tempNode.orderID = orderID;
            tempNode.status = status;

            tempNode.setIndex = function (index) {
                tempNode.to(node).p(jiluDaBg.x,jiluDaBg.y + jiluDaBg.ch() / 2 - 50 - tempNode.ch() / 2 * (1 + 2 * index) );
            }

            return tempNode;
        }

        var jiluTableTitleNode = createDaTabelCell(cc.color(255,255,255), 28);
        jiluTableTitleNode.to(node).p(jiluDaBg.x,jiluDaBg.y + jiluDaBg.ch() / 2 - jiluTableTitleNode.ch() / 2 * (1));
        //console.log("tixan_log[i].addtime====="+tixan_log[0].addtime);
        if(tixan_log)
        {
            for (var i = 0; i < tixan_log.length; i ++) {

                var jiluTableNode = createDaTabelCell(cc.color("#ffcc2f"), 28);
                jiluTableNode.setIndex(i);
                jiluTableNode.date.setString(tixan_log[i].addtime);
                var type=tixan_log[i].tixian_type==1?"支付宝":"余额";
                jiluTableNode.model.setString(type);
                jiluTableNode.money.setString(tixan_log[i].tixian_money);
                jiluTableNode.orderID.setString(tixan_log[i].id);
                var state=tixan_log[i].state==0?"申请中":tixan_log[i].state==1?"已完成":"已拒绝";
                jiluTableNode.status.setString(state);
            }
        }

        //小表格
        function createXiaoTabelCell(titleColor, font) {
            var tempNode = new cc.Node();
            tempNode.anchor(0.5,0.5);
            tempNode.size(jiluXiaoBg.cw(),jiluXiaoBg.ch() / 2);

            var ID = new cc.LabelTTF("ID", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(117 / 893,0.5);
            titleColor && ID.setColor(titleColor);

            var tiXianMoney = new cc.LabelTTF("可提现金额", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(405/893,0.5);
            titleColor && tiXianMoney.setColor(titleColor);

            var yuZhiMoney = new cc.LabelTTF("可预支金额", "宋体", font).to(tempNode).anchor(0.5,0.5).pp(732/893,0.5);
            titleColor && yuZhiMoney.setColor(titleColor);


            tempNode.ID = ID;
            tempNode.tiXianMoney = tiXianMoney;
            tempNode.yuZhiMoney = yuZhiMoney;


            tempNode.setIndex = function (index) {
                tempNode.to(node).p(jiluXiaoBg.x,jiluXiaoBg.y + jiluXiaoBg.ch() / 2 - 48 - tempNode.ch() / 2 * (1 + 2 * index) );
            }

            return tempNode;
        }

        var xiaoTableTitleNode = createXiaoTabelCell(cc.color(255,255,255), 28);
        xiaoTableTitleNode.to(node).p(jiluXiaoBg.x,jiluXiaoBg.y + jiluXiaoBg.ch() / 2 - xiaoTableTitleNode.ch() / 2 * (1) + 3);

        var xiaoTableNode = createXiaoTabelCell(cc.color("#ffcc2f"), 28);
        xiaoTableNode.setIndex(0);

        xiaoTableNode.ID.setString(mpGD.userInfo.gameID);
        if(tixian_info)
        {
            xiaoTableNode.tiXianMoney.setString(tixian_info.money);
            xiaoTableNode.yuZhiMoney.setString(tixian_info.yuzhiMoney);
            this.tixianMoney=tixian_info.money;
        }
        else
        {
            xiaoTableNode.tiXianMoney.setString(0);
            xiaoTableNode.yuZhiMoney.setString(0);
            this.tixianMoney=0;
        }

        this.lingquJiangli=node;
        this.lingquJiangli.setCascadeOpacityEnabled(true);


    },
    //奖励说明
    build_5:function () {
        var node = new cc.Node();
        node.anchor(0.5,0.5);
        node.size(mpV.w,mpV.h);
        node.to(this).pp();

        new cc.Sprite("res/plaza1v1/images/tuiguang/Public_tuiguang_biaoti.png").to(node).pp(0.85,0.925).qscale(0.8);

        var pageView = new ccui.ScrollView();
        // scrollView.to(node);

        var kk = 880;

        var img1 = new cc.Sprite("res/plaza1v1/images/tuiguang/tuiguang_content1.jpg").to(pageView).anchor(0,0).p(0,0).qscale(kk / 1280);
        //console.log("imagesPre========="+imagesPre);
        var img2 = new cc.Sprite("res/plaza1v1/images/tuiguang/"+imagesPre+"_tuiguang_content2.jpg").to(pageView).anchor(0,0).p(kk,0).qscale(kk / 1280 - 0.03525);

        pageView.setDirection(2);
        pageView.size(kk,890 / 1280 * kk);

        pageView.setClippingEnabled(false);
        pageView.setInnerContainerSize(cc.size(kk * 2, pageView.ch()));

        // 裁区域
        var clipper = new cc.ClippingNode();
        clipper.setAnchorPoint(0, 0);
        clipper.setContentSize(cc.size(pageView.cw() + 50,pageView.ch()));
        clipper.to(node).pp(0.3,0);


        var stencil = new cc.DrawNode();
        var rect = [cc.p(0, 0), cc.p(pageView.cw() + 50, 0), cc.p(pageView.cw() + 50, pageView.ch()), cc.p(0, pageView.ch())];
        stencil.drawPoly(rect, cc.color(255, 255, 255, 255), 1, cc.color(255, 255, 255, 255));
        clipper.setStencil(stencil);

        pageView.setClippingEnabled(false);
        pageView.to(clipper).anchor(0,0.5).pp(0,0.5);
        this.jiangliDesc=node;
        this.jiangliDesc.setCascadeOpacityEnabled(true);
        //return node;
    },
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.GetProxyInfo:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    //初始化我的推广数据
                    this.build_0(data.data,data.proxyUrl);
                }
                break;
            case mpNetEvent.GetProxyPlayer:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    this.createMyPlayerData(data.data,data.pageCount);
                }
                //this.mailInfoArray = data;
                //this.fillMessageData(data);
                //this.refreshFocus();
                break;
            case mpNetEvent.GetProxyYeji:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    this.build_2(data.week_data,data.day_data);
                }
                break;
            case mpNetEvent.GetProxyLastWeekInfo:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    this.build_3(data.data);
                }
                break;
            case mpNetEvent.GetLingquJiangli:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    this.build_4(data.tixan_log,data.tixian_info);
                }
                break;
            case mpNetEvent.ProxyTixian:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    if(data.tixianType==1)
                    {
                        mpApp.updateUserInfo({bankScore: data.bankScore,realname: data.realname,alipay_account: data.alipay_account});
                        ToastSystemInstance.buildToast("提现已申请成功，请等客服人员处理");
                    }
                    else
                    {
                        //更新用户信息
                        console.log("更新用户信息"+data.bankScore);
                        mpApp.updateUserInfo({bankScore: data.bankScore});
                        ToastSystemInstance.buildToast("提现到余额操作成功，请在保险箱里查收");
                    }
                    //重新请求一下数据
                    this.lingquJiangli.removeFromParent();
                    mpGD.netHelp.requestGetLingquJiangli();
                    mpApp.showWaitLayer("正在刷新数据， 请稍候");

                }
                break;
            case mpNetEvent.BindLastProxyID:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    //this.build_4(data.tixan_log,data.tixian_info);
                    ToastSystemInstance.buildToast("绑定成功，重新打开窗口刷新数据");
                    //mpGD.netHelp.requestGetProxyInfo();
                    //mpApp.showWaitLayer("正在刷新数据， 请稍候");
                }
                break;
        }
    },

})