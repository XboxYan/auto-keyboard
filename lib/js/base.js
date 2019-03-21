function $(id) {
    return document.getElementById(id);
}

function hasClass(obj, className) {
    return obj.className.indexOf(className) > -1 ? true : false;
}

function addClass(obj, className) {
    if (hasClass(obj, className) || !obj) return;
    if (obj.classList) {
        obj.classList.add(className);
    } else {
        obj.className += ' ' + className;
    }
}

function removeClass(obj, className) {
    if (hasClass(obj, className)) {
        var newClass = obj.className.replace(className, "");
        obj.className = newClass.replace(/(^\s*)/g, "");
    }
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



//forEach
if (typeof Array.prototype.forEach != "function") {
    Array.prototype.forEach = function (fn, context) {
        for (var k = 0, length = this.length; k < length; k++) {
            if (typeof fn === "function" && Object.prototype.hasOwnProperty.call(this, k)) {
                fn.call(context, this[k], k, this);
            }
        }
    };
}

//filter
if (typeof Array.prototype.filter != "function") {
    Array.prototype.filter = function (fn, context) {
        var arr = [];
        if (typeof fn === "function") {
            for (var k = 0, length = this.length; k < length; k++) {
                fn.call(context, this[k], k, this) && arr.push(this[k]);
            }
        }
        return arr;
    };
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

//左
function moveLeft(){
    document.onkeydown({keyCode:37});
}
//上
function moveUp(){
    document.onkeydown({keyCode:38});
}
//右
function moveRight(){
    document.onkeydown({keyCode:39});
}
//下
function moveDown(){
    document.onkeydown({keyCode:40});
}
//ok
function doConfirm(){
    document.onkeydown({keyCode:13});
}
//返回
function keyBack(){
    document.onkeydown({keyCode:8});
}
