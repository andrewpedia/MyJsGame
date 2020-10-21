var MPMainVipLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new ccs.load('res/plaza1v1/images/vip_popup/VipLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();


        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var submitBtn = this.panel.getChildByName('submitBtn');
        submitBtn.tag = 10;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

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

                sender.tag == 1001 && this.closePanel();
                sender.tag == 10 && this.submitBtnPressed();

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },
    submitBtnPressed:function () {
      new MPMainChargeLayer().show();
    },



})