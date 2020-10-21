/**
 * Created by Apple on 2016/9/22.
 */


/**
 * 验证码层
 */
var MPCodeLayer = MPBaseModuleLayer.extend({
    bg: null,
    callback: null,

    _className: "MPCodeLayer",
    _classPath: "src/layer/MPCodeLayer.js",

    ctor: function () {
        this._super();
        this.swallowTouch();
        var self = this;
        this.swallowKeyboard(function () {
            self.getScene().popDefaultSelectArray();
            self.removeFromParent();
        });
        //默认退出手指位置
        if (this.getScene().shared && this.getScene().shared.selected)
            this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
    },

    initEx: function () {
        this._super(cc.size(968,400));
        var self = this;

        this.titleBG.hide();

        var bg = new ccui.Scale9Sprite("common_input_box.png");
        //bg.initWithSpriteFrameName("");
        bg.size(800, 270).to(this).pp(0.5,0.46);

        this.bg = bg;

        // var title = new FocusLabelTTF("请输入图形验证码", GFontDef.fontName, 32).to(this.bg).pp(0.5, 0.92);
        // title.setColor(cc.color(231, 208, 124));


        var text1 = new FocusLabelTTF("请输入验证码", GFontDef.fontName, 32).to(this.bg).pp(0.25, 0.82);
        text1.setColor(cc.color(231, 208, 124));


        this.codeEdit = mputil.buildEditBox("请输入验证码", "").to(this.bg, 10).pp(0.5, 0.55);

        var securityCodeLayer = this.securityCodeLayer = new SecurityCodeLayer().to(this.bg).pp(0.5, 0.82);

        var underLabel = this.underLabel = mputil.buildUnderlineLabel("点击刷新").to(this.bg).pp(0.7, 0.82);
        underLabel.addClickEventListener(function () {
            securityCodeLayer.refresh();
        });

        //关闭按钮

        // var closeBtn = this.closeBtn = new FocusButton("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        // closeBtn.to(this.bg).pp(0.97, 0.92);

        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
        };

        // closeBtn.addTouchEventListener(touchEventListener);
        // closeBtn.addClickEventListener(function () {
        //     self.getScene().pauseFocus();
        //     self.bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
        //         self.getScene().popDefaultSelectArray();
        //         self.removeFromParent();
        //     })));
        // });
        //确定按钮
        var button = this.button = new FocusButton("common_btn_yes.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.bg).pp(0.5, 0.2);
        // button.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // button.setTitleText("确 定");
        // button.getTitleRenderer().pp(0.5, 0.55);
        button.addTouchEventListener(touchEventListener);
        button.addClickEventListener(function () {
            self.onSubmit();
        });

        // this.bg.setScale(0);
        // this.bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));
    },
    initTV: function () {
        this.getScene().setFocusSelected(this.codeEdit);

        this.backBtn.setNextFocus(null, this.underLabel, this.underLabel, null);
        // 点击刷新
        this.underLabel.setNextFocus(this.closeBtn, this.codeEdit, this.codeEdit, this.closeBtn);
        // 请输入验证码
        this.codeEdit.setNextFocus(this.underLabel, this.button, null, this.underLabel);
        // 确认按钮
        this.button.setNextFocus(this.codeEdit, null, null, null);
    },
    setSubmitCallback: function (callback) {
        this.callback = callback;
    },

    onSubmit: function () {

        var code = this.codeEdit.getString();

        if (code.length == 0) {
            ToastSystemInstance.buildToast("验证码错误");
            return;
        }

        this.callback && this.callback(code);
        this.getScene().popDefaultSelectArray();
        this.removeFromParent();
        // cc.log("点击提交")
    }

});