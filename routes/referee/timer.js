const router = require('express').Router();
const { version } = require('chillout');
const { con } = require("../../lib/database/client.js");
const { judgeName } = require('../../public/javascripts/function/judge_name');



router.get('/:game/:judge', (req, res) => {
    var game = req.params.game;
    var judge = req.params.judge;
    var judge_name = judgeName(judge);

    res.render('../views/referee/timer.ejs', {
        judge,
        judge_name,
        game
    })
})

router.post('/:judge', (req, res) => {
    var judge = req.params.judge
    var judge_name = judgeName(judge);
    var player_id = req.body.player_id;
    var kind_num = req.body.kind_num;
    var act_time = req.body.act_time;
    var time_ded = Number(req.body.time_ded);
    var cnt;

    console.log('審判ナンバー', judge)

    console.log('審判名', judge_name);
    con.query(`select time_ded_cnt as num From score_tb WHERE player_id = ? AND kind_num = ?`, [player_id, kind_num], (err, results) => {
        if (results[0].num == null) {
            cnt = 1;
        } else {
            cnt = results[0].num + 1;
        }
        const updatePlayerScore = `UPDATE score_tb SET act_time = ?, time_ded = ?, time_ded_cnt = ? WHERE player_id = ? AND kind_num = ?`;
        con.query(updatePlayerScore, [act_time, time_ded, cnt, player_id, kind_num], (err, results) => {
            if (err) throw err;
            if (err) {

            } else {
                var ok = 'ok';
                res.json(ok)
            }
        })

    })
})


module.exports = router;