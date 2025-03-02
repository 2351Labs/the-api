require("dotenv").config();
const userRoutes = require("./server/routes/userRoutes");
const itemRoutes = require("./server/routes/itemRoutes");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
    // disable autoIndex for performance
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Define a simple schema and model
const Schema = mongoose.Schema;
const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/user", userRoutes);
app.use("/items", itemRoutes);

// app.get("/login", async (req, res) => {
//   const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

//   const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  
//   const GOOGLE_CALLBACK_URL = "http://localhost:3000/login";
  
//   const GOOGLE_OAUTH_SCOPES = [
  
//   "https%3A//www.googleapis.com/auth/userinfo.email",

//   "https%3A//www.googleapis.com/auth/userinfo.profile",
  
//   ];

//   const state = "some_state";
//   const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
//   const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;
//   res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
