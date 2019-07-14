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
    host: "localhost",
    user: "root",
    password: "123456",
    database: "thogakade"
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.get("/api/v1/customers", function (req, res, next) {
        connection.query("SELECT * FROM customer", function (err, results) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            res.json(results);
        });
        if ("page" in req.query && "size" in req.query) {
            connection.query("SELECT * FROM customer limit ?,?", [+req.query.page * req.query.size, +req.query.size], function (err, results) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }
                connection.query("SELECT count(*) as count from customer", function (err, results1) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    res.json(new CustomerPage([], results, {
                        number: +req.query.page,
                        size: +req.query.size,
                        totalElements: results1[0].count,
                        totalPages: results1[0].count / +req.query.size
                    }));
                });
            });
        }
        else {
            next();
        }
    });
    // When done with the connection, release it.
    connection.release();
    // Handle error after the release.
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.get("/api/v1/customers/:id(C\\d{3})", function (req, res) {
        var sql = "SELECT * FROM customer WHERE id=?";
        sql = connection.format(sql, [req.params.id]);
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
    // Handle error after the release.
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.delete("/api/v1/customers/:id(C\\d{3})", function (req, res) {
        // res.send("Delete a customer " + req.params.id);
        var sql = "DELETE FROM customer WHERE id=?";
        sql = connection.format(sql, [req.params.id]);
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
    // Handle error after the release.
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.put("/api/v1/customers/:id(C\\d{3})", function (req, res) {
        // res.send("Update a customer " + req.params.id);
        var sql = "UPDATE customer set name=? , address=? , salary=? where id=?";
        sql = connection.format(sql, [req.body.name, req.body.address, req.body.salary, req.body.id]);
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
    // Handle error after the release.
});
pool.getConnection(function (err, connection) {
    if (err)
        throw err; // not connected!
    // Use the connection
    app.post("/api/v1/customers", function (req, res) {
        if (!(("id" in req.body) && ("name" in req.body) && ("address" in req.body) && ("salary" in req.body))) {
            res.sendStatus(400);
            return;
        }
        var sql = "INSERT INTO customer VALUES (?,?,?,?)";
        sql = connection.format(sql, [req.body.id, req.body.name, req.body.address, req.body.salary]);
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
var CustomerPage = /** @class */ (function () {
    function CustomerPage(links, content, page) {
        this.links = links;
        this.content = content;
        this.page = page;
    }

    return CustomerPage;
}());
exports.CustomerPage = CustomerPage;
app.listen(5000, function () {
    console.log("Server Listen to 5000");
});
