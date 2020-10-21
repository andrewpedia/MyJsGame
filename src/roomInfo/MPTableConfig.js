/**
 * Created by Apple on 2016/8/23.
 */


//椅子配置
var mpChairConfig = function (chairRes, chairRes2, chairPos, playerRes, playerPos, zOrder, sitDownPos, playerZOrder) {

    return {
        chairRes: chairRes,         //椅子资源, 默认前缀#res/plaza/table/chair/
        chairRes2: chairRes2,           //椅子上有人时的椅子资源
        chairPos: chairPos,         //椅子位置
        playerRes: playerRes,           //玩家资源 #res/plaza/table/boy|girl/, 游戏状态则为 #res/plaza/table/boy|girl/g
        playerPos: playerPos,        //玩家位置
        zOrder: zOrder,             //zOrder
        sitDownPos: sitDownPos,     //点击坐下的位置
        playerZOrder: playerZOrder,
    };
};

/**
 * 不同桌子的， 椅子位置及资源
 * @type {{6: *[]}}
 */
var mpTableConfig = {

    //
    base2: {
        //默认前缀#res/plaza/table/table/
        tableRes: "2",//桌子资源目录  会去取 其下的 0, 1两张图， 0做空闲图， 1做游戏图
        chairConfig: [
            mpChairConfig("1", "1", cc.p(55, 150), "1", cc.p(10, 20), -2, cc.p(0, 20), 1),

            mpChairConfig("4", "x4", cc.p(200, 105), "4", cc.p(-20, 15), 1, cc.p(0, 0), -1),
        ]
    },
    //默认的全部以base开头， 后面数字表示几位桌子
    base3: {
        //默认前缀#res/plaza/table/table/
        tableRes: "0",//桌子资源目录  会去取 其下的 0, 1两张图， 0做空闲图， 1做游戏图
        chairConfig: [
            mpChairConfig("2", "2", cc.p(125, 165), "2", cc.p(-5, 15), -3, cc.p(0, 50), 1),

            mpChairConfig("4", "x4", cc.p(200, 105), "4", cc.p(-20, 15), 1, cc.p(0, 0), -1),

            mpChairConfig("0", "x0", cc.p(60, 100), "0", cc.p(15, 15), 1, cc.p(-10, 0), -1),

        ]
    },
    //
    base4: {
        //默认前缀#res/plaza/table/table/
        tableRes: "4",//桌子资源目录  会去取 其下的 0, 1两张图， 0做空闲图， 1做游戏图
        chairConfig: [
            mpChairConfig("3", "3", cc.p(195, 150), "3", cc.p(-10, 20), -2, cc.p(0, 20), 1),
            mpChairConfig("4", "x4", cc.p(200, 105), "4", cc.p(-20, 15), 1, cc.p(0, 0), -1),
            mpChairConfig("0", "x0", cc.p(60, 100), "0", cc.p(15, 15), 1, cc.p(-10, 0), -1),
            mpChairConfig("1", "1", cc.p(55, 150), "1", cc.p(10, 20), -2, cc.p(0, 20), 1),
        ]
    },
    //默认的全部以base开头， 后面数字表示几位桌子
    base5: {
        //默认前缀#res/plaza/table/table/
        tableRes: "0",//桌子资源目录  会去取 其下的 0, 1两张图， 0做空闲图， 1做游戏图
        chairConfig: [
            mpChairConfig("2", "2", cc.p(125, 165), "2", cc.p(-5, 15), -3, cc.p(0, 50), 1),
            mpChairConfig("3", "3", cc.p(195, 150), "3", cc.p(-10, 20), -2, cc.p(0, 20), 1),
            mpChairConfig("4", "x4", cc.p(200, 105), "4", cc.p(-20, 15), 1, cc.p(0, 0), -1),
            mpChairConfig("0", "x0", cc.p(60, 100), "0", cc.p(15, 15), 1, cc.p(-10, 0), -1),
            mpChairConfig("1", "1", cc.p(55, 150), "1", cc.p(10, 20), -2, cc.p(0, 20), 1),
        ]
    },
    //默认的全部以base开头， 后面数字表示几位桌子
    base6: {
        //默认前缀#res/plaza/table/table/
        tableRes: "0",//桌子资源目录  会去取 其下的 0, 1两张图， 0做空闲图， 1做游戏图
        chairConfig: [
            mpChairConfig("2", "2", cc.p(125, 165), "2", cc.p(-5, 15), -3, cc.p(0, 50), 1),
            mpChairConfig("3", "3", cc.p(195, 150), "3", cc.p(-10, 20), -2, cc.p(0, 20), 1),
            mpChairConfig("4", "x4", cc.p(200, 105), "4", cc.p(-20, 15), 1, cc.p(0, 0), -1),
            mpChairConfig("5", "5", cc.p(125, 90), "5", cc.p(-5, 20), 2, cc.p(0, 0), -1),
            mpChairConfig("0", "x0", cc.p(60, 100), "0", cc.p(15, 15), 1, cc.p(-10, 0), -1),
            mpChairConfig("1", "1", cc.p(55, 150), "1", cc.p(10, 20), -2, cc.p(0, 20), 1),
        ]
    },


};

