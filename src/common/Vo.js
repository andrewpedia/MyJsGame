/**
 * Created by 黄二杰 on 2016/3/1.
 */


//游戏信息
var mpSubGameInfo = function (data) {

    this.moduleID = data.moduleID;                  //游戏ID
    this.gameName = data.moduleName;             //游戏名
    this.iconName = data.moduleEnName;           //图标名称
    this.sort = data.sortID;                //排序ID
    this.resName = data.moduleEnName;            //游戏资源名
    this.className = data.kindName;           //所属类别名
    this.classID = data.kindID;
    this.version = data.version || 1;

///////////////////////////////////////////////////////////////////////////////////////////////////////
    this.localManifest = null;                        //本地存储位置 子游戏随包配置
    this.storagePath = null;                          //子游戏储存配置
    this.status = null;                               //子游戏状态
    this.assetsManager = null;                        //资源管理器
    this.listenerAssetsManager = null;                //资源管理器监听器
    this.updateAssetsInfo = null;                      //资源更新状态
    this.loadGameJsPath = null;                        //载入游戏的js地址
    this.searchPaths = null;                           //子游戏的 资源搜索目录


};


//房间信息
function mpRoomInfo(data) {
    this.moduleID = data.moduleID;                                 //游戏id
    this.gameName = data.moduleName;                             //游戏名称
    this.roomID = data.roomID;                                 //房间ID
    this.roomName = data.roomName;                             //房间名称
    this.sortID = data.sortID;                             //游戏房间排序ID
    this.enterScore = data.minScore;                       //进入分数
    this.gamePort = data.port;                             //端口
    this.cheatProof = data.cheatProof;                  //0表示非防作弊， 1表示防作弊
    this.gameIP = null;                                             //房间IP
    this.tableCount = data.tableCount;                  //桌子数
    this.chairCount = data.chairCount;                  //椅子数
    this.roomCard = data.roomCard;
    this.hideRoom = data.hideRoom;
}
//用户状态
function MPPlayerState() {
    this.moduleID = null;             //当前正在玩的游戏， 没有为null
    this.roomID = null;             //当前所在的房间里， 没有为null
    this.isPlaying = false;         //是否正在玩游戏
    this.cheatProof = 0;            //是否是防作弊
}
