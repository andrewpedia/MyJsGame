/**
 * Created by Apple on 2016/6/21.
 */


/**
 * 实物商品订单凭证层
 */
var MPGoodsOrderCertificatesLayer = cc.LayerColor.extend({

    itemInfo: null,

    _className: "MPGoodsOrderCertificatesLayer",
    _classPath: "src/main/module/MPGoodsOrderCertificatesLayer.js",

    ctor: function (data) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));
        var self = this;

        this.swallowTouch();
        this.swallowKeyboard(function () {
            SoundEngine.playEffect(commonRes.btnClick);
            self.getScene().pauseFocus();
            self.bg && self.bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                self.getScene().popDefaultSelectArray();
                self.removeFromParent();
            })));
        });
        this.size(mpV.w, mpV.h);

        this.itemInfo = data;
        this.initEx();
        this.initTV();
    },


    initEx: function () {

        this.buildCertificates().to(this).pp(0.5, 0.5);

    },

    initTV: function () {
        this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
        this.getScene().setFocusSelected(this.closeBtn)
    },

    //创建凭证
    buildCertificates: function () {
        var self = this;
        var bg = this.bg = new cc.Sprite("res/gui/file/gui-bank-detail-bg.png");

        //关闭按钮
        //--------------------------------------------关闭按钮
        var closeBtn = this.closeBtn = new FocusButton("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(bg).pp(0.95, 0.95);
        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                self.getScene().pauseFocus();
                bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                    self.getScene().popDefaultSelectArray();
                    self.removeFromParent();
                })));
            }
        };
        closeBtn.addTouchEventListener(touchEventListener);
        //--------------------------------------------关闭按钮

        var tagArray = [];

        tagArray.push(this.buildLabel("奖品名 :").to(bg).anchor(1, 0.5).pp(0.42, 0.8));
        tagArray.push(this.buildLabel("选项 :").to(bg).anchor(1, 0.5).pp(0.42, 0.8));
        tagArray.push(this.buildLabel("收货人手机号码 :").to(bg).anchor(1, 0.5).pp(0.42, 0.7));
        tagArray.push(this.buildLabel("详细收货地址 :").to(bg).anchor(1, 0.5).pp(0.42, 0.6));
        tagArray.push(this.buildLabel("备注 :").to(bg).anchor(1, 0.5).pp(0.42, 0.5));
        tagArray.push(this.buildLabel("快递单号 :").to(bg).anchor(1, 0.5).pp(0.42, 0.4));
        tagArray.push(this.buildLabel("状态 :").to(bg).anchor(1, 0.5).pp(0.42, 0.3));
        tagArray.push(this.buildLabel("下单时间 :").to(bg).anchor(1, 0.5).pp(0.42, 0.2));
        //---------------------------------------------------------------------------
        //---------------------------------------------------------------------------
        //---------------------------------------------------------------------------

        var choice = "";

        // if(this.itemInfo.choice != null && this.itemInfo.choice != "")
        {
            for (var key in this.itemInfo.choice) {
                choice += this.itemInfo.choice[key] + " ";
            }
        }

        var dataArray = [];

        dataArray.push(this.buildLabel(this.itemInfo.name).to(bg).anchor(0, 0.5).pp(0.45, 0.8));
        dataArray.push(this.buildLabel(choice).to(bg).anchor(0, 0.5).pp(0.45, 0.8));
        dataArray.push(this.buildLabel(this.itemInfo.phone).to(bg).anchor(0, 0.5).pp(0.45, 0.7));
        dataArray.push(this.buildLabel(this.itemInfo.address).to(bg).anchor(0, 0.5).pp(0.45, 0.6));
        dataArray.push(this.buildLabel(this.itemInfo.notes).to(bg).anchor(0, 0.5).pp(0.45, 0.5));
        dataArray.push(this.buildLabel(this.itemInfo.expressNumber).to(bg).anchor(0, 0.5).pp(0.45, 0.4));
        dataArray.push(this.buildLabel(this.itemInfo.status).to(bg).anchor(0, 0.5).pp(0.45, 0.3));
        dataArray.push(this.buildLabel(ttutil.formatDate(new Date(this.itemInfo.createTime))).to(bg).anchor(0, 0.5).pp(0.45, 0.2));
        //-------------------------------------------------------------------------
        for (var i = 0; i < dataArray.length; ++i) {
            tagArray[i].pp(0.42, 0.78 - 0.08 * i);
            dataArray[i].pp(0.45, 0.78 - 0.08 * i);
        }
        //-------------------------------------------------------------------------

        var icon = new cc.Sprite("#gui-bank-detail-flag.png").to(bg).pp(0.5, 0.5).qscale(5).qopacity(80);

        //-------------------------------------------------------------------------
        //开场动画
        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut())));
        //-------------------------------------------------------------------------


        return bg;
    },
    buildLabel: function (text) {
        var label = new cc.LabelTTF(text, GFontDef.fontName, 24);
        label.setColor(cc.color(203, 186, 105));
        return label;
    }
});
