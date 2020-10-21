/**
 * Created by coder on 2017/7/21.
 */

var SecurityCodeInstance;

var SecurityCodeLayer = cc.Layer.extend(FocusBase).extend({
// var SecurityCodeLayer = cc.Layer.extend({
    _className: "SecurityCodeLayer",
    _classPath: "src/extend/SecurityCodeLayer.js",

    sprite: null,
    netHelper: null,
    netEvent: null,
    lastTouchTime:null,
    ctor: function (isSa) {
        this._super();

        SecurityCodeInstance && SecurityCodeInstance.removeFromParent();

        SecurityCodeInstance = this;
        this.netHelper = isSa?mpGD.saNetHelper:mpGD.netHelp;
        this.netEvent = isSa?mpSANetEvent:mpNetEvent;
        // this.netHelper = mpGD.saNetHelper;
        // this.netHelper = mpGD.netHelp;
        this.netHelper.addNetHandler(this);

        mpApp.showWaitLayer("验证码加载中，请稍等。");

        this.netHelper.requestCodeAddr();

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if (event.getCurrentTarget().isVisible() && this.containsTouch(touch)) {
                    SoundEngine.playEffect(commonRes.btnClick);
                    return true;
                }
                return false;
            }.bind(this),
            onTouchEnded: function (touch, event) {
                if (this.containsTouch(touch)) {
                    this.onTimeLimit();
                    // this.netHelper.requestCodeAddr();
                }
            }.bind(this)
        });

        cc.eventManager.addListener(touchListener, this);
        // tv 手指用于移动到这里
        var self = this;
        this.tvSpr =  new FocusSprite().to(this,999).p(0,-10);
        this.tvSpr.onClick = function () {
            self.refresh();
        }
    },

    cleanup: function () {

        SecurityCodeInstance = null;

        this.netHelper.removeNetHandler(this);

        this._super();
    },

    containsTouch: function (touch) {
        return cc.rectContainsPoint(cc.rect(0, 0, this.sprite.getContentSize().width, this.sprite.getContentSize().height), this.sprite.convertToNodeSpace(touch.getLocation()));
    },

    refresh: function () {
        this.onTimeLimit();
        // this.netHelper.requestCodeAddr();
    },
    onTimeLimit: function () {
        var isLimit = this.lastTouchTime == null?false:Date.now() - this.lastTouchTime < 1000 ;

        if(!isLimit) {
            this.lastTouchTime = Date.now();
            this.netHelper.requestCodeAddr();
        }
    },
    onNetEvent: function (eventName, data) {
        switch (eventName) {
            case this.netEvent.CodeAddr:
                mpApp.removeWaitLayer();

                ttutil.loadRemoteImg(data.base64, "png", function (sprite) {
                    sprite.to(this);

                    if(this.sprite != null)
                        this.sprite.removeFromParent();

                    this.sprite = sprite;
                }.bind(this));
                break;
            default:
                break;
        }
    }
});
