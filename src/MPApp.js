/**
 * Created by 真心科技 on 2016/1/27.
 */
//PlazaGD
var mpGD = {

    storage: null,
    subGameInfoMap: null,                //子游戏信息集合,    是个数组，   moduleID为下标
    initSearchPaths: null,              //初始资源搜索目录
    landscapeFrameSize: null,           // 横屏的屏幕尺寸， 游戏开始时会被赋值
    portraitFrameSize: null,            // 竖屏的屏幕尺寸， 游戏开始时会被赋值
    mainScene: null,                     //主场景
    netHelp: null,                       //网络连接

    saNetHelper: null,                  //大厅辅助网络链接
    chatEventHelper: null,               //聊天模块网络事件处理

    agentID: 0,                         //前端ID

    userInfo: {
        totalRebate: 0,         //所有返利
        unRecvRebate: 0,        //未领取返利
    },                     //登录用户的信息, 登录后会被覆盖
    netUtil: new NetUtil(),                          //用来发送get或post请求
    //canReleaseListener: null,             //是否可以释放监听
    userStatus: null,                         //用户状态， 记录玩家当前在哪个游戏， 哪个房间， 是否在玩游戏
    ipInfo: {ip: "0.0.0.0", isp: "未知位置", ts: 0, city: null, province: null},         //网络位置信息
    temp: {},                                //临时数据， 有些东西不方便保存在闭包里的， 可以先放在这， 临时变量取名时， 自己保证唯一 不把别的模块的给覆盖了， 建议按类名或文件名来。

    vipConfig: null,
    shareConfig: null,
    isBgMusicOn: true,          // 背景音乐是否开启
    isSoundOn: true,            // 音效是否开启
    isLaunching: true,          // 游戏启动

    goodsConfig: null,          // 道具配置
    goodsConfigMap: {},         // goodsID是key，
    goodsSet: null,             // 自己道具集合

    inviteTable: null,          // 邀请进入桌子
    friendList: null,           // 好友列表

    dailyMap: null,             // 日常签到信息
    startupFrames: [],
    startupSpr: [],
    saveLoginArgs:null, //登录参数 用于重连

    subGameIcoEffect:{},//子游戏特效
};

var _p = mpGD;

cc.defineGetterSetter(_p, "isBgMusicOn", function () {
    return cc.sys.localStorage.getItem("isBgMusicOn", "true") == "true";
}, function (value) {
    cc.sys.localStorage.setItem("isBgMusicOn", value ? "true" : "false");
});

cc.defineGetterSetter(_p, "isSoundOn", function () {
    return cc.sys.localStorage.getItem("isSoundOn", "true") == "true";
}, function (value) {
    cc.sys.localStorage.setItem("isSoundOn", value ? "true" : "false");
});

var mpApp = {

    getClassify: function (name) {
        switch (name) {
            case "jinchanbuyu":
            case "likuipiyu":
            case "shenshoutianxia":
            case "danaotiangong":
            case "shenhaibuyu":
            case "c3dfish":
			case "danaotiangong2":
                return "game1v1_fish/";

            default:
                return "";
        }
    },

    /**
     * 显示等待层
     * @param text
     * @param gray 是否降低透明度, 默认true
     */
    showWaitLayer: function (text, gray) {
        gray = gray == null ? true : false;
        var nowScene = cc.director.getRunningScene();
        if (nowScene) {
            nowScene.getChildByTag(mpWaitLayerTag) && nowScene.removeChildByTag(mpWaitLayerTag);
            new MPWaitLayer(text, null, gray ? null : 0x00).to(nowScene, 999999999, mpWaitLayerTag);
        }

    },

    /**
     * 删除等待层
     */
    removeWaitLayer: function () {

        var nowScene = cc.director.getRunningScene();
        if (nowScene) {
            nowScene.removeChildByTag(mpWaitLayerTag);
        }

    },


    /**
     * 获取本地版本号
     * 大厅是 10001, 其它子游戏就是子游戏自身的 moduleID
     */
    getLocalVersion: function (moduleID) {
        if (cc.sys.isNative)
            return mpGD.storage.getValue("version_" + moduleID);

        return -1;
    },

    /**
     * 设置本地版本号
     */
    setLocalVersion: function (moduleID, version) {
        return mpGD.storage.setValue("version_" + moduleID, version, true);
    },
    /**
     * 更新用户属性
     * @param dbInfo
     */
    updateUserInfo: function (dbInfo) {

        mpGD.userInfo = mpGD.userInfo || {};
        if (dbInfo) {
            ttutil.copyAttr(mpGD.userInfo, dbInfo);
        }


        //发送更新用户数据事件
        cc.eventManager.dispatchCustomEvent(mpEvent.UpdateUserInfo, null);
        // mpGD.mainScene && mpGD.mainScene.updateUserInfo();
    },

    /**
     * 更新用户道具
     * @param goodsSet {goodsID:x, count: x}
     */
    updateGoodsSet: function (goodsSet) {
        //mpGD.goodsSet == null 说明还未登录
        if (mpGD.goodsSet == null || goodsSet == null || goodsSet.goodsID == null) {
            console.log("更新 goods set 失败");
            return;
        }

        for (var i = 0; i < mpGD.goodsSet.length; ++i) {
            if (mpGD.goodsSet[i].goodsID == goodsSet.goodsID) {
                mpGD.goodsSet[i].count = goodsSet.count;
                return;
            }
        }

        //创建新的道具;
        var goodsConfig = this.findsGoodsConfig(goodsSet.goodsID);
        if (goodsConfig) {
            goodsSet.name = goodsConfig.name;
            mpGD.goodsSet.push(goodsSet);
        }
    },

    /**
     * 查找道具配置
     * @param goodsID
     * @returns {*}
     */
    findsGoodsConfig: function (goodsID) {
        if (goodsID == null || mpGD.goodsConfig == null) return null;

        for (var i = 0; i < mpGD.goodsConfig.length; ++i) {
            if (mpGD.goodsConfig[i].id == goodsID) {
                return mpGD.goodsConfig[i];
            }
        }

        return null;
    },

    /**
     * 查找道具
     */
    findGoodsSet: function (goodsID) {
        if (goodsID == null || mpGD.goodsSet == null) return null;

        for (var i = 0; i < mpGD.goodsSet.length; ++i) {
            if (mpGD.goodsSet[i].goodsID == goodsID) {
                return mpGD.goodsSet[i];
            }
        }

        return {count: 0};
    },


    checkUpdate: function () {

    },

    /**
     * 当资源更新完成后 ， 会加载 files.js里面的  文件， 然后再执行此函数
     */
    onAssetsHotUpdateFinishCallback: function () {


        // this.collectionIP(this._981Start.bind(this));

        var self = this
        mpGD.netUtil.getServerList((serverUrls) => {

            mpNetConfig = serverUrls //获取服务器列表
            self.collectionIP2(self._981Start.bind(self));
        })
        //this.collectionIP2(this._981Start.bind(this));

        // this._981Start();


    },

    collectionIP2: function (callback) {

        var isCallback = false;
        var finishCallback = function (isp) {
            if (!isCallback) {
                callback && callback(isp);
                isCallback = true;
            }
        };

        if (mpNetConfig.signUrl == null || !G_OPEN_SIGN) {
            mpGD.netUtil.getIPInfo(function (result) {
                //finishCallback({ip: ip, isp: isp, city: city, province: province});
				finishCallback(result);
            });
            return;
        }

        mpGD.netUtil.get(mpNetConfig.signUrl + "/first?q=" + (Math.floor(Math.random() * 5687654) * 1243 + 1), function (text) {
            var sessionID = text.substring(5, text.length - 5);
            var sign = hex_hmac_md5(mpSignKey + sessionID, sessionID);
            mpGD.netUtil.get(mpNetConfig.signUrl + "/" + sign + "?sign=" + sessionID.substring(10), function (text) {

                var isp = JSON.parse(text);

                finishCallback(isp);
            })
        });

        var scene = new MPFocusIP2Scene();
        cc.director.runScene(scene);
        var bg = new cc.Sprite("res/img/gui-Login-background3.jpg").to(scene).p(mpV.w / 2, mpV.h / 2);
        var ttf = new cc.LabelTTF("正在请求进入游戏， 请稍候...", GFontDef.fontName, 40).to(bg).pp();

        scene.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(function () {
            ttf.hide();

            var button = scene.button = new FocusButton("common_btn_yes.png", "", "", ccui.Widget.PLIST_TEXTURE).to(scene).p(mpV.w / 2, mpV.h / 2 - 250);
            button.setTitleText("点击此处进入游戏");
            button.setTitleFontSize(34);
            button.setScale9Enabled(true);
            button.size(500, 80);
            button.getTitleRenderer().pp(0.5, 0.5);
            button.addClickEventListener(function () {
                finishCallback();
            });
            scene.setFocusSelected(button);
        })));
    },

    _981Start: function (isp) {


        if (isp) {
            mpGD.ipInfo.ip = isp.ip;
            mpGD.ipInfo.isp = isp.address;
            mpGD.ipInfo.ts = Date.now();

            // mpGD.ipInfo.city = isp.city;
            // mpGD.ipInfo.province = isp.province;
        }

        mpGD.isBgMusicOn = cc.sys.localStorage.getItem("isBgMusicOn", "true") == "true";
        SoundEngine.setMusicVolume(mpGD.isBgMusicOn ? 1 : 0);

        mpGD.isSoundOn = cc.sys.localStorage.getItem("isSoundOn", "true") == "true";
        SoundEngine.setEffectsVolume(mpGD.isSoundOn ? 1 : 0);

        // cc.Image.setPVRImagesHavePremultipliedAlpha(true);
        var self = this;
        this.initialization();
        cc.loader.load(mpg_loading_resources, function (err) {
            if (!err) {
                mpGD.isLaunching = true;
                self.runLoadingScene();
                // self.runMainScene();
                // self.runTableScene();
            }
            else {
                cc.log(JSON.stringify(err));
            }
        });
    },

    requestPay: function (czType, money, goodsID, goodsNum) {

        

        mpGD.netHelp.requestPay(czType, money, "ganjuepay", null, goodsID, goodsNum);
        return;


        // if (cc.sys.isMobile && !G_PLATFORM_TV) {
            
        //     if (cc.sys.os == cc.sys.OS_IOS && czType == mpCZType.ZFB) {
        //         //mpGD.netHelp.requestPay(czType, money, "wap", null, goodsID, goodsNum);
        //         mpGD.netHelp.requestPay(czType, money, "9pay", null, goodsID, goodsNum);
        //     }
        //     else if (G_OPEN_APPLE_PAY) {
        //         var productId = native.getBundleId() + ".pay" + money;
        //         mpGD.netHelp.requestPay(czType, money, null, productId, goodsID, goodsNum);
        //     }
        //     else {
        //         mpGD.netHelp.requestPay(czType, money, null, null, goodsID, goodsNum);
        //     }
        // }
        // else {
        //     //mpGD.netHelp.requestPay(czType, money, "qrcode", null, goodsID, goodsNum);
        //     mpGD.netHelp.requestPay(czType, money, "9pay", null, goodsID, goodsNum);
        // }

        mpApp.showWaitLayer("正在请求支付");
    },

    //请求支付成功， 跳转到充值界面
    requestPayCallback: function (data, father) {
        mpApp.removeWaitLayer();
        if (data.errMsg)
            return;

        native.submit_paymentEvent(mpGD.userInfo.userID, data.orderID, data.money, data.money);

        if (data.channel == "web") {
            new WebViewLayer(data.req).to(father);
            return;
        }

        if (data.channel == "qrcode") {
            new MPQRCodeLayer(data).to(father);
            return;
        }

        if (data.channel == "wap") {
            cc.sys.openURL(data.req);
            return;
        }
        if (data.channel == "9pay") {
            cc.sys.openURL(data.req);
            return;
        }
		if (data.channel == "ganjuepay") {
            cc.sys.openURL(data.req);
            return;
        }
        switch (data.type) {
            case mpCZType.ZFB:
                native.sendZFBPayReq(data.req);
                break;

            case mpCZType.WX:
                native.sendWXPayReq(data.req);
                break;

            case mpCZType.IAP:
                var reqData = data.req;
                var productId = reqData.productId;
                var userID = mpGD.userInfo.userID ? mpGD.userInfo.userID : mpGD.storage.getValue("guestID");
                var applePayUrl = reqData.verifyUrl + "productId=" + productId + "&userID=" + userID;

                // 获得商品id，向苹果申请购买
                native.sendIAPReq(productId, applePayUrl);
                break;

            default:
                ToastSystemInstance.buildToast("支付类型错误");
                break;
        }
    },

    //运行桌子场景
    runTableScene: function (roomInfo) {


        var chairCount = roomInfo.chairCount;
        //加载资源
        cc.spriteFrameCache.addSpriteFrames("res/table/table.plist");




        var chairCount2Scene = {
            2: MPTable2Scene,
            3: MPTable3Scene,
            4: MPTable4Scene,
            5: MPTable5Scene,
            6: MPTable6Scene,
        };

        if (chairCount2Scene[chairCount] != null) {
            cc.director.pushScene(new chairCount2Scene[chairCount](roomInfo));
        }
        else {
            cc.log("没有合适的场景， 使用默认的");
            ToastSystemInstance.buildToast("没有合适的场景， 使用默认的");
            cc.director.pushScene(new MPBaseTableScene(roomInfo));
        }


    },

    //初始化特效配置
    initEffectConfig: function () {
        mpGD.subGameIcoEffect = {};
        mpGD.subGameIcoEffect[13] = "jincanbuyu.png.png";//金蚕捕鱼
        mpGD.subGameIcoEffect[352] = "danaotiangong.png.png";

        mpGD.subGameIcoEffect[1] = "errenniuniu.png.png";//二人平十
        mpGD.subGameIcoEffect[2] = "tongbiniuniu.png.png";//同比拼十
        mpGD.subGameIcoEffect[8] = "T3CardDefault.png";//赢三张
		mpGD.subGameIcoEffect[8] = "guayigua.png.png";//刮一刮
		


        mpGD.subGameIcoEffect[23] = "DouNiuDefault.png";//九线拉王
        mpGD.subGameIcoEffect[26] = "WaterMargin.png";//水浒传
        mpGD.subGameIcoEffect[14] = "DouNiuDefault.png";//水果转转
        mpGD.subGameIcoEffect[600] = "sangong.png.png";//三公

        mpGD.subGameIcoEffect[22] = "DouNiuDefault.png";//旋转汽车
        mpGD.subGameIcoEffect[25] = "BaiRenDefault_big.png";//多人拼十
        mpGD.subGameIcoEffect[24] = "feiqinzousou.png.png";//飞禽走兽
        mpGD.subGameIcoEffect[3] = "Baccarat.png";//欢乐三十秒
        mpGD.subGameIcoEffect[203] = "DouNiuDefault.png";//摇一摇
		mpGD.subGameIcoEffect[400] = "danaotiangong.png.png";//大闹天宫2
		
		mpGD.subGameIcoEffect[214] = "HongHeiDaZhan.png";
        mpGD.subGameIcoEffect[215] = "LongHuDou.png";

        mpGD.subGameIcoEffect[6] = "Classic_big.png";

        mpGD.subGameIcoEffect[700] = "MaJiangDefault.png";
    },

    //游戏初始化
    initialization: function () {
        this.initEffectConfig();

        mpGD.storage = new ClassStorage("PlazaData");

        if (!mpGD.storage.getValue("MP_SimpleUniqueKey")) {
            //简单的弄个唯一值， 让刷者成本增大点
            mpGD.storage.setValue("MP_SimpleUniqueKey", Date.now() + "" + Math.random());
        }

        native.setKeepScreenOn(true);
        //暂时
        // cc.sys.isMobile = true;

        mpGD.initSearchPaths = jsb.fileUtils.getSearchPaths();      //初始资源搜索目录

        //因为使用的是FIXED_WIDTH策略 所以winSize会被cocos改变   此处更新winSize
        if (cc.view.getResolutionPolicy() == cc.ResolutionPolicy.FIXED_WIDTH || cc.view.getResolutionPolicy() == cc.ResolutionPolicy.FIXED_HEIGHT) {
            mpV.w = cc.winSize.width;
            mpV.h = cc.winSize.height;
        }

        //mpGD.canReleaseListener = true;
///////////////////////////////////////////////////////////////////////////////////////////////////////
        //监听一下， 前后台切换消息
        var effectVolume = 1;
        var musicVolume = 1;

        cc.eventManager.addCustomListener("my_game_on_hide", function () {

            cc.log("my_game_on_hide");
            musicVolume = SoundEngine.getBackgroundMusicVolume();
            effectVolume = SoundEngine.getEffectsVolume();

            SoundEngine.setBackgroundMusicVolume(0);
            SoundEngine.setEffectsVolume(0);
            SoundEngine.setAllVolume(0);
        });
        cc.eventManager.addCustomListener("my_game_on_show", function () {
            cc.log("my_game_on_show");
            SoundEngine.setAllVolume(1);

            SoundEngine.setBackgroundMusicVolume(musicVolume);
            SoundEngine.setEffectsVolume(effectVolume);
        }.bind(this));
///////////////////////////////////////////////////////////////////////////////////////////////////////

        mpGD.netHelp = new NetHelp();

        mpGD.saNetHelper = new SANetHelper();

        if (!G_PLATFORM_TV) {
            mpGD.chatEventHelper = new ChatEventHelper();
        }


/////////////////////////////////////////////////////////////////////////////////////////////////////////
        // //检查是否有更新
        // this.checkUpdate();
////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //横屏尺寸
        mpGD.landscapeFrameSize = cc.sys.isNative ? cc.director.getOpenGLView().getFrameSize() : cc.winSize;
        //竖屏尺寸
        mpGD.portraitFrameSize = cc.size(mpGD.landscapeFrameSize.height, mpGD.landscapeFrameSize.width);


        //用户状态
        mpGD.userStatus = new MPPlayerState();
    },

    //切换屏幕
    switchScreen: function (requestedOrientation, designResolutionSize, resolutionPolicy) {


        requestedOrientation = requestedOrientation == null ? native.SCREEN_ORIENTATION_LANDSCAPE : requestedOrientation;
        designResolutionSize = designResolutionSize || cc.size(mpV.w, mpV.h);
        resolutionPolicy = resolutionPolicy == null ? cc.ResolutionPolicy.SHOW_ALL : resolutionPolicy;

        var frameSize;
        if (requestedOrientation == native.SCREEN_ORIENTATION_LANDSCAPE) {
            frameSize = mpGD.landscapeFrameSize;
        }
        else {
            frameSize = mpGD.portraitFrameSize;
        }
        native.setRequestedOrientation(requestedOrientation);
        cc.view.setFrameSize(frameSize.width, frameSize.height);
        cc.view.setDesignResolutionSize(designResolutionSize.width, designResolutionSize.height, resolutionPolicy);

        if (resolutionPolicy == cc.ResolutionPolicy.SHOW_ALL) {
            native.autoFillScreen(designResolutionSize);
        }
    },


    //运行主场景
    runMainScene: function () {
        cc.log("runMainScene");
        //先加载所需要的资源
        this.loadHallSpriteFrames();
        var mainScene = new MPMainScene();

        cc.director.runScene(mainScene);

    },

    //运行登录场景 isAccount表示是否帐号登录界面
    runLoginScene: function (disconnect) {
        cc.log("runLoginScene");

        var loginScene = new MPLoginScene(disconnect);
        //loginScene = new cc.TransitionCrossFade(0.1, loginScene);
        cc.director.runScene(loginScene);

        var version = native.getVersion();

        if (GNativeInfo.ANDROIDVerison == null)
            GNativeInfo.ANDROIDVerison = 0;

        if (GNativeInfo.WINDOWSVerison == null)
            GNativeInfo.WINDOWSVerison = 0;

        if (cc.sys.os == cc.sys.OS_ANDROID && version < 20170908 || cc.sys.os == cc.sys.OS_WINDOWS && version < 20170908) {
            var channel = native.getUmengChannel();
            var url = officialWebsite + "?channel=" + channel;
            var linkTitle = "点击跳转 " + officialWebsite;

            // if (cc.sys.os == cc.sys.OS_ANDROID) {
            //     url = xxx;
            //
            //     linkTitle = "点击下载新版本";
            // }

            var context = "\n\n\n\n您的版本较低，检测到官网有新版本可以下载\n\n";
            // var context = "\n\n\n\n您当前版本已停止维护，请到官网下载新版本\n\n";

            new MPSystemNoticeLayer({
                announcement: context,
                link: url,
                linkTitle: linkTitle,
                // callback: mpApp.closePlaza
            }).to(loginScene);
        }
    },


    //运行加载资源场景
    runLoadingScene: function () {
        cc.log("runLoadingScene");
        cc.director.runScene(new MPLoadingScene(mpg_resources, this.runLoginScene.bind(this)));
    },
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //加载子游戏js文件
    loadSubGameJsFiles: function (moduleID, callback, errcallback) {
        //console.log("loadSubGameJsFiles " + mpGD.subGameInfoMap[moduleID].status);

        if (mpGD.subGameInfoMap[moduleID].status == mpSubGameStatus.Ready) {

            mpGD.mainScene.subGameIconMap[moduleID].setStatus(mpSubGameStatus.Loading);

            if (cc.sys.isNative) {
                var searchPaths = mpGD.subGameInfoMap[moduleID].searchPaths;

                console.log("searchPaths === " + searchPaths);
                console.log("subgame jsname == " + mpGD.subGameInfoMap[moduleID].loadGameJsPath);

                jsb.fileUtils.setSearchPaths(searchPaths);

                cc.loader.loadJs(mpGD.subGameInfoMap[moduleID].loadGameJsPath, function () {
                    console.log("load start jsListGame");
                    cc.loader.loadJs(jsListGame, function () {
                        console.log("load finish jsListGame");
                        callback && callback();
                    })
                });
            }
            else {
                var name = mpGD.subGameInfoMap[moduleID].resName;
                var classify = this.getClassify(name);

                if (true) {
                    var url = location.href;
                    var index = url.indexOf("?");
                    if (index != -1)
                        url = url.substring(0, index);

                    url = url.replace(/:[0-9]+/gi, "");

                    var searchPaths = url + "/../../../subgame/" + name + "/Client/";
                    if(classify != "")
                        searchPaths = url + "/../../../" + classify + name + "/Client/";

                    cc.loader.resPath = searchPaths;

                    cc.loader.loadJs(searchPaths, mpGD.subGameInfoMap[moduleID].loadGameJsPath, function () {
                        cc.loader.loadJs(searchPaths, jsListGame, function () {
                            cc.LoaderScene.preload(g_resources, function () {
                                callback && callback();
                            });
                        })
                    });
                }
                else {
                    // var searchPaths = "../subgame/" + classify + name;
                    var searchPaths = "../../subgame/" + classify + name + "/Client/publish/html5/";

                    cc.loader.resPath = searchPaths;

                    cc.loader.loadJs(searchPaths, "game.min.js", function () {
                        cc.LoaderScene.preload(g_resources, function () {
                            callback && callback();
                        });
                    })
                }
            }
        }
        else {
            native.toast("子游戏未准备好");
            errcallback && errcallback();
        }
    },


    /**
     * 清除子游戏所加载的JS文件
     * @param moduleID
     */
    clearSubGameJsFiles: function (moduleID) {
        console.log("clearSubGameJsFiles " + moduleID);

        jsb.fileUtils.setSearchPaths(mpGD.subGameInfoMap[moduleID].searchPaths);

        if (!cc.sys.isNative)
            __cleanScript = cc.sys.cleanScript;

        for (var i = 0; i < jsListGame.length; ++i) {
            __cleanScript(jsListGame[i]);
        }
        __cleanScript(mpGD.subGameInfoMap[moduleID].loadGameJsPath);

        this.resetSearchPaths();

        if (!cc.sys.isNative)
            cc.loader.resPath = "";
    },

    /**
     * 载入子游戏
     * @param moduleID
     */
    loadSubGame: function (moduleID, ip, port) {
        //相当于显示一个遮罩层

        //发送子游戏状态
        mpGD.mainScene.subGameIconMap[moduleID].setStatus(mpSubGameStatus.Playing);

        
        var config = app.getConfig && app.getConfig();
        //
        //
        config = config || {};
        config.designResolutionSize = config.designResolutionSize || (cc.size(mpV.h, mpV.w));
        // //切换成子游戏所要求的模式
        this.switchScreen(config.requestedOrientation, config.designResolutionSize, config.resolutionPolicy);
        ////////////////////////////////////////////////////////////////
        cc.log("加载子游戏\t" + moduleID);

        mpGD.userStatus.isPlaying = true;         //当前正在玩游戏

        SoundEngine.stopAll();


        // ttutil.dump({userID: mpGD.userInfo.UserID, ip: ip, port: port});


        //往场景树里 推入一空场景， 防止 子游戏 把  大厅场景给覆盖了。

        //mpGD.canReleaseListener = false;
        var scene = new cc.Scene();
        cc.director.pushScene(scene);


        //要在下一帧， 要不 退回来 原场景的动作都会停掉
        scene.runAction(cc.callFunc(function () {

            // if (cc.game.config.debugMode)
            ip = mpApp.getSubGameIP();

            app.runMain(mpGD.userInfo.userID, ip, port, mpGD.userInfo.uuid);
        }))


    },

    //关闭大厅
    closePlaza: function () {
        mpGD.storage.flush();
        cc.director.end();
    },

    //当跟协调服的网络意外断开
    unexpectedDisconnect: function () {

        if (!cc.director.getRunningScene()) {
            return;
        }

        if (mpGD.userStatus.isPlaying || mpGD.userStatus.moduleID || mpGD.userStatus.roomID) {
            mpApp.forceStopSubGame();

            mpApp.comeToLogon(true);
            // //在桌子 场景
            // if (mpGD.userStatus.roomID) {
            //
            // }
            //
            // //要等待一下， 因为场景切换需要两帧,
            // mpGD.mainScene.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
            //     mpApp.comeToLogon(true);
            // })))

        }
        else {
            if (mpGD.mainScene) {
                if (cc.director.getRunningScene()) {
                    mpApp.comeToLogon(true);
                }

            }

        }
    },

    /**
     * 退出游戏模块
     */
    exitGameModules: function () {

        //自己给自己发个消息。。。。， 因为scene如果不是当前场景
        mpGD.mainScene.runAction(cc.callFunc(function () {
            cc.eventManager.dispatchCustomEvent(mpEvent.ExitGameModules);
        }));


    },

    //子游戏调用这个回到 大厅
    comeToPlaza: function () {

        native.toast("回到大厅", native.toastLengthLong);

        SoundEngine.stopAll();

        //这边跟子游戏有约定， 子游戏如果有调用 pushScene, 那么跟调用popScene次数要一样.
        cc.director.popScene();

        // //切换为横屏, 放在  BaseRoomScene里面了
        // this.switchScreen(native.SCREEN_ORIENTATION_LANDSCAPE, cc.size(mpV.w, mpV.h), cc.ResolutionPolicy.FIXED_HEIGHT);


        mpGD.mainScene.subGameIconMap[mpGD.userStatus.moduleID].setStatus(mpSubGameStatus.Ready);
        mpGD.userStatus.isPlaying = false;         //当前正在玩游戏
        if (mpGD.userStatus.cheatProof) {
            // //发送退出房间消息
            mpGD.netHelp.requestLevelRoom(mpGD.userStatus.roomID);
            mpGD.userStatus.roomID = null;
        }
        else {

        }


    },


    /**
     * 调用子游戏的房间场景
     * @param moduleID
     * @param roomInfoArray
     */
    runSubGameRoomScene: function (moduleID, roomInfoArray) {

        mpGD.userStatus.moduleID = moduleID;
        //这边    最重要的其实是  app.runRoomScene(), 只要这个return true， 下面的代码就不会执行了, 就全交给子游戏 了
        if (!app || !app.runRoomScene || !app.runRoomScene(moduleID, roomInfoArray)) {

        
            if (roomInfoArray && roomInfoArray.length > 0) {
            
                var scene = new MPBaseRoomScene(moduleID, roomInfoArray);
                cc.director.pushScene(scene);


                //要让他在下一帧执行， 要不 showWaitLayer会被加在当前场景， 但removeWaitLayer, 却去删除另一个场景的WaitLayer
                scene.runAction(cc.callFunc(function () {
                    //模拟点击第一个房间
                    scene.onEnterGameRoom({
                        getUserData: function () {
                            return roomInfoArray[0];
                        }
                    });
                    //标志场景是会自动跳转到子游戏的
                    scene.markAutoEnterGame();
                }));


            }
            else {

                //清状态
                mpGD.mainScene.subGameIconMap[moduleID].setStatus(mpSubGameStatus.Ready);
                //清加载的js文件
                mpApp.exitGameModules();
                ToastSystemInstance.buildToast("没有可进入的房间");
            }
        }

    },

    /**
     * 清除所有未使用的资源
     */
    clearAllRes: function () {
        ClassPool.drainAllPools();
        cc.pool.drainAllPools();


        //这鬼东西不能清？？
        ccs.armatureDataManager.clear();

        if (cc.sys.isNative) {
            cc.spriteFrameCache.removeUnusedSpriteFrames();
            cc.director.getTextureCache().removeUnusedTextures();
        }
        else {
            if (typeof g_resources != "undefined") {
                for (var key in cc.textureCache._textures) {
                    if (g_resources.indexOf(key) == -1)
                        continue;

                    cc.spriteFrameCache.removeSpriteFramesFromTexture(cc.textureCache._textures[key]);
                    cc.textureCache._textures[key].releaseTexture();

                    delete cc.textureCache._textures[key];
                }

                for (var key in cc.spriteFrameCache._frameConfigCache) {
                    if (g_resources.indexOf(key) == -1)
                        continue;

                    delete cc.spriteFrameCache._frameConfigCache[key];
                }

                for (var i in g_resources) {
                    cc.loader.release(g_resources[i]);
                }
            }
        }
    },

    comeToLogon: function (disconnect) {
        //因为这边是从子游戏回来， 所以要重新加载大厅的资源
        this.clearAllRes();
        //
        this.loadHallSpriteFrames();

        this.resetSearchPaths();


        cc.director.popToRootScene();

        //不能马上换场景， 因为有可能当前不是大厅场景， 调用 popToRootScene会切换场景， 切换场景需要两帧
        mpGD.mainScene.runAction(cc.callFunc(function () {
            var loginScene = new MPLoginScene(disconnect);

            cc.log("回到登录场景");
            //此时只有一个大厅场景，大厅场景会被出栈，运行登录场景
            cc.director.runScene(loginScene);
        }));


    },

    //重置一下资源搜索目录
    resetSearchPaths: function () {
        //把资源搜索目录设置回去， 还大厅一个清静
        jsb.fileUtils.setSearchPaths(mpGD.initSearchPaths);
    },
    //加载大厅spriteFrames
    loadHallSpriteFrames: function () {

        console.log("loadHallSpriteFrames");

        if (!cc.sys.isNative)
            cc.loader.resPath = "";

        

        if (GNativeInfo.plazaSceneType == 1) {
            //主界面的老虎机， 捕鱼那些
/*            //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/fenleitubiaodonghua_dating/1/fenleitubiaodonghua_dating.ExportJson");
            //游戏分类大厅
            //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/youxiliebiao_yunding/yund_gai_02.ExportJson");
            //充值按钮
            //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/chongzhitexiao/zhujiemiantubiaodonghua_yunding.ExportJson");
            //充值+
            //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/zhujiemianJia/yund_gai_01.ExportJson");

            //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/zhujiemiandonghua_yunding/zhujiemiandonghua_yunding.ExportJson");*/
        }
        else {
            //主界面的老虎机， 捕鱼那些
/*            //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/fenleitubiaodonghua_dating/fenleitubiaodonghua_dating.ExportJson");
            //游戏分类大厅
            //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/youxifenlei_dating/youxifenlei_dating.ExportJson");*/
        }

        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/588/ui_jinbi/ui_jinbi.json");

        // var jinbiEffect = ccs.load("res/effect/588/ui_jinbi/ui_jinbi.json");


        //充值按钮
        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/chongzhitexiao/chongzhitexiao.ExportJson");

        //粒子特效
        //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/gerenzhongxinjushu_shoujiban/gerenzhongxinjushu_shoujiban.ExportJson");

        //箭头动画
        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/jiantoudonghuagonggao_2jijiemian/jiantoudonghuagonggao_2jijiemian.ExportJson");

        //商城
        //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/shangchengtubiao_dating/shangchengtubiao_dating.ExportJson");

        //升级效果
        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/shengjixiaoguo_dating/shengjixiaoguo_dating.ExportJson");

        //提示取出
        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/tishiqukuan_dating/tishiqukuan_dating.ExportJson");

        //vip大厅
        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/vip_dating/vip_dating.ExportJson");


        //游戏图标闪光
        //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/youxitubiaosaoguang_dating/youxitubiaosaoguang_dating.ExportJson");
        //在线奖励
        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/hall/zaixianjiangli_dating/zaixianjiangli_dating.ExportJson");

        //选择头像框的那个亮亮的
        //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/common/xuanzhongtexiao_2jijiemian/xuanzhongtexiao_2jijiemian.ExportJson");

        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/common/2jijiemiantexiao_dating/2jijiemiantexiao_dating.ExportJson");
        // //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/common/choumaxuanzhongguangxiao_shoujiban/choumaxuanzhongguangxiao_shoujiban.ExportJson");

        //排行 榜
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_hongbao.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_activity.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_animation.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_bind_bank.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_bind_zfb.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_charge.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_charge_bg.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_charge_btn.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_common.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_download.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_exchange.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_game_icon.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_generalize.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_help.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_loading.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_login.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_mail.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_proxy.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_rank.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_report.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_reward.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_safebox.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_setting.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_shell.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_ui.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/hall_user_info.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/head.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/BigHead.plist");

        cc.spriteFrameCache.addSpriteFrames("res/images/game_icon_2.plist");
        cc.spriteFrameCache.addSpriteFrames("res/images/nopack/hall_btn/ZJM_chuxian.plist");
        cc.spriteFrameCache.addSpriteFrames("res/allcommon/common.plist");
        cc.spriteFrameCache.addSpriteFrames("res/comexit/comexit.plist");

        cc.spriteFrameCache.addSpriteFrames("res/room/room.plist");

    },

    /**
     * 绑定back键事件
     * @param scene
     * @param callback
     */
    bindBackButtonEvent: function (scene, callback, content) {
        var eventListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {

                switch (code) {
                    case cc.KEY.back:
                    case cc.KEY.escape:
                        if (scene.gameTypeBox != null && !scene.gameTypeBox.isVisible()) {
                            scene.gotoGameType();
                        }
                        else {
                            if(mpGD.netHelp == null)
                                cc.director.end();
                            else
                                new MPMessageBoxLayer("通知", content || "您确定要退出吗？", mpMSGTYPE.MB_OKCANCEL, callback || mpApp.closePlaza, function () {}).to(cc.director.getRunningScene(), 10000);

                            // var reloadJS = [
                            //     "src/main/module/MPBaseModuleLayer.js",
                            //     "src/main/module/MPSettingLayer.js",
                            //     "src/main/module/MPVipConfigLayer.js",
                            //     "src/main/module/MPMessageLayer.js",
                            //     "src/main/module/MPBankLayer.js",
                            //     "src/main/module/MPShopLayer.js",
                            //     "src/main/module/MPCoinDetailLayer.js",
                            //     "src/main/module/MPRechargeLayer.js",
                            //     "src/main/module/MPGoodsLayer.js",
                            //     "src/main/module/MPRankLayer.js",
                            //     "src/login/MPRegisterLayer.js",
                            //     "src/login/MPLoginLayer.js",
                            //     "src/main/module/activity/MPActivityLayer.js",
                            //     "src/main/module/MPPersonalCenterLayer.js",
                            //     "src/main/MPMainScene.js",
                            //     "src/main/module/MPTellerLayer.js",
                            //     "src/main/module/MPBankInputPasswordLayer.js",
                            //     "src/main/module/MPSafeMobileLayer.js",
                            //     "src/main/module/MPSettingPasswordLayer.js",
                            //     "src/login/MPShowProtocol.js",
                            //     "src/layer/MPFindPasswordLayer.js",
                            //     "src/layer/MPCodeLayer.js",
                            //     "src/extend/MPMessageBoxLayer.js"
                            //
                            // ];
                            //
                            // for (var index = reloadJS.length - 1; index >= 0; index--)
                            // {
                            //     cc.sys.cleanScript(reloadJS[index]);
                            //     cc.loader.loadJs(reloadJS[index]);
                            // }

                        }
                        break;
                }
            },
        });

        cc.eventManager.addListener(eventListener, scene);

        return eventListener;
    },

    //强制关掉子游戏， 主要应用在子游戏中被别人强登录
    forceStopSubGame: function () {

        //如果子游戏没提供该方法， 则关掉整个大厅, 该方法要关掉自己的跟子游戏服务端的 socket链接
        if (typeof app != "undefined" && app.closeSubGame) {
            app.closeSubGame();//里面会调用  comeToPlaza
            //this.comeToPlaza();
        }
        else {
            this.closePlaza();
        }

    },

    handleSensitiveWord: function (text) {
        return text && text.replace(/银商/g, "*商").replace(/(买|卖|冲|充|退|收|售|上|下)分/g, "*分");
    },

    /**
     * 获取大厅的url
     */
    getHallURL: function () {

        if (mpNetConfig.url instanceof Array) {
            if (!mpNetConfig.url[mpGD.agentID]) {
                mpGD.agentID = 0;
            }

            return mpNetConfig.url[mpGD.agentID];
        }

        return mpNetConfig.url;
    },

     /**
     * 获取子游戏ip
     */
    getSubGameIP: function () {

        var hallURL = this.getHallURL()

        var newstr = hallURL.replace('ws://','');


        newstr = newstr.split(":")

        return newstr[0]
    },

    /**
     * 获取sa服url
     */
    getSaURL: function () {

        if (mpNetConfig.cbURL instanceof Array) {
            return mpNetConfig.cbURL[mpGD.agentID];
        }

        return mpNetConfig.cbURL;
    },

    /**
     * 更新前端ID
     */
    updateAgentID: function () {

        //如果是数组则 agent ID
        if (mpNetConfig.url instanceof Array) {
            var length = mpNetConfig.url.length;
            mpGD.agentID = (mpGD.agentID + 1) % length;
        }
    },

    /**
     * 获取上一次登录的agent
     */
    initAgentID: function () {
        var agentInfo = mpGD.storage.getValue("agentInfo");
        var saveTime = 5 * 24 * 60 * 60 * 1000;

        //缓存5天
        if (!agentInfo || typeof agentInfo.agentID != "number" || (Date.now() - agentInfo.time > saveTime)) {
            mpApp.saveLocalAgentID(0);
            agentInfo = {agentID: 0};
        }

        mpGD.agentID = agentInfo.agentID;
    },

    /**
     * 一个对象 {agentID: x,  time: x} agentID号 和 time过期时间
     * @param agentInfo
     */
    saveLocalAgentID: function (agentID) {
        if (typeof agentID != "number") agentID = 0;

        var agentInfo = mpGD.storage.getValue("agentInfo");

        var saveTime = 5 * 24 * 60 * 60 * 1000;

        var needSave = false;

        if (agentInfo) {
            if (agentInfo.agentID != agentID || (Date.now() - agentInfo.time > saveTime)) {
                agentInfo.agentID = agentID;
                agentInfo.time = Date.now();
                needSave = true;
            }
        } else {
            agentInfo = {};
            agentInfo.agentID = agentID;
            agentInfo.time = Date.now();
            needSave = true;
        }

        needSave && mpGD.storage.setValue("agentInfo", agentInfo, true);
    },

    openCustomerService: function () {

        var qq = "4241061";

        // var url = "mqqwpa://im/chat?chat_type=wpa&uin=" + qq;

        var context = "鉴于存在骗子冒充我司客服欺诈用户\n\n" +
            "为了更好维护您的权益\n\n" +
            "请认准官方唯一客服公众号：" + productName + "\n\n" +
            "可以在公众号反馈您的问题，关注公众号参与每日抽奖\n\n" +
            "感谢您的关注， 祝你游戏愉快\n";

        // if (!cc.sys.isMobile)
        //     url = "http://sighttp.qq.com/msgrd?v=3&uin=" + qq + "&site=&menu=yes";

        var kefuLayer = new MPBaseModuleLayer({}).to(cc.director.getRunningScene());
        kefuLayer.titleBG.hide();
        kefuLayer.bgSprite.size(1100,620);
        kefuLayer.backBtn.p(1050,570);

        // var bg = new ccui.Scale9Sprite();
        // bg.initWithSpriteFrameName("frame_bg.png");
        // bg.size(1130, 390).to(kefuLayer).pp(0.5,0.51);

        var content = new cc.Sprite("res/kefu_bg.png").to(kefuLayer).pp(0.5,0.465).qscale(0.68);
        new cc.Sprite("res/2weima.jpg").to(kefuLayer).pp(0.3,0.627 - 0.035).qscale(0.81);

		new cc.LabelTTF("官方网站：086.fa256.cn", GFontDef.fontName, 26).to(kefuLayer).pp(0.58,0.72 - 0.035);
        new cc.LabelTTF("公众号名称：588电玩中心", GFontDef.fontName, 26).to(kefuLayer).pp(0.58,0.62- 0.035);
          //desc.setColor(cc.color(255, 196, 96));
          var copyBtn = new ccui.Button("res/copy.png", "", "", ccui.Widget.LOCAL_TEXTURE);
            copyBtn.to(kefuLayer).pp(0.78,0.72- 0.035);
            copyBtn.addClickEventListener(() => {
                native.setClipboard("086.fa256.cn");
				//new MPMessageBoxLayer("通知", "复制完成", mpMSGTYPE.MB_OK, null).to(kefuLayer);
				ToastSystemInstance.buildToast("内容已经复制到剪切板中");
            });
            var copyGZHBtn = new ccui.Button("res/copy.png", "", "", ccui.Widget.LOCAL_TEXTURE);
            copyGZHBtn.to(kefuLayer).pp(0.78,0.62- 0.035);
            copyGZHBtn.addClickEventListener(() => {
                native.setClipboard("588电玩中心");
				//new MPMessageBoxLayer("通知", "复制完成", mpMSGTYPE.MB_OK, null).to(kefuLayer);
				ToastSystemInstance.buildToast("内容已经复制到剪切板中");
            });
    }
};

