const router = require('express').Router();
const { con } = require("../../lib/database/client.js");

router.get('/:game', (req, res) => {
    var game_id = req.params.game;
    // const selectgame = 'select * from game_tb where game_id = ?';
    res.render('../views/set/player_edit.ejs', {
        game_id
    })
})

const selectPlayersScore = 'select * from player_tb INNER JOIN score_tb on player_tb.player_id = score_tb.player_id INNER JOIN order_tb on score_tb.order_id = order_tb.order_id WHERE player_tb.game_id = ? AND player_tb.category_id = ? AND score_tb.kind_num = ?';

router.get('/:game/:category/:kind', (req, res) => {
    var game_id = req.params.game;
    var category_id = req.params.category;
    var kind = req.params.kind;
    con.query(selectPlayersScore, [game_id, category_id, kind], (err, results) => {
        if (err || results.length == 0) {
            results = 'err';
            res.json(results)
        } else {
            res.json(results);
        }
    })
})


const updataPlayer = 'UPDATE `player_tb` SET `player_no`=?,`name`=?,`furigana`=?,`team`=?,`sub_team`=?,`team_furigana`=?,`team2`=?,`sub_team2`=?,`team2_furigana`=?,`age`=?,`category_id`=?,`abstention`=? WHERE `player_id` = ?'
const updateScore = 'UPDATE `score_tb` SET `e1`=?,`e2`=?,`e3`=?,`e4`=?,`e_score`=?,`e_top`=?,`line1_ded`=?,`line2_ded`=?,`time_ded`=?,`act_time`=?,`res_ded`=?,`all_ded`=?,`answer`=?,`d1`=?,`d2`=?,`d3`=?,`d4`=?,`d_score`=?,`d_top`=? WHERE `player_id` = ? AND `kind_num` = ?'
const resetScore = 'UPDATE score_tb SET e1=0,e2=0,e3=0,e4=0,e_score=0,a1=0,a2=0,a3=0,a4=0,a_score=0,db=0,da=0,line1_ded=0,line2_ded=0,line_ded=0,time_ded=0,act_time=0,res_ded=0,all_ded=0,answer=0,d1=0,d2=0,d3=0,d4=0,d_score=0,e1_cnt=0,e2_cnt=0,e3_cnt=0,e4_cnt=0,a1_cnt=0,a2_cnt=0,a3_cnt=0,a4_cnt=0,da_cnt=0,db_cnt=0,line1_ded_cnt=0,line2_ded_cnt=0,time_ded_cnt=0,res_ded_cnt=0,d1_cnt=0,d2_cnt=0,d3_cnt=0,d4_cnt=0 WHERE player_id = ?';

router.post('/', (req, res) => {
    var sql = req.body.sql;
    var player_id = req.body.player_id;
    var kind = req.body.kind;
    var data = JSON.parse(req.body.dataset);
    // // UTF-8テキストをバイト配列に変換
    // const utf8Encoder = new TextEncoder();
    // const utf8Bytes = utf8Encoder.encode(data.name);

    // console.log(utf8Bytes)
    // // バイト配列をShift_JISに変換
    // const sjisDecoder = new TextDecoder("Shift_JIS");
    // const sjisText = sjisDecoder.decode(utf8Bytes);


    if (sql == 'edit') {
        con.query(updataPlayer, [data.player_no || null, data.name, data.furigana || null, data.team || null, data.sub_team || null, data.team_furigana || null, data.team2 || null, data.sub_team2 || null, data.team2_furigana || null, data.age || null, data.category_id || null, data.abstention || null, player_id], (err) => {
            if (err) {
                throw err
                res.json('err');
            } else {
                con.query(updateScore, [data.e1, data.e2, data.e3, data.e4, data.e_score, data.e_top, data.line1_ded, data.line2_ded, data.time_ded, data.act_time, data.res_ded, data.all_ded, data.answer, data.d1, data.d2, data.d3, data.d4, data.d_score, data.d_top, player_id, kind], (err) => {
                    if (err) throw err;
                    res.json('ok');
                })
            }
        })
    } else if (sql == 'reset') {
        con.query(resetScore, [player_id], (err) => {
            if (err) {
                res.json('err');
            } else {
                res.json('ok')
            }
        })
    }
})




module.exports = router;