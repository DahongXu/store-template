// /**!
//  * Sortable 1.14.0
//  * @author RubaXa <trash@rubaxa.org>
//  * @license MIT
//  */


// (function (factory) {

//     "use strict"; //严格模式

//     if (typeof define === "function" && define.amd) { //兼容 require.js 写法
//         define(factory);
//     }
//     else if (typeof module != "undefined" && typeof module.exports != "undefined") { //兼容node写法
//         module.exports = factory();
//     }
//     else if (typeof Package !== "undefined") {
//         Sortable = factory(); // export for Meteor.js 兼容 Meteor.js 写法
//     }
//     else {
//         /* jshint sub:true */
//         window["Sortable"] = factory(); //把它挂载在window下


//     }
// })(function () {
//     "use strict";

//     if (typeof window == "undefined" || typeof window.document == "undefined") { //判断该js是否在window或者document 下运行
//         return function () {
//             throw new Error("Sortable.js requires a window with a document"); //如果不是则抛出一个错误
//         };
//     }
//     var i = 0;
//     var dragEl, //当前拖拽节点,开始拖拽节点，鼠标按下去的节点
//         parentEl,
//         ghostEl, // 拖拽镜像节点
//         cloneEl, //克隆节点
//         rootEl, //鼠标开始按下去拖拽的根节点
//         nextEl, //下一个节点

//         scrollEl,//滚动节点
//         scrollParentEl, //滚动的父节点

//         lastEl, //根节点中的最后一个自己点
//         lastCSS,
//         lastParentCSS,

//         oldIndex, //开始拖拽节点的索引 就是鼠标按下去拖拽节点的索引
//         newIndex, //拖拽完之后现在节点


//         activeGroup,
//         autoScroll = {}, //滚动对象用于存鼠标的xy轴
//         /*
//         tapEvt 触摸对象包括x与y轴与拖拽当前节点
//         tapEvt = {
//           target: dragEl,
//           clientX: touch.clientX,
//           clientY: touch.clientY
//          };
//           */
//         tapEvt,
//         touchEvt,

//         moved,

//         /** @const */
//         RSPACE = /\s+/g, //全局匹配空格

//         expando = 'Sortable' + (new Date).getTime(), //字符串Sortable+时间戳

//         win = window, //缩写win
//         document = win.document,
//         parseInt = win.parseInt;
//     //draggable html5 拖拽属性 初始化的时候是true


//     var supportDraggable = !!('draggable' in document.createElement('div')),
//         //判断浏览器是否支持css3 这个属性pointer-events
//         supportCssPointerEvents = (function (el) {
//             el = document.createElement('x');
//             el.style.cssText = 'pointer-events:auto';
//             return el.style.pointerEvents === 'auto';
//         })(),

//         _silent = false, //默认

//         abs = Math.abs,
//         slice = [].slice,

//         touchDragOverListeners = [], //新建一个数组 鼠标触摸拖拽数组
//         //_autoScroll 相当于 被一个函数付值

//         /* _autoScroll = function(callback,ms){
//          var args,
//          _this;
//          if (args === void 0) {
//          args = arguments;
//          _this = this;
         
//          setTimeout(function () {
//           if (args.length === 1) {
//           callback.call(_this, args[0]);
//           } else {
//           callback.apply(_this, args);
//           }
         
//           args = void 0;
//          }, ms);
//          }
//          其实就是_autoScroll=function(参数){
//          放到 _throttle 的回调函数中 function (/参数/) 
//          }
//          }*/




//         /***********************************************************************************************
//         *函数名 ：_autoScroll
//         *函数功能描述 ： 拖拽智能滚动
//         *函数参数 ： 
//          evt：
//          类型：boj, 事件对象
//          options：类型：obj， 参数类
//          rootEl：类型：obj dom节点，拖拽的目标节点 
//         *函数返回值 ： viod
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _autoScroll = _throttle(
//             //回调函数
//             function (/**Event*/evt, /**Object*/options, /**HTMLElement*/rootEl) {
//                 //每次拖拽只会调用一次该函数


//                 //evt 是事件对象 event
//                 //options.scroll如果为真 并且rootEl 为真的时候
//                 // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
//                 if (rootEl && options.scroll) {
//                     var el,
//                         rect,
//                         sens = options.scrollSensitivity, //滚动灵敏度 默认是30
//                         speed = options.scrollSpeed, //滚动速度 默认是10
//                         x = evt.clientX, //获取鼠标在可视窗口的x值
//                         y = evt.clientY, //获取鼠标在可视窗口的y值

//                         winWidth = window.innerWidth, //获取可视窗口的高度和宽度 有兼容性问题 不包括滚动条
//                         winHeight = window.innerHeight,

//                         vx,
//                         vy
//                         ;

//                     // Delect scrollEl 观察滚动节点 如果滚动的父节点scrollParentEl不等于当前的根节点的时候则 可以滚动
//                     if (scrollParentEl !== rootEl) {
//                         scrollEl = options.scroll; //true 布尔值
//                         scrollParentEl = rootEl; //鼠标开始按下的根节点

//                         if (scrollEl === true) {
//                             scrollEl = rootEl;
//                             do {
//                                 //判断父节点，哪个父节点出现滚动条，如果有滚动条则设置改拖拽的节点滚动条父节点
//                                 if ((scrollEl.offsetWidth < scrollEl.scrollWidth) ||
//                                     (scrollEl.offsetHeight < scrollEl.scrollHeight)
//                                 ) {
//                                     break;
//                                 }
//                                 /* jshint boss:true */
//                             } while (scrollEl = scrollEl.parentNode);
//                         }
//                     }


//                     if (scrollEl) {
//                         el = scrollEl;
//                         rect = scrollEl.getBoundingClientRect();
//                         /* 
//                         var box=document.getElementById('box'); // 获取元素
//                         alert(box.getBoundingClientRect().top); // 元素上边距离页面上边的距离
//                         alert(box.getBoundingClientRect().right); // 元素右边距离页面左边的距离
//                         alert(box.getBoundingClientRect().bottom); // 元素下边距离页面上边的距离
//                         alert(box.getBoundingClientRect().left); // 元素左边距离页面左边的距离
//                         y：y = evt.clientY, //获取鼠标在可视窗口的y值
//                         sens： sens = options.scrollSensitivity, //滚动灵敏度 默认是30
                         
//                         */

//                         //vx 与 vy 只是个布尔值判断 然后就得出一个值
//                         /*
//                         true-true=0
//                         true-false=1
//                         false-false=0
//                         false-true=-1
//                         */
//                         vx = (abs(rect.right - x) <= sens) - (abs(rect.left - x) <= sens);
//                         vy = (abs(rect.bottom - y) <= sens) - (abs(rect.top - y) <= sens); //这样判断并不是很好因为只会在边界判断事件发生，如果一开始拖拽快速超过了设置的+-sens值滚动事件将没有发生。个人感觉改成一下判断会比较好。
//                         /*
//                         if(rect.top+sens-y>=0){
//                         vy=-1;
//                         } else if(rect.bottom+sens-y<=0){
//                         vy=1;
//                         }else{
//                         vy=0;
//                         }
//                         */
//                     }


//                     if (!(vx || vy)) { //当他等于0的时候 拖拽滚动的是window

//                         vx = (winWidth - x <= sens) - (x <= sens);
//                         vy = (winHeight - y <= sens) - (y <= sens);

//                         /* jshint expr:true */
//                         (vx || vy) && (el = win);
//                     }


//                     if (autoScroll.vx !== vx || autoScroll.vy !== vy || autoScroll.el !== el) {
//                         autoScroll.el = el;
//                         autoScroll.vx = vx;
//                         autoScroll.vy = vy;
//                         //speed=10 滚动速度
//                         clearInterval(autoScroll.pid);

//                         if (el) {
//                             autoScroll.pid = setInterval(function () {
//                                 if (el === win) {
//                                     win.scrollTo(win.pageXOffset + vx * speed, win.pageYOffset + vy * speed);
//                                 } else {
//                                     vy && (el.scrollTop += vy * speed); //设置元素滚动条的位置,每次滚动1*speed如果是0 则不会滚动
//                                     vx && (el.scrollLeft += vx * speed);//设置元素滚动条的位置
//                                 }
//                             },
//                                 24);
//                         }
//                     }
//                 }
//                 //时间 毫秒
//             }, 30),
//         /***********************************************************************************************
//         *函数名 ：_prepareGroup
//         *函数功能描述 ： //options.group 属性变成对象 。如果group不是对象则变成对象，并且group对象的name就等于改group的值 并且添加多['pull', 'put'] 属性默认值是true
//         如果设置group{
//         pull:true, 则可以拖拽到其他列表 否则反之
//         put:true, 则可以从其他列表中放数据到改列表，false则反之
//         }
//         pull: 'clone', 还有一个作用是克隆，就是当这个列表拖拽到其他列表的时候不会删除改列表的节点。
//         *函数参数 ： 
//          options：
//          类型：boj, options 拖拽参数
          
//         *函数返回值 ： viod
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/


//         _prepareGroup = function (options) {

//             var group = options.group; //把options.group 付值给group
//             // 先判断他group 是否是对象，如果不是则变成对象，name是他的属性
//             if (!group || typeof group != 'object') { //如果当前options.group; 不存在或者不是obj则把他变成一个对象
//                 group = options.group = { name: group };
//             }
//             //判断有没有设置 'pull', 'put' 如果没有 则添加 'pull', 'put' 属性并且设置为真
//             ['pull', 'put'].forEach(function (key) {
//                 if (!(key in group)) { //
//                     group[key] = true; //将为group对象添加两个属性'pull', 'put' 并且为true
//                 }
//             });
//             //options.group 变成对象之后join方法将匹配不到任何东西
//             //如果他直接是数组的话这里就是把数组的值拆分成字符串连接起来
//             //options.group 属性变成对象 。
//             options.groups = ' ' + group.name + (group.put.join ? ' ' + group.put.join(' ') : '') + ' ';
//         }
//         ;


//     /**
//     * @class Sortable
//     * @param {HTMLElement} el
//     * @param {Object} [options]
//     */
//     //el html dom节点
//     //param obj 数据对象

//     /***********************************************************************************************
//     *函数名 ：Sortable
//     *函数功能描述 ： 主类，里面包含很多方法
//     *函数参数 ： dom节点rootEl 
//     *函数返回值 ：
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function Sortable(el, options) {
//         //判断 param 如果不是HTMLDOM 则抛出错误
//         if (!(el && el.nodeType && el.nodeType === 1)) {
//             throw 'Sortable: `el` must be HTMLElement, and not ' + {}.toString.call(el);
//         }
//         //把dom节点存到this中 好操作 就是id 父层节点
//         this.el = el; // root element
//         this.options = options = _extend({}, options); //把options初始化的数据存到this中 好操作


//         // Export instance
//         //把 Sortable 类放在HTMLDOM节点的expando属性中
//         el[expando] = this;


//         // Default options
//         //初始化 defaults 数据
//         var defaults = {
//             group: Math.random(), //产生一个随机数 //产生一个随机数 //改参数是对象有三个两个参数 pull: 拉, put:放 默认都是是true pull还有一个值是: 'clone', pull: 拉, put:放 设置为false 就不能拖拽了， 如果 pull 这种为'clone'则可以重一个列表中拖拽到另一个列表并且克隆dom节点， name：是两个或者多个列表拖拽之间的通信，如果name相同则他们可以互相拖拽

//             sort: true, // 类型：Boolean,分类 false时候在自己的拖拽区域不能拖拽，但是可以拖拽到其他区域，true则可以做自己区域拖拽或者其他授权地方拖拽
//             disabled: false, //类型：Boolean 是否禁用拖拽 true 则不能拖拽 默认是true
//             store: null, // 用来html5 存储的 改返回 拖拽的节点的唯一id
//             handle: null, //handle 这个参数是设置该标签，或者该class可以拖拽 但是不要设置 id的节点和子节点相同的tag不然会有bug
//             scroll: true, //类型：Boolean，设置拖拽的时候滚动条是否智能滚动。默认为真，则智能滚动，false则不智能滚动
//             scrollSensitivity: 30, //滚动的灵敏度,其实是拖拽离滚动边界的距离触发事件的距离边界+-30px的地方触发拖拽滚动事件，
//             scrollSpeed: 10, //滚动速度
//             draggable: /[uo]l/i.test(el.nodeName) ? 'li' : '>*',//draggable 判断拖拽节点的父层是否是ou ul
//             ghostClass: 'sortable-ghost', // 排序镜像class,就是当鼠标拉起拖拽节点的时候添加该class
//             chosenClass: 'sortable-chosen', // //为拖拽的节点添加一个class 开始拖拽鼠标按下去的时候 添加该class
//             ignore: 'a, img', //a 或者是img
//             filter: null, //改参数可以传递一个函数，或者字符串，字符串可以是class或者tag，然后用于触发oFilter函数，这样可以用来自定义事件等
//             animation: 0, //拖拽动画时间戳
//             setData: function (dataTransfer, dragEl) { //设置拖拽传递的参数
//                 dataTransfer.setData('Text', dragEl.textContent);
//             },
//             dropBubble: false, // 发生 drop事件 拖拽的时候是否阻止事件冒泡 
//             dragoverBubble: false, //发生 dragover 事件 拖拽的时候是否阻止事件冒泡 
//             dataIdAttr: 'data-id', //拖拽元素的id 数组
//             delay: 0, //延迟拖拽时间, 其实就是鼠标按下去拖拽延迟
//             forceFallback: false, // 不详
//             fallbackClass: 'sortable-fallback', // 排序回退class
//             fallbackOnBody: false,// 是否把拖拽镜像节点ghostEl放到body上
//         };


//         // Set default options
//         //当options类中的数据没有defaults类中的数据的时候 就把defaults类中的数据赋值给options类
//         for (var name in defaults) {
//             !(name in options) && (options[name] = defaults[name]);
//         }
//         //把group: 变成一个对象，本来是一个属性的
//         _prepareGroup(options);



//         // Bind all private methods
//         for (var fn in this) {
//             if (fn.charAt(0) === '_') {
//                 //如果这个 Sortable 类下的函数 开始字符串还有_下划线的就把他的this指向Sortable类
//                 this[fn] = this[fn].bind(this);
//             }
//         }

//         // Setup drag mode
//         //forceFallback 如果是false 那么给supportDraggable 函数他，然后判断浏览器是否支持draggable 拖拽如果支持是true 否则是false
//         this.nativeDraggable = options.forceFallback ? false : supportDraggable;


//         // Bind events
//         //添加事件 // 入口从这里开始

//         _on(el, 'mousedown', this._onTapStart);
//         _on(el, 'touchstart', this._onTapStart);


//         //html5 dragover 添加拖拽事件
//         if (this.nativeDraggable) {
//             //传递整个类进去
//             _on(el, 'dragover', this); //然后会执行这个函数handleEvent
//             _on(el, 'dragenter', this); //然后会执行这个函数handleEvent
//         }

//         //touchDragOverListeners 添加一个false 数据到数组里。
//         touchDragOverListeners.push(this._onDragOver);

//         // Restore sorting
//         //sort 排序函数
//         //store 是null 未找到get函数不知道怎么回事 可能它是属于store.js的api
//         options.store && this.sort(options.store.get(this));
//     }
//     /***********************************************************************************************
//      *函数名 ：Sortable.prototype 
//      *函数功能描述 ： 主类，的原型
//      *函数参数 ： 
//      *函数返回值 ：
//      *作者 ： 
//      *函数创建日期 ：
//      *函数修改日期 ：
//      *修改人 ：
//      *修改原因 ：
//      *版本 ：
//      *历史版本 ：
//      ***********************************************************************************************/

//     Sortable.prototype = /** @lends Sortable.prototype */ {
//         constructor: Sortable, //防止继承混乱，构造方法指向他的构造函数
//         /***********************************************************************************************
//          *函数名 ：_onTapStart
//          *函数功能描述 ： 鼠标按下去函数,oldIndex统计目标节点与同级同胞的上节点总和
//          *函数参数 ： viod
//          *函数返回值 ： 无
//          *作者 ： 
//          *函数创建日期 ：
//          *函数修改日期 ：
//          *修改人 ：
//          *修改原因 ：
//          *版本 ：
//          *历史版本 ：
//          ***********************************************************************************************/

//         _onTapStart: function (/** Event|TouchEvent */evt) {

//             var _this = this,
//                 el = this.el, //id dom节点
//                 options = this.options, //参数类
//                 type = evt.type, //事件类型
//                 touch = evt.touches && evt.touches[0], //触摸屏事件
//                 target = (touch || evt).target, //目标节点
//                 originalTarget = target,
//                 filter = options.filter; // null

//             //如果是鼠标按下去事件，但是如果不是左键按下去的话，或者disabled 为假的时候 结束该程序 disabled 为fasle
//             if (type === 'mousedown' && evt.button !== 0 || options.disabled) {
//                 return; // only left button or enabled
//             }
//             //draggable=/[uo]l/i.test(el.nodeName) ? 'li' : '>*',
//             // target=el
//             // target = _closest(target, options.draggable, el); //true
//             // 
//             if (!target) {
//                 return;
//             }

//             // get the index of the dragged element within its parent
//             //获取索引
//             oldIndex = _index(target, options.draggable);

//             // Check filter+
//             //filter 如果是函数 但是默认值filter 
//             if (typeof filter === 'function') {
//                 if (filter.call(this, evt, target, this)) { //并且有返回值是true 的话

//                     //触发该函数
//                     _dispatchEvent(_this, originalTarget, 'filter', target, el, oldIndex); //则触发oFilter事件
//                     evt.preventDefault(); //停止默认事件
//                     return; // cancel dnd
//                 }
//             }
//             else if (filter) {
//                 //// JavaScript数组some()方法测试数组中的某个元素是否通过由提供的功能来实现测试 ,只要有一个真则返回真
//                 /*
//                  例子
//                 if (!Array.prototype.some)
//                {
//                 Array.prototype.some = function(fun )
//                 {
//                 var len = this.length;
//                 if (typeof fun != "function")
//                 throw new TypeError();
                 
//                 var thisp = arguments[1];
//                 for (var i = 0; i < len; i++)
//                 {
//                 if (i in this &&
//                 fun.call(thisp, this[i], i, this))
//                 return true;
//                 }
                 
//                 return false;
//                 };
//                }
                 
//                function isBigEnough(element, index, array) {
//                 return (element >= 10);
//                }
                 
//                var retval = [2, 5, 8, 1, 4].some(isBigEnough);
//                document.write("Returned value is : " + retval );
                 
//                var retval = [12, 5, 8, 1, 4].some(isBigEnough);
//                document.write("<br />Returned value is : " + retval );
                  
//                 */

//                 filter = filter.split(',').some(function (criteria) { //如果filter是字符串，则会用split 拆分成数组并且遍历他只有一个class 对的上则_closest 匹配tag和class 如果设置的filter中有calss 和拖拽元素上面的clss相同，或者tag相同，则会触发oFilter函数 
//                     criteria = _closest(originalTarget, criteria.trim(), el);//_closest

//                     if (criteria) {
//                         _dispatchEvent(_this, criteria, 'filter', target, el, oldIndex); //调用自定义事件
//                         return true;
//                     }
//                 });

//                 if (filter) {
//                     evt.preventDefault();
//                     return; // cancel dnd
//                 }
//             }

//             //handle 存在
//             //originalTarget 
//             //handle 这个参数是设置该标签，或者该class可以拖拽 但是不要设置 id的节点和子节点相同的tag不然会有bug

//             if (options.handle && !_closest(originalTarget, options.handle, el)) {
//                 return;
//             }


//             // Prepare `dragstart`
//             // 到这里
//             this._prepareDragStart(evt, touch, target);
//         },



//         /***********************************************************************************************
//          *函数名 ：_onTapStart
//          *函数功能描述 ： 开始准备拖
//          *函数参数 ： evt：
//            类型:obj,事件对象
//           touch：
//            类型:obj,触摸事件对象，判断是否是触摸事件还是鼠标事件
//           target： 类型:dom-obj,目标节点
//          *函数返回值 ： 无
//          *作者 ： 
//          *函数创建日期 ：
//          *函数修改日期 ：
//          *修改人 ：
//          *修改原因 ：
//          *版本 ：
//          *历史版本 ：
//          ***********************************************************************************************/
//         _prepareDragStart: function (/** Event */evt, /** Touch */touch, /** HTMLElement */target) {
//             //evt pc 的事件对象
//             //touch 移动的的事件对象
//             //target 目标节点
//             var _this = this,
//                 el = _this.el, //id节点，就是父层节点
//                 options = _this.options, //参数类
//                 ownerDocument = el.ownerDocument, //整个文档
//                 dragStartFn; //声明开始拖拽函数
//             //target 目标节点存在 dragEl 当前拖拽的节点 并且目标节点的父节点是id的节点的时候
//             if (target && !dragEl && (target.parentNode === el)) {
//                 tapEvt = evt; //事件对象
//                 rootEl = el; //拖拽的根节点 就是传进来的id那个节点

//                 dragEl = target; //目标节点 当前的拖拽节点 鼠标按下去拖拽的节点
//                 parentEl = dragEl.parentNode; //目标节点 当前的拖拽节点 的父节点 就是 dragEl.parentNode ==rootEl
//                 nextEl = dragEl.nextSibling; //目标节点 的下一个节点
//                 activeGroup = options.group; //Object {name: "words", pull: true, put: true}

//                 //开始拖拽函数
//                 dragStartFn = function () {
//                     // Delayed drag has been triggered 延迟拖动已被触发
//                     // we can re-enable the events: touchmove/mousemove 我们可以重新启用touchmove / MouseMove事件：
//                     //解绑事件，关闭_dragStartTimer 定时器 取消dragStartFn 函数执行
//                     _this._disableDelayedDrag();

//                     // Make the element draggable 使元件拖动
//                     //把当前的拖拽节点的draggable 属性设置为真，让他支持html5拖拽事件
//                     dragEl.draggable = true;

//                     // Chosen item dragEl 目标节点 类 _this.options.chosenClass='sortable-chosen'
//                     //为拖拽的节点添加一个class
//                     _toggleClass(dragEl, _this.options.chosenClass, true);

//                     // Bind the events: dragstart/dragend 绑定事件拖曳开始dragend
//                     _this._triggerDragStart(touch);
//                 };

//                 // Disable "draggable" ignore="a, img"
//                 options.ignore.split(',').forEach(function (criteria) {
//                     // criteria 遍历数组的当前target

//                     //criteria.trim() 去除空格
//                     /*
//                     el.draggable //html5拖拽属性
//                     function _disableDraggable(el) {
//                     el.draggable = false;
//                     } 
                     
//                     */
//                     // 该函数功能是把当前拖拽对象的a和img节点的html5 拖拽属性改为false
//                     _find(dragEl, criteria.trim(), _disableDraggable);
//                 });

//                 _on(ownerDocument, 'mouseup', _this._onDrop); //在ownerDocument 文档上面当发生鼠标抬起的时候，添加_onDrop函数
//                 _on(ownerDocument, 'touchend', _this._onDrop);//在ownerDocument 文档上面当发生触摸抬起的时候，添加_onDrop函数
//                 _on(ownerDocument, 'touchcancel', _this._onDrop);//在ownerDocument 文档上面当发生触摸划过抬起的时候，解绑_onDrop函数
//                 //delay 初始值为0
//                 if (options.delay) {
//                     /*
//                     这里里面的程序块添加了事件只有调用_disableDelayedDrag，添加了一个定时器执行一次dragStartFn函数，这个函数又马上解绑_disableDelayedDrag事件，关闭定时器，整个思路是只让程序发生一次，并且马上解绑事件,销毁该事件。这样思维有些特别
//                     */

//                     // If the user moves the pointer or let go the click or touch 如果用户移动指针或单击“单击”或“触摸”
//                     // before the delay has been reached: //之前的延迟已达到
//                     // disable the delayed drag //禁用延迟拖动
//                     _on(ownerDocument, 'mouseup', _this._disableDelayedDrag); //当鼠标抬起的时候在文档上添加_disableDelayedDrag事件
//                     _on(ownerDocument, 'touchend', _this._disableDelayedDrag); //触摸抬起的时候在文档上添加_disableDelayedDrag事件
//                     _on(ownerDocument, 'touchcancel', _this._disableDelayedDrag); //触摸划过抬起的时候在文档上添加_disableDelayedDrag事件
//                     _on(ownerDocument, 'mousemove', _this._disableDelayedDrag); //当鼠标移动mousemove的时候在文档上添加_disableDelayedDrag事件
//                     _on(ownerDocument, 'touchmove', _this._disableDelayedDrag); //触摸移动的时候在文档上添加_disableDelayedDrag事件

//                     _this._dragStartTimer = setTimeout(dragStartFn, options.delay); //执行dragStartFn函数
//                 } else {
//                     //开始拖拽
//                     dragStartFn();
//                 }
//             }
//         },

//         /***********************************************************************************************
//         *函数名 ：_disableDelayedDrag
//         *函数功能描述 ： 禁用延迟拖拽 当拖拽延时的时候，把所有事件解绑，并且关闭定时器。
//         *函数参数 ：
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _disableDelayedDrag: function () {
//             var ownerDocument = this.el.ownerDocument;

//             clearTimeout(this._dragStartTimer); //关闭定时器
//             _off(ownerDocument, 'mouseup', this._disableDelayedDrag);//当鼠标抬起的时候在文档上解绑_disableDelayedDrag事件

//             _off(ownerDocument, 'touchend', this._disableDelayedDrag);//触摸抬起的时候在文档上解绑_disableDelayedDrag事件
//             _off(ownerDocument, 'touchcancel', this._disableDelayedDrag);//当触摸划过抬起的时候在文档上解绑_disableDelayedDrag事件
//             _off(ownerDocument, 'mousemove', this._disableDelayedDrag);//当鼠移动起的时候在文档上解绑_disableDelayedDrag事件
//             _off(ownerDocument, 'touchmove', this._disableDelayedDrag);//触摸的时候在文档上解绑_disableDelayedDrag事件
//         },
//         /***********************************************************************************************
//         *函数名 ：_triggerDragStart
//         *函数功能描述 ： 为拖拽前做好准本，包括判断是否是触摸设备，或者pc，或者没有dragend
//         *函数参数 ：
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _triggerDragStart: function (/** Touch */touch) {

//             //按下去的值
//             if (touch) {
//                 // Touch device support 触摸设备支持
//                 tapEvt = {
//                     target: dragEl,
//                     clientX: touch.clientX,
//                     clientY: touch.clientY
//                 };

//                 this._onDragStart(tapEvt, 'touch'); //触摸设备
//             }
//             else if (!this.nativeDraggable) {

//                 this._onDragStart(tapEvt, true); //pc设备
//             }
//             else {
//                 //如果当前的html还没有设置拖拽属性则先设置拖拽属性
//                 _on(dragEl, 'dragend', this);
//                 _on(rootEl, 'dragstart', this._onDragStart);

//             }

//             try {
//                 if (document.selection) {
//                     // Timeout neccessary for IE9  
//                     setTimeout(function () {
//                         document.selection.empty(); //取消选中
//                     });
//                 } else {
//                     window.getSelection().removeAllRanges();//取消选中
//                 }
//             } catch (err) {

//             }
//         },


//         _dragStarted: function () {
//             if (rootEl && dragEl) { //如果鼠标按下去的拖拽节点存在和拖拽的根节点存在
//                 // Apply effect
//                 //为拖拽节点添加一个class名字是'sortable-ghost'
//                 _toggleClass(dragEl, this.options.ghostClass, true);
//                 //Sortable类赋值给Sortable.active 属性
//                 Sortable.active = this;

//                 // Drag start event

//                 //开始拖拽 并且会相应onStart 接口函数
//                 _dispatchEvent(this, rootEl, 'start', dragEl, rootEl, oldIndex);
//             }
//         },

//         _emulateDragOver: function () {

//             if (touchEvt) {
//                 if (this._lastX === touchEvt.clientX && this._lastY === touchEvt.clientY) {
//                     return;
//                 }

//                 this._lastX = touchEvt.clientX;
//                 this._lastY = touchEvt.clientY;

//                 if (!supportCssPointerEvents) {
//                     _css(ghostEl, 'display', 'none');
//                 }

//                 var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY),
//                     parent = target,
//                     groupName = ' ' + this.options.group.name + '',
//                     i = touchDragOverListeners.length;

//                 if (parent) {
//                     do {
//                         if (parent[expando] && parent[expando].options.groups.indexOf(groupName) > -1) {
//                             while (i--) {
//                                 touchDragOverListeners[i]({
//                                     clientX: touchEvt.clientX,
//                                     clientY: touchEvt.clientY,
//                                     target: target,
//                                     rootEl: parent
//                                 });
//                             }

//                             break;
//                         }

//                         target = parent; // store last element
//                     }
//                     /* jshint boss:true */
//                     while (parent = parent.parentNode);
//                 }

//                 if (!supportCssPointerEvents) {
//                     _css(ghostEl, 'display', '');
//                 }
//             }
//         },

//         /*
//         tapEvt = {
//           target: dragEl,
//           clientX: touch.clientX,
//           clientY: touch.clientY
//          };
//         */
//         /***********************************************************************************************
//         *函数名 ：_onTouchMove
//         *函数功能描述 ： 触摸移动拖拽动画事件ghostEl，把拖拽移动的xy值给ghostEl节点
//         *函数参数 ： viod
//         *函数返回值 ： 无
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _onTouchMove: function (/**TouchEvent*/evt) {
//             //evt 事件对象
//             if (tapEvt) {
//                 // only set the status to dragging, when we are actually dragging
//                 if (!Sortable.active) { //Sortable.active 不存在则执行_dragStarted函数 设置拖拽动态
//                     this._dragStarted();
//                 }

//                 // as well as creating the ghost element on the document body
//                 // 创建一个ghostEl dom节点，并且是克隆拖拽节点的rootEl下面就是id那个dom节点，添加在，并且设置了一些属性，高,宽，top，left，透明度，鼠标样式，
//                 this._appendGhost();

//                 var touch = evt.touches ? evt.touches[0] : evt, //判断是否是触摸事件还是pc鼠标事件
//                     dx = touch.clientX - tapEvt.clientX, //鼠标移动的x位置减去鼠标按下去的位置。
//                     dy = touch.clientY - tapEvt.clientY,//鼠标移动的y位置减去鼠标按下去的位置。
//                     //3d 特效 x是左右，y是上下，z是放大缩小 设置3d效果
//                     translate3d = evt.touches ? 'translate3d(' + dx + 'px,' + dy + 'px,0)' : 'translate(' + dx + 'px,' + dy + 'px)';

//                 moved = true;
//                 touchEvt = touch; //事件对象

//                 _css(ghostEl, 'webkitTransform', translate3d); //设置3d效果
//                 _css(ghostEl, 'mozTransform', translate3d); //设置3d效果
//                 _css(ghostEl, 'msTransform', translate3d); //设置3d效果
//                 _css(ghostEl, 'transform', translate3d); //设置3d效果


//                 evt.preventDefault(); // 阻止默认事件
//             }
//         },
//         /***********************************************************************************************
//         *函数名 ：_appendGhost
//         *函数功能描述 ： 创建一个ghostEl dom节点，并且是克隆拖拽节点的rootEl下面就是id那个dom节点，添加在，并且设置了一些属性，高,宽，top，left，透明度，鼠标样式，
//         *函数参数 ： viod
//         *函数返回值 ： 无
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _appendGhost: function () {

//             if (!ghostEl) { // 如果ghostEl 是空的，或者是假，或者是undefined，或者是0，则执行下面程序
//                 /*getBoundingClientRect()
//                 其实跟 o_dom.getBoundingClientRect().left= o_dom.offsetLeft; 他们值相等
//                 这个方法返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离。
//                 */
//                 var rect = dragEl.getBoundingClientRect(),
//                     css = _css(dragEl), //返回当前obj 所有的style的属性
//                     options = this.options, //this.options 参数
//                     ghostRect; //一个空变量

//                 ghostEl = dragEl.cloneNode(true); //克隆dragEl 当前拖拽的节点
//                 //options.ghostClass='sortable-ghost'
//                 _toggleClass(ghostEl, options.ghostClass, false);
//                 //fallbackClass= 'sortable-fallback
//                 _toggleClass(ghostEl, options.fallbackClass, true);

//                 //给新创建的节点的left和top和该节点的left和top值相等，所以要减去marginTop，marginLeft
//                 _css(ghostEl, 'top', rect.top - parseInt(css.marginTop, 10));
//                 _css(ghostEl, 'left', rect.left - parseInt(css.marginLeft, 10));

//                 _css(ghostEl, 'width', rect.width); //宽和高和拖拽节点相同
//                 _css(ghostEl, 'height', rect.height);
//                 _css(ghostEl, 'opacity', '0.8'); //透明度为0.8
//                 _css(ghostEl, 'position', 'fixed'); // 固定定位
//                 _css(ghostEl, 'zIndex', '100000'); //层为100000
//                 _css(ghostEl, 'pointerEvents', 'none'); //pointer-events:none顾名思意，就是鼠标事件拜拜的意思。元素应用了该CSS属性，链接啊，点击啊什么的都变成了“浮云牌酱油”。
//                 //把ghostEl 添加到拖拽的根节点那 
//                 options.fallbackOnBody && document.body.appendChild(ghostEl) || rootEl.appendChild(ghostEl);

//                 // Fixing dimensions. 固定尺寸 但是我觉这样写多此一举，因为上面已经设置高宽了，然后再乘以2，再减去一般结果还是一样的
//                 ghostRect = ghostEl.getBoundingClientRect();
//                 _css(ghostEl, 'width', rect.width * 2 - ghostRect.width);
//                 _css(ghostEl, 'height', rect.height * 2 - ghostRect.height);

//             }
//         },
//         /***********************************************************************************************
//         *函数名 ：_onDragStart
//         *函数功能描述 ： 拖拽开始 为document添加触摸事件与鼠标事件 
//         *函数参数 ：
//          evt：
//           类型:obj, 事件对象
//          useFallback:类型：string， Boolean 值 
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/

//         _onDragStart: function (/**Event*/evt, /**boolean*/useFallback) {
//             //html5拖拽属性。dataTransfer对象有两个主要的方法：getData()方法和setData()方法。
//             var dataTransfer = evt.dataTransfer,
//                 options = this.options;

//             //解绑文档上面的一些事件
//             this._offUpEvents();
//             //Object {name: "words", pull: true, put: true} 
//             //activeGroup={name: "words", pull: true, put: true} 
//             if (activeGroup.pull == 'clone') { //如果 参数是clone 则可以克隆节点而不是拖拽节点过去
//                 cloneEl = dragEl.cloneNode(true); //cloneNode(false) 克隆复制节点，参数如果是false则不复制里面的html，true则会复制整个dom包括里面的html
//                 //设置cloneEl 节点隐藏
//                 _css(cloneEl, 'display', 'none');
//                 //插入加点，在当前拖拽的dom节点前面插入一个节点
//                 rootEl.insertBefore(cloneEl, dragEl);
//             }

//             if (useFallback) { //如果是触摸则添加触摸事件

//                 if (useFallback === 'touch') {
//                     // Bind touch events
//                     //添加触摸移动事件
//                     _on(document, 'touchmove', this._onTouchMove);
//                     //添加触摸抬起事件
//                     _on(document, 'touchend', this._onDrop);
//                     //添加触摸划过结束事件
//                     _on(document, 'touchcancel', this._onDrop);
//                 } else {
//                     // Old brwoser
//                     //pc 添加鼠标移动事件
//                     _on(document, 'mousemove', this._onTouchMove);
//                     //pc 添加鼠标抬起事件
//                     _on(document, 'mouseup', this._onDrop);
//                 }

//                 this._loopId = setInterval(this._emulateDragOver, 50);
//             }
//             else {
//                 //html5拖拽属性。dataTransfer对象有两个主要的方法：getData()方法和setData()方法。
//                 if (dataTransfer) {
//                     dataTransfer.effectAllowed = 'move';//move ：只允许值为”move”的dropEffect。
//                     /*
//                     setData: function (dataTransfer, dragEl) { dataTransfer.setData('Text', dragEl.textContent);}
//                     设置拖拽时候拖拽信息
//                     */
//                     options.setData && options.setData.call(this, dataTransfer, dragEl);
//                 }

//                 _on(document, 'drop', this); //添加拖拽结束事件

//                 setTimeout(this._dragStarted, 0); //pc拖拽事件
//             }
//         },
//         /***********************************************************************************************
//         *函数名 ：_onDragOver
//         *函数功能描述 ： 拖拽元素进进入拖拽区域， 判断拖拽节点与拖拽碰撞的节点，交换他们的dom节点位置，并执行动画。 
//         *函数参数 ：evt
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _onDragOver: function (/**Event*/evt) {

//             var el = this.el,
//                 target,
//                 dragRect,
//                 revert,
//                 options = this.options,
//                 group = options.group,
//                 groupPut = group.put,
//                 isOwner = (activeGroup === group),
//                 canSort = options.sort;
//             if (evt.preventDefault !== void 0) {
//                 evt.preventDefault(); //阻止默认事件
//                 !options.dragoverBubble && evt.stopPropagation();//终止事件在传播过程的捕获、目标处理或起泡阶段进一步传播
//             }

//             moved = true;
//             //activeGroup={name: "words", pull: true, put: true}


//             //activeGroup=true
//             //options.disabled=false
//             //isOwner=true 因为isOwner=true 则执行canSort || (revert = !rootEl.contains(dragEl))
//             //如果父节点包含子节点则返回true ，contains,所以当canSort 是假时候(revert = !rootEl.contains(dragEl) 
//             //revert = !rootEl.contains(dragEl) 取反赋值
//             //这里的if需要一个假才能拖拽
//             //(activeGroup.name === group.name) ==true;
//             //(evt.rootEl === void 0 || evt.rootEl === this.el) ==true
//             //所以 该功能是 给设置sort参数提供的
//             if (
//                 activeGroup &&
//                 !options.disabled &&
//                 (
//                     isOwner ? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
//                         : activeGroup.pull && groupPut && (
//                             (activeGroup.name === group.name) || // by Name
//                             (groupPut.indexOf && ~groupPut.indexOf(activeGroup.name)) // by Array
//                         )
//                 ) &&
//                 (evt.rootEl === void 0 || evt.rootEl === this.el) // touch fallback
//             ) {
//                 // Smart auto-scrolling 智能滚动
//                 _autoScroll(evt, options, this.el);

//                 if (_silent) {
//                     return;
//                 }

//                 target = _closest(evt.target, options.draggable, el); //调整拖拽目标节点


//                 dragRect = dragEl.getBoundingClientRect(); //获取dom节点的一个获取left，right ，top，bottmo，值



//                 if (revert) { //revert undefined
//                     _cloneHide(true); //设置克隆的节点隐藏还是显示

//                     if (cloneEl || nextEl) { //如果克隆节点存在或者下一个节点存在

//                         rootEl.insertBefore(dragEl, cloneEl || nextEl);//就把dragEl添加到克隆节点存在或者下一个节点的上面

//                     }
//                     else if (!canSort) { //canSort 默认是true ，是设置是否 判断是否在自己区域拖拽
//                         rootEl.appendChild(dragEl); //canSort 是假添加到根节点
//                     }
//                     return;
//                 }

//                 //el.children.length 如果拖拽根节点没有子节点的时候该为true
//                 //el.children[0] === ghostEl如果根节点的字节点等于镜像节点的时候为真
//                 //el === evt.target 根节点等于目标节点的时候
//                 if ((el.children.length === 0) || (el.children[0] === ghostEl) ||
//                     (el === evt.target) && (target = _ghostIsLast(el, evt))
//                 ) {

//                     if (target) { // 如果_ghostIsLast 返回最后一个节点
//                         if (target.animated) { //判断 target.animated 动画是否在执行，如果在执行那么就不执行下面函数
//                             return;
//                         }

//                         targetRect = target.getBoundingClientRect();
//                     }
//                     //隐藏克隆节点
//                     _cloneHide(isOwner);


//                     /*
//                     rootEl:拖拽根节点
//                     el:拖拽根节点
//                     dragEl:拖拽节点
//                     dragRect:拖拽几点的Rect
//                     target:目标节点或者是根节点的最后一个子节点，释放鼠标的节点
//                     targetRect:target的Rect
//                     */


//                     if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect) !== false) {
//                         if (!dragEl.contains(el)) { // 判断dragEl中没有存在根节点
//                             el.appendChild(dragEl); //就把目拖拽节点添加到根节点那
//                             parentEl = el; // actualization
//                         }
//                         //动画
//                         this._animate(dragRect, dragEl);
//                         target && this._animate(targetRect, target);
//                     }
//                 }
//                 //target 拖拽的目标节点存在
//                 //target.animated动画没有在执行
//                 //target !== dragEl 拖拽的节点不等于目标节点 就是发生了dragenter事件
//                 //target 拖拽的父节点是根节点 rootEl 
//                 else if (target && !target.animated && target !== dragEl && (target.parentNode[expando] !== void 0)) {

//                     i++;
//                     if (lastEl !== target) { // 拖拽的目标节点就是发生拖拽ondragover时候的节点 不是最后一个子节点的时候
//                         lastEl = target; //将拖拽的目标节点赋值给最后一个节点
//                         lastCSS = _css(target); //获取最后目标节点的css全部属性
//                         lastParentCSS = _css(target.parentNode); //获取根节点的全部css属性
//                     }



//                     ///left|right|inline/.test(str) 匹配str中只要含有left|right|inline 中的任何一个就可以为真
//                     //floating 其实就是判断这里的拖拽节点是否已经有浮动，或者是inline也跟浮动差不多，或者是css3的flex-direction横向对其成一排的那个属性
//                     //isWide：如果目标节点的宽大于拖拽节点的宽
//                     //isLong:如果目标节点的高大于拖拽节点的高
//                     var targetRect = target.getBoundingClientRect(), //目标节点的rect
//                         width = targetRect.right - targetRect.left, //目标节点的宽
//                         height = targetRect.bottom - targetRect.top, //目标节点的高 
//                         floating = /left|right|inline|inlineBlock/.test(lastCSS.cssFloat + lastCSS.display)
//                             || (lastParentCSS.display == 'flex' && lastParentCSS['flex-direction'].indexOf('row') === 0),
//                         isWide = (target.offsetWidth > dragEl.offsetWidth), //目标节点宽大于拖拽节点
//                         isLong = (target.offsetHeight > dragEl.offsetHeight),//目标节点高大于拖拽节点
//                         //halfway 如果floating 浮动，inline，横向对齐 了就判断此时鼠标是在target中间的左边还是右边，右边则为true，否则false
//                         //halfway 如果floating 没有浮动，inline，横向对齐 就判断此时鼠标是在target中间的上面边还是下面，下边则为true，否则false
//                         halfway = (floating ?
//                             (evt.clientX - targetRect.left) / width :
//                             (evt.clientY - targetRect.top) / height
//                         )
//                             > 0.5,
//                         // 目标节点的下一个节点。 
//                         nextSibling = target.nextElementSibling,
//                         /*
//                         rootEl:拖拽根节点
//                         el:拖拽根节点
//                         dragEl:拖拽节点
//                         dragRect:拖拽几点的Rect
//                         target:拖拽节点或者是根节点的最后一个子节点
//                         targetRect:target的Rect
//                         */

//                         moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect), //空undefined
//                         after // after true 往下拖拽, false 往上拖拽
//                         ;

//                     if (moveVector !== false) {
//                         _silent = true;
//                         setTimeout(_unsilent, 30); //30毫秒设置为假

//                         _cloneHide(isOwner); //隐藏克隆节点

//                         if (moveVector === 1 || moveVector === -1) {//空undefined
//                             after = (moveVector === 1);
//                         }
//                         else if (floating) { //如果浮动

//                             var elTop = dragEl.offsetTop, //拖拽接点的top
//                                 tgTop = target.offsetTop; //目标节点top

//                             if (elTop === tgTop) { // //拖拽几点的top===目标节点top 说明他们是在同一列中

//                                 //target.previousElementSibling 如果目标节点的上一个节点是拖拽节点，这里就是他们上下节点互换位置,!isWide 目标节点宽小于拖拽节点
//                                 //或者 halfway 为真并且 isWide 目标节点宽大于拖拽节点
//                                 //


//                             } else {

//                                 //目标节点top大于>拖拽接点的top 
//                                 after = tgTop > elTop; // after true 往下拖拽 false 往上拖拽

//                             }
//                         } else {
//                             //没有浮动的时候
//                             // 目标节点的下一个节点。
//                             // console.log('nextSibling !== dragEl'+(nextSibling !== dragEl)); //往下拖拽
//                             //dom节点是按照拖拽完之后排序做判断
//                             //(nextSibling !== dragEl) 不是往上拖拽的时候 则为真的时候 如果目标节点的高大于拖拽节点的高
//                             //halfway 为真的时候。如果目标节点的高大于拖拽节点的高after 为真
//                             after = (nextSibling !== dragEl) && !isLong || halfway && isLong;
//                         }

//                         if (!dragEl.contains(el)) {

//                             if (after && !nextSibling) { //

//                                 el.appendChild(dragEl); //如果此时 目标的的下一个节点不存在那么直接把拖拽节点添加在后面即可
//                             } else {
//                                 //判断拖拽节点添加到哪个位置after真时候是往下拖拽则把拖拽节点添加到target下面。
//                                 //判断拖拽节点添加到哪个位置after假时候是往下拖拽则把拖拽节点添加到target上面。
//                                 target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
//                             }
//                         }

//                         parentEl = dragEl.parentNode; // actualization
//                         //交换位置前的drgRect， 交换后位置的拖拽节点dragEl
//                         //交换位置前的目标节点targetRect， 交换后位置的目标节点dragEl

//                         //执行动画。css3动画
//                         this._animate(dragRect, dragEl); //执行css3动画其实只是一种掩饰而已，真正的核心是他们交换dom节点的位置
//                         //执行动画。css3动画
//                         this._animate(targetRect, target);
//                     }
//                 }
//             }
//         },

//         /***********************************************************************************************
//         *函数名 ：_animate
//         *函数功能描述 ： 动画效果，执行css3动画
//         *函数参数 ： 
//          prevRect：obj，初始动画的坐标，
//          target：obj，target 其实最重要是获取交换dom节点后的坐标
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _animate: function (prevRect, target) {
//             //每次当目标节点与拖拽节点交替的时候就调用次改函数
//             //i++;


//             //prevRect: obj.getBoundingClientRect
//             //target:obj
//             var ms = this.options.animation; //动画延迟

//             if (ms) {
//                 var currentRect = target.getBoundingClientRect();

//                 //debugger;
//                 _css(target, 'transition', 'none');
//                 _css(target, 'transform', 'translate3d('
//                     + (prevRect.left - currentRect.left) + 'px,'
//                     + (prevRect.top - currentRect.top) + 'px,0)'
//                 );

//                 target.offsetWidth; // repaint

//                 _css(target, 'transition', 'all ' + ms + 'ms');
//                 _css(target, 'transform', 'translate3d(0,0,0)');

//                 clearTimeout(target.animated);
//                 target.animated = setTimeout(function () {
//                     _css(target, 'transition', '');
//                     _css(target, 'transform', '');
//                     target.animated = false;
//                 }, ms);
//             }
//         },
//         /***********************************************************************************************
//         *函数名 ：_offUpEvents
//         *函数功能描述 ： 解绑文档上的拖拽函数
//         *函数参数 ： viod
//         *函数返回值 ：viod
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/

//         _offUpEvents: function () {
//             var ownerDocument = this.el.ownerDocument;

//             _off(document, 'touchmove', this._onTouchMove); //当文档上面document 发生触摸移动事件的时候解绑 _onTouchMove事件
//             _off(ownerDocument, 'mouseup', this._onDrop); //当文档上面document 发生鼠标抬起事件的时候解绑 _onTouchMove事件
//             _off(ownerDocument, 'touchend', this._onDrop); //当文档上面document 发生触摸结束事件的时候解绑 _onTouchMove事件

//             //当一些更高级别的事件发生的时候（如电话接入或者弹出信息）会取消当前的touch操作，即触发ontouchcancel。一般会在ontouchcancel时暂停游戏、存档等操作。

//             _off(ownerDocument, 'touchcancel', this._onDrop); //当文档发生手指划过结束的时候解绑_onDrop 事件
//         },
//         //Drop被拖拽的元素在目标元素上同时鼠标放开触发的事件，此事件作用在目标元素上

//         /***********************************************************************************************
//         *函数名 ：init
//         *函数功能描述 ： 初始化作用
//         *函数参数 ：
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _onDrop: function (/**Event*/evt) {
//             //evt 事件对象

//             var el = this.el, //拖拽的根节点
//                 options = this.options; //参数类

//             clearInterval(this._loopId); //清除_loopId 定时器
//             clearInterval(autoScroll.pid);//清除pid 定时器
//             clearTimeout(this._dragStartTimer);//清除_dragStartTimer 定时器

//             // Unbind events
//             _off(document, 'mousemove', this._onTouchMove); //解除文档上面的鼠标移动事件函数为_onTouchMove
//             /*
             
//             DataTransfer 对象：退拽对象用来传递的媒介，使用一般为Event.dataTransfer。
//             draggable 属性：就是标签元素要设置draggable=true，否则不会有效果，例如：
            
//             <div title="拖拽我" draggable="true">列表1</div>
             
//             ondragstart 事件：当拖拽元素开始被拖拽的时候触发的事件，此事件作用在被拖曳元素上
//             ondragenter 事件：当拖曳元素进入目标元素的时候触发的事件，此事件作用在目标元素上
//             ondragover 事件：拖拽元素在目标元素上移动的时候触发的事件，此事件作用在目标元素上
//             ondrop 事件：被拖拽的元素在目标元素上同时鼠标放开触发的事件，此事件作用在目标元素上
//             ondragend 事件：当拖拽完成后触发的事件，此事件作用在被拖曳元素上
//             Event.preventDefault() 方法：阻止默认的些事件方法等执行。在ondragover中一定要执行preventDefault()，否则ondrop事件不会被触发。另外，如果是从其他应用软件或是文件中拖东西进来，尤其是图片的时候，默认的动作是显示这个图片或是相关信息，并不是真的执行drop。此时需要用用document的ondragover事件把它直接干掉。
//             Event.effectAllowed 属性：就是拖拽的效果。
//            如果nativeDraggable是true 那么
//             */
//             if (this.nativeDraggable) {
//                 _off(document, 'drop', this); //解绑drop 事件 函数是handleEvent
//                 _off(el, 'dragstart', this._onDragStart); //解绑html5的拖拽dragstart事件 函数是 _onDragStart
//             }
//             //解绑文档上面的一些事件
//             this._offUpEvents();

//             if (evt) {
//                 if (moved) {
//                     evt.preventDefault(); //阻止默认事件
//                     !options.dropBubble && evt.stopPropagation(); //阻止事件冒泡
//                 }
//                 //ghostEl 在736行时候才会创建该节点，所以在736行调用_onDrop函数的时候都是为空
//                 //如果拖拽的镜像对象存在那么他就添加在拖拽的根节点
//                 ghostEl && ghostEl.parentNode.removeChild(ghostEl);


//                 if (dragEl) {
//                     if (this.nativeDraggable) {
//                         //如果拖拽节点存在了 就解绑this 的 handleEvent 事件
//                         _off(dragEl, 'dragend', this);
//                     }
//                     //禁用拖拽html5 属性
//                     _disableDraggable(dragEl);

//                     // Remove class's //删除css
//                     _toggleClass(dragEl, this.options.ghostClass, false);
//                     _toggleClass(dragEl, this.options.chosenClass, false);

//                     if (rootEl !== parentEl) { //如果从一个列表拖拽到另一个列表的时候
//                         //返回当前的索引
//                         newIndex = _index(dragEl, options.draggable);

//                         if (newIndex >= 0) { //如果当前的索引大于0
//                             // drag from one list and drop into another //从类表中拖拽到另一个列表
//                             //事件接口
//                             _dispatchEvent(null, parentEl, 'sort', dragEl, rootEl, oldIndex, newIndex); //开始拖拽函数创建与触发

//                             _dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);//开始拖拽函数创建与触发

//                             // Add event
//                             _dispatchEvent(null, parentEl, 'add', dragEl, rootEl, oldIndex, newIndex);//添加节点拖拽函数创建与触发

//                             // Remove event//删除节点拖拽函数创建与触发
//                             _dispatchEvent(this, rootEl, 'remove', dragEl, rootEl, oldIndex, newIndex);
//                         }

//                     }
//                     else { //同一个列表中
//                         // Remove clone
//                         cloneEl && cloneEl.parentNode.removeChild(cloneEl);

//                         if (dragEl.nextSibling !== nextEl) {
//                             // Get the index of the dragged element within its parent
//                             newIndex = _index(dragEl, options.draggable);

//                             if (newIndex >= 0) {


//                                 // drag & drop within the same list //update拖拽更新新数据
//                                 _dispatchEvent(this, rootEl, 'update', dragEl, rootEl, oldIndex, newIndex);
//                                 _dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
//                             }
//                         }
//                     }

//                     if (Sortable.active) { //Sortable.active 存在说明已经拖拽开始了
//                         /* jshint eqnull:true */
//                         if (newIndex == null || newIndex === -1) {//newIndex 这个条件成立的时候是拖拽第一个节点并且没有更换拖拽位置
//                             newIndex = oldIndex;
//                         }
//                         //拖拽结束 
//                         _dispatchEvent(this, rootEl, 'end', dragEl, rootEl, oldIndex, newIndex);

//                         // Save sorting //保存排序
//                         this.save();
//                     }
//                 }

//             }
//             //重新初始化参数
//             this._nulling();
//         },
//         /***********************************************************************************************
//         *函数名 ：_nulling
//         *函数功能描述 ： 初始化拖拽的数据
//         *函数参数 ：
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         _nulling: function () {
//             if (Sortable.active === this) {
//                 rootEl = //鼠标按下去拖拽节点的根节点
//                     dragEl = //鼠标按下去拖拽节点 
//                     parentEl = //拖拽的父节点 鼠标拖拽 发生ondragover 事件 拖拽节点放到目标节点的时候发生事件 的根节点 父节点，也有可能是鼠标按下去拖拽的根节点
//                     ghostEl = // 拖拽镜像
//                     nextEl = //下一个节点
//                     cloneEl = //拖拽克隆节点

//                     scrollEl = //滚动节点
//                     scrollParentEl = //滚动的父节点

//                     tapEvt = //tapEvt 触摸对象包括x与y轴与拖拽当前节点
//                     touchEvt = //触摸事件对象

//                     moved = //布尔值
//                     newIndex = //拖拽的现在索引

//                     lastEl = //拖拽根节点中的最后一个子节点
//                     lastCSS = //拖拽根节点中的最后一个子节点class

//                     activeGroup = //options.group
//                     Sortable.active = null;

//             }
//         },
//         /***********************************************************************************************
//         *函数名 ：handleEvent
//         *函数功能描述 ： 为事件绑定this的时候提供该事件，判断是否在拖拽还是拖拽结束，调用对应的函数
//         *函数参数 ：
//          evt:
//          类型：object，事件类型 拖拽的事件类型
//         *函数返回值 ：
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         handleEvent: function (/**Event*/evt) {//handleEvent 是该事件绑定这个对象的时候则发生这里的事件，则事件绑定给Sortable 的时候则发生这里的事件
//             var type = evt.type;
//             //dragover 在拖拽区域移动拖拽时候发生事件相当于move
//             //dragenter 元素放入到拖拽的区域中相当于 over
//             if (type === 'dragover' || type === 'dragenter') { //事件正在拖拽的时候 


//                 if (dragEl) { //在300行的时候调用dragover与dragenter事件，这个时候dragEl是处于声明而已但是没有赋值所以是undefined， 如果dragEl 存在则是真正拖拽的时候，dragEl是拖拽镜像
//                     this._onDragOver(evt);
//                     _globalDragOver(evt);
//                 }
//             }
//             else if (type === 'drop' || type === 'dragend') { //拖拽事件结束的时候
//                 this._onDrop(evt);
//             }
//         },


//         /**
//         * Serializes the item into an array of string.
//         * @returns {String[]}
//         */
//         /***********************************************************************************************
//         *函数名 ：toArray
          
//         *函数功能描述 ： 获取dom节点的 data-id 的属性 如果没有则 会调用_generateId函数生成唯一表示符 
//         *函数参数 ： viod 
//         *函数返回值 ： 类型：array 生成唯一标识符的id数组
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         toArray: function () {
//             var order = [],
//                 el,
//                 children = this.el.children, //获取所有子节点
//                 i = 0,
//                 n = children.length, //获取子节点的长度
//                 options = this.options;


//             for (; i < n; i++) {
//                 el = children[i];
//                 if (_closest(el, options.draggable, this.el)) {
//                     //getAttribute获取 data-id 的属性
//                     //order.push 如果没有data-id 属性获取不到值，则会调用_generateId函数生成唯一表示符
//                     order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
//                 }
//             }
//             //返回唯一标识符id 数组 类型
//             return order;
//         },


//         /**
//         * Sorts the elements according to the array.
//         * @param {String[]} order order of the items
//         */

//         /***********************************************************************************************
//         *函数名 ：sort
          
//         *函数功能描述 ： 删除含有这个id的子节点 删除他 让他重新排序， 从栈底部插入数据
//         *函数参数 ： order：
//           类型：array， 数组id
         
//         *函数返回值 ： void
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         sort: function (order) {
//             debugger;
//             //order 数组
//             var items = {},
//                 rootEl = this.el; //鼠标开始拖拽的根节点


//             this.toArray().forEach(function (id, i) { //遍历this.toArray() 数组中的id
//                 var el = rootEl.children[i];

//                 if (_closest(el, this.options.draggable, rootEl)) {
//                     items[id] = el; //遍历数组中的id 赋值给一个对象
//                 }
//             }, this);

//             order.forEach(function (id) {
//                 if (items[id]) {
//                     rootEl.removeChild(items[id]); //删除含有这个id的子节点 删除他 让他重新排序，
//                     rootEl.appendChild(items[id]);//删除含有这个id的子节点 删除他 让他重新排序， 从栈底部插入数据
//                 }
//             });
//         },


//         /**
//         * Save the current sorting
//         保存排序
//         */
//         save: function () {
//             var store = this.options.store;
//             store && store.set(this);
//         },


//         /**
//         * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
//         * @param {HTMLElement} el
//         * @param {String} [selector] default: `options.draggable`
//         * @returns {HTMLElement|null}
//         */
//         /***********************************************************************************************
//         *函数名 ：_closest
//         *函数功能描述 ： 用来调节节点，匹配节点。匹配calss。 匹配触发dom该函数的dom节点中的tag或者class，selector参数可以是tag或者class或者>*，
//         如果是>* 并且当前的父节点和ctx 参数相同 则不需要匹配直接返回el，如果是tag或者class则匹配。
//         *函数参数 ：
//          el：
//           类型:obj，拖拽节点dom
//          selector：
//           类型：字符串，如果selector是'li' : '>*'则返回是改节点dom，还有如果selector是和当前拖拽节点的name相同则也返回改节点dom，还有匹配触发该函数的el中的class是否是和参数中selector相同，相同则返回true，否则返回null
           
//         *函数返回值 ：dom和null
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         closest: function (el, selector) {

//             return _closest(el, selector || this.options.draggable, this.el);
//         },


//         /**
//         * Set/get option
//         * @param {string} name
//         * @param {*} [value]
//         * @returns {*}
//         */
//         /***********************************************************************************************
//         *函数名 ：option
//         *函数功能描述 ： 获取option对象中的某个参数，或者设置option对象中的某个参数
         
//         *函数参数 ：name：
//           类型：string， option的key，
           
//          value：类型：string， 设置option的值
           
//         *函数返回值 ： viod
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/

//         option: function (name, value) {
//             var options = this.options;

//             if (value === void 0) { //当没有传递第二个参数的时候 则返回该options参数的某个值
//                 return options[name];
//             } else {
//                 options[name] = value;// 设置options参数的某个值 

//                 if (name === 'group') { // 如果name 是group 则在后面添加['pull', 'put']属性
//                     _prepareGroup(options);
//                 }
//             }
//         },


//         /**
//         * Destroy 破坏
//         */
//         /***********************************************************************************************
//         *函数名 ：destroy
//         *函数功能描述 ： 清空拖拽事件，和情况拖拽列表dom节点，销毁拖拽 。
         
//         *函数参数 viod
//         *函数返回值 ： viod
//         *作者 ： 
//         *函数创建日期 ：
//         *函数修改日期 ：
//         *修改人 ：
//         *修改原因 ：
//         *版本 ：
//         *历史版本 ：
//         ***********************************************************************************************/
//         destroy: function () {
//             var el = this.el;

//             el[expando] = null; //把每一个时间戳的Sortable 的对象置为空

//             _off(el, 'mousedown', this._onTapStart); // 解绑拖拽类表中的mousedown事件_onTapStart函数
//             _off(el, 'touchstart', this._onTapStart); // 解绑拖拽类表中的touchstart事件_onTapStart函数

//             if (this.nativeDraggable) {
//                 _off(el, 'dragover', this); // 解绑拖拽类表中的dragover事件handleEvent函数 
//                 _off(el, 'dragenter', this);// 解绑拖拽类表中的dragover事件handleEvent函数
//             }

//             // Remove draggable attributes
//             //把页面上所有含有draggable 属性的dom节点 全部删除该属性，让它不能拖拽
//             Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
//                 el.removeAttribute('draggable');
//             });
//             //删除touchDragOverListeners 触摸列表事件_onDragOver
//             touchDragOverListeners.splice(touchDragOverListeners.indexOf(this._onDragOver), 1);

//             this._onDrop(); //重新初始化

//             this.el = el = null; //把拖拽列表的dom节点清空
//         }
//     };

//     /***********************************************************************************************
//     *函数名 ：_cloneHide
//     *函数功能描述 ： 设置克隆的节点隐藏显示，是否添加到页面
//     *函数参数 ： 
//      state：
//       类型:Boolean 真，假
//     *函数返回值 ： viod
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _cloneHide(state) {
//         //state布尔值
//         //cloneEl 克隆的节点
//         //state 状态
//         if (cloneEl && (cloneEl.state !== state)) {//如果cloneEl 存在，并且cloneEl.state 不等于state 的时候
//             _css(cloneEl, 'display', state ? 'none' : ''); //state 为真的时候把它隐藏，为假的时候显示
//             !state && cloneEl.state && rootEl.insertBefore(cloneEl, dragEl);//state为假的时候cloneEl.state 为真则把cloneEl添加在dragEl前面
//             cloneEl.state = state; //
//         }
//     }

//     /***********************************************************************************************
//     *函数名 ：_closest
//     *函数功能描述 ： 匹配触发dom该函数的dom节点中的tag或者class，selector参数可以是tag或者class或者>*，
//     如果是>* 并且当前的父节点和ctx 参数相同 则不需要匹配直接返回el，如果是tag或者class则匹配
//     *函数参数 ：
//      el：
//       类型:obj，拖拽节点dom
//      selector：
//       类型：字符串，如果selector是'li' : '>*'则返回是改节点dom，还有如果selector是和当前拖拽节点的name相同则也返回改节点dom，还有匹配触发该函数的el中的class是否是和参数中selector相同，相同则返回true，否则返回null
//      ctx：ctx用来匹配当前selector的父节点是否等于ctx节点 
//     *函数返回值 ：dom和null
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _closest(/**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx) {
//         /* el 目标节点
//         selector /[uo]l/i.test(el.nodeName) ? 'li' : '>*',
//         ctx 父亲节点*/
//         if (el) {
//             //如果没有传父亲节点过来则是整个文档
//             ctx = ctx || document;

//             do {

//                 if (
//                     //如果不是li而是其他节点 并且已经搜索完了直到是父亲节点的时候就返回true
//                     //或者走_matches _matches 需要true
//                     //selector === '>*' && el.parentNode === ctx 如果 selector === '>*' 表示父节点不是ol或ul
//                     (selector === '>*' && el.parentNode === ctx)
//                     || _matches(el, selector)
//                 ) {

//                     return el;
//                 }
//             }
//             //el !== ctx 如果目标节点不是当前的父节点，则会一直找上一层的父节点知道当他找到当前的根父节点程序则停止。 
//             while (el !== ctx && (el = el.parentNode)); //如果条件不成立一直需找上一层父节点
//         }

//         return null;
//     }

//     /*
//     *函数名 ：_globalDragOver
//     *函数功能描述 ：设置拖动的元素移动到放置目标。
//     *参数说明：
//      evt：类型obj事件对象
//     返回值：void
//     */
//     function _globalDragOver(/**Event*/evt) {
//         /*
//         1.effectAllowed属性表示允许拖放元素的哪种dropEffect。什么是dropEffect?也是dataTransfer 的一种属性。
//         dropEffect属性可以知道被拖动的元素能够执行哪种放置行为（当拖到目的地时）。这个属性有下列4个可能的值。
//        “none”：不能把拖动的元素放在这里。这是除文本框之外所有元素的默认值。
//        “move”：应该把拖动的元素移动到放置目标。
//        “copy”：应该把拖动的元素复制到放置目标。
//        “link”：表示放置目标会打开拖动的元素（但拖动的元素必须是一个链接，有URL）。
//         2. dt.effectAllowed = 'all'：即说被拖动元素在放置到目的地时，可以上面的任意一种效果来处理。
//         3. 必须在ondraggstart事件处理程序中设置effectAllowed属性。
//         */
//         if (evt.dataTransfer) {

//             evt.dataTransfer.dropEffect = 'move'; //“move”：应该把拖动的元素移动到放置目标。
//         }
//         evt.preventDefault();
//     }

//     /*
//     *函数名 ：_on
//     *函数功能描述 ： 事件绑定
//     *参数说明：
//      el：类型DOM节点， 
//      name：类型string，事件类型
//      fn：类型：function，需要绑定的函数
//     */
//     function _on(el, event, fn) {
//         el.addEventListener(event, fn, false);
//     }

//     /*
//     *函数名 ：_toggleClass
//     *函数功能描述 ： 添加删除calss
//     *参数说明：
//      el：类型DOM节点， 需要添加和删除的dom节点，
//      name：类型string，需要添加删除class字符串的
//      fn：类型：布尔值，如果是真则删除name的class名称否则添加
//     */
//     function _off(el, event, fn) {
//         el.removeEventListener(event, fn, false);
//     }

//     /*
//     *函数名 ：_toggleClass
//     *函数功能描述 ： 添加删除calss
//     *参数说明：
//      el：类型DOM节点， 需要添加和删除的dom节点，
//      name：类型string，需要添加删除class字符串的
//      state：类型：布尔值，如果是真则删除name的class名称否则添加
//     */
//     function _toggleClass(el, name, state) {
//         //console.log(el.classList); //获取dom节点clss的个数并且以数组形式存储起来
//         //el.classList 判断当前的拖拽节点又没有class 如果有
//         if (el) {
//             if (el.classList) {
//                 //如果state 是真则在改节点上面添加name class 否则删除name class
//                 el.classList[state ? 'add' : 'remove'](name);
//             }
//             else {
//                 //replace() 方法用于在字符串中用一些字符替换另一些字符，或替换一个与正则表达式匹配的子串。
//                 // RSPACE = /\s+/g, 匹配1-n个空格 全局匹配
//                 // (' ' + el.className + ' ').replace(RSPACE, ' ') 去除class 中的所有空格 并且只保留一个空格 每一个class中
//                 //className = (' ' + el.className + ' ').replace(RSPACE, '').replace(' ' + name + ' ', ' '); 剔除 name class
//                 var className = (' ' + el.className + ' ').replace(RSPACE, '').replace(' ' + name + ' ', ' ');

//                 //如果state 是真则在改节点上面添加name class 否则删除name class
//                 el.className = (className + (state ? ' ' + name : '')).replace(RSPACE, ' ');
//             }
//         }


//     }
//     /*
//     *函数名 ：设置 样式 与 获取dom节点的style属性
//     *函数功能描述 ： 添加删除calss,获取dom节点全部css属性，如果是一个参数的时候将返回该dom节点的全部css属性，如果是两个参数的时候该返回该css的第二个参数的值，如果是三个参数的话将设置css样式
//     *参数说明：
//      el：类型DOM节点， 需要添加和删除的dom节点，
//      prop：类型string，需要添加删除class字符串的那么
//      val：类型：布尔值，如果是真则删除name的class名称否则添加
//     */

//     function _css(el, prop, val) {
//         var style = el && el.style; //如果el存在并且他是dom节点style=el.style

//         if (style) {
//             if (val === void 0) { //如果val===undefined
//                 //var win = document.defaultView; 返回当前文档上面的所有对象
//                 //document.defaultView.getComputedStyle 返回当前文档上的对象的样式方法
//                 //
//                 if (document.defaultView && document.defaultView.getComputedStyle) {
//                     val = document.defaultView.getComputedStyle(el, ''); //获取到改dom节点的全部style属性，并且带有值
//                 }
//                 else if (el.currentStyle) {
//                     val = el.currentStyle; //getComputedStyle与currentStyle获取样式(style/class)
//                 }

//                 return prop === void 0 ? val : val[prop]; //如果prop为undefined则返回style全部属性
//             }
//             else {
//                 if (!(prop in style)) { //如果prop中这个属性中style中没有 
//                     prop = '-webkit-' + prop; //则在这个prop前面加 '-webkit-' 字符串
//                 }

//                 style[prop] = val + (typeof val === 'string' ? '' : 'px'); // 如果val类型是数子则添加px
//             }
//         }
//     }




//     /***********************************************************************************************
//     *函数名 ：_find
//     *函数功能描述 ： 获取拖拽节点下面的所有a和img标签，并且设置他们禁止拖拽行为
//     *函数参数 ：
//      ctx：
//      类型：dom-obj 拖拽的节点
//      tagName：
//       类型：string，ctx.getElementsByTagName(tagName) 
//       获取拖拽节点下面的所有a和img
//     *函数返回值 ： a和img的dom集合
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _find(ctx, tagName, iterator) {
//         /*
//        ctx 拖拽的节点
//        ctx.getElementsByTagName(tagName) 获取拖拽节点下面的所有a和img
//        _disableDraggable 是一个函数
//        iterator=_disableDraggable
//        _find(ctx, tagName, iterator) 该函数功能是把当前拖拽对象的a和img节点的html5 拖拽属性改为false
//        */

//         if (ctx) {
//             var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;

//             if (iterator) {
//                 for (; i < n; i++) {
//                     iterator(list[i], i);
//                 }
//             }

//             return list;
//         }

//         return [];
//     }

//     /***********************************************************************************************
//      *函数名 ：_dispatchEvent
//      *函数功能描述 ： 创建一个事件，事件参数主要由name 提供，并且触发该事件，其实就是模拟事件并且触发该事件 
//      *函数参数 ：
//       sortable：
//       类型： obj sortable
//       rootEl：
//        类型： dom-obj 鼠标按下去拖拽节点的根节点
        
//       name： 类型： string 需要创建的事件
       
//       targetEl：dom-obj 鼠标按下去拖拽节点，触屏到发生事件ondragover的节点的根节点，就是目标节点的根节点。但是如果是start事件的时候传进来的改参数就是鼠标按下去拖拽节点的根节点
       
//       fromEl：
//        类型： dom-obj 鼠标按下去拖拽节点的根节点 参数和第二个一样，为什么重写参数进来呢，可能是为了兼容这样的的吧
      
//       startIndex：
//         类型： number 鼠标按下去拖拽节点的索引
//       newIndex： 
//        类型： number 
      
//      * *函数返回值 ：
//      *作者 ： 
//      *函数创建日期 ：
//      *函数修改日期 ：
//      *修改人 ：
//      *修改原因 ：
//      *版本 ：
//      *历史版本 ：
//      ***********************************************************************************************/
//     function _dispatchEvent(sortable, rootEl, name, targetEl, fromEl, startIndex, newIndex) {

//         var evt = document.createEvent('Event'), //创建一个事件
//             options = (sortable || rootEl[expando]).options, //获取options 参数
//             //name.charAt(0) 获取name的第一个字符串
//             //toUpperCase() 变成大写
//             //name.substr(1) 提取从索引为1下标到字符串的结束位置的字符串
//             //onName 将获得 on+首个字母大写+name从第一个下标获取到的字符串
//             onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);

//         evt.initEvent(name, true, true); //自定义一个事件

//         evt.to = rootEl; //在触发该事件发生evt的时候，将evt添加多一个to属性，值为rootEl
//         evt.from = fromEl || rootEl; //在触发该事件发生evt的时候，将evt添加多一个to属性，值为rootEl
//         evt.item = targetEl || rootEl; //在触发该事件发生evt的时候，将evt添加多一个to属性，值为rootEl
//         evt.clone = cloneEl; //在触发该事件发生evt的时候，将evt添加多一个to属性，值为rootEl

//         evt.oldIndex = startIndex; //开始拖拽节点
//         evt.newIndex = newIndex; //现在节点
//         //触发该事件，并且是在rootEl 节点上面 。触发事件接口就这这里了。onAdd: onUpdate: onRemove:onStart:onSort:onEnd: 

//         rootEl.dispatchEvent(evt);

//         if (options[onName]) {
//             options[onName].call(sortable, evt);
//         }
//     }

//     /***********************************************************************************************
//     *函数名 ：_onMove
//     *函数功能描述 ： 表格分页数据
//     *函数参数 ： 
//      fromEl：
//      类型：obj，拖拽的根节点
//      toEl：
//      类型：obj，拖拽的根节点
//      dragEl：
//      类型：obj，拖拽的节点
//      dragRect：
//      类型：obj，拖拽的节点rect
//      targetEl：
//      类型：obj，目标节点 ondragover 发生事件的节点
//      targetRect：
//      类型：obj，目标节点rect
//     *函数返回值 ： retVal
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect) {

//         var evt,
//             //sortable 类 //fromEl 是根节点
//             sortable = fromEl[expando], //expando = 'Sortable' + (new Date).getTime(), //字符串Sortable+时间戳 el[expando] = this; //把 Sortable 类放在HTMLDOM节点的expando属性中

//             onMoveFn = sortable.options.onMove, //空undefined
//             retVal;


//         evt = document.createEvent('Event'); //创建一个事件对象
//         evt.initEvent('move', true, true); //添加移动事件

//         evt.to = toEl; //把根节点赋值给to的属性上面
//         evt.from = fromEl; //把根节点赋值给from的属性上面
//         evt.dragged = dragEl; //把现在拖拽节点赋值给to的属性上面
//         evt.draggedRect = dragRect; //把现 在拖拽节点的rect
//         evt.related = targetEl || toEl; //判断目标节点或者是toel节点谁存在谁赋值给related 不过targetEl 有限权限高
//         evt.relatedRect = targetRect || toEl.getBoundingClientRect(); //判断targetEl的节点的rect或者是toel节点rect谁存在谁赋值给related 不过targetEl的rect 有限权限高

//         fromEl.dispatchEvent(evt); //在根节点触发移动事件

//         if (onMoveFn) {
//             retVal = onMoveFn.call(sortable, evt); //如果移动函数存在则知心移动函数onMoveFn
//         }

//         return retVal; //返回该移动函数执行的结果 //空undefined
//     }
//     /***********************************************************************************************
//     *函数名 ：_disableDraggable
//     *函数功能描述 ： 禁用拖动 把heml5的拖拽属性设置为假
//     *函数参数 ：viod
//     *函数返回值 ：无
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/

//     function _disableDraggable(el) {
//         el.draggable = false;
//     }

//     /***********************************************************************************************
//     *函数名 ：_unsilent
//     *函数功能描述 ： 将 _silent 设置为假
//     *函数参数 ：viod
//     *函数返回值 ：无
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _unsilent() {
//         _silent = false;
//     }


//     /** @returns {HTMLElement|false} */
//     /***********************************************************************************************
//     *函数名 ：_ghostIsLast
//     *函数功能描述 ： 表格分页数据
//     *函数参数 ：
//      el ：类型：dom，拖拽的根节点
//      evt：类型：obj，事件对象
//     *函数返回值 ：
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _ghostIsLast(el, evt) {
//         var lastEl = el.lastElementChild, //最后一个节点
//             rect = lastEl.getBoundingClientRect(); //最后一个节点的rect
//         return (
//             (evt.clientY - (rect.top + rect.height) > 5) || //判断鼠标位置是否在dom节点的bottom下面还是上面 如果是做下面则结果大于0 否则小于0 ，如果鼠标位置在dom节点bottom下面大于5px的时候则返回lastEl 节点
//             (evt.clientX - (rect.right + rect.width) > 5) //不知道是不是程序把right写错了，写成了left。如果是right话则是这样。判断鼠标位置是否在dom节点的right左边还是右边 如果是左边则大于0，否则小于0 如果鼠标位置在dom节点right右边面大于5px的时候则返回lastEl 节点
//         ) && lastEl; // min delta
//     }


//     /**
//     * Generate id
//     * @param {HTMLElement} el
//     * @returns {String}
//     * @private
//     */
//     /***********************************************************************************************
//     *函数名 ：_generateId
//     *函数功能描述 ： 根据tag的name和class，src，href，文本内容，来匹配生成唯一的标识符
//     *函数参数 ： 
//      el：dom节点
//     *函数返回值 ：string
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/


//     function _generateId(el) {
//         var str = el.tagName + el.className + el.src + el.href + el.textContent,
//             i = str.length,
//             sum = 0;

//         while (i--) {
//             sum += str.charCodeAt(i);
//         }

//         return sum.toString(36); //生成36进制
//     }

//     /**
//     * Returns the index of an element within its parent for a selected set of
//     * elements
//     * @param {HTMLElement} el
//     * @param {selector} selector
//     * @return {number}
//     */
//     /***********************************************************************************************
//     *函数名 ：_index
//     *函数功能描述 ： 返回在其父范围内的元素的元素的索引
//     *函数参数 ： 
//       el
//     *函数返回值 ：number
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/

//     function _index(el, selector) {
//         var index = 0;

//         //如果目标节点不存在，或者目标节点的父节点不存在则返回一个 -1 就是当前目标节点如果是window 则返回-1
//         if (!el || !el.parentNode) {
//             return -1;
//         }
//         //el.previousElementSibling 获取上一个节点

//         /*
//         TEMPLATE 标签 html5 模板标签 例子
//         // 模板文本
//        <template id="tpl">
//        <img src="dummy.png" title="{{title}}"/>
//        </template>
        
//        // 获取模板
//        <script type="text/javascript">
//        var tplEl = document.getElementById('tpl')
//        // 通过tplEl.innerText获取也可以
//        var tpl = tplEl.innerHTML
//        tpl = tpl.replace(/^[\s\u3000]*|[\s\u3000]*$/, '')
//        Handlebars.compile(tpl)({title: 'test'})
//        </script>
         
//         意思是当节点是TEMPLATE标签的时候则表示该搜索标签已经到达了最顶端
//         */
//         while (el && (el = el.previousElementSibling)) {
//             if (el.nodeName.toUpperCase() !== 'TEMPLATE'
//                 && _matches(el, selector)) {
//                 index++;
//             }
//         }

//         return index;
//     }
//     /***********************************************************************************************
//     *函数名 ：_matches
//     *函数功能描述 ： 匹配tag和tag，匹配clsss和tag，
//     *函数参数 ： 
//      el：
//      类型:obj，当前拖拽节点dom
//      selector:
//      类型：string, tag或者clasname
      
//     *函数返回值 ：
//      类型：Boolean,真假，selector如果传递的是tag，则当前的el的tag和selector的tag要同样，或当前的el的class含有selector 中的calss则返回真，否则返回假
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _matches(/**HTMLElement*/el, /**String*/selector) {
//         /* 
//         el 目标节点
//         selector = /[uo]l/i.test(el.nodeName) ? 'li' : '>*',
//         selector=>*
//         */
//         if (el) {
//             //split 字符串截取 //没有.则返回为空 但是selector 的值还是原来的 li 但是selector 类型变成了数组
//             //shift 删除数组第一个字符串并返回该字符串
//             //toUpperCase 把字符串变成大写
//             //整个思维是把一个字符串比如 ".aa .ccc .bbb .ddd" 然后提取到改class中的第一个变成大写 AA
//             selector = selector.split('.'); // 这里分割判断是class还是tag

//             var tag = selector.shift().toUpperCase(), // class

//                 //join 把数组["a","b","c"]变成a|b|c
//                 // (?=)会作为匹配校验，但不会出现在匹配结果字符串里面 就是前后必须要匹配有空格 但是不会匹配上空格
//                 //比如匹配 " aa bb cc " 匹配到 [aa,bb,cc]
//                 /* 
//                 \\s 与 (?=\\s) 前后必须要有空格，但是不会匹配上空格
//                 */
//                 re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g'); // 



//             return (
//                 //tag === '' el.nodeName.toUpperCase() == tag
//                 //selector.length=2 tag === '' true
//                 //el.nodeName.toUpperCase() == tag 如果父节点是ul ol 则这里条件为真
//                 (tag === '' || el.nodeName.toUpperCase() == tag) &&
//                 //匹配 class 的长度等于标签的长度，。这里意思是在el中匹配的class含有selector的class就能匹配上
//                 (!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length)
//             );
//         }

//         return false;
//     }


//     /***********************************************************************************************
//     *函数名 ：_throttle
//     *函数功能描述 ： 回调初始化一个函数 并且调用该回调函数
//     *函数参数 ： 
//      callback：
//      类型:function，回调函数
//      ms:
//      类型：number, 毫秒
      
//     *函数返回值 ：
//      类型：function，函数，可以用来声明一个函数作用
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _throttle(callback, ms) {
//         var args,
//             _this;

//         return function (/*有可能是n个参数*/) {

//             if (args === void 0) {
//                 args = arguments; //arguments 就是callback中的callback 所以参数决定来源于它
//                 _this = this;
//                 //执行回调函数 
//                 setTimeout(function () {
//                     if (args.length === 1) { //当callback 函数一个参数的时候
//                         callback.call(_this, args[0]);
//                     } else {
//                         callback.apply(_this, args);//当callback 函数多个参数的时候
//                     }
//                     args = void 0;
//                 }, ms);
//             }
//         };
//     }
//     /***********************************************************************************************
//     *函数名 ：_extend
//     *函数功能描述 ：类合并
//     *函数参数 ： 
//      dst：类型：obj，子类 
//      src：类型：obj，父类 
//     *函数返回值 ： dst 子类
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/
//     function _extend(dst, src) {
//         if (dst && src) {
//             for (var key in src) { //遍历对象
//                 if (src.hasOwnProperty(key)) { //过滤原型
//                     dst[key] = src[key];
//                 }
//             }
//         }

//         return dst;
//     }


//     //声明一个类utils
//     // Export utils
//     Sortable.utils = {
//         on: _on,
//         off: _off,
//         css: _css,
//         find: _find,
//         is: function (el, selector) {

//             return !!_closest(el, selector, el);
//         },
//         extend: _extend,
//         throttle: _throttle,
//         closest: _closest,
//         toggleClass: _toggleClass,
//         index: _index
//     };


//     /**
//     * Create sortable instance
//     * @param {HTMLElement} el
//     * @param {Object} [options]
//     */
//     /***********************************************************************************************
//     *函数名 ：Sortable.create
//     *函数功能描述 ：在类Sortable中添加多个一个方法，而调用Sortable构造函数实例化给Sortable.create 属性,创建了拖拽功能 
//     *函数参数 ： 
//      el：类型：obj，拖拽列表的dom节点
//      options：类型：obj，拖拽的参数
//     *函数返回值 ： dst 子类
//     *作者 ： 
//     *函数创建日期 ：
//     *函数修改日期 ：
//     *修改人 ：
//     *修改原因 ：
//     *版本 ：
//     *历史版本 ：
//     ***********************************************************************************************/

//     Sortable.create = function (el, options) {
//         return new Sortable(el, options);
//     };


//     // Export
//     Sortable.version = '1.4.2'; //版本

//     return Sortable;
// });



















/**!
 * Sortable 1.10.0
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Sortable = factory());
  }(this, function () { 'use strict';
  
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }
  
      return _typeof(obj);
    }
  
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
  
      return obj;
    }
  
    function _extends() {
      _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
  
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
  
        return target;
      };
  
      return _extends.apply(this, arguments);
    }
  
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
  
        if (typeof Object.getOwnPropertySymbols === 'function') {
          ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
            return Object.getOwnPropertyDescriptor(source, sym).enumerable;
          }));
        }
  
        ownKeys.forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      }
  
      return target;
    }
  
    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;
  
      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }
  
      return target;
    }
  
    function _objectWithoutProperties(source, excluded) {
      if (source == null) return {};
  
      var target = _objectWithoutPropertiesLoose(source, excluded);
  
      var key, i;
  
      if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
  
        for (i = 0; i < sourceSymbolKeys.length; i++) {
          key = sourceSymbolKeys[i];
          if (excluded.indexOf(key) >= 0) continue;
          if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
          target[key] = source[key];
        }
      }
  
      return target;
    }
  
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
    }
  
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
  
        return arr2;
      }
    }
  
    function _iterableToArray(iter) {
      if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
    }
  
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance");
    }
  
    var version = "1.10.0";
  
    function userAgent(pattern) {
      return !!
      /*@__PURE__*/
      navigator.userAgent.match(pattern);
    }
  
    var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
    var Edge = userAgent(/Edge/i);
    var FireFox = userAgent(/firefox/i);
    var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
    var IOS = userAgent(/iP(ad|od|hone)/i);
    var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
  
    var captureMode = {
      capture: false,
      passive: false
    };
  
    function on(el, event, fn) {
      el.addEventListener(event, fn, !IE11OrLess && captureMode);
    }
  
    function off(el, event, fn) {
      el.removeEventListener(event, fn, !IE11OrLess && captureMode);
    }
  
    function matches(
    /**HTMLElement*/
    el,
    /**String*/
    selector) {
      if (!selector) return;
      selector[0] === '>' && (selector = selector.substring(1));
  
      if (el) {
        try {
          if (el.matches) {
            return el.matches(selector);
          } else if (el.msMatchesSelector) {
            return el.msMatchesSelector(selector);
          } else if (el.webkitMatchesSelector) {
            return el.webkitMatchesSelector(selector);
          }
        } catch (_) {
          return false;
        }
      }
  
      return false;
    }
  
    function getParentOrHost(el) {
      return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
    }
  
    function closest(
    /**HTMLElement*/
    el,
    /**String*/
    selector,
    /**HTMLElement*/
    ctx, includeCTX) {
      if (el) {
        ctx = ctx || document;
  
        do {
          if (selector != null && (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
            return el;
          }
  
          if (el === ctx) break;
          /* jshint boss:true */
        } while (el = getParentOrHost(el));
      }
  
      return null;
    }
  
    var R_SPACE = /\s+/g;
  
    function toggleClass(el, name, state) {
      if (el && name) {
        if (el.classList) {
          el.classList[state ? 'add' : 'remove'](name);
        } else {
          var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
          el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
        }
      }
    }
  
    function css(el, prop, val) {
      var style = el && el.style;
  
      if (style) {
        if (val === void 0) {
          if (document.defaultView && document.defaultView.getComputedStyle) {
            val = document.defaultView.getComputedStyle(el, '');
          } else if (el.currentStyle) {
            val = el.currentStyle;
          }
  
          return prop === void 0 ? val : val[prop];
        } else {
          if (!(prop in style) && prop.indexOf('webkit') === -1) {
            prop = '-webkit-' + prop;
          }
  
          style[prop] = val + (typeof val === 'string' ? '' : 'px');
        }
      }
    }
  
    function matrix(el, selfOnly) {
      var appliedTransforms = '';
  
      if (typeof el === 'string') {
        appliedTransforms = el;
      } else {
        do {
          var transform = css(el, 'transform');
  
          if (transform && transform !== 'none') {
            appliedTransforms = transform + ' ' + appliedTransforms;
          }
          /* jshint boss:true */
  
        } while (!selfOnly && (el = el.parentNode));
      }
  
      var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix;
      /*jshint -W056 */
  
      return matrixFn && new matrixFn(appliedTransforms);
    }
  
    function find(ctx, tagName, iterator) {
      if (ctx) {
        var list = ctx.getElementsByTagName(tagName),
            i = 0,
            n = list.length;
  
        if (iterator) {
          for (; i < n; i++) {
            iterator(list[i], i);
          }
        }
  
        return list;
      }
  
      return [];
    }
  
    function getWindowScrollingElement() {
      if (IE11OrLess) {
        return document.documentElement;
      } else {
        return document.scrollingElement;
      }
    }
    /**
     * Returns the "bounding client rect" of given element
     * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
     * @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
     * @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
     * @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
     * @param  {[HTMLElement]} container              The parent the element will be placed in
     * @return {Object}                               The boundingClientRect of el, with specified adjustments
     */
  
  
    function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
      if (!el.getBoundingClientRect && el !== window) return;
      var elRect, top, left, bottom, right, height, width;
  
      if (el !== window && el !== getWindowScrollingElement()) {
        elRect = el.getBoundingClientRect();
        top = elRect.top;
        left = elRect.left;
        bottom = elRect.bottom;
        right = elRect.right;
        height = elRect.height;
        width = elRect.width;
      } else {
        top = 0;
        left = 0;
        bottom = window.innerHeight;
        right = window.innerWidth;
        height = window.innerHeight;
        width = window.innerWidth;
      }
  
      if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
        // Adjust for translate()
        container = container || el.parentNode; // solves #1123 (see: https://stackoverflow.com/a/37953806/6088312)
        // Not needed on <= IE11
  
        if (!IE11OrLess) {
          do {
            if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || relativeToNonStaticParent && css(container, 'position') !== 'static')) {
              var containerRect = container.getBoundingClientRect(); // Set relative to edges of padding box of container
  
              top -= containerRect.top + parseInt(css(container, 'border-top-width'));
              left -= containerRect.left + parseInt(css(container, 'border-left-width'));
              bottom = top + elRect.height;
              right = left + elRect.width;
              break;
            }
            /* jshint boss:true */
  
          } while (container = container.parentNode);
        }
      }
  
      if (undoScale && el !== window) {
        // Adjust for scale()
        var elMatrix = matrix(container || el),
            scaleX = elMatrix && elMatrix.a,
            scaleY = elMatrix && elMatrix.d;
  
        if (elMatrix) {
          top /= scaleY;
          left /= scaleX;
          width /= scaleX;
          height /= scaleY;
          bottom = top + height;
          right = left + width;
        }
      }
  
      return {
        top: top,
        left: left,
        bottom: bottom,
        right: right,
        width: width,
        height: height
      };
    }
    /**
     * Checks if a side of an element is scrolled past a side of its parents
     * @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
     * @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
     * @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
     * @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
     */
  
  
    function isScrolledPast(el, elSide, parentSide) {
      var parent = getParentAutoScrollElement(el, true),
          elSideVal = getRect(el)[elSide];
      /* jshint boss:true */
  
      while (parent) {
        var parentSideVal = getRect(parent)[parentSide],
            visible = void 0;
  
        if (parentSide === 'top' || parentSide === 'left') {
          visible = elSideVal >= parentSideVal;
        } else {
          visible = elSideVal <= parentSideVal;
        }
  
        if (!visible) return parent;
        if (parent === getWindowScrollingElement()) break;
        parent = getParentAutoScrollElement(parent, false);
      }
  
      return false;
    }
    /**
     * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
     * and non-draggable elements
     * @param  {HTMLElement} el       The parent element
     * @param  {Number} childNum      The index of the child
     * @param  {Object} options       Parent Sortable's options
     * @return {HTMLElement}          The child at index childNum, or null if not found
     */
  
  
    function getChild(el, childNum, options) {
      var currentChild = 0,
          i = 0,
          children = el.children;
  
      while (i < children.length) {
        if (children[i].style.display !== 'none' && children[i] !== Sortable.ghost && children[i] !== Sortable.dragged && closest(children[i], options.draggable, el, false)) {
          if (currentChild === childNum) {
            return children[i];
          }
  
          currentChild++;
        }
  
        i++;
      }
  
      return null;
    }
    /**
     * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
     * @param  {HTMLElement} el       Parent element
     * @param  {selector} selector    Any other elements that should be ignored
     * @return {HTMLElement}          The last child, ignoring ghostEl
     */
  
  
    function lastChild(el, selector) {
      var last = el.lastElementChild;
  
      while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
        last = last.previousElementSibling;
      }
  
      return last || null;
    }
    /**
     * Returns the index of an element within its parent for a selected set of
     * elements
     * @param  {HTMLElement} el
     * @param  {selector} selector
     * @return {number}
     */
  
  
    function index(el, selector) {
      var index = 0;
  
      if (!el || !el.parentNode) {
        return -1;
      }
      /* jshint boss:true */
  
  
      while (el = el.previousElementSibling) {
        if (el.nodeName.toUpperCase() !== 'TEMPLATE' && el !== Sortable.clone && (!selector || matches(el, selector))) {
          index++;
        }
      }
  
      return index;
    }
    /**
     * Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
     * The value is returned in real pixels.
     * @param  {HTMLElement} el
     * @return {Array}             Offsets in the format of [left, top]
     */
  
  
    function getRelativeScrollOffset(el) {
      var offsetLeft = 0,
          offsetTop = 0,
          winScroller = getWindowScrollingElement();
  
      if (el) {
        do {
          var elMatrix = matrix(el),
              scaleX = elMatrix.a,
              scaleY = elMatrix.d;
          offsetLeft += el.scrollLeft * scaleX;
          offsetTop += el.scrollTop * scaleY;
        } while (el !== winScroller && (el = el.parentNode));
      }
  
      return [offsetLeft, offsetTop];
    }
    /**
     * Returns the index of the object within the given array
     * @param  {Array} arr   Array that may or may not hold the object
     * @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
     * @return {Number}      The index of the object in the array, or -1
     */
  
  
    function indexOfObject(arr, obj) {
      for (var i in arr) {
        if (!arr.hasOwnProperty(i)) continue;
  
        for (var key in obj) {
          if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
        }
      }
  
      return -1;
    }
  
    function getParentAutoScrollElement(el, includeSelf) {
      // skip to window
      if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
      var elem = el;
      var gotSelf = false;
  
      do {
        // we don't need to get elem css if it isn't even overflowing in the first place (performance)
        if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
          var elemCSS = css(elem);
  
          if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
            if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
            if (gotSelf || includeSelf) return elem;
            gotSelf = true;
          }
        }
        /* jshint boss:true */
  
      } while (elem = elem.parentNode);
  
      return getWindowScrollingElement();
    }
  
    function extend(dst, src) {
      if (dst && src) {
        for (var key in src) {
          if (src.hasOwnProperty(key)) {
            dst[key] = src[key];
          }
        }
      }
  
      return dst;
    }
  
    function isRectEqual(rect1, rect2) {
      return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
    }
  
    var _throttleTimeout;
  
    function throttle(callback, ms) {
      return function () {
        if (!_throttleTimeout) {
          var args = arguments,
              _this = this;
  
          if (args.length === 1) {
            callback.call(_this, args[0]);
          } else {
            callback.apply(_this, args);
          }
  
          _throttleTimeout = setTimeout(function () {
            _throttleTimeout = void 0;
          }, ms);
        }
      };
    }
  
    function cancelThrottle() {
      clearTimeout(_throttleTimeout);
      _throttleTimeout = void 0;
    }
  
    function scrollBy(el, x, y) {
      el.scrollLeft += x;
      el.scrollTop += y;
    }
  
    function clone(el) {
      var Polymer = window.Polymer;
      var $ = window.jQuery || window.Zepto;
  
      if (Polymer && Polymer.dom) {
        return Polymer.dom(el).cloneNode(true);
      } else if ($) {
        return $(el).clone(true)[0];
      } else {
        return el.cloneNode(true);
      }
    }
  
    function setRect(el, rect) {
      css(el, 'position', 'absolute');
      css(el, 'top', rect.top);
      css(el, 'left', rect.left);
      css(el, 'width', rect.width);
      css(el, 'height', rect.height);
    }
  
    function unsetRect(el) {
      css(el, 'position', '');
      css(el, 'top', '');
      css(el, 'left', '');
      css(el, 'width', '');
      css(el, 'height', '');
    }
  
    var expando = 'Sortable' + new Date().getTime();
  
    function AnimationStateManager() {
      var animationStates = [],
          animationCallbackId;
      return {
        captureAnimationState: function captureAnimationState() {
          animationStates = [];
          if (!this.options.animation) return;
          var children = [].slice.call(this.el.children);
          children.forEach(function (child) {
            if (css(child, 'display') === 'none' || child === Sortable.ghost) return;
            animationStates.push({
              target: child,
              rect: getRect(child)
            });
  
            var fromRect = _objectSpread({}, animationStates[animationStates.length - 1].rect); // If animating: compensate for current animation
  
  
            if (child.thisAnimationDuration) {
              var childMatrix = matrix(child, true);
  
              if (childMatrix) {
                fromRect.top -= childMatrix.f;
                fromRect.left -= childMatrix.e;
              }
            }
  
            child.fromRect = fromRect;
          });
        },
        addAnimationState: function addAnimationState(state) {
          animationStates.push(state);
        },
        removeAnimationState: function removeAnimationState(target) {
          animationStates.splice(indexOfObject(animationStates, {
            target: target
          }), 1);
        },
        animateAll: function animateAll(callback) {
          var _this = this;
  
          if (!this.options.animation) {
            clearTimeout(animationCallbackId);
            if (typeof callback === 'function') callback();
            return;
          }
  
          var animating = false,
              animationTime = 0;
          animationStates.forEach(function (state) {
            var time = 0,
                target = state.target,
                fromRect = target.fromRect,
                toRect = getRect(target),
                prevFromRect = target.prevFromRect,
                prevToRect = target.prevToRect,
                animatingRect = state.rect,
                targetMatrix = matrix(target, true);
  
            if (targetMatrix) {
              // Compensate for current animation
              toRect.top -= targetMatrix.f;
              toRect.left -= targetMatrix.e;
            }
  
            target.toRect = toRect;
  
            if (target.thisAnimationDuration) {
              // Could also check if animatingRect is between fromRect and toRect
              if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
              (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
                // If returning to same place as started from animation and on same axis
                time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
              }
            } // if fromRect != toRect: animate
  
  
            if (!isRectEqual(toRect, fromRect)) {
              target.prevFromRect = fromRect;
              target.prevToRect = toRect;
  
              if (!time) {
                time = _this.options.animation;
              }
  
              _this.animate(target, animatingRect, toRect, time);
            }
  
            if (time) {
              animating = true;
              animationTime = Math.max(animationTime, time);
              clearTimeout(target.animationResetTimer);
              target.animationResetTimer = setTimeout(function () {
                target.animationTime = 0;
                target.prevFromRect = null;
                target.fromRect = null;
                target.prevToRect = null;
                target.thisAnimationDuration = null;
              }, time);
              target.thisAnimationDuration = time;
            }
          });
          clearTimeout(animationCallbackId);
  
          if (!animating) {
            if (typeof callback === 'function') callback();
          } else {
            animationCallbackId = setTimeout(function () {
              if (typeof callback === 'function') callback();
            }, animationTime);
          }
  
          animationStates = [];
        },
        animate: function animate(target, currentRect, toRect, duration) {
          if (duration) {
            css(target, 'transition', '');
            css(target, 'transform', '');
            var elMatrix = matrix(this.el),
                scaleX = elMatrix && elMatrix.a,
                scaleY = elMatrix && elMatrix.d,
                translateX = (currentRect.left - toRect.left) / (scaleX || 1),
                translateY = (currentRect.top - toRect.top) / (scaleY || 1);
            target.animatingX = !!translateX;
            target.animatingY = !!translateY;
            css(target, 'transform', 'translate3d(' + translateX + 'px,' + translateY + 'px,0)');
            repaint(target); // repaint
  
            css(target, 'transition', 'transform ' + duration + 'ms' + (this.options.easing ? ' ' + this.options.easing : ''));
            css(target, 'transform', 'translate3d(0,0,0)');
            typeof target.animated === 'number' && clearTimeout(target.animated);
            target.animated = setTimeout(function () {
              css(target, 'transition', '');
              css(target, 'transform', '');
              target.animated = false;
              target.animatingX = false;
              target.animatingY = false;
            }, duration);
          }
        }
      };
    }
  
    function repaint(target) {
      return target.offsetWidth;
    }
  
    function calculateRealTime(animatingRect, fromRect, toRect, options) {
      return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
    }
  
    var plugins = [];
    var defaults = {
      initializeByDefault: true
    };
    var PluginManager = {
      mount: function mount(plugin) {
        // Set default static properties
        for (var option in defaults) {
          if (defaults.hasOwnProperty(option) && !(option in plugin)) {
            plugin[option] = defaults[option];
          }
        }
  
        plugins.push(plugin);
      },
      pluginEvent: function pluginEvent(eventName, sortable, evt) {
        var _this = this;
  
        this.eventCanceled = false;
  
        evt.cancel = function () {
          _this.eventCanceled = true;
        };
  
        var eventNameGlobal = eventName + 'Global';
        plugins.forEach(function (plugin) {
          if (!sortable[plugin.pluginName]) return; // Fire global events if it exists in this sortable
  
          if (sortable[plugin.pluginName][eventNameGlobal]) {
            sortable[plugin.pluginName][eventNameGlobal](_objectSpread({
              sortable: sortable
            }, evt));
          } // Only fire plugin event if plugin is enabled in this sortable,
          // and plugin has event defined
  
  
          if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
            sortable[plugin.pluginName][eventName](_objectSpread({
              sortable: sortable
            }, evt));
          }
        });
      },
      initializePlugins: function initializePlugins(sortable, el, defaults, options) {
        plugins.forEach(function (plugin) {
          var pluginName = plugin.pluginName;
          if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
          var initialized = new plugin(sortable, el, sortable.options);
          initialized.sortable = sortable;
          initialized.options = sortable.options;
          sortable[pluginName] = initialized; // Add default options from plugin
  
          _extends(defaults, initialized.defaults);
        });
  
        for (var option in sortable.options) {
          if (!sortable.options.hasOwnProperty(option)) continue;
          var modified = this.modifyOption(sortable, option, sortable.options[option]);
  
          if (typeof modified !== 'undefined') {
            sortable.options[option] = modified;
          }
        }
      },
      getEventProperties: function getEventProperties(name, sortable) {
        var eventProperties = {};
        plugins.forEach(function (plugin) {
          if (typeof plugin.eventProperties !== 'function') return;
  
          _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
        });
        return eventProperties;
      },
      modifyOption: function modifyOption(sortable, name, value) {
        var modifiedValue;
        plugins.forEach(function (plugin) {
          // Plugin must exist on the Sortable
          if (!sortable[plugin.pluginName]) return; // If static option listener exists for this option, call in the context of the Sortable's instance of this plugin
  
          if (plugin.optionListeners && typeof plugin.optionListeners[name] === 'function') {
            modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
          }
        });
        return modifiedValue;
      }
    };
  
    function dispatchEvent(_ref) {
      var sortable = _ref.sortable,
          rootEl = _ref.rootEl,
          name = _ref.name,
          targetEl = _ref.targetEl,
          cloneEl = _ref.cloneEl,
          toEl = _ref.toEl,
          fromEl = _ref.fromEl,
          oldIndex = _ref.oldIndex,
          newIndex = _ref.newIndex,
          oldDraggableIndex = _ref.oldDraggableIndex,
          newDraggableIndex = _ref.newDraggableIndex,
          originalEvent = _ref.originalEvent,
          putSortable = _ref.putSortable,
          extraEventProperties = _ref.extraEventProperties;
      sortable = sortable || rootEl && rootEl[expando];
      if (!sortable) return;
      var evt,
          options = sortable.options,
          onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1); // Support for new CustomEvent feature
  
      if (window.CustomEvent && !IE11OrLess && !Edge) {
        evt = new CustomEvent(name, {
          bubbles: true,
          cancelable: true
        });
      } else {
        evt = document.createEvent('Event');
        evt.initEvent(name, true, true);
      }
  
      evt.to = toEl || rootEl;
      evt.from = fromEl || rootEl;
      evt.item = targetEl || rootEl;
      evt.clone = cloneEl;
      evt.oldIndex = oldIndex;
      evt.newIndex = newIndex;
      evt.oldDraggableIndex = oldDraggableIndex;
      evt.newDraggableIndex = newDraggableIndex;
      evt.originalEvent = originalEvent;
      evt.pullMode = putSortable ? putSortable.lastPutMode : undefined;
  
      var allEventProperties = _objectSpread({}, extraEventProperties, PluginManager.getEventProperties(name, sortable));
  
      for (var option in allEventProperties) {
        evt[option] = allEventProperties[option];
      }
  
      if (rootEl) {
        rootEl.dispatchEvent(evt);
      }
  
      if (options[onName]) {
        options[onName].call(sortable, evt);
      }
    }
  
    var pluginEvent = function pluginEvent(eventName, sortable) {
      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          originalEvent = _ref.evt,
          data = _objectWithoutProperties(_ref, ["evt"]);
  
      PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread({
        dragEl: dragEl,
        parentEl: parentEl,
        ghostEl: ghostEl,
        rootEl: rootEl,
        nextEl: nextEl,
        lastDownEl: lastDownEl,
        cloneEl: cloneEl,
        cloneHidden: cloneHidden,
        dragStarted: moved,
        putSortable: putSortable,
        activeSortable: Sortable.active,
        originalEvent: originalEvent,
        oldIndex: oldIndex,
        oldDraggableIndex: oldDraggableIndex,
        newIndex: newIndex,
        newDraggableIndex: newDraggableIndex,
        hideGhostForTarget: _hideGhostForTarget,
        unhideGhostForTarget: _unhideGhostForTarget,
        cloneNowHidden: function cloneNowHidden() {
          cloneHidden = true;
        },
        cloneNowShown: function cloneNowShown() {
          cloneHidden = false;
        },
        dispatchSortableEvent: function dispatchSortableEvent(name) {
          _dispatchEvent({
            sortable: sortable,
            name: name,
            originalEvent: originalEvent
          });
        }
      }, data));
    };
  
    function _dispatchEvent(info) {
      dispatchEvent(_objectSpread({
        putSortable: putSortable,
        cloneEl: cloneEl,
        targetEl: dragEl,
        rootEl: rootEl,
        oldIndex: oldIndex,
        oldDraggableIndex: oldDraggableIndex,
        newIndex: newIndex,
        newDraggableIndex: newDraggableIndex
      }, info));
    }
  
    if (typeof window === "undefined" || !window.document) {
      throw new Error("Sortable.js requires a window with a document");
    }
  
    var dragEl,
        parentEl,
        ghostEl,
        rootEl,
        nextEl,
        lastDownEl,
        cloneEl,
        cloneHidden,
        oldIndex,
        newIndex,
        oldDraggableIndex,
        newDraggableIndex,
        activeGroup,
        putSortable,
        awaitingDragStarted = false,
        ignoreNextClick = false,
        sortables = [],
        tapEvt,
        touchEvt,
        lastDx,
        lastDy,
        tapDistanceLeft,
        tapDistanceTop,
        moved,
        lastTarget,
        lastDirection,
        pastFirstInvertThresh = false,
        isCircumstantialInvert = false,
        targetMoveDistance,
        // For positioning ghost absolutely
    ghostRelativeParent,
        ghostRelativeParentInitialScroll = [],
        // (left, top)
    _silent = false,
        savedInputChecked = [];
    /** @const */
  
    var PositionGhostAbsolutely = IOS,
        CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float',
        // This will not pass for IE9, because IE9 DnD only works on anchors
    supportDraggable = !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div'),
        supportCssPointerEvents = function () {
      // false when <= IE11
      if (IE11OrLess) {
        return false;
      }
  
      var el = document.createElement('x');
      el.style.cssText = 'pointer-events:auto';
      return el.style.pointerEvents === 'auto';
    }(),
        _detectDirection = function _detectDirection(el, options) {
      var elCSS = css(el),
          elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth),
          child1 = getChild(el, 0, options),
          child2 = getChild(el, 1, options),
          firstChildCSS = child1 && css(child1),
          secondChildCSS = child2 && css(child2),
          firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width,
          secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
  
      if (elCSS.display === 'flex') {
        return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
      }
  
      if (elCSS.display === 'grid') {
        return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
      }
  
      if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== 'none') {
        var touchingSideChild2 = firstChildCSS["float"] === 'left' ? 'left' : 'right';
        return child2 && (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2) ? 'vertical' : 'horizontal';
      }
  
      return child1 && (firstChildCSS.display === 'block' || firstChildCSS.display === 'flex' || firstChildCSS.display === 'table' || firstChildCSS.display === 'grid' || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none' || child2 && elCSS[CSSFloatProperty] === 'none' && firstChildWidth + secondChildWidth > elWidth) ? 'vertical' : 'horizontal';
    },
        _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
      var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
          dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
          dragElOppLength = vertical ? dragRect.width : dragRect.height,
          targetS1Opp = vertical ? targetRect.left : targetRect.top,
          targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
          targetOppLength = vertical ? targetRect.width : targetRect.height;
      return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
    },
  
    /**
     * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
     * @param  {Number} x      X position
     * @param  {Number} y      Y position
     * @return {HTMLElement}   Element of the first found nearest Sortable
     */
    _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
      var ret;
      sortables.some(function (sortable) {
        if (lastChild(sortable)) return;
        var rect = getRect(sortable),
            threshold = sortable[expando].options.emptyInsertThreshold,
            insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
            insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
  
        if (threshold && insideHorizontally && insideVertically) {
          return ret = sortable;
        }
      });
      return ret;
    },
        _prepareGroup = function _prepareGroup(options) {
      function toFn(value, pull) {
        return function (to, from, dragEl, evt) {
          var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
  
          if (value == null && (pull || sameGroup)) {
            // Default pull value
            // Default pull and put value if same group
            return true;
          } else if (value == null || value === false) {
            return false;
          } else if (pull && value === 'clone') {
            return value;
          } else if (typeof value === 'function') {
            return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt);
          } else {
            var otherGroup = (pull ? to : from).options.group.name;
            return value === true || typeof value === 'string' && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
          }
        };
      }
  
      var group = {};
      var originalGroup = options.group;
  
      if (!originalGroup || _typeof(originalGroup) != 'object') {
        originalGroup = {
          name: originalGroup
        };
      }
  
      group.name = originalGroup.name;
      group.checkPull = toFn(originalGroup.pull, true);
      group.checkPut = toFn(originalGroup.put);
      group.revertClone = originalGroup.revertClone;
      options.group = group;
    },
        _hideGhostForTarget = function _hideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', 'none');
      }
    },
        _unhideGhostForTarget = function _unhideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', '');
      }
    }; // #1184 fix - Prevent click event on fallback if dragged but item not changed position
  
  
    document.addEventListener('click', function (evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  
    var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
      if (dragEl) {
        evt = evt.touches ? evt.touches[0] : evt;
  
        var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
  
        if (nearest) {
          // Create imitation event
          var event = {};
  
          for (var i in evt) {
            if (evt.hasOwnProperty(i)) {
              event[i] = evt[i];
            }
          }
  
          event.target = event.rootEl = nearest;
          event.preventDefault = void 0;
          event.stopPropagation = void 0;
  
          nearest[expando]._onDragOver(event);
        }
      }
    };
  
    var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
      if (dragEl) {
        dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
      }
    };
    /**
     * @class  Sortable
     * @param  {HTMLElement}  el
     * @param  {Object}       [options]
     */
  
  
    function Sortable(el, options) {
      if (!(el && el.nodeType && el.nodeType === 1)) {
        throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
      }
  
      this.el = el; // root element
  
      this.options = options = _extends({}, options); // Export instance
  
      el[expando] = this;
      var defaults = {
        group: null,
        sort: true,
        disabled: false,
        store: null,
        handle: null,
        draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
        swapThreshold: 1,
        // percentage; 0 <= x <= 1
        invertSwap: false,
        // invert always
        invertedSwapThreshold: null,
        // will be set to same as swapThreshold if default
        removeCloneOnHide: true,
        direction: function direction() {
          return _detectDirection(el, this.options);
        },
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        ignore: 'a, img',
        filter: null,
        preventOnFilter: true,
        animation: 0,
        easing: null,
        setData: function setData(dataTransfer, dragEl) {
          dataTransfer.setData('Text', dragEl.textContent);
        },
        dropBubble: false,
        dragoverBubble: false,
        dataIdAttr: 'data-id',
        delay: 0,
        delayOnTouchOnly: false,
        touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
        forceFallback: false,
        fallbackClass: 'sortable-fallback',
        fallbackOnBody: false,
        fallbackTolerance: 0,
        fallbackOffset: {
          x: 0,
          y: 0
        },
        supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window,
        emptyInsertThreshold: 5
      };
      PluginManager.initializePlugins(this, el, defaults); // Set default options
  
      for (var name in defaults) {
        !(name in options) && (options[name] = defaults[name]);
      }
  
      _prepareGroup(options); // Bind all private methods
  
  
      for (var fn in this) {
        if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
          this[fn] = this[fn].bind(this);
        }
      } // Setup drag mode
  
  
      this.nativeDraggable = options.forceFallback ? false : supportDraggable;
  
      if (this.nativeDraggable) {
        // Touch start threshold cannot be greater than the native dragstart threshold
        this.options.touchStartThreshold = 1;
      } // Bind events
  
  
      if (options.supportPointer) {
        on(el, 'pointerdown', this._onTapStart);
      } else {
        on(el, 'mousedown', this._onTapStart);
        on(el, 'touchstart', this._onTapStart);
      }
  
      if (this.nativeDraggable) {
        on(el, 'dragover', this);
        on(el, 'dragenter', this);
      }
  
      sortables.push(this.el); // Restore sorting
  
      options.store && options.store.get && this.sort(options.store.get(this) || []); // Add animation state manager
  
      _extends(this, AnimationStateManager());
    }
  
    Sortable.prototype =
    /** @lends Sortable.prototype */
    {
      constructor: Sortable,
      _isOutsideThisEl: function _isOutsideThisEl(target) {
        if (!this.el.contains(target) && target !== this.el) {
          lastTarget = null;
        }
      },
      _getDirection: function _getDirection(evt, target) {
        return typeof this.options.direction === 'function' ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
      },
      _onTapStart: function _onTapStart(
      /** Event|TouchEvent */
      evt) {
        if (!evt.cancelable) return;
  
        var _this = this,
            el = this.el,
            options = this.options,
            preventOnFilter = options.preventOnFilter,
            type = evt.type,
            touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt,
            target = (touch || evt).target,
            originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target,
            filter = options.filter;
  
        _saveInputCheckedState(el); // Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.
  
  
        if (dragEl) {
          return;
        }
  
        if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
          return; // only left button and enabled
        } // cancel dnd if original target is content editable
  
  
        if (originalTarget.isContentEditable) {
          return;
        }
  
        target = closest(target, options.draggable, el, false);
  
        if (target && target.animated) {
          return;
        }
  
        if (lastDownEl === target) {
          // Ignoring duplicate `down`
          return;
        } // Get the index of the dragged element within its parent
  
  
        oldIndex = index(target);
        oldDraggableIndex = index(target, options.draggable); // Check filter
  
        if (typeof filter === 'function') {
          if (filter.call(this, evt, target, this)) {
            _dispatchEvent({
              sortable: _this,
              rootEl: originalTarget,
              name: 'filter',
              targetEl: target,
              toEl: el,
              fromEl: el
            });
  
            pluginEvent('filter', _this, {
              evt: evt
            });
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return; // cancel dnd
          }
        } else if (filter) {
          filter = filter.split(',').some(function (criteria) {
            criteria = closest(originalTarget, criteria.trim(), el, false);
  
            if (criteria) {
              _dispatchEvent({
                sortable: _this,
                rootEl: criteria,
                name: 'filter',
                targetEl: target,
                fromEl: el,
                toEl: el
              });
  
              pluginEvent('filter', _this, {
                evt: evt
              });
              return true;
            }
          });
  
          if (filter) {
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return; // cancel dnd
          }
        }
  
        if (options.handle && !closest(originalTarget, options.handle, el, false)) {
          return;
        } // Prepare `dragstart`
  
  
        this._prepareDragStart(evt, touch, target);
      },
      _prepareDragStart: function _prepareDragStart(
      /** Event */
      evt,
      /** Touch */
      touch,
      /** HTMLElement */
      target) {
        var _this = this,
            el = _this.el,
            options = _this.options,
            ownerDocument = el.ownerDocument,
            dragStartFn;
  
        if (target && !dragEl && target.parentNode === el) {
          var dragRect = getRect(target);
          rootEl = el;
          dragEl = target;
          parentEl = dragEl.parentNode;
          nextEl = dragEl.nextSibling;
          lastDownEl = target;
          activeGroup = options.group;
          Sortable.dragged = dragEl;
          tapEvt = {
            target: dragEl,
            clientX: (touch || evt).clientX,
            clientY: (touch || evt).clientY
          };
          tapDistanceLeft = tapEvt.clientX - dragRect.left;
          tapDistanceTop = tapEvt.clientY - dragRect.top;
          this._lastX = (touch || evt).clientX;
          this._lastY = (touch || evt).clientY;
          dragEl.style['will-change'] = 'all';
  
          dragStartFn = function dragStartFn() {
            pluginEvent('delayEnded', _this, {
              evt: evt
            });
  
            if (Sortable.eventCanceled) {
              _this._onDrop();
  
              return;
            } // Delayed drag has been triggered
            // we can re-enable the events: touchmove/mousemove
  
  
            _this._disableDelayedDragEvents();
  
            if (!FireFox && _this.nativeDraggable) {
              dragEl.draggable = true;
            } // Bind the events: dragstart/dragend
  
  
            _this._triggerDragStart(evt, touch); // Drag start event
  
  
            _dispatchEvent({
              sortable: _this,
              name: 'choose',
              originalEvent: evt
            }); // Chosen item
  
  
            toggleClass(dragEl, options.chosenClass, true);
          }; // Disable "draggable"
  
  
          options.ignore.split(',').forEach(function (criteria) {
            find(dragEl, criteria.trim(), _disableDraggable);
          });
          on(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
          on(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
          on(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
          on(ownerDocument, 'mouseup', _this._onDrop);
          on(ownerDocument, 'touchend', _this._onDrop);
          on(ownerDocument, 'touchcancel', _this._onDrop); // Make dragEl draggable (must be before delay for FireFox)
  
          if (FireFox && this.nativeDraggable) {
            this.options.touchStartThreshold = 4;
            dragEl.draggable = true;
          }
  
          pluginEvent('delayStart', this, {
            evt: evt
          }); // Delay is impossible for native DnD in Edge or IE
  
          if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
            if (Sortable.eventCanceled) {
              this._onDrop();
  
              return;
            } // If the user moves the pointer or let go the click or touch
            // before the delay has been reached:
            // disable the delayed drag
  
  
            on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
            on(ownerDocument, 'touchend', _this._disableDelayedDrag);
            on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
            on(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
            on(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
            options.supportPointer && on(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
            _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
          } else {
            dragStartFn();
          }
        }
      },
      _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(
      /** TouchEvent|PointerEvent **/
      e) {
        var touch = e.touches ? e.touches[0] : e;
  
        if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
          this._disableDelayedDrag();
        }
      },
      _disableDelayedDrag: function _disableDelayedDrag() {
        dragEl && _disableDraggable(dragEl);
        clearTimeout(this._dragStartTimer);
  
        this._disableDelayedDragEvents();
      },
      _disableDelayedDragEvents: function _disableDelayedDragEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, 'mouseup', this._disableDelayedDrag);
        off(ownerDocument, 'touchend', this._disableDelayedDrag);
        off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
        off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
        off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
        off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
      },
      _triggerDragStart: function _triggerDragStart(
      /** Event */
      evt,
      /** Touch */
      touch) {
        touch = touch || evt.pointerType == 'touch' && evt;
  
        if (!this.nativeDraggable || touch) {
          if (this.options.supportPointer) {
            on(document, 'pointermove', this._onTouchMove);
          } else if (touch) {
            on(document, 'touchmove', this._onTouchMove);
          } else {
            on(document, 'mousemove', this._onTouchMove);
          }
        } else {
          on(dragEl, 'dragend', this);
          on(rootEl, 'dragstart', this._onDragStart);
        }
  
        try {
          if (document.selection) {
            // Timeout neccessary for IE9
            _nextTick(function () {
              document.selection.empty();
            });
          } else {
            window.getSelection().removeAllRanges();
          }
        } catch (err) {}
      },
      _dragStarted: function _dragStarted(fallback, evt) {
  
        awaitingDragStarted = false;
  
        if (rootEl && dragEl) {
          pluginEvent('dragStarted', this, {
            evt: evt
          });
  
          if (this.nativeDraggable) {
            on(document, 'dragover', _checkOutsideTargetEl);
          }
  
          var options = this.options; // Apply effect
  
          !fallback && toggleClass(dragEl, options.dragClass, false);
          toggleClass(dragEl, options.ghostClass, true);
          Sortable.active = this;
          fallback && this._appendGhost(); // Drag start event
  
          _dispatchEvent({
            sortable: this,
            name: 'start',
            originalEvent: evt
          });
        } else {
          this._nulling();
        }
      },
      _emulateDragOver: function _emulateDragOver() {
        if (touchEvt) {
          this._lastX = touchEvt.clientX;
          this._lastY = touchEvt.clientY;
  
          _hideGhostForTarget();
  
          var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          var parent = target;
  
          while (target && target.shadowRoot) {
            target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
            if (target === parent) break;
            parent = target;
          }
  
          dragEl.parentNode[expando]._isOutsideThisEl(target);
  
          if (parent) {
            do {
              if (parent[expando]) {
                var inserted = void 0;
                inserted = parent[expando]._onDragOver({
                  clientX: touchEvt.clientX,
                  clientY: touchEvt.clientY,
                  target: target,
                  rootEl: parent
                });
  
                if (inserted && !this.options.dragoverBubble) {
                  break;
                }
              }
  
              target = parent; // store last element
            }
            /* jshint boss:true */
            while (parent = parent.parentNode);
          }
  
          _unhideGhostForTarget();
        }
      },
      _onTouchMove: function _onTouchMove(
      /**TouchEvent*/
      evt) {
        if (tapEvt) {
          var options = this.options,
              fallbackTolerance = options.fallbackTolerance,
              fallbackOffset = options.fallbackOffset,
              touch = evt.touches ? evt.touches[0] : evt,
              ghostMatrix = ghostEl && matrix(ghostEl),
              scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
              scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
              relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent),
              dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1),
              dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1); // only set the status to dragging, when we are actually dragging
  
          if (!Sortable.active && !awaitingDragStarted) {
            if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
              return;
            }
  
            this._onDragStart(evt, true);
          }
  
          if (ghostEl) {
            if (ghostMatrix) {
              ghostMatrix.e += dx - (lastDx || 0);
              ghostMatrix.f += dy - (lastDy || 0);
            } else {
              ghostMatrix = {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: dx,
                f: dy
              };
            }
  
            var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
            css(ghostEl, 'webkitTransform', cssMatrix);
            css(ghostEl, 'mozTransform', cssMatrix);
            css(ghostEl, 'msTransform', cssMatrix);
            css(ghostEl, 'transform', cssMatrix);
            lastDx = dx;
            lastDy = dy;
            touchEvt = touch;
          }
  
          evt.cancelable && evt.preventDefault();
        }
      },
      _appendGhost: function _appendGhost() {
        // Bug if using scale(): https://stackoverflow.com/questions/2637058
        // Not being adjusted for
        if (!ghostEl) {
          var container = this.options.fallbackOnBody ? document.body : rootEl,
              rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
              options = this.options; // Position absolutely
  
          if (PositionGhostAbsolutely) {
            // Get relatively positioned parent
            ghostRelativeParent = container;
  
            while (css(ghostRelativeParent, 'position') === 'static' && css(ghostRelativeParent, 'transform') === 'none' && ghostRelativeParent !== document) {
              ghostRelativeParent = ghostRelativeParent.parentNode;
            }
  
            if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
              if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
              rect.top += ghostRelativeParent.scrollTop;
              rect.left += ghostRelativeParent.scrollLeft;
            } else {
              ghostRelativeParent = getWindowScrollingElement();
            }
  
            ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
          }
  
          ghostEl = dragEl.cloneNode(true);
          toggleClass(ghostEl, options.ghostClass, false);
          toggleClass(ghostEl, options.fallbackClass, true);
          toggleClass(ghostEl, options.dragClass, true);
          css(ghostEl, 'transition', '');
          css(ghostEl, 'transform', '');
          css(ghostEl, 'box-sizing', 'border-box');
          css(ghostEl, 'margin', 0);
          css(ghostEl, 'top', rect.top);
          css(ghostEl, 'left', rect.left);
          css(ghostEl, 'width', rect.width);
          css(ghostEl, 'height', rect.height);
          css(ghostEl, 'opacity', '0.8');
          css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
          css(ghostEl, 'zIndex', '100000');
          css(ghostEl, 'pointerEvents', 'none');
          Sortable.ghost = ghostEl;
          container.appendChild(ghostEl); // Set transform-origin
  
          css(ghostEl, 'transform-origin', tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + '% ' + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + '%');
        }
      },
      _onDragStart: function _onDragStart(
      /**Event*/
      evt,
      /**boolean*/
      fallback) {
        var _this = this;
  
        var dataTransfer = evt.dataTransfer;
        var options = _this.options;
        pluginEvent('dragStart', this, {
          evt: evt
        });
  
        if (Sortable.eventCanceled) {
          this._onDrop();
  
          return;
        }
  
        pluginEvent('setupClone', this);
  
        if (!Sortable.eventCanceled) {
          cloneEl = clone(dragEl);
          cloneEl.draggable = false;
          cloneEl.style['will-change'] = '';
  
          this._hideClone();
  
          toggleClass(cloneEl, this.options.chosenClass, false);
          Sortable.clone = cloneEl;
        } // #1143: IFrame support workaround
  
  
        _this.cloneId = _nextTick(function () {
          pluginEvent('clone', _this);
          if (Sortable.eventCanceled) return;
  
          if (!_this.options.removeCloneOnHide) {
            rootEl.insertBefore(cloneEl, dragEl);
          }
  
          _this._hideClone();
  
          _dispatchEvent({
            sortable: _this,
            name: 'clone'
          });
        });
        !fallback && toggleClass(dragEl, options.dragClass, true); // Set proper drop events
  
        if (fallback) {
          ignoreNextClick = true;
          _this._loopId = setInterval(_this._emulateDragOver, 50);
        } else {
          // Undo what was set in _prepareDragStart before drag started
          off(document, 'mouseup', _this._onDrop);
          off(document, 'touchend', _this._onDrop);
          off(document, 'touchcancel', _this._onDrop);
  
          if (dataTransfer) {
            dataTransfer.effectAllowed = 'move';
            options.setData && options.setData.call(_this, dataTransfer, dragEl);
          }
  
          on(document, 'drop', _this); // #1276 fix:
  
          css(dragEl, 'transform', 'translateZ(0)');
        }
  
        awaitingDragStarted = true;
        _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
        on(document, 'selectstart', _this);
        moved = true;
  
        if (Safari) {
          css(document.body, 'user-select', 'none');
        }
      },
      // Returns true - if no further action is needed (either inserted or another condition)
      _onDragOver: function _onDragOver(
      /**Event*/
      evt) {
        var el = this.el,
            target = evt.target,
            dragRect,
            targetRect,
            revert,
            options = this.options,
            group = options.group,
            activeSortable = Sortable.active,
            isOwner = activeGroup === group,
            canSort = options.sort,
            fromSortable = putSortable || activeSortable,
            vertical,
            _this = this,
            completedFired = false;
  
        if (_silent) return;
  
        function dragOverEvent(name, extra) {
          pluginEvent(name, _this, _objectSpread({
            evt: evt,
            isOwner: isOwner,
            axis: vertical ? 'vertical' : 'horizontal',
            revert: revert,
            dragRect: dragRect,
            targetRect: targetRect,
            canSort: canSort,
            fromSortable: fromSortable,
            target: target,
            completed: completed,
            onMove: function onMove(target, after) {
              return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after);
            },
            changed: changed
          }, extra));
        } // Capture animation state
  
  
        function capture() {
          dragOverEvent('dragOverAnimationCapture');
  
          _this.captureAnimationState();
  
          if (_this !== fromSortable) {
            fromSortable.captureAnimationState();
          }
        } // Return invocation when dragEl is inserted (or completed)
  
  
        function completed(insertion) {
          dragOverEvent('dragOverCompleted', {
            insertion: insertion
          });
  
          if (insertion) {
            // Clones must be hidden before folding animation to capture dragRectAbsolute properly
            if (isOwner) {
              activeSortable._hideClone();
            } else {
              activeSortable._showClone(_this);
            }
  
            if (_this !== fromSortable) {
              // Set ghost class to new sortable's ghost class
              toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
              toggleClass(dragEl, options.ghostClass, true);
            }
  
            if (putSortable !== _this && _this !== Sortable.active) {
              putSortable = _this;
            } else if (_this === Sortable.active && putSortable) {
              putSortable = null;
            } // Animation
  
  
            if (fromSortable === _this) {
              _this._ignoreWhileAnimating = target;
            }
  
            _this.animateAll(function () {
              dragOverEvent('dragOverAnimationComplete');
              _this._ignoreWhileAnimating = null;
            });
  
            if (_this !== fromSortable) {
              fromSortable.animateAll();
              fromSortable._ignoreWhileAnimating = null;
            }
          } // Null lastTarget if it is not inside a previously swapped element
  
  
          if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
            lastTarget = null;
          } // no bubbling and not fallback
  
  
          if (!options.dragoverBubble && !evt.rootEl && target !== document) {
            dragEl.parentNode[expando]._isOutsideThisEl(evt.target); // Do not detect for empty insert if already inserted
  
  
            !insertion && nearestEmptyInsertDetectEvent(evt);
          }
  
          !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
          return completedFired = true;
        } // Call when dragEl has been inserted
  
  
        function changed() {
          newIndex = index(dragEl);
          newDraggableIndex = index(dragEl, options.draggable);
  
          _dispatchEvent({
            sortable: _this,
            name: 'change',
            toEl: el,
            newIndex: newIndex,
            newDraggableIndex: newDraggableIndex,
            originalEvent: evt
          });
        }
  
        if (evt.preventDefault !== void 0) {
          evt.cancelable && evt.preventDefault();
        }
  
        target = closest(target, options.draggable, el, true);
        dragOverEvent('dragOver');
        if (Sortable.eventCanceled) return completedFired;
  
        if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
          return completed(false);
        }
  
        ignoreNextClick = false;
  
        if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
        : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
          vertical = this._getDirection(evt, target) === 'vertical';
          dragRect = getRect(dragEl);
          dragOverEvent('dragOverValid');
          if (Sortable.eventCanceled) return completedFired;
  
          if (revert) {
            parentEl = rootEl; // actualization
  
            capture();
  
            this._hideClone();
  
            dragOverEvent('revert');
  
            if (!Sortable.eventCanceled) {
              if (nextEl) {
                rootEl.insertBefore(dragEl, nextEl);
              } else {
                rootEl.appendChild(dragEl);
              }
            }
  
            return completed(true);
          }
  
          var elLastChild = lastChild(el, options.draggable);
  
          if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
            // If already at end of list: Do not insert
            if (elLastChild === dragEl) {
              return completed(false);
            } // assign target only if condition is true
  
  
            if (elLastChild && el === evt.target) {
              target = elLastChild;
            }
  
            if (target) {
              targetRect = getRect(target);
            }
  
            if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
              capture();
              el.appendChild(dragEl);
              parentEl = el; // actualization
  
              changed();
              return completed(true);
            }
          } else if (target.parentNode === el) {
            targetRect = getRect(target);
            var direction = 0,
                targetBeforeFirstSwap,
                differentLevel = dragEl.parentNode !== el,
                differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical),
                side1 = vertical ? 'top' : 'left',
                scrolledPastTop = isScrolledPast(target, 'top', 'top') || isScrolledPast(dragEl, 'top', 'top'),
                scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
  
            if (lastTarget !== target) {
              targetBeforeFirstSwap = targetRect[side1];
              pastFirstInvertThresh = false;
              isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
            }
  
            direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
            var sibling;
  
            if (direction !== 0) {
              // Check if target is beside dragEl in respective direction (ignoring hidden elements)
              var dragIndex = index(dragEl);
  
              do {
                dragIndex -= direction;
                sibling = parentEl.children[dragIndex];
              } while (sibling && (css(sibling, 'display') === 'none' || sibling === ghostEl));
            } // If dragEl is already beside target: Do not insert
  
  
            if (direction === 0 || sibling === target) {
              return completed(false);
            }
  
            lastTarget = target;
            lastDirection = direction;
            var nextSibling = target.nextElementSibling,
                after = false;
            after = direction === 1;
  
            var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
  
            if (moveVector !== false) {
              if (moveVector === 1 || moveVector === -1) {
                after = moveVector === 1;
              }
  
              _silent = true;
              setTimeout(_unsilent, 30);
              capture();
  
              if (after && !nextSibling) {
                el.appendChild(dragEl);
              } else {
                target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
              } // Undo chrome's scroll adjustment (has no effect on other browsers)
  
  
              if (scrolledPastTop) {
                scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
              }
  
              parentEl = dragEl.parentNode; // actualization
              // must be done before animation
  
              if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
                targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
              }
  
              changed();
              return completed(true);
            }
          }
  
          if (el.contains(dragEl)) {
            return completed(false);
          }
        }
  
        return false;
      },
      _ignoreWhileAnimating: null,
      _offMoveEvents: function _offMoveEvents() {
        off(document, 'mousemove', this._onTouchMove);
        off(document, 'touchmove', this._onTouchMove);
        off(document, 'pointermove', this._onTouchMove);
        off(document, 'dragover', nearestEmptyInsertDetectEvent);
        off(document, 'mousemove', nearestEmptyInsertDetectEvent);
        off(document, 'touchmove', nearestEmptyInsertDetectEvent);
      },
      _offUpEvents: function _offUpEvents() {
        var ownerDocument = this.el.ownerDocument;
        off(ownerDocument, 'mouseup', this._onDrop);
        off(ownerDocument, 'touchend', this._onDrop);
        off(ownerDocument, 'pointerup', this._onDrop);
        off(ownerDocument, 'touchcancel', this._onDrop);
        off(document, 'selectstart', this);
      },
      _onDrop: function _onDrop(
      /**Event*/
      evt) {
        var el = this.el,
            options = this.options; // Get the index of the dragged element within its parent
  
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        pluginEvent('drop', this, {
          evt: evt
        });
        parentEl = dragEl && dragEl.parentNode; // Get again after plugin event
  
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
  
        if (Sortable.eventCanceled) {
          this._nulling();
  
          return;
        }
  
        awaitingDragStarted = false;
        isCircumstantialInvert = false;
        pastFirstInvertThresh = false;
        clearInterval(this._loopId);
        clearTimeout(this._dragStartTimer);
  
        _cancelNextTick(this.cloneId);
  
        _cancelNextTick(this._dragStartId); // Unbind events
  
  
        if (this.nativeDraggable) {
          off(document, 'drop', this);
          off(el, 'dragstart', this._onDragStart);
        }
  
        this._offMoveEvents();
  
        this._offUpEvents();
  
        if (Safari) {
          css(document.body, 'user-select', '');
        }
  
        if (evt) {
          if (moved) {
            evt.cancelable && evt.preventDefault();
            !options.dropBubble && evt.stopPropagation();
          }
  
          ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
  
          if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
            // Remove clone(s)
            cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
          }
  
          if (dragEl) {
            if (this.nativeDraggable) {
              off(dragEl, 'dragend', this);
            }
  
            _disableDraggable(dragEl);
  
            dragEl.style['will-change'] = ''; // Remove classes
            // ghostClass is added in dragStarted
  
            if (moved && !awaitingDragStarted) {
              toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
            }
  
            toggleClass(dragEl, this.options.chosenClass, false); // Drag stop event
  
            _dispatchEvent({
              sortable: this,
              name: 'unchoose',
              toEl: parentEl,
              newIndex: null,
              newDraggableIndex: null,
              originalEvent: evt
            });
  
            if (rootEl !== parentEl) {
              if (newIndex >= 0) {
                // Add event
                _dispatchEvent({
                  rootEl: parentEl,
                  name: 'add',
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt
                }); // Remove event
  
  
                _dispatchEvent({
                  sortable: this,
                  name: 'remove',
                  toEl: parentEl,
                  originalEvent: evt
                }); // drag from one list and drop into another
  
  
                _dispatchEvent({
                  rootEl: parentEl,
                  name: 'sort',
                  toEl: parentEl,
                  fromEl: rootEl,
                  originalEvent: evt
                });
  
                _dispatchEvent({
                  sortable: this,
                  name: 'sort',
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
  
              putSortable && putSortable.save();
            } else {
              if (newIndex !== oldIndex) {
                if (newIndex >= 0) {
                  // drag & drop within the same list
                  _dispatchEvent({
                    sortable: this,
                    name: 'update',
                    toEl: parentEl,
                    originalEvent: evt
                  });
  
                  _dispatchEvent({
                    sortable: this,
                    name: 'sort',
                    toEl: parentEl,
                    originalEvent: evt
                  });
                }
              }
            }
  
            if (Sortable.active) {
              /* jshint eqnull:true */
              if (newIndex == null || newIndex === -1) {
                newIndex = oldIndex;
                newDraggableIndex = oldDraggableIndex;
              }
  
              _dispatchEvent({
                sortable: this,
                name: 'end',
                toEl: parentEl,
                originalEvent: evt
              }); // Save sorting
  
  
              this.save();
            }
          }
        }
  
        this._nulling();
      },
      _nulling: function _nulling() {
        pluginEvent('nulling', this);
        rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
        savedInputChecked.forEach(function (el) {
          el.checked = true;
        });
        savedInputChecked.length = lastDx = lastDy = 0;
      },
      handleEvent: function handleEvent(
      /**Event*/
      evt) {
        switch (evt.type) {
          case 'drop':
          case 'dragend':
            this._onDrop(evt);
  
            break;
  
          case 'dragenter':
          case 'dragover':
            if (dragEl) {
              this._onDragOver(evt);
  
              _globalDragOver(evt);
            }
  
            break;
  
          case 'selectstart':
            evt.preventDefault();
            break;
        }
      },
  
      /**
       * Serializes the item into an array of string.
       * @returns {String[]}
       */
      toArray: function toArray() {
        var order = [],
            el,
            children = this.el.children,
            i = 0,
            n = children.length,
            options = this.options;
  
        for (; i < n; i++) {
          el = children[i];
  
          if (closest(el, options.draggable, this.el, false)) {
            order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
          }
        }
  
        return order;
      },
  
      /**
       * Sorts the elements according to the array.
       * @param  {String[]}  order  order of the items
       */
      sort: function sort(order) {
        var items = {},
            rootEl = this.el;
        this.toArray().forEach(function (id, i) {
          var el = rootEl.children[i];
  
          if (closest(el, this.options.draggable, rootEl, false)) {
            items[id] = el;
          }
        }, this);
        order.forEach(function (id) {
          if (items[id]) {
            rootEl.removeChild(items[id]);
            rootEl.appendChild(items[id]);
          }
        });
      },
  
      /**
       * Save the current sorting
       */
      save: function save() {
        var store = this.options.store;
        store && store.set && store.set(this);
      },
  
      /**
       * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
       * @param   {HTMLElement}  el
       * @param   {String}       [selector]  default: `options.draggable`
       * @returns {HTMLElement|null}
       */
      closest: function closest$1(el, selector) {
        return closest(el, selector || this.options.draggable, this.el, false);
      },
  
      /**
       * Set/get option
       * @param   {string} name
       * @param   {*}      [value]
       * @returns {*}
       */
      option: function option(name, value) {
        var options = this.options;
  
        if (value === void 0) {
          return options[name];
        } else {
          var modifiedValue = PluginManager.modifyOption(this, name, value);
  
          if (typeof modifiedValue !== 'undefined') {
            options[name] = modifiedValue;
          } else {
            options[name] = value;
          }
  
          if (name === 'group') {
            _prepareGroup(options);
          }
        }
      },
  
      /**
       * Destroy
       */
      destroy: function destroy() {
        pluginEvent('destroy', this);
        var el = this.el;
        el[expando] = null;
        off(el, 'mousedown', this._onTapStart);
        off(el, 'touchstart', this._onTapStart);
        off(el, 'pointerdown', this._onTapStart);
  
        if (this.nativeDraggable) {
          off(el, 'dragover', this);
          off(el, 'dragenter', this);
        } // Remove draggable attributes
  
  
        Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
          el.removeAttribute('draggable');
        });
  
        this._onDrop();
  
        sortables.splice(sortables.indexOf(this.el), 1);
        this.el = el = null;
      },
      _hideClone: function _hideClone() {
        if (!cloneHidden) {
          pluginEvent('hideClone', this);
          if (Sortable.eventCanceled) return;
          css(cloneEl, 'display', 'none');
  
          if (this.options.removeCloneOnHide && cloneEl.parentNode) {
            cloneEl.parentNode.removeChild(cloneEl);
          }
  
          cloneHidden = true;
        }
      },
      _showClone: function _showClone(putSortable) {
        if (putSortable.lastPutMode !== 'clone') {
          this._hideClone();
  
          return;
        }
  
        if (cloneHidden) {
          pluginEvent('showClone', this);
          if (Sortable.eventCanceled) return; // show clone at dragEl or original position
  
          if (rootEl.contains(dragEl) && !this.options.group.revertClone) {
            rootEl.insertBefore(cloneEl, dragEl);
          } else if (nextEl) {
            rootEl.insertBefore(cloneEl, nextEl);
          } else {
            rootEl.appendChild(cloneEl);
          }
  
          if (this.options.group.revertClone) {
            this.animate(dragEl, cloneEl);
          }
  
          css(cloneEl, 'display', '');
          cloneHidden = false;
        }
      }
    };
  
    function _globalDragOver(
    /**Event*/
    evt) {
      if (evt.dataTransfer) {
        evt.dataTransfer.dropEffect = 'move';
      }
  
      evt.cancelable && evt.preventDefault();
    }
  
    function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
      var evt,
          sortable = fromEl[expando],
          onMoveFn = sortable.options.onMove,
          retVal; // Support for new CustomEvent feature
  
      if (window.CustomEvent && !IE11OrLess && !Edge) {
        evt = new CustomEvent('move', {
          bubbles: true,
          cancelable: true
        });
      } else {
        evt = document.createEvent('Event');
        evt.initEvent('move', true, true);
      }
  
      evt.to = toEl;
      evt.from = fromEl;
      evt.dragged = dragEl;
      evt.draggedRect = dragRect;
      evt.related = targetEl || toEl;
      evt.relatedRect = targetRect || getRect(toEl);
      evt.willInsertAfter = willInsertAfter;
      evt.originalEvent = originalEvent;
      fromEl.dispatchEvent(evt);
  
      if (onMoveFn) {
        retVal = onMoveFn.call(sortable, evt, originalEvent);
      }
  
      return retVal;
    }
  
    function _disableDraggable(el) {
      el.draggable = false;
    }
  
    function _unsilent() {
      _silent = false;
    }
  
    function _ghostIsLast(evt, vertical, sortable) {
      var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
      var spacer = 10;
      return vertical ? evt.clientX > rect.right + spacer || evt.clientX <= rect.right && evt.clientY > rect.bottom && evt.clientX >= rect.left : evt.clientX > rect.right && evt.clientY > rect.top || evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer;
    }
  
    function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
      var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
          targetLength = vertical ? targetRect.height : targetRect.width,
          targetS1 = vertical ? targetRect.top : targetRect.left,
          targetS2 = vertical ? targetRect.bottom : targetRect.right,
          invert = false;
  
      if (!invertSwap) {
        // Never invert or create dragEl shadow when target movemenet causes mouse to move past the end of regular swapThreshold
        if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
          // multiplied only by swapThreshold because mouse will already be inside target by (1 - threshold) * targetLength / 2
          // check if past first invert threshold on side opposite of lastDirection
          if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
            // past first invert threshold, do not restrict inverted threshold to dragEl shadow
            pastFirstInvertThresh = true;
          }
  
          if (!pastFirstInvertThresh) {
            // dragEl shadow (target move distance shadow)
            if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance // over dragEl shadow
            : mouseOnAxis > targetS2 - targetMoveDistance) {
              return -lastDirection;
            }
          } else {
            invert = true;
          }
        } else {
          // Regular
          if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
            return _getInsertDirection(target);
          }
        }
      }
  
      invert = invert || invertSwap;
  
      if (invert) {
        // Invert of regular
        if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
          return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
        }
      }
  
      return 0;
    }
    /**
     * Gets the direction dragEl must be swapped relative to target in order to make it
     * seem that dragEl has been "inserted" into that element's position
     * @param  {HTMLElement} target       The target whose position dragEl is being inserted at
     * @return {Number}                   Direction dragEl must be swapped
     */
  
  
    function _getInsertDirection(target) {
      if (index(dragEl) < index(target)) {
        return 1;
      } else {
        return -1;
      }
    }
    /**
     * Generate id
     * @param   {HTMLElement} el
     * @returns {String}
     * @private
     */
  
  
    function _generateId(el) {
      var str = el.tagName + el.className + el.src + el.href + el.textContent,
          i = str.length,
          sum = 0;
  
      while (i--) {
        sum += str.charCodeAt(i);
      }
  
      return sum.toString(36);
    }
  
    function _saveInputCheckedState(root) {
      savedInputChecked.length = 0;
      var inputs = root.getElementsByTagName('input');
      var idx = inputs.length;
  
      while (idx--) {
        var el = inputs[idx];
        el.checked && savedInputChecked.push(el);
      }
    }
  
    function _nextTick(fn) {
      return setTimeout(fn, 0);
    }
  
    function _cancelNextTick(id) {
      return clearTimeout(id);
    } // Fixed #973:
  
  
    on(document, 'touchmove', function (evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    }); // Export utils
  
    Sortable.utils = {
      on: on,
      off: off,
      css: css,
      find: find,
      is: function is(el, selector) {
        return !!closest(el, selector, el, false);
      },
      extend: extend,
      throttle: throttle,
      closest: closest,
      toggleClass: toggleClass,
      clone: clone,
      index: index,
      nextTick: _nextTick,
      cancelNextTick: _cancelNextTick,
      detectDirection: _detectDirection,
      getChild: getChild
    };
    /**
     * Get the Sortable instance of an element
     * @param  {HTMLElement} element The element
     * @return {Sortable|undefined}         The instance of Sortable
     */
  
    Sortable.get = function (element) {
      return element[expando];
    };
    /**
     * Mount a plugin to Sortable
     * @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
     */
  
  
    Sortable.mount = function () {
      for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) {
        plugins[_key] = arguments[_key];
      }
  
      if (plugins[0].constructor === Array) plugins = plugins[0];
      plugins.forEach(function (plugin) {
        if (!plugin.prototype || !plugin.prototype.constructor) {
          throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
        }
  
        if (plugin.utils) Sortable.utils = _objectSpread({}, Sortable.utils, plugin.utils);
        PluginManager.mount(plugin);
      });
    };
    /**
     * Create sortable instance
     * @param {HTMLElement}  el
     * @param {Object}      [options]
     */
  
  
    Sortable.create = function (el, options) {
      return new Sortable(el, options);
    }; // Export
  
  
    Sortable.version = version;
  
    var autoScrolls = [],
        scrollEl,
        scrollRootEl,
        scrolling = false,
        lastAutoScrollX,
        lastAutoScrollY,
        touchEvt$1,
        pointerElemChangedInterval;
  
    function AutoScrollPlugin() {
      function AutoScroll() {
        this.defaults = {
          scroll: true,
          scrollSensitivity: 30,
          scrollSpeed: 10,
          bubbleScroll: true
        }; // Bind all private methods
  
        for (var fn in this) {
          if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
            this[fn] = this[fn].bind(this);
          }
        }
      }
  
      AutoScroll.prototype = {
        dragStarted: function dragStarted(_ref) {
          var originalEvent = _ref.originalEvent;
  
          if (this.sortable.nativeDraggable) {
            on(document, 'dragover', this._handleAutoScroll);
          } else {
            if (this.options.supportPointer) {
              on(document, 'pointermove', this._handleFallbackAutoScroll);
            } else if (originalEvent.touches) {
              on(document, 'touchmove', this._handleFallbackAutoScroll);
            } else {
              on(document, 'mousemove', this._handleFallbackAutoScroll);
            }
          }
        },
        dragOverCompleted: function dragOverCompleted(_ref2) {
          var originalEvent = _ref2.originalEvent;
  
          // For when bubbling is canceled and using fallback (fallback 'touchmove' always reached)
          if (!this.options.dragOverBubble && !originalEvent.rootEl) {
            this._handleAutoScroll(originalEvent);
          }
        },
        drop: function drop() {
          if (this.sortable.nativeDraggable) {
            off(document, 'dragover', this._handleAutoScroll);
          } else {
            off(document, 'pointermove', this._handleFallbackAutoScroll);
            off(document, 'touchmove', this._handleFallbackAutoScroll);
            off(document, 'mousemove', this._handleFallbackAutoScroll);
          }
  
          clearPointerElemChangedInterval();
          clearAutoScrolls();
          cancelThrottle();
        },
        nulling: function nulling() {
          touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
          autoScrolls.length = 0;
        },
        _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
          this._handleAutoScroll(evt, true);
        },
        _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
          var _this = this;
  
          var x = (evt.touches ? evt.touches[0] : evt).clientX,
              y = (evt.touches ? evt.touches[0] : evt).clientY,
              elem = document.elementFromPoint(x, y);
          touchEvt$1 = evt; // IE does not seem to have native autoscroll,
          // Edge's autoscroll seems too conditional,
          // MACOS Safari does not have autoscroll,
          // Firefox and Chrome are good
  
          if (fallback || Edge || IE11OrLess || Safari) {
            autoScroll(evt, this.options, elem, fallback); // Listener for pointer element change
  
            var ogElemScroller = getParentAutoScrollElement(elem, true);
  
            if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
              pointerElemChangedInterval && clearPointerElemChangedInterval(); // Detect for pointer elem change, emulating native DnD behaviour
  
              pointerElemChangedInterval = setInterval(function () {
                var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
  
                if (newElem !== ogElemScroller) {
                  ogElemScroller = newElem;
                  clearAutoScrolls();
                }
  
                autoScroll(evt, _this.options, newElem, fallback);
              }, 10);
              lastAutoScrollX = x;
              lastAutoScrollY = y;
            }
          } else {
            // if DnD is enabled (and browser has good autoscrolling), first autoscroll will already scroll, so get parent autoscroll of first autoscroll
            if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
              clearAutoScrolls();
              return;
            }
  
            autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
          }
        }
      };
      return _extends(AutoScroll, {
        pluginName: 'scroll',
        initializeByDefault: true
      });
    }
  
    function clearAutoScrolls() {
      autoScrolls.forEach(function (autoScroll) {
        clearInterval(autoScroll.pid);
      });
      autoScrolls = [];
    }
  
    function clearPointerElemChangedInterval() {
      clearInterval(pointerElemChangedInterval);
    }
  
    var autoScroll = throttle(function (evt, options, rootEl, isFallback) {
      // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
      if (!options.scroll) return;
      var x = (evt.touches ? evt.touches[0] : evt).clientX,
          y = (evt.touches ? evt.touches[0] : evt).clientY,
          sens = options.scrollSensitivity,
          speed = options.scrollSpeed,
          winScroller = getWindowScrollingElement();
      var scrollThisInstance = false,
          scrollCustomFn; // New scroll root, set scrollEl
  
      if (scrollRootEl !== rootEl) {
        scrollRootEl = rootEl;
        clearAutoScrolls();
        scrollEl = options.scroll;
        scrollCustomFn = options.scrollFn;
  
        if (scrollEl === true) {
          scrollEl = getParentAutoScrollElement(rootEl, true);
        }
      }
  
      var layersOut = 0;
      var currentParent = scrollEl;
  
      do {
        var el = currentParent,
            rect = getRect(el),
            top = rect.top,
            bottom = rect.bottom,
            left = rect.left,
            right = rect.right,
            width = rect.width,
            height = rect.height,
            canScrollX = void 0,
            canScrollY = void 0,
            scrollWidth = el.scrollWidth,
            scrollHeight = el.scrollHeight,
            elCSS = css(el),
            scrollPosX = el.scrollLeft,
            scrollPosY = el.scrollTop;
  
        if (el === winScroller) {
          canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll' || elCSS.overflowX === 'visible');
          canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll' || elCSS.overflowY === 'visible');
        } else {
          canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll');
          canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll');
        }
  
        var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
        var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
  
        if (!autoScrolls[layersOut]) {
          for (var i = 0; i <= layersOut; i++) {
            if (!autoScrolls[i]) {
              autoScrolls[i] = {};
            }
          }
        }
  
        if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
          autoScrolls[layersOut].el = el;
          autoScrolls[layersOut].vx = vx;
          autoScrolls[layersOut].vy = vy;
          clearInterval(autoScrolls[layersOut].pid);
  
          if (vx != 0 || vy != 0) {
            scrollThisInstance = true;
            /* jshint loopfunc:true */
  
            autoScrolls[layersOut].pid = setInterval(function () {
              // emulate drag over during autoscroll (fallback), emulating native DnD behaviour
              if (isFallback && this.layer === 0) {
                Sortable.active._onTouchMove(touchEvt$1); // To move ghost if it is positioned absolutely
  
              }
  
              var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
              var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
  
              if (typeof scrollCustomFn === 'function') {
                if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== 'continue') {
                  return;
                }
              }
  
              scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
            }.bind({
              layer: layersOut
            }), 24);
          }
        }
  
        layersOut++;
      } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
  
      scrolling = scrollThisInstance; // in case another function catches scrolling as false in between when it is not
    }, 30);
  
    var drop = function drop(_ref) {
      var originalEvent = _ref.originalEvent,
          putSortable = _ref.putSortable,
          dragEl = _ref.dragEl,
          activeSortable = _ref.activeSortable,
          dispatchSortableEvent = _ref.dispatchSortableEvent,
          hideGhostForTarget = _ref.hideGhostForTarget,
          unhideGhostForTarget = _ref.unhideGhostForTarget;
      var toSortable = putSortable || activeSortable;
      hideGhostForTarget();
      var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
      var target = document.elementFromPoint(touch.clientX, touch.clientY);
      unhideGhostForTarget();
  
      if (toSortable && !toSortable.el.contains(target)) {
        dispatchSortableEvent('spill');
        this.onSpill({
          dragEl: dragEl,
          putSortable: putSortable
        });
      }
    };
  
    function Revert() {}
  
    Revert.prototype = {
      startIndex: null,
      dragStart: function dragStart(_ref2) {
        var oldDraggableIndex = _ref2.oldDraggableIndex;
        this.startIndex = oldDraggableIndex;
      },
      onSpill: function onSpill(_ref3) {
        var dragEl = _ref3.dragEl,
            putSortable = _ref3.putSortable;
        this.sortable.captureAnimationState();
  
        if (putSortable) {
          putSortable.captureAnimationState();
        }
  
        var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
  
        if (nextSibling) {
          this.sortable.el.insertBefore(dragEl, nextSibling);
        } else {
          this.sortable.el.appendChild(dragEl);
        }
  
        this.sortable.animateAll();
  
        if (putSortable) {
          putSortable.animateAll();
        }
      },
      drop: drop
    };
  
    _extends(Revert, {
      pluginName: 'revertOnSpill'
    });
  
    function Remove() {}
  
    Remove.prototype = {
      onSpill: function onSpill(_ref4) {
        var dragEl = _ref4.dragEl,
            putSortable = _ref4.putSortable;
        var parentSortable = putSortable || this.sortable;
        parentSortable.captureAnimationState();
        dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
        parentSortable.animateAll();
      },
      drop: drop
    };
  
    _extends(Remove, {
      pluginName: 'removeOnSpill'
    });
  
    var lastSwapEl;
  
    function SwapPlugin() {
      function Swap() {
        this.defaults = {
          swapClass: 'sortable-swap-highlight'
        };
      }
  
      Swap.prototype = {
        dragStart: function dragStart(_ref) {
          var dragEl = _ref.dragEl;
          lastSwapEl = dragEl;
        },
        dragOverValid: function dragOverValid(_ref2) {
          var completed = _ref2.completed,
              target = _ref2.target,
              onMove = _ref2.onMove,
              activeSortable = _ref2.activeSortable,
              changed = _ref2.changed,
              cancel = _ref2.cancel;
          if (!activeSortable.options.swap) return;
          var el = this.sortable.el,
              options = this.options;
  
          if (target && target !== el) {
            var prevSwapEl = lastSwapEl;
  
            if (onMove(target) !== false) {
              toggleClass(target, options.swapClass, true);
              lastSwapEl = target;
            } else {
              lastSwapEl = null;
            }
  
            if (prevSwapEl && prevSwapEl !== lastSwapEl) {
              toggleClass(prevSwapEl, options.swapClass, false);
            }
          }
  
          changed();
          completed(true);
          cancel();
        },
        drop: function drop(_ref3) {
          var activeSortable = _ref3.activeSortable,
              putSortable = _ref3.putSortable,
              dragEl = _ref3.dragEl;
          var toSortable = putSortable || this.sortable;
          var options = this.options;
          lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false);
  
          if (lastSwapEl && (options.swap || putSortable && putSortable.options.swap)) {
            if (dragEl !== lastSwapEl) {
              toSortable.captureAnimationState();
              if (toSortable !== activeSortable) activeSortable.captureAnimationState();
              swapNodes(dragEl, lastSwapEl);
              toSortable.animateAll();
              if (toSortable !== activeSortable) activeSortable.animateAll();
            }
          }
        },
        nulling: function nulling() {
          lastSwapEl = null;
        }
      };
      return _extends(Swap, {
        pluginName: 'swap',
        eventProperties: function eventProperties() {
          return {
            swapItem: lastSwapEl
          };
        }
      });
    }
  
    function swapNodes(n1, n2) {
      var p1 = n1.parentNode,
          p2 = n2.parentNode,
          i1,
          i2;
      if (!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1)) return;
      i1 = index(n1);
      i2 = index(n2);
  
      if (p1.isEqualNode(p2) && i1 < i2) {
        i2++;
      }
  
      p1.insertBefore(n2, p1.children[i1]);
      p2.insertBefore(n1, p2.children[i2]);
    }
  
    var multiDragElements = [],
        multiDragClones = [],
        lastMultiDragSelect,
        // for selection with modifier key down (SHIFT)
    multiDragSortable,
        initialFolding = false,
        // Initial multi-drag fold when drag started
    folding = false,
        // Folding any other time
    dragStarted = false,
        dragEl$1,
        clonesFromRect,
        clonesHidden;
  
    function MultiDragPlugin() {
      function MultiDrag(sortable) {
        // Bind all private methods
        for (var fn in this) {
          if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
            this[fn] = this[fn].bind(this);
          }
        }
  
        if (sortable.options.supportPointer) {
          on(document, 'pointerup', this._deselectMultiDrag);
        } else {
          on(document, 'mouseup', this._deselectMultiDrag);
          on(document, 'touchend', this._deselectMultiDrag);
        }
  
        on(document, 'keydown', this._checkKeyDown);
        on(document, 'keyup', this._checkKeyUp);
        this.defaults = {
          selectedClass: 'sortable-selected',
          multiDragKey: null,
          setData: function setData(dataTransfer, dragEl) {
            var data = '';
  
            if (multiDragElements.length && multiDragSortable === sortable) {
              multiDragElements.forEach(function (multiDragElement, i) {
                data += (!i ? '' : ', ') + multiDragElement.textContent;
              });
            } else {
              data = dragEl.textContent;
            }
  
            dataTransfer.setData('Text', data);
          }
        };
      }
  
      MultiDrag.prototype = {
        multiDragKeyDown: false,
        isMultiDrag: false,
        delayStartGlobal: function delayStartGlobal(_ref) {
          var dragged = _ref.dragEl;
          dragEl$1 = dragged;
        },
        delayEnded: function delayEnded() {
          this.isMultiDrag = ~multiDragElements.indexOf(dragEl$1);
        },
        setupClone: function setupClone(_ref2) {
          var sortable = _ref2.sortable,
              cancel = _ref2.cancel;
          if (!this.isMultiDrag) return;
  
          for (var i = 0; i < multiDragElements.length; i++) {
            multiDragClones.push(clone(multiDragElements[i]));
            multiDragClones[i].sortableIndex = multiDragElements[i].sortableIndex;
            multiDragClones[i].draggable = false;
            multiDragClones[i].style['will-change'] = '';
            toggleClass(multiDragClones[i], this.options.selectedClass, false);
            multiDragElements[i] === dragEl$1 && toggleClass(multiDragClones[i], this.options.chosenClass, false);
          }
  
          sortable._hideClone();
  
          cancel();
        },
        clone: function clone(_ref3) {
          var sortable = _ref3.sortable,
              rootEl = _ref3.rootEl,
              dispatchSortableEvent = _ref3.dispatchSortableEvent,
              cancel = _ref3.cancel;
          if (!this.isMultiDrag) return;
  
          if (!this.options.removeCloneOnHide) {
            if (multiDragElements.length && multiDragSortable === sortable) {
              insertMultiDragClones(true, rootEl);
              dispatchSortableEvent('clone');
              cancel();
            }
          }
        },
        showClone: function showClone(_ref4) {
          var cloneNowShown = _ref4.cloneNowShown,
              rootEl = _ref4.rootEl,
              cancel = _ref4.cancel;
          if (!this.isMultiDrag) return;
          insertMultiDragClones(false, rootEl);
          multiDragClones.forEach(function (clone) {
            css(clone, 'display', '');
          });
          cloneNowShown();
          clonesHidden = false;
          cancel();
        },
        hideClone: function hideClone(_ref5) {
          var _this = this;
  
          var sortable = _ref5.sortable,
              cloneNowHidden = _ref5.cloneNowHidden,
              cancel = _ref5.cancel;
          if (!this.isMultiDrag) return;
          multiDragClones.forEach(function (clone) {
            css(clone, 'display', 'none');
  
            if (_this.options.removeCloneOnHide && clone.parentNode) {
              clone.parentNode.removeChild(clone);
            }
          });
          cloneNowHidden();
          clonesHidden = true;
          cancel();
        },
        dragStartGlobal: function dragStartGlobal(_ref6) {
          var sortable = _ref6.sortable;
  
          if (!this.isMultiDrag && multiDragSortable) {
            multiDragSortable.multiDrag._deselectMultiDrag();
          }
  
          multiDragElements.forEach(function (multiDragElement) {
            multiDragElement.sortableIndex = index(multiDragElement);
          }); // Sort multi-drag elements
  
          multiDragElements = multiDragElements.sort(function (a, b) {
            return a.sortableIndex - b.sortableIndex;
          });
          dragStarted = true;
        },
        dragStarted: function dragStarted(_ref7) {
          var _this2 = this;
  
          var sortable = _ref7.sortable;
          if (!this.isMultiDrag) return;
  
          if (this.options.sort) {
            // Capture rects,
            // hide multi drag elements (by positioning them absolute),
            // set multi drag elements rects to dragRect,
            // show multi drag elements,
            // animate to rects,
            // unset rects & remove from DOM
            sortable.captureAnimationState();
  
            if (this.options.animation) {
              multiDragElements.forEach(function (multiDragElement) {
                if (multiDragElement === dragEl$1) return;
                css(multiDragElement, 'position', 'absolute');
              });
              var dragRect = getRect(dragEl$1, false, true, true);
              multiDragElements.forEach(function (multiDragElement) {
                if (multiDragElement === dragEl$1) return;
                setRect(multiDragElement, dragRect);
              });
              folding = true;
              initialFolding = true;
            }
          }
  
          sortable.animateAll(function () {
            folding = false;
            initialFolding = false;
  
            if (_this2.options.animation) {
              multiDragElements.forEach(function (multiDragElement) {
                unsetRect(multiDragElement);
              });
            } // Remove all auxiliary multidrag items from el, if sorting enabled
  
  
            if (_this2.options.sort) {
              removeMultiDragElements();
            }
          });
        },
        dragOver: function dragOver(_ref8) {
          var target = _ref8.target,
              completed = _ref8.completed,
              cancel = _ref8.cancel;
  
          if (folding && ~multiDragElements.indexOf(target)) {
            completed(false);
            cancel();
          }
        },
        revert: function revert(_ref9) {
          var fromSortable = _ref9.fromSortable,
              rootEl = _ref9.rootEl,
              sortable = _ref9.sortable,
              dragRect = _ref9.dragRect;
  
          if (multiDragElements.length > 1) {
            // Setup unfold animation
            multiDragElements.forEach(function (multiDragElement) {
              sortable.addAnimationState({
                target: multiDragElement,
                rect: folding ? getRect(multiDragElement) : dragRect
              });
              unsetRect(multiDragElement);
              multiDragElement.fromRect = dragRect;
              fromSortable.removeAnimationState(multiDragElement);
            });
            folding = false;
            insertMultiDragElements(!this.options.removeCloneOnHide, rootEl);
          }
        },
        dragOverCompleted: function dragOverCompleted(_ref10) {
          var sortable = _ref10.sortable,
              isOwner = _ref10.isOwner,
              insertion = _ref10.insertion,
              activeSortable = _ref10.activeSortable,
              parentEl = _ref10.parentEl,
              putSortable = _ref10.putSortable;
          var options = this.options;
  
          if (insertion) {
            // Clones must be hidden before folding animation to capture dragRectAbsolute properly
            if (isOwner) {
              activeSortable._hideClone();
            }
  
            initialFolding = false; // If leaving sort:false root, or already folding - Fold to new location
  
            if (options.animation && multiDragElements.length > 1 && (folding || !isOwner && !activeSortable.options.sort && !putSortable)) {
              // Fold: Set all multi drag elements's rects to dragEl's rect when multi-drag elements are invisible
              var dragRectAbsolute = getRect(dragEl$1, false, true, true);
              multiDragElements.forEach(function (multiDragElement) {
                if (multiDragElement === dragEl$1) return;
                setRect(multiDragElement, dragRectAbsolute); // Move element(s) to end of parentEl so that it does not interfere with multi-drag clones insertion if they are inserted
                // while folding, and so that we can capture them again because old sortable will no longer be fromSortable
  
                parentEl.appendChild(multiDragElement);
              });
              folding = true;
            } // Clones must be shown (and check to remove multi drags) after folding when interfering multiDragElements are moved out
  
  
            if (!isOwner) {
              // Only remove if not folding (folding will remove them anyways)
              if (!folding) {
                removeMultiDragElements();
              }
  
              if (multiDragElements.length > 1) {
                var clonesHiddenBefore = clonesHidden;
  
                activeSortable._showClone(sortable); // Unfold animation for clones if showing from hidden
  
  
                if (activeSortable.options.animation && !clonesHidden && clonesHiddenBefore) {
                  multiDragClones.forEach(function (clone) {
                    activeSortable.addAnimationState({
                      target: clone,
                      rect: clonesFromRect
                    });
                    clone.fromRect = clonesFromRect;
                    clone.thisAnimationDuration = null;
                  });
                }
              } else {
                activeSortable._showClone(sortable);
              }
            }
          }
        },
        dragOverAnimationCapture: function dragOverAnimationCapture(_ref11) {
          var dragRect = _ref11.dragRect,
              isOwner = _ref11.isOwner,
              activeSortable = _ref11.activeSortable;
          multiDragElements.forEach(function (multiDragElement) {
            multiDragElement.thisAnimationDuration = null;
          });
  
          if (activeSortable.options.animation && !isOwner && activeSortable.multiDrag.isMultiDrag) {
            clonesFromRect = _extends({}, dragRect);
            var dragMatrix = matrix(dragEl$1, true);
            clonesFromRect.top -= dragMatrix.f;
            clonesFromRect.left -= dragMatrix.e;
          }
        },
        dragOverAnimationComplete: function dragOverAnimationComplete() {
          if (folding) {
            folding = false;
            removeMultiDragElements();
          }
        },
        drop: function drop(_ref12) {
          var evt = _ref12.originalEvent,
              rootEl = _ref12.rootEl,
              parentEl = _ref12.parentEl,
              sortable = _ref12.sortable,
              dispatchSortableEvent = _ref12.dispatchSortableEvent,
              oldIndex = _ref12.oldIndex,
              putSortable = _ref12.putSortable;
          var toSortable = putSortable || this.sortable;
          if (!evt) return;
          var options = this.options,
              children = parentEl.children; // Multi-drag selection
  
          if (!dragStarted) {
            if (options.multiDragKey && !this.multiDragKeyDown) {
              this._deselectMultiDrag();
            }
  
            toggleClass(dragEl$1, options.selectedClass, !~multiDragElements.indexOf(dragEl$1));
  
            if (!~multiDragElements.indexOf(dragEl$1)) {
              multiDragElements.push(dragEl$1);
              dispatchEvent({
                sortable: sortable,
                rootEl: rootEl,
                name: 'select',
                targetEl: dragEl$1,
                originalEvt: evt
              }); // Modifier activated, select from last to dragEl
  
              if (evt.shiftKey && lastMultiDragSelect && sortable.el.contains(lastMultiDragSelect)) {
                var lastIndex = index(lastMultiDragSelect),
                    currentIndex = index(dragEl$1);
  
                if (~lastIndex && ~currentIndex && lastIndex !== currentIndex) {
                  // Must include lastMultiDragSelect (select it), in case modified selection from no selection
                  // (but previous selection existed)
                  var n, i;
  
                  if (currentIndex > lastIndex) {
                    i = lastIndex;
                    n = currentIndex;
                  } else {
                    i = currentIndex;
                    n = lastIndex + 1;
                  }
  
                  for (; i < n; i++) {
                    if (~multiDragElements.indexOf(children[i])) continue;
                    toggleClass(children[i], options.selectedClass, true);
                    multiDragElements.push(children[i]);
                    dispatchEvent({
                      sortable: sortable,
                      rootEl: rootEl,
                      name: 'select',
                      targetEl: children[i],
                      originalEvt: evt
                    });
                  }
                }
              } else {
                lastMultiDragSelect = dragEl$1;
              }
  
              multiDragSortable = toSortable;
            } else {
              multiDragElements.splice(multiDragElements.indexOf(dragEl$1), 1);
              lastMultiDragSelect = null;
              dispatchEvent({
                sortable: sortable,
                rootEl: rootEl,
                name: 'deselect',
                targetEl: dragEl$1,
                originalEvt: evt
              });
            }
          } // Multi-drag drop
  
  
          if (dragStarted && this.isMultiDrag) {
            // Do not "unfold" after around dragEl if reverted
            if ((parentEl[expando].options.sort || parentEl !== rootEl) && multiDragElements.length > 1) {
              var dragRect = getRect(dragEl$1),
                  multiDragIndex = index(dragEl$1, ':not(.' + this.options.selectedClass + ')');
              if (!initialFolding && options.animation) dragEl$1.thisAnimationDuration = null;
              toSortable.captureAnimationState();
  
              if (!initialFolding) {
                if (options.animation) {
                  dragEl$1.fromRect = dragRect;
                  multiDragElements.forEach(function (multiDragElement) {
                    multiDragElement.thisAnimationDuration = null;
  
                    if (multiDragElement !== dragEl$1) {
                      var rect = folding ? getRect(multiDragElement) : dragRect;
                      multiDragElement.fromRect = rect; // Prepare unfold animation
  
                      toSortable.addAnimationState({
                        target: multiDragElement,
                        rect: rect
                      });
                    }
                  });
                } // Multi drag elements are not necessarily removed from the DOM on drop, so to reinsert
                // properly they must all be removed
  
  
                removeMultiDragElements();
                multiDragElements.forEach(function (multiDragElement) {
                  if (children[multiDragIndex]) {
                    parentEl.insertBefore(multiDragElement, children[multiDragIndex]);
                  } else {
                    parentEl.appendChild(multiDragElement);
                  }
  
                  multiDragIndex++;
                }); // If initial folding is done, the elements may have changed position because they are now
                // unfolding around dragEl, even though dragEl may not have his index changed, so update event
                // must be fired here as Sortable will not.
  
                if (oldIndex === index(dragEl$1)) {
                  var update = false;
                  multiDragElements.forEach(function (multiDragElement) {
                    if (multiDragElement.sortableIndex !== index(multiDragElement)) {
                      update = true;
                      return;
                    }
                  });
  
                  if (update) {
                    dispatchSortableEvent('update');
                  }
                }
              } // Must be done after capturing individual rects (scroll bar)
  
  
              multiDragElements.forEach(function (multiDragElement) {
                unsetRect(multiDragElement);
              });
              toSortable.animateAll();
            }
  
            multiDragSortable = toSortable;
          } // Remove clones if necessary
  
  
          if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
            multiDragClones.forEach(function (clone) {
              clone.parentNode && clone.parentNode.removeChild(clone);
            });
          }
        },
        nullingGlobal: function nullingGlobal() {
          this.isMultiDrag = dragStarted = false;
          multiDragClones.length = 0;
        },
        destroyGlobal: function destroyGlobal() {
          this._deselectMultiDrag();
  
          off(document, 'pointerup', this._deselectMultiDrag);
          off(document, 'mouseup', this._deselectMultiDrag);
          off(document, 'touchend', this._deselectMultiDrag);
          off(document, 'keydown', this._checkKeyDown);
          off(document, 'keyup', this._checkKeyUp);
        },
        _deselectMultiDrag: function _deselectMultiDrag(evt) {
          if (dragStarted) return; // Only deselect if selection is in this sortable
  
          if (multiDragSortable !== this.sortable) return; // Only deselect if target is not item in this sortable
  
          if (evt && closest(evt.target, this.options.draggable, this.sortable.el, false)) return; // Only deselect if left click
  
          if (evt && evt.button !== 0) return;
  
          while (multiDragElements.length) {
            var el = multiDragElements[0];
            toggleClass(el, this.options.selectedClass, false);
            multiDragElements.shift();
            dispatchEvent({
              sortable: this.sortable,
              rootEl: this.sortable.el,
              name: 'deselect',
              targetEl: el,
              originalEvt: evt
            });
          }
        },
        _checkKeyDown: function _checkKeyDown(evt) {
          if (evt.key === this.options.multiDragKey) {
            this.multiDragKeyDown = true;
          }
        },
        _checkKeyUp: function _checkKeyUp(evt) {
          if (evt.key === this.options.multiDragKey) {
            this.multiDragKeyDown = false;
          }
        }
      };
      return _extends(MultiDrag, {
        // Static methods & properties
        pluginName: 'multiDrag',
        utils: {
          /**
           * Selects the provided multi-drag item
           * @param  {HTMLElement} el    The element to be selected
           */
          select: function select(el) {
            var sortable = el.parentNode[expando];
            if (!sortable || !sortable.options.multiDrag || ~multiDragElements.indexOf(el)) return;
  
            if (multiDragSortable && multiDragSortable !== sortable) {
              multiDragSortable.multiDrag._deselectMultiDrag();
  
              multiDragSortable = sortable;
            }
  
            toggleClass(el, sortable.options.selectedClass, true);
            multiDragElements.push(el);
          },
  
          /**
           * Deselects the provided multi-drag item
           * @param  {HTMLElement} el    The element to be deselected
           */
          deselect: function deselect(el) {
            var sortable = el.parentNode[expando],
                index = multiDragElements.indexOf(el);
            if (!sortable || !sortable.options.multiDrag || !~index) return;
            toggleClass(el, sortable.options.selectedClass, false);
            multiDragElements.splice(index, 1);
          }
        },
        eventProperties: function eventProperties() {
          var _this3 = this;
  
          var oldIndicies = [],
              newIndicies = [];
          multiDragElements.forEach(function (multiDragElement) {
            oldIndicies.push({
              multiDragElement: multiDragElement,
              index: multiDragElement.sortableIndex
            }); // multiDragElements will already be sorted if folding
  
            var newIndex;
  
            if (folding && multiDragElement !== dragEl$1) {
              newIndex = -1;
            } else if (folding) {
              newIndex = index(multiDragElement, ':not(.' + _this3.options.selectedClass + ')');
            } else {
              newIndex = index(multiDragElement);
            }
  
            newIndicies.push({
              multiDragElement: multiDragElement,
              index: newIndex
            });
          });
          return {
            items: _toConsumableArray(multiDragElements),
            clones: [].concat(multiDragClones),
            oldIndicies: oldIndicies,
            newIndicies: newIndicies
          };
        },
        optionListeners: {
          multiDragKey: function multiDragKey(key) {
            key = key.toLowerCase();
  
            if (key === 'ctrl') {
              key = 'Control';
            } else if (key.length > 1) {
              key = key.charAt(0).toUpperCase() + key.substr(1);
            }
  
            return key;
          }
        }
      });
    }
  
    function insertMultiDragElements(clonesInserted, rootEl) {
      multiDragElements.forEach(function (multiDragElement, i) {
        var target = rootEl.children[multiDragElement.sortableIndex + (clonesInserted ? Number(i) : 0)];
  
        if (target) {
          rootEl.insertBefore(multiDragElement, target);
        } else {
          rootEl.appendChild(multiDragElement);
        }
      });
    }
    /**
     * Insert multi-drag clones
     * @param  {[Boolean]} elementsInserted  Whether the multi-drag elements are inserted
     * @param  {HTMLElement} rootEl
     */
  
  
    function insertMultiDragClones(elementsInserted, rootEl) {
      multiDragClones.forEach(function (clone, i) {
        var target = rootEl.children[clone.sortableIndex + (elementsInserted ? Number(i) : 0)];
  
        if (target) {
          rootEl.insertBefore(clone, target);
        } else {
          rootEl.appendChild(clone);
        }
      });
    }
  
    function removeMultiDragElements() {
      multiDragElements.forEach(function (multiDragElement) {
        if (multiDragElement === dragEl$1) return;
        multiDragElement.parentNode && multiDragElement.parentNode.removeChild(multiDragElement);
      });
    }
  
    Sortable.mount(new AutoScrollPlugin());
    Sortable.mount(Remove, Revert);
  
    Sortable.mount(new SwapPlugin());
    Sortable.mount(new MultiDragPlugin());
  
    return Sortable;
  
  }));
  