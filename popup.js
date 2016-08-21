var dashboard = {};
var tpeexport = '';

chrome.storage.onChanged.addListener( function (changes) {
  for (var key in changes) {
    if (key === 'dash_popup') {
      _dashboard();
      console.log('saved!');
    }
  }
});

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  if (request.msg == 'status') {
    console.log('Updating Page ' + request.page + ' . . .');
    sendResponse({msg: 'Status received!'});
  }
  if (request.msg == 'update') {
    _tpe();
    sendResponse({msg: 'Update received!'});
  }
});

document.addEventListener('DOMContentLoaded', function () {
  _dashboard();
  _get_dashboard();
});

_tpe();

$('html').on('click', '.dashboard, .all, .breakdown', function() {
    if (!$(this).hasClass('active')) {
    var classis = $(this).prop('class');
    
    $('.dashboard, .all, .breakdown').removeClass('active');
    $(this).addClass('active');
	$('.navi').removeClass('hidden').addClass('hidden');
    $('.navi-' + classis).removeClass('hidden');
    }
});

$('html').on('click', '.sync-todays', function() {
  chrome.runtime.sendMessage({msg: 'sync'}, function (response) {
    console.log(response);
  });
});

$('html').on('click', '.export-todays', function() {
  _clip(tpeexport);
});


function _tpe () {
  var html1 = '', html2 = '', c1 = 0, c2 = 0, tpe = 0;

  chrome.storage.local.get('__hits', function (data) {
    var h1 = data.__hits, h2 = {};

    for (var a in h1) {
      if (h1[a].status.match(/(Submitted|Paid|Approved|Pending)/)) {
        var b = h1[a].reqid;
        
        if (!h2[b]) {
          h2[b] = {
            reqname : h1[a].reqname,
            hits   : 1,
            reward : Number(h1[a].reward.replace(/[^0-9.]/g, ''))
          };
        }
        else {
          h2[b].hits   += 1;
          h2[b].reward += Number(h1[a].reward.replace(/[^0-9.]/g, ''));
        }
        c1 ++;
        tpe += Number(h1[a].reward.replace(/[^0-9.]/g, ''));
      }
    }

    var s1 = Object.keys(h1).sort( function (a, b) {
      return h1[a].viewed - h1[b].viewed;
    });

    var s2 = Object.keys(h2).sort( function(a, b) {
      return h2[a].reward - h2[b].reward;
    });

    for (var i = 0; i < s1.length; i ++) {
      var k1 = s1[i], color = '', source = '', autoapp = '', pend = false;
      
      if (h1[k1].status.match(/Paid|Approved/)) {
        color = 'green';
      }
      else if (h1[k1].status.match(/Pending|Submitted/)) {
        color = 'orange'; pend = true;
      }
      else if (h1[k1].status.match(/Rejected/)) {
        color = 'red';
      }
      if (h1[k1].source) {
        source = '<a href="' + h1[k1].source + '" target="_blank" style="text-decoration: none;"><span class="glyphicon glyphicon-new-window" aria-hidden="true"></span></a> ';
      }
      if (pend) {
        if (h1[k1].autoapp && h1[k1].submitted) {
          autoapp = _time_til_aa(h1[k1].autoapp, h1[k1].submitted);
        }
        else {
          autoapp = 'There is no AA data for this HIT.';
        }
      }
      
     html1 +=
      '<tr>' +
        '  <td><div>' + source + h1[k1].reqname +'</div></td>' +
        '  <td>' + h1[k1].title + '</td>' +
        '  <td style="width: 70px;">' + h1[k1].reward + '</td>' +
        '  <td style="width: 70px; color: ' + color + '; cursor: context-menu;" data-toggle="tooltip" data-placement="left" title="' + autoapp + '">' + h1[k1].status.split(/\s/)[0] + '</td>' +
        '</tr>'
      ;
      c2 ++;
    }

    tpeexport  = '[b]Today\'s Projected Earnings: $' + tpe.toFixed(2) + '[/b] (Exported from Turk+)\n';
    tpeexport += '[spoiler=Today\'s Projected Earnings Full Details][table][tr][th][b]Requester[/b][/th][th][b]HITs[/b][/th][th][b]Projected[/b][/th][/tr]';
    
    for (var j = s2.length - 1; j > -1; j --) {
      var k2 = s2[j];

      html2 +=
        '<tr>' +
        '  <td>' + h2[k2].reqname + '</td>' +
        '  <td style="width: 50px; text-align: right;">' + h2[k2].hits + '</td>' +
        '  <td style="width: 50px; text-align: right;">$' + h2[k2].reward.toFixed(2) + '</td>' +
        '</tr>'
      ;
      
      tpeexport +=
        '[tr]' +
        '  [td]' +
        '    [url=https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=' + k2 + ']' + h2[k2].req + '[/url]' +
        '  [/td]' +
        '  [td]' + h2[k2].hits  + '[/td]' +
        '  [td]$' + h2[k2].reward.toFixed(2) +'[/td]' +
        '[/tr]\n'
      ;
    }

    $('#all').html(html1);
    $('#breakdown').html(html2);
    $('[data-toggle="tooltip"]').tooltip();
  });
}

function _dashboard () {
  chrome.storage.local.get('dash_popup', function (data) {
    dashboard = data.dash_popup || {};
    
    for (var a in dashboard) {
      if (dashboard.hasOwnProperty(a)) {
        $('.dash').eq(a).html(dashboard[a]);
      }
    }
  });
}

function _get_dashboard () {
  $.get('https://www.mturk.com/mturk/dashboard', function (data) {
    var _ = $(data);
    var err = _.find('.error_title:contains(You have exceeded the maximum allowed page request rate for this website.)').length;

    if (err) {
      setTimeout(function () { _get_dashboard(); }, 3000);
    }
    else {
      var aa = 4, bb = 5, $elem = _.find('a[href^="/mturk/statusdetail?encodedDate"]').parents('tr');

      var dash_popup = {
        // Total Earnings
        0 : _.find('#approved_hits_earnings_amount').text(),
        1 : _.find('#bonus_earnings_amount'        ).text(),
        2 : _.find('#total_earnings_amount'        ).text(),
        3 : _.find('#transfer_earnings'            ).text(),
        
        // HIT Totals
        4 : _.find('td.metrics-table-first-value:contains(HITs Submitted)').next().text(),
        5 : _.find('td.metrics-table-first-value:contains(... Approved)'  ).next().text(),
        6 : _.find('td.metrics-table-first-value:contains(... Rejected)'  ).next().text(),
        9 : _.find('td.metrics-table-first-value:contains(... Pending)'   ).next().text(),
        7 : _.find('td.metrics-table-first-value:contains(... Approved)'  ).next().next().text(),
        8 : _.find('td.metrics-table-first-value:contains(... Rejected)'  ).next().next().text(),
      };
      
      // HIT Status
      for (var i = 10; i < ($elem.length * 5) + 10; i ++) { 
        var cc = ++ bb % 6;
        dash_popup[i] = $elem.eq(aa).children().eq(cc).text().trim();
        aa = cc === 5 ? aa - 1 : aa; 
      }

      chrome.storage.local.set({'dash_popup': dash_popup});
    }
  });
}

function _time_til_aa (aa, sub) {
  var willapp = 'This HIT will approve in ';
  var autoapp = Number(aa);
  var submit  = Number(sub);
  var current = new Date().getTime() / 1000;
  var remain  = Math.round(submit + autoapp - current);

  if (remain > 0) {
    var dd = Math.floor((remain / (60 * 60 * 24)));
    var hh = Math.floor((remain / (60 * 60)) % 24);
    var mm = Math.floor((remain / (60)) % 60);
    var ss = remain % 60;
        
    willapp +=
      (dd === 0 ? '' : dd + (dd > 1 ? ' days '    : ' day '))    +
      (hh === 0 ? '' : hh + (hh > 1 ? ' hours '   : ' hour '))   +
      (mm === 0 ? '' : mm + (mm > 1 ? ' minutes ' : ' minute ')) +
      (ss === 0 ? '' : ss + (ss > 1 ? ' seconds ' : ' second '))
    ;
  }
  else {
    willapp = "This HIT should be approved.";
  }
  return willapp;
}

function _clip (text) {
  var input = document.createElement('input');
  //input.style.position = 'fixed';
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
}