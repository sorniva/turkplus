document.addEventListener('DOMContentLoaded', function () {
  if ($('a:contains(View a HIT in this group)').length) {
    _export_data();
  }
});

var hits = {}; var to = [];


function _export_data () {
var $hits = $('table[cellpadding="0"][cellspacing="5"][border="0"]').eq(0).children('tbody').children('tr');


for (var i = 0; i < $hits.length; i ++) {
  var $hit = $hits.eq(i);

  var req_name, req_id, req_link, con_link, to_link;

  var req = $hit.find('a[href^="/mturk/searchbar?selectedSearchType=hitgroups&requesterId="]');
  if (req.length) {
	logged_in = true;
	req_name  = $hit.find('span.requesterIdentity').text().trim();
	req_id    = req.prop('href').split('requesterId=')[1];
	req_link  = 'https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=' + req_id;
	con_link  = 'https://www.mturk.com/mturk/contact?requesterId=' + req_id;
	to_link   = 'https://turkopticon.ucsd.edu/' + req_id;
  }
  else {
	logged_in = false;
	req_name  = $hit.find('span.requesterIdentity').text().trim();
	req_id    = $hit.find('span.requesterIdentity').text().trim();
	req_link  = 'https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=' + req_id.replace(/ /g, '+');
	con_link  = 'https://#';
	to_link   = 'https://turkopticon.ucsd.edu/main/php_search?field=name&query=' + req_id.replace(/ /g, '+');
  }

  var group_id, prev_link, pand_link;

  var prev = $hit.find('a[href^="/mturk/preview?groupId="]');
  if (prev.length) {
	group_id  = prev.prop('href').split('groupId=')[1];
	prev_link = 'https://www.mturk.com/mturk/preview?groupId=' + group_id;
	pand_link = 'https://www.mturk.com/mturk/previewandaccept?groupId=' + group_id;
  }
  else {
	group_id  = 'na';
	prev_link = req_link;
	pand_link = req_link;
  }

  var title  = $hit.find('a.capsulelink').text();
  var desc   = $hit.find('td[class="capsule_field_title"]:contains(Description:)').next().text();
  var time   = $hit.find('td[class="capsule_field_title"]:contains(Time Allotted:)').next().text();
  var reward = $hit.find('td[class="capsule_field_title"]:contains(Reward:)').next().text();
  var avail  = $hit.find('td[class="capsule_field_title"]:contains(HITs Available:)').next().text() || 'N/A';

  var quals   = $hit.find('td[style="padding-right: 2em; white-space: nowrap;"]');
  var	qualif  = 'None';
  var	masters = 'N';

  if (quals.length) {
	qualif = '';
	for (var j = 0; j < quals.length; j ++) {
	  qualif += quals.eq(j).text().trim().replace(/\s+/g, ' ') + '; ';
	}
	if (qualif.indexOf('Masters has been granted') !== -1) {
	  masters = 'Y';
	}
  }

  var key = req_id.trim() + title.trim() + reward.trim() + group_id.trim();

  hits[key] = {
	reqname  : req_name.trim(),
	reqid    : req_id.trim(),
	reqlink  : req_link.trim(),
	conlink  : con_link.trim(),
	groupid  : group_id.trim(),
	prevlink : prev_link.trim(),
	pandlink : pand_link.trim(),
	title    : title.trim(),
	desc     : desc.trim(),
	time     : time.trim(),
	reward   : reward.trim(),
	avail    : avail.trim(),
	quals    : qualif.trim(),
	masters  : masters.trim(),
	key      : key.trim(),
	tolink   : to_link.trim(),
	to       : { comm : 'N/A', fair : 'N/A', fast : 'N/A', pay  : 'N/A' }
  };
  to.push([key, req_id]);


  $hit.find('a.capsulelink').after(
    '<button class="vb" data-key="' + key + '" type="button" style="background-color: transparent; border: solid 1px #000000; margin-left: 5px;">vB</button>' +
    '<button class="irc" data-key="' + key + '" type="button" style="background-color: transparent; border: solid 1px #000000; margin-left: 5px;">IRC</button>'
  );
}
if ($hits.length) {
  _to();
}
  
  $('body').on('click', '.vb', function () {
    _export_vb($(this).data('key'));
  });
  
  $('body').on('click', '.irc', function () {
    _export_irc($(this).data('key'));
  });
}

function _to () {
  var ids = [];

  if (to.length) {
	for (var i = 0; i < to.length; i++) {
	  ids.push(to[i][1]);
	}
	$.get('https://turkopticon.ucsd.edu/api/multi-attrs.php?ids=' + ids, function (data) {
	  var to_data = JSON.parse(data);

	  for (i = 0; i < to.length; i++) {
		if (!to_data[to[i][1]].length && typeof to_data[to[i][1]].attrs != 'undefined') {
		  hits[to[i][0]].to = to_data[to[i][1]].attrs;
		}
	  }
	});
  }
}

function _export_vb (key) {
  var hit = hits[key];

  var pay = hit.to.pay,  _pay = '#B30000';
  if      (pay > 3.99) { _pay = '#00B300'; }
  else if (pay > 2.99) { _pay = '#B3B300'; }
  else if (pay > 1.99) { _pay = '#B37400'; }

  var fair = hit.to.fair, _fair = '#B30000';
  if      (fair > 3.99) { _fair = '#00B300'; }
  else if (fair > 2.99) { _fair = '#B3B300'; }
  else if (fair > 1.99) { _fair = '#B37400'; }

  var comm = hit.to.comm, _comm = '#B30000';
  if      (comm > 3.99) { _comm = '#00B300'; }
  else if (comm > 2.99) { _comm = '#B3B300'; }
  else if (comm > 1.99) { _comm = '#B37400'; }

  var fast = hit.to.fast, _fast = '#B30000';
  if      (fast > 3.99) { _fast = '#00B300'; }
  else if (fast > 2.99) { _fast = '#B3B300'; }
  else if (fast > 1.99) { _fast = '#B37400'; }

  var exportcode = '[table][tr][td]'+
	  '[b]Title:[/b] [URL=' + hit.prevlink + ']' + hit.title + '[/URL] | [URL=' + hit.pandlink + ']PANDA[/URL]\n' +
	  '[b]Requester:[/b] [URL=' + hit.reqlink + ']' + hit.reqname + '[/URL] [' + hit.reqid + '] ([URL=' + hit.conlink + ']Contact[/URL])\n' +
	  '([URL='+hit.tolink+']TO[/URL]):'+
	  '[b] \[Pay: [COLOR=' + _pay + ']' + pay + '[/COLOR]\][/b]'+
	  '[b] \[Fair: [COLOR=' + _fair + ']' + fair + '[/COLOR]\][/b]' +
	  '[b] \[Comm: [COLOR=' + _comm +']' + comm + '[/COLOR]\][/b]' +
	  '[b] \[Fast: [COLOR=' + _fast + ']' + fast + '[/COLOR]\][/b]\n' +
	  '[b]Description:[/b] ' + hit.desc + '\n' +
	  '[b]Time:[/b] ' + hit.time + '\n' +
	  '[b]HITs Available:[/b] ' + hit.avail + '\n' +
	  '[b]Reward:[/b] [COLOR=green][b] ' + hit.reward + '[/b][/COLOR]\n' +
	  '[b]Qualifications:[/b] ' + hit.quals + '\n' +
	  '[/td][/tr][/table]';

  _copyToClip(exportcode);
  alert('Forum export has been copied to your clipboard.');
}

function _export_irc (key) {
  var hit = hits[key]; var ircexport = '';

  $.get('https://ns4t.net/yourls-api.php?action=bulkshortener&title=MTurk&signature=39f6cf4959&urls[]=' + hit.prevlink + '&urls[]=' + hit.pandlink, function (data) {
    var urls = data.split(';'),
        preview = urls[0],
        panda   = urls[1];

    ircexport = hit.masters === 'Y' ? 'MASTERS ■ Req: ' + hit.reqname + ' ■ Title: ' + hit.title + ' ■ Reward: ' + hit.reward : 'Req: ' + hit.reqname + ' ■ Title: ' + hit.title + ' ■ Reward: ' + hit.reward;
    ircexport += preview !== panda ? ' ■ Prev: ' + preview + ' ■ PandA: '+ panda : ' ■ Search: ' + preview;
    ircexport += ' ■ TO: (Pay: ' + hit.to.pay + ') (Fair: ' + hit.to.fair + ') (Comm: ' + hit.to.comm + ') (Fast: ' + hit.to.fast + ')';

  }).always(function () {
    _copyToClipboard(ircexport);
  }).fail(function () {
    alert('Failed to shorten links.');
  });
}

function _copyToClip (text) {
  var input = document.createElement('textarea');
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  console.log(input.value)
  document.body.removeChild(input);
  console.log('copied');
}

function _copyToClipboard (text) {
    window.prompt('Copy IRC export to clipboard: Ctrl+C, Enter', text);
}