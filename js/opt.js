var opt = new Object();

opt.mainPath = 'https://flows.cdyylkj.com/Right';
// opt.mainPath = 'http://59.110.112.96:8002';

//接口
var api = {
    create: opt.mainPath + '/HttpAPI', //创建订单succ
    validate: opt.mainPath + '/VerifyCode',
};

opt.ajax_timout = 20000;

//勾选协议校验
opt.verifyRule = function (nval) {
    var checkRule = document.getElementsByClassName('van-checkbox')[0].getAttribute("aria-checked");
    if (checkRule == "false") {
        return false;
    } else {
        return true;
    }
};

//手机号校验
opt.verifyMbl = function (nval) {
    var pattern = /^(((1[0-9]{2}))+\d{8})$/;
    var flag = pattern.test(nval);
    return flag;
};

//验证码校验
opt.verifyCode = function (nval) {
    var pattern = /^\d+$/;
    var flag = pattern.test(nval);
    return flag;
};

opt.addURLParam = function (url, name, value) {
    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }
    url += (url.indexOf('?') == -1 ? '?' : '&');
    url += encodeURIComponent(name) + '=' + encodeURIComponent(value);
    return url;
  }

opt.ajaxPromise = function (config) {
    //msg: true,不显示loading
    if (!config.hideloading) {
        vant.Toast.loading({
            duration: 0,
            loadingType: 'spinner',
            message: '加载中...',
            forbidClick: true,
        });
    }

    var packet = new Object();
    packet.url = config.url;
    for (key in config.param) {
        if (config.param.hasOwnProperty(key)) {
            packet.url = opt.addURLParam(packet.url, key, config.param[key]);
        }
    }
    // console.log(packet.url);
    packet.type = config.type ? config.type : 'GET';
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(packet.type, packet.url, true);
        // 添加http头，发送信息至服务器时内容编码类型
        xhr.setRequestHeader(
            'Content-Type',
            'application/x-www-form-urlencoded'
        );
        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
        xhr.onreadystatechange = function () {
            //4: 请求已完成，且响应已就绪（下载操作已完成）
            if (xhr.readyState == 4) {
                // config.success.call(this, xhr.responseText);
                if (xhr.status == 200 || xhr.status == 304) {
					if (!config.hideloading) {
						vant.Toast.clear()
					};
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    vant.Toast.clear();
                    if (!config.hideloading) {
                        vant.Toast.fail({
                            icon: 'cross',
                            message: '操作失败！',
                        });
                    }
                    reject();
                }
            }
        };

        // const paramsString = new URLSearchParams(packet.param).toString();

        // xhr.send(paramsString);
        xhr.send(null);
    });
};

opt.getUrlParam = function (name) {
    var reg = new RegExp('(^|&|)' + name + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return encodeURIComponent(r[2]);
    return '';
};

//字体自适应
opt.windowChange = (minsize = 24, maxsize = 32) => {
    let w = document.documentElement.clientWidth || document.body.clientWidth;
    console.log(w);
    let htmlDom = document.getElementsByTagName('html')[0];
    if (w < 540) {
        htmlDom.style.fontSize = w / minsize + 'px';
    } else {
        htmlDom.style.fontSize = maxsize + 'px';
    }
};
