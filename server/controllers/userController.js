const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const { jwtDecode } = require("jwt-decode");
const axios = require("axios");
const generateToken = require("../../util/generateJWT.js");
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

// helper:
function responseInfo(user) {
  return {
    token: generateToken(user),
    user: {
      email: user.email.address,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
    },
  };
}

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
      return res.status(400).send({ error: "User already registered." });
    }
    const newUser = await User.create({
      password: password,
      email: { address: email },
    });
    // force user role to be user on signup
    res.status(201).json(responseInfo(newUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const validateUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "email.address": email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json(responseInfo(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const googleOAuth = async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

    // use oauth token info to create user
    const userInfo = jwtDecode(tokens.id_token);

    // used if account with email exists:
    async function getUserByEmail() {
      const user = await User.findOne({
        "email.address": userInfo.email,
      });
      console.log("user!", user);
    }
    const userByGoogleId = await User.findOne({
      "OAuth.googleId": userInfo.sub,
    });

    if (userByGoogleId) {
      console.log("userByGoogleId");
      //if account with with google id exists, login user(google id is sub value in user token)
      res.json(responseInfo(userByGoogleId));
    } else if (await getUserByEmail()) {
      console.log("userByEmail");
      // if account with email exists, attach google id to account (sub value in user token)
      console.log("userInfo.googleId", userInfo.sub);
      const user = await User.findOneAndUpdate(
        { "email.address": userInfo.email },
        { $set: { "OAuth.googleId": userInfo.sub } },
        { new: true } // Returns the updated document
      );
      res.json(responseInfo(user));
    } else {
      console.log("new user");
      // if account with email doesn't exist, create new account and store googleId
      const user = await User.create({
        email: { address: userInfo.email },
        profile: {
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
        },
        "OAuth.googleId": userInfo.sub,
      });

      res.json(responseInfo(user));
    }
    // send user info after handling account
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const microsoftOAuth = async (req, res) => {
  const { code } = req.body;

  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const TENANT_ID = process.env.TENANT_ID;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  try {
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      })
    );

    const accessToken = tokenResponse.data.access_token;
    const idToken = tokenResponse.data.id_token;

    // Decode ID token (JWT)
    const user = jwt.decode(idToken);
    console.log("MICROSOFT OAUTH", user, accessToken);

    // You can store user info in your database here if needed
    res.json({ user, accessToken });
  } catch (error) {
    console.error("OAuth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Authentication failed" });
  }
};

const protected = async (req, res) => {
  console.log("ACCESSING PROTECTED ROUTE");
  res.send("PROTECTED ROUTE ACCESS ACHIEVED");
};

module.exports = {
  getUser,
  createUser,
  validateUser,
  googleOAuth,
  microsoftOAuth,
  protected,
};
