/**
 * Created by coder on 2017/7/21.
 */

var QRCodeInstance;

var QRCodeLayer = MPBaseModuleLayer.extend({
    _className: "QRCodeLayer",
    _classPath: "src/extend/QRCodeLayer.js",

    sprite: null,

    ctor: function () {
        this._super();

        this.size(V.w, V.h);
        QRCodeInstance && QRCodeInstance.removeFromParent();

        QRCodeInstance = this;

    },

    initEx:function () {
        this._super(cc.size(550,410));

        this.titleBG.hide();

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(this).size(380, 300).pp(0.5, 0.48);

        var hint = new ccui.Text("请登录手机版本,在大厅点击扫码登录。如未下载手机版本,扫码将跳转到游戏官网下载手机版本。", GFontDef.fontName, 20).to(this).pp(0.5,0.37);
        hint.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        hint.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        hint.ignoreContentAdaptWithSize(false);
        hint.setContentSize(320, 90);
        hint.anchor(0.5, 1);

        hint.setColor(cc.color(231, 208, 124));


        this.loadQRCode();

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: (touch, event) => {
                if (event.getCurrentTarget().isVisible()) {
                    SoundEngine.playEffect(commonRes.btnClick);
                    return true;
                }
                return false;
            },
            onTouchEnded: (touch, event) => {
                if (!this.containsTouch(bg, touch)) {
                    this.getScene().popDefaultSelectArray();
                    this.removeFromParent();
                }
            }
        });

        cc.eventManager.addListener(touchListener, this);

        this.swallowKeyboard(() => {
            this.getScene().popDefaultSelectArray();
            this.removeFromParent();
        });
        //默认手指位置
        if(this.getScene().shared && this.getScene().shared.selected)
            this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
        this.getScene().pauseFocus();
    },

    cleanup: function () {

        QRCodeInstance = null;

        this._super();
    },

    containsTouch: function (sprite, touch) {
        return cc.rectContainsPoint(cc.rect(0, 0, sprite.getContentSize().width, sprite.getContentSize().height), sprite.convertToNodeSpace(touch.getLocation()));
    },

    loadQRCode: function () {
        var socketID = mpGD.netHelp.getSocketID();

        if (socketID == null)
            return;

        socketID = Encrypt.xorWord(socketID, "game036");

        this.sprite && this.sprite.removeFromParent();

        var url = QRCodeScanner.accountScanLogin + "?id=" + socketID;
        cc.loader.loadImg(ttutil.getQRCodeUrl(url), {isCrossOrigin: true}, (err, img) => {
            if (err) {
                console.error("扫码登录二维码加载失败", err, url);
                return;
            }

            this.sprite = new cc.Sprite(img).to(this, 2);
            if (cc.sys.isNative) {
                this.sprite.setContentSize(200, 200);
                this.sprite.pp(0.5,0.53);
            } else {
                this.sprite.setScale(0.5);
                this.sprite.pp(0.5,0.53);
            }
        });
    },
});
