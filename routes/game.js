const router = require('express').Router();
const { con } = require("../lib/database/client.js");

const games = "SELECT * FROM game_tb WHERE game_id = ?";

router.get('/', (req, res) => {
    res.render('../views/set/game.ejs')
})

router.post('/', (req, res, next) => {
    var game_id = req.body.game_id;
    con.query(games, [game_id], (err, results) => {
        res.json(results);
    })

})

const INSERTgame = 'INSERT INTO game_tb(date_time, game_date, game_name) VALUES (?,?,?)';
router.post('/:set', (req, res, next) => {
    var game_date = req.body.game_date;
    var game_name = req.body.game_name;
    var date_time = req.body.date_time;
    var text;
    con.query(INSERTgame, [date_time, game_date, game_name], (err, results) => {
        if (err) {
            text = '登録に失敗しました。';
            res.render('../views/set/game.ejs', text)
        } else {
            text = '登録に成功しました。'
            res.render('../views/set/game.ejs', {
                text
            })
        }
    })
})

module.exports = router;