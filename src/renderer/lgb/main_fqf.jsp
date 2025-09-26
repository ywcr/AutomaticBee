







<html>
<head>
    <meta name="referrer" content="no-referrer">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="UTF-8">
    <link rel="icon" href="images/jp.png" type="image/x-icon">
    <link rel="stylesheet" href="layui/css/layui.css">
    <link rel="stylesheet" href="font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="/lgb/css/main-item.css" charset="utf-8"/>
    <style>
        body {
            padding: 15px 0px 15px 0px;
            background-color: #f2f4f8;
        }

        #tb1 tr td:first-child {
            color: #000;
            font-weight: 600;
        }

        #tb1 tr > td + td {
            cursor: pointer;
        }

       /* #content > div + div {
            margin-top: 20px;
        }*/

        .project {
            height: 185px;
            margin-bottom: 10px;
            min-width: 600px;
            background-color: #FFFFFF;
        }

        .state {
            position: relative;
            top: 30px;
            left: -80px
        }

        #content .layui-btn-danger {
            /*  padding-left:11px;
              padding-right:11px;*/
        }

        .layui-layer-msg {
            z-index: 20001010 !important;
        }

        .bg {
            background: #d6ecd6;
            text-align: center;
        }

        #bar1 {
            width: 50px;
            height: 50px;
            line-height: 50px;
            margin-bottom: 1px;
            text-align: center;
            cursor: pointer;
            font-size: 30px;
            color: #fff;
            border-radius: 2px;
            opacity: .95;
            background-color: #009688;
            z-index: 999999;
        }

        #bar1 span {
            position: relative;
            top: -41px;
            right: -16px;
            /* opacity: 0.8; */
            padding: 0 3px;
            font-size: 10px;
            color: #FFF;
            font-weight: 700;
            z-index: 9999999;
            height: 16px;
            line-height: 16px;
        }


        .projectTab {
            height: 150px;
            width: 100%;
            /* margin-left: 30px;
              float:left; */
            /* border-left: 4px solid #009688; */
            /* border:2px dashed #666; */
            padding: 0px 10px;
            display: none;
        }

        .projectTab tr {
            height: 40px;
            /*height: 53px;*/
        }

        .projectTab tr td:nth-of-type(1) {
            width: 150px;
        }

        .projectTab tr td:nth-of-type(2) {
            width: 150px;
        }

        .projectTab tr td:nth-of-type(3) {
            width: 100px;
        }

        .projectTab a {
            color: #7cabce;
            text-decoration: underline;
            cursor: pointer;
        }

        .projectTab .r {
            color: red;
            font-weight: 600;
        }

        .projectTab .g {
            color: green;
            font-weight: 600;
        }

        #awen.layui-layer-content {
            overflow: auto;
        }

        .layui-form-label b {
            color: red;
        }

        .layui-btn.cj {
            border: 1px solid #009688;
            color: #009688;
            background: #FFF;
        }

        .layui-btn.jj {
            border: 1px solid #FF5722;
            color: #FF5722;
            background: #FFF;
        }

        #projectTitle a.layui-btn {
            float: right;
            height: 22px;
            line-height: 22px;
            padding: 0 5px;
            font-size: 12px;
        }

        .chatTitle {
            color: red;
            font-weight: 600;
        }

        .w {
            width: 1300px !important;
            margin: 0 auto !important
        }

        .w_img {
            width: 1300px !important;
            margin: 0 auto !important
        }


        #xmjcDiv,
        #removedDiv  {
            height: 36px;
            line-height: 36px;
            margin-left: 20px;
            float: left;
            border: 1px solid #e6e6e6;
            padding: 0px 12px;
            border-radius: 8px;
            color: #666;
        }

        #xmjcDiv .layui-form-switch,
        #removedDiv .layui-form-switch{
            margin-top: 0px;
        }

        /*.layui-btn {*/
        /*    display: inline-block;*/
        /*    height: 38px;*/
        /*    width: 80px;*/
        /*    line-height: 1px;*/
        /*    padding: 0 10px;*/
        /*    text-align: center;*/
        /*    font-size: 14px;*/
        /*}*/
        /*导航栏开始*/
        .item {
            display: table-cell;
            height: 100%;
            vertical-align: middle;
            /*  垂直居中*/
        }
        .layui-nav .layui-nav-item a {
            color: #000000;
            font-size: 16px;
        }

        .layui-nav .layui-nav-item a:hover, .layui-nav .layui-this a {
            color: #000000;
            font-size: 16px;
        }

        .layui-nav {
            position: relative;
            background-color: #ffffff;
            /*  padding: 0 20 0 20px;
            color: #fff; */
            border-radius: 2px;
            font-size: 0;
            box-sizing: border-box;
            text-align: left;
        }

        .layui-nav .layui-this:after, .layui-nav-bar, .layui-nav-tree .layui-nav-itemed:after {
            background-color: #00000000 !important;
        }

        .layui-nav-child {
            background-color: #ffffffb0;
        }
        .layui-btn-warm2 {
            color: #fff !important;
            background-color: #c2c0c0 !important;
        }
        .maxWords{
            max-width: 220px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    </style>
</head>
<body>
<center style="min-width:1300px;padding:0 20px">
    
    <div class="layui-carousel w_img" id="test10">
        <div carousel-item="">
            
            <div><img src="https://jlf-1024.oss-cn-beijing.aliyuncs.com/SYSTEM/1856224083079991296.png" width="100%" height="100%"></div>
            
            <div><img src="https://jlf-1024.oss-cn-beijing.aliyuncs.com/SYSTEM/1856227701787070464.png" width="100%" height="100%"></div>
            
            <div><img src="https://jlf-1024.oss-cn-beijing.aliyuncs.com/SYSTEM/1856223605860470784.png" width="100%" height="100%"></div>
            
        </div>
    </div>
    <br>
    
    <div class="item" style="height: 45px; width: 1300px; border: 1px solid #D4D4D4;">

        <div class="layui-col-xs1 layui-col-sm1 layui-col-md1" style="background-color: #cdcccc;height: 60px;">
            <div class="layui-col-xs12 layui-col-sm12 layui-col-md12" style="top: 16px;">
                <li class="" style="color: #1a1a1a;color: #1a1a1a;font-size: 20px;">
                    <span>任务类型</span>
                </li>
            </div>
        </div>

        <div class="layui-col-xs11 layui-col-sm11 layui-col-md11" id="tb1">
            <ul class="layui-nav" lay-filter="" style="display:flex;flex-wrap:wrap;">
                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">渠道档案</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="等级医院档案">等级医院档案</a></dt>
                        <dt><a href="#" aria-valuetext="基层医疗档案">基层医疗档案</a></dt>
                        <dt><a href="#" aria-valuetext="零售渠道档案">零售渠道档案</a></dt>
                        <dt><a href="#" aria-valuetext="商业渠道档案">商业渠道档案</a></dt>
                    </dl>
                </li>
                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">信息收集</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="病例信息">病例信息</a></dt>
                        <dt><a href="#" aria-valuetext="竞品信息">竞品信息</a></dt>
                    </dl>
                </li>
                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">渠道准入</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="三级医院准入">三级医院准入</a></dt>
                        <dt><a href="#" aria-valuetext="二级医院准入">二级医院准入</a></dt>
                        <dt><a href="#" aria-valuetext="一级医院准入">一级医院准入</a></dt>
                        <dt><a href="#" aria-valuetext="基层医疗准入">基层医疗准入</a></dt>
                        <dt><a href="#" aria-valuetext="零售渠道准入">零售渠道准入</a></dt>
                        <dt><a href="#" aria-valuetext="商业渠道准入">商业渠道准入</a></dt>
                    </dl>
                </li>

                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">拜访巡访</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="等级医院科室拜访">等级医院科室拜访</a></dt>
                        <dt><a href="#" aria-valuetext="基层医疗拜访">基层医疗拜访</a></dt>
                        <dt><a href="#" aria-valuetext="零售渠道巡访">零售渠道巡访</a></dt>
                        <dt><a href="#" aria-valuetext="商业渠道巡访">商业渠道巡访</a></dt>
                        <dt><a href="#" aria-valuetext="临床医生拜访">临床医生拜访</a></dt>
                        <dt><a href="#" aria-valuetext="患者拜访">患者拜访</a></dt>
                        <dt><a href="#" aria-valuetext="跟台服务">跟台服务</a></dt>
                        <dt><a href="#" aria-valuetext="等级医院科室巡访">等级医院科室巡访</a></dt>
                        <dt><a href="#" aria-valuetext="基层医疗巡访">基层医疗巡访</a></dt>

                    </dl>
                </li>

                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">数据收集</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="商业流向数据">商业流向数据</a></dt>
                        <dt><a href="#" aria-valuetext="竞品流向数据">竞品流向数据</a></dt>
                        <dt><a href="#" aria-valuetext="商业渠道进销存数据">商业渠道进销存数据</a></dt>
                        <dt><a href="#" aria-valuetext="基层医疗进货数据">基层医疗进货数据</a></dt>
                        <dt><a href="#" aria-valuetext="零售渠道进货数据">零售渠道进货数据</a></dt>
                        <dt><a href="#" aria-valuetext="等级医院库存数据">等级医院库存数据</a></dt>
                        <dt><a href="#" aria-valuetext="终端竞品购进">终端竞品购进</a></dt>
                        <dt><a href="#" aria-valuetext="基层医疗库存数据">基层医疗库存数据</a></dt>
                        <dt><a href="#" aria-valuetext="零售渠道库存数据">零售渠道库存数据</a></dt>
                    </dl>
                </li>

                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">问卷调查</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="医生问卷">医生问卷</a></dt>
                        <dt><a href="#" aria-valuetext="患者问卷">患者问卷</a></dt>
                        <dt><a href="#" aria-valuetext="店员问卷">店员问卷</a></dt>
                        <dt><a href="#" aria-valuetext="消费者问卷">消费者问卷</a></dt>
                        <dt><a href="#" aria-valuetext="商业人员问卷">商业人员问卷</a></dt>
                    </dl>
                </li>

                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">学术活动</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="医院科室会活动">医院科室会活动</a></dt>
                        <dt><a href="#" aria-valuetext="患者教育活动">患者教育活动</a></dt>
                        <dt><a href="#" aria-valuetext="推广培训活动">推广培训活动</a></dt>
                        <dt><a href="#" aria-valuetext="业务培训活动">业务培训活动</a></dt>
                    </dl>
                </li>


                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">终端服务</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="等级医院科室维护">等级医院科室维护</a></dt>
                        <dt><a href="#" aria-valuetext="基层医疗维护">基层医疗维护</a></dt>
                        <dt><a href="#" aria-valuetext="患者微服务">患者微服务</a></dt>
                    </dl>
                </li>

                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">推广活动</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="产品促销活动">产品促销活动</a></dt>
                        <dt><a href="#" aria-valuetext="陈列展示活动">陈列展示活动</a></dt>
                        <dt><a href="#" aria-valuetext="品牌宣传活动">品牌宣传活动</a></dt>
                    </dl>
                </li>

                <li class="layui-nav-item" style="flex: 1">
                    <a href="javascript:;">数字营销</a>
                    <dl class="layui-nav-child">
                        <dt><a href="#" aria-valuetext="线上内容营销">线上内容营销</a></dt>
                        <dt><a href="#" aria-valuetext="线上品牌推广">线上品牌推广</a></dt>
                    </dl>
                </li>
                <li class="layui-nav-item" style="flex: 1">
                    <a href="" >全部任务</a>
                </li>
            </ul>
        </div>
    </div>
    <br>
    <div style="text-align:left" class="w">
        <form class="layui-form" id="queryForm">
            <input type="hidden" name="projectAdcodeList">
            <input type="hidden" name="projectType">
            <input type="hidden" name="page">
            <input type="hidden" name="size">
            <input type="hidden" name="removed" value="0" />
            <div style="width:140px;height:70px;float:left">
                <input class="layui-input" placeholder="任务区域" style="width:120px;" name="projectArea"
                       onclick="selArea()" readonly="readonly">
            </div>

            <div style="width:130px;height:70px;float:left">
                <select name="publishDate" lay-filter="sel">
                    
                    <option value="">创建时间</option>
                    
                    <option value="1w">一周内</option>
                    <option value="1m">一月内</option>
                    <option value="3m">三月内</option>
                    <option value="6m">半年内</option>
                    <option value="1y">一年内</option>
                </select>
            </div>

            <div style="width:130px;height:70px;float:left;margin-left:10px">
                <select name="state" lay-filter="sel">
                    <option value="">任务状态</option>
                    
                    <option value="4">承接结束</option>
                    <option value="5">任务结束</option>
                </select>
            </div>

            
                <div style="width:130px;height:70px;float:left;margin-left: 10px">
                    <select name="recheck" lay-filter="sel">
                        <option value="">验收方式</option>
                        <option value="0">需方验收</option>
                        <option value="1">需方复验</option>
                        
                    </select>
                </div>
            <div style="width:130px;height:70px;float:left;margin-left: 10px;">
                <select name="corpOrUserType" lay-filter="selCorpOrUserType">
                    <option value="">承接类型</option>
                    <option value="1">供应商</option>
                    <option value="2">任务企业</option>
                </select>
            </div>
            

            <div style="width:530px;height:70px;float:left;margin-left:20px">
                <input class="layui-input" placeholder="任务单号、标题、任务企业关键字" style="width:295px;float:left" name="key"
                       autocomplete="off">
                <button type="button" style="float:left" class="layui-btn" id="searchBtn"><i
                        class="layui-icon">&#xe615;</i></button>

                

            </div>


            <div id="content" class="project-content" ></div>
                
            </center>
            
            <br><br>
            <center><div id="layPage"></div></center>
        </form>
    </div>

    
    <li class="layui-icon" id="bar1" lay-type="bar1" style="position:fixed;bottom:15px;right:15px">&#xe606;
        <span class='layui-badge' style="display:none"></span>
    </li>
    

    <!-- 文件下载   -->
    <form name="downForm" id="downForm" method="post" style="display:none">
        <iframe name="downFrame" style="display:none"></iframe>
    </form>

    <div class="w" style="margin:0px 10%;background:#EEE;height:130px;text-align: center">
        <table style="height:100%;margin:0 auto">
            <tr style="text-align: center" class="L1" style="">
                <td>
                    <!-- <div style="width:100px;display:inline-block;cursor:pointer" onclick="parent.aboutClick('lxwm')">
                        <img src="images/main_b1.png" style="width:36px;margin:0 auto">
                        <a href="javascript:void(0)" style="display:block">关于我们</a>
                    </div>
                    <div style="width:100px;display:inline-block;cursor:pointer" onclick="parent.aboutClick('cpjj')">
                        <img src="images/main_b2.png" style="width:40px;margin:0 auto">
                        <a href="javascript:void(0)" style="display:block">产品简介</a>
                    </div> -->
                    <div style="width:100px;display:inline-block;cursor:pointer" onclick="parent.aboutClick('gztx')">
                        <img src="images/main_b3.png" style="width:36px;margin:0 auto">
                        <a href="javascript:void(0)" style="display:block">规则体系</a>
                    </div>
                    <div style="width:100px;display:inline-block;cursor:pointer" id="lxkf">
                        <img src="images/main_b4.png" style="width:36px;margin:0 auto">
                        <a href="javascript:void(0)" style="display:block">联系客服</a>
                    </div>
                </td>
                <td rowspan="2" style="width:80px;padding-left:20px">
                    <img src="images/ewm.jpg" height="80px">
                    <font style="font-size:14px">微信公众号</font>
                </td>
            </tr>
            <tr class="L2">
                <td>
                    <font>北京知行同德信息科技有限公司</font>
                    <font style="margin-left:8px">Copyright 2022 zxyy.ltd</font>
                    <font style="margin-left:8px"><a href="javascript:void(0)" onclick="bah()"
                                                     style='text-decoration:underline;color:#0070c0'>京ICP备19039466号</a></font>
                    <font style="margin-left:8px"><img src="images/ga.png"><a href="javascript:void(0)" onclick="gaba()"
                                                                              style='text-decoration:underline;color:#0070c0'>京公网安备
                        11010602102550号</a></font>
                    <font style="margin-left:8px">互联网药品信息服务资格证书编号（京）非经营性-2021-0150</font>
                </td>
            </tr>
        </table>
    </div>
</center>


<div id="comfirmUnuseAgreementBox" style="display: none;">
    <div style="padding:22px">
        <p><i class="fa fa-warning orange" style="font-size: 20px;margin-right: 10px"></i><b>确认此任务内容？</b></p>
        <p style="color: #666666;text-indent: 20px;font-size: 12px;margin-top: 10px;line-height: 18px;">
            为保障贵企业与发其方权益，贵企业需要确认下表中任务内容准确无误；若发起方决定不使用由精灵蜂提供的电子版《供应商服务协议》，则应与
            发起方另行线下签署包含下表中内容的纸质协议。若您点击”确定“，表示贵企业已认可该任务内容，发起方将按此内容验收及结算，请您谨慎操作！
            您确认此操作？
        </p>
        <table class="layui-table">
            <tr>
                <td class="center bold">任务单号</td>
                <td class="green" colspan="4" id="projectId"></td>
            </tr>
            <tr>
                <td class="center bold">任务标题</td>
                <td class="green" colspan="4" id="projectTitle"></td>
            </tr>
            <tr>
                <td class="center bold">任务类型</td>
                <td class="green" colspan="4" id="classify"></td>
            </tr>
            <tr>
                <td class="center bold">任务说明</td>
                <td colspan="4">任务说明及任务补充说明详见精灵蜂平台-任务详情</td>
            </tr>
            <tr>
                <td class="center bold">任务规则</td>
                <td colspan="4">任务规则及任务补充规则详见精灵蜂平台-任务详情</td>
            </tr>
            <tr>
                <td class="center bold">任务区域</td>
                <td class="green" colspan="4" id="projectArea"></td>
            </tr>
            <tr>
                <td class="center bold">发布时间</td>
                <td class="green" colspan="4" id="beginDate"></td>
            </tr>
            <tr>
                <td class="center bold">结束时间</td>
                <td class="green" colspan="4" id="endDate"></td>
            </tr>
            <tr>
                <td class="center bold">发起企业</td>
                <td class="green" colspan="4" id="serviceProvider"></td>
            </tr>
            <tr>
                <td class="center bold">承接方类型</td>
                <td class="green" colspan="4">企业</td>
            </tr>
            <tr>
                <td class="center bold">承接企业</td>
                <td class="green" colspan="4" id="corpName"></td>
            </tr>
            <tr>
                <td class="center bold">任务分配量</td>
                <td class="center bold">任务单价</td>
                <td class="center bold">任务金额</td>
                <td class="center bold">服务费</td>
                <td class="center bold">金额合计</td>
            </tr>
            <tr>
                <td class="green center" id="workload">10</td>
                <td class="green center" id="projectPrice">20</td>
                <td class="green center" id="amount">50</td>
                <td class="green center" id="servicefee">50</td>
                <td class="green center" id="amountSum">20</td>
            </tr>
        </table>
        <center>
            <button class="layui-btn orange-bg" onclick="unuse_cancel()">取消</button>
            <button class="layui-btn" onclick="unuse_ok()">确定</button>
        </center>
    </div>
</div>



<div id="forwardBox" style="display:none;padding:15px;">

    <form class="layui-form">
        <input type="hidden" name="projectId" value="">
        <div class="layui-form-item">
            <label class="layui-form-label" style="width:120px">承接方年龄</label>
            <div class="layui-input-block" style="margin-left:120px">
                <input type="number" name="age1" class="layui-input" value="20" maxlength="2" lay-verify="pint"
                       autocomplete="off" style="width:45px;float:left;text-align: center">
                <span style="height:38px;line-height:38px;float:left;margin-right:5px">岁 &nbsp;&nbsp;&nbsp;~&nbsp;&nbsp;&nbsp;</span>
                <input type="number" name="age2" class="layui-input" value="60" maxlength="2" lay-verify="pint"
                       autocomplete="off" style="width:45px;float:left;text-align: center">
                <span style="height:38px;line-height:38px;float:left">岁</span>
            </div>
        </div>

        <p style="color:#8a8a8a;margin-left:65px"><span class="layui-badge-dot" style="background:#919191"></span>上下限制为>=18岁
            &lt;60岁</p>

        <div class="layui-form-item">
            <label class="layui-form-label" style="width:120px"><b>* </b>承接期限</label>
            <div class="layui-input-block" style="margin-left:150px">
                <div style="float:left;width:150px">
                    <select name="pickup_type">
                        <option value="">不限</option>
                        <option value="1">发布一天内</option>
                        <option value="2">发布二天内</option>
                        <option value="3">发布三天内</option>
                        <option value="5">发布五天内</option>
                        <option value="7" selected>发布七天内</option>
                        <option value="15">发布十五天内</option>
                    </select>
                </div>
                <p id="pickupTypeTips"><i class="fa fa-question-circle tips"></i></p>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label" style="width:120px"><b>* </b>限制人数</label>
            <div style="width:150px;float:left" >
                <select name="num" >
                    <option value="">请选择</option>
                    <option value="10">小于等于10人</option>
                    <option value="20">小于等于20人</option>
                    <option value="50">小于等于50人</option>
                    <option value="100">小于等于100人</option>
                </select>
            </div>
        </div>

        <button class="layui-btn" style="width:130px;margin-left:120px;" lay-submit lay-filter="forward">
            确认转发
        </button>
    </form>

</div>

</body>
<style>

    .L1 a {
        font-size: 14px;
        color: #999AAA;
        font-weight: 900;
        text-decoration: underline;
    }

    .L2 font {
        color: #999AAA;
        font-size: 13px;
    }

    .forwardImg {
        height: 20px;
        margin-bottom: 3px;
        margin-left: 5px;
    }

    .myTitle {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 500px;
    }

</style>
<script src="layui/layui.js"></script>
<script src="js/awen-ajax.js"></script>
<script src="/lgb/js/tools.js"></script>
<script>
    var $;
    var flow;
    var layIndex;
    var boxIndex;
    var layer;
    var isShow = 0;
    var display = "style='display:block'";
    var floatVal = "style='float:left'";
    var loadIndex;
    var curr = 1;
    var limit = 10;
    var qsxyIndex;
    var assId;

    var newDate = '1757599973909'

    var pickupTypeTips = '“不限”表示：在任务发布后至任务结束前，从业者可以承接任务、发布方也可以分配任务。' +
        '其他，则只能在承接期限内承接任务，承接期限结束后才可分配任务。'

    String.prototype.replaceAll = function (s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
    }

    function unuse_cancel() {
        layer.close(layer.index);
    }

    function unuse_ok() {
        $.post("bpu/assignment/confirm_allocation", {recId: assId}, d => {
            if (d.code == 0) {
                layer.msg("确认分配成功");
                timeout_2000(() => {
                    layer.closeAll();
                    search()
                })
            }
        }, 'json')
    }

    function gaba() {
        window.open("http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010602102550");
    }

    function bah() {
        window.open("http://beian.miit.gov.cn");
    }

    function closeSign() {
        layer.close(qsxyIndex);
    }

    layui.use(['element', 'layer', 'form', 'jquery', 'carousel', 'flow', 'util', 'laydate', 'upload', 'laypage'], function () {
        var form = layui.form;
        var carousel = layui.carousel;
        laydate = layui.laydate;
        var upload = layui.upload;
        $ = layui.jquery;
        flow = layui.flow;
        var util = layui.util;
        layer = layui.layer;
        laypage = layui.laypage;
        var tipsIndex = null


        $(".tips").hover(function (e) {
            var id = $(e.target).parent().attr("id");
            var content;
            if (id == 'pickupTypeTips') {
                content = pickupTypeTips
            }
            content = content == undefined ? "暂无内容" : content;
            tipsIndex =
                layer.tips(content, $(e.target), {
                    tips: [2, '#3595CC'],
                    time: 6000
                })
        }, function (t) {
            layer.close(tipsIndex);
        })

        form.on('switch(xmjc)', function (data) {
            if (data.elem.checked) {
                $(".projectTab").css("display", "block");
                $(".rwjc").css("display", "block");
                $(".project").css("float", "left");
                $(".project").css("margin-bottom", "0px");
                $(".project").css("margin-top", "0px");
                display = "style='display:block'";
                floatVal = "style='float:left'";
            } else {
                $(".projectTab").css("display", "none");
                $(".rwjc").css("display", "none");
                $(".project").css("float", "none");
                $(".project").css("margin-bottom", "10px");
                $(".project").css("margin-top", "10px");
                display = "style='display:none'";
                floatVal = "style='float:none'";
            }
        });


        form.on('switch(removed)', function(data) {
            if (data.elem.checked) {
                $("[name='removed']").val('1')
            }else {
                $("[name='removed']").val("0")
            }
            search()
        })



        form.on('submit(forward)', function (d) {
            console.log(d)
            if (strIsEmpty(d.field.projectId)) {
                top.layer.msg('当前任务Id为空')
                return false
            }
            if (d.field.age1 > d.field.age2 || d.field.age1 < 18 || d.field.age2 >= 66) {
                top.layer.msg("年龄范围填写有误！")
                return false;
            }
            if (d.field.num==""){
                top.layer.msg("限制人数不能为空！")
                return false;
            }else if (d.field.num==0){
                top.layer.msg("限制人数不能为0！")
                return false;
            }
            else if (d.field.num<0){
                top.layer.msg("限制人数不能小于0！")
                return false;
            }
            layer.load();
            $.post("bpu/project/forward", d.field, function (res) {
                layer.closeAll("loading");
                if (res.code == 0) {
                    layer.msg("转发成功！", {icon: 6, offset: "40%"});
                    setTimeout(function () {
                        layer.close(forwardIndex);
                        search();

                    }, 1500)
                } else {
                    layer.msg(res.message);
                }
            })
            return false;
        })




        form.on('select(sel)', function (data) {
            curr = 1
            search();
        });

        form.on('select(selCorpOrUserType)', function (data) {
            curr = 1
            search();
        });

        
        display = "style='display:none'";
        floatVal = "style='float:none'";
        

        $("#lxkf").click(function () {
            
            top.chatKF()
            
        })

        $("#showBtn").click(function () {
            var text = $(this).text();
            if (text == "显示任务进程") {
                $(this).text("隐藏任务进程");
                $(this).css("background-color", "#FFF");
                $(this).css("color", "#ffb800");
                $(".projectTab").css("display", "block");
                $(".project").css("float", "left");
                display = "style='display:block'";
                floatVal = "style='float:left'";
            } else {
                $(this).text("显示任务进程");
                $(this).css("background-color", "#ffb800");
                $(this).css("color", "#FFF");
                $(".projectTab").css("display", "none");
                $(".project").css("float", "none");
                display = "style='display:none'";
                floatVal = "style='float:none'";
            }
        })

        if (window.performance.navigation.type == 1) {
            unreadCount();
        }

        $("#bar1").click(function () {
            parent.showMsg();
        })

        $("body").on('click', '.ys', function (e) {
            var tabName = $(this).attr("data-name");
            var tabText = $(this).attr("data-text");
            var projectId = $(this).attr("data-id");
            top.layer.open({
                id: 'awen',
                type: 2,
                /* title:'任务验收', */
                title:'任务验收',
                //area: ['80%','90%'],
                //offset:['5%','10%'],
                area: ['100%', '100%'],
                success: function(layero, index){
                    layer.full(index);
                },
                content: "rwys_fqf.jsp?projectId=" + projectId
            })
            e.stopPropagation();
        })

        $("body").on('click', '.js', function (e) {
            var tabText = $(this).attr("data-text");
            var projectId = $(this).attr("data-id");
            layer.open({
                id: 'awen',
                type: 2,
                title: false,
                /* title:'任务结算', */
                skin: 'layui-layer-molv',
                area: ['1300px', '96%'], //宽高
                offset: ['2%'],
                content: "rwjs_fqf.jsp?projectId=" + projectId
            })
        })

        $("body").on('click', '.zf', function (e) {
            var tabText = $(this).attr("data-text");
            var projectId = $(this).attr("data-id");
            layer.open({
                id: 'awen',
                type: 2,
                title: '付款确认',
                skin: 'layui-layer-molv',
                area: ['80%', '90%'], //宽高
                offset: ['5%', '10%'],
                content: "fkqr_fqf.jsp?projectId=" + projectId
            })
        })

        $("body").on('click', '.fp', function (e) {
            var projectId = $(this).attr("data-id");
            var planNo = $(this).attr("data-planNo");
            layer.open({
                id: 'awen',
                type: 2,
                title: false,
                skin: 'layui-layer-molv',
                area: ['1300px', '96%'], //宽高
                offset: ['2%'],
                content: 'rwfp_fqf.jsp?projectId=' + projectId
            })
        })


        function closeSign() {
            layer.closeAll()
        }

        //查看协议
        $("body").on('click', '.ckxy', function (e) {
            loadIndex = layer.open({type: 3, offset: '50%'})
            var fileId = $(this).attr("data");
            var state = $(this).attr("data-state");
            $.post("bpu/assignment/ckxy", {fileId: fileId, state: state}, function (res) {
                layer.close(loadIndex);
                if (res.code == 0) {
                    if (res.data.downloadUrl != undefined && res.data.downloadUrl != "") {
                        layer.open({
                            type: 2,
                            title: '查看协议',
                            skin: 'layui-layer.molv',
                            area: ['80%', '90%'],
                            offset: '5%',
                            content: res.data.downloadUrl
                        })
                    } else {
                        qsxyIndex = layer.open({
                            type: 2,
                            title: '签署协议',
                            skin: 'layui-layer.molv',
                            area: ['1300px', '90%'],
                            offset: '5%',
                            content: res.data
                            ,cancel: function () {
                                location.reload()
                            },end:function () {
                                //location.reload()
                                layer.closeAll();
                                search();
                            }
                        })
                    }
                } else {
                    layer.msg(res.message, {offset: '50%'});
                }
            })
        })


        $("body").on('click', '.look_jsedCount', function (e) {
            let projectId = $(this).attr("data-id");
            let projectType = $(this).attr("data-type");
            let projectTitle = $(this).attr("data-title");
            layer.open({
                id: 'awen',
                type: 2,
                title: false,
                skin: 'layui-layer-molv',
                area: ['1100px', '86%'], //宽高
                offset: ['7%'],
                content: 'rwjs_yjs_fwsOnXqf.jsp?projectId=' + projectId + '&projectType=' + projectType + '&projectTitle=' + projectTitle
            })
        })

        $("body").on('click', '.confirm_allocation', function (e) {
            let ass_row = JSON.parse($(this).attr("data"));
            assId = ass_row.assId;
            if (ass_row.is_online == "0") {
                $("#projectId").html(ass_row.recId);
                $("#corpName").html('');
                $("#workload").html(ass_row.workload);
                $("#projectPrice").html(ass_row.projectPrice);
                let amount = (Number(ass_row.workload) * Number(ass_row.projectPrice)).toFixed(2);

                $("#amount").html(amount);
                let servicefee = (Number(ass_row.fee) * Number(amount) * 0.01).toFixed(2);
                $("#servicefee").html(servicefee);
                $("#amountSum").html(Number(amount) + Number(servicefee));
                //$("#amountSum").html((parseFloat(amount) + parseFloat(servicefee)).toFixed(2));
                $("#projectTitle").html(ass_row.projectTitle);
                $("#classify").html(ass_row.projectType);
                $("#projectArea").html(ass_row.projectArea);
                $("#beginDate").html(ass_row.beginDate);
                $("#endDate").html(ass_row.endDate);
                $("#serviceProvider").html(ass_row.serviceProvider);
                layer.open({
                    id: 'awen',
                    type: 1,
                    title: false,
                    closeBtn: 0,
                    area: ['660px', '90%'],
                    offset: ['5%'],
                    content: $("#comfirmUnuseAgreementBox")
                })
            }
        })

        $("body").on('click', '.project', function (e) {
            var d = JSON.parse($(this).attr("data"));
            
            boxIndex = layer.open({
                id: 'awen',
                type: 2,
                //title:'任务详情',
                title: false,
                resize: false,
                skin: 'layui-layer-molv',
                area: ['850px', '96%'],
                offset: '2%',
                content: 'projectDetail_fqf.jsp?projectId=' + d.recId + "&stateTxt=" + d.stateTxt + "&stateClass=" + d.stateClass+"&curr="+curr
            })
            
        })

        //需求企业才有验收数量提示
        $.post("user/getUserName", function (data) {
            if (data.employeeName != undefined && data.identity != "自然人") {
                ysNo();
                isShow = 1;
            }
            search();
        }, 'json')

        util.fixbar({
            bar1: false
            , bgcolor: '#009688'
            //,showHeight:50
            //,css:{right:30,bottom:50}
            , click: function (type) {
                console.log(type);
                if (type === 'bar1') {
                }
            }
        });

        window.onscroll = function () {
            var sTop = document.body.scrollTop;
            if (sTop >= 200) {
                $("#bar1").css("bottom", "66px");
            } else {
                $("#bar1").css("bottom", "15px");
            }
        }

        //图片轮播
        carousel.render({
            elem: '#test10'
            , width: '80%'
            //,height: '400px'
            , height: '450px'
            , interval: 5000
        });

        //点击搜索
        $("#searchBtn").click(function () {
            curr = 1;
            search();
        })
        //点击任务类型调用查询方法
        $("dl dt").click(function () {
            //  var a = $(this).clone().children().remove().end().text();
            $("#queryForm [name=projectType]").val($(this).find("a").attr("aria-valuetext"));
            curr = 1;
            search();
        })
        /*
        $("#tb1  td+td").click(function () {
            if ($(this).css("font-weight") != 600) {
                $("#tb1 td+td").css("color", "#666666");
                $("#tb1 td+td").css("font-weight", "300");
                $(this).css("color", "#009688");
                $(this).css("font-weight", "600");
                $("#queryForm [name=projectType]").val($(this).clone().children().remove().end().text());
            } else {
                $("#tb1 td+td").css("color", "#666666");
                $("#tb1 td+td").css("font-weight", "300");
                $(this).css("color", "#666666");
                $(this).css("font-weight", "300");
                $("#queryForm [name=projectType]").val("");
            }
            curr = 1;
            search();
        })*/


    })

    function forward(recId) {
        $("[name='projectId']").val(recId)
        forwardIndex =
            layer.open({
                type: 1,
                skin: 'layui-layer-molv',
                title: '任务转发',
                content: $("#forwardBox"),
                area: ['400px', '290px'],
                offset: '30%'
            })
    }


    function search(currentPage) {
        var corpNameInput = $("[name='key']");
        if(corpNameInput.val()) {
            corpNameInput.val(corpNameInput.val().trim());
        }
        var imgIndex = 1;
        $("#content").html("");
        //flow.load({
        //    elem: '#content' //指定列表容器
        //    ,done: function(page, next){ //到达临界点（默认滚动触发），触发下一页
        var lis = [];
        if(currentPage!=undefined && currentPage!=''){
            curr = currentPage;
        }
        $("[name=page]").val(curr);
        $("[name=size]").val(limit);

        getCurrentDate()

        $.post('bpu/project/getAllProject', $("#queryForm").serialize(), function (res) {
            //layui.each(res.data, function (index, item) {
            layui.each(res.data.taskList, function (index, item) {
                var stateTxt = "待审核";
                var stateClass = "layui-btn layui-btn-primary";
                var borderClass = 'border-orange';
                btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-orange layui-btn-sm btn-line-sm' >待审核</button>";
                //if (item.projectState === '4'){
                if (item.taskStateStr === '审核中'){
                    stateTxt = "审核中";
                    stateClass = "layui-btn layui-btn-primary btn-line-orange";
                    borderClass = 'border-orange'
                    btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-orange layui-btn-sm btn-line-sm' >审核中</button>";
                }

                if (res.data.empId == "") {//游客 （承接中、已完成、已结束）

                    // 待承接 任务状态 为 1 任务量 ！= 已分配的任务
                    // 承接结束 任务状态为1 且 ( 任务量 == 已分配任务 || 项目已停止 || 承接期限到期)
                    //if (item.projectState === '1' && item.ct != item.fp.replace('.0', '')) {
                    if (item.taskStateStr === '已发布') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-blue layui-btn-sm btn-line-sm' >已发布</button>";
                        stateTxt = "已发布";
                        stateClass = "layui-btn layui-btn-primary btn-line-blue";
                        borderClass = 'border-blue';
                    }
                    // if ((item.ct == item.fp.replace(".0", "") ||
                    //     item.is_stoped === '1' ||
                    //     isDoing(item.pickup_date)) && !isEnded(item.isEnd)) {
                    if (item.taskStateStr === '承接结束') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-gray layui-btn-sm btn-line-sm'>承接结束</button>";
                        stateTxt = "承接结束";
                        stateClass = "layui-btn layui-btn-primary btn-line-gray";
                        borderClass = 'border-gray'
                    }

                    if (item.taskStateStr === '任务结束') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-gray layui-btn-sm btn-line-sm' >任务结束</button>";
                        stateTxt = "任务结束";
                        stateClass = "layui-btn layui-btn-primary btn-line-gray";
                        borderClass = 'border-gray'
                    }

                } else if (res.data.identity == "自然人" || (res.data.identity_alias == "服务企业" && item.is_forward === '1')) {

                    // 服务方状态
                    // 待承接： projectState === '1' && item.ct !== item.fp
                    // 承接结束 projectState === '1' && (item.ct === item.fp || isDoing(item.pickup_date) === true || item.is_stoped === '1'
                    // 已拒接   item.projectState == '1' && item.state == '-1' && item.fwqyIds.indexOf(corpId) != -1)
                    // 已承接   item.projectState == '1' && item.state != '-1' && item.fwqyIds.indexOf(corpId) != -1)
                    // 任务结束 isEnded(endDate)

/*                    if (item.projectState === '1' && item.ct !== item.fp.replace(".0", "")) {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-orange layui-btn-sm btn-line-sm'    >待承接</button>";
                        stateTxt = "待承接";
                        stateClass = "layui-btn layui-btn-primary btn-line-orange";
                        borderClass = 'border-orange'
                    }*/

                    //if (res.data.identity_alias == "服务企业" && item.projectState === '1' && item.ct !== item.fp.replace(".0", "")) {
                        //if (item.ct !== item.fp.replace(".0", "")) {
                        if (item.taskStateStr === '已发布') {
                            btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-blue layui-btn-sm btn-line-sm' >已发布</button>";
                            stateTxt = "已发布";
                            stateClass = "layui-btn layui-btn-primary btn-line-blue";
                            borderClass = 'border-blue'
                        }
                    //}

                    // if ((item.ct == item.fp.replace(".0", "") ||
                    //     item.is_stoped === '1' ||
                    //     isDoing(item.pickup_date)) && !isEnded(item.isEnd)) {
                    if (item.taskStateStr === '承接结束') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-gray layui-btn-sm btn-line-sm'>承接结束</button>";
                        stateTxt = "承接结束";
                        stateClass = "layui-btn layui-btn-primary btn-line-gray";
                        borderClass = 'border-gray'
                    }


/*                    if (item.projectState == '1' && item.state != '-1' && item.empIds.indexOf('1755518769139102') != -1) {
                        btn = "<button type='button' class='layui-btn cj'    >已承接</button>";
                        stateTxt = "已承接";
                        stateClass = "layui-btn cj ";
                        borderClass = 'border-gray'
                    }
                    if (item.projectState == '1' && item.state == '-1' && item.empIds.indexOf('1755518769139102') != -1) {
                        btn = "<button type='button' class='layui-btn jj'    >已拒接</button>";
                        stateTxt = "已拒接";
                        stateClass = "layui-btn jj ";
                        borderClass = 'border-orange'
                    }*/

                    if (item.taskStateStr === '任务结束') {
                    // if (isEnded(item.endDate)) {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-gray layui-btn-sm btn-line-sm' >任务结束</button>";
                        stateTxt = "任务结束";
                        stateClass = "layui-btn layui-btn-primary btn-line-gray";
                        borderClass = 'border-gray'
                    }

                } else {   //需求企业、运营方 （审核中、承接中、已驳回、已完成、已结束）
                    // 待审核
                    // 审核中
                    // 已驳回
                    // 已发布
                    // 已停止
                    // 承接结束
                    // 任务结束


                    if (item.taskStateStr === '已过期') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-gray layui-btn-sm btn-line-sm'>已过期</button>";
                        stateTxt = "已过期";
                        stateClass = "layui-btn layui-btn-primary btn-line-gray";
                        borderClass = 'border-gray'
                    }

                    //if (item.projectState === '2') {
                    if (item.taskStateStr === '已驳回') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-orange layui-btn-sm btn-line-sm'>已驳回</button>";
                        stateTxt = "已驳回";
                        stateClass = "layui-btn layui-btn-primary btn-line-orange";
                        borderClass = 'border-orange'
                    }

                    //if (item.projectState == '1' && item.ct !== item.fp.replace(".0", "")) {
                    if (item.taskStateStr === '已发布') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-blue layui-btn-sm btn-line-sm' >已发布</button>";
                        stateTxt = "已发布";
                        stateClass = "layui-btn layui-btn-primary btn-line-blue";
                        borderClass = 'border-blue'
                    }

                    //if (item.is_stoped === '1') {
                    if (item.taskStateStr === '已停止') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-orange layui-btn-sm btn-line-sm'>已停止</button>";
                        stateTxt = "已停止";
                        stateClass = "layui-btn layui-btn-primary btn-line-orange";
                        borderClass = 'border-orange'
                    }

                    //if (item.isWithdraw === '1') {
                    if (item.taskStateStr === '已撤回') {
                        stateTxt = "已撤回";
                        stateClass = "layui-btn layui-btn-primary btn-line-orange";
                        borderClass = 'border-orange'
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-orange layui-btn-sm btn-line-sm'>已撤回</button>";
                    }

                    if (item.is_deleted === '1') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-red layui-btn-sm btn-line-sm'>已删除</button>";
                        stateTxt = "已删除";
                        stateClass = "layui-btn layui-btn-primary btn-line-red";
                        borderClass = 'border-red'
                    }

                    // if ((item.ct == item.fp.replace(".0", "") ||
                    //     isDoing(item.pickup_date)) && !isEnded(item.isEnd)) {
                    if (item.taskStateStr === '承接结束') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-gray layui-btn-sm btn-line-sm'>承接结束</button>";
                        stateTxt = "承接结束";
                        stateClass = "layui-btn layui-btn-primary btn-line-gray";
                        borderClass = 'border-gray'
                    }

                    //if (isEnded(item.endDate)) {
                    if (item.taskStateStr === '任务结束') {
                        btn = "<button type='button' class='layui-btn layui-btn-primary btn-line-gray layui-btn-sm btn-line-sm'>任务结束</button>";
                        stateTxt = "任务结束";
                        stateClass = "layui-btn layui-btn-primary btn-line-gray ";
                        borderClass = 'border-gray'
                    }

                }




                


                var ysNo = "";

                let forwardText = "";
                let shelterText = '登录后可见'
                if (item.forward == "1") {
                    forwardText = "已转发";
                }
                item.stateTxt = stateTxt;
                item.stateClass = stateClass;
                var html = "";
                // 判断是否承接结束 承接结束的任务显示任务结束日期
                let tdName = '任务结束'
                let tdVal = item.endDate
                if (!isDoing(item.pickup_date)) {
                    tdName = '承接期限'
                    if (item.openUndertakingPeriod === 'false') {
                        tdVal = shelterText
                    } else {
                    tdVal = checkPickupDate(item.projectState, item.pickup_date, item.pickup_type,newDate)
                    }
                }

                // 隐藏or公开订单金额
                let orderAmount
                if (item.openOrderAmount === 'false') {
                    orderAmount = shelterText
                } else {
                    orderAmount = fwjeVague(item.projectPrice * item.projectPlanNo)
                }

                // 隐藏or公开发布企业
                let publishingCorp
                if (item.openPublishingCorp === 'false') {
                    publishingCorp = shelterText
                } else {
                    publishingCorp = item.serviceProvider
                }

                // 隐藏或公开承接类型
                let contractingType
                if (item.openUndertakingType === 'false') {
                    contractingType = shelterText
                } else {
                    contractingType = corpProjectContractingType(item.contracting_type)
                }

                let areas = item.projectArea
                if (areas.split(",").length > 1) {
                    let areasTemp = areas.split(",")
                    areas = areasTemp[0] + " + " + (areasTemp.length - 1)
                }
                html = `<div class="project ${borderClass}" style="width: 610px; border-radius: 14px; margin: 0 0 20px;"  ${floatVal} data='${JSON.stringify(item)}'>

        <div class="project-detail">
            <header >
<p class="title">${item.projectTitle}</p>
                ${btn}
</header>
            <div class="project-info">
                <table>
                    <tr>
                        <td>任务区域</td>
                        <td style="width: 250px">${areas}</td>
                        <td>订单金额</td>
                        <td>${orderAmount}</td>
                    </tr>
                    <tr>
                        <td>${tdName}</td>
                        <td style="width: 250px">${tdVal}</td>
                        <td>发布日期</td>
                        <td>${item.beginDate}</td>
                    </tr>
                    <tr>
                        <td>发布企业</td>
                        <td style="width: 250px">${publishingCorp}</td>
                        <td>承接类型</td>
                        <td>${contractingType}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>`

                imgIndex++;
                if (imgIndex == 4) {
                    imgIndex = 1;
                }

                lis.push(html);
            });
            //next(lis.join(''), page < res.pages);
            $("#content").html(lis.join(''));

            laypage.render({
                elem: 'layPage'
                , count: res.count //数据总数，从服务端得到
                , limit: $("[name=size]").val()
                , curr: $("[name=page]").val()
                , layout: [/*'count', */'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                , jump: function (obj, first) {
                    if (!first) {
                        limit = obj.limit
                        curr = obj.curr
                        search();
                    }
                }
            });

        }, "json");

        //}
        //});
    }


    /*区域选择*/
    function selArea() {
        layIndex = layer.open({
            type: 2,
            title: '区域选择',
            skin: 'layui-layer-molv',
            offset: "20%",
            /* area: ['60%','60%'],
            content:'mobile/select/selectArea.jsp?select=radio' */
            area: ['940px', '400px'],
            // content: 'select/selAreas.html'
            content: 'select/selectAreasNew.html'

        })
    }

    function setAreaInfo(adcode, name) {
        $("#queryForm [name='projectArea']").val(name);
        $("#queryForm [name='projectAdcodeList']").val(adcode);
        search();
    }


    function setValueArea(id, name) {
        $("#queryForm [name='projectArea']").val(name);
        $("#queryForm [name='areaId']").val(id);
        search();
    }

    function clearArea() {
        $("#queryForm [name='projectArea']").val("");
        $("#queryForm [name='areaId']").val("");
        layer.close(layIndex);
        search();
    }


    function ysNo() {
        $.post("bpu/project/ysNo", function (d) {
            layui.each(d, function (index, item) {
                if (item.ysNo != "0") {
                    $("#" + item.tabName + ">font").html("<span class='layui-badge'>" + item.ysNo + "</span>");
                } else {
                    $("#" + item.tabName + ">font").html("");
                }
            })
        }, 'json')
    }


    function unreadCount() {
        $.post("msg/unreadCount", function (res) {
            if (res != "0") {  //有未读消息
                $("#bar1 span").css("display", "inline-block");
                if (res >= 99) {
                    $("#bar1 span").html("99");
                    $("#bar1 span").css("padding-left", "3px");
                    $("#bar1 span").css("padding-right", "3px");
                } else if (res >= 10) {
                    $("#bar1 span").html(res);
                    $("#bar1 span").css("padding-left", "3px");
                    $("#bar1 span").css("padding-right", "3px");
                } else {
                    $("#bar1 span").html(res);
                    $("#bar1 span").css("padding-left", "6px");
                    $("#bar1 span").css("padding-right", "6px");
                }
            } else {
                $("#bar1 span").css("display", "none");
            }
        })
    }

    function updEndDate(recId, oldDate, lastState) {
        var updDate = $("#updDate").val();
        if (updDate == "") {
            layer.msg("任务结束日期不能为空！", {icon: 0, offset: "40%", time: 1500});
        } else {
            if (oldDate == updDate) {
                layer.msg("修改后的日期必须大于原结束日期！", {icon: 0, offset: "40%", time: 1500});
            } else {
                loadIndex = layer.load();
                $.post("bpu/project/updEndDate", {
                    recId: recId,
                    oldDate: oldDate,
                    newDate: updDate,
                    lastState: lastState
                }, function () {
                    layer.close(loadIndex);
                    layer.msg("修改成功", {icon: 6, offset: "40%", time: 1500});
                    setTimeout(function () {
                        location.reload();
                    }, 1500)
                })
            }
        }
    }

</script>
</html>
