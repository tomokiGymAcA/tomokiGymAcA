const router = require('express').Router();
const { con } = require("../../lib/database/client.js");
const games = "SELECT * FROM game_tb WHERE game_id = ?";


router.get('/', (req, res) => {

    res.render('../views/set/result.ejs', {});
});

// サイドバーJSON作成
const playersJOINorderKind = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE player_tb.game_id = ? AND order_tb.kind_num = ? ORDER BY order_tb.order_num ASC';
router.get('/:game_id', (req, res) => {
    var game_id = req.params.game_id;
    res.render('../views/set/result.ejs', { game_id });

});

router.post('/:game_id/:category_id/:reset', (req, res, ) => {
    var game_id = req.params.game_id;
    var category_id = req.params.category_id;
    con.query('DELETE FROM rank_tb WHERE game_id = ? AND category_id = ?', [game_id, category_id], (err, results) => {
        res.redirect('/result');
    })
})
const insertRank = "INSERT INTO rank_tb (game_id,category_id,player_id,score_id,order_num,kind_num,ranking) VALUES(?,?,?,?,?,?,?)"
const selectRank = "SELECT * FROM rank_tb WHERE game_id = ? AND category_id = ?";
const updateRank = "UPDATE rank_tb SET ranking = ? WHERE player_id = ? AND kind_num = ? AND category_id = ?";
router.post('/:game_id/:category_id', (req, res, next) => {
    var game_id = req.params.game_id;
    var category_id = req.params.category_id;
    var rank = req.body.rank;
    var player_id = req.body.player_id;
    var kind = req.body.kind;
    var order_num = req.body.order_num;
    var score_id = req.body.score_id;
    con.query(selectRank, [game_id, category_id], (err, results) => {
        if (results.length > 0) {
            for (let i = 0; i < rank.length; i++) {
                con.query(updateRank, [rank[i], player_id[i], kind[i], category_id], (err, results) => {
                    if (i == rank.length - 1) {
                        res.redirect('/result')
                    }
                });
            }
        } else {
            for (let i = 0; i < rank.length; i++) {
                con.query(insertRank, [game_id, category_id, player_id[i], score_id[i], order_num[i], kind[i], rank[i]], (err, results) => {
                    if (i == rank.length - 1) {
                        res.redirect('/result')
                    }
                });
            }
        }
    })
})
module.exports = router;