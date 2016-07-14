var calibrationSettings = foldIt.getCalibrationFromCookie();
var calibrateSize = 1;
var unitOptions = {
    'cm': { max: 20.0, step: 0.05 },
    'in': { max: 8.0, step: 0.03125 }
};
var calibrateUnits = 'cm';
var calibrateFor = 'screen';
var calibrationModifier = calibrationSettings[calibrateFor];
setActualSize();
resizeCalibration();
showModifier('screen', calibrationSettings.screen);
showModifier('printer', calibrationSettings.printer);
foldIt.setInputUnits(calibrateUnits, unitOptions);

$('input[name=showSize]').change(function (e) {
    var size = parseInt($(e.target).val());
    if (isNaN(size)) return;
    calibrateSize = size;
    setActualSize();
    resizeCalibration();
});

$('#showUnits-cm').click(function (e) {
    if (calibrateUnits === 'cm') return;
    calibrateUnits = 'cm';
    foldIt.setInputUnits(calibrateUnits, unitOptions);
    resizeCalibration();
});

$('#showUnits-in').click(function (e) {
    if (calibrateUnits === 'in') return;
    calibrateUnits = 'in';
    foldIt.setInputUnits(calibrateUnits, unitOptions);
    resizeCalibration();
});

$('input[name=actualSize]').change(function (e) {
    var size = parseFloat($(e.target).val());
    if (isNaN(size)) return;
    calibrationModifier = (calibrateSize * 1.0) / size;
    resizeCalibration();
    showModifier();
});

$('#saveFor-screen').click(function (e) {
    if (calibrateFor === 'screen') return;
    calibrateFor = 'screen';
    calibrationModifier = calibrationSettings[calibrateFor];
    $('input[name=actualSize]').val(calibrateSize * 1.0 / calibrationModifier);
    setActualSize();
    resizeCalibration();
});

$('#saveFor-printer').click(function (e) {
    if (calibrateFor === 'printer') return;
    calibrateFor = 'printer';
    calibrationModifier = calibrationSettings[calibrateFor];
    setActualSize();
    resizeCalibration();
});

$('#save').click(function (e) {
    calibrationSettings[calibrateFor] = calibrationModifier;
    Cookies.set(foldIt.CALIBRATION_COOKIE, calibrationSettings);
    $.ajax({
        url: '/calibrate',
        method: 'POST',
        data: {target: calibrateFor, modifier: calibrationModifier},
        success: function (res) {
            console.log('successfully saved');
        },
        error: function () {
            console.log('failed to save');
        }
    });
});

function setActualSize() {
    $('input[name=actualSize]').val(calibrateSize * 1.0 / calibrationModifier);
}

function resizeCalibration() {
    $('#echo-units').text(calibrateUnits);

    var dim = calibrateSize.toString() + calibrateUnits;
    $('#calibration-square').attr({width: dim, height: dim});

    dim = (calibrateSize * calibrationModifier).toString() + calibrateUnits;
    $('#calibrated-square').attr({width: dim, height: dim});
}

function showModifier(mod, calMod) {
    var mod = mod || calibrateFor;
    var calMod = calMod || calibrationModifier;
    $('#' + mod + 'Mod').text(calMod.toFixed(4));
}
