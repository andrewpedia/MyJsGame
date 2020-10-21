/**
 * Created by magic_cube on 2017/11/17.
 */


var HistoricRecordInstance;

var DetailLabel = cc.LabelTTF.extend({
    ctor: function (mStr, fontName, fontBig, gameDesc) {
        this._super(mStr, fontName, fontBig);
        this.gameDesc = gameDesc;
        var self = this;
        this.quickBt(function() {
            var history = GD.mainScene.history;
            if (GD.mainScene.history.detailPage) {
                GD.mainScene.history.detailPage.onDelete();
            }
            GD.mainScene.history.detailPage = new RecordDetail(self.gameDesc).to(GD.mainScene.history.bg, 999).pp(0.5, 0.5);
        })
        this.setColor(cc.color(30, 144, 255));
    },
});

var HistoricRecordLayer = cc.LayerColor.extend({
    _className: "HistoricRecordLayer",
    _classPath: "src/extend/HistoricRecordLayer.js",

    bg: null,
    closeBtn: null,
    previousBtn: null,
    nextBtn: null,
    pageIndexLabel: null,
    pageIndex: 0,
    queryCount: 10,
    queryType: 0, // 查询对象（多人游戏中使用 0:我的记录 1：全部记录）
    UIContainer: [],
    direction:null, //默认横屏

    onEnter: function () {
        this._super();
        mpGD.netHelp.addNetHandler(this);

        if (!this.enableRecord) {
            ToastSystemInstance.buildToast("此功能即将开放，敬请期待！");
            if (G_PLATFORM_TV) {
                mpGD.mainScene.popDefaultSelectArray();
            }
            this.removeFromParent();
        }
    },

    onExit: function () {
        this._super();
        mpGD.netHelp.removeNetHandler(this);
    },

    cleanup: function () {
        this._super();
        this.removeAllInfo();
        HistoricRecordInstance = null;
    },

    ctor: function (type, direction) {

        this._super(cc.color(0, 0, 0, 0x80));

        this._UIType = type;

        this.direction = direction || 0;

        this.enableRecord = GSystemConfig.gameDetailLog == 0 ? false : true;

        this.UIContainer = [];

        this.moduleID = parseInt(mpGD.userStatus.moduleID == null ? 0 : mpGD.userStatus.moduleID);

        this.roomID = parseInt(mpGD.userStatus.roomID == null ? 0 : mpGD.userStatus.roomID);

        this.tableID = parseInt(mpGD.userStatus.tableID == null ? 0 : mpGD.userStatus.tableID);

        HistoricRecordInstance && HistoricRecordInstance.removeFromParent();

        HistoricRecordInstance = this;

        this.swallowTouch();

        this.swallowKeyboard(() => {
            this.bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                if (G_PLATFORM_TV) {
                    mpGD.mainScene.popDefaultSelectArray();
                }
                this.removeFromParent();
            })));
        });
        // 可点击出来游戏记录详情目标
        this.TouchContainer = [];

        if (this.enableRecord) {
        	this.initHistoricRecordLayer();
        }
    },

    initHistoricRecordLayer: function () {
        this.bg = new cc.Scale9Sprite("res/gui/file/gui-ti-box.png").to(this).pp();
        this.bg.setCapInsets(cc.rect(34,72,900,200));
        this.bg.setContentSize(1000, 640);

        // 关闭按钮
        this.closeBtn = new FocusButton().to(this.bg).pp(0.97, 0.96);
        this.closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.addClickEventListener(() => {
            SoundEngine.playEffect(commonRes.btnClick);

            this.bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                if (G_PLATFORM_TV) {
                    mpGD.mainScene.popDefaultSelectArray();
                }
                this.removeFromParent();
            })));
        });

        //横竖区分
        if (this.direction) {
            this.bg.setContentSize(660, 640);
            this.closeBtn.pp(0.96,0.96);
        }

        this.pageIndexLabel = new cc.LabelTTF("1", "黑体", 20).to(this.bg).pp(0.5, 0.08);

        // 上一页
        this.previousBtn = new FocusButton("shangyiye.png", "shangyiye.png", "", ccui.Widget.PLIST_TEXTURE).to(this.bg).pp(0.4, 0.07);
        this.previousBtn.setPressedActionEnabled(true);
        this.previousBtn.addClickEventListener(() => {
            if (this.pageIndex === 0) {
                ToastSystemInstance.buildToast("没有上一页了");
                return;
            }

            this.pageIndex--;

            this.pageIndexLabel.setString(this.pageIndex + 1);

            mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
        });

        // 下一页
        this.nextBtn = new FocusButton("xiayiye.png", "xiayiye.png", "", ccui.Widget.PLIST_TEXTURE).to(this.bg).pp(0.6, 0.07);
        this.nextBtn.setPressedActionEnabled(true);
        this.nextBtn.addClickEventListener(() => {
            this.pageIndex++;
            mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
        });

        // 标题
        new cc.LabelTTF("历史游戏记录", "黑体", 36).to(this.bg).pp(0.5, 0.96).qcolor(255, 255, 100);

        if (this._UIType === 1) {
            // 街机
            this.createArcadeGameUI();
        } else if (this._UIType === 2) {
            // 捕鱼
            this.createFishingJoyGameUI();
        } else if (this._UIType === 3) {
            // 对战
            this.createBattleGameUI();
        } else if (this._UIType === 4) {
            // 多人
            this.createMultiplayerGameUI();
        } else if (this._UIType === 5) {
            // 休闲
            this.createCasualGameUI();
        }

        if (G_PLATFORM_TV) {
            GD.mainScene.setFocusSelected(this.closeBtn);

            this.closeBtn.setNextFocus(null, this.previousBtn, null, null);
            this.previousBtn.setNextFocus(this.closeBtn, null, null, this.nextBtn);
            this.nextBtn.setNextFocus(this.closeBtn, null, this.previousBtn, null);
        }


    },

    createArcadeGameUI: function () {
        // 街机
        var time = new cc.LabelTTF("游戏时间", "黑体", 28).to(this.bg).p(180, 560).qcolor(255, 255, 150);
        var resultLabel = new cc.LabelTTF("游戏描述", "黑体", 28).to(this.bg).p(445, 560).qcolor(255, 255, 150);
        var score = new cc.LabelTTF("金币变化", "黑体", 28).to(this.bg).p(650, 560).qcolor(255, 255, 150);
        var finalScore = new cc.LabelTTF("结算后", "黑体", 28).to(this.bg).p(850, 560).qcolor(255, 255, 150);
        if (this.direction)
        {
            // resultLabel.hide()
            time.p(100,560);
            resultLabel.p(265, 560);
            score.p(430,560);
            finalScore.p(570,560);
        }
        if (this.moduleID == 212) {
            resultLabel.setString("押注");
        } else if (this.moduleID == 15) {
            resultLabel.setString("奖金")
        }

        // 街机
        mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
    },
    formatDate: function (num) {
        return num > 9 ? num : ("0" + num);
    },
    getFormatTime: function (ts) {
        var date = new Date(ts);
        var month = this.formatDate(date.getMonth());
        var day = this.formatDate(date.getDay());
        var hour = this.formatDate(date.getHours());
        var minutes = this.formatDate(date.getMinutes());
        var seconds = this.formatDate(date.getSeconds());
        var time = date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
        if (this.direction) {
            time = month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
        }
        return time;
    },
    updateArcadeGameInfo: function (data) {
        var self = this;
        // 更新街机游戏信息
        this.removeAllInfo();
        for (var i = 0; i < data.length; i++) {
            if (data[i]) {
                var time = this.getFormatTime(data[i].ts);
                var mdate = new cc.LabelTTF(time, "黑体", 20).to(this.bg).p(this.direction ? 100 :180, 505 - i * 45).qcolor(255, 255, 180);
                var score = new cc.LabelTTF(ttutil.formatMoney(data[i].score.toString()), "黑体", 20).to(this.bg).p(this.direction ? 430 :650, 505 - i * 45).qcolor(255, 255, 180);
                var afterScore = new cc.LabelTTF(ttutil.formatMoney(data[i].afterScore.toString()), "黑体", 20).to(this.bg).p(this.direction ? 570 :850, 505 - i * 45).qcolor(255, 255, 180);

                if (data[i].score < 0) {
                    score.qcolor(255, 0, 0);
                } else if (data[i].score > 0) {
                    score.qcolor(0, 255, 0);
                }

                this.UIContainer.push(mdate);
                this.UIContainer.push(score);
                this.UIContainer.push(afterScore);
                var mJson = null;
                try {
                    mJson = eval('(' + data[i].gameDesc + ')');
                } catch (err) {
                    mJson = {"doWhat": "无描述", "winLine": []}
                }
                if (this.moduleID === 23) {
                    // 九线拉王
                    if (mJson.winLine.length != 0) {
                        var newTab = [];
                        for (var j = 0; j < mJson.winLine.length; j++) {
                            newTab.push(mJson.winLine[j][0]+1)
                        }
                        var mStr = JSON.stringify(newTab);
                        var label = new DetailLabel(mStr, GFontDef.fontName, 20, mJson).to(this.bg).p(445, 505 - i * 45).qcolor(255, 255, 180);
                    } else {
                        var label = new DetailLabel("无中奖线", GFontDef.fontName, 20, mJson).to(this.bg).p(445, 505 - i * 45).qcolor(255, 255, 180)
                    }
                    this.UIContainer.push(label);
                    this.TouchContainer.push(label);
                } else if (this.moduleID == 14) {
                    // 水果转转
                    if (mJson.doWhat == "zhuan") {
                        var label = new DetailLabel("转转", GFontDef.fontName, 20, mJson).to(this.bg).p(265 -10, 505 - i*45 );
                        var result = mJson.msg.zhuanZhuanResult[0];
                        var c = FruitSlotConfig[result];
                        new FruitSlot(c.type, c.big, c.mul).to(label).p(60, 12).qscale(0.3); 
                    } else {
                        var label = new cc.LabelTTF(mJson.doWhat, GFontDef.fontName, 20).to(this.bg).p(265, 505 - i * 45).qcolor(255, 255, 150);
                    }
                    this.UIContainer.push(label);
                } else if (this.moduleID == 26) {
                    // 水浒传
                    mStr = mJson.doWhat;
                    if (!mStr) {
                        mStr = "无描述";
                    }
                    this.UIContainer.push(new cc.LabelTTF(mStr, GFontDef.fontName, 20).to(this.bg).p(445, 505 - i * 45).qcolor(255, 255, 180));
                } else if (this.moduleID == 212) {
                    // 连环夺宝？
                    var mStr = mJson.data.bet;
                    if (mJson.doWhat)
                        mStr = mJson.doWhat;
                    this.UIContainer.push(new cc.LabelTTF(mStr, GFontDef.fontName, 20).to(this.bg).p(445, 505 - i * 45).qcolor(255, 255, 180));
                } else if (this.moduleID == 15) {
                    var mStr = mJson.prize;
                    if (!mStr)
                        mStr = "0";
                    if (mJson.freeTimes >= 0) {
                        mStr = "免费转 "+mStr;
                    } else if (mJson.doWhat) {
                        mStr = mJson.doWhat;
                    }
                    this.UIContainer.push(new cc.LabelTTF(mStr, GFontDef.fontName, 20).to(this.bg).p(445, 505 - i * 45).qcolor(255, 255, 180));
                }
            }
        }
    },

    createFishingJoyGameUI: function () {
        // 捕鱼
        mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
    },

    updateFishingJoyGameInfo: function (data) {
        // 更新捕鱼游戏信息
    },

    createBattleGameUI: function () {
        // 对战
        var time = new cc.LabelTTF("游戏时间", "黑体", 28).to(this.bg).p(180, 560).qcolor(255, 255, 150);
        var score = new cc.LabelTTF("金币变化", "黑体", 28).to(this.bg).p(480, 560).qcolor(255, 255, 150);
        var finalScore = new cc.LabelTTF("结算后", "黑体", 28).to(this.bg).p(850, 560).qcolor(255, 255, 150);
        if (this.direction)
        {
            time.p(130,560);
            score.p(350,560);
            finalScore.p(550,560);
        }

        mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
    },

    updateBattleGameInfo: function (data) {
        console.log("updateBattleGameInfo", data);
        // 更新对战游戏信息
        this.removeAllInfo();

        function formatDate(num) {
            return num > 9 ? num : ("0" + num);
        }

        for (var i = 0; i < data.length; i++) {
            if (data[i]) {
                var date = new Date(data[i].ts);
                var month = formatDate(date.getMonth());
                var day = formatDate(date.getDay());
                var hour = formatDate(date.getHours());
                var minutes = formatDate(date.getMinutes());
                var seconds = formatDate(date.getSeconds());
                var time = date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
                this.UIContainer.push(new cc.LabelTTF(time, "黑体", 20).to(this.bg).p(this.direction ? 130 :180 , 505 - i * 45).qcolor(255, 255, 180));
                this.UIContainer.push(new cc.LabelTTF(ttutil.formatMoney(data[i].score.toString()), "黑体", 20).to(this.bg).p(this.direction ? 350 :480, 505 - i * 45).qcolor(255, 255, 180));
                this.UIContainer.push(new cc.LabelTTF(ttutil.formatMoney(data[i].afterScore.toString()), "黑体", 20).to(this.bg).p(this.direction ? 550 :850, 505 - i * 45).qcolor(255, 255, 180));

            }
        }

    },

    createMultiplayerGameUI: function () {
        // 多人
        var timeLabel = new cc.LabelTTF("开奖时间", "黑体", 28).to(this.bg).p(180, 560).qcolor(255, 255, 150);
        var resultLabel = new cc.LabelTTF("开奖结果", "黑体", 28).to(this.bg).p(445, 560).qcolor(255, 255, 150);
        var changeLabel = new cc.LabelTTF("金币变化", "黑体", 28).to(this.bg).p(650, 560).qcolor(255, 255, 150);
        var finalLabel = new cc.LabelTTF("结算之后", "黑体", 28).to(this.bg).p(850, 560).qcolor(255, 255, 150);

        new cc.LabelTTF("我的记录", "黑体", 18).to(this.bg).p(95, 50).qcolor(255, 255, 150);
        new cc.LabelTTF("全部记录", "黑体", 18).to(this.bg).p(215, 50).qcolor(255, 255, 150);

        var selfRecords = new FocusCheckBox("res/gui/login/radioEmpty.png", "res/gui/login/radio.png").to(this.bg).p(40, 50).size(30, 30);
        selfRecords.ignoreContentAdaptWithSize(false);
        selfRecords.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                sender.setSelected(false);
                allRecords.setSelected(false);

                this.removeAllInfo();

                this.queryType = 0;
                this.pageIndex = 0;

                changeLabel.setString("金币变化");
                finalLabel.setString("结算之后");

                this.pageIndexLabel.setString(this.pageIndex + 1);

                mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
            }
        });

        var allRecords = new FocusCheckBox("res/gui/login/radioEmpty.png", "res/gui/login/radio.png").to(this.bg).p(160, 50).size(30, 30);
        allRecords.ignoreContentAdaptWithSize(false);
        allRecords.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                sender.setSelected(false);
                selfRecords.setSelected(false);

                this.removeAllInfo();

                this.queryType = 1;
                this.pageIndex = 0;

                changeLabel.setString("庄家输赢");
                finalLabel.setString("庄家昵称");

                this.pageIndexLabel.setString(this.pageIndex + 1);

                mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
            }
        });

        selfRecords.setSelected(true);

        mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
    },

    updateMultiplayerGameInfo: function (data) {
        // 更新多人游戏信息
        this.removeAllInfo();

        for (var i = 0; i < data.length; i++) {
            if (data[i]) {
                var date = new cc.LabelTTF(data[i].nDate, "黑体", 20).to(this.bg).p(180, 505 - i * 45).qcolor(255, 255, 180);

                var changeScore = null;
                var changeDesc = null;
                var desc = JSON.parse(data[i].gameDesc);

                if (this.queryType === 1) {
                    changeScore = new cc.LabelTTF(ttutil.formatMoney(desc.changeScore.toString()), "黑体", 20).to(this.bg).p(650, 505 - i * 45).qcolor(255, 255, 180);
                    changeDesc = new cc.LabelTTF(desc.bankerName, "黑体", 20).to(this.bg).p(850, 505 - i * 45).qcolor(255, 255, 180);
                } else {
                    changeScore = new cc.LabelTTF(ttutil.formatMoney(data[i].score.toString()), "黑体", 20).to(this.bg).p(650, 505 - i * 45).qcolor(255, 255, 180);
                    changeDesc = new cc.LabelTTF(ttutil.formatMoney(data[i].afterScore.toString()), "黑体", 20).to(this.bg).p(850, 505 - i * 45).qcolor(255, 255, 180);
                }

                if (changeScore.getString().indexOf("-") >= 0) {
                    changeScore.qcolor(255, 0, 0);
                } else {
                    changeScore.qcolor(0, 255, 0);
                }

                this.UIContainer.push(date);
                this.UIContainer.push(changeScore);
                this.UIContainer.push(changeDesc);

                if (this.moduleID === 22) {
                    // 奔驰宝马
                    var carInfo = [
                        {type: 1, mul: 3}, {type: 1, mul: 0}, {type: 2, mul: 2}, {type: 2, mul: 0},
                        {type: 3, mul: 1}, {type: 3, mul: 0}, {type: 0, mul: 4}, {type: 0, mul: 0},
                    ];

                    var carType = carInfo[desc.result % 8].type;
                    var carMul = carInfo[desc.result % 8].mul;

                    this.UIContainer.push(new cc.Sprite("#res/main/car-" + carType + ".png").to(this.bg).p(410, 505 - i * 45).qscale(0.3));
                    this.UIContainer.push(new cc.Sprite("#res/main/car-beishu-" + carMul + ".png").to(this.bg).p(490, 505 - i * 45).qscale(0.4).anchor(1, 0.5));
                } else if (this.moduleID === 25) {
                    // 百人牛牛
                    this.UIContainer.push(new cc.Sprite("#ng/area-0.png").to(this.bg).p(385, 505 - i * 45).qscale(0.5));
                    this.UIContainer.push(new cc.Sprite("#ng/area-1.png").to(this.bg).p(425, 505 - i * 45).qscale(0.5));
                    this.UIContainer.push(new cc.Sprite("#ng/area-2.png").to(this.bg).p(465, 505 - i * 45).qscale(0.5));
                    this.UIContainer.push(new cc.Sprite("#ng/area-3.png").to(this.bg).p(505, 505 - i * 45).qscale(0.5));

                    for (var j = 0; j < desc.result.length; j++) {
                        if (desc.result[j]) {
                            this.UIContainer.push(new cc.Sprite("#ng/trend-win.png").to(this.bg).p(385 + j * 40, 505 - i * 45).qscale(0.5));
                        } else {
                            this.UIContainer.push(new cc.Sprite("#ng/trend-lose.png").to(this.bg).p(385 + j * 40, 505 - i * 45).qscale(0.5));
                        }
                    }
                } else if (this.moduleID === 204) {
                    // 跑马
                    var horseInfo = ["①奔雷", "②沙驰王子", "③威势之宝", "④疾风", "⑤碧科", "⑥赤龙驹"];

                    this.UIContainer.push(new cc.LabelTTF(horseInfo[desc.result[0]], GFontDef.fontName, 20).to(this.bg).p(345, 505 - i * 45).qcolor(255, 255, 180).anchor(0, 0.5));
                    this.UIContainer.push(new cc.LabelTTF(horseInfo[desc.result[1]], GFontDef.fontName, 20).to(this.bg).p(455, 505 - i * 45).qcolor(255, 255, 180).anchor(0, 0.5));
                } else if (this.moduleID === 24) {
                    // 飞禽走兽

                    var animalType = desc.result <= 8 ? desc.result : desc.result-2;
                    var animalName = ["燕子x6", "孔雀x8", "鸽子x8", "老鹰x12", "兔子x6", "熊猫x8", "猴子x8", "狮子x12", "鲨鱼x24", "百倍鲨鱼", "通吃", "通赔"];

                    this.UIContainer.push(new cc.Sprite("#res/main/gui-fly-icon-" + animalType + ".png").to(this.bg).p(410, 505 - i * 45).qscale(0.5));
                    this.UIContainer.push(new cc.LabelTTF(animalName[animalType], GFontDef.fontName, 20).to(this.bg).p(440, 505 - i * 45).qcolor(255, 255, 180).anchor(0, 0.5));
                } else if (this.moduleID === 3) {
                    // 欢乐30秒
                    this.UIContainer.push(new cc.LabelTTF("闲:", GFontDef.fontName, 20).to(this.bg).p(375, 505 - i * 45).qcolor(255, 255, 180));
                    this.UIContainer.push(new cc.LabelTTF("庄:", GFontDef.fontName, 20).to(this.bg).p(475, 505 - i * 45).qcolor(255, 255, 180));

                    var cardData = [
                        0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,	//方块 A - K
                        0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,	//梅花 A - K
                        0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x2C,0x2D,	//红桃 A - K
                        0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x3B,0x3C,0x3D	//黑桃 A - K
                    ];

                    for (var j = 0; j < desc.result.length; j++) {
                        for (var k = 0; k < desc.result.length; k++) {
                            var index = cardData.indexOf(desc.result[j][k]);
                            if (index >= 0) {
                                var prevIndex = parseInt(index / 13);
                                var nextIndex = parseInt(index % 13) + 1;
                                this.UIContainer.push(new cc.Sprite("#res/huanle30miao/gui-card-" + prevIndex + "-" + nextIndex + ".png").to(this.bg).p(410 + 10 * k + 100 * j, 505 - i * 45).qscale(0.3));
                            }
                        }
                    }
                } else if (this.moduleID === 203) {
                    // 摇一摇
                    var sum = 0;
                    var dotArray = desc.result;
                    for (var j = 0; j < dotArray.length; j++) {
                        sum = sum + dotArray[j];
                        this.UIContainer.push(new cc.Sprite("#gui-sb-button-dice-win-" + dotArray[j] + ".png").to(this.bg).p(355 + j * 35, 505 - i * 45).qscale(0.5));
                    }

                    this.UIContainer.push(new cc.LabelTTF(sum + "点", "黑体", 24).to(this.bg).p(480, 508 - i * 45));

                    if (dotArray[0] === dotArray[1] && dotArray[1] === dotArray[2]) {
                        this.UIContainer.push(new cc.Sprite("#gui-sb-baozi.png").to(this.bg).p(535, 508 - i * 45).qscale(0.5));
                    } else {
                        if (sum <= 10 && sum >= 4) {
                            this.UIContainer.push(new cc.Sprite("#gui-sb-icon-xiao.png").to(this.bg).p(535, 508 - i * 45).qscale(0.5));
                        } else if (sum <= 17 && sum >= 11) {
                            this.UIContainer.push(new cc.Sprite("#gui-sb-icon-da.png").to(this.bg).p(535, 508 - i * 45).qscale(0.5));
                        }
                    }
                }

            }
        }
    },

    createCasualGameUI: function () {
        // 休闲
        mpGD.netHelp.requestHistoricRecord(this.moduleID, this.roomID, this.tableID, this.pageIndex * this.queryCount, this.queryCount, this.queryType);
    },

    updateCasualGameInfo: function (data) {
        // 更新休闲游戏信息
    },

    removeAllInfo: function () {
        if (this.UIContainer.length > 0) {
            for (var i = 0; i <= this.UIContainer.length; i++) {
                if (this.UIContainer[i]) {
                    this.UIContainer[i].removeFromParent();
                }
            }

            this.UIContainer.length = 0;
        }
        this.TouchContainer.length = 0;
        this.TouchContainer = [];
    },

    onNetEvent: function (event, data) {

        if (data.data &&　data.data.length === 0) {
            ToastSystemInstance.buildToast({text: "没有更多数据了"});

            if (this.pageIndex > 0) {
                this.pageIndex--;
                this.pageIndexLabel.setString(this.pageIndex + 1);
            }
            return;
        }

        this.pageIndexLabel.setString(this.pageIndex + 1);

        switch (event) {
            case mpNetEvent.HistoricRecord:

                if (this._UIType === 1) {
                    // 街机
                    this.updateArcadeGameInfo(data.data);
                    
                } else if (this._UIType === 2) {
                    // 捕鱼
                    this.updateFishingJoyGameInfo(data);
                } else if (this._UIType === 3) {
                    // 对战
                    this.updateBattleGameInfo(data.data);
                } else if (this._UIType === 4) {
                    // 多人
                    this.updateMultiplayerGameInfo(data.data);
                } else if (this._UIType === 5) {
                    // 休闲
                    this.updateCasualGameInfo(data);
                }

                break;

            default:
                break;
        }
    },

});

var HistoricRecordButtonLayer = cc.Layer.extend({
    showBtn:null,
    moduleID:null,
    buttonPos:null,
    direction:null,


    ctor:function (moduleID, buttonPos, direction) {
        this._super();
        this.moduleID = moduleID;
        this.buttonPos = buttonPos;
        this.direction = direction || 0;
        this.initEx();
    },

    initEx:function () {

        this.showBtn = new FocusButton().to(this).p(this.buttonPos.x,this.buttonPos.y);
        if (this.buttonPos.x > 0 && this.buttonPos.x < 1 && this.buttonPos.y > 0 && this.buttonPos.y < 1)
        {
            this.showBtn.pp(this.buttonPos.x, this.buttonPos.y);
        }
        // this.bgShadow = new cc.LayerColor(cc.color(0,0,0,200)).to(this).hide();
        this.showBtn.loadTextureNormal("allcommon/gui-btn-record.png",ccui.Widget.PLIST_TEXTURE);
        this.showBtn.loadTexturePressed("allcommon/gui-btn-record-choose.png",ccui.Widget.PLIST_TEXTURE);
        this.showBtn.addClickEventListener(()=>{
            SoundEngine.playEffect(commonRes.btnClick);
            new HistoricRecordLayer(this.moduleID, this.direction).to(this);
        });
        this.showBtn.hide();
    },
});