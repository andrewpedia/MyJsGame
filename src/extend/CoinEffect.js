/**
 * Created by pear on 2017/8/14.
 */


var CoinEffect = cc.Layer.extend({
    coins: null,
    coinNum: null,   //金币个数
    bezierData: null, //贝塞尔参数，[controlPos1, controlPos2, endPos]
    startPos: null,  //金币起始位置
    actionTime: null, //贝塞尔飞行时间
    paddingTime: null, //金币飞行间隔时间
    CoinScale: null,  //金币的初始大小

    ctor: function (actionTime, paddingTime, coinNum, startPos, bezierData, scale) {
        this._super();
        this.actionTime = actionTime || 0.5;
        this.paddingTime = paddingTime || 0.1;
        this.bezierData = bezierData;
        this.startPos = startPos;
        this.coinNum = coinNum || 5;
        this.CoinScale = scale || 0.5;

        this.initEx();
    },

    initEx: function () {
        this.coins = [];
        this.coinNum = this.coinNum || 5;
        for (var i = 0; i < this.coinNum; i++) {
            var coin = new cc.Sprite("#allcommon/coin_3.png").to(this, 100 - i).qscale(this.CoinScale).hide();
            this.coins.push(coin);
        }


    },

    playCoinEffect: function () {
        SoundEngine.playEffect(commonRes.winCoin);
        for (var i = 0; i < this.coins.length; i++) {
            this.runBezierAction(this.coins[i], i * this.paddingTime);
        }
    },

    runBezierAction: function (node, paddingTime) {

        // var action = animate.repeatForever();
        node.setOpacity(255);
        node.setScale(this.CoinScale);
        node.stopAllActions();
        node.p(this.startPos);
        node.hide();
        node.runAction(cc.sequence(
            cc.delayTime(paddingTime),
            cc.callFunc(() => {
                node.show();
                node.runAction(ttutil.buildAnimate("#allcommon/coin_", 4, this.actionTime / 4, ".png", 1, 0));
            }),
            cc.bezierTo(this.actionTime, this.bezierData),
            cc.spawn(cc.scaleTo(0.5, this.CoinScale + 0.2), cc.fadeTo(0.5, 0))
            // cc.callFunc(()=>{
            //     node.hide();
            // })
        ));
    }

});