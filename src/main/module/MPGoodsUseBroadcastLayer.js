/**
 * Created by orange on 2016/10/11.
 */

var MPGoodsUseBroadcastLayer = cc.LayerColor.extend({

    closeBtn: null,
    editBox: null,
    sureBtn: null,


    cb: null,

    _className: "MPGoodsUseBroadcastLayer",
    _classPath: "src/main/module/MPGoodsUseBroadcastLayer.js",

    ctor: function (cb) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();
        this.swallowKeyboard(() => {
            mpGD.mainScene.popDefaultSelectArray();
            this.removeFromParent();
        });
        this.cb = cb;

        this.initEx();
        this.initTV();
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.closeBtn);

        this.refreshFocus();
    },

    refreshFocus: function () {
        this.closeBtn.setNextFocus(null, this.editBox, null, null);
        this.editBox.setNextFocus(this.closeBtn, this.sureBtn, null, null);
        this.sureBtn.setNextFocus(this.editBox, null, null, null);
    },

    initEx: function () {
        var bg = new cc.Sprite("#res/gui/file/gui-ti-box.png").to(this).pp();

        var title = new cc.LabelTTF("发送喇叭消息", GFontDef.fontName, 32).to(bg).pp(0.5, 0.92);
        title.setColor(cc.color(231, 208, 124));

        //关闭按钮
        var closeBtn = new FocusButton().to(bg).pp(0.97, 0.92);
        closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);

        this.closeBtn = closeBtn;


        // this.closeBtn = new ccui.Button("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        // this.closeBtn.to(bg).pp(0.97, 0.92);

        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
        };

        this.editBox = new FocusEditBox(cc.size(600, 60), new ccui.Scale9Sprite("res/gui/login/gui-Login-text-box.png"));
        this.editBox.to(bg).pp(0.5, 0.65);
        this.editBox.setFontSize(24);
        this.editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
        this.editBox.setMaxLength(200);
        this.editBox.setFontColor(cc.color(255, 255, 255, 255));
        // this.editBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);

        this.closeBtn.addTouchEventListener(touchEventListener);
        this.closeBtn.addClickEventListener(() => {
            mpGD.mainScene.popDefaultSelectArray();
            bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                this.removeFromParent();
            })));
        });

        //确定按钮
        var button = new FocusButton("gui-gm-button-yellow.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.5, 0.2);
        button.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        button.setTitleText("确 定");
        button.getTitleRenderer().pp(0.5, 0.55);
        button.addTouchEventListener(touchEventListener);
        button.addClickEventListener(this.onSubmit.bind(this));
        this.sureBtn = button;
    },

    onSubmit: function () {

        var msg = this.editBox.getString();
        if (!msg || msg.length == 0) {
            ToastSystemInstance.buildToast("发送的喇叭消息不能为空");
            return;
        }

        mpGD.mainScene.popDefaultSelectArray();

        this.cb && this.cb(msg);
        this.removeFromParent();
    }
});