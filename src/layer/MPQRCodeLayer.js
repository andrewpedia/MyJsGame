/**
 * Created by coder on 2017/7/20.
 */

var MPQRCodeLayerInstance;

var MPQRCodeLayer = cc.LayerColor.extend({
    _className: "MPQRCodeLayer",
    _classPath: "src/layer/MPQRCodeLayer.js",


    sprite: null,

    ctor: function (data) {
        this._super(cc.color(0x00, 0x00, 0x00, 200));

        MPQRCodeLayerInstance = this;

        ttutil.loadRemoteImg(data.base64, "png", function (sprite) {
            sprite.to(this).pp(0.3, 0.5);
            this.sprite = sprite;

            // lines
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(-30, -30).anchor(0, 0).qscale(6, 0.5);
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(-30, -30).anchor(0, 0).qscale(0.5, 6);
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(-30, 400).anchor(0, 1).qscale(6, 0.5);
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(-30, 400).anchor(0, 1).qscale(0.5, 6);
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(400, 400).anchor(1, 1).qscale(6, 0.5);
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(400, 400).anchor(1, 1).qscale(0.5, 6);
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(400, -30).anchor(1, 0).qscale(6, 0.5);
            new cc.Sprite("#gui-pattern-line.png").to(this.sprite).p(400, -30).anchor(1, 0).qscale(0.5, 6);

            // logo
            new cc.Sprite("#pay/gui-pay-icon-" + data.type + ".png").to(this.sprite).pp();
        }.bind(this));

        var type = data.type == mpCZType.ZFB ? "支付宝" : "微信";

        // pay-content
        // new cc.LabelTTF("支付内容:", GFontDef.fontName, 30).to(this).pp(0.55, 0.7).anchor(0, 0.5);
        // new cc.LabelTTF(data.money + "元购钻石", GFontDef.fontName, 30).to(this).pp(0.66, 0.7).anchor(0, 0.5);

        var desc = new cc.LabelTTF(data.desc, GFontDef.fontName, 36).to(this).pp(0.55, 0.73).anchor(0, 0.5);
        desc.setColor(cc.color(255, 255, 0, 255));

        // pay-money
        new cc.LabelTTF("支付金额:", GFontDef.fontName, 30).to(this).pp(0.55, 0.6).anchor(0, 0.5);
        new cc.LabelTTF(data.money + "元", GFontDef.fontName, 42).to(this).pp(0.66, 0.6).anchor(0, 0.5).setFontFillColor(cc.color(0xff, 0x32, 0x32, 0xff));

        new cc.LabelTTF("提示:", GFontDef.fontName, 30).to(this).pp(0.55, 0.5).anchor(0, 0.5);
        new cc.LabelTTF("1）请使用手机版" + type + "扫描二维码。", GFontDef.fontName, 24).to(this).pp(0.55, 0.44).anchor(0, 0.5);
        new cc.LabelTTF("2）确认付款，完成支付。", GFontDef.fontName, 24).to(this).pp(0.55, 0.38).anchor(0, 0.5);
        new cc.LabelTTF("3）支付到账时此界面会自动关闭。", GFontDef.fontName, 24).to(this).pp(0.55, 0.32).anchor(0, 0.5);


        this.swallowKeyboard(function () {
            this.close();
        }.bind(this));

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if (event.getCurrentTarget().isVisible()) {
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                if (this.sprite == null || !cc.rectContainsPoint(this.sprite.getBoundingBox(), touch.getLocation())) {
                    this.close();
                }
            }.bind(this)
        });

        cc.eventManager.addListener(touchListener, this);
        this.initTV();
    },
    initTV: function () {
        var tvSprite = this.tvSprite = new FocusButton();

        tvSprite.to(this);
        tvSprite.addClickEventListener(() => {
            this.close();
        });
        tvSprite.setOpacity(1);
        this.getScene().setFocusSelected(tvSprite);
    },

    close: function () {
        mpGD.mainScene.restoreLastSelected();
        this.removeFromParent();
        MPQRCodeLayerInstance = null;

    }
});