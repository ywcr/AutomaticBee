/**
 * @author awen
 * @date  2019-01-07
 * 1、处理ajax提交的加载动画
 * 2、ajax提交的产生的错误给予提示
 * 3、未登录的ajax请求给予提示并跳转到登录页面
 */

/*
$.ajaxSetup({
    headers: {
        "token":layui.data('token').token
    }
});
*/
var is_submit = false;
function timeout_1000(d) {
  delayFunction(d, 1000);
}

function timeout_1500(d) {
  delayFunction(d, 1500);
}

function timeout_2000(d) {
  delayFunction(d, 2000);
}

function timeout_3000(d) {
  delayFunction(d, 3000);
}

/**
 @ function:延时执行function
 @ fn: 需要延时操作方法
 @ delayTime:延时时间(毫秒)
 */
function delayFunction(fn, delayTime) {
  let delayIndex = setTimeout(function () {
    if (typeof fn == "function") {
      fn();
    }
    clearTimeout(delayIndex);
  }, delayTime);
}

function loading() {
  return layer.open({ type: 3, offset: "45%" });
}

function closeLoading() {
  layer.closeAll("loading");
}

function openIframeLayer(title, url, area) {
  area = area == undefined ? ["100%", "100%"] : area;
  return layer.open({
    type: 2,
    content: url,
    area: area,
    title: title,
    skin: "layui-layer-blank",
  });
}

function openIframeLayerPage(title, url, area, closeCallBack) {
  area = area == undefined ? ["100%", "100%"] : area;
  return layer.open({
    type: 2,
    content: url,
    area: area,
    title: title,
    skin: "layui-layer-blank",
    end: function () {
      console.log("--关闭了");
      closeCallBack();
    },
  });
}

function msg(content) {
  layer.msg(content, { offset: "45%", time: 1000 });
}

function hans_jlf_fee_text(v) {
  return v == 1 ? "含精灵蜂服务费" : "不含精灵蜂服务费";
}

function tempUrl() {
  window.location.href = localStorage.getItem(urlType + "TempUrl");
}

function gdUpdUrl() {
  window.location.href = localStorage.getItem(urlType + "GdUpdUrl");
}

String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2);
};

String.prototype.compare = function (str) {
  //不区分大小写
  if (this.toLowerCase() == str.toLowerCase()) {
    return true;
  } else {
    return false;
  }
};

function once(fn) {
  let done = false;
  return function () {
    if (!done) {
      done = true;
      return fn.apply(this, arguments);
    }
  };
}

function compareDate(dateTime1, dateTime2) {
  var formatDate1 = new Date(dateTime1);
  var formatDate2 = new Date(dateTime2);
  if (formatDate1 > formatDate2) {
    return true;
  }
  return false;
}

layui.use(["jquery", "layer", "form", "table"], function () {
  $ = layui.jquery;
  var layer = layui.layer;
  var $ = layui.jquery;
  var form = layui.form;
  var table = layui.table;
  $(document).ready(function (e) {
    $(document).on("blur", "input[hdts]", function (e) {
      let value = $(this).val().trim();
      if (value == "." || value == "0.") {
        value = 0.5;
      }
      if (isNaN(value) || value < 0.5) {
        layer.msg("输入项必须为0.5的整数倍", { icon: 2 });
        value = 0.5;
      }

      // 确保是0.5的倍数
      const remainder = value % 0.5;

      if (remainder !== 0) {
        layer.msg("输入项必须为0.5的整数倍", { icon: 2 });
        numVal = Math.ceil(numVal * 2) / 2; // 向上取整到最近的0.5倍数
      }
      $(this).val(value);
    });
    $(document).on("blur", "input[lay-verify=zs]", function (e) {
      let value = $(this).val().trim();
      console.log(value, 3232);

      // 如果值为空，直接返回
      if (value === "") {
        return;
      }

      let numValue = parseFloat(value);

      // 检查是否为有效数字
      if (isNaN(numValue) || numValue == 0) {
        layer.msg("请输入有效的数字", { icon: 2 });
        $(this).val(1);
        return;
      }

      numValue = Math.round(numValue);

      // 检查是否为正整数
      if (numValue == 0) {
        layer.msg("输入项必须为正整数", { icon: 2 });
        numValue = 1;
      }
      // 四舍五入
      // 更新输入框的值
      $(this).val(numValue);
    });

    $(document).on("blur", "input[lay-verify=pint]", function (e) {
      let value = $(this).val().trim();
      console.log(value, 3232);

      // 如果值为空，直接返回
      if (value === "") {
        return;
      }

      // 转换为数字并四舍五入
      let numValue = parseFloat(value);

      // 检查是否为有效数字
      if (isNaN(numValue) || numValue == 0) {
        layer.msg("请输入有效的数字", { icon: 2 });
        $(this).val(1);
        return;
      }

      numValue = Math.round(numValue);

      // 检查是否为正整数
      if (numValue == 0) {
        layer.msg("输入项必须为正整数", { icon: 2 });
        numValue = 1;
      }
      // 四舍五入
      // 更新输入框的值
      $(this).val(numValue);
    });
    let non_0_pint = /^(?!0+\b)\d+$/;
    // 使用事件委托监听所有 name='rangeLimit' 的输入框
    $(document).on("blur", "input[name='rangeLimit']", function (e) {
      let taskType = $("[name=projectType]").val();
      let text = "";
      if (taskType == "等级医院科室拜访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一拜访对象一天内不得超过【1】次，拜访对象=等级医院+科室”重复，任务天数周期最小值为2";
      } else if (taskType == "基层医疗拜访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一拜访对象一天内不得超过【1】次，拜访对象=基层医疗”重复，任务天数周期最小值为2";
      } else if (taskType == "零售渠道巡访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一拜访对象一天内不得超过【1】次，拜访对象=零售渠道”重复，任务天数周期最小值为2";
      } else if (taskType == "商业渠道巡访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一拜访对象一天内不得超过【1】次，拜访对象=商业渠道”重复，任务天数周期最小值为2";
      } else if (taskType == "临床医生拜访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一拜访对象一天内不得超过【1】次，拜访对象=医疗机构名称+医生姓名+科室”重复，任务天数周期最小值为2";
      } else if (taskType == "患者拜访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一拜访对象一天内不得超过【1】次，拜访对象=患者名称”重复，任务天数周期最小值为2";
      } else if (taskType == "等级医院科室巡访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一巡访对象一天内不得超过【1】次，巡访对象=等级医院+科室”重复，任务天数周期最小值为2";
      } else if (taskType == "基层医疗巡访") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一巡访对象一天内不得超过【1】次，巡访对象=基层医疗名称”重复，任务天数周期最小值为2";
      } else if (taskType == "等级医院科室维护") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一维护对象一天内不得超过【1】次，维护对象=等级医院+科室”重复，任务天数周期最小值为2";
      } else if (taskType == "基层医疗维护") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一维护对象一天内不得超过【1】次，维护对象=基层医疗”重复，任务天数周期最小值为2";
      } else if (taskType == "患者微服务") {
        text =
          "此工单规则用于设置较长周期的拜访，若修改为【1】天时与规则“同一任务下同一服务对象一天内不得超过【1】次，服务对象=患者姓名”重复，任务天数周期最小值为2";
      }
      var value = $(this).val().trim();
      if (!non_0_pint.test(value) || value == 1) {
        $("[name=rangeLimit]").val(2);
        layer.msg(text);
        return false;
      }
    });
    $(document).on("blur", "input[name='rule_3']", function (e) {
      let taskType = $("[name=projectType]").val();
      if (taskType == "竞品信息") {
        var value = $(this).val().trim();
        if (!non_0_pint.test(value)) {
          $("[name=rule_3]").val(1);
          layer.msg("请输入正整数");
          return false;
        }
      }
    });
  });
  table.set({
    //其实这里可以不用两个都设置，选择头或者where即可
    headers: {
      //通过 request 头传递
      token: layui.data("token").token,
    },
  });

  //点击照片预览
  $("body").delegate(".myImg", "click", function () {
    var w = $(this).next().width();
    var h = $(this).next().height();
    if (w >= h) {
      w = window.innerWidth * 0.95;
      h = (window.innerWidth * 0.95 * h) / $(this).next().width();
    } else {
      h = window.innerHeight * 0.85;
      w = (window.innerHeight * 0.85 * w) / $(this).next().height();
    }
    var w2 = w;
    var h2 = h;
    h = (window.innerHeight - h) / 2;
    w = ($(document).width() - w) / 2;
    ylImgIndex = layer.open({
      type: 1,
      title: false,
      closeBtn: 0,
      area: w2 + "px",
      offset: [h, w],
      /*zIndex:2147483647, */
      content:
        "<img src=" +
        $(this).attr("src") +
        " style='width:100%;height:100%'  onclick='closeImg()'>",
      /*		  ,success: function(layero,index){
                            $(".layui-layer-shade").css("z-index","2147483647");
                            layer.setTop(layero);
                      }*/
    });
  });

  $("p-title").click(function () {
    layer.msg($(this).clone().children().remove().end().text());
  });

  //点击照片预览 (第二版 适用性更强)
  $("body").delegate(".ylImg", "click", function () {
    var w = $(this)[0].naturalWidth;
    var h = $(this)[0].naturalHeight;
    if (w > h) {
      if (w > window.innerWidth * 0.6) {
        w = window.innerWidth * 0.6;
        h = (window.innerWidth * 0.6 * h) / $(this)[0].naturalWidth;
      }
    } else {
      if (h > window.innerHeight * 0.6) {
        h = window.innerHeight * 0.6;
        w = (window.innerHeight * 0.6 * w) / $(this)[0].naturalHeight;
      }
    }
    $("#imgBox").attr("src", $(this).attr("src"));
    $("#imgBox").width(w);
    $("#imgBox").height(h);
    var w2 = w;
    h = ($(document).height() - h) / 2;
    w = ($(document).width() - w) / 2;

    ylImgIndex = layer.open({
      type: 1,
      title: "工单图片",
      closeBtn: 1,
      area: w2 + "px",
      offset: [h, w],
      content:
        "<img src=" +
        $(this).attr("src") +
        " style='width:100%;height:100%'  onclick='closeImg()'>",
    });
  });

  //点击照片预览 (任务验收与已驳回)
  $("body").delegate(".ysImg", "click", function () {
    var w = $(this)[0].naturalWidth;
    var h = $(this)[0].naturalHeight;
    w = (parent.innerHeight * 0.8 * w) / h;
    parent.layer.open({
      type: 1,
      title: "工单图片",
      closeBtn: 1,
      area: [w + "px", "80%"],
      offset: "10%",
      content:
        "<img src=" + $(this).attr("src") + " style='width:100%;height:100%' >",
    });
  });

  form.verify({
    zint: [/^[1-9]\d{0,8}$/, "请输入合理范围的整数"],
    pint: [/^[+]{0,1}(\d+)$/, "请输入正整数"],
    non_0_pint: [/^(?!0+\b)\d+$/, "请输入正整数"],
    zs: [
      /^(0\.0*[1-9]+[0-9]*$|[1-9]+[0-9]*\.[0-9]*[0-9]$|[1-9]+[0-9]*$)/,
      "请输入正数",
    ],
    zhs: [/^(0|[1-9][0-9]*|-[1-9][0-9]*)$/, "请输入整数"],
    checkImgInterceptFilter: function (value, item) {
      // console.log(value,item,3232); // Remove this debug log for final code

      // 获取图片识别规则的当前选中状态
      const isCheckImgInterceptEnabled = $(item).prop("checked");

      // 获取医院门头照和医院科室照的当前选中状态
      let openHospitalHeaderImgChecked = $(
        'input[name="openHospitalHeaderImg"]'
      ).prop("checked");
      let openHospitalKSImgChecked = $('input[name="openHospitalKSImg"]').prop(
        "checked"
      );

      // 校验逻辑：如果图片识别规则开启了，但门头照和科室照都未开启，则报错
      if (isCheckImgInterceptEnabled) {
        if (!openHospitalHeaderImgChecked && !openHospitalKSImgChecked) {
          return "开启图片识别规则前，请先开启医院门头照或医院科室照";
        }
      }
      // 如果校验通过，不返回任何内容或返回 undefined
    },
    pass: [
      /^((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.{8,16}$)|((?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.{8,16}$)|((?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])^.{8,16}$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[\W_])^.{8,16}$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])^.{8,16}$)/,
      "密码不符合要求,密码至少包含大写字母、小写字母、数字、 标点及特殊字符中3种的组合,限制字数8-16位",
    ],
    zero_point_five: [/^[1-9]\d*\.[5]$|0\.[5]$|^[1-9]\d*$/, "必须为0.5的倍数"],

    account: function (value, item) {
      //let max = item.getAttribute('lay-max');
      value = value.trim();
      if (value.trim().length != 11) {
        return "手机号长度必须为11位";
      }
      let patt = /^1\d{10}$/;
      if (!patt.test(value)) {
        return "请输入正确的手机号";
      }
    },

    rate: function (value, item) {
      value = value.trim();
      if (value.trim().length > 5) {
        return "利率不可大于100";
      } else if (value.trim() > 100) {
        return "利率不可大于100";
      } else if (value.trim() < 0) {
        return "利率不可小于0";
      }
    },
  });

  $.ajaxSetup({
    beforeSend: function (XMLHttpRequest) {
      //loadIndex=layer.load(0, {shade:[0.1,'#fff']});
    },
    success: function (XMLHttpRequest) {
      //layer.close(loadIndex);
    },
    error: function (jqXHR, textStatus, errorMsg) {
      /*	      layer.msg("<font style='color:red'>对不起！"+errorMsg+"</font>",{icon:5,time:2000})
                      setTimeout(function(){
                          layer.closeAll();
                      },1500)*/
    },
    complete: function (XMLHttpRequest, textStatus) {
      //layer.close(loadIndex);
      var res = XMLHttpRequest.responseText;
      if (res != "") {
        if (isJSON(res)) {
          res = JSON.parse(res);
        }
      }
      if (res != undefined) {
        if (res.errCode == "400") {
          //重新登录
          //layer.msg(res.errMsg, {icon: 4,offset:"40%",zIndex:99999999});
          layer.open({
            type: 0,
            icon: 4,
            content: res.errMsg,
            offset: "40%",
            zIndex: layer.zIndex,
            closeBtn: 0,
            success: function (layero, index) {
              layer.setTop(layero);
            },
            yes: function (index, layero) {
              top.location.href = "logout";
            },
          });
          return false;
        } else if (res.errCode == "401") {
          //权限不足
          closeLoading();
          layer.msg(res.errMsg, {
            icon: 5,
            time: 1000,
            zIndex: layer.zIndex,
            offset: "40%",
          });
          /*layer.open({type:0,icon:5,content:res.errMsg,offset:"40%",zIndex:layer.zIndex
                         ,success:function(layero,index){
                            layer.setTop(layero);
                         }
                    })*/
        } else if (res.errCode == "388") {
          //敏感词
          layer.alert(
            res.errMsg,
            {
              title: "温馨提示",
              skin: "layui-layer-red",
              closeBtn: 0,
            },
            function (index) {
              layer.close(index);
            }
          );
        } else if (res.errCode == "5000") {
          //其他错误
          layer.alert(
            res.errMsg,
            {
              title: "温馨提示",
              skin: "layui-layer-red",
              closeBtn: 0,
            },
            function (index) {
              layer.close(index);
            }
          );
        } else if (res.errCode == "2000") {
          //提示
          layer.alert(
            res.errMsg,
            {
              title: "温馨提示",
              skin: "layui-layer-molv",
              closeBtn: 0,
              offset: "30%",
            },
            function (index) {
              layer.close(index);
              location.reload();
            }
          );
        } else if (res.code == 1000) {
          layer.closeAll("loading");
          layer.msg(res.message, { offset: "45%" });
        }
      }
      return false;
    },
    statusCode: {
      404: function () {
        layer.closeAll("loading");
        layer.msg("<font style='color:red'>404：没有此服务！</font>", {
          icon: 5,
          time: 2000,
          offset: "40%",
          zIndex: 99999999,
        });
      },
      504: function () {
        layer.closeAll("loading");
        layer.msg("<font style='color:red'>504：服务没有响应！</font>", {
          icon: 5,
          time: 2000,
          offset: "40%",
          zIndex: 99999999,
        });
      },
      500: function () {
        layer.closeAll("loading");
        layer.msg("<font style='color:red'>500：代码出Bug了！</font>", {
          icon: 5,
          time: 2000,
          offset: "40%",
          zIndex: 99999999,
        });
      },
    },
  });

  // 监听隐藏提交按钮的事件
  form.on("submit(hiddenGdgzSubmit)", function (data) {
    if (is_submit) {
      is_submit = false;
      return false;
    }
    let projectType = $("[name=projectType]").val();
    let param = {
      scene: getTaskTypeByName(projectType).tableName.toUpperCase(),
      producerId: $("[name=sponsorId]").val(),
      rules: {
        ...getGdgzJsonData(),
      },
      partSave: true,
    };
    $.ajax({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      type: "post",
      url: "/lgb/scene/check/saveRuleTemplate",
      data: JSON.stringify(param),
    }).then((res) => {
      if (res.code == 0) {
        layer.msg("保存成功", { icon: 1, offset: "50%", time: 1000 });
      } else {
        layer.msg("保存失败", { icon: 2, offset: "50%", time: 1000 });
      }
    });
    return false; // 阻止表单跳转
  });
});

function closeCurrent() {
  layer.close(layer.index);
}

function replace5(str) {
  if (str == "无") {
    return "";
  }
  return str;
}

function isJSON(str) {
  if (typeof str == "string") {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
}

function downloadAppendix_mobile(path, fileName) {
  var u = navigator.userAgent;
  var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  if (isiOS) {
    var a = path.split(";");
    downloadURL(path, a[a.length - 1]);
    //window.webkit.messageHandlers.BrowseFiles.postMessage(path);
  } else {
    var myFrame = document.createElement("iframe");
    myFrame.src =
      "../oss/download?path=" +
      path +
      "&fileName=" +
      encodeURIComponent(fileName);
    myFrame.style.display = "none";
    document.body.appendChild(myFrame);
  }
}
/**
 * @param fileUrl  url
 * @param fileName 文明名+后缀
 * */
function generalDownloadFile(fileUrl, fileName) {
  /*// 创建表单
    const formObj = document.createElement('form');
    formObj.action = fileUrl;
    formObj.method = 'get';
    formObj.style.display = 'none';
    // 创建input，主要是起传参作用
    const formItem = document.createElement('input');
    formItem.value = fileName; // 传参的值
    formItem.name = 'fileName'; // 传参的字段名
    // 插入到网页中
    formObj.appendChild(formItem);
    document.body.appendChild(formObj);
    formObj.submit(); // 发送请求
    document.body.removeChild(formObj); // 发送完清除掉*/
  let self = this;
  let request = new XMLHttpRequest();
  request.open("GET", fileUrl, true);
  request.responseType = "blob";
  request.onload = function () {
    //self.exportLoading = false;
    let url = window.URL.createObjectURL(request.response);
    // a标签下载
    let a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };
  request.send();
}

generalDownload = function (href, name) {
  let eleLink = document.createElement("a");
  eleLink.download = name;
  eleLink.href = href;
  eleLink.click();
  eleLink.remove();
};

function testDownLoadTemplate(path, fileName) {
  //下载模板，请不要更改
  let url = "../../oss/download?path=" + path + "&fileName=" + fileName;
  download(url);
}

function testDownLoadTemplateSuffix(path, name, suffix) {
  // 通用下载 后缀
  let url = "../../oss/download?path=" + path + "&fileName=" + name + suffix;
  download(url);
}

downloadAppendix = function (path, fileName) {
  downForm.action = "oss/download?path=" + path + "&fileName=" + fileName;
  downForm.target = document.getElementsByName("downFrame")[0];
  downForm.submit();
};
// 或者封装
download = function (href, title) {
  const a = document.createElement("a");
  // var xx = "oss/download?path=" + href + "&fileName=" + title;
  a.setAttribute("href", href);
  a.setAttribute("download", title);
  a.click();
};

// 校验文件名特殊字符
verifyFileName = function (fileName) {
  // 定义特殊字符的正则表达式模式
  var pattern = /[+;；,，/#]/;
  // 检查文件名是否包含特殊字符
  if (pattern.test(fileName)) {
    console.log(pattern.test(fileName));
    return true;
  }
  // 如果文件名没有特殊字符，则进行其他操作或返回 true
  return false;
};
downloadUrl222 = function (url, filename) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("网络异常！");
      }
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
};

function downListForm(data, fileName) {
  let myFrame = document.createElement("iframe");
  myFrame.src = "../oss/downList?fileName=" + fileName + "&" + data;
  myFrame.style.display = "none";
  document.body.appendChild(myFrame);
}

function downFileByForm(url) {
  let myFrame = document.createElement("iframe");
  myFrame.src = url;
  myFrame.style.display = "none";
  document.body.appendChild(myFrame);
}

function downloadOssSettlementFile(path, fkId, projectTitle, falg) {
  if (path == "") {
    layer.msg("文件不存在！");
    return false;
  }

  let myFrame = document.createElement("iframe");
  myFrame.src =
    "../oss/download?path=" +
    path +
    "&fkId=" +
    fkId +
    "&projectTitle=" +
    projectTitle +
    "";
  myFrame.style.display = "none";
  document.body.appendChild(myFrame);
}
function downloadOssFlag(path, fkId, projectTitle, falg) {
  if (path == "") {
    layer.msg("文件不存在！");
    return false;
  }

  let myFrame = document.createElement("iframe");
  myFrame.src =
    "../oss/download?path=" +
    path +
    "&fkId=" +
    fkId +
    "&projectTitle=" +
    projectTitle +
    "";
  myFrame.style.display = "none";
  document.body.appendChild(myFrame);

  return true;
}

function downTicketInfoByRecId(recId, projectType, isSponsor) {
  let myFrame = document.createElement("iframe");
  myFrame.src =
    "../process/dwonByRecId?recId=" +
    recId +
    "&type=" +
    projectType +
    "&isSponsor=" +
    isSponsor;
  console.log(myFrame.src);
  myFrame.style.display = "none";
  document.body.appendChild(myFrame);
}

function downTicketInfoList(list, types, flowNo, isSponsor) {
  let myFrame = document.createElement("iframe");
  myFrame.src =
    "../process/downList?recIdList=" +
    list +
    "&types=" +
    types +
    "&flowNo=" +
    flowNo +
    "&isSponsor=" +
    isSponsor;
  console.log(myFrame.src);
  myFrame.style.display = "none";
  document.body.appendChild(myFrame);
}

function downloadOssSettlementFile2(path, fkId, projectTitle) {
  if (path == "") {
    layer.msg("文件不存在！");
    return false;
  }
  let myFrame = document.createElement("iframe");
  myFrame.src =
    "../oss/download?path=" +
    path +
    "&fkId=" +
    fkId +
    "P" +
    "&projectTitle=" +
    projectTitle +
    "";
  myFrame.style.display = "none";
  document.body.appendChild(myFrame);
}

function downloadYqFile(path) {
  /*downForm.action="../download/netFile?path="+path;
	downForm.target=document.getElementsByName("downFrame")[0];
    downForm.submit(); */
  //window.open(path);

  if (window.webkit != undefined) {
    //如果是苹果APP
    window.webkit.messageHandlers.BrowseFiles.postMessage(path);
  } else {
    let myFrame = document.createElement("iframe");
    myFrame.src = path;
    myFrame.style.display = "none";
    document.body.appendChild(myFrame);
  }

  /*    layer.open({
           type:2,
           title:"文件预览",
           area:['90%','90%'],
           offset:['5%','5%'],
           content:"../pdfjs/web/viewer.html?file=http://awen6.iok.la/lgb/download/readFile?url="+path
        })*/
}

function downloadAppendix2(path, fileName) {
  // $("#downForm [name=fileName]").val(fileName);
  // downForm.action = "oss/download?path=" + path
  // downForm.target = document.getElementsByName("downFrame")[0];
  // downForm.submit();
  testDownLoadTemplate(path, fileName + "&fkId=123");
}

function downloadExcel(fileName) {
  var cols = tabObj.config.cols[0];
  var fields = [];
  var titles = [];
  for (var i = 0; i < cols.length; i++) {
    if (cols[i].field != undefined) {
      fields.push(cols[i].field);
      titles.push(cols[i].title);
    }
  }
  $("#downForm [name=data]").val(JSON.stringify(resData));
  $("#downForm [name=fields]").val(fields.join(","));
  $("#downForm [name=titles]").val(titles.join(","));
  var url = "download/export";
  if (fileName != "" && fileName != null && fileName != undefined) {
    url += "?fileName=" + fileName;
  }
  downForm.action = url;
  downForm.target = document.getElementsByName("downFrame")[0];
  downForm.submit();
}

function downloadPayDetail() {
  let name = [];
  let mobile = [];
  let idCard = [];
  let bankCard = [];
  let money = [];
  let bank = [];
  $.each(resData.data, (i, item) => {
    name.push(item.empName);
    mobile.push(item.mobile);
    idCard.push(item.idCard);
    bankCard.push(item.bankAccount);
    bank.push(item.bank);
    money.push(item.settlementAmount);
  });
  $("#downForm [name=name]").val(name.join(","));
  $("#downForm [name=mobile]").val(mobile.join(","));
  $("#downForm [name=idCard]").val(idCard.join(","));
  $("#downForm [name=bankCard]").val(bankCard.join(","));
  $("#downForm [name=bank]").val(bank.join(","));
  $("#downForm [name=money]").val(money.join(","));
  $("#downForm [name=co_need]").val(resData.co_need);
  $("#downForm [name=fkId]").val(resData.id);
  $("#downForm [name=createDate]").val(resData.createDate);
  downForm.action = "../excel/payDetail";
  downForm.target = document.getElementsByName("downFrame")[0];
  downForm.submit();
}

// function downloadExcel(fileName,obj){
// 	var cols=obj.config.cols[0];
// 	var fields=[];
// 	var titles=[];
// 	for(var i=0;i<cols.length;i++){
// 		if(cols[i].field!=undefined){
// 			fields.push(cols[i].field);
// 			titles.push(cols[i].title);
// 		}
// 	}
// 	$("#downForm [name=data]").val(JSON.stringify(resData));
// 	$("#downForm [name=fields]").val(fields.join(","));
// 	$("#downForm [name=titles]").val(titles.join(","));
// 	var url="download/export";
// 	if(fileName!=""&&fileName!=null&&fileName!=undefined){
// 		url+="?fileName="+fileName;
// 	}
// 	downForm.action=url;
// 	downForm.target=document.getElementsByName("downFrame")[0];
// 	downForm.submit();
// }

function getNowDate() {
  var myDate = new Date(new Date().getTime());
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  return year + "-" + mon + "-" + date;
}

function getSevenDaysBefore(date) {
  var myDate = new Date(date);
  myDate.setTime(myDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  if (mon < 10) {
    mon = "0" + mon;
  }
  var day = myDate.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  return year + "-" + mon + "-" + day;
}

function getNowDateWithMonthTwoLen() {
  var myDate = new Date(new Date().getTime());
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  if (mon < 10) {
    mon = "0" + mon;
  }
  var date = myDate.getDate();
  if (date < 10) {
    date = "0" + date;
  }
  return year + "-" + mon + "-" + date;
}

function getDateBtn(minTime, maxTime) {
  btns = ["clear", "confirm"];
  let now = getYmdHm();
  const parts = now.split("-");
  if (minTime.length == 10) {
    minTime = minTime + " 00:00:00";
  }
  if (maxTime.length == 10) {
    maxTime = maxTime + " 23:59:59";
  }
  if (now >= minTime && now <= maxTime) {
    console.log("yes");
    btns = ["clear", "now", "confirm"];
  }
  return btns;
}

//获取上月份
function getLastMonth() {
  var myDate = new Date(new Date().getTime());
  var year = myDate.getFullYear();
  var mon = myDate.getMonth();
  if (mon < 10) {
    mon = "0" + mon;
  }
  return year + "-" + mon;
}

function getNowDateTime() {
  var myDate = new Date(new Date().getTime());
  var year = myDate.getFullYear(); //获取当前年
  var mon = myDate.getMonth() + 1; //获取当前月
  var date = myDate.getDate(); //获取当前日
  var d = myDate.getHours();
  var m = myDate.getMinutes();
  var s = myDate.getSeconds();
  return year + "-" + mon + "-" + date + " " + d + ":" + m + ":" + s;
}

/**
 * +nfz分钟
 * */
function getNowDateTimeNYRSFADD1(nfz) {
  var myDate = new Date(new Date().getTime());
  var year = myDate.getFullYear(); //获取当前年
  var mon = myDate.getMonth() + 1; //获取当前月
  var date = myDate.getDate(); //获取当前日
  var d = myDate.getHours();
  var m = myDate.getMinutes() + nfz;
  if (mon < 10) {
    mon = "0" + mon;
  }
  if (date < 10) {
    date = "0" + date;
  }
  if (d < 10) {
    d = "0" + d;
  }
  if (m < 10) {
    m = "0" + m;
  }
  return year + "-" + mon + "-" + date + " " + d + ":" + m;
}
function getNowDateTimeTwo(newDate) {
  var time = "";
  var newTime = parseInt(newDate);
  var myDate = new Date(newTime);
  var year = myDate.getFullYear(); //获取当前年
  var mon = myDate.getMonth() + 1; //获取当前月
  var date = myDate.getDate(); //获取当前日
  var d = myDate.getHours();
  var m = myDate.getMinutes();
  if (mon < 10) {
    mon = "0" + mon;
  }
  if (date < 10) {
    date = "0" + date;
  }
  if (d < 10) {
    d = "0" + d;
  }
  if (m < 10) {
    m = "0" + m;
  }
  time = year + "-" + mon + "-" + date + " " + d + ":" + m;
  return time;
}
/**
 * 获取当前项目路径
 * */
function getContextPath() {
  var pathName = document.location.pathname;
  var index = pathName.substr(1).indexOf("/");
  var result = pathName.substr(0, index + 1);
  return result;
}

/**
 * 兼容ios时间
 * */
function testIosTime(time) {
  // time 值为 2022-03-12 11:36
  time = time.replace(/-/g, "/"); //先转格式
  var date = new Date(time); //再转Date
  var diff = new Date(date.getTime()); //最后获取毫秒
}

function nowDateTimeTwo(time) {
  var myDate = new Date(time);
  var year = myDate.getFullYear(); //获取当前年
  var mon = myDate.getMonth() + 1; //获取当前月
  var date = myDate.getDate(); //获取当前日
  var d = myDate.getHours();
  var m = myDate.getMinutes();
  if (mon < 10) {
    mon = "0" + mon;
  }
  if (date < 10) {
    date = "0" + date;
  }
  if (d < 10) {
    d = "0" + d;
  }
  if (m < 10) {
    m = "0" + m;
  }
  return year + "-" + mon + "-" + date + " " + d + ":" + m;
}

function getYmdHm() {
  var myDate = new Date(new Date().getTime());
  var year = myDate.getFullYear(); //获取当前年
  var mon = myDate.getMonth() + 1; //获取当前月
  var date = myDate.getDate(); //获取当前日
  var d = myDate.getHours();
  var m = myDate.getMinutes();
  var s = myDate.getSeconds();
  if (mon < 10) {
    mon = "0" + mon;
  }
  if (s < 10) {
    s = "0" + s;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (d < 10) {
    d = "0" + d;
  }
  return year + "-" + mon + "-" + date + " " + d + ":" + m + ":" + s;
}

function getDate() {
  var myDate = new Date();
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  var h = myDate.getHours();
  var m = myDate.getMinutes();
  return year + "年" + mon + "月" + date + "日 " + h + ":" + m;
}

function getBeforeDay(day) {
  var myDate = new Date(new Date().getTime() - day * 24 * 60 * 60 * 1000);
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  return year + "-" + mon + "-" + date;
}

function getAfterDay(day) {
  var myDate = new Date(new Date().getTime() + day * 24 * 60 * 60 * 1000);
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  return year + "-" + mon + "-" + date;
}

function getArroundDay(d, day) {
  var myDate = new Date(new Date(d).getTime() + day * 24 * 60 * 60 * 1000);
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  return year + "-" + mon + "-" + date;
}

function getArroundDay2(d, day) {
  var myDate = new Date(new Date(d).getTime() + day * 24 * 60 * 60 * 1000);
  var s = "yyyy-MM-dd";
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  if (mon < 10) {
    mon = "0" + mon;
  }
  if (date < 10) {
    date = "0" + date;
  }
  var ss = year + "-" + mon + "-" + date;
  $("[name=minData]").val(ss.toString());
  return ss;
}

function nowDate() {
  return timeString;
}

function timeChange(time) {
  var date = time.substr(0, 10); //年月日
  var hours = time.substring(11, 13);
  var minutes = time.substring(14, 16);
  var seconds = time.substring(17, 19);
  var timeFlag = date + " " + hours + ":" + minutes + ":" + seconds;
  timeFlag = timeFlag.replace(/-/g, "/");
  timeFlag = new Date(timeFlag);
  timeFlag = new Date(timeFlag.getTime() + 8 * 3600 * 1000);
  timeFlag =
    timeFlag.getFullYear() +
    "-" +
    (timeFlag.getMonth() + 1 < 10
      ? "0" + (timeFlag.getMonth() + 1)
      : timeFlag.getMonth() + 1) +
    "-" +
    (timeFlag.getDate() < 10 ? "0" + timeFlag.getDate() : timeFlag.getDate()) +
    " " +
    timeFlag.getHours() +
    ":" +
    timeFlag.getMinutes() +
    ":" +
    (timeFlag.getSeconds() < 10
      ? "0" + timeFlag.getSeconds()
      : timeFlag.getSeconds());
  return timeFlag;
}
//时间日期转换成string
/*function data_string(str, value) {
    if (value == "yyyy-MM-dd hh:mm:ss") {
        var d = eval('new ' + str.substr(1, str.length - 2));
        var ar_date = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
        for (var i = 0; i < ar_date.length; i++) ar_date[i] = dFormat(ar_date[i]);
        return ar_date.slice(0, 3).join('-') + ' ' + ar_date.slice(3).join(':');
        function dFormat(i) { return i < 10 ? "0" + i.toString() : i; }
    }
    else if (value == "yyyy-MM-dd") {
        var d = eval('new ' + str.substr(1, str.length - 2));
        var ar_date = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
        for (var i = 0; i < ar_date.length; i++) ar_date[i] = dFormat(ar_date[i]);
        return ar_date.join('-');
        function dFormat(i) { return i < 10 ? "0" + i.toString() : i; }
    }
}*/

//时间日期转换成string
function data_string(str, value) {
  if (value == "yyyy-MM-dd hh:mm:ss") {
    var d = eval("new " + str.substr(1, str.length - 2));
    var ar_date = [
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ];
    for (var i = 0; i < ar_date.length; i++) ar_date[i] = dFormat(ar_date[i]);
    return ar_date.slice(0, 3).join("-") + " " + ar_date.slice(3).join(":");

    function dFormat(i) {
      return i < 10 ? "0" + i.toString() : i;
    }
  } else if (value == "yyyy-MM-dd") {
    var d = eval("new " + str.substr(1, str.length - 2));
    var ar_date = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    for (var i = 0; i < ar_date.length; i++) ar_date[i] = dFormat(ar_date[i]);
    return ar_date.join("-");

    function dFormat(i) {
      return i < 10 ? "0" + i.toString() : i;
    }
  }
}

function getMaxDate() {
  var myDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  return year + "-" + mon + "-" + date;
}

function getYesterdayDate() {
  var myDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  var year = myDate.getFullYear();
  var mon = myDate.getMonth() + 1;
  var date = myDate.getDate();
  return year + "-" + mon + "-" + date;
}

function yl(fileUrl) {
  var t = fileUrl.substring(fileUrl.lastIndexOf(".") + 1);
  fileUrl = fileUrl + "?v=" + Math.random();
  if (
    t.compare("doc") ||
    t.compare("docx") ||
    t.compare("xls") ||
    t.compare("xlsx") ||
    t.compare("ppt") ||
    t.compare("pptx")
  ) {
    //word excel用这个预览
    //window.open("https://view.officeapps.live.com/op/view.aspx?src="+fileUrl);
    layer.open({
      type: 2,
      title: "文件预览",
      area: ["90%", "90%"],
      offset: ["5%", "5%"],
      //content:"http://view.xdocin.com/xdoc?_xdoc="+fileUrl
      //content:"https://api.idocv.com/view/url?url="+fileUrl
      content: "https://view.officeapps.live.com/op/view.aspx?src=" + fileUrl,
      //content:"https://api.idocv.com/view/url?url="+fileUrl
    });
  } else if (t.compare("pdf")) {
    //ppt 可以直接浏览器打开
    //window.open(fileUrl);
    layer.open({
      type: 2,
      title: "文件预览",
      area: ["90%", "90%"],
      offset: ["5%", "5%"],
      content: fileUrl,
    });
  } else if (t.compare("jpg") || t.compare("png") || t.compare("jpeg")) {
    // 记录当前时间戳
    var start_time = new Date().getTime();
    // 图片地址
    var img_url = fileUrl + "?" + start_time;
    // 创建对象
    var img = new Image();
    // 改变图片的src
    img.src = img_url;
    // 定时执行获取宽高
    var check = function () {
      // 只要任何一方大于0
      // 表示已经服务器已经返回宽高
      if (img.width > 0 || img.height > 0) {
        var diff = new Date().getTime() - start_time;
        var w = img.width;
        var h = img.height;
        if (w > h) {
          w = window.innerWidth * 0.8;
          h = (window.innerWidth * 0.8 * h) / img.width;
        } else {
          h = window.innerHeight * 0.8;
          w = (window.innerHeight * 0.8 * w) / img.height;
        }
        var w2 = w;
        h = (window.innerHeight - h) / 2;
        w = ($(document).width() - w) / 2;
        imgIndex = layer.open({
          type: 1,
          title: false,
          moveOut: true,
          closeBtn: 0,
          zIndex: 99999999,
          //area:w2+'px',
          offset: [h, w],
          content:
            "<img src=" +
            img_url +
            '  style="width:' +
            w2 +
            'px"  onclick="layer.close(imgIndex)">',
        });
        clearInterval(set);
      }
    };
    var set = setInterval(check, 40);
  } else {
    layer.msg("该文件类型不支持预览！", { icon: 0 });
  }
}

function yl_mobile(fileUrl) {
  var t = fileUrl.substring(fileUrl.lastIndexOf(".") + 1);
  fileUrl = fileUrl + "?v=" + Math.random();
  if (
    t.compare("doc") ||
    t.compare("docx") ||
    t.compare("xls") ||
    t.compare("xlsx") ||
    t.compare("ppt") ||
    t.compare("pptx") ||
    t.compare("txt")
  ) {
    //word excel用这个预览
    //暂不提供预览
    return false;
    layer.open({
      type: 2,
      title: "文件预览",
      skin: "layui-layer-molv",
      area: ["90%", "80%"], //宽高
      offset: ["10%", "5%"],
      //content:"https://view.officeapps.live.com/op/view.aspx?src="+fileUrl
      //	content:"http://view.xdocin.com/xdoc?_xdoc="+fileUrl
      content: "https://api.idocv.com/view/url?url=" + fileUrl,
      //content:'<iframe   width="100%"   height="100%"    frameborder="0" allowtransparency="true" src=https://view.officeapps.live.com/op/view.aspx?src='+fileUrl+'  ></iframe>'
    });
  } else if (t.compare("pdf")) {
    //pdf 可以直接浏览器打开
    /*layer.open({
            type:2,
            title:false,
            skin:'layui-layer-molv',
            area: ['90%','90%'], //宽高
            content:fileUrl
        })*/
    //暂不提供预览
    return false;
    top.layer.open({
      type: 2,
      title: "文件内容",
      area: ["100%", "100%"], //宽高
      //content:"https://view.officeapps.live.com/op/view.aspx?src="+fileUrl
      //content:"https://api.idocv.com/view/url?url="+fileUrl
      //content:"http://view.xdocin.com/xdoc?_xdoc="+fileUrl
      content: fileUrl,
      // https://jlf-test.oss-cn-beijing.aliyuncs.com/PROJECT_APPENDIX/1609134609929/1609293583359.xlsx
      //content:'<iframe style="width:100%;height:100%;border:none;outline:none;display:none" src="https://view.officeapps.live.com/op/view.aspx?src='+fileUrl+'"></iframe>'
    });
  } else if (t.compare("jpg") || t.compare("png") || t.compare("jpeg")) {
    // 记录当前时间戳
    var start_time = new Date().getTime();
    // 图片地址
    var img_url = fileUrl + "?" + start_time;
    // 创建对象
    var img = new Image();
    // 改变图片的src
    img.src = img_url;
    // 定时执行获取宽高
    var check = function () {
      // 只要任何一方大于0
      // 表示已经服务器已经返回宽高
      if (img.width > 0 || img.height > 0) {
        var diff = new Date().getTime() - start_time;
        var w = img.width;
        var h = img.height;
        if (w > h) {
          w = window.innerWidth * 0.8;
          h = (window.innerWidth * 0.8 * h) / img.width;
        } else {
          h = window.innerHeight * 0.8;
          w = (window.innerHeight * 0.8 * w) / img.height;
        }
        var w2 = w;
        h = (window.innerHeight - h) / 2;
        w = ($(document).width() - w) / 2;
        imgIndex = layer.open({
          type: 1,
          title: false,
          moveOut: true,
          closeBtn: 0,
          zIndex: 99999999,
          //area:w2+'px',
          offset: [h, w],
          content:
            "<img src=" +
            img_url +
            '  style="width:' +
            w2 +
            'px"   onclick="layer.close(imgIndex)" >',
        });
        clearInterval(set);
      }
    };
    var set = setInterval(check, 40);
  } else {
    layer.msg("该文件类型不支持预览！", { icon: 0 });
  }
}

/**
 * 检索数据
 * @param str 数据
 * @param type 类型
 * */
function retrieveDataInfo(str, type) {
  var flag;
  if ("all" == type) {
    // retrieve = /[^\u0000-\u00ff]/g;
    flag = new RegExp(
      "[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@＃￥……&*（）——|{}【】‘；：”“'。，、？]"
    );
  } else if ("allTempOne" == type) {
    // 比all少了，,、。？
    flag = new RegExp(
      "[`~!@#$^&*()=|{}':;'\\[\\].<>/?~！@＃￥……&*（）——|{}【】‘；：”“']"
    );
  } else if ("warningSemicolon" == type) {
    flag = new RegExp("[#;＃；]");
  } else if ("semicolon" == type) {
    flag = new RegExp("[;；]");
  } else if ("warning" == type) {
    flag = new RegExp("[#＃]");
  }
  return flag.test(str);
}

//第一个参数就是原来的字符串，第二个是宽度，第三个就是回调方法
function cutImageBase6420(base64, w, fileSize) {
  if ($(".myImg").length >= 20) {
    layer.msg("照片数量超过限制20", { icon: 0 });
    return false;
  }
  loadIndex = layer.load();

  //如果小于100kb就不压缩了
  if (fileSize <= 102400) {
    loadPicture20(base64);
    return false;
  }

  var newImage = new Image();
  var quality = 0.6; //压缩系数0-1之间
  newImage.src = base64;
  newImage.setAttribute("crossOrigin", "Anonymous"); //url为外域时需要
  var imgWidth, imgHeight;
  newImage.onload = function () {
    imgWidth = this.width;
    imgHeight = this.height;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (Math.max(imgWidth, imgHeight) > w) {
      if (imgWidth > imgHeight) {
        canvas.width = w;
        canvas.height = (w * imgHeight) / imgWidth;
      } else {
        canvas.height = w;
        canvas.width = (w * imgWidth) / imgHeight;
      }
    } else {
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      quality = 0.6;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句
    // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
    while (base64.length / 1024 > 150) {
      quality -= 0.01;
      base64 = canvas.toDataURL("image/jpeg", quality);
    }
    // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
    while (base64.length / 1024 < 50) {
      quality += 0.001;
      base64 = canvas.toDataURL("image/jpeg", quality);
    }
    //callback(base64);//必须通过回调函数返回，否则无法及时拿到该值
    loadPicture20(base64);
  };
}

/**
 * 拜访巡访，提示信息需要特殊处理
 * @param base64
 * @param w
 * @param fileSize
 * @param divIndex
 * @param imgNum
 * @returns {boolean}
 */
function cutImageBase64CheckInfo(base64, w, fileSize, divIndex, imgNum) {
  if ($(".myImgIndex" + divIndex).length > imgNum - 1) {
    layer.msg("最多可上传【" + imgNum + "】张", { icon: 0 });
    return false;
  }
  cutImageBase64(base64, w, fileSize, divIndex, imgNum);
}

//第一个参数就是原来的字符串，第二个是宽度，第三个就是回调方法，第四个照片回显div
function cutImageBase64(base64, w, fileSize, divIndex, imgNum) {
  if (imgNum == null || imgNum == "") {
    imgNum = 8;
  } else {
    imgNum = imgNum - 1;
  }
  if (divIndex != null) {
    if ($(".myImgIndex" + divIndex).length > imgNum) {
      layer.msg("照片数量超过限制", { icon: 0 });
      return false;
    }
  } else {
    if ($(".myImg").length > imgNum) {
      layer.msg("照片数量超过限制", { icon: 0 });
      return false;
    }
  }
  loadIndex = layer.load();

  //如果小于100kb就不压缩了
  if (fileSize <= 102400) {
    loadPicture(base64, divIndex);
    return false;
  }

  var newImage = new Image();
  var quality = 0.75; //压缩系数0-1之间
  newImage.src = base64;
  newImage.setAttribute("crossOrigin", "Anonymous"); //url为外域时需要
  var imgWidth, imgHeight;
  newImage.onload = function () {
    imgWidth = this.width;
    imgHeight = this.height;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (Math.max(imgWidth, imgHeight) > w) {
      if (imgWidth > imgHeight) {
        canvas.width = w;
        canvas.height = (w * imgHeight) / imgWidth;
      } else {
        canvas.height = w;
        canvas.width = (w * imgWidth) / imgHeight;
      }
    } else {
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      quality = 0.6;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句
    // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
    while (base64.length / 1024 > 150) {
      quality -= 0.01;
      base64 = canvas.toDataURL("image/jpeg", quality);
    }
    // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
    // while (base64.length / 1024 < 50) {
    //     quality += 0.001;
    //     base64 = canvas.toDataURL("image/jpeg", quality);
    // }
    //callback(base64);//必须通过回调函数返回，否则无法及时拿到该值
    loadPicture(base64, divIndex);
  };
}

/**
 * 压缩Base64格式的图片
 * @param {string} base64 - 图片的Base64编码
 * @param {number} maxSize - 压缩后的图片最大大小，默认为100KB
 * @returns {Promise} - 返回一个Promise对象，resolve时提供压缩后的Base64编码，reject时提供错误信息
 */
function compressImage(base64, maxSize = 100 * 1024) {
  return new Promise((resolve, reject) => {
    // 创建Image对象
    const img = new Image();
    // 设置图片源为Base64编码
    img.src = base64;

    // 图片加载成功后执行压缩
    img.onload = () => {
      // 创建canvas元素
      const canvas = document.createElement("canvas");
      // 获取canvas的2D绘图环境
      const ctx = canvas.getContext("2d");

      // 初始化压缩参数
      let width = img.width;
      let height = img.height;
      let quality = 0.9;

      // 设置canvas尺寸与图片相同
      canvas.width = width;
      canvas.height = height;

      // 将图片绘制到canvas上
      ctx.drawImage(img, 0, 0, width, height);

      // 定义压缩函数
      const compress = () => {
        // 将canvas内容转换为Base64编码的JPEG图片
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);

        // 计算当前图片大小
        const size = compressedBase64.length * 0.75; // Base64编码后大小约为原文件的1.33倍

        // 如果压缩后的图片大小符合要求，则resolve
        if (size <= maxSize) {
          resolve(compressedBase64);
        } else {
          // 调整压缩质量参数
          quality -= 0.1;
          // 如果质量参数降到0以下，则reject
          if (quality <= 0) {
            reject("无法压缩到指定大小");
            return;
          }

          // 清空canvas并重新绘制图片以进行下一轮压缩
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          compress();
        }
      };

      // 开始压缩
      compress();
    };

    // 图片加载失败时reject
    img.onerror = (err) => {
      reject(err);
    };
  });
}

//第一个参数就是原来的字符串，第二个是宽度，第三个就是回调方法
function cutImageBase64Mb(base64, w, fileSize) {
  if ($(".myImg").length > 8) {
    layer.msg("照片数量超过限制", { icon: 0 });
    return false;
  }
  loadIndex = layer.load();

  //如果小于100kb就不压缩了
  if (fileSize <= 1024000) {
    loadPicture(base64);
    return false;
  }

  var newImage = new Image();
  var quality = 0.75; //压缩系数0-1之间
  newImage.src = base64;
  newImage.setAttribute("crossOrigin", "Anonymous"); //url为外域时需要
  var imgWidth, imgHeight;
  newImage.onload = function () {
    imgWidth = this.width;
    imgHeight = this.height;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (Math.max(imgWidth, imgHeight) > w) {
      if (imgWidth > imgHeight) {
        canvas.width = w;
        canvas.height = (w * imgHeight) / imgWidth;
      } else {
        canvas.height = w;
        canvas.width = (w * imgWidth) / imgHeight;
      }
    } else {
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      quality = 0.6;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句
    // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
    while (base64.length / 1024 > 150) {
      quality -= 0.01;
      base64 = canvas.toDataURL("image/jpeg", quality);
    }
    // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
    // while (base64.length / 1024 < 50) {
    //     quality += 0.001;
    //     base64 = canvas.toDataURL("image/jpeg", quality);
    // }
    //callback(base64);//必须通过回调函数返回，否则无法及时拿到该值
    loadPicture(base64);
  };
}

//
// function cutImageBase64(base64, w,fileSize) {
//     if ($(".myImg").length > 8) {
//         layer.msg("照片数量超过限制", {icon: 0});
//         return false;
//     }
//     loadIndex = layer.load();
//
//     //如果小于100kb就不压缩了
//     if (fileSize <= 102400) {
//         loadPicture(base64);
//         return false;
//     }
//
//     var newImage = new Image();
//     var quality = 0.6;    //压缩系数0-1之间
//     newImage.src = base64;
//     newImage.setAttribute("crossOrigin", 'Anonymous');  //url为外域时需要
//     var imgWidth, imgHeight;
//     newImage.onload = function () {
//         imgWidth = this.width;
//         imgHeight = this.height;
//         var canvas = document.createElement("canvas");
//         var ctx = canvas.getContext("2d");
//         if (Math.max(imgWidth, imgHeight) > w) {
//             if (imgWidth > imgHeight) {
//                 canvas.width = w;
//                 canvas.height = w * imgHeight / imgWidth;
//             } else {
//                 canvas.height = w;
//                 canvas.width = w * imgWidth / imgHeight;
//             }
//         } else {
//             canvas.width = imgWidth;
//             canvas.height = imgHeight;
//             quality = 0.6;
//         }
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
//         var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句
//         // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
//         while (base64.length / 1024 > 150) {
//             quality -= 0.01;
//             base64 = canvas.toDataURL("image/jpeg", quality);
//         }
//         // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
//         while (base64.length / 1024 < 50) {
//             quality += 0.001;
//             base64 = canvas.toDataURL("image/jpeg", quality);
//         }
//         //callback(base64);//必须通过回调函数返回，否则无法及时拿到该值
//         loadPicture(base64);
//     }
// }

function compress(base64, w, fileSize, back) {
  //如果小于100kb就不压缩了
  if (fileSize <= 102400) {
    //return false;
  }
  var newImage = new Image();
  var quality = 0.6; //压缩系数0-1之间
  newImage.src = base64;
  newImage.setAttribute("crossOrigin", "Anonymous"); //url为外域时需要
  var imgWidth, imgHeight;
  newImage.onload = function () {
    imgWidth = this.width;
    imgHeight = this.height;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (Math.max(imgWidth, imgHeight) > w) {
      if (imgWidth > imgHeight) {
        canvas.width = w;
        canvas.height = (w * imgHeight) / imgWidth;
      } else {
        canvas.height = w;
        canvas.width = (w * imgWidth) / imgHeight;
      }
    } else {
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      quality = 0.6;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
    var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句
    // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
    while (base64.length / 1024 > 150) {
      quality -= 0.01;
      base64 = canvas.toDataURL("image/jpeg", quality);
    }
    // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
    while (base64.length / 1024 < 50) {
      quality += 0.001;
      base64 = canvas.toDataURL("image/jpeg", quality);
    }
    back(base64); //必须通过回调函数返回，否则无法及时拿到该值
  };
}

function closeImg() {
  layer.close(ylImgIndex);
}

function loadPicture(src, divIndex) {
  if (divIndex != null) {
    if ($(".myImgIndex" + divIndex).length > 8) {
      layer.msg("照片数量超过限制", { icon: 0 });
      return false;
    }
  } else {
    if ($(".myImg").length > 8) {
      layer.msg("照片数量超过限制", { icon: 0 });
      return false;
    }
  }
  loadPictureForDom(src, divIndex);
}

function loadPicture20(src) {
  if ($(".myImg").length > 19) {
    layer.msg("照片数量超过限制", { icon: 0 });
    return false;
  }
  loadPictureForDom(src);
}

function loadPictureForDom(src, divIndex) {
  let delBase64 = src.replace("data:image/jpeg;base64,", "");
  delBase64 = delBase64.replace("data:image/png;base64,", "");
  //float:left;padding:3px;position:relative;width:31%;height:80px
  if (divIndex != null) {
    let imgHtml =
      "<div style='float:left;position:relative;width:28%;margin-left:4%;height:80px'><input type='hidden' name='pictures" +
      divIndex +
      "' value='" +
      delBase64 +
      "' ><img class='myImg myImgIndex" +
      divIndex +
      "' src='" +
      src +
      "' width='100%'  height='100%'><img style='display:none' src='" +
      src +
      "'><i class='fa fa-close' style='position:absolute;top:-7px;right:-7px;color:red;font-size:20px'></i></div>";
    $("#picQuote" + divIndex).append(imgHtml);
    $("#picNum" + divIndex).html($(".myImgIndex" + divIndex).length);
  } else {
    let imgHtml =
      "<div style='float:left;position:relative;width:28%;margin-left:4%;height:80px'><input type='hidden' name='pictures' value='" +
      delBase64 +
      "' ><img class='myImg' src='" +
      src +
      "' width='100%'  height='100%'><img style='display:none' src='" +
      src +
      "'><i class='fa fa-close' style='position:absolute;top:-7px;right:-7px;color:red;font-size:20px'></i></div>";
    $("#picQuote").append(imgHtml);
    $("#picNum").html($(".myImg").length);
  }
}

function syncAjax(fn) {
  $.ajaxSettings.async = false;
  fn();
  $.ajaxSettings.async = true;
}

function initLocation() {
  loadIndex = layer.load();
  var geolocation = new qq.maps.Geolocation();
  geolocation.getLocation(
    function (position) {
      layer.close(loadIndex);
      let src = $("#geoPage").attr("src");
      $("#geoPage").attr(
        "src",
        src + "&coord=" + position.lat + "," + position.lng
      );
    },
    function (e) {
      layer.close(loadIndex);
    },
    { timeout: 5000 }
  );
}

function initLocation(fn) {
  loadIndex = layer.load();
  var geolocation = new qq.maps.Geolocation();
  geolocation.getLocation(
    function (position) {
      layer.close(loadIndex);
      fn();
      let src = $("#geoPage").attr("src");
      if (src.indexOf("&coord") > 0) {
        src = src.split("&coord")[0];
      }
      $("#geoPage").attr(
        "src",
        src + "&coord=" + position.lat + "," + position.lng
      );
      //timeout_2000(fn());
      // setTimeout(()=>{
      // 	layer.close(loadIndex);
      // 	fn()
      // },2000)
    },
    function (e) {
      layer.close(loadIndex);
      if (e.code) {
        if (e.code == 5) {
          //layer.msg("获取定位超时！请刷新再试！");
          layer.msg("定位失败！请开启位置服务！");
        } else if (e.code == 1) {
          layer.msg("定位失败！请开启位置服务！");
        } else if (e.code == 2) {
          layer.msg("应用程序没有足够的地理位置权限！");
        } else {
          layer.msg(JSON.stringify(e));
        }
      } else {
        layer.msg("定位失败！");
      }
      //目前添加是方便电脑端测试，后续删除
      //fn()
    },
    { timeout: 5000 }
  );
}

function initLocation_gaode() {
  loadIndex = layer.load();
  AMap.plugin("AMap.Geolocation", function () {
    var geolocation = new AMap.Geolocation({
      enableHighAccuracy: true, //是否使用高精度定位，默认:true
      timeout: 5000, //超过3秒后停止定位，默认：5s
    });
    geolocation.getCurrentPosition(function (status, result) {
      layer.close(loadIndex);
      if (status == "complete") {
        onComplete(result);
      } else {
        onError(result);
      }
    });
  });
}

//解析定位结果
function onComplete(data) {
  layer.close(loadIndex);
  var src = $("#geoPage").attr("src");
  $("#geoPage").attr(
    "src",
    src + "&coord=" + data.position.getLat() + "," + data.position.getLng()
  );
}

//解析定位错误信息
function onError(data) {
  layer.close(loadIndex);
  // layer.msg("定位失败！" + data.message);
}

function initLocation_baidu() {
  loadIndex = layer.load();
  var geolocation = new BMap.Geolocation();
  geolocation.enableSDKLocation();
  geolocation.getCurrentPosition(
    function (r) {
      layer.close(loadIndex);
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        layer.msg("我是百度定位");
        var src = $("#geoPage").attr("src");
        $("#geoPage").attr(
          "src",
          src + "&coord=" + r.point.lat + "," + r.point.lng
        );
      } else {
        layer.msg("定位失败：" + this.getStatus());
      }
    },
    { enableHighAccuracy: true, timeout: 5000 }
  );
}

function compressImg(file, callback) {
  // 压缩图片需要的一些元素和对象
  var reader = new FileReader(),
    //创建一个img对象
    img = new Image();
  reader.readAsDataURL(file);
  // 文件base64化，以便获知图片原始尺寸
  reader.onload = function (e) {
    img.src = e.target.result;
  };
  // base64地址图片加载完毕后执行
  img.onload = function () {
    // 缩放图片需要的canvas（也可以在DOM中直接定义canvas标签，这样就能把压缩完的图片不转base64也能直接显示出来）
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    // 图片原始尺寸
    var originWidth = this.width;
    var originHeight = this.height;
    // 最大尺寸限制，可通过设置宽高来实现图片压缩程度
    var maxWidth = 1000,
      maxHeight = 1000;
    // 目标尺寸
    var targetWidth = originWidth,
      targetHeight = originHeight;
    // 图片尺寸超过300x300的限制
    if (originWidth > maxWidth || originHeight > maxHeight) {
      if (originWidth / originHeight > maxWidth / maxHeight) {
        // 更宽，按照宽度限定尺寸
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      } else {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
      }
    }
    // canvas对图片进行缩放
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    // 清除画布
    context.clearRect(0, 0, targetWidth, targetHeight);
    // 图片压缩
    context.drawImage(img, 0, 0, targetWidth, targetHeight);
    /*第一个参数是创建的img对象；第二三个参数是左上角坐标，后面两个是画布区域宽高*/
    //压缩后的图片转base64 url
    /*canvas.toDataURL(mimeType, qualityArgument),mimeType 默认值是'image/png';
     * qualityArgument表示导出的图片质量，只有导出为jpeg和webp格式的时候此参数才有效，默认值是0.92*/
    var newUrl = canvas.toDataURL("image/jpeg", 0.85); //base64 格式
    //return newUrl;
    callback(newUrl);
  };
}

String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2);
};

String.prototype.endWith = function (oString) {
  var reg = new RegExp(oString + "$");
  return reg.test(this);
};

function openMaxLayerByDom(title, $dom) {
  return layer.open({
    type: 1,
    title: title,
    skin: "layui-layer-blank",
    content: $dom,
    area: ["100%", "100%"],
  });
}

Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

function copyUrl(text) {
  text = decodeURIComponent(text);
  if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
    //ios系统
    window.getSelection().removeAllRanges(); //这段代码必须放在前面否则无效
    let inputDom = document.createElement("input");
    //let copyDom = document.getElementById("copyDom");//要复制文字的节点
    //copyDom.appendChild(inputDom);// 把标签添加给body
    document.body.appendChild(inputDom);

    inputDom.style.opacity = 0; //设置input标签设置为透明(不可见)
    inputDom.value = text; // 修改文本框的内容
    let range = document.createRange();
    // 选中需要复制的节点
    range.selectNode(inputDom);
    // 执行选中元素
    window.getSelection().addRange(range);
    inputDom.select();
    inputDom.setSelectionRange(0, inputDom.value.length); //适配高版本ios
    // 执行 copy 操作
    let successful = document.execCommand("copy");
    let messageText = successful ? "成功复制到剪贴板" : "复制失败！";
    layer.msg(messageText);
    // 移除选中的元素
    window.getSelection().removeAllRanges();
    document.body.removeChild(inputDom);
  } else {
    //其他系统
    let inputDom = document.createElement("input");
    //let copyDom = document.getElementById('copyDom')
    //copyDom.appendChild(inputDom);// 把标签添加给body
    document.body.appendChild(inputDom);

    inputDom.style.opacity = 0; //设置input标签设置为透明(不可见)
    inputDom.value = text; // 修改文本框的内容
    inputDom.select(); // 选中文本
    // 执行选中元素
    let successful = document.execCommand("copy"); // 执行浏览器复制命令
    let messageText = successful ? "成功复制到剪贴板" : "复制失败！";
    layer.msg(messageText);
    document.body.removeChild(inputDom);
  }
}
// var tempInput = document.createElement("input");
// tempInput.value = text;
// document.body.appendChild(tempInput);
// tempInput.select();
// document.execCommand("copy");
// document.body.removeChild(tempInput);
/*
copyTextValue = function (text) {
    console.log(text)
    // 创建一个临时的textarea元素
   /!* const textarea = document.createElement("input");
    textarea.value = text;
    document.body.appendChild(textarea);
    // 选中临时textarea中的内容
    textarea.select();
    textarea.setSelectionRange(0, 99999); // 兼容一些浏览器
    // 执行复制操作
    document.execCommand("copy");
    // 移除临时textarea
    document.body.removeChild(textarea);*!/
    var tempInput = document.createElement("input");
tempInput.value = text;
document.body.appendChild(tempInput);
tempInput.select();
document.execCommand("copy");
document.body.removeChild(tempInput);
    layer.msg("复制成功")
    /!*that.$message({
        showClose: true,
        type: 'warning',
        message: '企业认证后才可以由管理员上传企业LOGO!'
    })*!/
}
*/
/**
 * 复制要剪切板
 * @param text 需要复制的字符串
 */
function copyToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      layer.msg("复制成功!");
    },
    function (err) {
      layer.msg("复制失败!");
    }
  );
}

function fallbackCopyTextToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    console.log(`Fallback: Copying text command was ${msg}`);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textarea);
}

// function copyUrl(text) {
// 	var textArea = document.createElement("textarea");
// 	textArea.style.position = 'fixed';
// 	textArea.style.top = '0';
// 	textArea.style.left = '0';
// 	textArea.style.width = '2em';
// 	textArea.style.height = '2em';
// 	textArea.style.padding = '0';
// 	textArea.style.border = 'none';
// 	textArea.style.outline = 'none';
// 	textArea.style.boxShadow = 'none';
// 	textArea.style.background = 'transparent';
// 	textArea.value = text;
// 	document.body.appendChild(textArea);
// 	textArea.select();
// 	try {
// 	var successful = document.execCommand('copy');
// 	var msg = successful ? '成功复制到剪贴板' : '该浏览器不支持点击复制到剪贴板';
// 	layer.msg(msg);
// 	} catch (err) {
// 	alert('该浏览器不支持点击复制到剪贴板');
// 	}
// 	document.body.removeChild(textArea);
// }

//接受url传来的参数
function getParameter(param) {
  var query = window.location.search;
  var iLen = param.length;
  var iStart = query.indexOf(param);
  if (iStart == -1) return "";
  iStart += iLen + 1;
  var iEnd = query.indexOf("&", iStart);
  if (iEnd == -1) return decodeURIComponent(query.substring(iStart));
  return decodeURIComponent(query.substring(iStart, iEnd));
}

function zzsOnEvent(t) {
  t.value = t.value.replace(/\D/g, "");
}

//项目金额模糊化
function fwjeVague(je) {
  // if (je < 500000) {
  //     return "50万以内";
  // } else if (je < 1000000) {
  //     return "100万以内";
  // } else if (je < 2000000) {
  //     return "200万以内";
  // } else {
  //     return "200万以上";
  // }
  if (je < 2000000) {
    return "200万以内";
  } else {
    let count = Math.ceil((je - 2000000) / 1000000) * 1000000;
    const allCount = (2000000 + count) / 10000;
    return `${allCount}万以内`;
  }
}

function sensitiveDataHandle(param, type) {
  var strlen = param.length;
  if (strlen < 9) {
    return param;
  }
  if (type == "bankcard") {
    return param.replace(/^(.{6}).+(.{4})$/g, "$1******$2");
  } else if (type == "idcard") {
    return param.replace(/^(.{6})(?:\d+)(.{4})$/, "$1****$2");
  } else if (type == "mobile") {
    return param.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  }
}

function downloadURL(url, name) {
  let link = document.createElement("a");
  link.download = name;
  link.href = url; //target="_blank"
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 保存到本地并自动点击
function saveAs(data, name) {
  const urlObject = window.URL || window.webkitURL || window;
  const export_blob = new Blob([data]);
  const save_link = document.createElementNS(
    "http://www.w3.org/1999/xhtml",
    "a"
  );
  save_link.href = urlObject.createObjectURL(export_blob);
  save_link.download = name;
  save_link.click();
}

// 下载含有url的文件
function downloadUrlFile(url, fileName) {
  const url2 = url.replace(/\\/g, "/");
  const xhr = new XMLHttpRequest();
  xhr.open("get", url2, true);
  //  xhr.responseType = 'blob';
  //xhr.setRequestHeader('Authorization', 'Basic a2VybWl0Omtlcm1pdA==');
  // 为了避免大文件影响用户体验，建议加loading
  xhr.onload = () => {
    if (xhr.status === 200) {
      // 获取文件blob数据并保存
      saveAs(xhr.response, fileName);
    }
  };
  xhr.send();
}

function displatPdf(path, os) {
  var urls = path.split("/");
  var count = urls.length;
  var urlName = urls[count - 1];
  var u = navigator.userAgent,
    isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1,
    isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    urls = {
      android: path,
      ios: path,
      other: path,
    };
  if (isAndroid) {
    window.location.href = urls.android;
  } else if (isiOS) {
    var obj = document.getElementById("links");
    obj.href = path;
    obj.click();
  } else {
    window.location.href = urls.other;
  }
  /*if (os){
        var a = path.split(";")
        downloadURL(path,a[a.length-1])
        // window.webkit.messageHandlers.BrowseFiles.postMessage(path);
    } else {
      //  console.log(os);
        //if(os=="iOS"){
        let myFrame = document.createElement('iframe');
        myFrame.src = path;
        myFrame.style.display = 'none';
        document.body.appendChild(myFrame);
        // }else{
        //有的浏览器这种方式也是下载
        // 	layer.open({
        // 		type:2,
        // 		title:"文件预览",
        // 		area:['100%','100%'],
        // 		//content:"../pdfjs/web/viewer.html?file=http://awen6.iok.la/lgb/download/readFile?url="+path
        // 		content:path
        // 	})
        // }
    }*/
}

/**
 * 判断任务范围方法
 * @param rule  工单规则
 * @param projectArea 任务规定地址
 * @param address 实施地址
 * @returns {boolean} true 在任务范围内， false 超出任务范围
 */
function checkProjectAddress(rule = "", projectArea = "", address = "") {
  // 判断 是否需要定位 并判断是否超出任务范围
  if (rule && rule === "1") {
    if (projectArea && projectArea !== "全国") {
      projectArea = projectArea.replace("-", "");
      if (address && address.indexOf(projectArea) === -1) {
        layer.msg("超出任务范围!", { icon: -1, time: 1500 });
        return false;
      }
    }
  }
  return true;
}

function getXy() {
  return window.location.href.substring(0, window.location.href.indexOf("://"));
}

function getDomain() {
  return document.domain == "localhost" ? "localhost:8080" : document.domain;
}

function getYqCallBackUrl() {
  return getRequestBaseUrl() + "/yq/templetCallback";
}

function getRequestBaseUrl() {
  var domain = window.location.hostname;
  var port = window.location.port;
  var domainWithPort = domain + (port ? ":" + port : "");
  var protocol = window.location.protocol;
  var fullUrl = protocol + "//" + domain + (port ? ":" + port : "");

  console.log("主机名:", domain);
  console.log("端口号:", port);
  console.log("主机名和端口号:", domainWithPort);
  console.log("完整URL:", fullUrl);
  return fullUrl + "/lgb";
}

function strIsEmpty(str) {
  if (str === "null") {
    return true;
  }
  if (str === "") {
    return true;
  }
  return !str;
}

function strIsNotEmpty(str) {
  return !strIsEmpty(str);
}

function checkSensitiveFont(words, text) {
  let textCopy = text;
  for (let i = 0; i < words.length; i++) {
    let key = words[i];
    if (strIsNotEmpty(key) && text.indexOf(key) !== -1) {
      text = text.replaceAll(
        key,
        "<span style='color: #ff0000;'>" + key + "</span>"
      );
      if (words !== textCopy) {
        textCopy = words;
      }
    }
  }
  return text;
}

function checkSensitiveFontHandle(str, str2, contrast) {
  let s = str;
  let ss = str;
  let sensitive = "";
  let s2 = str2;
  let ss2 = str2;
  let sensitive2 = "";
  let fontName = "";
  for (let i = 0; i < contrast.length; i++) {
    fontName += contrast[i]["name"] + ",";
  }
  fontName = fontName.substring(0, fontName.length - 1);
  let fn = fontName.split(",");
  // 敏感词检测
  // 标题敏感词检测
  s = checkSensitiveFont(fn, s);
  // 正文敏感词检测
  s2 = checkSensitiveFont(fn, s2);

  if (s != str || s2 != str2) {
    let h = "<div style='max-width: 400px;'><center>";
    if (s !== str) {
      h +=
        "<div class='layui-col-xs11 layui-col-sm11 layui-col-md11' style='margin: 5px 15px 5px 15px;font-size: 12px;'>" +
        "<span style='font-size: 18px;'>问卷标题：</span><br><span>" +
        s +
        "</span></div>";
    }
    if (s2 !== str2) {
      h +=
        "<div class='layui-col-xs11 layui-col-sm11 layui-col-md11' style='margin: 5px 15px 15px 15px;font-size: 12px;'>" +
        "<span style='font-size: 18px;'>调查说明：</span><br><span>" +
        s2 +
        "</span></div>";
    }
    h += "</center></div><br>";
    //自定页
    layer.open({
      type: 1,
      title: "触发敏感词",
      skin: "layui-layer-demo", //样式类名
      closeBtn: 1, //不显示关闭按钮
      anim: 2,
      content: h,
    });
    return true;
  } else {
    return false;
  }
}

imagesPreview = function (url) {
  top.layer.open({
    type: 1,
    title: "预览",
    closeBtn: 1,
    area: "500px",
    maxmin: true,
    shadeClose: true,
    shade: false,
    content: "<img src='" + url + "' style='width:100%;height:100%'>",
  });
};

function templateDisEditWarn() {
  layer.msg("当前模板正在使用，不可编辑或删除", { icon: 2 });
}

/**
 * 错误提示弹窗
 * @param msg
 */
function alertWarn(msg, callback = null) {
  layer.alert(msg, {
    closeBtn: 0,
    anim: 6,
    btn: ["确认"],
    title: "温馨提示",
    skin: "layui-layer-red",
    end: function () {
      if (callback != null) {
        callback();
      }
    },
  });
}

/**
 * js 时间戳的转换（自定义格式）
 * @param  date11 [创建 Date 对象]
 * @param  formatStr [日期格式]
 * @return (string) 日期时间
 */
function dataTimeformat(date11, formatStr) {
  if (strIsEmpty(date11)) {
    return date11;
  }
  let s = date11.replaceAll("-", "/");
  var date = new Date(s);
  var arrWeek = ["日", "一", "二", "三", "四", "五", "六"],
    str = formatStr
      .replace(/yyyy|YYYY/, date.getFullYear())
      .replace(/yy|YY/, addZero(date.getFullYear() % 100, 2))
      .replace(/mm|MM/, addZero(date.getMonth() + 1, 2))
      .replace(/m|M/g, date.getMonth() + 1)
      .replace(/dd|DD/, addZero(date.getDate(), 2))
      .replace(/d|D/g, date.getDate())
      .replace(/hh|HH/, addZero(date.getHours(), 2))
      .replace(/h|H/g, date.getHours())
      .replace(/ii|II/, addZero(date.getMinutes(), 2))
      .replace(/i|I/g, date.getMinutes())
      .replace(/ss|SS/, addZero(date.getSeconds(), 2))
      .replace(/s|S/g, date.getSeconds())
      .replace(/w/g, date.getDay())
      .replace(/W/g, arrWeek[date.getDay()]);
  return str;
}
/**
 * 填充0
 * @param v
 * @param size
 * @returns {string}
 */
function addZero(v, size) {
  for (var i = 0, len = size - (v + "").length; i < len; i++) {
    v = "0" + v;
  }
  return v + "";
}

/**
 *
 * @param {被监听的元素, 默认是window} textareaElem
 * @param {文本域的最小高度, 默认是32} minHeight
 * @param {文本域的最大高度, 默认是500} maxHeight
 *
 */

// adjustTextareaHeight.js

function adjustTextareaHeight(
  textareaElem = window,
  minHeight = 32,
  maxHeight = 500
) {
  textareaElem.addEventListener("input", function (e) {
    var tElem = e.target;
    if (tElem.tagName !== "TEXTAREA") return;

    var unit = "px";
    var diff = tElem.offsetHeight - tElem.clientHeight;

    tElem.style.height = 0; // 设置高度为0是为了改变tElem.scrollHeight

    if (tElem.scrollHeight <= minHeight) {
      tElem.style.height = minHeight + unit;
    } else if (tElem.scrollHeight >= maxHeight) {
      tElem.style.height = maxHeight + unit;
    } else {
      tElem.style.height = tElem.scrollHeight + diff + unit;
    }
  });
}

getTimes = function (cxsj) {
  $.ajax({
    url: "../assignment/getTime",
    type: "post",
    async: false,
    data: {
      gdsj: takeDate,
      b: cxsj,
    },
    success: function (d) {
      $("[name=minData]").val(d.data);
    },
  });
};

/**
 * area 区域
 * address 需要对比的地址
 * 判断是否是一个区域的
 * */
function getAreaWhetherUnlikeliness(tabName, projectId, area, address) {
  $.ajaxSettings.async = false;
  let state = 0;
  console.log(tabName);
  console.log(projectId);
  $.post(
    "../area/getAreaWhetherUnlikeliness",
    { area: area, address: address, tabName, projectId },
    function (d) {
      if (d.code == 200) {
        state = 1;
      }
    }
  );
  $.ajaxSettings.async = true;
  return state;
  // var state = 1;
  // // TODO 转成list，循环
  // if (area != "全国") {  //定位地址有些不带市/省,所以最少只对比最后一位
  //     if (area.indexOf("/") != -1) {
  //         var as = area.split("-")
  //         if (as.length > 2) {
  //             if (address.indexOf(as[2]) == -1 || (address.indexOf(as[0]) == -1 && address.indexOf(as[2]) == -1)) { //对比第一个和第三个
  //                 state = 0;
  //             }
  //         } else if (as.length == 2) {
  //             if (address.indexOf(as[1]) == -1 || (address.indexOf(as[0]) == -1 && address.indexOf(as[1]) == -1)) {
  //                 state = 0;
  //             }
  //         }
  //     } else if (address.indexOf(area) == -1) {
  //         $.post("../area/getWhetherRepeat", {area: area, address: address}, function (d) {
  //             state = d;
  //         })
  //     }
  // }
  // return state;
}

async function areaGetWhetherRepeat(area, address) {
  var state = 1;
}

/**
 * 对比是否类似
 * */
function contrastSimila(tabName, projectId, area, address) {
  $.ajaxSettings.async = false;
  let state = 0;
  $.post(
    "../area/getAreaWhetherUnlikeliness",
    { area: area, address: address, tabName, projectId },
    function (d) {
      if (d.code == 200) {
        state = 1;
      }
    }
  );
  $.ajaxSettings.async = true;
  return state;
  // var s = dw.substring(0, 2); //截取一段
  // var c = qd.indexOf(s); //获取下标
  // if (c != 0) {
  //     qd = qd.substring(c, qd.length)
  //     var state = 1;
  //     var a1 = qd.substring(0, 3)
  //     var b1 = dw.substring(0, 3)
  //     if (a1 != b1) {
  //         state = 0;
  //     }
  // } else {
  //     var a1 = qd.substring(0, 6)
  //     var b1 = dw.substring(0, 6)
  //     if (a1 != b1) {
  //         state = 0;
  //     }
  // }
  // return state;
}

/**
 * 判断当前任务是否结束
 * @param endTime
 * @returns {boolean}
 */
function checkProjectEndTime(endTime) {
  if (strIsEmpty(endTime)) {
    return false;
  }
  return getNowDateWithMonthTwoLen() <= endTime;
}

function formatDateMonthAndDayTowLen(minDate) {
  let minDateArray = minDate.split("-");
  let minDate1 =
    minDateArray[1].length == 1 ? "0" + minDateArray[1] : minDateArray[1];
  let minDate2 =
    minDateArray[2].length == 1 ? "0" + minDateArray[2] : minDateArray[2];
  minDate = minDateArray[0] + "-" + minDate1 + "-" + minDate2;
  return minDate;
}

function checkRule5Time() {
  laydate.render({
    elem: "[name='rule_5']",
    type: "time",
    format: "HH:mm",
    trigger: "click",
    btns: ["confirm"],
    show: true, //直接显示
    closeStop: "[name='rule_5']", //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
  });
}

function checkRule6Time() {
  laydate.render({
    elem: "[name='rule_6']",
    type: "time",
    format: "HH:mm",
    trigger: "click",
    btns: ["confirm"],
    show: true, //直接显示
    closeStop: "[name='rule_6']", //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
  });
}

function checkImplementationTime() {
  var projectCycle = $("[name=projectCycle]").val();
  laydate.render({
    elem: "[name='implementationTime']",
    trigger: "change",
    closeStop: "[name='implementationTime']",
    btns: getDateBtn(
      getNowDateWithMonthTwoLen(),
      getSevenDaysBefore(projectCycle)
    ),
    min: getNowDateWithMonthTwoLen(),
    max: getSevenDaysBefore(projectCycle),
    show: true,
  });
}
/**
 * 验证码
 * */
testQVerify = function () {
  QVerify({
    name: "登录验证", // 验证面板标题
    desc: "滑动滑块，使图片显示角度为正", // 验证操作提示文字
    cloneTxt: "点我关闭", // 关闭验证面板文字
    successTxt: "验证成功，{0}秒后自动关闭", // {0}必须有，延迟关闭时间显示
    errorTxt: "验证失败，请重试",
    images: [
      "images/tb/1aa.png",
      "images/tb/2aa.png",
      "images/tb/3aa.png",
      "images/tb/4aa.png",
      "images/tb/5aa.png",
      "images/tb/6aa.png",
      "images/tb/7aa.png",
    ], // 图片数组 将会随机从里面选取一张
    duration: 1, //定时关闭时间 默认 2
    mountDiv: "#QVerify", // 装载div 默认 #QVerify
    slideDifference: 15, // 滑动误差值 默认 5
    defaultDifference: 50, // 默认图片角度最小差值 默认 50
    mousedown: function (e) {
      // 按下鼠标事件 // e: 元素本身
      //  console.log('按下了鼠标');
    },
    mousemove: function (e, moveWidth) {
      // 移动鼠标事件 e: 元素本身 moveWidth: 移动距离
      /*  console.log("移动了鼠标");
              console.log(moveWidth);*/
    },
    mouseup: function (e, moveWidth) {
      // 抬起鼠标事件 e: 元素本身 moveWidth: 移动距离
      // console.log("抬起了鼠标");
      // console.log(moveWidth);
    },
    success: function () {
      // 验证成功事件
      // console.log("验证成功");
    },
    fail: function () {
      // 验证失败事件
      // console.log("验证失败");
    },
    complete: function () {
      // 验证完成事件 成功失败都会执行(执行顺序: complete->success 或 complete->fail)
      // console.log("触发验证");
    },
    clone: function (status) {
      // 关闭验证面板事件
      VerificationCodeState = status;
      var h = "";
      if (VerificationCodeState) {
        h = `<button type="button" style="border-radius:0px;width: 100%;" class="layui-btn layui-btn-radius" onclick="testQVerify();">验证通过</button>`;
      } else {
        h = `<button type="button" style="background-color: #b3b3b3;border-radius:0px;width: 100%;" class="layui-btn layui-btn-radius" onclick="testQVerify();">请单击后开始登录验证</button>`;
      }
      $("#dlyzView").html(h);
      // console.log("-----------");
      // console.log(VerificationCodeState);
      // console.log("-----------");
    },
  });
};

// UTF8编码转成汉字字符串
function revertUTF8(szInput) {
  var x,
    wch,
    wch1,
    wch2,
    uch = "",
    szRet = "";
  for (x = 0; x < szInput.length; x++) {
    if (szInput.charAt(x) == "%") {
      wch = parseInt(szInput.charAt(++x) + szInput.charAt(++x), 16);
      if (!wch) {
        break;
      }
      if (!(wch & 0x80)) {
        wch = wch;
      } else if (!(wch & 0x20)) {
        x++;
        wch1 = parseInt(szInput.charAt(++x) + szInput.charAt(++x), 16);
        wch = (wch & 0x1f) << 6;
        wch1 = wch1 & 0x3f;
        wch = wch + wch1;
      } else {
        x++;
        wch1 = parseInt(szInput.charAt(++x) + szInput.charAt(++x), 16);
        x++;
        wch2 = parseInt(szInput.charAt(++x) + szInput.charAt(++x), 16);
        wch = (wch & 0x0f) << 12;
        wch1 = (wch1 & 0x3f) << 6;
        wch2 = wch2 & 0x3f;
        wch = wch + wch1 + wch2;
      }
      szRet += String.fromCharCode(wch);
    } else {
      szRet += szInput.charAt(x);
    }
  }
  return szRet;
}

/**
 * html获取请求头数据
 * */
function getHTMlvalue(name) {
  var str = window.location.search;
  var urls = str.split("&");
  if (str.indexOf(name) != -1) {
    var pos_start = str.indexOf(name) + name.length + 1;
    var pos_end = str.indexOf("&", pos_start);
    var qqt = str.substring(pos_start, pos_end);
    if (pos_end == -1) {
      return str.substring(pos_start);
    } else {
      return revertUTF8(qqt);
    }
  }
}

openHospitalHeaderImgLimitSumOnchange = function (value) {
  console.log(value);
};
/**
 * 对表单文本处理
 * d this值
 * value 输入值
 * type 类型 1（处理空格）2（处理空格文字）
 * */
inputTextLimits = function (d, value, type) {
  if (type == "1") {
    //处理空格
    var reg11 = /[\u0020]/g;
    var res11 = value.replace(reg11, "");
    if (value != res11) {
      value = res11;
      layer.msg("该输入框禁止输入空格，已经为您自动过滤");
    }
  } else if (type == "2") {
    //处理空格和文字
    var reg11 = /[\u4e00-\u9fa5\u0020]/g; //不含有中文和空格
    var res11 = value.replace(reg11, "");
    if (value != res11) {
      value = res11;
      layer.msg("该输入框禁止输入空格和中文，已经为您自动过滤");
    }
  } else if (type == "3") {
    //验证数字
    var reg11 = /\D+/g;
    var res11 = value.replace(reg11, "");
    if (value != res11) {
      value = res11;
      layer.msg("该输入框禁止输入非数字，已经为您自动过滤");
    }
  } else if (type == "4") {
    //验证数字
    var reg11 = /^1[3|4|5|6|7|8|9]\d{9}$/;
    if (!reg11.test(value)) {
      value = "";
      layer.msg("请填写正确的手机号码!");
    }
  } else if (type == "555") {
    //匹配密码,测试
    let pass =
      /^((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])^.*$)/;
    if (value.val().length >= 8 && value.val().length <= 16) {
      if (!pass.exec(value)) {
        layer.msg(
          "密码不符合要求,密码至少包含大写字母、小写字母、数字、 标点及特殊字符中3种的组合!",
          { icon: 0 }
        );
        value = "";
      }
    } else {
      layer.msg("密码长度不能低于8位不能超过16位！", { icon: 5 });
      value = "";
    }
  } else if (type == "556") {
    //匹配邮箱
    var reg11 = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!reg11.test(value)) {
      value = "";
      layer.msg("请填写正确的邮箱!");
    }
  } else if (type == "comma") {
    //匹配邮箱
    var res11 = value.replaceAll(",", "，");
    value = res11;
  } else if (type == "minValue") {
    //最小值
    if (value !== "") {
      var res11 = value > 0 ? value : "";
      value = res11;
      if (value <= 0) {
        layer.msg("不能小于0!");
      }
    }
  }

  /*const reg = /^1[3|4|5|6|7|8|9]\d{9}$/;
    if (!value) {
        return callback(new Error('请填写手机号码！'))
    } else  {
        return callback(new Error('请填写正确的手机号码！'))
    }else{
        callback()
    }*/
  d.value = value;
};
getURl = function (d) {
  axios.get(d).then(function (response) {
    return response;
  });
};
postURl = function (d, param) {
  axios.post(d, Qs.stringify(param)).then(function (response) {
    return response;
  });
};
/**
 * 通过请求获取参数
 * */
getURLParameter = function (name) {
  return (
    decodeURIComponent(
      (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
        location.search
      ) || [, ""])[1].replace(/\+/g, "%20")
    ) || null
  );
};

/**
 * 对文本长度进行限制
 * d this值
 * value 输入值
 * length 限制长度
 * */
inputLengthTextLimits = function (d, value, length) {
  var len = parseInt(length);
  if (value.length > len) {
    value = value.substring(0, len);
    d.value = value;
    layer.msg("文本不能存在空格，已经为您自动过滤");
  }
};

function clearFile() {
  $(".clearFile").css("display", "none");
  $("[name=appendix]").val("");
  $("#fileName").text("");
  $("[name=fileName]").val("");
}

function getTicketStateOnNew(ysState, stateList) {
  for (let key in stateList) {
    let listElement = stateList[key];
    let states = listElement.split(",");

    for (const state of states) {
      if (state == ysState) {
        return key;
      }
    }
  }
  return "";
}

function getTicketState(state, check) {
  let text = "";
  switch (state) {
    case "0":
    case "100":
    case "200":
    case "1000":
    case "1100":
    case "1200":
      text = "待初审";
      break;
    case "1":
    case "3":
    case "4":
      text = "终审通过";
      break;
    case "2":
      text = "终审驳回";
      break;
    case "102":
    case "202":
    case "1002":
    case "1102":
    case "1202":
      text = "初审驳回";
      break;
    case "1008":
    case "108":
    case "1106":
    case "1206":
    case "208":
      text = "初审通过";
      break;
    case "1009":
    case "109":
    case "1109":
    case "1209":
    case "209":
      text = "终审退回";
      break;
    case "1107":
    case "1207":
      text = "复审退回";
      break;
    case "1108":
    case "1208":
      text = "复审通过";
      break;
    case "1010":
    case "110":
    case "210":
    case "1210":
    case "1110":
      text = "初审撤回";
      break;
    case "1212":
    case "212":
    case "12":
    case "1012":
    case "112":
    case "1112":
      text = "用户撤回";
      break;
    case "1211":
    case "1111":
      text = "复审撤回";
      break;
    case "113":
    case "13":
    case "213":
    case "1013":
    case "1113":
    case "1213":
      text = "终审撤回";
      break;
    default:
      text = "";
  }
  return text;
}

function getTicketStateNoSettlement(state, check, isSubcontract) {
  let text = "";
  switch (state) {
    case "0":
    case "100":
    case "200":
    case "1000":
    case "1100":
    case "1200":
      text = "待初审";
      break;
    case "1":
    case "3":
    case "4":
      text = "终审通过";
      break;
    case "2":
      text = "终审驳回";
      break;
    case "102":
    case "202":
    case "1002":
    case "1102":
    case "1202":
      text = "初审驳回";
      break;
    case "1008":
    case "108":
    case "1106":
    case "1206":
    case "208":
      text = "初审通过";
      break;
    case "1009":
    case "109":
    case "1109":
    case "1209":
    case "209":
      text = "终审退回";
      break;
    case "1107":
    case "1207":
      text = "复审退回";
      break;
    case "1108":
    case "1208":
      text = "复审通过";
      break;
    case "1010":
    case "110":
    case "210":
    case "1210":
    case "1110":
      text = "初审撤回";
      break;
    case "1212":
    case "212":
    case "12":
    case "1012":
    case "112":
    case "1112":
      text = "用户撤回";
      break;
    case "1211":
    case "1111":
      text = "复审撤回";
      break;
    case "113":
    case "13":
    case "213":
    case "1013":
    case "1113":
    case "1213":
      text = "终审撤回";
      break;
    default:
      text = "";
  }
  return text;
}

function checkReviewType(checkType) {
  let text = "初审";
  switch (checkType) {
    case 0:
      text = "初审";
      break;
    case 1:
      text = "终审";
      break;
    case 2:
      text = "复审";
      break;
  }
  return text;
}

function getCheckTypeByState(recheck) {
  let text = "发布方审核";

  switch (recheck) {
    case 0:
    case "0":
      break;
    case 1:
    case "1":
      text = "发布方初审-发布方终审";
      break;
    case 2:
    case "2":
      text = "承接方初审-发布方终审";
      break;
    case 10:
    case "10":
      text = "分包方初审-发布方终审";
      break;
    case 11:
    case "11":
      text = "分包方初审-发布方复审-发布方终审";
      break;
    case 12:
    case "12":
      text = "分包方初审-承接方复审-发布方终审";
      break;
  }
  return text;
}

function personalProjectContractingType(category) {
  if (category == 1) {
    return "自然人";
  } else if (category == 2) {
    return "指派人员";
  }
}

//企业任务承接方类型 文字化
function corpProjectContractingType(contractingType) {
  if (contractingType == 2) {
    return "供应商";
  } else if (contractingType == 3) {
    return "任务企业";
  }
}

// 承接方式文字化
function directType(directService) {
  let direct;
  if (strIsEmpty(directService)) {
    direct = "自由承接(可多家)";
  } else {
    direct = "邀请承接(可多选)";
  }
  return direct;
}

function bearCostTo(bearCost) {
  if (bearCost == 0) {
    return "发布方承担";
  } else if (bearCost == 1) {
    return "服务方承担";
  }
}

function queryBinding(path) {
  $.ajax({
    type: "get",
    url: path + "/bidding/currentInfo",
    async: false,
  }).then((res) => {
    $(".bearCost0").css("display", "block");
    if (res.code == 0) {
      $(".bearCost1").css("display", "none");
    } else {
      $(".bearCost1").css("display", "block");
    }
    form.render();
  });
}

function renderTaskMode(mode) {
  let recheck = "";
  let contractingType = "0";
  let bearCost = "0";
  // 邀请模式 只能任务企业承接
  //         只能发布方承担平台服务费
  if (mode == 1) {
    bearCost = "0";
    contractingType = "3";
    $(".contractingType3").css("display", "block");
    $(".contractingType2").css("display", "none");
    $(".bearCost0").css("display", "block");
    $(".bearCost1").css("display", "none");
    $(".direct0").css("display", "none");
    $("#directSelectDiv").css("display", "block");
    $(".payMethodDiv").css("display", "none");
    form.val("projectForm", {
      direct: "1",
      payMethod: "0",
    });
    //     报价模式 只能是供应商承接
  } else if (mode == 2) {
    bearCost = "1";
    contractingType = "2";
    $(".contractingType3").css("display", "none");
    $(".contractingType2").css("display", "block");
    $(".bearCost0").css("display", "none");
    $(".bearCost1").css("display", "block");
    $(".direct0").css("display", "block");
    $(".payMethodDiv").css("display", "flex");
    $("[name='payMethod']").attr("checked", false);
  }

  renderCorpType(contractingType);
  form.val("projectForm", {
    recheck: recheck,
    contractingType: contractingType,
    bearCost: bearCost,
  });

  form.render();
}

function renderCorpType(value) {
  if (value == 3) {
    $('[name="recheck"]').html(`
                <option value="">请选择</option>
                <option value="0">发布方审核</option>
                <option value="1">发布方初审 - 发布方终审</option>
                <option value="2">承接方初审 - 发布方终审</option>
                `);
  } else if (value == 2) {
    $('[name="recheck"]').html(`
                <option value="">请选择</option>
                <option value="0">发布方审核</option>
                <option value="1">发布方初审 - 发布方终审</option>
                `);
  }
  form.render();
}

function closeThis() {
  var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
  parent.layer.close(index);
}

/**
 * 按照任务计划数量和任务 单价计算 任务总金额
 */
function compleTotalPrice() {
  let planNo = $("[name=projectPlanNo]").val();
  let price = $("[name=projectPrice]").val();
  if (strIsNotEmpty(planNo) && strIsNotEmpty(price)) {
    let totalPrice = planNo * price;
    $("[name=totalPrice]").val(totalPrice.toFixed(2));
  }
}

// 回退到上一步
function goBack() {
  window.history.go(-1);
}

// 回退到上一步
function goBack(url) {
  if (url) {
    return (window.location.href = url);
  }
  window.history.go(-1);
}

// 判空
function isBlank(value) {
  return value == null || value == "" || value == undefined;
}
function serializeToObject(jsonArray) {
  var o = {};
  $.each(jsonArray, function () {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || "");
    } else {
      o[this.name] = this.value || "";
    }
  });
  return o;
}

//获得图片路径
function getFileImg(fileName) {
  var path = "dd_images/pic.png";
  var suffix = fileName.substring(fileName.lastIndexOf(".") + 1);
  if (suffix == "doc" || suffix == "docx") {
    path = "dd_images/word.png";
  } else if (suffix == "xlsx" || suffix == "xls") {
    path = "dd_images/excel.png";
  } else if (suffix == "ppt" || suffix == "pptx") {
    path = "dd_images/ppt.png";
  } else if (suffix == "pdf") {
    path = "dd_images/pdf.png";
  }
  return path;
}

/**
 * 通过任务ID获取模板信息
 * */
function getTemplateInfo(projectId) {
  let info = {};
  $.ajax({
    url:
      getRequestBaseUrl() +
      "/sciencetpl/getsSciencetplInfo?projectId=" +
      projectId,
    method: "GET",
    async: false,
  }).then((res) => {
    if (res.code == "200") {
      info = res.data;
    }
  });
  return info;
}

/**
 * 获取省份信息
 * */
function getProvinceInfo() {
  let area =
    "北京,天津,河北省,山西省,内蒙古,辽宁省,吉林省,黑龙江省,上海,江苏省,浙江省,安徽省,福建省,江西省,山东省,河南省,湖北省,湖南省,广东省,广西,海南省,重庆,四川省,贵州省,云南省,西藏,陕西省,甘肃省,青海省,宁夏,新疆,台湾,香港,澳门,钓鱼岛";
  let areas = area.split(",");
  let areasList = new Array();
  $.each(areas, (i, item) => {
    var mapJson = { value: item, label: item };
    areasList.push(mapJson);
  });
  return areasList;
}

/**
 * 驳回工单提示，人员维度专用
 */
function rejectOrderTips(idList) {
  if (
    (idList.cantCheckTicketIdList != null &&
      idList.cantCheckTicketIdList.length > 0) ||
    (idList.errorTicketIdList != null && idList.errorTicketIdList.length > 0)
  ) {
    let html = "";
    if (idList.cantCheckTicketIdList.length > 0) {
      html = `
<div style="height: 72px;">您当前选择批量验收的有被退回工单！<br/>
因任务已结束，无法通过提交。<br/>
        工单编号如下:</div><div style="max-height: 200px;overflow: auto;">`;
      idList.cantCheckTicketIdList.forEach((item) => {
        html += `<span style="color: #ff1515;">${item}</span><br/>`;
      });
      html += `</div>`;
    }

    if (idList.errorTicketIdList.length > 0) {
      html += `
        <div style="height: 72px;">您当前选择的工单包含下游已撤回的工单及状态异常工单！<br/>
        工单编号如下:</div><div style="max-height: 200px;overflow: auto;">`;
      idList.errorTicketIdList.forEach((item) => {
        html += `<span style="color: #ff1515;">${item}</span><br/>`;
      });
      html += `</div>`;
    }

    layer.alert(html, {
      shadeClose: true,
      skin: "layui-layer-molv",
      title: "信息",
    });
  }
}
/**
 * 校验是否可以被选中 校验数据,true则代表是可验收数据，false代表是复审/终审驳回数据
 * */
function verifyIfSelectedTwo(ysState, whetherTaskFinished) {
  var rejectStateList = ["1009", "109", "1109", "209", "1209", "1107", "1207"];
  return rejectStateList.indexOf(ysState) != -1 && whetherTaskFinished == "1"
    ? false
    : true;
}

/**
 * 校验是否可以被选中 禁选样式
 */
function verifyIfSelectedOne(data, whetherTaskFinished) {
  whetherTaskFinished = "1";
  if (whetherTaskFinished == "1") {
    $.each(data, function (i, item) {
      if (
        item.ysState == "7" ||
        item.ysState == "9" ||
        item.ysState == 7 ||
        item.ysState == 9
      ) {
        //通过设置关键字LAY_CHECKED为true选中，这里只对第一行选中
        data[i]["LAY_CHECKED"] = "false";
        //更改css来实现选中的效果
        var index = data[i]["LAY_TABLE_INDEX"];
        // 禁止选中且初始化选中样式
        $("tr[data-index=" + index + '] input[type="checkbox"]').prop(
          "disabled",
          true
        );
        $("tr[data-index=" + index + '] input[type="cdheckbox"]')
          .next()
          .addClass("layui-checkbox-disbaled");
        $("tr[data-index=" + index + '] input[type="checkbox"]')
          .next()
          .addClass("layui-disabled");
        $("tr[data-index=" + index + '] input[type="checkbox"]')
          .next()
          .removeClass("layui-form-checked");
      }
    });
  }
}

var taskTypesData = [
  { tableName: "djyyxx", name: "等级医院档案", index: 101 },
  { tableName: "jcylxx", name: "基层医疗档案", index: 102 },
  { tableName: "lsqdxx", name: "零售渠道档案", index: 103 },
  { tableName: "syqdxx", name: "商业渠道档案", index: 104 },
  { tableName: "blxx", name: "病例信息", index: 201 },
  { tableName: "jpxx", name: "竞品信息", index: 202 },
  { tableName: "sjyyzr", name: "三级医院准入", index: 301 },
  { tableName: "ejyyzr", name: "二级医院准入", index: 302 },
  { tableName: "yjyyzr", name: "一级医院准入", index: 303 },
  { tableName: "jcylzr", name: "基层医疗准入", index: 304 },
  { tableName: "lsqdzr", name: "零售渠道准入", index: 305 },
  { tableName: "syqdzr", name: "商业渠道准入", index: 306 },
  { tableName: "djyybf", name: "等级医院科室拜访", index: 401 },
  { tableName: "jcylbf", name: "基层医疗拜访", index: 402 },
  { tableName: "lsqdxd", name: "零售渠道巡访", index: 403 },
  { tableName: "syqdxf", name: "商业渠道巡访", index: 404 },
  { tableName: "lcbf", name: "临床医生拜访", index: 405 },
  { tableName: "hzbf", name: "患者拜访", index: 406 },
  { tableName: "gtfw", name: "跟台服务", index: 407 },
  { tableName: "djyyksxf", name: "等级医院科室巡访", index: 408 },
  { tableName: "jcylxf", name: "基层医疗巡访", index: 409 },
  // {tableName: "ggxc", name: "广告巡查", index: 408},
  { tableName: "sylxsj", name: "商业流向数据", index: 501 },
  { tableName: "jplxsj", name: "竞品流向数据", index: 502 },
  { tableName: "syqdjxcsj", name: "商业渠道进销存数据", index: 503 },
  { tableName: "jcyljhsj", name: "基层医疗进货数据", index: 504 },
  { tableName: "lsqdjhsj", name: "零售渠道进货数据", index: 505 },
  { tableName: "djyykcsj", name: "等级医院库存数据", index: 506 },
  { tableName: "zdjpgj", name: "终端竞品购进", index: 507 },
  { tableName: "jcylkcsj", name: "基层医疗库存数据", index: 508 },
  { tableName: "lsqdkcsj", name: "零售渠道库存数据", index: 509 },
  { tableName: "yswj", name: "医生问卷", index: 601 },
  { tableName: "hzwj", name: "患者问卷", index: 602 },
  { tableName: "dywj", name: "店员问卷", index: 603 },
  { tableName: "xfzwj", name: "消费者问卷", index: 604 },
  { tableName: "syrywj", name: "商业人员问卷", index: 605 },
  { tableName: "yykshhd", name: "医院科室会活动", index: 701 },
  { tableName: "hzjyhd", name: "患者教育活动", index: 702 },
  { tableName: "tgpxhd", name: "推广培训活动", index: 703 },
  { tableName: "ywpxhd", name: "业务培训活动", index: 704 },
  { tableName: "djyykswh", name: "等级医院科室维护", index: 1001 },
  { tableName: "jcylwh", name: "基层医疗维护", index: 1002 },
  { tableName: "hzwfw", name: "患者微服务", index: 1003 },
  { tableName: "cpcxhd", name: "产品促销活动", index: 801 },
  { tableName: "clzshd", name: "陈列展示活动", index: 802 },
  { tableName: "ppxchd", name: "品牌宣传活动", index: 803 },
  { tableName: "nryx", name: "线上内容营销", index: 901 },
  { tableName: "pptg", name: "线上品牌推广", index: 902 },
];
function getTaskTypeByName(name) {
  return taskTypesData.filter((data) => data.name === name)[0];
}

/**
 * 过滤拼接参数
 * */
function filterSpliceParameters(value) {
  /*&    &amp;
<    &lt;
>    &gt;
"    &quot;
'    &#x27;*/
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

var imgRepeatInterceptTips =
  "拦截：拦截自然人工单提交。</br>不拦截：企业端显示重复图片提示，不拦截自然人工单提交。";
var identifyLevelTips =
  "可调节阈值范围：</br>标准识别：100%</br>高级识别：90%-100%</br>精细识别：85%-100%";
function showGdgzTips(e) {
  var name = $(e.target).parent().attr("name");
  var content;
  if (name === "imgRepeatInterceptTips") {
    content = imgRepeatInterceptTips;
  } else if (name === "identifyLevelTips") {
    content = identifyLevelTips;
  }
  content = content === undefined ? "暂无内容" : content;
  layer.tips(content, $(e.target), {
    tips: [2, "#3595CC"],
    time: 4000,
  });
}
function openPdf() {
  let imgUrl =
    "https://jlf-1024.oss-cn-beijing.aliyuncs.com/SYS_FILE/file-%E5%9B%BE%E2%BD%9A%E2%BC%AF%E5%8D%95%E8%A7%84%E5%88%99%E5%B8%AE%E5%8A%A9%E8%AF%B4%E6%98%8E%E2%BD%82%E6%A1%A3.jpg";
  top.layer.open({
    type: 1,
    title: "预览",
    skin: "layui-layer-molv",
    area: ["90%", "90%"],
    scrollbar: true, // 允许滚动条
    content: `<div style="overflow: auto; height: 100%;">
            <img src="${imgUrl}" alt="图片预览" style="width: 100%; object-fit: contain;" />
        </div>`,
    success: function (layero, index) {
      // 设置内容区域可滚动
      $(layero).find(".layui-layer-content").css({
        overflow: "auto",
        height: "100%",
      });
    },
  });
}

let user = JSON.parse(localStorage.getItem("base"))?.user;

if (!window.__rumInitialized && user) {
  fetch("/lgb/arms/getARMSInfo")
    .then((response) => response.json())
    .then((res) => {
      if (window.__rum) {
        return;
      }
      console.log("埋点", res);

      !(function (c, b, d, a) {
        c[a] || (c[a] = {});
        c[a] = {
          pid: res.data.pid,
          endpoint: res.data.endpoint,
          env: res.data.env,
          spaMode: "history",
          collectors: {
            perf: true,
            webVitals: true,
            api: true,
            staticResource: true,
            jsError: true,
            consoleError: true,
            action: true,
          },
          user: {
            name: user.employeeName,
            tags: user.recId,
          },
          tracing: true,
        };
        with (b)
          with (body)
            with (insertBefore(createElement("script"), firstChild))
              setAttribute("crossorigin", "", (src = d));
      })(
        window,
        document,
        "https://sdk.rum.aliyuncs.com/v2/browser-sdk.js",
        "__rum"
      );

      // 设置初始化标志
      window.__rumInitialized = true;
    });
}

var rules = {};
function workOrderRulesverify() {
  if ($("[name=sponsorId]").val() == "") {
    layer.msg("请先选择生产企业", {
      icon: 0,
      offset: "50%",
      time: 1000,
      zIndex: 9999,
    });
    return false;
  } else {
    return true;
  }
}

function saveRuleTemplate() {
  if (workOrderRulesverify()) {
    $("#hiddenGdgzSubmitButton").click();
  }
}

/**
 * 对比函数
 */
function contrast() {
  if (workOrderRulesverify()) {
    let param = {
      rules: {
        ...getGdgzJsonData(),
      },
      sceneName: $("[name=projectType]").val(),
      producerId: $("[name=sponsorId]").val(),
    };
    $.ajax({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      type: "post",
      url: "/lgb/scene/check/compare",
      data: JSON.stringify(param),
    }).then((res) => {
      rules = res.data.rules;
      contrastTipsStr = res.data.description;
      if (contrastTipsStr != "") {
        $("#task_rule1").show();

        tipsIndex = layer.tips(
          contrastTipsStr +
            '<br><button class="layui-btn layui-btn-primary layui-border-blue layui-btn-sm" style="display:block;margin:10px auto 0;text-align:center" onclick="replaceRules()">替换工单规则</button>',
          $("#contrastTips"),
          {
            tips: [2, "#3595CC"],
            time: 400000,
            area: ["300px", "auto"],
          }
        );
      } else {
        layer.closeAll();
        layer.msg("与库中数据一致", { icon: 0, offset: "50%", time: 1000 });
      }
    });
  }
}
function replaceRules() {
  layer.open({
    title: "温馨提示",
    area: "500px",
    btn: ["确定", "取消"],
    content: "若替换工单规则将会覆盖原工单规则，是否进行替换？",
    yes() {
      const json = {};
      const params = new URLSearchParams($("#projectForm").serialize());

      for (const [key, value] of params.entries()) {
        json[key] = value;
      }

      let rulesAll = Object.assign({}, json, rules);

      try {
        reloadTicketRule(rulesAll);
      } catch (error) {
        showGdgz(rulesAll);
      }
      if (strIsNotEmpty(rulesAll.implementationTimeSwitch)) {
        $("input[name='implementationTimeSwitch']").prop("checked", true);
        document
          .getElementsByName("implementationTimeDiv")[0]
          .setAttribute("style", "display: inline;padding-left: 30px");
        $("input[name='implementationTime']").val(rulesAll.implementationTime);
      }
      if (rules.unImplDate) {
        try {
          loadLastUnImplDateSelect(
            $("[name=projectType]").val(),
            rules.unImplDate.split(",")
          );
        } catch (error) {
          loadunImplDateSelect(
            $("[name=projectType]").val(),
            rules.unImplDate.split(",")
          );
        }
      }
      layer.closeAll();
      form.render();
    },
  });
}
// 获取工单规则数据的函数
function getGdgzJsonData() {
  let projectType = $("[name=projectType]").val();
  const gdgzDiv = document.getElementById("gdgzDiv");
  const jsonData = {}; // 直接使用JSON对象

  const formElements = gdgzDiv.querySelectorAll("input, select, textarea");

  formElements.forEach((element) => {
    if (element.name) {
      if (element.type === "checkbox" || element.type === "radio") {
        if (element.checked) {
          jsonData[element.name] = element.value; // 直接赋值给JSON对象
        }
      } else {
        jsonData[element.name] = element.value; // 直接赋值给JSON对象
      }
    }
  });
  // 特殊处理 是否显示地址定位选项
  jsonData.unImplDate = jsonData?.select;
  //图片识别规则
  if (jsonData.checkImgInterceptSimilarity) {
    jsonData.checkImgInterceptSimilarityCode =
      jsonData.checkImgInterceptSimilarity;
  }

  //准入
  if (
    projectType == "三级医院准入" ||
    projectType == "二级医院准入" ||
    projectType == "一级医院准入" ||
    projectType == "零售渠道准入" ||
    projectType == "商业渠道准入" ||
    projectType == "基层医疗准入"
  ) {
    if (!jsonData.rule_2) {
      jsonData.openHospitalHeaderAllowRepeat = "";
      jsonData.openHospitalHeaderAllowRepeatByCorp = "";
    } else {
      jsonData.rule_2 = "1";
    }
  }
  if (projectType == "跟台服务") {
    jsonData.rule_3 = jsonData.rule_3 == "on" ? "1" : "0";
  }
  if (!jsonData.hasOwnProperty("rule_dw")) {
    jsonData.rule_dw = "0";
  }
  if (jsonData.hasOwnProperty("rule_dw")) {
    jsonData.rule_dw = jsonData.rule_dw == "on" ? "1" : "0";
  }
  //门头照，科室照
  if (!jsonData.hasOwnProperty("openHospitalHeaderImg")) {
    if ("openHospitalHeaderTitle" in jsonData) {
      jsonData.openHospitalHeaderTitle = "";
    }
    if ("openHospitalHeaderImgLimitSum" in jsonData) {
      jsonData.openHospitalHeaderImgLimitSum = "";
    }
    if ("openHospitalHeaderImgSubmit" in jsonData) {
      jsonData.openHospitalHeaderImgSubmit = "";
    }
    if ("openCheckHeaderImgIntercept" in jsonData) {
      jsonData.openCheckHeaderImgIntercept = "";
    }
  }
  if (!jsonData.hasOwnProperty("openHospitalKSImg")) {
    if ("openHospitalKSTitle" in jsonData) {
      jsonData.openHospitalKSTitle = "";
    }
    if ("openHospitalKSImgLimitSum" in jsonData) {
      jsonData.openHospitalKSImgLimitSum = "";
    }
    if ("openHospitalKSImgSubmit" in jsonData) {
      jsonData.openHospitalKSImgSubmit = "";
    }
    if ("openCheckKsImgIntercept" in jsonData) {
      jsonData.openCheckKsImgIntercept = "";
    }
  }
  if (jsonData.hasOwnProperty("openHospitalKSImg")) {
    jsonData.openHospitalKSImg = jsonData.openHospitalKSImg == "on" ? "1" : "0";
  }

  //实施人在配置时间后开始填写
  if (jsonData.hasOwnProperty("implementationTime")) {
    delete jsonData.implementationTime;
  }
  if (jsonData.hasOwnProperty("implementationTimeSwitch")) {
    delete jsonData.implementationTimeSwitch;
  }

  if (jsonData.hasOwnProperty("permit_address_self")) {
    jsonData.permit_address_self =
      jsonData.permit_address_self == "on" ? "1" : "0";
  }

  return jsonData; // 返回JSON对象
}
