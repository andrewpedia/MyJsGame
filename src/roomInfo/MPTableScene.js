/**
 * Created by Apple on 2016/8/22.
 */

/**
 * 6人桌 房间
 */
var MPTable6Scene = MPBaseTableScene.extend({

    _className: "MPTable6Scene",
    _classPath: "src/roomInfo/MPTableScene.js",

    /**
     * 创建桌子方法， 请重写
     * @param tableID
     */
    buildTable: function (tableID) {
        return new MPBaseTable(this, tableID, 6, cc.size(250, 250));
    },

    /**
     * 返回每行几张桌子
     * @returns {number}
     */
    getCustomTableNum: function () {
        return 3;
    },

});

/**
 * 2人桌 房间
 */
var MPTable2Scene = MPBaseTableScene.extend({
    //可以自己重写一些配置

    _className: "MPTable2Scene",
    _classPath: "src/roomInfo/MPTableScene.js",
});
/**
 * 3人桌 房间
 */
var MPTable3Scene = MPBaseTableScene.extend({
    //可以自己重写一些配置

    _className: "MPTable3Scene",
    _classPath: "src/roomInfo/MPTableScene.js",
});
/**
 * 4人桌 房间
 */
var MPTable4Scene = MPBaseTableScene.extend({
    //可以自己重写一些配置

    _className: "MPTable4Scene",
    _classPath: "src/roomInfo/MPTableScene.js",
});

/**
 * 5人桌 房间
 */
var MPTable5Scene = MPBaseTableScene.extend({
    //可以自己重写一些配置

    _className: "MPTable5Scene",
    _classPath: "src/roomInfo/MPTableScene.js",
});