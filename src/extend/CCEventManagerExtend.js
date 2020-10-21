/**
 * Created by coder on 2017/7/10.
 */

if(!cc.sys.isNative)
{
    var _onTouchEventCallback = cc.eventManager._onTouchEventCallback;

    cc.eventManager._onTouchEventCallback = function (listener, argsObj) {
        var result = _onTouchEventCallback.apply(this, [listener, argsObj]);

        var eventCode = argsObj.event.getEventCode();

        if(eventCode != cc.EventTouch.EventCode.BEGAN)
            return result;

        if(result)
        {
            var target = listener._node;
            cc.log(target);
            cc.log("_className = " + target._className + ", _classPath = " + target._classPath);
            var parent = target.getSceneOrLayerInParent();
            if(parent != null)
                cc.log("parent => _className = " + parent._className + ", _classPath = " + parent._classPath);
        }

        return result;
    }.bind(cc.eventManager);
}
