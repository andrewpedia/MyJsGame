/**
 * Created by 真心科技 on 2016/1/29.
 */


/**
 * 子游戏状态
 * @type {{UnInstall: number, Downloading: number, CheckUpdate: number, Loading: number, Ready: number, Playing: number}}
 */
var mpSubGameStatus = {
    UnCheck: 0,                 //未检查状态
    UnInstall: 1,               //未安装
    Downloading: 2,             //正在下载
    CheckUpdate: 3,             //正在检查更新
    Loading: 4,                  //正在加载
    Ready: 5,                   //已准备状态
    Playing: 6,                  //正在玩状态
    DownloadFail: 7,            //下载失败
    CheckNewVing: 8             //检测新版本状态
};


var mpWaitLayerTag = 72377271;

/**
 * 大厅事件
 * @type {{}}
 */
var mpEvent = {
    SubGameStatusUpdate: "SGSU",                             //子游戏状态变化通知
    SubGameUpdateFinishAndClicked: "SGUFAC",               //当子游戏处于准备状态， 并且被点击到
    EnterGameModules: "EnterGM",                              //进入游戏模块事件
    ExitGameModules: "ExitGM",                               //退出游戏模块事件

    EnterGameRoom: "EnterGR",                               //点击进入房间
    ExitGameRoom: "ExitGR",                                 //点击退出房间

    UpdateUserInfo: "UUI",                                   //更新用户信息
};


//登录方式
var mpLoginType = {
    None: 0,
    Account: 1,    //普通账号
    GuestID: 2,      //游客
    QQID: 3,          //qq登录
    WXCode: 4,           //WX登录
    AccountScanType: 5,  //扫码登录
};

// 保险柜密码验证方式
var mpPasswordType = {
    Plaintext: 0,       // 纯文本密码
    Graphical: 1,       // 图形密码
};

//充值类型
var mpCZType = {
    ZFB: 1,         //支付宝
    WX: 2,          //微信
    IAP: 3,         //苹果内购
};

/**
 * 玩家状态常量
 * @type {{}}
 */
var MPUserStatusConst = {
    US_NULL: 0x00,                      //没有状态 基本就是断开了
    US_FREE: 0x01,                      //站立状态 大厅闲逛中
    US_SIT: 0x02,                       //坐下状态
    US_READY: 0x03,                     //同意状态
    US_LOOKON: 0x04,                    //旁观状态
    US_PLAYING: 0x05,                   //游戏状态
    US_OFFLINE: 0x06,                   //断线状态

    //以下状态，同步协调服用
    SIT_READY: 0x00,                    //坐下准备接受游戏服务器信息
    SIT_SUCCESS: 0x01                   //游戏服务器返回信息 表示成功
};

/**
 * 网络事件 必须在这声明
 * @type {{VerifyUser: string}}
 */
var mpNetEvent = {
    Ping: "Ping",                       //ping
    Pong: "Pong",                       //ping
    InGame: "InGame",                       //在游戏中返回 房间,桌子,座位
    ErrorArgs: "ErrorArgs",                       //ping
    VerifyUser: "VerifyUser",                   //用户登录
    GameList: "GameList",                       //游戏列表
    SelfCreateGameList:"SelfCreateGameList",   //自建房间游戏列表
    GameRoomList: "GameRoomList",              //房间列表
    GameCreateRoomList:"GameCreateRoomList",  //自建房间列表
    KickOut: "KickOut",                         //你的号被别人顶下来， 会收到这个信息
    EnterRoom: "UserRoomIn",                    //用户进入房间
    LeaveRoom: "UserRoomOut",                  //用户离开房间
    EnterGame: "UserSitdown",                  //用户坐下,
    Logout: "Logout",                            //登出
    SignRead: "SignRead",                        //读取签到
    SignWrite: "SignWrite",                        //签到
    PayStatus: "PayStatus",                       //充值消息
    Speaker: "Speaker",                   //广播消息
    UserInfoUpdate: "UserInfoUpdate",           //用户信息更新
    GetMailList: "GetMailList",                 //得到邮箱列表
    ReadSystemMail: "ReadSystemMail",           //读取邮件
    WriteSystemMail: "WriteSystemMail",           //操作邮件
    GetRandomName: "GetRandomName",              //获取随机昵称
    PhoneReg: "PhoneReg",                           //手机注册账号
    GetScoreRank: "GetScoreRank",                 //得到分数排行 
    ModifySetup: "ModifySetup",                 //修改个人信息
    BindAccount: "BindAccount",                  //游客或QQ登录/微信登录 绑定账户 或 绑定微信 qq登录 或解绑
    VerifyTwoPassword: "VerifyTwoPassword",      //验证二级密码
    VerifyQuestion: "VerifyQuestion",               //验证密保
    BankBusiness: "BankBusiness",                   //保险柜业务
    TransferMoney: "TransferMoney",                 //打赏
    ReadVipConfig: "ReadVipConfig",                 //读取VIP配置
    QueryBusiness: "QueryBusiness",                 //查询保险柜明细
    ForgotPassword: "ForgotPassword",                //登录密码找回
    ForgotTwoPassword: "ForgotTwoPassword",                //保险柜密码找回
    GetMailListTip: "GetMailListTip",               //查询未读消息
    GetRebate: "GetRebate",                            //领取返利
    ReadPayConfig: "ReadPayConfig",                 //读取充值配置
    RequestPay: "RequestPay",                          //请求支付
    RequestTakeCash: "RequestTakeCash",             //请求领取现金红包
    GameRoomUsers: "GameRoomUsers",                 //请求房间的玩家列表
    UserOnlineList: "UserOnlineList",               ////通知客户端玩家列表更新玩家进入
    UsersGameStatus: "UsersGameStatus",             //用户的游戏状态改变
    RoomUserInfoUpdate: "RoomUserInfoUpdate",       //游戏房间里的用户信息更新
    SystemConfig: "SystemConfig",                   //系统配置
    SystemNotice: "SystemNotice",                    //系统公告
    EnterPlazaMain: "EnterPlazaMain",                //进入大厅MAIN界面
    CodeAddr: "CodeAddr",                              //注册码的验证地址
    GetGoodsConfig: "GetGoodsConfig",               //获取道具配置
    BuyGoods: "BuyGoods",                           //购买道具
    UpdateGoods: "UpdateGoods",                     //更新道具
    GetGoods: "GetGoods",                           //获取道具(背包)
    OpenDailyAttendance: "OpenDailyAttendance",     //开启每日签到页面
    DailyAttendance: "DailyAttendance",             //日常签到
    Jqueryrotate: "Jqueryrotate",                   //转盘抽奖
    HistoricRecord: "HistoricRecord",               //查询历史成绩

    ReadActivity: "ReadActivity",                    //读取活动
    ReadShareConfig: "ReadShareConfig",             //读取分享奖励表
    WXLoginCode: "WXLoginCode",                     //微信code
    WXWebLoginAddr: "WXWebLoginAddr",               //获取微信登录的地址
    GetLastSharePrizeDrawList: "GetLastSharePrizeDrawList",       //获取往期的分享获奖名单

    //////////////////////////////////////////////////////////////////////////////////////////////
    DuoBaoGetPrizeInfo: "DuoBaoGetPrizeInfo",       //夺宝-获取宝物信息
    DuoBaoDoDuoBao: "DuoBaoDoDuoBao",           //夺宝-夺宝操作
    DuoBaoOutDuoBao: "DuoBaoOutDuoBao",              //夺宝-退出夺宝
    DuoBaoEnterDuoBao: "DuoBaoEnterDuoBao",            //夺宝-进入夺宝
    DuoBaoUpdateInfo: "DuoBaoUpdateInfo",            //夺宝-更新宝物信息

    DuoBaoGetPrizeLog: "DuoBaoGetPrizeLog",            //夺宝-更新宝物信息
    DuoBaoGetPrizeBetStat: "DuoBaoGetPrizeBetStat",            //夺宝-更新宝物信息
    //////////////////////////////////////////////////////////////////////////////////////////////
    GenerateMobileCode: "GenerateMobileCode",           //生成手机验证码
    ///////////////////////////////////////////////////////////////////////////////////////////////
    SetRecommendGameID: "SetRecommendGameID",           //填写推荐人
    //////////////////////////////////////////////////////////////////////////////////////////////
    SetMobileVerifyLevel: "SetMobileVerifyLevel",           //设定手机验证级别， 0表示不验证， 1表示在陌生设备上登录需要验证， 2表示每次都验证
    //////////////////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////////////////////////
    ActivityRandomHongBao: "ActivityRandomHongBao",             //后台随机赠送红包活动 抢红包内容交互
    TakeActivityRechargeRebate: "TakeActivityRechargeRebate",   //领取充值天天送奖励
    TakeActivityWXFXJZ: "TakeActivityWXFXJZ",   //领取微信分享集赞活动
    TakeActivityRedPackRainLog: "TakeActivityRedPackRainLog",   //获取红包雨记录
    ScanQRLogin: "ScanQRLogin",   //扫码登录
    UseMobQuery: "UseMobQuery",     // Mob查询信息
    UseGoods: "UseGoods",           // 使用道具
    GoodsPayStatus: "GoodsPayStatus",         //充值购买道具

    //////////////////////////////////////////////////////////////////////////////////////////////
    GameRoomTables: "GameRoomTables",                          //监听请求房间所有桌子列表
    TableStatus: "TableStatus",                                //获取桌子状态
    RoomInvitation: "RoomInvitation",                            //房间邀请
    TableUuid: "TableUuid",                                      //桌子的uuid
    PayCash: "PayCash",                                  //兑换现金
    //////////////////////////////////////////////////////////////////////////////////////////////
    TakePrizeCodeReward: "TakePrizeCodeReward",         //兑换邀请码
    //////////////////////////////////////////////////////////////////////////////////////////////
    StoreGoods: "StoreGoods",  //摊位物品
    StoreAdd: "StoreAdd", //上架物品
    StoreDec: "StoreDec", //下架物品
    StoreGet: "StoreGet", //获取商店
    StoreBuy: "StoreBuy", //摊位购买
    StoreBatchBuy: "StoreBatchBuy", //摊位批量购买
	DrawMoney:"DrawMoney", //兑换请求
    MyQuestion:"MyQuestion", //用户问题
    DrawMoneyLog:"DrawMoneyLog", //兑换记录

    GetProxyInfo:"GetProxyInfo", //代理基本信息
    GetProxyYeji:"GetProxyYeji", //获取我的业绩
    GetProxyPlayer:"GetProxyPlayer",   //代理获取我的玩家数据
    GetProxyLastWeekInfo:"GetProxyLastWeekInfo",   //代理获取我的奖励数据
    GetLingquJiangli:"GetLingquJiangli",  //请求领取过奖励数据
    ProxyTixian:"ProxyTixian", //代理申请提现操作

    JoinGameByPass:"JoinGameByPass", //通过密码加入游戏
    SitdownByPass:"SitdownByPass", //密码正确请求坐下

    BindLastProxyID:"BindLastProxyID",//手动绑定上级代理
    CheckLastProxyID:"CheckLastProxyID", //检查上级代理是否存在
};

/**
 * server Assist chat service net event
 */
var mpSANetEvent = {
    Login: "Login",                 //验证用户
    Logout: "Logout",               //登出
    SysBroadcast: "SysBroadcast",    //system broadcast

    UseBroadcast: "UseBroadcast",    //使用喇叭  流程 c -> sa  -> s  -> sa - > c
    // UseMobQuery: "UseMobQuery",
    GetShareOrder: "GetShareOrder",                  //获取分享订单
    ShareResult: "ShareResult",                        //微信 分享结果
    SubgameChat: "SubgameChat",          //子游戏聊天
    AddFriend: "AddFriend",  //添加好友
    DelFriend: "DelFriend",  //删除好友
    FriendChat: "FriendChat", //好友聊天
    GetVoiceMsg: "GetVoiceMsg", //获取语音消息
    UserFeedback: "UserFeedback", //玩家反馈
    GetChatLog: "GetChatLog", //玩家获取聊天信息记录
    SureAddFriendRequest: "SureAddFriendRequest", //同意好友请求
    RefuseAddFriendRequest: "RefuseAddFriendRequest", //同意好友请求
    AddFriendByGameID: "AddFriendByGameID", //通过gameid添加好友
    AddFriendByQRCode: "AddFriendByQRCode", //扫描二维码添加好友
    GetFriendList: "GetFriendList", //获取好友列表
    GetFriendRequest: "GetFriendRequest", //获取好友请求


    SystemMessage: "SystemMessage", //系统消息
    GetRanking: "GetRanking",                            //获取排名
    SendFeedback: "SendFeedback",       //发送反馈

    CodeAddr: "CodeAddr", //验证码

    GetFriendStoreList: "GetFriendStoreList",   //获取好友摊位列表
    GetStoreRanking: "GetStoreRanking",          //获取商店排行
    GetUserRanking: "GetUserRanking",              //玩家新人排行榜
    HeHuoChaiHongBaoGenerate: "HeHuoChaiHongBaoGenerate",              //玩家新人排行榜


    ReadPayConfig: "ReadPayConfig",                 //读取充值配置
    GetVipPayList:"GetVipPayList",  //读取vip充值代理列表
    RequestPay:"RequestPay",

    KefuNumber:"KefuNumber", //客服号码
};

var mpGoodsID = {
    Broadcast: 1,           // 喇叭
    Weather: 2,             // 天气预报
    Mobile: 3,              // 手机号码归属地
    Postcode: 4,            // 邮编
    Calendar: 5,            // 万年历
    TariffeCard1: 6,        // 1元话费卡
    TariffeCard5: 7,        // 5元话费卡
    TariffeCard10: 8,       // 10元话费卡
    RoomCard: 9,            // 房卡
    RedPacket: 10,          // 推广红包
    VivoX9sPlus: 11,        // vivo X9s Plus
    RomossPortablePower: 12,    // 罗马仕移动电源
    GoodsCertificates: 13,   // 物品兑换券
    RetroactiveCard: 17,    // 补签卡
    RenameCard: 18,         // 改名卡
    CoinPackage1: 20,         // 一元金币礼包
    CoinPackage10: 21,        // 十元金币礼包
    CoinPackage100: 22,       // 百元金币礼包
    CoinPackage1000: 23,      // 千元金币礼包
    TariffeCard50: 24,        // 50元话费卡
    TariffeCard100: 25,       // 100元话费卡
};

var TableLockStatus = {
    unlock: 0,                  //未加锁
    readyLock: 1,               //准备加锁
    lock: 2                     //已经加锁
};

// 聊天频道类型
var ChannelType = {
    System: 1,   //系统频道
    Friend: 2,   //好友频道
    Feedback: 3, //反馈频道
    Room: 4,     //房间频道
};

var MessageType = {
    voice: 1,  //语音消息
    text: 2,    //文字消息
};

var DailyAttendanceType = {
    SignIn: 0,          // 签到
    Retroactive: 1,     // 补签
};

var AddFrendEvent = {
    sendRequest: 1,   //发送好友请求成功
    isFriendAlready: 2, //对方已是好友
    refuseReceiveRequest: 3, //对方不再接收您的好友请求
    inRequestCD: 4,  //好友发送请求CD中
    requestLimit: 5,  //好友请求上限
    receiveRequest: 6  //收到好友请求
};

// 商城功能类型
var ShopFunctionType = {
    Buy: 0,                 // 购买区
    Prize: 1,               // 兑奖区
};

//0表示坐下失败, 1表示 玩， 2表示旁观, 3表示需要提供密码， 4表示密码错误 , 0, 3, 4都是失败
//用户坐下结果返回码
var SitdownResultCode = {
    FAIL_SYS: 0,              //失败， 位置被锁或者不存在
    SUCCESS_PLAYING: 1,      //成功，表示在玩
    LOCK_ERROR: 2,            //加锁失败
    PWD_REQUIRED: 3,         //需要密码
    PWD_ERROR: 4,           //密码错误
};