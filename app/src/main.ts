import express=require("express");
import mainDispatcher from "./main-dispatcher";

const app=express();

app.use(mainDispatcher);

app.listen(5000, () =>{console.log("Server Is Working");});