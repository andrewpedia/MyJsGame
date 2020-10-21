/**
 * Created by grape on 2017/11/10.
 */

var MPCoinDetailLayer = MPBaseModuleLayer.extend({
    box:null,
    pageIndex:0,
    pageSize:7,

    ctor: function () {
        this._super();

        this.swallowTouch();

        var self = this;

        this.titleSprite = new cc.Sprite("#jinbixiangqing.png").to(this.titleBG).pp(0.5,0.6).qscale(0.8);

        this.swallowKeyboard(function () {
            self.cancelCallback && self.cancelCallback();
            self.getScene().popDefaultSelectArray();
            self.removeFromParent();
        });

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(this).size(mpV.w * 0.85, mpV.h * 0.5).pp(0.5, 0.5);

        this.size(cc.director.getWinSize());

        this.box = this.buildMessageBox().to(this).pp();

        this.createItem("时间", "类型", "描述", "金币变化", "剩余金币").to(this.box).anchor(0.5, 0.5).pp(0.5, 1.05);

        var listView = new FocusListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(mpV.w * 0.85, mpV.h * 0.5);
        listView.setItemsMargin(0);
        listView.to(this.box).pp(0.5, 0.5);

        this.mxListView = listView;

        //上一页
        var upBtn = new FocusButton("shangyiye.png", "shangyiye.png", "", ccui.Widget.PLIST_TEXTURE);
        upBtn.to(this.box).pp(0.1, -0.15).qscale(0.8);
        upBtn.setTouchEnabled(true);
        upBtn.setPressedActionEnabled(true);
        upBtn.addClickEventListener(() => {
            if (this.pageIndex == 0) {
                ToastSystemInstance.buildToast("没有上一页了");
                return;
            }

            this.pageIndex--;
            mpGD.netHelp.requestBusinessCoinDetail(this.pageIndex * this.pageSize, this.pageSize);
        });

        //下一页
        var downBtn = new FocusButton("xiayiye.png", "xiayiye.png", "", ccui.Widget.PLIST_TEXTURE);
        downBtn.to(this.box).pp(0.25, -0.15).qscale(0.8);
        downBtn.setTouchEnabled(true);
        downBtn.setPressedActionEnabled(true);
        downBtn.addClickEventListener(() => {
            this.pageIndex++;
            mpGD.netHelp.requestBusinessCoinDetail(this.pageIndex * this.pageSize, this.pageSize);
        });
    },

    onEnter: function () {
        // mpGD.netHelp.addNetHandler(this);

        this._super();

        mpApp.showWaitLayer("正在请求数据，请稍候");
        mpGD.netHelp.requestBusinessCoinDetail(0, this.pageSize);
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);

        this._super();
    },

    //时间 ， 类别， 描述， 金币变化， 剩余金币
    createItem: function (time, type, desc, score, afterScore) {

        var widget = new FocusWidget();
        widget.size(mpV.w * 0.85, 50);

        var timeLabel = new cc.LabelTTF(cc.isString(time) ? time : ttutil.formatDate(new Date(time)), GFontDef.fontName, 20).to(widget).pp(0.12, 0.5);
        timeLabel.setColor(cc.color(231, 208, 124));

        var typeLabel = new cc.LabelTTF(type, GFontDef.fontName, 20).to(widget).pp(0.3, 0.5);
        typeLabel.setColor(cc.color(231, 208, 124));

        var descLabel = new cc.LabelTTF(desc, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.5, 0.5);
        descLabel.setColor(cc.color(231, 208, 124));

        var scoreLabel = new cc.LabelTTF(score, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.7, 0.5);
        scoreLabel.setColor(cc.color(231, 208, 124));

        var afterScoreLabel = new cc.LabelTTF(afterScore === 0 ? "0" : afterScore, GFontDef.fontName, 20).to(widget).anchor(0.5, 0.5).pp(0.88, 0.5);
        afterScoreLabel.setColor(cc.color(231, 208, 124));

        if (!cc.isString(score)) {
            if (score < 0) {
                scoreLabel.setColor(cc.color(255, 0, 0));
            }
            else {
                scoreLabel.setColor(cc.color(0, 255, 0));
                if (score > 0)
                    scoreLabel.setString("+" + score);
                else
                    scoreLabel.setString(score);
            }
        }

        return widget;
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case  mpNetEvent.QueryBusiness:
                mpApp.removeWaitLayer();
                if (data.errMsg) {
                    return;
                }
                this.fillData(data.data);
                break;
        }
    },

    fillData: function (data) {
        if (data.length <= 0) {
            ToastSystemInstance.buildToast("没有数据");

            if (this.pageIndex != 0)
                this.pageIndex--;

            return;
        }

        this.mxListView.removeAllItems();
        for (var i = 0; i < data.length; ++i) {

            var item = this.createItem(data[i].ts, data[i].type, data[i].desc, data[i].score, data[i].afterScore);
            this.mxListView.pushBackCustomItem(item);
        }
    },

    buildMessageBox: function () {

        var self = this;
        var node = new cc.Node().anchor(0.5, 0.5);


        // var bg = new cc.Sprite("#goods-bg.png").to(node);
        node.size(mpV.w * 0.85, mpV.h * 0.5);
        // bg.pp().qscale(0.9);

        //头位置 覆盖底下
        // var size = bg.size();
        // new cc.Sprite("#goods-title.png").to(node).qscale(0.9).p(size.width / 2, size.height - 45);
        // new cc.Sprite("#jinbixiangqing.png").to(node, 100000).p(size.width / 2, size.height - 45);

        //关闭按钮
        // var closeBtn = this.closeBtn = new FocusButton().to(node).pp(0.885, 0.9);
        // closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        // closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);


        var self = this;
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                //TV
                mpGD.mainScene.setFocusSelected(mpGD.mainScene.bottomButtons[4]);
                self.getScene().popDefaultSelectArray();
                self.removeFromParent();
            }
        };

        // closeBtn.addTouchEventListener(bindTouchEvent);

        // node.setScale(0);
        // node.runAction(cc.scaleTo(0.5, 1).easing(cc.easeElasticOut()));

        return node;
    },

});
