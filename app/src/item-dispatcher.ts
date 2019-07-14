import express = require("express");
import {pool} from "./db/pool-connection";
import {Page} from "./customer-dispatcher"
import cors = require("cors");
const router=express.Router();

export default router;

router.route("")

    .head(cors({
        allowedHeaders: "Item-Count",
        exposedHeaders: "Item-Count"
    }),(req, res) => {

    pool.getConnection(function (err, connection) {
        if(err){
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        if (req.query.count==='true') {
            connection.query('SELECT count(*) as `count` FROM item', (err, results) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    res.end();
                    connection.release();
                    return;
                }
                console.log(results[0].count);
                res.setHeader("Item-Count", results[0].count);
                res.status(200).json({});
                res.end();
                connection.release();
            });
        }else {
            res.sendStatus(400);
            res.end();
            connection.release();
        }
    });

})
    .get((req, res,next) => {

        pool.getConnection(function (err, connection) {
            if(err){
                console.log(err);
                res.sendStatus(500);
                connection.release();
                return;
            }
            if ("page" in req.query && "size" in req.query) {
                const page = +req.query.page;
                const size = +req.query.size;

                pool.query("SELECT * FROM item LIMIT ?,?", [page * size, size], (err, results) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500);
                        res.end();
                        return;
                    }
                    pool.query("SELECT COUNT(*) AS `count` FROM item ", (err1, results1) => {
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

            } else {
                next();
            }
          });
    })

.get((req, res) => {

    pool.getConnection(function (err, connection) {
        if(err){
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }

        connection.query('SELECT * FROM item', (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                res.end();
                connection.release();
                return;
            } else {
                res.json(results);
                res.end();
                connection.release();
            }
        });
    });
})
.post((req, res) => {

    pool.getConnection(function (err, connection) {
        if(err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        if (!(('code' in req.body) && ('description' in req.body) && ('qtyOnHand' in req.body) && ('unitPrice' in req.body))) {
            res.sendStatus(401);
            res.end();
            connection.release();
            return;
        }

        let sql = 'INSERT INTO item values (?,?,?,?)';
        sql = connection.format(sql, [req.body.code, req.body.description, req.body.qtyOnHand, req.body.unitPrice]);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                res.end();
                connection.release();
                return;
            } else {
                res.status(201).json({});
                res.end();
                connection.release();
            }
        });
    });

});

router.route('/:code(P\\d{3})')

    .get((req, res) => {

    pool.getConnection(function (err, connection) {
        if(err){
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }

        let sql = 'SELECT * FROM item WHERE code=?';
        sql = connection.format(sql, [req.params.code]);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(401);
                res.end();
                return;
            } else {
                res.sendStatus(200).json(results);
                res.end();
            }
        });
    });

})

.put((req, res) => {

    pool.getConnection(function (err, connection) {
        if(err){
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }

        if (!(("code" in req.body) && ("description" in req.body) && ("qtyOnHand" in req.body) && ("unitPrice" in req.body))) {

            res.sendStatus(400);
            res.end();
            connection.release();
            return;
        }

        let sql = 'UPDATE item set description=?, qtyOnHand=? , unitPrice =? where code=?';
        sql = connection.format(sql, [req.body.description, req.body.qtyOnHand, req.body.unitPrice, req.body.code]);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                res.end();
                connection.release();
            } else {
                res.status(201).json({});
                res.end();
                connection.release();
            }
        });

    });
})

.delete((req, res) => {
    pool.getConnection(function (err, connection) {
        if(err){
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        let sql = 'DELETE FROM item where code=?';
        sql = connection.format(sql, [req.params.code]);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
                res.end();
                connection.release();
            } else {
                res.status(200).json({});
                res.end();
                connection.release();
            }
        });
    });

});


