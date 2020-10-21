var MPMainRoomGameUpdateTipLayer = MPQBackgroundLayer.extend({

    ctor:function (text) {
        this._super();

        var text = text || '';
        this.panel = new cc.Sprite("#shell_bg_common_632x433.png");
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var panel = this.panel;

        this.runPanelAction();

        var closeBtn = new FocusButton("common_btn_x.png","","",ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(panel);
        closeBtn.x = panel.cw() - 30;
        closeBtn.y = panel.ch() - 30;
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var title = new cc.Sprite("#common_title_txmsg.png").to(panel).pp(0.5,0.89);

        var submitBtn = new FocusButton("common_btn_yes.png","","",ccui.Widget.PLIST_TEXTURE);
        submitBtn.tag = 36;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        submitBtn.to(panel).pp(0.7,0.15);

        var cancelBtn = new FocusButton("common_btn_out.png","","",ccui.Widget.PLIST_TEXTURE);
        cancelBtn.tag = 38;
        cancelBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
        cancelBtn.to(panel).pp(0.3,0.15);

        var label = new cc.LabelTTF(text || "",GFontDef.fontName,24);
        label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        label.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        label.setDimensions(this.panel.cw() - 50,this.panel.ch());
        label.setColor(cc.color("#ff5200"));
        label.to(this.panel).pp();

    },

    buttonPressedEvents:function (sender, type) {

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);


                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                sender.tag == 1001 && this.closePanel();

                //退出/解散房间
                if(sender.tag == 38){


                }
                //立即更新游戏
                if(sender.tag == 36){
                    new MPMainRoomGameUpdateLayer().show();
                }

                break;
            case ccui.Widget.TOUCH_CANCELED:


                break;
        }
    },

})