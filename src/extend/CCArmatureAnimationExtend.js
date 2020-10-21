/**
 * Created by coder on 2018/3/12.
 */

if(!cc.sys.isNative)
{
    var animations = [];

    var _p = ccs.ArmatureAnimation.prototype;

    var play = _p.play;

    _p.play = function (animationName, durationTo, loop) {

        animations.push(this);

        return play.apply(this, [animationName, durationTo, loop]);
    };

    var movementEvent = _p.movementEvent;
    _p.movementEvent = function (armature, movementType, movementID) {
        if(movementType == ccs.MovementEventType.complete)
        {
            var index = animations.indexOf(this);
            index != -1 && animations.splice(index, 1);
        }

        return movementEvent.apply(this, [armature, movementType, movementID]);
    };

    var pauseAllAnimation = function () {
        for(var i = 0; i < animations.length; i++){
            animations[i].pause();
        }
    };

    var resumeAllAnimation = function () {
        for(var i = 0; i < animations.length; i++){
            animations[i].resume();
        }
    };
}
