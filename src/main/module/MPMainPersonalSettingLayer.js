var MPMainPersonalSettingLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new cc.Sprite("res/images/nopack/hall_bg_common_632x433.png");
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        var panel = this.panel;

        this.runPanelAction();

        var closeBtn = new FocusButton("common_btn_x.png","","",ccui.Widget.PLIST_TEXTURE);
        closeBtn.to(panel);
        closeBtn.x = panel.cw() - 30;
        closeBtn.y = panel.ch() - 30;
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var title = new cc.Sprite("#setting_title.png").to(panel).pp(0.5,0.89);

        var right = new cc.Scale9Sprite("common_input_box.png");
        right.setContentSize(570, 300);
        right.to(panel).pp(0.5,0.425);

        var settingPanel = this.panel;

        var musicTitle = new cc.Sprite("#setting_label_music.png");
        musicTitle.to(right).pp(0.075,0.8);

        var musicSlider = new ccui.Slider();
        musicSlider.loadBarTexture("common_progress_bar_bg.png",ccui.Widget.PLIST_TEXTURE);
        musicSlider.loadProgressBarTexture("common_progress_bar.png",ccui.Widget.PLIST_TEXTURE);
        musicSlider.loadSlidBallTextures("common_progress_btn.png","common_progress_btn.png","common_progress_btn.png",ccui.Widget.PLIST_TEXTURE);
        musicSlider.to(right).pp(0.525,0.8);

        var musicTitle = new cc.Sprite("#setting_label_sound.png");
        musicTitle.to(right).pp(0.075,0.5);

        var effectSlider = new ccui.Slider();
        effectSlider.loadBarTexture("common_progress_bar_bg.png",ccui.Widget.PLIST_TEXTURE);
        effectSlider.loadProgressBarTexture("common_progress_bar.png",ccui.Widget.PLIST_TEXTURE);
        effectSlider.loadSlidBallTextures("common_progress_btn.png","common_progress_btn.png","common_progress_btn.png",ccui.Widget.PLIST_TEXTURE);
        effectSlider.to(right).pp(0.525,0.5);

        var musicValue = cc.sys.localStorage.getItem('musicValue');
        var effectValue = cc.sys.localStorage.getItem('effectValue');

        if (!musicValue) musicValue = '50';
        if (!effectValue) effectValue = '50';

        musicSlider.setPercent(parseInt(musicValue));
        effectSlider.setPercent(parseInt(effectValue));

        musicSlider.addCCSEventListener(this.musicSliderValueChanged.bind(this));
        effectSlider.addCCSEventListener(this.effectSliderValueChanged.bind(this));

        var rePwBtn = new FocusButton("res/images/nopack/changePwd.png","","",ccui.Widget.LOCAL_TEXTURE);
        rePwBtn.to(right).pp(0.5,0.2)
        rePwBtn.tag = 10;
        rePwBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

    },


    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);



                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);
                sender.tag == 1001 && this.closePanel();

                if (sender.tag == 10 || sender.tag == 11){
                    new MPPersonalCenterLayer(sender.tag - 10).to(cc.director.getRunningScene());
                }

                break;
            case ccui.Widget.TOUCH_CANCELED:


                break;
        }
    },
    //背景音乐音量值改变
    musicSliderValueChanged:function (sender, type) {

        console.log('music per:' + sender.getPercent() + ';type:' + type);

        SoundEngine.setBackgroundMusicVolume(sender.getPercent() / 100);
        cc.sys.localStorage.setItem('musicValue',sender.getPercent() + '');

    },
    //音效音量值改变
    effectSliderValueChanged:function (sender,type) {

        console.log('effect per:' + sender.getPercent() + ';type:' + type);
        SoundEngine.setEffectsVolume(sender.getPercent() / 100);
        cc.sys.localStorage.setItem('effectValue',sender.getPercent() + '');

    },


})