/**
 * Created by Apple on 2017/7/17.
 */


var MPHongBaoLayer = cc.LayerColor.extend({
    _className: "MPHongBaoLayer",
    _classPath: "src/main/module/activity/MPHongBaoLayer.js",


    data: null,

    ctor: function (data) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        this.swallowTouch();

        var self = this;
        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            self.removeFromParent();
        });

        this.size(cc.director.getWinSize());

        this.data = data;

        this.hongBao = this.buildHongBao().to(this).pp();


        this.setLocalZOrder(9999999);

        mpGD.netHelp.addNetHandler(this);

        this.hasShowTakeInfo = false;   //是否已经展示过领取详情
    },


    cleanup: function () {

        mpGD.netHelp.removeNetHandler(this);
        this._super();
    },

    onNetEvent: function (event, data) {
        switch (event) {

            case mpNetEvent.ActivityRandomHongBao:

                mpApp.removeWaitLayer();
                if (!data.errMsg) {

                    if (data.msgType == 2) {

                        if (data.id == this.data.id) {
                            this.showTakeInfo(data);
                        }


                    }

                }
                break;
        }
    },

    /**
     *  展示领取详情
     * @param data
     */
    showTakeInfo: function (data) {

        if (!this.hasShowTakeInfo) {
            this.hasShowTakeInfo = true;

            this.hongBao.display("res/activity/xiangqing.png");
            this.hongBao.unbindTouch();
            new cc.LabelTTF("领取详情", GFontDef.fontName, 30).to(this.hongBao).pp(0.5, 0.95);


            var descTTF;
            if (data.money > 0) {
                descTTF = new cc.LabelTTF("我抢到" + data.money, GFontDef.fontName, 30).to(this.hongBao).pp(0.5, 0.85);
            }
            else {
                descTTF = new cc.LabelTTF("未抢到红包", GFontDef.fontName, 30).to(this.hongBao).pp(0.5, 0.85);
            }
            descTTF.setColor(cc.color(255, 196, 96));

            {
                new cc.LabelTTF("类型:", GFontDef.fontName, 20).to(this.hongBao).pp(0.1, 0.75).setColor(cc.color(79, 47, 17));
                new cc.LabelTTF("总额:", GFontDef.fontName, 20).to(this.hongBao).pp(0.4, 0.75).setColor(cc.color(79, 47, 17));
                new cc.LabelTTF("份数:", GFontDef.fontName, 20).to(this.hongBao).pp(0.8, 0.75).setColor(cc.color(79, 47, 17));
                //-----------------------------------------------------------------------------------------------------------------------

                new cc.LabelTTF(this.data.type == 1 ? "随机" : "等额", GFontDef.fontName, 20).anchor(0, 0.5).to(this.hongBao).pp(0.17, 0.75).setColor(cc.color(79, 47, 17));
                new cc.LabelTTF(this.data.money, GFontDef.fontName, 20).to(this.hongBao).anchor(0, 0.5).pp(0.47, 0.75).setColor(cc.color(79, 47, 17));
                new cc.LabelTTF(this.data.num, GFontDef.fontName, 20).to(this.hongBao).anchor(0, 0.5).pp(0.87, 0.75).setColor(cc.color(79, 47, 17));
            }

            var title1 = new cc.LabelTTF("昵称", GFontDef.fontName, 26).to(this.hongBao).pp(0.15, 0.64);
            title1.setColor(cc.color(255, 255, 0));

            var title2 = new cc.LabelTTF("金额", GFontDef.fontName, 26).to(this.hongBao).pp(0.45, 0.64);
            title2.setColor(cc.color(255, 255, 0));

            var title3 = new cc.LabelTTF("领取时间", GFontDef.fontName, 26).to(this.hongBao).pp(0.8, 0.64);
            title3.setColor(cc.color(255, 255, 0));


            var listView = new ccui.ListView().anchor(0.5, 0).to(this.hongBao).pp(0.5, 0.01);
            listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
            listView.setTouchEnabled(true);
            listView.setBounceEnabled(true);
            listView.setContentSize(425, 235);
            listView.setItemsMargin(20);

            var refreshBtn = new ccui.Button("res/activity/refresh.png", "", "", ccui.Widget.LOCAL_TEXTURE);
            refreshBtn.to(this.hongBao).pp(0.1, 0.9);
            refreshBtn.addClickEventListener(() => {
                // this.removeFromParent();
                mpGD.netHelp.requestActivityHongBao(this.data.id);
            });

            var closeBtn = new ccui.Button("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
            closeBtn.to(this.hongBao).pp(0.93, 0.93);
            closeBtn.addClickEventListener(() => {
                this.removeFromParent();
            });


            this.listView = listView;
        }


        if (data.takeInfo) {

            var listView = this.listView;

            listView.removeAllItems();

            for (var i = 0; i < data.takeInfo.length; ++i) {

                var info = data.takeInfo[i];

                var widget = new ccui.Widget();
                widget.size(410, 40);

                if (info.userID == mpGD.userInfo.userID) {
                    new cc.LayerColor(cc.color(0, 0, 0, 50), 410, 40).to(widget);
                }

                var nickname = new cc.LabelTTF(info.nickname, GFontDef.fontName, 26).to(widget).anchor(0.5, 0.5).pp(0.2, 0.5);
                nickname.setColor(cc.color(255, 0, 0));

                var scale = 130 / nickname.width;
                if (scale < 1) {
                    nickname.setScale(scale);
                }


                var money = new cc.LabelTTF(info.money, GFontDef.fontName, 26).to(widget).pp(0.5, 0.5);
                money.setColor(cc.color(255, 0, 0));

                var ts = new cc.LabelTTF(info.ts, GFontDef.fontName, 26).to(widget).anchor(0, 0.5).pp(0.7, 0.5);
                ts.setColor(cc.color(255, 0, 0));

                new cc.Sprite("res/activity/xian.png").to(widget).pp(0.5, 0).qscale(0.6, 1);

                listView.pushBackCustomItem(widget);
            }
        }


    },

    /**
     * 创建红包
     * @returns {*}
     */
    buildHongBao: function () {

        var hongBao = new cc.Sprite("res/activity/hongbao.png");
        var self = this;
        hongBao.bindTouch({
            onTouchBegan: function () {
                mpApp.showWaitLayer("正在玩命抢...");
                mpGD.netHelp.requestActivityHongBao(self.data.id);
                return true;
            },
        });

        hongBao.setScale(0);
        hongBao.runAction(cc.scaleTo(0.5, 1, 1).easing(cc.easeBackOut()));


        return hongBao;
    },


});