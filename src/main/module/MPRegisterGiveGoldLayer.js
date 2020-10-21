var MPRegisterGiveGoldLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();

        this.panel = new ccs.load('res/css/zcsj/MPRegisterGiveGoldLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var submitBtn = this.panel.getChildByName('submitBtn');
        submitBtn.tag=20;
        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag=21;
        var moneySprite = this.panel.getChildByName('bgSprite');
        //moneySprite.display("res/plaza1v1/images/main_layer/registergivegold/bg_3.png");
		var moneySprite = this.panel.getChildByName('bgSprite');
        //moneySprite.display("res/plaza1v1/images/main_layer/registergivegold/bg_3.png");
        var presentMoney=this.panel.getChildByName('Text_1');
		presentMoney.setString(GSystemConfig.regScore);
        //console.log("GSystemConfig.regScore====="+GSystemConfig.regScore);
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
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

                if (sender.tag == 20)  {
                    new MPRegisterLayer(MPRegisterLayer.BindMode).to(this);
                }
                else if (sender.tag == 21)  {
                    this.closePanel();
                }
                
                //this.closePanel();

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