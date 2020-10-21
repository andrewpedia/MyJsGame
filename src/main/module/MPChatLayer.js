/**
 * Created by orange on 2016/10/12.
 */

var MPChatLayer = cc.Layer.extend({

    richTextPanel: null,
    hideBtn: null,
    richText: null,
    richTextColor: null,

    sendBtn: null,

    hide: true,
    isRunAction: false,

    editBox: null,

    _className: "MPChatLayer",
    _classPath: "src/main/module/MPChatLayer.js",

    ctor: function () {
        this._super();

        this.richTextColor = cc.color(22, 187, 195);

        var winSize = cc.director.getWinSize();

        this.richTextPanel = new ccui.Scale9Sprite("chat/chat-bg.png").to(this).anchor(1, 0.5).p(winSize.width + 550, winSize.height / 2);
        this.richTextPanel.setContentSize(550, 480);


        this.hideBtn = new ccui.Button("chat/chat-hide.png", "chat/chat-hide-h.png", "", ccui.Widget.PLIST_TEXTURE).to(this.richTextPanel).pp(0.06, 0.5);
        this.hideBtn.setScaleX(-1);
        this.hideBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.showBtn = new ccui.Button("chat/chat-btn.png", "chat/chat-btn.png", "", ccui.Widget.PLIST_TEXTURE).to(this.richTextPanel).anchor(0, 0.5).pp(0, 0.92);
        this.showBtn.setScaleX(-1);
        this.showBtn.setPressedActionEnabled(true);
        this.showBtn.addClickEventListener(this.onClickBtn.bind(this));


        this.richText = new MPRichText(4).to(this.richTextPanel).anchor(0.5, 0.5).pp(0.52, 0.56);
        this.richText.setContentSize(cc.size(450, 350));

        this.editBox = new cc.EditBox(cc.size(350, 52), new ccui.Scale9Sprite("chat/chat-edit.png")).to(this.richTextPanel).pp(0.43, 0.12);
        this.editBox.setFontSize(24);
        this.editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
        this.editBox.setMaxLength(200);
        this.editBox.setFontColor(cc.color(255, 255, 255, 255));


        this.sendBtn = new ccui.Button("chat/chat-laba-bt.png", "chat/chat-laba-bt-light.png", "", ccui.Widget.PLIST_TEXTURE).to(this.richTextPanel).pp(0.85, 0.12);
        this.sendBtn.addClickEventListener(this.onClickBtn.bind(this));

        mpGD.netHelp.addNetHandler(this);
        mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        mpGD.saNetHelper.removeNetHandler(this);
        this._super();
    },

    onClickBtn: function (sender) {

        switch (sender) {
            case this.hideBtn:
                this.hide = true;
                var winSize = cc.director.getWinSize();
                var self = this;
                this.richTextPanel.runAction(cc.sequence(
                    cc.moveTo(0.2, winSize.width + 550, winSize.height / 2),
                    cc.callFunc(function () {
                        self.showBtn.show();
                    })
                ));
                break;

            case this.showBtn:
                this.hide = false;
                this.showBtn.hide();
                var winSize = cc.director.getWinSize();
                this.richTextPanel.runAction(cc.moveTo(0.2, winSize.width, winSize.height / 2));

                this.isRunAction = false;
                this.showBtn.stopAllActions();

                break;

            case this.sendBtn:
                this.useBroadcast();
                break;
        }

    },


    runShowAction: function () {
        this.showBtn.runAction(cc.repeatForever(
            cc.sequence(
                cc.repeat(cc.sequence(
                    cc.rotateBy(0.05, 5),
                    cc.rotateBy(0.1, -10),
                    cc.rotateBy(0.05, 5)
                ), 5),
                cc.delayTime(3)
            )));
        this.isRunAction = true;
    },

    useBroadcast: function () {
        var goodsSet = mpApp.findGoodsSet(mpGoodsID.Broadcast);
        if (goodsSet == null || goodsSet.count == 0) {
            ToastSystemInstance.buildToast("您没有喇叭道具，请去商城购买");
            return;
        }

        var msg = this.editBox.getString();
        if (!msg || msg.length == 0) {
            ToastSystemInstance.buildToast("发送的喇叭消息不能为空");
            return;
        }

        mpGD.saNetHelper.requestUseBroadcast(msg);

        this.editBox.setString("");
    },

    onSANetEvent: function (event, data) {
        switch (event) {
            case mpSANetEvent.SysBroadcast:
            case mpSANetEvent.UseBroadcast:
                this.insertNewChat(data.msg);
                break;

        }
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.UpdateGoods:
                mpApp.updateGoodsSet(data);
                break;

            case mpNetEvent.Speaker:
                this.insertNewChat(data.msg);
                break;
        }
    },

    insertNewChat: function (msg) {
        if (msg == null) return;

        if (this.hide && !this.isRunAction) {
            this.runShowAction();
        }

        var element = new MPRichItemText(1, this.richTextColor, 255, msg, "宋体", 24);
        this.richText.pushBackElement(element);
        this.richText.insertNewLine();

        element = new MPRichItemImage(1, this.richTextColor, 255, "#chat/chat-split.png");
        this.richText.pushBackElement(element);
        this.richText.insertNewLine();
    }


});