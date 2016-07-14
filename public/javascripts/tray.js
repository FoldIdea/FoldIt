var calibrationSettings = foldIt.getCalibrationFromCookie();
var tabWidth = {
    'cm': 0.5,
    'in': 0.25
};

var target = 'screen';
var units = 'cm';
var baseWidth = 1.0;
var baseHeight = 1.0;
var padding = 0.2;
var front = 1;
var ranks = 1;
var desc = '';
var dups = 1;
var rot90 = false;

var copyrightYear = new Date().getFullYear();

renderTrays();
renderPage();

$('#for-screen').click(function (e) {
    if (target === 'screen') return;
    target = 'screen';
    renderPage();
    renderTrays();
});
$('#for-printer').click(function (e) {
    if (target === 'printer') return;
    target = 'printer';
    renderPage();
    renderTrays();
});

var baseNames = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '/basenames'
});
$('#loadname').typeahead({
    hint: true, highlight: true, minLength: 1
}, {
    name: 'baseNames',
    source: baseNames
});

var loadBase = function(e) {
    var loadName = $('#loadname').val().trim();
    if (loadName === '') return false;
    $.ajax({
        url: '/loadbase',
        method: 'POST',
        data: { name: loadName },
        error: function(req, err, msg) {
            $('#load-result')
                .addClass('bg-danger')
                .text('Load failed: ' + msg)
                .show()
                .fadeOut(2000, function() { $(this).removeClass('bg-danger'); });
            $('#loadname').typeahead('val', '');
        },
        success: function(res) {
            $('#loadname').typeahead('val', '');
            if (res.success) {
                units = res.units;
                $('#units-'+units)[0].checked = true;
                baseWidth = res.width;
                $('input[name=bw]').val(baseWidth);
                baseHeight = res.height;
                $('input[name=bh]').val(baseHeight);
                desc = res.name;
                $('input[name=desc]').val(desc);
                renderTrays();
            } else {
                $('#load-result')
                    .addClass('bg-danger')
                    .text(res.error)
                    .show()
                    .fadeOut(2000, function() { $(this).removeClass('bg-danger'); });
            }
        }
    });
    return false;
};
$('#load').click(loadBase);
$('#loadname').bind('typeahead:change', loadBase);
$('#loadname').bind('typeahead:select', loadBase);

$('input[name=bw]').change(function (e) {
    var bw = parseFloat($(e.target).val());
    if (isNaN(bw)) return;
    baseWidth = bw;
    renderTrays();
});
$('input[name=bh]').change(function (e) {
    var bh = parseFloat($(e.target).val());
    if (isNaN(bh)) return;
    baseHeight = bh;
    renderTrays();
});
$('input[name=pad]').change(function (e) {
    var pad = parseFloat($(e.target).val());
    if (isNaN(pad)) return;
    padding = pad;
    renderTrays();
});

$('input[name=front]').change(function (e) {
    var f = parseInt($(e.target).val());
    if (isNaN(f)) return;
    front = f;
    renderTrays();
});
$('input[name=ranks]').change(function (e) {
    var r = parseInt($(e.target).val());
    if (isNaN(r)) return;
    ranks = r;
    renderTrays();
});
$('input[name=desc]').change(function (e) {
    var d = $(e.target).val().trim();
    if (d === '') return;
    desc = d;
    renderTrays();
});
$('input[name=dups]').change(function (e) {
    var d = parseInt($(e.target).val());
    if (isNaN(d)) return;
    dups = d;
    var $rot90 = $('#rot90');
    if (dups > 1) {
        $rot90.attr('checked', false);
        rot90 = false;
    }
    $rot90.attr('disabled', (dups > 1));
    renderTrays();
});
$('#rot90').click(function (e) {
    if (dups > 1) return;
    rot90 = $('#rot90')[0].checked;
    $('svg').toggleClass('rot90');
});

function renderPage() {
    var mod = calibrationSettings[target];
    var w = (19 * mod).toString() + 'cm';
    var h = (25 * mod).toString() + 'cm';
    $('.page').css({width: w, height: h});
}

function renderTrays() {
    var $page = $('.page');
    $page.html('');
    for (var i = 0; i < dups; i++) {
        var id = 'tray' + (i + 1);
        var elementSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg"); //works!
        var $tray = $(elementSVG);
        $tray.attr('id', id);
        if (rot90) {
            $tray.addClass('rot90');
        }
        $page.append(elementSVG);
        renderTray(id);
    }
}

function renderTray(id) {
    var mod = calibrationSettings[target];

    var tray = Snap('#' + id);
    tray.clear();
    var tab = tabWidth[units];
    var frontWidth = (baseWidth + padding) * front;
    var ranksHeight = (baseHeight + padding) * ranks;
    var width = tab * 8 + frontWidth;
    var height = tab * 8 + ranksHeight;
    var cleft = tab * 4;
    var cright = cleft + frontWidth;
    var ctop = tab * 4;
    var cbottom = ctop + ranksHeight;
    var valleyFold = {strokeDasharray: '0.02 0.04'};
    var mountainFold = {strokeDasharray: '0.03 0.08'};
    tray.attr({
        width: (width * mod).toString() + units,
        height: (height * mod).toString() + units,
        viewBox: [0, 0, width, height].join(' '),
        fill: 'rgba(255,255,255,0)',
        strokeWidth: 0.05,
        stroke: 'rgb(0,0,0)'
    });
    // fill
    var pattern = tray.image('/images/grass_background_yellow.jpg', 0, 0, tab * 4, tab * 4).pattern(0, 0, tab * 4, tab * 4);
    tray.rect(cleft - tab * 2, ctop - tab * 2, tab * 4 + frontWidth, tab * 4 + ranksHeight).attr({
        stroke: 'rgba(0,0,0,0)',
        fill: pattern
    });
    var cover = {stroke: 'rgba(0,0,0,0)', fill: 'rgb(255,255,255)'};
    tray.rect(cleft - tab * 3, ctop - tab * 3, tab * 3, tab * 3).attr(cover);
    tray.rect(cright, ctop - tab * 3, tab * 3, tab * 3).attr(cover);
    tray.rect(cleft - tab * 3, cbottom, tab * 3, tab * 3).attr(cover);
    tray.rect(cright, cbottom, tab * 3, tab * 3).attr(cover);
    // tabs
    tray.polyline([
        cleft, ctop - tab, cleft, 0, cright, 0, cright, ctop - tab,
        width, ctop - tab, width, cbottom + tab, cright, cbottom + tab,
        cright, height, cleft, height, cleft, cbottom + tab,
        0, cbottom + tab, 0, ctop - tab, cleft, ctop - tab
    ]);
    // fit tabs
    tray.line(cleft, ctop, cleft, ctop - tab).attr(mountainFold);
    tray.line(cright, ctop, cright, ctop - tab).attr(mountainFold);
    tray.line(cleft, cbottom, cleft, cbottom + tab).attr(mountainFold);
    tray.line(cright, cbottom, cright, cbottom + tab).attr(mountainFold);
    tray.line(cleft, ctop, 0, ctop);
    tray.line(cright, ctop, width, ctop);
    tray.line(cleft, cbottom, 0, cbottom);
    tray.line(cright, cbottom, width, cbottom);
    //// fold lines
    tray.line(cleft, tab * 2, cright, tab * 2).attr(mountainFold);
    tray.line(cleft, tab * 3, cright, tab * 3).attr(mountainFold);
    tray.line(cleft, height - tab * 2, cright, height - tab * 2).attr(mountainFold);
    tray.line(cleft, height - tab * 3, cright, height - tab * 3).attr(mountainFold);
    tray.line(tab * 2, ctop, tab * 2, cbottom).attr(mountainFold);
    tray.line(tab * 3, ctop, tab * 3, cbottom).attr(mountainFold);
    tray.line(width - tab * 2, ctop, width - tab * 2, cbottom).attr(mountainFold);
    tray.line(width - tab * 3, ctop, width - tab * 3, cbottom).attr(mountainFold);
    // base
    tray.rect(cleft, ctop, frontWidth, ranksHeight).attr(valleyFold);
    // descriptor
    var d = (desc + ' ' + front + 'x' + ranks).trim();
    var dm = tray.rect(cleft, height - tab * 2, frontWidth, tab * 2).attr({'fill': '#fff'});
    tray.text(cleft + frontWidth / 2.0, height - tab * 0.75, d).attr({
        'font-size': tab * 0.75,
        'text-anchor': 'middle',
        'fill': 'rgb(0,0,0)',
        'stroke': 'none',
        'mask': dm
    });
    // copyright
    var cm = tray.rect(cleft, 0, frontWidth, tab * 2).attr({'fill': '#fff'});
    tray.text(cleft + frontWidth / 2.0, tab * 1.25, 'FoldIt TrayMaker (c) ' + copyrightYear + ' foldit.co').attr({
        'font-size': tab * 0.5,
        'text-anchor': 'middle',
        'fill': 'rgb(0,0,0)',
        'stroke': 'none',
        'mask': cm
    });
}
