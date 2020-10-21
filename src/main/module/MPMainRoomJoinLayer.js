var MPMainRoomJoinLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new cc.Sprite("res/images/room/diban2.png");
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var panel = this.panel;

        this.runPanelAction();

        this.inputCode = "";

        this.moduleID=null;
        this.roomID=null;
        this.gamePort=null;
        this.tableID=null;

        var closeBtn = new FocusButton("common_btn_x.png","","",ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(panel);
        closeBtn.x = panel.cw() - 30;
        closeBtn.y = panel.ch() - 30;
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));


        var bottomSpace = 25;
        var leftSpace = 20;
        var xSpace = 10;
        var ySpace = 10;

        var controls = ["reset",0,"delete",7,8,9,4,5,6,1,2,3];

        var inputs = [];
        this.inputs = inputs;

        for (var i = 0; i < 12; ++i){
            //控制面板按键
            var imgName = "res/images/room/" + controls[i] + ".png";
            var button = new FocusButton(imgName,"","",ccui.Widget.LOCAL_TEXTURE);
            button.addTouchEventListener(this.buttonPressedEvents.bind(this));
            var x = leftSpace + button.cw() / 2 + xSpace * (i % 3) + button.cw() * (i % 3);
            var y = bottomSpace + button.ch() / 2 + ySpace * (parseInt(i / 3)) + button.ch() * parseInt( i / 3);
            button.tTag = controls[i];
            button.to(this.panel).p(x,y);
            //输入框显示
            if (i < 6){

                var bgSprite = new cc.Sprite("res/images/room/clearing_smallBg.png");
                bgSprite.to(this.panel).p(40 + bgSprite.cw() / 2 + (bgSprite.cw() + 26) * i,450);

                var label = new cc.LabelTTF("-",GFontDef.fontName,40);
                label.to(bgSprite).pp();
                inputs.push(label);

            }

        }

    },

    buttonPressedEvents:function (sender, type) {

        if(sender.tag == 1001 && type == ccui.Widget.TOUCH_ENDED)
        {
            //清除使用的资源
            if(this.moduleID!=null)
            {
                //mpApp.clearAllRes();

                mpApp.clearSubGameJsFiles(this.moduleID);
                //////////////////////////////////////////////////////////
                //把状态再标识为准备状态
                mpGD.subGameInfoMap[this.moduleID].status = mpSubGameStatus.Ready;
                mpGD.mainScene.subGameIconMap[this.moduleID].status = mpSubGameStatus.Ready;
                //加载大厅所需要的 spriteFrames
                //mpApp.loadHallSpriteFrames();


                mpGD.userStatus.roomID = null;
                mpGD.userStatus.moduleID = null;
            }
            return this.closePanel();
        }
        if(type != ccui.Widget.TOUCH_ENDED) return;
        switch (sender.tTag) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:

                if(this.inputCode.length > 6) return;
                this.inputCode = this.inputCode + sender.tTag;

                if(this.inputCode.length == 6) {
                    this.inputFullFinish();
                }

                ;break;
            case "reset":

                this.inputCode = "";

                ;break;
            case "delete":
                if(this.inputCode.length == 0) break;
                this.inputCode = this.inputCode.substr(0,this.inputCode.length - 1);
                ;break;
        }
        this.pullText();

    },
    pullText:function () {
        for (var i = 0; i < 6; ++i){
            var label = this.inputs[i];
            label.setString("-");
        }
        for (var i = 0; i < this.inputCode.length; ++i){
            var label = this.inputs[i];
            label.setString(this.inputCode.substr(i,1));
        }
    },
    //输入满6位 做相应的操作
    inputFullFinish:function () {
        console.log(this.inputCode);
        //ToastSystemInstance.buildToast("输入完成"+ this.inputCode);

        

        mpGD.netHelp.requestJoinGameByPass(this.inputCode);
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
        //console.log("this.moduleID====a====="+this.moduleID);
        //如果没有子游戏正在下载
        if (!this.isSubGameDowning()) {
            cc.log("游戏无更新,正在加载js文件");
            //console.log("this.moduleID====b====="+this.moduleID);
            var self = this;
            // //先加载好js文件
            mpApp.loadSubGameJsFiles(this.moduleID, function () {
                var roomArray = data.room;

                var tempArray = [];
                for (var i = 0, len = roomArray.length; i < len; ++i) {
                    var roomInfo = new mpRoomInfo(roomArray[i]);
                    roomInfo.moduleID = this.moduleID;
                    tempArray.push(roomInfo);
                }

                tempArray.sort(function (a, b) {
                    return a.sortID > b.sortID ? 1 : -1
                });
                //运行子游戏的 roomScene
                //console.log("this.moduleID========="+self.moduleID);
                mpGD.userStatus.moduleID = self.moduleID;
                //mpApp.runSubGameRoomScene(self.nowRequestModuleID, tempArray);
                //console.log("tempArray===="+JSON.stringify(tempArray));
                //添加游戏所需要的资源（在游戏代码中运行）
                app.addRoomSceneFiles(self.moduleID, tempArray)
                self.roomInfoArray=tempArray;
                
            }, function () {
                mpApp.removeWaitLayer();
            });
            return true;
        }
        else {
            ToastSystemInstance.buildToast("此游戏需要更新，请更新后再试");
        }
    },
    //右边游戏选项
    buildRightItem:function (data) {

        if (!data || typeof data != "object" || data.length == 0) return;

        var self=this;

        this.currentRightItems = [];
        for (var i = 0; i < data.length; ++i){
            var item = data[i];
            //btn.roomID=item.roomID;
            //btn.minScore=item.minScore;
            //btn.port=item.port;
            if(self.roomID==item.roomID)
            {
                self.gamePort=item.port;
            }
        }
    },
    onNetEvent: function (event, data) {
        switch (event) {
        case mpNetEvent.JoinGameByPass:
                //mpApp.removeWaitLayer();
                //this.onGameListMessage(data);
                var self=this;


                if(self.moduleID!=null)
                {
                    //mpApp.clearAllRes();
                    console.log("清除资源清除资源");
                    mpApp.clearSubGameJsFiles(self.moduleID);
                    //////////////////////////////////////////////////////////
                    //把状态再标识为准备状态
                    mpGD.subGameInfoMap[self.moduleID].status = mpSubGameStatus.Ready;
                    mpGD.mainScene.subGameIconMap[self.moduleID].status = mpSubGameStatus.Ready;
                    //加载大厅所需要的 spriteFrames
                    //mpApp.loadHallSpriteFrames();


                    mpGD.userStatus.roomID = null;
                    mpGD.userStatus.moduleID = null;
                }

                if (!data.errMsg) {

                    //console.log("moduleID============="+data.moduleID);
                    //console.log("roomID============="+data.roomID);
                    console.log("roomID============="+ JSON.stringify(data));
                    if(mpGD.subGameInfoMap[data.moduleID].status == mpSubGameStatus.Ready)
                    {


                    new MPMessageBoxLayer("房间信息","房间信息："+data.roomInfo, mpMSGTYPE.MB_OKCANCEL,function (){
                        self.moduleID=data.moduleID;
                        self.roomID=data.roomID;
                        self.tableID=data.tableID;
                        //请求房间信息
                        mpApp.showWaitLayer("请求游戏房间信息");
                        mpGD.netHelp.requestCreateRoomList(data.moduleID);

                        
                    }
                    ,function (){
                        //点击了取消操作

                        //清除使用的资源
                        if(self.moduleID!=null)
                        {
                            //mpApp.clearAllRes();

                            mpApp.clearSubGameJsFiles(self.moduleID);
                            //////////////////////////////////////////////////////////
                            //把状态再标识为准备状态
                            mpGD.subGameInfoMap[self.moduleID].status = mpSubGameStatus.Ready;
                            mpGD.mainScene.subGameIconMap[self.moduleID].status = mpSubGameStatus.Ready;
                            //加载大厅所需要的 spriteFrames
                            //mpApp.loadHallSpriteFrames();
                            mpGD.userStatus.roomID = null;
                            mpGD.userStatus.moduleID = null;
                        }
                        self.closePanel();
                        }).to(cc.director.getRunningScene());


                        
                    }
                    else
                    {
                        ToastSystemInstance.buildToast("此游戏需要更新，请更新后再试");
                        return;
                    }
                }

                //请求一下房间信息
        


        
                
                
                break;
        case mpNetEvent.GameCreateRoomList:
               //console.log(JSON.stringify(data));
                mpApp.removeWaitLayer();
                this.buildRightItem(data.room);
                var isSuccess = this.onRoomListMessage(data);
                if (isSuccess) {
                    //进入子游戏失败 清除邀请数据
                    //console.log("进入子游戏");
                    mpApp.showWaitLayer("请求房间信息");
                    //请求坐下
                    //console.log("请求坐下请求坐下")
                    //console.log("this.roomID====="+this.roomID)
                    //console.log("this.inputCode====="+this.inputCode)
                    mpGD.netHelp.requestEnterRoom(this.roomID);
                    //console.log("this.tableID====="+this.tableID)
                    //mpGD.netHelp.requestSitdownByPass(this.roomID,this.inputCode,this.tableID);
                    //mpGD.userStatus.cheatProof = true;
                    //mpGD.inviteTable = null;
                }

                break;
        case mpNetEvent.EnterRoom:
                var self=this;
                mpApp.removeWaitLayer();
                    //运行桌子场景
                    if (!data.errMsg) {
                        mpGD.netHelp.requestSitdownByPass(self.roomID,self.inputCode,self.tableID);
                        mpGD.userStatus.cheatProof = true;
                    }
                break;
        case mpNetEvent.EnterGame:
            mpApp.removeWaitLayer();
            if (!data.errMsg) {
                console.log("this.gamePort====="+this.gamePort)
                mpGD.userStatus.tableID = data.tableID;
                //ToastSystemInstance.buildToast("房间密码 "+data.tablePwd+" 已复制到您的剪贴板中");
                var self=this;
                var serverIP=data.serverIP;
                mpApp.loadSubGame(self.moduleID, serverIP, self.gamePort);
            }
            break;

        }
    },
})