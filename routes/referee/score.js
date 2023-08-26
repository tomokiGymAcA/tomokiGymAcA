const router = require('express').Router();
const { judgeName } = require('../../public/javascripts/function/judge_name');
const { con } = require("../../lib/database/client.js");
const fs = require('node:fs');



router.post('/:id/:pass/:name', (req, res) => {
    var game_id = req.body.game;
    var judge = req.body.judge;
    const selectgame = 'select game_name from game_tb where game_id = ?';
    con.query(selectgame, [game_id], (err, results) => {
        var jso = {
            'text': 'ok',
            'game': game_id,
            'judge': judge,
            'game_name': results[0].game_name,
            'judge_name': judgeName(judge)
        }
        res.json(jso);
    })

});
router.get('/', (req, res) => {
    res.render('../views/referee/score.ejs');
});
router.get('/:game/:judge', (req, res) => {
    var game = req.params.game;
    var judge = req.params.judge;
    const selectgame = 'select * from game_tb where game_id = ?';
    con.query(selectgame, [game], (err, results) => {
        var order_type = results[0].order_type;
        var game_name = results[0].game_name;
        res.render('../views/referee/score_after.ejs', {
            judge,
            game,
            order_type
        });
    })
});

router.post('/:game/:judge', (req, res) => {
    var game_id = req.body.game_id;
    var judge_id = req.body.judge_id;
    var colum = judgeColum(judge_id);
    const selectGameType = 'SELECT order_type FROM game_tb WHERE game_id = ?';
    const kokutaiPlayer = `SELECT pt.player_id, pt.name, pt.team, ot.order_num, ot.kind_num, st.${colum} as send, st.answer, st.e_score, st.d_score, team_tb.menber_name FROM player_tb pt INNER JOIN order_tb ot ON pt.player_id = ot.player_id INNER JOIN team_tb ON team_tb.player_id = pt.player_id AND team_tb.play_kind = ot.kind_num INNER JOIN score_tb st ON st.order_id = ot.order_id WHERE pt.game_id = ? ORDER BY ot.order_num ASC`;
    const kokutaiTeam = `SELECT pt.player_id, pt.name, pt.team, ot.order_num, ot.kind_num, st.${colum} as send, st.answer, st.e_score, st.d_score  FROM player_tb pt INNER JOIN order_tb ot ON pt.player_id = ot.player_id INNER JOIN score_tb st ON st.order_id = ot.order_id WHERE pt.game_id = ? AND ot.kind_num = 5 ORDER BY ot.order_num ASC`;

    const SlectPlayersData = `SELECT pt.player_id, pt.name, pt.team, ot.order_num, ot.kind_num, st.${colum} as send, st.answer, st.e_score, st.d_score, st.all_ded FROM player_tb pt LEFT OUTER JOIN order_tb ot ON ot.player_id = pt.player_id LEFT OUTER JOIN score_tb st ON st.order_id = ot.order_id  WHERE pt.game_id = ? ORDER BY ot.kind_num ASC`;
    con.query(selectGameType, [game_id], (err, results) => {
        var orderType = results[0].order_type;
        if (err) throw err;
        if (orderType == 3 || orderType == 1) {
            con.query(SlectPlayersData, [game_id], (err, results) => {
                if (err) throw err;
                res.json(results);
            })
        } else if (orderType == 2) {
            con.query(kokutaiPlayer, [game_id], (err, results) => {
                if (err) throw err;
                var kokutai = results;
                con.query(kokutaiTeam, [game_id], (err, results) => {

                    kokutai = kokutai.concat(results);
                    res.json(kokutai);
                })
            })
        }
    })

})

const playerJOINorder = 'SELECT * FROM player_tb LEFT OUTER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE order_tb.player_id = ? AND order_tb.kind_num = ?';
const selectCategory = 'select * from category_tb where category_id = ?';
router.post('/', (req, res) => {
    var player_id = req.body.player_id;
    var kind_num = req.body.kind_num;
    con.query(playerJOINorder, [player_id, kind_num], (err, results) => {
        res.json(results);
    })
})


router.post('/:judge', (req, res) => {
    var judge = req.params.judge
    var judge_name;
    var player_id = req.body.player_id;
    var kind_num = req.body.kind_num;
    var category_id = req.body.category_id;
    var result = req.body.result;
    result = Number(result);
    var cnt;
    var colum;

    console.log('審判ナンバー', judge)
    con.query(selectCategory, [category_id], (err, results) => {
        if (err) throw err;
        judge_name = judgeName(judge);
        colum = judgeColum(judge);
        updScore()

    })

    function updScore() {
        console.log('審判名', judge_name);
        if (judge == 10) {
            const updatePlayerScorecolum = `UPDATE score_tb SET ${colum} = ? WHERE player_id = ? AND kind_num = ?`;
            con.query(updatePlayerScorecolum, [result, player_id, kind_num], (err, results) => {
                if (err) throw err;
                con.query(playerJOINorder, [player_id, kind_num], (err, results) => {

                    scoreResult = result.toFixed(2);
                    if (err) {

                    } else {
                        var ok = 'ok';
                        res.json(ok)
                    }
                })
            })
        } else {
            con.query(`select ${colum}_cnt as num From score_tb WHERE player_id = ? AND kind_num = ?`, [player_id, kind_num], (err, results) => {
                if (results[0].num == null) {
                    cnt = 1;
                } else {
                    cnt = results[0].num + 1;
                }
                const updatePlayerScore = `UPDATE score_tb SET ${colum} = ?, ${colum}_cnt = ? WHERE player_id = ? AND kind_num = ?`;
                con.query(updatePlayerScore, [result, cnt, player_id, kind_num], (err, results) => {
                    if (err) throw err;
                    con.query(playerJOINorder, [player_id, kind_num], (err, results) => {

                        scoreResult = result.toFixed(2);
                        if (err) {

                        } else {
                            var ok = 'ok';
                            res.json(ok)
                        }
                    })
                })
            })
        }
    }

})


function judgeColum(r) {
    var judge_colum;
    switch (r) {
        case '10':
            judge_colum = 'res_ded';
            break;
        case '31':
            judge_colum = 'e1';
            break;
        case '32':
            judge_colum = 'e2';
            break;
        case '33':
            judge_colum = 'e3';
            break;
        case '34':
            judge_colum = 'e4';
            break;
        case '35':
            judge_colum = 'e_top';
            break;
        case '41':
            judge_colum = 'a1';
            break;
        case '42':
            judge_colum = 'a2';
            break;
        case '43':
            judge_colum = 'a3';
            break;
        case '44':
            judge_colum = 'a4';
            break;
        case '51':
            judge_colum = 'd1';
            break;
        case '52':
            judge_colum = 'd2';
            break;
        case '53':
            judge_colum = 'd3';
            break;
        case '54':
            judge_colum = 'd4';
            break;
        case '55':
            judge_colum = 'd_top';
            break;
        case '61':
            judge_colum = 'line1_ded';
            break;
        case '62':
            judge_colum = 'line2_ded';
            break;
        case '71':
            judge_colum = 'act_time';
            break;
        case '72':
            judge_colum = 'time_ded';
            break;

    }
    return judge_colum;
}

module.exports = router;