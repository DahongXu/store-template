var imgTextArr1 = ["轮播广告", "图片导航", "商品模块", "分类模块", "消息快报", "店铺头部", "定位菜单", "店铺导航", "搜索模块", "左右图文", "标题栏", "文本模块", "背景浮层导航", "倒计时", "空白占位", "分隔符", "热区", "视频组件", "图文列表"];
var imgTextArr2 = ["优惠券", "限时折扣", "砍价", "拼团", "满减满折", "满包邮", "N元N件", "专题推荐", "直播"];
var configArr = [{
    imgTitle: "轮播广告",
    imgSrc: "slider.jpg"
}, {
    imgTitle: "图片导航",
    imgSrc: "picture.jpg"
}, {
    imgTitle: "商品模块",
    imgSrc: "goods.jpg"
}, {
    imgTitle: "分类模块",
    imgSrc: "classify.jpg"
}, {
    imgTitle: "消息快报",
    imgSrc: "news.jpg"
}];
/**
 * 切换组件类型
 * type为1表示基础组件，2为营销组件
 **/
function changeComponent(type) {
    $(".img_list_box").empty();
    if (type == 2) {
        createLeftImgList(imgTextArr2, type);
        $(".nav1")[0].className = "nav1";
        $(".nav2")[0].className = "nav2 act";
    } else {
        createLeftImgList(imgTextArr1, type);
        $(".nav1")[0].className = "nav1 act";
        $(".nav2")[0].className = "nav2";
    }
    traverseConfigImg(configArr);//遍历组件图片数组，创建中间预览组件
    bindImgSortable();//给元素绑定拖放换位事件
    //轮播图模态框打开时执行的事件
    $('#carouselModal').on('show.bs.modal', function () {
        var selectStyle = $(".img_style_select")[0].index;
        $("input[type='radio'][name='style'][value=" + selectStyle + "]").attr('checked', 'true');
    });
}
/**
 * 创建左侧基本组件图片列表
 * imgArr为组件数组
 * type为1表示基础组件，2为营销组件
 **/
function createLeftImgList(imgArr, type) {
    for (var i = 0; i < imgArr.length; i++) {
        var imgList = document.createElement("div");
        imgList.className = "img_list";
        imgList.index = i;
        if (i % 2 != 0) {
            imgList.className = "img_list img_list_right";
        }
        $(".img_list_box").append(imgList);
        var imgBox = document.createElement("div");
        imgBox.className = "img_box";
        imgBox.index = i;
        imgList.append(imgBox);
        var img = document.createElement("img");
        if (type == 1) {
            img.src = "../image/imgList" + (i + 1) + ".png";
        } else {
            img.src = "../image/imgList" + (i + 20) + ".png";
        }
        imgBox.append(img);
        var imgTitle = document.createElement("div");
        imgTitle.className = "img_title";
        imgTitle.innerText = imgArr[i];
        imgBox.append(imgTitle);
        //禁止图片拖动
        img.ondragstart = function () {
            return false;
        };
        //鼠标放上
        imgBox.onmouseover = function () {
            this.style.border = "1px solid #2589FF";
        };
        //鼠标离开
        imgBox.onmouseleave = function () {
            this.style.border = "1px solid #E3E2E5";
        };
        bindDragEvent(imgBox);//给组件图片绑定拖放事件
    }
}
/**
 * 给组件图片绑定拖放事件
 */
var isDrag = false; //判断当前div是否被拖拽
function bindDragEvent(imgBox) {
    var oldPointer = new Pointer();
    var oldPosition = new Position();
    $(imgBox).mousedown(function (e) {
        isDrag = true;
        oldPointer.x = e.clientX;
        oldPointer.y = e.clientY;
        oldPosition.left = imgBox.offsetLeft;
        oldPosition.top = imgBox.offsetTop;
        var imgSrc = e.currentTarget.children[0].src;
        var imgTxt = e.currentTarget.children[1].innerText;
        createDragDiv(imgSrc, imgTxt, oldPosition, oldPointer, imgBox.index);//创建拖放元素
    });
}
/**
 * 创建拖放元素
 */
function createDragDiv(imgSrc, imgTxt, oldPosition, oldPointer, imgIndex) {
    $(".hiddenImg").empty();
    var imgList = document.createElement("div");
    imgList.className = "img_list";
    $(".hiddenImg").append(imgList);
    var imgBox = document.createElement("div");
    imgBox.className = "img_box";
    imgList.append(imgBox);
    var img = document.createElement("img");
    img.src = imgSrc;
    imgBox.append(img);
    var imgTitle = document.createElement("div");
    imgTitle.className = "img_title";
    imgTitle.innerText = imgTxt;
    imgBox.append(imgTitle);
    $(".hiddenImg")[0].style.position = "absolute";
    $(".hiddenImg")[0].style.top = oldPosition.top + "px";
    $(".hiddenImg")[0].style.left = oldPosition.left + "px";
    $(".hiddenImg")[0].index = imgIndex;
    img.ondragstart = function () {
        return false;
    };
    bindDragDivMove(imgList, oldPosition, oldPointer);//给拖放元素绑定移动事件
}
/**
 * 给拖放元素绑定移动事件
 */
function bindDragDivMove(imgList, oldPosition, oldPointer) {
    var maxIndex, childList;
    $(imgList).mousedown(function (e) {
        isDrag = true;
    });
    var newPosition = new Position();
    //鼠标拖动事件
    $(imgList).mousemove(function (e) {
        if (!isDrag) return false;
        newPosition.left = e.clientX - oldPointer.x + oldPosition.left;
        newPosition.top = e.clientY - oldPointer.y + oldPosition.top;
        $(".hiddenImg")[0].style.top = newPosition.top + "px";
        $(".hiddenImg")[0].style.left = newPosition.left + "px";
        var isCreate = judgeIsSolid(newPosition);//判断是否占位创建组件
        if (isCreate) {
            childList = $(".center_box_main")[0].children;
            $(".solid_box").remove();
            maxIndex = calculatePosition(newPosition);
            var solidBox = document.createElement("div");
            solidBox.className = "solid_box";
            solidBox.innerText = "放这里";
            if (maxIndex > -1) {
                $(childList[maxIndex]).before(solidBox);
            } else {
                $(".center_box_main").append(solidBox);
            }
        } else {
            $(".solid_box").remove();
        }
    });
    //鼠标放开事件
    $(imgList).mouseup(function (e) {
        if (!isDrag) return false;
        isDrag = false;
        var isCreate = judgeIsSolid(newPosition);//判断是否占位创建组件
        if (isCreate) {
            $(".solid_box").remove();
            $(".hiddenImg").empty();
            var imgIndex = $(".hiddenImg")[0].index;
            var configBox = createComponentImg(configArr[imgIndex],imgIndex);
            if (maxIndex > -1) {
                $(childList[maxIndex]).before(configBox);
            } else {
                $(".center_box_main").append(configBox);
            }
        } else {
            $(".solid_box").remove();
            $(".hiddenImg").empty();
        }
    });
}
/**
 * 计算图片插入位置
 */
function calculatePosition(newPosition) {
    var mainBox = $(".center_box_main")[0];
    var scrollTop0 = mainBox.scrollTop;
    var top0 = mainBox.offsetTop;
    var childList = mainBox.children;
    var top1 = newPosition.top - top0 + scrollTop0 + 40;
    var maxIndex = 0;
    for (var i = 0; i < childList.length; i++) {
        if (childList[i].offsetTop > top1) {
            maxIndex = i;
            break;
        } else if (top1 > childList[i].offsetTop) {
            maxIndex = -1;
        }
    }
    return maxIndex;
}
/**
 * 判断是否占位创建组件
 */
function judgeIsSolid(newPosition) {
    var isCreate = false;
    var mainBox = $(".center_box_main")[0];
    var left0 = mainBox.offsetLeft;
    var top0 = mainBox.offsetTop;
    var left1 = newPosition.left;
    var top1 = newPosition.top;
    if (left1 > left0 && (left0 + 377) > left1 && top1 > (top0 - 80) && (top0 + 600) > top1) {
        isCreate = true;
    }
    return isCreate;
}
/**
 * 鼠标坐标位置对象
 */
function Pointer(x, y) {
    this.x = x;
    this.y = y;
}
/**
* div定位值对象
*/
function Position(left, top) {
    this.left = left;
    this.top = top;
}
/**
 * 遍历组件图片数组
 */
function traverseConfigImg(configArrs) {
    for (var i = 0; i < configArrs.length; i++) {
        var configBox = createComponentImg(configArrs[i], i);
        $(".center_box_main").append(configBox);
    }
   $("#items")[0].children[0].click();
}
/**
 * 创建中间预览组件元素
 */
function createComponentImg(config, index) {
    var configBox = document.createElement("div");
    configBox.className = "config_content_box";
    configBox.name = config.imgTitle;
    var configHead = document.createElement("div");
    configHead.className = "config_content_head";
    configBox.index = index;
    configBox.append(configHead);
    var configTit = document.createElement("span");
    configTit.className = "config_content_title";
    configTit.innerText = config.imgTitle;
    configHead.append(configTit);
    var configDel = document.createElement("span");
    configDel.className = "config_content_del";
    configDel.innerText = "删除";
    configHead.append(configDel);
    var imgBox = document.createElement("img");
    imgBox.src = "../image/" + config.imgSrc;
    configBox.append(imgBox);
    imgBox.ondragstart = function () {
        return false;
    };
    //点击删除
    configDel.onclick = function (ev) {
        $(configBox).remove();
        if ($("#items")[0].children.length > 0) {
            $("#items")[0].children[0].click();
        }
        ev.stopPropagation();
        return false;
    }
    //鼠标放上
    configBox.onmouseover = function () {
        configBox.children[0].style.display = "block";
        configBox.style.border = "1px solid #2589FF";
    };
    //鼠标离开
    configBox.onmouseleave = function () {
        configBox.children[0].style.display = "none";
        configBox.style.border = "0";
    }
    //点击设置组件详情
    configBox.onclick = function () {
        addBorder(this);
        $(".right_nav2")[0].innerText = configBox.name;
        $(".right_box_body").empty();
        var num = Array.prototype.indexOf.call($("#items")[0].children, this);
        judgeCreateCompontentType(this.index, num);
    }
    return configBox;
}
/**
 * 点击选中添加边框事件
 */
function addBorder(config) {
    var configArr = document.getElementsByClassName("config_content_box");
    for (var i = 0; i < configArr.length; i++) {
        configArr[i].style.border = "0";
        configArr[i].onmouseleave = function () {
            this.children[0].style.display = "none";
            this.style.border = "0";
        }
    }
    config.style.border = "1px solid #2589FF";
    config.onmouseleave = function () {
        this.children[0].style.display = "none";
    }
}
/**
 * 给元素绑定拖放换位事件
 */
function bindImgSortable() {
    Sortable.create(document.getElementById('items'), {
        animation: 150, //动画参数
        onAdd: function (evt) { //拖拽时候添加有新的节点的时候发生该事件
            console.log('onAdd.foo:', [evt.item, evt.from]);
        },
        onUpdate: function (evt) { //拖拽更新节点位置发生该事件
            console.log('onUpdate.foo:', [evt.item, evt.from]);
        },
        onRemove: function (evt) { //删除拖拽节点的时候促发该事件
            console.log('onRemove.foo:', [evt.item, evt.from]);
        },
        onStart: function (evt) { //开始拖拽出发该函数
            console.log('onStart.foo:', [evt.item, evt.from]);
        },
        onSort: function (evt) { //发生排序发生该事件
            console.log('onSort.foo:', [evt.item, evt.from]);
        },
        onEnd: function (evt) { //拖拽完毕之后发生该事件
            console.log('onEnd.foo:', [evt.item, evt.from]);
        }
    });
}
/**
 * 判断创建组件类型
 */
function judgeCreateCompontentType(type, num) {
    switch (type) {
        case 0:
            getCarouselDetial(num);
            break;
        case 1: break;
        case 2: break;
        case 3: break;
        case 4: break;
        default:
            break;
    }
}
/**
 * 创建轮播广告组件详情
 */
function createCarouselDetail(carouselDetailObj, num) {
    $(".container_right_box")[0].index = num;
    var imgDiv = document.createElement("div");
    imgDiv.className = "img_Contant";
    $(".right_box_body").append(imgDiv);
    var imgSrc = document.createElement("img");
    imgSrc.src = "../image/carousel_style_1.png";
    imgSrc.index = 1;
    if (carouselDetailObj.carouselStyle) {
        imgSrc.src = "../image/carousel_style_" + carouselDetailObj.carouselStyle + ".png";
        imgSrc.index = carouselDetailObj.carouselStyle;
    }
    imgSrc.className = "img_style_select";
    imgDiv.append(imgSrc);
    var btnDiv = document.createElement("div");
    btnDiv.className = "m-b-md changeStyleDiv";
    $(".right_box_body").append(btnDiv);
    var btnBox = document.createElement("div");
    btnBox.className = "btn changeStyleBtn";
    btnBox.innerText = "修改样式";
    btnDiv.append(btnBox);
    $(btnBox).attr("data-toggle", "modal");
    $(btnBox).attr("data-target", "#carouselModal");
    //进度条
    var progressBox = document.createElement("div");
    progressBox.className = "advertisement-module m-b-md";
    $(".right_box_body").append(progressBox);
    var labelTitle = document.createElement("label");
    labelTitle.className = "progressLabel";
    labelTitle.innerText = "轮播间隔(S)";
    progressBox.append(labelTitle);
    var progressDiv = document.createElement("div");
    progressDiv.className = "ngrs-range-slider";
    progressBox.append(progressDiv);
    var scalePanelDiv = document.createElement("div");
    scalePanelDiv.className = "scale_panel";
    progressDiv.append(scalePanelDiv);
    var scaleBarlDiv = document.createElement("div");
    scaleBarlDiv.className = "scale";
    scaleBarlDiv.id = "bar";
    scalePanelDiv.append(scaleBarlDiv);
    var scaleBarlDiv1 = document.createElement("div");
    scaleBarlDiv.append(scaleBarlDiv1);
    var scaleBarlSpan = document.createElement("span");
    scaleBarlDiv.append(scaleBarlSpan);
    scaleBarlSpan.id = "scaleBtn";
    var progressValueSpan = document.createElement("span");
    progressValueSpan.innerText = "5";
    progressValueSpan.id = "progressValue";
    progressDiv.append(progressValueSpan);
    if (carouselDetailObj.carouselSpeed) {
        progressValueSpan.innerText = carouselDetailObj.carouselSpeed / 1000;
        progressValueSpan.parentNode.children[0].children[0].children[0].style.width = (200 * carouselDetailObj.carouselSpeed / 10000) + "px";
        progressValueSpan.parentNode.children[0].children[0].children[1].style.left = (200 * carouselDetailObj.carouselSpeed / 10000 - 2) + "px";
    }
    //鼠标放上
    btnDiv.onmouseover = function () {
        btnDiv.children[0].style.color = "#2589FF";
        btnDiv.style.border = "1px solid #2589FF";
    };
    //鼠标离开
    btnDiv.onmouseleave = function () {
        btnDiv.children[0].style.color = "#595961";
        btnDiv.style.border = "0";
    };
    bindProgress();//绑定进度条滑动事件
    createAddImgSideBox(carouselDetailObj.carouselImgArr);//创建添加图片的盒子
    //提交按钮
    var submitBox = document.createElement("div");
    submitBox.className = "col-sm-12  widget-submit-box";
    $(".right_box_body").append(submitBox);
    var submitBtn = document.createElement("div");
    submitBtn.className = "btn widget-submit-btn";
    submitBtn.innerText = "提交";
    submitBox.append(submitBtn);
    //提交组件模板数据
    submitBtn.onclick = function () {
        submitCarouselDetail();
    }
}
/**
 * 绑定进度条滑动事件
 */
function bindProgress() {
    var progress = function (btn, bar, title) {
        this.btn = document.getElementById(btn);
        this.bar = document.getElementById(bar);
        this.title = document.getElementById(title);
        this.step = this.bar.getElementsByTagName("div")[0];
        this.init();
    };
    progress.prototype = {
        init: function () {
            var f = this, g = document, b = window, m = Math;
            f.btn.onmousedown = function (e) {
                var x = (e || b.event).clientX;
                var l = this.offsetLeft;
                var max = f.bar.offsetWidth - this.offsetWidth;
                g.onmousemove = function (e) {
                    var thisX = (e || b.event).clientX;
                    var to = m.min(max, m.max(-2, l + (thisX - x)));
                    f.btn.style.left = to + 'px';
                    f.ondrag(m.round(m.max(0.2, to / max) * 10), to);
                    b.getSelection ? b.getSelection().removeAllRanges() : g.selection.empty();
                };
                g.onmouseup = new Function('this.onmousemove=null');
            };
        },
        ondrag: function (pos, x) {
            this.step.style.width = Math.max(0, x) + 'px';
            this.title.innerHTML = pos;
        }
    }
    new progress('scaleBtn', 'bar', 'progressValue');
}
/**
 * 创建放图片的外围盒子
 */
function createAddImgSideBox(carouselImgArr) {
    var addImgBox = document.createElement("div");
    addImgBox.id = "sortImg";
    $(".right_box_body").append(addImgBox);
    //添加图片按钮
    var addImgBtnBox = document.createElement("div");
    addImgBtnBox.className = "add-img-box";
    $(".right_box_body").append(addImgBtnBox);
    var addImgBtn = document.createElement("div");
    addImgBtn.className = "btn btn-default add-img-btn";
    addImgBtn.innerText = "添加图片";
    addImgBtnBox.append(addImgBtn);
    var addImgSpan = document.createElement("span");
    addImgSpan.className = "text-notice-info add-img-span";
    addImgSpan.innerText = "最多十张！";
    addImgBtnBox.append(addImgSpan);
    addImgBtn.onclick = function () {
        var imgLen = $("#sortImg")[0].children.length + 1;
        if (imgLen > 10) {
            layer.msg("最多可添加十张！");
            return;
        }
        createAddImgBox(imgLen);//创建添加图片的盒子
    }
    if (carouselImgArr.length == 0) {
        createAddImgBox(1);
    } else {
        for (var i = 0; i < carouselImgArr.length; i++) {
            createAddImgBox((i + 1), carouselImgArr[i]);//创建添加图片的盒子
        }
    }
}
/**
 * 创建添加图片的盒子
 * num表示第几个图片
 * item表示图片参数
 */
function createAddImgBox(num, item) {
    var addImgItem = document.createElement("div");
    addImgItem.className = "sortImgDiv";
    $("#sortImg").append(addImgItem);
    //头部
    var imgHeadDiv = document.createElement("div");
    imgHeadDiv.className = "sortImgHead";
    addImgItem.append(imgHeadDiv);
    var imgTitleSpan = document.createElement("span");
    imgTitleSpan.className = "sortImgTitle m-l-sm";
    imgTitleSpan.innerText = "图片" + num;
    imgHeadDiv.append(imgTitleSpan);
    if (num > 1) {
        var imgDelSpan = document.createElement("span");
        imgDelSpan.className = "sortImgDel m-r-sm text-blue";
        imgDelSpan.innerText = "删除";
        imgHeadDiv.append(imgDelSpan);
        //绑定删除轮播图片事件
        imgDelSpan.onclick = function () {
            delCarouselImgBox(this);
        };
    }
    //选择图片
    var selectImgDiv = document.createElement("div");
    selectImgDiv.className = "form-group m-t";
    addImgItem.append(selectImgDiv);
    var selectImgLabel = document.createElement("label");
    selectImgLabel.className = "col-sm-3 control-label";
    selectImgLabel.innerText = "选择图片";
    selectImgDiv.append(selectImgLabel);
    var selectImgBox = document.createElement("div");
    selectImgBox.className = "col-sm-8 img-upload";
    selectImgDiv.append(selectImgBox);
    var selectImg = document.createElement("div");
    selectImg.className = "img img-lg";
    selectImgBox.append(selectImg);
    var selectImgSrc = document.createElement("img");
    selectImgSrc.src = "../image/carousel_style_default.png";
    selectImg.append(selectImgSrc);
    var selectImgBtn = document.createElement("div");
    selectImgBtn.className = "btn btn-default m-l-md select-img-btn";
    selectImgBtn.innerText = "选择图片";
    selectImgBox.append(selectImgBtn);
    var selectImgInput = document.createElement("input");
    selectImgInput.type = "file";
    selectImgInput.accept = "image/jpg, image/png, image/jpeg, image/gif";
    selectImgInput.className = "select-img-input";
    selectImgBtn.append(selectImgInput);
    selectImgInput.onchange = function () {
        selectImgChange(this);
    };
    var selectImgNotice = document.createElement("div");
    selectImgNotice.className = "text-notice-info m-t-sm";
    selectImgNotice.innerText = "建议宽度:750px";
    selectImgBox.append(selectImgNotice);
    //图片链接
    var imgUrlDiv = document.createElement("div");
    imgUrlDiv.className = "form-group m-t";
    addImgItem.append(imgUrlDiv);
    var imgUrlLabel = document.createElement("label");
    imgUrlLabel.className = "col-sm-3 control-label";
    imgUrlLabel.innerText = "图片链接";
    imgUrlDiv.append(imgUrlLabel);
    var imgUrlTypeDiv = document.createElement("div");
    imgUrlTypeDiv.className = "col-sm-8";
    imgUrlDiv.append(imgUrlTypeDiv);
    var imgUrlTypeLabel1 = document.createElement("label");
    imgUrlTypeLabel1.className = "radio-inline";
    imgUrlTypeDiv.append(imgUrlTypeLabel1);
    var imgUrlTypeInput1 = document.createElement("input");
    imgUrlTypeInput1.type = "radio";
    imgUrlTypeInput1.name = "specific" + num;
    imgUrlTypeInput1.value = "1";
    imgUrlTypeLabel1.append(imgUrlTypeInput1);
    imgUrlTypeLabel1.appendChild(document.createTextNode("系统链接"));
    var imgUrlTypeLabel2 = document.createElement("label");
    imgUrlTypeLabel2.className = "radio-inline";
    imgUrlTypeDiv.append(imgUrlTypeLabel2);
    var imgUrlTypeInput2 = document.createElement("input");
    imgUrlTypeInput2.type = "radio";
    imgUrlTypeInput2.name = "specific" + num;
    imgUrlTypeInput2.value = "2";
    imgUrlTypeLabel2.append(imgUrlTypeInput2);
    imgUrlTypeLabel2.appendChild(document.createTextNode("自定义链接"));
    // 选择系统链接
    var imgUrlSelectDiv = document.createElement("div");
    imgUrlSelectDiv.className = "selectSysLink";
    addImgItem.append(imgUrlSelectDiv);
    var imgUrlSelectBtn = document.createElement("div");
    imgUrlSelectBtn.className = "btn btn-default form-group select-imgUrl-btn";
    imgUrlSelectBtn.innerText = "选择链接";
    imgUrlSelectDiv.append(imgUrlSelectBtn);
    // 选择自定义链接
    var selectdefineLinkDiv = document.createElement("div");
    selectdefineLinkDiv.className = "selectdefLink";
    addImgItem.append(selectdefineLinkDiv);
    var imgUrlSelectDiv2 = document.createElement("div");
    imgUrlSelectDiv2.className = "form-group m-t";
    selectdefineLinkDiv.append(imgUrlSelectDiv2);
    var imgUrlSelectH5 = document.createElement("div");
    imgUrlSelectH5.className = "col-sm-8 rule-store-left min";
    imgUrlSelectDiv2.append(imgUrlSelectH5);
    var imgUrlSelectSpan1 = document.createElement("span");
    imgUrlSelectSpan1.className = "store-rule";
    imgUrlSelectSpan1.innerText = "H5链接：";
    imgUrlSelectH5.append(imgUrlSelectSpan1);
    var imgUrlSelectInput1 = document.createElement("input");
    imgUrlSelectInput1.type = "text";
    imgUrlSelectInput1.className = "form-control";
    imgUrlSelectInput1.placeholder = "请填写需要跳转的H5链接";
    imgUrlSelectH5.append(imgUrlSelectInput1);
    // // 选择小程序ID
    // var imgUrlSelectDiv3 = document.createElement("div");
    // imgUrlSelectDiv3.className = "form-group store-outlink-item m-t";
    // selectdefineLinkDiv.append(imgUrlSelectDiv3);
    // var imgUrlSelectAppID = document.createElement("div");
    // imgUrlSelectAppID.className = "col-sm-8 rule-store-left min";
    // imgUrlSelectDiv3.append(imgUrlSelectAppID);
    // var imgUrlSelectSpan2 = document.createElement("span");
    // imgUrlSelectSpan2.className = "store-rule";
    // imgUrlSelectSpan2.innerText = "AppID：";
    // imgUrlSelectAppID.append(imgUrlSelectSpan2);
    // var imgUrlSelectInput2 = document.createElement("input");
    // imgUrlSelectInput2.type = "text";
    // imgUrlSelectInput2.className = "form-control";
    // imgUrlSelectInput2.placeholder = "请选择小程序";
    // imgUrlSelectAppID.append(imgUrlSelectInput2);
    // var selectAppidBtn = document.createElement("a");
    // selectAppidBtn.className = "select-appid-btn";
    // selectAppidBtn.innerText = "选择";
    // imgUrlSelectAppID.append(selectAppidBtn);
    // // 选择路径
    // var imgUrlSelectDiv4 = document.createElement("div");
    // imgUrlSelectDiv4.className = "form-group store-outlink-item m-b-sm";
    // selectdefineLinkDiv.append(imgUrlSelectDiv4);
    // var imgUrlSelectAppUrl = document.createElement("div");
    // imgUrlSelectAppUrl.className = "col-sm-8 rule-store-left min";
    // imgUrlSelectDiv4.append(imgUrlSelectAppUrl);
    // var imgUrlSelectSpan3 = document.createElement("span");
    // imgUrlSelectSpan3.className = "store-rule";
    // imgUrlSelectSpan3.innerText = "路径：";
    // imgUrlSelectAppUrl.append(imgUrlSelectSpan3);
    // var imgUrlSelectInput3 = document.createElement("input");
    // imgUrlSelectInput3.type = "text";
    // imgUrlSelectInput3.className = "form-control";
    // imgUrlSelectInput3.placeholder = "请填写小程序页面路径";
    // imgUrlSelectAppUrl.append(imgUrlSelectInput3);
    // //备注
    // var imgUrlSelectDiv5 = document.createElement("div");
    // imgUrlSelectDiv5.className = "form-group store-outlink-item-tags m-b m-t-sm";
    // selectdefineLinkDiv.append(imgUrlSelectDiv5);
    // var imgUrlSelectNote = document.createElement("div");
    // imgUrlSelectNote.className = "col-sm-8 col-sm-offset-3";
    // imgUrlSelectDiv5.append(imgUrlSelectNote);
    // imgUrlSelectNote.innerText = "H5链接将在微信公众号及非微信环境的渠道中生效，AppID小程序仅在微信小程序中生效";
    //切换图片链接类型
    imgUrlTypeInput1.onclick = function () {
        this.parentNode.parentNode.parentNode.parentNode.children[3].style.display = "block";
        this.parentNode.parentNode.parentNode.parentNode.children[4].style.display = "none";
    };
    imgUrlTypeInput2.onclick = function () {
        this.parentNode.parentNode.parentNode.parentNode.children[3].style.display = "none";
        this.parentNode.parentNode.parentNode.parentNode.children[4].style.display = "block";
    };
    $(imgUrlTypeInput1).click();
    //赋值
    if (item) {
        selectImgSrc.src = item.imgUrl;
        selectImgSrc.name = item.imgName;
        selectImgBtn.childNodes[0].textContent = "重新选择";
        imgUrlSelectInput1.value = item.h5Url;
        if (item.imgLinkType == 2) {
            $(imgUrlTypeInput2).click();
        }
    }
}
/**
 * 改变轮播图样式事件
 */
function changeCarouselStyle() {
    var selectStyle = $("input[type='radio'][name='style']:checked").val();
    $(".img_style_select")[0].src = "../image/carousel_style_" + selectStyle + ".png";
    $(".img_style_select")[0].index = selectStyle;
    $('#carouselModal').modal('hide');
}
/**
 * 选择的轮播图图片改变事件
 */
function selectImgChange(el) {
    let imgUrlVal = el.value;
    if (!imgUrlVal.match(/.jpg|.gif|.png|.bmp/i)) {　　//判断所选文件格式  
        return layer.alert("上传的图片格式不正确，请重新选择！");
    }
    var reader = new FileReader();
    reader.readAsDataURL(el.files[0]);
    reader.onload = function (e) {
        var imgMsg = {
            name: el.files[0].name,
            base64: this.result
        };
        el.parentNode.parentNode.children[0].children[0].src = this.result;
        el.parentNode.parentNode.children[0].children[0].name = imgMsg.name;
        createImgDelNode(el);//创建图片删除按钮
    }
}
/**
 * 创建图片删除按钮
 */
function createImgDelNode(el) {
    el.parentNode.childNodes[0].textContent = "重新选择";
    var selectImgDel = document.createElement("i");
    selectImgDel.className = "del-img";
    el.parentNode.parentNode.children[0].append(selectImgDel);
    //绑定删除图片事件
    selectImgDel.onclick = function () {
        this.parentNode.children[0].src = "../image/carousel_style_default.png";
        this.parentNode.parentNode.children[1].childNodes[0].textContent = "选择图片";
        $(this).remove();
        el.value = "";
    }
}
/**
 * 删除轮播图图片事件
 */
function delCarouselImgBox(el) {
    el.parentNode.parentNode.remove();
    var childArr = $("#sortImg")[0].children;
    for (var i = 0; i < childArr.length; i++) {
        childArr[i].children[0].children[0].innerText = "图片" + (i + 1);
        childArr[i].children[2].children[1].children[0].children[0].name = "specific" + (i + 1);
        childArr[i].children[2].children[1].children[1].children[0].name = "specific" + (i + 1)
    }
}
/**
 * 提交轮播广告组件详情数据
 */
function submitCarouselDetail() {
    var carouselStyle = Number($(".img_style_select")[0].index);
    var speed = $("#progressValue")[0].innerText;
    var imgArr = $("#sortImg")[0].children;
    var carouselImgArr = [];
    for (var i = 0; i < imgArr.length; i++) {
        var item = imgArr[i];
        var imgUrl = item.children[1].children[1].children[0].children[0].src;
        var filename = item.children[1].children[1].children[0].children[0].name;
        var linkType = $("input[type='radio'][name='specific" + (i + 1) + "']:checked").val();
        var h5Url = item.children[4].children[0].children[0].children[1].value;
        var obj = {
            imgUrl: imgUrl,//图片路径
            imgName: filename,//图片名称
            imgLinkType: Number(linkType),//图片链接类型
            sysUrl: '',//系统链接
            h5Url: h5Url,//H5链接
        }
        carouselImgArr.push(obj);
    }
    var carouselDetailObj = {
        pageModuleId: 1234567,//组件模板id
        carouselStyle: carouselStyle,//轮播广告组件样式
        carouselSpeed: 1000 * speed,//轮播间隔
        carouselImgArr: carouselImgArr//图片数组
    };
    var num = $(".container_right_box")[0].index;
    createCarouselImgStyle(carouselDetailObj, num);//创建轮播图样式4
    console.log(carouselDetailObj);
    localStorage.setItem("carouselModule", JSON.stringify(carouselDetailObj));
    layer.msg("保存成功！");

}
/**
 * 获取轮播广告组件详情数据
 */
function getCarouselDetial(num) {
    var carouselDetailObj = JSON.parse(localStorage.getItem("carouselModule"));
    if(!carouselDetailObj){
         carouselDetailObj = {
            pageModuleId: 1234567,//组件模板id
            carouselStyle: 1,//轮播广告组件样式
            carouselSpeed: 1000 * 3,//轮播间隔
            carouselImgArr: []//图片数组
        };
    }
    console.log(carouselDetailObj);
    createCarouselDetail(carouselDetailObj, num);
    createCarouselImgStyle(carouselDetailObj, num);
}
/**
 *设置图片轮播轮播间隔事件
 */
function setCarouselInterval(times) {
    $('.carousel').carousel({
        interval: times
    })
}
/**
 * 创建轮播图样式4
 */
function createCarouselImgStyle(carouselDetailObj, num) {
    $("#items")[0].children[num].children[1].remove();
    var carouselBoxDiv = document.createElement("div");
    carouselBoxDiv.className = "carousel slide";
    carouselBoxDiv.id = "myCarousel";
    carouselBoxDiv.style.height = "180px";
    $("#items")[0].children[num].append(carouselBoxDiv);
    var carouselOl = document.createElement("ol");
    carouselOl.className = "carousel-indicators";
    carouselBoxDiv.append(carouselOl);
    for (var i = 0; i < carouselDetailObj.carouselImgArr.length; i++) {
        var carouselli = document.createElement("li");
        $(carouselli).attr("data-target", "#myCarousel");
        $(carouselli).attr("data-slide-to", i);
        if (i == 0) {
            carouselli.className = "active";
        }
        carouselOl.append(carouselli);
    }
    var carouselContentDiv = document.createElement("div");
    carouselContentDiv.className = "carousel-inner";
    carouselBoxDiv.append(carouselContentDiv);
    for (var j = 0; j < carouselDetailObj.carouselImgArr.length; j++) {
        var carouselImgDiv = document.createElement("div");
        carouselImgDiv.className = "item";
        if (j == 0) {
            carouselImgDiv.className = "item active";
        }
        carouselContentDiv.append(carouselImgDiv);
        var carouselImg = document.createElement("img");
        carouselImg.src = carouselDetailObj.carouselImgArr[j].imgUrl;
        carouselImgDiv.append(carouselImg);
    }
    setCarouselInterval(carouselDetailObj.carouselSpeed);
}  