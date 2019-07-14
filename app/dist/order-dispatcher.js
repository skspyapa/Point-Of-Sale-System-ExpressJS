"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const pool_connection_1 = require("./db/pool-connection");
const util_1 = require("./db/util");
const customer_dispatcher_1 = require("./customer-dispatcher");
const cors = require("cors");
const router = express.Router();
exports.default = router;
router.route("")
    .head(cors({
    allowedHeaders: "Order-Count",
    exposedHeaders: "Order-Count"
}), (req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (req.query.count === 'true') {
            connection.query('SELECT count(*) as `count` FROM orders', (err, results) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    res.end();
                    connection.release();
                    return;
                }
                res.setHeader("Order-Count", results[0].count);
                res.status(200).json({});
                res.end();
                connection.release();
            });
        }
        else if (req.query.maxOrderId === 'true') {
            connection.query('SELECT id FROM orders order by id desc Limit 1', (err, results) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    res.end();
                    connection.release();
                    return;
                }
                res.setHeader("maxOrderId", results[0].id);
                res.status(200).json({});
                res.end();
                connection.release();
            });
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
        if (("page" in req.query) && ("size" in req.query)) {
            const order = req.query.q;
            const page = +req.query.page;
            const size = +req.query.size;
            pool_connection_1.pool.query("SELECT orders.id,orders.date,orders.customer_Id as `customer_id`,sum(itemdetail.qty*itemdetail.unitPrice) as `sum` from orders  INNER JOIN itemdetail  where itemdetail.orderId=orders.id  && orders.id like ? group by orders.id LIMIT ?,?", [order + '%', page * size, size], (err, results) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    res.end();
                    return;
                }
                pool_connection_1.pool.query("SELECT COUNT(*) AS `count` FROM orders ", (err1, results1) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500);
                        res.end();
                        return;
                    }
                    res.json(new customer_dispatcher_1.Page([], results, {
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
    .get((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            connection.release();
            return;
        }
        connection.query('SELECT * FROM orders ', (err, results) => {
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
})
    .post((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        if (!(('id' in req.body) && ('date' in req.body) && ('customer_Id' in req.body) && ('itemDetailDTOS' in req.body) && (req.body.itemDetailDTOS.length > 0))) {
            res.sendStatus(400);
            res.end();
            return;
        }
        //
        // connection.beginTransaction(function(err) {
        //
        //     if (err) { console.log(err);
        //     connection.release();
        //     return;
        //     }
        //
        //     let sql1='INSERT INTO orders values (?,?,?)';
        //
        //     sql1=connection.format(sql1,[req.body.id,req.body.date,req.body.customer_Id]);
        //     connection.query(sql1, function (error, results) {
        //
        //         if (error) {
        //             return connection.rollback(function() {
        //                 console.log(error);
        //                 res.sendStatus(500);
        //                 res.end();
        //                 connection.release();
        //             });
        //         }else {
        //                 let i=0;
        //             req.body.itemDetailDTOS.forEach(function (itemDetail: ItemDetailDTO) {
        //
        //                 let sql2='INSERT INTO itemdetail values (?,?,?,?)';
        //                 sql2=connection.format(sql2,[itemDetail.orderId,itemDetail.itemCode,itemDetail.qty,itemDetail.unitPrice]);
        //
        //                 connection.query(sql2, function (error, results) {
        //                     if (error) {
        //                         return connection.rollback(function () {
        //                             console.log(error);
        //                             res.sendStatus(500);
        //                             res.end();
        //                             connection.release();
        //                         });
        //                     } else {
        //
        //                         let sql3='UPDATE item set qtyOnHand=qtyOnHand-? where code=?';
        //                         sql3=connection.format(sql3,[itemDetail.qty,itemDetail.itemCode]);
        //
        //                         connection.query(sql3, function (error, results) {
        //                             if (error) {
        //                                 return connection.rollback(function () {
        //                                     console.log(error);
        //                                     res.sendStatus(500);
        //                                     res.end();
        //                                     connection.release();
        //                                 });
        //                             }
        //                             if (i === (req.body.itemDetailDTOS.length - 1)) {
        //                             connection.commit(function (err) {
        //                                 if (err) {
        //                                     return connection.rollback(function () {
        //                                         console.log(error);
        //                                         res.sendStatus(500);
        //                                         res.end();
        //                                         connection.release();
        //                                     });
        //                                 }
        //                                 res.end();
        //                                 connection.release();
        //                                 console.log('success!');
        //                             });
        //                         }
        //                                 i++;
        //                         });
        //                     }
        //                 });
        //             });
        //
        //
        //         }
        //     });
        // });
    });
    function placeOrder(connection, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield util_1.executeQuery(connection, 'INSERT INTO orders VALUES (?,?,?)', [req.body.id, req.body.id, req.body.id]);
                if (result.affectedRows === 0) {
                    connection.rollback();
                    connection.release();
                    res.sendStatus(500);
                    return;
                }
                const orderDetails = req.body.orderDetails;
                for (let i = 0; i < orderDetails.length; i++) {
                    result = yield util_1.executeQuery(connection, "UPDATE item SET qtyOnHand=qtyOnHand -?", [orderDetails[i].qty, orderDetails[i].itemCode]);
                    if (result.affectedRows === 0) {
                        connection.rollback();
                        connection.release();
                        res.sendStatus(500);
                        return;
                    }
                    connection.commit();
                    connection.release();
                    res.status(201).json({});
                }
            }
            catch (e) {
                console.error(e);
                connection.rollback();
                connection.release();
                res.sendStatus(500);
            }
        });
    }
});
router.route("/:id(D\\d{3})")
    .get((req, res) => {
    pool_connection_1.pool.getConnection(function (err, connection) {
        let sql = 'SELECT * FROM orders WHERE id like ?';
        sql = connection.format(sql, [req.params.id + '%']);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(401);
                res.end();
                connection.release();
                return;
            }
            else {
                res.sendStatus(200).json(results);
                res.end();
                connection.release();
            }
        });
    });
});
class ItemDetailDTO {
    constructor(orderId, itemCode, qty, unitPrice, description) {
        this.orderId = orderId;
        this.itemCode = itemCode;
        this.qty = qty;
        this.unitPrice = unitPrice;
        this.description = description;
    }
}
exports.ItemDetailDTO = ItemDetailDTO;
