/**
 * Created by babybus on 2016/1/16.
 */


var ClassStorage = function (fileName) {

    var basePath;
    if (cc.game.config.debugMode == 0) {
        basePath = jsb.fileUtils.getWritablePath() + "release/";
    }
    else {
        basePath = jsb.fileUtils.getWritablePath() + "debug/";
    }

    this.savePath = cc.sys.isNative ? (basePath + fileName) : fileName;
    this.dataRoot = null;
    this.loadFromFile();


};
var p = ClassStorage.prototype;
p.loadFromFile = function () {
    var str = jsb.fileUtils.getStringFromFile(this.savePath);

    this.dataRoot = JSON.parse(str) || {};

    cc.log(JSON.stringify(this.dataRoot));
};

p.saveToFile = function () {
    jsb.fileUtils.writeStringToFile(JSON.stringify(this.dataRoot), this.savePath);
};

p.dump = function () {
    ttutil.dump(this.dataRoot);
};

p.setValue = function (key, value, isFlush) {
    this.dataRoot[key] = value;
    isFlush && this.saveToFile();
};

p.delKey = function (key, isFlush) {
    delete this.dataRoot[key];
    isFlush && this.saveToFile();
};

p.getValue = function (key) {
    return this.dataRoot[key];
};

p.flush = p.saveToFile;

