/**
 * Created by pear on 2017/9/30.
 */


// 大厅聊天界面
var MPNewChatLayer = cc.LayerColor.extend({
    chatMoudle: null,

    backBtn: null,

    onClosePre: null,        //返回false则， 停止关闭

    touchListener: null,

    ctor: function (enterFlag) {
        this._super(cc.color(0, 0, 0, 200));
        this.initEx();

        if (this.getScene().useKeyboard) {
            this.initTV();
        }

        this.p(0, mpV.h + 100);

        if (enterFlag) {
            this.enterScene();
        }
        // this.enterScene();
    },

    onEnter: function () {
        this._super();
    },

    enterScene: function () {
        var self = this;
        this.swallowTouches();
        this.bindKeyEvent(function () {
            if (!self.onClosePre || self.onClosePre()) {
                // self.close();
                self.leaveScene();
            }
        });
        this.runAction(cc.moveTo(0.3, 0, 0).easing(cc.easeBackOut()));
    },

    leaveScene: function () {
        this.closeSwallowTouches();
        this.removeKeyEvent();
        this.runAction(cc.moveTo(0.3, 0, mpV.h + 100).easing(cc.easeBackOut()));
    },

    swallowTouches: function () {
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if (event.getCurrentTarget().isVisible()) {
                    return true;
                }
                return false;
            },
        });
        cc.eventManager.addListener(this.touchListener, this);
    },

    closeSwallowTouches: function () {
        if (this.touchListener) {
            cc.eventManager.removeListener(this.touchListener);
            this.touchListener = null;
        }
    },


    //返回false则停止关闭
    setClosePreCallback: function (callback) {
        this.onClosePre = callback;
    },

    initEx: function () {
        this.size(mpV.w, mpV.h);

        this.chatMoudle = new ChatMoudle("dating").to(this);
        this.backBtn = new FocusButton();
        this.backBtn.loadTextureNormal("gui-gm-button-retreat-zc.png", ccui.Widget.PLIST_TEXTURE);
        this.backBtn.to(this).p(50, mpV.h - 50);
        var self = this;
        this.backBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                if (!self.onClosePre || self.onClosePre()) {
                    // self.close();
                    self.leaveScene();
                }

            }
        });
    },
    initTV: function () {
        this.getScene().setFocusSelected(this.backBtn);
    },

    //关闭窗口
    close: function () {
        this.getScene().pauseFocus();
        this.runAction(cc.sequence(cc.moveTo(0.3, 0, mpV.h + 100).easing(cc.easeBackOut()),
            cc.callFunc(() => {
                if (this.getScene().useKeyboard) {
                    this.getScene().popDefaultSelectArray();
                }
            }), cc.removeSelf()));
    },

    bindKeyEvent: function (onBackCallback) {
        this.keyEventListener = cc.EventListener.create({
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
        cc.eventManager.addListener(this.keyEventListener, this);
    },

    removeKeyEvent: function () {
        if (this.keyEventListener) {
            cc.eventManager.removeListener(this.keyEventListener);
            this.keyEventListener = null;
        }
    }

});