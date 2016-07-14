var calibrationSettings = foldIt.getCalibrationFromCookie();
var cmSize = 14;
var inSize = 5;
buildGrid('#grid-cm', 20, 12, 10, 5, 1);
buildGrid('#grid-in', 16, 5, 16, 8, 1);
sizeGrids('screen');
renderPage('screen');
var units = 'cm';
foldIt.setInputUnits(units);

var changeUnits = function(e) {
    var u = $(e.target).val();
    if (units === u) return;
    units = u;
    foldIt.setInputUnits(units);
    showGrid(units);
};
$('#units-cm').click(changeUnits);
$('#units-in').click(changeUnits);

$('#for-screen').click(function (e) {
    renderPage('screen');
    sizeGrids('screen');
});
$('#for-printer').click(function (e) {
    renderPage('printer');
    sizeGrids('printer');
});

function showGrid(units) {
    $('#grid-cm').toggle(units === 'cm');
    $('#grid-in').toggle(units === 'in');
}

function renderPage(target) {
    var mod = calibrationSettings[target];
    var w = (19 * mod).toString() + 'cm';
    var h = (23.5 * mod).toString() + 'cm';
    $('.page').css({width: w, height: h});
}

function sizeGrids(target) {
    var modifier = calibrationSettings[target];
    var newCmSize = (cmSize * modifier).toString() + 'cm';
    var newInSize = (inSize * modifier).toString() + 'in';
    $('#grid-cm').attr({width: newCmSize, height: newCmSize});
    $('#grid-in').attr({width: newInSize, height: newInSize});
}

function buildGrid(grid, xoffset, divisions, major, mid, minor) {
    var svg = Snap(grid);
    var left = xoffset * 0.75;
    var right = left + divisions * major;
    var top = xoffset * 0.25;
    var bottom = top + divisions * major;
    var font = {'font-size': Math.min(mid * 0.75, 4), 'fill': 'rgb(0,0,0)'};
    svg.line(left, top, left, bottom);
    svg.line(left, bottom, right, bottom);
    for (var u = 0; u <= (divisions * major); u++) {
        var x = left + u;
        var y = bottom - u;
        if (u % major === 0) {
            var n = parseInt(u / major).toString();
            svg.line(x, bottom + 2 * minor, x, bottom - 5 * minor);
            svg.text(x - 2 * minor, bottom + xoffset / 2, n).attr(font);
            svg.line(left - 2 * minor, y, left + 5 * minor, y);
            svg.text(left - xoffset / 2, y + 2 * minor, n).attr(font);
        } else {
            var m = (u % mid === 0) ? 3 : 1;
            var nm = (u % mid === 0) ? 2 : 1;
            svg.line(x, bottom + nm * minor, x, bottom - m * minor);
            svg.line(left - nm * minor, y, left + m * minor, y);
        }
    }
}

var resetSaveForm = function() {
    $('#name').val('');
    $('#width').val(0);
    $('#height').val(0);
};

$('#save').click(function(e) {
    var errors = [];
    var width = parseFloat($('#width').val());
    var height = parseFloat($('#height').val());
    var name = $('#name').val().trim();
    if (isNaN(width) || width <= 0) {
        errors.push('Invalid width');
    }
    if (isNaN(height) || height <= 0) {
        errors.push('Invalid height');
    }
    if (name === '') {
        errors.push('No name');
    }
    var $saveResult = $('#save-result');
    $saveResult.removeClass('bg-danger');
    if (errors.length > 0) {
        $saveResult
            .addClass('bg-danger')
            .text('Error' + (errors.length > 1 ? 's' : '') + ': ' + errors.join(', '))
            .show();
        return false;
    }
    $saveResult.hide();
    $.ajax({
        url: '/measure',
        method: 'POST',
        data: {
            name: name,
            width: width,
            height: height,
            units: units
        },
        error: function(req, stat, err) {
            $saveResult.text('Failed to save: ' + err).addClass('bg-danger').show().fadeOut(2000);
            resetSaveForm();
        },
        success: function(res) {
            $saveResult.text('Saved')
                .addClass('bg-success')
                .show()
                .fadeOut(2000, function() { $(this).removeClass('bg-success'); });
            resetSaveForm();
        }
    });
    return false;
});
