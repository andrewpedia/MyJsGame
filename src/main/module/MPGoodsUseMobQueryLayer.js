/**
 * Created by magic_cube on 2017/8/31.
 */

/**
 * Created by magic_cube on 2017/8/28.
 */

var MPGoodsUseMobQueryLayer = cc.LayerColor.extend({

    background: null,
    provinceBar: null,
    cityBar: null,
    scrollPanel: null,
    prefectureList: null,
    provinceList: [],
    cityList: [],
    labelContainer: [],

    _className: "MPGoodsUseMobQueryLayer",
    _classPath: "src/main/module/MPGoodsUseMobQueryLayer.js",

    ctor: function (type, callback) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));

        this.callback = callback;

        this.swallowTouch();

        var that = this;
        this.swallowKeyboard(function () {
            that.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                that.removeLabelContainer();
                that.removeFromParent();
            })));
        });

        switch (type) {
            case mpGoodsID.Weather:
                this.initWeatherLayer();
                break;

            case mpGoodsID.Mobile:
                this.initMobileLayer();
                break;

            case mpGoodsID.Postcode:
                this.initPostcodeLayer();
                break;

            case mpGoodsID.Calendar:
                this.initCalendarLayer();
                break;
            // case  mpGoodsID.RoomCard:
            //     ToastSystemInstance.buildToast("该道具需要在游戏房间内使用！");
            //     break
        }
    },

    removeLabelContainer: function () {
        if (this.labelContainer && this.labelContainer.length !== 0) {
            for (var i = 0; i < this.labelContainer.length; i++) {
                this.labelContainer[i].removeFromParent();
            }
            this.labelContainer.length = 0;
        }
    },

    // ---------------------------------- 天气预报查询 --------------------------------------
    /**
     * 初始化“天气预报”查询界面
     */
    initWeatherLayer: function () {
        this.background = new cc.Sprite("#gui-ts-box.png").to(this).pp();

        // 关闭按钮
        var closeBtn = new ccui.Button("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(this.background).pp(0.95, 0.92);

        var that = this;
        closeBtn.addClickEventListener(function () {
            SoundEngine.playEffect(commonRes.btnClick);
            that.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                that.removeLabelContainer();
                that.removeFromParent();
            })));
        });

        // 确认按钮
        var sureBtn = new cc.Scale9Sprite("plaza_select_bar.png");
        sureBtn.anchor(0, 1).size(100, 50).p(450, 445).to(this.background, 5);
        sureBtn.txt = new cc.LabelTTF("确 定", "宋体", 24).to(sureBtn).pp(0.48, 0.5);
        sureBtn.txt.setColor(cc.color(200, 200, 200));

        var that = this;
        sureBtn.bindTouch({
            onTouchBegan: function () {
                var province = encodeURI(that.provinceBar.txt.getString(), "UTF-8");
                var city = encodeURI(that.cityBar.txt.getString(), "UTF-8");

                that.callback && that.callback({id: mpGoodsID.Weather, province: province, city: city});
                return;
            }
        });

        // “省”下拉框
        var that = this;
        this.provinceBar = new MPDropDownListBox({
            size: cc.size(150, 50),
            text: mpGD.ipInfo.province || "北京",
            callback1: function () {
                that.cityBar.hidePrefectureListView()
            },
            callback2: this.onClickProvinceBarCallback.bind(this),
        }).to(this.background, 100).p(100, 395);

        // “市”下拉框
        this.cityBar = new MPDropDownListBox({
            size: cc.size(150, 50),
            text: mpGD.ipInfo.city || "北京",
            callback1: function () {
                that.provinceBar.hidePrefectureListView()
            },
            callback2: this.onClickCityBarCallback.bind(this),
        }).to(this.background, 100).p(250, 395);

        // 分割线
        new cc.Sprite("res/goods/goods-split.png").to(this.background).pp(0.5, 0.8).qscale(160, 1);

        // 滚动区域
        this.scrollPanel = new ccui.ScrollView().to(this.background).pp(0.5, 0.43);
        this.scrollPanel.setAnchorPoint(0.5, 0.5);
        this.scrollPanel.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollPanel.setTouchEnabled(true);
        this.scrollPanel.setBounceEnabled(true);
        this.scrollPanel.setContentSize(800, 320);
        this.scrollPanel.setInnerContainerSize(cc.size(780, 410));

        var that = this;
        cc.loader.loadJson("res/data/weather.json", function (error, data) {
            if (error) {
                console.log(error.errorMessage);
            } else {
                // 获取“省”列表
                that.prefectureList = data;
                for (var i = 0; i < that.prefectureList.data.length; i++) {
                    that.provinceList.push(that.prefectureList.data[i].name);
                    if (mpGD.ipInfo.province == that.prefectureList.data[i].name) {
                        that.cityList = that.prefectureList.data[i].city;
                    }
                }

                that.provinceBar.updateListViewContent(that.provinceList);
                that.cityBar.updateListViewContent(that.cityList);
            }
        });
    },

    /**
     * “省”下拉列表框 - 回调
     * @param txt
     */
    onClickProvinceBarCallback: function (txt) {
        this.provinceBar.txt.setString(txt);

        for (var i = 0; i < this.prefectureList.data.length; i++) {
            if (txt === this.prefectureList.data[i].name) {
                this.cityBar.txt.setString(this.prefectureList.data[i].city[0]);
                this.cityList = this.prefectureList.data[i].city;
                break;
            }
        }

        this.cityBar.updateListViewContent(this.cityList);
    },

    /**
     * “市”下拉列表框 - 回调
     * @param txt
     */
    onClickCityBarCallback: function (txt) {
        this.cityBar.txt.setString(txt);
    },

    /**
     * 设置“天气预报”查询界面文本内容
     * @param data
     */
    setWeatherContent: function (data) {

        this.removeLabelContainer();

        if (data.retCode !== "200") {
            this.labelContainer.push(new cc.LabelTTF("没有找到该城市的相关天气状况。", "宋体", 26).to(this.background).pp(0.5, 0.4));
            return;
        }

        this.labelContainer.push(new cc.LabelTTF("更新时间：" + data.result[0].date + " " + data.result[0].time, "宋体", 20).to(this.background).p(600, 420).anchor(0, 0.5));

        this.labelContainer.push(new cc.LabelTTF("天气：" + data.result[0].weather, "宋体", 20).to(this.scrollPanel).p(10, 400).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("温度：" + data.result[0].temperature, "宋体", 20).to(this.scrollPanel).p(10, 370).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("湿度：" + data.result[0].humidity.slice(3), "宋体", 20).to(this.scrollPanel).p(10, 340).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("风向：" + data.result[0].wind, "宋体", 20).to(this.scrollPanel).p(10, 310).anchor(0, 0.5));

        this.labelContainer.push(new cc.LabelTTF("空气质量：" + data.result[0].airCondition, "宋体", 20).to(this.scrollPanel).p(310, 400).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("污染指数：" + data.result[0].pollutionIndex, "宋体", 20).to(this.scrollPanel).p(310, 370).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("日出时间：" + data.result[0].sunrise, "宋体", 20).to(this.scrollPanel).p(310, 340).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("日落时间：" + data.result[0].sunset, "宋体", 20).to(this.scrollPanel).p(310, 310).anchor(0, 0.5));

        this.labelContainer.push(new cc.LabelTTF("感冒指数：" + data.result[0].coldIndex, "宋体", 20).to(this.scrollPanel).p(610, 400).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("穿衣指数：" + data.result[0].dressingIndex, "宋体", 20).to(this.scrollPanel).p(610, 370).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("运动指数：" + data.result[0].exerciseIndex, "宋体", 20).to(this.scrollPanel).p(610, 340).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("洗衣指数：" + data.result[0].washIndex, "宋体", 20).to(this.scrollPanel).p(610, 310).anchor(0, 0.5));

        for (var i = 0; i < 5; i++) {
            this.labelContainer.push(new cc.LabelTTF(data.result[0].future[i].date, "宋体", 12).to(this.scrollPanel).p(60 + i * 155, 250).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("温    度：" + data.result[0].future[i].temperature, "宋体", 12).to(this.scrollPanel).p(10 + i * 155, 220).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("风    向：" + data.result[0].future[i].wind, "宋体", 12).to(this.scrollPanel).p(10 + i * 155, 200).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("白天天气：" + data.result[0].future[i].dayTime, "宋体", 12).to(this.scrollPanel).p(10 + i * 155, 180).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("黑夜天气：" + data.result[0].future[i].night, "宋体", 12).to(this.scrollPanel).p(10 + i * 155, 160).anchor(0, 0.5));
        }

        for (var i = 5; i < data.result[0].future.length; i++) {
            this.labelContainer.push(new cc.LabelTTF(data.result[0].future[i].date, "宋体", 12).to(this.scrollPanel).p(60 + (i - 5) * 155, 100).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("温    度：" + data.result[0].future[i].temperature, "宋体", 12).to(this.scrollPanel).p(10 + (i - 5) * 155, 70).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("风    向：" + data.result[0].future[i].wind, "宋体", 12).to(this.scrollPanel).p(10 + (i - 5) * 155, 50).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("白天天气：" + data.result[0].future[i].dayTime, "宋体", 12).to(this.scrollPanel).p(10 + (i - 5) * 155, 30).anchor(0, 0.5));
            this.labelContainer.push(new cc.LabelTTF("黑夜天气：" + data.result[0].future[i].night, "宋体", 12).to(this.scrollPanel).p(10 + (i - 5) * 155, 10).anchor(0, 0.5));
        }
    },


    // ---------------------------------- 手机号码归属地查询 --------------------------------------
    /**
     * 初始化“邮编查询”界面
     */
    initMobileLayer: function () {
        this.background = new cc.Sprite("#gui-ts-box.png").to(this).pp();

        new cc.LabelTTF("手机号码归属地查询", "宋体", 42).to(this.background).pp(0.5, 0.85);

        // 关闭按钮
        var closeBtn = new ccui.Button("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(this.background).pp(0.95, 0.92);

        var that = this;
        closeBtn.addClickEventListener(function () {
            SoundEngine.playEffect(commonRes.btnClick);
            that.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                that.removeFromParent();
                that.removeLabelContainer();
            })));
        });

        // 输入框
        this.editBox = new cc.EditBox(cc.size(600, 60), new ccui.Scale9Sprite("plaza_select_bar.png")).to(this.background).pp(0.42, 0.7);
        this.editBox.setFontSize(36);
        this.editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
        this.editBox.setMaxLength(30);
        this.editBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this.editBox.setFontColor(cc.color(200, 200, 200, 255));

        // 确认按钮
        var sureBtn = new cc.Scale9Sprite("plaza_select_bar.png");
        sureBtn.anchor(0, 0.5).size(100, 60).to(this.background).pp(0.78, 0.7);
        sureBtn.txt = new cc.LabelTTF("确 定", "宋体", 24).to(sureBtn).pp(0.48, 0.5);
        sureBtn.txt.setColor(cc.color(200, 200, 200));

        var that = this;
        sureBtn.bindTouch({
            onTouchBegan: function () {
                if (!that.editBox.isFocused()) {
                    var phone = that.editBox.getString();
                    if (phone) {
                        that.callback && that.callback({id: mpGoodsID.Mobile, phone: phone});
                    }
                }
                return;
            }
        });

        // 分割线
        new cc.Sprite("res/goods/goods-split.png").to(this.background).pp(0.5, 0.6).qscale(160, 1);
    },

    setMobileContent: function (data) {
        this.removeLabelContainer();

        if (data.retCode !== "200") {
            this.labelContainer.push(new cc.LabelTTF("没有找到该手机号码的相关信息。", "宋体", 26).to(this.background).pp(0.5, 0.4));
            return;
        }

        this.labelContainer.push(new cc.LabelTTF("      省份：" + data.result.province, "宋体", 32).to(this.background).pp(0.3, 0.5).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("      城市：" + data.result.city, "宋体", 32).to(this.background).pp(0.3, 0.42).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("  城市区号：" + data.result.cityCode, "宋体", 32).to(this.background).pp(0.3, 0.34).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("      邮编：" + data.result.zipCode, "宋体", 32).to(this.background).pp(0.3, 0.26).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("运营商信息：" + data.result.operator, "宋体", 32).to(this.background).pp(0.3, 0.18).anchor(0, 0.5));
    },


    // ---------------------------------- 邮编查询 --------------------------------------
    /**
     * 初始化“邮编查询”界面
     */
    initPostcodeLayer: function () {
        this.background = new cc.Sprite("#gui-ts-box.png").to(this).pp();

        new cc.LabelTTF("邮编查询", "宋体", 42).to(this.background).pp(0.5, 0.85);

        // 关闭按钮
        var closeBtn = new ccui.Button("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(this.background).pp(0.95, 0.92);

        var that = this;
        closeBtn.addClickEventListener(function () {
            SoundEngine.playEffect(commonRes.btnClick);
            that.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                that.removeFromParent();
                that.removeLabelContainer();
            })));
        });

        // 输入框
        this.editBox = new cc.EditBox(cc.size(600, 60), new ccui.Scale9Sprite("plaza_select_bar.png")).to(this.background).pp(0.42, 0.7);
        this.editBox.setFontSize(36);
        this.editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
        this.editBox.setMaxLength(30);
        this.editBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this.editBox.setFontColor(cc.color(200, 200, 200, 255));

        // 确认按钮
        var sureBtn = new cc.Scale9Sprite("plaza_select_bar.png");
        sureBtn.anchor(0, 0.5).size(100, 60).to(this.background).pp(0.78, 0.7);
        sureBtn.txt = new cc.LabelTTF("确 定", "宋体", 24).to(sureBtn).pp(0.48, 0.5);
        sureBtn.txt.setColor(cc.color(200, 200, 200));

        var that = this;
        sureBtn.bindTouch({
            onTouchBegan: function () {
                var postcode = that.editBox.getString();
                that.callback && that.callback({id: mpGoodsID.Postcode, postcode: postcode});
                return;
            }
        });

        // 分割线
        new cc.Sprite("res/goods/goods-split.png").to(this.background).pp(0.5, 0.6).qscale(160, 1);

        // 滚动区域
        this.scrollPanel = new ccui.ScrollView().to(this.background).pp(0.67, 0.32);
        this.scrollPanel.setAnchorPoint(0.5, 0.5);
        this.scrollPanel.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollPanel.setTouchEnabled(true);
        this.scrollPanel.setBounceEnabled(true);
        this.scrollPanel.setContentSize(420, 160);
        this.scrollPanel.setInnerContainerSize(cc.size(400, 390));
    },

    setPostcodeContent: function (data) {
        this.removeLabelContainer();

        if (data.retCode !== "200") {
            this.labelContainer.push(new cc.LabelTTF("邮编号码查询不到对应的地址。", "宋体", 26).to(this.background).pp(0.5, 0.4));
            return;
        }

        this.labelContainer.push(new cc.Sprite("res/goods/goods-split.png").to(this.background).pp(0.4, 0.35).qscale(0.8, 70));
        this.labelContainer.push(new cc.LabelTTF("详细地址列表：", "宋体", 18).to(this.background).pp(0.47, 0.52).anchor(0, 0.5));

        this.labelContainer.push(new cc.LabelTTF("省份：" + this.formatForPlaceName(data.result.province), "宋体", 26).to(this.background).pp(0.1, 0.50).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("城市：" + this.formatForPlaceName(data.result.city), "宋体", 26).to(this.background).pp(0.1, 0.35).anchor(0, 0.5));
        this.labelContainer.push(new cc.LabelTTF("区县：" + this.formatForPlaceName(data.result.district), "宋体", 26).to(this.background).pp(0.1, 0.20).anchor(0, 0.5));

        this.scrollPanel.setInnerContainerSize(cc.size(400, data.result.address.length * 30));

        for (var i = 0; i < data.result.address.length; i++) {
            this.labelContainer.push(new cc.LabelTTF(data.result.address[i], "宋体", 24).to(this.scrollPanel).anchor(0, 0.5).p(10, i * 30 + 15));
        }
    },

    formatForPlaceName: function (name) {
        return name.length > 7 ? name.slice(0, 7) + "\n      " + name.slice(7) : name;
    },


    // ---------------------------------- 万年历查询 --------------------------------------
    /**
     * 初始化“万年历查询”界面
     */
    initCalendarLayer: function () {
        this.background = new cc.Sprite("#gui-ts-box.png").to(this).pp();

        new cc.LabelTTF("万年历查询", "宋体", 42).to(this.background).pp(0.5, 0.85);

        // 关闭按钮
        var closeBtn = new ccui.Button("gui-gm-button-close-s.png", "gui-gm-button-close-s-dj.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(this.background).pp(0.95, 0.92);

        var that = this;
        closeBtn.addClickEventListener(function () {
            SoundEngine.playEffect(commonRes.btnClick);
            that.background.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(function () {
                that.removeFromParent();
                that.removeLabelContainer();
            })));
        });

        // “年”下拉框
        var that = this;
        this.yearBar = new MPDropDownListBox({
            size: cc.size(100, 50),
            text: new Date().getFullYear(),
            callback1: function () {
                that.monthBar.hidePrefectureListView();
                that.dayBar.hidePrefectureListView();
            },
            callback2: function (txt) {
                that.yearBar.txt.setString(txt);
            },
        }).to(this.background, 100).pp(0.1, 0.65);

        // “月”下拉框
        this.monthBar = new MPDropDownListBox({
            size: cc.size(100, 50),
            text: this.complementDateCharacterLength(new Date().getMonth() + 1, 2),
            callback1: function () {
                that.yearBar.hidePrefectureListView();
                that.dayBar.hidePrefectureListView();
            },
            callback2: function (txt) {
                that.monthBar.txt.setString(txt);
            },
        }).to(this.background, 100).pp(0.2, 0.65);

        // “日”下拉框
        this.dayBar = new MPDropDownListBox({
            size: cc.size(100, 50),
            text: this.complementDateCharacterLength(new Date().getDate(), 2),
            callback1: function () {
                that.monthBar.hidePrefectureListView();
                that.yearBar.hidePrefectureListView();
            },
            callback2: function (txt) {
                that.dayBar.txt.setString(txt);
            },
        }).to(this.background, 100).pp(0.3, 0.65);

        this.yearBar.updateListViewContent(this.generateArrayBetweenTwoNumbers(1900, 2099, 4));
        this.monthBar.updateListViewContent(this.generateArrayBetweenTwoNumbers(1, 12, 2));
        this.dayBar.updateListViewContent(this.generateArrayBetweenTwoNumbers(1, 31, 2));

        // 确认按钮
        var sureBtn = new cc.Scale9Sprite("plaza_select_bar.png");
        sureBtn.anchor(0, 0.5).size(100, 50).to(this.background).pp(0.45, 0.7);
        sureBtn.txt = new cc.LabelTTF("确 定", "宋体", 24).to(sureBtn).pp(0.48, 0.5);
        sureBtn.txt.setColor(cc.color(200, 200, 200));

        var that = this;
        sureBtn.bindTouch({
            onTouchBegan: function () {
                var year = that.yearBar.txt.getString();
                var month = that.monthBar.txt.getString();
                var day = that.dayBar.txt.getString();
                var date = year + "-" + month + "-" + day;

                that.callback && that.callback({id: mpGoodsID.Calendar, date: date});
                return;
            }
        });

        // 分割线
        new cc.Sprite("res/goods/goods-split.png").to(this.background).pp(0.5, 0.6).qscale(160, 1);
    },

    generateArrayBetweenTwoNumbers: function (num1, num2, length) {
        var arr = [];
        for (var i = num1; i <= num2; i++) {
            arr.push(this.complementDateCharacterLength(i, length));
        }
        return arr;
    },

    complementDateCharacterLength: function (index, length) {
        return (Array(length).join("0") + index).slice(-length);
    },

    setCalendarContent: function (data) {
        this.removeLabelContainer();

        if (data.retCode !== "200") {
            this.labelContainer.push(new cc.LabelTTF("没有找到该年份日期的相关信息。", "宋体", 26).to(this.background).pp(0.5, 0.4));
            return;
        }

        this.labelContainer.push(new cc.LabelTTF("    生肖：" + (data.result.zodiac || "无"), "宋体", 26).to(this.background).pp(0.1, 0.5).anchor(0, 1));
        this.labelContainer.push(new cc.LabelTTF("  节假日：" + (data.result.holiday || "无"), "宋体", 26).to(this.background).pp(0.1, 0.4).anchor(0, 1));
        this.labelContainer.push(new cc.LabelTTF("农历日期：" + (data.result.lunar || "无"), "宋体", 26).to(this.background).pp(0.1, 0.3).anchor(0, 1));
        this.labelContainer.push(new cc.LabelTTF("阴历年份：" + (data.result.lunarYear || "无"), "宋体", 26).to(this.background).pp(0.1, 0.2).anchor(0, 1));

        this.labelContainer.push(new cc.LabelTTF("星期：" + data.result.weekday || "无", "宋体", 26).to(this.background).pp(0.5, 0.5).anchor(0, 1));
        this.labelContainer.push(new cc.LabelTTF("  宜：" + this.formatForThing(data.result.suit) || "无", "宋体", 26).to(this.background).pp(0.5, 0.4).anchor(0, 1));
        this.labelContainer.push(new cc.LabelTTF("  忌：" + this.formatForThing(data.result.avoid) || "无", "宋体", 26).to(this.background).pp(0.5, 0.25).anchor(0, 1));
    },

    formatForThing: function (name) {
        return name.length > 14 ? name.slice(0, 14) + "\n      " + name.slice(14) : name;
    },

});