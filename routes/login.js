const router = require('express').Router();
const { con } = require("../lib/database/client.js");


const selectUser = 'select * from user_tb where pass = ? and name = ?';

router.get('/', (req, res) => {
    res.render('../views/login.ejs')
})

router.post('/', (req, res) => {
    var name = req.body.user;
    var pass = req.body.pass;
    con.query(selectUser, [pass, name], (err, results) => {
        if (err) throw err;
        if (results.length == 0) {
            res.json('batu');
        } else {
            res.json('ok');
        }
    })
})

module.exports = router;