var MPMainRoomCreateLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new cc.Sprite("res/images/room/diban.png");
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var panel = this.panel;

        this.runPanelAction();

        this.nowRequestModuleID=null;
        this.gamePort=null;
        this.roomInfoArray=null;
        
        this.selectRoomMinScore=500000;

        var closeBtn = new FocusButton("common_btn_x.png","","",ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(panel);
        closeBtn.x = panel.cw() - 30;
        closeBtn.y = panel.ch() - 30;
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var title = new cc.Sprite("res/images/room/hall_creatRoom_title.png").to(panel).pp(0.5,0.95)

        var leftContent = new cc.Sprite("#user_bg_left.png");
        leftContent.height = leftContent.ch() - 20;
        leftContent.to(this.panel).anchor(0,0).p(28,28);
        //左边游戏列表
        var leftScrollView = new ccui.ScrollView();
        leftScrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        leftScrollView.setTouchEnabled(true);
        leftScrollView.setBounceEnabled(true);
        leftScrollView.setClippingEnabled(true);
        leftScrollView.setSize(cc.size(leftContent.cw(), leftContent.ch()));
        leftScrollView.pp(0,0);
        leftScrollView.setScrollBarEnabled(false);
        leftContent.addChild(leftScrollView);

        this.leftScrollView = leftScrollView;

        var rightContent = new ccui.Scale9Sprite("common_input_box.png");
        rightContent.setContentSize(505,350);
        rightContent.to(this.panel).anchor(0,0).p(270 + 28,125);
        //右边游戏选项
        var rightScrollView = new ccui.ScrollView();
        rightScrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        rightScrollView.setTouchEnabled(true);
        rightScrollView.setBounceEnabled(true);
        rightScrollView.setClippingEnabled(true);
        rightScrollView.setSize(cc.size(505, 350));
        rightScrollView.pp(0,0);
        rightScrollView.setScrollBarEnabled(false);
        rightContent.addChild(rightScrollView);
        this.rightScrollView = rightScrollView;

        var submitBtn = new FocusButton("common_btn_yes.png","","",ccui.Widget.PLIST_TEXTURE);
        submitBtn.to(this.panel).pp(0.65,0.13);
        submitBtn.tag = 1002;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));


        //请求自建房间游戏列表
        mpApp.showWaitLayer("请求自建房间游戏列表");
        mpGD.netHelp.requestSelfCreateGameList();

        //测试UI用数据，可根据需求再调整
//        var testData = [
//            {gameName:"二人牛牛",gameID:1,item:[
//                    {minMoney:0.5,maxMoney:4,desc:"初级房间"},
//                    {minMoney:4,maxMoney:100,desc:"中级房间"},
//                    {minMoney:100,maxMoney:1000,desc:"高级房间"}]},
//            {gameName:"百人牛牛",gameID:2,item:[
//                    {minMoney:0.5,maxMoney:4,desc:"初级房间"},
//                    {minMoney:4,maxMoney:100,desc:"中级房间"}]},
//            {gameName:"三公",gameID:3,item:[
//                    {minMoney:0.5,maxMoney:4,desc:"初级房间"},
//                    {minMoney:4,maxMoney:100,desc:"中级房间"},
//                    {minMoney:100,maxMoney:1000,desc:"高级房间"}]}];

        //this.testData = testData;
        //this.buildLeftItem(testData);
    },

    buttonPressedEvents:function (sender, type) {
        if(sender.tag == 1001 && type == ccui.Widget.TOUCH_ENDED)
        {
        //console.log("2222222222222");
            //mpApp.exitGameModules();
            
            
            //清除使用的资源
            if(this.nowRequestModuleID!=null&&this.roomInfoArray&&this.roomInfoArray.length>0)
            {
                //console.log("清除使用的资源"+this.nowRequestModuleID);
                
                //mpApp.clearAllRes();
                mpApp.clearSubGameJsFiles(this.nowRequestModuleID);
                //////////////////////////////////////////////////////////
                //把状态再标识为准备状态
                mpGD.subGameInfoMap[this.nowRequestModuleID].status = mpSubGameStatus.Ready;
                mpGD.mainScene.subGameIconMap[this.nowRequestModuleID].status = mpSubGameStatus.Ready;
                //加载大厅所需要的 spriteFrames
                //mpApp.loadHallSpriteFrames();
                mpGD.userStatus.roomID = null;
                mpGD.userStatus.moduleID = null;
            }
            this.closePanel();
         }
        //立即创建
        if(sender.tag == 1002 && type == ccui.Widget.TOUCH_ENDED){
                
                
             //mpGD.userStatus.cheatProof = false;
             //请求进入房间， 再请求坐下
             //mpGD.netHelp.requestEnterRoom(46);
             //mpGD.userStatus.cheatProof = true;
             //mpGD.netHelp.requestPlayGame(46);
             // mpGD.netHelp.requestUserSitDown(46, 59, 0, null, "1234");
             //mpApp.showWaitLayer("正在请求创建房间！");

             //直接请求房间列表， 等列表过来了， 再决定要不要加载js文件
              //mpGD.netHelp.requestRoomList(1);
              
              //console.log(

              //ToastSystemInstance.buildToast("选择了："+this.currentRightButton.roomID);
              
             //console.log("tempArray=aaaaaaaaaaaaaaa==="+JSON.stringify(this.roomInfoArray));
              //app.runRoomScene(this.nowRequestModuleID, this.roomInfoArray);
              //过滤
              //console.log("this.selectRoomMinScore======"+this.selectRoomMinScore);
              if(this.roomInfoArray==null)
              {
                    return;
              }
                if (mpGD.userInfo.score < this.selectRoomMinScore) {
                    ToastSystemInstance.buildToast("进入此游戏房间需要 " + this.selectRoomMinScore + CURRENCY + "！");
                }
                else
                {
                    //请求创建游戏
                    mpApp.showWaitLayer("正在请求创建游戏房间");
                    //var passWord=this.nowRequestModuleID+this.currentRightButton.roomID+
                    mpGD.netHelp.requestCreateGame(this.currentRightButton.roomID);
                    mpGD.userStatus.cheatProof = true;
                }
              return;
//            if(!this.currentLeftButton) return  ToastSystemInstance.buildToast("当前无法创建房间");

//            ToastSystemInstance.buildToast("选择了：" + this.testData[ this.currentLeftButton.tag - 10086].gameName +  "," +this.testData[ this.currentLeftButton.tag - 10086].item[this.currentRightButton.tag - 10010].desc);

//            new MPMainRoomGameUpdateTipLayer("您创建的游戏房间需要更新游戏，点击“确定”按钮立即更新，点击“退出”按钮解散房间！").show();

//            return;
        }

        if (sender.tag >= 10086 && type == ccui.Widget.TOUCH_ENDED){

            var index = sender.tag - 10086;
            
            if (sender == this.currentLeftButton) return;
            this.currentLeftButton.loadTextureNormal("charge_btn_main_default.png",ccui.Widget.PLIST_TEXTURE);
            sender.loadTextureNormal("charge_btn_main_default1.png",ccui.Widget.PLIST_TEXTURE);
            this.currentLeftButton = sender;
            //console.log("right----moduleID===="+sender.moduleID);
            
            if(this.roomInfoArray&&this.roomInfoArray.length>0)
            {
                //console.log("清除使用的资源"+this.nowRequestModuleID);
                //先把之前加载的游戏资源清除掉
                mpApp.clearSubGameJsFiles(this.nowRequestModuleID);
                //////////////////////////////////////////////////////////
                //把状态再标识为准备状态
                mpGD.subGameInfoMap[this.nowRequestModuleID].status = mpSubGameStatus.Ready;
                mpGD.mainScene.subGameIconMap[this.nowRequestModuleID].status = mpSubGameStatus.Ready;
                //加载大厅所需要的 spriteFrames
                //mpApp.loadHallSpriteFrames();
                mpGD.userStatus.roomID = null;
                mpGD.userStatus.moduleID = null;
            }
            
            //请求房间列表
            this.nowRequestModuleID=sender.moduleID;
            this.gamePort=sender.port;
            this.clearRightItems();
            this.roomInfoArray=null;

            if(mpGD.subGameInfoMap[sender.moduleID].status == mpSubGameStatus.Ready)
            {
                

                mpApp.showWaitLayer("请求游戏房间信息");
                mpGD.netHelp.requestCreateRoomList(sender.moduleID);
            }
            else
            {
                ToastSystemInstance.buildToast("此游戏需要更新，请更新后再试");
                return;
            }
            //this.buildRightItem(this.testData[index].item);
        }

    },
    //左边游戏列表
    buildLeftItem:function (data) {

        if (!data || typeof data != "object" || data.length == 0) return;

        var itemHeight = 90;
        var itemSpace = 10;

        this.leftScrollView.setInnerContainerSize(cc.size(this.leftScrollView.cw(),(itemHeight + itemSpace) * data.length));
        this.leftItems = [];
        for (var i = 0; i < data.length; ++i){

            var item = data[i];

            var button = new FocusButton("charge_btn_main_default.png","charge_btn_main_default1.png","charge_btn_main_default.png",ccui.Widget.PLIST_TEXTURE);
            button.to(this.leftScrollView).p(130,-itemSpace + this.leftScrollView.getInnerContainerSize().height - itemHeight / 2 - itemHeight * i - itemSpace * i);
            button.tag = 10086 + i;
            button.moduleID=item.moduleID;
            button.addTouchEventListener(this.buttonPressedEvents.bind(this));
            button.setTitleText(item.gameName);
            button.setTitleFontSize(40);
            button.setTitleColor(cc.color(0,0,0));
            button.getTitleRenderer().pp(0.5, 0.5);

            this.leftItems.push(button);
        }

        //设置第一个默认选中
        var firstButton = this.leftItems[0];
        this.nowRequestModuleID=this.leftItems[0].moduleID;
        firstButton.loadTextureNormal("charge_btn_main_default1.png",ccui.Widget.PLIST_TEXTURE);
        this.currentLeftButton = firstButton;

        if(mpGD.subGameInfoMap[this.leftItems[0].moduleID].status == mpSubGameStatus.Ready)
        {
            mpApp.showWaitLayer("请求游戏房间信息");
            mpGD.netHelp.requestCreateRoomList(this.leftItems[0].moduleID);
        }
        else
        {
            ToastSystemInstance.buildToast("此游戏需要更新，请更新后再试");
            return;
        }
        

        //this.buildRightItem(data[0].item);

    },
    //右边游戏选项
    buildRightItem:function (data) {
        
        if (!data || typeof data != "object" || data.length == 0) return;
        this.roomInfoArray=data;
        var itemHeight = 50;
        var itemSpace = 10;

        this.rightScrollView.setInnerContainerSize(cc.size(505,itemSpace + (itemHeight + itemSpace) * data.length));

        this.currentRightItems = [];

        for (var i = 0; i < data.length; ++i){
            var btn = new FocusButton();
            btn.ignoreContentAdaptWithSize(false);
            btn.setContentSize(505, itemHeight);
            btn.img = new cc.Sprite("res/images/room/hall_creatRoom_btn_unselected.png");
            btn.img.to(btn).anchor(0,0.5).p(10,itemHeight / 2);
            var item = data[i];
            btn.label = new cc.LabelTTF(item.roomName + " 限制 " + item.minScore + "元");
            btn.label.setColor(cc.color(255,255,255))
            btn.label.to(btn).anchor(0,0.5).p(65,itemHeight / 2);
            btn.tag = 10010 + i;
            btn.roomID=item.roomID;
            btn.minScore=item.minScore;
            btn.port=item.port;
            btn.to(this.rightScrollView).anchor(0,0.5).p(0, this.rightScrollView.getInnerContainerSize().height - itemHeight / 2 - (itemHeight + itemSpace) * i);
            this.currentRightItems.push(btn);
            btn.addTouchEventListener(this.rightButtonPressed.bind(this));
        }

        this.currentRightButton = this.currentRightItems[0];
        this.selectRoomMinScore=this.currentRightItems[0].minScore;
        this.gamePort=this.currentRightItems[0].port;
        this.currentRightButton.img.display("res/images/room/hall_creatRoom_btn_selected.png");
        this.currentRightButton.label.setColor(cc.color(0,0,0));


    },

    rightButtonPressed:function (sender,type) {

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                if (sender == this.currentRightButton) return true;
                sender.img.display("res/images/room/hall_creatRoom_btn_selected.png");
                sender.label.setColor(cc.color(0,0,0));

                ;break;
            case ccui.Widget.TOUCH_CANCELED:
                if (sender == this.currentRightButton) return true;
                sender.img.display("res/images/room/hall_creatRoom_btn_unselected.png");
                sender.label.setColor(cc.color(255,255,255));

                break;
            case ccui.Widget.TOUCH_ENDED:
                if (sender == this.currentRightButton) return true;

                sender.img.display("res/images/room/hall_creatRoom_btn_selected.png");
                sender.label.setColor(cc.color(0,0,0));
                this.currentRightButton.img.display("res/images/room/hall_creatRoom_btn_unselected.png");
                this.currentRightButton.label.setColor(cc.color(255,255,255));
                this.currentRightButton = sender;
                this.gamePort=sender.port;
                this.selectRoomMinScore=sender.minScore;
                break;
        }

    },

    clearRightItems:function () {
        this.rightScrollView.removeAllChildren();
    },


    
        /**
     * 当游戏列表消息过来时触发
     */
    onGameListMessage: function (data) {



        var tempArray = [];

        for (var i = 0, len = data.length; i < len; ++i) {
            if (!FocusBase.isTVDevice() || verticalScreenGameArray.indexOf(data[i].moduleEnName) < 0) {
                var gameInfo = new mpSubGameInfo(data[i]);
                // console.log(gameInfo.gameName + "====" + gameInfo.classID);

                //console.log("====" + JSON.stringify(gameInfo));
                tempArray.push(gameInfo);
            }
        }

        //console.log("测试UI用数据，可根据需求再调整"+mpGD.subGameInfoMap.length);
        //this.loadMPSubGameIcon(tempArray);
        //this.subGameManager.initData();
                //测试UI用数据，可根据需求再调整
//        var testData = [
//            {gameName:"二人牛牛",gameID:1,item:[
//                    {minMoney:0.5,maxMoney:4,desc:"初级房间"},
//                    {minMoney:4,maxMoney:100,desc:"中级房间"},
//                    {minMoney:100,maxMoney:1000,desc:"高级房间"}]},
//            {gameName:"百人牛牛",gameID:2,item:[
//                    {minMoney:0.5,maxMoney:4,desc:"初级房间"},
//                    {minMoney:4,maxMoney:100,desc:"中级房间"}]},
//            {gameName:"三公",gameID:3,item:[
//                    {minMoney:0.5,maxMoney:4,desc:"初级房间"},
//                    {minMoney:4,maxMoney:100,desc:"中级房间"},
//                    {minMoney:100,maxMoney:1000,desc:"高级房间"}]}];

        //his.testData = tempArray;
        this.buildLeftItem(tempArray);

    },
    //是否有子游戏在下载
    isSubGameDowning: function () {

        for (var moduleID in mpGD.subGameInfoMap) {
            if (mpGD.subGameInfoMap[moduleID]) {
                var status = mpGD.subGameInfoMap[moduleID].status;
                if (status == mpSubGameStatus.Downloading || status == mpSubGameStatus.CheckUpdate || status == mpSubGameStatus.Loading || status == mpSubGameStatus.Playing || status == mpSubGameStatus.CheckNewVing) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * 房间列表过来时触发
     */
    onRoomListMessage: function (data) {
        mpApp.removeWaitLayer();

        if (data.errMsg) {
            return;
        }

        if (data.room.length <= 0) {
            //如果 没有房间 直接在这边过滤掉
            ToastSystemInstance.buildToast("当前没有可进入的房间.");
            return;
        }

        //如果没有子游戏正在下载
        if (!this.isSubGameDowning()) {
            cc.log("游戏无更新,正在加载js文件");

            var self = this;
            // //先加载好js文件
            mpApp.loadSubGameJsFiles(self.nowRequestModuleID, function () {
                var roomArray = data.room;

                var tempArray = [];
                for (var i = 0, len = roomArray.length; i < len; ++i) {
                    var roomInfo = new mpRoomInfo(roomArray[i]);
                    roomInfo.moduleID = self.nowRequestModuleID;
                    tempArray.push(roomInfo);
                }

                tempArray.sort(function (a, b) {
                    return a.sortID > b.sortID ? 1 : -1
                });
                //运行子游戏的 roomScene
                mpGD.userStatus.moduleID = self.nowRequestModuleID;
                //mpApp.runSubGameRoomScene(self.nowRequestModuleID, tempArray);
                //console.log("tempArray===="+JSON.stringify(tempArray));
                //添加游戏所需要的资源（在游戏代码中运行）
                app.addRoomSceneFiles(self.nowRequestModuleID, tempArray)
                
                
            }, function () {
                mpApp.removeWaitLayer();
            });
            return true;
        }
        else {
            ToastSystemInstance.buildToast("此游戏需要更新，请更新后再试");
        }
    },
     
    onNetEvent: function (event, data) {
        switch (event) {
        case mpNetEvent.SelfCreateGameList:
                mpApp.removeWaitLayer();
                this.onGameListMessage(data);
                break;
        case mpNetEvent.GameCreateRoomList:
                //console.log(JSON.stringify(data));
                mpApp.removeWaitLayer();
                this.buildRightItem(data.room);
                var isSuccess = this.onRoomListMessage(data);
                if (!isSuccess) {
                    //进入子游戏失败 清除邀请数据
                    mpGD.inviteTable = null;
                }
                break;
        case mpNetEvent.EnterRoom:
            mpApp.removeWaitLayer();

            //if (!this.selectRoomInfo.cheatProof) {
                //运行桌子场景
                //if (!data.errMsg) {
                    //mpApp.runTableScene(this.selectRoomInfo);
                        //console.log("请求坐下===========");

                        //mpGD.netHelp.requestUserSitDown(46, 59, 0, null, "1234");
                // }
            //}
            break;
        case mpNetEvent.EnterGame:

            //mpApp.removeWaitLayer();
            if (!data.errMsg) {
                //console.log("this.gamePort====="+this.gamePort)
                mpGD.userStatus.tableID = data.tableID;
                //ToastSystemInstance.buildToast("房间密码 "+data.tablePwd+" 已复制到您的剪贴板中");
                var msg="房间密码 "+data.tablePwd+" 已复制到您的剪贴板中";
                //new MPMessageBoxLayer("通知", "复制完成", mpMSGTYPE.MB_OK, null).to(kefuLayer);
                var self=this;
                var serverIP=data.serverIP;

                native.setClipboard(data.tablePwd);
//                new MPMessageBoxLayer("提 示", msg, mpMSGTYPE.MB_OK, function () {
//                    mpApp.loadSubGame(self.nowRequestModuleID, serverIP, self.gamePort);
//                }).to(cc.director.getRunningScene());

                //8秒后自动进入
                var autoInRoom = setTimeout(() => {
                        //console.log("-----------------------");
                        tishikuang&&tishikuang.removeFromParent();
                        mpApp.loadSubGame(self.nowRequestModuleID, serverIP, self.gamePort);
                    }, 8000);

                var tishikuang = new MPMessageBoxLayer("提 示", msg, mpMSGTYPE.MB_OK, function () {
                    clearTimeout(autoInRoom);
                    //self.closePanel();
                    mpApp.loadSubGame(self.nowRequestModuleID, serverIP, self.gamePort);
                }).to(cc.director.getRunningScene());

                
                //mpApp.loadSubGame(this.nowRequestModuleID, data.serverIP, this.gamePort);
            }
                

            break;
        }
    },


})