/**
 * Created by coder on 2017/6/6.
 */
var MPFocusLoginScene = cc.Scene.extend(FocusBase).extend({

    isMenuMode: false,

    _className: "MPFocusLoginScene",
    _classPath: "src/scene/MPFocusLoginScene.js",

    ctor: function () {
        this._super();
        // TV 初始值
        G_PLATFORM_TV = G_PLATFORM_TV ? G_PLATFORM_TV : native.isTVDevice();
        //TV 清空按钮数组 可能冗余
        this.clearDefaultSelectArray();
        mpApp.bindBackButtonEvent(this, mpApp.closePlaza);
        this.setFingerPPos({x: -1, y: 0});
        //TV 报错处理
        this.setSelectDefault();
    },
    // 如果出现特殊情况按钮不见了 废弃
    setSelectDefault: function () {
        // 登录按钮
        this.setFocusSelected(this.loginBtn);
    },

    //暂停键盘， 保留手指到场景上
    pauseFocus: function () {
        this.setFocusSelected(this);
    },

    refreshFocus: function () {
        console.log("refreshFocus");
        // if (!this.useKeyboard)
        //     return;
        // 游客按钮
        var guestBtn = this.guestBtn;
        // 微信
        var wxBtn = this.wxBtn;
        // 登录按钮
        var loginBtn = this.loginBtn;
        //客服
        var serviceBtn = this.serviceBtn;
        //注册
        var registerBtn = this.registerBtn;
        //二维码
        var qrcodeBtn = this.qrcodeBtn;
        //### 开始绑定规则
        guestBtn.setNextFocus(qrcodeBtn, null, null, wxBtn.isVisible() ? wxBtn : loginBtn);
        if (wxBtn && wxBtn.isVisible()) {
            wxBtn.setNextFocus(serviceBtn, null, guestBtn, loginBtn);
        }
        loginBtn.setNextFocus(serviceBtn, null, wxBtn.isVisible() ? wxBtn : guestBtn, registerBtn);
        registerBtn.setNextFocus(serviceBtn, null, loginBtn, null);
        serviceBtn.setNextFocus(null, loginBtn, qrcodeBtn, null);
        qrcodeBtn.setNextFocus(null, guestBtn, null, serviceBtn);
                                                          
                                                          
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
                        // 登录按钮
                        this.setFocusSelected(this.wxBtn);
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




