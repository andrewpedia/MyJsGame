/**
 * Created by coder on 2017/6/6.
 */
var MPFocusMainScene = cc.Scene.extend(FocusBase).extend({

    isMenuMode: false,
    isDoubleClick: false,

    doubleClickTimer: null,
    clickBeganTick: 0,
    clickEndedTick: 0,

    doubleClickCallback: null,

    _className: "MPFocusMainScene",
    _classPath: "src/scene/MPFocusMainScene.js",

    ctor: function () {
        this._super();
        //TV 清空按钮数组 可能冗余
        this.clearDefaultSelectArray();
        mpApp.bindBackButtonEvent(this, mpApp.closePlaza);
        this.setFingerPPos({x: -1, y: 0});
    },

    // 如果出现特殊情况按钮不见了 废弃
    setSelectDefault: function () {
        // 登录按钮
        this.setFocusSelected(this.bottomButtons[0].isVisible() ? this.bottomButtons[0] : this.bottomButtons[1]);
    },

    //暂停键盘， 保留手指到场景上
    pauseFocus: function () {
        this.setFocusSelected(this);
    },

    /**
     * 设置双击回调
     * @param callback
     */
    setDoubleClickCallback: function (callback) {
        this.doubleClickCallback = callback;
    },

    refreshFocus: function () {
        console.log("refreshFocus");
        if (!this.useKeyboard)
            return;

        var anis = this.gameTypeBox.anis;
        var buttons = this.bottomButtons;
        var kindVisble = buttons[buttons.length - 1].isVisible();
        var gameBoxItems = this.gameBox.getItems();
        //底部ui
        var length = kindVisble ? buttons.length : buttons.length - 1;

        // mid ui
        if (kindVisble) {
            for (var i = 0; i < gameBoxItems.length; i++) {
                gameBoxItems[i].setNextFocus(gameBoxItems[i].removeBtn && gameBoxItems[i].removeBtn.isVisible() ? gameBoxItems[i].removeBtn : this.headIcon, this.bottomButtons[9] || this.bottomButtons[0], i == 0 ? null : gameBoxItems[i - 1], i == gameBoxItems.length ? null : gameBoxItems[i + 1]);
                if (gameBoxItems[i].removeBtn && gameBoxItems[i].removeBtn.isVisible())
                    gameBoxItems[i].removeBtn.setNextFocus(
                        this.headIcon,
                        gameBoxItems[i],
                        i == 0 ? gameBoxItems[i].removeBtn : (gameBoxItems[i - 1].removeBtn && gameBoxItems[i - 1].removeBtn.isVisible() ? gameBoxItems[i - 1].removeBtn : null),
                        i == gameBoxItems.length - 1 ? null : (gameBoxItems[i + 1].removeBtn && gameBoxItems[i + 1].removeBtn.isVisible() ? gameBoxItems[i + 1].removeBtn : null));
            }
        } else {
            //中间骨骼动画第一层
            for (var i = 0; i < anis.length; i++) {
                anis[i].setNextFocus(this.headIcon, buttons[0], i == 0 ? null : anis[i - 1], i == anis.length - 1 ? null : anis[i + 1]);
            }
        }
        // bottom ui
        for (var i = 0; i < length; i++) {
            buttons[i].setNextFocus(kindVisble ? gameBoxItems[0] : anis[0], null, i == 0 ? null : buttons[i - 1], i == length - 1 ? null : buttons[i + 1]);
        }

        // top ui
        this.headIcon.setNextFocus(null, kindVisble ? gameBoxItems[0] : anis[0], null, G_APPLE_EXAMINE ? this.widgetCZ : this.vipIcon);

        if (!G_APPLE_EXAMINE) {
            this.vipIcon.setNextFocus(null, kindVisble ? gameBoxItems[0] : anis[0], this.headIcon, this.widgetCZ);
        }

        this.widgetCZ.setNextFocus(null, kindVisble ? gameBoxItems[0] : anis[0], G_APPLE_EXAMINE ? this.headIcon : this.vipIcon, null);
    },

    onEnterTransitionDidFinish: function () {
        this._super();

        // 网页版资源测试 用于路径不重名和子游戏plist加载到内存的图片不与大厅重名 见MPBaseRoomScene的 onEnterTransitionDidFinish
        if (cc.sys.platform == 101 && mpGD.startupFrames.length == 0) {
            for (var frame in cc.spriteFrameCache._spriteFrames) {
                mpGD.startupFrames.push(frame)
            }
            mpGD.startupRes = [];
            for (var i = 0; i < web_resource.length; i++) {
                mpGD.startupRes.push(web_resource[i]);
            }
        }


        if (!this.useKeyboard)
            return;

        this.setSelectDefault();
        this.keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {
                console.log("[MainScene] onKeyPressed, cc.KEY", code);
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
                        // if (this.clickBeganTick !== 0) {
                        //     this.clickEndedTick = new Date().getTime();
                        //     if (this.clickEndedTick - this.clickBeganTick < 500) {
                        //         this.isDoubleClick = true;
                        //         break;
                        //     }
                        // }
                        // this.clickBeganTick = new Date().getTime();
                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }

            }.bind(this),
            onKeyReleased: function (code, event) {
                console.log("[MainScene] onKeyReleased, cc.KEY", code);
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        if (this.shared.selected)
                            this.shared.selected.onNextClick(code);
                        break;
                    case cc.KEY.dpadCenter:
                    case cc.KEY.enter:
                        // if (!this.doubleClickTimer) {
                        //     this.doubleClickTimer = setTimeout(() => {
                        //         if (!this.isDoubleClick) {
                        //             this.shared.selected.onClick && this.shared.selected.onClick();
                        //         } else {
                        //             this.doubleClickCallback && this.doubleClickCallback();
                        //             this.isDoubleClick = false;
                        //         }
                        //         this.doubleClickTimer = null;
                        //         this.clickBeganTick = 0;
                        //         this.clickEndedTick = 0;
                        //     }, 500);
                        // }

                        this.shared.selected.onClick && this.shared.selected.onClick();

                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }
            }.bind(this)
        });
        cc.eventManager.addListener(this.keyboardListener, -1);
    },

    onExit: function () {
        this._super();
        if (this.keyboardListener)
            cc.eventManager.removeListener(this.keyboardListener);

        for (var frame in cc.spriteFrameCache._spriteFrames) {
            if (mpGD.startupFrames.indexOf(frame) < 0 ){
                console.log("remove frame", frame);
                cc.spriteFrameCache.removeSpriteFrameByName(frame)
            }
        }
    }
});





