const router = require('express').Router();
const { con } = require("../../lib/database/client.js");
const dayjs = require('dayjs');
const fs = require("fs");
const csv = require("csv");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/csv/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage });

const selectGame = 'select * from game_tb where game_date = ?';

router.get('/', (req, res) => {
    res.render('../views/player/entry.ejs')
})

router.post('/:i', (req, res) => {
    var game_date = req.body.game_date;
    var game_day = dayjs(game_date).format("YYYY年MM月DD日");
    con.query(selectGame, [game_date], (err, results) => {
        if (results.length == 0) {
            var jj = [{
                game_id: 0,
                text_data: '<span>試合がありません</span>'
            }]
            res.json(jj)
        } else {
            res.json(results);
        }
    })
})

router.post('/', upload.single('file'), readUploadFile, redierct_file)
const insertPlayer = 'INSERT INTO player_tb (game_id, name, furigana, team,sub_team, team_furigana, team2,sub_team2, team2_furigana, age, sex, category_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
const insertOrder = 'INSERT INTO order_tb (player_id, game_id, kind_num, order_num, program_order) VALUES(?,?,?,?,?)';
const insertScore = 'INSERT INTO score_tb (player_id, game_id, order_id, kind_num) VALUES(?,?,?,?)';

function readUploadFile(req, res, next) {
    var file_name = req.file.originalname;
    fs.createReadStream(`public/csv/${file_name}`)
        .pipe(csv.parse({ columns: true }, function(err, data) {
            for (let i = 0; i < data.length; i++) {
                con.query(insertPlayer, [data[i].game_id, data[i].name, data[i].furigana, data[i].team, data[i].sub_team, data[i].team_furigana, data[i].team2, data[i].sub_team2, data[i].team2_furigana, data[i].age, data[i].sex, data[i].category], (err) => {
                    if (err) throw (err);
                    con.query('SELECT player_id FROM player_tb WHERE game_id = ? AND name = ? AND team = ? AND category_id = ?', [data[i].game_id, data[i].name, data[i].team, data[i].category], (err, results) => {
                        var player_id = results[0].player_id;
                        check_score1(data, player_id, i);
                        check_score2(data, player_id, i);
                        check_score3(data, player_id, i);
                        check_score4(data, player_id, i);
                        check_score5(data, player_id, i);
                        check_score6(data, player_id, i);
                        check_score7(data, player_id, i);
                    })
                })
            }
            next();
        }))
}

function check_score1(data, player_id, i) {
    if (data[i].kind1_order) {
        con.query(insertOrder, [player_id, data[i].game_id, 1, data[i].kind1_order, data[i].program_order], (err) => {
            if (err) throw (err);
            con.query('SELECT order_id FROM order_tb WHERE player_id = ? AND kind_num = ?', [player_id, 1], (err, results) => {
                con.query(insertScore, [player_id, data[0].game_id, results[0].order_id, 1])
            })
        })
    }
}

function check_score2(data, player_id, i) {
    if (data[i].kind2_order) {
        con.query(insertOrder, [player_id, data[i].game_id, 2, data[i].kind2_order, data[i].program_order], (err) => {
            if (err) throw (err);
            con.query('SELECT order_id FROM order_tb WHERE player_id = ? AND kind_num = ?', [player_id, 2], (err, results) => {
                con.query(insertScore, [player_id, data[0].game_id, results[0].order_id, 2])
            })
        })
    }
}

function check_score3(data, player_id, i) {
    if (data[i].kind3_order) {
        con.query(insertOrder, [player_id, data[i].game_id, 3, data[i].kind3_order, data[i].program_order], (err) => {
            if (err) throw (err);
            con.query('SELECT order_id FROM order_tb WHERE player_id = ? AND kind_num = ?', [player_id, 3], (err, results) => {
                con.query(insertScore, [player_id, data[0].game_id, results[0].order_id, 3])
            })
        })
    }
}

function check_score4(data, player_id, i) {
    if (data[i].kind4_order) {
        con.query(insertOrder, [player_id, data[i].game_id, 4, data[i].kind4_order, data[i].program_order], (err) => {
            if (err) throw (err);
            con.query('SELECT order_id FROM order_tb WHERE player_id = ? AND kind_num = ?', [player_id, 4], (err, results) => {
                con.query(insertScore, [player_id, data[0].game_id, results[0].order_id, 4])
            })
        })
    }
}

function check_score5(data, player_id, i) {
    if (data[i].kind5_order) {
        con.query(insertOrder, [player_id, data[i].game_id, 5, data[i].kind5_order, data[i].program_order], (err) => {
            if (err) throw (err);
            con.query('SELECT order_id FROM order_tb WHERE player_id = ? AND kind_num = ?', [player_id, 5], (err, results) => {
                con.query(insertScore, [player_id, data[0].game_id, results[0].order_id, 5])
            })
        })
    }
}

function check_score6(data, player_id, i) {
    if (data[i].kind6_order) {
        con.query(insertOrder, [player_id, data[i].game_id, 6, data[i].kind6_order, data[i].program_order], (err) => {
            if (err) throw (err);
            con.query('SELECT order_id FROM order_tb WHERE player_id = ? AND kind_num = ?', [player_id, 6], (err, results) => {
                con.query(insertScore, [player_id, data[0].game_id, results[0].order_id, 6])
            })
        })
    }
}

function check_score7(data, player_id, i) {
    if (data[i].kind7_order) {
        con.query(insertOrder, [player_id, data[i].game_id, 7, data[i].kind7_order, data[i].program_order], (err) => {
            if (err) throw (err);
            con.query('SELECT order_id FROM order_tb WHERE player_id = ? AND kind_num = ?', [player_id, 7], (err, results) => {
                con.query(insertScore, [player_id, data[0].game_id, results[0].order_id, 7])
            })
        })
    }
}

function redierct_file(req, res, next) {
    res.redirect('/entry');
}

module.exports = router;