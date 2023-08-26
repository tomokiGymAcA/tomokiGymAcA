const router = require('express').Router();
const { nextTick } = require('chillout');
const { con } = require("../../lib/database/client.js");

const selectGame = 'select * from game_tb where game_date = ?';
const selectCategory = 'select * from category_tb where game_id = ?';
const selectCategoryId = 'select * from category_tb where category_id = ?';
router.get('/', (req, res) => {
    var text = req.query.text || null;
    if (text == 'ok') {
        text = '正常に登録が完了しました。';
    } else if (text == 'err') {
        text = '登録中に問題が発生しました。';
    } else {
        text = '';
    }
    res.render('../views/set/category.ejs', { text })
})
router.get('/:id', (req, res) => {
    let category_id = req.params.id;
    con.query(selectCategoryId, [category_id], (err, results) => {
        if (results.length > 0) {
            res.json(results)
        } else {
            let errJson = [{
                game_id: 0,
                errtext: '部門を選択してください。'
            }]
            res.json(errJson);
        }
    })
})

router.post('/:id', (req, res) => {
    var game_date = req.body.game_date;
    var game_id = req.params.id;
    if (game_id == 0) {
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
    } else {
        con.query(selectCategory, [game_id], (err, results) => {
            if (results.length == 0) {
                var jj = [{
                    game_id: 0,
                    text_data: '<span>まだ登録されていません</span>'
                }]
                res.json(jj)
            } else {
                res.json(results);
            }
        })
    }
})
router.post('/', check)

function check(req, res, next) {
    const dataset = {
        game_id: req.body.game_id_field,
        category_name: req.body.category_name,
        category_id: req.body.category_id_field,
        kind1: req.body.kind1 || null,
        kind2: req.body.kind2 || null,
        kind3: req.body.kind3 || null,
        kind4: req.body.kind4 || null,
        kind5: req.body.kind5 || null,
        kind6: req.body.kind6 || null,
        kozin: req.body.kozin || null,
        kokutai: req.body.kokutai || null,
        special: req.body.special || null,
        program_number: req.body.program_number || null,
        tv_category: req.body.tv_category || null,
        tv_age: req.body.tv_age || null,
        sql: req.body.sql
    }
    var text;
    const updateCategory = 'UPDATE `category_tb` SET `category_name`=?,`kind1`=?,`kind2`=?,`kind3`=?,`kind4`=?,`kind5`=?,`kind6`=?,`kozin`=?,`kokutai`=?,`special`=? ,`program_number`=?,`tv_category`=?.`tv_age` = ? WHERE `category_id` = ?'
    const insertCategory = 'INSERT INTO `category_tb`(`game_id`, `category_name`, `kind1`, `kind2`, `kind3`, `kind4`, `kind5`, `kind6`, `kozin`, `kokutai`, `special`, `program_number`, `tv_category`, `tv_age`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    if (dataset.sql == 'insert') {
        insert(dataset)
    } else if (dataset.sql == 'update') {
        update(dataset)
    }
    function update(data) {
        con.query(updateCategory, [
            data.category_name,
            data.kind1,
            data.kind2,
            data.kind3,
            data.kind4,
            data.kind5,
            data.kind6,
            data.kozin,
            data.kokutai,
            data.special,
            data.program_number,
            data.tv_category,
            data.tv_age,
            data.category_id
        ], (err) => {
            if (err) {
                redirect_page_err()
            } else {
                redirect_page_ok()
            }
        })

    }
    function insert(data) {
        con.query(insertCategory, [
            data.game_id,
            data.category_name,
            data.kind1,
            data.kind2,
            data.kind3,
            data.kind4,
            data.kind5,
            data.kind6,
            data.kozin,
            data.kokutai,
            data.special,
            data.program_number,
            data.tv_category,
            data.tv_age
        ], (err) => {

            if (err) {
                redirect_page_err()
            } else {
                con.query('SELECT `category_id` FROM `category_tb` WHERE `game_id` = ? AND `category_name` = ?', [data.game_id, data.category_name], (err, results) => {
                    if (err) {
                        throw err
                        redirect_page_err()
                    } else {
                        con.query('insert into judge_tb (game_id, category_id) values (?,?)', [data.game_id, results[0].category_id], (err) => {
                            if (err) {
                                throw err
                                redirect_page_err()
                            } else {
                                redirect_page_ok()
                            }
                        })
                    }
                })
            }
        });
    }
    function redirect_page_ok() {
        res.redirect(`/category?text=ok`);
    }
    function redirect_page_err() {
        res.redirect(`/category?text=err`);
    }
}


module.exports = router;