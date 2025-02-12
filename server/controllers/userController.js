const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const { jwtDecode } = require("jwt-decode");

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

const getUser = (req, res) => {
  User.findById(req.params.id)
    .exec()
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) =>
      res.status(500).json({
        error: err,
      })
    );
};
const createUser = async (req, res) => {
  const { email, password } = req.body;
  // check if account with same email exists
  try {
    const existingUser = await User.findOne({ "email.address": email });
    if (existingUser) {
      return res.status(400).send("User already registered.");
    }
    const newUser = await User.create({
      password: password,
      email: { address: email },
    });
    // force user role to be user on signup
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const validateUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "email.address": email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({ message: "Login successful", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const googleOAuth = async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

    // use oauth token info to create user
    const userInfo = jwtDecode(tokens.id_token);

    // used if account with email exists:
    async function getUserByEmail() {
      const user =  await User.findOne({
        "email.address": userInfo.email,
      });
      console.log("user!", user)
    }
    const userByGoogleId = await User.findOne({
      'OAuth.googleId': userInfo.sub,
    });

    if (userByGoogleId) {
      console.log("userByGoogleId");
      //if account with with google id exists, login user(google id is sub value in user token)
      res.json(userByGoogleId);
    } else if (await getUserByEmail()) {
      console.log("userByEmail");
      // if account with email exists, attach google id to account (sub value in user token)
      console.log("userInfo.googleId", userInfo.sub);
      const user = await User.findOneAndUpdate(
        { "email.address": userInfo.email },
        { $set: { "OAuth.googleId": userInfo.sub } },
        { new: true } // Returns the updated document
      );
      res.json(user);
    } else {
      console.log("new user");
      // if account with email doesn't exist, create new account and store googleId
      const user = await User.create({
        email: { address: userInfo.email },
        'OAuth.googleId': userInfo.sub,
      });
      res.json(user);
    }
    // send user info after handling account
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUser, createUser, validateUser, googleOAuth };
