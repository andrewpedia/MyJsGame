
var MPMainArrowLayer = cc.LayerColor.extend({
    clickArrowCallback:null,
    clicking:false,
    animating:false,
    ctor:function () {
        this._super(cc.color(0,0,0,0));

        this.panel = new ccs.load('res/plaza1v1/images/main_layer/arrow/MPMainArrowLayer.json').node;

        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.leftArrowBtn = this.panel.getChildByName('arrowLeftBtn');
        this.rightArrowBtn = this.panel.getChildByName('arrowRightBtn');
        this.leftArrowBtn.setVisible(false);

        this.leftX = this.leftArrowBtn.x;
        this.rightX = this.rightArrowBtn.x;
        this.leftArrowBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        this.rightArrowBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        this.startTimeOut();

    },
    startTimeOut:function () {
        var self = this;
        self.aniTimeOut = setTimeout(function () {
            self.leftArrowBtn.isVisible() &&  self.leftRunAction();
            self.rightArrowBtn.isVisible() && self.rightRunAction();
        },5000);
    },
    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.9);
                sender.setColor(cc.color(255,128,128));

                this.clicking = true;

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                sender == this.leftArrowBtn  && this.clickArrowCallback && this.clickArrowCallback(0);
                sender == this.rightArrowBtn && this.clickArrowCallback && this.clickArrowCallback(1);
                this.clicking = false;
                this.leftArrowBtn.stopAllActions();
                this.rightArrowBtn.stopAllActions();
                this.animating = false;
                clearTimeout(this.aniTimeOut);

                if (sender == this.leftArrowBtn) {
                    this.rightArrowBtn.setVisible(true);
                    this.leftArrowBtn.setVisible(false);
                    this.rightArrowBtn.x = this.rightX;
                    this.rightRunAction();
                }

                if (sender == this.rightArrowBtn) {
                    this.leftArrowBtn.setVisible(true);
                    this.rightArrowBtn.setVisible(false);
                    this.leftArrowBtn.x = this.leftX;
                    this.leftRunAction();
                }

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);
                this.clicking = false;
                break;
        }
    },

    rightRunAction:function () {
        if (this.animating || this.clicking) return;
        var x = this.rightArrowBtn.x;
        this.animating = true;
        var self = this;
        this.rightArrowBtn.runAction(
            cc.repeat(
                cc.sequence(
                    cc.moveTo(0.5, cc.p(this.rightX + 15,this.rightArrowBtn.y)).easing(cc.easeBackOut(0.6)),
                    cc.moveTo(0.5, cc.p(this.rightX,this.rightArrowBtn.y)).easing(cc.easeBackIn(0.6)),
                    cc.callFunc(function () {
                        self.animating = false;
                        clearTimeout(self.aniTimeOut);
                        self.startTimeOut();
                    })
                )
                , 3)
        );

    },
    leftRunAction:function () {
        if (this.animating || this.clicking) return;
        var x = this.leftArrowBtn.x;
        this.animating = true;
        var self = this;
        this.leftArrowBtn.runAction(
            cc.repeat(
                cc.sequence(
                    cc.moveTo(0.5, cc.p(this.leftX - 15,this.rightArrowBtn.y)).easing(cc.easeBackOut(0.6)),
                    cc.moveTo(0.5, cc.p(this.leftX,this.rightArrowBtn.y)).easing(cc.easeBackIn(0.6)),
                    cc.callFunc(function () {
                        self.animating = false;
                        clearTimeout(self.aniTimeOut);
                        self.startTimeOut();
                    })
                )
                , 3)
        );
    },

    showLeftArrow:function () {
        this.leftArrowBtn.x = this.leftX;
        this.leftArrowBtn.setVisible(true);
        this.rightArrowBtn.setVisible(false);
        this.clicking = false;
        this.leftArrowBtn.stopAllActions();
        this.rightArrowBtn.stopAllActions();
        this.animating = false;
        clearTimeout(this.aniTimeOut);
        this.leftRunAction();
    },
    showRightArrow:function () {
        this.rightArrowBtn.x = this.rightX;
        this.leftArrowBtn.setVisible(false);
        this.rightArrowBtn.setVisible(true);
        this.clicking = false;
        this.leftArrowBtn.stopAllActions();
        this.rightArrowBtn.stopAllActions();
        this.animating = false;
        clearTimeout(this.aniTimeOut);
        this.rightRunAction();
    }



})