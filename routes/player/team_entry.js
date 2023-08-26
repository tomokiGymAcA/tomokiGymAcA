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
    res.render('../views/player/team_entry.ejs')
})

router.post('/:i', (req, res) => {
    var game_date = req.body.game_date;
    var game_day = dayjs(game_date).format("YYYY年MM月DD日");
    console.log(game_day);
    con.query(selectGame, [game_date], (err, results) => {
        if (results.length == 0) {
            var jj = [{
                game_id: 0,
                text_data: '<span>試合がありません</span>'
            }]
            res.json(jj)
        } else {
            console.log(results)
            res.json(results);
        }
    })
})

router.post('/', upload.single('file'), readUploadFile, redierct_file)
const insertteammenber = 'INSERT INTO team_tb (player_id,menber_name,play_kind) VALUES (?,?,?)';

function readUploadFile(req, res, next) {
    var file_name = req.file.originalname;
    fs.createReadStream(`public/csv/${file_name}`)
        .pipe(csv.parse({ columns: true }, function(err, data) {
            for (let i = 0; i < data.length; i++) {
                con.query(insertteammenber, [data[i].player_id, data[i].menber_name, data[i].play_kind], (err) => {
                    if (err) throw (err);
                })
            }
            next();
        }))
}



function redierct_file(req, res, next) {
    res.redirect('/team_entry');
}

module.exports = router;