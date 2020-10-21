/**
 * Created by Administrator on 2016/1/21.
 */

var MPScrollMsgLayer = cc.Layer.extend({
    crtMsgLabel: null,
    msgQueue: null,
    isOnScrollMsg: false,
    bgLayer: null,

    _className: "MPScrollMsgLayer",
    _classPath: "src/layer/MPScrollMsgLayer.js",

    ctor: function () {
        this._super();
        this.msgQueue = [];

        var size = cc.winSize;

        this.bgLayer = new cc.Sprite("res/images/nopack/hall_bg_marquee.png");
        this.bgLayer.size(mpV.w - 400, 50);
        this.bgLayer.to(this).p(size.width / 2 - 20, size.height - 120);
        this.bgLayer.setOpacity(0);

        this.headScrollView = new ccui.ScrollView();
        this.headScrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this.headScrollView.setContentSize(mpV.w - 450, 70);
        this.headScrollView.setAnchorPoint(0.5, 0.5);
        this.headScrollView.setTouchEnabled(false);
        this.headScrollView.p(size.width / 2, size.height - 120).to(this);

        //this.bgLayer = new cc.LayerGradient(cc.color(128, 128, 255, 255), cc.color(128, 128, 255, 255), cc.p(1, 0));

        // this.bgLayer = new cc.LayerColor(cc.color(0, 0, 0, 0x80)).to(this.headScrollView).show();
        // this.bgLayer.setOpacity(0);

        //this.bgLayer = new cc.LayerGradient(cc.color(128, 128, 255, 255), cc.color(128, 128, 255, 255), cc.p(1, 0)).to(this.headScrollView);
        //this.bgLayer.setOpacity(0);

        //this.bgLayer.setContentSize(mpV.w-400, 70);



        //this.bindMouseEvent();


    },

    pushScrollMsg: function (data) {

        data.nickname = mpApp.handleSensitiveWord(data.nickname);
        data.msg = mpApp.handleSensitiveWord(data.msg);

        var msg;
        if (data.nickname == null) {
            msg = data.msg;
        }
        else {
            msg = "【" + data.nickname + "】:【" + data.msg + "】";
        }

        if (this.crtMsgLabel != null) {
            this.msgQueue.push(msg);
        } else {
            this.buildNewMsgLabel(msg);
        }
    },

    buildNewMsgLabel: function (msg) {
        var size = this.headScrollView.getContentSize();
        this.bgLayer.stopAllActions();
        this.bgLayer.runAction(cc.fadeTo(0.5, 255));
        this.crtMsgLabel = new cc.LabelTTF(msg, GFontDef.fontName, 30);
        this.crtMsgLabel.attr({anchorX: 0, anchorY: 0, x: size.width - 50, y: size.height - 48});
        this.crtMsgLabel.setColor(cc.color(255, 235, 149, 255));
        this.headScrollView.addChild(this.crtMsgLabel);
        var action = cc.moveBy(15, -(this.crtMsgLabel.getContentSize().width + size.width), 0);
        var seq = cc.sequence(action, cc.callFunc(this.finishCallBack.bind(this), this));

        this.crtMsgLabel.runAction(seq);
    },

    finishCallBack: function (node) {
        this.crtMsgLabel.removeFromParent();

        if (this.msgQueue.length == 0) {
            this.crtMsgLabel = null;
            this.bgLayer.stopAllActions();
            this.bgLayer.runAction(cc.fadeTo(0.5, 0));
        } else {
            var msg = this.msgQueue[0];
            this.msgQueue.splice(0, 1);
            this.buildNewMsgLabel(msg);
        }
    },

    // bindMouseEvent: function () {
    //     var eventListener = cc.EventListener.create({
    //         event: cc.EventListener.TOUCH_ONE_BY_ONE,
    //         onTouchBegan: function () {
    //             return true;
    //         },
    //         onTouchMoved: this.onTouchMoved.bind(this)
    //     });
    //     cc.eventManager.addListener(eventListener, this);
    // },
    //
    // onTouchMoved: function (touch, event) {
    //     var target = this.headScrollView;
    //     var locInNode = target.convertToNodeSpace(touch.getLocation());
    //     var s = target.getContentSize();
    //     var rect = cc.rect(0, 0, s.width, s.height);
    //
    //     if (cc.rectContainsPoint(rect, locInNode)) {
    //         if (!this.isOnScrollMsg && this.crtMsgLabel) {
    //             cc.director.getActionManager().pauseTarget(this.crtMsgLabel);
    //             this.isOnScrollMsg = true;
    //         } else this.isOnScrollMsg = false;
    //     } else {
    //         if (this.crtMsgLabel) {
    //             cc.director.getActionManager().resumeTarget(this.crtMsgLabel);
    //             this.isOnScrollMsg = false;
    //         }
    //     }
    // }
});