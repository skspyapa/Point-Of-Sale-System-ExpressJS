"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const pool_connection_1 = require("./db/pool-connection");
const router = express.Router();
exports.default = router;
router.route("")
    .head(cors({
    allowedHeaders: "Customer-Count",
    exposedHeaders: "Customer-Count"
}), (req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        if (req.query.count === 'true') {
            connection.query('SELECT count(*) as `count` FROM customer', (err, results) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    res.end();
                    connection.release();
                    return;
                }
                res.setHeader("Customer-Count", results[0].count);
                res.status(200).json({});
                res.end();
                connection.release();
            });
        }
        else {
            res.sendStatus(400);
            res.end();
            connection.release();
        }
    });
})
    .get((req, res, next) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        if ("page" in req.query && "size" in req.query) {
            const page = +req.query.page;
            const size = +req.query.size;
            pool_connection_1.pool.query("SELECT * FROM customer LIMIT ?,?", [page * size, size], (err, results) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    res.end();
                    return;
                }
                pool_connection_1.pool.query("SELECT COUNT(*) AS `count` FROM customer ", (err1, results1) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500);
                        res.end();
                        return;
                    }
                    res.json(new Page([], results, {
                        number: page,
                        size: size,
                        totalElements: results1[0].count,
                        totalPages: results1[0].count / size
                    }));
                });
            });
        }
        else {
            next();
        }
    });
})
    .get(((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        connection.query('SELECT * FROM customer', (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                res.end();
                connection.release();
                return;
            }
            else {
                res.json(results);
                res.end();
                connection.release();
            }
        });
    });
}))
    .post((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        if (!(('id' in req.body) && ('name' in req.body) && ('address' in req.body))) {
            res.sendStatus(401);
            res.end();
            connection.release();
            return;
        }
        let sql = 'INSERT INTO customer values (?,?,?,?)';
        sql = connection.format(sql, [req.body.id, req.body.name, req.body.address, '78000']);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                res.end();
                connection.release();
                return;
            }
            else {
                res.status(results.affectedRows > 0 ? 201 : 500).json({});
                res.end();
                connection.release();
            }
        });
    });
});
router.route("/:id(C\\d{3})")
    .get((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        let sql = 'SELECT * FROM customer WHERE id=?';
        sql = connection.format(sql, [req.params.id]);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(401);
                res.end();
                connection.release();
                return;
            }
            else {
                res.json(results);
                res.end();
                connection.release();
            }
        });
    });
})
    .put((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        if (!(("id" in req.body) && ("name" in req.body) && ("address" in req.body) && ("salary" in req.body))) {
            res.sendStatus(400);
            res.end();
            connection.release();
            return;
        }
        let sql = 'UPDATE customer set name=?, address=? , salary =? where id=?';
        sql = connection.format(sql, [req.body.name, req.body.address, req.body.salary, req.body.id]);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                connection.release();
            }
            else {
                res.status(results.affectedRows > 0 ? 201 : 500).json({});
                res.end();
                connection.release();
            }
        });
    });
})
    .delete((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        let sql = 'DELETE FROM customer where id =?';
        sql = connection.format(sql, [req.params.id]);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(401);
                connection.release();
            }
            else {
                res.status(results.affectedRows > 0 ? 200 : 500).json({});
                res.end();
                connection.release();
            }
        });
    });
});
class Page {
    constructor(links, content, page) {
        this.links = links;
        this.content = content;
        this.page = page;
    }
}
exports.Page = Page;
