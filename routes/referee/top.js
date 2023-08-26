const router = require('express').Router();
const { judgeName } = require('../../public/javascripts/function/judge_name');
const { con } = require("../../lib/database/client.js");
const games = "SELECT * FROM game_tb WHERE game_id = ?";
const fs = require('node:fs');

router.get('/:game_id/:judge', (req, res) => {
    var room = 'allRef'
    var judge = req.params.judge;
    var judge_name = judgeName(judge);
    var game_id = req.params.game_id;
    con.query(games, [game_id], (err, results) => {
        game_data = results;
        res.render('../views/referee/top.ejs', {
            game_id,
            judge,
            judge_name,
            room,
            game_data
        });
    })
});
const SlectPlayersData = `SELECT * FROM player_tb pt INNER JOIN category_tb ct ON pt.category_id = ct.category_id INNER JOIN order_tb ot ON ot.player_id = pt.player_id INNER JOIN score_tb st ON st.order_id = ot.order_id  WHERE pt.game_id = ? ORDER BY st.kind_num ASC`;
const kokutaiPlayer = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id INNER JOIN team_tb ON team_tb.player_id = player_tb.player_id AND team_tb.play_kind = order_tb.kind_num INNER JOIN score_tb ON score_tb.order_id = order_tb.order_id WHERE player_tb.game_id = ? ORDER BY order_tb.order_num ASC';
const kokutaiTeam = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id INNER JOIN score_tb ON  score_tb.order_id = order_tb.order_id WHERE player_tb.game_id = ? AND order_tb.kind_num = 5 ORDER BY order_tb.order_num ASC';

const selectGameType = 'SELECT order_type FROM game_tb WHERE game_id = ?';
// オーダー順、得点表
router.post('/:game/:judge', (req, res) => {
    var game_id = req.body.game_id;
    var kind = req.body.kind || 0;

    con.query(selectGameType, [game_id], (err, results) => {
        var orderType = results[0].order_type;
        if (orderType == 3 || orderType == 1) {
            con.query(SlectPlayersData, [game_id], (err, results) => {

                if (err) throw err;
                res.json(results);
            })
        } else if (orderType == 2) {
            con.query(kokutaiPlayer, [game_id], (err, results) => {
                if (err) throw err;
                var kokutai = results;
                con.query(kokutaiTeam, [game_id], (err, results) => {
                    kokutai = kokutai.concat(results);
                    res.json(kokutai);
                })
            })
        } else if (orderType == 1) {

        }
    })


});
// サイドバーJSON作成
const playersJOINorderKind = 'SELECT * FROM player_tb INNER JOIN order_tb ON player_tb.player_id = order_tb.player_id WHERE player_tb.game_id = ? AND order_tb.kind_num = ? ORDER BY order_tb.order_num ASC';
router.get('/:game_id', (req, res) => {
    var game_id = req.params.game_id;
    con.query(games, [game_id], (err, results) => {
        res.json(
            results
        );
    })
});

//順位
const selectScoreKind = 'SELECT * FROM player_tb LEFT OUTER JOIN score_tb ON score_tb.player_id = player_tb.player_id LEFT OUTER JOIN order_tb ON score_tb.order_id = order_tb.order_id WHERE player_tb.category_id = ? AND score_tb.game_id = ? AND score_tb.kind_num = ? order by score_tb.answer desc';
const selectScoreALL = 'SELECT pt.player_id, pt.name, pt.team, pt.sub_team, st.kind_num, st.e_score ,st.da, st.db, st.a_score, st.answer, st.all_ded, st.d_score FROM player_tb pt LEFT OUTER JOIN score_tb st ON st.player_id = pt.player_id where pt.category_id = ? AND st.game_id = ? and  st.player_id in (select st.player_id from score_tb group by st.player_id)';
const selectScoreKokutai = 'SELECT pt.player_id, pt.name, pt.team, pt.sub_team, st.kind_num, st.e_score ,st.da, st.db, st.a_score, st.answer, st.all_ded, st.d_score, tt.menber_name FROM player_tb pt LEFT OUTER JOIN score_tb st ON st.player_id = pt.player_id LEFT OUTER JOIN team_tb tt ON st.kind_num = tt.play_kind AND st.player_id = tt.player_id where pt.category_id = ? AND st.game_id = ? and  st.player_id in (select st.player_id from score_tb group by st.player_id)';
router.get('/:game_id/:judge/:kind/:category_id', (req, res) => {
    var game_id = req.params.game_id;
    var kind = req.params.kind;
    var category_id = req.params.category_id


    if (kind != 'kokutai') {
        var rast = kind.slice(-1);
        var kind_num = rast.charAt(0)
        if (kind_num == 8) {
            con.query(selectScoreALL, [category_id, game_id], (err, results) => {
                if (err) throw err;

                var new_all;
                new_all = [...new Set(all(results).map(JSON.stringify))].map(JSON.parse);
                new_all = new_all.sort(function (first, second) {
                    return second.total - first.total;
                });
                res.json(
                    new_all
                );
            })
        } else {
            con.query(selectScoreKind, [category_id, game_id, kind_num], (err, results) => {
                if (err) throw err;
                results = results.sort(function (first, second) {
                    if (second.answer == first.answer) {
                        if (second.e_score == first.e_score) {
                            if (second.a_score == first.a_score) {
                                return (second.da + second.db) - (first.da + first.db);
                            } else {
                                return second.a_score - first.a_score;
                            }
                        } else {
                            return second.e_score - first.e_score;
                        }
                    } else {
                        return second.answer - first.answer;
                    }
                })
                res.json(
                    results
                );
            })
        }

    } else {
        var data;
        data = fs.readFileSync(`./public/json/game_json${game_id}_${category_id}.json`)
        data = JSON.parse(data);
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.json(data)
    }
});

var allD = [];

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


module.exports = router;