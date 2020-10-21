/**
 * Created by 真心科技 on 2016/5/19.
 */


/**
 * 系统公告层
 */
var MPSystemNoticeLayer = MPBaseModuleLayer.extend(FocusBase).extend({

    data: null,

    _className: "MPSystemNoticeLayer",
    _classPath: "src/main/module/MPSystemNoticeLayer.js",

    ctor: function (data) {
        this._super();
        this.swallowTouch();
        var title = new cc.Sprite("#common_title_txmsg.png").to(this.bgSprite).pp(0.5,0.925)

        var self = this;
        var scene = self.getScene();
        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            // 返回之前的按钮
            scene.popDefaultSelectArray && scene.popDefaultSelectArray();
            self.removeFromParent();
        });
        //默认手指位置
        if (scene.shared && scene.shared.selected)
            scene.pushDefaultSelectArray(scene.shared.selected);

        this.size(cc.director.getWinSize());

        this.data = data;

        this.buildMessageBox().to(this).pp();

        this.setLocalZOrder(9999999);
        this.initTV();
    },
    
    initEx:function () {
        this._super(cc.size(942, 562));


    },

    initTV: function () {
        var scene = this.getScene();
        scene.setFocusSelected && scene.setFocusSelected(this.backBtn);
        this.backBtn.setNextFocus(null, this.linkTitle != null ? this.linkTitle : this.backBtn, null, null);
        this.linkTitle && this.linkTitle.setNextFocus(this.backBtn, null, null, null);
    },
    onExit: function () {
        this._super();

        this.data.callback && this.data.callback();
    },

    buildMessageBox: function () {

        var self = this;
        var node = new cc.Node().anchor(0.5, 0.5);

        var message = this.data.announcement;
        var link = this.data.link;
        var qq = this.data.qq;

        // this.bg = new cc.Scale9Sprite("res/gui/file/gui-ti-box.png").to(this);
        // var bg = new cc.Sprite("#gui-command-ad.png").to(node);
        // node.size(bg.size());
        // bg.pp();

        var bg = new ccui.Scale9Sprite("common_input_box.png");
        // bg.initWithSpriteFrameName("");
        bg.to(this).size(850, 420).pp(0.5, 0.47);
        node.size(942, 562);

        // var title = new cc.LabelTTF(this.title, GFontDef.fontName, 32).to(node).pp(0.5, 0.92);
        // title.setColor(cc.color(231, 208, 124));
        //

        var scrollView = new FocusScrollView().to(node).anchor(0.5, 1).pp(0.5, 0.8);
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);           //设置可点击
        scrollView.setBounceEnabled(true);          //设置有弹力
        scrollView.setContentSize(780, 350);     //限定一下点击区域
        // scrollView.showHelp();

        var message = new FocusText(message, GFontDef.fontName, 32);
        message.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        message.ignoreContentAdaptWithSize(false);
        // message.boundingWidth(780);
        message.setColor(cc.color(231, 208, 124));



        // 问题：自动换行后，获取文本高度的方法有误
        // 解决：没有找到合适的替换方法，故用字体像素的换算暂时处理
        var lineCount = 0;
        var lines = message.getString().split('\n');

        for (var i = 0; i < lines.length; i++) {
            if (lines[i]) {
                // 提取 数字|字母|空格|点
                var str = lines[i].replace(/[^a-z\d .]/ig, "");
                // 将数字字母等转换成汉字宽度计算个数
                var count = lines[i].length - Math.floor(str.length / 2);
                // 每行汉字个数限定为24，超过则换行
                lineCount = lineCount + Math.ceil(count / 24);
            } else {
                lineCount = lineCount + 1;
            }
        }

        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_WINDOWS) {
                message.setContentSize(cc.size(780, Math.max(350, lineCount * 33)));
            } else {
                message.setContentSize(cc.size(780, Math.max(350, lineCount * 38)));
            }
        } else {
            message.setContentSize(cc.size(780, Math.max(350, lineCount * 38)));
        }

        scrollView.setInnerContainerSize(message.size());//限定一下点击区域

        message.to(scrollView).pp();

        if (link != null)
            link = link.replace(/\s/g, "");

        if (link && ttutil.isUrl(link)) {

            var linkTitle = this.data.linkTitle || (" 点击跳转:" + link + " ");

            var linkLabel = this.linkTitle = mputil.buildUnderlineLabel(linkTitle).to(node).pp(0.5, 0.15);
            linkLabel.addClickEventListener(function () {
                if (link.endsWith(".apk")) {
                    native.downloadApk(link);
                    return;
                }

                if (G_PLATFORM_TV) {
                    ToastSystemInstance.buildToast("请用手机版本");
                    return;
                }

                if (qq != null)
                    native.callQQ(qq);
                else
                    cc.sys.openURL(link);
            })
        }

        // //关闭按钮
        // var closeBtn = this.closeBtn = new FocusButton().to(node).anchor(1.1, 1.1).pp(1, 1);
        // closeBtn.loadTextureNormal("gui-gm-button-close.png", ccui.Widget.PLIST_TEXTURE);
        // closeBtn.loadTexturePressed("gui-gm-button-close-dj.png", ccui.Widget.PLIST_TEXTURE);


        var self = this;
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                // 先保险这样写
                var scene = self.getScene();
                scene.popDefaultSelectArray && scene.popDefaultSelectArray();
                self.removeFromParent();
            }
        };

        // closeBtn.addTouchEventListener(bindTouchEvent);

        // node.setScale(0);
        //
        //
        // if (native.INIT_SCREEN_ORIENTATION == native.SCREEN_ORIENTATION_LANDSCAPE) {
        //     node.runAction(cc.scaleTo(0.5, 1).easing(cc.easeElasticOut()));
        // }
        // else {
        //     node.runAction(cc.scaleTo(0.5, 0.7).easing(cc.easeElasticOut()));
        // }


        return node;
    }


});