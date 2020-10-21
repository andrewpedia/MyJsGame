/**
 * Created by 真心科技 on 2016/2/1.
 */



var native = {};

native.INIT_SCREEN_ORIENTATION = 0;
//横屏
native.SCREEN_ORIENTATION_LANDSCAPE = 0;
//竖屏
native.SCREEN_ORIENTATION_PORTRAIT = 1;
//其它自己看API
/////////////////////////////////////////////////////////
//吐丝 时间长短
native.toastLengthShort = 0;
native.toastLengthLong = 1;

//////////////////////////////////////////////////
//showConfirmDialog的回调函数引用
native.showConfirmDialogCallback = null;

//showQueryDialog的确定回调函数引用
native.showQueryDialogConfirmCallback = null;
//showQueryDialog的取消回调函数引用
native.showQueryDialogCancelCallback = null;

//微信登录后， 获得code码后的回调函数
native.onWXLoginCodeJSCF = null;

//微信分享后的回调函数
native.onWXShareJSCF = null;

//保存图片到相册
native.saveImageToLib = function (url){

    /*var texture = new cc.RenderTexture(w,h);
    if (!texture) return;

    texture.retain();

    texture.setAnchorPoint(0,0);
    texture.begin();
    node.visit();
    texture.end();

    var time = Math.round((new Date()).valueOf() / 1000);//时间转化格式
    var nameJPG = "ss-" + time + ".jpg";
    texture.saveToFile(nameJPG,cc.IMAGE_FORMAT_JPEG,false,function (renderTexture,str) {
        texture.release();

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "saveImageToGallery", "(Ljava/lang/String;)V", nameJPG);
        }

    });*/
    // 正在截图中判断
    /* if (this._isCapturing) {
         return;
     }
     this._isCapturing = true;

     // 截图文件判断
     var fileName = "shareScreenshot.jpg";
     var fullPath = jsb.fileUtils.getWritablePath() + fileName;
     if (jsb.fileUtils.isFileExist(fullPath)) {
         jsb.fileUtils.removeFile(fullPath);
     }

     // 截图并保存图片文件
     var size = cc.director.getWinSize(); // 获取视图大小
     var texture = new cc.RenderTexture(size.width, size.height); // 新建渲染纹理
     texture.setPosition(cc.p(size.width / 2, size.height / 2)); // 移动渲染纹理到视图中心
     texture.begin(); // 开始渲染
     node.visit(); // 访问当前场景
     texture.end(); // 渲染结束
     texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG); // 保存渲染纹理到图片文件
     console.log("渲染纹理完成");
     // 延时50毫秒，检测截图文件是否存在
     // 重复10次这个过程，如果超过10次仍没检测到图片文件，截图失败（超时）
     var self = this;
     var tryTimes = 0;
     var fn = function () {
         if (jsb.fileUtils.isFileExist(fullPath)) {
             // 调用相应平台微信分享图片方法
             if (cc.sys.os === cc.sys.OS_ANDROID) {

                 //jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "saveImageToGallery", "(Ljava/lang/String;)V", fullPath);
                 console.log("分享成功！！！");
             } else if (cc.sys.os === cc.sys.OS_IOS) {
                 jsb.reflection.callStaticMethod('AppController', 'shareIMG:', fullPath);
             }
             self._isCapturing = false;
         } else {
             tryTimes++;
             if (tryTimes > 10) {
                 self._isCapturing = false;
                 cc.log('截图失败，超时~');
                 return;
             }
             setTimeout(fn, 50);
         }
     };
     setTimeout(fn, 50);
     console.log("截图完成！！");*/
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "saveImageToGallery", "(Ljava/lang/String;)V", url);
    }else if (cc.sys.os === cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod("PlatformIOS", "toSaveImage:", url);
    }

    /*安卓端代码

    // 转bitmap
    public static Bitmap netPicToBmp(String src) {
        try {
            Log.d("FileUtil", src);
            URL url = new URL(src);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            Bitmap myBitmap = BitmapFactory.decodeStream(input);

            //设置固定大小
            //需要的大小
            float newWidth = 200f;
            float newHeigth = 200f;

            //图片大小
            int width = myBitmap.getWidth();
            int height = myBitmap.getHeight();

            //缩放比例
            float scaleWidth = newWidth / width;
            float scaleHeigth = newHeigth / height;
            Matrix matrix = new Matrix();
            matrix.postScale(scaleWidth, scaleHeigth);

            Bitmap bitmap = Bitmap.createBitmap(myBitmap, 0, 0, width, height, matrix, true);
            return bitmap;
        } catch (IOException e) {
            // Log exception
            return null;
        }
    }

    // 保存图片到图库
    public static void saveImageToGallery(String url) {
        Bitmap bmp = netPicToBmp(url);
        // 首先保存图片
        File appDir = new File(Environment.getExternalStorageDirectory(),
                "desheng");
        if (!appDir.exists()) {
            appDir.mkdir();
        }
        String fileName = System.currentTimeMillis() + ".jpg";
        File file = new File(appDir, fileName);
        try {
            FileOutputStream fos = new FileOutputStream(file);
            bmp.compress(Bitmap.CompressFormat.JPEG, 100, fos);
            fos.flush();
            fos.close();
        } catch (FileNotFoundException e) {

            Toast.makeText(JSCall.appActivity.getApplicationContext(), "保存失败", Toast.LENGTH_LONG).show();
            e.printStackTrace();
        } catch (IOException e) {
            Toast.makeText(JSCall.appActivity.getApplicationContext(), "保存失败", Toast.LENGTH_LONG).show();
            e.printStackTrace();
        }

        // 其次把文件插入到系统图库
        try {
            MediaStore.Images.Media.insertImage(JSCall.appActivity.getApplicationContext().getContentResolver(),
                    file.getAbsolutePath(), fileName, null);
            Toast.makeText(JSCall.appActivity.getApplicationContext(), "保存成功", Toast.LENGTH_LONG).show();

        } catch (FileNotFoundException e) {
            Toast.makeText(JSCall.appActivity.getApplicationContext(), "保存失败", Toast.LENGTH_LONG).show();
            e.printStackTrace();
        }
        // 最后通知图库更新
        JSCall.appActivity.getApplicationContext().sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE,
                Uri.fromFile(new File(file.getPath()))));
    }

    */
}

/**
 * 设置屏幕方向
 * @param requestedOrientation
 */
native.setRequestedOrientation = function (requestedOrientation) {
    cc.log("native.setRequestedOrientation\t" + requestedOrientation);
    if (native.INIT_SCREEN_ORIENTATION == requestedOrientation) return;

    if (cc.sys.platform == cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "setRequestedOrientation", "(I)V", requestedOrientation);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("PlatformIOS", "setOrientation:", requestedOrientation);
    }

    native.INIT_SCREEN_ORIENTATION = requestedOrientation;
};

/**
 * 初始化友盟。
 * @param obj {"appKey": ,"channelId": ,encryptEnabled: }
 */
native.initUMeng = function (obj) {
    var str = ttutil.obj2Str(obj);
    jsb.reflection.callStaticMethod("PlatformIOS", "initUMeng:", str);
};

// 友盟推送
native.initUMengPushWithAppKey = function (appKey) {
    jsb.reflection.callStaticMethod("PlatformIOS", "initUMengPushWithAppKey:", appKey);
};

// 获取友盟渠道
native.getUmengChannel = function () {
    var _GNativeInfo = GNativeInfo || {};

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "getUmengChannel", "()Ljava/lang/String;");
    }
    else if (cc.sys.os == cc.sys.OS_WINDOWS) {

        if (_GNativeInfo.channel) {
            return GNativeInfo.channel;
        }
        return "game7cai_win";
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        if (_GNativeInfo.channel) {
            return _GNativeInfo.channel;
        }
        return "game7cai_ios";
    }

    return "game7cai_win";
};

native.getVersion = function () {

    var version = "";

    switch (cc.sys.os) {
        case cc.sys.OS_ANDROID:
            version = GNativeInfo.ANDROIDVerison;
            break;

        case cc.sys.OS_IOS:
            version = GNativeInfo.IOSVerison;
            break;

        case cc.sys.OS_WINDOWS:
            version = GNativeInfo.WINDOWSVerison;
            break;
    }

    return version || "";
};

/**
 * 弹出一个警告框
 * @param title
 * @param message
 * @param callback  点击确定的回调函数
 */
native.showConfirmDialog = function (title, message, callback) {

    cc.log("native.showAlertDialog\t" + title + "\t" + message);
    if (cc.sys.platform == cc.sys.ANDROID) {
        native.showConfirmDialogCallback = callback;
        jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "showConfirmDialog", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", title, message, " native.showConfirmDialogCallback &&  native.showConfirmDialogCallback()");
    }
    else {
        // title, message, type, sureCallback, cancelCallback
        new MPMessageBoxLayer(title, message, mpMSGTYPE.MB_OK, callback).to(cc.director.getRunningScene());

    }
};

/**
 * 弹出一个询问框
 * @param title 标题
 * @param message 消息
 * @param confirmCallback 确定回调函数
 * @param cancelCallback 取消回调函数
 * @param confirmText 确定按钮的文字
 * @param cancelText 取消按钮的文字
 */
native.showQueryDialog = function (title, message, confirmCallback, cancelCallback, confirmText, cancelText) {

    confirmText = confirmText || "确定";
    cancelText = cancelText || "取消";
    cc.log("native.showQueryDialog\t" + title + "\t" + message);

    if (cc.sys.platform == cc.sys.ANDROID) {
        native.showQueryDialogConfirmCallback = confirmCallback;
        native.showQueryDialogCancelCallback = cancelCallback;
        jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "showQueryDialog", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", title, message, " native.showQueryDialogConfirmCallback &&  native.showQueryDialogConfirmCallback()", " native.showQueryDialogCancelCallback &&  native.showQueryDialogCancelCallback()", confirmText, cancelText);
    }
    else {
        // title, message, type, sureCallback, cancelCallback
        new MPMessageBoxLayer(title, message, mpMSGTYPE.MB_OKCANCEL, confirmCallback, cancelCallback).to(cc.director.getRunningScene());

    }
};

/**
 * 吐丝
 * @param message
 * @param duration
 */
native.toast = function (message, duration) {
    cc.log("native.toast\t" + message + "\t" + duration);

    if (cc.sys.platform == cc.sys.ANDROID) {
        duration = duration || 0;

        jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "toast", "(Ljava/lang/String;I)V", message, duration);
    }
    else {
        ToastSystemInstance.buildToast(message);
    }
};

/**
 * 设置屏幕是否长亮
 * @param isKeepScreenOn
 */
native.setKeepScreenOn = function (isKeepScreenOn) {
    cc.log("native.setKeepScreenOn\t" + isKeepScreenOn + "\t");
    if (cc.sys.platform == cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "setKeepScreenOn", "(Z)V", isKeepScreenOn);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("PlatformIOS", "setKeepScreenOn:", isKeepScreenOn ? 1 : 0);
    }
};

/**
 * 得到手机信息
 * 返回如下对象
 * {"BRAND":"Xiaomi","MODEL":"Mi-4c","SDK":22,"IMSI":"460036061911459"}
 */
native.getDeviceInfo = function () {
    cc.log("native.getDeviceInfo");
    if (cc.sys.platform == cc.sys.ANDROID) {
        var jsonString = jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "getDeviceInfo", "()Ljava/lang/String;") || "{}";
        return JSON.parse(jsonString);
    }
};
/**
 * 得到IMSI
 */
native.getIMSI = function () {
    cc.log("native.getIMSI");
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "getIMSI", "()Ljava/lang/String;");
    }
};

/**
 * 得到IMEI
 */
native.getIMEI = function () {
    cc.log("native.getIMEI");
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "getIMEI", "()Ljava/lang/String;");
    }
};

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error("copyTextToClipboard " + err);
        alert('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
    //复制焦点归位
    document.getElementById("gameCanvas").focus();
}
native.invoke = function (json) {
    if (!GNativeInfo.supportInvoke)
        return;

    if (!cc.isString(json)) {
        json.arguments = json.arguments || [];
        json = JSON.stringify(json);
    }

    switch (cc.sys.platform) {
        case cc.sys.ANDROID:
            return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "invoke", "(Ljava/lang/String;)Ljava/lang/String;", json);

        case cc.sys.IPHONE:
        case cc.sys.IPAD:
            return jsb.reflection.callStaticMethod("PlatformIOS", "invoke:", json);

        case cc.sys.WIN32:
            return WinNative.getInstance().invoke(json);
    }
};

native.onEvent = function (eventId) {
    return native.invoke({
        function: "onEvent",
        arguments: [eventId]
    });
};

native.registerEvent = function (userid) {
    userid = String(userid);

    return native.invoke({
        function: "registerEvent",
        arguments: [userid]
    });
};

native.loginEvent = function (userid) {
    userid = String(userid);

    return native.invoke({
        function: "loginEvent",
        arguments: [userid]
    });
};

native.create_roleEvent = function (role) {
    return native.invoke({
        function: "create_roleEvent",
        arguments: [role]
    });
};

native.submit_paymentEvent = function (userid, orderid, item, amount) {
    userid = String(userid);
    orderid = String(orderid);
    item = String(item);
    amount = String(amount);

    return native.invoke({
        function: "submit_paymentEvent",
        arguments: [userid, orderid, item, amount]
    });
};

native.finish_paymentEvent = function (userid, orderid, item, amount) {
    userid = String(userid);
    orderid = String(orderid);
    item = String(item);
    amount = String(amount);

    return native.invoke({
        function: "finish_paymentEvent",
        arguments: [userid, orderid, item, amount]
    });
};

native.startRecord = function (path) {
    return native.invoke({
        function: "startRecord",
        arguments: [path]
    });
};

native.stopRecord = function () {
    return native.invoke({
        function: "stopRecord"
    });
};

/**
 * 设置剪切板数据
 * @param text
 * @returns {*}
 */
native.setClipboard = function (text) {
    text = String(text);

    cc.log("native.setClipboard:\n" + text);

    switch (cc.sys.platform) {
        case cc.sys.ANDROID:
            jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "setClipboard", "(Ljava/lang/String;)V", text);
            break;
        case cc.sys.IPHONE:
        case cc.sys.IPAD:
            jsb.reflection.callStaticMethod("PlatformIOS", "copyStr:", text);
            break;

        case cc.sys.WIN32:
            WinNative.getInstance().setClipboard(text);
            break;

        case cc.sys.MOBILE_BROWSER:
        case cc.sys.DESKTOP_BROWSER:
            copyTextToClipboard(text);
            break;

        default:
            ToastSystemInstance.buildToast("此平台暂不支持剪切板功能");
            break;
    }
};

/**
 * 发送微信 支付请求
 * @param jsonString
 * @returns {*}
 */
native.sendWXPayReq = function (jsonString) {
    cc.log("native.sendWXPayReq:\n" + jsonString);
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "sendWXPayReq", "(Ljava/lang/String;)V", jsonString);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        var obj = JSON.parse(jsonString);

        var str = ttutil.obj2Str(obj);
        return jsb.reflection.callStaticMethod("PlatformIOS", "weixinPay:", str);
    }
};

/**
 * 发送支付宝 支付请求,
 * @param jsonString
 * @returns {*}
 */
native.sendZFBPayReq = function (jsonString) {
    cc.log("native.sendZFBPayReq:\n" + jsonString);
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "sendZFBPayReq", "(Ljava/lang/String;)V", jsonString);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "aliPay:", jsonString);
    }
};

/**
 * 发送内购买 支付请求,
 * @param productId 商品id
 * @returns {*}
 */
native.sendIAPReq = function (productId, url) {
    return jsb.reflection.callStaticMethod("PlatformIOS", "requestProductWithId:andUrl:", productId, url);
};


native.callQQ = function (qq) {
    cc.log("native.callQQ:\t" + qq);
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "callQQ", "(Ljava/lang/String;)V", qq);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("PlatformIOS", "jumpToQQChat:", qq);
    }

    else {
        // cc.sys.openURL("http://wpa.qq.com/msgrd?v=3&uin=800181068");
        cc.sys.openURL("http://sighttp.qq.com/msgrd?v=3&uin=" + qq + "&site=&menu=yes");
    }

};

/**
 * 检查是否有更新
 * @returns {*}
 */
native.checkUpdate = function () {
    cc.log("native.checkUpdate:\t");
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "checkUpdate", "()V");
    }
};


/**
 * 友盟统计计数事件
 * @param eventID 事件名
 * @param eventAttr 事件属性， 是个对象
 * @returns {*}
 */
native.umEventCount = function (eventID, eventAttr) {
    eventAttr = eventAttr || {};

    cc.log("native.umEventCount:\t" + eventID + "\teventAttr:\t" + JSON.stringify(eventAttr));
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "umEventCount", "(Ljava/lang/String;Ljava/lang/String;)V", eventID, JSON.stringify(eventAttr));
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        var str = ttutil.obj2Str(eventAttr);
        return jsb.reflection.callStaticMethod("PlatformIOS", "umEventCount:withAttributes:", eventID, str);
    }
};

/**
 * 友盟统计计算事件
 * @param eventID  事件名
 * @param eventAttr 事件属性
 * @param value 值
 * @returns {*}
 */
native.umEventValue = function (eventID, eventAttr, value) {
    eventAttr = eventAttr || {};
    cc.log("native.umEventValue:\t" + eventID + "\teventAttr:\t" + JSON.stringify(eventAttr) + "\tvalue\t" + value);
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "umEventValue", "(Ljava/lang/String;Ljava/lang/String;I)V", eventID, JSON.stringify(eventAttr), value);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        var str = ttutil.obj2Str(eventAttr);
        return jsb.reflection.callStaticMethod("PlatformIOS", "umEventValue:withAttributes:andValue:", eventID, str, value)
    }
};

/**
 * 自动填充屏幕
 */
native.autoFillScreen = function (designResolutionSize) {
    cc.log("native.autoFillScreen", JSON.stringify(designResolutionSize));

    // designResolutionSize.width;
    // designResolutionSize.height;
    if (cc.sys.platform == cc.sys.ANDROID) {
        //jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "autoFillScreen", "(II)V", designResolutionSize.width, designResolutionSize.height);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("PlatformIOS", "resizeSideBarWithWidth:andHeight:", designResolutionSize.width, designResolutionSize.height);
    }
};

/**
 * 得到 包版本编号
 * @returns {*}
 */
native.getVersionCode = function () {
    if (cc.sys.platform == cc.sys.ANDROID) {


        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "getVersionCode", "()I");

    } else if (cc.sys.os == cc.sys.OS_IOS) {

    }
};

/**
 * 下载并安装该apk
 * @param apkUrl
 * @param packageName
 * @param title
 * @returns {*}
 */
native.downloadAndInstallApk = function (apkUrl, packageName, title) {
    if (cc.sys.platform == cc.sys.ANDROID) {


        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "downloadAndInstallApk", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", apkUrl, packageName, title);

    } else if (cc.sys.os == cc.sys.OS_IOS) {

    }
};

/**
 * 是否安装了微信
 * @returns {*}
 */
native.isWXAppInstalled = function () {
    if (cc.sys.platform == cc.sys.ANDROID) {
        return native.isAppInstalled("com.tencent.mm");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "isWXAppInstalled");
    }

    return false;
};

//打开微信
native.openWXApp = function () {
    if (cc.sys.platform == cc.sys.ANDROID) {
        cc.sys.openURL("weixin://");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        cc.sys.openURL("weixin://");
    }
};

/**
 * 是否是模拟器
 * @returns {*}
 */
native.isInSimulator = function () {
    return native.isAppInstalled("com.android.flysilkworm");//雷电游戏中心
};

native.isAppInstalled = function (packageName) {
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "isAppInstalled", "(Ljava/lang/String;)Z", packageName);
    }

    return false;
};

/**
 * 微信登录
 * @param appID
 * @param state
 * @param callback   登录登录后 获取code后 回调js的， 参数为code
 */
native.wxLogin = function (appID, state, callback) {

    native.onWXLoginCodeJSCF = callback;
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "wxLogin", "(Ljava/lang/String;Ljava/lang/String;)V", appID, state);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "wxLoginWithScope:andState:andOpenID:", "", state, appID);
    }
};

/**
 * 微信分享
 * @param appID
 * @param title    //标题
 * @param url      //链接
 * @param text     说明文字
 * @param wxScene 0表示聊天界面， 1表示朋友圈
 * @param callback  分享后 回调的 参数为 (errCode, openId),errCode 0表示分享成功, openID可用来区分微信 用户， 防止 多个号， 同一微信号分享多次,
 */
native.wxShareUrl = function (appID, url, title, text, wxScene, callback) {

    title = title || "1亿大奖派奖中！068游戏-手机版街机电玩捕鱼游戏强势来袭，街机电玩移植，手机版电玩城，随时随地嗨翻天！！";
    native.onWXShareJSCF = callback;
    wxScene = wxScene == null ? 1 : wxScene;
    if (cc.sys.platform == cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "onWXShareWithWebUrl", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)V", appID, url, title, text, wxScene);
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "wxShareWebUrlWithURL:Title:Description:Scene:", url, title, text, wxScene);
    }
};

native.isRootAvailable = function () {
    if(native.isInSimulator())
        return true;

    if(cc.sys.os == cc.sys.OS_IOS)
    {
        return native.invoke({
            function: "isJailbroken"
        }) == "1";
    }

    return native.invoke({
        function: "isRootAvailable"
    }) == "1";
};

native.isTVDevice = function () {
    return native.invoke({
        function: "isTVDevice"
    }) == "1";
};

native.scanQRCode = function (callback) {
    native.onScanQRCodeCallback = callback;

    return native.invoke({
        function: "scanQRCode"
    });
};

native.addWebBrowser = function (url, x, y, width, height) {
    return native.invoke({
        function: "addWebBrowser",
        arguments: [url, x, y, width, height]
    });
};

native.removeWebBrowser = function () {

    return native.invoke({
        function: "removeWebBrowser"
    });
};

native.amr2wav = function (amrPath, wavPath) {
    return native.invoke({
        function: "amr2wav",
        arguments: [amrPath, wavPath]
    });
};

native.oggConverter = function (input, output) {
    return native.invoke({
        function: "oggConverter",
        arguments: [input, output]
    });
};

native.amr2ogg = function (amrPath, oggPath) {
    var wavPath = jsb.fileUtils.getWritablePath() + "temp/audio.wav";
    native.amr2wav(amrPath, wavPath);
    return native.oggConverter(wavPath, oggPath);
};

native.getDownloadPath = function () {
    return native.invoke({
        function: "getDownloadPath"
    });
};

native.downloadApk = function (url) {

    var result = native.invoke({
        function: "downloadApk",
        arguments: [url, native.getBundleId(), productName]
    });

    if (result != "1")
        cc.sys.openURL(url);
};

// 获取设备UUID
native.getDeviceId = function (notDetectInvalid) {

    if (!cc.sys.isNative)
        return "00000000-0000-0000-0000-000000000000";

    if (!notDetectInvalid && native.isRootAvailable())
        return "00000000-0000-0000-0000-000000000000";

    var uuid = native.invoke({
        function: "getDeviceId"
    });

    if (uuid != null)
        return uuid;

    if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "getUUID");
    }

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        return jsb.reflection.callStaticMethod("com/game036/framework/JSCall", "getDeviceId", "()Ljava/lang/String;");
    }

    if (cc.sys.os == cc.sys.OS_WINDOWS) {
        uuid = native.getValueWithKey("uuid", "");
        if (uuid == "") {
            uuid = ttutil.generateUUID();
            native.setValueWithKey("uuid", uuid);
        }

        return uuid;
    }

    return "";
};

// 存储值到keyChain
native.setValueWithKey = function (key, value) {
    if (!cc.sys.isNative)
        return;

    if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("PlatformIOS", "setValue:withKey:", value, key);
    }
    else if (cc.sys.os == cc.sys.OS_WINDOWS) {
        WinNative.getInstance().setValueToRegistry(key, value);
    }
};

// 从keyChain中读取值
native.getValueWithKey = function (key, value) {
    if (!cc.sys.isNative)
        return "";

    if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "getValue:withKey:", value, key);
    }

    if (cc.sys.os == cc.sys.OS_WINDOWS) {
        return WinNative.getInstance().getValueFromRegistry(key, value);
    }

    return "";
};

// 获取bundleId
native.getBundleId = function () {
    if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "getBundleId");
    }

    return "com.game068.mobileplaza";
};

// 苹果手机是否越狱
native.isJailbroken = function () {
    if (cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PlatformIOS", "isJailbroken");
    }

    return false;
};

// 进入后台,播放大厅背景音乐
native.playBgMusic = function () {
    if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("PlatformIOS", "playBgMusic:", "res/sound/audio-hall");
    }
};
/**
 * 得到代理推广ID
 */
native.getChannelID = function () {

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getChannelID", "()Ljava/lang/String;");
    }
    if (cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod("PlatformIOS", "getShareInstallChannelID");
    }
    else {
        return '0';
    }
};

