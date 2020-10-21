/**
 * Created by grape on 2017/9/8.
 */
/**
 * Created by coder on 2017/6/6.
 */
var MPFocusIP2Scene = cc.Scene.extend(FocusBase).extend({

    isMenuMode: false,

    _className: "MPFocusIP2Scene",
    _classPath: "src/scene/MPFocusIP2Scene.js",

    ctor: function () {
        this._super();

        // TV 初始值
        G_PLATFORM_TV = G_PLATFORM_TV ? G_PLATFORM_TV : native.isTVDevice();
        //TV 清空按钮数组 可能冗余
        this.clearDefaultSelectArray();
        mpApp.bindBackButtonEvent(this, mpApp.closePlaza);

        // 手指资源
        //cc.spriteFrameCache.addSpriteFrames("res/tvfinger.plist");
        //this.setFingerPPos({x: -1, y: 0});
        this.shared.selected = this;
        //this.createTvFinger();
    },
    // 如果出现特殊情况按钮不见了 废弃
    setSelectDefault: function () {
        // 登录按钮
        this.setFocusSelected(this);
    },

    //暂停键盘， 保留手指到场景上
    pauseFocus: function () {
        this.setFocusSelected(this);
    },

    refreshFocus: function () {

    },

    onEnterTransitionDidFinish: function () {
        this._super();

        if (cc.game.config.debugMode == 1 && !G_PLATFORM_TV) {
            this.onInitKeyboardListener();
        }

        this.onCreateBoardListener();
    },

    onInitKeyboardListener: function () {
        if (this.isTVDevice())
            return;

        this.eventListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        G_PLATFORM_TV = true;
                        cc.eventManager.removeListener(this.eventListener);
                        this.eventListener = null;
                        // this.shared.finger.show();
                        this.setFocusSelected(this.button);
                        this.onCreateBoardListener();
                        break;
                }
            }.bind(this),
        });
        cc.eventManager.addListener(this.eventListener, -1);
    },

    onCreateBoardListener: function () {
        if (!this.isTVDevice())
            return;

        this.useKeyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {
                console.log("onKeyPressed, cc.KEY", code);
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        this.refreshFocus();
                        var nextFocus = this.shared.selected.nextFocusArray[code];
                        this.setFocusSelected(nextFocus);
                        break;
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }
            }.bind(this),
            onKeyReleased: function (code, event) {
                console.log("onKeyReleased1, cc.KEY", code);
                switch (code) {
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        this.shared.selected.onClick && this.shared.selected.onClick();
                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }
            }.bind(this)
        });
        cc.eventManager.addListener(this.useKeyboardListener, -1);
    },

    onExit: function () {
        this._super();
        if (this.eventListener)
            cc.eventManager.removeListener(this.eventListener);
        if (this.useKeyboardListener)
            cc.eventManager.removeListener(this.useKeyboardListener);
    }
});