var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.get('/calibrate', function (req, res) {
    res.render('calibrate');
});
router.post('/calibrate', function (req, res) {
    var record = req.body;
    record['type'] = 'calibration';
    record['modifier'] = parseFloat(record['modifier']);
    req.app.db.update({type: 'calibration', target: req.body.target}, record, {upsert: true});
    res.send({ success: true });
});

router.get('/measure', function (req, res) {
    res.render('measure');
});
router.post('/measure', function (req, res) {
    var record = req.body;
    record['type'] = 'base';
    record['canonicalName'] = req.body.name.toLowerCase();
    record.width = parseFloat(record.width);
    record.height = parseFloat(record.height);
    req.app.db.update({ type: 'base', canonicalName: record.canonicalName }, record, { upsert: true });
    res.send({ success: true });
});
router.get('/basenames', function(req, res) {
    req.app.db.find({ type: 'base' }, function(err, records) {
        if (err) {
            return res.status(500).send({ success: false, error: err });
        }
        var words = records.map(function(o) { return o.name });
        res.send(words);
    });
});
router.post('/loadbase', function (req, res) {
    var name = req.body.name.toLowerCase();
    req.app.db.find({ type: 'base', canonicalName: name }, function(err, records) {
        if (err) {
            return res.status(500).send({ success: false, error: err });
        }
        if (records.length === 0) {
            return res.status(500).send({ success:false, error: 'Not found' });
        }
        if (records.length > 1) {
            return res.status(500).send({ success:false, error: 'Non-unique name' });
        }
        var base = records[0];
        base.success = true;
        res.send(base);
    });
});

router.get('/create', function (req, res) {
    res.render('create');
});

module.exports = router;
