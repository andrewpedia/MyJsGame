/**
 * Created by Apple on 2016/6/18.
 */


//跟ttutil的区别在于， 这边的工具， 大都只有大厅会用得到而已
var mputil = {};

//创建一种指定形式的输入框
mputil.buildEditBox = function (placeHolderText, tipText, inputMode, size, color, multiLine, maxLength) {
    inputMode = inputMode || cc.EDITBOX_INPUT_MODE_SINGLELINE;
    size = size || cc.size(400, 24);
    color = color || cc.color(255, 255, 255, 255);

    // var editBox = new cc.EditBox(size, new cc.Scale9Sprite());
    var editBox = new FocusEditBox(size, new cc.Scale9Sprite());
    editBox.setFontSize(24);
    editBox.setPlaceHolder(placeHolderText);
    editBox.setPlaceholderFontSize(24);
    editBox.setMaxLength(maxLength || 20);
    editBox.setFontColor(color);
    editBox.setInputMode(inputMode);

    if(multiLine)
    {
        editBox.setMaxLength(1000);

        if(cc.sys.os == cc.sys.OS_WINDOWS && cc.sys.isNative)
        {
            var message = new ccui.Text("", GFontDef.fontName, editBox.getFontSize());
            message.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
            message.setContentSize(size);
            message.ignoreContentAdaptWithSize(false);

            message.setColor(color);
            message.to(editBox).pp();

            editBox.setFontColor(cc.color(255, 255, 255, 0));

            var setDelegate = editBox.setDelegate;

            editBox.setDelegate = function (delegate) {

                var editBoxTextChanged = delegate.editBoxTextChanged && delegate.editBoxTextChanged.bind(delegate);

                delegate.editBoxTextChanged = function (editBox, text) {

                    message.setString(text);

                    editBoxTextChanged && editBoxTextChanged(editBox);
                };

                setDelegate.apply(editBox, [delegate]);
            }.bind(editBox);

            editBox.setDelegate({});
        }
    }

    editBox.mpBG = new ccui.Scale9Sprite("common_input_box2.png").to(editBox, -1).pp(0.5, 0.5);
    editBox.mpBG.setContentSize(editBox.getContentSize().width + 30, editBox.getContentSize().height + 20);

    // cc.log("========= " + (typeof tipText))
    if (typeof tipText == "string")
    {
        editBox.mpTip = new cc.LabelTTF(tipText, GFontDef.fontName, 24).to(editBox.mpBG).anchor(1, 0.5).pp(-0.05, 0.5);
        editBox.mpTip.setColor(cc.color("#7280ff"));
    }
    else if (typeof tipText == "object")
    {
        editBox.mpTip = tipText;
        tipText.to(editBox.mpBG).pp(0,0.5);
    }

    editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);

    return editBox;
};

mputil.buildSingleEditBox = function (size,inputType,color,maxLength,placeHolder) {

    var editBox = new FocusEditBox(size, new cc.Scale9Sprite("common_input_box2.png"));
    editBox.setFontSize(36);
    editBox.setPlaceHolder(placeHolder);
    editBox.setPlaceholderFontSize(24);
    editBox.setMaxLength(maxLength || 20);
    editBox.setFontColor(color);
    editBox.setInputMode(inputType);

    return editBox;
}

mputil.buildCheckBox = function (hint, checkBoxArray, onRadioClick) {

    var node = new cc.Node();
    var hint = new cc.LabelTTF(hint, GFontDef.fontName, 20);
    hint.setColor(cc.color(131, 248, 104));

    var checkBox = node.checkBox = new FocusCheckBox("res/gui/login/radioEmpty.png", "res/gui/login/radio.png");
    checkBox.ignoreContentAdaptWithSize(false);
    checkBox.size(45, 45);
    node.size(hint.width + checkBox.width + 20, checkBox.height + 5);
    hint.to(node).anchor(0, 0.5).pp(0, 0.5);
    checkBox.to(node).p(hint.width + checkBox.width - 20, hint.y);

    node.checkBox.addTouchEventListener(onRadioClick);
    node.checkBox.setSelected(false);

    checkBoxArray && checkBoxArray.push(node.checkBox);

    return node;
};

/**
 * 判断gameID是否合法
 * @param gameID
 */
mputil.gameIDIsLegal = function (gameID) {

    //if (!gameID.match(/^[0-9]{6,8}$/)) {
	if (!gameID.match(/^[0-9]{3,8}$/)) {
        ToastSystemInstance.buildToast("gameID不合法");
        return false;
    }
    return true;
};
/**
* 判断是正整数
* @param gameID
*/
mputil.isNumber = function (num) {

    var re = /^[0-9]+$/;
    return re.test(num)
};
/**
 * 判断账号是否合法
 * @param account
 */
mputil.accountIsLegal = function (account) {

    var mobileNumReg = /^1[\d]{10}$/;
    if (mobileNumReg.test(account)) {
        return true;
    }
    return false;

    if (!account) {
        ToastSystemInstance.buildToast("账号不能为空");
        return false;
    }
    if (account.length < 6) {
        ToastSystemInstance.buildToast("账号不可低于6位数");
        return false;
    }
    if (account.length > 20) {
        ToastSystemInstance.buildToast("账号不可大于20位");
        return false;
    }
    if (!account.match(/^[0-9a-zA-Z_]{6,20}$/)) {
        ToastSystemInstance.buildToast("账号只能使用数字、字母、下划线, 6-20位");
        return false;
    }
    return true;
};

/**
 * 验证邮箱是否合法
 * @param email
 * @returns {boolean}
 */
mputil.emailIsLegal = function (email) {
    if (!email.match(/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/)) {
        ToastSystemInstance.buildToast("请赶写规范的邮箱");
        return false;
    }
    return true;
};

/**
 * 验证码是否合法
 * @param code
 */
mputil.codeIsLegal = function (code) {
    if (code.length < 4) {
        ToastSystemInstance.buildToast("验证码不合法");
        return false;
    }
    return true;
};

/**
 * 判断昵称是否合法
 * @param nickname
 * @returns {boolean}
 */
mputil.nicknameIsLegal = function (nickname) {
    if (!nickname) {
        ToastSystemInstance.buildToast("昵称不能为空");
        return false;
    }
    if (nickname.match(/\s/)) {
        ToastSystemInstance.buildToast("昵称不能包含非可见字符");
        return false;
    }
    //含有不合法的字符
    if (nickname.match(/\"|\'|\;|\:|\,|\{|\}|\[|\]|\)|\(/gi)) {
        ToastSystemInstance.buildToast("昵称含有不合法的字符");
        return false;
    }
    //昵称不能为纯数字
    if (nickname.match(/^[0-9]*$/gi)) {
        ToastSystemInstance.buildToast("昵称不能为纯数字");
        return false;
    }
    if (ttutil.getByteLen(nickname) > 16) {
        ToastSystemInstance.buildToast("昵称过长");
        return false;
    }
    return true;
};

/**
 * 判断密码是否合法
 * @param pwd
 * @returns {boolean}
 */
mputil.passwordIsLegal = function (pwd) {
    if (!pwd.match(/^\S{6,20}$/) || (pwd.length != ttutil.getByteLen(pwd))) {
        ToastSystemInstance.buildToast("密码长度必须在6到20, 且不包含非法字符");
        return false;
    }

    return true;
};

//创建下划线字体
mputil.buildUnderlineLabel = function (text) {
    var label = new FocusText(text, GFontDef.fontName, 20);
    // var label = new ccui.Text(text, GFontDef.fontName, 20);
    label.setColor(cc.color(231, 208, 124));
    var underline = new cc.Sprite("res/gui/file/gui-bank-xiahuaxian.png").to(label);

    var oldSetString = label.setString;
    label.setString = function (str) {
        oldSetString.apply(label, [str]);
        //设置字符串， 要到下一帧才能得到其真正大小
        underline.runAction(cc.callFunc(function () {
            underline.setScaleX(label.cw() / underline.cw());
            underline.pp(0.5, 0);
        }));

    };
    label.setString(text);
    label.setTouchEnabled(true);
    label.addTouchEventListener(function (sender, type) {
        if (type == ccui.Widget.TOUCH_BEGAN) {
            SoundEngine.playEffect(commonRes.btnClick);
            sender.setScale(1.1);

        } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {

            sender.setScale(1);
        }

    });

    return label;
};

/**
 * 创建一个vip等级图标
 * @param vipLevel
 */
mputil.buildVipIcon = function (vipLevel) {

    var widget = new FocusWidget().anchor(0.5, 0.5);


    var bg = new cc.Sprite().to(widget);


    var vipNum = new cc.Sprite().to(widget).qscale(0.7);

    widget.bg = bg;
    widget.vipNum = vipNum;


    //设置vip图标
    widget.setVipLevel = function (level) {

        cc.log("setVipLevel:"+ widget.vipLevel+",level:"+level );
        if (widget.vipLevel != level) {
            // widget.bg.display("#gui-vip-icon-" + level + ".png");
            var bgPngName = "#gui-vip-icon-" + level + ".png"
            var vipLevelImage = "#gui-vip-num-" + level + ".png"

            
            if (level == 0) {
                vipLevelImage = "#gui-vip-num-" + level + "-hui.png";
            }


            widget.bg.display(bgPngName);
            widget.vipNum.display(vipLevelImage);

            widget.vipLevel = level;
            widget.size(widget.bg.size());
            widget.bg.pp();

            if (level >= 6) {
                widget.vipNum.pp(0.5, 0.4);
                widget.anchor(0.5, 0.35);
            }
            else {
                widget.vipNum.pp(0.5, 0.6);
                widget.anchor(0.5, 0.5);
            }

            //widget.vipNum.setVisible(false);
        }

    };

    widget.setVipLevel(vipLevel);

    return widget;
};


