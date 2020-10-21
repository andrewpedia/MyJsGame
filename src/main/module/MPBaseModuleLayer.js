/**
 * Created by Apple on 2016/6/17.
 */
var MPBaseModuleLayer = cc.LayerColor.extend({

    bgSprite: null,
    backBtn: null,
    titleBG: null,          //标题背景

    goldNode: null,         //金币框

    onClosePre: null,        //返回false则， 停止关闭

    onUserInfoUpdateListener: null,         //用户信息更新

    _className: "MPBaseModuleLayer",
    _classPath: "src/main/module/MPBaseModuleLayer.js",

    ctor: function (color) {
        color = color || cc.color(0, 0, 0, 190);
        this._super(color);
        this.initEx();

        if (this.getScene().useKeyboard) {
            this.initTV();
        }
    },

    onEnter: function () {
        this._super();
        // this.p(0, mpV.h + 100);
        // this.setAnchorPoint(cc.p(0.5,0.5));
        this.setOpacity(0);
        this.setScale(0);
        this.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBackOut()));
        this.runAction(cc.sequence(
            cc.delayTime(0.15),
            cc.fadeTo(0.1,190)
        ))
        mpGD.netHelp.addNetHandler(this);
        this.onUserInfoUpdateListener = cc.eventManager.addCustomListener(mpEvent.UpdateUserInfo, this.updateUserInfo.bind(this));

    },
    updateUserInfo: function () {

    },
    onExit: function () {
        this._super();

        //判断是否在游戏中， 如果在游戏中， 那就不释放网络监听， 这样可能 网络监听会被多次增加， 但多次增加有判定， 会过滤

        mpGD.netHelp.removeNetHandler(this);
        cc.eventManager.removeListener(this.onUserInfoUpdateListener);
    },

    //返回false则停止关闭
    setClosePreCallback: function (callback) {
        this.onClosePre = callback;
    },

    initEx: function (bgSize) {

        bgSize = bgSize || cc.size(1184, 620);
        this.size(cc.director.getWinSize());
        // this.bgSprite = new cc.Sprite("#com_bg.png").to(this).pp(0.5, 0.5);
        this.bgSprite = new ccui.Scale9Sprite('shell_bg_common_632x433.png').to(this).pp();

        // this.bgSprite.initWithSpriteFrameName("com_bg.png");
        // this.bgSprite.setCapInsets(cc.rect(100, 100, 984, 420));
        this.bgSprite.size(bgSize);

        // ttutil.adjustNodePos(this.bgSprite);
        this.titleBG = new cc.Sprite().anchor(0.5, 0.5).to(this.bgSprite).p(bgSize.width / 2, bgSize.height - 50);

        this.backBtn = new FocusButton();
        this.backBtn.loadTextureNormal("hongbao_btn_x.png", ccui.Widget.PLIST_TEXTURE);
        this.backBtn.to(this.bgSprite).p(bgSize.width - 30, bgSize.height - 24);
        var self = this;
        this.backBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                if (!self.onClosePre || self.onClosePre()) {
                    self.close();
                }

            }
        });
        this.swallowKeyboard(function () {
            if (!self.onClosePre || self.onClosePre()) {
                self.close();
            }
        });

        // this.goldNode = this.buildGoldNode().to(this).p(mpV.w - 300, mpV.h - 80);

        // if (this._className == "MPBankLayer")
        //     this.hongbaoNode = this.buildHongbaoNode().to(this).p(mpV.w - 300, mpV.h - 150);

        this.swallowTouch();
    },
    initTV: function () {
        this.getScene().setFocusSelected(this.backBtn);
    },

    //关闭窗口
    close: function () {
        this.getScene().pauseFocus();
        this.runAction(cc.sequence(cc.scaleTo(0.3, 0).easing(cc.easeBackIn(0.8)),
            cc.callFunc(() => {
                if (this.getScene().useKeyboard) {
                    this.getScene().popDefaultSelectArray();
                }
            }), cc.removeSelf()));

        // this.setColor(cc.color(0,0,0,0));
        // this.runAction(cc.fadeTo(0.25, 0));
        this.setOpacity(0);
    },

    //红包转出
    buildHongbaoNode: function () {
        var node = new cc.Node().size(300, 64);
        var hongbaoIcon = new cc.Sprite("#gui-bank-hongbao-logo.png").to(node).pp(0, 0.5);
        var hongbaoLabel = this.hongbaoLabel = new cc.LabelBMFont((Number(mpGD.userInfo.luckyRMB || 0)).toFixed(2), "res/font/zhs-fzzyjw-24-red.fnt").to(node).pp(0.2, 0.5).anchor(0, 0.5);
        if (!G_OPEN_RED_PACKET) {
            hongbaoIcon.hide();
            hongbaoLabel.hide();
        }

        this.zhuanchuButton = new FocusButton("gui-bank-hongbao-zhuanchu.png", "gui-bank-hongbao-zhuanchu.png", "", ccui.Widget.PLIST_TEXTURE).to(node).pp(0.65, 0.5);
        this.zhuanchuButton.addTouchEventListener((sender, type) => {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                if (mpGD.userInfo.realname == null) {
                    if (mpGD.userInfo.phone)
                        ToastSystemInstance.buildToast("您还未实名认证，请先解绑手机再重新绑定手机实名验证。");
                    else if (mpGD.userInfo.account)
                        ToastSystemInstance.buildToast("您还未实名认证，请点击大厅左上角头像进入【账户安全】绑定手机实名验证。");
                    else
                        ToastSystemInstance.buildToast("您还未实名认证，请点击大厅左上角头像进入【个人中心】绑定正式账号再绑定手机实名验证。");
                    return;
                }

                mpGD.mainScene.pushDefaultSelectArray(this.zhuanchuButton);
                new MPBankHongBaoLayer(mpGD.userInfo.luckyRMB).to(this);
            }
        });

        !G_OPEN_TAKE_CASH && this.zhuanchuButton.hide();

        return node;
    },

});