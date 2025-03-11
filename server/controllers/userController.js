const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const { jwtDecode } = require("jwt-decode");
const axios = require("axios");
const jwt = require("jsonwebtoken");

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

const getUser = async (req, res) => {

  // get user using client token
  const userDecoded = req.user; // Extract user ID from the token

  try {
    const user = await User.findOne({
      "email.address": userDecoded.email.address,
    }).select("profile email.address -_id"); // Fetch selected fields
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
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
  console.log("validating user...")
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ "email.address": email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    try {
      var isMatch = await user.comparePassword(password);
    } catch (err) {
      //if account has no password associated with it, must be oauth account
      return res.status(500).json({ error: "Please use correct sign in method for your account" });
    }

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
    // console.log("GOOGLE ROUTE token", userInfo)

    // used if account with email exists:
    async function getUserByEmail() {
      return await User.findOne({
        "email.address": userInfo.email,
      });
    }
    const userByGoogleId = await User.findOne({
      "OAuth.google.sub": userInfo.sub,
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
        {
          $set: {
            "OAuth.google.sub": userInfo.sub,
            "OAuth.google.picture": userInfo.picture,
            "profile.firstName": userInfo.given_name,
            "profile.lastName": userInfo.family_name,
            "email.validated": true,
          },
        },
        { new: true } // Returns the updated document
      );
      res.json(responseInfo(user));
    } else {
      console.log("new user");
      // if account with email doesn't exist, create new account and store googleId
      const user = await User.create({
        email: { address: userInfo.email, validated: userInfo.email_verified },
        profile: {
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
        },
        OAuth: {
          google: {
            sub: userInfo.sub,
            picture: userInfo.picture,
          },
        },
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
  const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
  const TENANT_ID = process.env.MICROSOFT_TENANT_ID;
  const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI;
  try {
    const { code } = req.body;
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

    // const accessToken = tokenResponse.data.access_token;
    const idToken = tokenResponse.data.id_token;
    // Decode ID token (JWT)
    const userInfo = jwt.decode(idToken);

    const parts = userInfo.name.trim().split(/\s+/); // Remove extra spaces and split by space
    const split = {
      firstName: parts[0] || "", // First word
      lastName: parts.length > 1 ? parts.slice(1).join(" ") : "", // Rest as last name
    };

    // used if account with email exists:
    async function getUserByEmail() {
      return await User.findOne({
        "email.address": userInfo.email,
      });
    }
    const userByMicrosoftId = await User.findOne({
      "OAuth.microsoft.sub": userInfo.sub,
    });

    if (userByMicrosoftId) {
      //if account with with microsoft id exists, login user(id is sub value in user token)
      res.json(responseInfo(userByMicrosoftId));
    } else if (await getUserByEmail()) {
      // if account with email exists, attach google id to account (sub value in user token)
      const user = await User.findOneAndUpdate(
        { "email.address": userInfo.email },
        {
          $set: {
            "OAuth.microsoft.sub": userInfo.sub,
            "OAuth.microsoft.tid": userInfo.tid,
            "OAuth.microsoft.oid": userInfo.oid,
            "profile.firstName": split.firstName,
            "profile.lastName": split.lastName,
            "email.validated": true,
          },
        },
        { new: true } // Returns the updated document
      );
      console.log("attached to email, sending response", user);
      res.json(responseInfo(user));
    } else {
      // if account with email doesn't exist, create new account
      const user = await User.create({
        email: { address: userInfo.email, validated: true },
        OAuth: {
          microsoft: {
            sub: userInfo.sub,
            tid: userInfo.tid,
            oid: userInfo.oid,
          },
        },
        profile: {
          firstName: split.firstName,
          lastName: split.lastName,
        },
      });
      res.json(responseInfo(user));
    }
    // send user info after handling account
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
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
