/**
 * Created by magic_cube on 2017/8/30.
 */

// 下拉列表框
var MPDropDownListBox = cc.Node.extend({

    _size: null,
    _text: null,
    _itemList: null,
    _callback1: null,
    _callback2: null,

    _itemLimit: 10,
    _isFrameShow: false,
    _isListviewSlider: false,

    _className: "MPDropDownListBox",
    _classPath: "src/main/MPDropDownListBox.js",

    ctor: function (args) {
        this._super();

        if (!args) return;

        this._size = args.size || cc.size(100, 100);
        this._text = args.text || "";
        this._itemList = args.items || [];
        this._callback1 = args.callback1 || null;
        this._callback2 = args.callback2 || null;

        this.init();

        this.bindTouchEvent();
    },

    bindTouchEvent: function () {
        var that = this;
        this.bindTouch({
            swallowTouch: true,
            onTouchBegan: function () {
                that.showPrefectureListView();
                that.hidePrefectureListView();

                that._callback1 && that._callback1();
                return;
            }
        });
    },

    init: function () {
        this.setContentSize(this._size);

        // 点击框
        var bar = new cc.Scale9Sprite("plaza_select_bar.png");
        bar.setAnchorPoint(0, 1);
        bar.setContentSize(this._size);
        bar.to(this).pp(0, 1);
        this.bar = bar;

        // 点击框文本
        var txt = new cc.LabelTTF(this._text, "宋体", 24);
        txt.setAnchorPoint(0, 0.5);
        txt.setColor(cc.color(200, 200, 200));
        txt.to(this).pp(0.1, 0.5);
        this.txt = txt;

        // 下拉列表框
        var frame = new cc.Scale9Sprite("plaza_select_bar.png");
        frame.setAnchorPoint(0, 1);
        frame.setVisible(false);
        this.frame = frame;

        // 选项列表
        var listview = new ccui.ListView();
        listview.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listview.setAnchorPoint(0, 1);
        listview.setTouchEnabled(true);
        listview.setBounceEnabled(true);
        listview.to(frame);
        this.listview = listview;

        var size = cc.size(this._size.width, 320);

        // 裁区域
        var clipper = new cc.ClippingNode();
        clipper.setAnchorPoint(0, 1);
        clipper.setContentSize(size);
        clipper.setPosition(0, 0);
        clipper.to(this, -5);

        var stencil = new cc.DrawNode();
        var rect = [cc.p(0, 0), cc.p(size.width, 0), cc.p(size.width, size.height), cc.p(0, size.height)];
        stencil.drawPoly(rect, cc.color(255, 255, 255, 255), 1, cc.color(255, 255, 255, 255));
        clipper.setStencil(stencil);

        frame.to(clipper);
    },

    updateListViewContent: function (list) {
        if (list.length !== this.getItemListLength()) {
            var fSizeH = list.length >= 10 ? 320 : list.length * 30 + 20;
            var lSizeH = list.length >= 10 ? 300 : list.length * 30;
            var fPosY = list.length >= 10 ? 690 : list.length * 30 + 390;
            var lPosY = list.length >= 10 ? 310 : list.length * 30 + 10;

            this.frame.size(this._size.width, fSizeH);
            this.frame.p(0, fPosY);
            this.listview.size(this._size.width - 20, lSizeH);
            this.listview.p(10, lPosY);
        }

        this.setItemList(list);

        this.listview.removeAllItems();

        var that = this;
        for (var i = 0; i < this.getItemListLength(); i++) {
            var layout = new ccui.Layout();
            layout.setContentSize(this._size.width, 30);

            layout.item = new cc.LabelTTF(this._itemList[i], "宋体", 20);
            layout.item.setAnchorPoint(0, 0.5);
            layout.item.setColor(cc.color(200, 200, 200));
            layout.item.to(layout).pp(0, 0.5);

            layout.bindTouch({
                onTouchBegan: function () {
                    that._isListviewSlider = false;
                    if (!that._isFrameShow) return;
                    return true;
                },
                onTouchMoved: function () {
                    that._isListviewSlider = true;
                },
                onTouchEnded: function (touch, event) {
                    var txt = event.getCurrentTarget().item.getString();
                    if (!that._isListviewSlider) {
                        that.hidePrefectureListView();
                        that._callback2 && that._callback2(txt);
                    }
                },
            });

            this.listview.pushBackCustomItem(layout);
        }
    },

    showPrefectureListView: function () {
        var that = this;
        if (!this._isFrameShow) {
            this.frame.runAction(cc.sequence(
                cc.show(),
                cc.moveBy(0.2, cc.p(0, -this.frame.ch() - 50)).easing(cc.easeSineOut()),
                cc.callFunc(function () {
                    that._isFrameShow = true;
                })
            ));
        }
    },

    hidePrefectureListView: function () {
        if (this._isFrameShow) {
            this._isFrameShow = false;
            this.frame.runAction(cc.sequence(
                cc.moveBy(0.2, cc.p(0, this.frame.ch() + 50)).easing(cc.easeSineIn()),
                cc.hide()
            ));
        }
    },

    setItemList: function (list) {
        this._itemList = list;
    },

    getItemListLength: function () {
        return this._itemList.length;
    },
});
