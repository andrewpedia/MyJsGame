/**
 * Created by magic_cube on 2017/9/28.
 */

// 图形锁框
var MPPatternFrame = ccui.Layout.extend({

    originDotInfoArray: [],         // 原始点数据集
    tempDotInfoArray: [],           // 临时点数据集

    historyDotIndexArray: [],       // 历史点索引集
    dotIndexArray: [],              // 点索引集
    linesArray: [],                 // 线集
    dotPosArray: [],

    currLine: null,                 // 当前线段

    _canTouch: true,

    _touchEventBeganCallback: null, // 触控开始回调事件
    _touchEventMovedCallback: null, // 触控移动回调事件
    _touchEventEndedCallback: null, // 触控结束回调事件

    _size: null,
    _anchorPoint: null,

    _className: "MPPatternFrame",
    _classPath: "src/main/MPPatternFrame.js",

    ctor: function (args) {
        this._super();

        this.initLayer();

        this.bindTouchEvent();
    },

    bindTouchEvent: function () {
        if (G_PLATFORM_TV) return false;

        var that = this;
        this.bindTouch({
            swallowTouches: true,
            onTouchBegan: function (touches) {
                if (!that._canTouch) return false;
                that.createConnectLine(touches);
                return true;
            },
            onTouchMoved: function (touches) {
                that.changeConnectLine(touches);
            },
            onTouchEnded: function (touches) {
                that.removeConnectLine(touches);
            },
        });
    },

    initLayer: function () {
        this.setContentSize(cc.size(420, 360));
        this.setAnchorPoint(cc.p(0.5, 0.5));

        var dotPosArr = [
            cc.p(0.1, 0.9), cc.p(0.5, 0.9), cc.p(0.9, 0.9),
            cc.p(0.1, 0.5), cc.p(0.5, 0.5), cc.p(0.9, 0.5),
            cc.p(0.1, 0.1), cc.p(0.5, 0.1), cc.p(0.9, 0.1),
        ];

        for (var i = 0; i < dotPosArr.length; i++) {
            new cc.Sprite("#gui-pattern-dot-bg.png").to(this).pp(dotPosArr[i]);

            var dot = null;
            if (!G_PLATFORM_TV) {
                dot = new cc.Sprite("#gui-pattern-dot.png").to(this).pp(dotPosArr[i]);
            } else {
                dot = new FocusButton("gui-pattern-dot.png", "", "", ccui.Widget.PLIST_TEXTURE).to(this).pp(dotPosArr[i]);
                dot.addClickEventListener((sender) => {
                    this.createConnectLineTV(sender);
                });
            }
            this.originDotInfoArray[i] = {node: dot, index: i + 1};
        }

        ttutil.copyAttr(this.tempDotInfoArray, this.originDotInfoArray);
    },

    /**
     * 创建连接线
     * @param touches
     */
    createConnectLine: function (touches) {
        if (this.tempDotInfoArray.length !== 0) {
            for (var i = 0; i < this.tempDotInfoArray.length; i++) {
                var dotPos = this.tempDotInfoArray[i].node.getPosition();
                var p1 = this.convertToWorldSpace(dotPos);
                var p2 = touches.getLocation();

                if (ttutil.getDistance(p1, p2) <= 40) {

                    this._touchEventBeganCallback && this._touchEventBeganCallback();

                    this.dotIndexArray.push(this.tempDotInfoArray[i].index);

                    if (this.currLine) {
                        var linePos = this.currLine.getPosition();
                        var pp1 = this.convertToWorldSpace(linePos);
                        var pp2 = p1;

                        this.changeLineStrengthAndAngle(pp1, pp2);

                        this.linesArray.push(this.currLine);
                    }
                    this.currLine = this.createLineBetweenTwoDot(p1, p2);
                    this.tempDotInfoArray.splice(i, 1);
                }
            }
        }
    },

    /**
     * 更改连接线
     * @param touches
     */
    changeConnectLine: function (touches) {
        if (this.currLine) {
            var linePos = this.currLine.getPosition();
            var p1 = this.convertToWorldSpace(linePos);
            var p2 = touches.getLocation();

            this.changeLineStrengthAndAngle(p1, p2);

            this.createConnectLine(touches);

            this._touchEventMovedCallback && this._touchEventMovedCallback();
        }
    },

    /**
     * 移除连接线
     * @param touches
     */
    removeConnectLine: function (touches) {
        if (this.currLine) {
            this.currLine.removeFromParent();
            this.currLine = null;
        }

        this._touchEventEndedCallback && this._touchEventEndedCallback();
    },

    /**
     * 创建两点间的直线
     * @param point1
     * @param point2
     * @return {object}
     */
    createLineBetweenTwoDot: function (point1, point2) {
        var point = this.convertToNodeSpace(point1);

        var line = new cc.Sprite("#gui-pattern-line.png").to(this, -1);
        var lineImgLength = line.getContentSize().height;
        var distance = ttutil.getDistance(point1, point2);
        var scale = distance / lineImgLength;
        var angle = ttutil.getAngle(point1, point2);

        line.setPosition(point);
        line.setAnchorPoint(cc.p(0.5, 0));
        line.setColor(cc.color(0, 0, 0));
        line.setOpacity(80);
        line.setScaleY(scale);
        line.setRotation(angle);

        return line;
    },

    /**
     * 更改线段长度和角度
     * @param point1
     * @param point2
     */
    changeLineStrengthAndAngle: function (point1, point2) {
        var lineImgLength = this.currLine.getContentSize().height;
        var distance = ttutil.getDistance(point1, point2);
        var scale = distance / lineImgLength;
        var angle = ttutil.getAngle(point1, point2);

        this.currLine.setScaleY(scale);
        this.currLine.setRotation(angle);
    },

    /**
     * 错误的线
     */
    wrongPasswordLine: function () {
        for (var i = 0; i < this.linesArray.length; i++) {
            this.linesArray[i].setColor(cc.color(150, 50, 50));
        }
    },

    /**
     * 重置图形密码数据
     */
    resetGraphicalPasswordData: function () {
        for (var i = 0; i < this.linesArray.length; i++) {
            this.linesArray[i] && this.linesArray[i].removeFromParent();
        }

        for (var i = 0; i < this.originDotInfoArray.length; i++) {
            this.originDotInfoArray[i].node && this.originDotInfoArray[i].node.setColor(cc.color(255, 255, 255));
        }

        this.dotIndexArray.length = 0;
        this.linesArray.length = 0;
        this.dotPosArray.length = 0;
        ttutil.copyAttr(this.tempDotInfoArray, this.originDotInfoArray);
    },


    createConnectLineTV: function (sender) {
        if (this.tempDotInfoArray.length !== 0) {
            for (var i = 0; i < this.tempDotInfoArray.length; i++) {
                var dotPos = this.tempDotInfoArray[i].node.getPosition();
                var p1 = this.convertToWorldSpace(dotPos);
                var p2 = this.convertToWorldSpace(sender.getPosition());

                if (ttutil.getDistance(p1, p2) <= 40) {

                    sender.setColor(cc.color(255, 200, 0));

                    if (this.dotPosArray.length !== 0) {
                        var pp1 = this.dotPosArray[this.dotPosArray.length - 1];
                        var pp2 = p2;

                        this.linesArray.push(this.createLineBetweenTwoDot(pp1, pp2));
                    }

                    this.dotPosArray.push(p2);
                    this.dotIndexArray.push(this.tempDotInfoArray[i].index);
                    this.tempDotInfoArray.splice(i, 1);

                }
            }
        }
    },


    setTouchEventBeganCallback: function (callback) {
        this._touchEventBeganCallback = callback;
    },

    setTouchEventMovedCallback: function (callback) {
        this._touchEventMovedCallback = callback;
    },

    setTouchEventEndedCallback: function (callback) {
        this._touchEventEndedCallback = callback;
    },

    setFrameTouchEnabled: function (flag) {
        this._canTouch = flag;
    },

    getFrameTouchStatus: function () {
        return this._canTouch;
    },

    getOldDotIndexArray: function () {
        return this.historyDotIndexArray;
    },

    getNewDotIndexArray: function () {
        return this.dotIndexArray;
    },

});