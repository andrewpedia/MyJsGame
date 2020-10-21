/**
 * Created by coder on 2017/7/18.
 */

var sockets = {};

if(cc.sys.isMobile)
{
    var SocketIO = SocketIO || window.io;

    var connect = SocketIO.connect;

    SocketIO.connect = function () {

        var socket = connect.apply(SocketIO, arguments);

        var socket_on = socket.on;
        socket.on = function (event, fn) {

            switch (event) {
                case "connect":
                    var socket_fn = fn;
                    fn = function () {
                        sockets[socket.id] = socket;
                        console.log("SocketIO", event, socket.id);
                        return socket_fn.apply(this, arguments);
                    };
                    break;

                case "disconnect":
                case "error":
                    var socket_fn = fn;
                    fn = function () {
                        delete sockets[socket.id];
                        console.log("SocketIO", event, socket.id);
                        return socket_fn.apply(this, arguments);
                    };
                    break;
            }

            return socket_on.apply(socket, [event, fn]);
        };

        return socket;
    };
}

var sendHeartbeat = function () {
    for (var socketID in sockets) {
        var socket = sockets[socketID];

        console.log("sendHeartbeat", socket.id);

        var event = Encrypt.packetEvent("heartbeat", socket);
        var data = Encrypt.packetData({}, socket);

        socket.emit(event, data);
    }
};

// 进入后台,播放大厅背景音乐
var playBgMusic = function(){
    native.playBgMusic();
};