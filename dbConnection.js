// let mysql = require("mysql2");

// var con = mysql.createConnection({
//     host : "localhost",
//     user : "root",
//     password : "shiper",
//     database : "shiperdb"
// });


// module.exports = con;

const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "project"
});

module.exports = pool.promise();
