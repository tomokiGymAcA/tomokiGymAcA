const mysql = require("mysql");

const con = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: "root",
    //password: "sohgoh_2022_gym",
    password: "root",
    //database: "rhythmic_gym_db"
    database: "aca_db"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('Connected');
});

module.exports = {
    con
};