var MPEditBoxLayer = MPQBackgroundLayer.extend({


    ctor:function (inputMode,placeholder,maxLength) {

        this._super();

        this.panel = new ccs.load('res/plaza1v1/images/box/MPEditBoxLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var submitBtn = this.panel.getChildByName('submitBtn');
        submitBtn.tag = 10;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var bg = this.panel.getChildByName('bg');

        var size = cc.size(bg.width - 10,bg.height - 10);

        var editBox = new FocusEditBox(size, new cc.Scale9Sprite());
        editBox.setFontSize(36);
        editBox.setPlaceHolder( placeholder || '');
        editBox.setPlaceholderFontSize(36);
        editBox.setMaxLength(maxLength || 10000);
        editBox.setFontColor(cc.color(255,255,255));
        editBox.setPlaceholderFontColor(cc.color(230,230,230));
        editBox.setInputMode(inputMode || cc.EDITBOX_INPUT_MODE_ANY);
        editBox.to(this.panel).anchor(0,0.5);
        editBox.x = bg.x + 5;
        editBox.y = bg.y - 5;

        this.runAction(cc.callFunc(function () {
            editBox.onClick();
        }))
        var self = this;
        editBox.setDelegate({
            editBoxEditingDidEnd:function () {
                console.log('editBoxEditingDidEnd');
            },
            editBoxEditingReturn:function (sender) {
                console.log('editBoxEditingReturn')
                setTimeout(function () {
                    self.removeFromParent();
                },0.25);
            }
        });

    },
    onTouchBegan:function () {
      return false;
    },
    show:function () {
      this.to(cc.director.getRunningScene(),10000000000);
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
                var self = this;
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                    self.removeFromParent();
                },0.25);

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