/**
 * Created by grape on 2017/9/22.
 */

var RoomCodeInstance;

var RoomCodeLayer = cc.LayerColor.extend({
    _className: "RoomCodeLayer",
    _classPath: "src/extend/RoomCodeLayer.js",
    tableUuid: null,
    sprite: null,

    ctor: function (tableUuid) {
        this._super(cc.color(0x00, 0x00, 0x00, 128));

        this.size(V.w, V.h);
        RoomCodeInstance && RoomCodeInstance.removeFromParent();

        RoomCodeInstance = this;

        this.tableUuid = tableUuid;
        // var bg = new cc.Sprite("#scan_bg.png").to(this);
        var bg = new cc.Sprite(V.w > V.h ? "#scan_bg.png" :"#scan_portrait_bg.png").to(this);

        bg.pp();

        var hint = new ccui.Text("发送二维码给好友，邀请进入房间！", GFontDef.fontName, 20).to(this).pp(0.38, 0.25);
        hint.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        hint.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        hint.ignoreContentAdaptWithSize(false);
        hint.setContentSize(320, 90);
        hint.anchor(0.5, 1);
        hint.setColor(cc.color(231, 208, 124));


        var roomCard = new ccui.Text("游戏: " + mpGD.subGameInfoMap[mpGD.userStatus.moduleID].gameName + " 房间号: " + mpGD.userStatus.roomName + " 桌子号: " + (mpGD.userStatus.tableID + 1), GFontDef.fontName, 20).to(this, 1000);
        if(V.w > V.h)
            roomCard.pp(0.38, 0.17);
        else
            roomCard.pp(0.46, 0.20);

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: (touch, event) => {
                if (event.getCurrentTarget().isVisible()) {
                    SoundEngine.playEffect(commonRes.btnClick);
                    return true;
                }
                return false;
            },
            onTouchEnded: (touch, event) => {
                if (!this.containsTouch(bg, touch)) {
                    this.getScene().shared && this.getScene().popDefaultSelectArray();
                    this.removeFromParent();
                }
            }
        });

        cc.eventManager.addListener(touchListener, this);

        this.swallowKeyboard(() => {
            this.getScene().shared && this.getScene().popDefaultSelectArray();
            this.removeFromParent();
        });
        //默认手指位置
        if (this.getScene().shared && this.getScene().shared.selected){
            this.getScene().pushDefaultSelectArray(this.getScene().shared.selected);
            this.getScene().pauseFocus();
        }

        mpGD.netHelp.requestTableUuid();
    },

    onEnter: function () {
        this._super();


        mpGD.netHelp.addNetHandler(this);
    },

    onExit: function () {
        this._super();

        mpGD.netHelp.removeNetHandler(this);
    },

    cleanup: function () {

        RoomCodeInstance = null;

        this._super();
    },

    containsTouch: function (sprite, touch) {
        return cc.rectContainsPoint(cc.rect(0, 0, sprite.getContentSize().width, sprite.getContentSize().height), sprite.convertToNodeSpace(touch.getLocation()));
    },

    loadQRCode: function (uuid) {

        if(uuid == null)
        {
            cc.error("uuid错误,不可为空");
            return;
        }

        var data = {
            moduleID: mpGD.userStatus.moduleID,
            roomID: mpGD.userStatus.roomID,
            tableID: mpGD.userStatus.tableID,
            uuid: Encrypt.xorWord(uuid, mpGD.userStatus.roomID + "_" + mpGD.userStatus.tableID)
        };

        data = ttutil.encodeURI(data);

        this.sprite && this.sprite.removeFromParent();

        var url = QRCodeScanner.roomcard + "?" + data;
        cc.loader.loadImg(ttutil.getQRCodeUrl(url), {isCrossOrigin: true}, (err, img) => {
            if (err) {
                console.error("扫码邀请好友二维码加载失败", err, url);
                return;
            }

            this.sprite = new cc.Sprite(img).to(this, 2);

            if (cc.sys.isNative) {
                this.sprite.setContentSize(200, 200);
                this.sprite.pp(V.w > V.h ? cc.p(0.38, 0.46) : cc.p(0.50, 0.56));
            } else {
                this.sprite.setScale(0.4);
                this.sprite.pp(V.w > V.h ? cc.p(0.38, 0.43) : cc.p(0.50, 0.56));
            }
        });
    },

    /**
     * 当网络事件来时
     * @param event
     * @param data
     */
    onNetEvent: function (event, data) {
        switch (event) {
            case mpNetEvent.TableUuid:
                if(data.errMsg)
                    ToastSystemInstance.buildToast(data.errMsg);
                else
                    this.loadQRCode(data.uuid);
                break;
        }
    },
});
