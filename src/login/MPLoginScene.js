/**
 * Created by 真心科技 on 2016/1/28.
 */


/**
 * 登录场景
 */
var MPLoginScene = MPFocusLoginScene.extend({
// var MPLoginScene = cc.Scene.extend({
    baseHallLayer: null,
    loginLayer: null,

    guestBtn: null,         //游客按钮
    accountBtn: null,       //登录按钮
    serviceBtn: null,       //客服按钮
    registerBtn: null,       //注册按钮

    sceneName: "LoginScene",         // 当前场景的名字
    //waitLayer: null,                // 等待层

    umDuration: null,     //友盟统计， 使用时长

    loginType: null,


    isSavePassword: true,       //是否保存密码

    _className: "MPLoginScene",
    _classPath: "src/login/MPLoginScene.js",

    ctor: function (disconnect) {

        var exPath = GNativeInfo.loginSceneType;
                                            
        //加载登录场景所需要的资源
        //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/startup/denglujiemian_yunding/denglujiemian_yunding.ExportJson");

        ccs.armatureDataManager.addArmatureFileInfo("res/effect/startup/zhucheshaiziyaodong_dating/zhucheshaiziyaodong_dating.ExportJson");

        // if (GNativeInfo.loginSceneType == 3) {
        //     //加载那条大鱼的骨骼信息
        //     //del_animation  ccs.armatureDataManager.addArmatureFileInfo("res/effect/startup/denglujiemiantexiao_shoujiban/buyudashi" + ".ExportJson");
        // }

        mpApp.loadHallSpriteFrames();


        this._super();
        this.initEx(disconnect);


        //SoundEngine.playBackgroundMusic("res/sound/dz_hall_background_music.mp3", true);

        // this.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(function () {
        //     SoundEngine.stopBackgroundMusic();
        // })))

        // this.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
        //     new MPCodeLayer().to(cc.director.getRunningScene(), 1000);
        // })))



    },
    onEnter: function () {

        this._super();
        mpGD.netHelp.addNetHandler(this);

        // 连接服务端成功之前，不能让玩家点击，不然会出现bug，显示正在连接，可以阻止玩家点击。连接成功后去掉该提示
        if (!mpGD.netHelp.isConnect && mpGD.isLaunching) {
            mpApp.showWaitLayer("正在连接....");
            // this.waitLayer = new MPWaitLayer("正在连接....", null, null).to(this, 999999999);
        }

        //切换成大厅的分辨率
        mpApp.switchScreen(native.SCREEN_ORIENTATION_LANDSCAPE, cc.size(mpV.w, mpV.h), mpV.ResolutionPolicy);
        //运行到这， mpGD.mainScene应该已经被释放了， 所以要把mpGD.mainScene置 为空
        //如果放在mainScene的onExit里面， 运行子游戏时， onExit也会被 执行， 而此时mainScene还存在着， 会造成错误， 所以要放在这
        mpGD.mainScene = null;
        this.umDuration = Date.now();

        if (mpGD.netHelp.isConnect && mpGD.isLaunching){
            console.log("已经连接上了");
            this.runAction(cc.callFunc(()=>{
                this.autoLogin();
            }));
        }

    },

    onExit: function () {
        this._super();

        mpGD.netHelp.removeNetHandler(this);
        mpGD.loginScene = null;
    },
    initEx: function (disconnect) {
        mpGD.loginScene = this;


        //this.createTvFinger();
        this.initGui();

        //下一帧执行, 要不当前 runningScene不是本场景
        var self = this;
        this.runAction(cc.callFunc(function () {
            if (disconnect) {
                new MPMessageBoxLayer("通知", "网络连接已经断开, 点击重新连接", mpMSGTYPE.MB_OK, self.reconnect.bind(this)).to(self);
//                native.showConfirmDialog("通知", "网络连接已经断开, 点击重连", );
            }
        }));

        // var qrcodeBtn = this.qrcodeBtn = new FocusButton("scan_button_lv.png", "", "", ccui.Widget.PLIST_TEXTURE);
        // qrcodeBtn.to(this).pp(0.13, 0.9);
        // qrcodeBtn.addClickEventListener(() => {
        //     new QRCodeLayer().to(this);
        // });
        // !G_OPEN_QRCODE_SCANNER && qrcodeBtn.hide();

        //(forReview || !G_OPEN_QRCODE_SCANNER) && new cc.Sprite("res/login/youxizhonggao.jpg").to(this).pp(0.125, 0.85);
    },

    //事件
    onNetEvent: function (event, data) {
        console.log("loginMsg:" + event);
        switch (event) {
            case mpNetEvent.SystemConfig:
                GSystemConfig = data;

                if (GSystemConfig.maintenance != 0) {
                    new MPMessageBoxLayer("通知", data, mpMSGTYPE.MB_OK, function () {
                        cc.director.getRunningScene().runAction(cc.sequence(cc.delayTime(20), cc.callFunc(function () {
                            mpApp.closePlaza();
                        })))
                    }).to(cc.director.getRunningScene());
                }

                break;
            case mpNetEvent.WXWebLoginAddr:
                mpApp.removeWaitLayer();

                if (data.errMsg) {
                    return;
                }

                new WebViewLayer(data.url).to(this);
                break;
            case mpNetEvent.WXLoginCode:
                _webViewInstance && _webViewInstance.close();

                if (data.errMsg) {
                    return;
                }

                this.onWxLogin(data.code, data.isWeb);

                break;
            case mpNetEvent.VerifyUser:

                mpApp.removeWaitLayer();

                if (data.errMsg) {
                    //已经绑定手机， 请验证手机
                    if (data.errCode == 1) {
                        mpApp.loadHallSpriteFrames();
                        mpGD.userInfo.phone = data.phone;
                        new MPSafeMobileLayer(MPSafeMobileLayer.VerifySafeMobile, MPSafeMobileLayer.VerifyLogin).to(cc.director.getRunningScene());
                    }
                    return;
                }

                if (data && !data.errCode) {
                    mpApp.updateUserInfo(data);

                    ToastSystemInstance.buildToast("登录成功");

                    native.loginEvent(data.userID);

                    if (this.loginType == mpLoginType.Account) {

                        mpGD.storage.setValue("moorMachine", mpGD.userInfo.moorMachine);
                        if (this.isSavePassword) {
                            mpGD.storage.setValue("account", mpGD.userInfo.account);
                            mpGD.storage.setValue("pwd", mpGD.userInfo.password);
                            mpGD.storage.flush();
                        }
                        else {
                            // mpGD.storage.delKey("account");
                            // mpGD.storage.delKey("pwd");
                            // mpGD.storage.flush();
                        }
						
                    }
                    else if (this.loginType == mpLoginType.GuestID) {
                        if (data.guestID) {
                            mpGD.storage.setValue("guestID", data.guestID, true);
                            mpGD.saveLoginArgs = {guestID: data.guestID}

                        }
                    }
                    mpGD.storage.setValue("loginType",this.loginType);

                    //暂停手指
                    this.getScene().pauseFocus();
                    mpApp.runMainScene();

                    //登录成功后就开始登录广播服务器了
                    mpGD.saNetHelper.requestLogin();
                    //设置登录状态 
                    mpGD.netHelp.setLoginStatus(true);


                    //console.log("mpGD.userInfo.=========="+mpGD.userInfo.proxyid);
                    //console.log("mpGD.userInfo.dailiID====aaaaaaaaa======"+mpGD.userInfo.dailiID);
					
					//登录成功后请求一下自己的推广链接地址
					//mpGD.netUtil.getUrlShort(mpGD.userInfo.userID);

                }
                else {
                    if (data.errCode == 1) {
                        //#1表示账号被机器锁定
                        //#2表示账号密码错误

                        ToastSystemInstance.buildToast("账号被机器锁定");
                        cc.log("账号被机器锁定");
                    }
                    else if (data.errCode == 2) {

                        if (data.loginType == mpLoginType.GuestID) {

                            cc.log("原本的游客登录失败， 现在换成新的游客再试一次");

                            //如果是游客登录且提示账号密码错误， 则xx了。。
                            mpGD.storage.delKey("guestID");
                            this.onGuestLogin();

                        }
                        else {
                            ToastSystemInstance.buildToast("账号密码错误");
                            cc.log("账号密码错误");
                        }

                    }

                }
                break;
            case mpNetEvent.ScanQRLogin:
                mpApp.removeWaitLayer();

                if (data.errMsg) {
                    return;
                }

                mpGD.netHelp.requestLogin({userID: data.userID, socketID: data.socketID});
                mpApp.showWaitLayer();

                break;
            case "connect":
                this.autoLogin();
                break;
            case "disconnect":
                new MPMessageBoxLayer("通知", "网络连接已经断开, 点击重新连接", mpMSGTYPE.MB_OK, this.reconnect.bind(this)).to(this);
                break;
        }
    },

    autoLogin:function () {
        mpGD.isLaunching = false;
        // this.waitLayer && this.removeChild(this.waitLayer);
        mpApp.removeWaitLayer();
        ToastSystemInstance.buildToast("连接成功");
        mpGD.netHelp.requestSystemConfig();
        var loginType = mpGD.storage.getValue('loginType');
        if (loginType != null && loginType == mpLoginType.GuestID){
            this.loginType = loginType;
            var guestID = mpGD.storage.getValue("guestID");
            mpGD.netHelp.requestLogin({guestID: guestID});
            mpApp.showWaitLayer();
        }else if (loginType != null && loginType == mpLoginType.Account){
            this.loginType = loginType;
            this.isSavePassword = true;
            mpGD.userInfo.account = mpGD.storage.getValue("account");
            mpGD.userInfo.password = mpGD.storage.getValue("pwd");
            mpGD.netHelp.requestLogin({
                account: mpGD.storage.getValue("account"),
                password: mpGD.storage.getValue("pwd"),

            });
            mpApp.showWaitLayer();
        }
    },
    initGui: function () {

        this.size(mpV.w, mpV.h);

        var exPath = GNativeInfo.loginSceneType;

        // new cc.Sprite("res/gui/login/gui-Login-background.jpg").to(this).pp();
        // let bgNode = new cc.Node();
        // bgNode.to(this).pp(0,0);
        // sp.SkeletonAnimation.createWithJsonFile("res/effect/588/ui_shangcheng/ui_shangcheng.json", "res/effect/588/ui_shangcheng/ui_shangcheng.atlas", 1);
        //背景
        var bgSprite = new cc.Sprite('res/images/nopack/hall_bg_login.png').to(this).pp(0.5,0.5);
        bgSprite.height = 750;

        //背景骨骼动画
        let bgEffect = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/login_girl/DLJM_Char.json", "res/images/nopack/spine_animation/login_girl/DLJM_Char.atlas", 1);
        bgEffect.setAnimation(0, "idle", true);
        bgEffect.to(this).p(667,375);

        let bgEffect2 = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/login_girl/DLJM_Floor.json", "res/images/nopack/spine_animation/login_girl/DLJM_Floor.atlas", 1);
        bgEffect2.setAnimation(0, "idle", true);
        bgEffect2.to(this).p(667,325);

        var logo = new cc.Sprite("res/images/nopack/"+imagesPre+"_logo.png").to(this).pp();

        // cc.spriteFrameCache.addSpriteFrames("res/plaza1v1/animation/coconut_tree.plist");
        // cc.spriteFrameCache.addSpriteFrames("res/plaza1v1/animation/coconut_leaf.plist");
        //
        // //树
        // this.aniFrames = [];
        // var count = 1;
        // var nextFrame = cc.spriteFrameCache.getSpriteFrame('coconut_tree' + count + ".png");
        // while (nextFrame) {
        //     this.aniFrames.push(nextFrame);
        //     count++;
        //     nextFrame = cc.spriteFrameCache.getSpriteFrame('coconut_tree' + count + ".png");
        // }
        //
        // var tree = new cc.Sprite(this.aniFrames[0]);
        // tree.to(this).anchor(0,0.6).p(0,mpV.h / 2 + 100);
        //
        // var animation = cc.Animation(this.aniFrames, 0.15);
        // var animate = cc.Animate(animation);
        // var action = animate.repeatForever();
        //
        // tree.runAction(action);
        //
        // //树叶
        // this.aniFrames2 = [];
        // var count = 1;
        // var nextFrame2 = cc.spriteFrameCache.getSpriteFrame('coconut_leaf' + count + ".png");
        // while (nextFrame2) {
        //     this.aniFrames2.push(nextFrame2);
        //     count++;
        //     nextFrame2 = cc.spriteFrameCache.getSpriteFrame('coconut_leaf' + count + ".png");
        // }
        //
        // var leaf = new cc.Sprite(this.aniFrames2[0]);
        // leaf.to(this).anchor(1,1).p(mpV.w,mpV.h);
        //
        // var animation2 = cc.Animation(this.aniFrames2, 0.15);
        // var animate2 = cc.Animate(animation2);
        // var action2 = animate2.repeatForever();
        //
        // leaf.runAction(action2);


        // let bottomBg = cc.Sprite("res/gui/newPlaza/buttom_bar.jpg");
        // bottomBg.anchor(0.5, 0).to(this).pp(0.5, 0);

        if (exPath != "") {
            //界面特效
            // var armature1 = new ccs.Armature("denglujiemiantexiao_shoujiban");
            // armature1.getAnimation().play("Animation1");
            // armature1.p(mpV.w / 2, mpV.h / 2);
            // this.addChild(armature1);
        }

        // var loginTitle = new ccs.Armature("denglujiemian_yunding").to(this).pp();
        // loginTitle.getAnimation().play("Animation11");


        //除了1外  其它样式的登录场景都用 0那些按钮
        if (GNativeInfo.loginSceneType != 0 && GNativeInfo.loginSceneType != 1) {
            exPath = "";
        }

        //游客按钮
        this.guestBtn = new FocusButton("login_btn_guest.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.15);

        //登录按钮
        this.loginBtn = new FocusButton("login_btn_account.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.3);

        //
         this.wxBtn = new FocusButton("login_btn_account.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.45);

        //客服按钮
        // this.serviceBtn = new FocusButton("pic_kefu.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.94, 0.9);
        //this.serviceBtn = new FocusButton("res/gui/login/gui-main-icon-service.png", "", "", ccui.Widget.LOCAL_TEXTURE).to(this).pp(0.95, 0.7);

        //!G_OPEN_CUSTOMER_SERVICE && this.serviceBtn.hide();

        //注册按钮
        //this.registerBtn = new FocusButton("reward_register_btn.png", "","",cc.Widget.PLIST_TEXTURE).to(this).pp(0.95, 0.2);


        //注册点击事件
        //this.serviceBtn.addTouchEventListener(this.touchEventListener, this);
        this.guestBtn.addTouchEventListener(this.touchEventListener, this);
        this.loginBtn.addTouchEventListener(this.touchEventListener, this);
        //this.registerBtn.addTouchEventListener(this.touchEventListener, this);
        this.wxBtn.addTouchEventListener(this.touchEventListener, this);

        // this.registerBtnEffect();

        if (G_APPLE_EXAMINE && !native.isWXAppInstalled()) {
            // this.wxBtn.hide();
            // this.guestBtn.pp(0.25, 0.1);
            // this.loginBtn.pp(0.65, 0.1);
        }
        else {
            // new cc.Sprite("#buzengsongjinbi.png").to(this).pp(0.5, 0.25);
        }

        // TV 手指
        // this.setFocusSelected(this.wxBtn.isVisible() && this.wxBtn || this.loginBtn);
    },

    //注册按钮的动画效果
    registerBtnEffect: function () {

        var action = cc.sequence(cc.delayTime(4), ttutil.buildJellyAction());
        this.registerBtn.runAction(cc.repeatForever(action));
    },

    touchEventListener: function (sender, type) {

        var self = this;
        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
        }
        else if (type == ccui.Widget.TOUCH_ENDED) {
            switch (sender) {
                case this.wxBtn:

                    if (!cc.sys.isNative) {
                        ToastSystemInstance.buildToast("网页版本暂不支持微信登录！");
                        return;
                    }

                    if (native.isWXAppInstalled()) {
                        native.wxLogin(G_WX_APPID, Math.random(), function (code) {
                            self.onWxLogin(code);
                        });
                    }
                    else {
                        if (cc.sys.isMobile && !G_PLATFORM_TV) {
                            ToastSystemInstance.buildToast("您的设备没有安装微信, 无法微信登录");
                        }
                        else {
                            mpGD.netHelp.requestWXWebLoginAddr();
                            mpApp.showWaitLayer("正在请求微信web登录地址");
                        }
                    }

                    break;
                case this.guestBtn:

                    this.onGuestLogin();
                    break;
                case this.loginBtn:

                    this.openLoginLayer();
                    break;
                case this.registerBtn:

                    this.openRegisterLayer();
                    break;
                case this.serviceBtn:
                    mpGD.loginScene.pushDefaultSelectArray(this.serviceBtn);
                    mpApp.openCustomerService();
                    break;
            }
        }

    },
    /**
     * 游客登录
     */
    onGuestLogin: function () {
        this.loginType = mpLoginType.GuestID;
        //todo
        if (mpGD.netHelp.isConnect) {

            var guestID = mpGD.storage.getValue("guestID");

            if (!guestID) {
                var codeLayer = new MPCodeLayer().to(cc.director.getRunningScene());
                codeLayer.setSubmitCallback(function (code) {
                    mpGD.netHelp.requestLogin({guestID: null, code: code});
                    mpApp.showWaitLayer();
                });
                return;
            }


            mpGD.netHelp.requestLogin({guestID: guestID});
            mpApp.showWaitLayer();
        }
        else {
            mpGD.netHelp.reconnect();
            mpGD.saNetHelper.reconnect();
            mpApp.showWaitLayer("正在连接服务器...");
        }
    },

    /**
     * 微信登录
     * @param wxCode
     */
    onWxLogin: function (wxCode, isWeb) {

        this.loginType = mpLoginType.WXCode;
        if (mpGD.netHelp.isConnect) {
            mpGD.netHelp.requestLogin({wxCode: wxCode, isWeb: isWeb});
            mpApp.showWaitLayer();
        }
        else {
            mpGD.netHelp.reconnect();
            mpGD.saNetHelper.reconnect();
            mpApp.showWaitLayer("正在连接服务器...");
        }
    },

    //打开登录界面
    openLoginLayer: function () {
        this.loginType = mpLoginType.Account;
        //内部调用
        mpGD.loginScene.pushDefaultSelectArray(this.loginBtn);
        this.loginLayer = new MPLoginLayer();
        this.loginLayer.to(this);
    },

    //打开注册界面
    openRegisterLayer: function () {
        //猥琐方式
        mpGD.loginScene.setFocusSelected(this.registerBtn);
        this.registerLayer = new MPRegisterLayer();
        this.registerLayer.to(this);
    },

    //创建登录层
    buildLoginLayer: function () {
        var layer = new cc.Layer();
        layer.size(mpV.w, mpV.h);


        var loginBg = new cc.Sprite("res/gui/login/gui-login-Bg.png").to(layer).pp();

        //输入框

        layer.swallowTouch();
        return layer;
    },

    reconnect: function () {
        cc.log("mpGD.netHelp.reconnect()");
        mpGD.netHelp.reconnect();
        mpGD.saNetHelper.reconnect();
    },
});










