
var View = (function () {
    "use strict"
    //公共组件
    function View(A) {
        this.isfocus = false;//区域焦点
        this.parentNode = A;//区域Dom
        this.a = [];//子元素
        this.map = [];//映射位置关系之后的子元素
        this.scrollX = false;//横向是否滚动
        this.scrollY = false;//纵向向是否滚动
        this.passageType = true;//是否为文章类型
        this.saveCurrent = false;//保存当前current
        this.saveCurrentDelay = false;//保存当前current，点击ok后保存
        this.scrollAnimate = true;//是否强制开启启动滚动动画(如果不支持会启用插件滚动)
    }

    //初始化
    View.prototype.init = function (a) {
        if(a.length>0){
            this.passageType = false;
            this.a = Array.prototype.slice.apply(a);
            this.map = sort(a);
            this.focusId = getFirst(this.map,this.a);
        }else{
            this.passageType = true;
        }
        this.scrollX = this.parentNode.scrollWidth > this.parentNode.offsetWidth;
        this.scrollY = this.parentNode.scrollHeight > this.parentNode.offsetHeight;
        var This = this;
        this.parentNode.onclick = function(ev){
            var pre = this.focusId;
            var index = This.a.findIndex(function(el){
                return el.contains(ev.target);
            })
            if(index>=0){
                This.focusByIndex(index);
                This.onkey('ok');
                This.onkeyUp('ok');
                This.move && This.move(This.a[pre],This.a[index]);
            }else{
                This.onfocus();
            }
        }
    }

    //insertAfter
    View.prototype.insertAfter = function (a) {
        this.a = this.a.concat(Array.prototype.slice.apply(a));
        this.map = sort(this.a);
        this.scrollX = this.parentNode.scrollWidth > this.parentNode.offsetWidth;
        this.scrollY = this.parentNode.scrollHeight > this.parentNode.offsetHeight;
        //this.onfocus();
    }

    //insertBefore
    View.prototype.insertBefore = function (a) {
        this.a = Array.prototype.slice.apply(a).concat(this.a);
        this.map = sort(this.a);
        //this.focusId = getfocusId(this.focusItem(),this.a);
        this.focusId += a.length;
        this.scrollX = this.parentNode.scrollWidth > this.parentNode.offsetWidth;
        this.scrollY = this.parentNode.scrollHeight > this.parentNode.offsetHeight;
        //this.onfocus();
    }

    //焦点dom
    View.prototype.focusItem = function(){
        return this.a[this.focusId];
    }

    //区域聚焦
    View.prototype.onfocus = function () {
        if(window.focusView){
            window.focusView.onblur();
        }
        window.focusView = this;
        this.isfocus = true;
        addClass(this.parentNode, 'focus');
        if(this.saveCurrentDelay && this.currentItem){
            this.focusById(this.currentItem.id);
        }
        this.focus();
        var This = this;
        //重置键盘事件
        document.onkeydown = function(e){
            if(This.isfocus){
                var action = keyCode(e);
                This.onkey(action);
            }
        }
        document.onkeyup = function(e){
            if(This.isfocus){
                var action = keyCode(e);
                This.onkeyUp(action);
            }
        }
    }

    //区域失焦
    View.prototype.onblur = function () {
        this.isfocus = false;
        removeClass(this.parentNode, 'focus');
        this.blur(true);
    }

    //区域内移动
    View.prototype.onkey = function (action) {
        if(action==='ok' && !this.passageType){
            if(this.currentItem === this.focusItem()){
                this.isCurrent = true;
            }else{
                this.isCurrent = false;
                if(this.currentItem){
                    removeClass(this.currentItem,'current');
                }
                this.currentItem = this.focusItem();
                addClass(this.focusItem(),'current');
            }
            addClass(this.focusItem(),'pressIn');
            
            return;
        }

        if(action==='back'){
            if(this.back){
                this.back(this.focusItem());
            }
            return;
        }

        
        var next = true;
        if(this.passageType){
            next = false;
        }else{
            next = this.map[this.focusId][action];
        }
        if (next) {
            //区域内移动焦点
            this.blur();
            var _ = this.focusItem();
            this.focusId = next.index;
            this.focus();
            //监控移动操作
            this.move && this.move(_,this.focusItem());
        } else {
            
            //区域边界
            if(this[action] && action!=='ok'){
                //this.onblur();
                this[action](this.focusItem());
            }else{
                if(!this.passageType && action=='left' || action=='up' || action=='right' || action=='down'){
                    var THIS = this;
                    addClass(this.focusItem(),'shake');
                    this.shaketimer&&clearTimeout(this.shaketimer);
                    this.shaketimer = setTimeout(function(){
                        removeClass(THIS.focusItem(),'shake');
                    },300);
                }
            }
            
            if(this.passageType){
                //边界滚动
                if (this.scrollX) {
                    //滚动
                    if(action=='left'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({left: -100, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollLeft-=100;
                        }
                    }
                    if(action=='right'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({left: 100, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollLeft+=100;
                        }
                    } 
                }
                if (this.scrollY) {
                    //滚动
                    if(action=='up'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({top: -100, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollTop-=100;
                        }
                    }
                    if(action=='down'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({top: 100, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollTop+=100;
                        }
                    }
                } 
            }else{
                if (this.scrollX) {
                    //滚动
                    if(action=='left'){
                        if(this.scrollAnimate){
                            this.parentNode.scroll({left: 0, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollLeft=0;
                        }
                    }
                    if(action=='right'){
                        if(this.scrollAnimate){
                            this.parentNode.scroll({left: this.parentNode.scrollWidth, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollLeft=this.parentNode.scrollWidth;
                        }
                    } 
                }
                if (this.scrollY) {
                    //滚动
                    if(action=='up'){
                        if(this.scrollAnimate){
                            this.parentNode.scroll({top: 0, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollTop=0;
                        }
                    }
                    if(action=='down'){
                        if(this.scrollAnimate){
                            this.parentNode.scroll({top: this.parentNode.scrollHeight, behavior: 'smooth'})
                        }else{
                            this.parentNode.scrollTop=this.parentNode.scrollHeight;
                        }
                    }
                }        
            }                    
        }
    }

    //抬起
    View.prototype.onkeyUp = function (action) {
        if(action==='ok'){
            if(this.passageType){
                this.ok && this.ok(this.parentNode);
            }else{
                removeClass(this.focusItem(),'pressIn');
                this.ok && this.ok(this.focusItem());
            }
            return;
        }
    }


    //区域内聚焦
    View.prototype.focus = function(){
        if(!this.isfocus){
            this.onfocus();
        }
        if(this.passageType){
            return false;
        }

        if (this.scrollX||this.scrollY) {
            //滚动
            var node = this.focusItem();
            var offsetTop = node.offsetTop;
            var offsetHeight = node.offsetHeight;
            var scrollTop = this.parentNode.scrollTop;
            var scrollHeight = this.parentNode.offsetHeight;
            var offsetLeft = node.offsetLeft;
            var offsetWidth = node.offsetWidth;
            var scrollLeft = this.parentNode.scrollLeft;
            var scrollWidth = this.parentNode.offsetWidth;
            var X = offsetLeft+50<=scrollLeft||offsetLeft+offsetWidth+50>=scrollLeft+scrollWidth;
            var Y = offsetTop-50<=scrollTop||offsetTop+offsetHeight+50>=scrollTop+scrollHeight;

            if(Y&&!X||this.scrollY){
                if(this.scrollAnimate){
                    this.parentNode.scroll({top: offsetTop-(scrollHeight-offsetHeight)*.5, behavior: 'smooth'})
                }else{
                    this.parentNode.scrollTop = offsetTop-(scrollHeight-offsetHeight)*.5;
                }
            }else if(X&&!Y||this.scrollX){
                if(this.scrollAnimate){
                    this.parentNode.scroll({left: offsetLeft-(scrollWidth-offsetWidth)*.5, behavior: 'smooth'})
                }else{
                    this.parentNode.scrollLeft = offsetLeft-(scrollWidth-offsetWidth)*.5;
                }
            }else{
                if(this.scrollAnimate){
                    this.parentNode.scroll({top: offsetTop-(scrollHeight-offsetHeight)*.5,left: offsetLeft-(scrollWidth-offsetWidth)*.5, behavior: 'smooth'})
                }else{
                    this.parentNode.scrollLeft = offsetLeft-(scrollWidth-offsetWidth)*.5;
                    this.parentNode.scrollTop = offsetTop-(scrollHeight-offsetHeight)*.5;
                }
            }
        }
        addClass(this.focusItem(), 'focus');
        
        if(this.saveCurrent){
            addClass(this.focusItem(), 'current');
        }
    }

    //区域内失焦
    View.prototype.blur = function(bool){
        if(this.passageType){
            removeClass(this.parentNode, 'focus');
            return false;
        }
        removeClass(this.focusItem(), 'focus');
        if(this.saveCurrent&&!bool){
            removeClass(this.focusItem(), 'current');
        }
    }

    //focusById
    View.prototype.focusById = function(id){
        var index = this.focusId;
        this.blur();
        this.a.forEach(function(el,i){
            if(el.id == id){
                index = i;
            }
        })
        this.focusId = index;
        this.focus();
        return index;
    }

    //focusByIndex
    View.prototype.focusByIndex = function(index){
        this.blur();
        this.focusId = index;
        this.focus();
    }
    //findByDir
    View.prototype.findByDir = function(dir){
        var index = this.focusId;
        var This = this;
        for( var i=0;i<dir.length;i++ ){
            var cur = this.map[index][dir[i]];
            if(cur){
                index = cur.index;
            }else{
                index = null;
                break;
            }
        }
        return index;
    }
    //重排
    /*sortby
    [
		[1,1,3,null],
		[null,2,3,0],
		[1,null,3,1],
		[1,2,null,0],
	]
    */
    View.prototype.sortby = function (arr){
        var map = [];
        var doms = this.a;
        doms.push({});
        var len = doms.length-1;
        arr.forEach(function(item,i){
            var top = item[0]==null?len:item[0];
            var right = item[1]==null?len:item[1];
            var bottom = item[2]==null?len:item[2];
            var left = item[3]==null?len:item[3];
            var Left = {
                index: left,
                cellX: doms[left].offsetLeft,
                cellY: doms[left].offsetTop,
                width: doms[left].offsetWidth,
                height: doms[left].offsetHeight,
            }
            var Right = {
                index: right,
                cellX: doms[right].offsetLeft,
                cellY: doms[right].offsetTop,
                width: doms[right].offsetWidth,
                height: doms[right].offsetHeight,
            }
            var Top = {
                index: top,
                cellX: doms[top].offsetLeft,
                cellY: doms[top].offsetTop,
                width: doms[top].offsetWidth,
                height: doms[top].offsetHeight,
            }
            var Bottom = {
                index: bottom,
                cellX: doms[bottom].offsetLeft,
                cellY: doms[bottom].offsetTop,
                width: doms[bottom].offsetWidth,
                height: doms[bottom].offsetHeight,
            }
            map.push({
                left: Left.index==len?undefined:Left,
                right: Right.index==len?undefined:Right,
                up: Top.index==len?undefined:Top,
                down: Bottom.index==len?undefined:Bottom,
            });
        })
        this.map = map;
    }

    return View;

    //位置算法
    function sort(doms) {
        var obj = [];
        var map = [];
        var len = doms.length;
        for (var i = 0; i < len; i++) {
            var el = doms[i];
            if(el.getAttribute("disabled")){
                //跳过disabled
                obj.push({});
            }else{
                obj.push({
                    index: i,
                    cellX: el.offsetLeft,
                    cellY: el.offsetTop,
                    width: el.offsetWidth,
                    height: el.offsetHeight,
                });
            }
        }

        for (var j = 0; j < len; j++) {
            var item = obj[j];
            var X = item.cellX;
            var Y = item.cellY;
            var W = item.width;
            var H = item.height;
            //(Math.pow(a.cellX+a.width/2-a.cellX-b.width/2,2)+Math.pow(a.cellY+a.height/2-a.cellY-b.height/2,2))
            var Right = obj.filter(function (el) { return (el.cellX >= X+W*0.5) && (el.cellY>=Y&&el.cellY<=Y+H || el.cellY<=Y&&el.cellY+el.height>=Y) }).sort(function (a, b) { return (a.cellX - b.cellX) || ( a.cellY + a.height*0.5 +  b.cellY + b.height*0.5 - 2*Y - H)*(a.cellY + a.height*0.5 -  b.cellY - b.height*0.5) || (a.cellY - b.cellY) })[0];
            var Bottom = obj.filter(function (el) { return (el.cellY >= Y+H*0.5) && (el.cellX>=X&&el.cellX<=X+W || el.cellX<=X&&el.cellX+el.width>=X) }).sort(function (a, b) { return (a.cellY - b.cellY) || ( a.cellX + a.width*0.5 +  b.cellX + b.width*0.5 - 2*X - W)*(a.cellX + a.width*0.5 -  b.cellX - b.width*0.5) || (a.cellX - b.cellX) })[0];
            var Left = obj.filter(function (el) { return (el.cellX + el.width <= X+W*0.5) && (el.cellY>=Y&&el.cellY<=Y+H || el.cellY<=Y&&el.cellY+el.height>=Y ) }).sort(function (a, b) { return (b.cellX + b.width - a.cellX - a.width) || ( a.cellY + a.height*0.5 +  b.cellY + b.height*0.5 - 2*Y - H)*(a.cellY + a.height*0.5 -  b.cellY - b.height*0.5) || (a.cellY - b.cellY) })[0];
            var Top = obj.filter(function (el) { return (el.cellY + el.height <= Y+H*0.5) && (el.cellX>=X&&el.cellX<=X+W || el.cellX<=X&&el.cellX+el.width>=X) }).sort(function (a, b) { return (b.cellY + b.height - a.cellY - a.height) || ( a.cellX + a.width*0.5 +  b.cellX + b.width*0.5 - 2*X - W)*(a.cellX + a.width*0.5 -  b.cellX - b.width*0.5) || (a.cellX - b.cellX) })[0];
            map.push({
                left: Left,
                right: Right,
                up: Top,
                down: Bottom,
            });
            
        }
        return map;
    }

    //取第一个焦点
    function getFirst(obj,a){
        var index = 0;
        var de = false;
        a.forEach(function(els,j){
            if(!!els.getAttribute('autofocus')){
                index = j;
                de = true;
            }
        })
        if(de){
            return index;
        }
        obj.forEach(function(el,i){
            if(el.autofocus||!el.left&&!el.up&&(el.right||el.down)){
                index = i;
            }
        })
        return index;
    }

    //查找上次焦点
    function getfocusId(item,obj){
        var index = 0;
        obj.forEach(function(el,i){   
            el === item;
            index = i;
        })
        return index;
    }

    //键盘映射
    function keyCode(event){
        //console.log(window.event )
        var e = event.keyCode || event.which;
        var action = '';
        switch (e) {
            case 37:
                preventDefault(event);
                action = 'left';
                break;
            case 38:
                preventDefault(event);
                action = 'up';
                break;
            case 39:
                preventDefault(event);
                action = 'right';
                break;
            case 40:
                preventDefault(event);
                action = 'down';
                break;
            case 13:
                preventDefault(event);
                action = 'ok';
                break;
            case 8:
                preventDefault(event);
                action = 'back';
                break;
            default:
                break;
        }
        return action;
    }

    //阻止默认事件
    function preventDefault(event){
        if (event&&event.preventDefault){  
            event.preventDefault();  
        } 
    }


    //class
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

    //findIndex
    if (typeof Array.prototype.findIndex !== "function") {
        Array.prototype.findIndex = function(predicate, thisArg) {
            if (this === null) {
                throw new TypeError('Cannot read property \'findIndex\' of null');
            }

            if (typeof predicate !== "function") {
                throw new TypeError(typeof predicate + ' is not a function');
            }

            var arrLength = this.length;
            var index = -1;

            for (var i = 0; i < arrLength; i++) {
                if (predicate.call(thisArg, this[i], i, this)) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    }

})();


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