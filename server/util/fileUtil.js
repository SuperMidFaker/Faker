/**
* Copyright (c) 2012-2014 Qeemo Ltd. All Rights Reserved.
*/
/**
* User: Kurten
* Date: 2014-04-04
* Time: 13:53:11
* File: fileUtil.js
* Version: 1.0
* Description: 文件需要注意，有可能包含恶意代码（图片文件又拍云会直接处理不需要担心，但是其他文件需要小心）
*/
"use strict";
var UPYun = require("./upyun").UPYun;
var upyunClient = module.exports;
var config = require("../../config/upyun.config");

upyunClient.init = function (config) {
    if (!config) {
        throw new Error("upyunClient config must not null!");
    }
    this.client = new UPYun(config.bucket, config.username, config.password);
    this.rootUrl = config.root_url;
    this.imageBucket = config.bucket;
    //res
    this.resBuucket = config.resource_bucket;
    this.resRootUrl = config.resource_url;
};

upyunClient.saveFile = function (base64file, prefix, isRes, suffix) {
    if (!base64file) {
        return function (done){
            done({status: 400, message: "parameter is null"});
        };
    }

    if (base64file.indexOf("http://") > -1 ||
        base64file.indexOf("https://") > -1) {
        return function (done) {
            done(null, [base64file, base64file]);
        };
    }

    var filePath = this.createSavePath(prefix);
    if(!!isRes){
        filePath = filePath +"."+suffix;
    }
    var buffer = new Buffer(base64file, "base64");
    var self = this;
    if (!!isRes) {
        self.client.changeBucket(self.resBuucket);
        return function (done) {
            self.client.writeFile(filePath, buffer, true, function (err, data) {
                done(reBuildErr(err), filePath);
            });
        };
    } else {
        self.client.changeBucket(self.imageBucket);
        return function (done) {
            self.client.writeFile(filePath, buffer, true, function (err, data) {
                done(reBuildErr(err), filePath);
            });
        };
    }
};

upyunClient.saveFileWithBuffer = function (buf, prefix, fileName, isres) {
    if (!buf || !Buffer.isBuffer(buf) || buf.length === 0) {
        return function (done) {
            done({status: 400, message: "parameter is null"});
        };
    }

    var filePath = this.createSavePath(prefix, fileName);
    var self = this;
    return function (done) {
        if (isres) {
            self.client.changeBucket(self.resBuucket);
        } else {
            self.client.changeBucket(self.imageBucket);
        }
        self.client.writeFile(filePath, buf, true, function (err, data) {
            done(reBuildErr(err), filePath);
        });
    };
};

upyunClient.getFileRelPath = function (fileUrl){
    var relPath = null;
    if (!fileUrl || fileUrl.trim().length === 0) {
        return relPath;
    }
    relPath = fileUrl;
    if (fileUrl.indexOf(this.rootUrl) === 0) {
        relPath = fileUrl.substring(this.rootUrl.length);
    }
    return relPath;
};

upyunClient.getFileUrl = function (path) {
    if (!path || path.trim().length === 0) {
        return null;
    }
    if (path.substring(0, "http".length) === "http") {
        return path;
    }

    var rootUrl = this.rootUrl;
    if (path.indexOf('hive_default_icon') !== -1) {
        rootUrl = 'http://qy.wetms.com';
    }
    path = (path.substring(0, 1) === "/") ? path : "/" + path;
    return rootUrl + path;
};

upyunClient.getResFileUrl = function (path) {
    if (!path || path.trim().length === 0) {
        return null;
    }
    if (path.substring(0, "http".length) === "http") {
        return path;
    }

    path = (path.substring(0, 1) === "/") ? path : "/" + path;
    return this.resRootUrl + path;
};

upyunClient.createSavePath = function (prefix, fileName) {
    const d = new Date();
    let name = `${d.getTime()}`;
    if (fileName) {
      const lastDotIndex = fileName.lastIndexOf('.');
      const origname = fileName.substring(0, lastDotIndex)
      const suffix = fileName.substring(lastDotIndex + 1);
      name = `${origname}-${d.getTime()}.${suffix}`;
    }
    const path = `/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}/${name}`;
    return (!prefix ? path : "/" + prefix + path);
};

function reBuildErr(err) {
    if (!err) {
        return null;
    }
    return {
        status: err.statusCode,
        message: err.message
    };
}

var inited = false;
if (!inited) {
    upyunClient.init(config);
    inited = true;
}
