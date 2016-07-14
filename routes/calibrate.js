var util = require('util');
var CALIBRATION_COOKIE = 'foldit.calibration';

module.exports = function(req, res, next) {
    if (util.isNullOrUndefined(req.cookies[CALIBRATION_COOKIE])) {
        res.app.db.find({ type:'calibration' }, function(err, records) {
            if (err) {
                res.app.logger.error('Failed to get calibration info: ' + err);
            } else if (records.length > 0) {
                var calibrations = { };
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    calibrations[record.target] = record.modifier;
                }
                res.cookie(CALIBRATION_COOKIE, JSON.stringify(calibrations));
                res.app.logger.info('setting calibration cookie');
            } else {
                res.app.logger.info('No calibration info found.');
            }
            next();
        })
    } else {
        next();
    }
};
