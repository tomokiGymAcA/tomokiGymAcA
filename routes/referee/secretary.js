const router = require('express').Router();
const { judgeName } = require('../../public/javascripts/function/judge_name');
const { con } = require("../../lib/database/client.js");
const games = "SELECT * FROM game_tb WHERE game_id = ?";
const selectCategoryId = 'select * from category_tb where category_id = ?';
const fs = require('node:fs');


router.get('/:game_id/:judge', (req, res) => {
    var room = 'allRef'
    var category_id;
    var special;
    var judge = req.params.judge;
    var game_id = req.params.game_id;
    var judge_name = judgeName(judge);
    const selectgame = 'select * from game_tb where game_id = ?';
    con.query(selectgame, [game_id], (err, results) => {
        var game_data = results;
        res.render('../views/referee/secretary.ejs', {
            room,
            category_id,
            special,
            judge,
            game_id,
            judge_name,
            game_data
        });
    })
})

// サイドバーJSON作成
const playersJOINorderKind = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE player_tb.game_id = ? AND order_tb.kind_num = ? AND player_tb.category_id = ? ORDER BY order_tb.order_num ASC';
const kokutaiPlayer = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id INNER JOIN team_tb ON team_tb.player_id = player_tb.player_id AND team_tb.play_kind = order_tb.kind_num WHERE player_tb.game_id = ? AND player_tb.category_id = ? ORDER BY order_tb.order_num ASC';
const kokutaiTeam = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE player_tb.game_id = ? AND order_tb.kind_num = 5 ORDER BY order_tb.order_num ASC';
router.get('/:game_id/:kind/:category', (req, res) => {
    var game_id = req.params.game_id;
    var kind = req.params.kind;
    var category = req.params.category;
    if (kind != 8) {
        con.query(playersJOINorderKind, [game_id, kind, category], (err, results) => {
            if (results.length > 0) {
                res.json(
                    results
                );
            } else {
                let results = [{
                    game_id: 0,
                    errtext: '部門を変更してください'
                }];
                res.json(results);
            }
        })
    } else {
        con.query(kokutaiPlayer, [game_id, category], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                var kokutai = results;
                con.query(kokutaiTeam, [game_id], (err, results) => {
                    kokutai = kokutai.concat(results);
                    res.json(kokutai);
                })
            } else {
                let results = [{
                    game_id: 0,
                    errtext: '部門を変更してください'
                }];
                res.json(results);
            }
        })
    }
});
//json取得用
router.get('/:game_id/:player_id/:category/:kind_num', (req, res) => {
    var player_id = req.params.player_id;
    var category = req.params.category;
    var kind = req.params.kind_num;
    var scores = [{}];
    var resultAnswer;
    con.query(selectPlayerScore, [player_id, kind], (err, results) => {
        var e_point = Escore(results)
        var a_point = Ascore(results)
        var d_point = Dscore(results)
        var ded = results[0].line1_ded + results[0].line2_ded + results[0].time_ded + results[0].res_ded
        scores = [{
            player_id: player_id,
            kind_num: kind,
            category_id: category,
            order_id: results[0].order_id,
            e1: results[0].e1,
            e2: results[0].e2,
            e3: results[0].e3,
            e4: results[0].e4,
            e_top: results[0].e_top,
            a1: results[0].a1,
            a2: results[0].a2,
            a3: results[0].a3,
            a4: results[0].a4,
            a_top: results[0].a_top,
            d1: results[0].d1,
            d2: results[0].d2,
            d3: results[0].d3,
            d4: results[0].d4,
            d_top: results[0].d_top,
            db: results[0].db,
            da: results[0].da,
            line1_ded: results[0].line1_ded,
            line2_ded: results[0].line2_ded,
            act_time: results[0].act_time,
            time_ded: results[0].time_ded,
            res_ded: results[0].res_ded,
            e_point: e_point,
            a_point: a_point,
            d_point: d_point,
            e_score: (Number(results[0].e_top) + Number(e_point)),
            a_score: (Number(results[0].a_top) + Number(a_point)),
            d_score: (Number(results[0].d_top) + Number(d_point)),
            all_ded: ded,
            answer: resultAnswer,
            e1_cnt: results[0].e1_cnt,
            e2_cnt: results[0].e2_cnt,
            e3_cnt: results[0].e3_cnt,
            e4_cnt: results[0].e4_cnt,
            e_top_cnt: results[0].e_top_cnt,
            a1_cnt: results[0].a1_cnt,
            a2_cnt: results[0].a2_cnt,
            a3_cnt: results[0].a3_cnt,
            a4_cnt: results[0].a4_cnt,
            a_top_cnt: results[0].a_top_cnt,
            d1_cnt: results[0].d1_cnt,
            d2_cnt: results[0].d2_cnt,
            d3_cnt: results[0].d3_cnt,
            d4_cnt: results[0].d4_cnt,
            d_top_cnt: results[0].d_top_cnt,
            da_cnt: results[0].da_cnt,
            db_cnt: results[0].db_cnt,
            line1_cnt: results[0].line1_ded_cnt,
            line2_cnt: results[0].line2_ded_cnt,
            time_cnt: results[0].time_ded_cnt,
            res_cnt: results[0].res_ded_cnt
        }]
        res.json(scores)
    })
})
const selectPlayerScore = 'SELECT * FROM score_tb WHERE player_id = ? AND kind_num = ?';
// 通常選手取得
const playerJOINorder = 'SELECT * FROM player_tb LEFT OUTER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE order_tb.player_id = ? AND order_tb.kind_num = ?';
// 
const kokutaiPlayMenber = 'SELECT * FROM player_tb LEFT OUTER JOIN order_tb ON player_tb.player_id = order_tb.player_id INNER JOIN team_tb ON team_tb.player_id = player_tb.player_id AND team_tb.play_kind = order_tb.kind_num WHERE order_tb.player_id = ? AND order_tb.kind_num = ?';
const kokutaiDantai = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE player_tb.player_id = ? AND order_tb.kind_num = ?';

// 選手情報取得params 
router.get('/:game_id/:judge/:playerId/:category/:kind_num', (req, res) => {
    var player_id = req.params.playerId;
    var kind_num = req.params.kind_num;
    var category_id = req.params.category;
    var judge = req.params.judge
    var judge_name = judgeName(judge);
    var game_id = req.params.game_id
    var special;
    var room;
    var player;
    con.query(games, [game_id], (err, results) => {
        game_data = results;
    })

    if (kind_num.length == 2) {
        var play_kind = kind_num.charAt(0);
        kind_num = kind_num.charAt(1);
    }
    if (player_id != undefined) {
        if (kind_num != 8) {
            con.query(selectCategoryId, [category_id], (err, results) => {
                special = results[0].special;
                con.query(playerJOINorder, [player_id, kind_num], (err, results) => {
                    player = results;
                    res.render('../views/referee/secretary.ejs', {
                        player_id,
                        kind_num,
                        category_id,
                        judge,
                        judge_name,
                        game_id,
                        special,
                        room,
                        player
                    });
                })
            })
        } else {
            if (play_kind != 5) {
                con.query(kokutaiPlayMenber, [player_id, play_kind], (err, results) => {
                    player = results;
                    kind_num = play_kind;
                    res.render('../views/referee/secretary.ejs', {
                        player_id,
                        kind_num,
                        category_id,
                        judge,
                        judge_name,
                        game_id,
                        special,
                        room,
                        player
                    });
                })
            } else {
                con.query(kokutaiDantai, [player_id, 5], (err, results) => {
                    player = results;
                    kind_num = play_kind;
                    res.render('../views/referee/secretary.ejs', {
                        player_id,
                        kind_num,
                        category_id,
                        judge,
                        judge_name,
                        game_id,
                        special,
                        room,
                        player
                    });
                })
            }
        }
    }
})

//---------------------------------------------------------------------------------------------
//計算式　A　＆　E
function Escore(s) {
    var Escore;
    //計算用配列に代入
    var e_ary = [s[0].e1, s[0].e2, s[0].e3, s[0].e4];

    e_ary.sort(function (a, b) {
        return a - b;
    })

    e_ary.pop();
    e_ary.shift();

    //決定スコア計算
    //reduce
    Escore = e_ary.reduce((sum, element) => sum + element, 0) / 2;
    return Escore;
}

function Ascore(s) {
    var Ascore;
    var a_ary = [s[0].a1, s[0].a2, s[0].a3, s[0].a4];
    a_ary.sort(function (a, b) {
        return a - b;
    })

    a_ary.pop();
    a_ary.shift();


    Ascore = a_ary.reduce((sum, element) => sum + element, 0) / 2;
    return Ascore;
}

function Dscore(s) {
    var Dscore;
    var d_ary = [s[0].d1, s[0].d2, s[0].d3, s[0].d4];
    d_ary.sort(function (a, b) {
        return a - b;
    })
    d_ary.pop();
    d_ary.shift();
    Dscore = d_ary.reduce((sum, element) => sum + element, 0) / 2;
    return Dscore;
}


const updatePlayerAnswer = 'UPDATE score_tb SET e_score = ?, a_score = ?, line_ded = ?, all_ded = ?, answer = ?, d_score = ? WHERE player_id = ? AND kind_num = ?'
const selectScoreKokutai = 'SELECT pt.player_id, pt.name, pt.team, pt.sub_team, st.kind_num, st.e_score ,st.da, st.db, st.a_score, st.answer, st.all_ded, st.d_score, tt.menber_name FROM player_tb pt LEFT OUTER JOIN score_tb st ON st.player_id = pt.player_id LEFT OUTER JOIN team_tb tt ON st.kind_num = tt.play_kind AND st.player_id = tt.player_id where pt.category_id = ? AND st.game_id = ? and  st.player_id in (select st.player_id from score_tb group by st.player_id)';
const selectScoreALL = 'SELECT pt.player_id, pt.name, pt.team, pt.sub_team, st.kind_num, st.e_score ,st.da, st.db, st.a_score, st.answer, st.all_ded, st.d_score FROM player_tb pt LEFT OUTER JOIN score_tb st ON st.player_id = pt.player_id where pt.category_id = ? AND st.game_id = ? and  st.player_id in (select st.player_id from score_tb group by st.player_id)';


// 得点演算処理
router.post('/:game_id/:judge/:playerId/:category/:kind_num', postScore, judgeCheck, reqestGameData)

// 最終得点決定
function postScore(req, res, next) {
    var player_id = req.params.playerId;
    var kind_num = req.params.kind_num;
    var game_id = req.params.game_id;
    var category_id = req.params.category;
    var answer = req.body.answer;
    var e_score = req.body.e_score;
    var a_score = req.body.a_score;
    var all_ded = req.body.all_ded;
    var line_ded = req.body.line_ded;
    var d_score = req.body.d_score;
    var kokutai = req.body.kokutai;
    con.query(updatePlayerAnswer, [e_score, a_score, line_ded, all_ded, answer, d_score, player_id, kind_num], (err, results) => {
        if (kokutai == 8) {
            con.query(selectScoreKokutai, [category_id, game_id], (err, results) => {
                if (err) throw err;
                var new_all;
                new_all = [...new Set(kokutaiAll(results).map(JSON.stringify))].map(JSON.parse);
                new_all = new_all.sort(function (first, second) {
                    return second.total - first.total;
                });
                fs.writeFileSync(`./public/json/game_json${game_id}_${category_id}.json`, JSON.stringify(new_all), function (err) { console.log(err) })
                console.log('json UPD')
                next()
            })
        } else {
            next()
        }
    })
}
const UPDATEorderCheck = 'UPDATE order_tb SET judge_check = ? WHERE player_id = ? AND kind_num = ?';

// 採点済み記録
function judgeCheck(req, res, next) {
    var player_id = req.params.playerId;
    var kind_num = req.params.kind_num;

    con.query(UPDATEorderCheck, [1, player_id, kind_num], (err, results) => {
        if (err) throw (err)
        next();
    })
}

// 試合の得点データをデータベースから取得
function reqestGameData(req, res) {
    var judge = req.params.judge;
    var game = req.params.game_id;
    var category = req.params.category;
    var player_id = req.params.playerId;
    var kind = req.params.kind_num;
    var kokutai = req.body.kokutai;

    if (kokutai > 0) {
        res.redirect(`/secretary/${game}/${judge}/${player_id}/${category}/${kind}8`);
    } else {
        res.redirect(`/secretary/${game}/${judge}/${player_id}/${category}/${kind}`);
    }
}


var allD = [];
// 種目取得
function kindCheck(data, kind, score, id) {
    var res;
    data = data.filter(function (value) {
        return value.player_id === id && value.kind_num === kind;
    })
    res = Number(data.map(item => item[score]));
    if (!res) {
        res = 0;
    }
    return res
}
// 選手名取得（国体用）
function nameCheck(data, kind, score, id) {
    var res;
    data = data.filter(function (value) {
        return value.player_id === id && value.kind_num === kind;
    })
    res = data.map(item => item[score]);
    if (!res) {
        res = 0;
    }
    return res
}
// 国体用順位決定
function avgkind(data, id) {
    var avgary = [];

    for (var i = 1; i < 5; i++) {
        var newdata;
        newdata = data.filter(function (value) {
            return value.player_id === id && value.kind_num == i;
        })

        avgary.push(newdata[0].answer);
    }
    var cnt = avgary.filter(value => (value == 0))
    if (cnt.length != 4) {
        var avgcnt = 4 - cnt.length;
        var avg = Number((avgary.reduce((sum, element) => sum + element, 0)) / avgcnt).toFixed(3);

    } else {
        var avg = 0;
    }
    var dantaiscore = data.filter(function (value) {
        return value.player_id === id && value.kind_num == 5;
    })

    var score = Number(dantaiscore[0].answer) + Number(avg)
    return score
}

// 個人用Jsonファイル作成関数
function all(data) {
    let leng = data.length
    for (var i = 0; i < leng; i++) {
        allD[i] = {
            name: data[i].name,
            team: data[i].team,
            sub_team: data[i].sub_team,
            da1: kindCheck(data, 1, 'da', data[i].player_id),
            db1: kindCheck(data, 1, 'db', data[i].player_id),
            ds1: kindCheck(data, 1, 'd_score', data[i].player_id),
            es1: kindCheck(data, 1, 'e_score', data[i].player_id),
            as1: kindCheck(data, 1, 'a_score', data[i].player_id),
            ded1: kindCheck(data, 1, 'all_ded', data[i].player_id),
            ans1: kindCheck(data, 1, 'answer', data[i].player_id),
            da2: kindCheck(data, 2, 'da', data[i].player_id),
            db2: kindCheck(data, 2, 'db', data[i].player_id),
            ds2: kindCheck(data, 2, 'd_score', data[i].player_id),
            es2: kindCheck(data, 2, 'e_score', data[i].player_id),
            as2: kindCheck(data, 2, 'a_score', data[i].player_id),
            ded2: kindCheck(data, 2, 'all_ded', data[i].player_id),
            ans2: kindCheck(data, 2, 'answer', data[i].player_id),
            da3: kindCheck(data, 3, 'da', data[i].player_id),
            db3: kindCheck(data, 3, 'db', data[i].player_id),
            ds3: kindCheck(data, 3, 'd_score', data[i].player_id),
            es3: kindCheck(data, 3, 'e_score', data[i].player_id),
            as3: kindCheck(data, 3, 'a_score', data[i].player_id),
            ded3: kindCheck(data, 3, 'all_ded', data[i].player_id),
            ans3: kindCheck(data, 3, 'answer', data[i].player_id),
            da4: kindCheck(data, 4, 'da', data[i].player_id),
            db4: kindCheck(data, 4, 'db', data[i].player_id),
            ds4: kindCheck(data, 4, 'd_score', data[i].player_id),
            es4: kindCheck(data, 4, 'e_score', data[i].player_id),
            as4: kindCheck(data, 4, 'a_score', data[i].player_id),
            ded4: kindCheck(data, 4, 'all_ded', data[i].player_id),
            ans4: kindCheck(data, 4, 'answer', data[i].player_id),
            da5: kindCheck(data, 5, 'da', data[i].player_id),
            db5: kindCheck(data, 5, 'db', data[i].player_id),
            ds5: kindCheck(data, 5, 'd_score', data[i].player_id),
            es5: kindCheck(data, 5, 'e_score', data[i].player_id),
            as5: kindCheck(data, 5, 'a_score', data[i].player_id),
            ded5: kindCheck(data, 5, 'all_ded', data[i].player_id),
            ans5: kindCheck(data, 5, 'answer', data[i].player_id),
            total: kindCheck(data, 1, 'answer', data[i].player_id) + kindCheck(data, 2, 'answer', data[i].player_id) + kindCheck(data, 3, 'answer', data[i].player_id) + kindCheck(data, 4, 'answer', data[i].player_id)
        }
    }
    return allD;
}
// 国体用Jsonファイル作成関数
function kokutaiAll(data) {
    let leng = data.length
    for (var i = 0; i < leng; i++) {
        allD[i] = {
            name: data[i].name,
            team: data[i].team,
            sub_team: data[i].sub_team,
            da1: kindCheck(data, 1, 'da', data[i].player_id),
            db1: kindCheck(data, 1, 'db', data[i].player_id),
            ds1: kindCheck(data, 1, 'd_score', data[i].player_id),
            es1: kindCheck(data, 1, 'e_score', data[i].player_id),
            as1: kindCheck(data, 1, 'a_score', data[i].player_id),
            ded1: kindCheck(data, 1, 'all_ded', data[i].player_id),
            ans1: kindCheck(data, 1, 'answer', data[i].player_id),
            menber1: nameCheck(data, 1, 'menber_name', data[i].player_id),
            da2: kindCheck(data, 2, 'da', data[i].player_id),
            db2: kindCheck(data, 2, 'db', data[i].player_id),
            ds2: kindCheck(data, 2, 'd_score', data[i].player_id),
            es2: kindCheck(data, 2, 'e_score', data[i].player_id),
            as2: kindCheck(data, 2, 'a_score', data[i].player_id),
            ded2: kindCheck(data, 2, 'all_ded', data[i].player_id),
            ans2: kindCheck(data, 2, 'answer', data[i].player_id),
            menber2: nameCheck(data, 2, 'menber_name', data[i].player_id),
            da3: kindCheck(data, 3, 'da', data[i].player_id),
            db3: kindCheck(data, 3, 'db', data[i].player_id),
            ds3: kindCheck(data, 3, 'd_score', data[i].player_id),
            es3: kindCheck(data, 3, 'e_score', data[i].player_id),
            as3: kindCheck(data, 3, 'a_score', data[i].player_id),
            ded3: kindCheck(data, 3, 'all_ded', data[i].player_id),
            ans3: kindCheck(data, 3, 'answer', data[i].player_id),
            menber3: nameCheck(data, 3, 'menber_name', data[i].player_id),
            da4: kindCheck(data, 4, 'da', data[i].player_id),
            db4: kindCheck(data, 4, 'db', data[i].player_id),
            ds4: kindCheck(data, 4, 'd_score', data[i].player_id),
            es4: kindCheck(data, 4, 'e_score', data[i].player_id),
            as4: kindCheck(data, 4, 'a_score', data[i].player_id),
            ded4: kindCheck(data, 4, 'all_ded', data[i].player_id),
            ans4: kindCheck(data, 4, 'answer', data[i].player_id),
            menber4: nameCheck(data, 4, 'menber_name', data[i].player_id),
            da5: kindCheck(data, 5, 'da', data[i].player_id),
            db5: kindCheck(data, 5, 'db', data[i].player_id),
            ds5: kindCheck(data, 5, 'd_score', data[i].player_id),
            es5: kindCheck(data, 5, 'e_score', data[i].player_id),
            as5: kindCheck(data, 5, 'a_score', data[i].player_id),
            ded5: kindCheck(data, 5, 'all_ded', data[i].player_id),
            ans5: kindCheck(data, 5, 'answer', data[i].player_id),
            menber5: data[i].name,
            total: avgkind(data, data[i].player_id)
        }
    }
    return allD;
}


// 個別得点編集
router.post('/', (req, res) => {
    let kind = req.body.kind_num;
    let player_id = req.body.player_id;
    let colum = req.body.colum;
    let score = req.body.score;
    let category = req.body.category;
    let game = req.body.game_id;
    let judge = req.body.judge;
    var kokutai = req.body.kokutai;
    var cnt = (Number(req.body.cnt) + 1);
    con.query(`UPDATE score_tb SET ${colum} = ? ,${colum}_cnt = ? WHERE player_id = ? AND kind_num = ?`, [score, cnt, player_id, kind], (err, results) => {
        if (err) throw (err);
        if (kokutai > 0) {
            res.redirect(`/secretary/${game}/${judge}/${player_id}/${category}/${kind}8`);
        } else {
            res.redirect(`/secretary/${game}/${judge}/${player_id}/${category}/${kind}`);

        }
    })
})

// キケン登録
router.post('/:abstention', (req, res) => {
    let player_id = req.body.player_id;
    con.query('UPDATE player_tb SET abstention = 1 WHERE player_id = ?', [player_id], (err, results) => {
        if (err) {
            var data = [{
                id: 1,
                text: '正常に登録できませんでした。担当者にお問い合わせください。'
            }]
            res.json(data)
        } else {
            var data = [{
                id: 2,
                text: '完了'
            }]
            res.json(data)

        }
    })
})
module.exports = router;