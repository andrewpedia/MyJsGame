var MPMainChargeReportLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();

        var text = text || '';

        this.panel = new ccs.load('res/css/recharge/MPMainChargeReportLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var submitBtn = this.panel.getChildByName('copyBtn');
        submitBtn.tag = 1000;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));




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
                if (sender.tag == 1000){
                    native.setClipboard('h11111111111');
                    native.openWXApp()
                }
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