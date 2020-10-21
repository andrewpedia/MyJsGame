var MPMainNoticeDetailLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new ccs.load('res/plaza1v1/images/announce_popup/detail.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();


        var closeBtn = this.panel.getChildByName('closeBtn');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        var scrollView = this.panel.getChildByName('scrollView');

        var testString = '';
        for (var i = 0; i < 10; i ++) {
            testString = testString + '我是大魔王的爸爸张无忌是你奶奶的爷爷的爸爸的姥姥的儿子的媳妇的' + '\n' + '你是大魔王';
        }
        testString = testString + 'aaaxxx';
        console.log(testString)
        var message = scrollView.getChildByName('textLabel');
        message.setString(testString);
        // 问题：自动换行后，获取文本高度的方法有误
        // 解决：没有找到合适的替换方法，故用字体像素的换算暂时处理
        var lineCount = 0;
        var lines = message.getString().split('\n');

        for (var i = 0; i < lines.length; i++) {
            if (lines[i]) {
                // 提取 数字|字母|空格|点
                var str = lines[i].replace(/[^a-z\d .]/ig, "");
                // 将数字字母等转换成汉字宽度计算个数
                var count = lines[i].length - Math.floor(str.length / 2);
                // 每行汉字个数限定为24，超过则换行
                lineCount = lineCount + Math.ceil(count / 25);
            } else {
                lineCount = lineCount + 1;
            }
        }

        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_WINDOWS) {
                message.setContentSize(cc.size(600, lineCount * 30));
            } else {
                message.setContentSize(cc.size(600, lineCount * 35));
            }
        } else {
            message.setContentSize(cc.size(600, lineCount * 35));
        }


        scrollView.setInnerContainerSize(message.size());//限定一下点击区域
        message.x = 0;
        message.y = message.size().height;
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