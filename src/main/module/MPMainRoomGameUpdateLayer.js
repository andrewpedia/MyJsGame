var MPMainRoomGameUpdateLayer = MPQBackgroundLayer.extend({

    ctor:function (game) {
        this._super();


        var loadBg = new cc.Sprite("#hall_loading_bg.png").to(this).pp();
        var loadProgress = new cc.Sprite("#hall_loading_bar.png");

        var loadProgressScrollView = new ccui.ScrollView();
        loadProgressScrollView.to(this);
        loadProgressScrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        loadProgressScrollView.setTouchEnabled(false);
        loadProgressScrollView.setBounceEnabled(false);
        loadProgressScrollView.setClippingEnabled(true);
        loadProgressScrollView.setSize(cc.size(loadProgress.cw(), loadProgress.ch()));
        loadProgressScrollView.p(mpV.w / 2 - loadProgress.cw() / 2, mpV.h / 2 - loadProgress.ch() / 2);
        loadProgressScrollView.setScrollBarEnabled(false);
        loadProgress.to(loadProgressScrollView).anchor(0,0).p(0,0);
        loadProgressScrollView.width = 0;

        // item.runAction(cc.jumpTo(0.5,cc.p(item.x,item.y),50,1));
        var actions = [];
        for(var i = 0; i < 8; ++i){
            var keyI = i + 1;
            if (i >= 6) keyI = 6;
            var item = new cc.Sprite("#hall_loading_text00" + keyI + ".png");
            item.to(this).p(loadBg.x - loadBg.cw() / 2 + 45 * i + 20 * i + 50, loadBg.y + loadBg.ch());
            actions.push(cc.delayTime(0.05 * i));
            actions.push(cc.callFunc((t,t2)=>{
                t2.runAction(cc.jumpTo(0.05,cc.p(t2.x,t2.y),50,1));
            },this,item));
        }
        this.runAction(cc.sequence(actions).repeatForever());

        var gameLabel = new cc.LabelTTF("正在更新二人牛牛",GFontDef.fontName,40);
        gameLabel.to(this).p(mpV.w / 2,mpV.h / 2 + 200);

    },

    buttonPressedEvents:function (sender, type) {

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);




                break;
            case ccui.Widget.TOUCH_CANCELED:


                break;
        }
    },

})