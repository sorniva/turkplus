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

$('html').on('click', '.hitsall', function() {
  $('#show').text('All');
  $('.allhits').removeClass('hidden');
});

$('html').on('click', '.hitsrej', function() {
  $('#show').text('Rejected');
  $('.allhits').addClass('hidden');
  $('.rej').removeClass('hidden');
});

$('html').on('click', '.hitsapp', function() {
  $('#show').text('Approved/Paid');
  $('.allhits').addClass('hidden');
  $('.app').removeClass('hidden');
});

$('html').on('click', '.hitspen', function() {
  $('#show').text('Pending/Submitted');
  $('.allhits').addClass('hidden');
  $('.pen').removeClass('hidden');
});

$('html').on('click', '.hitsvie', function() {
  $('#show').text('Accepted/Viewed');
  $('.allhits').addClass('hidden');
  $('.vie').removeClass('hidden');
});



function _tpe () {
  var html1 = '', html2 = '', c1 = 0, c2 = 0, tpe = 0;

  chrome.storage.local.get('__hits', function (data) {
    var h1 = data.__hits || {}, h2 = {};

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

    var s2 = Object.keys(h2).sort( function(a, b) {
      return h2[a].reward - h2[b].reward;
    });

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

    $('#tbody').html(html2);
  });
}

function _clip (text) {
  var input = document.createElement('textarea');
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
}