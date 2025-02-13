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
    password: {
      type: String,
      // required: [true, "Password is required"],
      validate: [
        {
          validator: function (value) {
            // Check for at least one uppercase letter
            return /^(?=.*[A-Z])/.test(value);
          },
          message: "Password must contain at least one uppercase letter.",
        },
        {
          validator: function (value) {
            // Check for at least one digit
            return /^(?=.*\d)/.test(value);
          },
          message: "Password must contain at least one digit.",
        },
        {
          validator: function (value) {
            // Check for at least one special character
            return /^(?=.*[@$!%*?&])/.test(value);
          },
          message: "Password must contain at least one special character.",
        },
        {
          validator: function (value) {
            // Check for at least 8 characters in length
            return /^.{8,}$/.test(value);
          },
          message: "Password must be at least 8 characters long.",
        },
        {
          validator: function (value) {
            // Check for allowed characters only (no disallowed characters)
            return /^[A-Za-z\d@$!%*?&]+$/.test(value);
          },
          message: "Password contains invalid characters.",
        },
      ],
    },
    email: { type: Email, required: true, unique: true },
    OAuth: {
      microsoft: {
        sub: { type: String, unique: true}, // Microsoft user ID
        tid: { type: String }, // Tenant ID (Azure AD)
        oid: { type: String }, // Object ID (Azure AD)
      },
      google: {
        sub: { type: String, unique: true}, // Google user ID
        picture: { type: String },
      },
    },
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
