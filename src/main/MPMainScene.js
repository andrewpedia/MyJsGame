/**
 * Created by 真心科技 on 2016/1/27.
 */
// var sp = sp || {};
var MPQBackgroundLayer = cc.LayerColor.extend({
    m_touchListener:null,
    ctor:function(color){
        this._super(cc.color(0,0,0,255 * 0.7));
        var touchListener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan
        };
        cc.eventManager.addListener(touchListener, this);
        this.m_touchListener = touchListener;
    },
    onEnter:function () {
        this._super();
        this.onUserInfoUpdateListener = cc.eventManager.addCustomListener(mpEvent.UpdateUserInfo, this.updateUserInfo.bind(this));
        mpGD.netHelp.addNetHandler(this);
    },
    onExit:function () {
        this._super();
        cc.eventManager.removeListener(this.onUserInfoUpdateListener);
        mpGD.netHelp.removeNetHandler(this);
    },
    updateUserInfo: function () {

    },
    onTouchBegan:function(touch, event) {

        function isTouchInside(owner,touch) {
            if(!owner || !owner.getParent()){
                return false;
            }
            var touchLocation = touch.getLocation(); // Get the touch position
            touchLocation = owner.getParent().convertToNodeSpace(touchLocation);
            return cc.rectContainsPoint(owner.getBoundingBox(), touchLocation);
        }
        var target = event.getCurrentTarget();
        if(!target.isVisible() || (!isTouchInside(target,touch))){
            return false;
        }
        return true;
    },
    runPanelAction:function () {

        if (!this.panel) return;
        this.panel.setScale(0)
        this.panel.runAction(cc.sequence(cc.scaleTo(0.3, 1).easing(cc.easeBackOut(0.8)),
            cc.callFunc(() => {

            })));

    },
    show:function () {
        this.to(cc.director.getRunningScene());
        return this;
    },
    closePanel:function () {
        if (!this.panel) return;
        var self = this;
        this.panel.runAction(cc.sequence(cc.scaleTo(0.3, 0).easing(cc.easeBackIn(0.8)),
            cc.callFunc(() => {

            }), cc.removeSelf(),cc.callFunc(function () {
                self.removeFromParent();
            })));

        // this.setColor(cc.color(0,0,0,0));
        // this.runAction(cc.fadeTo(0.25, 0));

    }
});

var MPMainScene = MPFocusMainScene.extend({
    gameEngine: null,                   //游戏逻辑引擎
    subGameIconMap: null,               //具体游戏 icon对象缓存
    subGameManager: null,                //子游戏管理
    baseHallLayer: null,                //

    signLayer: null,

    roomLayer: null,                    //房间层

    scrollMsgLayer: null,                    //滚动消息层

    chatLayer: null,                        //聊天层

    onExitGameModulesListener: null,           //退出游戏模块事件
    onEnterGameModulesListener: null,           //进入游戏模块事件
    onSubGameStatusUpdateListener: null,            //游戏状态更新监听器

    onUserInfoUpdateListener: null,             //当用户信息更新，监听器

    nowRequestModuleID: null,

    topBox: null,           //顶部模块
    bottomBox: null,        //底部模块
    gameTypeBox: null,          //中间模块
    gameBox: null,          //游戏模块

    backToGameTypeButton: null,     //回到游戏分类的图标

    messageBtn: null,                   //邮件的按钮
    sceneName: "MainScene",         // 当前场景的名字
    curSubGameIcons: [],            // 子游戏icon
    curLightIndex: 0,               // 当前正在播放光效的icon索引
    lightAct: null,                 // 光效依次执行的Action
    umDuration: null,     //友盟统计， 使用时长

    bottomButtons: null,

    selectedBtn: null,

    newChatLayer: null, //聊天界面

    buyuBtn: null,             //捕鱼按钮
    duizhanBtn: null,          //对战按钮
    duorenBtn: null,           //多人按钮
    xiuxianBtn: null,          //休闲按钮
    jiejiBtn: null,            //街机按钮

    red_point:null,  //顶部消息红点
    _className: "MPMainScene",
    _classPath: "src/main/MPMainScene.js",

    ctor: function () {
        this._super();

        this.bottomButtons = [];

        // this.shared.finger = new cc.Sprite("res/gui/finger.png").qscale(0.3, 0.3);

        this.initEx();

        // TV 手指
        // this.setFocusSelected(this.bottomButtons[0].isVisible() ? this.bottomButtons[0] : this.bottomButtons[1]);
        // this.setFocusSelected(this.gameType3.anis[0])
        
    },


    //当点击金币明细
    onClickCoinDetail: function (sender) {
        new MPCoinDetailLayer().to(cc.director.getRunningScene());
    },

    //当点击充值
    onClickCZ: function (sender) {
        mpGD.mainScene.pushDefaultSelectArray(sender);
        new MPRechargeLayer().to(cc.director.getRunningScene());


    },

    //直接加载子游戏图标
    buildSubgameIcon: function () {
        console.log('kjkjaksdjfksdjfkj')
        if (GNativeInfo.plazaGames.length > 0 && !G_PLATFORM_TV) {
            //等待排序的数组
            console.log('kjkjaksdjfksdjfkj2')

            var tempArray = [];

            for (var i = 0; i < GNativeInfo.plazaGames.length; i++) {
                if (this.subGameIconMap && this.subGameIconMap[GNativeInfo.plazaGames[i]]) {
                    var gameInfo = this.subGameIconMap[GNativeInfo.plazaGames[i]];
                    var subGameIcon = this.subGameIconMap[gameInfo.moduleID];
                    tempArray.push(subGameIcon);

                }
            }


            tempArray.sort(function (a, b) {
                return mpGD.subGameInfoMap[a.moduleID].sort - mpGD.subGameInfoMap[b.moduleID].sort;
            });

            for (var i = 0; i < tempArray.length; ++i) {
                this.curSubGameIcons.push(tempArray[i]);
                console.log(tempArray[i]);
                this.gameBox.pushBackCustomItem(tempArray[i]);
                // this.gameBox.pushBackCustomFocusItem(tempArray[i]);
            }

            // if (this.gameBox.getItems().length == 0) {
            //     ToastSystemInstance.buildToast("该分类暂时没有游戏!");
            //     this.gotoGameType();
            //     this.setFocusSelected(this.gameTypeBox.anis[index]);
            // }
            // else
            mpGD.mainScene.setFocusSelected(this.gameBox.getItems()[0]);
        }
    },

    initEx: function () {
        this.initGui();

        mpGD.mainScene = this;
        //
        this.subGameManager = new MPSubGameManager();
        //
        //
        //必须在下一帧请求， 要不  会两个showWaitLayer
        this.runAction(cc.callFunc(function () {
            //请求房间列表
            mpGD.netHelp.requestGameList();
            // mpGD.netHelp.requestSignRead();
            mpApp.showWaitLayer("正在请求游戏列表");

            //读取VIP配置
            mpGD.netHelp.requestVipConfig();

            //请求读取未读取邮件
            mpGD.netHelp.requestMailListTip();

            //请求系统公告
            G_OPEN_SYSTEM_NOTICE && mpGD.netHelp.requestSystemNotice();

            //发送自己进入大厅公告
            mpGD.netHelp.requestEnterPlazaMain();

            //请求道具配置
            mpGD.netHelp.requestGoodsConfig();

            //请求自己道具
            mpGD.netHelp.requestGoods();

            //请求开启每日签到
            if (G_OPEN_DAILY_ATTENDANCE) {
                mpGD.netHelp.requestOpenDailyAttendance();
            }
            native.autoFillScreen(cc.size(mpV.w, mpV.h));
        }));

        //设置信息
        // this.baseHallLayer.setNickname(mpGD.userInfo.Nickname);
        // this.baseHallLayer.setScore(mpGD.userInfo.Score);

        if (!G_APPLE_EXAMINE) {
            this.scrollMsgLayer = new MPScrollMsgLayer().to(this);
            //this.chatLayer = new MPChatLayer().to(this);
        }

        // if (!G_PLATFORM_TV) {
        //     this.newChatLayer = new MPNewChatLayer().to(this, 100);
        // }
        //console.log("mpGD.userInfo.proxyid====="+mpGD.userInfo.proxyid);
        //console.log("mpGD.userInfo.dailiID====="+mpGD.userInfo.dailiID);
        if(mpGD.userInfo.proxyid==0&&mpGD.userInfo.dailiID==0)
        {
            new MPMainDailiInputBoxLayer().to(this, 9999);
        }
    },

    initGui: function () {
        this.size(mpV.w, mpV.h);

        var bg = new cc.Sprite("res/images/nopack/hall_bg_main1.png").to(this).pp();
        bg.height = 750;

        this.initGameContent();

        var guang = new cc.Sprite("#Floor_Guang.png");
        guang.to(this).pp(0.2,0.4).qscale(2.5);

        //背景骨骼动画
        let bgEffect = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/ad_girl/ZJM_Girl.json", "res/images/nopack/spine_animation/ad_girl/ZJM_Girl.atlas", 1);
        bgEffect.setAnimation(0, "idle", true);
        bgEffect.to(this).pp(0.2, 0.15).qscale(1.1);

        var leftFrames = [];
        var midFrames = [];
        var rightFrames = [];
        var otherFrames = [];
        for (var i = 0; i < 10; ++i ){
            leftFrames.push(cc.spriteFrameCache.getSpriteFrame("ZJM_ani_gxfc" + i + ".png"));
            midFrames.push(cc.spriteFrameCache.getSpriteFrame("ZJM_ani_lizi" + i + ".png"));
            rightFrames.push(cc.spriteFrameCache.getSpriteFrame("ZJM_ani_wsry" + i + ".png"));
            i < 7 && otherFrames.push(cc.spriteFrameCache.getSpriteFrame("ZJM_ani_xuli" + i + ".png"));
        }

        var leftSprite = new cc.Sprite("#ZJM_ani_gxfc0.png");
        leftSprite.to(this).pp(0.08,0.7);

        var rightSprite = new cc.Sprite("#ZJM_ani_wsry0.png");
        rightSprite.to(this).pp(0.28,0.7);

        var midSprite = new cc.Sprite("#ZJM_ani_lizi0.png");
        midSprite.to(this).pp(0.18,0.7);

        var animation = new cc.Animation(leftFrames, 0.1);
        var animate = new cc.Animate(animation);
        leftSprite.runAction(cc.sequence(animate,cc.callFunc(()=>{
            leftSprite.hide();
            var animation2 = new cc.Animation(rightFrames, 0.1);
            var animate2 = new cc.Animate(animation2);
            rightSprite.runAction(cc.sequence(animate2,cc.callFunc(()=>{
                rightSprite.hide();

                var animation3 = new cc.Animation(midFrames, 0.1);
                var animate3 = new cc.Animate(animation3);
                midSprite.runAction(cc.sequence(animate3,cc.callFunc(()=>{
                    midSprite.hide();
                })))

            })))
        })))

        this.buildPageView();


        //  左箭头
        let leftArrowButton = new FocusButton();
        leftArrowButton.ignoreContentAdaptWithSize(false);
        leftArrowButton.setContentSize(100, 100);
        leftArrowButton.to(this).pp(0.35,0.5).hide();
        var zz = new cc.Sprite("res/images/nopack/hall_btn/ZJM_JianTou.png");
        zz.to(leftArrowButton).anchor(0.5,0.5).pp();
        leftArrowButton.tag = 0;
        this.leftArrowButton = leftArrowButton;

        var actions = [];
        actions.push(cc.sequence(cc.tintTo(0.5,200,200,200),cc.tintTo(0.5,255,255,255)));
        var x = zz.x;
        var y = zz.y;
        actions.push(cc.sequence(cc.moveTo(0.5,cc.p(x - 15,y)),cc.moveTo(0.5,cc.p(x,y))));
        zz.runAction(cc.spawn(actions).repeatForever());

        //  右箭头
        let rightArrowButton = new FocusButton();
        rightArrowButton.ignoreContentAdaptWithSize(false);
        rightArrowButton.setContentSize(100, 100);
        rightArrowButton.to(this).pp(0.95,0.5);
        var zz = new cc.Sprite("res/images/nopack/hall_btn/ZJM_JianTou.png");
        zz.to(rightArrowButton).anchor(0.5,0.5).pp();
        zz.setFlippedX(true);
        rightArrowButton.tag = 1;
        this.rightArrowButton = rightArrowButton;

        leftArrowButton.addTouchEventListener(this.arrowButtonPressed.bind(this));
        rightArrowButton.addTouchEventListener(this.arrowButtonPressed.bind(this));

        var actions = [];
        actions.push(cc.sequence(cc.tintTo(0.5,200,200,200),cc.tintTo(0.5,255,255,255)));
        var x = zz.x;
        var y = zz.y;
        actions.push(cc.sequence(cc.moveTo(0.5,cc.p(x + 15,y)),cc.moveTo(0.5,cc.p(x,y))));
        zz.runAction(cc.spawn(actions).repeatForever());

        this.topBox = this.buildTopBoxSpring();
        this.bottomBox = this.buildBottomBoxSpring();


    },
    arrowButtonPressed:function (sender,type) {

        sender.hide();
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:sender.qscale(1.1);break;
            case ccui.Widget.TOUCH_ENDED:
                sender.qscale(1);
                this.isHandArrow = true;
                if(sender.tag == 0){
                    this.contentScorllView.scrollToLeft(0.3,true)
                    this.rightArrowButton.show();
                }
                if(sender.tag == 1) {
                    this.contentScorllView.scrollToRight(0.3,true)
                    this.leftArrowButton.show();
                }
            ;break;
            case ccui.Widget.TOUCH_CANCELED:sender.qscale(1);break;
        }
    },
    //TODO:加载背景特效
    buildBgEffect: function () {
        // let bgEffect = sp.SkeletonAnimation.createWithJsonFile("res/effect/588/ui_beijing/ui_beijing.json", "res/effect/588/ui_beijing/ui_beijing.atlas", 1);
        // bgEffect.setAnimation(0, "animation", true);
        // bgEffect.anchor(0.5, 0.5).to(this).pp();

        var system = new cc.ParticleSystem('res/plaza1v1/particle/snow.plist');
        system.anchor(0.5,0.5);
        system.to(this).pp();


    },

    loadBackgroundLayer:function () {

        this.m_backgroundLayer = new MPQBackgroundLayer(cc.color(0,0,0,255 * 0.3));
        // this.m_backgroundLayer.ignoreAnchorPointForPosition(true);

        return this.m_backgroundLayer;
    },
    buildPageView:function () {
        var pageViewSize = cc.p(345,160);
        var pageView = new ccui.PageView();
        pageView.setTouchEnabled(true);
        pageView.setSize(cc.size(pageViewSize.x,pageViewSize.y));

        // 裁区域
        var clipper = new cc.ClippingNode();
        clipper.setAnchorPoint(0, 0.5);
        clipper.setContentSize(cc.size(pageView.cw(),pageView.ch()));
        clipper.to(this).pp(0.02,0.25);


        var stencil = new cc.DrawNode();
        var rect = [cc.p(0, 0), cc.p(pageView.cw(), 0), cc.p(pageView.cw(), pageView.ch()), cc.p(0, pageView.ch())];
        stencil.drawPoly(rect, cc.color(255, 255, 255, 255), 1, cc.color(255, 255, 255, 255));
        clipper.setStencil(stencil);

        pageView.setClippingEnabled(true);
        pageView.to(clipper).anchor(0.5,0.5).pp(0.5,0.5);


        var layout =new ccui.Layout();
        layout.setSize(cc.size(pageView.cw(),pageView.ch()));

        // layout.addChild(p1);
        var layout2 = new ccui.Layout();
        layout2.setSize(cc.size(pageView.cw(),pageView.ch()));
        // layout2.addChild(p2);
        var layout3 = new ccui.Layout();
        layout3.setSize(cc.size(pageView.cw(),pageView.ch()));

        var item  = new cc.Sprite("res/images/nopack/download_icon.png").to(layout).anchor(0.5,0).pp(0.5,0);
        //var item2 = new ccs.load('res/plaza1v1/images/main_layer/pageview/ActivityLayer.json').node.to(layout2).anchor(0.5,0).pp(0.5,0);

        var item2 = new cc.Sprite("res/images/nopack/"+imagesPre+"_posters_1.png").to(layout2).anchor(0.5,0).pp(0.5,0);


        var item3 = new cc.Sprite("res/images/nopack/posters_2.png").to(layout3).anchor(0.5,0).pp(0.5,0);
        //var item3 = new cc.Sprite("res/plaza1v1/images/main_layer/pageview/posters_2.png").to(layout3).anchor(0.5,0).pp(0.5,0);

        item.tag  = 10;
        item2.tag = 10;
        item3.tag = 10;

        // var copyBtn = item3.getChildByName('copyBtn');
        // copyBtn.tag = 101;
        //
        // var saveOpenBtn = item.getChildByName('saveOpenBtn');
        // saveOpenBtn.tag = 102;

        function events(sender,type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:

                    SoundEngine.playEffect(commonRes.btnClick);

                    return true;
                    break;

                case ccui.Widget.TOUCH_ENDED:
                    // console.log(nameArray[sender.mpFlag]);



                    if (sender.tag == 101) {

                        new MPMainTuiGuangLayer().to(cc.director.getRunningScene());
                        //native.setClipboard(proxyUrl);
                        //ToastSystemInstance.buildToast("备用网址已经复制到剪切板中");

                    }

                    if (sender.tag == 102) {
                        native.setClipboard(backupUrl);
                        ToastSystemInstance.buildToast("备用网址已经复制到剪切板中");
                        cc.sys.openURL(backupUrl);

                    }

                    break;
                case ccui.Widget.TOUCH_CANCELED:


                    break;
            }
        }
        let copyBtn = new FocusButton();
        copyBtn.ignoreContentAdaptWithSize(false);
        copyBtn.setContentSize(item3.cw(), item3.ch());
        copyBtn.to(item3).pp();
        copyBtn.tag = 101;
        copyBtn.addTouchEventListener(events);
        let saveOpenBtn = new FocusButton();
        saveOpenBtn.ignoreContentAdaptWithSize(false);
        saveOpenBtn.setContentSize(item.cw(), item.ch());
        saveOpenBtn.to(item).pp();
        saveOpenBtn.tag = 102;
        saveOpenBtn.addTouchEventListener(events);

        layout.size(cc.size(pageView.cw(),pageView.ch()));
        layout2.size(cc.size(pageView.cw(),pageView.ch()));
        layout3.size(cc.size(pageView.cw(),pageView.ch()));

        pageView.addPage(layout);
        pageView.addPage(layout2);
        pageView.addPage(layout3);

        pageView.setCurrentPageIndex(1);


        this.pageView = pageView;
        var self = this;
        self.isTouchedPageView = false;
        setInterval(function () {
            if(!self.isTouchedPageView) {
                pageView && pageView.scrollToPage(2);
                setTimeout(function () {
                    var tempItem2 = layout2.getChildByTag(10);
                    tempItem2.retain();
                    tempItem2.removeFromParent();

                    var tempItem3 = layout3.getChildByTag(10);
                    tempItem3.retain();
                    tempItem3.removeFromParent();

                    var tempItem = layout.getChildByTag(10);
                    tempItem.retain();
                    tempItem.removeFromParent();

                    tempItem.to(layout3);
                    tempItem2.to(layout);
                    tempItem3.to(layout2);

                    pageView.setCurrentPageIndex(1);
                },700);
            };
        },5000);

        function touchedPageView() {
            self.pageTouchedTimeout = setTimeout(function () {

                console.log('currentindex:' + pageView.getCurrentPageIndex());
                var currentPageIndex = pageView.getCurrentPageIndex();

                var tempItem2 = layout2.getChildByTag(10);
                tempItem2.retain();
                tempItem2.removeFromParent();

                var tempItem3 = layout3.getChildByTag(10);
                tempItem3.retain();
                tempItem3.removeFromParent();

                var tempItem = layout.getChildByTag(10);
                tempItem.retain();
                tempItem.removeFromParent();

                if (currentPageIndex == 0){
                    tempItem.to(layout2);
                    tempItem2.to(layout3);
                    tempItem3.to(layout);
                }else if (currentPageIndex == 2) {
                    tempItem.to(layout3);
                    tempItem2.to(layout);
                    tempItem3.to(layout2);
                }else
                {
                    tempItem.to(layout);
                    tempItem2.to(layout2);
                    tempItem3.to(layout3);
                }
                pageView.setCurrentPageIndex(1);
                self.isTouchedPageView = false;

            },700);
        }

        pageView.addTouchEventListener(function (sender,type) {

            switch (type){

                case ccui.Widget.TOUCH_BEGAN:{
                    self.pageTouchedTimeout && clearTimeout(self.pageTouchedTimeout) && (self.pageTouchedTimeout = null);
                    self.isTouchedPageView = true;

                };break;
                case ccui.Widget.TOUCH_MOVED:{

                };break;
                case ccui.Widget.TOUCH_ENDED:{
                    touchedPageView();
                };break;
                case ccui.Widget.TOUCH_CANCELED:{
                    touchedPageView();
                };break;

            };
        });
    },
    initGameContent:function () {
        var scrollLeftSpace = 100;
        var roomSpace = 228 + 15;
        var leftSpace = 400;
        var rightSpace = 100;
        var bigItemSize = cc.size(228,352);
        var smallItemSize = cc.size(226,176);
        var itemSpaceX = (bigItemSize.height - smallItemSize.height * 2) / 2;
        var itemSpaceY = itemSpaceX;



        var self = this;
        var node = new cc.Node().anchor(0,0.5).size(mpV.w - scrollLeftSpace,bigItemSize.height);
        node.p(scrollLeftSpace, mpV.h / 2);



        var listView = new ccui.ScrollView();
        listView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);
        listView.setClippingEnabled(true);
        listView.setSize(cc.size(node.cw(), node.ch()));
        listView.pp(0,0);
        listView.setScrollBarEnabled(false);
        node.addChild(listView);
        this.contentScorllView = listView;

        var joinRoomBtn = new FocusButton("res/images/room/hall_joinRoom.png","","",ccui.Widget.LOCAL_TEXTURE);
        joinRoomBtn.to(listView).anchor(0.5,0.5).p(400 + 114,176 * 0.5);

        var createRoomBtn = new FocusButton("res/images/room/hall_creatRoom.png","","",ccui.Widget.LOCAL_TEXTURE);
        createRoomBtn.to(listView).anchor(0.5,0.5).p(400 + 114,176  * 1.5 + itemSpaceY);
        createRoomBtn.addTouchEventListener(this.createRoomPressed.bind(this));
        joinRoomBtn.addTouchEventListener(this.joinRoomPressed.bind(this));

        listView.addCCSEventListener( (sender, type)=> {
            // console.log('scorllview --------:' + type + ';:' + listView.getInnerContainerPosition().x + ';:' + listView.getInnerContainerSize().width);
            var offset_X = listView.getInnerContainerPosition().x;
            var content_width = listView.getInnerContainerSize().width;

            if (type == 10){
                if (this.isHandArrow) {
                    this.isHandArrow = false;
                    return;
                }
                this.isHandArrow = false;
                if (offset_X > 0){
                    this.leftArrowButton.hide();
                    this.rightArrowButton.show();
                }else if (offset_X < 0){
                    this.leftArrowButton.show();
                    this.rightArrowButton.hide();
                }

            }



        });
        node.to(this);
        var tempNode = new FocusButton();
        tempNode.ignoreContentAdaptWithSize(false);
        tempNode.setContentSize(leftSpace, bigItemSize.height);
        tempNode.to(this).anchor(0,0.5).p(scrollLeftSpace,375);
        tempNode.addTouchEventListener(function () {
        });
        return node;
    },
    createRoomPressed:function (sender,type) {
        this.buttonScale(sender,type);
        if(type == ccui.Widget.TOUCH_ENDED){
            new MPMainRoomCreateLayer().show();
        }
    },
    joinRoomPressed:function (sender,type) {
        this.buttonScale(sender,type);
        if(type == ccui.Widget.TOUCH_ENDED){
            new MPMainRoomJoinLayer().show();
        }
    },

    buttonScale:function (sender,type) {

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                sender.qscale(0.9);
                ;break;
            case ccui.Widget.TOUCH_ENDED:;
            case ccui.Widget.TOUCH_CANCELED:
                sender.qscale(1);
                break;
        }

    }
    ,
    //TODO:中间控件
    buildGameContent:function (tempArray){
        console.log("==========================" + tempArray.length);
        var scrollLeftSpace = 100;
        var roomSpace = 228 + 15;

        var leftSpace = 400 + roomSpace;
        //var leftSpace = 400;
        var rightSpace = 100;
        var bigItemSize = cc.size(228,352);
        var smallItemSize = cc.size(226,176);
        var itemSpaceX = (bigItemSize.height - smallItemSize.height * 2) / 2;
        var itemSpaceY = itemSpaceX;


        var listView = this.contentScorllView;

        //console.log('line:' + raw2);
        var wi = leftSpace + rightSpace + parseInt(tempArray.length / 5) * (bigItemSize.width + smallItemSize.width * 2 + itemSpaceX * 3);

        if(tempArray.length >= 10){
            //wi += smallItemSize.width + itemSpaceX;
            wi += smallItemSize.width*2 + itemSpaceX;
        }

        listView.setInnerContainerSize(cc.size(wi, listView.ch()));

        //item布局排序格式
        //   1 3小图    6 8
        // 0大图      5大图
        //   2 4小图    7 9 ....以此类推

        for(var i =0; i < tempArray.length; i ++){
                var sprite = this.subGameIconMap[tempArray[i].moduleID];  
                listView.addChild(sprite,99999);
                sprite.anchor(0,0);

                var position = i % 5;
                var x = 0;
                var y = 0;
                var section = parseInt(i / 5);
                console.log("=======" + section);
                var sectionSpace = (bigItemSize.width + smallItemSize.width * 2 + itemSpaceX * 3) * section;
                switch (position) {
                    case 0:
                        x = leftSpace + sectionSpace;
                        if (i == 10){
                            y = 80 ;
                        }
                        ;break;
                    case 1:
                        x = leftSpace + bigItemSize.width + itemSpaceX + sectionSpace;
                        y = smallItemSize.height + itemSpaceY;
                        //if(i == 11){
                        //    x = leftSpace + sectionSpace;
                        //    y = 0;
                        //}
                        ;break;
                    case 2:
                        x = leftSpace + bigItemSize.width + itemSpaceX + sectionSpace;
                        ;break;
                    case 3:
                        x = leftSpace + bigItemSize.width + smallItemSize.width + itemSpaceX * 2 + sectionSpace;
                        y = smallItemSize.height + itemSpaceY;
                        ;break;
                    case 4:
                        x = leftSpace + bigItemSize.width + smallItemSize.width + itemSpaceX * 2 + sectionSpace;
                        ;break;

                }
                console.log("i=======" + i);
                switch (position) {
                    case 0:
                        //if(i == 10)
                        //{
                        //    console.log("kkkkkkkkkkk===")
                        //    sprite.size(smallItemSize);

                        //}else{
                            sprite.size(bigItemSize);
                        //}
                        ;break;
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        sprite.size(smallItemSize);break;
                }
                sprite.x = x;
                sprite.y = y;
        }

        listView.jumpToLeft();

        return listView;
    },
    buildTopBoxSpring:function () {
        var node = new cc.Sprite("res/images/nopack/hall_bg_main_top.png");
        node.to(this).anchor(0,0).p(0,750 - 133);

        let exchangeButton = new FocusButton();
        exchangeButton.ignoreContentAdaptWithSize(false);
        exchangeButton.setContentSize(100, 100);
        exchangeButton.to(node).pp(0.07,0.6);
        exchangeButton.addTouchEventListener(this.personalButtonPressed.bind(this));

        var avatarSprite = new cc.Sprite().to(exchangeButton).pp(0.5,0.5).qscale(0.8);
        var avatarFrameSprite = new cc.Sprite("#head_frame_box.png").to(exchangeButton).pp(0.5,0.5);

        var nickNameLabel = new cc.LabelTTF("00000",GFontDef.fontName,24).to(node).anchor(0,0.5).pp(0.13,0.75);
        //var IDLabel = new cc.LabelTTF("00000",GFontDef.fontName,24).to(node).anchor(0,0.5).pp(0.13,0.45);

        var vipSprite = new cc.Sprite("res/plaza1v1/images/vip_bg.png");
        vipSprite.to(node).anchor(0,0.5).pp(0.13,0.4);

        var vipLabel = new cc.LabelBMFont(mpGD.userInfo.memberOrder|| "0","res/plaza1v1/images/numberlabel_vip.fnt");
        vipLabel.to(node).anchor(0,0.5).pp(0.155,0.5).qscale(0.2);

        var jinBiKuangSprite = new FocusButton("res/images/nopack/hall_btn/JinBi_Kuang.png","","",ccui.Widget.LOCAL_TEXTURE);
        jinBiKuangSprite.to(node).pp(0.75,0.6);
        jinBiKuangSprite.addTouchEventListener(this.rechargeButtonPressed.bind(this));
        var addSprite = new cc.Sprite("res/images/nopack/hall_btn/JiaHao.png");
        addSprite.to(jinBiKuangSprite).pp(0.925,0.5);
        var goldLabel = new cc.LabelBMFont("0000","res/font/coin_num_icon.fnt").to(jinBiKuangSprite).anchor(1,0.5).pp(0.8,0.5 - 0.05);
        node.setNickname = (text) => {
            nickNameLabel.setString(text);
        };
        node.setScore = (text) => {
            text=ttutil.roundFloat(text, 2);
            goldLabel.setString(text);
        };

        node.setFace = function (faceID) {
            avatarSprite.setSpriteFrame('head_animal_' + (faceID + 1) + '.png.png');
            avatarFrameSprite.pp(0.5,0.5);
        };
        avatarFrameSprite.tag = 6;
        jinBiKuangSprite.tag = 12;

        return node;
    },
    personalButtonPressed:function (sender,type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:sender.qscale(1.1);break;
            case ccui.Widget.TOUCH_ENDED:sender.qscale(1);this.loadPersonalPopup();break;
            case ccui.Widget.TOUCH_CANCELED:sender.qscale(1);break;
        }
    },

    buildBottomBoxSpring:function () {
        var node = new cc.Sprite("res/images/nopack/hall_bg_main_bottom.png");
        node.to(this).anchor(0,0).p(0,0);

        var msgButton = new FocusButton("res/images/nopack/1010.png","","",ccui.Widget.LOCAL_TEXTURE);
        msgButton.to(node).pp(0.05,0.25);
        msgButton.addTouchEventListener(this.msgButtonPressed.bind(this));

        this.red_point = new cc.Sprite("res/plaza1v1/images/red_point.png");
        this.red_point.to(msgButton).pp(0.1,0.9);

        var bankButton = new FocusButton("res/images/nopack/hall_btn/bank.png","","",ccui.Widget.LOCAL_TEXTURE);
        bankButton.to(node).pp(0.15,0.25);
        bankButton.addTouchEventListener(this.bankButtonPressed.bind(this));

            //  兑换
        let exchangeButton = new FocusButton();
        exchangeButton.ignoreContentAdaptWithSize(false);
        exchangeButton.setContentSize(120, 40);
        exchangeButton.to(node).pp(0.25,0.25);
        var zz = new cc.Sprite("res/images/nopack/hall_btn/ZJM_DH_01.png");
        zz.to(exchangeButton).anchor(0.5,0.5).p(30,20);

        var zzTitle = new cc.Sprite("res/images/nopack/hall_btn/ZJM_DH_02.png");
        zzTitle.to(exchangeButton).anchor(0.5,0.5).p(85,20);
        exchangeButton.addTouchEventListener(this.exchangeButtonPressed.bind(this));

        zz.runAction(cc.sequence(cc.rotateTo(0.5, 90, 90),cc.rotateTo(0.5, 180, 180),cc.rotateTo(0.5, 270, 270),cc.rotateTo(0.5, 360, 360)).repeatForever());

        //注册送金
        let registerButton = new FocusButton();
        registerButton.ignoreContentAdaptWithSize(false);
        registerButton.setContentSize(160, 160);
        registerButton.to(node).pp(0.45,0.4);
        // var tt = new cc.Sprite("res/images/nopack/hall_btn/hall_ZC_ZT.png");
        // tt.to(registerButton).anchor(0.5,0.5).pp();

        //骨骼动画
        let regEffect = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/sss/zcsj_ani/zcsj_ani.json", "res/images/nopack/spine_animation/sss/zcsj_ani/zcsj_ani.atlas", 1);
        regEffect.setAnimation(0, "animation", true);
        regEffect.to(registerButton).pp(0.15, 0.25);

        var customParticle = new cc.ParticleSystem("res/images/nopack/spine_animation/sss/yuanbao/yuanbao.plist");
        customParticle.x = 80;
        customParticle.y = 80;
        registerButton.addChild(customParticle);

        registerButton.addTouchEventListener(this.registerButtonPressed.bind(this));
        if (mpGD.userInfo.hasAccount) {
            registerButton.setVisible(false);
        }
        //代理
        let agentButton = new FocusButton();
        agentButton.ignoreContentAdaptWithSize(false);
        agentButton.setContentSize(171, 146);
        agentButton.to(node).pp(0.6,0.6);
        var tt2 = new cc.Sprite("res/images/nopack/hall_btn/icon_proxy.png");
        tt2.to(agentButton).anchor(0.5,0.5).pp();
        agentButton.addTouchEventListener(this.agentButtonPressed.bind(this));

        //充值
        let rechargeButton = new FocusButton();
        rechargeButton.ignoreContentAdaptWithSize(false);
        rechargeButton.setContentSize(250, 200);
        rechargeButton.to(node).pp(0.8,0.5);
        // var tt3 = new cc.Sprite("res/images/nopack/hall_btn/hall_ZC_ZT.png");
        // tt3.to(rechargeButton).anchor(0.5,0.5).pp();
        //骨骼动画
        let chargeEffect = sp.SkeletonAnimation.createWithJsonFile("res/images/nopack/spine_animation/sss/cz.json", "res/images/nopack/spine_animation/sss/cz.atlas", 1);
        chargeEffect.setAnimation(0, "animation", true);
        chargeEffect.to(rechargeButton).pp(0.15, 0.25);

        rechargeButton.addTouchEventListener(this.rechargeButtonPressed.bind(this));

        return node;
    },
    msgButtonPressed:function (sender,type) {
        if (type == ccui.Widget.TOUCH_ENDED)new MPMainNoticeLayer().show();
    },
    bankButtonPressed:function (sender,type) {
        if (type == ccui.Widget.TOUCH_ENDED)this.loadBankBoxPanel();
    },
    exchangeButtonPressed:function (sender,type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:sender.qscale(1.1);break;
            case ccui.Widget.TOUCH_ENDED:sender.qscale(1);this.loadExchangePanel();break;
            case ccui.Widget.TOUCH_CANCELED:sender.qscale(1);break;
        }
    },
    registerButtonPressed:function (sender,type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:sender.qscale(1.1);break;
            case ccui.Widget.TOUCH_ENDED:sender.qscale(1);
            new MPRegisterGiveGoldLayer().to(cc.director.getRunningScene());
            ;break;
            case ccui.Widget.TOUCH_CANCELED:sender.qscale(1);break;
        }
    },
    agentButtonPressed:function (sender,type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:sender.qscale(1.1);break;
            case ccui.Widget.TOUCH_ENDED:sender.qscale(1);new MPMainTuiGuangLayer().to(cc.director.getRunningScene());;break;
            case ccui.Widget.TOUCH_CANCELED:sender.qscale(1);break;
        }
    },
    rechargeButtonPressed:function (sender,type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:sender.qscale(1.1);break;
            case ccui.Widget.TOUCH_ENDED:sender.qscale(1);this.loadChargePanel();break;
            case ccui.Widget.TOUCH_CANCELED:sender.qscale(1);break;
        }
    },

    //TODO:加载个人中心
    loadPersonalPopup:function () {

         new MPMainPersonalLayer().show();

    },




    //TODO:加载充值界面
    loadChargePanel:function () {
        new MPMainChargeLayer().show();
        // var nowScene = cc.director.getRunningScene();
        // mpGD.mainScene.pushDefaultSelectArray(sender);
        // new MPRechargeLayer().to(cc.director.getRunningScene());
        // var backgroundLayer = new MPQBackgroundLayer();
        // backgroundLayer.to(nowScene,100000000,100000000);
        //
        // var chargePanel = ccs.load('res/plaza1v1/images/charge_popup/charge/MainShargeAlertLayer.json').node;
        // chargePanel.to(backgroundLayer).anchor(0.5,0.5).pp(0.5,0.5);
        // chargePanel.setScale(0.2);
        // chargePanel.runAction(cc.ScaleTo(0.25,1,1))
        //
        // //关闭按钮
        // var closeBtn            = chargePanel.getChildByName('closeBtn');
        // closeBtn.setTag(35);
        // closeBtn.addTouchEventListener(this.loginOutButtonPressedEvents.bind(this));
        //
        // var scrollView = chargePanel.getChildByName('scrollView');
        // this.chargeScrollView = scrollView;
        //
        // mpGD.netHelp.requestPayConfig();
        // mpApp.showWaitLayer("正在请求充值配置");
    },
    //TODO:加载充值数据列表
    loadChargeData:function (data) {

        if (!this.chargeScrollView) return;


        for (var index = 0; index < 8; index ++) {


            var cell = this.chargeScrollView.getChildByName('cell_' + index);

            cell && cell.setVisible(true);

            var button = cell.getChildByName('cell');
            button.addTouchEventListener(this.payButtonPressedEvents.bind(this));

            var priceLabel = button.getChildByName('priceLabel');
            priceLabel.setString((index + 10) + '元');

            var dia = button.getChildByName('dia_' + index);
            dia && dia.setVisible(true);

        }


    },

    payButtonPressedEvents:function (sender, type) {
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

                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },

    //当点击充值时触发
    onClickPay: function (sender) {
        //new MPRankLayer().to(this);
        //console.log(this.czType);
        return;
        //1支付宝支付 2微信支付
        if (this.czType == "1") {
            mpApp.requestPay(this.czType, sender.mpInfo.money);
        }
        else {
            new MPRankLayer().to(this);
        }
    },

    //加载排行榜界面
    loadRankPanel:function () {
		ToastSystemInstance.buildToast("排行榜数据正在更新维护中");
        //new MPMainRankLayer().show();

    },


    //加载兑换界面
    loadExchangePanel:function () {
        new MPMainEXCHLayer().to(cc.director.getRunningScene());

    },
    //TODO:准备加载保险箱
    prepareLoadBankBoxPanel:function () {


        return this.loadBankBoxPanel();

        if (mpGD.userInfo.twoPassword == false) {
            // new MPSettingPasswordLayer(MPSettingPasswordLayer.BankPassword, function () {
            //     new MPBankLayer().to(cc.director.getRunningScene());
            // }).to(cc.director.getRunningScene());
            this.loadSetPasswordPanel();
        }
        else if (mpGD.userInfo.twoPassword == true) {
            // if (G_PLATFORM_TV && mpGD.userInfo.twoPasswordType === 1) {
            //     ToastSystemInstance.buildToast({text: "您设置的密码为图形密码，TV版暂不支持，请到手机端尝试！"});
            //     return;
            // }
            // new MPBankInputPasswordLayer(mpGD.userInfo.twoPasswordType, function () {
            //     new MPBankLayer().to(cc.director.getRunningScene());
            // }).to(cc.director.getRunningScene());

            // new MPBankInputPasswordLayer(0, function () {
            //     new MPBankLayer().to(cc.director.getRunningScene());
            // }).to(cc.director.getRunningScene());
            this.loadInputPasswordPanel();
        }
        else {
            // new MPBankLayer().to(cc.director.getRunningScene());
        }

    },
    //TODO:加载设置密码
    loadSetPasswordPanel:function () {

        new MPMainBankPasswordLayer().show();

    },
    //TODO:加载输入密码
    loadInputPasswordPanel:function () {

        new MPMainInputBankPasswordLayer().show();

    },
    //TODO:加载保险箱
    loadBankBoxPanel:function () {

        new MPMainBankBoxLayer().show();

    },

    //中心游戏类别
    buildGameTypeBox: function () {
        var centerNode = new cc.Node().anchor(0, 0);
        centerNode.size(mpV.w, mpV.h);

        //捕鱼
        let yuBtn = new FocusButton();
        yuBtn.ignoreContentAdaptWithSize(false);
        yuBtn.setContentSize(341, 433);
        yuBtn.mpFlag = 1;
        yuBtn.addTouchEventListener(this.onClickGameTypeBtn.bind(this));

        let yuEffect = sp.SkeletonAnimation.createWithJsonFile("res/effect/588/ui_huanlebuyu/ui_huanlebuyu.json", "res/effect/588/ui_huanlebuyu/ui_huanlebuyu.atlas", 1);
        yuEffect.setAnimation(0, "animation", true);
        yuEffect.anchor(0.5,0.5).to(yuBtn).pp();

        yuBtn.anchor(0.5,0.5).to(centerNode).pp(0.5,0.5);


        // 棋牌中心
        let cardBtn = new FocusButton();
        cardBtn.ignoreContentAdaptWithSize(false);
        cardBtn.setContentSize(341, 433);
        cardBtn.mpFlag = 2;
        cardBtn.addTouchEventListener(this.onClickGameTypeBtn.bind(this));

        let cardEffect = sp.SkeletonAnimation.createWithJsonFile("res/effect/588/ui_qipaiduizhan/ui_qipaiduizhan.json", "res/effect/588/ui_qipaiduizhan/ui_qipaiduizhan.atlas", 1);
        cardEffect.setAnimation(0, "animation", true);
        cardEffect.anchor(0.5,0.5).to(cardBtn).pp();

        cardBtn.anchor(0.5,0.5).to(centerNode).pp(0.27,0.55);


        //对战
        let duiBtn = new FocusButton();
        duiBtn.ignoreContentAdaptWithSize(false);
        duiBtn.setContentSize(341, 210);
        duiBtn.mpFlag = 3;
        duiBtn.addTouchEventListener(this.onClickGameTypeBtn.bind(this));
        duiBtn.anchor(0.5, 0.5).to(centerNode).pp(0.765,0.68);

        let duiEffect = sp.SkeletonAnimation.createWithJsonFile("res/effect/588/ui_duoren/ui_duoren.json", "res/effect/588/ui_duoren/ui_duoren.atlas", 1);
        duiEffect.setAnimation(0, "animation", true);
        duiEffect.anchor(0.5, 0.5).to(duiBtn).pp();

        //街机
        let jieBtn = new FocusButton();
        jieBtn.ignoreContentAdaptWithSize(false);
        jieBtn.setContentSize(341, 210);
        jieBtn.mpFlag = 0;
        jieBtn.addTouchEventListener(this.onClickGameTypeBtn.bind(this));
        jieBtn.anchor(0.5, 0.5).to(centerNode).pp(0.765,0.4);

        let jieEffect = sp.SkeletonAnimation.createWithJsonFile("res/effect/588/ui_jieji/ui_jieji.json", "res/effect/588/ui_jieji/ui_jieji.atlas", 1);
        jieEffect.setAnimation(0, "animation", true);
        jieEffect.anchor(0.5, 0.5).to(jieBtn).pp();


        // //捕鱼
        // var buyuIco = new cc.Sprite("#middle_icon_buyu@2x.png").anchor(0, 0);
        // buyuIco.size(367, 284);
        // var buyu = new FocusButton();
        // buyuIco.to(buyu).pp();
        // buyu.ignoreContentAdaptWithSize(false);
        // buyu.setContentSize(buyuIco.size());
        // buyu.to(centerNode).pp(0.2, 0.65);
        // buyu.mpFlag = 1;
        // buyu.addTouchEventListener(this.onClickGameTypeBtn.bind(this));
        //
        // //对战
        // var duizhanIco = new cc.Sprite("#middle_icon_battle@2x.png").anchor(0, 0);
        // duizhanIco.size(367, 284);
        // var duizhan = new FocusButton();
        // duizhanIco.to(duizhan).pp();
        // duizhan.ignoreContentAdaptWithSize(false);
        // duizhan.setContentSize(buyuIco.size());
        // duizhan.to(centerNode).pp(0.5, 0.65);
        // duizhan.mpFlag = 2;
        // duizhan.addTouchEventListener(this.onClickGameTypeBtn.bind(this));
        //
        // //多人
        // var duorenIco = new cc.Sprite("#middle_icon_duoren@2x.png").anchor(0, 0);
        // duorenIco.size(367, 284);
        // var duoren = new FocusButton();
        // duorenIco.to(duoren).pp();
        // duoren.ignoreContentAdaptWithSize(false);
        // duoren.setContentSize(buyuIco.size());
        // duoren.to(centerNode).pp(0.8, 0.65);
        // duoren.mpFlag = 3;
        // duoren.addTouchEventListener(this.onClickGameTypeBtn.bind(this));
        // // var duoren = new cc.Sprite("#middle_icon_duoren@2x.png").anchor(0.5,0.5);
        // // duoren.to(centerNode).pp(0.8,0.65);
        //
        // //休闲
        // var xiuxianIco = new cc.Sprite("#middle_icon_xiuxian@2x.png").anchor(0, 0);
        // xiuxianIco.size(367, 284);
        // var xiuxian = new FocusButton();
        // xiuxianIco.to(xiuxian).pp();
        // xiuxian.ignoreContentAdaptWithSize(false);
        // xiuxian.setContentSize(buyuIco.size());
        // xiuxian.to(centerNode).pp(0.35, 0.3);
        // xiuxian.mpFlag = 4;
        // xiuxian.addTouchEventListener(this.onClickGameTypeBtn.bind(this));
        // // var xiuxian = new cc.Sprite("#middle_icon_xiuxian@2x.png").anchor(0.5,0.5);
        // // xiuxian.to(centerNode).pp(0.35,0.35);
        //
        // //街机
        // var jiejiIco = new cc.Sprite("#middle_icon_jieji@2x.png").anchor(0, 0);
        // jiejiIco.size(367, 284);
        // var jieji = new FocusButton();
        // jiejiIco.to(jieji).pp();
        // jieji.ignoreContentAdaptWithSize(false);
        // jieji.setContentSize(buyuIco.size());
        // jieji.to(centerNode).pp(0.65, 0.3);
        // jieji.mpFlag = 0;
        // jieji.addTouchEventListener(this.onClickGameTypeBtn.bind(this));
        // var jieji = new cc.Sprite("#middle_icon_jieji@2x.png").anchor(0.5,0.5);
        // jieji.to(centerNode).pp(0.65,0.35);

        // 0街机， 1捕鱼， 2对战， 3多人， 4休闲

        return centerNode;
    },

    onClickGameTypeBtn: function (sender) {
        // console.log("onClickGameTypeBtn");

        this.onClickGameType(sender.mpFlag);
    },

    /**
     * 当点击了游戏类别时调用
     * @param index 18606994260
     */
    onClickGameType: function (index) {
        var name = ["街机", "捕鱼", "对战", "多人", "休闲"];

        //隐藏游戏分类
        this.gameTypeBox.hide();

        //显示具体游戏模块
        this.gameBox.show();

        //回到游戏分类图标显示
        this.backToGameTypeButton && this.backToGameTypeButton.show();

        //先把旧的 都删除了。
        this.gameBox.removeAllChildren();

        //等待排序的数组
        var tempArray = [];

        if (this.subGameIconMap) {
            for (var attr in mpGD.subGameInfoMap) {
                var gameInfo = mpGD.subGameInfoMap[attr];
                if (gameInfo) {
                    if (gameInfo.className == name[index]) {
                        var subGameIcon = this.subGameIconMap[gameInfo.moduleID];
                        tempArray.push(subGameIcon);
                    }
                }
            }
        }

        tempArray.sort(function (a, b) {
            return mpGD.subGameInfoMap[a.moduleID].sort - mpGD.subGameInfoMap[b.moduleID].sort;
        });

        // console.log("12222222222===========");
        for (var i = 0; i < tempArray.length; ++i) {
            // console.log(tempArray[i].resName);
            this.curSubGameIcons.push(tempArray[i]);
            this.gameBox.pushBackCustomItem(tempArray[i]);
            // this.gameBox.pushBackCustomFocusItem(tempArray[i]);
        }

        if (this.gameBox.getItems().length == 0) {
            ToastSystemInstance.buildToast("该分类暂时没有游戏!");
            this.gotoGameType();
            this.setFocusSelected(this.gameTypeBox.anis[index]);
        }
        else
            mpGD.mainScene.setFocusSelected(this.gameBox.getItems()[0]);

        // var items = this.gameBox.getItems();
        // for(var i = 0; i < items.length; i++){
        //     items[i].setNextFocus(this.headIcon, this.bottomButtons[9], i == 0?null:items[i - 1], i == items.length?null:items[i + 1]);
        // }
    },

    //具体游戏层
    buildGameBox: function (gameType) {

        var listView = new FocusListView();
        listView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);
        listView.setClippingEnabled(false);
        listView.setContentSize(mpV.w, 400);
        listView.setScrollBarEnabled(false);
        // listView.setInertiaScrollEnabled(false);

        listView.addEventListener(this.onGameBoxEvent.bind(this));


        listView.setItemsMargin(10);

        // var scrollBar = new MPScrollBar(listView).to(this).p(V.w / 2,180);

        return listView;
    },

    onEnter: function () {
        this._super();
        this.listenerCustomEvent();
        this.bindNetEvent();

        //切换成大厅的分辨率
        mpApp.switchScreen(native.SCREEN_ORIENTATION_LANDSCAPE, cc.size(mpV.w, mpV.h), mpV.ResolutionPolicy);
        //强制刷新信息
        mpApp.updateUserInfo();
        // 播放背景音乐
        SoundEngine.playBackgroundMusic("res/sound/dz_hall_background_music.mp3", true);

        this.umDuration = Date.now();
    },

    //监听网络事件
    bindNetEvent: function () {
        mpGD.netHelp.addNetHandler(this);
        mpGD.saNetHelper.addNetHandler(this, 'onCBNetEvent');
    },

    /**
     * 解除绑定网络事件
     */
    unbindNetEvent: function () {
        mpGD.netHelp.removeNetHandler(this);
        mpGD.saNetHelper.removeNetHandler(this);
    },

    //点击事件["充值", "商城", "背包", "摊位", "邮件", "活动", "排行", "保险柜", "客服", "设置", "游戏分类"];"商城", 
    buttonTouchEventListener: function (sender, type) {
        var nameArray = ["背包", "邮件", "活动", "排行", "保险柜", "客服", "设置", "游戏分类"];

        if (!G_OPEN_BOOTH || G_APPLE_EXAMINE) {
            ttutil.arrayRemove(nameArray, "摊位");
        }

        if (forReview) {
            ttutil.arrayRemove(nameArray, "充值");
            ttutil.arrayRemove(nameArray, "商城");
            ttutil.arrayRemove(nameArray, "背包");
            ttutil.arrayRemove(nameArray, "摊位");
            ttutil.arrayRemove(nameArray, "活动");
        }

        if (G_APPLE_EXAMINE) {
            ttutil.arrayRemove(nameArray, "活动");
            ttutil.arrayRemove(nameArray, "排行");
        }

        !G_OPEN_CUSTOMER_SERVICE && ttutil.arrayRemove(nameArray, "客服");

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.9);
                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                //商城
                if (sender.mpFlag == 999) {
                    new MPShopLayer().to(cc.director.getRunningScene());
                    break;
                }

                //充值
                if (sender.mpFlag == 888) {
                    this.onClickCZ(sender);
                    break;
                }

                // TV event
                if (nameArray[sender.mpFlag] != "游戏分类") {
                    mpGD.mainScene.pushDefaultSelectArray(sender);
                }
                sender.setScale(1);
                //游戏类别
                if (nameArray[sender.mpFlag] == "游戏分类") {
                    this.gotoGameType();
                }
                else if (nameArray[sender.mpFlag] == "设置") {
                    new MPSettingLayer().to(this);
                }
                else if (nameArray[sender.mpFlag] == "保险柜") {
                    if (mpGD.userInfo.twoPassword == false) {
                        new MPSettingPasswordLayer(MPSettingPasswordLayer.BankPassword, function () {
                            new MPBankLayer().to(cc.director.getRunningScene());
                        }).to(cc.director.getRunningScene());
                    }
                    else if (mpGD.userInfo.twoPassword == true) {
                        // if (G_PLATFORM_TV && mpGD.userInfo.twoPasswordType === 1) {
                        //     ToastSystemInstance.buildToast({text: "您设置的密码为图形密码，TV版暂不支持，请到手机端尝试！"});
                        //     return;
                        // }
                        // new MPBankInputPasswordLayer(mpGD.userInfo.twoPasswordType, function () {
                        //     new MPBankLayer().to(cc.director.getRunningScene());
                        // }).to(cc.director.getRunningScene());

                        new MPBankInputPasswordLayer(0, function () {
                            new MPBankLayer().to(cc.director.getRunningScene());
                        }).to(cc.director.getRunningScene());
                    }
                    else {
                        new MPBankLayer().to(cc.director.getRunningScene());
                    }
                }
                else if (nameArray[sender.mpFlag] == "排行") {
                    new MPRankLayer().to(this);
                }
                else if (nameArray[sender.mpFlag] == "邮件") {
                    new MPMessageLayer().to(this);
                }
                else if (nameArray[sender.mpFlag] == "客服") {
                    mpApp.openCustomerService();
                }
                else if (nameArray[sender.mpFlag] == "活动") {
                    new MPActivityLayer().to(cc.director.getRunningScene());
                }
                else if (nameArray[sender.mpFlag] == "充值") {
                    this.onClickCZ(sender);
                }
                else if (nameArray[sender.mpFlag] == "商城") {
                    // ToastSystemInstance.buildToast("即将开放，敬请期待");
                    new MPShopLayer().to(cc.director.getRunningScene());
                }
                else if (nameArray[sender.mpFlag] == "背包") {
                    // ToastSystemInstance.buildToast("即将开放，敬请期待");
                    new MPGoodsLayer().to(cc.director.getRunningScene());
                }
                else if (nameArray[sender.mpFlag] == "摊位") {
                    this.newChatLayer = new MPBoothLayer().to(cc.director.getRunningScene());
                }

                break;
            case ccui.Widget.TOUCH_CANCELED:
                sender.setScale(1);
                break;
        }
    },

    //回到游戏类别
    gotoGameType: function () {
        // console.log("game type");
        // this.setFocusSelected(this.gameTypeBox.anis[0]);
        this.curSubGameIcons = [];
        this.gameBox.hide();
        this.gameTypeBox.show();
        this.backToGameTypeButton && this.backToGameTypeButton.hide();

        this.lightAct && this.stopAction(this.lightAct);
        this.lightAct = null;
    },

    onGameBoxEvent: function (sender, type) {

        switch (type) {

            case ccui.ListView.ON_SELECTED_ITEM_START:

                var item = sender.getItem(sender.getCurSelectedIndex());
                if (item) {
                    // item.setSelected();
                }
                break;

            case ccui.ListView.ON_SELECTED_ITEM_END:
                var item = sender.getItem(sender.getCurSelectedIndex());
                if (item) {
                    item.onClicked();
                    // item.setNormal();
                }


                break;

            default:
                break;
        }
        // addCCSEventListener
    },

    //TODO:网络事件
    /**
     * 当网络事件来时
     * @param event
     * @param data
     */
    onNetEvent: function (event, data) {
        //console.log('2222222' + event);

        switch (event) {
            case mpNetEvent.GameList:
                mpApp.removeWaitLayer();
                this.onGameListMessage(data);
                break;
            case mpNetEvent.GameRoomList:
                var isSuccess = this.onRoomListMessage(data);
                if (!isSuccess) {
                    //进入子游戏失败 清除邀请数据
                    mpGD.inviteTable = null;
                }
                break;
            case mpNetEvent.SignRead:
                this.onSignReadMessage(data);
                break;
            case mpNetEvent.KickOut:        //被KO
                this.onKickOut(data);
                break;
            case mpNetEvent.PayStatus:      //充值消息
                this.onPayStatus(data);
                break;
            case mpNetEvent.Speaker:     //广播消息
                console.log('onSpeaker:' + JSON.stringify(data));
                this.onSpeaker(data);
                break;
            case mpNetEvent.UserInfoUpdate:
                mpApp.updateUserInfo(data);
                break;
            case mpNetEvent.UpdateGoods:
                mpApp.updateGoodsSet(data);
                break;
            case mpNetEvent.ReadVipConfig:
                mpGD.vipConfig = data;
                //读取VIP配置
                break;
            case mpNetEvent.ReadShareConfig:
                mpGD.shareConfig = data;
                break;
            case mpNetEvent.GetMailListTip:
                this.setUnReadMessageNum(data.msgCount);
                break;
            //系统公告
            case mpNetEvent.SystemNotice:
                if (!data.errMsg) {
                    this.onSystemNotice(data);
                }
                break;
            case mpNetEvent.ActivityRandomHongBao:
                if (!data.errMsg) {
                    this.onActivityRandomHongBao(data);
                }
                break;
            //道具配置 也就是商店咯
            case mpNetEvent.GetGoodsConfig:
                mpGD.goodsConfig = data.goodsConfig;

                for (var i = 0; i < mpGD.goodsConfig.length; ++i) {
                    mpGD.goodsConfigMap[mpGD.goodsConfig[i].id] = mpGD.goodsConfig[i];
                }
                break;
            case mpNetEvent.GetGoods:
                mpGD.goodsSet = data;
                break;
            case mpNetEvent.RoomInvitation:
                mpGD.inviteTable = data;
                if (data.moduleID) {
                    cc.eventManager.dispatchCustomEvent(mpEvent.EnterGameModules, {
                        moduleID: data.moduleID,
                    });
                }
                break;
            case mpNetEvent.RequestTakeCash:
                mpApp.removeWaitLayer();
                break;
            case mpNetEvent.OpenDailyAttendance:
                // TV版本不开启 [每日签到] 活动
                if (G_OPEN_DAILY_ATTENDANCE && !G_PLATFORM_TV) {
                    if (data !== null || data !== undefined) {
                        mpGD.dailyMap = data.dates;
                        if (data.isOpen) {
                            new MPDailyAttendanceLayer().to(cc.director.getRunningScene());
                        }
                    }
                }

                break;
            case mpNetEvent.VerifyUser:
                //这里可能是重连 然后在大厅收到的这个登录成功消息
                // setTimeout(function () {
                //     mpApp.removeWaitLayer();
                // }, 500);
                break;
            case "connect":
                // this.onConnect()
                break;
            case "disconnect":
                // this.onDisconnect()
                break;
            case mpNetEvent.ModifySetup:

                mpApp.removeWaitLayer();

                if (data.action == 1) {
                    if (!data.errMsg) {

                        mpApp.updateUserInfo({faceID: mpGD.userInfo.faceID, nickname: mpGD.userInfo.nickname});
                        ToastSystemInstance.buildToast("您的个人信息修改成功。");
                    }

                    if (this.wantToClose) {
                        this.close();
                    }
                }
                else if (data.action == 2) {
                    if (!data.errMsg && data.success == true) {
                        ToastSystemInstance.buildToast("修改密码成功, 请牢记您的新密码");

                        this.oldPasswordEditBox.setString("");
                        this.newPasswordEditBox.setString("");
                        this.confirmNewPasswordEditBox.setString("");

                    }

                }

                break;
            case mpNetEvent.ReadPayConfig:

                mpApp.removeWaitLayer();
                this.loadChargeData(data);
                // this.initTV();
                break;
            case mpNetEvent.RequestPay:
                mpApp.requestPayCallback(data, this);
                break;
            case mpNetEvent.GetUserRanking:
                mpApp.removeWaitLayer();
                this.loadRankData(data);
                // this.refreshFocus();
                break;


            case mpNetEvent.ForgotPassword:
                mpApp.removeWaitLayer();
                if (data.type == 2 && data.success == true) {
                    ToastSystemInstance.buildToast("设置新密码成功");
                    this.removeFirstLevelPanel();
                }
                break;

            case mpNetEvent.QueryBusiness:
                if (data.type == 3) {
                    // this.toUserEditLable.setString(data.info);
                    this.toUserName = data.info;
                    break;
                }
                mpApp.removeWaitLayer();
                if (data.success == true) {
                    switch (data.type) {
                        case 1:
                            // this.updateMXListView(data.data);
                            break;

                        case 4:
                            // this.updateHBListView(data.data);
                            break;
                    }
                }
                break;
        }
    },

    //TODO:移除第一层弹窗
    removeFirstLevelPanel:function () {
        var nowScene = cc.director.getRunningScene();
        var panel = nowScene.getChildByTag(100000000);
        panel &&  panel.removeFromParent();
    },

    /**
     *在这里收到连接消息 那应该是重连 就再发送下记录的登录账号信息
     */
    onConnect: function () {
        if (mpGD.saveLoginArgs) {
            cc.log("MPMainScene连接成功 请求玩家登录")
            mpGD.netHelp.requestLogin(mpGD.saveLoginArgs)  //重连

        }
    },

    onDisconnect: function () {

        var self = this;
        mpApp.showWaitLayer("正在请求重连服务器...");
        setTimeout(function () {
            mpGD.netHelp.reconnect();
        }, 1000);

    },

    //广播服务器处理函数
    onCBNetEvent: function (event, data) {

        switch (event) {
            case mpSANetEvent.SysBroadcast:
                // console.log("mpSANetEvent.SysBroadcast");
                // console.log(data);

                this.onSpeaker(data);
                break;


            case mpSANetEvent.UseBroadcast:
                if (data.errMsg) return;
                // console.log("mpSANetEvent.UseBroadcast");
                // console.log(data);

                this.onSpeaker(data);
                break;


        }
    },

    //设置未读邮件的数量
    setUnReadMessageNum: function (num) {
    console.log("================="+num);
        if (num == 0) {
            //this.messageBtn.unreadBG.hide();
            this.red_point.setVisible(false);
        }
        else {
            this.red_point.setVisible(true);
//            this.messageBtn.unreadBG.show();
//            this.messageBtn.unreadNum = num;
//            this.messageBtn.unreadNumLabel.setString(num);
        }
        //red_point.setVisible(false);
        //this.messageBtn.unreadBG.show();

    },

    //系统公告
    onSystemNotice: function (data) {
        for (var i = 0; i < data.length; ++i) {
            new MPSystemNoticeLayer(data[i]).to(cc.director.getRunningScene(),1000);
        }
    },

    //广播消息
    onSpeaker: function (data) {
        if (!G_APPLE_EXAMINE && data.msg) {
            this.scrollMsgLayer.pushScrollMsg(data);
        }
    },

    /**
     * 当被踢下线时。
     * @param data
     */
    onKickOut: function (data) {

        mpGD.netHelp.setLoginStatus(false);
        mpGD.saNetHelper.logout();

        //如果在子游戏中， 则要先退回大厅
        if (mpGD.userStatus.isPlaying) {

            //这个不好处理， 直接关大厅
            mpApp.closePlaza();
            return;
        }

        //如果在子游戏房间层， 则先退到大厅
        if (mpGD.userStatus.moduleID) {
            cc.director.popScene();
            mpApp.exitGameModules();
        }


        //直接加在mainScene, 会一层一层退回来， 如果已经 在子游戏， 不好处理， 则会直接 关大厅
        new MPMessageBoxLayer("下线通知", data.msg, mpMSGTYPE.MB_OK, mpApp.comeToLogon.bind(mpApp)).to(this);

    },

    /**
     * 当收到充值消息
     * @param data
     */
    onPayStatus: function (data) {

        MPQRCodeLayerInstance && MPQRCodeLayerInstance.close();
        _webViewInstance && _webViewInstance.close();

        //var message = "您花费【" + data.getRMB + "】元充值【" + (data.getAcer + data.getPresentAcer) + "】钻石，赠送【" + (data.getScore + data.getPresentScore) + "】" + CURRENCY + "已经到账了，请前往保险柜查收，钻石可前往商店购买道具,祝您游戏愉快。";
        //if (data.getAcer + data.getPresentAcer == 0)
        //    message = "您花费【" + data.getRMB + "】元充值【" + (data.getScore + data.getPresentScore) + "】" + CURRENCY + "已经到账了，请前往保险柜查收，祝您游戏愉快。";
		message = "您充值【" + (data.getScore + data.getPresentScore) + "】" + CURRENCY + "已经到账了，请前往保险柜查收，祝您游戏愉快。";
        new MPMessageBoxLayer("通知", message, mpMSGTYPE.MB_OK).to(this);

        //更新用户信息
        mpApp.updateUserInfo({
            acer: data.allAcer,
            paySum: data.allPaySum,
            memberOrder: data.memberOrder,
            score: data.allScore,
            bankScore: data.allBankScore
        });

        native.finish_paymentEvent(mpGD.userInfo.userID, data.orderID, data.getRMB, data.getRMB);
    },

    /**
     * 当游戏列表消息过来时触发
     */
    onGameListMessage: function (data) {

        var tempArray = [];

        for (var i = 0, len = data.length; i < len; ++i) {
            if (!FocusBase.isTVDevice() || verticalScreenGameArray.indexOf(data[i].moduleEnName) < 0) {
                var gameInfo = new mpSubGameInfo(data[i]);
                // console.log(gameInfo.gameName + "====" + gameInfo.classID);
                tempArray.push(gameInfo);
            }
        }
        

        mpGD.subGameInfoMap = [];
        for (var i = 0, len = tempArray.length; i < len; ++i) {
            mpGD.subGameInfoMap[tempArray[i].moduleID] = tempArray[i];
        }

        

        this.loadMPSubGameIcon(tempArray);
        this.subGameManager.initData();

    },

    /**
     * 签到消息
     * @param data
     */
    onSignReadMessage: function (data) {
        if (!data.isSigned) {
            this.signLayer && this.signLayer.removeFromParent();
            this.signLayer = new MPSignLayer().to(this, 100);
            this.signLayer.fillData(data);
        }
    },

    //是否有子游戏在下载
    isSubGameDowning: function () {

        for (var moduleID in mpGD.subGameInfoMap) {
            if (mpGD.subGameInfoMap[moduleID]) {
                var status = mpGD.subGameInfoMap[moduleID].status;
                if (status == mpSubGameStatus.Downloading || status == mpSubGameStatus.CheckUpdate || status == mpSubGameStatus.Loading || status == mpSubGameStatus.Playing || status == mpSubGameStatus.CheckNewVing) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * 房间列表过来时触发
     */
    onRoomListMessage: function (data) {
        mpApp.removeWaitLayer();

        if (data.errMsg) {
            return;
        }

        if (data.room.length <= 0) {
            //如果 没有房间 直接在这边过滤掉
            ToastSystemInstance.buildToast("当前没有可进入的房间.");
            return;
        }

        //如果没有子游戏正在下载
        if (!this.isSubGameDowning()) {
            cc.log("游戏无更新,正在加载js文件");

            var self = this;
            // //先加载好js文件
            mpApp.loadSubGameJsFiles(self.nowRequestModuleID, function () {
                var roomArray = data.room;

                var tempArray = [];
                for (var i = 0, len = roomArray.length; i < len; ++i) {
                    var roomInfo = new mpRoomInfo(roomArray[i]);
                    roomInfo.moduleID = self.nowRequestModuleID;
                    if(roomInfo.hideRoom!=1)
                    {
                        tempArray.push(roomInfo);
                    }
                }

                tempArray.sort(function (a, b) {
                    return a.sortID > b.sortID ? 1 : -1
                });
                //运行子游戏的 roomScene
                
                mpApp.runSubGameRoomScene(self.nowRequestModuleID, tempArray);
            }, function () {
                mpApp.removeWaitLayer();
            });
            return true;
        }
        else {
            ToastSystemInstance.buildToast("有子游戏正在下载， 请稍候");
        }
    },

    onExit: function () {
        this._super();

        //判断是否在游戏中， 如果在游戏中， 那就不释放网络监听， 这样可能 网络监听会被多次增加， 但多次增加有判定， 会过滤


        if (!mpGD.userStatus.moduleID) {
            this.unbindNetEvent();
        }

        if (this.newChatLayer) {
            this.newChatLayer.removeFromParent();
            this.newChatLayer = null;
        }


        cc.eventManager.removeListener(this.onExitGameModulesListener);
        cc.eventManager.removeListener(this.onSubGameStatusUpdateListener);
        cc.eventManager.removeListener(this.onEnterGameModulesListener);
        cc.eventManager.removeListener(this.onUserInfoUpdateListener);
        //不能放在这， 因为调用 onExit有很多种情况， 并非一被要被析构
        //mpGD.mainScene = null;


    },

    /**
     * 监听自定义事件
     */
    listenerCustomEvent: function () {

        var self = this;
        this.onSubGameStatusUpdateListener = cc.eventManager.addCustomListener(mpEvent.SubGameStatusUpdate, function (event) {
            var data = event.getUserData();
            self.subGameIconMap[data.moduleID].setStatus(data.status, data.otherInfo);
        });

        this.onExitGameModulesListener = cc.eventManager.addCustomListener(mpEvent.ExitGameModules, this.onExitGameModules.bind(this));

        this.onEnterGameModulesListener = cc.eventManager.addCustomListener(mpEvent.EnterGameModules, this.onEnterGameModules.bind(this));

        this.onUserInfoUpdateListener = cc.eventManager.addCustomListener(mpEvent.UpdateUserInfo, this.updateUserInfo.bind(this));
    },

    /**
     * 退出游戏模块事件
     * @param event
     */
    onExitGameModules: function (event) {

        //下一帧执行
        this.runAction(cc.callFunc(function () {

            if (mpGD.userStatus.moduleID == null)
                return;

            //清除使用的资源
            mpApp.clearAllRes();

            mpApp.clearSubGameJsFiles(mpGD.userStatus.moduleID);
            //////////////////////////////////////////////////////////
            //把状态再标识为准备状态
            mpGD.subGameInfoMap[mpGD.userStatus.moduleID].status = mpSubGameStatus.Ready;
            mpGD.mainScene.subGameIconMap[mpGD.userStatus.moduleID].status = mpSubGameStatus.Ready;
            //加载大厅所需要的 spriteFrames
            mpApp.loadHallSpriteFrames();


            mpGD.userStatus.roomID = null;
            mpGD.userStatus.moduleID = null;
        }));
    },

    //当子游戏准备好了， 且 并被点击
    //即， 进入游戏模块事件
    onEnterGameModules: function (event) {

        var data = event.getUserData();

        var moduleID = data.moduleID;


        mpApp.showWaitLayer("正在加载房间...");

        //直接请求房间列表， 等列表过来了， 再决定要不要加载js文件
        mpGD.netHelp.requestRoomList(moduleID);
        // //先加载好js文件
        // mpApp.loadSubGameJsFiles(moduleID, function () {
        //     mpGD.netHelp.requestRoomList(moduleID);
        // }, function () {
        //     mpApp.removeWaitLayer();
        // });


        this.nowRequestModuleID = moduleID;
        //this.roomLayer = new MPR
    },


    loadMPSubGameIcon: function (tempArray) {
        this.subGameIconMap = [];
        tempArray.sort(function (a, b) {
            return mpGD.subGameInfoMap[a.moduleID].sort - mpGD.subGameInfoMap[b.moduleID].sort;
        });
        var bigItemSize = cc.size(228,352);
        var smallItemSize = cc.size(226,176);
        for (var i = 0; i < tempArray.length; ++i) {
            var subIndex = tempArray[i].moduleID;
            var icon = new MPSubGameIcon(subIndex,i % 5 == 0 && i != 10 ? bigItemSize : smallItemSize);
            //多引用一次, 缓存住, 但这边会造成 内在泄露， 未解决（初步想法弄一个隐藏node挂在场景里， 然后把这些东西都挂在那个node下， 需要用到时， 再从node那边取下来， 不用时再挂上去, 略麻烦)
            //另一种是直接按类别个数生成对应的node， 点击哪个， 显示哪个， 隐藏其它
            icon.retain();

            this.subGameIconMap[subIndex] = icon;
        }
        // console.log('xxxooo:' + this.subGameIconMap.length);
        this.gameContent = this.buildGameContent(tempArray);
        // this.gameContent.to(this.bottomBox).pp(0.5,0.5);
        //this.buildSubgameIcon();
    },

    updateUserInfo: function () {

        console.log('xx22:');
        console.log(mpGD.userInfo.nickname);

        this.topBox.setNickname(mpGD.userInfo.nickname);
        this.topBox.setScore(ttutil.formatMoney(mpGD.userInfo.score));
        this.topBox.setFace(mpGD.userInfo.faceID);

        if (!G_APPLE_EXAMINE) {
            // this.topBox.vipIcon.setVipLevel(mpGD.userInfo.memberOrder);
        }


    },

    // 子游戏依次播放光效
    subGameIconPlayLightEffect: function (index) {
        var icon = this.curSubGameIcons[index];
        index++;

        icon && icon.playLightEffetc();
        this.lightAct && this.stopAction(this.lightAct);

        this.lightAct = cc.sequence(cc.delayTime(1.5), cc.callFunc(function () {
            var iconNum = this.curSubGameIcons.length;
            index = index > iconNum ? 0 : index;

            icon && icon.stopLigthEffect();
            this.subGameIconPlayLightEffect(index);
        }.bind(this)));

        this.runAction(this.lightAct);
    },

    /**
     * 随机红包活动
     * @param data
     */
    onActivityRandomHongBao: function (data) {

        //发红包
        if (data.msgType == 1) {


            new MPHongBaoLayer(data).to(cc.director.getRunningScene(), 120);


        }
        //抢红包操作的反馈
        else if (data.msgType == 2) {

        }

    }

});
