/**
 * Created by Apple on 2016/6/17.
 */

/**
 * 设置界面
 */
var MPMessageLayer = MPBaseModuleLayer.extend({

    titleSprite: null,

    mailListView: null,

    prePageBtn: null,           //上一页
    nextPageBtn: null,          //下一页
    allDeleteBtn: null,          //全部删除
    nowStart: 0,         //当前开始页
    pageSize: 10,         //当前结束页

    mailInfoArray: null,     //邮件信息

    _className: "MPMessageLayer",
    _classPath: "src/main/module/MPMessageLayer.js",

    initEx: function () {


        this._super(cc.size(1120,620));

        this.requestMailBox();

        // this.titleBG.display("#gui-gm-bt-bj-da.png");
        // this.titleBG.showHelp()
        this.titleSprite = new cc.Sprite("#font_msgcenter.png").to(this.titleBG).pp(0.5, 0.6);


        var bg = new ccui.Scale9Sprite();
        bg.initWithSpriteFrameName("frame_bg.png");
        bg.to(this).size(1040, 370).pp(0.5, 0.53);



        this.mailListView = this.buildMessageListView().to(this).pp(0.49, 0.53);


        this.prePageBtn = new FocusButton("btn_blue2.png", "", "btn_hui2.png", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.3, 0.17).qscale(0.8);           //上一页
        this.prePageBtn.setTitleText("上一页");
        this.prePageBtn.setTitleFontSize(32);
        this.prePageBtn.getTitleRenderer().pp(0.5, 0.55);
        this.prePageBtn.addTouchEventListener(this.touchEventListener.bind(this));

        this.nextPageBtn = new FocusButton("btn_blue2.png", "", "btn_hui2.png", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.7, 0.17).qscale(0.8);           //上一页
        this.nextPageBtn.setTitleText("下一页");
        this.nextPageBtn.setTitleFontSize(32);
        this.nextPageBtn.getTitleRenderer().pp(0.5, 0.55);
        this.nextPageBtn.addTouchEventListener(this.touchEventListener.bind(this));


        this.allDeleteBtn = new FocusButton("btn_del_02.png", "", "btn_del_huise.png", ccui.Widget.PLIST_TEXTURE).to(this).pp(0.5, 0.17).qscale(0.8);           //全部删除
        this.allDeleteBtn.addTouchEventListener(this.touchEventListener.bind(this));

        this.initTV();
    },

    touchEventListener: function (sender, type) {
        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
        } else if (type == ccui.Widget.TOUCH_ENDED) {
            switch (sender) {
                case this.prePageBtn:
                    this.onClickPrePage();
                    break;
                case this.nextPageBtn:
                    this.onClickNextPage();
                    break;
                case this.allDeleteBtn:
                    this.onClickAllDelete();
                    break;
            }
        }
    },

    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.GetMailList:

                mpApp.removeWaitLayer();
                this.mailInfoArray = data;
                this.fillMessageData(data);
                this.refreshFocus();
                break;
            case mpNetEvent.WriteSystemMail:
                mpApp.updateUserInfo(data);
                break;

        }
    },

    initTV: function () {
        mpGD.mainScene.setFocusSelected(this.backBtn);

        this.refreshFocus();

        //TV 覆写 修改
        this.mailListView.isOnFinger = function () {
            var count = -1;
            var arrayItems = this.getItems();
            for (var i = 0; i < arrayItems.length; i++) {
                var item = arrayItems[i];
                if (this.shared.selected == item.button) {
                    count = i;
                    break;
                }
            }
            return count;
        };
    },

    refreshFocus: function () {
        var items = this.mailListView.getItems();

        for (var i = 1; i < items.length; i++) {
            items[i].button.setNextFocus(i == 0 ? this.backBtn : items[i - 1].button, i == items.length - 1 ? this.allDeleteBtn : items[i + 1].button, this.allDeleteBtn, null);
        }

        this.backBtn.setNextFocus(null, this.allDeleteBtn, null, items.length == 0 ? this.allDeleteBtn : items[0].button);
        this.allDeleteBtn.setNextFocus(this.backBtn, null, this.prePageBtn, this.nextPageBtn);
        this.prePageBtn.setNextFocus(this.backBtn, null, null, this.allDeleteBtn);
        this.nextPageBtn.setNextFocus(this.backBtn, null, this.allDeleteBtn, items.length == 0 ? null : items[items.length - 1].button);
    },

    // onExit: function () {
    //     this._super();
    //
    //     mpGD.mainScene.popDefaultSelectArray();
    //     // mpGD.mainScene.setFocusSelected(mpGD.mainScene.bottomButtons[3]);
    // },
    requestMail: function (mailID) {
        mpGD.netHelp.requestReadMail(mailID);
        mpApp.showWaitLayer("正在获取邮件数据， 请稍候");
    },
    requestMailBox: function () {
        mpGD.netHelp.requestMailbox(this.nowStart, this.pageSize);
        mpApp.showWaitLayer("正在获取邮箱数据， 请稍候");
    },
    onClickPrePage: function () {
        this.nowStart -= this.pageSize;
        this.nowStart = this.nowStart > 0 ? this.nowStart : 0;
        this.requestMailBox();
    },
    onClickNextPage: function () {
        this.nowStart += this.pageSize;
        this.requestMailBox();
    },

    //全部删除
    onClickAllDelete: function () {
        new MPMessageBoxLayer("询问", "是否删除全部消息", mpMSGTYPE.MB_OKCANCEL, () => {
            mpGD.netHelp.requestWriteSystemMail(-1, 1);
            this.mailListView.removeAllItems();
            //标志未读邮件为0
            mpGD.mainScene.setUnReadMessageNum(0);
            // mpApp.showWaitLayer("正在删除全部消息， 请稍候");
            this.refreshFocus();
        }).to(cc.director.getRunningScene());
    },

    //更新底部分页的状态
    updateBottom: function () {
        if (this.nowStart == 0) {
            this.prePageBtn.setEnabled(false);
        }
        else {
            this.prePageBtn.setEnabled(true);
        }
        if (this.mailInfoArray.length < this.pageSize) {
            this.nextPageBtn.setEnabled(false);
        }
        else {
            this.nextPageBtn.setEnabled(true);
        }
    },

    //填充排行榜数据
    fillMessageData: function (data) {
        var self = this;
        var touchEventListener = function (sender, type) {

            if (type == ccui.Widget.TOUCH_BEGAN) {
                SoundEngine.playEffect(commonRes.btnClick);
            } else if (type == ccui.Widget.TOUCH_ENDED) {
                if (sender) {
                    cc.log("点击删除" + sender.mailID);
                    mpGD.netHelp.requestWriteSystemMail(sender.mailID, 1);
                    sender.getParent().removeFromParent();

                    //TV删除功能
                    var items = self.mailListView.getItems();
                    var index = items.indexOf(sender.getParent());
                    if (index > -1) {
                        items.splice(index, 1);
                        mpGD.mainScene.setFocusSelected(items.length == 0 ? self.backBtn : (items.length == index ? items[index - 1] : items[index].button));
                        self.refreshFocus();
                    }
                }
            }
        };

        var buildMessageItem = function (mailID, status, title, createTime) {

            var widget = new FocusWidget();
            // var widget = new ccui.Widget();
            var bg = new cc.Sprite("#BankUI/frame_mima.png").to(widget);
            bg.size(930, 100);
            widget.size(1175, 105).pp(0.56,0.5);
            bg.pp(0.5,0.5);

            var icon;
            if (status == 0) {
                icon = new cc.Sprite("#gui-news-icon-xin.png").to(widget).pp(0.16, 0.65);
            }
            else {
                icon = new cc.Sprite("#gui-news-icon-xin-open.png").to(widget).pp(0.16, 0.5).qscale(1);
            }

            var timeLabel = new ccui.Text(ttutil.formatDate(new Date(createTime), "yyyy-MM-dd hh:mm:ss"), "res/font/fzcy_s.TTF", 20);
            timeLabel.setColor(cc.color(231, 255, 124));
            timeLabel.to(widget).pp(0.21, 0.75).anchor(0, 0.5);

            // var title = new cc.LabelTTF(title, "圆体", 20).to(widget).pp(0.2, 0.25).anchor(0, 0.5);
            // title.setColor(cc.color(231, 208, 124));

            var title = new ccui.Text(title, "res/font/fzcy_s.TTF", 20).to(widget).pp(0.21,0.15).anchor(0,0.5);
            title.setColor(cc.color(231, 208, 124));
            title.setTextAreaSize(cc.size(680,80));


            var button = new FocusButton("btn_del_01.png", "", "", ccui.Widget.PLIST_TEXTURE).to(widget).pp(0.8, 0.75).qscale(0.5);
            // button.setTitleFontName("res/font/zhs-fz-36-green.fnt");
            // button.setTitleText("删除");
            // button.getTitleRenderer().pp(0.5, 0.55);
            // button.setTitleFontSize(32);

            button.addTouchEventListener(touchEventListener);
            button.mailID = mailID;
            widget.button = button;
            widget.mailID = mailID;
            return widget;
        };

        var mailList = data;

        this.mailListView.removeAllItems();

        var unreadMailArray = [];
        // this.mailListView.pushBackCustomItem(fillWidget);
        for (var i = 0; i < mailList.length; i++) {

            var rankItem = buildMessageItem(mailList[i].mailID, mailList[i].status, mailList[i].title, mailList[i].createTime);

            rankItem.setTouchEnabled(true);
            rankItem.addClickEventListener(this.rankClickEventListener.bind(this));

            this.mailListView.pushBackCustomItem(rankItem);
            // this.mailListView.pushBackCustomFocusItem(rankItem);

            //未读, 把所有未读标志成已经 读
            if (mailList[i].status == 0) {
                unreadMailArray.push(mailList[i].mailID);
            }
        }

        //把这些未读取的邮件标志成已经读取
        if (unreadMailArray.length > 0) {
            // mpGD.netHelp.//
            mpGD.netHelp.requestMarkMailAlreadyRead(unreadMailArray);
            mpGD.mainScene.setUnReadMessageNum(mpGD.mainScene.messageBtn.unreadNum - unreadMailArray.length);
        }

        this.updateBottom();


    },

    rankClickEventListener: function (sender) {
        //请求邮箱数据

        var mailID = sender.mailID;

        //todo

    },

    //消息中心
    buildMessageListView: function () {


        var listView = new FocusListView().anchor(0.5, 0.5);


        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setTouchEnabled(true);
        listView.setBounceEnabled(true);

        listView.setContentSize(1175, 340);
        listView.setItemsMargin(20);


        return listView;
    },


});