import express = require("express");

import {pool} from "./db/pool-connection";
import {PoolConnection} from "mysql";
import {executeQuery} from "./db/util";
import {Request, Response} from "express";
import {Page} from "./customer-dispatcher";
import cors = require("cors");
const router=express.Router();


export default router;


router.route("")
    .head(cors({
        allowedHeaders: "Order-Count",
        exposedHeaders: "Order-Count"
    }),(req, res) => {
    pool.getConnection(function (err, connection) {
        if(req.query.count === 'true'){

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
        }else if(req.query.maxOrderId === 'true'){
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
    .get((req, res,next) => {

        pool.getConnection(function (err, connection) {
            if(err){
                console.log(err);
                res.sendStatus(500);
                connection.release();
                return;
            }

            if (("page" in req.query) && ("size" in req.query)) {

                const order = req.query.q;
                const page = +req.query.page;
                const size = +req.query.size;

                pool.query("SELECT orders.id,orders.date,orders.customer_Id as `customer_id`,sum(itemdetail.qty*itemdetail.unitPrice) as `sum` from orders  INNER JOIN itemdetail  where itemdetail.orderId=orders.id  && orders.id like ? group by orders.id LIMIT ?,?", [order+'%',page * size, size], (err, results) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500);
                        res.end();
                        return;
                    }
                    pool.query("SELECT COUNT(*) AS `count` FROM orders ", (err1, results1) => {
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

    connection.query('SELECT * FROM orders ', (err, results) => {
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
    if (!(('id' in req.body) && ('date' in req.body) && ('customer_Id' in req.body) && ('itemDetailDTOS' in req.body) &&(req.body.itemDetailDTOS.length>0))) {
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

    async function placeOrder(connection: PoolConnection, req: Request, res: Response) {

        try{
            let result = await executeQuery(connection, 'INSERT INTO orders VALUES (?,?,?)',[req.body.id,req.body.id,req.body.id]);

            if(result.affectedRows ===0){
                connection.rollback();
                connection.release();
                res.sendStatus(500);
                return;
            }
            const orderDetails:{
                orderId: string,
                itemCode: string,
                qty: number,
                unitPrice: number
            }[]= req.body.orderDetails;

            for (let i = 0; i < orderDetails.length; i++) {
                result=await executeQuery(connection,"UPDATE item SET qtyOnHand=qtyOnHand -?",
                    [orderDetails[i].qty,orderDetails[i].itemCode]);
                if(result.affectedRows ===0){
                    connection.rollback();
                    connection.release();
                    res.sendStatus(500);
                    return;
                }
                connection.commit();
                connection.release();
                res.status(201).json({});
            }
        }catch (e) {
            console.error(e);
            connection.rollback();
            connection.release();
            res.sendStatus(500);
        }
    }

});

router.route("/:id(D\\d{3})")

.get((req, res) => {
    pool.getConnection(function (err, connection) {
        let sql = 'SELECT * FROM orders WHERE id like ?';
        sql = connection.format(sql, [req.params.id+'%']);
        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.sendStatus(401);
                res.end();
                connection.release();
                return;
            } else {
                res.sendStatus(200).json(results);
                res.end();
                connection.release();
            }
        });
    });

});
export class ItemDetailDTO {
    constructor(public orderId: string, public itemCode: string, public qty: string, public unitPrice: string, public description: string) {}
}