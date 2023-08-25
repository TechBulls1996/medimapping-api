import { ObjectId } from "mongodb";
import mongoose from "mongoose";

var activitySchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
    },
    url: {
      type: String,
    },
    type: {
      type: String,
    },
    data: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);
