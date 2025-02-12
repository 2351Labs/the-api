/*
I find myself recreating user models for Mongoose every time I start a new project, so I thought I'd create a generic schema for a user model that can be added to or modified as need be.
This is loosely based on the Meteor user model (using a "profile" sub-object for the user's personal information). It also includes an optional geolocation point for the user, and Mongoose timestamps, as well as a pre("save") function to bcrypt the user password and a comparePassword() function.
Just save this file wherever you store your models and do something like const Users = include('./models/userSchema.js') and you can just use it as a standard Mongoose user model.
The username/email address definitions were copied from this tutorial: https://thinkster.io/tutorials/node-json-api/creating-the-user-model
*/

const mongoose = require("mongoose");
Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const Email = new Schema({
  address: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, "is invalid"],
    index: true,
  },
  // Change the default to true if you don't need to validate a new user's email address
  validated: { type: Boolean, default: false },
});

// const Point = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ["Point"],
//     required: true,
//   },
//   coordinates: {
//     type: [Number],
//     required: true,
//   },
// });

const UserSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      // required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true,
    },
    //Our password is hashed with bcrypt below
    // password not required since Oauth account will not include password for login
    password: { type: String, required: false },
    email: { type: Email, required: true, unique: true },
    OAuth: { googleId: { type: String} },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: String,
      address: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        country: String,
        zip: String,
        // location: {
        //   type: Point,
        //   required: false,
        // },
      },
    },
    roles: {
      type: [
        {
          type: String,
          enum: ["user", "admin"],
        },
      ],
      default: ["user"],
    },
    updated: {
      type: Date,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    active: { type: Boolean, default: true },
    /* For reset password */
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
