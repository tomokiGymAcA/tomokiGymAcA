const router = require('express').Router();
const { con } = require("../../lib/database/client.js");

router.get('/', (req, res) => {
    res.render('../views/tv/tv.ejs');
})
module.exports = router;