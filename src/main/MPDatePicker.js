/**
 * Created by magic_cube on 2017/10/27.
 */

var MPDatePicker = ccui.Layout.extend({

    dateLabelArray: [],

    ctor: function () {
        this._super();

        this.swallowTouch();

        this.initDatePickerLayer();
    },

    initDatePickerLayer: function () {
        this.box = this.createDatePickerBox().to(this).pp(0.5, 0.48);

        this.createMonthBtnLabels();

    },

    /**
     * 创建背景框
     */
    createDatePickerBox: function () {
        var node = new cc.Node().anchor(0.5, 0.5);

        // 背景
        var bg = new cc.Scale9Sprite("goods-bg.png").to(node);
        bg.setContentSize(902, 681);
        node.size(bg.size());
        bg.pp();

        // // 标题
        // new cc.LabelTTF("日期选择器", GFontDef.fontName, 32).to(node).pp(0.5, 0.94);

        // 分割线
        var split2 = new cc.Scale9Sprite("goods-split.png").to(node).pp(0.5, 0.75);
        split2.setContentSize(800, 3);

        // 关闭按钮
        this.closeBtn = new FocusButton().to(node, 10).anchor(2, 1.2).pp(1, 1);
        this.closeBtn.loadTextureNormal("gui-gm-button-close-s.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.loadTexturePressed("gui-gm-button-close-s-dj.png", ccui.Widget.PLIST_TEXTURE);
        this.closeBtn.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type === ccui.Widget.TOUCH_ENDED) {
                this.cleanupAlldata();
            }
        });

        // 确认按钮
        this.sureBtn = new FocusButton().to(node).pp(0.5, 0.1).qscale(1.2);
        this.sureBtn.loadTextureNormal("res/gui/file/gui-cz-title-button.png", ccui.Widget.PLIST_TEXTURE);
        this.sureBtn.loadTexturePressed("res/gui/file/gui-cz-title-button-select.png", ccui.Widget.PLIST_TEXTURE);
        this.sureBtn.setTitleLabel(new cc.LabelTTF("确 定", GFontDef.fontName, 32));
        this.sureBtn.addClickEventListener(() => {
            console.log("==============  年:" + this.currYear + " 月:" + this.currMonth + " 日:" + this.currDay);
        });

        node.setScale(0);
        node.runAction(cc.scaleTo(0.5, 0.9).easing(cc.easeElasticOut()));

        return node;
    },

    /**
     * 创建月份表
     */
    createMonthBtnLabels: function () {
        // 年月标题
        this.calendarTitle = new cc.LabelTTF("1900年01月", GFontDef.fontName, 32).to(this.box).pp(0.5, 0.85);

        // 上下月份按钮
        var lastMonthBtn = new FocusButton("daily/gui-daily-last-btn.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.box).pp(0.35, 0.85);
        var nextMonthBtn = new FocusButton("daily/gui-daily-next-btn.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this.box).pp(0.65, 0.85);
        lastMonthBtn.addClickEventListener(() => {
            this.setMonthlyCalendarLabel("LastMonth");
        });
        nextMonthBtn.addClickEventListener(() => {
            this.setMonthlyCalendarLabel("NextMonth");
        });

        // 星期标签
        var weekLabelArray = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        for (var i = 0; i < weekLabelArray.length; i++) {
            new cc.LabelTTF(weekLabelArray[i], GFontDef.fontName, 24).to(this.box).p(106 + 115 * i, 530);
        }

        // 设置当前月份
        this.setMonthlyCalendarLabel("CurrentMonth");

        // 设置当前日期
        this.setSelectedDateLabel(this.dateLabelArray[this.currDay - 1]);
    },

    /**
     * 移除月历表日期标签
     */
    removeAllDateLabels: function () {
        if (this.dateLabelArray.length > 0) {
            for (var i = 0; i < this.dateLabelArray.length; i++) {
                this.dateLabelArray[i].removeFromParent();
            }
            this.dateLabelArray.length = 0;
        }
    },

    /**
     * 移除月历表当前日期标签框
     */
    removeSelectedDateLabelFrame: function () {
        if (this.selectDayLabel) {
            this.selectDayLabel.removeFromParent();
            this.selectDayLabel = null;
        }
    },

    /**
     * 设置月历表当前日期标签框
     * @param sender
     */
    setSelectedDateLabel: function (sender) {
        this.removeSelectedDateLabelFrame();

        this.currDay = this.dateLabelArray.indexOf(sender) + 1;

        this.selectDayLabel = new cc.Scale9Sprite("goods-select.png").to(sender).pp();
        this.selectDayLabel.setContentSize(115, 55);
    },

    /**
     * 设置月历表日期标签
     * @param type
     */
    setMonthlyCalendarLabel: function (type) {
        var days = [];
        if (type === "CurrentMonth") {
            days = this.getCurrentMonth();
        } else if (type === "LastMonth") {
            days = this.getLastMonth();
        } else if (type === "NextMonth") {
            days = this.getNextMonth();
        }

        var count = 0;
        if (days && days.length !== 0) {
            this.removeSelectedDateLabelFrame();
            this.removeAllDateLabels();

            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < 7; j++) {
                    var day = days[count++];
                    if (day) {
                        var btn = new FocusButton().to(this.box).p(106 + 115 * j, 472 - 60 * i);
                        btn.loadTextureNormal("daily/date-frame-bg.png", ccui.Widget.PLIST_TEXTURE);
                        btn.loadTexturePressed("daily/date-frame-bg.png", ccui.Widget.PLIST_TEXTURE);
                        btn.setTitleLabel(new cc.LabelTTF(day, GFontDef.fontName, 28));
                        btn.setColor(cc.color(200, 200, 200));
                        btn.addClickEventListener((sender) => {
                            this.setSelectedDateLabel(sender);
                        });

                        this.dateLabelArray.push(btn);
                    }
                }
            }
            this.calendarTitle.setString(this.currYear + "年" + ("00" + this.currMonth).slice(-2) + "月");
        }
    },

    /**
     * 获取每月日期信息
     * @param currYear
     * @param currMonth
     * @param currDay
     * @returns {Array}
     */
    getPerMonthDays: function () {
        var currYear = this.currYear;
        var currMonth = this.currMonth;
        var currDay = this.currDay;

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

    /**
     * 获取当前月份
     * @returns {*|Array}
     */
    getCurrentMonth: function () {
        var date = mpGD.userInfo.loginTime.split("-");
        this.currYear = parseInt(date[0]);
        this.currMonth = parseInt(date[1]);
        this.currDay = parseInt(date[2]);

        return this.getPerMonthDays();
    },

    /**
     * 获取上个月份
     * @returns {*|Array}
     */
    getLastMonth: function () {
        this.currMonth--;
        if (this.currMonth <= 0) {
            this.currYear--;
            this.currMonth = 12;
        }
        if (this.currYear < 1900) {
            ToastSystemInstance.buildToast({text: "1900年以前的年份无法查询！"});
            return;
        }

        return this.getPerMonthDays();
    },

    /**
     * 获取下个月份
     * @returns {*|Array}
     */
    getNextMonth: function () {
        this.currMonth++;
        if (this.currMonth > 12) {
            this.currYear++;
            this.currMonth = 1;
        }
        if (this.currYear > 2100) {
            ToastSystemInstance.buildToast({text: "2100年以后的年份无法查询！"});
            return;
        }

        return this.getPerMonthDays();
    },

    /**
     * 清除所有数据
     */
    cleanupAlldata: function () {
        this.removeSelectedDateLabelFrame();
        this.removeAllDateLabels();
        this.removeFromParent();
    },

});