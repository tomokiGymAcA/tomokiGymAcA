require('dotenv').config();

const appconfig = require('./config/application.config');
const path = require("path");
const express = require('express'),
    app = express();

const server = require('http').createServer(app);

const bodyParser = require('body-parser');
const options = {
    cookie: false,
    serveClient: false,
    transports: ['websocket']
}
const io = require('socket.io')(server);
const cors = require('cors');


const fs = require('fs');

//public内のフォルダを読み込む
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/node_modules", express.static(path.join(__dirname, "/node_modules")));

//CORSセット
app.use(cors({
    origin: 'https:aca-ws.jp',
}))

app.use(express.urlencoded({ extended: false }));
//ejs読み込み
app.set("view engine", "ejs");
app.disable("x-powered-by");

//body-parser読み込み
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/', require('./routes/home'));

// 試合
app.use('/game', require('./routes/game'));
// 進行係
app.use('/program', require('./routes/referee/program'));
//審判画面
app.use('/score', require('./routes/referee/score'));
app.use('/judge', require('./routes/set/judge'));
// セクレタリー画面
app.use('/secretary', require('./routes/referee/secretary'));
// ==========================審判長画面======================================
// 速報リザルト
app.use('/top', require('./routes/referee/top'));
// 採点結果
app.use('/top_score', require('./routes/referee/top_score'));
// =========================================================================
// 選手登録画面
app.use('/entry', require('./routes/player/entry'));
app.use('/team_entry', require('./routes/player/team_entry'));
// テレビ設定
app.use('/tv', require('./routes/tv/tv_view'));
// センターテレビ　進行表示用
app.use('/tv_next', require('./routes/tv/tv_next'));
// 選手名　リザルト用　テレビ画面
app.use('/tv_player', require('./routes/tv/tv_player'));
// タイマー
app.use('/timer', require('./routes/referee/timer'));
// 各種設定ページ用login画面
app.use('/login', require('./routes/login'));
// 部門管理
app.use('/category', require('./routes/set/category'));
// テレビ管理画面
app.use('/admin', require('./routes/set/admin'));
// 大会登録
app.use('/game', require('./routes/set/game'));
// 順位確認管理用
app.use('/result', require('./routes/set/result'));
// 順位確認管理用
app.use('/finals', require('./routes/set/finals'));
// 各種設定ファイルダウンロード（csv）
app.use('/download', require('./routes/set/download'));
// 審判人数変更
app.use('/judge_change', require('./routes/set/judge_change'));
// 選手情報編集
app.use('/player_edit', require('./routes/set/player_edit'));
// テレビ編集
app.use('/tv_style_edit', require('./routes/set/tv_style_edit'));


app.get('/now_game/:game/:category', (req, res) => {
    var game = req.params.game;
    var category = req.params.category;
    var data;
    data = fs.readFileSync(`./public/json/game_json${game}_${category}.json`)
    data = JSON.parse(data);
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json(data)
});

const { kokutaiAll, all } = require('./public/javascripts/function/json_ary_func');
const { con } = require("./lib/database/client");
const selectScoreKokutai = 'SELECT pt.player_id, pt.name, pt.team, pt.sub_team, st.kind_num, st.e_score ,st.da, st.db, st.a_score, st.answer, st.all_ded, st.d_score, tt.menber_name FROM player_tb pt LEFT OUTER JOIN score_tb st ON st.player_id = pt.player_id LEFT OUTER JOIN team_tb tt ON st.kind_num = tt.play_kind AND st.player_id = tt.player_id where pt.category_id = ? AND st.game_id = ? and  st.player_id in (select st.player_id from score_tb group by st.player_id)';

app.get('/new_game/:game/:category', (req, res) => {
    var game = req.params.game;
    var category = req.params.category;
    var data;
    con.query(selectScoreKokutai, [category, game], (err, results) => {
        if (err) throw err;
        var new_all;
        new_all = [...new Set(kokutaiAll(results).map(JSON.stringify))].map(JSON.parse);
        new_all = new_all.sort(function (first, second) {
            return second.total - first.total;
        });
        fs.writeFileSync(`./public/json/game_json${game}_${category}.json`, JSON.stringify(new_all), function (err) { console.log(err) })
        res.send('ok')
    })

});

//socket通信
io.on('connection', (socket) => {
    nowtime = getNowYMDhmsStr();
    var room = '';
    // const rooms = io.of("/").adapter.rooms;
    socket.on('room-in', function (msg) {
        socket.join(msg.gameroom);
        socket.join(msg.judgeroom);
        socket.join(msg.judgetyperoom);

        nowtime = getNowYMDhmsStr();

        // 入室しているルーム名を確認する
        const rooms = Array.from(socket.rooms);
        console.log('入室しているルーム:', nowtime, rooms);

    });
    // 選手送信＝＝＝各デバイス
    socket.on('sensyuSousin', function (msg, gameroom) {
        io.to(gameroom).emit("ss", msg);
    });
    socket.on('game-set', function (msg) {
        io.emit('game-set', msg)
    });

    //＝＝＝＝＝＝＝＝＝＝＝＝＝ テレビ操作＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    socket.on('tv-go', function (msg) {
        io.emit('tv-go', msg)
    });
    socket.on('playing', function (msg) {
        io.emit('playing', msg)
    });

    socket.on('end', function (msg) {
        io.emit('end', msg)
    });
    socket.on('next', function (msg) {
        io.emit('next', msg)
    });
    // リロード
    socket.on('reload', (msg) => {
        io.emit('reload', msg)
    });
    // 得点決定
    socket.on('postScore', function (msg, room) {
        io.to(room).emit('postScore', msg)
    });
    socket.on('newTime', function (msg) {
        io.emit('newTime', msg);
    });
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

    // 各審判員決定点
    socket.on('score-result', function (msg, room) {
        io.to(room).emit('score-result', msg)
    });


    // 男子専用機能＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // 主審入力後
    socket.on('score-res', function (msg, room) {
        io.to(room).emit('score-res', msg);
    });
    // 主審共有用
    socket.on('score_send', function (msg, room) {
        io.to(room).emit('top-send', msg);
    });
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

    // セクレタリー＝＝＝＝＝＝＝＝審判デバイス操作＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ロック解除
    socket.on('unlock', function (msg, judgeroom) {
        io.to(judgeroom).emit('unlock', msg)
    });
    // 選手再送
    socket.on('playersend', function (msg, judgeroom) {
        io.to(judgeroom).emit('playersend', msg)
    });
    // セクレタリーページ遷移後確認
    socket.on('sendSocket', function (msg, gameroom) {
        io.to(gameroom).emit('sendSocket', msg)
    });
    // 審判得点編集
    socket.on('scoreChange', function (msg, room) {
        io.to(room).emit('scoreChange', msg);
    });
    // socket通信確認
    socket.on('socketback', function (msg, gameroom) {
        io.to(gameroom).emit('socketback', msg)
    });
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝


    // 審判＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // 審判員からセクレタリーへ送信
    socket.on('tokuten', function (msg, gameroom) {
        io.to(gameroom).emit('tokuten_get', msg)
    });
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝



    // 男子専用機能＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ＝＝＝＝＝＝＝＝カウントダウン＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // スタート
    socket.on('countDownStart', function (room) {
        io.to(room).emit('countDownStart')
    });
    // エンド
    socket.on('countDownEnd', function (room) {
        io.to(room).emit('countDownEnd')
    });
    //＝＝＝＝＝＝＝＝ タイマー＝＝＝＝＝＝＝＝＝
    // スタート
    socket.on('timerStart', function (room) {
        io.to(room).emit('timerStart')
    });
    // ストップ
    socket.on('timerStop', function (room) {
        io.to(room).emit('timerStop')
    });
    // リセット
    socket.on('timerReset', function (room) {
        io.to(room).emit('timerReset')
    });
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝



    // ==============管理画面＝＝＝＝＝＝＝＝＝＝＝＝＝
    // 呼び出し
    socket.on('call', function (msg, room) {
        io.to(room).emit('call', msg)
    });
    // 審判リロード
    socket.on('judgeReload', function (msg) {
        io.emit('judgeReload', msg)
    });
    // socket確認
    socket.on('check-go', function (msg, room) {
        io.to(room).emit('check', msg)
    });
    socket.on('check-return', function (msg, room) {
        io.to(room).emit('check-return', msg)
    });
    socket.on('btn-push', function () {
        io.emit('btn-push')
    });
    socket.on('judgechange', function () {
        io.emit('judgechange');
    })
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝



    // socketサーバ側＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    socket.on('err', function (msg, room) {
        console.log('err', msg)
    });
    socket.on('disconnecting', () => {
        const rooms = Array.from(socket.rooms);
        nowtime = getNowYMDhmsStr();
        console.log('切断されました。', nowtime, rooms);
    });
    socket.on('disconnect', () => {
        // 切断時にルームから退出する
        socket.rooms.forEach((room) => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });
    });
    socket.on("connect_error", () => {
        setTimeout(() => {
            socket.on('connect', () => { });
        }, 1000);
    });
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝


});

function getNowYMDhmsStr() {
    const date = new Date()
    const h = ("00" + date.getHours()).slice(-2)
    const m = ("00" + date.getMinutes()).slice(-2)

    return `${h}:${m}`
}
var nowtime;
//------------------------------------------------------RTR用処理

app.get('/score_json', (req, res) => {

    var data;

    data = fs.readFileSync('./routes/test.json')

    data = JSON.parse(data);
    res.setHeader('Access-Control-Allow-Origin', '*')
    /*res.setHeader('Access-Control-Request-Private-Network', 'true')
    res.setHeader('Access-Control-Allow-Private-Network', 'true')*/
    res.json(data)
})


// サーバーを起動するコードを貼り付けてください
server.listen(appconfig.PORT, () => {
    console.log(`Application listening at :${appconfig.PORT}`);
});

module.exports = app