var QRCodeScanner = {

    _className: "QRCodeScanner",
    _classPath: "src/QRCodeScanner.js",

    accountScanLogin: "ASLogin",
    roomcard: "roomcard",
    addFrined: "addFriend",

    onScanQRCode : function() {
        if (!cc.sys.isMobile || G_PLATFORM_TV) {
            ToastSystemInstance.buildToast("请使用手机版本进行扫码");
            return;
        }

        var result = native.scanQRCode((resultString) => {
            // new cc.LabelTTF(resultString).to(this, 10).pp();
            console.log("resultString", resultString);

            var index = resultString.indexOf("?");
            if(index == -1)
                return;

            var name = resultString.substring(0, index);
            name = name.substring(name.lastIndexOf("/") + 1);

            var url = "";

            switch (name)
            {
                case this.accountScanLogin:
                    url = this.handleLoginQRCode(resultString);
                    break;

                case this.roomcard:
                    url = this.handleInvitationQRCode(resultString);
                    break;

                case this.addFrined:
                    url = this.handleAddFriendQRCode(resultString);
                    break;


            }

            if(url == "")
                return;

            mpGD.netUtil.get(url, (text) => {
                if (cc.game.config.debugMode == 1)
                    ToastSystemInstance.buildToast(text);
            });
        });

        if (result != "1") {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                ToastSystemInstance.buildToast("您的版本不支持此功能，请到官网下载新版本");
            else
                ToastSystemInstance.buildToast("暂不支持此功能");
        }
    },

    //扫码登录
    handleLoginQRCode : function(resultString) {

        var data = {
            loginedSocketID: mpGD.netHelp.getSocketID(),
            loginedUserID: mpGD.userInfo.userID
        };

        data = Encrypt.xorEncode(data, "game036");
        var encodedData = Encrypt.AESEncryptHex(data, "game036");

        return resultString + "&data=" + encodedData;
    },

    //房卡邀请好友
    handleInvitationQRCode : function(resultString) {

        var socketID = mpGD.netHelp.getSocketID();

        socketID = Encrypt.xorWord(socketID, "game036");

        return resultString + "&socketID=" + socketID;
    },

    //添加好友
    handleAddFriendQRCode: function (resultString) {

        var userID = mpGD.userInfo.userID.toString();
        userID = Encrypt.xorWord(userID, "addFriend");

        return resultString + "&userID=" + userID;
    },
};