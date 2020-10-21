/**
 * Created by pear on 2017/8/4.
 */

var MPScrollBar = cc.Node.extend({
    bar: null,

    barbg: null,

    listView: null,

    leftX: -224,
    rightX: 224,
    offset: 448,

    touching: false,

    ctor: function (listView) {
        this._super();
        this.listView = listView;
        this.hide();
        this.initEx();
    },

    initEx: function () {
        this.barbg = new cc.Sprite("res/guntiao.png").to(this).pp().qscale(0.5);
        this.bar = new cc.Sprite("res/anniu.png").to(this).pp().qscale(0.5);

        var size = this.barbg.getContentSize();
        this.size(size.width, size.height);

        var that = this;

        this.scheduleUpdate();

        this.bar.bindTouch({
            swallowTouches: true,
            onTouchBegan: function (touch) {
                that.touching = true;
                this.posX = this.px();
                this.posY = this.py();
                this.startPosX = touch.getLocationX();


                var pos = that.listView.getInnerContainerPosition();
                var size = that.listView.getInnerContainerSize();

                cc.log("x:" + pos.x + " y:" + pos.y);
                cc.log("size :" + size.width + "  ," + size.height);
                return true;
            },

            onTouchMoved: function (touch) {
                var offsetX = touch.getLocationX() - this.startPosX;
                var x = this.posX + offsetX;
                if (x < -224) {
                    x = -224;
                }
                else if (x > 224) {
                    x = 224;
                }

                this.p(x, this.posY);

                that.updateListViewPosByBarPos(x);
            },

            onTouchEnded: function (touch) {
                that.touching = false;
            },
        });
    },

    update: function (dt) {
        this._super(dt);
        if (this.touching) {
            return true;
        }

        var contentSize = this.listView.getContentSize();
        var innerContentSize = this.listView.getInnerContainerSize();

        if (contentSize.width < innerContentSize.width - 10 && this.listView.isVisible()) {
            if (!this.isVisible()) {
                this.runAction(cc.callFunc(() => {
                    this.show();
                }));
            }

            var width_offset = innerContentSize.width - contentSize.width;
            this.updateBarPosByListViewPos(width_offset);


        }
        else {
            this.hide();
        }
    },


    updateListViewPosByBarPos: function (x) {
        var contentSize = this.listView.getContentSize();
        var innerContentSize = this.listView.getInnerContainerSize();
        var position = this.listView.getInnerContainerPosition();

        var width_offset = innerContentSize.width - contentSize.width;
        var percent = (x - this.leftX) / this.offset;
        var newPosX = -percent * width_offset;

        this.listView.setInnerContainerPosition(cc.p(newPosX, position.y));
    },

    updateBarPosByListViewPos: function (width_offset) {
        var pos = this.listView.getInnerContainerPosition();
        if (pos.x > 0) {
            pos.x = 0;
        }
        else if (pos.x < -width_offset) {
            pos.x = -width_offset;
        }
        var percent = Math.abs(pos.x) / width_offset;
        var barPosX = this.leftX + percent * this.offset;
        if (barPosX < this.leftX) {
            barPosX = this.leftX;
        }
        else if (barPosX > this.rightX) {
            barPosX = this.rightX;
        }

        this.bar.px(barPosX);
    },
});