var invoice_second_index;
//关闭 invoice_second.jsp页面
function closeTopLayer_invoice_second_index() {
  layer.close(invoice_second_index);
}

//刷新 服务费管理里面的发票信息页面
function reloadServiceSideInfo_1() {
  $('[src="financial/service_side.jsp"]')[0]
    .contentWindow.document.getElementById("info")
    .contentWindow.location.reload();
}

//聊天窗体前置处理
function beforeChatHandle() {
  $.post("chat/chatCount", function (res) {
    if (res != 0) {
      openChat("min");
    }
  });
}

//打开聊天窗体
function openChat(openType) {
  let restore_left = "";

  //如果存在.myHeadImg则代表目前chat窗体处于最小化中，就不需要弹出，只要让他触发下单击自动restore
  if ($(".myHeadImg", top.document).length > 0) {
    // $(".myHeadImg",top.document).click();
    return false;
    // $(".myHeadImg",top.document).click();
    // return false;
  }
  //如果聊天窗体本就是restore状态中的，就无需处理
  if ($(".layer-chat-restore", top.document).length > 0) {
    return false;
  }
  chatIndex = top.layer.open({
    type: 1,
    maxmin: true,
    fixed: false,
    area: ["900px", "520px"],
    shade: false,
    closeBtn: 0,
    resize: false,
    title: "&#8203;",
    zIndex: 1147483646,
    content: $("#kfBox"),
    min: function (layero) {
      $(layero, top.document).css("display", "none");

      tempHeadImg_src = $(".layim-chat-other img", top.document).attr("src"); //把会话头像存起来

      restore_top = $(layero, top.document).css("top");
      restore_left = $(layero, top.document).css("left");

      $(layero, top.document).find(".layim-chat-status").css("display", "none"); //隐藏在线状态
      $(layero, top.document)
        .find(".layim-chat-username")
        .css("display", "none"); //隐藏用户名称
      $(".layim-chat-list", top.document).css("display", "none"); //隐藏会话列表
      $("#rightBox", top.document).css("margin-left", "0px"); //调整rightBox左边距
      $(layero, top.document)
        .find(".layui-layer-setwin")
        .css("display", "none"); //去除最小最大化图标
      $(layero, top.document).removeClass("layer-chat-full");
      $(layero, top.document).removeClass("layer-chat-restore");
      $(layero, top.document).addClass("layer-chat-min");
      $(layero, top.document).find(".layim-chat-title").addClass("min-title"); //加自定义class方便绑定点击最大化方法
      $(".layim-chat-other img", top.document).addClass("myHeadImg"); //添加自定义class证明是自己的头像

      //等原来图片加载完再替换成主页自己的头像，确保自己头像能显示出来
      //var imgObj=$(".layim-chat-other img",top.document);
      //imgObj[0].onload=function(){
      setTimeout(function () {
        $(".layim-chat-other img", top.document).attr(
          "src",
          $("#topHeadImg").attr("src")
        ); //把最小化后的头像改成主页顶部头像
        $(layero, top.document).css("top", "70px");

        $(layero, top.document).css("left", $(document).width() - 80);
        $(layero, top.document).css("display", "block");
      }, 50);
      //}
    },
    full: function (layero) {
      $(layero, top.document).removeClass("layer-chat-min");
      $(layero, top.document).removeClass("layer-chat-restore");
      $(layero, top.document).addClass("layer-chat-ful");
      var w = top.document.body.clientWidth - 300;
      var h = top.document.body.clientHeight - 237;
      $("#rightBox", top.document).css("width", w + "px");
      $("#kfDiv", top.document).css("height", h + "px");
      $(".layim-chat-list", top.document).css(
        "height",
        document.body.clientHeight + "px"
      );
      $(".layim-chat-other img", top.document).removeClass("myHeadImg");
    },
    restore: function (layero) {
      $(".layim-chat-other img").css("height", "50px");
      $(".layim-chat-other img").css("width", "50px");
      $(".layim-chat-other img").css("left", "0px");
      $(".layer-chat-open .layui-layer-title").css("height", "80px");

      //如果是首次加载restore
      if (restoreFist) {
        restore_left = (window.innerWidth - 900) * 0.5 + "px";
        restoreFist = false;
      }
      //$(".layim-chat-other  img").attr("src",$(nowLi).find("img").attr("src"));
      $(layero, top.document).removeClass("layer-chat-min");
      $(layero, top.document).removeClass("layer-chat-ful");
      $(layero, top.document).addClass("layer-chat-restore");
      $(".myHeadImg", top.document).removeClass();
      if (restore_top != "") {
        $(layero, top.document).css("top", restore_top);

        $(layero, top.document).css(
          "left",
          (window.innerWidth - 900) * 0.5 + "px"
        );
        restore_top = "";
        restore_left = "";
      }
      //$(".layim-chat-list",top.document).css("height","520px");
      $(".layim-chat-list", top.document).css("height", "482px");
      $("#kfDiv", top.document).css("height", "282px");
      $("#rightBox", top.document).css("width", "600px");
      $(".layim-chat-other img", top.document).removeClass("myHeadImg");
      if (tempHeadImg_src != "") {
        $(".layim-chat-other img", top.document).attr("src", tempHeadImg_src);
      }
      $(".layim-chat-status", top.document).css("display", "block"); //显示在线状态
      $(".layim-chat-username", top.document).css("display", "block"); //显示用户名称
      //$(layero,top.document).css("width","800px");

      $(layero, top.document).css("width", "900px");
    },
    success: function (layero, index) {
      //layer.setTop(layero);
      loadChatUser("");
      //如果是min则添加过渡效果保证体验以及最小化能正常触发
      if (openType == "min") {
        $(layero, top.document).css("display", "none");
        setTimeout(function () {
          $(".layui-layer-min", top.document).click();
          //$(layero,top.document).css("display","block");
        }, 50);
      }
      //加载文本编辑器
      layedit.set({
        uploadImage: {
          url: "gt/uploadImg", //接口url
        },
      });
      option = {
        height: "73px",
        tool: [
          "face", //表情
          "image", //插入图片
        ],
      };
      editIndex = layedit.build("sendContent", option);
      //调整标题高度
      var t = $(layero, top.document).find(".layui-layer-title");
      $(t).css({ height: "80px", "line-height": "38px" });
      //根据openType加上标识
      $(layero, top.document).addClass("layer-chat-" + openType);
      //再加个标识证明打开过
      $(layero, top.document).addClass("layer-chat-open");
    },
  });
}

//刷新列表
function loadChatUser(relationId, key) {
  relationIdTemp = relationId;
  var ids = [];
  //加载用户列表前先获得前面选中的用户的id
  var id = $(".layim-chat-list .layim-this").attr("data-id");
  //发送者不属于当前打开的会话才要刷新列表
  //或者 查询条件不为空就刷新列表
  if (id != relationId || (key != "" && key != undefined)) {
    $.post(
      "chat/chatUserList",
      { key: key },
      function (res) {
        var html = "";
        var offlineClass = "";
        $.each(res, function (n, v) {
          if (v.isAlive == "1") {
            offlineClass = "";
          } else {
            offlineClass = " class='offline' ";
          }
          var headImg = v.headImg == "" ? "images/headImg.png" : v.headImg;
          if (v.receiver == id) {
            html +=
              '<li class="layim-this  chat"   data-corpName="' +
              v.corpName +
              '"   data-id="' +
              v.receiver +
              '" ><img ' +
              offlineClass +
              ' src="' +
              headImg +
              '" ><div><p>' +
              v.employeeName +
              "</p><p>" +
              v.sendcontent +
              '</p></div><i class="layui-icon" layim-event="closeChat">ဇ</i><font>' +
              v.createTime +
              "</font></li>";
          } else {
            html +=
              '<li  data-corpName="' +
              v.corpName +
              '"  data-id="' +
              v.receiver +
              '"  class="chat" ><img ' +
              offlineClass +
              ' src="' +
              headImg +
              '" ><div><p>' +
              v.employeeName +
              "</p><p>" +
              v.sendcontent +
              '</p></div><i class="layui-icon" layim-event="closeChat">ဇ</i>';
            if (v.newMessage != 0) {
              html +=
                '<b class="layui-badge layui-bg-red">' + v.newMessage + "</b>";
            }
            html += "<font>" + v.createTime + "</font></li>";
          }
          ids.push(v.receiver);
        });
        var layimChatTemp = $(".layim-chat-temp");
        if (layimChatTemp.length > 0) {
          //如果存在临时用户会话情况
          var oldHtml = "";
          //如果此次从数据库取出的用户包含了临时用户则剔除已含有的临时用户
          for (var i = 0; i < layimChatTemp.length; i++) {
            var dataId = $(layimChatTemp[i]).attr("data-id");
            if (ids.indexOf(dataId) == -1) {
              oldHtml += $(layimChatTemp[i]).prop("outerHTML");
            }
          }
          html = html + oldHtml;
        }
        if (html == "" && (key == "" || key == undefined)) {
          layer.close(chatIndex);
        }
        $(".layim-chat-list").html(html);
        //如果是初始化用户列表则默认打开与第一个用户的会话
        if (relationId == "" && res.length > 0) {
          id = res[0].receiver;
          loadChat(id);
        }
      },
      "json"
    );
  } else {
    loadChat(relationId);
  }
}

//加载会话内容
function loadChat(relationId, t) {
  //loadIndex=layer.load();
  //使前面选中的变成未选中  然后让自己被选中
  $(".layim-this").removeClass("layim-this");
  var nowLi = $(".layim-chat-list  li[data-id=" + relationId + "]");
  $(nowLi).addClass("layim-this");
  //正打开着的会话就不需要显示未读数量了
  $(nowLi).find("b").remove();
  //修改当前会话的用户名称、头像、在线状态
  var corpName = "";
  if ($(nowLi).attr("data-corpName") != undefined) {
    corpName = $(nowLi).attr("data-corpName");
  }
  $(".layim-chat-username").html(
    $(nowLi).find("p:eq(0)").text() + "<cite>" + corpName + "</cite>"
  );
  $(".layim-chat-other  img").attr("src", $(nowLi).find("img").attr("src"));
  //刷新在线状态
  loadOnlineState();
  loadChatContent(relationId, t);
}

//加载客户会话内容
function loadKhChat(relationId, t) {
  //接收会话来源
  if (t != undefined) {
    fromType = t;
  }
  //如果聊天窗体不存在就打开它
  if ($(".layer-chat-open", top.document).length < 1) {
    openChat("restore");
  }
  //如果存在.myHeadImg则代表目前chat窗体处于最小化中，就不需要弹出，只要让他触发下单击自动restore
  if ($(".myHeadImg", top.document).length > 0) {
    $(".myHeadImg", top.document).click();
  }
  //使前面选中的变成未选中  然后让自己被选中
  $(".layim-this", top.document).removeClass("layim-this");
  var nowLi = $(
    ".layim-chat-list  li[data-id=" + relationId + "]",
    top.document
  );
  nowLi.addClass("layim-this");
  //如果用户列表不存在  就添加一列用户
  if (nowLi.length < 1) {
    $.ajax({
      type: "POST",
      url: "chat/getEmpInfo",
      async: false,
      data: { empCode: relationId },
      success: function (v, status, xhr) {
        var headImg = v.headImg == "" ? "images/headImg.png" : v.headImg;
        var html =
          '<li class="layim-this  layim-chat-temp" data-corpName="' +
          v.corpName +
          '" data-id="' +
          v.recId +
          '" onclick="loadChat(' +
          v.recId +
          ')" ><img src="' +
          headImg +
          '" ><div><p>' +
          v.employeeName +
          "</p><p></p></div></li>";
        $(".layim-chat-list", top.document).prepend(html);
        nowLi = $(".layim-this", top.document);
      },
    });
  }
  //正打开着的会话就不需要显示未读数量了
  $(nowLi).find("b").remove();
  //修改当前会话的用户名称、头像、在线状态
  var corpName = "";
  if ($(nowLi).attr("data-corpName") != undefined) {
    corpName = $(nowLi).attr("data-corpName");
  }
  $(".layim-chat-username", top.document).html(
    $(nowLi).find("p:eq(0)").text() + "<cite>" + corpName + "</cite>"
  );
  $(".layim-chat-other  img", top.document).attr(
    "src",
    $(nowLi).find("img").attr("src")
  );
  //刷新在线状态
  loadOnlineState();
  loadChatContent(relationId, t);
}

//发送聊天消息
function sendChat() {
  var sendContent = layedit.getContent(editIndex);
  if (sendContent.trim() == "") {
    alert("内容不能为空！", { icon: 5 });
    return false;
  }
  $.ajaxSettings.async = false;
  if (empCode != "") {
    $.post(
      "chat/send",
      {
        sendContent: sendContent,
        receiveId: $(".layim-chat-list .layim-this").attr("data-id"),
        fromType: fromType,
      },
      function (res) {
        loadChatBefore(res);
      }
    );
  } else {
    //游客发消息给客服
    var sendId = layui.data("tempChat").id;
    $.post(
      "chat/send",
      {
        sendContent: sendContent,
        receiveId: $(".layim-chat-list .layim-this").attr("data-id"),
        sendId: sendId,
      },
      function (res) {
        loadChatBefore(res);
      }
    );
  }
  $.ajaxSettings.async = true;
  $("#sendContent").html("");
  layedit.setContent(editIndex, "");
  setTimeout(function () {
    $("#kfDiv", top.document).scrollTop(
      $("#kfDiv", top.document).prop("scrollHeight")
    );
  }, 200);
}

//加载消息的前置处理，因为可能发消息的时候身份已过期了！
function loadChatBefore(res) {
  if (res == 1) {
    loadChat($(".layim-chat-list .layim-this").attr("data-id"));
  } else {
    layer.alert(
      "身份过期，请重新登录!",
      {
        title: "温馨提示",
        icon: 4,
        zIndex: layer.zIndex,
        closeBtn: 0,
        success: function (layero, index) {
          layer.setTop(layero);
        },
      },
      function (index) {
        location.reload();
      }
    );
  }
}

function chatKF() {
  if (empCode == "") {
    //游客
    monitorMsg();
    loadKfChat();
  } else {
    //非游客
    loadKfChat();
  }
}

var keyTemp;
var fromType = "";
layui.use(["layer", "jquery", "layedit", "form", "table"], function () {
  $ = layui.jquery;
  layer = layui.layer;
  layedit = layui.layedit;
  form = layui.form;
  table = layui.table;

  $("body").delegate(".layer-chat-min", "mouseover", function () {
    $(".layer-chat-min .layim-chat-other img").css("height", "24px");
    $(".layer-chat-min .layim-chat-other img").css("width", "24px");
    $(".layer-chat-min .layim-chat-other img").css("left", "8px");
    $(".layer-chat-min .layui-layer-title").css("height", "88px");
  });

  $("body").delegate(".layer-chat-min", "mouseout", function () {
    $(".layer-chat-min .layim-chat-other img").css("height", "40px");
    $(".layer-chat-min .layim-chat-other img").css("width", "40px");
    $(".layer-chat-min .layim-chat-other img").css("left", "0px");
    $(".layer-chat-min .layui-layer-title").css("height", "80px");
  });

  $(window).resize(function () {
    $(".layer-chat-min").css("top", "70px");
    $(".layer-chat-min").css("left", $(document).width() - 80);
  });

  //点击列表会话加载会话内容
  $("body").delegate(".chat", "click", function (e) {
    loadChat($(this).attr("data-id"));
    tempHeadImg_src = $(".layim-chat-other img", top.document).attr("src"); //把会话头像存起来
  });

  //关闭当前会话
  $("body").on("click", ".layim-chat-list li .layui-icon", function (e) {
    var l = $(".layim-chat-list li").length;
    if (l == 1) {
      layer.msg("至少保留一条会话", { icon: 0 });
      return false;
    }
    var id = $(this).parent().attr("data-id");
    $.post("chat/closeChat", { anotherId: id }, function () {
      loadChatUser(relationIdTemp, keyTemp);
    });
    e.stopPropagation();
  });

  //监听会话列表搜索
  $("#chatSearchDiv  input").on("input", function (e) {
    keyTemp = e.delegateTarget.value;
    loadChatUser(relationIdTemp, keyTemp);
  });

  //放大查看聊天图片
  $("body").delegate("#chat_main img", "click", function (e) {
    $(".layui-layer-shade").remove();
    //var w=$(this).width();
    //var h=$(this).height();
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

    imgIndex = layer.open({
      type: 1,
      title: false,
      closeBtn: 0,
      move: false,
      //zIndex:layer.zIndex,
      zIndex: 1147483647,
      area: w2 + "px",
      offset: [h, w],
      content: $("#imgBox"),
      success: function (layero, index) {
        //layer.setTop(layero);
      },
    });
  });

  //每隔10s刷新用户状态
  setInterval(function () {
    loadOnlineState();
  }, 10000);

  //每隔10s刷新用户列表的在线状态
  setInterval(function () {
    loadUserListOnlineState();
  }, 10000);

  //点击小头像
  $("body").delegate(".min-title", "click", function () {
    $(".layui-layer-setwin").css("display", "block");
    $(".layui-layer-max.layui-layer-maxmin").click();
    $(".layim-chat-list").css("display", "block");
    $("#rightBox").css("margin-left", "300px");
    $("#rightBox").css("width", "600px");
  });

  //选择沟通用语
  $("body").delegate("#xzBtn", "click", function () {
    //$("#").click(function(){
    gtSentenciesIndex = layer.open({
      id: "awen",
      title: "沟通用语选择",
      type: 2,
      skin: "layui-layer-rim",
      area: ["800px", "400px"],
      zIndex: 1147483646,
      //zIndex:layer.zIndex,
      //content:$("#chooseBox"),
      content: "gt_sentencies.jsp",
      success: function (layero, index) {
        //layer.setTop(layero);
      },
    });
    sentenceSearch(0);
  });

  //监听沟通用语分类下拉
  form.on("select(classifySel)", function (data) {
    sentenceSearch();
  });

  //监听单选
  table.on("radio(proTable)", function (obj) {
    layer.close(gtSentenciesIndex);
    $.post(
      "chat/send",
      {
        sendContent: obj.data.sentence,
        receiveId: $(".layim-chat-list .layim-this").attr("data-id"),
      },
      function (data) {
        loadChat($(".layim-chat-list .layim-this").attr("data-id"));
      }
    );
  });

  //监听沟通用语表格右侧工具栏
  table.on("tool(proTable)", function (obj) {
    var data = obj.data;
    var layEvent = obj.event;
    if (layEvent === "upd") {
      //编辑
      $("#saveForm [name=classify]").val(data.classify);
      $("#saveForm [name=sentence]").val(data.sentence);
      $("#saveForm [name=id]").val(data.id);
      $("[lay-filter=saveOk]").addClass("layui-btn-normal");
      editSentenceIndex = layer.open({
        title: "编辑沟通语句",
        type: 1,
        skin: "layui-layer-lan",
        area: "420px",
        zIndex: layer.zIndex,
        content: $("#saveBox"),
        success: function (layero, index) {
          layer.setTop(layero);
        },
      });
    } else if (layEvent === "del") {
      //删除
      layer.confirm(
        "确认删除吗？",
        { icon: 0, zIndex: layer.zIndex },
        function (index) {
          loadIndex = layer.open({ type: 3, zIndex: layer.zIndex });
          $.post("gtSentencies/del", { ids: data.id }, function (data, state) {
            layer.close(loadIndex);
            layer.msg("删除成功", { icon: 1, zIndex: layer.zIndex });
            setTimeout(function () {
              sentenceSearch();
            }, 1500);
          });
        }
      );
    }
  });

  //点击新增按钮
  $("#add").click(function () {
    $("[lay-filter=saveOk]").removeClass("layui-btn-normal");
    $("#saveForm [name=classify]").val("");
    $("#saveForm [name=sentence]").val("");
    $("#saveForm [name=id]").val("");
    editSentenceIndex = layer.open({
      title: "新增沟通语句",
      type: 1,
      skin: "layui-layer-molv",
      area: "420px",
      zIndex: layer.zIndex,
      content: $("#saveBox"),
      success: function (layero, index) {
        layer.setTop(layero);
      },
    });
  });

  //修改保存
  form.on("submit(saveOk)", function (d) {
    loadIndex = layer.open({ type: 3, zIndex: layer.zIndex });
    $.post("gtSentencies/save", d.field, function (d) {
      layer.close(loadIndex);
      layer.msg("保存成功！", { icon: 6, time: 1500, zIndex: layer.zIndex });
      setTimeout(function () {
        layer.close(editSentenceIndex);
        sentenceSearch(0);
      }, 1500);
    });
  });

  //监听浏览器关闭 如果关闭就提出当前登录用户
  var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
  var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
  var isIE =
    userAgent.indexOf("compatible") > -1 &&
    userAgent.indexOf("MSIE") > -1 &&
    !isOpera; //判断是否IE浏览器
  var isIE11 = userAgent.indexOf("rv:11.0") > -1; //判断是否是IE11浏览器
  var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
  if (!isIE && !isEdge && !isIE11) {
    //兼容chrome和firefox
    var _beforeUnload_time = 0,
      _gap_time = 0;
    var is_fireFox = navigator.userAgent.indexOf("Firefox") > -1; //是否是火狐浏览器
    window.onunload = function () {
      _gap_time = new Date().getTime() - _beforeUnload_time;
      if (_gap_time <= 5) {
        //$.post("user/kickOut",function(){})
      } else {
        //谷歌浏览器刷新
      }
    };
    window.onbeforeunload = function () {
      _beforeUnload_time = new Date().getTime();
      if (is_fireFox) {
        //火狐关闭执行
        //$.post("user/kickOut",function(){})
      } else {
        //火狐浏览器刷新
      }
    };
  }
});

//刷新在线状态
function loadOnlineState() {
  var id = $(".layim-chat-list .layim-this", top.document).attr("data-id");
  if (id != "undefined" && id != undefined) {
    $.post("chat/checkOnline", { id: id }, function (res) {
      if (res == 1) {
        $(".layim-chat-status", top.document).html(
          '<span class="layui-badge-dot layui-bg-green"></span>在线'
        );
        $(".layim-chat-other img").removeClass("offline");
      } else {
        $(".layim-chat-status", top.document).html(
          '<span class="layui-badge-dot layui-bg-gray"></span>离线'
        );
        $(".layim-chat-other img").addClass("offline");
      }
    });
  }
}
//刷新用户列表在线状态
function loadUserListOnlineState() {
  var userList = $(".layim-chat-list li");
  var ids = [];
  $.each(userList, function (i, item) {
    var id = $(item).attr("data-id");
    if (id != "undefined" && id != undefined) {
      ids.push(id);
    }
  });
  if (ids.length > 0) {
    $.post("chat/checkOnlines", { ids: ids.join(";") }, function (res) {
      $.each(res, function (i, item) {
        if (item.isAlive == "1") {
          $(".layim-chat-list li[data-id=" + item.id + "] img").removeClass(
            "offline"
          );
        } else {
          $(".layim-chat-list li[data-id=" + item.id + "] img").addClass(
            "offline"
          );
        }
      });
    });
  }
}

//查看自己的联系列表里有没有客服
function getKfIdByCurrent() {
  var kfId = "";
  $.ajax({
    type: "POST",
    url: "chat/getKfIdByCurrent",
    async: false,
    success: function (v, status, xhr) {
      kfId = v;
    },
  });
  return kfId;
}

//加载客服会话内容
function loadKfChat(t) {
  //$("#xzBtn",top.document).css("display","block");
  if (t != undefined) {
    fromType = t;
    if (t == "任务发布") {
      //$("#xzBtn",top.document).css("display","none!important");
      //$("#xzBtn",top.document).css('display','block');
      //$("#xzBtn",top.document).remove();
    }
  }

  //如果聊天窗体不存在就打开它
  if ($(".layer-chat-open").length < 1) {
    openChat("restore");
  }
  //如果存在.myHeadImg则代表目前chat窗体处于最小化中，就不需要弹出，只要让他触发下单击自动restore
  else if ($(".myHeadImg").length > 0) {
    $(".myHeadImg").click();
  }
  relationId = getKfIdByCurrent();
  if (relationId != "") {
    loadChat(relationId, t);
    return false;
  }
  //console.log(123);
  //使前面选中的变成未选中
  $(".layim-this").removeClass("layim-this");
  var nowLi;
  //从系统中随机获得一名客服的客服信息
  $.ajax({
    type: "POST",
    url: "chat/geKfIdBytRandom",
    async: false,
    success: function (v, status, xhr) {
      relationId = v.recId;
      var headImg = v.headImg == "" ? "images/headImg.png" : v.headImg;
      var html =
        '<li class="layim-this  layim-chat-temp" data-id="' +
        v.recId +
        '" onclick="loadChat(' +
        v.recId +
        ')" ><img src="' +
        headImg +
        '" ><div><p>' +
        v.realName +
        "</p><p></p></div></li>";
      //避免产生多个客服会话
      $(".layim-chat-temp[data-id=" + v.recId + "]").remove();

      $(".layim-chat-list").prepend(html);
      nowLi = $(".layim-this");
    },
  });
  //正打开着的会话就不需要显示未读数量了
  $(nowLi).find("b").remove();
  //修改当前会话的用户名称、头像、在线状态
  var corpName = "";
  if ($(nowLi).attr("data-corpName") != undefined) {
    corpName = $(nowLi).attr("data-corpName");
  }

  $(".layim-chat-username").html(
    $(nowLi).find("p:eq(0)").text() + "<cite>" + corpName + "</cite>"
  );
  $(".layim-chat-other img").attr("src", $(nowLi).find("img").attr("src"));
  //刷新在线状态
  loadOnlineState();
  loadChatContent(relationId, t);
}

//加载聊天内容
function loadChatContent(relationId, t) {
  var data = { relationId: relationId };
  if (empCode == "") {
    data.sendId = layui.data("tempChat").id;
  }
  $.post("chat/getList", data, function (data) {
    var h = "";
    for (var i = 0; i < data.length; i++) {
      var headImg =
        data[i].headImg == "" ? "images/headImg.png" : data[i].headImg;
      if (
        data[i].sendId == empCode ||
        (data[i].sendId == layui.data("tempChat").id && empCode == "")
      ) {
        h +=
          '<div class="right" >' +
          '<div class="chatObject"><b>' +
          data[i].createTime +
          "</b>" +
          data[i].employeeName +
          '<img src="' +
          headImg +
          '"></div>' +
          '<div class="chatContent">' +
          data[i].sendContent +
          "</div>" +
          "</div>";
      } else {
        if (data[i].fromType != "") {
          h +=
            "<div class='conversation'>对话来自于 ”" +
            data[i].fromType +
            "“</div>";
        }
        h +=
          '<div class="left" >' +
          '<div class="chatObject"><img src="' +
          headImg +
          '">' +
          data[i].employeeName +
          "<b>" +
          data[i].createTime +
          "</b></div>" +
          '<div class="chatContent">' +
          data[i].sendContent +
          "</div>" +
          "</div>";
      }
    }
    $("#chat_main", top.document).html(h);
    //没有对话来源就置空
    if (t == undefined) {
      fromType = "";
    }
    setTimeout(function () {
      $("#kfDiv", top.document).scrollTop(
        $("#kfDiv", top.document).prop("scrollHeight")
      );
    }, 200);
  });
}

//查询沟通用语列表
function sentenceSearch(t) {
  var classify = $("#chooseBox [name='classify']", top.document).val();
  table.render({
    id: "proTable",
    elem: "#proTable",
    url: "gtSentencies/getList", //数据接口
    height: "full",
    cols: [
      [
        { type: "radio", width: "10%" },
        { field: "classify", title: "分类", width: "15%" },
        { field: "sentence", title: "沟通用语", width: "55%" },
        {
          title: "操作",
          align: "center",
          templet: function (d) {
            var ysBtn =
              '<a class="layui-btn layui-btn-xs layui-btn-normal" lay-event="upd">编辑</a>';
            var thBtn =
              '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del">删除</a>';
            return ysBtn + thBtn;
          },
        },
      ],
    ],
    limit: 1000,
    where: {
      classify: classify,
    },
    done: function (res) {
      if (t == 0) {
        var checkArray = [];
        var datas = res.data;
        var h = "<option value=''>请选择</option>";
        for (var i = 0; i < datas.length; i++) {
          if (checkArray.indexOf(datas[i].classify) == -1) {
            h +=
              "<option value='" +
              datas[i].classify +
              "'>" +
              datas[i].classify +
              "</option>";
            checkArray.push(datas[i].classify);
          }
        }
        $("#chooseBox [name='classify']", top.document).html(h);
      }
      $("#chooseBox [name='classify']", top.document).val(classify);
      form.render("select", "chooseForm");
    },
  });
}

// 关闭指定弹窗
function closeModalItem(id) {
  layer.close(id);
}
