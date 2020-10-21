


var MPWebViewLayer = cc.LayerColor.extend({

   ctor:function (url) {

       this._super();

       this.panel = new ccs.load('res/plaza1v1/images/webview/web/MPWebViewLayer.json').node;
       this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

       var content = this.panel.getChildByName('content');

       var backBtn = this.panel.getChildByName('backBtn');
       var closeBtn = this.panel.getChildByName('closeBtn');

       var loading = this.panel.getChildByName('loading');

       backBtn.tag = 10;
       closeBtn.tag = 11;

       backBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
       closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));
       loading.runAction(cc.repeatForever(
           cc.rotateTo(0.5,360 + 3600)
       ))

       this.webView = new ccui.WebView(url);

       this.webView.setEventListener(ccui.WebView.EventType.LOADED, function () {
          loading.stopAllActions();
          loading.setVisible(false);
          backBtn.setVisible(true);
       });
       this.webView.setEventListener(ccui.WebView.EventType.ERROR,function () {
           loading.stopAllActions();
           loading.setVisible(false);
       });
       this.webView.to(content).anchor(0.5,0.5).pp(0.5,0.5).size(content.width,content.height);



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
                if (sender.tag == 10){
                    this.webView.canGoBack() && this.webView.goBack();
                }

                if (sender.tag == 11) this.removeFromParent();

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },
});