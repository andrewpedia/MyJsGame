/**
 * Created by coder on 2017/6/6.
 */
var MPFocusTableScene = cc.Scene.extend(FocusBase).extend({

    isMenuMode: false,

    _className: "MPFocusTableScene",
    _classPath: "src/scene/MPFocusTableScene.js",

    ctor: function () {
        this._super();
        //TV 清空按钮数组 可能冗余
        this.clearDefaultSelectArray();
        mpApp.bindBackButtonEvent(this);
        this.setFingerPPos({x: -1, y: 0});
    },
    // 如果出现特殊情况按钮不见了 废弃
    setSelectDefault: function () {
        // 登录按钮
        this.setFocusSelected(this.quickBtn);
    },

    initTV: function () {
        //获取坐标
        var getPos = (index, border) => {
            return {x: index % border, y: Math.floor(index / border)};
        };
        //获取索引
        var getIndex = (ccp, border) => {
            border = border || 3;
            return ccp.x + ccp.y * border;
        };
        var perRowNum = this.getCustomTableNum();
        var rowNum = Math.ceil(this.roomInfo.tableCount / this.getCustomTableNum());
        mpGD.mainScene.setFocusSelected(this.quickBtn);
        this.backBtn.setNextFocus(null, this.tableArray[0], null, this.quickBtn);
        this.quickBtn.setNextFocus(null, this.tableArray[0], this.backBtn, null);

        var arrayA = this.tableArray.slice(0);
        var array = [];
        var isRoomCard = this.roomInfo.roomCard == 1;

        //如果有房卡则锁一起加入
        for (var i = 0; i < arrayA.length; i++) {
            array.push(arrayA[i]);
            if (isRoomCard && (i + 1) % perRowNum == 0) {
                for (var j = perRowNum - 1; j >= 0; j--) {
                    array.push(arrayA[i - j].lock && arrayA[i - j].lock);
                }
            }
        }
        for (var i = 0; i < array.length; i++) {
            var pos = getPos(i, perRowNum);

            array[i].setFingerZoder(1000);
            array[i].setNextFocus(
                pos.y == 0 ? this.quickBtn : array[getIndex({x: pos.x, y: pos.y - 1}, perRowNum)],
                pos.y == getPos(array.length - 1, perRowNum).y ? null : array[getIndex({
                        x: pos.x,
                        y: pos.y + 1
                    }, perRowNum)],
                pos.x == 0 ? this.backBtn : array[getIndex({x: pos.x - 1, y: pos.y}, perRowNum)],
                pos.x == getPos(array.length - 1, perRowNum).x ? null : array[getIndex({
                        x: pos.x + 1,
                        y: pos.y
                    }, perRowNum)]
            );
        }

        //TV 覆写 修改
        this.listView.isOnFinger = function () {
            var count = -1;
            var arrayItems = this.getItems();
            for (var i = 0; i < arrayItems.length; i++) {
                var item = arrayItems[i];
                if (this.shared.selected.getParent() == item) {
                    count = i;
                    break;
                }
            }
            return count;
        };
    },

    //暂停键盘， 保留手指到场景上
    pauseFocus: function () {
        this.setFocusSelected(this);
    },

    refreshFocus: function () {

    },

    onEnterTransitionDidFinish: function () {
        this._super();

        if (!this.useKeyboard)
            return;

        this.setSelectDefault();
        this.eventListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (code, event) {
                console.log("onKeyPressed, cc.KEY", code);
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        this.refreshFocus();
                        var nextFocus = this.shared.selected.nextFocusArray[code];
                        this.setFocusSelected(nextFocus);
                        break;
                    case cc.KEY.enter:
                    case cc.KEY.dpadCenter:
                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }

            }.bind(this),
            onKeyReleased: function (code, event) {
                console.log("onKeyReleased, cc.KEY", code);
                switch (code) {
                    case cc.KEY.up:
                    case cc.KEY.down:
                    case cc.KEY.left:
                    case cc.KEY.right:
                    case cc.KEY.dpadUp:
                    case cc.KEY.dpadDown:
                    case cc.KEY.dpadLeft:
                    case cc.KEY.dpadRight:
                        if (this.shared.selected)
                            this.shared.selected.onNextClick(code);
                        break;
                    case cc.KEY.dpadCenter:
                    case cc.KEY.enter:
                        this.shared.selected.onClick && this.shared.selected.onClick();
                        break;
                    case cc.KEY.escape:
                    case cc.KEY.back:
                        break;
                }
            }.bind(this)
        });
        cc.eventManager.addListener(this.eventListener, -1);
    },
    onExit: function () {
        this._super();

        this.eventListener && cc.eventManager.removeListener(this.eventListener);
    }
});





