/**
 * Created by pear on 2017/9/5.
 */
var ChatDef = {
    fontName: "宋体",
    fontSize: 20,
    nameFontSize: 13,
    textAlign: cc.TEXT_ALIGNMENT_LEFT,
    fillStyle: cc.color(255, 244, 200, 255),
    textWidth: 400,
    expCount: 120,   //表情个数
    expFrameW: 442,  //表情框的宽度
    expFrameH: 330,   //表情框的高度
    expLine: 4,   //每个表情页的行数
    expColumn: 6, //每个表情页的列数
    expWidth: 442 / 6,
};

var Expression = cc.Node.extend({
    code: null,
    prePath: null,
    bg: null,
    exp: null,
    aniFrames: null,

    ctor: function (index) {
        this._super();
        this.code = "/#" + index + "/";
        this.prePath = index + "/";

        this.initEx();
    },

    initEx: function () {
        this.size(ChatDef.expWidth, ChatDef.expWidth);
        this.bg = new cc.Sprite("#exp_select.png").anchor(0, 0).to(this).p(0, 0).hide();
        var bgSize = this.bg.getContentSize();
        this.bg.setScale(ChatDef.expWidth / bgSize.width, ChatDef.expWidth / bgSize.height);

        this.exp = new cc.Sprite("#" + this.prePath + "0.png").anchor(0.5, 0.5).to(this).pp().qscale(1.2);

        this.aniFrames = [];
        var count = 0;
        var nextFrame = cc.spriteFrameCache.getSpriteFrame(this.prePath + count + ".png");
        while (nextFrame) {
            this.aniFrames.push(nextFrame);
            count++;
            nextFrame = cc.spriteFrameCache.getSpriteFrame(this.prePath + count + ".png");
        }

    },

    playAnimation: function () {
        var animation = cc.Animation(this.aniFrames, 0.15);
        var animate = cc.Animate(animation);
        var action = animate.repeatForever();

        this.exp.runAction(action);
    },

    stopAnimation: function () {
        this.exp.stopAllActions();
        this.exp.display("#" + this.prePath + "0.png");
    },
});


var ChatMoudle = cc.Layer.extend({

    sceneFlag: null,  //场景标识
    showChatBtn: null,  //聊天界面显示按钮
    chatFrame: null,    //聊天框
    chatFrameSize: null,  //
    systemMsgList: null,   //系统频道信息listview
    editBox: null,   //聊天编辑框
    sendBtn: null,   //聊天发送按钮
    systemNode: null,  //系统频道模块
    channelRoomNode: null,  //房间信息模块
    friendNode: null,  //好友模块
    friendBtn: null, //好友按钮
    hideChatBtn: null, //隐藏聊天界面按钮
    voiceBtn: null, //语音按钮

    roomPlayerListView: null,

    expBtn: null,   //表情按钮
    expNode: null,  //表情框

    roomPlayerArray: null,  //保存当前房间玩家信息
    friendArray: null,  //保存好友信息
    friendListView: null, //好友list

    curSelectedFriendItem: null,  //当前选中的好友
    curChannelBtn: null, //

    feedbackNode: null, //反馈模块
    feedbackMsgList: null, //反馈模块信息list

    existMsgLog: null,  //已经创建的消息id


    systemChannel: null, //系统频道
    friendChannel: null, //好友频道
    roomChannel: null,  //房间频道
    feedbackChannel: null, //反馈频道

    isVoiceNode: null, //正在录音的提示
    volumes: null,

    playingVoice: null,  //正在播放的语音句柄

    expPageArray: null,  //显示表情页数的点
    curPagePoint: null,  //当前页点

    hideExpFrameLayer: null, //用来隐藏表情框，只要没点到表情框就隐藏
    bottomShadow: null,   //聊天底部遮罩

    hideChatFrameLayer: null,

    onUserEnterListener: null,  //
    onUserLeaveListener: null,


    ctor: function (sceneFlag, pos, chatFrameSize) {
        this._super();

        if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
            mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");
        }

        this.sceneFlag = sceneFlag || "subgame";
        this.chatFrameSize = chatFrameSize || cc.size(300, 300);
        this.initEx(pos || cc.p(0, 0.5));

        if (this.sceneFlag == "subgame") {
            this.onUserEnterListener = cc.eventManager.addCustomListener("onUserEnterCallChat", this.onPlayerEnter.bind(this));
            this.onUserLeaveListener = cc.eventManager.addCustomListener("onUserLeaveCallChat", this.onPlayerLeave.bind(this));
        }

        mpGD.saNetHelper.getFriendList();

    },

    onExit: function () {
        this._super();
        // cc.log("fuck");
        // cc.sys.cleanScript("src/extend/ChatMoudle.js");
        // cc.loader.loadJs("src/extend/ChatMoudle.js");

        if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
            mpGD.saNetHelper.removeNetHandler(this);
        }

        this.removeListener("onUserEnterListener");
        this.removeListener("onUserLeaveListener");

    },

    initEx: function (pos) {
        var self = this;

        this.existMsgLog = [];
        // this.existChatLog = [];
        // this.existFeedback = [];
        // this.existSystem = [];

        this.chatFrame = new cc.Sprite("#chat_frm_bg.png").anchor(0, 0.5).to(this, 10).p(-740, cc.winSize.height / 2);
        this.chatFrame.bindTouch({
            swallowTouches: true,
            onTouchBegan: function () {
                return true;
            }
        });

        // if (this.sceneFlag == "dating")
        // {
        //     // this.chatFrame.setScale(1.3);
        // }

        var channelName
        if (this.sceneFlag == "subgame") {
            // channelName = ["system", "friend", "room", "feedback"];
            channelName = ["system", "friend", "room","friendRequest"];
            this.showChatBtn = new ccui.Button("showChatBtn.png", "showChatBtn.png", "", ccui.Widget.PLIST_TEXTURE).anchor(0, 0.5).to(this).pp(0, 0.5);
            this.showChatBtn.addClickEventListener(this.showChatFrame.bind(this));
            this.hideChatBtn = new ccui.Button("chat_hide_btn.png", "chat_hide_btn.png", "", ccui.Widget.PLIST_TEXTURE).to(this.chatFrame, -1).p(675, 250);
            this.hideChatBtn.addClickEventListener(this.hideChatFrame.bind(this));

            this.hideChatFrameLayer = new cc.Layer().to(this, 0).hide();
            this.hideChatFrameLayer.bindTouch({
                swallowTouches: true,
                onTouchBegan: function () {
                    self.hideChatFrame();
                    return true;
                }
            });
        }
        else if (this.sceneFlag == "dating") {
            // channelName = ["system", "friend", "feedback"];
            channelName = ["system", "friend","friendRequest"]; //屏蔽反馈频道
            this.chatFrame.p(mpV.w / 2 - 360, cc.winSize.height / 2);
        }

        new cc.Sprite("#chat_frm_top.png").to(this.chatFrame).pp(0.5, 0.95);

        for (var i = 0; i < channelName.length; i++) {
            switch (channelName[i]) {
                case "system":
                    this.initSystemChannel(2 + i * 120, 419);
                    break;
                case "friend":
                    this.initFriendChannel(2 + i * 120, 419);
                    break;
                case "room":
                    this.initRoomChannel(2 + i * 120, 419);
                    break;
                case "feedback":
                    this.initFeedbackChannel(2 + i * 120, 419);
                    break;
                case "friendRequest":
                    this.initFriendRequestChannel(2 + i * 120, 419);
                    break;
            }

        }

        // this.curChannelBtn = this.friendChannel.btn;
        // this.onClickChangeButton(this.systemChannel.btn);
        // this.curChannelBtn.display(this.curChannelBtn.selectImg);


        this.bottom = new cc.Sprite("#chat_frm_bottom.png").to(this.chatFrame).pp(0.5, 0.075);
        this.bottomShadow = new cc.LayerColor(cc.color(0, 0, 0, 100)).to(this.bottom, 10000);
        this.bottomShadow.size(this.bottom.cw(), this.bottom.ch());

        var editBoxBg = new cc.Sprite("#editbox.png").anchor(0, 0).to(this.bottom).p(80, 4);
        this.editBox = this.newEditBox("输入聊天信息").to(this.bottom).p(85, 14);

        this.sendBtn = new ccui.Button("send_btn.png", "send_btn_light.png", "", ccui.Widget.PLIST_TEXTURE).anchor(0.5, 0.5).to(this.bottom).p(485, 30);
        this.sendBtn.addClickEventListener(this.sendMessage.bind(this));

        // this.voiceBtn = new ccui.Button("voice_btn.png","voice_btn_light.png","",ccui.Widget.PLIST_TEXTURE).anchor(0.5,0.5).to(bottom).p(35,30);
        // this.voiceBtn.addClickEventListener(this.sendMessage.bind(this));

        this.initVoiceBtn();


        this.expBtn = new ccui.Button("exp_btn.png", "exp_btn_light.png", "", ccui.Widget.PLIST_TEXTURE).to(this.bottom).p(580, 30);
        this.expBtn.addClickEventListener(this.showExpFrame.bind(this));

        this.initExpressionFrame();

        this.initIsVoiceNode();

        this.curChannelBtn = this.friendChannel.btn;
        this.onClickChangeButton(this.systemChannel.btn);


    },

    // 新建一个频道按钮
    newButton: function (normalImg, selectImg, title) {
        var spr = new cc.Sprite(normalImg).anchor(0, 0);
        spr.normalImg = normalImg;
        spr.selectImg = selectImg;

        var titleLabel = new cc.LabelTTF(title, "宋体", 20, cc.size(120, 40), cc.TEXT_ALIGNMENT_CENTER, cc.TEXT_ALIGNMENT_CENTER).anchor(0, 0).to(spr).p(0, 0);

        return spr;
    },

    // 给频道按钮绑定点击事件
    bindButtonTouch: function (node) {
        node.bindTouch({
            swallowTouches: true,
            onTouchBegan: this.onClickChangeButton.bind(this, node)
        });
    },

    // 点击切换频道
    onClickChangeButton: function (button) {
        if (this.curChannelBtn === button) {
            return true;
        }


        this.curChannelBtn.display(this.curChannelBtn.normalImg);
        this.curChannelBtn.contentFrame.hide();
        this.curChannelBtn = button;
        this.curChannelBtn.display(this.curChannelBtn.selectImg);
        this.curChannelBtn.contentFrame.show();

        this.bottom.show();
        this.bottomShadow.hide();
        // this.bottom.show();
        // this.sendBtn.setEnabled(true);
        // this.editBox.setEnabled(true);
        // this.expBtn.setEnabled(true);
        // this.voiceBtn.setEnabled(true);

        // switch (button) {
        //     case this.feedbackChannel.btn:
        //         if (this.feedbackChannel.getLogFlag) {
        //             return false;
        //         }
        //
        //         if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
        //             mpGD.saNetHelper.getFeedbackLog();
        //         }
        //         break;
        //     case this.systemChannel.btn:
        //         this.bottomShadow.show();
        //         // this.bottom.hide();
        //         // this.sendBtn.setEnabled(false);
        //         // this.editBox.setEnabled(false);
        //         // this.voiceBtn.setEnabled(false);
        //         // this.expBtn.setEnabled(false);
        //         break;
        // }
        if (this.feedbackChannel && button === this.feedbackChannel.btn)
        {
            if (this.feedbackChannel.getLogFlag) {
                return false;
            }

            if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
                mpGD.saNetHelper.getChatLog(mpGD.userInfo.userID, 0, ChannelType.Feedback);
            }
        }
        else if (this.systemChannel && button === this.systemChannel.btn)
        {
            this.bottomShadow.show();

            if (this.systemChannel.getLogFlag)
            {
                return false;
            }

            if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
                mpGD.saNetHelper.getChatLog(0, 0, ChannelType.System);
            }

        }
        else if (this.friendRequestChannel && button === this.friendRequestChannel.btn)
        {
            this.bottom.hide();
        }

        return true;

    },

    // 初始化语音按钮
    initVoiceBtn: function () {
        var self = this;
        // this.voiceBtn = new ccui.Button("voice_btn.png","voice_btn_light.png","",ccui.Widget.PLIST_TEXTURE).to(this.bottom).p(35,30);
        this.voiceBtn = new cc.Sprite("#voice_btn.png").to(this.bottom).p(35, 30);
        this.voiceBtn.normalImg = "#voice_btn.png";
        this.voiceBtn.selectImg = "#voice_btn_light.png";
        // var touchListener = cc.EventListener.create({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //     swallowTouches: true,
        //     onTouchBegan: function (touch, event) {
        //         cc.log("============== fyucasdfasdf ");
        //         if(!cc.rectContainsPoint(this.getBoundingBox(), touch.getLocation()))
        //         {
        //             cc.log("============== fyucasdfasdf ");
        //         }
        //
        //         if(this.isVisible() && cc.rectContainsPoint(this.getBoundingBox(), touch.getLocation()))
        //         {
        //             this.startTime = new Date();
        //             cc.log("   ===    " + jsb.fileUtils.getWritablePath() + "voice.amr");
        //             if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "chat")) {
        //                 jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "chat");
        //             }
        //             // jsb.fileUtils.writeStringToFile("", jsb.fileUtils.getWritablePath() + "voice.amr");
        //             native.startRecord(jsb.fileUtils.getWritablePath() + "chat/voice.amr");
        //             self.isVoiceNode.show();
        //             return true;
        //         }
        //         return false;
        //     }.bind(this.voiceBtn),
        //     onTouchEnded: function (touch, event) {
        //         this.endTime = new Date();
        //         self.isVoiceNode.hide();
        //
        //         if (!cc.rectContainsPoint(this.getBoundingBox(), touch.getLocation())) {
        //             native.stopRecord();
        //             return;
        //         }
        //
        //         var voiceTime = this.endTime.getTime() - this.startTime.getTime();
        //         // cc.log("== " + this.endTime.getTime() + "     " + this.startTime.getTime() + "   " + (this.endTime.getTime() - this.startTime.getTime()));
        //         if (voiceTime < 1000)
        //         {
        //             native.stopRecord();
        //             return;
        //         }
        //         native.stopRecord();
        //         self.runAction(cc.sequence(
        //             cc.delayTime(0.01),
        //             cc.callFunc(()=>{
        //                 var voice = cc.loader.loadBinarySync(jsb.fileUtils.getWritablePath() + "chat/voice.amr");
        //                 var message = ttutil.uint8ArrayToString(voice);
        //                 // cc.log("-=-=-=-=-=-=-=-=-=-=-=" + Encrypt.MD5(message));
        //                 self.sendVoiceMessage(message, voiceTime);
        //             })
        //         ));
        //     }.bind(this.voiceBtn)
        // });

        // var touchEventListener = function (sender, type) {
        //     if (type == ccui.Widget.TOUCH_BEGAN) {
        //         this.startTime = new Date();
        //         cc.log("   ===    " + jsb.fileUtils.getWritablePath() + "voice.amr");
        //         // if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "chat")) {
        //         //     jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "chat");
        //         // }
        //         // jsb.fileUtils.writeStringToFile("", jsb.fileUtils.getWritablePath() + "voice.amr");
        //         native.startRecord(jsb.fileUtils.getWritablePath() + "chat/voice.amr");
        //         self.isVoiceNode.show();
        //         return true;
        //     }
        //     else if (type == ccui.Widget.TOUCH_ENDED) {
        //         this.endTime = new Date();
        //         self.isVoiceNode.hide();
        //         var pos = sender.getLocation();
        //         var nodePos = this.convertToNodeSpace(pos);
        //         var s = this.getContentSize();
        //         var rect = cc.rect(0, 0, s.width, s.height);
        //         if(!cc.rectContainsPoint(rect, nodePos))
        //         {
        //             native.stopRecord();
        //             return;
        //         }
        //
        //         var voiceTime = this.endTime.getTime() - this.startTime.getTime();
        //         // cc.log("== " + this.endTime.getTime() + "     " + this.startTime.getTime() + "   " + (this.endTime.getTime() - this.startTime.getTime()));
        //         if (voiceTime < 1000)
        //         {
        //             native.stopRecord();
        //             return;
        //         }
        //         native.stopRecord();
        //         self.runAction(cc.sequence(
        //             cc.delayTime(0.01),
        //             cc.callFunc(()=>{
        //                 var voice = cc.loader.loadBinarySync(jsb.fileUtils.getWritablePath() + "chat/voice.amr");
        //                 var message = ttutil.uint8ArrayToString(voice);
        //                 // cc.log("-=-=-=-=-=-=-=-=-=-=-=" + Encrypt.MD5(message));
        //                 self.sendVoiceMessage(message, voiceTime);
        //             })
        //         ));
        //     }
        // };

        // this.voiceBtn.addTouchEventListener(touchEventListener);
        // cc.eventManager.addListener(touchListener, this.voiceBtn);

        this.voiceBtn.bindTouch({
            swallowTouches: true,
            onTouchBegan: function () {
                if (cc.sys.os == cc.sys.OS_IOS) {
                    ToastSystemInstance.buildToast("语音消息暂不支持IOS！");
                    return false;
                }

                if (cc.sys.os == cc.sys.OS_WINDOWS) {
                    ToastSystemInstance.buildToast("语音消息暂不支持windows！");
                    return false;
                }

                if (self.curChannelBtn == self.systemChannel.btn) {
                    ToastSystemInstance.buildToast("无法在系统频道发言！");
                    return false;
                }

                this.display(this.selectImg);
                this.startTime = new Date();
                cc.log("   ===    " + jsb.fileUtils.getWritablePath() + "voice.amr");
                if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "chat")) {
                    jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "chat");
                }

                if (jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + "chat/voice.amr")) {
                    jsb.fileUtils.removeFile(jsb.fileUtils.getWritablePath() + "chat/voice.amr");
                }
                // jsb.fileUtils.writeStringToFile("", jsb.fileUtils.getWritablePath() + "voice.amr");
                native.startRecord(jsb.fileUtils.getWritablePath() + "chat/voice.amr");
                self.isVoiceNode.show();
                return true;
            },
            onTouchEnded: function (touch) {
                this.display(this.normalImg);
                this.endTime = new Date();
                self.isVoiceNode.hide();
                var pos = touch.getLocation();
                var nodePos = this.convertToNodeSpace(pos);
                var s = this.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (!cc.rectContainsPoint(rect, nodePos)) {
                    native.stopRecord();
                    return;
                }

                var voiceTime = this.endTime.getTime() - this.startTime.getTime();
                // cc.log("== " + this.endTime.getTime() + "     " + this.startTime.getTime() + "   " + (this.endTime.getTime() - this.startTime.getTime()));
                if (voiceTime < 1000) {
                    native.stopRecord();
                    ToastSystemInstance.buildToast("录音时间太短");
                    return;
                }
                native.stopRecord();
                self.runAction(cc.sequence(
                    cc.delayTime(0.01),
                    cc.callFunc(() => {
                        var voice = cc.loader.loadBinarySync(jsb.fileUtils.getWritablePath() + "chat/voice.amr");
                        var message = ttutil.uint8ArrayToString(voice);
                        // cc.log("-=-=-=-=-=-=-=-=-=-=-=" + Encrypt.MD5(message));
                        self.sendVoiceMessage(message, voiceTime);
                    })
                ));

            }
        });
    },

    //初始化录音时的提示节点
    initIsVoiceNode: function () {
        this.isVoiceNode = new cc.Node().anchor(0.5, 0.5).to(this.chatFrame, 1000).pp().hide();
        this.isVoiceNode.size(220, 220);
        // this.isVoiceNode.showHelp();
        var bg = new cc.Sprite("#yuyinkuang.png").to(this.isVoiceNode).pp().qscale(1.3);
        var mai = new cc.Sprite("#mai.png").to(this.isVoiceNode).pp(0.3, 0.6);
        var text = new cc.LabelTTF("手指上滑，取消发送", "黑体", 20, cc.size(180, 20)).to(this.isVoiceNode).pp(0.5, 0.2);

        this.volumes = [];
        for (var i = 0; i < 9; i++) {
            var valume = new cc.Node().to(this.isVoiceNode).p(130, 80 + i * 12);
            valume.size(100, 10);
            var valume1 = new cc.Sprite("#valume1.png").anchor(0, 0).to(valume).p(0, 0).qscale(0.25 * i, 1);
            var valume2 = new cc.Sprite("#valume.png").anchor(0, 0).to(valume).p(0.25 * i * 10, 0);
            if (i > 6) {
                valume.hide();
            }
            this.volumes.push(valume);
        }

        var flag = false;

        this.isVoiceNode.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                if (flag) {
                    flag = false;
                    this.volumes[6].hide();
                }
                else {
                    flag = true;
                    this.volumes[6].show();
                }
            })
        ).repeatForever())

    },

    // 初始化系统频道
    initSystemChannel: function (x, y) {
        this.systemChannel = {};
        this.systemChannel.btn = this.newButton("#channel_btn.png", "#channel_btn_light.png", "系统").to(this.chatFrame, 1000).p(x, y);
        this.bindButtonTouch(this.systemChannel.btn);
        this.systemChannel.btn.contentFrame = new cc.Node().anchor(0, 0).to(this.chatFrame).p(5, 67);
        this.systemChannel.btn.contentFrame.size(600, 350);
        this.systemChannel.msgList = this.newListView().to(this.systemChannel.btn.contentFrame).p(0, 0);
        this.systemChannel.msgList.size(600, 350);

        if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
            mpGD.saNetHelper.getChatLog(0, 0, ChannelType.System);
        }

    },

    // 初始化房间频道
    initRoomChannel: function (x, y) {
        this.roomChannel = {};
        this.roomChannel.playerArray = [];
        //房间按钮
        this.roomChannel.btn = this.newButton("#channel_btn.png", "#channel_btn_light.png", "房间").to(this.chatFrame, 1000).p(x, y);
        this.bindButtonTouch(this.roomChannel.btn);
        //房间频道的内容frame
        this.roomChannel.btn.contentFrame = new cc.Node().anchor(0, 0).to(this.chatFrame).p(1, 67).hide();
        this.roomChannel.btn.contentFrame.size(640, 350);

        //房间频道的信息list
        this.roomChannel.msgList = this.newListView().to(this.roomChannel.btn.contentFrame).p(200, 0);
        this.roomChannel.msgList.size(400, 317);

        //房间频道的成员list
        this.roomChannel.memberList = this.newListView().to(this.roomChannel.btn.contentFrame).p(0, 0);
        this.roomChannel.memberList.size(193, 320);

        var listTop = new cc.Sprite("#friend_list_top.png").to(this.roomChannel.btn.contentFrame).anchor(0, 1).p(0, 348);
        var top = new cc.Sprite("#msg_top.png").to(this.roomChannel.btn.contentFrame).anchor(1, 1).p(640, 350);

        //房间人数
        this.roomChannel.numLabel = new cc.LabelTTF("", "黑体", 15, cc.size(200, 30), cc.TEXT_ALIGNMENT_CENTER, cc.TEXT_ALIGNMENT_CENTER).to(this.roomChannel.btn.contentFrame).anchor(0.5, 0.5).pp(0.15, 0.96);

        var roomLabel = new cc.LabelTTF("房间聊天", "黑体", 15, cc.size(300, 30), cc.TEXT_ALIGNMENT_CENTER, cc.TEXT_ALIGNMENT_CENTER).to(this.roomChannel.btn.contentFrame).anchor(0.5, 0.5).pp(0.6, 0.96);
        // this.roomChannel.label = new cc.LabelTTF("","黑体",15,cc.size(200,30),cc.TEXT_ALIGNMENT_CENTER,cc.TEXT_ALIGNMENT_CENTER).to(this.roomChannel.contentFrame).anchor(0.5,0.5).pp(0.15, 0.96);

    },

    // 初始化好友频道
    initFriendChannel: function (x, y) {

        this.friendChannel = {};
        this.friendChannel.friendArray = [];

        this.friendChannel.btn = this.newButton("#channel_btn.png", "#channel_btn_light.png", "好友").to(this.chatFrame, 1000).p(x, y);

        this.friendChannel.btn.contentFrame = new cc.Node().anchor(0, 0).to(this.chatFrame).p(1, 67).hide();
        this.friendChannel.btn.contentFrame.size(640, 350);

        this.bindButtonTouch(this.friendChannel.btn);

        this.friendChannel.msgList = this.newListView().to(this.friendChannel.btn.contentFrame).p(200, 0);
        this.friendChannel.msgList.size(400, 317);

        this.friendChannel.memberList = this.newListView().to(this.friendChannel.btn.contentFrame).p(0, 0);
        this.friendChannel.memberList.size(193, 320);

        var listTop = new cc.Sprite("#friend_list_top.png").to(this.friendChannel.btn.contentFrame).anchor(0, 1).p(0, 348);
        var top = new cc.Sprite("#msg_top.png").to(this.friendChannel.btn.contentFrame).anchor(1, 1).p(640, 350);


        this.friendChannel.curFriendName = new cc.LabelTTF("", "黑体", 15, cc.size(300, 30), cc.TEXT_ALIGNMENT_CENTER, cc.TEXT_ALIGNMENT_CENTER).to(this.friendChannel.btn.contentFrame).anchor(0.5, 0.5).pp(0.6, 0.96);
        this.friendChannel.numLabel = new cc.LabelTTF("好友：0", "黑体", 15, cc.size(200, 30), cc.TEXT_ALIGNMENT_CENTER, cc.TEXT_ALIGNMENT_CENTER).to(this.friendChannel.btn.contentFrame).anchor(0.5, 0.5).pp(0.15, 0.96);


    },

    // 初始化反馈频道
    initFeedbackChannel: function (x, y) {

        this.feedbackChannel = {};
        this.feedbackChannel.btn = this.newButton("#channel_btn.png", "#channel_btn_light.png", "反馈").to(this.chatFrame, 1000).p(x, y);
        this.bindButtonTouch(this.feedbackChannel.btn);
        this.feedbackChannel.btn.contentFrame = new cc.Node().anchor(0, 0).to(this.chatFrame).p(5, 67).hide();
        this.feedbackChannel.btn.contentFrame.size(600, 350);

        this.feedbackChannel.msgList = this.newListView().to(this.feedbackChannel.btn.contentFrame).p(0, 0);
        this.feedbackChannel.msgList.size(600, 350);
    },

    //初始化好友请求频道
    initFriendRequestChannel:function (x, y) {
        this.friendRequestChannel = {};
        this.friendRequestChannel.btn = this.newButton("#channel_btn.png", "#channel_btn_light.png", "好友请求").to(this.chatFrame, 1000).p(x, y);
        this.bindButtonTouch(this.friendRequestChannel.btn);
        this.friendRequestChannel.btn.contentFrame = new cc.Node().anchor(0,0).to(this.chatFrame).p(5, 0).hide();
        this.friendRequestChannel.btn.contentFrame.size(630,417);

        this.friendRequestChannel.msgList = this.newListView().to(this.friendRequestChannel.btn.contentFrame).p(0,67);
        this.friendRequestChannel.msgList.size(630, 350);
        
        if (typeof mpGD != "undefined" && mpGD.saNetHelper)
        {
            mpGD.saNetHelper.getFriendRequest(mpGD.userInfo.userID);
        }

        var bottom = new cc.Sprite("#chat_frm_bottom.png").to(this.friendRequestChannel.btn.contentFrame).pp(0.5, 0.075);

        var editBoxBg = new cc.Sprite("#editbox.png").anchor(0, 0).to(bottom).p(10, 4);
        var editBox = this.newEditBox("输入玩家游戏ID").to(bottom).p(15, 14);
        editBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);

        var sendBtn = new ccui.Scale9Sprite("chat_btn_1.png").anchor(0, 0).to(bottom).p(420, 5);
        var sendTxt = new cc.LabelTTF("添加好友", "宋体", 30, cc.size(150,50)).to(sendBtn).p(90,15);
        sendTxt.setFontFillColor(cc.color(126,126,126));
        sendBtn.setCapInsets(cc.rect(10, 10, 86, 30));
        sendBtn.setContentSize(cc.size(150,50));

        sendBtn.bindTouch({
            swallowTouches:true,
            onTouchBegan:function () {
                if (typeof mpGD != "undefined" && mpGD.saNetHelper)
                {
                    var gameID = editBox.getString();
                    if (gameID == "")
                    {
                        ToastSystemInstance.buildToast("玩家游戏ID不能为空");
                        return true;
                    }

                    mpGD.saNetHelper.addFriendByGameID(gameID);
                }
                return true;
            }
        })
        // sendBtn.bindTouch(function () {
        //     if (typeof mpGD != "undefined" && mpGD.saNetHelper)
        //     {
        //         mpGD.saNetHelper.sendAddFriendRequest(mpGD.userInfo.userID);
        //     }
        // });

    },

    // 新建一个当前桌子玩家对象
    newRoomPlayerItem: function (data) {
        var userItem = data.getUserData();
        if (userItem == null) {
            cc.log("chat newRoomPlayerItem faild userItem is null!");
            return;
        }

        for (var i in this.roomChannel.playerArray) {
            if (this.roomChannel.playerArray[i].gameID == userItem.getGameID()) {
                cc.log("in chat the userItem had exist!");
                return;
            }
        }

        var nickname = userItem.getNickname();
        var faceID = userItem.getFaceID();
        var gameID = userItem.getGameID();
        var score = userItem.getUserScore();
        var vip = userItem.getMemberOrder();

        var widget = new ccui.Widget();
        widget.size(193, 74);

        var node = new cc.Node();
        node.size(193, 74);
        // node.showHelp();
        // node.setScale(0.8);

        node.bg = new cc.Sprite("#friend_item_black.png").anchor(0, 0).to(node).p(0, 0);
        // bg.size(160,70);
        var icon = ttutil.buildHeadIcon(faceID).to(node).pp(0.18, 0.5).qscale(0.3);
        var uname = new cc.LabelTTF(nickname, "宋体", 15, cc.size(160, 50), cc.TEXT_ALIGNMENT_LEFT, cc.TEXT_ALIGNMENT_CENTER).to(node).anchor(0, 0.5).pp(0.35, 0.5);
        var addFrientBtn = new cc.Sprite("#jiahaoyou.png").to(node).pp(0.9, 0.5).qscale(0.8);

        addFrientBtn.bindTouch({
            swallowTouches: true,
            onTouchBegan: this.sendAddFriend.bind(this, userItem.getUserID())
        });

        widget.addChild(node);
        node.anchor(0, 0);
        node.p(0, 0);

        this.roomChannel.memberList.pushBackCustomItem(widget);

        this.roomChannel.playerArray.push({gameID: gameID});
        this.roomChannel.numLabel.setString("房间人数：" + this.roomChannel.playerArray.length);

    },

    // 发送添加好友的请求
    sendAddFriend: function (userID) {
        if (userID == mpGD.userInfo.userID) {
            cc.log("=== can not add self !");
            return;
        }

        if (typeof mpGD != "undefined") {
            for (var i = 0; i < mpGD.friendList.length; i++)
            {
                if (mpGD.friendList[i].userID == userID)
                {
                    ToastSystemInstance.buildToast(mpGD.friendList[i].nickname + "  已是您的好友");
                    return;
                }
            }
            mpGD.saNetHelper.sendAddFriendRequest(userID);
        }
    },

    // 移除离开房间的玩家对象
    removePlayerItem: function (data) {
        var userItem = data.getUserData();
        if (userItem == null) {
            cc.log("chat removePlayerItem faild userItem is null!");
            return;
        }

        var index = false;

        for (var i = 0; i < this.roomChannel.playerArray.length; i++) {
            if (this.roomChannel.playerArray[i].gameID == userItem.getGameID()) {
                this.roomChannel.memberList.removeItem(i);
                index = i;
                break;
            }
        }

        if (index) {
            this.roomChannel.playerArray.splice(index, 1);
        }
    },

    // 初始化表情框
    initExpressionFrame: function () {
        var self = this;
        // var s = new cc.Sprite("#exp_bg.png").to(this.chatFrame,100).p(386,238);
        // ttutil.adjustNodePos(s);
        this.expFrame = new cc.Sprite("#exp_bg.png").to(this.chatFrame, 2000).p(386, 238).hide();
        this.hideExpFrameLayer = new cc.Layer().to(this.chatFrame, 1999).hide();
        this.hideExpFrameLayer.size(550, 480);
        this.hideExpFrameLayer.bindTouch({
            swallowTouches: false,
            onTouchBegan: function () {
                self.showExpFrame();
                return true;
            },
        })

        this.expList = new ccui.ScrollView().to(this.expFrame).p(5, 5);
        this.expList.size(ChatDef.expFrameW, ChatDef.expFrameH);
        this.expList.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        // this.expList.setBounceEnabled(false);
        this.expList.setInertiaScrollEnabled(false);
        this.expList.setScrollBarEnabled(false);

        var expPage
        for (var i = 0; i < ChatDef.expCount; i++) {
            if (i % 24 == 0) {
                expPage = this.newExpressionPage(ChatDef.expFrameW, ChatDef.expFrameH);
            }

            var index = i + 1;
            var prePath = index + "/";
            if (cc.spriteFrameCache.getSpriteFrame(prePath + "0.png")) {
                var exp = new Expression(index).anchor(0, 0).to(expPage).p(i % ChatDef.expColumn * ChatDef.expWidth, ChatDef.expFrameH - Math.ceil((index + 0.1) % 24 / ChatDef.expColumn) * ChatDef.expWidth);
                // exp.setScale(ChatDef.expWidth / 28 * 0.8);
                exp.bindTouch({
                    swallowTouches: false,
                    onTouchBegan: function (touch) {
                        if (!self.expFrame.isVisible()) {
                            return;
                        }
                        this.startPos = touch.getLocation();
                        var selfSize = self.expFrame.getContentSize();
                        var rect = cc.rect(0, 0, selfSize.width, selfSize.height);
                        if (!cc.rectContainsPoint(rect, self.expFrame.convertToNodeSpace(this.startPos))) {
                            cc.log("=========== no in expFrame!");
                            return false;
                        }
                        this.delaySelect = this.runAction(cc.sequence(
                            cc.delayTime(0.3),
                            cc.callFunc(() => {
                                this.delaySelect = false;
                                this.bg.show();
                                this.playAnimation();
                            })
                        ));
                        return true;
                    },

                    onTouchMoved: function (touch) {
                        var pos = touch.getLocation();
                        if (Math.abs(pos.x - this.startPos.x) > 10 && this.delaySelect) {
                            this.stopAction(this.delaySelect);
                            this.delaySelect = false;
                        }
                    },
                    onTouchEnded: function (touch) {
                        if (this.bg.isVisible() || this.delaySelect) {
                            this.bg.hide();
                            self.insertExpression(this.code);
                            if (this.delaySelect) {
                                this.stopAction(this.delaySelect);
                                this.delaySelect = false;
                            }
                            this.stopAnimation();
                        }
                    }
                });
            }
            else {
                cc.log("======= no exp init type:" + index);
            }
        }

        this.expPageArray = [];
        var pageCount = this.expList.getChildrenCount();
        var width = this.expFrame.cw();
        var half = pageCount / 2;
        var startX = width / 2 - half * 20 + 10;
        startX = pageCount % 2 == 0 ? startX : (startX - 10);
        for (var i = 0; i < pageCount; i++) {
            var point = new cc.Sprite("#pagePointBg.png").to(this.expFrame, 100).p(startX + i * 20, 20);
            this.expPageArray.push(point);
            if (i == 0) {
                this.curPagePoint = point;
                point.display("#pagePoint.png");
            }
        }

    },

    // 新建一个表情页
    newExpressionPage: function (w, h) {
        var self = this;
        var widget = new ccui.Widget().anchor(0, 0);
        widget.size(w, h);

        var node = new cc.Node().to(widget).p(0, 0);
        node.size(w, h);

        node.bindTouch({
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                this.startPos = touch.getLocation();
                return true;
            },
            onTouchEnded: function (touch, event) {
                var endPos = touch.getLocation();
                var offset = endPos.x - this.startPos.x;
                if (offset > 0 && offset > 30) {
                    self.expJumpToLeftOneItem();
                }
                else if (offset > 0 && offset < 30) {
                    self.expJumpToRightOneItem();
                }
                else if (offset < 0 && offset < -30) {
                    self.expJumpToRightOneItem();
                }
                else if (offset < 0 && offset > -30) {
                    self.expJumpToLeftOneItem();
                }
            }
        });

        this.expList.addChild(widget);
        var children = this.expList.getChildrenCount();
        this.expList.setInnerContainerSize(cc.size(w * children, h));
        widget.p(w * (children - 1), 0);

        return node;

    },

    //左边一页移动到中间
    expJumpToLeftOneItem: function () {
        var curPos = this.expList.getInnerContainerPosition();
        var offset = Math.abs(curPos.x);
        var page = Math.floor(offset / ChatDef.expFrameW);
        var container = this.expList.getInnerContainer();
        container.stopAllActions();
        if (offset > 0) {
            container.runAction(cc.moveTo(0.2, cc.p(-page * ChatDef.expFrameW, 0)).easing(cc.easeIn(0.2)));
            this.curPagePoint.display("#pagePointBg.png");
            this.curPagePoint = this.expPageArray[page];
            this.curPagePoint.display("#pagePoint.png");
        }
    },

    // 右边一页移动到中间
    expJumpToRightOneItem: function () {
        var curPos = this.expList.getInnerContainerPosition();
        var size = this.expList.getInnerContainerSize();
        var offset = Math.abs(curPos.x);
        var page = Math.ceil(offset / ChatDef.expFrameW);
        var container = this.expList.getInnerContainer();
        container.stopAllActions();
        if (offset < size.width) {
            container.runAction(cc.moveTo(0.2, cc.p(-page * ChatDef.expFrameW, 0)).easing(cc.easeIn(0.2)));
            this.curPagePoint.display("#pagePointBg.png");
            this.curPagePoint = this.expPageArray[page];
            this.curPagePoint.display("#pagePoint.png");
        }
    },


    // 新建listview
    newListView: function () {
        var listView = new ccui.ListView().anchor(0, 0);
        listView.size(450, 380);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setBounceEnabled(true);
        listView.setScrollBarEnabled(false);
        return listView;
    },

    // 新建聊天编辑框
    newEditBox: function (placeHolder) {
        var editBox = new cc.EditBox(cc.size(320, 30), new cc.Scale9Sprite()).anchor(0, 0);
        editBox.setFontSize(24);
        editBox.setPlaceHolder(placeHolder);
        editBox.setPlaceholderFontSize(24);
        editBox.setMaxLength(100);
        editBox.setFontColor(cc.color(255, 255, 255, 255));
        // editBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);

        return editBox;
    },

    //编辑框里添加一个表情
    insertExpression: function (code) {
        var str = this.editBox.getString();
        this.editBox.setString(str + code);
    },

    //新建一个表情
    newExpression: function (index) {
        var prePath = index + "/";
        if (!cc.spriteFrameCache.getSpriteFrame(prePath + "0.png")) {
            cc.log("不存在的表情 type" + index);
            return;
        }

        var expression = new cc.Sprite("#" + prePath + "0.png").anchor(0.5, 0.5).qscale(ChatDef.fontSize / 28);

        // expression.setScale(ChatDef.fontSize / expression.cw());
        expression.size(ChatDef.fontSize, ChatDef.fontSize);

        var frame = [];
        var count = 0;
        var nextFrame = cc.spriteFrameCache.getSpriteFrame(prePath + count + ".png");
        while (nextFrame) {
            frame.push(nextFrame);
            count++;
            nextFrame = cc.spriteFrameCache.getSpriteFrame(prePath + count + ".png");
        }

        var animation = new cc.Animation(frame, 0.15);
        var animate = new cc.Animate(animation);
        var action = animate.repeatForever();
        expression.runAction(action);

        return expression;
    },

    //新建一个聊天记录
    newRichMessage: function (nickname, message, time, faceID) {
        var strs = message.split("/");
        var widget = new ccui.Widget().anchor(0.5, 0.5);

        faceID = faceID == null ? 1 : faceID;


        var richText = new ccui.RichText().anchor(0, 0);
        richText.ignoreContentAdaptWithSize(false);

        richText.setWrapMode(1);

        // var dateTime = "";
        // if (time != null)
        // {
        //     time = new Date(time);
        //     cc.log(" =======================  asdf " + typeof (time));
        //     cc.log(" =======================  asdf " + time.getHours());
        //     dateTime = dateTime +"[" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]";
        // }

        if (typeof time == "string") {
            time = new Date(time);
        }

        var hour = parseInt(time.getHours());
        var minute = parseInt(time.getMinutes());
        var seconds = parseInt(time.getSeconds());

        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;
        seconds = seconds < 10 ? "0" + seconds : seconds;


        var nameLabel = new cc.LabelTTF(nickname, "宋体", ChatDef.nameFontSize, cc.size(ChatDef.textWidth, ChatDef.fontSize)).anchor(0, 1);
        var timeLabel = new cc.LabelTTF(hour + ":" + minute + ":" + seconds, "宋体", ChatDef.nameFontSize, cc.size(ChatDef.textWidth, ChatDef.fontSize), cc.TEXT_ALIGNMENT_RIGHT).anchor(1, 1);
        //气泡背景
        var bg;

        if (nickname == mpGD.userInfo.nickname) {
            nameLabel.setFontFillColor(cc.color(166, 212, 242));
            timeLabel.setFontFillColor(cc.color(166, 212, 242));
            bg = new ccui.Scale9Sprite("chat_qipao2.png").anchor(0, 0);
        }
        else {
            nameLabel.setFontFillColor(cc.color(254, 212, 121));
            timeLabel.setFontFillColor(cc.color(254, 212, 121));
            bg = new ccui.Scale9Sprite("chat_qipao.png").anchor(0, 0);
        }
        // var nameText = new ccui.RichElementText(1,cc.color(20,84,159),255,nickname, ChatDef.fontName,ChatDef.fontSize);
        // richText.pushBackElement(nameText);

        var height = 0;

        var count = 0;
        for (var i = 0; i < strs.length; i++) {
            var text = false;
            if (strs[i].substring(0, 1) == "#") {
                var exp = this.newExpression(strs[i].substring(1, strs[i].length));
                if (exp) {
                    var node = new ccui.RichElementCustomNode(i, cc.color(255, 255, 255), 255, exp);
                    count++;
                    richText.pushBackElement(node);
                }
            }
            else if (strs[i] != "") {
                text = new ccui.RichElementText(i, cc.color(255, 255, 255), 255, strs[i], ChatDef.fontName, ChatDef.fontSize);
                count += this.getStringWidth(strs[i]);
                richText.pushBackElement(text);
            }
        }

        var lineCount = Math.ceil(count / ((ChatDef.textWidth - 70) / (ChatDef.fontSize )));
        var height = ChatDef.fontSize * lineCount + 15;
        if(cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID)
        {
            height += (lineCount * 4);
        }


        widget.size(ChatDef.textWidth, height + 2 + ChatDef.fontSize);
        richText.size(ChatDef.textWidth - 70, height);

        var bgWidth = count * ChatDef.fontSize;
        bgWidth = (bgWidth + ChatDef.fontSize + 5) > (ChatDef.textWidth - 45) ? (ChatDef.textWidth - 45) : (bgWidth + ChatDef.fontSize + 5);
        bg.setCapInsets(cc.rect(10, 10, 47, 40));
        bg.to(widget, 1).p(35, 10);
        bg.setPreferredSize(cc.size(bgWidth, height - 5));

        //头像
        var icon = ttutil.buildHeadIcon(1).anchor(0, 1).to(widget).p(0, height + 2 + ChatDef.fontSize).qscale(0.2);

        widget.addChild(richText, 10);
        widget.addChild(nameLabel, 10);
        widget.addChild(timeLabel, 10);
        nameLabel.p(40, height + 2 + ChatDef.fontSize);
        timeLabel.p(ChatDef.textWidth / 2 + 50, height + 2 + ChatDef.fontSize);
        if (cc.sys.isNative) {
            richText.p(50, 0);
        }
        else {
            richText.p(-ChatDef.textWidth / 2, -height / 2);
        }

        return widget;
    },

    // 新建一条语音信息
    newVoiceMessage: function (msg, nickname, id, voiceTime, time, faceID) {

        faceID = faceID == null ? 1 : faceID;
        // return new ccui.Widget();
        var self = this;
        var widget = new ccui.Widget().anchor(0.5, 0.5);
        var widgetH = ChatDef.fontSize + ChatDef.nameFontSize + 25;

        widget.size(ChatDef.textWidth, widgetH);

        var icon = ttutil.buildHeadIcon(faceID).anchor(0, 1).to(widget).p(0, widgetH).qscale(0.2);

        var richText = new ccui.RichText().anchor(0, 0);
        richText.ignoreContentAdaptWithSize(false);

        var voice, voicePath
        if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "chat/")) {
            jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "chat/");
        }

        if (id) {

            voicePath = jsb.fileUtils.getWritablePath() + "chat/voice" + id + ".amr";
            // jsb.fileUtils.writeDataToFile(voice, voicePath);
        }
        else {
            voicePath = jsb.fileUtils.getWritablePath() + "chat/subgamevoice" + ".amr";
        }


        if (msg != "") {
            voice = ttutil.stringToUint8Array(msg);
            jsb.fileUtils.writeDataToFile(voice, voicePath);
        }

        if (typeof time == "string") {
            time = new Date(time);
        }
        else {
            time = new Date();
        }


        var hour = parseInt(time.getHours());
        var minute = parseInt(time.getMinutes());
        var seconds = parseInt(time.getSeconds());

        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        var bg;
        var nameLabel = new cc.LabelTTF(nickname, "宋体", ChatDef.nameFontSize, cc.size(ChatDef.textWidth, ChatDef.fontSize)).anchor(0, 1);
        var timeLabel = new cc.LabelTTF(hour + ":" + minute + ":" + seconds, "宋体", ChatDef.nameFontSize, cc.size(ChatDef.textWidth, ChatDef.fontSize), cc.TEXT_ALIGNMENT_RIGHT).anchor(1, 1);
        if (nickname == mpGD.userInfo.nickname) {
            nameLabel.setFontFillColor(cc.color(166, 212, 242));
            timeLabel.setFontFillColor(cc.color(166, 212, 242));
            bg = new ccui.Scale9Sprite("chat_qipao2.png").anchor(0, 0);
        }
        else {
            nameLabel.setFontFillColor(cc.color(254, 212, 121));
            timeLabel.setFontFillColor(cc.color(254, 212, 121));
            bg = new ccui.Scale9Sprite("chat_qipao.png").anchor(0, 0);
        }


        // var spr = new cc.Node();
        // var sprWidth = 21 + 26;


        var middleWidth = voiceTime < 10000 ? (80 + Math.floor(voiceTime / 1000) * 25 ) : 330;
        // sprWidth += middleWidth;
        // spr.size(sprWidth, ChatDef.fontSize);
        // var kuang1 = new cc.Sprite("#kuang1.png").anchor(0,0).to(spr).p(0,0).qscale(1,ChatDef.fontSize / 24);
        // var kuang3 = new cc.Sprite("#kuang3.png").anchor(0,0).to(spr).p(21,0).qscale(middleWidth / 115, ChatDef.fontSize / 24);
        // var kuang2 = new cc.Sprite("#kuang2.png").anchor(0,0).to(spr).p(21+middleWidth, 0).qscale(1, ChatDef.fontSize / 24);
        // var yuyin = new cc.Sprite("#yuyin.png").to(spr).p(15,12);
        //气泡背景


        bg.setCapInsets(cc.rect(10, 10, 47, 40));
        bg.to(widget, 1).p(35, 10);
        bg.setPreferredSize(cc.size(middleWidth, ChatDef.fontSize + 10));
        var yuyin = new cc.Sprite("#yuyin.png").to(bg).p(23, 15).qscale(ChatDef.fontSize / 20);
        bg.id = id;
        widget.voicePath = voicePath;

        // var voiceImg = new ccui.RichElementCustomNode(2, cc.color(255,255,255), 255, spr);
        // richText.pushBackElement(voiceImg);

        // spr.voicePath = voicePath;

        var touchEvent = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {

                // cc.log("====== whath cao you " + voicePath);
                this.startPos = touch.getLocation();
                var target = event.getCurrentTarget();
                //Get the position of the current point relative to the button
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                // var locationInList = self.feedbackChannel.msgList.convertToNodeSpace(touch.getLocation());
                // var size = self.feedbackChannel.msgList.getContentSize();
                // var rect2 = cc.rect(0, 0, size.width, size.height);

                if (target.isVisible() && cc.rectContainsPoint(rect, locationInNode)) {
                    return true;
                }
                return false;

            },

            onTouchEnded: function (touch, event) {

                var endPos = touch.getLocation();
                if (Math.abs(this.startPos.x - endPos.x) < 5 && Math.abs(this.startPos.y - endPos.y) < 5) {
                    cc.log("============ click voice " + voicePath);
                    if (cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS) {
                        ToastSystemInstance.buildToast("该平台不支持语音播放，请移动端播放！");
                        return false;
                    }

                    if (self.playingVoice != null) {
                        SoundEngine.stopEffect(self.playingVoice);
                    }

                    if (jsb.fileUtils.isFileExist(voicePath)) {
                        cc.log("wo cao play voice");
                        self.playingVoice = SoundEngine.playEffect(voicePath);
                    }
                    else if (typeof mpGD != "undefined") {
                        mpGD.saNetHelper.getVoiceMsg(id);
                    }

                }
            }
        });

        cc.eventManager.addListener(touchEvent, bg);

        // richText.size(sprWidth, ChatDef.fontSize);
        // widget.addChild(richText,10);
        widget.addChild(nameLabel, 10);
        widget.addChild(timeLabel, 10);
        // widget.addChild(bg,10);

        nameLabel.p(40, widgetH);
        timeLabel.p(ChatDef.textWidth / 2 + 50, widgetH);
        // bg.p(40,10);

        // richText.p(40,10);

        return widget;
    },

    //显示或关闭表情窗口
    showExpFrame: function () {
        // this.expFrame.isVisible() ? this.expFrame.hide() : this.expFrame.show();
        if (this.expFrame.isVisible()) {
            this.expFrame.hide();
            this.hideExpFrameLayer.hide();
        }
        else {
            this.expFrame.show();
            this.hideExpFrameLayer.show();
        }
    },

    //接收聊天信息
    onSANetEvent: function (event, data) {
        switch (event) {
            //子游戏桌上消息
            case "SubgameChat":
                if (data.roomID == mpGD.userStatus.roomID && data.tableID == mpGD.userStatus.tableID) {
                    this.insertRoomMessage(data.msg, data.nickname, data.msgType, data.msgSize, data.time, data.faceID);
                }
                break;

            case "SureAddFriendRequest":
            case "AddFriendByQRCode":
                if (data.msgID == 1) //同意成功
                {
                    this.newFrientItem(data.nickname, data.faceID, data.friendID);
                }

                break;

            case "GetFriendList":
                data.list && this.updateFriendList(data.list);
                break;

            case "FriendChat":
                this.insertFriendMsg(data.msg, data.receiveUserID, data.id, data.msgType, data.nickname, data.msgSize, data.time);
                break;

            case "UserFeedback":  //反馈频道消息
                this.insertFeedbackMsg(data.msg, data.id, data.msgType, data.userID, data.msgSize, data.time);
                break;

            case "GetChatLog":
                if (data.channel == ChannelType.Friend)
                {
                    this.insertFriendMsgLog(data.receiveUserID, data.msgList);
                }
                else if (data.channel == ChannelType.Feedback)
                {
                    this.feedbackChannel.getLogFlag = true;
                    this.insertFeedbackLog(data.msgList);
                }
                else if (data.channel == ChannelType.System)
                {
                    this.systemChannel.getLogFlag = true;
                    this.insertSystemLog(data.msgList);
                }

                break;

            case "GetVoiceMsg":
                if (!data.id) {
                    ToastSystemInstance.buildToast("播放语音失败！");
                }
                else {
                    if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "chat/")) {
                        jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "chat/");
                    }


                    var voicePath = jsb.fileUtils.getWritablePath() + "chat/voice" + data.id + ".amr";


                    var voice = ttutil.stringToUint8Array(data.msg);
                    jsb.fileUtils.writeDataToFile(voice, voicePath);

                    if (this.playingVoice != null) {
                        SoundEngine.stopEffect(this.playingVoice);
                    }

                    this.playingVoice = SoundEngine.playEffect(voicePath);

                }
                break;

            case "DelFriend":
                this.removeFriendItem(data.friendID);
                break;

            // case "GetFeedbackLog":
            //     this.feedbackChannel.getLogFlag = true;
            //     this.insertFeedbackLog(data.msgList);
            //     break;

            case "SystemMessage":
                this.insertSystemMessage(data.msg, data.msgType, data.msgSize, data.time, data.id);
                break;

            case "GetFriendRequest":
                this.insertFriendRequest(data.requestList);
                break;

        }
    },

    //插入好友请求
    insertFriendRequest:function (list) {
        for (var i = 0; i < list.length; i ++)
        {
            var widget = new ccui.Widget();
            widget.size(630,50);
            var bg = new cc.Sprite("#res/gui/file/gui-gm-mx-bj.png").anchor(0,0).to(widget);
            var s = bg.getContentSize();
            bg.setScale(630 / s.width, 50 / s.height);

            var txt = new cc.LabelTTF(list[i].nickname + "  请求添加您为好友", ChatDef.fontName, ChatDef.fontSize, cc.size(500,50),cc.TEXT_ALIGNMENT_LEFT,cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM).anchor(0,0).to(widget).p(20,11);
            var resultTxt = new cc.LabelTTF("", ChatDef.fontName, ChatDef.fontSize, cc.size(100,50),cc.TEXT_ALIGNMENT_LEFT,cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM).anchor(0,0).to(widget).p(450,11);
            var agreeBtn = new ccui.Button("btn_blue2.png","","",ccui.Widget.PLIST_TEXTURE).anchor(0,0).to(widget).p(400, 0).qscale(0.5);
            agreeBtn.setTitleText("同意");
            agreeBtn.setTitleFontSize(ChatDef.fontSize * 2);
            agreeBtn.userID = list[i].userID;

            var refuseBtn = new ccui.Button("btn_blue2.png","","",ccui.Widget.PLIST_TEXTURE).anchor(0,0).to(widget).p(500, 0).qscale(0.5);
            refuseBtn.setTitleFontSize(ChatDef.fontSize * 2);
            refuseBtn.setTitleText("拒绝");
            refuseBtn.userID = list[i].userID;

            agreeBtn.addClickEventListener(function () {
                if (typeof mpGD != "undefined") {
                    agreeBtn.hide();
                    refuseBtn.hide();
                    resultTxt.setString("已同意");
                    mpGD.saNetHelper.sendSureAddFriendRequest(this.userID);
                }
            });

            refuseBtn.addClickEventListener(function () {
                if (typeof mpGD != "undefined") {
                    agreeBtn.hide();
                    refuseBtn.hide();
                    resultTxt.setString("已拒绝");
                    mpGD.saNetHelper.sendRefuseAddFriendRequest(this.userID, false);
                }
            });


            this.friendRequestChannel.msgList.pushBackCustomItem(widget);
        }
    },


    // 插入房间消息
    insertRoomMessage: function (msg, nickname, msgType, msgSize, faceID) {

        var widget
        if (msgType == 1) {
            widget = this.newVoiceMessage(msg, nickname, msgSize, faceID);
            for (var i = 0; i < this.friendChannel.friendArray.length; i++) {
                if (this.friendChannel.friendArray[i].nickname == nickname) {
                    SoundEngine.playEffect(widget.voicePath);
                    break;
                }
            }
        }
        else if (msgType == 2) {
            widget = this.newRichMessage(nickname, msg, faceID);
        }

        this.roomChannel.msgList.pushBackCustomItem(widget);
        this.roomChannel.msgList.jumpToBottom();

    },

    insertSystemLog:function (msgList) {
        for (var i = 0; i < msgList.length; i++) {
            if (!this.isExistId(this.existMsgLog, msgList[i].id)) {

                var widget
                if (msgList[i].msgType == 2) {
                    // var message = (msgList[i].userA == 0 ? "管理员":mpGD.userInfo.nickname) + ":" + msgList[i].msg;
                    widget = this.newRichMessage("系统", msgList[i].msg, msgList[i].date, 1);
                }
                else if (msgList[i].msgType == 1) {
                    widget = this.newVoiceMessage(msgList[i].msg,"系统", msgList[i].id, msgList[i].msgSize, msgList[i].date, 1);
                }

                this.systemChannel.msgList.insertCustomItem(widget, 0);
                this.systemChannel.msgList.jumpToBottom();
                this.existMsgLog.push(msgList[i].id);
            }
        }
    },

    // 插入系统消息
    insertSystemMessage: function (msg, msgType, msgSize, time, id) {
        var widget //= this.newRichMessage("系统:", msg, time);
        if (msgType == 1)
        {
            widget = this.newVoiceMessage(msg, "系统", id, msgSize, time, 1);
        }
        else if (msgType == 2)
        {
            widget = this.newRichMessage("系统", msg, time, 1);
        }
        this.systemChannel.msgList.pushBackCustomItem(widget);
        this.existMsgLog.push(id);
    },

    // 插入好友聊天消息
    insertFriendMsg: function (msg, receiveUserID, id, msgType, nickname, msgSize, time) {
        for (var i = 0; i < this.friendChannel.friendArray.length; i++) {
            if (this.friendChannel.friendArray[i] && this.friendChannel.friendArray[i].userID == receiveUserID) {
                var widget
                if (msgType == 1) {
                    widget = this.newVoiceMessage(msg, nickname, id, msgSize, time, this.friendChannel.friendArray[i].faceID);
                }
                else if (msgType == 2) {
                    if (nickname != mpGD.userInfo.nickname)
                    {
                        ToastSystemInstance.buildToast("您的好友 【" + nickname + "】 给您发了消息，请注查看");
                    }

                    widget = this.newRichMessage(nickname, msg, time, this.friendChannel.friendArray[i].faceID);
                }

                this.friendChannel.friendArray[i].friendMsgList.pushBackCustomItem(widget);
                this.friendChannel.friendArray[i].friendMsgList.jumpToBottom();
                this.existMsgLog.push(id);
                return;
            }
        }
    },

    //插入反馈频道信息
    insertFeedbackMsg: function (msg, id, msgType, userID, msgSize, time) {
        var widget //= this.newRichMessage(msg);
        if (msgType == 2) {
            widget = this.newRichMessage((userID == 0 ? "管理员" : mpGD.userInfo.nickname), msg, time, mpGD.userInfo.faceID);
        }
        else if (msgType == 1) {
            widget = this.newVoiceMessage(msg, (userID == 0 ? "管理员" : mpGD.userInfo.nickname), id, msgSize, time, mpGD.userInfo.faceID);
        }
        this.feedbackChannel.msgList.pushBackCustomItem(widget);
        this.feedbackChannel.msgList.jumpToBottom();
        this.existMsgLog.push(id);
    },

    // 插入反馈记录
    insertFeedbackLog: function (msgList) {
        for (var i = 0; i < msgList.length; i++) {
            if (!this.isExistId(this.existMsgLog, msgList[i].id)) {

                var widget
                var nickname = msgList[i].sendUserID == 0 ? "管理员" : mpGD.userInfo.nickname;
                var faceID = msgList[i].sendUserID == 0 ? 1 : mpGD.userInfo.faceID;
                if (msgList[i].msgType == 2) {
                    // var message = (msgList[i].userA == 0 ? "管理员":mpGD.userInfo.nickname) + ":" + msgList[i].msg;
                    widget = this.newRichMessage(nickname, msgList[i].msg, msgList[i].date, faceID);
                }
                else if (msgList[i].msgType == 1) {
                    widget = this.newVoiceMessage(nickname, msgList[i].id, msgList[i].msgSize, msgList[i].date, faceID);
                }

                this.feedbackChannel.msgList.insertCustomItem(widget, 0);
                this.feedbackChannel.msgList.jumpToBottom();
                this.existMsgLog.push(msgList[i].id)
            }
        }
    },

    //插入好友聊天记录
    insertFriendMsgLog: function (friendID, msgList) {

        var selfUserID = mpGD.userInfo.userID//selfUserItem.getUserID();
        var selfNickname = mpGD.userInfo.nickname;
        var selfFaceID = mpGD.userInfo.faceID;

        for (var i = 0; i < this.friendChannel.friendArray.length; i++) {
            if (this.friendChannel.friendArray[i] && this.friendChannel.friendArray[i].userID == friendID) {
                // var selfUserItem = GD.clientKernel.getMeUserItem();

                for (var j = 0; j < msgList.length; j++) {
                    var widget
                    var name = (msgList[j].sendUserID == selfUserID ? selfNickname : this.friendChannel.friendArray[i].nickname);
                    var faceID = (msgList[j].sendUserID == selfUserID ? selfFaceID : this.friendChannel.friendArray[i].faceID);
                    if (msgList[j].msgType == 2) {
                        widget = this.newRichMessage(name, msgList[j].msg, msgList[j].date, faceID);
                    }
                    else if (msgList[j].msgType == 1) {
                        widget = this.newVoiceMessage(msgList[j].msg, name, msgList[j].id, msgList[j].msgSize, msgList[j].date, faceID);
                    }

                    this.friendChannel.friendArray[i].friendMsgList.insertCustomItem(widget, 0);
                    this.existMsgLog.push(msgList[j].id);
                }

                this.friendChannel.friendArray[i].friendMsgList.jumpToBottom();
                this.friendChannel.friendArray[i].getLogFlag = true;
                return;
            }
        }
    },

    isExistId: function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == id) {
                return true;
            }
        }

        return false;
    },

    //刷新好友列表
    updateFriendList: function (list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i]) {
                this.newFrientItem(list[i].nickname, list[i].faceID, list[i].userID);
            }
        }
    },

    // 新建一个好友对象
    newFrientItem: function (nickname, faceID, userID) {

        //避免重复创建好友对象
        for (var i = 0; i < this.friendChannel.friendArray.length; i++) {
            if (this.friendChannel.friendArray[i].userID == userID) {
                cc.log("好友已经存在 " + nickname);
                return;
            }
        }

        var widget = new ccui.Widget();
        widget.size(193, 74);

        var node = new cc.Node();
        node.userID = userID;
        node.nickname = nickname;
        node.faceID = faceID;
        node.size(193, 74);
        node.getLogFlag = false;
        // node.showHelp();
        // node.setScale(0.8);

        node.bg = new cc.Sprite("#friend_item_black.png").anchor(0, 0).to(node).p(0, 0);
        // bg.size(160,70);
        var icon = ttutil.buildHeadIcon(faceID).to(node).pp(0.18, 0.5).qscale(0.3);
        var uname = new cc.LabelTTF(nickname, "宋体", 15, cc.size(160, 50), cc.TEXT_ALIGNMENT_LEFT, cc.TEXT_ALIGNMENT_CENTER).to(node).anchor(0, 0.5).pp(0.35, 0.5);

        node.friendMsgNode = new cc.Node().anchor(0, 0).to(this.friendChannel.btn.contentFrame).p(200, 0).hide();
        node.friendMsgNode.size(400, 350);

        node.friendMsgList = this.newListView().to(node.friendMsgNode);
        node.friendMsgList.size(400, 317);

        var delFriendBtn = new ccui.Button("res/gui/login/gui-spring-btn-close.png").to(node).pp(0.92, 0.75).qscale(0.6);
        delFriendBtn.addClickEventListener(function () {
            if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
                new MPMessageBoxLayer("提 示", "您确定要删除好友吗？", mpMSGTYPE.MB_OKCANCEL, function () {
                    if (typeof mpGD != "undefined") {
                        mpGD.saNetHelper.sendDelFriendRequest(userID);
                    }
                }).to(cc.director.getRunningScene(), 10000);
            }
        });

        widget.addChild(node);
        node.anchor(0, 0);
        node.p(0, 0);

        this.friendChannel.memberList.pushBackCustomItem(widget);

        //
        this.friendChannel.friendArray.push(node);

        this.friendChannel.numLabel.setString("好友：" + this.friendChannel.friendArray.length);

        var self = this;
        node.bindTouch({
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                this.startPos = touch.getLocation();

                return true;
            },
            onTouchEnded: function (touch, event) {
                var endPos = touch.getLocation();
                if (Math.abs(this.startPos.x - endPos.x) > 5 || Math.abs(this.startPos.y - endPos.y) > 5) {
                    return;
                }
                if (self.curSelectedFriendItem != null) {
                    if (self.curSelectedFriendItem === this) {
                        return true;
                    }
                    else {
                        self.curSelectedFriendItem.friendMsgNode.hide();
                        self.curSelectedFriendItem.bg.display("#friend_item_black.png");
                    }
                }

                if (!this.getLogFlag) {
                    if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
                        mpGD.saNetHelper.getChatLog(mpGD.userInfo.userID,this.userID,ChannelType.Friend);
                    }
                }


                self.curSelectedFriendItem = this;
                self.updateFriendInfo();
            }
        });

        if (this.friendChannel.friendArray.length == 1) {
            this.curSelectedFriendItem = node;
            this.updateFriendInfo();
            if (typeof this.getLogFlag == "undefined") {
                if (typeof mpGD != "undefined" && mpGD.saNetHelper) {
                    mpGD.saNetHelper.getChatLog(mpGD.userInfo.userID, node.userID, ChannelType.Friend);
                }
            }
        }

        // if (this.sceneFlag == "dating")
        // {
        //     var storeBtn = new cc.Sprite("#jiahaoyou.png").to(node, 1000).pp(0.6,0.5);
        //
        //     storeBtn.bindTouch({
        //         swallowTouches:false,
        //         onTouchBegan:function () {
        //             cc.log("click store button!");
        //             return true;
        //         }
        //     });
        // }
    },

    removeFriendItem: function (friendID) {
        var index = -1;
        for (var i = 0; i < this.friendChannel.friendArray.length; i++) {
            if (this.friendChannel.friendArray[i] && this.friendChannel.friendArray[i].userID == friendID) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            cc.log("========== del friend item in remove!");
            var node = this.friendChannel.friendArray[index];
            if (this.curSelectedFriendItem === node) {
                this.curSelectedFriendItem = null;
            }
            node.friendMsgNode.removeFromParent();
            this.friendChannel.memberList.removeItem(index);
            this.friendChannel.friendArray.splice(index, 1);
        }

        this.updateFriendInfo();


    },

    updateFriendInfo: function () {
        this.friendChannel.numLabel.setString("好友:" + this.friendChannel.friendArray.length);
        if (!this.curSelectedFriendItem && this.friendChannel.friendArray[0]) {
            this.curSelectedFriendItem = this.friendChannel.friendArray[0];
        }
        else if (!this.curSelectedFriendItem && !this.friendChannel.friendArray[0]) {
            this.friendChannel.numLabel.setString("好友:0");
            this.friendChannel.curFriendName.setString("");
            return;
        }

        this.curSelectedFriendItem.bg.display("#friend_item_right.png");
        this.curSelectedFriendItem.friendMsgNode.show();
        this.friendChannel.curFriendName.setString(this.curSelectedFriendItem.nickname);
    },

    //显示聊天界面
    showChatFrame: function () {
        this.chatFrame.stopAllActions();
        this.hideChatFrameLayer.show();
        this.chatFrame.runAction(cc.moveTo(0.2, 0, this.chatFrame.getPositionY()));

        // this.chatFrame.isVisible() ? this.chatFrame.hide() : this.chatFrame.show();
    },

    //隐藏聊天界面
    hideChatFrame: function () {
        this.chatFrame.stopAllActions();
        this.hideChatFrameLayer.hide();
        this.chatFrame.runAction(cc.moveTo(0.2, -720, this.chatFrame.getPositionY()));
    },

    //点击发送按钮
    sendMessage: function () {
        var self = this;

        if (this.curChannelBtn == this.systemChannel.btn) {
            ToastSystemInstance.buildToast("无法在系统频道发言！");
            return;
        }

        // if (this.sceneFlag == "subgame")
        // {
        //     cc.log("===   ===== ===== === " + mpGD.userStatus.moduleID);
        //     cc.log("===   ===== ===== === " + mpGD.userStatus.roomID);
        //     cc.log("===   ===== ===== === " + mpGD.userStatus.tableID);
        // }


        var message = this.editBox.getString();
        if (message == "") {
            ToastSystemInstance.buildToast("消息为空，请输入聊天消息！");
            return;
        }

        if (typeof mpGD != "undefined") {
            if (this.friendChannel && this.curChannelBtn === this.friendChannel.btn) {
                if (this.curSelectedFriendItem != null)
                {
                    var data = {
                        msg: message,
                        receiveUserID: this.curSelectedFriendItem.userID,
                        msgType: MessageType.text,
                        msgSize: 0,
                        moudleID: this.sceneFlag == "subgame" ? mpGD.userStatus.moduleID : 0,
                        roomID: this.sceneFlag == "subgame" ? mpGD.userStatus.roomID : 0,
                        tableID: this.sceneFlag == "subgame" ? mpGD.userStatus.tableID : 0
                    };
                    mpGD.saNetHelper.sendFriendMessage(data);
                }
                else
                {
                    ToastSystemInstance.buildToast("没有好友，无法发送！");
                    return;
                }

            }
            else if (this.feedbackChannel && this.curChannelBtn === this.feedbackChannel.btn) {
                // var codeLayer = new MPCodeLayer().to(cc.director.getRunningScene(), 100);
                // codeLayer.setSubmitCallback(function (code) {
                    var data = {
                        msg: message,
                        receiveUserID: 0,
                        msgType: MessageType.text,
                        msgSize: 0,
                        moudleID: this.sceneFlag == "subgame" ? mpGD.userStatus.moduleID : 0,
                        roomID: this.sceneFlag == "subgame" ? mpGD.userStatus.roomID : 0,
                        tableID: this.sceneFlag == "subgame" ? mpGD.userStatus.tableID : 0
                    };
                    mpGD.saNetHelper.sendUserFeedback(data);
                    self.editBox.setString("");
                // });
                return;
            }
            else if (this.roomChannel && this.curChannelBtn === this.roomChannel.btn) {
                var data = {
                    msg: message,
                    receiveUserID: 0,
                    msgType: MessageType.text,
                    msgSize: 0,
                    moudleID: this.sceneFlag == "subgame" ? mpGD.userStatus.moduleID : 0,
                    roomID: this.sceneFlag == "subgame" ? mpGD.userStatus.roomID : 0,
                    tableID: this.sceneFlag == "subgame" ? mpGD.userStatus.tableID : 0
                };
                mpGD.saNetHelper.sendRoomMessage(data);
            }
        }

        // this.newRichMessage(message);
        this.editBox.setString("");
    },

    // 发送语音消息
    sendVoiceMessage: function (message, voiceTime) {
        if (message == "") {
            cc.log("语音消息为空不发送");
            return;
        }

        if (typeof mpGD != "undefined") {
            if (this.curChannelBtn === this.friendChannel.btn && this.curSelectedFriendItem != null) {
                var data = {
                    msg: message,
                    receiveUserID: this.curSelectedFriendItem.userID,
                    msgType: MessageType.voice,
                    msgSize: voiceTime,
                    moudleID: this.sceneFlag == "subgame" ? mpGD.userStatus.moduleID : 0,
                    roomID: this.sceneFlag == "subgame" ? mpGD.userStatus.roomID : 0,
                    tableID: this.sceneFlag == "subgame" ? mpGD.userStatus.tableID : 0
                };
                mpGD.saNetHelper.sendFriendMessage(data);
            }
            else if (this.feedbackChannel && this.curChannelBtn === this.feedbackChannel.btn) {
                var data = {
                    msg: message,
                    receiveUserID: 0,
                    msgType: MessageType.voice,
                    msgSize: voiceTime,
                    moudleID: this.sceneFlag == "subgame" ? mpGD.userStatus.moduleID : 0,
                    roomID: this.sceneFlag == "subgame" ? mpGD.userStatus.roomID : 0,
                    tableID: this.sceneFlag == "subgame" ? mpGD.userStatus.tableID : 0
                };
                mpGD.saNetHelper.sendUserFeedback(data);
            }
            else if (this.systemChannel && this.curChannelBtn === this.systemChannel.btn) {
                ToastSystemInstance.buildToast("无法在系统频道发言！");
            }
            else if (this.roomChannel && this.curChannelBtn === this.roomChannel.btn) {
                var data = {
                    msg: message,
                    receiveUserID: 0,
                    msgType: MessageType.voice,
                    msgSize: voiceTime,
                    moudleID: this.sceneFlag == "subgame" ? mpGD.userStatus.moduleID : 0,
                    roomID: this.sceneFlag == "subgame" ? mpGD.userStatus.roomID : 0,
                    tableID: this.sceneFlag == "subgame" ? mpGD.userStatus.tableID : 0
                };
                mpGD.saNetHelper.sendRoomMessage(data);
            }
        }
    },

    //获取字符串长度
    getStringWidth: function (str) {
        ///<summary>获得字符串实际长度，中文2，英文1</summary>
        ///<param name="str">要获得长度的字符串</param>
        var realLength = 0, len = str.length, charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 0.5;
            else realLength += 1;
        }
        return realLength;
    },

    //房间有玩家进入
    onPlayerEnter: function (userItem) {
        this.newRoomPlayerItem(userItem);
    },

    // 房间有玩家退出
    onPlayerLeave: function (userItem) {
        this.removePlayerItem(userItem);
    },

    removeListener: function (key) {
        if (this[key]) {
            cc.eventManager.removeListener(this[key]);
            this[key] = null;
        }
    },


});