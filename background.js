var __hits  = {};
var __dates = {};
var requests = {};
var _hits = {};


chrome.storage.local.get('storage', function (data) {
    var storage = data.storage || {};
    __hits = storage.hits || {};
    __dates = storage.dates || {};;
    
    
    
    
    console.log(__hits);
    console.log(__dates);
    
    _loaded();
    //_update();
});


function _update () {
    var a = 0, b = 0;
    
    _get_dates();
    function _get_dates () {
        $.get('https://www.mturk.com/mturk/status', function (data) {
            var dates = $(data).find('a[href^="/mturk/statusdetail?encodedDate="]');
            for (var i = 0; i < dates.length; i ++) { 
                var date = dates.eq(i).prop('href').split('encodedDate=')[1];
                if (!__dates[date]) {
                    __dates[date] = false;
                }
            }
            chrome.storage.local.set({'storage': {hits: __hits, dates: __dates}});
        });
    }
}                         
                                                

function _loaded () {
chrome.storage.local.get('_hits', function (data) {
	_hits = data._hits || {};

	_update_tpe();

	// Listens for POST (before) requests to https://www.mturk.com/mturk/externalSubmit
	chrome.webRequest.onBeforeRequest.addListener( function (data) {
		if (data.method == 'POST') {
			requests[data.requestId] = {
				hitid    :  data.requestBody.formData.hitId       ? data.requestBody.formData.hitId[0]        : null,
				assignid : data.requestBody.formData.assignmentId ? data.requestBody.formData.assignmentId[0] : null,
			};
		}
	}, { urls: ['https://www.mturk.com/mturk/externalSubmit'] }, ['requestBody']);

	// Listens for POST (after) requests to https://www.mturk.com/mturk/externalSubmit
	chrome.webRequest.onCompleted.addListener( function (data) {
		if (data.method == 'POST' && data.statusCode == '200') {

			if (requests[data.requestId].hitid) {
				var key = requests[data.requestId].hitid;
				_hits[key].status = 'Submitted';
			}
			else {
				for (var key in _hits) {
					if (_hits[key].assignid === requests[data.requestId].assignid) {
						_hits[key].status = 'Submitted';
					}
				}
			}
			_update_tpe();
		}
	}, { urls: ['https://www.mturk.com/mturk/externalSubmit'] }, ['responseHeaders']);

    // Listens for messages from content scripts.
    chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
        if (request.msg == 'hit') {
            _add_hit(request.data);
            sendResponse({msg: 'Received HIT!', data: _hits[request.data.hitid]});
        }
        if (request.msg == 'sync') {
            _status_detail(sender.id);
            
            sendResponse({msg: 'Syncing now!'});
		}
    });

});
}

// Adds a HIT to the log
function _add_hit (data) {
	if (!_hits[data.hitid]) {
		_hits[data.hitid] = {
            idx      : data.idx,
			req      : data.req,
			title    : data.title,
			reward   : data.reward,
			status   : data.status,
			reqid    : data.reqid,
			hitid    : data.hitid,
			assignid : data.assignid,
			date     : data.date,
            src      : data.src
		};
		chrome.storage.local.set({'_hits': _hits});
	}
}

// Updates the TPE and removes old HITs from previous day
function _update_tpe () {
	var tpe = 0;
	var date = _amz_date(Date.now());

	for (var key in _hits) {
		if (date !== _hits[key].date) {
			delete _hits[key];
		}
        else if (!_hits[key].status.match(/(Rejected|Accepted|Previewed)/)) {
			tpe += Number(_hits[key].reward.replace(/[^0-9.]/g, ''));
		}
	}

	chrome.storage.local.set({'tpe': tpe});
	chrome.storage.local.set({'_hits': _hits});
}

// Syncs the status detail pages with the log
function _status_detail (tab) {
	var date = _amz_date(Date.now());
    var idx = 0;
    
	_scrape(1);

	function _scrape (page) {
		$.get('https://www.mturk.com/mturk/statusdetail?encodedDate=' + date + '&pageNumber=' + page, function (data) {
			var _ = $(data);
			var url   = _.find('a:contains(Next)') .eq(0) .prop('href');
			var err   = _.find('td[class="error_title"]:contains(You have exceeded the maximum allowed page request rate for this website.)') .length;
			var act   = _.find('td:contains(You have no HIT activity on this day matching the selected status.)') .length;
			var $hits = _.find('table[id="dailyActivityTable"]') .find('tr[valign="top"]');

			if ($hits .length) {
				for (var i = 0; i < $hits.length; i++) {
                    idx ++;
					var req    = $hits .eq(i) .find('td[class="statusdetailRequesterColumnValue"]') .text() .trim();
					var title  = $hits .eq(i) .find('td[class="statusdetailTitleColumnValue"]')     .text() .trim();
					var reward = $hits .eq(i) .find('td[class="statusdetailAmountColumnValue"]')    .text() .trim();
					var status = $hits .eq(i) .find('td[class="statusdetailStatusColumnValue"]')    .text() .trim();
					var reqid  = $hits .eq(i) .find('a') .prop('href') .split('requesterId=')[1] .split("&")[0];
					var hitid  = $hits .eq(i) .find('a') .prop('href') .split("HIT+")[1];

					if (!_hits[hitid]) {
						_hits[hitid] = {
                            idx      : idx,
							req      : req,
							title    : title,
							reward   : reward,
							status   : status,
							reqid    : reqid,
							hitid    : hitid,
							assignid : 'N/A',
							date     : date,
                            src      : null
						};
					}
					else {
                        _hits[hitid].idx    = idx;
						_hits[hitid].req    = req;
						_hits[hitid].title  = title;
						_hits[hitid].reward = reward;
						_hits[hitid].status = status;
						_hits[hitid].reqid  = reqid;
						_hits[hitid].hitid  = hitid;

						_hits[hitid].date   = date;
					}
				}
				if (url) {
					page ++;
					_scrape(page);
                    //chrome.tabs.sendMessage(tab, {msg: 'status', page: page});
                    chrome.runtime.sendMessage(tab, {msg: 'status'}, function (response) {
                        console.log(response);
                    });
				}
				else {
					_update_tpe();
					chrome.storage.local.set({'_hits': _hits});
					//chrome.tabs.sendMessage(tab, {msg: 'update'});
                    chrome.runtime.sendMessage(tab, {msg: 'update'}, function (response) {
                        console.log(response);
                    });
				}
			}
			else if (err) {
				setTimeout(function () { _scrape(page); }, 2000);
			}
			else if (act) {
				_hits = {};
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