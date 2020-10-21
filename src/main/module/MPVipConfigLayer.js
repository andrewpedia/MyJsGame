/**
 * Created by Apple on 2016/6/22.
 */


/**
 * 构建VIP特权说明表
 */
var MPVipConfigLayer = MPBaseModuleLayer.extend({

    bg: null,

    _className: "MPVipConfigLayer",
    _classPath: "src/main/module/MPVipConfigLayer.js",

    ctor: function () {

        this._super();
        this.swallowTouch();
        this.size(mpV.w, mpV.h);
        this.initTV();
    },

    initEx: function () {
        this._super(cc.size(1250, 500));

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.size(1200, 400).to(this).pp(0.5,0.45);


        this.titleSprite = new cc.Sprite("#title_vip.png").to(this.titleBG).pp(0.5, 0.6);


        this.bg = this.buildVipConfigTable().to(bg).pp(0.5, 0.5);

        this.fillData();

    },
    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.closeBtn);

        // this.closeBtn.setNextFocus(null, this.czBtn, null, null);
        this.czBtn.setNextFocus(this.closeBtn, null, null, null);

    },

    onExit: function () {
        this._super();
        mpGD.netHelp.removeNetHandler(this);
    },

    onEnter: function () {
        this._super();
        mpGD.netHelp.addNetHandler(this);
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.ReadVipConfig:

                mpGD.vipConfig = data;
                //读取VIP配置
                this.fillData();
                break;
        }
    },

    fillData: function () {
        if (mpGD.vipConfig) {
            var bg = this.bgText;

            var dx = 97;
            var dy = 58;

            var size = bg.getContentSize();
            pw = size.width;
            ph = size.height;  

            for (var i = 0; i < mpGD.vipConfig.length; ++i) {
                var config = mpGD.vipConfig[i];

                var getMinMoney = new cc.LabelTTF((config.paySum || "0") + "元", GFontDef.fontName, 16).to(bg).p(135 + dx + dx * i, ph*0.75);

                getMinMoney.setColor(cc.color(25, 25, 112));

                var tax = new cc.LabelTTF((config.tax * 100) + " %", GFontDef.fontName, 16).to(bg).p(135 + dx + dx * i, ph*0.5);
                tax.setColor(cc.color(25, 25, 112));
  

                var transferMoneyCondition = new cc.LabelTTF(config.transferMoneyCondition, GFontDef.fontName, 16).to(bg).p(135 + dx + dx * i, ph*0.25);
                transferMoneyCondition.setColor(cc.color(25, 25, 112));


            }

        }
    },

    buildVipConfigTable: function () {
        var self = this;

        var bg = new cc.Node().anchor(0.5,0.5);
        bg.size(1180,400);

        this.swallowKeyboard(function () {
            close();
        });


        var bgText = new ccui.Scale9Sprite();
        bgText.initWithSpriteFrameName("frame_sub_bg.png");
        bgText.size(1160,200).to(bg).pp(0.5, 0.5);

        this.bgText = bgText

        for (var i = 0; i < 10; ++i) {
            mputil.buildVipIcon(i).to(bg).p(238 + i * 95, 345);
        }

        var title1 = new cc.LabelTTF("充值金额", GFontDef.fontName, 24).to(bgText).pp(0.1, 0.75);
        title1.setColor(cc.color(25, 25, 112));

        var temp = new cc.LabelTTF("打赏税收", GFontDef.fontName, 24).to(bgText).pp(0.1, 0.5);
        temp.setColor(cc.color(25, 25, 112));

        var temp = new cc.LabelTTF("最低打赏金额", GFontDef.fontName, 24).to(bgText).pp(0.1, 0.25);
        temp.setColor(cc.color(25, 25, 112));
/*
        new cc.Sprite("#gui-vip-current-level.png").to(bg).p(105, 100);      //当前vip等级
        new cc.Sprite("#gui-vip-icon-vip.png").to(bg).p(250, 100);               //vip图标
        new cc.Sprite("#gui-vip-num-" + mpGD.userInfo.memberOrder + ".png").to(bg).p(300, 102);     //vip数字

        if (mpGD.userInfo.memberOrder != 9) {
            new cc.Sprite("#gui-vip-arrow.png").to(bg).p(500, 100);         //升级箭头
            new cc.Sprite("#gui-vip-icon-vip.png").to(bg).p(800, 100);
            new cc.Sprite("#gui-vip-num-" + (mpGD.userInfo.memberOrder + 1) + ".png").to(bg).p(850, 90);
        }
*/
    

        var temp = new cc.LabelTTF("当前等级：", GFontDef.fontName, 40).to(bg).p(140, 40);
        temp.setColor(cc.color(203, 186, 105));
         mputil.buildVipIcon(mpGD.userInfo.memberOrder).to(bg).p(270, 40);
         if (mpGD.userInfo.memberOrder < 9) {
             mputil.buildVipIcon(mpGD.userInfo.memberOrder+1).to(bg).p(470, 40);

             for (var i = 0; i < 5; i++) {
                new cc.Sprite("#gui-vip-arrow.png").to(bg).p(330+20*i, 40);         //升级箭头                
             }

        }
        var czBtn = this.czBtn = new FocusButton("btn_cz.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.6, 0.13).qscale(0.9);
        czBtn.addTouchEventListener(function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                this.pushDefaultSelectArray(czBtn);
                //点击充值
                cc.log("点击充值");
                mpGD.mainScene.onClickCZ(sender);
            }

        });

        return bg;
    },


});