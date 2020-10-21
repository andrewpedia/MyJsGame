/**
 * Created by coder on 2017/7/18.
 */

var audioEngine;
if (cc.sys.isNative) {
    audioEngine = jsb.AudioEngine;
}
else {
    audioEngine = cc.audioEngine;
}

var audios = {};

if(cc.sys.isNative)
{
    var play2d = audioEngine.play2d;

    audioEngine.play2d = function (filePath, loop, volume, profile) {

        if(cc.sys.os == cc.sys.OS_WINDOWS && filePath.endsWith(".amr"))
        {
            var tempDirectory = jsb.fileUtils.getWritablePath() + "temp/";
            if(!jsb.fileUtils.isDirectoryExist(tempDirectory))
                jsb.fileUtils.createDirectory(tempDirectory);

            var oggPath = tempDirectory + Encrypt.MD5(filePath) + ".ogg";
            
            if(!jsb.fileUtils.isFileExist(oggPath))
            {
                if(native.amr2ogg(filePath, oggPath) != "1")
                    ToastSystemInstance.buildToast("您的版本不支持此功能，请到官网下载新版本");
            }

            filePath = oggPath;
        }

        var id = play2d.apply(this, arguments);

        audios[id] = filePath;

        audioEngine.setFinishCallback(id, function () {
            delete audios[id];
        });

        return id;
    }.bind(audioEngine);

    var stop = audioEngine.stop;

    audioEngine.stop = function (id) {
        audioEngine.setVolume(id, 0);
        audioEngine.setLoop(id, false);
    };
}

var stopAll = audioEngine.stopAll;

audioEngine.stopAll = function () {
    if(cc.sys.isNative)
    {
        for(var id in audios)
        {
            audioEngine.stop(id);
            delete audios[id];
        }
    }
    else
    {
        audioEngine.stopMusic();
        audioEngine.stopAllEffects();
    }
};