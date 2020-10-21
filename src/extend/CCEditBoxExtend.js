/**
 * Created by coder on 2017/6/29.
 */

if(!cc.sys.isNative)
{
    /**
     * Sets whether the widget is touch enabled. The default value is false, a widget is default to touch disabled
     * @param {Boolean} enable  true if the widget is touch enabled, false if the widget is touch disabled.
     */
    cc.EditBox.prototype.setTouchEnabled = function (enable) {
        if (this._touchEnabled === enable)
            return;

        this._touchEnabled = enable;                                  //TODO need consider remove and re-add.
        if (this._touchEnabled) {
            if (!this._touchListener)
                this._touchListener = cc.EventListener.create({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: true,
                    onTouchBegan: this._onTouchBegan.bind(this),
                    onTouchEnded: this._onTouchEnded.bind(this)
                });
            cc.eventManager.addListener(this._touchListener, this);
        } else {
            cc.eventManager.removeListener(this._touchListener);
        }
    };

    var _onTouchBegan = cc.EditBox.prototype._onTouchBegan;

    cc.EditBox.prototype._onTouchBegan = function (touch) {
        if(!this.isVisibleInHierarchy())
            return;

        return _onTouchBegan.apply(this, [touch]);
    };

    var _onTouchEnded = cc.EditBox.prototype._onTouchEnded;

    cc.EditBox.prototype._onTouchEnded = function (touch) {
        if(!this.isVisibleInHierarchy())
            return;

        return _onTouchEnded.apply(this, [touch]);
    };
}
