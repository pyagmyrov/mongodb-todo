const express = require("express");
var cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const saltRounds = 2;
const { v4: uuidv4 } = require("uuid");
const mongodb = require("mongodb");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const { json } = require("body-parser");

dotenv.config();
var db;
app.use(cors());
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
  res.send(
    "Truth hurts. Maybe not as much as jumping on a bicycle with a seat missing, but it hurts."
  );
});

app.post("/register", async (req, res) => {
  try {
    const users = db.collection("users");
    const alreadyExists = await db
      .collection("users")
      .findOne({ email: req.body.email });
    if (alreadyExists) {
      res.statusCode = 333;
      res.send({ status: res.statusCode, msg: "emailAlreadyExist" });
    } else {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, async function (err, hash) {
          const createdUser = await users.insertOne({
            email: req.body.email,
            password: hash,
            todos: [
              {
                id: uuidv4(),
                task: "first sample task",
                isDone: "false",
              },
            ],
          });
          const token = createdUser.insertedId;
          res.status = 200;
          const response = {
            status: res.status,
            accesToken: token,
          };
          res.send(response);
        });
      });
    }
  } catch (err) {
    res.status = 555;
    console.log(err);
    res.send("try again later.");
  }
});

app.post("/login", async (req, res) => {
 
  if (req.body.email) {
    try {
      const user = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (user) {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          res.statusCode = 200;
          res.send(user);
        } else {
          res.statusCode = 401;
          res.send({ status: res.statusCode, msg: "wrongPasswordOrEmail" });
        }
      } else {
        res.statusCode = 333;
        res.send({ status: res.statusCode, msg: "noUserWithThisEmail" });
      }
    } catch (err) {
      res.status = 555;
      console.log(err);
      res.send("try again later.");
    }
  } else {
    res.statusCode == 333;
    res.status = 333;
    res.send({ status: 333, msg: "input data missing" });
  }
});

app.post("/getTodos", async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.body.accessToken) });

    if (user) {
      res.statusCode = 200;
      res.send(user.todos);
    } else {
      res.statusCode = 401;
      res.send({ status: res.statusCode, msg: "wrongToken" });
    }
  } catch (err) {
    res.status = 555;
    console.log(err);
    res.send("try again later.");
  }
});

app.get("/all", async (req, res) => {
  try {
    const users = await db.collection("users").find().toArray();
    if (users.length) {
      res.status = 200;
      res.send(users);
    } else {
      res.status = 200;
      var response = {
        status: res.status,
        message: "No user",
      };
      res.send(response);
    }
  } catch (err) {
    res.status = 555;
    console.log(err);
    res.send("try again later.");
  }
});

// app.put("/toggleTasks", async (req, res) => {
//   try {
//     const todos = db.collection("users");
//     await todos.updateOne(
//       { _id: mongodb.ObjectId(req.body.id) },
//       { $set: { isDone: req.body.isDone } }
//     );
//     res.status = 200;
//     res.send("Updated!");
//   } catch (err) {
//     res.status = 555;
//     console.log(err);
//     res.send("try again later.");
//   }
// });

// app.delete("/delete", async (req, res) => {
//   try {
//     const todos = db.collection("users");
//     await todos.deleteOne({ _id: mongodb.ObjectId(req.body.id) });
//     res.status = 200;
//     res.send("Deleted!");
//   } catch (err) {
//     res.status = 555;
//     console.log(err);
//     res.send("try again later.");
//   }
// });
