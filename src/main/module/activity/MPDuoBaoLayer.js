/**
 * Created by Apple on 2016/11/22.
 */


var MPPrize = cc.Node.extend({
    _className: "MPPrize",
    _classPath: "src/main/module/activity/MPDuoBaoLayer.js",


    infoData: null,
    sprite: null,
    worthTTF: null,
    idTTF: null,            //宝物编号
    progressTTF: null,
    barBgSprite: null,
    barSprite: null,

    meDuoBaoMoneyTTF: null,        //我的夺宝金额
    meProbTTF: null,               //我的夺宝概率

    ctor: function (data) {
        this._super();

        this.infoData = data;
        // this.anchor(0.5, 0.5);
        this.initEx();
        // this.showHelp();

    },

    initEx: function () {
        // this.size(900, 450);

        var infoData = this.infoData;

        // this.sprite = new cc.Sprite("#duobao/" + infoData.shapeID + ".png").to(this).pp().qscale(0.4, 0.4);

        this.worthTTF = new cc.LabelTTF("价值:" + ttutil.formatMoney(infoData.worth) + CURRENCY, GFontDef.fontName, 35).anchor(0, 0.5).to(this).p(420, 460);
        this.worthTTF.setColor(cc.color(255, 255, 0));

        this.idTTF = new cc.LabelTTF("编号:" + infoData.id, GFontDef.fontName, 25).to(this).anchor(0, 0.5).p(420, 560);
        this.idTTF.setColor(cc.color(150, 255, 0));

        var typeTTF = new cc.LabelTTF("型号:" + infoData.shapeID, GFontDef.fontName, 25).to(this).anchor(0, 0.5).p(420, 520);
        typeTTF.setColor(cc.color(150, 255, 0));

        this.barBgSprite = new cc.Scale9Sprite("res/bar.png", cc.rect(0, 0, 0, 0), cc.rect(10, 10, 44, 44)).anchor(0, 0.5).size(550, 30).to(this);
        this.barBgSprite.setColor(cc.color(0xe1, 0xe1, 0xe1, 0xaa));
        ttutil.adjustNodePos(this.barBgSprite);

        this.barSprite = new cc.Scale9Sprite("res/bar.png", cc.rect(0, 0, 0, 0), cc.rect(10, 10, 44, 44)).anchor(0, 0.5).size(550, 30).to(this);
        this.barSprite.setColor(cc.color(0, 107, 158, 255));


        this.barBgSprite.p(530, 250);
        this.barSprite.p(530, 250);
        this.barSprite.size(0, 30);

        this.progressTTF = new cc.LabelTTF("夺宝进度: " + infoData.nowMoney + "/" + infoData.needMoney, GFontDef.fontName, 16).to(this).p(790, 250);
        this.progressTTF.setColor(cc.color(0, 0, 0));

        this.meDuoBaoMoneyTTF = new cc.LabelTTF("我的夺宝金额:", GFontDef.fontName, 25).anchor(0, 0.5).to(this).p(420, 360);
        this.meDuoBaoMoneyTTF.setColor(cc.color(255, 255, 0));
        this.meProbTTF = new cc.LabelTTF("我的成功夺宝概率约为:", GFontDef.fontName, 25).anchor(0, 0.5).to(this).p(420, 400);
        this.meProbTTF.setColor(cc.color(255, 255, 0));

        this.updateInfo();
    },

    updateInfo: function () {
        this.progressTTF.setString("夺宝进度: " + this.infoData.nowMoney + "/" + this.infoData.needMoney);
        this.barSprite.size(this.barBgSprite.cw() * this.infoData.nowMoney / this.infoData.needMoney, 30);

        this.meDuoBaoMoneyTTF.setString("我的夺宝金额:" + ttutil.formatMoney(this.infoData.meBetMoney));
        this.meProbTTF.setString("我的成功夺宝概率约为:" + (this.infoData.meBetMoney / this.infoData.needMoney * 100).toFixed(2) + "%");
        this.idTTF.setString("编号:" + this.infoData.id);
    }

});

//夺宝对话框
var MPDuoBaoDialog = cc.Layer.extend({
    _className: "MPDuoBaoDialog",
    _classPath: "src/main/module/activity/MPDuoBaoLayer.js",


    bg: null,
    dialog: null,
    prizeInfo: null,


    ctor: function (prizeInfo) {
        this._super();
        this.prizeInfo = prizeInfo;
        this.size(mpV.w, mpV.h);
        this.initEx();
        mpGD.netHelp.addNetHandler(this);
        this.initTV();
    },

    close: function () {
        this.bg.runAction(cc.fadeOut(1));
        this.dialog.runAction(cc.moveTo(1, mpV.w / 2, mpV.h * 1.5).easing(cc.easeExponentialOut()));
        // 暂停按钮点击
        this.getScene().pauseFocus();
        this.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(() => {
            mpGD.mainScene.popDefaultSelectArray();
        }), cc.removeSelf()));
    },

    cleanup: function () {
        mpGD.netHelp.removeNetHandler(this);
        this._super();
    },

    onNetEvent: function (event, data) {
        switch (event) {

            case mpNetEvent.DuoBaoDoDuoBao:

                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    ToastSystemInstance.buildToast("提交成功");
                    this.close();
                }
                break;
        }
    },

    initEx: function () {

        /////////////////////////////////////////////////////////////////////////////////
        this.bg = new cc.LayerColor(cc.color(255, 150, 50, 0), mpV.w, mpV.h).to(this);
        this.bg.runAction(cc.fadeTo(1, 150));
        var self = this;
        this.swallowKeyboard(function () {

            self.close();
        });
        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if (event.getCurrentTarget().isVisible()) {
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {

                if (!cc.rectContainsPoint(self.dialog.getBoundingBox(), touch.getLocation())) {
                    self.close();
                }

            }
        });
        cc.eventManager.addListener(touchListener, this);
        ////////////////////////////////////////////////////////////////////////////////

        this.dialog = this.buildDialog().to(this).pp(0.5, 1.5);

        this.dialog.runAction(cc.moveTo(1, mpV.w / 2, mpV.h / 2).easing(cc.easeExponentialOut()));
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.editBox);

        this.editBox.setNextFocus(null, this.btnArray[1], this.btnArray[0], this.btnArray[2]);
        for (var i = 0; i < this.btnArray.length; i++) {
            this.btnArray[i].setNextFocus(this.editBox, this.duobaoBtn, i == 0 ? null : this.btnArray[i - 1], i == this.btnArray.length - 1 ? null : this.btnArray[i + 1]);
        }
        this.duobaoBtn.setNextFocus(this.btnArray[1], null, this.btnArray[0], this.btnArray[2]);
    },

    buildDialog: function () {

        var self = this;

        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("res/gui/file/gui-ts-box.png");
        bg.size(700, 300);

        var idTTF = new cc.LabelTTF("编号:" + this.prizeInfo.id, GFontDef.fontName, 16).to(bg).anchor(0, 0.5).pp(0.05, 0.9);
        idTTF.setColor(cc.color(150, 255, 0));

        // var worthTTF = new cc.LabelTTF("价值:" + ttutil.formatMoney(this.prizeInfo.worth) + CURRENCY, GFontDef.fontName, 32).anchor(0, 0.5).to(bg).pp(0.3, 0.9);
        // worthTTF.setColor(cc.color(255, 255, 0));

        var nowMoneyTTF = new cc.LabelTTF("进度:" + (this.prizeInfo.nowMoney / this.prizeInfo.needMoney * 100).toFixed(2) + "%", GFontDef.fontName, 16).to(bg).anchor(1, 0.5).pp(0.95, 0.9);
        nowMoneyTTF.setColor(cc.color(150, 255, 0));

        var myMoney = new cc.LabelTTF("身上" + CURRENCY + ":" + ttutil.formatMoney(mpGD.userInfo.score), GFontDef.fontName, 16).to(bg).anchor(0, 0.5).pp(0.05, 0.1);
        ////////////////////////////////////////////////////////////////////////////////

        var probAddTTF = new cc.LabelTTF("预计夺宝成功率增加:", GFontDef.fontName, 16).to(bg).anchor(0, 0.5).pp(0.65, 0.1);   //夺宝成功率增加
        // var moneyLabel = new cc.LabelTTF("夺宝金额:", GFontDef.fontName, 32).to(bg).anchor(0, 0.5).pp(0.05, 0.7);

        var editBox = this.editBox = mputil.buildEditBox("请输入金额", "夺宝金额").to(bg).pp(0.6, 0.7);
        editBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);

        var updateEditBoxValue = function () {
            var oldMoney = Number(editBox.getString());
            var money = Math.min(oldMoney, mpGD.userInfo.score, self.prizeInfo.needMoney - self.prizeInfo.nowMoney);

            if (money != oldMoney) {
                ToastSystemInstance.buildToast("您最多只能投 " + money + CURRENCY);
            }
            editBox.setString(money);

            probAddTTF.setString("预计夺宝成功率增加:" + (money / self.prizeInfo.needMoney * 100).toFixed(2) + "%");
        };

        editBox.setDelegate({
            editBoxEditingDidEnd: function (editBox) {
                updateEditBoxValue();
            }
        });

        //+10w，  +100w， 按钮
        //--------------------------------------------------------------------------------------------------------------------
        var self = this;
        var touchEventListener = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {


                //给打赏金额框加钱钱
                var str = editBox.getString();
                var num = Number(str) || 0;
                editBox.setString(sender.mpMoney + num);
                updateEditBoxValue();
            }
        };

        var createButton = function (nor, money) {
            var button = new FocusButton();
            button.loadTextureNormal(nor, ccui.Widget.PLIST_TEXTURE);
            button.addTouchEventListener(touchEventListener);
            button.mpMoney = money;
            return button;
        };


        var btnArray = this.btnArray = [];
        btnArray.push(createButton("gui-bank-translation_1.png", 100000));
        btnArray.push(createButton("gui-bank-translation_2.png", 1000000));
        btnArray.push(createButton("gui-bank-translation_3.png", 10000000));

        //默认10w
        editBox.setString(100000);
        updateEditBoxValue();

        for (var i = 0; i < btnArray.length; ++i) {
            btnArray[i].to(bg).pp(0.2 + 0.3 * i, 0.45)
        }
        //--------------------------------------------------------------------------------------------------------------------
        this.duobaoBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(bg).pp(0.5, 0.15);
        this.duobaoBtn.setTitleText("提交");
        this.duobaoBtn.setTitleFontSize(32);
        this.duobaoBtn.getTitleRenderer().pp(0.5, 0.55);
        this.duobaoBtn.setTitleColor(cc.color(255, 255, 128));
        this.duobaoBtn.addClickEventListener(function () {
            mpGD.netHelp.requestDuoBao(Number(editBox.getString()), self.prizeInfo.id, self.prizeInfo.shapeID);
            mpApp.showWaitLayer("正在请求夺宝， 请稍候..");
        });

        return bg;
    }

});

/**
 * 一金币夺宝
 */
var MPDuoBaoLayer = MPBaseModuleLayer.extend({

    titleSprite: null,

    leftArrow: null,        //左边的箭头
    rightArrow: null,       //右边的箭头

    nowShapeID: null,
    prizeMap: null,
    nowIndex: 0,
    duobaoBtn: null,
    nowPrize: null,

    _className: "MPDuoBaoLayer",
    _classPath: "src/main/module/activity/MPDuoBaoLayer.js",

    ctor: function () {

        //后面要记得释放
        cc.spriteFrameCache.addSpriteFrames("res/duobao/duobao.plist");

        this._super();

        this.swallowTouch();


        // this.initEx();

        mpGD.netHelp.addNetHandler(this);

        mpGD.netHelp.requestEnterDuoBao();
        this.getPrizeInfo();
        this.buildBackBtn();
        this.initTV();
    },
    buildBackBtn: function () {

        // this.backBtn = new FocusButton();
        // this.backBtn.loadTextureNormal("gui-gm-button-retreat-zc.png", ccui.Widget.PLIST_TEXTURE);

        var winSize = cc.director.getWinSize();

        // this.backBtn.to(this, 100).p(50, winSize.height - 50);
        var self = this;
        this.backBtn.addTouchEventListener(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
            else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.popDefaultSelectArray();
                self.removeFromParent();
            }
        });

        this.swallowKeyboard(function () {
            mpGD.mainScene.popDefaultSelectArray();
            self.removeFromParent();
        });
    },

    initEx: function () {
        this._super(cc.size(mpV.w - 20, mpV.h - 30));
        this.size(mpV.w, mpV.h);

        new cc.Sprite("#duobao/title.png").to(this.titleBG).pp(0.5,0.6);
        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.size(mpV.w - 80, mpV.h - 160).to(this).pp(0.5,0.45);

        var split = new ccui.Scale9Sprite("line.png").to(this).p(367,323);
        split.size(3,552);


        // this.backBtn.hide();
        // new cc.Sprite("res/gui/file/gui-main-bj.png").to(this).pp();
        // var bg = new cc.Sprite("#duobao/bg.png").to(this).p(641, 373);
        // this.titleSprite = new cc.Sprite("res/activity/goldTitle.png").to(this).p(632,652);
        // ttutil.adjustNodePos(bg);

        // this.leftArrow = new FocusButton("gui-gm-button-left.png", "gui-gm-button-left-choose.png", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.1, 0.5).qscale(2);
        // this.rightArrow = new FocusButton("gui-gm-button-left.png", "gui-gm-button-left-choose.png", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.9, 0.5).qscale(-2, 2);

        var self = this;
        // var shapeID = 3;
        // this.leftArrow.addClickEventListener(function () {
        //     self.nowIndex--;
        //     self.switchPrize();
        // });
        // this.rightArrow.addClickEventListener(function () {
        //     self.nowIndex++;
        //     self.switchPrize();
        // });
        this.prizeMap = {};


        this.prizeListView = new ccui.ListView().anchor(0, 0).to(this).p(65, 53);
        this.prizeListView.size(320, 542);
        this.prizeListView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.prizeListView.setBounceEnabled(true);
        this.prizeListView.setScrollBarEnabled(false);


        this.duobaoBtn = new FocusButton("btn_blue.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).p(800, 110);
        this.duobaoBtn.setTitleFontName("res/font/fzcy_s.TTF");
        this.duobaoBtn.setTitleText("参与夺宝");
        this.duobaoBtn.setTitleFontSize(32);
        this.duobaoBtn.getTitleRenderer().pp(0.5, 0.55);
        // this.duobaoBtn.setTitleColor(cc.color(255, 255, 128));
        this.duobaoBtn.addClickEventListener(function () {
            mpGD.mainScene.pushDefaultSelectArray(self.duobaoBtn);
            new MPDuoBaoDialog(self.prizeData[self.nowShapeID]).to(self, 99999999);
        });

        //////////////////////////////////////////////////////////////////////////////////
        var prizeLogBtn = this.prizeLogBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this, 3).p(1140, 550).qscale(0.85);
        prizeLogBtn.setTitleFontName("res/font/fzcy_s.TTF");
        prizeLogBtn.setTitleText("历史记录");
        prizeLogBtn.setTitleFontSize(32);
        prizeLogBtn.getTitleRenderer().pp(0.5, 0.55);
        // prizeLogBtn.setTitleColor(cc.color(255, 255, 128));
        prizeLogBtn.addClickEventListener(function () {
            mpGD.netHelp.requestDuoBaoPrizeLog(self.nowShapeID);
            mpApp.showWaitLayer("正在请求数据， 请稍候");
        });
        ////////////////////////////////////////////////////////


        var betLogBtn = this.betLogBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this, 2).p(1140, 480).qscale(0.85);
        betLogBtn.setTitleFontName("res/font/fzcy_s.TTF");
        betLogBtn.setTitleText("当前夺宝");
        betLogBtn.setTitleFontSize(32);
        betLogBtn.getTitleRenderer().pp(0.5, 0.55);
        // betLogBtn.setTitleColor(cc.color(255, 255, 128));
        betLogBtn.addClickEventListener(function () {
            mpGD.netHelp.requestDuoBaoPrizeBetStat(self.prizeData[self.nowShapeID].id, self.nowShapeID);
            mpApp.showWaitLayer("正在请求数据， 请稍候");
            self.selectBtn = betLogBtn;
        });

        var lastBetLogBtn = this.lastBetLogBtn = new FocusButton("btn_blue2.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this, 1).p(1140, 410).qscale(0.85);
        lastBetLogBtn.setTitleFontName("res/font/fzcy_s.TTF");
        lastBetLogBtn.setTitleText("上期夺宝");
        lastBetLogBtn.setTitleFontSize(32);
        lastBetLogBtn.getTitleRenderer().pp(0.5, 0.55);
        // lastBetLogBtn.setTitleColor(cc.color(255, 255, 128));
        lastBetLogBtn.addClickEventListener(function () {
            mpGD.netHelp.requestDuoBaoPrizeBetStat(-1, self.nowShapeID);
            mpApp.showWaitLayer("正在请求数据， 请稍候");
            self.selectBtn = lastBetLogBtn;
        });
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.backBtn);

        // this.backBtn.setNextFocus(null, this.leftArrow, null, this.prizeLogBtn);
        //
        // this.leftArrow.setNextFocus(this.backBtn, this.duobaoBtn, null, this.rightArrow);
        // this.duobaoBtn.setNextFocus(null, null, this.leftArrow, this.rightArrow);
        // this.rightArrow.setNextFocus(this.lastBetLogBtn, this.duobaoBtn, this.leftArrow, null);
        //
        // this.prizeLogBtn.setNextFocus(null, this.betLogBtn, this.backBtn, null);
        // this.betLogBtn.setNextFocus(this.prizeLogBtn, this.lastBetLogBtn, this.backBtn, null);
        // this.lastBetLogBtn.setNextFocus(this.betLogBtn, this.rightArrow, this.backBtn, null);
    },

    switchPrize: function (prize) {
        if (this.nowPrize) {
            this.nowPrize.prizeData.hide();
            this.nowPrize.display(this.nowPrize.normalImg);
        }

        this.nowPrize = prize;
        this.nowShapeID = prize.shapeID;
        this.nowPrize.prizeData.show();
        this.nowPrize.display(this.nowPrize.selectImg);


        // var len = Object.keys(this.prizeMap).length;
        //
        // while (this.nowIndex < 0) {
        //     this.nowIndex += len;
        // }
        //
        // this.nowIndex %= len;
        //
        // var index = 0;
        // for (var shapeID in this.prizeMap) {
        //     if (index == this.nowIndex) {
        //         this.prizeMap[shapeID] && this.prizeMap[shapeID].show();
        //         this.nowShapeID = shapeID;
        //     }
        //     else {
        //         this.prizeMap[shapeID] && this.prizeMap[shapeID].hide();
        //     }
        //     index++;
        // }

    },

    getPrizeInfo: function (prizeID) {
        mpGD.netHelp.requestDuoBaoGetPrizeInfo(prizeID);
        mpApp.showWaitLayer("正在请求宝物数据， 请稍候");
    },

    //创建夺宝的项目
    buildPrize: function (data) {
        var self = this;
        var firstPrize = false;
        // var count = 0;
        for (var shapeID in data) {
            // cc.log("====================  start kaishi !");
            var prize = this.newPrize(shapeID, data);

            if (!firstPrize) {
                firstPrize = prize;
            }

            // count++;
            // if (count > 3)
            // {
            //     break;
            // }

            // this.prizeMap[shapeID] = new MPPrize(data[shapeID]).to(this).pp().show();
        }

        this.switchPrize(firstPrize);
    },

    newPrize: function (shapeID, data) {
        var self = this;
        var widget = new ccui.Widget();
        widget.size(310, 200);

        var prize = new cc.Sprite("#gui-cz-button.png").anchor(0, 0);//.to(widget).p(0, 0);
        prize.normalImg = "#gui-cz-button.png";
        prize.selectImg = "#gui-cz-button1.png";

        var needMoney = parseInt(data[shapeID].needMoney);
        var imgIndex = 5;
        if (needMoney < 100000) {
            imgIndex = 5;
        }
        else if (needMoney < 1000000) {
            imgIndex = 6;
        }
        else if (needMoney < 10000000) {
            imgIndex = 7;
        }
        else {
            imgIndex = 8;
        }

        var moneyImg = new cc.Sprite("#gui-cz-icon-" + imgIndex + ".png").to(prize).pp(0.5, 0.6);
        var moneyLabel = new cc.LabelTTF(ttutil.formatMoney(needMoney) + " " + CURRENCY, "宋体", 30).to(prize).pp(0.5, 0.15);
        moneyLabel.setFontFillColor(cc.color(255, 252, 108));
        this.prizeMap[shapeID] = prize.prizeData = new MPPrize(data[shapeID]).to(this).hide();
        // prize.setCapInsets(cc.rect(10, 10, 86, 30));
        // prize.setContentSize(cc.size(300,180));
        widget.addChild(prize);
        prize.p(0, 10);
        prize.shapeID = shapeID;
        if (this.prizeListView) {
            this.prizeListView.pushBackCustomItem(widget);
        }


        prize.bindTouch({
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                this.startPos = touch.getLocation();

                return true;
            },
            onTouchEnded: function (touch, event) {
                var endPos = touch.getLocation();
                if (Math.abs(this.startPos.x - endPos.x) > 5 || Math.abs(this.startPos.y - endPos.y) > 5) {
                    return;
                }
                cc.log("=========== click switchPrize");
                self.switchPrize(prize);
            }
        });

        return prize;
    },

    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.DuoBaoGetPrizeInfo:
                mpApp.removeWaitLayer();

                if (!data.errMsg) {
                    if (data.prizeID == null) {
                        this.prizeData = data;
                        this.buildPrize(data);
                    }
                    else {

                    }
                }
                break;
            case mpNetEvent.DuoBaoDoDuoBao:

                if (!data.errMsg) {
                    var prize = this.prizeMap[data.shapeID];
                    if (prize.infoData.id == data.prizeID) {
                        prize.infoData.nowMoney = data.nowMoney;
                        prize.infoData.meBetMoney = data.meBetMoney;
                        prize.updateInfo();
                    }
                }
                break;
            case mpNetEvent.DuoBaoUpdateInfo:

                //更新现有的
                if (data.type == 1) {
                    var prize = this.prizeMap[data.shapeID];
                    if (prize.infoData.id == data.prizeID) {
                        prize.infoData.nowMoney = data.nowMoney;
                        prize.infoData.meBetMoney = data.meBetMoney;
                        prize.updateInfo();
                    }
                }
                //开奖
                else if (data.type == 2) {
                    ToastSystemInstance.buildToast("恭喜【" + data.winNickname + "】玩家夺得 编号" + data.prizeId + " 价值" + data.worth + "的宝物");
                }
                else if (data.type == 3) {
                    //宝物刷新

                    var prize = this.prizeMap[data.shapeID];
                    prize.infoData.id = data.id;
                    prize.infoData.nowMoney = 0;
                    prize.infoData.meBetMoney = 0;
                    prize.updateInfo();
                }
                break;
            case mpNetEvent.DuoBaoGetPrizeLog:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    this.showPrizeLogLayer(data);

                }
                break;
            case mpNetEvent.DuoBaoGetPrizeBetStat:
                mpApp.removeWaitLayer();
                if (!data.errMsg) {
                    this.showPrizeBetStatLayer(data);
                }
                break;
        }
    },

    showPrizeBetStatLayer: function (data) {
        if (!data || !data.betArray || data.betArray.length <= 0) {
            ToastSystemInstance.buildToast("没有数据");
            return;
        }

        var layer = new cc.LayerColor(cc.color(0, 0, 0, 128));

        layer.swallowTouch();
        layer.swallowKeyboard(function () {
            mpGD.mainScene.setFocusSelected(self.selectBtn);
            layer.removeFromParent();
        });
        ////////////////////////////////////////////////////////////////////////////////
        var self = this;
        //关闭按钮
        var closeBtn = new FocusButton().to(layer, 1).p(1065, 600);
        closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.setFocusSelected(self.selectBtn);
                layer.removeFromParent();
            }
        };
        mpGD.mainScene.setFocusSelected(closeBtn);
        closeBtn.addTouchEventListener(bindTouchEvent);
        ////////////////////////////////////////////////////////////////////////////////

        var size = cc.size(mpV.w * 0.7, 500);
        var bg = new ccui.Scale9Sprite().to(layer);
        bg.initWithSpriteFrameName("res/gui/file/gui-ts-box.png");
        bg.size(size.width + 50, size.height + 50).pp();


        var listView = new ccui.ListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(mpV.w * 0.6, 400);


        var hint = "";

        if (data.winNickname) {
            hint = "(成功者:【" + data.winNickname + "】)";
        }

        new cc.LabelTTF("编号:" + data.prizeID + " 的宝物 夺宝统计" + hint, GFontDef.fontName, 32).to(layer).pp(0.5, 0.8);

        var list = data.betArray;
        for (var i = 0; i < list.length; ++i) {

            var widget = new ccui.Widget().size(600, 50);

            new cc.LabelTTF("" + (i + 1), GFontDef.fontName, 26).to(widget).pp(0.05, 0.5);
            new cc.LabelTTF(list[i].nickname, GFontDef.fontName, 26).to(widget).pp(0.25, 0.5);
            new cc.LabelTTF(ttutil.formatMoney(list[i].money), GFontDef.fontName, 26).anchor(0, 0.5).to(widget).pp(0.5, 0.5);
            new cc.LabelTTF("夺宝概率:" + (list[i].money / this.prizeData[this.nowShapeID].needMoney * 100).toFixed(2) + "%", GFontDef.fontName, 26).anchor(0, 0.5).to(widget).pp(0.85, 0.5);


            listView.pushBackCustomItem(widget);

        }


        listView.setItemsMargin(10);


        listView.to(layer).pp(0.5, 0.45);

        layer.to(this, 10);
        return layer;
    },

    showPrizeLogLayer: function (data) {
        if (!data) {
            ToastSystemInstance.buildToast("没有数据");
            return;
        }

        var layer = new cc.LayerColor(cc.color(0, 0, 0, 128));

        layer.swallowTouch();
        layer.swallowKeyboard(function () {
            mpGD.mainScene.setFocusSelected(self.prizeLogBtn);
            layer.removeFromParent();
        });
        ////////////////////////////////////////////////////////////////////////////////
        //关闭按钮
        var closeBtn = new FocusButton().to(layer, 1).p(1065, 600);
        closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        var self = this;
        var bindTouchEvent = function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                mpGD.mainScene.setFocusSelected(self.prizeLogBtn);
                layer.removeFromParent();
            }
        };
        closeBtn.addTouchEventListener(bindTouchEvent);
        mpGD.mainScene.setFocusSelected(closeBtn);
        ////////////////////////////////////////////////////////////////////////////////

        var size = cc.size(mpV.w * 0.7, 500);
        var bg = new ccui.Scale9Sprite().to(layer);
        bg.initWithSpriteFrameName("res/gui/file/gui-ts-box.png");
        bg.size(size.width + 50, size.height + 50).pp();


        var listView = new ccui.ListView().anchor(0.5, 0.5);
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(mpV.w * 0.65, 400);


        new cc.LabelTTF("型号:" + data.shapeID + " 的宝物 记录", GFontDef.fontName, 32).to(layer).pp(0.5, 0.85);


        new cc.LabelTTF("编号", GFontDef.fontName, 26).to(bg).pp(0.1, 0.85);
        new cc.LabelTTF("夺宝成功玩家", GFontDef.fontName, 26).to(bg).pp(0.3, 0.85);
        new cc.LabelTTF("宝物价值", GFontDef.fontName, 26).to(bg).pp(0.6, 0.85);
        new cc.LabelTTF("参与人次", GFontDef.fontName, 26).to(bg).pp(0.8, 0.85);

        var list = data.prizeLog;


        for (var i = 0; i < list.length; ++i) {

            var widget = new ccui.Widget().size(600, 50);

            new cc.LabelTTF(list[i].id, GFontDef.fontName, 26).to(widget).pp(0.05, 0.5);
            new cc.LabelTTF(list[i].nickname || "【未开奖】", GFontDef.fontName, 26).to(widget).pp(0.35, 0.5);
            new cc.LabelTTF(ttutil.formatMoney(list[i].worth), GFontDef.fontName, 26).to(widget).pp(0.85, 0.5);
            new cc.LabelTTF(list[i].joinNum + "", GFontDef.fontName, 26).to(widget).pp(1.2, 0.5);

            listView.pushBackCustomItem(widget);

        }


        listView.setItemsMargin(10);


        listView.to(layer).pp(0.5, 0.45);

        layer.to(this, 10);
        return layer;
    },

    cleanup: function () {
        mpGD.netHelp.requestOutDuoBao();
        mpGD.netHelp.removeNetHandler(this);
        cc.spriteFrameCache.removeSpriteFramesFromFile("res/duobao/duobao.plist");
        this._super();
    },

});