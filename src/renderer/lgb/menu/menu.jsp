






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
