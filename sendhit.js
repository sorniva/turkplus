document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementsByClassName('popup-header').length) {
    _send_hit();
  }
});

var timeis = Date.now();

function _send_hit () {  
  var reqname  = document.getElementsByName('prevRequester').length ? document.getElementsByName('prevRequester')[0].value : null;
  var reqid    = document.getElementsByName('requesterId').length ? document.getElementsByName('requesterId')[0].value : req;
  var title    = document.getElementsByClassName('capsulelink_bold').length ? document.getElementsByClassName('capsulelink_bold')[0].textContent.trim() : null;
  var reward   = document.getElementsByName('prevReward').length ? document.getElementsByName('prevReward')[0].value.replace(/USD/, '$') : null;
  var autoapp  = document.getElementsByName('hitAutoAppDelayInSeconds').length ? document.getElementsByName('hitAutoAppDelayInSeconds')[0].value : null;
  
  var hitid    = document.querySelectorAll('[class="popup-header"] > [name="hitId"]')[0].value;
  var assignid = document.querySelectorAll('[class="popup-header"] > [name="assignmentId"]')[0].value;
  var state    = document.querySelectorAll('[class="popup-header"] > [name="isAccepted"]')[0].value === 'true' ? 'Accepted' : 'Previewed';

  var timer    = document.getElementById('theTime').textContent.trim();
  var accepted = _accepted_when(timer);
  var date     = _amz_date(accepted);

  var src = document.querySelectorAll('iframe').length ? document.querySelectorAll('iframe')[0].src : null;

  var data = {
    idx      : 9999,
    req      : reqname,
    reqid    : reqid,
    title    : title,
    reward   : reward,
    hitid    : hitid,
    assignid : assignid,
    status   : state,
    date     : date,
    src      : src, 
    aa       : autoapp,
    sub      : null
  };

  chrome.runtime.sendMessage({msg: 'hit', data: data}, function (response) {
    console.log(response.msg);
    console.log(response.data);
  });
}

// Get the date string for when the HIT was accepted
function _accepted_when (time) {
  var split   = time.split(/:| /);
  var days    = 0;
  var hours   = 0;
  var minutes = 0;
  var seconds = 0;
  var milli   = 0;
  if (split.length == 3) {
    hours   = parseInt(split[0], 10);
    minutes = parseInt(split[1], 10);
    seconds = parseInt(split[2], 10);
  }
  if (split.length == 4) {
    days    = parseInt(split[0], 10);
    hours   = parseInt(split[1], 10);
    minutes = parseInt(split[2], 10);
    seconds = parseInt(split[3], 10);
  }
  milli = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  return timeis - milli;
}

// Get the date in PST
function _amz_date (time) {
  var given    = new Date(time);
  var utc      = given.getTime() + (given.getTimezoneOffset() * 60000);
  var offset   = _dst() === true ? '-7' : '-8';
  var amz      = new Date(utc + (3600000 * offset));
  var day      = (amz.getDate()) < 10 ? '0' + (amz.getDate()).toString() : (amz.getDate()).toString();
  var month    = (amz.getMonth() + 1) < 10 ? '0' + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
  var year     = (amz.getFullYear()).toString();
  return month + day + year;
}

// Check if DST
function _dst () {
  var today = new Date();
  var year  = today.getFullYear();
  var start = new Date('March 14, ' + year + ' 02:00:00');
  var end   = new Date('November 07, ' + year + ' 02:00:00');
  var day   = start.getDay();
  start.setDate(14 - day);
  day   = end.getDay();
  end.setDate(7 - day);
  return (today >= start && today < end) ? true : false;
}