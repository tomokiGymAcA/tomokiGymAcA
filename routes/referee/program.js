const router = require('express').Router();
const { judgeName } = require('../../public/javascripts/function/judge_name');
const { con } = require("../../lib/database/client.js");

// const SlectPlayersData = 'SELECT * FROM player_tb pt LEFT OUTER JOIN order_tb ot ON ot.player_id = pt.player_id  WHERE pt.game_id = ? ORDER BY ot.kind_num ASC'
// router.get('/:game', (req, res) => {
//     var game = req.params.game
//     con.query(SlectPlayersData, [game], (err, results) => {
//         if (err) throw err;
//         console.log(results);
//         res.json(results)
//     })
// })
router.get('/:game_id/:judge', (req, res) => {
    var category_id;
    var judge = req.params.judge;
    var game_id = req.params.game_id;
    var judge_name = judgeName(judge);
    const selectgame = 'select order_type from game_tb where game_id = ?';
    con.query(selectgame, [game_id], (err, results) => {
        var type = results[0].order_type;
        res.render('../views/referee/program.ejs', {
            judge,
            category_id,
            game_id,
            type,
            judge_name
        });
    })
})

// サイドバーJSON作成
const playersJOINorderKind = 'SELECT pt.name , pt.player_id , pt.category_id ,ot.order_num, ot.kind_num, ot.judge_check, pt.abstention, pt.sub_team as team ,pt.team as fullteam, pt.age  FROM player_tb pt INNER JOIN order_tb ot ON pt.player_id = ot.player_id WHERE pt.game_id = ? AND pt.category_id = ? ORDER BY ot.kind_num ASC';
const kokutaiPlayer = 'SELECT tt.menber_name as name, pt.player_id , pt.category_id , ot.order_num, ot.kind_num, ot.judge_check, pt.abstention, pt.sub_team as team ,pt.team as fullteam, pt.age  FROM player_tb pt INNER JOIN order_tb ot ON pt.player_id = ot.player_id INNER JOIN team_tb tt ON tt.player_id = pt.player_id AND tt.play_kind = ot.kind_num WHERE pt.game_id = ? AND pt.category_id = ?  ORDER BY ot.order_num ASC';
const kokutaiTeam = 'SELECT pt.name, pt.player_id , pt.category_id , ot.order_num, ot.kind_num, ot.judge_check, pt.abstention, pt.sub_team as team ,pt.team as fullteam,pt.age FROM player_tb pt INNER JOIN order_tb ot ON pt.player_id = ot.player_id WHERE pt.game_id = ? AND ot.kind_num = 5 AND pt.category_id = ?  ORDER BY ot.order_num ASC';
router.post('/:game_id/:category_id', (req, res) => {
    var game_id = req.params.game_id;
    var category_id = req.params.category_id;
    var type = req.body.type;

    if (type == 3 || type == 1) {
        con.query(playersJOINorderKind, [game_id, category_id], (err, results) => {
            if (err) throw err;
            res.json(
                results
            );
        })
    } else if (type == 2) {
        con.query(kokutaiPlayer, [game_id, category_id], (err, results) => {
            if (err) throw err;
            var kokutai = results;
            con.query(kokutaiTeam, [game_id, category_id], (err, results) => {
                kokutai = kokutai.concat(results);
                res.json(kokutai);
            })
        })
    }
});

// サイドバーJSON作成
module.exports = router;