/**
 * Created by god on 2018/2/23.
 */

var MPJuHuiTuiJianInputLayer = cc.Layer.extend({
    _className: "MPJuHuiTuiJianInputLayer",
    _classPath: "src/main/module/activity/MPActivityLayer.js",

    bg: null,
    dialog: null,
    recommendGameID: null,
    callback: null,
    ctor: function (callback) {
        this._super();
        this.size(mpV.w, mpV.h);
        this.initEx();
        mpGD.netHelp.addNetHandler(this);
        this.callback = callback;
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        this._super();
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.SetRecommendGameID:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    ToastSystemInstance.buildToast("设置成功");
                    mpApp.updateUserInfo({recommendGameID: Number(this.recommendGameID)});
                    this.callback && this.callback();
                    this.close();

                }
                break;

        }
    },

    initEx: function () {
        this._super(cc.size(mpV.w - 150, mpV.h - 100));
        /////////////////////////////////////////////////////////////////////////////////
        // this.bg = new cc.LayerColor(cc.color(255, 150, 250, 0), mpV.w, mpV.h).to(this);
        // this.bg.runAction(cc.fadeTo(1, 150));
        var self = this;
        this.swallowKeyboard(function () {
            self.close();
        });
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

                if (!cc.rectContainsPoint(self.dialog.getBoundingBox(), touch.getLocation())) {
                    self.close();
                }

            }
        });
        cc.eventManager.addListener(touchListener, this);
        ////////////////////////////////////////////////////////////////////////////////

        this.dialog = this.buildDialog().to(this).pp(0.5, 1.5);

        this.dialog.runAction(cc.moveTo(1, mpV.w / 2, mpV.h / 2).easing(cc.easeExponentialOut()));
    },

    close: function (){
        this.removeFromParent();
    },

    buildDialog: function () {

        var self = this;

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("res/gui/file/gui-ts-box.png");
        bg.size(700, 300);

        var hint = this.hint = new FocusLabelTTF("请输入8位数的推荐码", GFontDef.fontName, 20).to(bg).pp(0.5, 0.8);

        var editBox = mputil.buildEditBox("请输入推荐码", "推荐码").to(bg).pp(0.6, 0.6);
        editBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);


        //--------------------------------------------------------------------------------------------------------------------
        var btn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.5, 0.2);
        btn.setTitleText("提交");
        btn.setTitleFontSize(32);
        btn.getTitleRenderer().pp(0.5, 0.55);
        btn.setTitleColor(cc.color(255, 255, 128));
        btn.addClickEventListener(function () {
            var str = editBox.getString();
            if (str.length != 8 || !str.match(/^\d{8}$/)) {
                ToastSystemInstance.buildToast("推荐码错误");
                return;
            }

            if (str == mpGD.userInfo.gameID) {
                ToastSystemInstance.buildToast("推荐码不能是自己的");
                return;
            }

            self.recommendGameID = str;
            mpGD.netHelp.requestSetRecommendGameID(editBox.getString());
            mpApp.showWaitLayer("正在设置推荐人,请稍候");
        });


        return bg;
    }

});