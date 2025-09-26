function loadLocalPicture(pictures) {
  var imgHtml = "";
  if (pictures && pictures != "") {
    pictures = pictures.split(";");
    for (var i = 0; i < pictures.length; i++) {
      if (pictures[i] != "") {
        imgHtml +=
          "<div style='float:left;padding:3px;position:relative;width:31%;height:80px'>" +
          "<img class='myImg' src='" +
          pictures[i] +
          "' width='100%'  height='100%'><img style='display:none' src='" +
          pictures[i] +
          "'></div>";

        //imgHtml+="<div style='float:left;padding:3px;position:relative'><input type='hidden' name='pictures' value='"+pictures[i]+
        //"' ><img class='myImg' src='"+pictures[i]+"'  height='70px'></div>";
      }
    }
  }
  return imgHtml;
}

function returnDys(tabName, id) {
  console.log(tabName);
  loadIndex = layer.load();
  $.post(
    "projectJs/returnDys",
    { tabName: tabName, id: id },
    function (data, state) {
      layer.close(loadIndex);
      setTimeout(function () {
        location.reload();
        parent.search();
      }, 1000);
    }
  );
}

function returnCh(tabName, id) {
  loadIndex = layer.load();
  $.post(
    "../projectJs/returnCh",
    { tabName: tabName, id: id },
    function (data, state) {
      layer.close(loadIndex);
      setTimeout(function () {
        parent.location.reload();
        parent.layer.close(parent.layer.getFrameIndex(window.name));
      }, 1000);
    }
  );
}

function dbxz() {
  if (appendixs == "") {
    layer.msg("暂无附件！", { icon: 0, time: 1500 });
    return false;
  }
  downForm.action =
    "oss/oss_zip?appendixs=" + appendixs + "&fileNames=" + fileNames;
  downForm.target = document.getElementsByName("downFrame")[0];
  downForm.submit();
}
//日期
function rq(time) {
  time = time.replace(/-/g, "/"); //先转格式
  var data = new Date(time);
  var diff = new Date(data.getTime()); //最后获取毫秒
  var newTime = diff.toLocaleString("zh", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  newTime = newTime.replaceAll("/", "-");
  return newTime;
}
//日期时间
function rqsj(time) {
  time = time.replace(/-/g, "/"); //先转格式
  var data = new Date(time);
  var diff = new Date(data.getTime()); //最后获取毫秒
  var newTime = diff.toLocaleString("zh", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  newTime = newTime.replaceAll("/", "-");
  newTime = newTime.substring(0, newTime.length - 3);
  return newTime;
}

function baseYsInfo(item) {
  let pjString = "";
  pjString +=
    "</td> " +
    "</tr>" +
    "<tr>" +
    "<td><label class='layui-form-label'>验收企业</label></td>" +
    "<td style='width:33.2%'><input class='layui-input' readonly='readonly' value='" +
    item.ysCorp +
    "'></td></tr>" +
    "<tr>" +
    "<td><label class='layui-form-label'>验收日期</label></td>" +
    "<td style='width:33.2%'><input name='ysDate' class='layui-input'  readonly='readonly'   value='" +
    item.ysDate +
    "'></td>" +
    "</tr>";

  if (strIsNotEmpty(item.rebut_reason)) {
    pjString +=
      "<tr>" +
      "<td><label class='layui-form-label'>驳回原因</label></td>" +
      "<td style='width:33.2%'><input  class='layui-input'  readonly='readonly' value='" +
      item.rebut_reason +
      "'></td>" +
      "</tr>";
  }
  return pjString;
}

function sortField(fieldNames, fills, way) {
  let data = {};
  data.fieldNames = fieldNames;
  data.fills = fills;
  let sexIndex = fieldNames.length > 0 ? fieldNames.indexOf("性别") : -1;
  if (way == "实名调查" && sexIndex != -1) {
    let sexFill = fills[sexIndex];
    fieldNames.splice(sexIndex, 1);
    fills.splice(sexIndex, 1);
    let newFieldNames = fieldNames;
    let newFills = fills;
    newFieldNames.unshift("性别");
    newFills.unshift(sexFill);
    data.fieldNames = newFieldNames;
    data.fills = newFills;
  }
  return data;
}
