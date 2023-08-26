const router = require('express').Router();
const { con } = require("../../lib/database/client.js");

router.get('/:game', (req, res) => {
    var game_id = req.params.game;
    // const selectgame = 'select * from game_tb where game_id = ?';
    res.render('../views/set/finals.ejs', {
        game_id
    })
})

router.get('/:sel/:game', (req, res) => {

})

router.post('/', (req, res) => {
    var game_id = req.body.game_id;
    console.log(game_id);
    const judge_check = 'UPDATE order_tb SET judge_check = 0 WHERE game_id = ?';

    const UPDATE = 'UPDATE score_tb SET e1=0,e2=0,e3=0,e4=0,e_score=0,a1=0,a2=0,a3=0,a4=0,a_score=0,db=0,da=0,line1_ded=0,line2_ded=0,line_ded=0,time_ded=0,act_time=0,res_ded=0,all_ded=0,answer=0,d1=0,d2=0,d3=0,d4=0,d_score=0,e1_cnt=0,e2_cnt=0,e3_cnt=0,e4_cnt=0,a1_cnt=0,a2_cnt=0,a3_cnt=0,a4_cnt=0,da_cnt=0,db_cnt=0,line1_ded_cnt=0,line2_ded_cnt=0,time_ded_cnt=0,res_ded_cnt=0,d1_cnt=0,d2_cnt=0,d3_cnt=0,d4_cnt=0 WHERE game_id = ?';
    con.query(UPDATE, [game_id], (err, results) => {
        if (err) throw err;
        con.query(judge_check, [game_id], (err, results) => {
            if (err) throw err;

            res.json('ok');
        })
    })
})



module.exports = router;