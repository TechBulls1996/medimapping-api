import mongoose from "mongoose";

var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    mobile: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    country: {
      type: Object,
      required: true,
    },
    state: {
      type: Object,
      required: true,
    },
    city: {
      type: Object,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },

    roles: {
      type: Array,
      required: true,
      default: [
        {
          type: "user",
          isPrimary: true,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
