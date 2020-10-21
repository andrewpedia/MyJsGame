//兑换

var MPMainBindBankLayer = MPQBackgroundLayer.extend({

    ctor:function (type) {
        this._super();

        this.bType = type;
        this.panel = new ccs.load('res/css/ec/MPMainBindBankLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();

        var submitBtn = this.panel.getChildByName('submitBtn');
        submitBtn.tag = 10;
        submitBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1000;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var titleImageView = this.panel.getChildByName('titleSprite');
        //titleImageView.loadTexture('res/plaza1v1/images/exchange_popup/exch/' + (type == 2 ? 'bank_change_title.png' : 'bank_bind_title.png'));
        var submitTitleImageView = submitBtn.getChildByName('titleSprite');
        //submitTitleImageView.loadTexture('res/plaza1v1/images/exchange_popup/exch/' + (type == 2 ? 'bt_change.png' : 'bt_bind.png'));
        var buildSingleEditBox =  (size,inputType,color,maxLength,placeHolder)=> {

            var editBox = new FocusEditBox(size, new cc.Scale9Sprite());
            editBox.setFontSize(36);
            editBox.setPlaceHolder(placeHolder);
            editBox.setPlaceholderFontSize(24);
            editBox.setPlaceholderFontColor(color);
            editBox.setMaxLength(maxLength || 20);
            editBox.setFontColor(color);
            editBox.setInputMode(inputType);

            return editBox;
        }

        var accountEditBox = buildSingleEditBox(cc.size(270,40),cc.EDITBOX_INPUT_MODE_ANY,cc.color(255,255,255),null,'持卡人姓名');
        accountEditBox.to(this.panel).anchor(0,0.5);
        accountEditBox.x = 220;
        accountEditBox.y = 355;
        

        var nameEditBox = buildSingleEditBox(cc.size(270,40),cc.EDITBOX_INPUT_MODE_ANY,cc.color(255,255,255),null,'请输入银行卡号');
        nameEditBox.to(this.panel).anchor(0,0.5);
        nameEditBox.x = 220;
        nameEditBox.y = 286;
        nameEditBox.setFontSize(22);
        nameEditBox.setPlaceholderFontSize(22);
        this.accountEditBox = nameEditBox;
        this.nameEditBox = accountEditBox;

        if (mpGD.userInfo.bank_account) {
            this.accountEditBox.setString(mpGD.userInfo.bank_account);
            this.accountEditBox.setTouchEnabled(false);
            //更改
            // titleImageView.loadTexture('res/css/ec/bank_change_title.png');
            //submitTitleImageView.loadTexture('res/css/ec/bt_change.png');
        }
        else
        {
            //绑定
            // titleImageView.loadTexture('res/css/ec/bank_bind_title.png');
            //submitTitleImageView.loadTexture('res/css/ec/bt_bind.png');
        }
        if (mpGD.userInfo.realname) {
            this.nameEditBox.setString(mpGD.userInfo.realname);
            this.nameEditBox.setTouchEnabled(false);
        }

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

                sender.tag == 1000 && this.closePanel();
                sender.tag == 10   && this.submitEvent();;

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },
    submitEvent:function () {

        if (this.accountEditBox.getString().length == 0 || this.nameEditBox.getString().length == 0)
            return new MPTipLayer('银行账号或者实名制姓名不能为空').show();
        mpApp.showWaitLayer("正在操作, 请稍候");
        mpGD.netHelp.requestSetDrawBankAccounts(this.accountEditBox.getString(),this.nameEditBox.getString());
        //new MPTipLayer(this.bType == 1 ? '绑定成功' : '切换成功').show();
        //this.removeFromParent();


    },

})