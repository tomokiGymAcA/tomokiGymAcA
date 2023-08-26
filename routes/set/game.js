const router = require('express').Router();
const { con } = require("../../lib/database/client.js");

const selectGame = 'select * from game_tb where game_id = ?';
const selectCategory = 'select * from category_tb where game_id = ?';
router.get('/', (req, res) => {
    res.render('../views/set/game.ejs')
})

const insert = 'insert into game_tb (date_time, game_date, game_name, e_method, a_method, d_method, order_type) values (?,?,?,?,?,?,?)';
router.post('/:game/:data', (req, res) => {
    var date = req.body.date_time;
    var game_date = req.body.game_date;
    var game_name = req.body.game_name;
    var e_method = req.body.e_method;
    var a_method = req.body.a_method;
    var d_method = req.body.d_method;
    var order_type = req.body.order_type;
    con.query(insert, [date, game_date, game_name, e_method, a_method, d_method, order_type], (err, results) => {
        if (err) throw err;
        res.redirect('/game');
    })

})

router.post('/:game_id', (req, res) => {
    let game_id = req.params.game_id;
    con.query(selectGame, [game_id], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json(results)
        } else {
            let errJson = [{
                game_id: 0,
                errtext: '試合データが正常ではありません'
            }]
            res.json(errJson);
        }
    })
})

module.exports = router;