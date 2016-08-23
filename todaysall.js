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

chrome.storage.onChanged.addListener( function (changes) {
  for (var key in changes) {
    if (key === 'tpe') {
      var new_tpe = changes[key].newValue;
      $('#tpe').text('$' + new_tpe.toFixed(2));
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  _get_tpe();
  _tpe();
});

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

function _get_tpe () {
  chrome.storage.local.get('tpe', function (data) {
    var stored = data.tpe || 0;
    $('#tpe').text('$' + stored.toFixed(2));
  });
}

function _tpe () {
  var html1 = '', html2 = '', c1 = 0, c2 = 0, tpe = 0;

  chrome.storage.local.get('__hits', function (data) {
    var h1 = data.__hits || {};

    var s1 = Object.keys(h1).sort( function (a, b) {
      return h1[a].viewed - h1[b].viewed;
    });

    for (var i = 0; i < s1.length; i ++) {
      var k1 = s1[i], color = '', source = '', autoapp = '', pend = false, status = 'allhits ';
      
      if (h1[k1].status.match(/Paid|Approved/)) {
        color = 'green'; status += 'app';
      }
      else if (h1[k1].status.match(/Pending|Submitted/)) {
        color = 'orange'; pend = true; status += 'pen';
      }
      else if (h1[k1].status.match(/Rejected/)) {
        color = 'red'; status += 'rej';
      }
      else if (h1[k1].status.match(/Accepted|Previewed/)) {
        status += 'vie';
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
      '<tr class="' + status + '">' +
        '  <td><div>' + source + h1[k1].reqname +'</div></td>' +
        '  <td>' + h1[k1].title + '</td>' +
        '  <td style="width: 70px;">' + h1[k1].reward + '</td>' +
        '  <td style="width: 70px; color: ' + color + '; cursor: context-menu;" data-toggle="tooltip" data-placement="left" title="' + autoapp + '">' + h1[k1].status.split(/\s/)[0] + '</td>' +
        '</tr>'
      ;
      c2 ++;
    }
  
    $('#tbody').html(html1);
    $('[data-toggle="tooltip"]').tooltip();
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