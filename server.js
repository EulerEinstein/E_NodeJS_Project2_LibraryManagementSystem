const express = require("express"); 
const { router } = require("./routers");
const { db } = require("./models");

const app = express(); 

app.use(express.json()); 
app.use("/api", router);

app.listen(3000, () => { 
    console.log("server is running"); 
    db.sync();
}); 