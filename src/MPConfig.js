/**
 * Created by 真心科技 on 2015/11/27.
 */

//是否是发布模式
var PUBLIC_MODE = true;

var nonHttps = true;

var domain = "086.fa256.cn";

var apiDomain = "086.fa256.cn:8012"; //获取地址的服务地址（wxService)

//var hotUpdateDomain = "103.219.105.189";
var hotUpdateDomain = "086.fa256.cn:81";

// var backupUrl="http://appdown.l2537.com/"; //备用网址
var backupUrl="http://086.fa256.cn/"; //备用网址

var gameListUrl = "http://086.fa256.cn:81/server.json";

var frontDomain = domain;



var officialWebsite = (nonHttps ? "http://" : "https://") + "086.fa256.cn:82";

var productName = "金海娱乐";


var imagesPre = "jinhai";  //图片前缀用于区分金海和感觉

var CURRENCY = "元";

var channel = native.getUmengChannel();

var mpNetConfig = {
    url: [(nonHttps ? "ws://" : "wss://") + domain + ":12721"],         //可以是数组 [domain1, domain2]
    cbURL: [(nonHttps ? "ws://" : "wss://") + domain + ":16922"],      //可以是数组 [domain1, domain2]
    namespace: "/Client",
    signUrl: null,//nonHttps ? "http://" + domain + ":17998" : "https://" + domain + ":17999",
    mobUrl: null//nonHttps ? "http://" + domain + ":17998" : "https://" + domain + ":17999"
};

// 游戏通用资源
var commonRes = {
    btnClick: "res/allcommon/click.mp3",
    winCoin: "res/allcommon/mega_win_coins.mp3",
    commonPlist: "res/allcommon/common.plist",
};

//设计分辨率
var mpV = {
    w: 1280,
    h: 720,
    ResolutionPolicy: cc.ResolutionPolicy.SHOW_ALL
};

mpV.width = mpV.w;
mpV.height = mpV.h;

//子游戏的分辨率
var V = {
    w: 1280,
    h: 720,

};
V.width = V.w;
V.height = V.h;


var GFontDef = {
    fontName: "黑体",
    fontSize: 22,
    fillStyle: cc.color(66, 209, 244, 255)
};

var mpColors = {
    splitColor: cc.color(65, 168, 13)
};

var mpSignKey = "A8904B2A-CAEF-4DD1-B585-ABD91963165A";

//是否为苹果审核版本
var G_APPLE_EXAMINE = cc.sys.os == cc.sys.OS_IOS && channel != "enterprise" && GNativeInfo.IOSVerison > 20180210;

//是否打开转账功能
var G_OPEN_ZHUAN_ZHANG = !G_APPLE_EXAMINE;

//是否打开苹果支付
var G_OPEN_APPLE_PAY = G_APPLE_EXAMINE;

//是否打开奖品区
var G_OPEN_PRIZE_AREA = !G_APPLE_EXAMINE;

//是否打开批量购买
var G_OPEN_StoreBatchBuy = false;

//是否打开转出功能
var G_OPEN_TAKE_CASH = false;

//是否打开签名
var G_OPEN_SIGN = true;

//是否打开扫码功能
var G_OPEN_QRCODE_SCANNER = false;

//是否开启现金红包活动
var G_OpenTakeLuckyRMBActivity = false;

//是否打开每日签到
var G_OPEN_DAILY_ATTENDANCE = false;

//是否打开系统公告
var G_OPEN_SYSTEM_NOTICE = true;

//是否打开摊位功能
var G_OPEN_BOOTH = false;

//是否打开客服功能
var G_OPEN_CUSTOMER_SERVICE = false;

//是否打开连接服务端
var G_OPEN_CONNECT_SERVER = true;

//是否打开实名奖励
var G_OPEN_REALNAME_REWARD = false;

//是否打开奖品订单
var G_OPEN_PRIZE_ORDER = false;

//是否打开推广红包
var G_OPEN_RED_PACKET = false;

//是否打开socket日志
var G_OPEN_SOCKET_LOG = false;

//微信 APPID
var G_WX_APPID = "wxb4001b73b10dabd3";

//是否显示touch帮助
var G_SHOW_HELP = false;

// 是否TV
var G_PLATFORM_TV = channel == "dangbei" || channel == "aliplay" || channel == "weijing" || channel == "inphic" || channel == "xksx";

GNativeInfo.plazaGames = GNativeInfo.plazaGames || [];

if(G_APPLE_EXAMINE)
    GNativeInfo.plazaGames = [1, 2, 3, 4, 5, 6, 8, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27, 202, 203, 204, 212, 352, 353, 501, 502];

var forReview = false;

switch (channel)
{
    case "jinchan":
        GNativeInfo.plazaGames = [13];
        productName = "六九游戏金蟾捕鱼";
        G_APPLE_EXAMINE = true;
        G_OPEN_ZHUAN_ZHANG = false;
        G_OPEN_QRCODE_SCANNER = false;
        G_OpenTakeLuckyRMBActivity = false;
        G_OPEN_SYSTEM_NOTICE = false;
        G_OPEN_CONNECT_SERVER = true;
        forReview = true;
        break;

    case "shenhai":
        GNativeInfo.plazaGames = [353];
        productName = "六九游戏深海捕鱼";
        G_APPLE_EXAMINE = true;
        G_OPEN_ZHUAN_ZHANG = false;
        G_OPEN_QRCODE_SCANNER = false;
        G_OpenTakeLuckyRMBActivity = false;
        G_OPEN_SYSTEM_NOTICE = false;
        G_OPEN_CONNECT_SERVER = true;
        forReview = true;
        break;

    case "likui":
        GNativeInfo.plazaGames = [12];
        productName = "六九游戏李逵劈鱼";
        G_APPLE_EXAMINE = true;
        G_OPEN_ZHUAN_ZHANG = false;
        G_OPEN_QRCODE_SCANNER = false;
        G_OpenTakeLuckyRMBActivity = false;
        G_OPEN_SYSTEM_NOTICE = false;
        G_OPEN_CONNECT_SERVER = true;
        forReview = true;
        break;

    case "weijing":
    case "fish":
        GNativeInfo.plazaGames = [12, 13, 353];
        break;
}

//转出方式
var G_SupportPayCashType = {
    wx: true,
    ali: false,          //约定， 两个之中至少有一个支持
};

//竖屏游戏排除
var verticalScreenGameArray = [
    "shuiguoji",
    "monkey",
    // "dahuagu",
    "shisanshui",
    "guayigua"
];

var GSystemConfig = {};
