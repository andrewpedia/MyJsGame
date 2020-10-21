/**
 * Created by magic_cube on 2017/10/24.
 */


var MPDailyAttendanceLayer = cc.LayerColor.extend({

    dayLabelArray: [],

    _className: "MPDailyAttendanceLayer",
    _classPath: "src/main/module/MPDailyAttendanceLayer.js",

    ctor: function () {
        this._super(cc.color(0x00, 0x00, 0x00, 128));

        this.swallowTouch();

        this.swallowKeyboard(() => {
            mpGD.netHelp.removeNetHandler(this);
            this.removeFromParent();
        });

        this.initDailyAttendanceLayer();

        mpGD.netHelp.addNetHandler(this);
    },

    initDailyAttendanceLayer: function () {

        this.box = this.createMessageBox().to(this).pp(0.5, 0.48);

        this.createAttendancePanel();

        this.createMonthBtnLabels();
    },

    createMessageBox: function () {
        var node = new cc.Node().anchor(0.5, 0.5);

        var bg = new cc.Sprite("#goods-bg.png").to(node);
        node.size(bg.size());
        bg.pp();

        var split1 = new cc.Scale9Sprite("goods-split.png").to(bg).pp(0.75, 0.55);
        split1.setContentSize(5, 420);

        var split2 = new cc.Scale9Sprite("goods-split.png").to(bg).pp(0.39, 0.75);
        split2.setContentSize(800, 3);

        var size = bg.size();
        new cc.Sprite("#goods-title.png").to(node).anchor(0.5, 0.5).p(size.width / 2, size.height - 10);
        new cc.Sprite("#daily/gui-dialy-attendance-title.png").to(node).anchor(0.5, 0.5).p(size.width / 2, size.height);

        // 关闭按钮
        this.closeBtn = new FocusButton().to(node, 10).anchor(2, 1.2).pp(1, 1);
        this.closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type === ccui.Widget.TOUCH_ENDED) {
                mpGD.netHelp.removeNetHandler(this);
                this.removeFromParent();
            }
        });

        new cc.LabelTTF("1：每日签到即可获得“幸运转盘”抽奖机会1次，中奖概率100%。", GFontDef.fontName, 20).to(node).anchor(0, 0.5).p(70, 110).qcolor(255, 200, 80);
        new cc.LabelTTF("2：未及时签到的日期可使用“补签卡”进行补签，补签成功后也可获得抽奖机会。", GFontDef.fontName, 20).to(node).anchor(0, 0.5).p(70, 80).qcolor(255, 200, 80);


        node.setScale(0);
        node.runAction(cc.scaleTo(0.5, 0.9).easing(cc.easeElasticOut()));

        return node;
    },

    createAttendancePanel: function () {
        var node = new cc.Node().size(200, 380).to(this.box).pp(0.86, 0.55).anchor(0.5, 0.5);

        this.treasureChest = new cc.Sprite("#daily/gui-daily-treasure-chest-bright.png").to(node).pp(0.5, 0.75).qscale(0.8);

        var signinBtn = new ccui.Button().to(node).pp(0.5, 0.05).qscale(0.9);
        signinBtn.loadTextureNormal("daily/gui-daily-signin-normal.png", ccui.Widget.PLIST_TEXTURE);
        signinBtn.loadTexturePressed("daily/gui-daily-signin-pressed.png", ccui.Widget.PLIST_TEXTURE);
        signinBtn.loadTextureDisabled("daily/gui-daily-signin-disabled.png", ccui.Widget.PLIST_TEXTURE);
        signinBtn.addClickEventListener(this.onClickSignIn.bind(this));
        this.signinBtn = signinBtn;

        var retroactiveBtn = new ccui.Button().to(node).pp(0.5, 0.05).qscale(0.9);
        retroactiveBtn.loadTextureNormal("daily/gui-daily-retroactive-normal.png", ccui.Widget.PLIST_TEXTURE);
        retroactiveBtn.loadTexturePressed("daily/gui-daily-retroactive-pressed.png", ccui.Widget.PLIST_TEXTURE);
        retroactiveBtn.loadTextureDisabled("daily/gui-daily-retroactive-disabled.png", ccui.Widget.PLIST_TEXTURE);
        retroactiveBtn.addClickEventListener(this.onClickRetroactive.bind(this));
        this.retroactiveBtn = retroactiveBtn;

        this.prizeDespArray = ["兑换券 x 2", CURRENCY + " x 188", "兑换券 x 5", CURRENCY + " x 1888", CURRENCY + " x 8888", "房卡 x 10", "改名卡 x 2", "推广红包 x 3"];
        this.prizeLabel = new cc.LabelTTF("暂无抽奖结果", GFontDef.fontName, 28).to(node).pp(0.5, 0.3).qcolor(255, 200, 0);
    },

    createMonthBtnLabels: function () {
        // 清除数据
        this.dayLabelArray.length = 0;

        // 获取当月信息
        var days = this.getCurrentMonth();

        var count = 0;
        if (days.length !== 0) {
            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < 7; j++) {
                    var day = days[count++];

                    if (day) {
                        var btn = new ccui.Button().to(this.box).p(150 + 115 * j, 475 - 60 * i);
                        btn.loadTextureNormal("daily/date-frame-bg.png", ccui.Widget.PLIST_TEXTURE);
                        btn.loadTexturePressed("daily/date-frame-bg.png", ccui.Widget.PLIST_TEXTURE);
                        btn.setTitleLabel(new cc.Sprite("#daily/gui-daily-date-" + day + ".png").anchor(0.5, 0.65));
                        btn.setColor(cc.color(200, 200, 200));
                        btn.addClickEventListener((sender) => {
                            this.setSelectDayLabel(sender);
                        });

                        if (day > this.currDay) {
                            btn.setOpacity(80);
                            btn.setTouchEnabled(false);
                        }

                        this.dayLabelArray.push(btn);
                    }
                }
            }
        }

        // 标记已签到的日期
        var dates = Object.keys(mpGD.dailyMap);
        for (var i = 0; i < dates.length; i++) {
            new cc.Sprite("#daily/gui-daily-check.png").to(this.dayLabelArray[dates[i] - 1]).pp(0.8, 0.5);
        }

        // 年月份标题
        new cc.LabelTTF(this.currYear + "年" + ("00" + this.currMonth).slice(-2) + "月", GFontDef.fontName, 36).to(this.box).p(495, 575).qcolor(255, 200, 100);

        // 星期标签
        for (var i = 0; i < 7; i++) {
            new cc.Sprite("#daily/gui-daily-week-" + i + ".png").to(this.box).p(150 + 115 * i, 530);
        }

        // 今日标识
        new cc.Sprite("#daily/gui-icon-today.png").to(this.dayLabelArray[this.currDay - 1], 5).pp(0.2, 0.65);

        this.setSelectDayLabel(this.dayLabelArray[this.currDay - 1]);
    },

    getCurrentMonth: function () {
        var date = mpGD.userInfo.loginTime.split("-");
        var currYear = this.currYear = parseInt(date[0]);
        var currMonth = this.currMonth = parseInt(date[1]);
        var currDay = this.currDay = this.originDay = parseInt(date[2]);

        // 闰年月份天数
        var leapYearArray = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        // 平年月份天数
        var nonleapYearArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        var currYearArray = [];
        if ((currYear % 100 === 0 && currYear % 400 === 0) || (currYear % 100 !== 0 && currYear % 4 === 0)) {
            currYearArray = leapYearArray;
        } else {
            currYearArray = nonleapYearArray;
        }

        var newDate = new Date();
        newDate.setFullYear(currYear, currMonth - 1, 1);

        var array = [];
        var count = 1;
        for (var i = 0; i < 42; i++) {
            if (newDate.getDay() <= i && i < (currYearArray[currMonth - 1] + newDate.getDay())) {
                array.push(count++);
            } else {
                array.push(0);
            }
        }

        return array;
    },

    setSelectDayLabel: function (sender) {
        if (this.selectDayLabel) {
            this.selectDayLabel.removeFromParent();
            this.selectDayLabel = null;
        }

        this.selectDayLabel = new cc.Scale9Sprite("goods-select.png").to(sender).pp();
        this.selectDayLabel.setContentSize(115, 55);

        this.currDay = this.dayLabelArray.indexOf(sender) + 1;

        this.signinBtn.setVisible(false);
        this.signinBtn.setEnabled(false);
        this.retroactiveBtn.setVisible(false);
        this.retroactiveBtn.setEnabled(false);

        if (ttutil.arrayContains(Object.keys(mpGD.dailyMap), this.currDay) !== -1) {
            // 数据库中有记录
            if (mpGD.dailyMap[this.currDay] !== null) {
                this.treasureChest.setSpriteFrame("daily/gui-daily-treasure-chest-open.png");
                this.prizeLabel.setString(this.prizeDespArray[mpGD.dailyMap[this.currDay]]);
            } else {
                this.treasureChest.setSpriteFrame("daily/gui-daily-treasure-chest-bright.png");
                this.prizeLabel.setString("暂无抽奖结果");
            }

            this.signinBtn.setVisible(true);

        } else {
            // 数据库中无记录
            this.treasureChest.setSpriteFrame("daily/gui-daily-treasure-chest-bright.png");
            this.prizeLabel.setString("暂无抽奖结果");

            if (this.currDay < this.originDay) {
                this.retroactiveBtn.setVisible(true);
                this.retroactiveBtn.setEnabled(true);
            } else {
                this.signinBtn.setVisible(true);
                this.signinBtn.setEnabled(true);
            }
        }
    },

    onClickSignIn: function () {
        var date = this.currYear + "-" + this.currMonth + "-" + ("00" + this.currDay).slice(-2);

        mpApp.showWaitLayer("正在发送签到请求...");

        mpGD.netHelp.requestDailyAttendance(date, DailyAttendanceType.SignIn);
    },

    onClickRetroactive: function () {
        var date = this.currYear + "-" + this.currMonth + "-" + ("00" + this.currDay).slice(-2);

        mpApp.showWaitLayer("正在发送补签请求...");

        mpGD.netHelp.requestDailyAttendance(date, DailyAttendanceType.Retroactive);
    },

    onNetEvent: function (event, data) {
        var date = this.currYear + "-" + this.currMonth + "-" + ("00" + this.currDay).slice(-2);

        switch (event) {
            case mpNetEvent.DailyAttendance:

                mpApp.removeWaitLayer();

                if (data.succeed) {

                    mpGD.dailyMap[this.currDay] = null;

                    this.setSelectDayLabel(this.dayLabelArray[this.currDay - 1]);

                    new cc.Sprite("#daily/gui-daily-check.png").to(this.dayLabelArray[this.currDay - 1]).pp(0.8, 0.5);

                    new MPJqueryrotateLayer(date, (prizeType) => {
                        this.onLottoCallback(prizeType);
                    }).to(cc.director.getRunningScene());

                    ToastSystemInstance.buildToast({text: "签到成功，您有1次抽奖机会！"});
                }

                break;
            default:
                break;
        }
    },

    onLottoCallback: function (prizeType) {
        mpGD.dailyMap[this.currDay] = prizeType;
        this.prizeLabel.setString(this.prizeDespArray[prizeType]);
        this.treasureChest.setSpriteFrame("daily/gui-daily-treasure-chest-open.png");
    },

});