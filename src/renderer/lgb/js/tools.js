function checkPickupDate(state, pickDate, pickType, newDate) {
  // 0 待审核 1 审核通过 2 拒绝 3 任务结束
  // 0， 2 审核结束后x天内
  // 1 距承接结束xx天
  // 3 结束日期
  if (state == "1" || state == "3") {
    let str = "任务结束前";
    if (pickDate && pickDate !== "null") {
      pickDate = pickDate.replace(/-/g, "/");
      let addDate = getNowDateTimeTwo(newDate); //当前时间
      addDate = addDate.replace(/-/g, "/"); //格式转换
      let pickup = new Date(pickDate);
      let date = new Date(addDate);
      let diff = new Date(pickup.getTime() - date.getTime()); //3
      var days = Math.floor(diff / 1000 / 60 / 60 / 24); // 从这里开始
      var daysmod = diff - days * 24 * 60 * 60 * 1000;
      var hours = Math.floor(daysmod / 1000 / 60 / 60);
      var hoursmod = diff - days * 24 * 60 * 60 * 1000 - hours * 1000 * 60 * 60;
      var minutes = Math.floor(hoursmod / 1000 / 60);
      var minutesmod =
        diff -
        days * 24 * 60 * 60 * 1000 -
        hours * 1000 * 60 * 60 -
        minutes * 1000 * 60;
      var seconds = Math.floor(minutesmod / 1000); // 到这里结束，是将总毫秒转化成对应天数+小时数+分钟数+秒数的转换方法

      if (diff < 0) {
        return pickDate;
      } else {
        str = `剩余 ${days}天 ${hours}小时${minutes}分`;
      }
    }
    return str;
  } else if (state == "0" || state == "4" || state == "2") {
    return formatPickupDate(pickType);
  } else {
    return pickDate == "null" ? "任务结束前" : pickDate;
  }
}

function isEnded(endDate) {
  if (!endDate || endDate === "null") {
    return false;
  }
  const now = new Date();
  const currentEndDate = new Date(endDate + " 23:59:59");
  const diff = currentEndDate.getTime() - now.getTime();
  return diff < 0;
}

// 判断承接期限是否结束
function isPickupEnd(pickDate) {
  if (!pickDate || pickDate === "" || pickDate === " " || pickDate === "null") {
    return true;
  }
  let date = new Date();
  let pickup = new Date(pickDate);
  let diff = new Date(pickup.getTime() - date.getTime());
  return diff.getTime() < 0;
}

/**
 *
 * @param pickDate
 * @returns {boolean} true 实施中 false 待承接
 */
function isDoing(pickDate) {
  if (
    !pickDate ||
    pickDate == "" ||
    pickDate === "null" ||
    pickDate == " " ||
    pickDate == undefined ||
    pickDate == 0
  ) {
    return false;
  }
  let date = new Date();
  let pickup = new Date(pickDate);
  let diff = pickup.getTime() - date.getTime();
  // < 0  承接结束 > 0 承接中
  return diff < 0;
}

function formatPickupDate(type) {
  let font = "";
  switch (type) {
    case "1":
    case 1:
      font = "一";
      break;
    case "2":
    case 2:
      font = "二";
      break;
    case "3":
    case 3:
      font = "三";
      break;
    case "5":
    case 5:
      font = "五";
      break;
    case "7":
    case 7:
      font = "七";
      break;
    case "15":
    case 15:
      font = "十五";
      break;
    default:
      return "任务结束前";
  }
  return `发布${font}天内`;
}

function getCurrentDate() {
  $.get("project/currentTime", function (res) {
    newDate = res.data;
  });
}

function getDaysBetween(startDate, enDate) {
  const sDate = Date.parse(startDate);
  const eDate = Date.parse(enDate);
  if (sDate > eDate) {
    return 0;
  }
  if (sDate === eDate) {
    return 1;
  }
  const days = (eDate - sDate) / (24 * 60 * 60 * 1000);
  return days;
}

function clearSearch() {
  $('[name="projectArea"]').val("");
  $('[name="projectAdcodeList"]').val("");
  $('[name="bearCost"]').val("");
  $('[name="projectState"]').val("");
  $('[name="category"]').val("");
  $('[name="taskMode"]').val("");
  $('select[name="taskMode"]').empty();
  $('select[name="taskMode"]').append('<option value="">任务模式</option>');
  $('[name="projectTitle"]').val("");
  $('[name="coNeed"]').val("");
  $('[name="underTakeCorpName"]').val("");
  $("#selectDate").val("");
  $("#selectEndDate").val("");
  $('[name="contractingType').val("");
  $('[name="projectType').val("");
  $('[name="key').val("");
  $('[name="demandCorpName').val("");
  $('[name="contractorCorpName').val("");
  $('[name="subcontractCorpName').val("");
  $('[name="serviceCorpName').val("");
  $('[name="upstreamEnterprise').val("");
  $('[name="serviceProvider').val("");
  $('[name="serviceEnterprise').val("");
  $('[name="enterpriseStatus').val("");
  $('[name="handlerUser').val("");
  $('[name="payMethod').val("");
  $("[name=is_read]").val("");
  $("[name=serviceParty]").val("");
  $("[name='downstreamSignStatus']").val("");
  $("[name='signType']").val("");
  $("[name='productionEnterprises']").val("");
  $("[name='inviteEnterprise']").val("");
  $("[name='recheck']").val("");
  if (form) {
    form.val({
      contractingType: "",
      projectType: "",
      bearCost: "",
      category: "",
      enterpriseStatus: "",
      recheck: "",
    });
    form.render();
  }
}
