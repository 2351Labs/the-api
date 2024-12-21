//load modules
const express = require("express");
const app = express();
const PORT = 3001;
const port = 3002;
const { MongoClient } = require("mongodb");

const cors = require('cors');


//for most use cases:
app.use(cors())
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connection string to local instance of MongoDB
const notSupposedToBeHere = "YB4SuEe0xlgK4AGP";
const connectionStringURI = `mongodb+srv://stoddardjd2:${notSupposedToBeHere}@cluster0.4lwuhru.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Initialize a new instance of MongoClient
const client = new MongoClient(connectionStringURI);
// Declare a variable to hold the connection
let db;
// Create variable to hold our database name
const dbName = "Catalog";
// Use connect method to connect to the mongo server
client
  .connect()
  .then(() => {
    console.log("Connected successfully to MongoDB");
    // Use client.db() constructor to add new db instance
    db = client.db(dbName);
    // start up express server
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error: ", err.message);
  });

//basics routes:
app.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
});

app.post("/signup", (req, res) => {
  var { email } = req.body;
  console.log("EMAIL", email);
  
  db.collection("Users")
    .find({ email: email })
    .toArray()
    .then((results) => {
      if (results.length == 0) {
        db.collection("Users")
          .insertOne({ email: email })
          .then((results) => res.json(results))
          .catch((err) => {
            if (err) throw err;
          });
      } else {
        res.status(406).send("Email already in use");
        console.log("IN USE");
      }
    });
  //   check if email already in use
});
