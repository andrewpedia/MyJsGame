/**
 * Created by Apple on 2016/6/17.
 */

/**
 * 设置界面
 */
var MPSettingLayer = MPBaseModuleLayer.extend({

    titleSprite: null,

    bgMusicLabel: null,             //背景音乐文字
    effectLabel: null,              //音效文字

    helpBtn: null,                  //帮助按钮

    _className: "MPSettingLayer",
    _classPath: "src/main/module/MPSettingLayer.js",

    initEx: function () {


        this._super(cc.size(884,452));

        // this.bgSprite.size(871,420);
        // this.titleBG.showHelp()
        this.titleSprite = new cc.Sprite("#setting/font_shezhi.png").to(this.titleBG).pp(0.5,0.6);

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(this).size(800, 320).pp(0.495, 0.45);

        // this.setMoneyString(mpGD.userInfo.score);

        //音乐设置
        this.musicBtn = this.buildMusicControl("#setting/font_music.png", mpGD.isBgMusicOn, function () {
            mpGD.isBgMusicOn = true;
            SoundEngine.setMusicVolume(1);
            cc.sys.localStorage.setItem("isBgMusicOn", "true");
        }, function () {
            mpGD.isBgMusicOn = false;
            SoundEngine.setMusicVolume(0);
            cc.sys.localStorage.setItem("isBgMusicOn", "false");
        }).to(this).pp(0.34, 0.6);

        //音效设置
        this.effetcBtn = this.buildMusicControl("#setting/font_yinxiao.png", mpGD.isSoundOn, function () {
            mpGD.isSoundOn = true;
            SoundEngine.setEffectsVolume(1);
            cc.sys.localStorage.setItem("isSoundOn", "true");
        }, function () {
            mpGD.isSoundOn = false;
            SoundEngine.setEffectsVolume(0);
            cc.sys.localStorage.setItem("isSoundOn", "false");
        }).to(this).pp(0.62, 0.6);


        this.changeBtn = this.buildUserInfoNode().to(this).pp(0.5, 0.4);

        // this.helpBtn = new FocusButton("startup/login/scan_button_cheng.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.3);
        //
        //
        // // this.helpBtn.setTitleFontName("res/font/zhs-fz-52-yellow.fnt");
        // // this.helpBtn.setTitleText("帮 助");
        // // this.helpBtn.getTitleRenderer().pp(0.5, 0.55);
        //
        // // this.helpBtn.setScale9Enabled(true);
        // // this.helpBtn.size(100, 200);
        // // this.helpBtn.setTitleFontSize(32);
        // this.helpBtn.addTouchEventListener((sender, type) => {
        //
        //     if (type == ccui.Widget.TOUCH_BEGAN) {
        //         SoundEngine.playEffect(commonRes.btnClick);
        //     }
        //     else if (type == ccui.Widget.TOUCH_ENDED) {
        //         QRCodeScanner.onScanQRCode();
        //     }
        // });

        // this.loadMyQRcode();
    },

    // 创建我的二维码
    loadMyQRcode: function () {

        var friendID = mpGD.userInfo.userID.toString();

        friendID = Encrypt.xorWord(friendID, "game036");

        var url = "https://" + domain + ":16923/" + QRCodeScanner.addFrined + "?friendID=" + friendID;

        cc.loader.loadImg(ttutil.getQRCodeUrl(url), {isCrossOrigin: true}, (err, img) => {
            if (err) {
                console.error("扫码添加好友二维码加载失败", err, url);
                return;
            }

            var qrcode = new cc.Sprite(img).to(this).pp(0.5, 0.28);
            var label = new cc.LabelTTF("扫描上面二维码添加我为好友", "宋体", 20).to(this).pp(0.5, 0.1);
            if (cc.sys.isNative) {
                qrcode.setContentSize(200, 200);
                qrcode.pp(0.5, 0.28);
            } else {
                qrcode.setScale(0.5);
                qrcode.pp(0.5, 0.28);
            }
        });
    },

    initTV: function () {
        this._super();
        this.backBtn.setNextFocus(null, this.musicBtn.button, null, this.musicBtn.button);
        this.musicBtn.button.setNextFocus(this.backBtn, this.changeBtn.button, this.backBtn, this.effetcBtn.button);
        this.effetcBtn.button.setNextFocus(this.backBtn, this.changeBtn.button, this.musicBtn.button, null);
        this.changeBtn.button.setNextFocus(this.effetcBtn.button, null, null, null);
        // this.helpBtn.setNextFocus(this.changeBtn.button, null, null, null);
    },

    //创建用户信息层
    buildUserInfoNode: function () {

        // var node = new ccui.Scale9Sprite();
        // node.initWithSpriteFrameName("setting/box_bg02.png");
        // node.setCapInsets(cc.rect(100,134,571,134));
        // node.size(1100, 200);

        var node = new cc.Node().anchor(0.5,0.5);
        node.size(740, 200);
        // node.showHelp();


        var bg = new cc.Sprite("#setting/box_bg02.png").to(node).pp();//.qscale(1.2,1);

        // ("#gui-gonggao-cell-bg.png").anchor(0.5, 0.5);


        ttutil.buildHeadIcon(mpGD.userInfo.faceID).to(node).pp(0.11, 0.63);

        var nickname = new cc.LabelTTF(mpGD.userInfo.nickname, GFontDef.fontName, 25).to(node).anchor(0, 0.5).pp(0.22, 0.65);
        nickname.setFontFillColor(cc.color(252,202,59));


        var hintText;
        if (mpGD.userInfo.loginType == mpLoginType.GuestID) {
            hintText = "您已经处于游客登录状态";
        }
        else {
            hintText = "您已经处于账号登录状态";
        }

        var hint = new cc.LabelTTF(hintText, GFontDef.fontName, 25).anchor(0,0.5).to(node).pp(0.22, 0.4);
        hint.setColor(cc.color(230, 206, 123));

        var button = new FocusButton().to(node).pp(0.85, 0.5);
        button.loadTextureNormal("setting/btn_qhzh.png", ccui.Widget.PLIST_TEXTURE);

        var buttonTouchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                cc.log("点击切换账号");

                var focusClose = () => {
                    mpGD.mainScene.setFocusSelected(button);
                };
                var item = new MPMessageBoxLayer("提 示", "确定退出当前账号吗?", mpMSGTYPE.MB_OKCANCEL, function () {
                    mpGD.netHelp.logout();
                    mpGD.saNetHelper.logout();
                    mpApp.comeToLogon();
                }, null, focusClose).to(cc.director.getRunningScene());
            }
        };

        node.button = button;
        button.addTouchEventListener(buttonTouchEventListener);

        return node;
    },

    //音乐控制
    buildMusicControl: function (iconPath, on, openCallback, closeCallback) {

        var node = new cc.Node().size(200, 100).anchor(0.5, 0.5);
        var label = new cc.Sprite(iconPath).to(node).pp(0, 0.5);

        var button = new FocusButton().to(node).anchor(0, 0.5);
        button.mpOnPath = "setting/btn_open.png";
        button.mpOffPath = "setting/btn_close.png";
        button.mpOn = on;       //是否处理开启状态, 等会儿马上调用一次changeStatus

        var changeStatus = function () {
            button.mpOn = !button.mpOn;

            if (button.mpOn) {
                button.loadTextureNormal(button.mpOnPath, ccui.Widget.PLIST_TEXTURE);
                openCallback && openCallback();
            }
            else {
                button.loadTextureNormal(button.mpOffPath, ccui.Widget.PLIST_TEXTURE);
                closeCallback && closeCallback();
            }
        };

        button.loadTextureNormal(on ? button.mpOnPath : button.mpOffPath, ccui.Widget.PLIST_TEXTURE);

        button.pp(0.4, 0.5);

        var buttonTouchEventListener = function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                changeStatus();
            }
        };

        node.button = button;

        button.addTouchEventListener(buttonTouchEventListener);

        return node;
    }
});