import express=require("express");

import cors=require("cors");

import customerDispather from "./customer-dispatcher";
import itemDispatcher from "./item-dispatcher";
import orderDispatcher from "./order-dispatcher";


const router=express.Router();

export default router;

router.use(express.json());
router.use(cors());

router.use("/api/v1/customers",customerDispather);
router.use("/api/v1/items",itemDispatcher);
router.use("/api/v1/orders",orderDispatcher);