/**
 * Created by 真心科技 on 2016/4/14.
 */


/**
 * 每日签到的小方格
 */
var MPSignNode = cc.Node.extend({
    _className: "MPSignNode",
    _classPath: "src/layer/MPSignLayer.js",


    bgSprite: null,
    tickSprite: null,       //打勾
    daysLabel: null,
    index: null,
    score: null,
    scoreLabel: null,       //金豆数
    maskSprite: null,
    ctor: function (index, score) {
        this._super();
        this.index = index;
        this.score = score || 0;
        this.initEx();
    },

    initEx: function () {
        this.bgSprite = new cc.Sprite("#hall/sign/sign.png").to(this);


        this.daysLabel = new cc.LabelTTF("第" + this.index + "天", GFontDef.fontName, 58).to(this).p(0, 150);
        this.daysLabel.setColor(cc.color(65, 168, 13));

        this.scoreLabel = new cc.LabelTTF(this.score + "金豆", GFontDef.fontName, 40).to(this).p(0, -80);
        //this.scoreLabel.setColor(cc.color(65, 168, 13));


    },

    //标志领取
    markReceive: function () {
        this.maskSprite = new cc.Scale9Sprite("hall/commonWin.png", cc.rect(0, 0, 54, 54)).to(this).p(0, 0);
        this.maskSprite.setCapInsets(cc.rect(18, 18, 18, 18));
        this.maskSprite.setColor(cc.color(0, 0, 0));
        this.maskSprite.setOpacity(100);
        this.maskSprite.setPreferredSize(this.bgSprite.size());
        this.tickSprite = new cc.Sprite("#hall/common/tick.png").to(this, 1);
    },

    setScore: function (score) {
        this.score = score;
        this.scoreLabel.setString(score + "金豆");
    },


});

/**
 * 签到层
 * @constructor
 */
var MPSignLayer = cc.Layer.extend({

    title: null,
    bg: null,

    signArray: null,
    signButton: null,

    markLayer: null,

    signIndex: null,

    _className: "MPSignLayer",
    _classPath: "src/layer/MPSignLayer.js",

    ctor: function () {
        this._super();
        this.initEx();
    },


    initEx: function () {

        this.markLayer = new cc.LayerColor(cc.color(0, 0, 0, 150)).to(this);
        this.markLayer.swallowTouch();
        this.bg = new cc.Scale9Sprite("hall/commonWin.png", cc.rect(0, 0, 54, 54)).to(this).p(mpV.w / 2, mpV.h / 2);
        this.bg.setCapInsets(cc.rect(18, 18, 18, 18));
        this.bg.setPreferredSize(cc.size(1000, 1000));
        new cc.LayerColor(mpColors.splitColor, 1000, 6).to(this).p(mpV.w / 2, mpV.h / 2 + 370).anchor(0.5, 0.5).ignoreAnchorPointForPosition(false);
        new cc.LayerColor(mpColors.splitColor, 1000, 6).to(this).p(mpV.w / 2, mpV.h / 2 - 320).anchor(0.5, 0.5).ignoreAnchorPointForPosition(false);


        this.title = new cc.LabelTTF("每日签到", GFontDef.fontName, 64).to(this).p(mpV.w / 2, mpV.h / 2 + 430);
        this.title.setColor(cc.color(65, 168, 13));

        this.signArray = [];
        this.signPosArray = [cc.p(250 - 125, 650), cc.p(500 - 125, 650), cc.p(750 - 125, 650), cc.p(1000 - 125, 650),
            cc.p(250 - 25, 320), cc.p(500, 320), cc.p(750 + 25, 320)];

        for (var i = 0; i < 7; ++i) {
            this.signArray[i] = new MPSignNode(i + 1, 1000).to(this.bg);
            this.signArray[i].p(this.signPosArray[i]);
        }

        this.signButton = new cc.MenuItemSprite(this.buildSprite(), this.buildSprite().qopacity(200));

        new cc.Menu(this.signButton).to(this.bg).p(0, 0).size(this.bg.size());
        this.signButton.pp(0.5, 0.09);

        this.signButton.setCallback(this.onRequestSign.bind(this));


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    },

    fillData: function (data) {

        var signConfig = data.signConfig;
        this.signIndex = data.signIndex;


        for (var i = 0; i < signConfig.length; ++i) {
            this.signArray[i].setScore(signConfig[i].score);
            if (i < this.signIndex - 1) {
                this.signArray[i].markReceive();
            }
        }
    },

    onEnter: function () {
        this._super();
        this.bindNetEvent();
    },

    onExit: function () {
        this.unbindNetEvent();
        this._super();
    },

    //监听网络事件
    bindNetEvent: function () {
        mpGD.netHelp.addNetHandler(this);
    },

    /**
     * 解除绑定网络事件
     */
    unbindNetEvent: function () {
        mpGD.netHelp.removeNetHandler(this);
    },
    /**
     * 当网络事件来时
     * @param event
     * @param data
     */
    onNetEvent: function (event, data) {


        switch (event) {
            case mpNetEvent.SignWrite:
                this.signArray[this.signIndex - 1].markReceive();

                ToastSystemInstance.buildToast({text: "签到成功!", delayTime: 1});
                this.runAction(cc.sequence(cc.delayTime(1), cc.removeSelf()));

                mpApp.updateUserInfo({Score: data.Score});
                break;


        }
    },

    /**
     * 当请求签到
     */
    onRequestSign: function () {
        mpGD.netHelp.requestSignWrite();
    },

    buildSprite: function () {
        var node = new cc.Scale9Sprite("hall/commonWin.png", cc.rect(0, 0, 54, 54));
        node.setCapInsets(cc.rect(18, 18, 18, 18));
        node.setPreferredSize(cc.size(300, 120));
        node.setColor(cc.color(65, 168, 13));
        var label = new cc.LabelTTF("今日签到", GFontDef.fontName, 64).to(node).pp();
        //label.setColor(cc.color(65, 168, 13));
        node.setCascadeOpacityEnabled(true);
        return node;
    },

});