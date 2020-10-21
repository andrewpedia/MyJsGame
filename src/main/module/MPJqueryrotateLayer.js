/**
 * Created by magic_cube on 2017/10/30.
 */


var MPJqueryrotateLayer = cc.LayerColor.extend({

    dayLabelArray: [],

    _className: "MPJqueryrotateLayer",
    _classPath: "src/main/module/MPJqueryrotateLayer.js",

    ctor: function (date, callback) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));

        this._date = date;

        this._callback = callback;

        this.swallowTouch();

        this.swallowKeyboard(() => {});

        this.initJqueryrotateLayer();

        mpGD.netHelp.addNetHandler(this);
    },

    initJqueryrotateLayer: function () {
        var box = new cc.Node().anchor(0.5, 0.5).to(this).pp(0.5, 0.55);

        var panel = new cc.Sprite("#daily/gui-daily-turnplate.png").to(box);
        box.size(panel.size());
        panel.pp();

        // // 关闭按钮
        // this.closeBtn = new FocusButton().to(box, 10).pp(0.95, 0.85);
        // this.closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        // this.closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        // this.closeBtn.addTouchEventListener((sender, type) => {
        //     if (type === ccui.Widget.TOUCH_BEGAN) {
        //         SoundEngine.playEffect(commonRes.btnClick);
        //     } else if (type === ccui.Widget.TOUCH_ENDED) {
        //         mpGD.netHelp.removeNetHandler(this);
        //         this.removeFromParent();
        //     }
        // });

        // 转盘
        this.turnplate = new cc.Node().anchor(0.5, 0.5);
        this.turnplate.size(500, 500);
        this.turnplate.to(box, -5).p(370, 296);

        // 奖项
        var angleArray = [0, 72, 144, 198, 252, 288, 324, 352.8];
        var itemArray = [];
        for (var i = 0; i < angleArray.length; i++) {
            var item = new cc.Sprite("#daily/gui-daily-turnplate-" + (i + 1) + ".png").to(this.turnplate).pp().anchor(0, 0);
            item.setRotation(angleArray[i]);

            var line = new cc.Sprite("#daily/gui-daily-turnplate-line.png").to(this.turnplate, 5).pp().qscale(0.3, 1).anchor(0.5, 0);
            line.setRotation(angleArray[i]);

            itemArray.push(item);
        }

        new cc.Sprite("#daily/gui-daily-turnplate-prize-1.png").to(itemArray[0]).p(110, 150).qrotate(36);
        new cc.Sprite("#daily/gui-daily-turnplate-prize-2.png").to(itemArray[1]).p(110, 150).qrotate(36);
        new cc.Sprite("#daily/gui-daily-turnplate-prize-3.png").to(itemArray[2]).p(95, 180).qrotate(27);
        new cc.Sprite("#daily/gui-daily-turnplate-prize-4.png").to(itemArray[3]).p(95, 180).qrotate(27);
        new cc.Sprite("#daily/gui-daily-turnplate-prize-5.png").to(itemArray[4]).p(60, 190).qrotate(18);
        new cc.Sprite("#daily/gui-daily-turnplate-prize-6.png").to(itemArray[5]).p(60, 190).qrotate(18);
        new cc.Sprite("#daily/gui-daily-turnplate-prize-7.png").to(itemArray[6]).p(50, 200).qrotate(14.4);
        new cc.Sprite("#daily/gui-daily-turnplate-prize-8.png").to(itemArray[7]).p(14, 220).qrotate(3.6);

        new cc.LabelTTF("兑奖券x2", GFontDef.fontName, 32).to(itemArray[0]).p(75, 100).qrotate(36).qcolor(255, 100, 0);
        new cc.LabelTTF(CURRENCY + "x188", GFontDef.fontName, 32).to(itemArray[1]).p(75, 100).qrotate(36).qcolor(255, 255, 0);
        new cc.LabelTTF("兑奖券x5", GFontDef.fontName, 28).to(itemArray[2]).p(65, 130).qrotate(27).qcolor(255, 255, 0);
        new cc.LabelTTF(CURRENCY + "x1888", GFontDef.fontName, 28).to(itemArray[3]).p(65, 130).qrotate(27).qcolor(255, 255, 0);
        new cc.LabelTTF(CURRENCY + "x8888", GFontDef.fontName, 20).to(itemArray[4]).p(45, 140).qrotate(18).qcolor(255, 100, 0);
        new cc.LabelTTF("房卡x10", GFontDef.fontName, 24).to(itemArray[5]).p(45, 140).qrotate(18).qcolor(255, 255, 0);
        new cc.LabelTTF("改名卡x2", GFontDef.fontName, 16).to(itemArray[6]).p(30, 130).qrotate(104.4).qcolor(255, 100, 0);
        new cc.LabelTTF("推广红包 x 3", GFontDef.fontName, 14).to(itemArray[7]).p(10, 150).qrotate(94.6).qcolor(255, 100, 0);

        // 指针
        new cc.Sprite("#daily/gui-daily-turnplate-pointer.png").to(box).p(370, 390).qscale(1, 0.5);
        // 开始按钮
        var btn = new ccui.Button().to(box).p(370, 296);
        btn.loadTextureNormal("daily/gui-daily-lotto-start-normal.png", ccui.Widget.PLIST_TEXTURE);
        btn.loadTexturePressed("daily/gui-daily-lotto-start-pressed.png", ccui.Widget.PLIST_TEXTURE);
        btn.setTag(0);
        btn.addClickEventListener((sender) => {
            sender.setTouchEnabled(false);
            mpApp.showWaitLayer("正在发送转盘抽奖请求...");
            mpGD.netHelp.requestJqueryrotate(this._date);

            return;
        });
        this.startBtn = btn;

        box.setScale(0);
        box.runAction(cc.scaleTo(0.5, 0.9).easing(cc.easeElasticOut()));

        this.box = box;
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.Jqueryrotate:

                mpApp.removeWaitLayer();

                var angleArray = [72, 72, 54, 54, 36, 36, 29, 7];
                var angle = 360;
                var totalAngle = 0;
                for (var i = 0; i < angleArray.length; i++) {
                    if (data.prizeType === i) {
                        angle -= Math.floor(Math.random() * angleArray[i]) + totalAngle;
                        break;
                    }
                    totalAngle += angleArray[i];
                }

                this.turnplate.runAction(cc.sequence(
                    cc.rotateTo(2.0, 3600 + angle).easing(cc.easeSineOut()),
                    cc.callFunc(() => {
                        var prizeArray = ["兑换券", CURRENCY, "兑换券", CURRENCY, CURRENCY, "房卡", "改名卡", "推广红包"];
                        ToastSystemInstance.buildToast({text: "您抽中的奖励为【" + prizeArray[data.prizeType] + " x " + data.prizeCount + "】，请及时查收！"});

                        this._callback(data.prizeType);

                        this.box.runAction(cc.sequence(
                            cc.delayTime(1.0),
                            cc.scaleTo(0.5, 0.01).easing(cc.easeBackIn()),
                            cc.hide(),
                            cc.callFunc(() => {
                                mpGD.netHelp.removeNetHandler(this);
                                this.removeFromParent();
                            })
                        ));
                    })
                ));

                break;

            default:
                // 无作用
                break;
        }
    },

});