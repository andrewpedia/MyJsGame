/**
 * Created by Administrator on 2015/7/28.
 */


var MPRichItem = cc.Class.extend({
	_className: "MPRichItem",
	_classPath: "src/extend/MPRichText.js",

    _type: 0,
    _tag: 0,
    _color: null,
    _opacity: 0,
    _context: null,

    ctor: function () {
        this._color = cc.color(255, 255, 255, 255);
    },

    init: function (tag, color, opacity) {
        this._tag = tag;
        this._color.r = color.r;
        this._color.g = color.g;
        this._color.b = color.b;
        this._opacity = opacity;
        if (opacity === undefined)
            this._color.a = color.a;
        else
            this._color.a = opacity;
    }

});

var MPRichItemNewLine = MPRichItem.extend({
	_className: "MPRichItemNewLine",
	_classPath: "src/extend/MPRichText.js",

    ctor: function (tag) {
        this._super();
        this._type = MPRichItem.ITEM_NEWLINE;
        this.init(tag);
    },

    init: function (tag) {
        this._super(tag, cc.color(0, 0, 0), 0);
    }
});

var MPRichItemText = MPRichItem.extend({
	_className: "MPRichItemText",
	_classPath: "src/extend/MPRichText.js",

    _text: "",
    _fontName: "",
    _fontSize: "",
    _fontDefinition: null,
    ctor: function (tag, colorOrFontDef, opacity, text, fontName, fontSize) {
        this._super();
        this._type = MPRichItem.ITEM_TEXT;
        this._text = "";
        this._fontSize = 0;
        this._fontName = "";

        if (colorOrFontDef && colorOrFontDef instanceof cc.FontDefinition)
            this.initWithStringAndTextDefinition(tag, text, colorOrFontDef, opacity);
        else
            fontSize && this.init(tag, colorOrFontDef, opacity, text, fontName, fontSize);
    },

    init: function (tag, color, opacity, text, fontName, fontSize) {
        MPRichItem.prototype.init.call(this, tag, color, opacity);
        this._text = text;
        this._fontName = fontName;
        this._fontSize = fontSize;
    },

    initWithStringAndTextDefinition: function (tag, text, fontDef, opacity) {
        MPRichItem.prototype.init.call(this, tag, fontDef.fillStyle, opacity);
        this._fontDefinition = fontDef;
        this._text = text;
        this._fontName = fontDef.fontName;
        this._fontSize = fontDef.fontSize;
    }
});

var MPRichItemImage = MPRichItem.extend({
	_className: "MPRichItemImage",
	_classPath: "src/extend/MPRichText.js",

    _filePath: "",
    _textureRect: null,
    _textureType: 0,

    ctor: function (tag, color, opacity, filePath) {
        this._super();
        this._type = MPRichItem.ITEM_IMAGE;
        this._filePath = "";
        this._textureRect = cc.rect(0, 0, 0, 0);
        this._textureType = 0;

        filePath !== undefined && this.init(tag, color, opacity, filePath);
    },

    init: function (tag, color, opacity, filePath) {
        this._super(tag, color, opacity);
        this._filePath = filePath;
    }
});

var MPRichItemCustom = MPRichItem.extend({
	_className: "MPRichItemCustom",
	_classPath: "src/extend/MPRichText.js",

    _customNode: null,
    ctor: function (tag, color, opacity, customNode) {
        this._super();
        this._type = customNode;
        this._customNode = null;
        customNode !== undefined && this.init(tag, color, opacity, customNode);
    },

    init: function (tag, color, opacity, customNode) {
        this._super(tag, color, opacity);
        this._customNode = customNode;
    }
});

var MPRichText = ccui.ScrollView.extend({
    //_formatTextDirty: false,
    _richElements: null,        //逻辑元素
    _elementRenders: null,      //渲染元素
    _leftSpaceWidth: 0,
    _lineSpace: 0,
    _context: "",
    _maxline: 100,

    _cacheRichElments: null,    //缓存元素

    _className: "MPRichText",
    _classPath: "src/extend/MPRichText.js",

    ctor: function (lineSpace) {
        this._super();

        //this._formatTextDirty = false;
        this._richElements = [];
        this._elementRenders = [];
        this._cacheRichElments = [];
        this._lineSpace = (lineSpace === undefined) ? 0 : lineSpace;


        this.init();
        this.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.setTouchEnabled(true);
        this.setInertiaScrollEnabled(true);
        
        this.scheduleUpdate();
    },

    init: function () {
        this._super();
    },

    _initRenderer: function () {
        this._super();
    },

    clearAll: function () {
        this._richElements.splice(0);
    },

    insertNewLine: function () {
        var item = new MPRichItemNewLine(0);
        this.pushBackElement(item);
    },

    pushBackElement: function (element) {
        if (element == null) return;

        this._cacheRichElments.push(element);
    },

    changeLine: function () {
        this._leftSpaceWidth = this.getCustomSize().width;
        this._elementRenders.push([]);
    },

    //每帧处理3个逻辑元素
    update: function () {
        if (this._cacheRichElments.length == 0) return;

        //超过最大行直接返回删除
        var len = this._cacheRichElments.length;
        if (len > this._maxline) {
            this._cacheRichElments.splice(0, len - this._maxline);
        }

        for (var i = 0; i < 2; ++i) {

            if (this._cacheRichElments.length == 0) return;

            var element = this._cacheRichElments[0];
            this._cacheRichElments.splice(0, 1);
            this.formatText(element);
        }
    },

    /**
     * 有一个bug 元素
     */
    formatText: function (element) {
        //插入richText
        if (element) {
            //每次重新创建 消耗效率 后期优化 bug 的原因

            //this._elementRenders.length = 0;
            //this.changeLine();
            //var element = null;

            this.removeAllChildren();
            if (this._elementRenders.length == 0) this.changeLine();
            this._richElements.push(element);
            this.adjustRichTextLine();
            //for (var i = 0; i < this._richElements.length; ++i) {
            //    element = this._richElements[i];

            {
                switch (element._type) {
                    case  MPRichItem.ITEM_TEXT:
                        if (element._fontDefinition)
                            this._handleTextRenderer(element._text, element._fontDefinition, element._fontDefinition.fontSize, element._fontDefinition.fillStyle);
                        else
                            this._handleTextRenderer(element._text, element._fontName, element._fontSize, element._color);
                        break;
                    case  MPRichItem.ITEM_NEWLINE:
                        this.changeLine();
                        break;
                    case  MPRichItem.ITEM_IMAGE:
                        this._handleImageRenderer(element._filePath, element._color, element._color.a);
                        break;
                    case  MPRichItem.ITEM_CUSTOM:
                        this._handleCustomRenderer(element._customNode);
                        break;

                }
            }

            this.formatRenderers();
        }
    },

    adjustRichTextLine: function () {
        var lineIndex = [];
        var element = null;
        for (var i = 0; i < this._richElements.length; ++i) {
            element = this._richElements[i];
            if (element._type == MPRichItem.ITEM_NEWLINE) {
                lineIndex.push(i);
            }
        }

        if (lineIndex.length > this._maxline) {
            this._richElements.splice(0, lineIndex[lineIndex.length - this._maxline]);
        }
    },

    formatRenderers: function () {
        if (this._elementRenders.length > this._maxline) {
            var removeNum = this._elementRenders.length - this._maxline;
            for (var i = 0; i < removeNum; i++) {
                var row = this._elementRenders[i];
                for (var j = 0; j < row.length; j++) {
                    var node = row[j];
                    node.release();
                }
            }

            this._elementRenders.splice(0, removeNum)
        }

        var newContenSizeHeight = 0;
        var maxHeights = [];
        var row = null;
        for (var i = 0; i < this._elementRenders.length; i++) {
            row = this._elementRenders[i];
            var maxHeight = 0;
            for (var j = 0; j < row.length; j++) {
                var node = row[j];
                maxHeight = Math.max(node.getContentSize().height, maxHeight);
            }
            maxHeights[i] = maxHeight + this._lineSpace;
            newContenSizeHeight += maxHeights[i];
        }

        if (newContenSizeHeight < this.getCustomSize().height) {
            newContenSizeHeight = this.getCustomSize().height;
        }

        var nextPosY = newContenSizeHeight;
        for (i = 0; i < this._elementRenders.length; i++) {
            row = this._elementRenders[i];
            var nextPosX = 0.0;
            nextPosY -= maxHeights[i];
            for (j = 0; j < row.length; j++) {
                node = row[j];
                node.setAnchorPoint(cc.p(0, 0));
                node.setPosition(cc.p(nextPosX, nextPosY));
                this.addChild(node, 1);

                nextPosX += node.getContentSize().width;
            }
        }
        //for (i = 0; i < this._elementRenders.length; ++i) {
        //    this._elementRenders[i].length = 0;
        //}
        //
        //this._elementRenders.length = 0;

        this.setInnerContainerSize(cc.size(this.getCustomSize().width, newContenSizeHeight));
        this.scrollToBottom(0.1, false);
    },

    _handleTextRenderer: function (text, fontNameOrFontDef, fontSize, color) {
        var textRenderer = fontNameOrFontDef instanceof cc.FontDefinition ? new cc.LabelTTF(text, fontNameOrFontDef) : new cc.LabelTTF(text, fontNameOrFontDef, fontSize);
        var textRendererWidth = textRenderer.getContentSize().width;
        var oldleftWidth = this._leftSpaceWidth;
        this._leftSpaceWidth -= (textRendererWidth);
        if (this._leftSpaceWidth < 0.0) {
            var overStepPercent = (-this._leftSpaceWidth) / textRendererWidth;
            var curText = text;
            var stringLengh = curText.length;
            var leftLength = Math.floor((1 - overStepPercent) * stringLengh);

            var leftRenderer = null;

            //10次尝试调整
            var adjustTimes = 10;
            //判断
            do {
                var leftWords = curText.substr(0, leftLength);
                var cutWords = curText.substr(leftLength, stringLengh - 1);

                if (leftLength > 0) {
                    if (fontNameOrFontDef instanceof cc.FontDefinition) {
                        leftRenderer = new cc.LabelTTF(leftWords.substr(0, leftLength), fontNameOrFontDef);
                    } else {
                        leftRenderer = new cc.LabelTTF(leftWords.substr(0, leftLength), fontNameOrFontDef, fontSize);
                    }

                    //小于长度
                    if (leftRenderer.getContentSize().width <= oldleftWidth) {
                        leftRenderer.setColor(color);
                        leftRenderer.setOpacity(color.a);
                        this._pushToContainer(leftRenderer);
                        break;
                    }

                    leftLength--;

                } else {
                    break;
                }

            } while (adjustTimes--);


            //var leftWords = curText.substr(0, leftLength);
            //var cutWords = curText.substr(leftLength, stringLengh-1);
            //if (leftLength > 0) {
            //    var leftRenderer = null;
            //    if( fontNameOrFontDef instanceof cc.FontDefinition)
            //    {
            //        leftRenderer = new cc.LabelTTF(leftWords.substr(0, leftLength), fontNameOrFontDef);
            //    }else{
            //        leftRenderer =  new cc.LabelTTF(leftWords.substr(0, leftLength), fontNameOrFontDef, fontSize);
            //    }
            //    leftRenderer.setColor(color);
            //    leftRenderer.setOpacity(color.a);
            //    this._pushToContainer(leftRenderer);
            //}
            this.changeLine();
            this._handleTextRenderer(cutWords, fontNameOrFontDef, fontSize, color);
        } else {
            textRenderer.setColor(color);
            textRenderer.setOpacity(color.a);
            this._pushToContainer(textRenderer);
        }
    },

    _handleImageRenderer: function (filePath, color, opacity) {
        var sprite = new cc.Sprite(filePath);
        this._handleCustomRenderer(sprite);
    },

    _handleCustomRenderer: function (renderer) {
        var imgSize = renderer.getContentSize();
        this._leftSpaceWidth -= imgSize.width;
        if (this._leftSpaceWidth < 0) {
            this.changeLine();
            this._pushToContainer(renderer);
            this._leftSpaceWidth -= imgSize.width;
        }
        else {
            this._pushToContainer(renderer);
        }
    },

    _pushToContainer: function (renderer) {
        if (this._elementRenders.length <= 0)
            return;
        renderer.retain();
        this._elementRenders[this._elementRenders.length - 1].push(renderer);
    }

});


MPRichItem.ITEM_TEXT = 0;           //文字
MPRichItem.ITEM_NEWLINE = 1;        //新行
MPRichItem.ITEM_IMAGE = 2;          //图片
MPRichItem.ITEM_CUSTOM = 3;         //自定义