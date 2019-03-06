
var View;
;(function () {
    "use strict"
    //公共组件
    View = function(A) {
        this.isfocus = false;//区域焦点
        this.parentNode = A;//区域Dom
        this.a = [];//子元素
        this.map = [];//映射位置关系之后的子元素
        this.scrollX = false;//横向是否滚动
        this.scrollY = false;//纵向向是否滚动
        this.passageType = false;//是否为文章类型
        this.saveCurrent = false;//保存当前current
        this.saveCurrentDelay = false;//保存当前current，点击ok后保存
        this.scrollAnimate = true;//是否启动滚动动画（智能设备）
    }

    //初始化
    View.prototype.init = function (a) {
        if(a){
            this.a = Array.prototype.slice.apply(a);
            this.map = sort(a);
            this.focusId = getFirst(this.map);
        }else{
            this.passageType = true;
        }
        this.scrollX = this.parentNode.scrollWidth > this.parentNode.offsetWidth;
        this.scrollY = this.parentNode.scrollHeight > this.parentNode.offsetHeight;
    }

    //insertAfter
    View.prototype.insertAfter = function (a) {
        this.a = this.a.concat(Array.prototype.slice.apply(a));
        this.map = sort(this.a);
        this.scrollX = this.parentNode.scrollWidth > this.parentNode.offsetWidth;
        this.scrollY = this.parentNode.scrollHeight > this.parentNode.offsetHeight;
        this.onfocus();
    }

    //insertBefore
    View.prototype.insertBefore = function (a) {
        this.a = Array.prototype.slice.apply(a).concat(this.a);
        this.map = sort(this.a);
        //this.focusId = getfocusId(this.focusItem(),this.a);
        this.focusId += a.length;
        this.scrollX = this.parentNode.scrollWidth > this.parentNode.offsetWidth;
        this.scrollY = this.parentNode.scrollHeight > this.parentNode.offsetHeight;
        this.onfocus();
    }

    //焦点dom
    View.prototype.focusItem = function(){
        return this.a[this.focusId];
    }

    //区域聚焦
    View.prototype.onfocus = function () {
        this.isfocus = true;
        addClass(this.parentNode, 'focus');
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
            if(this.saveCurrentDelay){
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
            }else{
                window.close();
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
            if(this[action]&&action!=='ok'){
                this.onblur();
                this[action](this.focusItem());
            }else{
                if(!this.passageType){
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
                            this.parentNode.scrollBy({left:-100,behavior: 'smooth' });
                        }else{
                            this.parentNode.scrollLeft-=100;
                        } 
                    }
                    if(action=='right'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({left:100,behavior: 'smooth' });
                        }else{
                            this.parentNode.scrollLeft+=100;
                        }
                    } 
                }
                if (this.scrollY) {
                    //滚动
                    if(action=='up'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({top:-100,behavior: 'smooth' });
                        }else{
                            this.parentNode.scrollTop-=100;
                        }
                    }
                    if(action=='down'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({top:100,behavior: 'smooth' });
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
                            this.parentNode.scroll({left:0,behavior: 'smooth' });
                        }else{
                            this.parentNode.scrollLeft=0;
                        } 
                    }
                    if(action=='right'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({left:this.parentNode.scrollWidth,behavior: 'smooth' });
                        }else{
                            this.parentNode.scrollLeft=this.parentNode.scrollWidth;
                        }
                    } 
                }
                if (this.scrollY) {
                    //滚动
                    if(action=='up'){
                        if(this.scrollAnimate){
                            this.parentNode.scroll({top:0,behavior: 'smooth' });
                        }else{
                            this.parentNode.scrollTop=0;
                        }
                    }
                    if(action=='down'){
                        if(this.scrollAnimate){
                            this.parentNode.scrollBy({top:this.parentNode.scrollHeight,behavior: 'smooth' });
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
        // var next  = this.map[this.focusId][action];
        // if (!next && !this.passageType) {
        //     this[action+'after'] && this[action+'after'](this.focusItem());
        // }
    }


    //区域内聚焦
    View.prototype.focus = function(){

        if(this.passageType){
            return false;
        }

        if (this.scrollX||this.scrollY) {
            //滚动
            if(this.scrollAnimate){
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

                if(Y&&!X){
                    this.parentNode.scroll({top:offsetTop-100,behavior: 'smooth'});
                }
                if(X&&!Y){
                    this.parentNode.scroll({left:offsetLeft-100,behavior: 'smooth'});
                }

                if(X&&Y){
                    this.parentNode.scroll({left:offsetLeft-100,top:offsetTop-100,behavior: 'smooth'});
                }
                
            }else{
                this.focusItem().scrollIntoView(false);
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

    //邻近算法
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
            var Right = obj.filter(function (el) { return (el.cellX >= X+W*.5) && (el.cellY>=Y&&el.cellY<=Y+H || el.cellY<=Y&&el.cellY+el.height>=Y) }).sort(function (a, b) { return (a.cellX - b.cellX) || ( a.cellY + a.height*.5 +  b.cellY + b.height*.5 - 2*Y - H)*(a.cellY + a.height*.5 -  b.cellY - b.height*.5) || (a.cellY - b.cellY) })[0];
            var Bottom = obj.filter(function (el) { return (el.cellY >= Y+H*.5) && (el.cellX>=X&&el.cellX<=X+W || el.cellX<=X&&el.cellX+el.width>=X) }).sort(function (a, b) { return (a.cellY - b.cellY) || ( a.cellX + a.width*.5 +  b.cellX + b.width*.5 - 2*X - W)*(a.cellX + a.width*.5 -  b.cellX - b.width*.5) || (a.cellX - b.cellX) })[0];
            var Left = obj.filter(function (el) { return (el.cellX + el.width <= X+W*.5) && (el.cellY>=Y&&el.cellY<=Y+H || el.cellY<=Y&&el.cellY+el.height>=Y ) }).sort(function (a, b) { return (b.cellX + b.width - a.cellX - a.width) || ( a.cellY + a.height*.5 +  b.cellY + b.height*.5 - 2*Y - H)*(a.cellY + a.height*.5 -  b.cellY - b.height*.5) || (a.cellY - b.cellY) })[0];
            var Top = obj.filter(function (el) { return (el.cellY + el.height <= Y+H*.5) && (el.cellX>=X&&el.cellX<=X+W || el.cellX<=X&&el.cellX+el.width>=X) }).sort(function (a, b) { return (b.cellY + b.height - a.cellY - a.height) || ( a.cellX + a.width*.5 +  b.cellX + b.width*.5 - 2*X - W)*(a.cellX + a.width*.5 -  b.cellX - b.width*.5) || (a.cellX - b.cellX) })[0];
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
    function getFirst(obj){
        var index = 0;
        obj.forEach(function(el,i){   
            if(!el.left&&!el.up&&(el.right||el.down)){
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

})();