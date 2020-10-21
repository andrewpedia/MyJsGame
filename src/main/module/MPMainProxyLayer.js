var MPMainProxyLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new ccs.load('res/plaza1v1/images/main_layer/proxy/Layer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();


        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var fileNode1 = this.panel.getChildByName('FileNode_1');
        var copyBtn1 = fileNode1.getChildByName('copyBtn');
        copyBtn1.tag = 10;
        copyBtn1.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var fileNode2 = this.panel.getChildByName('FileNode_2');
        var copyBtn2 = fileNode2.getChildByName('copyBtn');
        copyBtn2.tag = 11;
        copyBtn2.addTouchEventListener(this.buttonPressedEvents.bind(this));

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

                if (sender.tag == 10 || sender.tag == 11) {
                    native.setClipboard('qi0305001');
                    native.openWXApp();
                }
                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    }



})