/**
 * Created by coder on 2017/7/21.
 */

var _webViewInstance;

var WebViewLayer = cc.LayerColor.extend({
    _className: "WebViewLayer",
    _classPath: "src/extend/WebViewLayer.js",

    webView: null,

    ctor: function (url) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));

        _webViewInstance && _webViewInstance.removeFromParent();

        _webViewInstance = this;

        this.size(mpV.w, mpV.h);

        var width = this.width * 0.75;
        var height = this.height * 0.75;
        var x = (this.width - width) / 2;
        var y = (this.height - height) / 2;

        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS) {
            var result = native.addWebBrowser(url, x, y, width, height);
            if (result != "1") {
                cc.sys.openURL(url);
                this.runAction(cc.removeSelf());
                return;
            }

            this.webView = {};
            this.webView.x = x;
            this.webView.y = y;

            this.webView.getContentSize = () => {
                return {width: width, height: height};
            };
        }
        else {
            this.webView = new ccui.WebView();
            this.webView.setAnchorPoint(0.5, 0.5);
            this.webView.setContentSize(cc.size(width, height));
            this.webView.loadURL(url);
            this.webView.setScalesPageToFit(true);
            this.webView.to(this).pp();
        }

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
                if (!this.containsTouch(this.webView, touch)) {
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
        if (this.getScene().shared && this.getScene().shared.selected) {
            this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
        }
    },

    //吞噬掉一切键盘事件,。
    swallowKeyboard: function (onBackCallback) {
        var eventListener = this.keyboardListener =  cc.EventListener.create({
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
        cc.eventManager.addListener(eventListener, - 2);
        return this;
    },


    onExit: function () {
        this._super();

        this.keyboardListener && cc.eventManager.removeListener(this.keyboardListener);
    },

    cleanup: function () {

        _webViewInstance = null;

        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS)
            native.removeWebBrowser();

        this._super();
    },

    containsTouch: function (sprite, touch) {

        var rect = null;
        var point = touch.getLocation();

        if (sprite.convertToNodeSpace != null) {
            rect = cc.rect(0, 0, sprite.getContentSize().width, sprite.getContentSize().height);
            point = sprite.convertToNodeSpace(point);
        }
        else {
            rect = cc.rect(sprite.x, sprite.y, sprite.getContentSize().width, sprite.getContentSize().height);
            point.y = this.y - point.y;
        }

        return cc.rectContainsPoint(rect, point);
    },

    close: function () {
        this.removeFromParent();
        _webViewInstance = null;
    }
});
