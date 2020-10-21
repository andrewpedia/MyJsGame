/**
 * Created by Apple on 2016/6/17.
 */

/**
 * 排行 界面
 */
var MPRankLayer = MPBaseModuleLayer.extend({

    titleSprite: null,

    rankListView: null,

    helpBtn: null,                  //帮助按钮
    switchBtns: null,                //切换按钮集合
    rankType: null,                  //榜单类型  0:普通 1:新人榜
    curSelBtn:null,                 //当前选中的按钮

    _className: "MPRankLayer",
    _classPath: "src/main/module/MPRankLayer.js",
    rankScore: 2000000000,

    initEx: function () {


        this._super();
        mpGD.netHelp.requestRanking();
        mpApp.showWaitLayer("正在请求排名榜数据");

        this.titleSprite = new cc.Sprite("#rankList/font_01.png").to(this.titleBG).pp(0.5, 0.88);


        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(this).size(970, 560).pp(0.56, 0.5);

        this.rankListView = this.buildRankListView().to(this).pp(0.565, 0.8);

        let bgSprite = new cc.Sprite("#rankList/frame_01.png").to(this).pp(0.56, 0.84);
        // this.buildBlock("排名").to(this).pp(0.2, 0.75);
        // this.buildBlock("昵称").to(this).pp(0.6, 0.75);
        // this.buildBlock("头像").to(this).pp(0.4, 0.75);
        this.lastBlock = this.buildBlock("财富").to(this).pp(0.8, 0.75).hide();
        this.rankType = 0;
        this.switchBtns = [];

        this.buildSwitchBtn("财富榜", "#rankList/font_cf_nor.png", "#rankList/font_cf_sel.png",() => {
            this.rankType = 0;
            mpGD.netHelp.requestRanking();
            mpApp.showWaitLayer("正在请求排名榜数据");
        }).to(this).pp(0.115, 0.7).setColor(cc.color(255, 255, 255));

        // this.buildSwitchBtn("新人榜", () => {
        //     this.rankType = 1;
        //     mpGD.saNetHelper.requestGetUserRanking(0);
        //     mpApp.showWaitLayer("正在请求排名榜数据");
        // }).to(this).pp(0.6, 0.11);
    },

    refreshFocus: function () {
        var items = this.rankListView.getItems();

        var getaddFriendBtn = function (item) {
            return item.addFriendBtn || item;
        }
        this.backBtn.setNextFocus(null, getaddFriendBtn(items[0]), null, getaddFriendBtn(items[0]));
        for (var i = 0; i < items.length; i++) {
            if (items[i].addFriendBtn) {
                var addFriendBtn = items[i].addFriendBtn;

                addFriendBtn.setNextFocus(i == 0 ? this.backBtn : getaddFriendBtn(items[i - 1]), i == items.length - 1 ? this.switchBtns[0] : getaddFriendBtn(items[i + 1]), this.backBtn, null);
            }
            else
                items[i].setNextFocus(i == 0 ? this.backBtn : items[i - 1], i == items.length - 1 ? this.switchBtns[0] : items[i + 1], this.backBtn, null);
        }

        for (var i = 0; i < this.switchBtns.length; i++) {
            this.switchBtns[i].setNextFocus(getaddFriendBtn(items[items.length - 1]), null, i == 0 ? null : this.switchBtns[i - 1], i == this.switchBtns.length - 1 ? null : this.switchBtns[i + 1]);
        }
        //麻烦的适配
        this.rankListView.isOnFinger = function () {
            var count = -1;
            var arrayItems = this.getItems();
            for (var i = 0; i < arrayItems.length; i++) {
                var item = arrayItems[i];
                if (this.shared.selected == item || this.shared.selected == item.addFriendBtn) {
                    count = i;
                    break;
                }
            }
            return count;
        }
    },

    onEnter: function () {
        this._super();

        //由于使用了 Sa服 所以再注册一个监听
        mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");
    },

    onExit: function () {
        this._super();

        //由于使用了 Sa服 所以再注册一个监听
        mpGD.saNetHelper.removeNetHandler(this);
    },

    //切换排行榜按钮
    buildSwitchBtn: function (text, norImg, selImg, cb) {

        var self = this;
        //新人榜
        var btn = new FocusButton("btn_nor.png");
        btn.loadTextureNormal("btn_sel.png", ccui.Widget.PLIST_TEXTURE);
        btn.norImg = norImg;
        btn.selImg = selImg;
        btn.setScale9Enabled(true);
        btn.size(150,80);

        btn.label = new cc.Sprite(btn.selImg).to(btn).pp();
        // new cc.LabelTTF(text, GFontDef.fontName, 32).to(btn).pp();

        this.curSelBtn = btn;
        // btn.setColor(cc.color(200, 172, 40));
        btn.setTouchEnabled(true);
        btn.setPressedActionEnabled(true);
        btn.addClickEventListener((sender) => {
            if (sender === self.curSelBtn)
            {
                return;
            }

            self.curSelBtn = sender;

            for (var i = 0; i < this.switchBtns.length; i++) {
                this.switchBtns[i].loadTextureNormal("btn_nor.png", ccui.Widget.PLIST_TEXTURE);
                this.switchBtns[i].label.display(this.switchBtns[i].norImg);
            }
            sender.loadTextureNormal("btn_sel.png", ccui.Widget.PLIST_TEXTURE);
            sender.label.display(sender.selImg)
            // sender.setColor(cc.color(255, 255, 255));
            cb && cb();
        });
        this.switchBtns.push(btn);

        return btn;
    },

    //标题
    buildBlock: function (text, color) {
        color = color || cc.color(200, 172, 40);
        // var block = new cc.Sprite("#gui-bank-white.png");
        var block = new cc.Sprite("#res/gui/file/gui-cz-title-button-select.png").qscale(0.6);
        block.setColor(color);
        var ttf = block.ttf = new cc.LabelTTF(text, GFontDef.fontName, 32).to(block).pp();

        // ttf.setColor(color);
        return block;
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.GetScoreRank:
                mpApp.removeWaitLayer();
                this.fillRankData(data);
                this.refreshFocus();
                break;

        }
    },

    onSANetEvent: function (event, data) {
        switch (event) {
            case mpSANetEvent.GetUserRanking:
                mpApp.removeWaitLayer();
                this.fillSaRankingData(data);
                this.refreshFocus();
                break;
        }
    },

    //玩家新人榜
    fillSaRankingData: function (data) {
        this.rankListView && this.rankListView.removeAllChildren();
        this.meItem && this.meItem.removeFromParent();
        this.meItem = null;
        this.lastBlock.ttf.setString("注册日期");
        this.rankListView.setContentSize(mpV.w, 400);

        var rankData = data.list;

        if (rankData.length > 50) {
            rankData.length = 50;
        }
        var friendUserIDs = [];


        if (mpGD.friendList) {
            //整理下userID array
            for (var i = 0; i < mpGD.friendList.length; i++) {
                friendUserIDs.push(mpGD.friendList[i].userID);
            }
        }

        for (var i = 0; i < rankData.length; i++) {
            var rankItem = this.buildRankItem(rankData[i].faceID, i + 1, rankData[i].nickname, null, rankData[i].ts);
            //去除已经是好友和本身
            if (friendUserIDs.indexOf(rankData[i].userID) == -1 && rankData[i].userID != mpGD.userInfo.userID) {
                var addFriendBtn = rankItem.addFriendBtn = new FocusButton("jiahaoyou.png", "", "jiahaoyou.png", ccui.Widget.PLIST_TEXTURE).to(rankItem).pp(0.45, 0.5);
                addFriendBtn.addClickEventListener(this.sendAddFriend.bind(this, rankData[i].userID));
            }
            this.rankListView.pushBackCustomItem(rankItem);
        }
    },

    /**
     * 添加好友
     * @param userID
     */
    sendAddFriend: function (userID) {
        if (userID == mpGD.userInfo.userID) {
            cc.log("=== can not add self !");
            return;
        }
        if (typeof mpGD != "undefined") {
            cc.log("  send add friend!");
            mpGD.saNetHelper.sendAddFriendRequest(userID);
        }
    },

    //填充排行榜数据
    fillRankData: function (data) {
        var rankData = data.rankData;

        var meRank = "50+";

        //重新点击处理
        this.rankListView && this.rankListView.removeAllChildren();
        this.meItem && this.meItem.removeFromParent();
        this.meItem = null;
        this.lastBlock.ttf.setString("财富");
        this.rankListView.setContentSize(970, 470);
        
        for (var i = 0; i < rankData.length; i++) {

            var rankItem = this.buildRankItem(rankData[i].faceID, i + 1, rankData[i].nickname, this.rankScore);
            this.rankListView.pushBackCustomItem(rankItem);
            if (rankData[i].gameID == mpGD.userInfo.gameID) {
                meRank = i + 1;
            }
        }

        // ttutil.dump(mpGD.userInfo);
        // var meItem = this.meItem = this.buildRankItem(mpGD.userInfo.faceID, meRank, mpGD.userInfo.nickname, mpGD.userInfo.bankScore || "0");
        // meItem.mpBg.setColor(cc.color(128, 128, 255));
        //
        // meItem.to(this).pp(0.56, 0.26);
    },

    buildRankItem: function (faceID, randIndex, nickname, money, ts) {

        nickname = nickname.replace(/[买卖冲充退收售]/gi, "*");
        nickname = nickname.replace(/上\s*分/gi, "*分");
        nickname = nickname.replace(/下\s*分/gi, "*分");

        var widget = new FocusWidget().anchor(0.5, 0.5);
        var bg = new ccui.Scale9Sprite().to(widget);
        bg.initWithSpriteFrameName("rankList/frame_02.png");
        bg.size(960, 70);
        widget.size(960, 70);
        bg.pp();

        var rankIndexIcon;
        if (randIndex <= 3) {
            var tempArray = ["#rankList/icon_01.png", "#rankList/icon_02.png", "#rankList/icon_03.png"];
            rankIndexIcon = new cc.Sprite(tempArray[randIndex - 1]).qscale(0.8);
        }
        else {
            rankIndexIcon = new cc.Sprite("#gui-download-res-progress-bar.png").qscale(0.7);
            var ttf = new cc.LabelTTF(randIndex, GFontDef.fontName, 32).to(rankIndexIcon).pp();
            ttf.setColor(cc.color(255, 255, 255));
        }
        rankIndexIcon.to(widget).pp(0.08, 0.5);
        var nicknameLabel = new FocusText(nickname, GFontDef.fontName, 24).to(widget).anchor(0, 0.5).pp(0.25, 0.5);

        nicknameLabel.setColor(cc.color(224, 186, 56));
        // nicknameLabel.setTouchEnabled(true);
        // nicknameLabel.addClickEventListener(function(){
        //     let idx = nickname.lastIndexOf(":");
        //     idx = idx > 0 ? idx : nickname.lastIndexOf("：");
        //     let copyStr = idx>0 && idx!=nickname.length-1 ? nickname.substr(idx+1) : nickname;

        //     new MPMessageBoxLayer("通知", "您要复制[" + copyStr + "]，并打开微信吗？", mpMSGTYPE.MB_OKCANCEL,
        //         ()=>{
        //             native.setClipboard(copyStr);
        //             native.openWXApp()
        //         }).to(cc.director.getRunningScene());
        // }, this);

        var headIcon = ttutil.buildHeadIcon(faceID).to(widget).pp(0.18, 0.5).qscale(0.5);

        money && new cc.LabelBMFont(ttutil.formatMoney(money || "0"), "res/font/zhs-yahei-orange-20.fnt").to(widget).pp(0.76, 0.5).anchor(0.5, 0.5);
        ts && new cc.LabelTTF(ts, GFontDef.fontName, 24).to(widget).pp(0.8, 0.5).anchor(0.5, 0.5).setColor(cc.color(231, 208, 124));

        widget.mpBg = bg;


        widget.setTouchEnabled(true);
        widget.addClickEventListener(function(){
            let idx = nickname.lastIndexOf("微");
            idx = idx > 0 ? idx : nickname.lastIndexOf("微");
            let copyStr = idx>0 && idx!=nickname.length-1 ? nickname.substr(idx+1) : nickname;
            new MPMessageBoxLayer("通知", "您要复制[" + copyStr + "]，并打开微信吗？", mpMSGTYPE.MB_OKCANCEL,
                ()=>{
                    native.setClipboard(copyStr);
                    native.openWXApp()
                }).to(cc.director.getRunningScene());
        }, this);
        

        return widget;
    },

    //排行榜单
    buildRankListView: function () {

        // listView.addEventListener(this.onRoomEvent.bind(this));

        var listView = new FocusListView().anchor(0.5, 1);

        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);
        // listView.setClippingEnabled(false);
        listView.setContentSize(1000, 600);
        listView.setItemsMargin(10);

        // TV 特殊处理 会触发两次
        // listView.addEventListener(function (sender, type){});
        // // listView.showHelp();
        // var effect = new ccs.Armature("xuanzhongtexiao_2jijiemian");
        // effect.getAnimation().play("Animation1");
        // effect.to(listView);

        // listView.runAction(cc.callFunc(function () {
        //     listView.getItem(0).setSelect();
        // }));

        return listView;
    },

});