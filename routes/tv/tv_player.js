const router = require('express').Router();
const fs = require('node:fs');
const { con } = require("../../lib/database/client.js");


router.get('/', (req, res) => {
    res.render('../views/tv/tv_player.ejs')
});
router.post('/', (req, res) => {

    var data = JSON.parse(fs.readFileSync('./json/tv_json.json') || "null");
    res.json(data)
});
router.get('/:game/:num', (req, res) => {
    var game = req.params.game;
    var num = req.params.num;
    res.render('../views/tv/tv_player.ejs', {
        game,
        num
    })
})

const playerJOINscore = 'SELECT * FROM score_tb LEFT OUTER JOIN player_tb ON player_tb.player_id = score_tb.player_id LEFT OUTER JOIN order_tb ON order_tb.player_id = player_tb.player_id WHERE score_tb.player_id = ? AND score_tb.kind_num = ? AND order_tb.kind_num = ?';

router.get('/:player_id/:kind_num/:id', (req, res) => {
    var player_id = req.params.player_id;
    var kind_num = req.params.kind_num;
    con.query(playerJOINscore, [player_id, kind_num, kind_num], (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})




module.exports = router;