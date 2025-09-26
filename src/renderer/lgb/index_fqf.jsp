




<!DOCTYPE html>
<html style="height:100%">
<head>
    <title>企业承接任务</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="referrer" content="never">
    <meta charset="UTF-8">
    <link rel="icon" href="images/jp.png" type="image/x-icon">
    <link rel="stylesheet" href="layui/css/layui.css">
    <link href="font-awesome/css/font-awesome.min.css" rel="stylesheet"/>
    <link href="css/animate.min.css" rel="stylesheet"/>
    <link href="css/index.css" rel="stylesheet"/>
    <link href="css/pc_chat.css" rel="stylesheet"/>
    <link rel="stylesheet" href="/lgb/css/QVerify.min.css">
    <script src="layui/layui.js"></script>
    <link rel="stylesheet" href="./js/element/index.css" />
    <!-- 国内使用 -->
    <script type="text/javascript" charset="utf-8" src="//g.alicdn.com/sd/ncpc/nc.js?t=2015052012"></script>

    <script type="text/javascript" src="./js/BonreeSDK_TDEM_JS.v2.4.5/BonreeSDK_JS.min.js" data="%7B%22reqHeaderTraceKey%22%3A%5B%22tracestate%22%2C%22traceparent%22%5D%2C%22uploadAddrHttps%22%3A%22https%3A%2F%2Foneupload.bonree.com%2FRUM%2Fupload%22%2C%22mc%22%3A%5B%7B%22n%22%3A%22sessionreplay%22%2C%22c%22%3A100%2C%22src%22%3A%7B%22sl%22%3A2%2C%22uc%22%3A15%2C%22ua%22%3A%22http%3A%2F%2Foneupload.bonree.com%2FRUM%2FuploadReplay%22%2C%22uas%22%3A%22https%3A%2F%2Foneupload.bonree.com%2FRUM%2FuploadReplay%22%7D%7D%2C%7B%22n%22%3A%22network%22%2C%22cs%22%3A%7B%22fc%22%3A0%7D%7D%5D%2C%22appId%22%3A%2250ae3b7638e1447da22efe514448d28f%22%2C%22uploadAddrHttp%22%3A%22http%3A%2F%2Foneupload.bonree.com%2FRUM%2Fupload%22%2C%22respHeaderTraceKey%22%3A%5B%22traceresponse%22%2C%22x-br-response%22%5D%2C%22brss%22%3Afalse%7D" id="BonreeAgent" ></script>
    <!-- <script src="js/jquery.min.js"></script>

    <script src="js/awen-ajax.js"></script>
    <script src="js/index.js"></script>
    <script src="js/menu.js"></script>
    <script src="js/vue/vue.js"></script>
    <script src="js/element/index.js"></script>
    <script src="js/vue/qs.min.js"></script>
    <script type="text/javascript" src="js/QVerify.min.js"></script>
    <script type="text/JavaScript" src="js/util/crypto-js.min.js"></script> -->
    <style>
        /*管家弹出框皮肤*/
        body .steward {
            top: auto !important;
            left: auto !important;
            bottom: 64px;
            right: 0px;
            -moz-box-shadow: none !important;
            -webkit-box-shadow: none !important;
            box-shadow: none !important;
            text-align: center;
            background-color: transparent;
        }

        body .steward .layui-layer-title {
            background: rgb(136, 206, 196);
            font-size: 16px;
            text-shadow: 0 0 6px #1E9FFF;
            color: #fff;
            padding: 0;
            cursor: default !important;
            border: none;
        }

        body .steward .layui-layer-content {
            background: rgb(245, 249, 250);
            color: rgb(135, 135, 135);
            overflow: hidden;
        }

        .center-dialog{
            display: flex;
            flex-direction: column;
            margin:0 !important;
            position:absolute;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            /*height:600px;*/
            max-height:calc(100% - 30px);
            max-width:calc(100% - 30px);
        }
        .center-dialog .el-dialog__body{
            flex:1;
            overflow: auto;
        }
        .el-message--error{
								z-index: 99999999 !important;
							}
        .el-dialog__wrapper{
								z-index: 99999999 !important;
							}
         .business .el-dialog__header{
                border-bottom: 1px solid #f8f8f8;


         }
         .business{
            display: flex;
            flex-direction: column;
            margin:0 !important;
            position:absolute;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            /*height:600px;*/
            max-height:calc(100% - 30px);
            max-width:calc(100% - 30px);
         }
    </style>
</head>

<body style="height:100%;overflow:hidden;">

<!--个性化设置  lightSpeedIn-->
<div class="individuation animated  bounceOutLeft layui-hide">
    <form class="layui-form" lay-filter="settingFilter" style="height: 100%">
        <div class="setting-title">设置</div>
        <div class="setting-item layui-form">
            <span>消息提醒</span>
            <input type="checkbox" id="xxts" lay-skin="switch" lay-filter="sidenav" lay-text="ON|OFF" checked>
        </div>
        <div class="setting-title setting-title2">菜单</div>

        <div id="menu-jsp" style="height: 100%">
            






<html>
    <body>
        <ul class="layui-nav layui-nav-tree layui-inline trt_more" lay-shrink="all" lay-filter="abc" style="height:100% !important;">
            
            <li class="layui-nav-item" id="fzs-sylxsj"><a href="javascript:;"><i class="fa fa-ambulance
            fa-fw"></i>商业流向数据</a></li>
            <li class="layui-nav-item" id="fzs-jplxsj"><a href="javascript:;"><i class="fa fa-ambulance
            fa-fw"></i>竞品流向数据</a></li>
            
        </ul>
    </body>
    <script>

        layui.use(['element', 'jquery'], function () {
            var element = layui.element;
            element.render('nav');
        })
        var cssFlag = localStorage.getItem("cssFlag");
            if(cssFlag === "trt") {
                document.body.setAttribute("cssFlag", "trt");
            }
    </script>
    <style>
        body[cssflag="trt"] .layui-layer-molv .layui-layer-title {
                background-color: white !important;
                color: black !important;
            }
    </style>
</html>

        </div>
    </form>
</div>

<div class="layui-layout layui-layout-admin">

    <div class="layui-header" style="background:#FFF;display: flex;">
        <div class="ht-nav-item" id="menuLi" style="width:100px;display:none">
            <a href="javascript:;" id="individuation"><i class="fa fa-tasks fa-fw"></i></a>
            <b style="position:absolute;left:40px;top:0px;color:#000;font-weight:bold;cursor: pointer;font-size: 17px;">菜单</b>
        </div>

        
        <div class="navbar">
            <div style="display:flex;">
                <div class="layui-logo"><img src="images/jlf.png"></div>
                <div class="head_title" style="color:#000;font-family: cursive;font-size: 20px;width:120px">企业任务
                </div>
            </div>
            <ul class="layui-nav layui-layout-right" style="position: inherit !important;right:inherit;top:inherit;">
                <li class="layui-nav-item"><a href="main_fqf.jsp" target="page" id="mainBtn">首页</a></li>
                <li class="layui-nav-item"><a href="javascript:void(0)" id="sso" style="display:none">个人任务</a></li>
                
                
                <li class="layui-nav-item"><a href="javascript:void(0)" onclick="aboutUsOnclick('gztx')">规则体系</a></li>
                <li class="layui-nav-item"><a href="javascript:void(0)" onclick="aboutUsOnclick('bzzx')">帮助中心</a></li>
                <li class="layui-nav-item"><a href="javascript:void(0)" onclick="aboutUsOnclick('tzgg')">通知公告</a></li>

                <!-- <li class="layui-nav-item">
                    <a href="javascript:;">关于我们</a>
                    <dl class="layui-nav-child"> -->
                        <!-- <dd><a href="javascript:void(0)" onclick="aboutUsOnclick('qyjj')">企业简介</a></dd> -->
                        <!-- <dd><a href="javascript:void(0)" onclick="aboutUsOnclick('cpjj')">产品简介</a></dd> -->
                        <!-- <dd><a href="javascript:void(0)" onclick="aboutUsOnclick('lxwm')">联系我们</a></dd> -->
                        <!-- <dd><a href="javascript:void(0)" onclick="aboutUsOnclick('gztx')">规则体系</a></dd>
                        <dd><a href="javascript:void(0)" onclick="aboutUsOnclick('bzzx')">帮助中心</a></dd> -->
                        <!-- <dd><a href="javascript:void(0)" style="display: none;" id="tzgg"
                               onclick="aboutUsOnclick('tzgg')">通知公告</a></dd> -->
                        <!-- 
                        <dd><a href="javascript:void(0)" onclick="aboutUsOnclick('tzgg')">通知公告</a></dd>
                         -->
                    <!-- </dl>
                </li> -->
                <li class="layui-nav-item" id="u"><a href="javascript:void(0)" id="implementation">用户登录</a></li>
                
            </ul>
        </div>
    </div>

    <div class="layui-body" style="overflow: hidden;bottom:0px" id="main">
        <iframe src="main_fqf.jsp" width="100%" height="100%" frameborder="0" allowtransparency="true"
                name="page"></iframe>
    </div>

</div>


<!-- 忘记密码 -->
<div id="forgetBox" style="display:none;padding:8px;text-align:center;">
    <form class="layui-form layui-form-pane" id="forgetForm" lay-filter="forgetForm">

        <input type="password" style="display:none">
        <div class="layui-form-item">
            <label class="layui-form-label" style="width:130px"><b>* </b>手机号码</label>
            <div class="layui-input-block" style="margin-left:130px">
                <input type="text" name="phone" class="layui-input" lay-verify="required|account" autocomplete="off"
                       readonly onfocus="this.removeAttribute('readonly');">
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:130px"><b>* </b>手机验证码</label>
            <div class="layui-input-block" style="margin-left:130px">
                <input type="text" name="captcha" autocomplete="off" class="layui-input" lay-verify="required"
                       style="width:150px;float:left" readonly onfocus="this.removeAttribute('readonly');">
                <button type="button" class="layui-btn layui-btn-normal" id="yzmBtn2" style="width:106px">获取验证码
                </button>
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:130px"><b>* </b>登录密码</label>
            <div class="layui-input-block" style="margin-left:130px">
                <input type="password" name="pwd" class="layui-input" lay-verify="pass"
                       onchange="inputTextLimits(this,value,'2')" placeholder="8~16位字母/数字/标点及特殊字符"
                       autocomplete="off" readonly onfocus="this.removeAttribute('readonly');">
            </div>
        </div>

        <input type="hidden" name="sendTimestamp">
        <button class="layui-btn" style="width:130px;margin:0 auto;margin-top:10px;background:#4476a7" lay-submit>提交
        </button>
    </form>
</div>

<!-- 用户注册 -->
<div id="registBox" style="display:none;padding:8px;text-align:center;">
    <form class="layui-form layui-form-pane" id="registForm" lay-filter="registForm">
        <div class="layui-form-item">
            <label class="layui-form-label" style="width:130px"><b>* </b>注册类型</label>
            <div class="layui-input-block" style="margin-left:130px">
                <select name="registType" lay-filter="registType">
                    <option value="工业企业">需求方</option>
                    <option value="服务企业">服务方</option>
                </select>
            </div>
        </div>

        <input type="password" style="display:none">
        <div class="layui-form-item" id="phoneDiv">
            <label class="layui-form-label" style="width:130px"><b>* </b>手机号码</label>
            <div class="layui-input-block" style="margin-left:130px">
                <input type="text" name="phone" class="layui-input" lay-verify="required|account" autocomplete="off"
                       readonly onfocus="this.removeAttribute('readonly');">
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:130px"><b>* </b>手机验证码</label>
            <div class="layui-input-block" style="margin-left:130px">
                <input type="text" name="captcha" autocomplete="off" class="layui-input" lay-verify="required"
                       style="width:150px;float:left" readonly onfocus="this.removeAttribute('readonly');">
                <button type="button" class="layui-btn layui-btn-normal" id="yzmBtn" style="width:106px">获取验证码
                </button>
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:130px"><b>* </b>登录密码</label>
            <div class="layui-input-block" style="margin-left:130px">
                <input type="password" name="pwd" class="layui-input" lay-verify="pass"
                       onchange="inputTextLimits(this,value,'2')" placeholder="8~16位字母/数字/标点及特殊字符"
                       autocomplete="off" readonly onfocus="this.removeAttribute('readonly');">
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:130px"><b>* </b>确认密码</label>
            <div class="layui-input-block" style="margin-left:130px">
                <input type="password" name="pwd2" class="layui-input" lay-verify="repass"
                       onchange="inputTextLimits(this,value,'2')" placeholder="8~16位字母/数字/标点及特殊字符"
                       autocomplete="off" readonly onfocus="this.removeAttribute('readonly');">
            </div>
        </div>

        <div class="layui-form-item">
            <input type="checkbox" name="isRead" title="" lay-skin="primary">
            <span class="xygl yhzc"></span>
        </div>

        <input type="hidden" name="yhxyId" value="">
        <input type="hidden" name="yhxyName" value="">

        <input type="hidden" name="yszcId" value="">
        <input type="hidden" name="yszcName" value="">

        <input type="hidden" name="sendTimestamp">
        <button class="layui-btn" style="width:130px;margin:0 auto;margin-top:10px;background:#4476a7" lay-submit>提交
        </button>
    </form>
</div>

<!-- 提示 -->
<div id="tipsBox" style="display:none;padding:8px;text-align:center;background: #FFFFFF">
    <div class="layui-row">
        温馨提示：个人任务内容仅对已登录用户进行展示
    </div>
</div>

<!-- 登录框 -->
<div id="implementationBox" style="display:none;padding:8px;text-align:center;background: #FFFFFF">
    <form class="layui-form layui-form-pane" id="implementationForm" lay-filter="implementationForm">
        <input name="type" type="hidden">
        <input name="ignoreCaptcha" type="hidden" value="0">
        <div class="layui-form-item">
            <label class="layui-form-label" style="width:110px"><b>* </b>手机号码</label>
            <div class="layui-input-block" style="margin-left:110px">
                <input type="text" name="phone" class="layui-input" lay-verify="required|phone" readonly
                       onfocus="this.removeAttribute('readonly');">
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:110px"><b>* </b>登录密码</label>
            <div class="layui-input-block" style="margin-left:110px">
                <input type="password" id="pwdPlaintext" name="pwdPlaintext" class="layui-input"
                       onchange="inputTextLimits(this,value,'2')" placeholder="8~16位字母/数字/标点及特殊字符" readonly
                       onfocus="this.removeAttribute('readonly');">
                <input type="hidden" name="pwd">
                <input type="hidden" name="iv">
            </div>
        </div>
        <div class="layui-form-item mode-captcha" style="display: none">
            <label class="layui-form-label" style="width:110px"><b>* </b>验证码</label>
            <div class="layui-input-block" style="margin-left:110px">
                <input type="text" name="loginCaptcha" autocomplete="off" class="layui-input"
                       style="width:120px;float:left" readonly onfocus="this.removeAttribute('readonly');">
                <button type="button" class="layui-btn" id="getCaptchaBtn" style="width:106px">获取验证码</button>
            </div>
        </div>

        <div id="loginMsgInfo"
             style="font-size: 12px;text-align: left;color: red;margin-bottom: 15px;min-height: 10px;display: none;">
        </div>
        <input type="hidden" name="cssessionId">
        <input type="hidden" name="sig">
        <input type="hidden" name="token">
        <input type="hidden" name="scene" value="nc_login">
        <input type="hidden" name="appKey" value="FFFF0N0000000000B194">


        <div class="layui-form-item">
            <div id="your-dom-id" class="nc-container"></div>
        </div>


        
        
        
        
        
        


        <div class="layui-form-item">
           <span><input type="checkbox" name="isRemember" title="" lay-skin="primary">记住手机号和密码
           <a href="javascript:void(0)" style='color:#1E9FFF;text-decoration:underline;cursor:pointer'
              class="forgetPwd">忘记密码</a></span>
        </div>
        <div id="QVerify"
             style="visibility: hidden;width:420px;height:600px;margin-top: -150px;position:absolute !important;"></div>
        <button class="layui-btn" id="loginSubmit" style="width:130px;margin:0 auto;" lay-submit>提交
        </button>
        <button class="layui-btn layui-btn-primary" style="display:none;" id="reset">重置验证</button>
    </form>
</div>


<!-- 我的消息框 -->
<div id="myMsgBox" style="display:none;padding:5px;">
    <div class="layui-row" style="line-height:40px">
        <div class="layui-col-xs6" style="text-align:left">
            <button type="button" class="layui-btn layui-btn-sm layui-btn-warm" id="unread"><span
                class="layui-badge">8</span>未读消息
            </button>
            <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" id="readed">已读消息</button>

            <button type="button" class="layui-btn layui-btn-sm layui-btn-primary" id="readAll">全部已读</button>
        </div>
    </div>

    <div class="layui-row" style="margin-top:10px;">
        <div class="layui-col-xs12" style="text-align:left">
            <input name="msgKey" class="layui-input" placeholder="请输入关键字" style="width:60%;float:left">
            <button type="button" style="margin-left:20px" class="layui-btn " id="searchMsgBtn"><i class="layui-icon">&#xe615;</i>搜索
            </button>
        </div>
    </div>

    <div id="allMsg">
    </div>

</div>

<!-- 文件下载   -->
<form name="downForm" id="downForm" method="post" style="display:none">
    <iframe name="downFrame" style="display:none"></iframe>
</form>


<!-- 重置密码Box -->
<div style="display:none;padding:5px;text-align: center" id="czmmBox">
    <form class='layui-form layui-form-pane' id="czmmForm">

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:120px"><b style="color:red">* </b>原密码</label>
            <div class="layui-input-block" style="margin-left:120px">
                <input type="password" name="oldPwd" class="layui-input" autocomplete="off" placeholder="请输入"
                       lay-verify="required"
                       readonly onfocus="this.removeAttribute('readonly');"
                       onblur="this.setAttribute('readonly','readonly');">
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:120px"><b style="color:red">* </b>新密码</label>
            <div class="layui-input-block" style="margin-left:120px">
                <input type="password" name="pwd" class="layui-input" lay-verify="pass"
                       onchange="inputTextLimits(this,value,'2')" placeholder="8~16位字母/数字/标点及特殊字符"
                       autocomplete="off"
                       readonly onfocus="this.removeAttribute('readonly');"
                       onblur="this.setAttribute('readonly','readonly');">
            </div>
        </div>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:120px"><b style="color:red">* </b>确认新密码</label>
            <div class="layui-input-block" style="margin-left:120px">
                <input type="password" name="pwd2" class="layui-input" lay-verify="repass2"
                       onchange="inputTextLimits(this,value,'2')" placeholder="8~16位字母/数字/标点及特殊字符"
                       autocomplete="off"
                       readonly onfocus="this.removeAttribute('readonly');"
                       onblur="this.setAttribute('readonly','readonly');">
            </div>
        </div>

        <button type="button" class="layui-btn repasswd">提交</button>
    </form>
</div>

<img id="imgBox" alt="" src="" style="display:none">

<!-- 聊天窗口 -->
<div style="display:none" id="kfBox">
    <div id="chatSearchDiv"><i class="layui-icon layui-icon-search"></i><input class='layui-input' name='key'
                                                                               placeholder='搜索' autocomplete="off">
    </div>
    <ul class="layui-unselect layim-chat-list" style="/* height: 520px; */height:482px; display: block;">
    </ul>
    <div style="margin-left:300px;width:600px" id="rightBox">
        <div id="kfDiv">
            <div class="layim-chat-title" style="position: absolute;top:-80px;height:80px;">
                <div class="layim-chat-other"><img src="">
                    <span class="layim-chat-username"> </span>
                    <p class="layim-chat-status"></p>
                </div>
            </div>
            <div id="chat_main" style="padding-top:20px"></div>
        </div>
        <textarea id="sendContent" style="display: none;"></textarea>
        <div style="height:46px">
            <button type="button" class="layui-btn layui-btn-sm"
                    style="margin-right:10px;margin-top:8px;float:right;padding:0 20px;background:#5FB878"
                    onclick="sendChat()">发送
            </button>

            <button type="button" class="layui-btn layui-btn-warm layui-btn-sm"
                    style="margin-right:10px;margin-top:8px;float:right;display:none" id="xzBtn">选择沟通用语
            </button>
        </div>
    </div>
</div>


<!--沟通用语选择框-->
<div style="display:none;padding:5px;text-align:center;" id="chooseBox">
    <form class="layui-form" lay-filter="chooseForm">
        <div class="layui-input-block" style="margin:0 auto;width:200px;float:left;margin-top:4px">
            <select name="classify" lay-filter="classifySel">
            </select>
        </div>
        <button class="layui-btn" type="button" id="add" style="float:left;margin:4px 0px 0px 20px"><i
            class="layui-icon layui-icon-add-circle"></i>新增
        </button>
        <table class="layui-table" id="proTable" lay-filter="proTable"></table>
    </form>
</div>

<!-- 沟通用语编辑框 -->
<div style="display:none;padding:5px;text-align:center;" id="saveBox">
    <form class="layui-form" lay-filter="saveForm" id="saveForm">
        <input type="hidden" name="id">
        <div class="layui-form-item">
            <label class="layui-form-label"><b>* </b>分类名称</label>
            <div class="layui-input-block">
                <input name="classify" class="layui-input" lay-verify="required" style="width:280px">
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label"><b>* </b>沟通语句</label>
            <div class="layui-input-block">
                <input name="sentence" class="layui-input" lay-verify="required" style="width:280px">
            </div>
        </div>
        <button type="button" lay-submit lay-filter="saveOk" class="layui-btn"><i class="layui-icon layui-icon-ok"></i>保存
        </button>
    </form>
</div>


<div id="xy_zc_box" style="display:none;padding:15px;text-align:center;">
    <form id="xyzcForm">
        <input type="hidden" name="empId" value="">
        <input type="hidden" name="empType" value="">
        <input type="hidden" name="newYhxyId" value="">
        <input type="hidden" name="newYhxyName" value="">
        <input type="hidden" name="newYszcId" value="">
        <input type="hidden" name="newYszcName" value="">
    </form>
    <img src="images/jp_index.png" style="height:50px">
    <p style="font-weight:600;text-align:left;line-height:30px;margin-top:10px">用户协议与隐私政策</p>
    <p style="text-indent:20px;text-align:left;line-height:28px">我们非常重视您的隐私保护和个人信息保护,您在使用精灵蜂产品前,
        请务必认真阅读《用户协议》和《隐私政策》的全部条款。您同意并接受全部条款后,精灵蜂产品才能正常为您提供相关服务。</p>
    <p style="text-indent:20px;text-align:left;line-height:28px">精灵蜂高度重视用户个人信息保护工作,隐私政策内容包括用户个人
        信息(姓名、身份证、手机号)的收集、使用设备权限调用等内容,请您仔细阅读。</p><br>
    <p style="text-align:left">协议内容如下:</p>
    <p style="text-align:left;line-height:32px"><span class="xyzc"></span></p>

    <div style="margin-top:30px">
        <button type="button" class="layui-btn" style="width:160px;background:#DCDCDC;color:#AEB2C1" id="xyzc_no">暂不使用
        </button>
        <button type="button" class="layui-btn" style="width:160px;background:#FFE100" id="xyzc_yes">同意</button>
    </div>
</div>

<div id="platformReidProtocolLayer" style="display:none;padding:15px;text-align:center;">
    <img src="images/jlf.png" style="height:50px">
    <p style="font-weight:600;text-align:left;line-height:30px;margin-top:10px">平台入驻协议变更通知</p>
    <p style="text-indent:20px;text-align:left;line-height:28px">我们非常重视您的权益,您在使用精灵蜂产品前,
        请务必认真阅读《平台入驻协议》的全部条款；重点阅读加粗、带有下划线的内容。</p>
    <p style="text-indent:20px;text-align:left;line-height:28px">
        您同意签署本协议即意味着您使用精灵蜂平台账户所申请认证的主体自愿接受本协议约束。如果您对本协议的条款有疑问，请通过精灵蜂平台客服渠道进行询问，精灵蜂平台将向您解释条款内容。</p>
    <br>
    <p style="text-align:left;text-indent:20px">请您仔细阅读。</p>
    <p style="text-align:left;text-indent:20px">协议内容如下:</p>
    <p style="text-align:left;line-height:32px;text-indent:20px"><span
        style="cursor: pointer;text-decoration:underline;color:#1090ef"
        onclick="showPlatformReidProtocol()">《平台入驻协议》</span></p>
    <div style="margin-top:30px">
        <button type="button" class="layui-btn xyzc_no" style="width:160px;background:#DCDCDC;color:#AEB2C1">暂不使用
        </button>
        <button type="button" class="layui-btn" style="width:160px;background:#FFE100"
                onclick="platformReidProtocolAutoSign()">同意
        </button>
    </div>
</div>

<div id="vue">
    <div id="timeVisible" style="display: none;">
        <el-dialog
            align-center  width="700px"
            :visible.sync="timeVisible"
            :show-close="false"
            width="30%" style="margin-top: 25vh">
            <span slot="title">
                <i class="el-icon-warning-outline" style="color: #1090ef; font-size: 18px;"></i><span style="font-size: 18px; margin-left: 6px;">{{timeTitle}}</span>
            </span>
            <span>{{timeMessage}}</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="timeVisible = false">稍后处理</el-button>
                <el-button type="primary" @click="goAuthorize">去授权</el-button>
            </span>
        </el-dialog>
    </div>
    <div id="myDialog"
        style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 99999999">
        <!--电子签章服务弹窗-->
        <el-dialog  :show-close="flag"  :visible.sync="dialogVisible" width="30%" :modal-append-to-body="true"
            style="background: rgba(0, 0, 0, 0.3)" custom-class="fullscreen-dialog" :before-close="shutDown">
            <template slot="title">
                <div style="height: 50px; line-height: 50px; font-size: 20px">
                    <i class="el-icon-warning-outline"
                        style="color: #1090ef; margin-right: 10px; font-size: 26px"></i>电子签服务开通提醒
                </div>
            </template>

            <div style="margin-top: 10px">
                您的企业未开通电子签服务。请尽快开通，以确保工作顺利进行。
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="shutDown" v-if="flag">取 消</el-button>
                <el-button @click="openUp" type="primary">去开通</el-button>
            </span>
        </el-dialog>
    </div>
    <div id="youDialog" style="display: none;">
        <el-dialog title="证据链统计报告签署提醒" custom-class="center-dialog"  align-center :visible.sync="tip" width="500px" :before-close="dClose">
            <template slot="title">
                <div style="height: 50px; line-height: 50px; font-size: 20px">
                    <i class="el-icon-warning-outline"
                        style="color: #1090ef; margin-right: 10px; font-size: 26px"></i>证据链统计报告签署提醒
                </div>
            </template>
            <div style="width: 90%; margin: 0 auto">
                您有
                <span style="color: red">{{ count }}</span>
                个未签署的证据链统计报告，请尽快完成签署以避免延误。
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dClose">取 消</el-button>
                <el-button type="primary" @click="goESign">去签署</el-button>
            </span>
        </el-dialog>
    </div>
        <div id="youDialog" style="display: none;">
        <el-dialog title="证据链统计报告签署提醒" custom-class="center-dialog"  align-center :visible.sync="tip" width="500px" :before-close="dClose">
            <template slot="title">
                <div style="height: 50px; line-height: 50px; font-size: 20px">
                    <i class="el-icon-warning-outline"
                        style="color: #1090ef; margin-right: 10px; font-size: 26px"></i>证据链统计报告签署提醒
                </div>
            </template>
            <div style="width: 90%; margin: 0 auto">
                您有
                <span style="color: red">{{ count }}</span>
                个未签署的证据链统计报告，请尽快完成签署以避免延误。
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dClose">取 消</el-button>
                <el-button type="primary" @click="goESign">去签署</el-button>
            </span>
        </el-dialog>
    </div >
    <div id="ywDialog" style="display: none;">
        <el-dialog title="业务模式升级提醒" custom-class="business"  align-center  width="700px" :visible.sync="businessModelUpgradeNoticeVisible" :show-close="false" >
            <template slot="title">
                <div style="font-size: 20px">
                    业务模式升级提醒
                </div>
            </template>
            <div style="width: 98%; margin: 0 auto">
                <el-card  shadow="always" style="background-color: #fbfbed;">
                    <div style="display: flex;align-items: center;">
                        <i class="el-icon-warning" style="color:   #E6A23C; font-size: 18px;margin-right: 5px;"></i>
                        <div v-if="loginStatus">您所在的企业，业务模式已从【工业版】升级为【标准版】，需要重新登录后生效</div>
                        <div v-else>您所在的企业，业务模式已从【工业版】升级为【标准版】</div>
                    </div>
                </el-card>
                <div style="display: flex;justify-content: space-between;width: 90%;margin: 10px auto;">
                    <el-card  shadow="never" style="width: 49%;border: 1px solid #409EFF;  ">
                        <div style="display: flex;justify-content: space-between;">
                            <strong>工业版</strong>
                            <div  style="color:#409EFF ;background: #f0f6fe;width: 80px;height: 20px;border-radius: 10px;text-align: center;">当前版本</div>
                         </div>
                     <div style="margin-left: 7px;margin-top: 5px;">
                        <div style="margin: 10px 0 5px 0;"><span> <i class="el-icon-circle-check" style="color: #409EFF;"></i></span>&nbsp;<span>任务发布（仅邀请）</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-check" style="color: #409EFF;"></i></span>&nbsp;<span>任务分配功能</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-check" style="color: #409EFF;"></i></span>&nbsp;<span>验收及结算功能</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-close" style="color:red;"></i></span>&nbsp;<span>支付及发票功能</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-close" style="color:red;"></i></span>&nbsp;<span>承接任务</span></div>
                     </div>

                    </el-card>
                    <el-card  shadow="never" style="width: 49%;">
                        <div style="display: flex;justify-content: space-between;">
                            <strong>标准版</strong>
                            <div  style="color:black ;background: #ccc;width: 80px;height: 20px;border-radius: 10px;text-align: center;">升级后</div>
                         </div>
                     <div style="margin-left: 7px;margin-top: 5px;">
                        <div style="margin: 10px 0 5px 0;"><span> <i class="el-icon-circle-check" ></i></span>&nbsp;<span>任务发布（邀请、报价、灵工）</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-check" ></i></span>&nbsp;<span>任务分配功能</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-check" ></i></span>&nbsp;<span>验收及结算功能</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-check" ></i></span>&nbsp;<span>支付及发票功能</span></div>
                        <div  style="margin: 5px 0;"><span> <i class="el-icon-circle-check"></i></span>&nbsp;<span>承接任务</span></div>
                     </div>

                    </el-card>
                </div>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dCloses(1)" type="primary">确定</el-button>
            </span>
        </el-dialog>
    </div>

</div>

</body>
<script src="js/jquery.min.js"></script>

<script src="js/awen-ajax.js"></script>
<script src="js/index.js"></script>
<script src="js/menu.js"></script>
<script src="js/vue/vue.js"></script>
<script src="js/element/index.js"></script>
<script src="js/vue/qs.min.js"></script>
<script type="text/javascript" src="js/QVerify.min.js"></script>
<script type="text/JavaScript" src="js/util/crypto-js.min.js"></script>
<script>
    new Vue({
							el: '#vue',
							data() {
								return {
									dialogVisible: false,
									count: 0,
									tip: false,
                                    businessModelUpgradeNoticeVisible:false,
                                    loginStatus:false,
									dialogShow: false,
									message: '您的企业未开通电子签服务。请尽快开通，以确保工作顺利进行。',
									flag:true,
									sign:false,
                                    timeVisible: false,
                                    timeTitle: '',
                                    timeMessage: '',
								}
							},

							methods: {
								shutDown() {
									this.dialogVisible = false
									if(this.sign){
										this.getDownstreamSignStatus()
										this.sign = false
									}
									document.querySelector('#myDialog').style.display = 'none';
								},
								openUp() {
									$.ajax({
										url: `/lgb/user/checkEsignPermission`,
										method: 'GET',
									}).then(res => {

										if(res.code != 3001){
                                            localStorage.setItem('platform', 'sign')
                                            if (JSON.parse(localStorage.getItem('config')).identity == '工业企业') {
												window.open("/vue/#/taskEsignaContract/elecSignService")
											} else {
												window.open('/vue/#/supplierEsignaContract/elecSignService')
											}
										}else{
											this.$message.error(res.message);
										}
									})

								},
								dClose() {
									this.tip = false
									// $.ajax({
									// 	url: `/lgb/user/getUserName`,
									// 	method: 'POST',
									// }).then(res => {
									// 	if (!res.identity.includes('运营')) {
									// 		$.ajax({
									// 			url: `/lgb/user/getEsignActivationRemindersEnterprise`,
									// 			method: 'GET',
									// 		}).then(res => {
									// 			if (res.code == 0) {
									// 				if (res.data == false) {
									// 					this.dialogShow = true
									// 				}
									// 			}
									// 		})
									// 	}
									// })

								},
								goESign() {
									this.tip = false
									document.querySelector('#youDialog').style.display = 'none'; // 显示对话框

								},
                                goAuthorize() {
                                    this.timeVisible = false
                                    $.ajax({
										url: `/lgb/user/reEpAuth`,
										method: 'GET',
									}).then(res => {
										if(res.code == 0){
                                    localStorage.setItem('goAuthorize','goAuthorize')
                                    localStorage.setItem('platform', 'sign')
                                    if(identity_alias == "工业企业"){
                                        window.open(window.location.origin + "/vue/#/exception/defaultPage")
                                    } else if(identity_alias == "服务企业"){
                                        console.log("🚀 ~ goAuthorize ~ 服务企业:", identity_alias)
                                        window.open("/vue/#/supplierEsignaContract/elecSIgnActivated")
                                    }
										}else{
										}
									})
                                },
								go() {
									const list = document.querySelectorAll("#menu-jsp ul li")
									let flag = false
									for (let index = 0; index < list.length; index++) {
										if (list[index].innerText.replace(/\s+/g, '').trim().includes('签约中心')) {
											flag = true
										}
									}
									if (flag) {
										window.open("/vue/#/taskEsignaContract/elecSignService")
										this.dialogShow = false
									} else {
										this.$message.error("您没有权限访问电子签服务的开通页面。请联系管理员。");
										// this.$alert('请联系管理员开通电子签服务', {
										// 	confirmButtonText: '确定',
										// })
									}

								},
								getDownstreamSignStatus(){
									let that = this
									const list = document.querySelectorAll("#menu-jsp ul li")
									let flagggg = false
									for (let index = 0; index < list.length; index++) {
										if (list[index].innerText.replace(/\s+/g, '').trim().includes('证据链数据管理')) {
											flagggg = true
										}
									}
									if(flagggg){
										$.get('user/getDownstreamSignStatus', (res) => {
										if (res.data != 0) {
											that.count = res.data
											document.querySelector('#youDialog').style.display = 'block'; // 显示对话框
											that.tip = true
												}
											})
									}
								},
                                dCloses(type){


                                            $.ajax({url:`/lgb/corp/businessModelUpgradeNoticeConfirm`,method: 'POST',}).then(res => {
                                                this.businessModelUpgradeNoticeVisible = false
                                                document.querySelector('#ywDialog').style.display = 'none'; // 隐藏对话框
                                                if(this.loginStatus){
                                                    top.location.href = "logout";
                                                }
                                                })

                                },

							},
							mounted: function () {
                                    $.ajax({url:`/lgb/corp/businessModelUpgradeNotice`,method: 'POST',}).then(res => {
                                    if(res.data!= 0){
                                if(SON.parse(localStorage.getItem('base')).user.corpId){

                                        document.querySelector('#ywDialog').style.display = 'block'; // 显示对话框
                                        this.businessModelUpgradeNoticeVisible = true
                                    }
                                }

                                        })


                        // console.log('---------进入页面',!localStorage.getItem("Authorization_trt"))
                        // if(!localStorage.getItem("Authorization_trt")){
                        //     console.log('---------退出登录')
                        //     location.href = "logout"
                        //     location.href='trtLogin/index.html'
                        // }
        				let that = this
        				window.addEventListener('message', function (event) {



        					if (event.data.action === 'openFullScreenDialog') {
        						// 显示 Element UI 对话框
        						event.source.postMessage({ action: 'dialogOpened' }, event.origin); // 可选，确认已打开
        						document.querySelector('#myDialog').style.display = 'block'; // 显示对话框
        						that.dialogVisible = true
        					}else if(event.data.action === 'openFullScreenDialogs'){
        						that.flag = false
        						event.source.postMessage({ action: 'dialogOpened' }, event.origin); // 可选，确认已打开
        						document.querySelector('#myDialog').style.display = 'block'; // 显示对话框
        						that.dialogVisible = true
        					}  else if (event.data.action === 'dialog') {
        						$.ajax({
        							url: `/lgb/user/getUserName`,
        							method: 'POST',
        						}).then(res => {
        							if (!res.identity.includes('运营')) {
        								$.ajax({url:`/lgb/user/getEsignActivationRemindersEnterprise`,method: 'GET',}).then(res => {
                                            if (res.data == false) {
                                                that.dialogVisible = true
                                                that.sign = true
                                                document.querySelector('#myDialog').style.display = 'block';
                                            }else{
                                                that.getDownstreamSignStatus()
                                            }
                                        })
        							}
        						})
        					}
        				});
                        const currentUrl = window.location.href
                        let loginCode = currentUrl.split('code=')[1]

                        layui.use(['element', 'layer', 'form', 'jquery', 'carousel', 'laydate', 'upload', 'table', 'flow', 'util', 'treeGrid', 'sliderVerify'], function () {
                            if (loginCode == "0") {
                            // rememberPwd();

                            setTimeout(function () {
                                layer.closeAll();
                                checkLicense(loginInit)
                                //    $("#corp-name").removeClass('corp-name').addClass('login-corp-name')
                                informationLackWarning();
                                platformReidProtocolCheck();
                                $("#menu-jsp").load("menu/menu.jsp");
                                element.render('nav');
                                $.get("user/getEnterpriseAuthInfo", function (res) {
                                    console.log("🚀 ~ res:", res)
                                    var flag = ''
                                    if (res.data.expireFlag == 2) {
                                        flag = '将于'
                                        // 获取id timeVisible
                                        let timeVisible = document.getElementById('timeVisible')
                                        timeVisible.style.display = 'block'
                                        that.timeVisible = true
                                        that.timeTitle = '电子签授权即将到期提醒'
                                        that.timeMessage = '您在e签宝的授权' + flag + res.data.expireTime +  '过期，过期后将无法使用签章功能，为了不影响您的任务进度，请您及时授权'
                                    } else if (res.data.expireFlag == 3) {
                                        flag = '已于'
                                        let timeVisible = document.getElementById('timeVisible')
                                        timeVisible.style.display = 'block'
                                        that.timeVisible = true
                                        that.timeTitle = '电子签授权已到期提醒'
                                        that.timeMessage = '您在e签宝的授权' + flag + res.data.expireTime +  '过期，过期后将无法使用签章功能，为了不影响您的任务进度，请您及时授权'
                                    }
                                    // if (res.data.expireFlag == 2 || res.data.expireFlag == 3) {
                                    //     setTimeout(() => {
                                    //         var srt = "<div class='econtnt'>您在e签宝对医药营销数智化系统应用的授权" + flag + res.data.expireTime + "过期，过期后将无法使用签章功能，为了不影响您的任务进度，请您及时授权</div> "
                                    //         layer.open({
                                    //             type: 1,
                                    //             title: '温馨提示',
                                    //             area: ['490px', '200px'],
                                    //             content: srt
                                    //             , btn: ['忽略', '去授权']
                                    //             , btn1: function (index, layero) {
                                    //                 layer.close(index);
                                    //             }
                                    //             , btn2: function (index, layero) {
                                    //                 window.open("/vue/#/taskEsignaContract/elecSignService")

                                    //             }
                                    //             , cancel: function () {
                                    //                 //右上角关闭回调
                                    //                 //return false 开启该代码可禁止点击该按钮关闭
                                    //             }
                                    //         });
                                    //     }, 200)

                                    // }

                                })
                            }, 1500)
                        } else if (loginCode == "666") {
                                $.get("xymbgl/yhxyYszcSignStatus", function (res) {
                                    if(!res){
                                        let data = JSON.parse(sessionStorage.getItem('data'))
                                        // 签署协议-登录之后首页展示
                                        $("#xyzcForm [name=empId]").val(data.empId);
                                        $("#xyzcForm [name=empType]").val(data.empType);
                                        data = data.data;
                                        var h = "";
                                        for (var i = 0; i < data.length; i++) {
                                            let xyName = data[i].protocolType == 1 ? "用户协议" : "隐私政策";
                                            h += "<a onclick=xy('" + xyName + "','" + encodeURI(data[i].protocolText) + "')>《" + xyName + "》</a>";
                                            if (xyName == "用户协议") {
                                                $("[name=newYhxyId]").val("1");
                                                $("[name=newYhxyName]").val(data[i].xyName);
                                            }
                                            if (xyName == "隐私政策") {
                                                $("[name=newYszcId]").val("1");
                                                $("[name=newYszcName]").val(data[i].xyName);
                                            }
                                        }
                                        $(".xyzc").html(h);
                                        layer.open({
                                            id: 'awen',
                                            type: 1,
                                            title: false,
                                            skin: 'layui-layer-rim',
                                            content: $("#xy_zc_box"),
                                            area: ['400px', '460px'],
                                            cancel: function () {
                                                location.href = "logout"
                                                localStorage.removeItem("Authorization")
                                                // localStorage.removeItem("classFlag")
                                                // location.href='trtLogin/index.html'
                                            }
                                        })
                                    }
                                })

                        }
                        })

        			}
						})
    layui.config({
        base: 'layui/',
    }).extend({
        treeGrid: 'extends/treeGrid',
        sliderVerify: 'sliderVerify/sliderVerify'
    });
    var $;
    var loadIndex;
    var element;
    var treeGrid;
    var form;
    var upload;
    var layIndex;
    var layIndex2;
    var registIndex;
    var table;
    var tabObj;
    var layerSteward;
    var flow;
    var msgState;
    var laydate;

    var tabName;
    var tabText;
    var recIds;

    var unreadNo = 0;

    var imgIndex;
    var xyNames;
    var empIndex;
    var VerificationCodeState = false;
    var aCount = 0;
    var tempHeadImg_src = "";
    var restore_top = "";
    var restore_left = "";
    var min_top = "";
    var min_left = "";
    var restoreFist = true;
    var sponsorId;
    var sponsorName;
    window.addEventListener('click', function (event) {
							if (event.target.innerText == "去签署") {
								layer.open({
									type: 2,
									//   title: '实施工单',
									title: false,
									skin: 'layui-layer-blank',
									area: ['100%', '100%'],
									content: "./xqf/implementationOrder.jsp"
								})
							}
							// document.querySelector("#dialog").style.display = 'none';
						})
    layui.use(['element', 'layer', 'form', 'jquery', 'carousel', 'laydate', 'upload', 'table', 'flow', 'util', 'treeGrid', 'sliderVerify'], function () {
        form = layui.form;
        var carousel = layui.carousel;
        element = layui.element;
        $ = layui.jquery;
        laydate = layui.laydate;
        upload = layui.upload;
        table = layui.table;
        flow = layui.flow;
        treeGrid = layui.treeGrid;
        util = layui.util;

        layui.data('config', {
            key: 'platform'
            , value: '发起方'
        });

        loginState();

        //调用监听消息方法
        
        monitorMsg();
        

        rz_state = "0";
        identity_alias = "";

        //点击注册按钮
        $("#regist").click(function () {
            $("#registBox [name='phone']").val("");
            $("#registBox [name='captcha']").val("");
            $("#registBox [name='pwd']").val("");
            $("#registBox [name='pwd2']").val("");
            $("#registBox [name='corporation']").val("");
            $("#registBox [name='isRead']").attr("checked", false);
            form.render(null, 'registForm');

            $.post("xymbgl/yhxyYszc", function (d) {
                var h = "";
                xyNames = "";
                for (var i = 0; i < d.length; i++) {
                    h += "<a onclick=xy('" + d[i].xyName + "','" + encodeURI(d[i].xyContent) + "')>《" + d[i].xyName + "》</a>";
                    xyNames += "《" + d[i].xyName + "》";
                    if (d[i].xyType == "用户协议") {
                        $("#registBox [name=yhxyId]").val(d[i].id);
                        $("#registBox [name=yhxyName]").val(d[i].xyName);
                    }
                    if (d[i].xyType == "隐私政策") {
                        $("#registBox [name=yszcId]").val(d[i].id);
                        $("#registBox [name=yszcName]").val(d[i].xyName);
                    }
                }
                $(".xygl.yhzc").html("我已阅读并同意遵守" + h);
                registIndex = layer.open({
                    id: 'awen',
                    type: 1,
                    id: 'registLay',
                    title: '用户注册',
                    skin: 'layui-layer-lan',
                    area: ['420px'], //宽高
                    content: $('#registBox')
                })

            })
        })

        //监听登录提交
        form.on('submit(implementationForm)', function (data) {
            let loginMsgInfoDom = $("#loginMsgInfo");
            let layuiLayer1Dom = $("#layui-layer1");

            if (loginMsgInfoDom) {
                loginMsgInfoDom.css('display', 'none')
            }
            if (layuiLayer1Dom) {
                layuiLayer1Dom.css('height', '290px')
            }

            if (VerificationCodeState) {
                let cDisplay = $(".mode-captcha").css("display")
                if (cDisplay == 'none') {
                    // 校验值是否为空
                    $('[name=loginCaptcha]').val('')
                } else {
                    loginCaptcha = $('[name=loginCaptcha]').val()
                    if (strIsEmpty(loginCaptcha)) {
                        layer.msg('请输入验证码', {icon: 5});
                        layer.close(loadIndex);
                        return false
                    }
                }
                loadIndex = layer.load();
                $("#loginSubmit").attr("disabled", true);
                var secretKey = CryptoJS.enc.Utf8.parse('secret5973164820');
                // 使用AES加密
                var iv = CryptoJS.lib.WordArray.random(16)
                var ciphertext = CryptoJS.AES.encrypt($("#pwdPlaintext").val(), secretKey, {iv: iv}).toString();
                $("#implementationBox [name='pwd']").val(ciphertext)
                $("#implementationBox [name='iv']").val(iv.toString())
                var param = {
                    phone: $("#implementationBox [name='phone']").val(),
                    pwd: $("#implementationBox [name='pwd']").val(),
                    iv: $("#implementationBox [name='iv']").val(),
                    loginCaptcha: $("#implementationBox [name='loginCaptcha']").val()
                }
                $.post("user/login", {
                    phone: $("#implementationBox [name='phone']").val(),
                    pwd: $("#implementationBox [name='pwd']").val(),
                    iv: $("#implementationBox [name='iv']").val(),
                    loginCaptcha: $("#implementationBox [name='loginCaptcha']").val(),
                    sig: $('[name="sig"]').val(),
                    token: $('[name="token"]').val(),
                    cssessionId: $('[name="cssessionId"]').val(),
                    appKey: "FFFF0N0000000000B194",
                    scene: "nc_login",
                }, function (data, state, xhr) {
                    setTimeout(function () {
                        $("#loginSubmit").attr("disabled", false);
                    }, 2000)
                    $("[name=ignoreCaptcha]").val("0");
                    layer.close(loadIndex);
                    if (data.token) {
                        let token = {
                            'token': data.token
                        }
                        localStorage.setItem("Authorization", encodeURIComponent(JSON.stringify(token)))
                    }
                    if (data.code == "0") {
                        rememberPwd();

                        setTimeout(function () {
                            layer.closeAll();
                            checkLicense(loginInit)
                            //    $("#corp-name").removeClass('corp-name').addClass('login-corp-name')
                            informationLackWarning();
                            platformReidProtocolCheck();
                            $("#menu-jsp").load("menu/menu.jsp");
                            element.render('nav');
                            $.get("user/getEnterpriseAuthInfo", function (res) {
                                var flag = ''
                                if (res.data.expireFlag == 2) {
                                        flag = '将于'
                                        // 获取id timeVisible
                                        let timeVisible = document.getElementById('timeVisible')
                                        timeVisible.style.display = 'block'
                                        that.timeVisible = true
                                        that.timeTitle = '电子签授权即将到期提醒'
                                        that.timeMessage = '您在e签宝的授权' + flag + res.data.expireTime +  '过期，过期后将无法使用签章功能，为了不影响您的任务进度，请您及时授权'
                                    } else if (res.data.expireFlag == 3) {
                                        flag = '已于'
                                        let timeVisible = document.getElementById('timeVisible')
                                        timeVisible.style.display = 'block'
                                        that.timeVisible = true
                                        that.timeTitle = '电子签授权已到期提醒'
                                        that.timeMessage = '您在e签宝的授权' + flag + res.data.expireTime +  '过期，过期后将无法使用签章功能，为了不影响您的任务进度，请您及时授权'
                                    }
                                // if (res.data?.expireFlag == 2 || res.data?.expireFlag == 3) {
                                //     setTimeout(() => {
                                //         var srt = "<div class='econtnt'>您在e签宝的授权" + flag + res.data.expireTime + "过期，过期后将无法使用签章功能，为了不影响您的任务进度，请您及时授权</div> "
                                //         layer.open({
                                //             type: 1,
                                //             title: '温馨提示',
                                //             area: ['490px', '200px'],
                                //             content: srt
                                //             , btn: ['忽略', '去授权']
                                //             , btn1: function (index, layero) {
                                //                 layer.close(index);
                                //             }
                                //             , btn2: function (index, layero) {
                                //                 window.open("/vue/#/taskEsignaContract/elecSignService")

                                //             }
                                //             , cancel: function () {
                                //                 //右上角关闭回调
                                //                 //return false 开启该代码可禁止点击该按钮关闭
                                //             }
                                //         });
                                //     }, 200)

                                // }

                            })
                        }, 1500)
                    } else if (data.code == "666") {
                        $("#xyzcForm [name=empId]").val(data.empId);
                        $("#xyzcForm [name=empType]").val(data.empType);
                        data = data.data;
                        var h = "";
                        for (var i = 0; i < data.length; i++) {
                            let xyName = data[i].protocolType == 1 ? "用户协议" : "隐私政策";
                            h += "<a onclick=xy('" + xyName + "','" + encodeURI(data[i].protocolText) + "')>《" + xyName + "》</a>";
                            if (xyName == "用户协议") {
                                $("[name=newYhxyId]").val("1");
                                $("[name=newYhxyName]").val(data[i].xyName);
                            }
                            if (xyName == "隐私政策") {
                                $("[name=newYszcId]").val("1");
                                $("[name=newYszcName]").val(data[i].xyName);
                            }
                        }
                        // for (var i = 0; i < data.length; i++) {
                        //     h += "<a onclick=xy('" + data[i].xyName + "','" + encodeURI(data[i].xyContent) + "')>《" + data[i].xyName + "》</a>";
                        //     if (data[i].xyType == "用户协议") {
                        //         $("[name=newYhxyId]").val(data[i].id);
                        //         $("[name=newYhxyName]").val(data[i].xyName);
                        //     }
                        //     if (data[i].xyType == "隐私政策") {
                        //         $("[name=newYszcId]").val(data[i].id);
                        //         $("[name=newYszcName]").val(data[i].xyName);
                        //     }
                        // }
                        $(".xyzc").html(h);
                        layer.open({
                            id: 'awen',
                            type: 1,
                            title: false,
                            skin: 'layui-layer-rim',
                            content: $("#xy_zc_box"),
                            area: ['400px', '460px'],
                            cancel: function () {
                                location.href = "logout"
                            }
                        })
                        // VerificationCodeState = false
                    } else if (data.code == "-3") {
                        let messageStr = data.message.replace(`<a>`, `<a href='javascript:void(0)' style='color:#1E9FFF;' class="onclickForgetPwd">`);
                        loginMsgInfoDom.html(messageStr);

                        if (loginMsgInfoDom) {
                            loginMsgInfoDom.css('display', 'block')
                        }
                        if (layuiLayer1Dom) {
                            layuiLayer1Dom.css('height', '320px')
                        }

                        resetNc()
                        VerificationCodeState = false
                    } else {

                        resetNc()
                        VerificationCodeState = false
                        layer.alert(data.message, {icon: 5});
                    }
                })
                return false;
            } else {
                resetNc()
                if (aCount > 0) {
                    layer.msg("请先通过登录验证!");
                }
                aCount++;
            }
            return false;
        });

        $("#getCaptchaBtn").click(function () {
            let phone = $("#implementationBox [name=phone]").val();
            let reg = /^1\d{10}$/;
            if (reg.test(phone)) {
                // 校验密码必填
                let pwd = $("#implementationBox [name=pwd]").val();
                if (strIsEmpty(pwd)) {
                    layer.msg("请先输入密码！");
                    return false
                }
                $.get("system/param/sendMsgCode", {mobile: phone, verifyCodeType: 'LOGIN'}, function (d) {
                    if (d.code == 200) {
                        $("#getCaptchaBtn").attr("disable", true);
                        $("#getCaptchaBtn").addClass("layui-btn-disabled");
                        let t = 60;
                        let clock = setInterval(function () {
                            if (t > 0) {
                                t--;
                                $("#getCaptchaBtn").html(t + "s");
                            } else {
                                clearInterval(clock);
                                $("#getCaptchaBtn").html("重新获取");
                                $("#getCaptchaBtn").attr("disable", false);
                                $("#getCaptchaBtn").removeClass("layui-btn-disabled");
                            }
                        }, 1000);
                    } else {
                        layer.msg(d.message, {icon: 5});
                    }
                })
            } else {
                $("#implementationBox [name=phone]").focus();
                layer.msg("请输入正确的手机号");
            }
        })
        $("body").delegate(".onclickForgetPwd", "click", function (e) {
            // 触发忘记密码
            $(".forgetPwd").click();
        })
    })

    function resetNc() {
        $('[name="cssessionId"]').val('')
        $('[name="sig"]').val('')
        $('[name="token"]').val('')
        window.nc.reset()
    }


    function loginInit() {
        // reloadMain();
        showAdvise();
        loginState();
        overdueReminder();
        monitorMsg();
        chatUnReadCount();
    }

    function chatUnReadCount() {
        $.post("chat/unReadCount", function (res) {
            if (res != "0") {  //有未读消息
                //播放消息提示音
                $("#msgMp3").remove();
                $("body").append('<audio id="msgMp3"  style="display:none"  src="voice/msg.mp3"  autoplay></audio>');
                setTimeout(function () {
                    $(".myHeadImg").addClass("warningImg");
                }, 500)
            }
        })
    }

    /*设置登录状态下拉*/
    function loginState(noChat) {
        sponsorId = "";
        sponsorName = "";
        $.ajax({
            type: 'POST',
            url: 'user/getUserName',
            async: false,
            success: function (data, status, xhr) {
                rz_state = data.rZ_STATE;
                identity_alias = data.identity_alias;
                //$(".layui-nav-tree").css("display", "none");
                layui.data('base', {
                    key: 'user'
                    , value: data
                });

                if (data.employeeName != undefined) {
                    layui.data('config', {
                        key: 'identity'
                        , value: data.identity_alias
                    });
                }

                if (data.employeeName == undefined || data.identity == "需求企业" || data.identity == "运营方") {
                    $("#sso").css("display", "block");
                    $("#sso").off("click");
                    if (data.employeeName == undefined) {
                        $("#sso").on("click", function () {
                            layer.open({
                                btn: ['去登录'],
                                type: 1,
                                title: '温馨提示',
                                skin: 'layui-layer-rim',
                                content: $("#tipsBox"),
                                btn1: function (index, layero) {
                                    layer.close(index);
                                    $("#implementation").click();
                                }
                            });
                        })
                    } else {
                        $("#sso").on("click", function () {
                            location.href = "index_xqf.jsp";
                        });
                    }

                } else {
                    $("#sso").css("display", "none");
                }

                if (data.employeeName != undefined) {

                    if (data.identity != "自然人") {
                        $("#xzBtn").css("display", "block");
                    }

                    if (noChat == undefined) {
                        beforeChatHandle();
                    }
                    var setting = "";
                    empCode = data.employeeCode;
                    var rz = "";
                    var qyrz = "";
                    if (data.rZ_STATE == "0") {
                        rz = "<button type=button class='layui-btn layui-btn-sm layui-btn-primary' >未认证</button>"
                    } else if (data.rZ_STATE == "1") {
                        rz = "<button type=button class='layui-btn layui-btn-xs layui-btn-warm' >认证中</button>";
                    } else if (data.rZ_STATE == "2") {
                        rz = "<button type=button class='layui-btn layui-btn-xs' >已认证</button>";
                    } else if (data.rZ_STATE == "3") {
                        rz = "<button type=button class='layui-btn layui-btn-xs layui-btn-danger'>认证失败</button>";
                    } else if (data.rZ_STATE == "4") {
                        rz = "<button type=button class='layui-btn layui-btn-xs layui-btn-danger'>证件已过期</button>";
                    }
                    $("#RZ_STATE").append(rz);

                    var jrqy = '';
                    var cjqy = '';
                    var empName = data.realName;
                    if (data.identity == "需求企业") {
                        if (data.corpId != "") {
                            empName += '(' + data.corpName + ')';
                            //cjqy='<dd><a href="javascript:void(0)" id="qyxq"><i class="fa fa-paw fa-fw"></i>企业详情</a></dd>';
                            //qyrz='<dd><a href="javascript:void(0)" id="qyrz"><i class="fa fa-address-card fa-fw"></i>企业认证</a></dd>';
                        } else {
                            /*
                             //需求变更企业由运营方创建
                            jrqy = '<dd><a href="javascript:void(0)" id="jrqy"><i class="fa fa-tint fa-fw"></i>加入企业</a></dd>';
                             if (data.rZ_STATE=="2"){
                                 cjqy = '<dd><a href="javascript:void(0)" id="cjqy"><i class="fa fa-paw fa-fw"></i>创建企业</a></dd>';
                             }else {
                                 cjqy = '<dd><a href="javascript:void(0)" id="cjqyts" onclick="cjqyts()"><i class="fa fa-paw fa-fw"></i>创建企业</a></dd>';
                             }*/
                        }
                        if (data.identity_alias == "工业企业") {
                            //$(".menu-xqqy").css("display", "block");
                            $("#publishBtn2").css("display", "block");
                            $("#menuLi").css("display", "inline-block");
                            sponsorId = data.corpId;
                            sponsorName = data.corpName;
                        } else {  //服务企业
                            //$(".menu-zrr").css("display", "block");
                            $("#publishBtn2").css("display", "none");
                            $("#menuLi").css("display", "inline-block");
                            $("#publishBtn2").css("display", "none");

                        }
                        if (data.corpId == "") {
                            $("#menuLi").css("display", "none");
                        }
                        $("#tzgg").css("display", "none");
                    } else if ("自然人" == data.identity) {
                        $("#publishBtn2").css("display", "none");
                        $("#menuLi").css("display", "inline-block");
                    } else {
                        $("#publishBtn2").css("display", "none");
                        $("#menuLi").css("display", "inline-block");
                    }

                    var headImg = data.headImg == "" ? "images/headImg.png" : data.headImg + "?v=" + Math.floor(Math.random() * 100000);

                    var u = '<a hrindexef="javascript:void(0)"><img  id="topHeadImg" src="' + headImg + '" style="width:32px;height:32px;border-radius:16px;margin-right:5px">' + empName + '</a>'
                        + '<dl class="layui-nav-child">'
                    if (data.identity !== "自然人") {
                        u += '<dd><a href="javascript:void(0)" id="myInfo"><i class="fa fa-user-circle-o fa-fw"></i>用户详情</a></dd>';
                    }
                    if (data.identity == "需求企业") {
                        u += jrqy;
                        if (data.corpId == "") {
                            u += '<dd><a href="javascript:void(0)" id="rz"><i class="fa fa-address-card fa-fw"></i>身份认证</a></dd>';
                        }
                        u += cjqy;
                        //u+=qyrz;
                    }
                    if (data.identity !== "自然人") {
                        u += '<dd><a href="javascript:void(0)" id="sjhb"><i class="fa fa-exchange fa-fw"></i>手机换绑</a></dd>';
                        u += '<dd><a href="javascript:void(0)" id="czmm"><i class="fa fa-key fa-fw"></i>修改密码</a></dd>';
                    }
                    u += '<dd><a href="userLogout" id="logout"><i class="fa fa-power-off fa-fw"></i>退出登录</a></dd>';
                    u += '</dl>';

                    $("#u").html(u);
                    var xxts = layui.data('xxts');
                    if (xxts.isShow != "false") {
                        $("#xxts").attr("checked", "checked");
                    } else {
                        $("#xxts").attr("checked", false);
                    }
                    form.render("checkbox", "settingFilter");
                    unreadCount();

                    element.render('nav');

                    $("#registLi").css("display", "none");
                    $("#screenLi").css("display", "inline-block");
                } else {
                    $("#publishBtn2").css("display", "block");
                    $("#menuLi").css("display", "none");
                }

            }
        })
    }


    /*监听服务器发来的消息*/
    var lockReconnect = false;       //避免ws重复连接
    ws = null;               // 判断当前浏览器是否支持WebSocket
    var empCode = "";
    let hostname = window.location.hostname;

    function monitorMsg() {
        // 
        if(hostname == "localhost"){
            wsUrl = "ws://" + hostname + ":8080/lgb/websocket/" + empCode
        }else{
            // wsUrl = "wss://" + hostname + "/lgb/websocket/" + empCode
            var wsUrl = "wss://zxyy.ltd/lgb/websocket/" + empCode;
        }
        try {
            if ('WebSocket' in window) {
                if (empCode != "") {
                    if (ws != null) {
                        ws.close();//断开登录之前的游客连接
                    }
                    ws = new WebSocket(wsUrl);
                } else {
                    var tempChat = layui.data('tempChat');
                    var chatId = '1757599972203101';
                    if (tempChat.id != null) {
                        chatId = tempChat.id;
                    }
                    // 
                    if(hostname == "localhost"){
                        // MSG_WBBSOCKET_TRT_URL
                        ws = new WebSocket("ws://" + hostname + ":8080/lgb/websocket/"+ chatId) // 建立连接
                    }else{
                        // ws = new WebSocket("wss://" + hostname + "/lgb/websocket/"+ chatId)
                        ws = new WebSocket("wss://zxyy.ltd/lgb/websocket/" + chatId)
                    }
                    layui.data('tempChat', {key: 'id', value: chatId});
                }
            }
            initEventHandle();
        } catch (e) {
            reconnect();
            console.log(e);
        }
    }

    function initEventHandle() {
        ws.onclose = function () {
            reconnect();
            // console.log("ws连接关闭!" + new Date().toLocaleString());
        };
        ws.onerror = function () {
            reconnect();
            console.log("ws连接错误!");
        };
        ws.onopen = function () {
            heartCheck.reset().start();      //心跳检测重置
            // console.log("ws连接成功!" + new Date().toLocaleString());
        };
        ws.onmessage = function (event) {    //如果获取到消息，心跳检测重置
            heartCheck.reset().start();      //拿到任何消息都说明当前连接是正常的
            if (event.data != 'pong') {
                var res = JSON.parse(event.data);
                if ($("#xxts").prop("checked") == true) {
                    msgType = res.msgType;
                    if (msgType == "业务模式") {
                        document.querySelector('#ywDialog').style.display = 'block'; // 显示对话框
                        var vueApp = document.querySelector('#vue').__vue__;
                        vueApp.loginStatus = true
                        vueApp.businessModelUpgradeNoticeVisible = true;
                        //Small Dragon TODO
                    } else if (msgType == "下线通知") {
                        let currentClientType = 'jlf';
                        console.log(currentClientType);
                        console.log(res.msgClientType);
                        if (res.msgClientType && currentClientType !== res.msgClientType) {
                            return;
                        }
                        empCode = "";
                        layer.alert(res.msgContent, {
                            title: msgType, skin: 'layui-layer-red', closeBtn: 0, yes: function () {
                                location.href = "logout";
                            }
                        });
                    } else if (msgType == "即时通讯") {
                        //播放消息提示音
                        $("#msgMp3").remove();
                        $("body").append('<audio id="msgMp3"  style="display:none"  src="voice/msg.mp3"  autoplay></audio>');
                        //刷新会话列表
                        loadChatUser(res.sendEmpId);
                        //头像闪动 (加延迟保证loadChatUser执行完，不然头像有时是自己的有时的发消息者的)
                        setTimeout(function () {
                            $(".myHeadImg").addClass("warningImg");
                        }, 200)
                        //头像上方来个提示 ，如果存在对应的未读提醒就加1，否则就添加提醒
                        //这功能先不做
                    } else {
                        relevantId = res.relevantId;
                        unreadCount();
                        loginState("noChat");//身份认证的状态变化需要及时修改好
                        if (msgType == "任务详情" || msgType == "任务分配" || msgType == "任务验收" || msgType == "任务结算" || msgType == "付款确认") {
                            search();
                        }
                        setTimeout(function () {
                            var content = "";
                            if (unreadNo != "0") {
                                content += '<p>目前共有<span>' + unreadNo + '</span>条未读消息<a href="javascript:void(0)" id="myMsg2">点击查看</a></p>';
                            }
                            content += '<p class="msgTitle">【' + res.msgTitle + '】</p>';
                            content += '<p id="msg-pc" style="text-align:left;text-indent:35px;">' + res.msgContent + '</p>';
                            content += '<div class="notnotice" onclick="readNow(' + res.msgId + ')" >已读</div>';
                            content += '<audio style="display:none" src="http://fanyi.baidu.com/gettts?lan=zh&amp;text=' + res.msgContent + '&amp;spd=5&amp;sorce=web" autoplay></audio>';
                            var h = 185;
                            if (res.msgContent.indexOf("任务") != -1 && res.msgContent.length > 70) {
                                h = 215;
                            }
                            if(res.applyPlatform==2){
                                return
                            }
                            layer.close(layerSteward);
                            layerSteward = layer.open({
                                type: 1,
                                title: '消息提醒',
                                shade: 0,
                                resize: false,
                                area: ['340px', h + 'px'],
                                skin: 'steward',
                                offset: 'lb',
                                closeBtn: 1,
                                anim: 2,
                                zIndex: 199702060,
                                content: content
                            });
                        }, 1000)

                    }

                }
            }


        }
    }


    var nc_token = ["FFFF0N0000000000B194", (new Date()).getTime(), Math.random()].join(':');
    var NC_Opt =
        {
            renderTo: "#your-dom-id",
            appkey: "FFFF0N0000000000B194",
            scene: "nc_login",
            token: nc_token,
            customWidth: '100%',
            trans: {"key1": "code0"},
            elementID: ["usernameID"],
            is_Opt: 0,
            language: "cn",
            isEnabled: true,
            timeout: 3000,
            times: 5,
            callback: function (data) {
                if (data.value === 'pass') {
                    $('[name="cssessionId"]').val(data.csessionid)
                    $('[name="sig"]').val(data.sig)
                    $('[name="token"]').val(data.token)
                    VerificationCodeState = true
                } else {
                    resetNc()
                    VerificationCodeState = false
                }
            }
        }
    var nc = new noCaptcha(NC_Opt)
    nc.upLang('cn', {
        _startTEXT: "请按住滑块，拖动到最右边",
        _yesTEXT: "验证通过",
        _error300: "哎呀，出错了，点击<a href=\"javascript:__nc.reset()\">刷新</a>再来一次",
        _errorNetwork: "网络不给力，请<a href=\"javascript:__nc.reset()\">点击刷新</a>",
    })


    // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
        ws.close();
    }

    function reconnect() {
        if (lockReconnect) return;
        lockReconnect = true;
        setTimeout(function () {     //没连接上会一直重连，设置延迟避免请求过多
            monitorMsg();
            lockReconnect = false;
        }, 2000);
    }

    //心跳检测
    var heartCheck = {
        timeout: 60000,  //1分钟发一次心跳
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function () {
            clearTimeout(this.timeoutObj);
            clearTimeout(this.serverTimeoutObj);
            return this;
        },
        start: function () {
            var self = this;
            this.timeoutObj = setTimeout(function () {
                ws.send("ping");
                console.log("ping!");
                self.serverTimeoutObj = setTimeout(function () {//如果超过一定时间还没重置，说明后端主动断开了
                    ws.close();     //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                }, self.timeout)
            }, this.timeout)
        }
    }

    function jrqyts() {
        layer.tips('请先通过身份认证才能加入企业！', '#jrqyts', {
            tips: [1, "#4794ec"]
            , time: 1500
        });
    }

    function cjqyts() {
        layer.tips('请先通过身份认证才能创建企业！', '#cjqyts', {
            tips: [1, "#4794ec"]
            , time: 1500
        });
    }

    // 监听 localStorage 变化
    window.addEventListener('storage', function(e) {
        if(e.key === 'aboutUsTab') {
            // 更新导航栏选中状态
            $('.layui-nav-item').removeClass('layui-this');
            $('.layui-nav-item a').each(function() {
                if($(this).attr('onclick') && $(this).attr('onclick').indexOf(e.newValue) > -1) {
                    $(this).parent().addClass('layui-this');
                }
            });
        }
    });

    // 页面加载时检查 localStorage 中的值
    $(document).ready(function() {
        var currentTab = localStorage.getItem('aboutUsTab');
        if(currentTab) {
            $('.layui-nav-item').removeClass('layui-this');
            $('.layui-nav-item a').each(function() {
                if($(this).attr('onclick') && $(this).attr('onclick').indexOf(currentTab) > -1) {
                    $(this).parent().addClass('layui-this');
                }
            });
        }
    });
</script>
</html>
