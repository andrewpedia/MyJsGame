/**
 * Created by grape on 2017/9/19.
 */

var _inputPasswordLayer;
/**
 * 构建输入保险柜密码层
 */
var MPInputPasswordLayer = cc.LayerColor.extend({
    submitCallBack: null,
    netEventCallBack: null,
    titleString: null,
    pwdArray: null,
    labelArray: null,               //显示数字合集
    numBtnArray: null,               //数字按钮合集
    btnArray: null,                  //按钮合集
    sortBtnArray: null,               //排序按钮集合
    isStar: null,                   // 是否显示星星
    _className: "MPInputPasswordLayer",
    _classPath: "src/main/module/MPInputPasswordLayer.js",

    ctor: function (titleString, isStar, submitCallBack, netEventCallBack) {

        this._super(cc.color(0x00, 0x00, 0x00, 128));

        _inputPasswordLayer && _inputPasswordLayer.removeFromParent();

        _inputPasswordLayer = this;

        this.titleString = titleString || "请输入密码！";
        this.submitCallBack = submitCallBack;
        this.netEventCallBack = netEventCallBack;
        this.isStar = isStar;
        this.pwdArray = [];
        this.labelArray = [];
        this.btnArray = [];
        this.numBtnArray = [];
        this.sortBtnArray = [];

        this.swallowTouch();
        this.swallowKeyboard(this.close.bind(this));
        this.initEx();
        this.initTV();

        this.resetBtns(function (a, b) {
            return a - b;
        });
    },

    onExit: function () {
        this._super();
        mpGD.netHelp.removeNetHandler(this);
    },
    onEnter: function () {
        this._super();
        mpGD.netHelp.addNetHandler(this);
    },

    initEx: function () {
        var self = this;
        var bg = this.bg = new cc.Sprite("#res/room/bg.png").to(self).pp(0.5, 0.5);
        //
        var title = this.title = new cc.LabelTTF(this.titleString, GFontDef.fontName, 32).to(bg).pp(0.5, 0.925);
        title.setColor(cc.color(231, 208, 124));

        for (var i = 0; i < 6; i++) {
            new cc.Sprite("#res/room/frame.png").to(bg).p(118 + 75 * i, 378);
            // new cc.LabelTTF("__", GFontDef.fontName, 32).to(bg).p(285 + 50 * i, 445).setColor(cc.color(231, 208, 124));
            var text = new cc.LabelTTF("", GFontDef.fontName, 52).to(bg).p(118 + 75 * i, 378);

            text.setColor(cc.color(231, 208, 124));
            text.bindTouchLocate();
            this.labelArray.push(text);
        }

        //初始化数字键盘
        var buildBtn = (index) => {
            var btn = new FocusButton("res/room/" + index + ".png", "res/room/" + index + "_1.png", null, ccui.Widget.PLIST_TEXTURE).to(bg);

            btn.addClickEventListener(this.btnClickEventListener.bind(this));
            btn.addTouchEventListener((sender, type) => {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    SoundEngine.playEffect(commonRes.btnClick);
                }
            });
            this.btnArray.push(btn);

            return btn;
        };


        for (var i = 1; i <= 9; i++) {
            var btn = buildBtn("num" + i);
            btn.p(this.getPosByIndex(i - 1));
            btn.numString = cc.KEY[i];
            this.numBtnArray.push(btn);
        }
        // 数字 0
        var btnZero = buildBtn("num0");
        btnZero.p(this.getPosByIndex(10));
        btnZero.numString = cc.KEY[0];
        this.numBtnArray.push(btnZero);
        // 重置按钮
        var btnRest = buildBtn("reset");
        btnRest.p(this.getPosByIndex(9));
        btnRest.numString = "RESET";
        // 返回按钮
        var btnBack = buildBtn("del");
        btnBack.p(this.getPosByIndex(11));
        btnBack.numString = cc.KEY.back;

        var closeBtn = this.closeBtn = new FocusButton("res/room/close.png", "res/room/close.png", "", ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(bg).pp(0.97, 0.96);

        closeBtn.addClickEventListener(this.close.bind(this));
        closeBtn.addTouchEventListener((sender, type) => {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            }
        });

    },

    initTV: function () {
        if (!this.getScene().shared) return;

        this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
        this.getScene().setFocusSelected(this.closeBtn);
        // this.refreshFocus();
    },

    refreshFocus: function () {
        var getPos = (index, border) => {
            border = border || 3;
            return {x: index % border, y: Math.floor(index / border)};
        };
        //获取索引
        var getIndex = (ccp, border) => {
            border = border || 3;
            return ccp.x + ccp.y * border;
        };

        this.closeBtn.setNextFocus(null, this.sortBtnArray[2], this.sortBtnArray[2], null);
        var array = this.sortBtnArray;
        for (var i = 0; i < array.length; i++) {
            var pos = getPos(i, 3);

            array[i].setLocalZOrder(array.length - i);
            array[i].setNextFocus(
                pos.y == 0 ? this.closeBtn : array[getIndex({x: pos.x, y: pos.y - 1}, 3)],
                pos.y == getPos(array.length - 1, 3).y ? null : array[getIndex({x: pos.x, y: pos.y + 1}, 3)],
                pos.x == 0 ? null : array[i - 1],
                pos.x == (getPos(array.length - 1, 3).y > pos.y ? 3 : getPos(array.length - 1, 3).x) ? this.btn : array[i + 1]);
        }
    },

    close: function () {
        var self = this;
        this.getScene().pauseFocus();
        this.bg && this.bg.runAction(cc.sequence(cc.scaleTo(0.5, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
            this.getScene().popDefaultSelectArray();
            self.removeFromParent();
        })));
    },

    setTitle: function (string) {
        this.title.setString(string.toString());
    },

    getValue: function () {
        return Number(this.pwdArray.join(""));
    },

    showPwd: function () {
        for (var i = 0; i < this.labelArray.length; i++) {
            var item = this.labelArray[i];
            if (i < this.pwdArray.length)
                item.setString(this.isStar ? "*" : this.pwdArray[i]);
            else
                item.setString("");
        }
    },

    btnClickEventListener: function (sender) {

        this.btnKeyEventListener(sender.numString);
    },

    btnKeyEventListener: function (key) {
        switch (key) {
            case cc.KEY.back:
                this.pwdArray.pop();
                break;
            case "RESET":
                this.pwdArray = [];
                break;
            case cc.KEY["0"]:
            case cc.KEY["1"]:
            case cc.KEY["2"]:
            case cc.KEY["3"]:
            case cc.KEY["4"]:
            case cc.KEY["5"]:
            case cc.KEY["6"]:
            case cc.KEY["7"]:
            case cc.KEY["8"]:
            case cc.KEY["9"]:
                if (this.pwdArray.length < 6 && !this.getLockEnable()) {
                    this.pwdArray.push(String.fromCharCode(key));
                    if (this.pwdArray.length == 6) {
                        this.setLockEnable(true);
                        this.showPwd();
                        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.onSubmit.bind(this)), cc.callFunc(this.setLockEnable.bind(this, false))));
                    }
                }
            default:
                break;
        }

        this.showPwd();
    },

    getPosByIndex: function (index) {
        //获取坐标
        var getPos = (index, border) => {
            return {x: index % border, y: Math.floor(index / border)};
        };
        return cc.p(130 + 170 * getPos(index, 3).x, 282 - 73 * getPos(index, 3).y)
    },

    addNetEvent: function (selector, target) {

        this.netEventCallBack = target ? selector.bind(target) : selector;
    },

    addSubmitCallBack: function (selector, target) {

        this.submitCallBack = target ? selector.bind(target) : selector;
    },

    onNetEvent: function (event, data) {
        this.netEventCallBack && this.netEventCallBack(event, data);
    },

    cleanup: function () {

        _inputPasswordLayer = null;

        this._super();
    },

    // this.resetBtns(function(a, b){
    //     return 0.5 - Math.random()
    // });
    // this.resetBtns(function(a, b){
    //     return a - b;
    // });
    //重新排序按钮位置
    resetBtns: function (cb) {
        var posIndexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10];

        //多次随机
        for (var i = 0; i < 3; i++)
            posIndexArray.sort(cb);

        for (var i = 0; i < this.numBtnArray.length; i++) {
            var item = this.numBtnArray[i].p(this.getPosByIndex(posIndexArray[i]));

            this.sortBtnArray[posIndexArray[i]] = item;
        }

        this.sortBtnArray[9] = this.btnArray[10];
        this.sortBtnArray[11] = this.btnArray[11];
        this.refreshFocus();
    },

    setLockEnable: function (bool) {
        this.lock = bool;
    },

    getLockEnable: function () {
        return this.lock;
    },

    onSubmit: function () {

        this.submitCallBack && this.submitCallBack();
        this.pwdArray = [];
        this.showPwd();
    }
});


