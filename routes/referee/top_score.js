const router = require('express').Router();
const { judgeName } = require('../../public/javascripts/function/judge_name');
const { con } = require("../../lib/database/client.js");
const playersJOINorder = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE player_tb.game_id = ? ORDER BY order_tb.order_num ASC';
const games = "SELECT * FROM game_tb WHERE game_id = ?";
const selectCategoryId = 'select * from category_tb where category_id = ?';


router.get('/:game_id/:judge', (req, res) => {
    var category_id;
    var special;
    var judge = req.params.judge;
    var game = req.params.game_id;
    var judge_name = judgeName(judge);
    var kindset = {
        kind1: req.query.kind1,
        kind2: req.query.kind2,
        kind3: req.query.kind3,
        kind4: req.query.kind4,
        kind5: req.query.kind5
    }



    res.render('../views/referee/top_score.ejs', {
        category_id,
        special,
        judge,
        game,
        judge_name,
        kindset
    })
});

const selectPlayerScore = 'SELECT * FROM score_tb WHERE player_id = ? AND kind_num = ?';


router.post('/', (req, res) => {
    let kind = req.body.kind_num;
    let player_id = req.body.player_id;
    let colum = req.body.colum;
    let score = req.body.score;
    var cnt = (Number(req.body.cnt) + 1);
    con.query(`UPDATE score_tb SET ${colum} = ? ,res_ded_cnt = ? WHERE player_id = ? AND kind_num = ?`, [score, cnt, player_id, kind], (err, results) => {
        if (err) throw (err);
        res.json('ok')
    })
})
module.exports = router;