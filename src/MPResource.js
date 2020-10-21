var mpRes = {};

var mpMusicRes = {};


var mpLoadingRes = {};

//加载场景资源， 过后会被释放掉
var mpg_loading_resources = [];
console.log("loading MPResources.js...")
var web_resource = [
    "res/bar.png",
    "res/login/login.plist",
    "res/login/login.png",
    "res/tvfinger.plist",
    "res/tvfinger.png",
    "res/activity/activity.plist",
    "res/activity/activity.png",
    "res/activity/content-3.png",
    "res/activity/content-4.png",
    "res/activity/goldTitle.png",
    "res/activity/hongbao.png",
    "res/activity/refresh.png",
    "res/activity/xian.png",
    "res/activity/xiangqing.png",
    "res/common981/common981.plist",
    "res/common981/common981.png",
    "res/duobao/duobao.plist",
    "res/duobao/duobao.png",


    "res/effect/startup/zhucheshaiziyaodong_dating/zhucheshaiziyaodong_dating.ExportJson",
    "res/effect/startup/zhucheshaiziyaodong_dating/zhucheshaiziyaodong_dating.plist",
    "res/effect/startup/zhucheshaiziyaodong_dating/zhucheshaiziyaodong_dating.png",


    "res/file/file.plist",
    "res/file/file.png",
    "res/font/zhs-fz-36-green.fnt",
    "res/font/zhs-fz-36-green.png",
    "res/font/zhs-fz-52-yellow.fnt",
    "res/font/zhs-fz-52-yellow.png",
    "res/font/zhs-fzzyjw-24-red.fnt",
    "res/font/zhs-fzzyjw-24-red.png",
    "res/font/zhs-fzzyjw-32-Yellow.fnt",
    "res/font/zhs-fzzyjw-32-Yellow.png",
    "res/font/zhs-fzzyjw-36-Gold.fnt",
    "res/font/zhs-fzzyjw-36-Gold.png",
    "res/font/zhs-fzzyjw-36-green.fnt",
    "res/font/zhs-fzzyjw-36-green.png",
    "res/font/zhs-fzzyjw-36-red.fnt",
    "res/font/zhs-fzzyjw-36-red.png",
    "res/font/zhs-fzzyjw-48-hui.fnt",
    "res/font/zhs-fzzyjw-48-hui.png",
    "res/font/zhs-fzzyjw-48.fnt",
    "res/font/zhs-fzzyjw-48.png",
    "res/font/zhs-heiti-24-NewCommon.fnt",
    "res/font/zhs-heiti-24-NewCommon.png",
    "res/font/zhs-heiti-24-NewCommon2.fnt",
    "res/font/zhs-heiti-24-NewCommon2.png",
    "res/font/zhs-heiti-24.fnt",
    "res/font/zhs-heiti-24.png",
    "res/font/zhs-heiti-30.fnt",
    "res/font/zhs-heiti-30.png",
    "res/font/zhs-heiti-32.fnt",
    "res/font/zhs-heiti-32.png",
    "res/font/zhs-heiti-46.fnt",
    "res/font/zhs-heiti-46.png",
    "res/font/zhs-leaderboard-48.fnt",
    "res/font/zhs-leaderboard-48.png",
    "res/font/zhs-weiruanyahei-26-green.fnt",
    "res/font/zhs-weiruanyahei-26-green.png",
    "res/font/zhs-weiruanyahei-26-red.fnt",
    "res/font/zhs-weiruanyahei-26-red.png",
    "res/font/zhs-weiruanyahei-36.fnt",
    "res/font/zhs-weiruanyahei-36.png",
    "res/font/zhs-yahei-18.fnt",
    "res/font/zhs-yahei-18.png",
    "res/font/zhs-yahei-36.fnt",
    "res/font/zhs-yahei-36.png",
    "res/font/zhs-yahei-orange-20.fnt",
    "res/font/zhs-yahei-orange-20.png",
    "res/font/zhs-yd-22.fnt",
    "res/font/zhs-yd-22.png",
    "res/font/zhs-yd-30.fnt",
    "res/font/zhs-yd-30.png",
    "res/font/zhs-yd-48.fnt",
    "res/font/zhs-yd-48.png",
    "res/font/zhs-yd-gray-22.fnt",
    "res/font/zhs-yd-gray-22.png",
    "res/font/zhs-yh-46.fnt",
    "res/font/zhs-yh-46.png",
    // {
    //     type:"font",
    //     name:"方正粗圆体",
    //     srcs:"res/font/fzcy_s.TTF",
    // },

    "res/goods/goods.plist",
    "res/goods/goods.png",
    "res/gui/file/chat-split.png",
    "res/gui/file/gui-bank-detail-bg.png",
    "res/gui/file/gui-bank-translation_log_bg.png",
    "res/gui/file/gui-bank-xiahuaxian.png",
    "res/gui/file/gui-common-suzi-green.png",
    "res/gui/file/gui-common-suzi-orange-21.png",
    "res/gui/file/gui-common-suzi-orange.png",
    "res/gui/file/gui-common-suzi-white.png",
    "res/gui/file/gui-common-suzi.png",
    "res/gui/file/gui-cz-bar.png",
    "res/gui/file/gui-cz-bg.png",
    "res/gui/file/gui-gm-bj.png",
    "res/gui/file/gui-lfj-otherUser-number-green.png",
    "res/gui/file/gui-lfj-otherUser-number-red.png",
    "res/gui/file/gui-vip-bg.png",
    "res/gui/login/cleartext_n.png",
    "res/gui/login/cleartext_s.png",
    "res/gui/login/gui-gm-check-box.png",
    "res/gui/login/gui-gm-check.png",
    "res/gui/login/gui-guest-register-box.png",
    "res/gui/login/gui-guest-register-button-saizi.png",
    "res/gui/login/gui-Guest-register-text-box.png",
    "res/gui/login/gui-load-weight.png",
    "res/gui/login/gui-login-Bg.png",
    "res/gui/login/gui-Login-box-back.png",
    "res/gui/login/gui-Login-box-nei.png",
    "res/gui/login/gui-Login-text-box.png",
    "res/gui/login/gui-register-button-saizi.png",
    "res/gui/login/gui-spring-btn-close.png",
    "res/gui/login/gui-startup-login-normal1.png",
    "res/gui/login/gui-startup-register-bt.png",
    "res/gui/login/gui-startup-register-clicked.png",
    "res/gui/login/gui-startup-register-normal.png",
    "res/gui/login/gui-startup-wx-clicked.png",
    "res/gui/login/gui-startup-wx-clicked1.png",
    "res/gui/login/gui-startup-wx-normal.png",
    "res/gui/login/gui-startup-wx-normal1.png",
    "res/gui/login/gui-update-bj.png",
    "res/gui/login/gui_notice_bg.png",
    "res/gui/login/gui_notice_title.png",
    "res/gui/login/radio.png",
    "res/gui/login/radioEmpty.png",
    "res/gui/login/registerSelect.png",
    // "res/gui/login/title3.png",
    "res/gui/login/treatyText.png",
    "res/module/module.plist",
    "res/module/module.png",
    "res/module/pattern.plist",
    "res/module/pattern.png",
    "res/plaza/plaza.plist",
    "res/plaza/plaza.png",

    "res/plaza/plaza2.plist",
    "res/plaza/plaza2.png",

    "res/newPlaza/newPlaza.plist",
    "res/newPlaza/newPlaza.png",

    "res/personal/personal.plist",
    "res/personal/personal.png",

    "res/plaza/table/bg.jpg",
    "res/sound/audio-hall.mp3",
    "res/sound/music-login-bg.mp3",
    "res/sound/sound-hall-selected.mp3",
    "res/table/table.plist",
    "res/table/table.png",

    "res/2weima.jpg",
    // 下面这三个要逐渐转到使用extend的资源 考虑到还有部分子游戏没改过来 先留着
    // "res/sound/sound-button.mp3",  换成了 commonRes.btnClick
    // "res/sound/btnClick.mp3",  换成了 commonRes.btnClick
    // "res/sound/mega_win_coins.mp3",  换成了 commonRes.winCoin

    "res/data/weather.json",
    "res/room/room.plist",
    "res/room/room.png",


    // 子游戏的通用资源
    "res/allcommon/btnClick.mp3",
    "res/allcommon/mega_win_coins.mp3",

    "res/allcommon/common.plist",
    "res/allcommon/common.png",
	"res/comexit/comexit.plist",
    "res/comexit/comexit.png",
];

var mpg_resources = [];

if (!cc.sys.isNative) {
    for (var i in web_resource) {
        mpg_resources.push(web_resource[i]);
    }
}

//图片资源
for (var i in mpRes) {
    mpg_resources.push(mpRes[i]);
}
//音乐资源
for (var i in mpMusicRes) {
    mpg_resources.push(mpMusicRes[i]);
}


for (var i in mpLoadingRes) {
    mpg_loading_resources.push(mpLoadingRes[i]);
}
