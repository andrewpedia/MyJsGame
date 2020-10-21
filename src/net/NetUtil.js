/**
 * Created by 黄二杰 on 2016/5/19.
 */



var NetUtil = cc.Class.extend({
    _className: "NetUtil",
    _classPath: "src/net/NetUtil.js",


    get: function (url, callback, errcb, timeout) {

        var xhr = cc.loader.getXMLHttpRequest();

        if (timeout) {
            xhr.timeout = timeout

            xhr.ontimeout = function () {
                if (errcb) {
                    errcb("timeout")
                }
                
            };

        }
        
        xhr.open("GET", url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                var text = xhr.responseText;

                callback && callback(text);
            }
        };

      xhr.onerror = function (err) {

             if (errcb) {
                    errcb(err)
             }
        };

    
        xhr.send();

    },


    post: function (url, data, callback) {
        var xhr = cc.loader.getXMLHttpRequest();


        xhr.open("POST", url, true);

        xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {

                var text = xhr.responseText;

                callback && callback(text);

            }
        };
        xhr.send(data);
    },

    /**
     * 获取自己的ip信息
     * @param callback
     */
     getIPInfo: function (callback) {

        var timeBegin = Date.now()

        this.get("http://"+apiDomain+"/getipinfo", (json) => {
            try {
                cc.log("获取ip耗时:",Date.now()-timeBegin, "ms")

                //console.log(json);

                var result = JSON.parse(json);
                // var ip = result.ip;
                // var address=result.address;

                callback && callback(result);
            } catch (e) {
                // ttutil.dump({action: "getIPInfo", text: text, e: e.message})
            }
        }, (err) =>{console.log(err)   
            callback()},
        10000);

    },
	//获取推广链接地址（短链接）
    getUrlShort: function (userID) {

        var timeBegin = Date.now()

        this.get("http://"+apiDomain+"/shorturl/index/sina?userid="+userID, (json) => {
            try {
                //cc.log("获取推广链接耗时:",Date.now()-timeBegin, "ms")
                //console.log(json);
                //var result = JSON.parse(json);
                // var ip = result.ip;
                // var address=result.address;
                //callback && callback(result);
            } catch (e) {
                // ttutil.dump({action: "getIPInfo", text: text, e: e.message})
            }
        });

    },
// getIPInfo: function (callback) {
//         this.get("https://api.ipify.org", (ip) => {

//             this.get("http://api.map.baidu.com/location/ip?ip="+ ip+"&ak=57ff6fcd61f78fedc930a7eb43980a56" , (json) => {
//                 try {

//                     console.log(json);

//                     var result = JSON.parse(json);
//                     //callback && callback(ip, result.data.country + " " + result.data.region + " " + result.data.city, result.data.city, result.data.region);
// 					callback && callback(ip,  result.content.province + " " + result.content.city, result.content.city, result.content.province,"");
//                 } catch (e) {
//                     // ttutil.dump({action: "getIPInfo", text: text, e: e.message})
//                 }
//             });
//         }, (err) =>{console.log(err)   
//             callback()},
//         10000);
//     },
    /**
     * 获取服务器列表
     * @param callback
     */
    getServerList: function (callback) {
        try{
            this.get(gameListUrl, (json) => 
                {
                    cc.log(json);
                    var result = JSON.parse(json);
                    callback(result)
                })
        }catch (e) {
            cc.error("getServerList failed")
        }

    },
});



