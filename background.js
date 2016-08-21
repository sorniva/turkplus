var __hits  = {};
var requests = {};

chrome.storage.local.get('__hits', function (data) {
  __hits = data.__hits || {};

  _update_tpe();

  // Listens for POST (before) requests to https://www.mturk.com/mturk/externalSubmit
  chrome.webRequest.onBeforeRequest.addListener( function (data) {
    if (data.method == 'POST') {
      requests[data.requestId] = {
        hitid    :  data.requestBody.formData.hitId ? data.requestBody.formData.hitId[0] : null,
        assignid : data.requestBody.formData.assignmentId ? data.requestBody.formData.assignmentId[0] : null
      };
    }
  }, { urls: ['https://www.mturk.com/mturk/externalSubmit'] }, ['requestBody']);

  // Listens for POST (after) requests to https://www.mturk.com/mturk/externalSubmit
  chrome.webRequest.onCompleted.addListener( function (data) {
    if (data.method == 'POST' && data.statusCode == '200') {
      var sub = new Date().getTime() / 1000;
      if (requests[data.requestId].hitid) {
        var key = requests[data.requestId].hitid;
        __hits[key].status = 'Submitted';
        __hits[key].sub    = sub;
      }
      else {
        for (var key in __hits) {
          if (__hits[key].assignid === requests[data.requestId].assignid) {
            __hits[key].status = 'Submitted';
            __hits[key].sub    = sub;
          }
        }
      }
      _update_tpe();
    }
  }, { urls: ['https://www.mturk.com/mturk/externalSubmit'] }, ['responseHeaders']);

  // Listens for messages from content scripts.
  chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    if (request.msg == 'hit') {
      _new_hit(request.data);
      sendResponse({msg: 'Received HIT!', data: __hits[request.data.hitid]});
    }
    if (request.msg == 'sync') {
      _status_detail(sender.id);
      sendResponse({msg: 'Syncing now!'});
    }
  });
    
});

// date, title, reward, requestername, requesterid, status
function _new_hit (data) {
  // Check if HIT exists in daily HITs
  if (!__hits[data.hitid]) {
    __hits[data.hitid] = {
      reqname   : data.reqname,
      reqid     : data.reqid,
      title     : data.title,
      reward    : data.reward,
      autoapp   : data.autoapp,
      status    : data.status,
      
      hitid     : data.hitid,
      assignid  : data.assignid,
      
      source    : data.source,
      
      date      : data.date,
      viewed    : data.viewed,
      submitted : data.submitted
    };
    chrome.storage.local.set({'__hits': __hits});
  }
  // Check if HIT exists in HITs indexeddb
}

// Updates the TPE and removes old HITs from previous day
function _update_tpe () {
  var tpe = 0;
  var date = _amz_date(Date.now());

  for (var key in __hits) {
    if (date !== __hits[key].date) {
      delete __hits[key];
    }
    else if (!__hits[key].status.match(/(Rejected|Accepted|Previewed|Returned)/)) {
      tpe += Number(__hits[key].reward.replace(/[^0-9.]/g, ''));
    }
  }

  chrome.storage.local.set({'tpe': tpe});
  chrome.storage.local.set({'__hits': __hits});
}

// Syncs the status detail pages with the log
function _status_detail (tab) {
  var date = _amz_date(Date.now());
    
  _scrape(1);

  function _scrape (page) {
    $.get('https://www.mturk.com/mturk/statusdetail?encodedDate=' + date + '&pageNumber=' + page, function (data) {
      var _ = $(data);
      var url   = _.find('a:contains(Next)').eq(0).prop('href');
      var err   = _.find('td[class="error_title"]:contains(You have exceeded the maximum allowed page request rate for this website.)').length;
      var act   = _.find('td:contains(You have no HIT activity on this day matching the selected status.)').length;
      var $hits = _.find('table[id="dailyActivityTable"]').find('tr[valign="top"]');

      if ($hits.length) {
        for (var i = 0; i < $hits.length; i++) {
          var reqname = $hits.eq(i).find('td[class="statusdetailRequesterColumnValue"]').text().trim();
          var reqid   = $hits.eq(i).find('a').prop('href').split('requesterId=')[1].split('&')[0];
          var title   = $hits.eq(i).find('td[class="statusdetailTitleColumnValue"]').text().trim();
          var reward  = $hits.eq(i).find('td[class="statusdetailAmountColumnValue"]').text().trim();
          var status  = $hits.eq(i).find('td[class="statusdetailStatusColumnValue"]').text().trim();
			
          var hitid   = $hits.eq(i).find('a').prop('href').split('HIT+')[1];

          if (!__hits[hitid]) {
            __hits[hitid] = {
              reqname   : reqname,
              reqid     : reqid,
              title     : title,
              reward    : reward,
              autoapp   : null,
              status    : status,
							
              hitid     : hitid,
              assignid  : null,
		
              source    : null,
              
              date      : date,
              viewed    : new Date().getTime(),          
              submitted : null
            };
          }
          else {
            __hits[hitid].reqname = reqname;
            __hits[hitid].reqid   = reqid;
            __hits[hitid].title   = title;
            __hits[hitid].reward  = reward;
            __hits[hitid].status  = status;
            __hits[hitid].date    = date;
          }
        }
        if (url) {
          page ++;
          _scrape(page);
          chrome.runtime.sendMessage(tab, {msg: 'status'}, function (response) {
            console.log(response);
          });
        }
        else {
          _update_tpe();
          chrome.storage.local.set({'__hits': __hits});
          chrome.runtime.sendMessage(tab, {msg: 'update'}, function (response) {
            console.log(response);
          });
        }
      }
      else if (err) {
        setTimeout(function () { _scrape(page); }, 2000);
      }
      else if (act) {
        __hits = {};
        _update_tpe();
      }
    });
  }
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
  var today     = new Date();
  var year      = today.getFullYear();
  var dst_start = new Date('March 14, ' + year + ' 02:00:00');
  var dst_end   = new Date('November 07, ' + year + ' 02:00:00');
  var day       = dst_start.getDay();
  dst_start.setDate(14 - day);
  day = dst_end.getDay();
  dst_end.setDate(7 - day);
  return (today >= dst_start && today < dst_end) ? true : false;
}