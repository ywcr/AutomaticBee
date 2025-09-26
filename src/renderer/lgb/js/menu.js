layui.use(["form", "jquery", "element"], function () {
  var form = layui.form;
  var element = layui.element;

  //自定义验证规则
  form.verify({
    repass: function (value) {
      if (value != $("#registBox [name=pwd]").val()) {
        return "密码不一致哦";
      }
    },
    repass2: function (value) {
      if (value != $("#czmmBox [name=pwd2]").val()) {
        return "密码不一致哦";
      }
    },
    idCard: [/(^\d{18}$)|(^\d{17}(\d|X|x)$)/, "身份证号不合法"],
  });

  //监听消息推送开关
  form.on("switch(sidenav)", function (data) {
    if (data.elem.checked) {
      layui.data("xxts", {
        key: "isShow",
        value: "true",
      });
    } else {
      layui.data("xxts", {
        key: "isShow",
        value: "false",
      });
    }
  });

  $('#implementationBox [name="phone"]')
    // 输入变化监听
    .on("input", showCaptcha);

  //点击登录按钮
  $("#implementation").click(function () {
    $("#implementationBox [name='phone']").val("");
    $("#implementationBox [name='captcha']").val("");
    $("#implementationBox [name='pwd']").val("");
    var isRememberLocal = layui.data("isRemember");
    if (isRememberLocal.phone != undefined) {
      $("#implementationBox [name='phone']").val(isRememberLocal.phone);
      $("#implementationBox [name='pwdPlaintext']").val(
        isRememberLocal.pwdPlaintext
      );
      $("#implementationBox [name='pwd']").val(isRememberLocal.pwd);
      $("#implementationBox [name='isRemember']").attr("checked", "checked");
      form.render("checkbox", "implementationForm");
      showCaptcha();
    } else {
      $("#implementationBox [name='isRemember']").attr("checked", false);
      form.render("checkbox", "implementationForm");
    }
    layer.open({
      type: 1,
      title: "用户登录",
      skin: "layui-layer-molv",
      area: ["380px"], //宽高
      content: $("#implementationBox"),
      cancel: function () {
        resetNc();
        VerificationCodeState = false;
      },
      end: function () {
        // location.reload();
      },
    });
    // document.getElementById("reset").click();
  });

  $("#yzmBtn").click(function () {
    var phone = $("#registBox [name=phone]").val();
    var reg = /^1\d{10}$/;
    if (reg.test(phone)) {
      $.post("user/sendRegistVerifyCode", { mobile: phone }, function (d) {
        if (d.code == 200) {
          $("#yzmBtn").attr("disable", true);
          $("#yzmBtn").addClass("layui-btn-disabled");
          var t = 60;
          //$("#registBox [name=sendTimestamp]").val(d);
          var clock = setInterval(function () {
            if (t > 0) {
              t--;
              $("#yzmBtn").html(t + "s");
            } else {
              clearInterval(clock);
              $("#yzmBtn").html("重新获取");
              $("#yzmBtn").attr("disable", false);
              $("#yzmBtn").removeClass("layui-btn-disabled");
            }
          }, 1000);
        } else {
          layer.msg(d.message, { icon: 5 });
        }
      });
    } else {
      $("#registBox [name=phone]").focus();
      layer.msg("请输入正确的手机号", { time: 1500, icon: 5 });
    }
  });

  // 签约中心
  $("body").delegate("#sign", "click", function (e) {
    //window.open("https://test.zxyy.ltd/vue/")
    localStorage.setItem("platform", "sign");
    let http = window.location.href.substring(
      0,
      window.location.href.indexOf("://")
    );
    console.log("http...", http);
    let domain =
      document.domain == "localhost" ? "localhost:8080" : document.domain;
    window.open(http + "://" + domain + "/vue/");
  });

  // 银企直连
  $("body").delegate("#bankPay", "click", function (e) {
    //window.open("https://test.zxyy.ltd/vue/")
    localStorage.setItem("platform", "bankPay");
    let http = window.location.href.substring(
      0,
      window.location.href.indexOf("://")
    );
    console.log("http...", http);
    let domain =
      document.domain == "localhost" ? "localhost:8080" : document.domain;
    window.open(http + "://" + domain + "/vue/");
  });

  //知识学习
  $("body").delegate("#study", "click", function (e) {
    $.post("user/examUserSync", (res) => {
      if (res.code == 200) {
        let token = res.data;
        document.cookie = "token=" + token + "; path=/";
        window.open("/exam-web/");
      } else {
        layer.msg(res.message, { time: 1500, icon: 5 });
      }
    });
  });

  //第三方平台支付：
  $("body").delegate("#merge_unpay", "click", function (e) {
    openIframeLayer("待支付", "pay/payMerge/waitPayIndex.html");
  });

  $("body").delegate("#merge_unpay_batch", "click", function (e) {
    openIframeLayer("待付批次", "pay/payMerge/batchToPaid.html");
  });

  $("body").delegate("#merge_pay_record", "click", function (e) {
    openIframeLayer("支付记录", "pay/payMerge/payRecordIndex.html");
  });

  $("body").delegate("#merge_pay_unneed", "click", function (e) {
    openIframeLayer("非标支付", "pay/payMerge/noPayIndex.html");
  });
  //运营方
  $("body").delegate("#adm_merge_unpay", "click", function (e) {
    openIframeLayer("待支付", "pay/payMergeOperator/waitPayIndex.html");
  });

  $("body").delegate("#adm_merge_unpay_batch", "click", function (e) {
    openIframeLayer("待付批次", "pay/payMergeOperator/batchToPaid.html");
  });

  $("body").delegate("#adm_merge_pay_record", "click", function (e) {
    openIframeLayer("支付记录", "pay/payMergeOperator/payRecordIndex.html");
  });

  $("body").delegate("#adm_merge_pay_unneed", "click", function (e) {
    openIframeLayer("非标支付", "pay/payMergeOperator/noPayIndex.html");
  });

  //任务企业：
  $("body").delegate("#directSettle", "click", function (e) {
    openIframeLayer("直发任务结算", "taskSettlement/direct/index.html");
  });
  $("body").delegate("#directCheck", "click", function (e) {
    openIframeLayer(
      "直发任务抽检",
      "directDeliveryTaskSamplingInspection/index.html"
    );
  });
  $("body").delegate("#complaintRecord", "click", function (e) {
    openIframeLayer("抽检申诉申请记录", "complaint_record/index.html");
  });
  $("body").delegate("#auditingRecord", "click", function (e) {
    openIframeLayer("抽检申诉审核记录", "complaint_record/audit.html");
  });
  $("body").delegate("#undertakeSettleConfirm", "click", function (e) {
    localStorage.setItem("typeCode", 5);
    openIframeLayer(
      "承接任务结算确认",
      "supplier/enterprise/index.html?typeCode=5"
    );
  });
  $("body").delegate("#forwardSettle", "click", function (e) {
    openIframeLayer("转发任务结算", "taskSettlement/forward/index.html");
  });
  $("body").delegate("#packageSettle", "click", function (e) {
    openIframeLayer("分包任务结算", "taskSettlement/package/index.html");
  });
  //供应商:
  $("body").delegate("#enterpriseSettleConfirm", "click", function (e) {
    localStorage.setItem("typeCode", 4);
    openIframeLayer(
      "企业任务结算确认",
      "supplier/enterprise/index.html?typeCode=4"
    );
  });
  $("body").delegate("#personnelSettleConfirm", "click", function (e) {
    openIframeLayer("灵工任务结算确认", "supplier/base/index.html");
  });

  //运营方结算统计
  $("body").delegate("#supplierSettlementCensus", "click", function (e) {
    openIframeLayer(
      "供应商人员维度统计",
      "yyf/settlementCensus/personnelStatistics.html"
    );
  });

  //运营方结算统计
  $("body").delegate("#enterpriseSummaryStatistics", "click", function (e) {
    openIframeLayer("企业维度汇总统计", "yyf/datastatistics/index.html");
  });
  //运营方平台结算支付数据统计
  $("body").delegate("#paySettlementStatistics", "click", function (e) {
    openIframeLayer(
      "平台维度汇总统计",
      "yyf/paySettlementStatistics/index.html"
    );
  });

  // 同仁堂合作企业
  $("body").delegate("#trthzqy", "click", function (e) {
    openIframeLayer("同仁堂合作企业", "trtOpenAccount.html");
  });

  // 企业开户
  $("body").delegate("#qykh", "click", function (e) {
    openIframeLayer("企业开户", "trtOpenAccount.html");
  });

  //退出登录
  $("body").delegate("#logout", "click", function (e) {
    var u = '<a href="javascript:void(0)"   id="implementation">用户登录</a>';
    $("#u").html(u);
    element.render("nav");
  });

  //点击消息链接（我的消息中的） (暂时不处理冒泡，点了连接就代表已读)
  $("body").on("click", ".allMsg-p a", function (e) {
    var msgType2 = $(this).parent().attr("data-type");
    var relevantId2 = $(this).parent().attr("data-id");
    openWindowByLink(msgType2, relevantId2);
    e.stopPropagation();
  });

  //点击消息链接（右下角消息推送中的）
  $("body").delegate("#msg-pc a", "click", function () {
    layer.close(layerSteward);
    openWindowByLink(msgType, relevantId);
  });

  //设置菜单高度
  $(".individuation .layui-nav-tree").height($(document).height() - 174);

  $("#menuLi").click(function () {
    $(".individuation")
      .toggleClass("layui-hide")
      .toggleClass("bounceInLeft")
      .toggleClass("bounceOutLeft");
  });

  //未登录则无法跳转到发布页面
  $("#publishBtn").click(function () {
    if (empCode == "") {
      $("#implementation").click();
    } else {
      $("[name=page]").attr("src", "publish.jsp");
    }
  });

  $("#publishBtn2").click(function () {
    if (empCode == "") {
      $("#implementation").click();
    } else {
      $("[name=page]").attr("src", "publish_fqf.jsp");
    }
  });

  $("#helpBtn").click(function () {
    if (empCode == "") {
      $("#implementation").click();
    } else {
      $("[name=page]").attr("src", "helplist.html");
    }
  });

  //创建企业
  $("body").delegate("#cjqy", "click", function (e) {
    layer.open({
      type: 2,
      title: "创建企业",
      skin: "layui-layer-molv",
      area: ["600px", "640px"], //宽高
      content: "addCorporation.jsp",
    });
  });

  //重置密码提交
  $("body").on("click", ".repasswd", function () {
    // 验证密码格式
    // let pass = /^[0-9a-zA-Z._~!@#$^&*]{6,16}$/
    let pass =
      /^((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])^.*$)/;
    if (
      $("#czmmBox [name=pwd]").val().length >= 8 &&
      $("#czmmBox [name=pwd]").val().length <= 16
    ) {
      if (!pass.exec($("#czmmBox [name=pwd]").val())) {
        layer.msg(
          "密码不符合要求,密码至少包含大写字母、小写字母、数字、 标点及特殊字符中3种的组合!",
          { icon: 0 }
        );
        return false;
      }
    } else {
      layer.msg("密码长度不能低于8位不能超过16位！", { icon: 5 });
      return false;
    }

    if ($("#czmmBox [name=pwd]").val() != $("#czmmBox [name=pwd2]").val()) {
      layer.msg("两次密码不一致!", { icon: 0 });
      return false;
    }
    loadIndex = layer.load();
    $.ajax({
      url: "user/czmm",
      type: "POST",
      data: $("#czmmForm").serialize(),
      traditional: true,
      success: function (data) {
        layer.close(loadIndex);
        if (data == 1) {
          layer.msg("密码重置成功!", { icon: 1 });
          setTimeout(function () {
            location.href = "userLogout";
          }, 1500);
        } else if (data == -2) {
          layer.msg("原密码错误!", { icon: 5 });
        } else {
          layer.msg("重置失败!", { icon: 2 });
        }
      },
    });
    return false;
  });

  $("#yzmBtn2").click(function () {
    var phone = $("#forgetBox [name=phone]").val();
    var reg = /^1\d{10}$/;
    if (reg.test(phone)) {
      $.post(
        "user/sendForgetPasswordVerifyCode",
        { mobile: phone },
        function (d) {
          if (d.code == 200) {
            $("#yzmBtn2").attr("disable", true);
            $("#yzmBtn2").addClass("layui-btn-disabled");
            var t = 60;
            //$("#forgetBox [name=sendTimestamp]").val(d);
            var clock = setInterval(function () {
              if (t > 0) {
                t--;
                $("#yzmBtn2").html(t + "s");
              } else {
                clearInterval(clock);
                $("#yzmBtn2").html("重新获取");
                $("#yzmBtn2").attr("disable", false);
                $("#yzmBtn2").removeClass("layui-btn-disabled");
              }
            }, 1000);
          } else {
            layer.msg(d.message, { icon: 5 });
          }
        }
      );
    } else {
      $("#forgetBox [name=phone]").focus();
      layer.msg("请输入正确的手机号", { time: 1500, icon: 5 });
    }
  });

  //监听[忘记密码]提交
  form.on("submit(forgetForm)", function (d) {
    loadIndex = layer.load();
    let pass =
      /^((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])^.*$)/;
    if (
      $("#forgetForm [name=pwd]").val().length >= 8 &&
      $("#forgetForm [name=pwd]").val().length <= 16
    ) {
      if (!pass.exec($("#forgetForm [name=pwd]").val())) {
        layer.msg(
          "密码不符合要求,密码至少包含大写字母、小写字母、数字、 标点及特殊字符中3种的组合!",
          { icon: 0 }
        );
        return false;
      }
    } else {
      layer.msg("密码长度不能低于8位不能超过16位！", { icon: 5 });
      return false;
    }
    $.post("user/forgetPwd", $("#forgetForm").serialize(), function (res) {
      layer.close(loadIndex);
      if (res.code == 200) {
        layer.msg("操作成功！", { icon: 6 });
        setTimeout(function () {
          location.reload();
        }, 1500);
      } else {
        layer.msg(res.message, { icon: 5 });
      }
      // if(data==-2){
      // 	layer.msg("手机验证码错误！",{icon:5});
      // }else if(data==-3){
      // 	layer.msg("手机验证码失效！",{icon:5});
      // }
      // else{
      // 	layer.msg("操作成功！",{icon:6});
      // 	setTimeout(function(){
      // 		location.reload();
      // 	},1500)
      // }
    });
    return false;
  });

  //监听[注册]提交
  form.on("submit(registForm)", function (d) {
    if (!$("#registBox [name=isRead]").prop("checked")) {
      layer.msg("请阅读并同意遵守" + xyNames + "！", { icon: 0 });
      return false;
    }
    let pass =
      /^((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[a-z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[\W_])^.*$)|((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])^.*$)/;
    if (
      $("#registBox [name=pwd]").val().length >= 8 &&
      $("#registBox [name=pwd]").val().length <= 16
    ) {
      if (!pass.exec($("#registBox [name=pwd]").val())) {
        layer.msg(
          "密码不符合要求,密码至少包含大写字母、小写字母、数字、 标点及特殊字符中3种的组合!",
          { icon: 0 }
        );
        return false;
      }
    } else {
      layer.msg("密码长度不能低于8位不能超过16位！", { icon: 5 });
      return false;
    }
    loadIndex = layer.load();
    $.post("user/regist", $("#registForm").serialize(), function (res) {
      layer.close(loadIndex);
      if (res.code == 200) {
        layer.close(registIndex);
        layer.open({
          type: 2,
          title: "信息完善",
          closeBtn: 0,
          skin: "layui-layer-molv",
          area: ["600px", "650px"], //宽高
          content: "myInfo_regist.jsp?empCode=" + res.data.id,
        });
      } else {
        layer.msg(res.message, { icon: 5 });
      }
      // if(data.code=="-1"){
      // 	layer.msg("此手机号已注册！",{icon:5});
      // }else if(data.code=="-2"){
      // 	layer.msg("手机验证码错误！",{icon:5});
      // }else if(data.code=="-3"){
      // 	layer.msg("手机验证码失效！",{icon:5});
      // }
      // else{
      // 	layer.close(registIndex);
      // 	layer.open({
      // 		type:2,
      // 		title:'信息完善',
      // 		closeBtn:0,
      // 		skin:'layui-layer-molv',
      // 		area: ['600px','650px'], //宽高
      // 		content:"myInfo_regist.jsp?empCode="+data.id
      // 	})
      // }
    });
    return false;
  });

  //放大预览图片
  $("body").delegate("#RZ_Form img", "click", function (e) {
    var w = $(this).width() * 2;
    var h = $(this).height() * 2;
    if (w < h) {
      w = w * 1.25;
      h = h * 1.25;
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
      zIndex: 99999999,
      area: w2 + "px",
      offset: [h, w],
      content: $("#imgBox"),
    });
  });

  $("body").delegate(".layui-layer-shade", "click", function () {
    layer.close(imgIndex);
  });

  $("body").delegate("#imgBox", "click", function () {
    layer.close(imgIndex);
  });

  //查询未读消息
  $("#unread").click(function () {
    msgState = "0";
    $("#readAll").css("display", "inline-block");
    searchMsg(msgState);
  });

  //查询已读消息
  $("#readed").click(function () {
    msgState = "1";
    $("#readAll").css("display", "none");
    searchMsg("1");
  });
  $("#readAll").click(function () {
    readAll();
  });

  //全部已读
  function readAll() {
    $.post("msg/readAll", function (res) {
      $("#readAll").css("display", "inline-block");
      msgState = "0";
      searchMsg(msgState);
      unreadCount();
    });
  }

  $("#searchMsgBtn").click(function () {
    searchMsg(msgState);
  });

  //任务费用支付
  $("body").delegate("#task_pay", "click", function (e) {
    layer.open({
      type: 2,
      title: "任务费用支付",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "pay/pay.jsp?t=xqf",
    });
  });

  //实施工单
  $("body").delegate("#impl_work_order", "click", function (e) {
    /*		layer.open({
			type: 2,
			//   title: '实施工单',
			title: false,
			skin: 'layui-layer-blank',
			area: ['100%', '100%'],
			content: "xqf/implementationOrder.jsp"
		})*/
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "证据链数据管理",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "xqf/implementationOrder.jsp",
    });
  });
  // task_process_list_sponsor

  //任务进程
  $("body").delegate("#task_process_list_sponsor", "click", function (e) {
    layer.open({
      type: 2,
      title: "任务进程",
      area: ["100%", "100%"],
      content: "impl_work_order/task_process_list.jsp?process=sponsor",
    });
  });

  //任务进程
  $("body").delegate("#task_process_list", "click", function (e) {
    layer.open({
      type: 2,
      title: "任务进程",
      area: ["100%", "100%"],
      content: "impl_work_order/task_process_list.jsp",
    });
  });

  //任务支付 (双高又不需要这个页面了)
  /*	$("#sg_task_pay").click(function () {
            layer.open({
                type: 2,
                title: '任务支付',
                skin: 'layui-layer-blank',
                area: ['1300px', '80%'],
                content: "pay/task_pay.jsp?t=sg"
            })
        })*/

  //已关注承接人
  $("body").delegate("#xqf_zrrscgl,#xqf_cjrscgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "承接人管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "empCollect.jsp",
    });
  });

  //已关注承接企业
  $("body").delegate("#zrrscgl,#fqf_zrrscgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "承接企业管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "empCollect_fqf.jsp",
    });
  });

  //标签管理
  $("body").delegate("#xqf_bqgl,#fqf_bqgl,#xqf_cjrbq", "click", function (e) {
    layer.open({
      type: 2,
      title: "标签管理",
      skin: "layui-layer-molv",
      area: ["800px", "600px"],
      content: "lable.jsp",
    });
  });

  //承接企业标签管理
  $("body").delegate("#bqgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "标签管理",
      skin: "layui-layer-molv",
      area: ["800px", "600px"],
      content: "lable_fqf.jsp",
    });
  });

  //设置标签
  $("body").delegate("#szbq", "click", function (e) {
    layer.open({
      type: 2,
      title: "标签设置",
      skin: "layui-layer-molv",
      area: ["400px", "500px"],
      content: "select/selectLable.jsp",
    });
  });

  //阿拉丁接口
  $("body").delegate("#apiInfo", "click", function (e) {
    layer.open({
      type: 2,
      title: "阿拉丁接口 ",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "apiInfo.jsp",
    });
  });

  //索取发票管理  （需求企业）
  $("body").delegate("#xqf_sqfpgl,#fqf_sqfpgl", "click", function (e) {
    layer.msg("暂未开通！");
    /*    	layer.open({
                    type:2,
                    title:'索取发票管理 ',
                    skin:'layui-layer-molv',
                    area: ['1300px','80%'],
                    content:"sqfpgl.jsp"
                })*/
  });

  //企业开票管理  （运营方）
  $("body").delegate("#qykpgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "企业开票管理 ",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "qykpgl.jsp",
    });
  });

  //企业信息
  $("body").delegate("#qyxq", "click", function (e) {
    layer.open({
      type: 2,
      title: "企业信息",
      skin: "layui-layer-molv",
      area: ["800px", "640px"],
      content: "editCorporation.html",
    });
  });

  //加入企业
  $("body").delegate("#jrqy", "click", function (e) {
    layer.open({
      type: 2,
      title: "加入企业",
      skin: "layui-layer-molv",
      area: ["920px", "540px"],
      content: "joinCorporation.html",
    });
  });

  //重置密码
  $("body").delegate("#czmm", "click", function (e) {
    layer.open({
      type: 1,
      title: "重置密码",
      skin: "layui-layer-molv",
      area: ["400px", "260px"],
      content: $("#czmmBox"),
    });
  });

  //手机换绑
  $("body").delegate("#sjhb", "click", function (e) {
    layer.open({
      type: 2,
      title: "手机换绑",
      skin: "layui-layer-molv",
      area: ["400px", "220px"],
      content: "sjhb.jsp",
    });
  });

  //拒绝最新协议政策
  $("body").delegate(".xyzc_no", "click", function (e) {
    location.href = "userLogout";
  });
  //拒绝最新协议政策
  $("body").delegate("#xyzc_no", "click", function (e) {
    location.href = "userLogout";
  });

  //同意最新协议政策
  $("body").delegate("#xyzc_yes", "click", function (e) {
    loadIndex = layer.load();
    let param = {};
    param.empId = $("[name=empId]").val();
    param.empType = $("[name=empType]").val();
    param.phone = $("#implementationBox [name=phone]").val();
    param.pwd = $("#implementationBox [name=pwd]").val();
    param.iv = $("#implementationBox [name=iv]").val();
    $.post("user/xyzcYes", param, function () {
      // $("[name=ignoreCaptcha]").val("1");
      // $("#loginSubmit").attr("disabled",false);
      // $("#loginSubmit").click();
      layer.closeAll();
      checkLicense(loginInit);
      informationLackWarning();
      platformReidProtocolCheck();
      $("#menu-jsp").load("menu/menu.jsp");
      element.render("nav");
    });
  });

  //查看或修改个人信息
  $("body").delegate("#myInfo", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      /*title:'用户详情',
			skin:'layui-layer-molv',*/
      title: " 成员详情 ",
      skin: "layui-layer-white",
      area: ["680px", "640px"],
      offset: "10%",
      // content:'transfer/myInfo.jsp',
      content: "general/MyCenter/enterpriseUser.html",
      success: function (layero, index) {
        //找到当前弹出层的iframe元素
        //var iframe = layui.$(layero).find('iframe');
        //设定iframe的高度为当前iframe内body的高度
        //iframe.css('height', iframe[0].contentDocument.body.offsetHeight);
        //重新调整弹出层的位置，保证弹出层在当前屏幕的中间位置
        //$(layero).css('top', (window.innerHeight - iframe[0].offsetHeight) / 2);
      },
    });
  });

  //统计报表
  $("body").delegate("#tjbb", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "统计报表",
      skin: "layui-layer-molv",
      area: ["1400px", "80%"],
      content: "tjbb.jsp",
    });
  });

  //付款确认
  $("body").delegate("#fkqr", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "付款确认",
      skin: "layui-layer-molv",
      area: ["1400px", "80%"],
      content: "fkqr.jsp",
    });
  });

  //选项设置
  $("body").delegate("#xxsz", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "工单选项",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"], //宽高
      content: "gdxx.jsp",
    });
  });

  //任务规则
  $("body").delegate("#xmgz", "click", function (e) {
    /*		layer.open({
                    id:'awen',
                    type:2,
                    title:'工单规则',
                    skin:'layui-layer-molv',
                    area: ['1300px','80%'], //宽高
                    content:"gdgz.jsp"
                })*/
    layer.open({
      id: "awen",
      type: 2,
      title: false,
      skin: "layui-layer-molv",
      area: ["1000px", "600px"], //宽高
      content: "gdgz_manage.jsp",
    });
  });

  //沟通用语管理
  $("body").delegate(
    "#gtyygl,#xqf_gtyygl,#fqf_gtyygl,#gtyygl2",
    "click",
    function (e) {
      layer.open({
        id: "awen",
        type: 2,
        title: "沟通用语管理",
        skin: "layui-layer-molv",
        area: ["1300px", "80%"],
        content: "gt_sentencies.jsp",
      });
    }
  );

  //人才考核管理
  $("body").delegate("#rckhgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "人才考核审核",
      skin: "layui-layer-molv",
      area: ["90%", "80%"],
      content: "rckhgl.jsp",
    });
  });

  //备案信息审核 baxxgl
  $("body").delegate("#baxxgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "备案信息审核",
      skin: "layui-layer-molv",
      area: ["90%", "80%"],
      content: "records.jsp",
    });
  });

  //管理
  $("body").delegate("#qxgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "权限管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "yyf/module.jsp",
    });
  });
  //运营方企业信息管理
  $("body").delegate("#qyxxgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "我的企业",
      skin: "layui-layer-molv",
      area: ["800px", "80%"],
      content: "qyxxgl.jsp",
    });
  });
  //运营方场景管理
  $("body").delegate("#cjgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "场景管理",
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "taskScene/homepage.html",
    });
  });

  $("body").delegate("#shareEconomic", "click", function (e) {
    layer.open({
      type: 2,
      title: "共享经济服务协议",
      skin: "layui-layer-molv",
      area: ["800px", "80%"],
      content: "shareEconomic/sign_history.jsp",
    });
  });

  //企业信息管理 旧
  $("body").delegate(
    "#corpxxgl,#xqf_corpxxgl,#fqf_corpxxgl",
    "click",
    function (e) {
      layer.open({
        type: 2,
        title: "企业信息管理",
        skin: "layui-layer-molv",
        area: ["1000px", "90%"],
        content: "corpxxgl.jsp",
      });
    }
  );

  //企业信息管理 - 任务企业 新
  $("body").delegate("#corpxxglTask", "click", function (e) {
    layer.open({
      type: 2,
      title: " ",
      skin: "layui-layer-white",
      area: ["1400px", "900px"],
      content: "xqf/EnterpriseInfo/qyxx.jsp",
    });
  });

  //任务企业 二级菜单  供应商报价管理
  $("body").delegate("#supplierOfferManagement", "click", function (e) {
    layer.open({
      type: 2,
      title: " ",
      skin: "layui-layer-white",
      area: ["1400px", "800px"],
      content: "xqf/customer_files/supplier.html",
    });
  });

  //任务企业 二级菜单  客户企业档案
  $("body").delegate("#enterpriseArchives", "click", function (e) {
    layer.open({
      type: 2,
      title: "客户企业档案",
      skin: "layui-layer-white",
      area: ["1400px", "600px"],
      content: "xqf/customer_files/file.jsp",
    });
  });

  //服务企业 二级菜单  上游客户档案
  $("body").delegate("#provider_enterpriseArchives", "click", function (e) {
    layer.open({
      type: 2,
      title: "上游客户档案",
      skin: "layui-layer-white",
      // area: ['1200px', '900px'],
      area: ["80%", "90%"],
      // content: "gyf/EnterpriseInfo/upstreamfile.jsp"
      content: "src/view/provider/record/Customer.html",
    });
  });

  //企业信息管理 - 供应商 新
  $("body").delegate("#corpxxgSupplier", "click", function (e) {
    layer.open({
      type: 2,
      title: " ",
      skin: "layui-layer-white",
      area: ["1400px", "900px"],
      content: "gyf/EnterpriseInfo/qyxx.jsp",
    });
  });

  $("body").delegate("#customerEnterpriseArchives", "click", function (e) {
    layer.open({
      type: 2,
      title: "客户企业档案",
      skin: "layui-layer-white",
      // area: ['1200px', '900px'],
      area: ["80%", "90%"],
      content: "src/view/demand/record/Customer.html",
    });
  });

  $("body").delegate("#serviceFee", "click", function (e) {
    layer.open({
      type: 2,
      title: "服务商报价管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "settlement_manager/index.jsp",
    });
  });

  //平台服务费管理
  $("body").delegate("#pay", "click", function (e) {
    layer.open({
      type: 2,
      title: "平台服务费管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "collection_personal_info.jsp",
    });
  });

  //服务商推广费管理
  $("body").delegate("#pay_fwstgf", "click", function (e) {
    layer.open({
      type: 2,
      title: "服务商推广费管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "collection_enterprise.jsp",
    });
  });

  //禁用词管理
  $("body").delegate("#jycgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "禁用词管理",
      skin: "layui-layer-molv",
      area: ["740px", "250px"],
      content: "jycgl.jsp",
    });
  });

  //调查问卷模板
  $("body").delegate("#dcwjmb", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "调查问卷模板",
      skin: "layui-layer-molv",
      area: ["1300px", "90%"],
      content: "dcwjmbTab.jsp",
    });
  });

  //学术活动模板
  $("body").delegate("#xshdmb", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "学术活动模板",
      skin: "layui-layer-molv",
      area: ["80%", "90%"],
      content: "xshdmbTab.jsp",
    });
  });

  //推广活动模板
  $("body").delegate("#tghdmb", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "推广活动模板",
      skin: "layui-layer-molv",
      area: ["80%", "90%"],
      content: "tghdmbTab.jsp",
    });
  });

  //数字营销模板
  $("body").delegate("#szyxmb", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "数字营销模板",
      skin: "layui-layer-molv",
      area: ["90%", "90%"],
      content: "szyxmbTab.jsp",
    });
  });

  //通知管理
  $("body").delegate("#advise", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "通知管理",
      skin: "layui-layer-molv",
      area: ["70%", "80%"],
      content: "advise.jsp",
    });
  });

  //帮助中心管理
  $("body").delegate("#help", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "帮助中心管理",
      skin: "layui-layer-molv",
      area: ["1400px", "80%"],
      content: "help.jsp?type=1",
    });
  });

  //规则体系管理
  $("body").delegate("#systemOfRules", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "规则体系管理",
      skin: "layui-layer-molv",
      area: ["1057px", "80%"],
      content: "help.jsp?type=2",
    });
  });

  //渠道信息选项管理
  $("body").delegate("#qdxxxxgl", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "渠道客户选项",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "qdxxxxgl.jsp",
    });
  });

  //共享渠道档案库
  $("body").delegate("#gxqddak", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "共享渠道档案库",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "qdkh.jsp",
    });
  });
  //机构数据
  $("body").delegate("#jgsj", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "机构数据",
      skin: "layui-layer-molv",
      area: ["100%", "100%"],
      content: "yyf/channelData/organizationIndex.html",
    });
  });
  //机构数据
  $("body").delegate("#yssj", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "医生数据",
      skin: "layui-layer-molv",
      area: ["100%", "100%"],
      content: "yyf/channelData/doctorIndex.html",
    });
  });

  //科室数据管理
  $("body").delegate("#kssjgl", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "科室数据管理",
      skin: "layui-layer-molv",
      area: ["1300px", "800px"],
      content: "yyf/archives/hospitalDepartmentLibrary.html",
    });
  });

  //网页图文管理
  $("body").delegate("#wytwgl", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "网页图文管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "wytwgl.jsp",
    });
  });

  //资讯中心管理
  $("body").delegate("#zxzxgl", "click", function (e) {
    layer.open({
      id: "awen",
      type: 2,
      title: "资讯中心管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "article.jsp",
    });
  });

  //企业用户管理
  $("body").delegate("#qyyhgl,#xqf_qyyhgl,#fqf_qyyhgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "企业用户管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "qyyhgl.jsp",
    });
  });

  //角色管理
  $("body").delegate("#role,#xqf_role,#fqf_role", "click", function (e) {
    layer.open({
      type: 2,
      title: "角色管理",
      skin: "layui-layer-molv",
      area: ["1400px", "800px"], //宽高
      content: "role.html",
    });
  });

  //从业者联系人管理
  $("body").delegate("#partition_linker", "click", function (e) {
    layer.open({
      type: 2,
      title: "从业者联系人管理",
      skin: "layui-layer-molv",
      area: ["1300px", "90%"],
      content: "yyf/partition_linker.html",
    });
  });

  //运营方角色管理
  $("body").delegate("#role_admin", "click", function (e) {
    layer.open({
      type: 2,
      title: "角色管理",
      skin: "layui-layer-molv",
      area: ["1400px", "800px"], //宽高
      content: "role_admin.html",
      // content: 'role.html'
    });
  });

  //运营方用户管理
  $("body").delegate("#yyfyhgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "运营方用户管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "yyfyhgl.jsp",
    });
  });

  //需求企业管理
  $("body").delegate("#xqqygl", "click", function (e) {
    layer.open({
      type: 2,
      title: "客户企业管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "customer_manager/index.jsp",
      // content:'xqqygl.jsp'
    });
  });

  //需求企业管理
  $("body").delegate("#ImplUserFocus", "click", function (e) {
    layer.open({
      type: 2,
      title: "实施人关注",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "customer/index.html",
      // content:'xqqygl.jsp'
    });
  });

  //共享经济服务
  $("body").delegate("#gxjjfw", "click", function (e) {
    layer.open({
      type: 2,
      title: "共享经济服务",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "pay_manager/index.jsp",
    });
  });

  //双高系统对接
  $("body").delegate("#sgzx_gxjjfw", "click", function (e) {
    layer.open({
      type: 2,
      title: false,
      //skin:'layui-layer-molv',
      area: ["1300px", "80%"],
      content: "sgzx_cooperation.jsp",
    });
  });

  /*  //自然人用户管理
      $("body").delegate("#zrryhgl", "click", function (e) {
          layer.open({
              type: 2,
              title: '自由职业者管理',
              skin: 'layui-layer-molv',
              area: ['1300px', '80%'],
              content: 'zrryhgl.jsp'
          })
      })*/
  //从业者管理
  $("body").delegate("#cyzgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "从业者管理",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "cyzgl.jsp",
    });
  });

  //自由职业者服务平台管理
  /*    $("body").delegate("#zyzyzfwptgl","click", function(e){
            layer.open({
                type:2,
                title:'联盟管理',
                skin:'layui-layer-molv',
                area: ['1300px','90%'],
                offset:'5%',
                content:'cooperation.jsp'
            })
         })*/

  //身份认证管理
  $("body").delegate("#sfrzgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "身份认证管理",
      skin: "layui-layer-molv",
      area: ["80%", "80%"],
      content: "sfrzgl.jsp",
    });
  });
  //禁用词管理
  $("body").delegate("#jyc", "click", function (e) {
    layer.open({
      type: 2,
      title: "禁用词管理",
      skin: "layui-layer-molv",
      area: ["800px", "50%"],
      content: "yyf/gdjyc.html",
    });
  });
  //企业信息管理
  $("body").delegate("#enterprisegl", "click", function (e) {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false,
      title: "企业信息管理",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "yyf/enterprise_information.html",
    });
  });

  //企业认证管理
  $("body").delegate("#qyrzgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "企业认证管理",
      skin: "layui-layer-molv",
      area: ["80%", "80%"],
      content: "qyrzgl.jsp",
    });
  });

  //精灵蜂资质管理
  $("body").delegate("#jlfzzgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "精灵蜂资质管理",
      skin: "layui-layer-molv",
      area: ["1100px", "80%"],
      content: "Regulatory/licenseQuery.jsp",
    });
  });

  //用户规则
  $("body").delegate("#yhgz", "click", function (e) {
    layer.open({
      type: 2,
      title: "用户规则",
      skin: "layui-layer-molv",
      area: ["80%", "80%"],
      content: "yhgz.jsp",
    });
  });

  //监管方账号管理
  $("body").delegate("#jgfzhgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "监管方账号管理",
      skin: "layui-layer-molv",
      area: ["50%", "80%"],
      content: "yyf/regulatory.jsp",
    });
  });

  //任务场景管理
  $("body").delegate("#xmsz", "click", function (e) {
    layer.open({
      type: 2,
      title: "任务场景管理",
      skin: "layui-layer-molv",
      area: ["80%", "80%"],
      content: "xmsz.jsp",
    });
  });

  //区域信息
  $("body").delegate("#qyxx", "click", function (e) {
    layer.open({
      type: 2,
      title: "区域信息",
      skin: "layui-layer-molv",
      area: ["900px", "80%"],
      content: "area.html",
    });
  });

  //科室信息
  $("body").delegate("#ksxx", "click", function (e) {
    layer.open({
      type: 2,
      title: "科室信息",
      skin: "layui-layer-molv",
      area: ["60%", "80%"],
      content: "ksxx.html",
    });
  });

  //产品信息
  $("body").delegate("#cpxx", "click", function (e) {
    layer.open({
      type: 2,
      title: "产品信息",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "product.html",
    });
  });

  //用户协议日志
  $("body").delegate("#yhxyrz", "click", function (e) {
    layer.open({
      type: 2,
      title: "用户协议日志",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "yhxyrz.jsp",
    });
  });

  //协议管理
  $("body").delegate("#xygl", "click", function (e) {
    layer.open({
      type: 2,
      title: "协议模板", //老版本 2.2之前
      skin: "layui-layer-molv",
      area: ["1300px", "90%"],
      content: "xymbgl.jsp",
    });
  });
  //协议管理2
  $("body").delegate("#xymbgl", "click", function (e) {
    layer.open({
      type: 2,
      title: "协议模板管理",
      skin: "layui-layer-molv",
      area: ["90%", "80%"],
      content: "yyf/contractTemplate/contractTemplate.jsp",
    });
  });

  // 运营方 -  客户协议  - 签署记录
  $("body").delegate("#customerAgreement", "click", function (e) {
    layer.open({
      type: 2,
      title: "客户协议",
      skin: "layui-layer-molv",
      area: ["80%", "85%"],
      content: "yyf/protocolSignRecord/customerAgreement.html",
    });
  });
  // 运营方 -  从业者服务协议  - 签署记录
  $("body").delegate("#practitionerServiceAgreement", "click", function (e) {
    layer.open({
      type: 2,
      type: 2,
      title: "从业者协议",
      skin: "layui-layer-molv",
      area: ["80%", "85%"],
      content: "yyf/protocolSignRecord/practitionerServiceAgreement.html",
    });
  });

  // 运营方 -  签署操作日志
  $("body").delegate("#signRecord", "click", function (e) {
    layer.open({
      type: 2,
      type: 2,
      title: "签署操作日志",
      skin: "layui-layer-molv",
      area: ["80%", "85%"],
      content: "yyf/protocolSignRecord/signOperationLog.html",
    });
  });

  //运营方数据展示
  $("body").delegate("#yyfsjzs", "click", function (e) {
    layer.open({
      type: 2,
      title: "数据报表",
      skin: "layui-layer-molv",
      area: ["1400px", "80%"],
      content: "yyfsjzs.jsp",
    });
  });

  //任务管理
  $("body").delegate("#fqqy,#fqqy_fws", "click", function (e) {
    layer.open({
      type: 2,
      title: "生产企业管理",
      skin: "layui-layer-molv",
      area: ["100%", "100%"],
      content: "sponsor.html",
    });
  });

  //游客任务字段配置
  $("body").delegate("#visitorTaskFieldConfig", "click", function (e) {
    openIframeLayer("游客任务字段配置", "visitorConfiguration/index.html");
  });

  // 下游客户协议
  $("body").delegate("#protocol_downstream", "click", function (e) {
    layer.open({
      type: 2,
      title: "下游客户协议",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "src/view/demand/protocol/DownstreamProtocol.html",
    });
  });

  // 上游客户协议--任务企业
  $("body").delegate("#protocol_upstream", "click", function (e) {
    layer.open({
      type: 2,
      title: "上游客户协议",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "src/view/demand/protocol/UpstreamProtocol.html",
    });
  });

  // 上游客户协议--供应商(基地)
  $("body").delegate("#provider_protocol_upstream_base", "click", function (e) {
    layer.open({
      type: 2,
      title: "上游客户协议",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "src/view/provider/protocol/UpstreamProtocolForBase.html",
    });
  });

  // 上游客户协议--供应商(代付)
  $("body").delegate("#provider_protocol_upstream_pay", "click", function (e) {
    layer.open({
      type: 2,
      title: "上游客户协议",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "src/view/provider/protocol/UpstreamProtocolForPay.html",
    });
  });

  // 从业者协议--供应商
  $("body").delegate("#provider_worker", "click", function (e) {
    layer.open({
      type: 2,
      title: "从业者协议",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "src/view/provider/protocol/worker.html",
    });
  });

  // 合同管理
  $("body").delegate("#JLFProtocol", "click", function (e) {
    layer.open({
      type: 2,
      title: "精灵蜂协议",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "src/view/manage/protocol/JLFProtocol.html",
    });
  });

  // 结算批次下载弹窗
  $("body").delegate("#settlement", "click", function (e) {
    layer.open({
      title: ["证据链下载", "background-color:white; color:black"],
      type: 2,
      skin: "layui-layer-molv",
      area: ["100%", "100%"],
      content: "evidenceChainDown/WorkOrderList.html",
    });
  });

  // 支付批次下载弹窗
  $("body").delegate("#down_pay", "click", function (e) {
    layer.open({
      type: 2,
      title: "按支付批次下载",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "evidenceChainDown/list.html",
    });
  });

  // 结算批次下载弹窗
  $("body").delegate("#settlement", "click", function (e) {
    layer.open({
      title: ["证据链下载", "background-color:white; color:black"],
      type: 2,
      skin: "layui-layer-molv",
      area: ["100%", "100%"],
      content: "evidenceChainDown/WorkOrderList.html",
    });
  });

  // 支付批次下载弹窗
  $("body").delegate("#down_pay", "click", function (e) {
    layer.open({
      type: 2,
      title: "按支付批次下载",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "evidenceChainDown/list.html",
    });
  });

  // 支付批次下载弹窗
  $("body").delegate("#evidence_chain", "click", function (e) {
    // console.log("!!!!!!!!!!!!!!!!!!!!!!!");
    // layer.open({
    // 	type: 2,
    // 	title: '按支付批次下载',
    // 	skin: 'layui-layer-molv',
    // 	area: ['1300px', '80%'],
    // 	content: 'evidenceChainDown/list.html'
    // })
  });

  //我的消息
  $("body").delegate("#myMsg,#myMsg2", "click", function (e) {
    showMsg();
  });

  //点击个人认证
  $("body").delegate("#xqf_rz,#fqf_rz,#rz", "click", function (e) {
    goSfrz();
  });

  //点击企业认证
  $("body").delegate("#xqf_qyrz,#fqf_qyrz", "click", function (e) {
    goQyrz();
  });

  $(".forgetPwd").click(function () {
    $("#forgetBox [name='phone']").val("");
    $("#forgetBox [name='captcha']").val("");
    $("#forgetBox [name='pwd']").val("");
    layer.open({
      type: 1,
      title: "忘记密码",
      skin: "layui-layer-lan",
      area: ["420px"],
      content: $("#forgetBox"),
    });
  });

  //用户注销
  $("body").delegate(".zx", "click", function () {
    layer.confirm(
      "注销后您的信息会被清除，您确定需要这样操作？",
      { icon: 0, title: "提示" },
      function (index) {
        $.post("user/userZx", function (res) {
          if (res.code === 0) {
            layer.msg("注销成功！", { icon: 6 });
            setTimeout(function () {
              location.href = "logout";
            }, 1500);
          } else {
            layer.msg(res.message, { icon: 2 });
          }
        });
      }
    );
  });

  //服务报价
  $("body").delegate("#fwbj", "click", function (e) {
    layer.open({
      type: 2,
      title: $("#fwbj").text(),
      skin: "layui-layer-blank",
      area: ["1300px", "80%"],
      content: "fwbj_list.jsp",
    });
  });

  //收款账户
  $("body").delegate("#skzh", "click", function (e) {
    layer.open({
      type: 2,
      title: "收款账户",
      skin: "layui-layer-blank",
      area: ["580px", "370px"],
      content: "skzh.html",
    });
  });

  //体验账号管理
  $("body").delegate("#testUser", "click", function (e) {
    layer.open({
      type: 2,
      title: "体验账号管理",
      skin: "layui-layer-blank",
      area: ["1300px", "80%"],
      content: "testUser.html",
    });
  });

  // 数据报表

  // 数据展示
  $("body").delegate("#dataShow", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: true, //开启最大化最小化按钮
      title:
        '<img src="images/logo_no_text.png" style="height: 28px;margin-right: 10px; vertical-align: middle;"/>精灵蜂数字交易平台',
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "data_report/data_show.jsp",
    });
  });

  $("body").delegate("#corpActivity", "click", function () {
    layer.open({
      type: 2,
      title: "企业活跃度",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "data_report/user/corp_activity.jsp",
    });
  });

  $("body").delegate("#jlf_fee", "click", function () {
    layer.open({
      type: 2,
      title: "精灵蜂服务费",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "pay/task_pay.jsp",
    });
  });

  //服务企业 二级菜单  上游客户档案
  $("body").delegate("#bidding1", "click", function (e) {
    layer.open({
      type: 2,
      title: "上游客户档案",
      skin: "layui-layer-white",
      area: ["1400px", "600px"],
      content: "/bidding.jsp",
    });
  });

  // ======================================财务管理================================================

  $("#account").click(function () {
    layer.open({
      type: 2,
      title: "企业结算管理",
      area: ["1300px", "90%"],
      content: "financial/account/account_list.jsp",
    });
  });

  $("#qyjsgl").click(function () {
    layer.open({
      type: 2,
      title: "服务方费用管理",
      area: ["1300px", "90%"],
      content: "financial/service_side.jsp",
    });
  });

  $("#qyfpgl").click(function () {
    layer.open({
      type: 2,
      title: "发票管理",
      area: ["1300px", "90%"],
      content: "financial/invoice/invoice.jsp",
    });
  });

  $("body").delegate("#jlf_invoice", "click", function () {
    layer.open({
      type: 2,
      title: "精灵蜂发票",
      skin: "layui-layer-molv",
      area: ["1300px", "80%"],
      content: "xqf_invoice/index.jsp",
    });
  });
  $("body").delegate("#projectMarket", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "企业任务市场",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/projectMarket/index.jsp",
    });
  });

  $("body").delegate("#forwardFp", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "任务分配",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/forward_fp/index.jsp",
    });
  });

  $("body").delegate("#ys_index", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "直发任务验收",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/ys/index.jsp",
    });
  });

  $("body").delegate("#forward_index", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "任务验收",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/forward_check/index.jsp",
    });
  });

  $("body").delegate("#recheck_index", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "直发任务复审",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/recheck/index.jsp",
    });
  });
  $("body").delegate("#created", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "直发任务创建",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/created/index.jsp",
    });
  });

  $("body").delegate("#fp_index", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "直发任务分配",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/fp/index.jsp",
    });
  });

  $("body").delegate("#registerAndForward", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "任务确认与分包转发",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/registration/index.jsp",
    });
  });

  $("body").delegate("#taskConfirm", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "任务确认",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "project/registration/index.jsp",
    });
  });

  $("body").delegate("#myToDo", "click", function () {
    layer.open({
      type: 2,
      shadeClose: true,
      shade: true,
      maxmin: false, //开启最大化最小化按钮
      title: "我的待办",
      skin: "layui-layer-blank",
      area: ["100%", "100%"],
      content: "dashboard/index.html",
    });
  });
});

// 展示验证码输入框
function showCaptcha() {
  let phone = $("#implementationBox [name=phone]").val();
  let reg = /^1\d{10}$/;
  if (reg.test(phone)) {
    $.get("user/showCaptcha", { mobile: phone }, function (d) {
      if (d.code == 0 && d.data) {
        $(".mode-captcha").css("display", "block");
      } else {
        $(".mode-captcha").css("display", "none");
        $('[name="loginCaptcha"]').val("");
      }
    });
  } else {
    $(".mode-captcha").css("display", "none");
    $('[name="loginCaptcha"]').val("");
  }
}

/*刷新验证码*/
function flushCode(t) {
  $(t).attr("src", "cage?" + Math.random());
}

//清空个人信息框
function clearMyInfo() {
  form.val("editForm", {
    recId: "",
    headImg: "",
    mobile: "",
    realName: "",
    sex: "男",
    area: "",
    birthday: "",
    email: "",
    address: "",
    memo: "",
    bank: "",
    bankAccount: "",
  });
}

function myNumber(value) {
  value = Number(value);
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  return 0;
}

function goQyrz() {
  layer.open({
    type: 2,
    title: false,
    resize: false,
    skin: "layui-layer-molv",
    area: ["1000px", "80%"],
    content: "qyrz.jsp",
  });
}

function goSfrz() {
  layerObj = layer.open({
    id: "awen",
    type: 2,
    title: false,
    resize: false,
    area: ["1000px", "80%"],
    skin: "layui-layer-molv",
    content: "yhrz.jsp",
  });
}

function gaba() {
  window.open(
    "http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010602007200"
  );
}

function implementationClick() {
  $("#implementation").click();
}

function aboutClick(d) {
  //$("[name=page]").attr("src","about.jsp");
  $("[name=page]").attr("src", "aboutUs/aboutUs.jsp?typeView=" + d);
}
function introductionClick() {
  //$("[name=page]").attr("src","introduction.jsp");
  $("[name=page]").attr("src", "aboutUs/aboutUs.jsp?typeView=cpjj");
}

function rememberPwd() {
  layer.msg("登录成功", { icon: 1 });
  if ($("#implementationBox [name=isRemember]").prop("checked")) {
    //记住手机和密码
    layui.data("isRemember", {
      key: "phone",
      value: $("#implementationBox [name=phone]").val(),
    });
    layui.data("isRemember", {
      key: "pwdPlaintext",
      value: $("#implementationBox [name=pwdPlaintext]").val(),
    });
    layui.data("isRemember", {
      key: "pwd",
      value: $("#implementationBox [name=pwd]").val(),
    });
  } else {
    //不记住手机和密码
    layui.data("isRemember", null);
  }
}

$("body").delegate("#coopgl", "click", function () {
  layer.open({
    type: 2,
    title: false,
    skin: "layui-layer-blank",
    content: "sgManage.jsp",
    area: ["1300px", "80%"],
  });
});

$("body").delegate("#fzs-sylxsj", "click", function () {
  layer.open({
    type: 2,
    title: false,
    // content: 'mobile/ssfw.jsp?projectType=商业流向数据&tabName=sylxsj',
    content: "src/view/worker/TaskHistoryForBusinessFlow.html",
    area: ["420px", "94%"],
  });
});

$("body").delegate("#fzs-jplxsj", "click", function () {
  layer.open({
    type: 2,
    title: false,
    // content: 'mobile/ssfw.jsp?projectType=竞品流向数据&tabName=jplxsj',
    content: "src/view/worker/TaskHistoryForCompetingFlow.html",
    area: ["420px", "94%"],
  });
});

// ==================================监管方===========================================

$("body").delegate("#xqfClientManager", "click", function () {
  layer.open({
    type: 2,
    title: "上游客户信息",
    skin: "layui-layer-molv",
    area: ["1500px", "80%"],
    content: "jgf/client_manager/index.jsp",
  });
});

$("body").delegate("#userClientManager", "click", function () {
  layer.open({
    type: 2,
    title: "从业者信息",
    skin: "layui-layer-molv",
    area: ["90%", "80%"],
    content: "jgf/client_manager/client_user.jsp",
  });
});

$("body").delegate("#corpContracts", "click", function () {
  layer.open({
    type: 2,
    title: "上游客户协议",
    skin: "layui-layer-molv",
    area: ["1300px", "80%"],
    content: "jgf/contracts_manager/corp_contracts.jsp",
  });
});
/*$('body').delegate('#userContracts', 'click', function() {
    layer.open({
        type: 2,
        title: '共享经济合作协议',
        skin: 'layui-layer-molv',
        area: ['1300px', '80%'],
        content: 'jgf/contracts_manager/user_contracts.jsp'
    })
})*/
$("body").delegate("#userContracts", "click", function () {
  layer.open({
    type: 2,
    title: "从业者协议",
    skin: "layui-layer-molv",
    area: ["1300px", "80%"],
    content: "jgf/contracts_manager/user_contracts.jsp",
  });
});
$("body").delegate("#sykhrw", "click", function () {
  layer.open({
    type: 2,
    title: "上游客户任务",
    skin: "layui-layer-molv",
    area: ["94%", "80%"],
    content: "jgf/Regulatory/demand.jsp",
  });
});
$("body").delegate("#cyzcl", "click", function () {
  layer.open({
    type: 2,
    title: "从业者承揽",
    skin: "layui-layer-molv",
    area: ["94%", "80%"],
    content: "jgf/Regulatory/practitioners.jsp",
  });
});
$("body").delegate("#cyzwc", "click", function () {
  layer.open({
    type: 2,
    title: "从业者完成",
    skin: "layui-layer-molv",
    area: ["94%", "76%"],
    content: "jgf/Regulatory/missionAccomplished.jsp",
  });
});
$("body").delegate("#khjs", "click", function () {
  layer.open({
    type: 2,
    title: "客户结算",
    skin: "layui-layer-molv",
    area: ["1300px", "80%"],
    content: "jgf/Regulatory/statements.jsp",
  });
});
$("body").delegate("#cyzjs", "click", function () {
  layer.open({
    type: 2,
    title: "从业者结算",
    skin: "layui-layer-molv",
    area: ["94%", "80%"],
    content: "jgf/Regulatory/employeeSettlement.jsp",
  });
});
$("body").delegate("#ptzz", "click", function () {
  layer.open({
    type: 2,
    title: "平台资质",
    skin: "layui-layer-molv",
    area: ["1040px", "820px"],
    content: "jgf/Regulatory/licenseQuery.jsp",
  });
});

// ================================== 运营方 -  我的企业 start ===========================================
// ================================== 运营方 -  start  ===========================================
//企业管理
/*$("body").delegate("#enterpriseManagement", 'click', function (e) {
	layer.open({
		type: 2,
		title: '企业管理',
		skin: 'layui-layer-white',
		area: ['90%', '82%'],
		content: 'sponsor.html'
	})
})*/

//组织架构
$("body").delegate("#organizationalStructure", "click", function (e) {
  layer.open({
    type: 2,
    // title: '组织架构',
    title: " ",
    skin: "layui-layer-white",
    area: ["90%", "800px"],
    content: "general/department/main.jsp",
  });
});
// ================================== 运营方 -  我的企业 end  ===========================================

// 服务报价管理
$("body").delegate("#servicePriceManagement", "click", function (e) {
  layer.open({
    type: 2,
    // title: '组织架构',
    title: " ",
    skin: "layui-layer-white",
    area: ["90%", "800px"],
    content: "yyf/userManagement/quotation/main.html",
  });
});

// ================================== 运营方 -  end  ===========================================
// ================================== 操作日志 ===========================================
/**
 * 操作日志 -> 自动报名与确认签章日志
 * */
$("body").delegate("#zdbmyzdqsrz", "click", function () {
  layer.open({
    type: 2,
    shadeClose: true,
    shade: true,
    maxmin: false, //开启最大化最小化按钮
    title: "自动报名日志",
    skin: "layui-layer-blank",
    area: ["100%", "100%"],
    content: "yyf/operationLog/index.html",
  });
});
/**
 * 操作日志 -> 反馈日志
 * */
$("body").delegate("#feedbacklog", "click", function () {
  layer.open({
    type: 2,
    shadeClose: true,
    shade: true,
    maxmin: false, //开启最大化最小化按钮
    title: "反馈日志",
    skin: "layui-layer-blank",
    area: ["100%", "100%"],
    content: "yyf/operationLog/feedbackLog.html",
  });
});
$("body").delegate("#gdysdcjl", "click", function () {
  layer.open({
    type: 2,
    shadeClose: true,
    shade: true,
    maxmin: false, //开启最大化最小化按钮
    title: "工单导出记录",
    skin: "layui-layer-blank",
    area: ["100%", "100%"],
    content: "yyf/orderExport/index.html",
  });
});
// ================================== 用户管理 ===========================================
/**
 * 用户企业管理
 * */
$("body").delegate("#userEnterpriseManagement", "click", function () {
  layer.open({
    type: 2,
    // title: '用户企业管理',
    title: " ",
    skin: "layui-layer-white",
    area: ["90%", "82%"],
    content:
      'yyf/userManagement/userEnterpriseManagement/user_main.jsp?isTest=""',
  });
});

/**
 * 用户企业管理 -- 测试
 * */
$("body").delegate("#testUserEnterpriseManagement", "click", function () {
  layer.open({
    type: 2,
    // title: '用户企业管理',
    title: " ",
    skin: "layui-layer-white",
    area: ["90%", "82%"],
    content:
      "yyf/userManagement/userEnterpriseManagement/user_main.jsp?isTest=test",
  });
});

/**
 * 监管方账号
 * */
$("body").delegate("#regulatorsAccount", "click", function () {
  layer.open({
    type: 2,
    title: "监管方账号",
    skin: "layui-layer-molv",
    area: ["1100px", "80%"],
    content: "yyf/regulatory.jsp",
  });
});

/**
 * 从业者管理
 * */
$("body").delegate("#practitionersManagement", "click", function () {
  /*layer.open({
		type: 2,
		title: '从业者管理',
		skin: 'layui-layer-molv',
		area: ['1000px', '80%'],
		content: ''
	})*/
  console.log("暂无从业者管理");
});

/**
 * 中标管理
 * */
$("body").delegate("#bidding", "click", function () {
  layer.open({
    type: 2,
    title: "中标管理",
    skin: "layui-layer-molv",
    area: ["90%", "82%"],
    content: "bidding.jsp",
  });
});

// ==================================渠道方===========================================

//全屏
function fullScreen() {
  var el = document.documentElement;
  var rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (typeof rfs != "undefined" && rfs) {
    rfs.call(el);
  }
  return;
}

//退出全屏
function exitScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  if (typeof cfs != "undefined" && cfs) {
    cfs.call(el);
  }
}

function reloadMain() {
  document
    .getElementById("main")
    .getElementsByTagName("iframe")[0]
    .contentWindow.location.reload(true);
}

//调用main页面中的search方法
function search() {
  document
    .getElementById("main")
    .getElementsByTagName("iframe")[0]
    .contentWindow.search();
}

//全屏或取消全屏
function checkFullScreen(t) {
  if ($(t).find("i").hasClass("fa-arrows-alt")) {
    fullScreen();
    $(t).html("<i class='fa fa-compress fa-fw'></i>");
  } else {
    exitScreen();
    $(t).html("<i class='fa fa-arrows-alt fa-fw'></i>");
  }
}

function showMsg() {
  searchMsg("0");
  layer.open({
    id: "awen",
    type: 1,
    title: "我的消息",
    skin: "layui-layer-molv",
    area: ["1000px", "80%"],
    content: $("#myMsgBox"),
  });
}

function xy(xyName, xyContent) {
  layer.open({
    type: 1,
    id: "awen2",
    title: xyName,
    skin: "layui-layer-rim",
    area: ["520px", "80%"],
    content: "<div style='padding:10px'>" + decodeURI(xyContent) + "</div>",
  });
}

// 打开弹窗
function openWindow(type, title, skin, width, height, resize, url) {
  if (url.indexOf("undefined") != -1) {
    return false;
  }
  layer.open({
    type: type,
    title: title,
    skin: skin,
    area: [width, height],
    resize: resize,
    content: url,
  });
}

function openWindowByLink(msg_type, msg_relevantId, tabelName, isMobile) {
  //tck  通知
  let url;
  switch (msg_type) {
    case "服务报价":
      return openWindow(
        2,
        false,
        null,
        "1300px",
        "80%",
        null,
        "cooperation.jsp"
      );
    case "报价信息":
      return openWindow(
        2,
        $("#fwbj").text(),
        "layui-layer-blank",
        "800px",
        "360px",
        null,
        "fwbj.jsp"
      );
    case "身份认证":
      return openWindow(
        2,
        false,
        "1000px",
        "80%",
        "layui-layer-molv",
        false,
        "yhrz.jsp?recId=" + msg_relevantId
      );
    case "企业认证":
      return openWindow(
        2,
        "企业认证",
        "layui-layer-white",
        "1000px",
        "85%",
        false,
        "query/queryEnterpriseCertification.jsp?corpId=" + msg_relevantId
      );
    case "企业用户管理":
      return openWindow(
        2,
        "企业用户管理",
        "layui-layer-molv",
        "100%",
        "100%",
        null,
        "qyyhgl.jsp"
      );
    case "加入企业":
      return openWindow(
        2,
        "加入企业",
        "layui-layer-molv",
        "600px",
        "340px",
        null,
        "joinCorporation.html"
      );
    case "用户详情":
      return openWindow(
        2,
        "用户详情",
        "layui-layer-molv",
        "840px",
        "80%",
        null,
        "myInfo.jsp"
      );
    case "任务详情":
      if (isMobile) {
        return openWindow(
          2,
          "任务详情",
          "layui-layer-molv",
          "100%",
          "100%",
          false,
          "../../view/ProjectDetail.html?from=1&projectId=" + msg_relevantId
        );
      } else {
        url =
          (checkPersonal(msg_relevantId)
            ? "projectDetail.jsp?projectId="
            : "projectDetail_fqf.jsp?projectId=") + msg_relevantId;
        return openWindow(
          2,
          false,
          "layui-layer-molv",
          "800px",
          "96%",
          false,
          url
        );
      }
    case "任务分配":
      if (isMobile) {
        return openWindow(
          2,
          false,
          "layui-layer-molv",
          "100%",
          "96%",
          null,
          "../../view/TaskHistoryForPractitioner.htm"
        );
      } else {
        url = checkPersonal(msg_relevantId)
          ? "project/forward_fp/index.jsp"
          : "project/fp/index.jsp";
        return openWindow(
          2,
          false,
          "layui-layer-molv",
          "100%",
          "96%",
          null,
          url
        );
      }
    case "实施服务":
      return openWindow(
        2,
        false,
        "layui-layer-molv",
        "100%",
        "96%",
        null,
        "../../view/TaskHistoryForPractitioner.html"
      );
    case "工单驳回":
      if (tabelName != undefined && tabelName != "undefined") {
        return openWindow(
          2,
          "工单详情",
          "layui-layer-molv",
          "100%",
          "100%",
          null,
          "../../../gd/" +
            tabelName +
            "_gd.jsp?recIds=" +
            msg_relevantId +
            "&isMobile=true"
        );
      }
    case "项目详情":
      return openWindow();
    case "任务提示":
      return openWindow();
    case "服务报价审核":
      return openWindow();
    case "分配记录":
      // url = checkPersonal(msg_relevantId) ? 'project/forward_fp/index.jsp'  :  'project/fp/index.jsp'
      url = "project/fp/rwfp_dfp.jsp";
      return openWindow(
        2,
        false,
        "layui-layer-molv",
        "100%",
        "96%",
        null,
        url + "?projectId=" + msg_relevantId
      );
    case "运营方支付记录":
      return openWindow(
        2,
        "批次支付详情",
        "layui-layer-molv",
        "100%",
        "96%",
        null,
        "pay/payMergeOperator/payDetail.html?id=" + msg_relevantId
      );
    case "报价到期":
      return openWindow(
        2,
        "报价记录",
        "layui-layer-molv",
        "100%",
        "96%",
        null,
        "yyf/userManagement/quotation/record.html"
      );
    case "底价到期":
      return openWindow(
        2,
        "供应商低价",
        "layui-layer-molv",
        "100%",
        "96%",
        null,
        "yyf/userManagement/quotation/floorPrice.html"
      );
    case "运营方场景管理":
      return openWindow(
        2,
        "场景管理",
        "layui-layer-molv",
        "100%",
        "96%",
        null,
        "taskScene/homepage.html" + msg_relevantId
      );
    case "证据链压缩":
      return openWindow(
        2,
        "证据链压缩",
        "layui-layer-molv",
        "100%",
        "96%",
        null,
        "impl_work_order/list.html?helpType=实施工单&type=znx"
      );
    default:
      return;
  }
}

/**
 * 判断是否是个人任务
 * @param taskId
 */
function checkPersonal(taskId) {
  $.ajaxSetup({ async: false });
  let r = 0;
  $.post("project/checkPersonal", { recId: taskId }, (res) => {
    r = res.data;
  });
  $.ajaxSetup({ async: true });
  return r > 0;
}

/**
 * 判断数据并发送消息
 * */
function informationLackWarning() {
  $.post("msg/informationLackWarning", (res) => {});
}

function zxzxClick() {
  if (empCode == "") {
    $("#implementation").click();
  } else {
    $("[name=page]").attr("src", "aboutUs/aboutUs.jsp?typeView=bzzx");
  }
}

//证件过期提醒
function overdueReminder() {
  $.post("user/overdueReminder", function (d) {
    if (d.personType != "运营方") {
      var i = 0;
      var content = "";
      if (d.yyzz != undefined) {
        i++;
        content += '<p class="msgTitle" >【营业执照过期提醒】</p>';
        content +=
          '<p id="msg-p"  style="text-align:left;text-indent:25px;height:auto;padding-left:10px">' +
          '贵企业营业执照将在<font style="color:red">' +
          d.yyzz +
          '</font>天后到期，为了不影响贵企业发布需求任务，请及时前往<a href="javascript:void(0)"  onclick="goQyrz()">“企业认证”</a>更新认证</p>';
      }
      // if(d.sfz!=undefined){
      // 	i++;
      // 	content += '<p class="msgTitle">【身份证过期提醒】</p>';
      // 	content += '<p id="msg-p" style="text-align:left;text-indent:25px;height:auto;padding-left:10px">'+
      // 		'您的身份证将在<font style="color:red">'+d.sfz+'</font>天后到期，请及时前往<a onclick="goSfrz()">“身份认证”</a>更新认证</p>';
      // }
      if (i != 0 && content != "") {
        i = i == 1 ? i * 1.5 : i;
        layer.close(layerSteward);
        layerSteward = layer.open({
          type: 1,
          title: "证件过期提醒",
          shade: 0,
          resize: false,
          area: ["340px", 112 * i + "px"],
          skin: "steward",
          offset: "lb",
          closeBtn: 1,
          anim: 2,
          content: content,
        });
      }
    }
  });
}

function readNow(msgId) {
  $.post("msg/read", { recId: msgId }, function (res) {
    unreadCount();
    layer.close(layerSteward);
  });
}

function read(msgId) {
  $.post("msg/read", { recId: msgId }, function (res) {
    unreadCount();
    searchMsg(msgState);
  });
}

//系统通知
function showAdvise() {
  $.post("advise/show", { t: "pc" }, function (res) {
    if (res != "") {
      let centent =
        `<div style="max-height:60vh;overflow: auto;">` +
        res.content +
        `</div>`;
      let pageIndex = layer.alert(
        centent,
        {
          closeBtn: 0,
          anim: 6,
          btn: ["知道了"],
          title: "系统公告",
          skin: "layui-layer-red",
          area: "600px",
        },
        function (index) {
          layer.close(pageIndex);
          window.parent.postMessage({ action: "dialog" }, "*");
          checkPayDialog();
        }
      );
    } else {
      window.parent.postMessage({ action: "dialog" }, "*");
      checkPayDialog();
    }
  });
}

/**
 * 检验当前企业的营业执照是否过期,然后检测是否是完整的企业认证数据
 * @param callback
 */
function checkLicense(callback) {
  $.ajax({
    url: "corporation/checkLicense",
    method: "GET",
  }).then(({ code, message }) => {
    if (code !== 0) {
      alertWarn(message, callback);
    } else {
      callback();
    }
  });
}

function searchMsg(msgState = 0) {
  $("#allMsg").html("");
  var key = $("[name=msgKey]").val();
  flow.load({
    elem: "#allMsg", //指定列表容器
    done: function (page, next) {
      //到达临界点（默认滚动触发），触发下一页
      var lis = [];
      //以jQuery的Ajax请求为例，请求下一页数据（注意：page是从2开始返回）
      let clientType = "";
      const hostname = window.location.hostname;
      if (hostname.includes("trt.zxyy.ltd") || hostname.includes("localhost")) {
        clientType = "trt";
      }
      $.post(
        "msg/getList",
        { page: page, msgState: msgState, key: key, clientType: clientType },
        function (res) {
          //假设你的列表返回在data集合中
          console.log("假设你的列表返回在data集合中", res);
          var isread = '<span class="layui-badge-dot"></span>';
          if (msgState == "1") {
            isread = "";
          }
          layui.each(res.data, function (index, item) {
            var html =
              '<div class="layui-row" style="margin-top:10px;cursor:pointer"  onclick="read(' +
              item.recId +
              ')">';
            if (msgState == "1") {
              //已读消息无read方法了，因为已经读过了
              html =
                '<div class="layui-row" style="margin-top:10px;cursor:pointer">';
            }
            html +=
              "<h4>" +
              isread +
              item.msgTitle +
              '<font style="float:right">' +
              item.createDate +
              "</font></h4>" +
              '<p style="text-indent:25px"  class="allMsg-p" data-id="' +
              item.relevantId +
              '" data-type="' +
              item.msgType +
              '" >' +
              item.msgContent +
              "</p>" +
              "</div>";
            lis.push(html);
          });
          next(lis.join(""), page < res.pages);
        },
        "json"
      );
    },
  });
}

function unreadCount() {
  let clientType = "";
  if (hostname.includes("trt.zxyy.ltd") || hostname.includes("localhost")) {
    clientType = "trt";
  }
  $.post("msg/unreadCount", { clientType: clientType }, function (res) {
    if (res != "0") {
      //有未读消息
      $("#myMsgBox  .layui-badge").css("display", "inline-block");
      $("#myMsgBox  .layui-badge").html(res);
      $("#myMsg  .layui-badge").css("display", "inline-block");
      $("#myMsg  .layui-badge").html(res);
    } else {
      $("#myMsgBox  .layui-badge").css("display", "none");
      $("#myMsg  .layui-badge").css("display", "none");
    }
    element.render("nav");
    unreadNo = res;
  });
  //先刷新main.jsp中的未读数量
  setTimeout(function () {
    document
      .getElementById("main")
      .getElementsByTagName("iframe")[0]
      .contentWindow.unreadCount();
  }, 500);
}

function aboutUsOnclick(d) {
  console.log(d, 323232);
  console.log($("[name=page]"), 323232);

  $("[name=page]").attr("src", "aboutUs/aboutUs.jsp?typeView=" + d);
  /*layer.open({
		type: 2,
		title: false,
		skin: 'layui-layer-blank',
		area: ['80%', '95%'],
		content: './aboutUs/aboutUs.jsp?typeView=' + d
	})*/
}

let platformReidProtocolTplId;
let platformReidProtocolFileUrl;
let platformReidProtocolContentText;

function platformReidProtocolCheck() {
  $.get("user/platformReidProtocolCheck", (res) => {
    if (res.code == 200 && res.data) {
      platformReidProtocolContentText = res.data.protocolText;
      // if(res.data.is_auto === 0) {
      // 	platformReidProtocolFileUrl = res.data.sign_url
      // } else {
      // 	platformReidProtocolFileUrl = res.data.original_file_url
      // 	platformReidProtocolTplId = res.data.tpl_id
      // }
      layer.open({
        // id: 'awen',
        type: 1,
        title: false,
        skin: "layui-layer-rim",
        content: $("#platformReidProtocolLayer"),
        area: ["400px", "470px"],
        cancel: function () {},
      });
    }
  });
}

function checkPayDialog() {
  $.get("user/checkPayDialog", (res) => {
    if (res.code == 0 && res.data) {
      if (res.data.dialog) {
        layer.open({
          id: "zhang",
          title: "待支付提醒",
          skin: "layui-layer-molv",
          shadeClose: false,
          area: "430px",
          content:
            '<div style="padding: 10px 10px; font-size: 16px">' +
            res.data.content +
            "</div>",
          btn: "关闭",
          btnAlign: "c", //按钮居中
          shade: 0.5, //不显示遮罩
          yes: function () {
            layer.closeAll();
          },
        });
      }
    }
  });
}

function showPlatformReidProtocol() {
  // layer.open({
  // 	title: '平台入驻协议',
  // 	type: 2,
  // 	area: ['94%','94%'],
  // 	offset: ['3%'],
  // 	content: platformReidProtocolFileUrl
  // })
  layer.open({
    title: "平台入驻协议",
    type: 1,
    area: ["94%", "94%"],
    offset: ["3%"],
    skin: "inner",
    content: platformReidProtocolContentText,
    success: function (layero, index) {
      // 给弹出层的内容添加滚动条
      layero.css({
        "overflow-y": "auto",
      });
    },
  });
}

function platformReidProtocolAutoSign() {
  $.post(
    "user/platformReidProtocolAutoSign",
    { tplId: platformReidProtocolTplId },
    (res) => {
      layer.closeAll();
    }
  );
}

function closeSign() {
  layer.closeAll();
}

function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}
/**
 *json转换为map
 */
function jsonToMap(jsonStr) {
  return this.objToStrMap(JSON.parse(jsonStr));
}
