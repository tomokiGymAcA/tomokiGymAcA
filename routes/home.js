const router = require('express').Router();
const { judgeName } = require('../public/javascripts/function/judge_name');
const { con } = require("../lib/database/client.js");

const game = "SELECT * FROM game_tb ";
const games = "SELECT * FROM game_tb WHERE game_id = ?";
router.get('/', (req, res) => {
    con.query(game, (err, results) => {
        res.render('../views/home.ejs', { games: results });
    })
});



router.post('/', (req, res, next) => {
    var judge = req.body.judge;
    var game_id = req.body.game_id;

    if (judge == 1) {
        res.redirect(`/top/${game_id}/${judge}`);
    } else if (judge == 2) {
        res.redirect(`/program/${game_id}/${judge}`);
    } else if (judge == 10) {
        res.redirect(`/top_score/${game_id}/${judge}`);
    } else if (judge > 20 && judge < 30) {
        res.redirect(`/secretary/${game_id}/${judge}`);
    } else if (judge > 30 && judge < 70) {
        res.redirect(`/score/${game_id}/${judge}`);
    } else if (judge == 71) {
        res.redirect(`/timer/${game_id}/${judge}`)
    } else if (judge == 72) {
        res.redirect(`/score/${game_id}/${judge}`);
    }
})

module.exports = router;