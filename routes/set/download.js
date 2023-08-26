const router = require('express').Router();
const fs = require('node:fs');

// 各種設定ファイルダウンロード（csv）
router.post('/', (req, res) => {

    // ダウンロードするファイルのパス
    var filePath = `./public/sample_files/${req.body.filename}.csv`;
    // ファイルの存在をチェック
    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            res.status(404).send('File not found');
            return;
        }
        // ファイルの情報を取得
        const stat = fs.statSync(filePath);

        // レスポンスヘッダーを設定
        res.set({
            'Content-Length': stat.size,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${req.body.filename}.csv`
        });

        // ファイルをストリームとして読み取り、レスポンスに書き込む
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
});


module.exports = router;