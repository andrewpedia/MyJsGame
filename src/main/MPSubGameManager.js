/**
 * Created by 真心科技 on 2016/1/27.
 */


/**
 * 子游戏管理者， 暂时不保有数据 ， 全用mpGD.subGameInfoMap
 * @type {Function}
 */
var MPSubGameManager = cc.Class.extend({
    _className: "MPSubGameManager",
    _classPath: "src/main/MPSubGameManager.js",


    subGameInfoMap: null,
    ctor: function () {
    },

    initData: function () {

        this.subGameInfoMap = mpGD.subGameInfoMap;

        for (var i = 0, len = this.subGameInfoMap.length; i < len; ++i) {
            var gameInfo = this.subGameInfoMap[i];
            if (gameInfo) {
                var basePath;
                if (cc.game.config.debugMode == 0) {
                    basePath = jsb.fileUtils.getWritablePath() + "release/subGame/";
                }
                else {
                    basePath = jsb.fileUtils.getWritablePath() + "debug/subGame/";
                }


                gameInfo.localManifest = basePath + gameInfo.resName + "/localManifest.manifest";
                gameInfo.storagePath = basePath + gameInfo.resName + "/";


                gameInfo.loadGameJsPath = "src/jsList.js";
                this._saveSubGameLocalManifest(basePath + gameInfo.resName + "/", "localManifest.manifest", gameInfo.resName);
                if (this.subGameInfoMap[gameInfo.moduleID].status == mpSubGameStatus.Ready) {
                    this._prependSearchPaths(gameInfo.moduleID)
                }
            }
        }
        // ttutil.dump(this.subGameInfoMap);
    },

    /**
     * 存入子游戏的更新地址
     */
    _saveSubGameLocalManifest: function (dir, fileName, resName) {

        //var baseAddress = (nonHttps ? "http://" : "https://") +  "plaza.l2537.com/release/subGame/" + resName + "/";
        var baseAddress = (nonHttps ? "http://" : "https://") + hotUpdateDomain + "/release/subGame/" + resName + "/";
		var data = {};
        data.packageUrl = baseAddress + "assets/";

        data.remoteVersionUrl = baseAddress + "version.manifest";
        data.remoteManifestUrl = baseAddress + "project.manifest";

        // if (cc.sys.os == cc.sys.OS_IOS) {
        //     data.remoteVersionUrl = baseAddress + "iosVersion.manifest";
        //     data.remoteManifestUrl = baseAddress + "iosProject.manifest";
        // }
        // else if (cc.sys.os == cc.sys.OS_WINDOWS) {
        //     data.remoteVersionUrl = baseAddress + "windowsVersion.manifest";
        //     data.remoteManifestUrl = baseAddress + "windowsProject.manifest";
        // }
        // else {
        //     data.remoteVersionUrl = baseAddress + "androidVersion.manifest";
        //     data.remoteManifestUrl = baseAddress + "androidProject.manifest";
        // }

        data.version = "0";
        data.engineVersion = "Cocos2d-JS v3.15";

        if (!jsb.fileUtils.isDirectoryExist(dir)) {
            jsb.fileUtils.createDirectory(dir);
        }
        jsb.fileUtils.writeStringToFile(JSON.stringify(data), dir + fileName);
    },


    /**
     * 设置子游戏状态
     * @param moduleID
     * @param status
     * @param otherInfo
     */
    _setSubGameStatus: function (moduleID, status, otherInfo) {
        this.subGameInfoMap[moduleID].status = status;

        //发送子游戏状态
        cc.eventManager.dispatchCustomEvent(mpEvent.SubGameStatusUpdate, {
            moduleID: moduleID,
            status: status,
            otherInfo: otherInfo,
        });
    },

    /**
     * 检查更新子游戏
     * @param moduleID
     */
    checkUpdate: function (moduleID, callback) {

        if (this.subGameInfoMap[moduleID] == null) {
            cc.log("this.subGameInfoMap[" + moduleID + "] is null");
            return;
        }

        //每次点击都重置一下。防止子游戏间干扰
        mpApp.resetSearchPaths();

        var subGameInfo = this.subGameInfoMap[moduleID];

        //发送子游戏状态
        this._setSubGameStatus(moduleID, mpSubGameStatus.CheckUpdate);

        if (subGameInfo.assetsManager != null) {
            subGameInfo.assetsManager.release();
            cc.eventManager.removeListener(subGameInfo._listenerAssetsManager);
        }

        subGameInfo.assetsManager = new jsb.AssetsManager(subGameInfo.localManifest, subGameInfo.storagePath, false);

        subGameInfo.assetsManager.setVersionCompareHandle(function (localVersion, serverVersion) {
            return localVersion.localeCompare(serverVersion);
        });


        subGameInfo.assetsManager.retain();     //保留引用
        //保存下引用
        subGameInfo.assetsManager.moduleID = moduleID;
        //资源更新状态
        subGameInfo.updateAssetsInfo = {
            percent: 0,
            percentByFile: 0,
            assetID: null,
            message: null,
        };


        subGameInfo._listenerAssetsManager = this._listenerAssetsManager(subGameInfo.assetsManager, callback);
        cc.eventManager.addListener(subGameInfo._listenerAssetsManager, 1);
        subGameInfo.assetsManager.update();
    },


    /**
     * 游戏更新失败， 进入 下载失败状态
     * @param moduleID
     */
    _updateSubGameFail: function (moduleID) {
        this.subGameInfoMap[moduleID].assetsManager.release();
        this.subGameInfoMap[moduleID].assetsManager = null;
        cc.eventManager.removeListener(this.subGameInfoMap[moduleID]._listenerAssetsManager);


        //发送子游戏状态
        this._setSubGameStatus(moduleID, mpSubGameStatus.DownloadFail);
    },


    /**
     * 计算子游戏的资源搜索目录
     * @param moduleID
     */
    _prependSearchPaths: function (moduleID) {

        if (!cc.sys.isNative)
            return;

        var searchPaths = [];

        var gameInfo = mpGD.subGameInfoMap[moduleID];

        if (!cc.sys.isMobile && cc.game.config.subGameRoot != null && cc.game.config.subGameRoot != "") {
            var classify = mpApp.getClassify(gameInfo.resName);
            var searchPath = cc.game.config.subGameRoot + "/" + classify + gameInfo.resName + "/Client/";
            if(!jsb.fileUtils.isDirectoryExist(searchPath))
                searchPath = cc.game.config.subGameRoot + "/../" + classify + gameInfo.resName + "/Client/";
            
            searchPaths.push(searchPath);
        }

        var basePath;
        if (cc.game.config.debugMode == 0) {
            basePath = jsb.fileUtils.getWritablePath() + "release/subGame/" + gameInfo.resName + "/";
        }
        else {
            basePath = jsb.fileUtils.getWritablePath() + "debug/subGame/" + gameInfo.resName + "/";
        }

        searchPaths.push(basePath);

        for (var i = 0; i < mpGD.initSearchPaths.length; ++i) {
            searchPaths.push(mpGD.initSearchPaths[i]);
        }

        this.subGameInfoMap[moduleID].searchPaths = searchPaths;
    },

    /**
     * 游戏更新完成， 进入准备状态
     * @param moduleID
     * @param haveUpdate //是否有更新
     */
    _updateSubGameSuccess: function (moduleID, haveUpdate) {

        this._prependSearchPaths(moduleID);

        this.subGameInfoMap[moduleID].assetsManager.release();
        this.subGameInfoMap[moduleID].assetsManager = null;
        cc.eventManager.removeListener(this.subGameInfoMap[moduleID]._listenerAssetsManager);


        //发送子游戏状态
        this._setSubGameStatus(moduleID, mpSubGameStatus.Ready);
    },

    /**
     * 监听资源管理器 事件
     */
    _listenerAssetsManager: function (assetsManager, callback) {
        var that = this;
        var listener = new jsb.EventListenerAssetsManager(assetsManager, function (event) {

            var assetsManager = event.getAssetsManagerEx();
            var subGameInfo = that.subGameInfoMap[assetsManager.moduleID];
            var updateAssetsInfo = subGameInfo.updateAssetsInfo;

            switch (event.getEventCode()) {
                case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                    cc.log("No local manifest file found, skip assets update.");
                    that._updateSubGameFail(assetsManager.moduleID);

                    break;
                case jsb.EventAssetsManager.UPDATE_PROGRESSION:

                    updateAssetsInfo.assetID = event.getAssetId();
                    updateAssetsInfo.percent = event.getPercent() * 100;
                    updateAssetsInfo.percentByFile = event.getPercentByFile();
                    updateAssetsInfo.message = event.getMessage();


                    that._setSubGameStatus(assetsManager.moduleID, mpSubGameStatus.Downloading, updateAssetsInfo.percent);
                    break;
                case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                    cc.log("Fail to download manifest file, update skipped.");
                    that._updateSubGameFail(assetsManager.moduleID);


                    break;
                case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                    cc.log("No Update");
                    that._updateSubGameSuccess(assetsManager.moduleID, false);


                    break;
                case jsb.EventAssetsManager.UPDATE_FINISHED:
                    cc.log("Update finished.");
                    that._updateSubGameSuccess(assetsManager.moduleID, true);


                    break;
                case jsb.EventAssetsManager.UPDATE_FAILED:
                    cc.log("Update failed. " + event.getMessage());

                    that.failCount++;
                    if (that.failCount < that.maxRetryCount) {
                        that.assetsManager.downloadFailedAssets();
                    }
                    else {
                        cc.log("Reach maximum fail count, exit update process");
                        that.failCount = 0;
                        that._updateSubGameFail(assetsManager.moduleID);
                    }
                    break;
                case jsb.EventAssetsManager.ERROR_UPDATING:
                    cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                    that._updateSubGameFail(assetsManager.moduleID);


                    break;
                case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                    cc.log(event.getMessage());
                    that._updateSubGameFail(assetsManager.moduleID);


                    break;
                default:
                    break;
            }

            callback && callback(event);
        });
        return listener;
    },

});




