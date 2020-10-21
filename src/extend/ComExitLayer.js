/**
 * Created by orange on 2016/7/29.
 *
 */
var ComExitTheme = {
    Blue:"blue",
    Red: "red",
    Rellow: "yellow",
}

//加载一次配置
var _comExitThemeData;

function loadThemeData() {
    cc.loader.loadJson("res/data/comexit.json", function (error, data) {
        if (error) {
            console.log(error.errorMessage);
        } else {
            _comExitThemeData = data;
        }
    });
}
loadThemeData();

var ComExitLayer = cc.Layer.extend({
    _className: "ComExitLayer",
    _classPath: "src/extend/ComExitLayer.js",

    showPanelBtn: null,
    hidePanelBtn: null,

    clipper: null,
    panel: null,

    hallBtn: null,
    effectBtn: null,
    musicBtn: null,
    effectOffBtn: null,
    musicOffBtn: null,

    musicVolumn: 0,
    effectVolume: 0,

    callback: null,
    gameList: null,

    areas: null,

    ctor: function () {
        this._super();

        this.theme = this.getTheme();
        this.areas = [];
        this.size(V.w, V.h);
        this.initEx();
    },

    onExit: function () {
        this._super();

        this.unEnAbleSwallowKeyboard();
    },

    getTheme: function () {
        var subGameName = mpGD.subGameInfoMap[mpGD.userStatus.moduleID].iconName;
        var theme = null;
        var isHaveTheme = false;
        if(_comExitThemeData.hasOwnProperty(subGameName)){
            theme = _comExitThemeData[subGameName].theme;
        }

        for(var k in ComExitTheme){
            if(ComExitTheme[k] == theme){
                isHaveTheme = true
            }
        }

        !isHaveTheme && cc.log(subGameName + "主题设置错误或者主题不存在！");
        return isHaveTheme ? theme : ComExitTheme.Blue;
    },

    getImage:function (path) {
        //return "comexit/" + this.theme + "/" + path;

        return "comexit/blue/" + path;
    },

    getFillStyle: function () {
        var themeColors = {
            blue: cc.color(66, 209, 244, 255),
            red:  cc.color(255, 255, 255, 255),
            yellow: cc.color(255, 102, 0, 255),
        };

        return themeColors[this.theme];
    },

    initEx: function () {
        this.showPanelBtn = new FocusButton(this.getImage("btn_showpanel.png"), "", "", ccui.Widget.PLIST_TEXTURE).to(this).anchor(0, 1).pp(0, 1);
        this.hidePanelBtn = new FocusButton(this.getImage("btn_hidepanel.png"), "", "", ccui.Widget.PLIST_TEXTURE).to(this).anchor(0, 1).pp(0, 1).hide();


        this.areas.push(this.showPanelBtn);
        this.areas.push(this.hidePanelBtn);

        this.showPanelBtn.addClickEventListener(this.onClickBtn.bind(this));
        this.hidePanelBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.panel = new cc.Sprite("#" + this.getImage("bg_menu.png")).anchor(0, 1).hide();

        this.backBtn = new FocusButton(this.getImage("menu_back.png"), "", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.45, 0.22);
        this.backBtn.setPressedActionEnabled(true);
        this.backBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.settingBtn = new FocusButton(this.getImage("menu_setting.png"), "", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.45, 0.43);
        this.settingBtn.setPressedActionEnabled(true);
        this.settingBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.ruleBtn = new FocusButton(this.getImage("menu_rule.png"), "", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.45, 0.64);
        this.ruleBtn.setPressedActionEnabled(true);
        this.ruleBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.bankBtn = new FocusButton(this.getImage("menu_bank.png"), "", "", ccui.Widget.PLIST_TEXTURE).to(this.panel).pp(0.45, 0.85);
        this.bankBtn.setPressedActionEnabled(true);
        this.bankBtn.addClickEventListener(this.onClickBtn.bind(this));

        this.initClipper();

        this.settingLayer = this.buildSettingLayer();
        this.settingLayer.hide();
        this.effectVolume = SoundEngine.getEffectsVolume();
        this.musicVolumn = SoundEngine.getMusicVolume();

        var self = this;
        this.bindTouch({
            swallowTouches: true,
            onTouchBegan: function (touches) {
                var rect = cc.rect(self.settingLayer.x - self.settingLayer.cw()/2, self.settingLayer.y - self.settingLayer.ch()/2, self.settingLayer.cw(), self.settingLayer.ch());

                if(self.settingLayer.isVisible() &&  cc.rectContainsPoint(rect, touches.getLocation())){
                    return false;
                }
                return self.panel.isVisible() ? true : false;
            },

            onTouchEnded: function (touches) {
                if(self.settingLayer.isVisible()){
                    self.settingLayer.hide();
                    self.unEnAbleSwallowKeyboard();
                }else {
                    self.onClickBtn(self.hidePanelBtn);
                }
            }
        });

    },

    enAbleSwallowKeyboard: function () {
        var self = this;
        this.unEnAbleSwallowKeyboard();
        this.swallowKeyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                switch (code) {
                    case cc.KEY.back:
                    case cc.KEY.escape:
                        if(self.settingLayer.isVisible()){
                            self.settingLayer.hide();
                        }else {
                            self.onClickBtn(self.hidePanelBtn);
                        }
                }
                event.stopPropagation();
            },
            onKeyReleased: function (code, event) {
                event.stopPropagation();
            }
        });
        cc.eventManager.addListener(this.swallowKeyboardListener, this);
    },

    unEnAbleSwallowKeyboard: function () {
        this.swallowKeyboardListener && cc.eventManager.removeListener(this.swallowKeyboardListener);
        this.swallowKeyboardListener = null;
    },

    buildSettingLayer: function () {
        var node = new cc.Node().to(this).p(V.w/2, V.h/2);
        var bg = new ccui.Scale9Sprite().to(node);

        bg.initWithSpriteFrameName(this.getImage("bg_setting.png"));
        bg.setCapInsets(cc.rect(63, 91, 689 - 63 * 2, 528 - 91 - 77) );
        bg.size(cc.size(689, 328));
        node.size(bg.size());
        bg.pp();
        node.anchor(0.5, 0.5);

        // new cc.Sprite("#allcommon/comexit/spritesheet/Hlssm_Rule_tb1.png").to(node).p(node.cw() * 0.4, node.ch() - 50);
        //
        // new cc.Sprite("#allcommon/comexit/spritesheet/Hlssm_Rule_tb2.png").to(node).p(node.cw() * 0.60, node.ch() - 50);

        var tittle = new cc.Sprite("#" + this.getImage("label_setting.png")).to(node).p(node.cw() * 0.50, node.ch() - 50);
        //关闭按钮
        this.closeBtn = new FocusButton(this.getImage("btn_close.png"), "", "", ccui.Widget.PLIST_TEXTURE).to(node).p(node.cw() - 50, node.ch() - 50);

        this.closeBtn.addClickEventListener(this.onClickBtn.bind(this));

        //音乐设置
        this.musicBtn = this.buildMusicControl("音乐", mpGD.isBgMusicOn, function () {
            mpGD.isBgMusicOn = true;
            SoundEngine.setBackgroundMusicVolume(1);
            cc.sys.localStorage.setItem("isBgMusicOn", "true");
        }, function () {
            mpGD.isBgMusicOn = false;
            SoundEngine.setBackgroundMusicVolume(0);
            cc.sys.localStorage.setItem("isBgMusicOn", "false");
        }).to(node).pp(0.3, 0.5);

        //音效设置
        this.effetcBtn = this.buildMusicControl("音效", mpGD.isSoundOn, function () {
            mpGD.isSoundOn = true;
            SoundEngine.setEffectsVolume(1);
            cc.sys.localStorage.setItem("isSoundOn", "true");
        }, function () {
            mpGD.isSoundOn = false;
            SoundEngine.setEffectsVolume(0);
            cc.sys.localStorage.setItem("isSoundOn", "false");
        }).to(node).pp(0.7, 0.5);

        return node;
    },

    //音乐控制
    buildMusicControl: function (tittle, on, openCallback, closeCallback) {

        var node = new cc.Node().size(200, 100).anchor(0.5, 0.5);
        var label = new cc.LabelTTF(tittle, GFontDef.fontName, 32).to(node).pp(0.2, 0.5);

        label.setColor(this.getFillStyle());

        var button = new FocusButton().to(node).anchor(0, 0.5);
        button.mpOnPath = this.getImage("btn_on.png");
        button.mpOffPath = this.getImage("btn_off.png");
        button.mpOn = on;       //是否处理开启状态, 等会儿马上调用一次changeStatus

        var changeStatus = function () {
            button.mpOn = !button.mpOn;

            if (button.mpOn) {
                button.loadTextureNormal(button.mpOnPath, ccui.Widget.PLIST_TEXTURE);
                openCallback && openCallback();
            }
            else {
                button.loadTextureNormal(button.mpOffPath, ccui.Widget.PLIST_TEXTURE);
                closeCallback && closeCallback();
            }
        };

        button.loadTextureNormal(on ? button.mpOnPath : button.mpOffPath, ccui.Widget.PLIST_TEXTURE);

        button.pp(0.4, 0.5);

        var buttonTouchEventListener = function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                changeStatus();
            }
        };

        node.button = button;

        button.addTouchEventListener(buttonTouchEventListener);

        return node;
    },

    /**
     * 初始化裁剪节点
     */
    initClipper: function () {
        var h = this.showPanelBtn.ch();
        this.clipper = new cc.ClippingNode().anchor(0, 1).to(this).size(this.panel.cw(), this.panel.ch()).p(0, V.h - h);

        var stencil = new cc.DrawNode();
        var rect = [cc.p(0, 0), cc.p(this.panel.cw(), 0), cc.p(this.panel.cw(), this.panel.ch()), cc.p(0, this.panel.ch())];
        var white = cc.color(255, 255, 255, 255);
        stencil.drawPoly(rect, white, 1, white);
        this.clipper.setStencil(stencil);

        this.panel.to(this.clipper).p(0, this.panel.ch() * 2);
    },

    /**
     * 设置重返大厅函数
     */
    setBackToHallCallback: function (callback) {
        this.callback = callback;
    },

    /**
     * 设置重返大厅函数
     */
    setRuleCallback: function (callback) {
        this.ruleCallback = callback;
    },
    /**
     * 点击函数
     * @param sender
     */
    onClickBtn: function (sender) {
        switch (sender) {
            case this.showPanelBtn:
                this.hidePanelBtn.show();
                this.showPanelBtn.hide();
                this.panel.runAction(cc.sequence(cc.show(), cc.moveTo(0.2, 0, this.panel.ch())));
                this.enAbleSwallowKeyboard();
                break;

            case this.hidePanelBtn:
                this.hidePanelBtn.hide();
                this.showPanelBtn.show();
                this.panel.runAction(cc.sequence(cc.moveTo(0.2, 0, this.panel.ch() * 2), cc.hide()));
                this.unEnAbleSwallowKeyboard();
                break;

            case this.backBtn:
                if (this.callback) {
                    this.callback();
                } else {
                    app && app.closeSubGame();
                }
                break;
            case this.bankBtn:
                ToastSystemInstance.buildToast("该功能暂未开放！");
                break;
            case this.settingBtn:
                this.settingLayer.show();
                break;
            case this.ruleBtn:
                this.ruleCallback && this.ruleCallback();
                !this.ruleCallback && ToastSystemInstance.buildToast("该功能暂未配置！");
                break;
            case this.closeBtn:
                this.settingLayer.hide();
                break;
            // case this.effectBtn:
            //     cc.sys.localStorage.setItem("isSoundOn", "false");
            //     SoundEngine.setEffectsVolume(0);
            //     this.effectOffBtn.show();
            //     this.effectBtn.hide();
            //     break;
            //
            // case this.musicBtn:
            //     cc.sys.localStorage.setItem("isBgMusicOn", "false");
            //     SoundEngine.setBackgroundMusicVolume(0);
            //     this.musicOffBtn.show();
            //     this.musicBtn.hide();
            //     break;
            //
            // case this.effectOffBtn:
            //     cc.sys.localStorage.setItem("isSoundOn", "true");
            //     SoundEngine.setEffectsVolume(this.effectVolume);
            //     this.effectOffBtn.hide();
            //     this.effectBtn.show();
            //     break;
            //
            // case this.musicOffBtn:
            //     cc.sys.localStorage.setItem("isBgMusicOn", "true");
            //     SoundEngine.setBackgroundMusicVolume(this.musicVolumn);
            //     this.musicOffBtn.hide();
            //     this.musicBtn.show();
            //     break;
        }

        SoundEngine.playEffect(commonRes.btnClick);
    },


    //适配捕鱼
    onMouseEvent: function (eventName, event) {
        var result = false;

        var location = event.getLocation();
        for (var i = 0; i < this.areas.length; ++i) {
            var area = this.areas[i];
            if (area.isVisible()) {
                var size = area.size();
                var rect = cc.rect(0, 0, size.width, size.height);

                //点在本界面上的， 当然都要接收了
                if (cc.rectContainsPoint(rect, area.convertToNodeSpace(location))) {
                    result = true;
                    break;
                }
            }
        }

        if(this.hidePanelBtn.isVisible()){
            result = true;
        }

        return result;
    },

    onMouseDown: function (event) {

        return this.onMouseEvent("onMouseDown", event);
    },

    onMouseUp: function (event) {

        return this.onMouseEvent("onMouseUp", event);
    },

    onMouseMove: function (event) {

        return this.onMouseEvent("onMouseMove", event);
    },

});