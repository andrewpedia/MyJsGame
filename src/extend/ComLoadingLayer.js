/**
 * Created by pear on 2018/1/2.
 */

var ComLoadingLayer = cc.Layer.extend({

    progressBg:null, //进度条背景
    progress:null, //进度条
    progressLabel:null, //

    ctor:function () {
        this._super();
        this.initEx();
    },

    initEx:function () {
        new cc.Sprite("res/img/gui-Login-background3.jpg").to(this).pp();

        this.progressBg = new ccui.Scale9Sprite("res/img/jindutiao_01.png").to(this).pp(0.5,0.2);

        this.progressLabel = new cc.LabelTTF("0%","Arial",32).to(this.progressBg,10).pp(1.06,0.5);

        // var jiugong = new ccui.Scale9Sprite("jindutiao_02.png");
        var img = new cc.Sprite("res/img/jindutiao_02.png").anchor(0,0.5);
        this.progress = new cc.ProgressTimer(img).to(this.progressBg).pp();

        // this.progress = new cc.ProgressTimer(new cc.Sprite("#jindutiao_02.png")).to(this).pp(0.5,0.2);

        // this.progress.setReverseDirection(true);
        this.progress.setType(cc.ProgressTimer.TYPE_BAR);
        this.progress.setMidpoint(cc.p(0,0.5));
        this.progress.setBarChangeRate(cc.p(1,0));
        // cc.log("====== type " + this.progress.getType());
        // this.setPercentage(80);





    },

    /**
     * 设置进度， 0到100
     * @param percentage
     */
    setPercentage: function (percentage) {
        if (isNaN(percentage))
            percentage = 0;

        this.progress.setPercentage(percentage);
        this.progressValue = Math.floor(this.progress.getPercentage());
        this.progressLabel.setString(this.progressValue + "%");
    },


});
