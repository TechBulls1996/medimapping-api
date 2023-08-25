import { ObjectId } from "mongodb";
import mongoose from "mongoose";

var requestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "pending",
    },
    response: {
      type: Array,
    },
    userId: {
      type: ObjectId,
      required: true,
    },
    bloodType: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
    },
    bloodUnit: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    hospital: {
      type: String,
      required: true,
    },
    hospitalAddress: {
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
      default: {
        value: "",
        Label: "",
      },
    },

    pinCode: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    patientMobile: {
      type: String,
    },
    age: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    social: {
      type: Object,
      default: {
        Likes: [],
        Shares: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", requestSchema);
