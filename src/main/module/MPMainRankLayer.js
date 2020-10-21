var MPMainRankLayer = MPQBackgroundLayer.extend({

    ctor:function () {
        this._super();


        this.panel = new ccs.load('res/plaza1v1/images/rank_popup/rank/MainRankAlertLayer.json').node;
        this.panel.to(this).anchor(0.5,0.5).pp(0.5,0.5);

        this.runPanelAction();


        var closeBtn = this.panel.getChildByName('closeButton');
        closeBtn.tag = 1001;
        closeBtn.addTouchEventListener(this.buttonPressedEvents.bind(this));

        this.rankListView = this.panel.getChildByName('listView');

        //this.loadRankData();

        mpGD.netHelp.requestRanking();
        mpApp.showWaitLayer("正在请求排名榜数据");

    },
    onNetEvent: function (event, data) {

        switch (event) {
            case mpNetEvent.GetScoreRank:
                mpApp.removeWaitLayer();
                this.fillRankData(data);
                //this.refreshFocus();
                break;

        }
    },
    //填充排行榜数据
    fillRankData: function (data) {
        var rankData = data.rankData;
        console.log('pppppppppppppppppppp');
        console.log(rankData);

        //重新点击处理
        
        
         //console.log("正在请求排名榜数据=========="+rankData.length);
        for (var i = 0; i < rankData.length; i++) {

            var rankItem = this.buildRankItem(rankData[i].faceID, i + 1, rankData[i].nickname, rankData[i].rankScore);
//            this.rankListView.pushBackCustomItem(rankItem);
//            if (rankData[i].gameID == mpGD.userInfo.gameID) {
//                meRank = i + 1;
//            }
        }


        

        // ttutil.dump(mpGD.userInfo);
        // var meItem = this.meItem = this.buildRankItem(mpGD.userInfo.faceID, meRank, mpGD.userInfo.nickname, mpGD.userInfo.bankScore || "0");
        // meItem.mpBg.setColor(cc.color(128, 128, 255));
        //
        // meItem.to(this).pp(0.56, 0.26);
    },
    buttonPressedEvents:function (sender, type) {
        console.log('xxooxxxoo' + type);

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:

                SoundEngine.playEffect(commonRes.btnClick);

                sender.setScale(0.9);
                sender.setColor(cc.color(255,128,128));

                break;

            case ccui.Widget.TOUCH_ENDED:
                // console.log(nameArray[sender.mpFlag]);

                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                sender.tag == 1001 && this.closePanel();


                break;
            case ccui.Widget.TOUCH_CANCELED:
                setTimeout(function () {
                    sender.setScale(1);
                    sender.setColor(cc.color(255,255,255));
                },0.2);

                break;
        }
    },
    buildRankItem: function (faceID, randIndex, nickname, rankScore, ts) {

   
   var randIndex=randIndex-1;


        var path = 'res/plaza1v1/images/rank_popup/rank/MainRankCellLayer.json';
        // this.rankListView.setContentSize(cc.size(594, 10000));



     
            var node = ccs.load(path).node;
            node.anchor(0,0);


            var widget = new FocusWidget().anchor(0.5,0);
            widget.setSize(cc.size(594,130));
            node.to(widget);
            this.rankListView.pushBackCustomItem(widget);
            widget.x = 0;
            widget.y = this.rankListView.ch() - randIndex*130;
            var cell = node.getChildByName('cell');
            cell.setSwallowTouches(false);
            var nickNameLabel = cell.getChildByName('nickNameLabel');
            nickNameLabel.setString(nickname);
            var goldLabel = cell.getChildByName('goldLabel');
            //console.log("========"+rankScore);
            goldLabel.setString(rankScore);
            //var avatarImage = cell.getChildByName('avatarSprite');  //头像
            var avatarFrame= cell.getChildByName('avatarFrame');
            //var headIcon = ttutil.buildHeadIcon(faceID).to(widget).pp(0.18, 0.5).qscale(0.5);
            var icon = new cc.Sprite(ttutil.getHeadIconName(faceID)).to(avatarFrame, 1).pp(0.5, 0.5);


            if (randIndex == 0){
                cell.getChildByName('rank1Tag').setVisible(true);
            }else if (randIndex == 1) {
                cell.getChildByName('rank2Tag').setVisible(true);
            }else if (randIndex == 2) {
                cell.getChildByName('rank3Tag').setVisible(true);
            }else  {
                cell.getChildByName('rank4TagBg').setVisible(true);
                var rankLabel = cell.getChildByName('rank4Label');
                rankLabel.setVisible(true);
                rankLabel.setString(randIndex );  //排行
            }
            cell.tag = randIndex;
            widget.tag = randIndex;
            //widget.setTouchEnabled(true);

           
            //widget.addTouchEventListener((sender,type)=> {
            //    if (type == ccui.Widget.TOUCH_ENDED){

            //        let idx = nickname.lastIndexOf("微");
            //        idx = idx > 0 ? idx : nickname.lastIndexOf("微");
            //        let copyStr = idx>0 && idx!=nickname.length-1 ? nickname.substr(idx+1) : nickname;
            //        new MPMessageBoxLayer("通知", "您要复制[" + copyStr + "]，并打开微信吗？", mpMSGTYPE.MB_OKCANCEL,
            //            ()=>{
            //                native.setClipboard(copyStr);
            //                native.openWXApp()
            //            }).to(cc.director.getRunningScene(),1000000000);

            //    }
            //});

        
        return widget;
    },



})