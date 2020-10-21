/**
 * Created by 真心科技 on 2016/2/26.
 */


/**
 * 等待界面
 */
var MPWaitLayer = cc.LayerColor.extend({

    text: null,
    textLabel: null,
    bgSprite: null,
    waitSprite: null,            //等待转转的那个
    fontSize: null,

    container: null,

    _className: "MPWaitLayer",
    _classPath: "src/layer/MPWaitLayer.js",

    ctor: function (text, fontSize, opacity) {

        opacity = opacity == null ? 0x88 : opacity;
        this.text = text || "正在获取用户信息， 请稍后...";

        this.fontSize = fontSize || 40;
        this._super(cc.color(0x00, 0x00, 0x00, opacity));

        this.initEx();

        this.swallowTouch();
        this.swallowKeyboard();


        var self = this;
        this.setOpacity(0);
        //过会再显示出来, 要不对于一些网络很好的用户， 总是闪一下就消失了， 体验太差了
        this.container.setCascadeOpacityEnabled(true);
        this.container.setOpacity(0);
        this.container.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            self.runAction(cc.fadeTo(0.3, opacity));
            self.container.runAction(cc.fadeIn(0.3));
        })));

        this.runAction(cc.sequence(cc.delayTime(30), cc.callFunc(function () {
            native.toast("操作超时");
            self.removeFromParent();
        })));
    },

    onExit: function () {
        this._super();

        cc.eventManager.removeListener(this.keyboardListener);
    },

    //吞噬掉一切键盘事件,。
    swallowKeyboard: function (onBackCallback) {
        var eventListener = this.keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                switch (code) {
                    case cc.KEY.back:
                    case cc.KEY.escape:
                        onBackCallback && onBackCallback();
                }
                event.stopPropagation();
            },
            onKeyReleased: function (code, event) {
                event.stopPropagation();
            }
        });
        cc.eventManager.addListener(eventListener, -2);
        return this;
    },

    initEx: function () {

        this.container = new cc.Node().to(this).p(0, 0);
        this.container.size(mpV.w, mpV.h);
        this.bgSprite = new cc.Sprite("res/img/waitBg.png").to(this.container).p(mpV.w / 2, mpV.h / 2 - 5);
        this.waitSprite = new cc.Sprite("#hall_download_loading_loop.png").to(this.container).qscale(0.8);
        this.waitSprite.p((mpV.w - this.bgSprite.cw() + this.waitSprite.cw()) / 2 + 15, mpV.h / 2);
        this.textLabel = new cc.LabelTTF(this.text, GFontDef.fontName, this.fontSize).to(this.container).p((mpV.w + this.waitSprite.cw()) / 2, mpV.h / 2);
        this.textLabel.setColor(cc.color(27, 46, 61));
        this.setLocalZOrder(999999999);

        //this.waitSprite.setScaleX(-1);
        this.waitSprite.runAction(cc.repeatForever(cc.rotateBy(2, 360)));


    },

});