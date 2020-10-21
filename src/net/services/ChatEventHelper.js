/**
 * Created by pear on 2017/10/25.
 */

var ChatEventHelper = cc.Class.extend({


    ctor: function () {

        mpGD.saNetHelper.addNetHandler(this, "onSANetEvent");
    },

    //接收聊天信息
    onSANetEvent: function (event, data) {
        switch (event) {
            case mpSANetEvent.AddFriend: //添加好友
                this.processAddFriend(data);
                break;
            case mpSANetEvent.AddFriendByGameID: //根据玩家gameid添加好友
                if (data.msgID == 2) {
                    ToastSystemInstance.buildToast("玩家不存在");
                }
                break;
            case mpSANetEvent.AddFriendByQRCode:
            case mpSANetEvent.SureAddFriendRequest:
                if (data.msgID == 2) {
                    ToastSystemInstance.buildToast("同意好友请求失败");
                    return;
                }
                else if (data.msgID == 1) {
                    this.insertNewFriend(data.friendID, data.nickname, data.faceID);
                    ToastSystemInstance.buildToast(data.nickname + "  成为了您的好友");
                }

                break;

            case mpSANetEvent.RefuseAddFriendRequest:
                ToastSystemInstance.buildToast(data.nickname + "  拒绝了您的好友请求");
                break;
        }
    },

    /**
     * 处理添加好友相关事件
     */
    processAddFriend: function (data) {
        if (data.msgID == AddFrendEvent.sendRequest) //发送添加好友请求成功
        {
            ToastSystemInstance.buildToast("已发送请求");
            var requestCount = mpGD.storage.getValue("requestCount" + mpGD.userInfo.userID + data.friendID) || 0;
            requestCount = parseInt(requestCount);
            mpGD.storage.setValue("requestCount" + mpGD.userInfo.userID + data.friendID, requestCount + 1, true);
            mpGD.storage.setValue("lastRequestTime" + mpGD.userInfo.userID + data.friendID, new Date(), true);
        }
        else if (data.msgID == AddFrendEvent.isFriendAlready) //对方已是好友
        {
            ToastSystemInstance.buildToast("对方已是好友");
        }
        else if (data.msgID == AddFrendEvent.refuseReceiveRequest) {
            ToastSystemInstance.buildToast("对方拒绝再接收您的好友请求！");
            mpGD.storage.setValue("refuseFlag" + mpGD.userInfo.userID + data.friendID, "TRUE", true);
        }
        else if (data.msgID == AddFrendEvent.inRequestCD) //还在冷却时间中，无法发送请求，更新时间戳
        {
            mpGD.storage.setValue("lastRequestTime" + mpGD.userInfo.userID + data.friendID, new Date(), true);
            ToastSystemInstance.buildToast("对同一名玩家发送好友请求需要间隔30秒！");
        }
        else if (data.msgID == AddFrendEvent.requestLimit) //当日请求上限
        {
            mpGD.storage.setValue("requestCount" + mpGD.userInfo.userID + data.friendID, 100, true);
            ToastSystemInstance.buildToast("今天对该玩家的好友请求已达上限！");
        }
        else if (data.msgID == AddFrendEvent.receiveRequest) //收到好友请求
        {
            var refuseCheckBox = new FocusButton("res/gui/login/gui-gm-check-box.png", "", "", ccui.Widget.LOCAL_TEXTURE)
            refuseCheckBox.setScale(0.8);
            refuseCheckBox.setFingerPPos(cc.p(0.5, 0.1));
            refuseCheckBox.selectFlagImg = new cc.Sprite("res/gui/login/gui-gm-check.png").to(refuseCheckBox).pp().hide();
            refuseCheckBox.selectFlag = false;
            refuseCheckBox.addClickEventListener(function () {
                if (refuseCheckBox.selectFlagImg.isVisible()) {
                    refuseCheckBox.selectFlagImg.hide();
                    refuseCheckBox.selectFlag = false;
                }
                else {
                    refuseCheckBox.selectFlagImg.show();
                    refuseCheckBox.selectFlag = true;
                }
            });


            var tishikuang = new MPMessageBoxLayer("提 示", data.requesterName + " 请求添加您为好友！是否同意", mpMSGTYPE.MB_OKCANCEL, function () {
                if (typeof mpGD != "undefined") {
                    mpGD.saNetHelper.sendSureAddFriendRequest(data.requesterID);
                }
            }, function () {
                if (typeof mpGD != "undefined") {
                    mpGD.saNetHelper.sendRefuseAddFriendRequest(data.requesterID, refuseCheckBox.selectFlag);
                }
            }).to(cc.director.getRunningScene(), 10000);

            tishikuang.addChild(refuseCheckBox, 10000);
            refuseCheckBox.pp(0.3, 0.5);

            var refuseTTF = new cc.LabelTTF("拒绝再接收该好友请求", GFontDef.fontName, 20).to(tishikuang, 10000).anchor(0, 0.5).pp(0.35, 0.5);
        }
    },

    /**
     * 插入一条好友信息
     * @param userID
     * @param nickname
     * @param faceID
     */
    insertNewFriend: function (userID, nickname, faceID) {
        if (mpGD.friendList != null) {
            for (var i = 0; i < mpGD.friendList.length; i++) {
                if (mpGD.friendList[i] && mpGD.friendList[i].userID == userID) {
                    return;
                }
            }

            var newFriendItem = {};
            newFriendItem.nickname = nickname;
            newFriendItem.userID = userID;
            newFriendItem.faceID = faceID;

            mpGD.friendList.push(newFriendItem);
        }
    },
});