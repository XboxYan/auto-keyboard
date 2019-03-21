function $(id) {
    return document.getElementById(id);
}

function isUtility(){
    try {
        return !!Utility;
    } catch (e) {
        return false;
    }
}

//ajax封装
function ajax(obj) {
    if (!obj.url)
        return;
    var xmlhttp = new XMLHttpRequest() || new ActiveXObject('Microsoft.XMLHTTP');    //这里扩展兼容性
    var type = (obj.type || 'POST').toUpperCase();
    xmlhttp.onreadystatechange = function () {    //这里扩展ajax回调事件
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && !!obj.success)
            obj.success(xmlhttp.responseText);
        if (xmlhttp.readyState == 4 && xmlhttp.status != 200 && !!obj.error) {
            obj.error();
        }
    };
    if (type == 'POST') {
        xmlhttp.open(type, obj.url, obj.async || true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send(_params(obj.data || null));
        // xmlhttp.setRequestHeader('Content-type', 'text/xml');
        // xmlhttp.send(obj.data);
    }
    else if (type == 'GET') {
        xmlhttp.open(type, obj.url + (obj.data ? ('?' + _params(obj.data || null)) : ''), obj.async || true);
        xmlhttp.send(null);
    }
}
//_params函数解析发送的data数据，对其进行URL编码并返回
function _params(data, key) {
    var params = '';
    key = key || '';
    var type = { 'string': true, 'number': true, 'boolean': true };
    if (type[typeof (data)])
        params = data;
    else
        for (var i in data) {
            if (type[typeof (data[i])])
                params += "&" + key + (!key ? i : ('[' + i + ']')) + "=" + data[i];
            else
                params += _params(data[i], key + (!key ? i : ('[' + i + ']')));
        }
    return !key ? encodeURI(params).replace(/%5B/g, '[').replace(/%5D/g, ']') : params;
}


function setGlobalVar(_sName, _sValue) {
    if (window.localStorage) {
        localStorage[_sName] = _sValue;
    }else{
        document.cookie = escape(_sName) + "=" + escape(_sValue);
    }
}

function getGlobalVar(_sName) {
    var result = "";
    if (window.localStorage) {
        result = localStorage.getItem(_sName);
    }else{
        var aCookie = document.cookie.split("; ");
        for (var i = 0; i < aCookie.length; i++) {
            var aCrumb = aCookie[i].split("=");
            if (escape(_sName) == aCrumb[0]) {
                result = unescape(aCrumb[1]);
                break;
            }
        }
    }
    return result;
}
