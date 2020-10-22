/**
 * Created by 真心科技 on 2016/1/27.
 */
console.log("loading mpJsFiles")

var mpJsFiles = [

    "src/main/module/MPBaseModuleLayer.js",
    //通用的
    "src/extend/AudioEngineExtend.js",
    "src/extend/Storage.js",
    "src/extend/CCBootExtend.js",
    "src/extend/CCNodeExtend.js",
    "src/extend/CCEditBoxExtend.js",
    "src/extend/CCEventManagerExtend.js",
    "src/extend/CCArmatureAnimationExtend.js",
    "src/extend/CoinEffect.js",
    "src/extend/SoundEngine.js",
    "src/extend/ToastSystem.js",
    "src/extend/Util.js",
    "src/extend/Native.js",
    "src/extend/ClassPool.js",
    "src/extend/MPMessageBoxLayer.js",
    "src/extend/MPRichText.js",
    "src/extend/CCLabelExtend.js",
	"src/extend/PlayerOnlineLayer.js",
    // 调整加载顺序
    "src/extend/FocusClick.js",
    "src/extend/FocusBase.js",
    "src/extend/FocusListener.js",
    "src/extend/FocusButton.js",
    "src/extend/FocusSprite.js",
    "src/extend/FocusScrollView.js",
    "src/extend/FocusListView.js",
    "src/extend/FocusSlider.js",
    "src/extend/FocusExtend.js",
    "src/extend/FocusEditBox.js",
    "src/extend/FocusLoadingScene.js",
    "src/extend/ComLoadingLayer.js",
    "src/extend/ComExitLayer.js",
    "src/extend/RoomCodeLayer.js",
    "src/extend/SecurityCodeLayer.js",
    "src/extend/sha1.js",
    "src/extend/md5.js",
    "src/extend/crypto-js.js",
    "src/extend/Heartbeat.js",
    "src/extend/QRCodeLayer.js",
    "src/extend/WebViewLayer.js",
    "src/extend/HistoricRecordLayer.js",

    "src/extend/ChatMoudle.js",
    "src/extend/core/ClientKernel.js",
    //////////////////////////////////////////////////////////////////////////////////
    "src/common/MPUtil.js",
    "src/common/Vo.js",
    "src/common/QRCodeScanner.js",
    //////////////////////////////////////////////////////////////////////////////////
    "src/scene/MPFocusIP2Scene.js",
    "src/scene/MPFocusLoginScene.js",
    "src/scene/MPFocusMainScene.js",
    "src/scene/MPLoadingScene.js",
    "src/scene/MPBaseRoomScene.js",
    "src/net/NetUtil.js",
    "src/MPGNativeInfo.js",
    "src/MPConfig.js",
    "src/MPDefine.js",
    "src/MPResource.js",
    "src/MPApp.js",

    "src/net/Connector.js",
    "src/net/NetHelp.js",

    "src/net/services/SANetHelper.js",
    "src/net/services/ChatEventHelper.js",

    ////////////////////////////大厅某些层////////////////////////////////////////////////////////

    //登录场景
    "src/login/MPLoginScene.js",
    "src/login/MPLoginLayer.js",
    "src/login/MPRegisterLayer.js",
    "src/login/MPShowProtocol.js",
    ///////////////////////////////////////////////////////////////////////////////////
    //主场景
    "src/main/MPMainScene.js",
    "src/main/MPSubGameManager.js",
    "src/main/MPSubGameIcon.js",
    "src/main/MPScrollBar.js",
    "src/main/MPDropDownListBox.js",                    // 下拉列表框
    "src/main/MPPatternFrame.js",                    // 图形密码框
    "src/main/MPDatePicker.js",                         // 日期选择器
    "src/main/module/MPWebViewLayer.js",       //网页
    "src/main/module/MPSettingLayer.js",
    "src/main/module/MPBankLayer.js",
    "src/main/module/MPTellerLayer.js",
    "src/main/module/MPPersonalCenterLayer.js",
    "src/main/module/MPRankLayer.js",
    "src/main/module/MPMessageLayer.js",
    "src/main/module/MPSettingPasswordLayer.js",
    "src/main/module/MPInputPasswordLayer.js",
    "src/main/module/MPBankInputPasswordLayer.js",
    "src/main/module/MPVipConfigLayer.js",
    "src/main/module/MPBankTransferRecordLayer.js",
    "src/main/module/MPBankTransferCertificatesLayer.js",
    "src/main/module/MPRechargeLayer.js",
    "src/main/module/MPSystemNoticeLayer.js",           //系统公告
    "src/main/module/MPBankHongBaoLayer.js",             //红包转出
    "src/main/module/MPGoodsOrderLayer.js",      //实物商品下单
    "src/main/module/MPGoodsOrderDetailLayer.js",            //实物订单详情
    "src/main/module/MPGoodsOrderCertificatesLayer.js",     //实物订单凭证
    "src/main/module/activity/MPActivityLayer.js",               //活动界面
    "src/main/module/activity/MPDuoBaoLayer.js",               //夺宝界面
    "src/main/module/activity/MPHongBaoLayer.js",               //抢红包界面
    "src/main/module/activity/MPJuHuiTuiJianInputLayer.js",
    "src/main/module/MPGoodsLayer.js",                  //背包
    "src/main/module/MPShopLayer.js",                   //商店
    "src/main/module/MPGoodsUseBroadcastLayer.js",      //使用喇叭
    "src/main/module/MPGoodsUseMobQueryLayer.js",        //查询天气
    "src/main/module/MPGoodsUseTariffeCardLayer.js",     //话费卡充值
    "src/main/module/MPGoodsBuyLayer.js",                //道具充值购买
    "src/main/module/MPDailyAttendanceLayer.js",     //签到页面
    "src/main/module/MPJqueryrotateLayer.js",     //抽奖转盘页面
    "src/main/module/MPStoreBoxLayer.js",              //卖东西弹出框
    "src/main/module/MPStoreLayer.js",                 //玩家摊位

    "src/main/module/MPChatLayer.js",                   //聊天层，只支持喇叭道具
    "src/main/module/MPSafeMobileLayer.js",            //安全手机
    // "src/main/module/MPNewChatLayer.js",            //新聊天层
    "src/main/module/MPBoothLayer.js",                 //摊位界面
    "src/main/module/MPCoinDetailLayer.js",           //身上金币详情
    ///////////////////////////////////////////////////////////////////////////////////
    "src/main/module/MPNewUserAwardLayer.js",           //新用户赠送金币
    "src/main/module/MPRegisterGiveGoldLayer.js",       //注册赠送金币
    "src/main/module/MPMainArrowLayer.js",              //控制箭头
    "src/main/module/MPTipLayer.js",                    //提示

    "src/main/module/MPMainEXCHLayer.js",               //兑换
    "src/main/module/MPMainBindAlipayLayer.js",         //绑定支付宝
    "src/main/module/MPMainBindBankLayer.js",           //绑定银行卡
    "src/main/module/MPMainChargeLayer.js",             //充值
    "src/main/module/MPMainContactAgentLayer.js",       //充值
    "src/main/module/MPMainChargeReportLayer.js",       //充值
    "src/main/module/MPMainNoticeLayer.js",             //公告

    "src/main/module/MPMainNoticeDetailLayer.js",       //公告
    "src/main/module/MPMainVipLayer.js",                //vip
    "src/main/module/MPMainProxyLayer.js",              //proxy
    "src/main/module/MPMainRankLayer.js",               //排行榜
    "src/main/module/MPMainBankPasswordLayer.js",       //设置保险柜密码
    "src/main/module/MPMainBankBoxLayer.js",            //保险柜
    "src/main/module/MPMainInputBankPasswordLayer.js",  //输入保险柜密码
    "src/main/module/MPMainPersonalLayer.js",           //个人中心
    "src/main/module/MPMainPersonalChangeAvatarLayer.js",           //修改头像
    "src/main/module/MPMainPersonalLogoutLayer.js",                 //登出
    "src/main/module/MPMainPersonalSettingLayer.js",                //设置
    "src/main/module/MPMainTuiGuangLayer.js",                       //推广
    "src/main/module/MPMainPersonalChangeNickNameLayer.js",         //修改昵称
    "src/main/module/MPMainRoomCreateLayer.js",         //创建房间
    "src/main/module/MPMainRoomJoinLayer.js",         //加入房间
    "src/main/module/MPMainRoomGameUpdateTipLayer.js",         //加入或创建房间 需要更新游戏的提示
    "src/main/module/MPMainRoomGameUpdateLayer.js",         //更新游戏的进度
    "src/main/module/MPMainDailiInputBoxLayer.js",                 //输入邀请码提示框
    ////////////////////////////////////////////////////////////////////////////

    "src/layer/MPScrollMsgLayer.js",    //消息滚动层

    "src/layer/MPWaitLayer.js",
    "src/layer/MPCodeLayer.js",             //验证码层
    "src/layer/MPQRCodeLayer.js",
    "src/roomInfo/MPFocusTableScene.js",
    "src/roomInfo/MPBaseTableScene.js", //桌子场景层
    "src/roomInfo/MPTableScene.js", //桌子场景层
    "src/roomInfo/MPTableConfig.js", //桌子配置
    "src/layer/MPFindPasswordLayer.js",

    "src/main/module/MPDrawMoneyRecordLayer.js",                //兑换记录
    "src/main/module/MPBankDetailRecordLayer.js",                //银行明细

    //////////////////////////////////////////////////////////////////////////////////
];

if (typeof cc != "undefined" && typeof cc.sys != "undefined" && !cc.sys.isNative) {
    mpJsFiles.push("frameworks/cocos2d-html5/jsb_apis.js");
    mpJsFiles.push("src/extend/jsb_cocos2d_extension.js");
}

if (typeof module != "undefined") {
    console.log("export mpJsFiles")
    module.exports.mpJsFiles = mpJsFiles;
}

