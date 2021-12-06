const express = require("express");
var cors = require('cors')
const app = express();
const dotenv = require("dotenv");
const mongodb = require("mongodb");
const  { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const { json } = require("body-parser");
dotenv.config();

var db;
app.use(cors())
app.use(bodyParser.json());

MongoClient.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true },
  async function (err, client) {
    db = client.db();
    app.listen(process.env.PORT || 8000);
  }
);

app.get("/", async (req, res) => {
  res.send('im working!')
});


app.get("/all", async (req, res) => {
    try {
      const todos = await db.collection("todo").find().toArray();
      if (todos.length) {
        res.status = 200;
        res.send(todos);
      } else {
        res.status = 200;
        var response = {
          status: res.status,
          message: "You dont have todo",
        };
        res.send(response);
      }
    } catch (err) {
      res.status = 555;
      console.log(err);
      res.send("try again later.");
    }
  });


app.post("/add", async (req, res) => {
    try {
      const todos =  db.collection("todo");
        await todos.insertOne({task: req.body.task, isDone: req.body.isDone})
        res.status = 200;
        res.send("Added!")
    } catch (err) {
      res.status = 555;
      console.log(err);
      res.send("try again later.");
    }
  });


app.put("/toggleTasks", async (req, res) => {
    try {
       
      const todos =  db.collection("todo");
        await todos.updateOne({_id: mongodb.ObjectId(req.body.id)},{$set: {isDone:req.body.isDone}})
        res.status = 200;
        res.send("Updated!")
    } catch (err) {
      res.status = 555;
      console.log(err);
      res.send("try again later.");
    }
  });


app.delete("/delete", async (req, res) => {
    try {
  
      const todos =  db.collection("todo");
        await todos.deleteOne({_id: mongodb.ObjectId(req.body.id)});
        res.status = 200;
        res.send("Deleted!")
    } catch (err) {
      res.status = 555;
      console.log(err);
      res.send("try again later.");
    }
  });
