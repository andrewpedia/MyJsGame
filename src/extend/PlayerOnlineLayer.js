/**
 * 玩家在线层
 */
var PlayerOnlineLayer = cc.Layer.extend({
    bgSprite: null,

    ctor: function () {
        this._super();

        this.initEx()

        this.onUserLeaveListener = cc.eventManager.addCustomListener(CustomEvent.UserLeave, this.onUserChange.bind(this));
        this.onUserEnterListener = cc.eventManager.addCustomListener(CustomEvent.UserEnter, this.onUserChange.bind(this));

    },

    onExit: function () {
        this._super();
        this.removeListener("onUserLeaveListener");
        this.removeListener("onUserEnterListener");
    },

    removeListener: function (key) {
        if (this[key]) {
            cc.eventManager.removeListener(this[key]);
            this[key] = null;
        }
    },

    initEx: function () {
        var self = this;
        var bg = new cc.Sprite("#allcommon/onlineBg.png").to(this).pp().qscale(0.8);
        // var bg1 = new cc.Sprite("#allcommon/frame_common_room.png").to(this).pp();

        // var frame = new ccui.Scale9Sprite("allcommon/frame_9_1.png").to(bg);
        // frame.setCapInsets(cc.rect(15,15,18,19));
        // frame.size(600,340);
        // frame.pp(0.5,0.47);

        var closeBtn = new cc.Sprite("#allcommon/btn_close_online.png").to(bg).pp(0.95,0.93);
        closeBtn.bindTouch({
            swallowTouches:true,
            onTouchBegan:function () {
                self.hide();
                return true;
            }
        })

        var scrollView = new ccui.ScrollView().anchor(0.5,0.5).to(this);
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);           //设置可点击
        scrollView.setBounceEnabled(true);          //设置有弹力
        scrollView.setContentSize(cc.size(500,260));     //限定一下点击区域
        scrollView.pp(0.5,0.49);
        this.scrollView = scrollView;

        this.onlineCount = new cc.LabelTTF("", GFontDef.fontName, 25).to(this).pp(0.5,0.72);

        this.updatePlayerInfo();
    },
    
    updatePlayerInfo:function () {
        this.playerNodes = [];
        this.players = [];
        this.scrollView.removeAllChildren();
        for(var i = 0; i < 1000; i ++){
            var player = GD.gameEngine.getTableUserItem(i);
            if(player){
                var playNode = this.newPlayerNode(player.getNickname(), player.getUserScore(), player.getFaceID()).to(this.scrollView);
                this.players.push(player);
                this.playerNodes.push(playNode);
            }
        }

        var oldSize = this.scrollView.getInnerContainerSize();
        var line = Math.ceil(this.players.length / 3);
        var height = line * 140;
        this.scrollView.setInnerContainerSize(cc.size(oldSize.width, height));

        for(var i = 0; i < this.playerNodes.length; i++){
            this.playerNodes[i].p(40 + i % 3 * 150, height - 10 - Math.floor(i / 3) * 140);
        }

        this.onlineCount.setString("在线人数:" + this.playerNodes.length);
    },

    newPlayerNode:function (name, score, faceID) {
        var node = new cc.Node().anchor(0,1);
        node.size(100,100);
        // node.showHelp()
        if(score > 10000){
            score = score / 10000;
            score = score.toFixed(1);
            score += "万"
        }
        node.nickname = new cc.LabelTTF(name, GFontDef.fontName, 15).to(node).pp(0.5,1);
        node.score = new cc.LabelTTF(score, GFontDef.fontName, 15).to(node).pp(0.5,0);
        node.score.setColor(cc.color("#fffa3a"));
        node.icon = ttutil.buildHeadIcon(faceID).to(node).pp().qscale(0.6);

        return node;
    },

    showRightNow:function () {
        this.updatePlayerInfo();
        this.show();
    },

    onUserChange:function (event) {
        var count = GD.clientKernel.gameUserManager.getUersCount();

        this.updatePlayerInfo();
    },


});