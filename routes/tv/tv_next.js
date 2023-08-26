const router = require('express').Router();

router.get('/:game', (req, res) => {
    var game = req.params.game;
    res.render('../views/tv/tv_next.ejs', {
        game
    })
})

module.exports = router;