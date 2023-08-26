const router = require('express').Router();
const { judgeName, specialJudgeName } = require('../../public/javascripts/function/judge_name');
const { con } = require("../../lib/database/client.js");
const fs = require('node:fs');

router.get('/', (req, res) => {
    res.render('../views/set/tv_style_edit.ejs');
})

router.post('/', (req, res) => {

    const data = JSON.parse(fs.readFileSync('./json/d_json.json'));
    res.json(data);

});

router.get('/:category', (req, res) => {
    var category = req.params.category;
    con.query('SELECT * FROM judge_tb WHERE category_id = ?', [category], (err, results) => {
        if (err) {
            res.json('err');
        } else {
            res.json(results);
        }
    })
})

module.exports = router;