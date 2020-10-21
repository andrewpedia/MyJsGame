/**
 * Created by 真心科技 on 2016/5/19.
 */
/**
 * 消息框类型
 * @type {{MB_OK: number, MB_OKCANCEL: number}}
 */
var mpMSGTYPE = {
    MB_OK: 0,
    MB_OKCANCEL: 1
};

/**
 * 消息弹框
 */
var MPMessageBoxLayer = MPBaseModuleLayer.extend({

    type: mpMSGTYPE.MB_OKCANCEL,
    sureCallback: null,         //点确定回调
    cancelCallback: null,       //点取消回调
    message: null,
    title: null,
    _className: "MPMessageBoxLayer",
    _classPath: "src/extend/MPMessageBoxLayer.js",

    /**
     * @
     * @param message 内容信息
     * @param type 类型 {MSGTYPE}
     * @param cb 回调函数
     */
    ctor: function (title, message, type, sureCallback, cancelCallback) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();

        var self = this;
        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            if(!self.backPanal()){
                var scene = self.getScene();
                scene.popDefaultSelectArray && scene.popDefaultSelectArray();
            }
            //native 必须最后
            
            self.removeFromParent();
        });

        this.size(cc.director.getWinSize());

        this.title = title || "通知";
        this.message = message || "这是通知!这是通知!这是通知!这是通知!!这是通知!这是通知!这是通知!";
        this.type = (type == null) ? mpMSGTYPE.MB_OK : type;

        this.sureCallback = sureCallback;         //点确定回调
        this.cancelCallback = cancelCallback;       //点取消回调

        this.buildMessageBox().to(this).pp();

        this.setLocalZOrder(999999999);

        this.initTV();
    },

    initEx:function () {
        var width = cc.director.getWinSize().width;
        // var height = cc.director.getRunningScene().getSceneHeight();
        this._super(cc.size(width * 0.85, 380));
        this.backBtn.hide();
        this.titleBG.hide()
    },

    initTV: function () {
        if(!this.getScene().shared)return;
        var scene = this.getScene();

        //默认手指位置
        if(this.getScene().shared.selected)
            scene.pushDefaultSelectArray(this.getScene().shared.selected);
        scene.setFocusSelected(this.confirmBtn);
        this.confirmBtn.setNextFocus(null, null, this.cancelBtn.isVisible() ? this.cancelBtn : null, null);
        this.cancelBtn.setNextFocus(null, null, null, this.confirmBtn);
        scene.setSelectedNode && scene.setSelectedNode(this.confirmBtn);
    },

    buildMessageBox: function () {
        this.bgSprite.hide();
        var showScancode = (!cc.sys.isMobile || G_PLATFORM_TV) && this.sureCallback == mpApp.closePlaza;

        var node = new cc.Node().anchor(0.5, 0.5);

        var bg = new ccui.Scale9Sprite("common_input_box.png");
        // bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(this).size(cc.director.getWinSize().width * 0.8, 300).pp(0.5, 0.5);
        node.size(968,344);

        // var title = new cc.LabelTTF(this.title, GFontDef.fontName, 32).to(node).pp(0.5, 0.92);
        // title.setColor(cc.color(231, 208, 124));
        //

        var message = new ccui.Text(this.message, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        message.setContentSize(700, 800);
        message.anchor(0.5, 1);
        message.setColor(cc.color(231, 208, 124));
        if(showScancode)
            message.to(node).pp(0.33, 0.8);
        else
            message.to(node).pp(0.5, 0.8);

        var confirmBtn = this.confirmBtn = new FocusButton("charge_btn_main_default1.png", "", "", ccui.Widget.PLIST_TEXTURE).to(node).qscale(0.96);
        // var confirmTitle = new ccui.Text("确定","")
        //confirmBtn.setTitleFontName("res/font/FZY4JW.TTF");
        confirmBtn.setTitleFontSize(40);
        // confirmBtn.setTitleColor(cc.color(201,255,253));
        confirmBtn.setTitleText("确 定");
        confirmBtn.getTitleRenderer().pp(0.5, 0.55);
        if(showScancode)
            confirmBtn.pp(0.5, 0.2);
        else
            confirmBtn.pp(0.75, 0.2);

        var cancelBtn = this.cancelBtn = new FocusButton("charge_btn_main_default1.png", "", "", ccui.Widget.PLIST_TEXTURE).to(node).qscale(0.96);
        //cancelBtn.setTitleFontName("res/font/FZY4JW.TTF");
        cancelBtn.setTitleFontSize(40);
        // cancelBtn.setTitleColor(cc.color(201,255,253));
        cancelBtn.setTitleText("取 消");
        cancelBtn.getTitleRenderer().pp(0.5, 0.55);
        if(showScancode)
            cancelBtn.pp(0.18, 0.2);
        else
            cancelBtn.pp(0.25, 0.2);

        if(showScancode)
        {
            var url = "http://pan.baidu.com/share/qrcode?w=150&h=150&url=" + officialWebsite + "?channel=scancode";
            cc.loader.loadImg(url, {isCrossOrigin: true}, (err, img) => {
                if (err) {
                    cc.error("扫码登录二维码加载失败", err, url);
                    return;
                }

                this.sprite = new cc.Sprite(img).to(node, 2);
                if (cc.sys.isNative) {
                    this.sprite.setContentSize(220, 220);
                } else {
                    this.sprite.setScale(0.5);
                }

                this.sprite.pp(0.8, 0.5);
            });

            new cc.LabelTTF("扫码手机玩", GFontDef.fontName, 28).to(node).pp(0.8, 0.1);
        }

        var self = this;
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                if(this.getScene().useKeyboard && !self.backPanal()){
                    this.getScene().popDefaultSelectArray();
                }
                switch (sender) {
                    case confirmBtn:
                        cc.log("点击确定");
                        self.sureCallback && self.sureCallback();
                        break;

                    case cancelBtn:
                        cc.log("点击取消");
                        self.cancelCallback && self.cancelCallback();
                        break;
                }
                self.removeFromParent();
            }
        };

        confirmBtn.addTouchEventListener(bindTouchEvent);
        cancelBtn.addTouchEventListener(bindTouchEvent);

        // node.setScale(0);

        if (native.INIT_SCREEN_ORIENTATION == native.SCREEN_ORIENTATION_LANDSCAPE) {
            // node.runAction(cc.scaleTo(0.5, 1).easing(cc.easeElasticOut()));
            node.setScale(1);
        }
        else {
            // node.runAction(cc.scaleTo(0.5, 0.7).easing(cc.easeElasticOut()));
            node.setScale(0.7);
        }

        if (this.type == mpMSGTYPE.MB_OK) {
            cancelBtn.hide();
            confirmBtn.pp(0.5, 0.2);
        }

        return node;
    },
    backPanal: function () {
        var scene = this.getScene();
        if (scene && scene.setSelectPanal) {
            scene.setSelectPanal();
            return true;
        }
        return false;
    }
});