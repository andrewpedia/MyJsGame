var MPNewUserAwardLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();

        this.panel = new ccs.load('res/plaza1v1/images/main_layer/newuser/MPNewUserAwardLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var submitBtn = this.panel.getChildByName('submitBtn');

        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var finger = this.panel.getChildByName('finger');

        finger.runAction(cc.repeatForever(
            cc.sequence(
                cc.scaleTo(0.5, 1.3).easing(cc.easeBackOut(0.6)),
                cc.scaleTo(0.5, 1).easing(cc.easeBackIn(0.6))
            )
            ));

    },

    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.9);
                sender.setColor(cc.color(255,128,128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                this.closePanel();

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },

})