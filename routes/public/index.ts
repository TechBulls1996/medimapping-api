import express from "express";
import { ApiFailedResponse, getRequestAuth } from "../../helper/global";
import { FailedMsg, SuccessMsg } from "../../helper/messages";
import { requestGetValidate } from "../../helper/validations/requestValidation";
const publicRouter = express.Router();
const Activity = require("../../db/models/Activity");
const User = require("../../db/models/User");
const Request = require("../../db/models/Request");



publicRouter.get("/", (req: any, res: any) => {
  res.json("Public Page.");
});

publicRouter.get("/requests", requestGetValidate, async (req: any, res: any) => {
    let page: any = 1;
    const pageSize: any = 10;
  
    if (page === 0) page = 1;
    let skip = page * pageSize - pageSize;
  
    const sort = "All";
    let finalSort: any = { CreatedAt: -1 };
    let finalMatch: any = { $match: {} };
  
    if (sort === "All" || sort === "Recent") {
      finalSort = { CreatedAt: -1 };
    }
  
    const request = await Request.aggregate([
      finalMatch,
      { $addFields: { userObjId: { $toObjectId: "$userId" } } },
      {
        $lookup: {
          from: "users",
          localField: "userObjId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $skip: skip },
      { $limit: pageSize },
      { $sort: finalSort },
      {
        $project: {
          _id: 1,
          bloodType: 1,
          bloodGroup: 1,
          bloodUnit: 1,
          time: 1,
          hospital: 1,
          hospitalAddress: 1,
          country: 1,
          state: 1,
          city: 1,
          pinCode: 1,
          patientName: 1,
          patientEmail: 1,
          age: 1,
          desc: 1,
          social: 1,
          createdAt: 1,
          user: {
            _id: 1,
            name: 1,
            image: 1,
          },
          status: 1,
          response: 1,
        },
      },
    ]);
  
    if (request) {
      return res.json({
        status: true,
        message: SuccessMsg,
        data: request,
        pagination: {
          page,
          pageSize,
          nextPage: request?.length >= pageSize ? true : false,
          prePage: page == 1 ? false : true,
        },
      });
    }
  
    return res.status(401).json(ApiFailedResponse(FailedMsg));
  });

publicRouter.get("/donars", async (req: any, res: any) => {
    
    const pageSize: any = 6;
    const sort = { CreatedAt: -1 };
    const request = await Activity.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$userId",
          latestActivity: { $last: "$$ROOT" }, // Keep the latest activity for each user
        },
      },
      { $replaceRoot: { newRoot: "$latestActivity" } }, // Replace the root with the latest activity
      { $limit: pageSize },
      { $sort: sort },
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            name: 1,
            image: 1,
            city: 1,
            state: 1,
          },
          type: 1,
        },
      },
    ]);
  
    if (request) {
      return res.json({
        status: true,
        message: SuccessMsg,
        data: request,
      });
    }
  
    return res.status(401).json(ApiFailedResponse(FailedMsg));
  });
  

module.exports = publicRouter;
