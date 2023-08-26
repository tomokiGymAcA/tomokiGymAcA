const router = require('express').Router();
const { con } = require("../../lib/database/client.js");

router.get('/:game', (req, res) => {
    var game_id = req.params.game;
    // const selectgame = 'select * from game_tb where game_id = ?';
    res.render('../views/set/judge_change.ejs', {
        game_id
    })
})

router.get('/:game/:category', (req, res) => {
    var game = req.params.game;
    var category = req.params.category;
    con.query('select * from judge_tb where game_id = ? and category_id = ?', [game, category], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})

router.post('/', (req, res) => {
    var game = req.body.game;
    var category = req.body.category;
    var val = req.body.val;
    var colum = req.body.colum;
    var e_num = req.body.e_num;
    var d_num = req.body.d_num;
    con.query(`UPDATE judge_tb SET ${colum}=?, d_num = ?,e_num = ? WHERE game_id = ? AND category_id = ?`, [val, d_num, e_num, game, category], (err) => {
        if (err) throw err;
        res.json('ok');
    })
})



module.exports = router;