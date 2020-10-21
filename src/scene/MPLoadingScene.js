/**
 * Created by 真心科技 on 2015/11/27.
 */

/**
 * 加载场景
 */
var MPLoadingScene = cc.Scene.extend(FocusBase).extend({

    _className: "MPLoadingScene",
    _classPath: "src/scene/MPLoadingScene.js",

    ctor: function (loadArray, finishCallback) {
        this._super();

        var exPath = GNativeInfo.loginSceneType;
        var spri = new cc.Sprite("res/images/nopack/hall_bg_login.png").to(this).p(mpV.w / 2, mpV.h / 2);
        spri.height = 750;
        //背景骨骼动画
        let bgEffect = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/login_girl/DLJM_Char.json", "res/images/nopack/spine_animation/login_girl/DLJM_Char.atlas", 1);
        bgEffect.setAnimation(0, "idle", true);
        bgEffect.to(this).p(667,375);

        let bgEffect2 = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/login_girl/DLJM_Floor.json", "res/images/nopack/spine_animation/login_girl/DLJM_Floor.atlas", 1);
        bgEffect2.setAnimation(0, "idle", true);
        bgEffect2.to(this).p(667,325);

        var logo = new cc.Sprite("res/images/nopack/"+imagesPre+"_logo.png").to(this).p(667,375);

        this.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(function () {
            cc.loader.load(loadArray, function (err) {
                if (!err) {
                    finishCallback && finishCallback();
                }
                else {
                    cc.log(JSON.stringify(err));
                }
            });
        })));


    },


});
