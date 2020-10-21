/**
 * Created by somebody on 2018/5/4.
 */

var setStringLabelTTF = cc.LabelTTF.prototype.setString;
cc.LabelTTF.prototype.setString = function (text) {

    text = formatFloatNumber(text);

    return setStringLabelTTF.apply(this, [text]);
};

cc.LabelTTF.prototype.setStringNoFormat = function (text) {

    return setStringLabelTTF.apply(this, [text]);
};

var setStringLabelBMFont = cc.LabelBMFont.prototype.setString;
cc.LabelBMFont.prototype.setString = function (newString, needUpdateLabel) {

    newString = formatFloatNumber(newString);

    return setStringLabelBMFont.apply(this, cc.sys.isNative ? [newString] : [newString, needUpdateLabel]);
};

cc.LabelBMFont.prototype.setStringNoFormat = function (newString, needUpdateLabel) {

    return setStringLabelBMFont.apply(this, cc.sys.isNative ? [newString] : [newString, needUpdateLabel]);
};

var setStringLabelAtlas = cc.LabelAtlas.prototype.setString;
cc.LabelAtlas.prototype.setString = function (newString, needUpdateLabel) {

    newString = formatFloatNumber(newString);

    return setStringLabelAtlas.apply(this, cc.sys.isNative ? [newString] : [newString, needUpdateLabel]);
};

cc.LabelAtlas.prototype.setStringNoFormat = function (newString, needUpdateLabel) {

    return setStringLabelAtlas.apply(this, cc.sys.isNative ? [newString] : [newString, needUpdateLabel]);
};


var setStringEditBox = cc.EditBox.prototype.setString;
cc.EditBox.prototype.setString = function (text) {

    text = formatFloatNumber(text);

    return setStringEditBox.apply(this, [text]);
};

cc.EditBox.prototype.setStringNoFormat = function (text) {

    return setStringEditBox.apply(this, [text]);
};

function formatFloatNumber( input ) {
    var regex = /[0-9.]+/g;
    var output = "";
    var lastIndex = 0;

    input = String(input);

    while (true)
    {
        var match = regex.exec(input);
        if(!match)
        {
            output += input.substring(lastIndex);
            break;
        }

        var substring = input.substring(match.index, regex.lastIndex);

        if(match.index != lastIndex)
            output += input.substring(lastIndex, match.index);

        lastIndex = regex.lastIndex;

        if(substring.length > 1 && substring.indexOf('.') != -1 && substring.indexOf('.') == substring.lastIndexOf('.'))
        {
            var integer = substring.split(".");
            //substring = String(integer[0]) + String(ttutil.roundFloat(parseFloat(substring - integer[0]), 2)).substr(1);
			if ((substring - integer[0]) >= 0.995 && (substring - integer[0]) < 1) {

                substring = integer[0] * 1 + 1;
                //alert(substring);
            }
            else {
                substring = String(integer[0]) + String(ttutil.roundFloat(parseFloat(substring - integer[0]), 2)).substr(1);
            }
        }

        output += substring;
    }
    return output;
}
