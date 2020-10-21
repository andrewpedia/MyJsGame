/**
 * Created by Apple on 2016/6/30.
 */


var MPShowProtocol = cc.LayerColor.extend({

    bg: null,

    _className: "MPShowProtocol",
    _classPath: "src/login/MPShowProtocol.js",

    ctor: function () {

        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();

        this.initEx();
        if (G_PLATFORM_TV)
        {
            this.initTV();
        }

        var self = this;
        this.swallowKeyboard(function () {
            if (!self.onClosePre || self.onClosePre()) {
                self.close();
            }
        });
    },


    initEx: function () {

        var self = this;
        this.size(mpV.w, mpV.h);
        var bg = new cc.Sprite("res/gui/login/gui-guest-register-box.png").to(this).pp();

        var title = new cc.LabelTTF(productName + "协议", GFontDef.fontName, 32).to(bg).pp(0.5, 0.9);
        title.setColor(cc.color(231, 208, 124));

        var scrollView = this.scrollView = new FocusScrollView().to(bg).anchor(0.5, 0.5).pp(0.5, 0.525);
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);           //设置可点击
        scrollView.setBounceEnabled(true);          //设置有弹力
        scrollView.setContentSize(680, 280);     //限定一下点击区域
        var treatyText = new cc.Sprite("res/gui/login/treatyText.png").to(scrollView).anchor(0, 0).p(20, 0);
        scrollView.setInnerContainerSize(treatyText.size());//限定一下点击区域


        var button = this.button = new FocusButton("btn_blue.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.5, 0.12);

        button.setTitleText("确定");
        button.setTitleFontSize(32);
        button.getTitleRenderer().pp(0.5, 0.55);

        button.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                self.close();
            }

        });


        //入场 动画
        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));

        this.bg = bg;
    },

    initTV: function () {
        cc.director.getRunningScene().setFocusSelected(this.button);
    },

    //关闭窗口
    close: function () {
        var self = this;

        // 暂停按钮点击
        this.getScene().pauseFocus();
        this.bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
            self.runAction(cc.sequence(cc.fadeOut(0.2), cc.callFunc(() => {
                mpGD.loginScene.popDefaultSelectArray();
            }), cc.removeSelf()));
        })));

    },


});