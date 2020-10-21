/**
 * Created by coder on 2017/7/18.
 */

if(!cc.sys.isNative)
{
    var getItem = cc.sys.localStorage.getItem;

    cc.sys.localStorage.getItem = function (key, defaultValue) {

        var value = getItem.apply(this, [key]);
        if(value == null)
            return defaultValue;

        return value;
    }.bind(cc.sys.localStorage);
}

var runScene = cc.director.runScene;

cc.director.runScene = function (scene) {

    cc.log("runScene", scene._className);

    if(cc.sys.isNative && mpGD.storage != null)
    {
        var deviceId = mpGD.storage.getValue("deviceId");

        if(deviceId == null || deviceId == "00000000-0000-0000-0000-000000000000")
            mpGD.storage.setValue("deviceId", native.getDeviceId(true), true);
        else if(deviceId != native.getDeviceId(true))
        {
            cc.log("设备id不同");
            return;
        }
    }

    return runScene.apply(this, [scene]);
}.bind(cc.director);

var parse = JSON.parse;

JSON.parse = function(jsonString,reviver) {
    try
    {
        return parse.apply(this, [jsonString, reviver]);
    }
    catch (e)
    {
        return null;
    }
}.bind(JSON);
