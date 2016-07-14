var CALIBRATION_COOKIE = 'foldit.calibration';

var foldIt = {
    CALIBRATION_COOKIE: CALIBRATION_COOKIE,
    getCalibrationFromCookie: function() {
        return Cookies.getJSON(CALIBRATION_COOKIE) || { screen: 1, printer: 1 };
    },

    setInputUnits: function(units, options) {
        var unitOptions = (options || {})[units] || {};
        var max = unitOptions.max || (units === 'in' ? 8.0 : 20.0);
        var step = unitOptions.step || (units === 'in' ? 0.0625 : 0.1);
        $('input.units').attr({
            max: max,
            step: step
        });
        $('span.units').text(units);
    }
};
