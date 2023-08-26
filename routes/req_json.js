const router = require('express').Router();
const { judgeName } = require('../public/javascripts/function/judge_name');
const { con } = require("../lib/database/client.js");

const fs = require('fs');
var file = '../json/test.json';

const selectPlayerScore = 'SELECT * FROM score_tb WHERE player_id = ? AND kind_num = ?';

router.get('/', (req, res) => {
    var score;
    var data;
    var data = JSON.parse(fs.readFile('./test.json', function (err) { console.log(err) }));
    res.json(data);
})




module.exports = router;