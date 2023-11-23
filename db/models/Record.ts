import { ObjectId } from "mongodb";
import mongoose from "mongoose";

var recordSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    doctor: {
      type: String,
      required: false,
    },
    phone: String,
    hospital: {
      type: String,
      required: false,
    },
    hospitalAddress: {
      type: String,
      required: true,
    },
    instructions: String,

    // name of meditions running for now
    medications: String,
    
    // illness cols and illnessStatus enums
    /*
     * 'active': you could use 'active' to indicate an ongoing or currently affecting state.
     * 'resolved': Similar to 'cured', 
     * 'acute': For illnesses that are severe but short-lived.
     */
    illness:String,
    categoryOfIllness: String,
    illnessStatus: {
      type: String,
      default: "active",
      enum: ['active', 'resolved', 'acute'],
    },
    priority: {
      type: String,
      default: "medium",
      enum: ['high', 'medium','low'],
    },
    //appointment 
    nextAppointment: Date,
    appointments: [{
      date: Date,
      hospital: String,
      location: String,
      doctor: String,
      phone: String,    
    }],

    documents: [String],
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Record", recordSchema);
