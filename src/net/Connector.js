/**
 * Created by Administrator on 2016/2/23.
 * 大厅网络连接层
 * 暂且用入侵式设计
 */

var SocketIO = SocketIO || window.io;

var Connector = cc.Class.extend({
    _className: "Connector",
    _classPath: "src/net/Connector.js",

    sock: null,
    handlerArray: null,
    isConnect: null,
    isConnecting: null,            //是否正在连接
    serverURI: null,
    activeDisConnect: null,            //是否是主动断开

    ctor: function () {
        this.handlerArray = [];
        this.isConnect = false;
        this.isConnecting = false;
        this.activeDisConnect = false;
    },

    connect: function (uri) {
        if(!G_OPEN_CONNECT_SERVER)
            return;

        this.serverURI = uri;
        cc.log("正在连接中...", uri);
        this.sock = null;

        if (cc.sys.isNative && !nonHttps) {
            this.sock = SocketIO.connect(uri, "res/cacert.pem");
        } else {
            this.sock = SocketIO.connect(uri);
        }

        var self = this;

        this.isConnecting = true;

        //链接事件
        this.sock.on("connect", function (data) {
            cc.log("连接成功: " + self.serverURI);

            self.isConnect = true;
            self.isConnecting = false;
            self._dispatch("connect", data);
        });
        //断开事件
        this.sock.on("disconnect", function (data) {
            cc.log("断开连接----");
            // return;
            self.isConnect = false;
            self.isConnecting = false;

            self._dispatch("disconnect", data, self.activeDisConnect);
            //再次触发就不一定是主动断开了。
            self.activeDisConnect = false;

            self.sock = null;
        });
        //错误消息
        this.sock.on("error", function (error) {

            self.isConnecting = false;
            self.isConnect = false;
            self._dispatch("error", error);
        });

        this.sock.on(Encrypt.packetEvent2("ignore"), function (data) {
            data = Encrypt.decryptData2(data);
            mpApp.removeWaitLayer();
            data.errMsg && ToastSystemInstance.buildToast(data.errMsg);
        });
    },

    //主动断开
    disconnect: function () {
        cc.log("主动断开链接");
        this.activeDisConnect = true;
        this.sock && this.sock.disconnect();

    },

    /**
     * 注册事件
     * @param event
     */
    registerEvent: function (event) {
        this.sock && this.sock.on(Encrypt.packetEvent2(event), function (data) {
            var decryptData = Encrypt.decryptData2(data);
            if (decryptData == null) {
                console.error("数据包错误", event, "未处理");
                mpApp.removeWaitLayer();
                return;
            }

            G_OPEN_SOCKET_LOG && cc.log(event, JSON.stringify(decryptData, null, 4));

            this._dispatch(event, decryptData);
        }.bind(this));
    },


    /**
     * 添加网络事件
     * @param handler
     * @param handlerFuncName 自定义函数名，如果没有默认onNetEvent
     * @returns {boolean}
     */
    addNetHandler: function (handler, handlerFuncName) {

        var funcName = handlerFuncName ? handlerFuncName : "onNetEvent";

        //如果有onNetEvent事件 则加入分发数组
        if (typeof handler[funcName] == "function") {

            var len = this.handlerArray.length;
            for (var crtIndex = 0; crtIndex < len; crtIndex++) {
                if (this.handlerArray[crtIndex].handler == handler)
                    break;
            }

            if (crtIndex == len) this.handlerArray.push({handler: handler, funcName: funcName});
        } else {
            return false;
        }
    },

    /**
     * 移除网络处理事件
     */
    removeNetHandler: function (handler) {

        var len = this.handlerArray.length;

        for (var i = 0; i < len; ++i) {
            if (this.handlerArray[i].handler == handler) {
                this.handlerArray.splice(i, 1);
                return;
            }
        }
    },

    /**
     * 网络事件分发
     * @private
     */
    _dispatch: function (eventName, msg) {

        if (msg && msg.errMsg) {
            ToastSystemInstance.buildToast(msg.errMsg);
        }
        if (msg && msg.successMsg) {
            ToastSystemInstance.buildToast(msg.successMsg);
        }

        this.handlerArray.forEach(function (handler) {
            handler.handler[handler.funcName] && handler.handler[handler.funcName](eventName, msg);
        });
    },

    /**
     * 发送数据包
     * @param data
     */
    emit: function (event, data) {
        event = event || "message";

        if (this.sock == null)
            return;

        G_OPEN_SOCKET_LOG && cc.log(JSON.stringify({event: event, data: data}, null, 4));

        event = Encrypt.packetEvent(event, this.sock);
        data = Encrypt.packetData(data, this.sock);


        this.sock.emit(event, data);
    },
});
