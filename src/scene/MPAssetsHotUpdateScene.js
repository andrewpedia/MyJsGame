var MPAssetsHotUpdateScene = cc.Scene.extend({

    assetsManager: null, //资源管理器
    localManifest: "res/project.manifest", //随包发布的 配置文件
    //储存路径，   如果里面有东西， assetsManager以此为 配置文件， 按照里面的配置去下载网上的配置文件， 拿来对比， 有需要再下载网上的。也会以里面下载的代码目录， 文件目录为准， 网上下载的东西也会覆盖在这边
    storagePath: null,

    ///////////////////////////////////////////////////////////
    percent: 0, //进度
    percentByFile: 0, //当前文件进度
    assetID: null, //当前正在更新的资源名字
    /////////////////////////////////////////////////////////////
    percentHitLabel: null, //总进度提示label精灵
    percentByFileHitLabel: null, //按文件个数计算的文件进度
    assetIDHitLabel: null, //当前正在更新的资源ID
    /////////////////////////////////////////////////////////////

    bgLayer: null,
    logoSprite: null,


    barBgSprite: null,
    barSprite: null,
    /////////////////////////////////////////////////////////////
    failCount: 0, //失败次数
    maxRetryCount: 5, //最大重试次数
    //////////////////////////////////////////////////////
    startTime: 0,
    leastDelayTime: 0, //在这个界面最少的仪时间 为1.5秒

    isLoading: false,

    _className: "MPAssetsHotUpdateScene",
    _classPath: "src/scene/MPAssetsHotUpdateScene.js",

    ctor: function() {
        this._super();

        this.bgLayer = new cc.LayerColor(cc.color(0xff, 0xff, 0xff, 0xff));
        this.addChild(this.bgLayer);

        //下一帧再执行， 防止黑屏。（因为里面有加载资源）
        this.runAction(cc.callFunc(function() {
            this.startTime = Date.now();
            this.initEx();
        }.bind(this)));
    },

    loadRes: function() {
        // cc.spriteFrameCache.addSpriteFrames("res/logo/logo.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_common.plist");

    },
    releaseRes: function() {
        // cc.spriteFrameCache.removeSpriteFramesFromFile("res/logo/logo.plist");
        //bar就不删除了， 以后还会用到
    },

    initEx: function() {
        this.loadRes();

        if (cc.game.config.debugMode == 0) {
            this.storagePath = jsb.fileUtils.getWritablePath() + "release/" + "plaza/";
        } else {
            this.storagePath = jsb.fileUtils.getWritablePath() + "debug/" + "plaza/";
        }

        //console.log(this.localManifest);
        //console.log(this.storagePath);


        ///////////////////////////////////////////////////////////////////

        var winSize = cc.director.getWinSize();
        //开场 动画
        //-----------------------------------------------------------------------------

        this.logoSprite = new cc.Sprite("res/images/nopack/hall_bg_login.png");
        this.logoSprite.height = 750;
        this.addChild(this.logoSprite);
        this.logoSprite.setPosition(winSize.width / 2, winSize.height / 2);
        //背景骨骼动画
        let bgEffect = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/login_girl/DLJM_Char.json", "res/images/nopack/spine_animation/login_girl/DLJM_Char.atlas", 1);
        bgEffect.setAnimation(0, "idle", true);
        this.addChild(bgEffect);
        bgEffect.x = 667;
        bgEffect.y = 375;

        let bgEffect2 = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/login_girl/DLJM_Floor.json", "res/images/nopack/spine_animation/login_girl/DLJM_Floor.atlas", 1);
        bgEffect2.setAnimation(0, "idle", true);
        this.addChild(bgEffect2);
        bgEffect2.x = 667;
        bgEffect2.y = 325;

        var logo = new cc.Sprite("res/images/nopack/jinhai_logo.png");
        this.addChild(logo);
        logo.x = 667;
        logo.y = 375;
        // var logo = new cc.Sprite("res/images/nopack/logo.png")
        // this.addChild(logo);
        // logo.x = 667;
        // logo.y = 375;
        // this.logoSprite.setScale(0.8, 0.8);

        // var toString2 = function (number) {
        //     if(number < 10)
        //         return "0" + number;
        //
        //     return number.toString();
        // };

        //this.logoSprite = new cc.Sprite("#res/logo/_0000_1.png");
        // var animation = new cc.Animation();
        // for (var i = 1; i < 30; ++i) {
        //     var frameName = "res/logo/_00" + toString2(i - 1) + "_" + i + ".png";
        //     var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
        //     animation.addSpriteFrame(spriteFrame);
        // }
        // animation.setDelayPerUnit(1 / 10);           //设置两个帧播放时间
        // this.logoSprite.runAction(cc.animate(animation));

        //-----------------------------------------------------------------------------

        this.barBgSprite = new cc.Scale9Sprite("common_progress_bar_bg.png", cc.rect(0, 0, 0, 0));
        this.barBgSprite.setAnchorPoint(0, 0.5);
        this.barBgSprite.setContentSize(637, 44);
        this.barBgSprite.setPosition(winSize.width / 2 - 637/2, winSize.height / 5 - 15);
        // this.barBgSprite.setColor(cc.color(0xe1, 0xe1, 0xe1, 0xff));
        this.addChild(this.barBgSprite);


        this.barSprite = new cc.Scale9Sprite("common_progress_bar.png", cc.rect(0, 0, 0, 0));
        this.barSprite.setAnchorPoint(0, 0.5);
        this.barSprite.setContentSize(0, 44);
        this.barSprite.setPosition(winSize.width / 2 - 637/2, winSize.height / 5 - 15);
        // this.barSprite.setColor(cc.color(0x33, 0xcc, 0xff, 0xff));
        this.addChild(this.barSprite);

        this.barBgSprite.setVisible(false);
        this.barSprite.setVisible(false);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //         var t1 = new cc.LabelTTF("xx网络科技有限公司", "宋体", 20);
        //         var t2 = new cc.LabelTTF("Copyright 2014-2018", "宋体", 20);
        //         t1.setColor({r: 200, g: 200, b: 200});
        //         t2.setColor({r: 200, g: 200, b: 200});
        //         this.addChild(t1);
        //         this.addChild(t2);
        //         t1.setPosition(winSize.width / 2, 25);
        //         t2.setPosition(winSize.width / 2, 55);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this.percentHitLabel = new cc.LabelTTF("正在载入...", "宋体", 40);
        this.percentHitLabel.setColor(cc.color.BLACK);
        //this.percentHitLabel.setVisible(false);
        //this.percentByFileHitLabel = new cc.LabelTTF("", "宋体", 40);
        this.assetIDHitLabel = new cc.LabelTTF("", "宋体", 40);
        this.assetIDHitLabel.setColor(cc.color.BLACK);
        this.addChild(this.percentHitLabel);


        this.percentHitLabel.setPosition(winSize.width / 2, winSize.height / 4);
        this.percentHitLabel.setAnchorPoint(0.5, 0.5);
        ///////////////////////////////////////////////////////////////////efw
        //this.addChild(this.percentByFileHitLabel);
        //this.percentByFileHitLabel.setPosition(winSize.width / 2, winSize.height / 2 + 120);
        //this.percentByFileHitLabel.setAnchorPoint(0.5, 0.5);
        //this.percentByFileHitLabel.setVisible(false);
        ///////////////////////////////////////////////////////////////////
        this.addChild(this.assetIDHitLabel);
        this.assetIDHitLabel.setPosition(winSize.width / 2, winSize.height / 5 - 50);
        this.assetIDHitLabel.setAnchorPoint(0.5, 0.5);
        this.assetIDHitLabel.setVisible(false);
        /////////////////////////////////////////////////////////////////

        if (cc.sys.isNative && cc.game.config.runPlazaUpdate) {
            this.runUpdate();
        } else {
            this.loadGame();
        }

        //this.scheduleUpdate();
    },


    runUpdate: function() {

        this.assetsManager = new jsb.AssetsManager(this.localManifest, this.storagePath);


        this.assetsManager.setVersionCompareHandle(function(localVersion, serverVersion) {
			//服务端版本号如果是一个http地址 则跳转到网页，用于平台迁移使用
			if(serverVersion.indexOf("http")>-1)
			{
				cc.sys.openURL(serverVersion);
				return 0;
			}
            if (localVersion == serverVersion) {
                return 0;
            } else {
                return -1;
            }
        });
        console.log("存储目录:\t" + this.storagePath);
        // 由于下载过程是异步的，你需要增加manager的索引数以保证它不会被Cocos2d-x的内存管理释放掉
        this.assetsManager.retain();

        if (!this.assetsManager.getLocalManifest().isLoaded()) {
            console.log("Fail to update assets, step skipped.");
            this.loadGame();
        } else {
            var that = this;
            var listener = new jsb.EventListenerAssetsManager(this.assetsManager, function(event) {
                switch (event.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        console.log("No local manifest file found, skip assets update.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        that.percent = event.getPercent() * 100;
                        if (isNaN(that.percent))
                            that.percent = 0;
                        that.percentByFile = event.getPercentByFile();
                        that.assetID = event.getAssetId();
                        console.log(that.percent + "%");
                        console.log(that.percentByFile);
                        console.log(event.getAssetId());

                        var msg = event.getMessage();
                        if (msg) {
                            console.log(msg);
                        }
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        console.log("Fail to download manifest file, update skipped.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        console.log("No Update");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        console.log("Update finished.");
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        console.log("Update failed. " + event.getMessage());

                        that.failCount++;
                        if (that.failCount < that.maxRetryCount) {
                            that.assetsManager.downloadFailedAssets();
                        } else {
                            cc.log("Reach maximum fail count, exit update process");
                            that.failCount = 0;
                            that.loadGame();
                        }
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        console.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                        that.loadGame();
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        console.log(event.getMessage());
                        that.loadGame();
                        break;
                    default:
                        break;
                }
            });
            this.scheduleUpdate();
            cc.eventManager.addListener(listener, 1);
            this.assetsManager.update();
        }
    },

    loadGame: function() {

        //热更发生错误就会进入这里。
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        this.percent = 100;
        this.update(0);

        this.percentHitLabel && this.percentHitLabel.setString("正在载入...");
        this.assetIDHitLabel && this.assetIDHitLabel.setVisible(false);
        //this.barSprite && this.barSprite.setVisible(false);
        //this.barBgSprite && this.barBgSprite.setVisible(false);
        this.percentByFileHitLabel && this.percentByFileHitLabel.setVisible(false);
        this.unscheduleUpdate();


        if (!jsb.fileUtils.isFileExist("src/MPJsFiles.js") && !jsb.fileUtils.isFileExist("src/MPJsFiles.jsc")) {
            this.assetIDHitLabel && this.assetIDHitLabel.setVisible(true);
            this.assetIDHitLabel && this.assetIDHitLabel.setString("检查更新失败");
            this.percentHitLabel && this.percentHitLabel.setString("请检查设备是否联网,或访问 www.ac09u.com 下载最新包");
            return;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Prepend the manifest's search path
        var searchPaths = jsb.fileUtils.getSearchPaths();
        console.log(JSON.stringify(searchPaths));
        cc.sys.localStorage.setItem('PlazaHotUpdateSearchPaths', JSON.stringify(searchPaths));
        // jsb.fileUtils.setSearchPaths(searchPaths);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        console.log("start loadJs mpJsFiles");

        var self = this;

        cc.loader.loadJs(["src/MPJsFiles.js"], function(err) {
            console.log(err);
            if (!err) {
                console.log("Loading  mpJsFiles");
                cc.loader.loadJs(mpJsFiles, function(err) {
                    // 加载完脚本后,初始化友盟
                    console.log("Loading mpJsFiles obj");
                    //console.log(err);
                    //self.initUmeng();
                    if (!err) {
                        var delayTime = Date.now() - self.startTime;

                        if (delayTime < self.leastDelayTime)
                            delayTime = self.leastDelayTime - delayTime;
                        else {
                            delayTime = 0;
                        }

                        self.runAction(cc.sequence(cc.delayTime(delayTime / 1000), cc.callFunc(mpApp.onAssetsHotUpdateFinishCallback.bind(mpApp))));

                    } else {
                        cc.log(JSON.stringify(err));
                    }
                });
            } else {
                cc.log(JSON.stringify(err));
            }
        });
    },

    // 初始化友盟
    initUmeng: function() {
        if (cc.sys.os == cc.sys.OS_IOS) {
            native.initUMeng({
                appKey: "5967076fb27b0a5d130013b2",
                channelId: "App Store",
                encryptEnabled: "1",
            });
        }
    },

    update: function(dt) {


        if (this.percent > 0) {
            this.percentHitLabel.setString("正在载入, 总进度:" + this.percent.toFixed(2) + "%");
            this.barSprite.setVisible(true);
            this.barBgSprite.setVisible(true);

            //this.percentByFileHitLabel.setVisible(true);

            this.barSprite.setContentSize(6.37 * this.percent, 44);
        }
        if (this.assetID) {
            this.assetIDHitLabel.setString("正在载入:" + this.assetID);
            this.assetIDHitLabel.setVisible(true);
        }

        //this.percentByFileHitLabel.setString("文件个数进度:" + this.percentByFile.toFixed(2) + "%");


    },
    onExit: function() {
        cc.log("AssetsManager::onExit");
        this.assetsManager && this.assetsManager.release();
        this.releaseRes();
        this._super();
    }

});
