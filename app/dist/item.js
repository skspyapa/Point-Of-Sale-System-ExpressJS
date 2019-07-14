"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.json());
// const connection = mysql.createConnection({
//     host: "localhost",
//     port: 3306,
//     database: "thogakade",
//     user: "root",
//     password: "123456"
// });
var pool = mysql.createPool({
    connectionLimit: 10,
    queueLimit: 10,
    waitForConnections: true,
    host: "localhost",
    user: "root",
    password: "123456",
    database: "thogakade"
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.get("/api/v1/items", function (req, res) {
        connection.query("SELECT * FROM item", function (error, results) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            res.json(results);
        });
    });
    // When done with the connection, release it.
    connection.release();
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.get("/api/v1/items/:code(P\\d{3})", function (req, res) {
        var sql = "SELECT * FROM item WHERE code=?";
        sql = connection.format(sql, [req.params.code]);
        connection.query(sql, function (err, results) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            if (results.length > 0) {
                res.json(results[0]);
            }
            else {
                res.sendStatus(404);
            }
        });
    });
    // When done with the connection, release it.
    connection.release();
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.put("/api/v1/items/:code(P\\d{3})", function (req, res) {
        // res.send("Update a customer " + req.params.id);
        var sql = "UPDATE item set description=? , unitPrice=? , qtyOnHand=? where code=?";
        sql = connection.format(sql, [req.body.description, req.body.unitPrice, req.body.qtyOnHand, req.body.code]);
        connection.query(sql, function (err, results) {
            if (err) {
                console.log(err);
                res.sendStatus(400);
                return;
            }
            res.sendStatus(200);
        });
    });
    // When done with the connection, release it.
    connection.release();
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.delete("/api/v1/items/:code(P\\d{3})", function (req, res) {
        // res.send("Delete a customer " + req.params.id);
        var sql = "DELETE FROM item WHERE code=?";
        sql = connection.format(sql, [req.params.code]);
        connection.query(sql, function (err, results) {
            if (err) {
                console.log(err);
                res.sendStatus(400);
                return;
            }
            res.sendStatus(200);
        });
    });
    // When done with the connection, release it.
    connection.release();
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.post("/api/v1/items", function (req, res) {
        if (!(("code" in req.body) && ("description" in req.body) && ("unitPrice" in req.body)) && (("qtyOnHand" in req.body))) {
            res.sendStatus(400);
            return;
        }
        var sql = "INSERT INTO item VALUES (?,?,?,?)";
        sql = connection.format(sql, [req.body.code, req.body.description, req.body.unitPrice, req.body.qtyOnHand]);
        connection.query(sql, function (err, results) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            res.sendStatus(results.affectedRows > 0 ? 201 : 500);
        });
    });
    // When done with the connection, release it.
    connection.release();
    // Handle error after the release.
});
app.listen(5000, function () {
    return console.log("Server is listening");
});
