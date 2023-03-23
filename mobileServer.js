
let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Methods", 
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

var port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));


const { Client } = require("pg");
const client = new Client ({
    user: "postgres",
    password: "Aayam@271298",
    database: "postgres",
    port: 5432,
    host: "db.cdxprmiejvdyvhlrixfo.supabase.co",
    ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
    console.log(`Connected!!!`);
});


let mysql = require("mysql");
let connData = {
    host : "localhost",
    user : "root",
    password : "",
    database : "testdb",
};

let connection = mysql.createConnection(connData);

app.get("/mobiles", function(req,res,next) {
    console.log("Request Query : ",req.query)
    let brand = req.query.brand ? req.query.brand : false ;
    let ram = req.query.ram ? req.query.ram : false;
    let rom = req.query.rom ? req.query.rom : false;
    let os = req.query.os ? req.query.os : false;
    let sql1 = `SELECT * FROM mobiles WHERE brand=$1`;
    let sql2 = `SELECT * FROM mobiles WHERE ram=$1`;
    let sql3 = `SELECT * FROM mobiles WHERE rom=$1`;
    let sql4 = `SELECT * FROM mobiles WHERE os=$1`;
    let sql = `SELECT * FROM mobiles`;
    brand 
        ? (
            client.query(sql1, [brand], function(err, result) {
                if(err) res.send(err);
                else console.log("Done");
            })
        )
        : ram
        ? (
            client.query(sql2, [ram], function(err, result) {
                if(err) res.send(err);
                else console.log("Done");
            })
        )
        : rom 
        ? (
            client.query(sql3, [rom], function(err, result) {
                if(err) res.send(err);
                else console.log("Done");
            })
        ) 
        : os 
        ? (
            client.query(sql4, [os], function(err, result) {
                if(err) res.send(err);
                else console.log("Done");
            })
        ) 
        : (
            client.query(sql, function(err, result) {
                if(err) res.send(err);
                else res.send(result.rows);
            })
        )
});


app.get("/mobile/id/:id", function(req,res, next) {
    let id = req.params.id;
    console.log(id);
    let sql = `SELECT * FROM mobiles WHERE id=$1`;
    client.query(sql, [id], function(err, result) {
        if(err) { res.status(400).send(err); }
        res.send(result.rows);
    });
});


app.post("/mobile/add", function(req,res,next) {
    var values = Object.values(req.body);
    // console.log(values);
    let sql = `INSERT INTO mobiles (id,name,price,brand,ram,rom,os) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
    client.query(sql, values, function(err, result) {
        if(err) { res.status(400).send(err) };
        res.send(`${result.rowCount} insertion successful`);
    });
});


app.put("/mobile/:id", function(req, res,next) {
    let id = +req.params.id;
    let body = req.body;
    console.log("bodyPut",body);
    let values = [body.id, body.name, body.price, body.brand, body.ram, body.rom, body.os, id];
    // console.log("Values",values);
    let sql1 = `UPDATE mobiles SET id=$1, name=$2, price=$3, brand=$4, ram=$5, rom=$6, os=$7 WHERE id=$8`;
    client.query(sql1, values, function(err,result) {
        if(err) res.status(404).send(err);
        res.send(`${result.rowCount} Updation Successful`);
    });
});


app.delete("/mobile/:id", function(req, res,next) {
    let id = req.params.id;
    let sql = `DELETE FROM mobiles WHERE id=$1`;
    client.query(sql, [id], function(err,result) {
        if(err) res.status(404).send(err);
        res.send(`${result.rowCount} Deleted Successful`);
    });
});


app.get("/resetData", function(req, res, next) {
    console.log("Inside get/resetData of mobiles");
    const query = `DELETE FROM mobiles`;
    client.query(query, function(err, result) {
        if(err) {
            console.log("{error} : ", err);
            res.send(err);
        }
        else {
            console.log("Successfully deleted. Affected rows : ",result.rowCount);
            let {mobiles} = require("./mobileData.js");
            for (let i=0;i<mobiles.length;i++){
                let query2 = `INSERT INTO mobiles( id, name, price, brand, ram, rom, os ) VALUES ($1,$2,$3,$4,$5,$6,$7)`;
                client.query(query2, [ mobiles[i].id, mobiles[i].name, mobiles[i].price, mobiles[i].brand, mobiles[i].RAM, mobiles[i].ROM, mobiles[i].OS ], function(err, result) {
                    if(err){
                        console.log("error : ", err);
                    }
                    else {
                        console.log("Successfully inserted. Affected rows : ",result.rowCount);
                    }
                });
            }
            res.send("Successfully Reset the Data.");
        }
    });
});